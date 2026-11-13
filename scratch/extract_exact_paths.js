const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8126;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-paths-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
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

      const tabs = await getJSON('http://127.0.0.1:9226/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9226/json/new?about:blank`);

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

      ws.onopen = async () => {
        await send('Page.enable');
        await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/scratch/inspect_coords.html` });
        await new Promise(r => setTimeout(r, 1500));

        // Let's inspect living room elements: TV screen bounds, sofa bounds, console bounds
        const livingData = await evalJs(`
          (async () => {
            function loadImg(src) {
              return new Promise(res => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => res(img);
                img.src = src;
              });
            }

            const img = await loadImg('http://127.0.0.1:${PORT}/assets/studio/living-warm-neutral.jpg');
            const cv = document.createElement('canvas');
            cv.width = 1376;
            cv.height = 768;
            const cx = cv.getContext('2d');
            cx.drawImage(img, 0, 0);
            const d = cx.getImageData(0, 0, 1376, 768).data;

            function getPx(x, y) {
              const i = (Math.round(y) * 1376 + Math.round(x)) * 4;
              return [d[i], d[i+1], d[i+2], d[i+3]];
            }

            // TV bounds
            // Horizontal scan at y=350 from x=150 to x=450
            const tvHoriz = [];
            for (let x = 180; x <= 430; x += 5) {
              tvHoriz.push({ x, rgb: getPx(x, 350).slice(0, 3) });
            }
            // Vertical scan at x=300 from y=200 to y=500
            const tvVert = [];
            for (let y = 240; y <= 480; y += 5) {
              tvVert.push({ y, rgb: getPx(300, y).slice(0, 3) });
            }

            // Media console top & bottom at x=200
            const consoleVert = [];
            for (let y = 450; y <= 720; y += 10) {
              consoleVert.push({ y, rgb: getPx(200, y).slice(0, 3) });
            }

            // Sofa back top curve: scan vertically at x=600, 700, 800, 900, 1000
            const sofaTops = {};
            [600, 650, 700, 750, 800, 850, 900, 950, 1000].forEach(sx => {
              for (let sy = 400; sy <= 550; sy += 2) {
                const rgb = getPx(sx, sy);
                // Background is window/trees (darker green) or drape (creamy white)
                // Sofa is cream bouclé
                sofaTops[sx] = sofaTops[sx] || [];
                sofaTops[sx].push({ y: sy, rgb: rgb.slice(0, 3) });
              }
            });

            // Window bounds: horizontal scan at y=300 from x=500 to x=1100
            const windowHoriz = [];
            for (let x = 500; x <= 1100; x += 20) {
              windowHoriz.push({ x, rgb: getPx(x, 300).slice(0, 3) });
            }

            return { tvHoriz, tvVert, consoleVert, windowHoriz, sofaTopsSummary: Object.keys(sofaTops) };
          })();
        `);

        fs.writeFileSync(path.join(__dirname, 'living_samples.json'), JSON.stringify(livingData, null, 2));
        console.log('Saved scratch/living_samples.json');

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

