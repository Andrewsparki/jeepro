import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9224;

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
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new globalThis.WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function main() {
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--window-size=1440,1080',
      '--user-data-dir=C:\\jee-pro\\.chrome-temp-test2',
    ],
    { stdio: 'ignore' }
  );

  await sleep(1500);

  try {
    const pages = await getJson('/json');
    const targetPage = pages.find((p) => p.type === 'page');
    if (!targetPage) throw new Error('No page found in Chrome');

    const client = new CDPClient(targetPage.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('Navigating to http://localhost:3000/ ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2500);

    // Scroll to section 1 (product preview)
    await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 500)' });
    await sleep(800);
    const ss1 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\jee-pro\\scratch\\preview_workspace.png', Buffer.from(ss1.data, 'base64'));

    // Scroll to subjects
    await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1900)' });
    await sleep(800);
    const ss2 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\jee-pro\\scratch\\preview_subjects.png', Buffer.from(ss2.data, 'base64'));

    // Scroll to telemetry
    await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 3600)' });
    await sleep(800);
    const ss3 = await client.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\jee-pro\\scratch\\preview_telemetry.png', Buffer.from(ss3.data, 'base64'));

    console.log('Saved section screenshots!');
    client.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chromeProcess.kill();
  }
}

main();
