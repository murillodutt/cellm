#!/usr/bin/env node
/**
 * CELLM Oracle Worker - CLI Wrapper
 *
 * Delegates commands to the Oracle Worker daemon.
 * Manages worker lifecycle (start, stop, status) and hook integration.
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const HOME = process.env.HOME || process.env.USERPROFILE;
const CELLM_DIR = path.join(HOME, '.cellm');
const WORKER_JSON = path.join(CELLM_DIR, 'worker.json');
const PID_FILE = path.join(CELLM_DIR, 'worker.pid');
const LOG_FILE = path.join(CELLM_DIR, 'logs', `cellm-${new Date().toISOString().split('T')[0]}.log`);
const DEFAULT_PORT = 31415;

function log(level, message) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [oracle-worker] [${level}] ${message}`;
  console.error(line);
  try {
    const logsDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch {}
}

function getPort() {
  try {
    if (fs.existsSync(WORKER_JSON)) {
      const data = JSON.parse(fs.readFileSync(WORKER_JSON, 'utf-8'));
      return data.port || DEFAULT_PORT;
    }
  } catch {}
  return DEFAULT_PORT;
}

function isWorkerRunning() {
  const port = getPort();
  return new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/health',
      method: 'GET',
      timeout: 1000,
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function startWorker() {
  const running = await isWorkerRunning();
  if (running) {
    log('info', 'Worker already running');
    return;
  }

  log('info', 'Starting worker...');

  // Find oracle directory - check multiple locations
  const possiblePaths = [
    path.join(__dirname, '..', '..', '..', '..', 'oracle'),  // Plugin in .claude/plugins/
    path.join(__dirname, '..', '..', 'oracle'),              // Development
    process.env.CELLM_ORACLE_PATH,                           // Env override
  ].filter(Boolean);

  let oraclePath = null;
  for (const p of possiblePaths) {
    if (p && fs.existsSync(path.join(p, 'worker', 'index.ts'))) {
      oraclePath = p;
      break;
    }
  }

  if (!oraclePath) {
    log('error', 'Oracle directory not found');
    return;
  }

  // Spawn worker in background
  const workerScript = path.join(oraclePath, 'worker', 'index.ts');
  const child = spawn('bun', ['--bun', workerScript, '--daemon'], {
    cwd: oraclePath,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, CELLM_DATA_DIR: CELLM_DIR },
  });

  child.unref();

  // Write PID
  fs.writeFileSync(PID_FILE, String(child.pid));
  log('info', `Worker started with PID ${child.pid}`);

  // Wait for startup
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 250));
    if (await isWorkerRunning()) {
      log('info', 'Worker is ready');
      return;
    }
  }

  log('warn', 'Worker started but not responding');
}

async function capturePrompt() {
  const running = await isWorkerRunning();
  if (!running) {
    log('debug', 'Worker offline, skipping prompt capture');
    return;
  }

  // Read prompt from stdin or env
  const prompt = process.env.CLAUDE_PROMPT_CONTENT || '';
  const sessionId = process.env.CLAUDE_SESSION_ID || 'unknown';
  const project = path.basename(process.cwd());

  if (!prompt) {
    log('debug', 'No prompt content to capture');
    return;
  }

  const port = getPort();
  const data = JSON.stringify({
    type: 'user-prompt',
    sessionId,
    project,
    data: { content: prompt },
  });

  try {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/context/ingest',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 500,
    });
    req.write(data);
    req.end();
    log('debug', 'Prompt captured');
  } catch {}
}

async function trackTool() {
  const running = await isWorkerRunning();
  if (!running) return;

  const toolName = process.env.CLAUDE_TOOL_NAME || '';
  const toolInput = process.env.CLAUDE_TOOL_INPUT || '';
  const sessionId = process.env.CLAUDE_SESSION_ID || 'unknown';
  const project = path.basename(process.cwd());

  if (!toolName) return;

  const port = getPort();
  const data = JSON.stringify({
    type: 'tool-use',
    sessionId,
    project,
    data: { toolName, toolInput: toolInput ? JSON.parse(toolInput) : {} },
  });

  try {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/context/ingest',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 300,
    });
    req.write(data);
    req.end();
  } catch {}
}

async function captureContext() {
  const running = await isWorkerRunning();
  if (!running) return;

  const sessionId = process.env.CLAUDE_SESSION_ID || 'unknown';
  const project = path.basename(process.cwd());

  const port = getPort();
  const data = JSON.stringify({
    type: 'session-end',
    sessionId,
    project,
    data: {},
  });

  try {
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: '/api/context/ingest',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    req.write(data);
    req.end();
    log('debug', 'Context captured for session end');
  } catch {}
}

// Main CLI
async function main() {
  const command = process.argv[2] || 'start';

  switch (command) {
    case 'start':
      await startWorker();
      break;
    case 'capture-prompt':
      await capturePrompt();
      break;
    case 'track-tool':
      await trackTool();
      break;
    case 'capture-context':
      await captureContext();
      break;
    case 'status':
      const running = await isWorkerRunning();
      console.log(running ? 'Worker is running' : 'Worker is not running');
      process.exit(running ? 0 : 1);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Usage: oracle-worker.cjs [start|capture-prompt|track-tool|capture-context|status]');
      process.exit(1);
  }
}

main().catch(err => {
  log('error', err.message);
  process.exit(0);  // Don't break CLI on error
});
