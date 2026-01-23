#!/usr/bin/env node
/**
 * CELLM Oracle - Context Generator
 *
 * Fetches and outputs context for SessionStart injection.
 * Calls Worker API to generate markdown context.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const HOME = process.env.HOME || process.env.USERPROFILE;
const WORKER_JSON = path.join(HOME, '.cellm', 'worker.json');
const DEFAULT_PORT = 31415;

function getPort() {
  try {
    if (fs.existsSync(WORKER_JSON)) {
      const data = JSON.parse(fs.readFileSync(WORKER_JSON, 'utf-8'));
      return data.port || DEFAULT_PORT;
    }
  } catch {}
  return DEFAULT_PORT;
}

function fetchContext(project) {
  return new Promise((resolve, reject) => {
    const port = getPort();
    const url = `/api/context/generate?project=${encodeURIComponent(project)}`;

    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: url,
      method: 'GET',
      timeout: 3000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success && json.markdown) {
            resolve(json.markdown);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

async function main() {
  const project = path.basename(process.cwd());

  try {
    const context = await fetchContext(project);

    if (context) {
      // Output context for hook injection
      console.log(context);
    } else {
      console.log('*No recent context available*');
    }
  } catch {
    console.log('*Context unavailable*');
  }
}

main();
