const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8129;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-grid-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
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

      const tabs = await getJSON('http://127.0.0.1:9229/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9229/json/new?about:blank`);

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

        // Let's create an image with coordinate grid overlaid on kitchen-warm-neutral.jpg
        const gridDataUrl = await evalJs(`
          (async () => {
            function loadImg(src) {
              return new Promise(res => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => res(img);
                img.src = src;
              });
            }

            const img = await loadImg('http://127.0.0.1:${PORT}/assets/studio/kitchen-warm-neutral.jpg');
            const cv = document.createElement('canvas');
            cv.width = 1376;
            cv.height = 768;
            const cx = cv.getContext('2d');
            cx.drawImage(img, 0, 0);

            // Draw coordinate grid every 50px
            cx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
            cx.lineWidth = 1;
            cx.font = '10px sans-serif';
            cx.fillStyle = 'yellow';

            for (let x = 0; x <= 1376; x += 50) {
              cx.beginPath();
              cx.moveTo(x, 0);
              cx.lineTo(x, 768);
              cx.stroke();
              cx.fillText(x, x + 2, 12);
              cx.fillText(x, x + 2, 400);
              cx.fillText(x, x + 2, 700);
            }

            for (let y = 0; y <= 768; y += 50) {
              cx.beginPath();
              cx.moveTo(0, y);
              cx.lineTo(1376, y);
              cx.stroke();
              cx.fillText(y, 4, y - 2);
              cx.fillText(y, 500, y - 2);
              cx.fillText(y, 1000, y - 2);
            }

            return cv.toDataURL('image/jpeg', 0.9);
          })();
        `);

        const b64 = gridDataUrl.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFileSync(path.join(__dirname, 'kitchen_with_grid.jpg'), Buffer.from(b64, 'base64'));
        console.log('Saved scratch/kitchen_with_grid.jpg');

        // Also do living room with grid
        const livingGridDataUrl = await evalJs(`
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

            cx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
            cx.lineWidth = 1;
            cx.font = '10px sans-serif';
            cx.fillStyle = 'yellow';

            for (let x = 0; x <= 1376; x += 50) {
              cx.beginPath();
              cx.moveTo(x, 0);
              cx.lineTo(x, 768);
              cx.stroke();
              cx.fillText(x, x + 2, 12);
              cx.fillText(x, x + 2, 400);
            }

            for (let y = 0; y <= 768; y += 50) {
              cx.beginPath();
              cx.moveTo(0, y);
              cx.lineTo(1376, y);
              cx.stroke();
              cx.fillText(y, 4, y - 2);
              cx.fillText(y, 600, y - 2);
            }

            return cv.toDataURL('image/jpeg', 0.9);
          })();
        `);

        const b64Living = livingGridDataUrl.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFileSync(path.join(__dirname, 'living_with_grid.jpg'), Buffer.from(b64Living, 'base64'));
        console.log('Saved scratch/living_with_grid.jpg');

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

