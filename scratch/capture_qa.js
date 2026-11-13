const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8123;
const ROOT_DIR = path.resolve(__dirname, '..');

// Simple static server
const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '/try-it-out' || reqPath === '/try-it-out/') {
    reqPath = '/try-it-out/index.html';
  }
  let filePath = path.join(ROOT_DIR, reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(ROOT_DIR, 'index.html');
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
  runQa();
});

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(process.env.TEMP, 'chrome-qa-profile-' + Date.now());

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function runQa() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + userDataDir
  ]);

  setTimeout(async () => {
    try {
      const tabs = await getJSON('http://127.0.0.1:9223/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) {
        tab = await getJSON(`http://127.0.0.1:9223/json/new?http://127.0.0.1:${PORT}/try-it-out`);
      }

      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      let msgId = 1;
      const callbacks = new Map();

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && callbacks.has(msg.id)) {
          callbacks.get(msg.id)(msg);
          callbacks.delete(msg.id);
        }
      };

      function send(method, params = {}) {
        return new Promise((resolve) => {
          const curId = msgId++;
          callbacks.set(curId, resolve);
          ws.send(JSON.stringify({ id: curId, method, params }));
        });
      }

      async function evalJs(expr) {
        const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        return res.result ? res.result.value : null;
      }

      const outDir = path.join(__dirname, 'qa_before');
      fs.mkdirSync(outDir, { recursive: true });

      async function capture(name) {
        await new Promise(r => setTimeout(r, 400));
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(shot.result.data, 'base64'));
        console.log(`Saved screenshot: ${name}.png`);
      }

      ws.onopen = async () => {
        await send('Page.enable');
        await send('DOM.enable');
        await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/try-it-out` });
        await new Promise(r => setTimeout(r, 1000));
        await evalJs(`sessionStorage.setItem('omkarvia.consult.v1', JSON.stringify({ autoHandled: true, mode: 'closed' })); const q = document.getElementById('quoteModal'); if(q){q.hidden=true; q.classList.remove('is-visible');}`);
        await new Promise(r => setTimeout(r, 1000));

        // 1. Initial bedroom view
        await capture('01_bedroom_initial');

        // Bedroom preset modern-grey
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="modern-grey"]').click()`);
        await capture('02_bedroom_modern_grey');

        // 2. Switch to Kitchen
        await evalJs(`document.getElementById('switchRoomBtn').click()`);
        await new Promise(r => setTimeout(r, 500));
        await evalJs(`document.querySelector('[data-select-room="kitchen"]').click()`);
        await capture('03_kitchen_initial_warm_neutral');

        // Kitchen preset modern-grey
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="modern-grey"]').click()`);
        await capture('04_kitchen_preset_modern_grey');

        // Kitchen preset sage-green
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="sage-green"]').click()`);
        await capture('05_kitchen_preset_sage_green');

        // Kitchen swatch: click sage green upper cabinet swatch
        await evalJs(`document.querySelector('[data-surface="kitchen-upper"][data-name="Sage Green"]').click()`);
        await capture('06_kitchen_swatch_upper_sage');

        // Kitchen swatch: click charcoal lower cabinet swatch
        await evalJs(`document.querySelector('[data-surface="kitchen-lower"][data-name="Charcoal"]').click()`);
        await capture('07_kitchen_swatch_lower_charcoal');

        // 3. Switch to Living Room
        await evalJs(`document.getElementById('switchRoomBtn').click()`);
        await new Promise(r => setTimeout(r, 500));
        await evalJs(`document.querySelector('[data-select-room="living"]').click()`);
        await capture('08_living_initial_warm_neutral');

        // Living room preset sage-green (Defect #2: dark green tint covering almost entire image?)
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="sage-green"]').click()`);
        await capture('09_living_preset_sage_green');

        // Living room preset modern-grey
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="modern-grey"]').click()`);
        await capture('10_living_preset_modern_grey');

        // Living room preset royal-blue
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="royal-blue"]').click()`);
        await capture('11_living_preset_royal_blue');

        // Living room swatch: click sofa swatch
        await evalJs(`document.querySelector('[data-surface="living-sofa"][data-name="Navy Chenille"]').click()`);
        await capture('12_living_swatch_sofa_navy');

        // Slider test: move slider to 10% and 90%
        await evalJs(`document.getElementById('compDivider').style.left = '10%'; document.getElementById('compAfterLayer').style.clipPath = 'polygon(10% 0, 100% 0, 100% 100%, 10% 100%)'`);
        await capture('13_living_slider_10');

        console.log('Visual QA capture finished successfully!');
        ws.close();
        chrome.kill();
        server.close();
        process.exit(0);
      };
    } catch (e) {
      console.error(e);
      chrome.kill();
      server.close();
      process.exit(1);
    }
  }, 1500);
}
