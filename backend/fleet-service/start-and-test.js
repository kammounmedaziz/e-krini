#!/usr/bin/env node
/*
 start-and-test.js
 Starts src/app.js in background, waits for /health readiness, runs smoke-test-cars.js, then stops server.
 Uses only Node built-in modules so it runs on Windows/Mac/Linux.
*/

import { spawn } from 'child_process';
import http from 'http';
import { URL } from 'url';
import process from 'process';

const SERVER_SCRIPT = 'src/app.js';
const SMOKE_SCRIPT = 'smoke-test-cars.js';
const HOST = '127.0.0.1';
const PORT = 3002;
const HEALTH_PATH = '/health';

const HEALTH_URL = `http://${HOST}:${PORT}${HEALTH_PATH}`;
const POLL_INTERVAL_MS = 500;
const TIMEOUT_MS = 15_000;

function prefixLog(prefix, chunk) {
  const s = String(chunk).trimEnd();
  s.split(/\r?\n/).forEach((line) => {
    if (line.length) console.log(`[${prefix}] ${line}`);
  });
}

function spawnNodeScript(scriptPath, args = []) {
  const child = spawn(process.execPath, [scriptPath, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (child.stdout) child.stdout.on('data', (c) => prefixLog(scriptPath, c));
  if (child.stderr) child.stderr.on('data', (c) => prefixLog(`${scriptPath}:ERR`, c));

  child.on('error', (err) => {
    console.error(`[${scriptPath}] spawn error:`, err && err.message ? err.message : err);
  });

  return child;
}

function checkHealthOnce(url) {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const opts = {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: 'GET',
        timeout: 2000,
      };

      const req = http.request(opts, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            const json = JSON.parse(body || '{}');
            resolve({ ok: true, statusCode: res.statusCode, json });
          } catch (e) {
            resolve({ ok: false, error: 'invalid_json', statusCode: res.statusCode, raw: body });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ ok: false, error: err && err.message ? err.message : String(err) });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'timeout' });
      });

      req.end();
    } catch (e) {
      resolve({ ok: false, error: e && e.message ? e.message : String(e) });
    }
  });
}

async function waitForHealth(url, intervalMs, timeoutMs) {
  const start = Date.now();
  process.stdout.write(`Waiting for health at ${url} (timeout ${timeoutMs}ms)...\n`);
  while (Date.now() - start < timeoutMs) {
    const res = await checkHealthOnce(url);
    if (res.ok && res.statusCode === 200 && res.json && res.json.status === 'OK' && res.json.db === 'connected') {
      console.log(`Server healthy: status=OK, db=connected`);
      return { ready: true, info: res.json };
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  process.stdout.write('\n');
  return { ready: false };
}

async function main() {
  console.log('Starting server:', SERVER_SCRIPT);
  const server = spawnNodeScript(SERVER_SCRIPT);

  let stopping = false;
  const stopAllAndExit = (code = 0) => {
    if (stopping) return;
    stopping = true;
    console.log('\nStopping processes...');
    try {
      if (server && !server.killed) {
        server.kill();
        console.log(`Sent kill to server process (PID ${server.pid})`);
      }
    } catch (e) {
      console.warn('Error killing server process:', e && e.message ? e.message : e);
    }
    process.exit(code);
  };

  process.on('SIGINT', () => {
    console.log('SIGINT received (Ctrl+C)');
    stopAllAndExit(130);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    stopAllAndExit(0);
  });

  const { ready } = await waitForHealth(HEALTH_URL, POLL_INTERVAL_MS, TIMEOUT_MS);
  if (!ready) {
    console.error(`\nERROR: Server did not become ready within ${TIMEOUT_MS}ms at ${HEALTH_URL}`);
    try {
      if (server && !server.killed) {
        console.log('Killing server process due to timeout...');
        server.kill();
      }
    } catch (e) {
      console.warn('Error killing server process:', e && e.message ? e.message : e);
    }
    process.exit(1);
  }

  console.log('Launching smoke test:', SMOKE_SCRIPT);
  const smoke = spawnNodeScript(SMOKE_SCRIPT);

  smoke.on('close', (code, signal) => {
    console.log(`Smoke test exited with code=${code} signal=${signal}`);
    try {
      if (server && !server.killed) {
        console.log('Stopping server...');
        server.kill();
      }
    } catch (e) {
      console.warn('Error stopping server:', e && e.message ? e.message : e);
    }
    setTimeout(() => process.exit(typeof code === 'number' ? code : 0), 200);
  });

  smoke.on('error', (err) => {
    console.error('Smoke test spawn error:', err && err.message ? err.message : err);
    try {
      if (server && !server.killed) server.kill();
    } catch (_) {}
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Fatal error in start-and-test:', err && err.message ? err.message : err);
  process.exit(1);
});
