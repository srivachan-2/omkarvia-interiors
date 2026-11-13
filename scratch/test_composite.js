const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8128;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-comp-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
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

      const tabs = await getJSON('http://127.0.0.1:9228/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9228/json/new?about:blank`);

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

        const compResult = await evalJs(`
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
            const mask = await loadImg('http://127.0.0.1:${PORT}/assets/studio/masks/kitchen-lower-cabinets.png');

            const cv = document.createElement('canvas');
            cv.width = 1376;
            cv.height = 768;
            const cx = cv.getContext('2d');

            // Draw base
            cx.drawImage(img, 0, 0);

            // Draw tinted overlay layer
            const tintCv = document.createElement('canvas');
            tintCv.width = 1376;
            tintCv.height = 768;
            const tcx = tintCv.getContext('2d');
            tcx.fillStyle = '#152A42'; // Navy
            tcx.fillRect(0, 0, 1376, 768);
            tcx.globalCompositeOperation = 'destination-in';
            tcx.drawImage(mask, 0, 0);

            // Blend onto base with 'color' blend mode (or multiply)
            cx.globalCompositeOperation = 'color';
            cx.drawImage(tintCv, 0, 0);

            return cv.toDataURL('image/jpeg', 0.92);
          })();
        `);

        const b64 = compResult.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFileSync(path.join(__dirname, 'test_composite_navy_lower.jpg'), Buffer.from(b64, 'base64'));
        console.log('Saved scratch/test_composite_navy_lower.jpg');

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

