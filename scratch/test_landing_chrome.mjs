import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9223;

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
      '--window-size=1440,900',
      '--user-data-dir=C:\\jee-pro\\.chrome-temp-test',
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
    await client.send('Log.enable');

    console.log('Navigating to http://localhost:3000/ ...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2500);

    // Evaluate title and elements on page
    const titleResult = await client.send('Runtime.evaluate', {
      expression: 'document.title',
    });
    console.log('Page Title:', titleResult.result.value);

    // Check headings
    const headingsResult = await client.send('Runtime.evaluate', {
      expression: 'Array.from(document.querySelectorAll("h1, h2, h3")).map(h => h.innerText.slice(0, 40))',
      returnByValue: true,
    });
    console.log('Headings found:', headingsResult.result.value);

    // Capture screenshot
    const screenshot = await client.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    fs.writeFileSync('C:\\jee-pro\\scratch\\landing_preview.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved screenshot to scratch/landing_preview.png');

    client.close();
  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    chromeProcess.kill();
  }
}

main();
