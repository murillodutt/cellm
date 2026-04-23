#!/usr/bin/env node
// CELLM — SessionStart aggregator (Node.js, zero shell)
//
// Replaces the 3 post-hook-http.sh calls (init + context + persona) with
// one Node.js process that fires them in parallel via Promise.allSettled.
// ensure-oracle.sh is kept separate (it's a lifecycle/bootstrap concern).
//
// Budget: 3500ms total, 1800ms per call. Never blocks Claude Code.

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const PER_CALL_TIMEOUT_MS = 1800;
const HOOK_BUDGET_MS = 3500;
const WORKER_JSON = path.join(os.homedir(), '.cellm', 'worker.json');
const DEFAULT_PORT = 31415;
const DEFAULT_HOST = '127.0.0.1';

const ENDPOINTS = [
  '/api/hooks/init',
  '/api/hooks/context',
  // inject-persona.sh is a local-only filesystem op; keep as separate shell hook
  // for explicit read of ~/.cellm/persona.md when present.
];

function resolveBaseUrl() {
  const envUrl = process.env.CELLM_WORKER_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  try {
    const cfg = JSON.parse(fs.readFileSync(WORKER_JSON, 'utf8'));
    return `http://${cfg.host || DEFAULT_HOST}:${cfg.port || DEFAULT_PORT}`;
  } catch {
    return `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;
  }
}

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

function extractContext(raw) {
  if (!raw || raw === '""' || raw === 'null') return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.hookSpecificOutput) {
      const ctx = parsed.hookSpecificOutput.additionalContext;
      if (typeof ctx === 'string' && ctx.trim().length) return ctx;
    }
    if (typeof parsed === 'string' && parsed.trim().length) return parsed;
    return null;
  } catch {
    const t = raw.trim();
    return t.length ? t : null;
  }
}

async function main() {
  const budgetTimer = setTimeout(() => {
    process.stdout.write('');
    process.exit(0);
  }, HOOK_BUDGET_MS);

  try {
    const input = await readStdin();
    const payload = input || '{}';
    const baseUrl = resolveBaseUrl();

    const results = await Promise.allSettled(
      ENDPOINTS.map((p) => postJson(baseUrl, p, payload, PER_CALL_TIMEOUT_MS))
    );

    const contexts = [];
    for (const r of results) {
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
        hookEventName: 'SessionStart',
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
