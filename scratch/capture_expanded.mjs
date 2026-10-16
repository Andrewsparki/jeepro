import { spawn } from 'child_process';
import http from 'http';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9225;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}${path}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        } else if (msg.method) {
          const listeners = this.eventListeners.get(msg.method) || [];
          for (const l of listeners) l(msg.params);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const testEmail = 'benchmark_test@jeepro.local';
  const testPass = 'BenchmarkPass123!';

  let { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  if (error || !data.session) {
    console.error('Failed to authenticate:', error);
    return;
  }
  const session = data.session;

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\jee-pro\\.chrome-missions-temp-3',
  ]);

  await sleep(1500);

  const targets = await getJson('/json');
  const target = targets.find((t) => t.type === 'page') || targets[0];
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Network.enable');
  await cdp.send('Runtime.enable');

  const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieValue = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  });
  const base64Val = Buffer.from(cookieValue).toString('base64');

  await cdp.send('Network.setCookie', {
    name: cookieName,
    value: `base64-${base64Val}`,
    domain: 'localhost',
    path: '/',
  });
  await cdp.send('Network.setCookie', {
    name: `${cookieName}.0`,
    value: `base64-${base64Val}`,
    domain: 'localhost',
    path: '/',
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await sleep(3500);

  // Scroll to Daily Missions
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('[data-context-id="missions"]');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`,
  });

  await sleep(500);

  // Click on "Review completed missions" button
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Review completed missions'));
      if (btn) btn.click();
    })()`,
  });

  await sleep(600);

  const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/missions_screenshot_expanded.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved scratch/missions_screenshot_expanded.png');

  cdp.close();
  chromeProc.kill();
}

main().catch(console.error);
