const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(process.env.TEMP, 'chrome-diag-profile-' + Date.now());

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1280,900',
  '--user-data-dir=' + userDataDir
]);

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

setTimeout(async () => {
  try {
    const tabs = await getJSON('http://127.0.0.1:9222/json/list');
    let tab = tabs.find(t => t.type === 'page');
    if (!tab) {
      console.log('No page tab found, creating one...');
      const newTab = await getJSON('http://127.0.0.1:9222/json/new?http://localhost:8080/%23home');
      tab = newTab;
    }
    console.log('Connected to target:', tab.url, tab.type);

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    const consoleLogs = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({ type: msg.params.type, args: msg.params.args.map(a => a.value || a.description) });
      } else if (msg.method === 'Runtime.exceptionThrown') {
        consoleLogs.push({ type: 'EXCEPTION', text: msg.params.exceptionDetails.text, exception: msg.params.exceptionDetails.exception });
      }
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const curId = id++;
        callbacks.set(curId, resolve);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    ws.onopen = async () => {
      await send('Page.enable');
      await send('Runtime.enable');
      await send('DOM.enable');
      await send('CSS.enable');

      console.log('Navigating to http://localhost:8080/#home ...');
      await send('Page.navigate', { url: 'http://localhost:8080/#home' });

      // Wait 3 seconds for page load
      await new Promise(r => setTimeout(r, 3000));

      const pageInfo = await send('Runtime.evaluate', {
        expression: `({
          url: window.location.href,
          title: document.title,
          bodyLength: document.body ? document.body.innerHTML.length : 0,
          bodyStart: document.body ? document.body.innerHTML.substring(0, 400) : ''
        })`,
        returnByValue: true
      });
      console.log('=== PAGE INFO ===', JSON.stringify(pageInfo.result.result.value, null, 2));

      const diagEval = await send('Runtime.evaluate', {
        expression: `(() => {
          const res = {};
          const elms = {
            siteHeader: document.querySelector('#siteHeader'),
            homeSection: document.querySelector('#home'),
            heroBgActive: document.querySelector('#heroBgActive'),
            heroOverlay: document.querySelector('.hero-overlay'),
            heroContainer: document.querySelector('.hero-room-wheel .hero-container'),
            heroContent: document.querySelector('.hero-room-wheel .hero-content'),
            heroTitle: document.querySelector('#heroTitle'),
            typingLine1: document.querySelector('#typingLine1'),
            typingLine2: document.querySelector('#typingLine2'),
            heroCopy: document.querySelector('.hero-copy'),
            heroActions: document.querySelector('.hero-actions'),
            wheelStage: document.querySelector('.wheel-stage-wrapper'),
            roomThumbStrip: document.querySelector('.room-thumbnail-strip'),
            trustStrip: document.querySelector('.trust-strip'),
            whySection: document.querySelector('#why-us')
          };

          for (const [key, el] of Object.entries(elms)) {
            if (!el) {
              res[key] = { exists: false };
            } else {
              const rect = el.getBoundingClientRect();
              const style = window.getComputedStyle(el);
              res[key] = {
                exists: true,
                rect: { top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), height: Math.round(rect.height) },
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                zIndex: style.zIndex,
                position: style.position,
                color: style.color,
                backgroundColor: style.backgroundColor,
                textContent: el.textContent ? el.textContent.substring(0, 50).trim() : ''
              };
            }
          }
          return res;
        })()`,
        returnByValue: true
      });

      console.log('=== ELEMENT DIAGNOSTICS ===');
      const val = diagEval.result && diagEval.result.result ? diagEval.result.result.value : diagEval;
      console.log(JSON.stringify(val, null, 2));

      // Capture screenshot
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      if (shot.result && shot.result.data) {
        fs.writeFileSync(path.join(__dirname, 'current_view.png'), Buffer.from(shot.result.data, 'base64'));
        console.log('Screenshot saved to scratch/current_view.png');
      } else {
        console.log('Screenshot failed:', JSON.stringify(shot));
      }

      ws.close();
      chrome.kill();
      process.exit(0);
    };

  } catch (e) {
    console.error('Diagnostic error:', e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
