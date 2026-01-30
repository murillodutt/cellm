# ensure-oracle.ps1 - Idempotent Oracle worker startup (Windows)
# Part of: CELLM Plugin System
# Purpose: Ensure Oracle is running before any hook executes
#
# Design: Following claude-mem pattern - called as FIRST command in every hook
# Behavior:
#   - If Oracle is healthy: exits immediately (~50ms)
#   - If Oracle is down: spawns daemon and waits for health (~3-5s)
#   - Always exits 0 to not block Claude Code

$ErrorActionPreference = "SilentlyContinue"

# Configuration
$WorkerUrl = if ($env:CELLM_WORKER_URL) { $env:CELLM_WORKER_URL } else { "http://127.0.0.1:31415" }
$CellmDir = if ($env:CELLM_DATA_DIR) { $env:CELLM_DATA_DIR } else { "$env:USERPROFILE\.cellm" }
$LogFile = "$CellmDir\logs\ensure-oracle.log"
$HealthTimeout = 2
$StartupWaitMax = 20  # 20 * 0.5s = 10s max wait

# Ensure directories exist
New-Item -ItemType Directory -Force -Path "$CellmDir\logs" | Out-Null

# Simple logging
function Log($Message) {
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$Timestamp] $Message" | Out-File -FilePath $LogFile -Append -ErrorAction SilentlyContinue
}

# Fast health check
function Test-Health {
    try {
        $Response = Invoke-WebRequest -Uri "$WorkerUrl/health" -TimeoutSec $HealthTimeout -UseBasicParsing
        return $Response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Spawn Oracle daemon
function Start-OracleDaemon {
    Log "[~] Spawning Oracle daemon..."

    # Check if bun is available
    $BunPath = Get-Command bun -ErrorAction SilentlyContinue
    if ($BunPath) {
        Start-Process -NoNewWindow -FilePath "bun" -ArgumentList "x @cellm-ai/oracle serve" -RedirectStandardOutput "$CellmDir\logs\oracle-worker.log" -RedirectStandardError "$CellmDir\logs\oracle-worker-error.log"
        return $true
    }

    Log "[-] bun not found, cannot spawn Oracle"
    return $false
}

# Wait for Oracle to become healthy
function Wait-ForHealth {
    for ($i = 1; $i -le $StartupWaitMax; $i++) {
        if (Test-Health) {
            Log "[+] Oracle healthy after $i checks"
            return $true
        }
        Start-Sleep -Milliseconds 500
    }

    Log "[!] Oracle failed to start within timeout"
    return $false
}

# Main execution
function Main {
    # Fast path: already healthy
    if (Test-Health) {
        exit 0
    }

    Log "[!] Oracle not responding, attempting recovery..."

    # Spawn and wait
    if (Start-OracleDaemon) {
        Wait-ForHealth | Out-Null
    }

    # Always exit 0 - never block Claude Code
    exit 0
}

Main
