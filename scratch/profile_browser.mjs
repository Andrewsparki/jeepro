import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;

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

async function profileRoute(cdp, url, name) {
  console.log(`\n========================================`);
  console.log(`Profiling route: ${name} (${url})`);
  console.log(`========================================`);

  const requests = [];
  const consoleErrors = [];
  const consoleWarnings = [];

  const reqHandler = (params) => {
    requests.push({
      requestId: params.requestId,
      url: params.request.url,
      method: params.request.method,
      type: params.type,
      size: 0,
    });
  };

  const respHandler = (params) => {
    const r = requests.find((x) => x.requestId === params.requestId);
    if (r) {
      r.status = params.response.status;
      r.mimeType = params.response.mimeType;
      r.encodedDataLength = params.response.encodedDataLength;
    }
  };

  const consoleHandler = (params) => {
    const text = params.args ? params.args.map((a) => a.value || a.description).join(' ') : params.text;
    if (params.type === 'error') consoleErrors.push(text);
    if (params.type === 'warning') consoleWarnings.push(text);
  };

  cdp.on('Network.requestWillBeSent', reqHandler);
  cdp.on('Network.responseReceived', respHandler);
  cdp.on('Runtime.consoleAPICalled', consoleHandler);

  const navStart = Date.now();
  await cdp.send('Page.navigate', { url });
  await sleep(3500); // Allow render, preloader, animations to settle

  const navDuration = Date.now() - navStart;

  // Get Performance Metrics
  const metricsResult = await cdp.send('Performance.getMetrics');
  const metrics = {};
  for (const m of metricsResult.metrics) {
    metrics[m.name] = m.value;
  }

  // Evaluate in browser for Web Vitals / DOM details / Memory
  const clientEval = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      const domCount = document.querySelectorAll('*').length;
      const mem = performance.memory ? {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) + ' MB',
        totalJSHeapSize: (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2) + ' MB'
      } : null;
      return {
        fcp: fcp.toFixed(1) + 'ms',
        domInteractive: nav ? (nav.domInteractive).toFixed(1) + 'ms' : 'N/A',
        domContentLoaded: nav ? (nav.domContentLoadedEventEnd).toFixed(1) + 'ms' : 'N/A',
        loadEventEnd: nav ? (nav.loadEventEnd).toFixed(1) + 'ms' : 'N/A',
        domNodeCount: domCount,
        memory: mem,
        title: document.title,
      };
    })()`,
    returnByValue: true,
  });

  const pageData = clientEval.result.value || {};

  const totalTransferred = requests.reduce((acc, r) => acc + (r.encodedDataLength || 0), 0);
  const jsRequests = requests.filter((r) => r.type === 'Script' || r.url.endsWith('.js'));
  const totalJsTransferred = jsRequests.reduce((acc, r) => acc + (r.encodedDataLength || 0), 0);

  const report = {
    name,
    url,
    title: pageData.title,
    navDuration: navDuration + 'ms',
    fcp: pageData.fcp,
    domNodes: pageData.domNodeCount,
    jsHeapUsed: metrics.JSHeapUsedSize ? (metrics.JSHeapUsedSize / (1024 * 1024)).toFixed(2) + ' MB' : pageData.memory?.usedJSHeapSize,
    totalHeap: metrics.JSHeapTotalSize ? (metrics.JSHeapTotalSize / (1024 * 1024)).toFixed(2) + ' MB' : pageData.memory?.totalJSHeapSize,
    domNodesEngine: metrics.Nodes,
    layoutCount: metrics.LayoutCount,
    recalcStyleCount: metrics.RecalcStyleCount,
    totalRequests: requests.length,
    jsRequests: jsRequests.length,
    totalTransferred: (totalTransferred / 1024).toFixed(1) + ' KB',
    jsTransferred: (totalJsTransferred / 1024).toFixed(1) + ' KB',
    consoleErrorsCount: consoleErrors.length,
    consoleErrors: consoleErrors.slice(0, 5),
    consoleWarningsCount: consoleWarnings.length,
  };

  console.log(JSON.stringify(report, null, 2));
  return report;
}

async function run() {
  console.log('Launching headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\jee-pro\\.chrome-temp',
  ]);

  await sleep(1500);

  const targets = await getJson('/json');
  const target = targets.find((t) => t.type === 'page') || targets[0];
  console.log('Connected to target:', target.webSocketDebuggerUrl);

  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Network.enable');
  await cdp.send('Performance.enable');
  await cdp.send('Runtime.enable');

  const routes = [
    { name: 'Landing', url: 'http://localhost:3000/' },
    { name: 'Login', url: 'http://localhost:3000/login' },
    { name: 'Pricing', url: 'http://localhost:3000/pricing' },
    { name: 'About', url: 'http://localhost:3000/about' },
    { name: 'Dashboard', url: 'http://localhost:3000/dashboard' },
    { name: 'Study Workspace', url: 'http://localhost:3000/dashboard/study' },
    { name: 'Focus Mode', url: 'http://localhost:3000/dashboard/focus' },
    { name: 'Chat', url: 'http://localhost:3000/dashboard/chat' },
    { name: 'Leaderboard', url: 'http://localhost:3000/dashboard/leaderboard' },
    { name: 'Achievements', url: 'http://localhost:3000/dashboard/achievements' },
    { name: 'Friends', url: 'http://localhost:3000/dashboard/friends' },
    { name: 'Groups', url: 'http://localhost:3000/dashboard/groups' },
    { name: 'Analytics', url: 'http://localhost:3000/dashboard/analytics' },
    { name: 'Planner', url: 'http://localhost:3000/dashboard/planner' },
    { name: 'Settings', url: 'http://localhost:3000/dashboard/settings' },
    { name: 'Admin', url: 'http://localhost:3000/admin' },
  ];

  const results = [];
  for (const r of routes) {
    try {
      const res = await profileRoute(cdp, r.url, r.name);
      results.push(res);
    } catch (e) {
      console.error(`Error profiling ${r.name}:`, e);
    }
  }

  console.log('\n========================================');
  console.log('BASELINE SUMMARY TABLE');
  console.log('========================================');
  console.table(
    results.map((r) => ({
      Route: r.name,
      FCP: r.fcp,
      DOM_Nodes: r.domNodes,
      JS_Heap: r.jsHeapUsed,
      Transferred: r.totalTransferred,
      JS_Transferred: r.jsTransferred,
      Layouts: r.layoutCount,
      Styles: r.recalcStyleCount,
      Errors: r.consoleErrorsCount,
    }))
  );

  cdp.close();
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('Run failed:', err);
  process.exit(1);
});
