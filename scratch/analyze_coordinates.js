const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8124;
const ROOT_DIR = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(ROOT_DIR, reqPath);
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200);
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(process.env.TEMP, 'chrome-edge-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + userDataDir
  ]);

  setTimeout(async () => {
    try {
      function getJSON(url) {
        return new Promise((resolve, reject) => {
          http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
          }).on('error', reject);
        });
      }

      const tabs = await getJSON('http://127.0.0.1:9224/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) {
        tab = await getJSON(`http://127.0.0.1:9224/json/new?about:blank`);
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
        console.log('Runtime.evaluate raw result:', JSON.stringify(res));
        return res.result ? res.result.value : null;
      }

      ws.onopen = async () => {
        await send('Page.enable');
        await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/scratch/inspect_coords.html` });
        await new Promise(r => setTimeout(r, 1500));

        // Evaluate edge detection in kitchen image
        const edges = await evalJs(`
          (async () => {
            return new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
              const cv = document.createElement('canvas');
              cv.width = 1376;
              cv.height = 768;
              const cx = cv.getContext('2d');
              cx.drawImage(img, 0, 0);
              const data = cx.getImageData(0, 0, 1376, 768).data;

              function getPx(x, y) {
                const i = (Math.round(y) * 1376 + Math.round(x)) * 4;
                return [data[i], data[i+1], data[i+2], data[i+3]];
              }

              // Let's sample along key lines
              // Island waterfall left edge: sample horizontally at y=550
              const islandScanY550 = [];
              for (let x = 380; x <= 450; x += 2) {
                islandScanY550.push({ x, rgb: getPx(x, 550).slice(0, 3) });
              }
              // Island waterfall right edge: sample horizontally at y=550
              const islandScanRight = [];
              for (let x = 980; x <= 1040; x += 2) {
                islandScanRight.push({ x, rgb: getPx(x, 550).slice(0, 3) });
              }
              // Island countertop top and bottom at x=700
              const islandVert700 = [];
              for (let y = 410; y <= 480; y += 2) {
                islandVert700.push({ y, rgb: getPx(700, y).slice(0, 3) });
              }
              // Island bottom at x=700
              const islandBottom700 = [];
              for (let y = 620; y <= 700; y += 2) {
                islandBottom700.push({ y, rgb: getPx(700, y).slice(0, 3) });
              }

              // Upper cabinets: top and bottom at x=500
              const upperVert500 = [];
              for (let y = 130; y <= 450; y += 5) {
                upperVert500.push({ y, rgb: getPx(500, y).slice(0, 3) });
              }
              // Upper cabinets horizontal at y=250
              const upperHoriz250 = [];
              for (let x = 390; x <= 970; x += 10) {
                upperHoriz250.push({ x, rgb: getPx(x, 250).slice(0, 3) });
              }

              resolve({ islandScanY550, islandScanRight, islandVert700, islandBottom700, upperVert500, upperHoriz250 });
            };
            img.src = 'http://127.0.0.1:${PORT}/assets/studio/kitchen-warm-neutral.jpg';
          });
        })();
        `);

        fs.writeFileSync(path.join(__dirname, 'kitchen_samples.json'), JSON.stringify(edges, null, 2));
        console.log('Saved kitchen samples to scratch/kitchen_samples.json');

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
});
