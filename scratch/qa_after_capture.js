const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8135;
const ROOT_DIR = path.resolve(__dirname, '..');

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
  console.log(`QA Server running at http://127.0.0.1:${PORT}`);
  runQa();
});

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(process.env.TEMP, 'chrome-after-profile-' + Date.now());

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
    '--remote-debugging-port=9235',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + userDataDir
  ]);

  setTimeout(async () => {
    try {
      const tabs = await getJSON('http://127.0.0.1:9235/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) {
        tab = await getJSON(`http://127.0.0.1:9235/json/new?http://127.0.0.1:${PORT}/try-it-out`);
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
        return res.result && res.result.result ? res.result.result.value : null;
      }

      const outDir = path.join(__dirname, 'qa_after');
      fs.mkdirSync(outDir, { recursive: true });

      async function capture(name) {
        await new Promise(r => setTimeout(r, 450));
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

        // Suppress consultation popup
        await evalJs(`sessionStorage.setItem('omkarvia.consult.v1', JSON.stringify({ autoHandled: true, mode: 'closed' })); const q = document.getElementById('quoteModal'); if(q){q.hidden=true; q.classList.remove('is-visible');}`);
        await new Promise(r => setTimeout(r, 1000));

        // -------------------------------------------------------------
        // A. BEDROOM TESTS (Preserve existing functionality)
        // -------------------------------------------------------------
        await capture('01_bedroom_warm_neutral');

        await evalJs(`document.querySelector('.preset-card-btn[data-preset="modern-grey"]').click()`);
        await capture('02_bedroom_preset_modern_grey');

        await evalJs(`document.querySelector('.preset-card-btn[data-preset="sage-green"]').click()`);
        await capture('03_bedroom_preset_sage_green');

        // -------------------------------------------------------------
        // B. KITCHEN TESTS (Fixed lower/upper/island masks)
        // -------------------------------------------------------------
        await evalJs(`document.getElementById('switchRoomBtn').click()`);
        await new Promise(r => setTimeout(r, 500));
        await evalJs(`document.querySelector('[data-select-room="kitchen"]').click()`);
        await capture('04_kitchen_initial_warm_neutral');

        // Presets
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="modern-grey"]').click()`);
        await capture('05_kitchen_preset_modern_grey');

        await evalJs(`document.querySelector('.preset-card-btn[data-preset="sage-green"]').click()`);
        await capture('06_kitchen_preset_sage_green');

        await evalJs(`document.querySelector('.preset-card-btn[data-preset="royal-blue"]').click()`);
        await capture('07_kitchen_preset_royal_blue');

        await evalJs(`document.querySelector('.preset-card-btn[data-preset="terracotta"]').click()`);
        await capture('08_kitchen_preset_terracotta');

        // Individual Swatches
        // Click Upper Cabinet -> Sage Green
        await evalJs(`document.querySelector('[data-surface="kitchen-upper"][data-name="Sage Green"]').click()`);
        await capture('09_kitchen_swatch_upper_sage');

        // Click Lower Cabinet -> Charcoal
        await evalJs(`document.querySelector('[data-surface="kitchen-lower"][data-name="Charcoal"]').click()`);
        await capture('10_kitchen_swatch_lower_charcoal');

        // Click Lower Cabinet -> Navy
        await evalJs(`document.querySelector('[data-surface="kitchen-lower"][data-name="Navy"]').click()`);
        await capture('11_kitchen_swatch_lower_navy');

        // Click Countertop -> Nero Black
        await evalJs(`document.querySelector('[data-surface="kitchen-counter"][data-name="Nero Black"]').click()`);
        await capture('12_kitchen_swatch_counter_nero');

        // Slider test with kitchen customized look
        await evalJs(`
          document.getElementById('compDivider').style.left = '30%';
          document.getElementById('compAfterLayer').style.clipPath = 'polygon(30% 0, 100% 0, 100% 100%, 30% 100%)';
        `);
        await capture('13_kitchen_slider_30');

        // -------------------------------------------------------------
        // C. LIVING ROOM TESTS (Fixed dark green tint & boundaries)
        // -------------------------------------------------------------
        await evalJs(`document.getElementById('switchRoomBtn').click()`);
        await new Promise(r => setTimeout(r, 500));
        await evalJs(`document.querySelector('[data-select-room="living"]').click()`);
        await capture('14_living_initial_warm_neutral');

        // Sage green preset (PREVIOUS DEFECT: dark green tint covering entire image)
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="sage-green"]').click()`);
        await capture('15_living_preset_sage_green');

        // Modern grey preset
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="modern-grey"]').click()`);
        await capture('16_living_preset_modern_grey');

        // Royal blue preset
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="royal-blue"]').click()`);
        await capture('17_living_preset_royal_blue');

        // Terracotta preset
        await evalJs(`document.querySelector('.preset-card-btn[data-preset="terracotta"]').click()`);
        await capture('18_living_preset_terracotta');

        // Individual living room swatches
        // Sofa -> Navy Chenille
        await evalJs(`document.querySelector('[data-surface="living-sofa"][data-name="Navy Chenille"]').click()`);
        await capture('19_living_swatch_sofa_navy');

        // Media Accent Wall -> Smoked Oak
        await evalJs(`document.querySelector('[data-surface="living-accent"][data-name="Smoked Oak"]').click()`);
        await capture('20_living_swatch_accent_smoked');

        // Curtain Drapery -> Olive
        await evalJs(`document.querySelector('[data-surface="living-curtains"][data-name="Olive"]').click()`);
        await capture('21_living_swatch_curtains_olive');

        // Slider test with living customized look
        await evalJs(`
          document.getElementById('compDivider').style.left = '70%';
          document.getElementById('compAfterLayer').style.clipPath = 'polygon(70% 0, 100% 0, 100% 100%, 70% 100%)';
        `);
        await capture('22_living_slider_70');

        // -------------------------------------------------------------
        // D. RESPONSIVE VIEWPORT TESTING
        // -------------------------------------------------------------
        // Tablet 1024
        await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
        await new Promise(r => setTimeout(r, 500));
        await capture('23_responsive_tablet_1024');

        // Mobile 390
        await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await new Promise(r => setTimeout(r, 500));
        await capture('24_responsive_mobile_390');

        console.log('ALL QA AFTER SCREENSHOTS CAPTURED SUCCESSFULLY!');
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

