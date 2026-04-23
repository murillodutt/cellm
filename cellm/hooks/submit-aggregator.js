#!/usr/bin/env node
// CELLM — UserPromptSubmit aggregator (Node.js, zero shell)
//
// Replaces the 4-call serial chain (tilly-execution-profile + knowledge/inject
// + specs + capture-prompt.sh) that was causing visible freezes.
//
// Strategy (inspired by compress-llm upstream hooks):
//   1. Read stdin once (JSON prompt).
//   2. Fire all CELLM API endpoints IN PARALLEL via Promise.allSettled.
//   3. Aggregate their additionalContext payloads into a single hookSpecificOutput.
//   4. Hard timeout 1500ms per call; hook budget 2500ms total.
//   5. process.exit(0) on any path — never block Claude Code.
//
// Invocation: node ${CLAUDE_PLUGIN_ROOT}/hooks/submit-aggregator.js
// Replaces 4 "type": "command" HTTP bash hooks in hooks.json.

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// ---------- Config ----------

const PER_CALL_TIMEOUT_MS = 1500;
const HOOK_BUDGET_MS = 2500;
const WORKER_JSON = path.join(os.homedir(), '.cellm', 'worker.json');
const DEFAULT_PORT = 31415;
const DEFAULT_HOST = '127.0.0.1';

// Parallel endpoints (order preserved in output for deterministic context)
const ENDPOINTS = [
  '/api/hooks/tilly-execution-profile',
  '/api/knowledge/inject',
  '/api/hooks/specs',
];

// ---------- URL resolution (parity with _get-port.sh + _get-base-url.sh) ----------

function resolveBaseUrl() {
  const envUrl = process.env.CELLM_WORKER_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  try {
    const raw = fs.readFileSync(WORKER_JSON, 'utf8');
    const cfg = JSON.parse(raw);
    const host = cfg.host || DEFAULT_HOST;
    const port = cfg.port || DEFAULT_PORT;
    return `http://${host}:${port}`;
  } catch {
    return `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;
  }
}

// ---------- Stdin read (non-blocking, max 64KB, bounded by hook budget) ----------

function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) return resolve('');
    let buf = '';
    let size = 0;
    const limit = 65536;
    const t = setTimeout(() => resolve(buf), 500);
    process.stdin.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        process.stdin.pause();
        clearTimeout(t);
        return resolve(buf);
      }
      buf += c;
    });
    process.stdin.on('end', () => {
      clearTimeout(t);
      resolve(buf);
    });
    process.stdin.on('error', () => {
      clearTimeout(t);
      resolve('');
    });
  });
}

// ---------- POST with timeout (node:http, zero deps) ----------

function postJson(baseUrl, apiPath, body, timeoutMs) {
  return new Promise((resolve) => {
    try {
      const url = new URL(baseUrl + apiPath);
      const req = http.request(
        {
          host: url.hostname,
          port: url.port || 80,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
          timeout: timeoutMs,
        },
        (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            data += chunk;
            if (data.length > 200_000) {
              req.destroy();
              resolve(null);
            }
          });
          res.on('end', () => resolve(res.statusCode === 200 ? data : null));
          res.on('error', () => resolve(null));
        }
      );
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
      req.on('error', () => resolve(null));
      req.write(body);
      req.end();
    } catch {
      resolve(null);
    }
  });
}

// ---------- Response parsing (extract additionalContext) ----------

function extractContext(raw) {
  if (!raw || raw === '""' || raw === 'null') return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.hookSpecificOutput) {
      const ctx = parsed.hookSpecificOutput.additionalContext;
      if (typeof ctx === 'string' && ctx.trim().length) return ctx;
    }
    // Plain string response
    if (typeof parsed === 'string' && parsed.trim().length) return parsed;
    return null;
  } catch {
    // Raw text fallback
    const t = raw.trim();
    return t.length ? t : null;
  }
}

// ---------- Main ----------

async function main() {
  const budgetTimer = setTimeout(() => {
    // Absolute ceiling — never exceed hook budget even if Promise.allSettled stalls.
    process.stdout.write('');
    process.exit(0);
  }, HOOK_BUDGET_MS);

  try {
    const input = await readStdin();
    const payload = input || '{}';
    const baseUrl = resolveBaseUrl();

    // Fire all in parallel
    const results = await Promise.allSettled(
      ENDPOINTS.map((p) => postJson(baseUrl, p, payload, PER_CALL_TIMEOUT_MS))
    );

    // Aggregate additionalContext pieces in declared order
    const contexts = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === 'fulfilled' && r.value) {
        const ctx = extractContext(r.value);
        if (ctx) contexts.push(ctx);
      }
    }

    clearTimeout(budgetTimer);

    if (!contexts.length) {
      process.stdout.write('');
      process.exit(0);
    }

    const merged = contexts.join('\n\n');
    const envelope = {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: merged,
      },
    };
    process.stdout.write(JSON.stringify(envelope));
    process.exit(0);
  } catch {
    clearTimeout(budgetTimer);
    process.stdout.write('');
    process.exit(0);
  }
}

main();
