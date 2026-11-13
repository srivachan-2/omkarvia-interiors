const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8132;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-liv-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9232',
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

      const tabs = await getJSON('http://127.0.0.1:9232/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9232/json/new?about:blank`);

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

            const img = await loadImg('http://127.0.0.1:${PORT}/assets/studio/living-warm-neutral.jpg');
            const maskSofa = await loadImg('http://127.0.0.1:${PORT}/assets/studio/masks/living-sofa.png');
            const maskAccent = await loadImg('http://127.0.0.1:${PORT}/assets/studio/masks/living-accent-wall.png');

            const W = 1376, H = 768;
            const cv = document.createElement('canvas');
            cv.width = W;
            cv.height = H;
            const mainCx = cv.getContext('2d');
            mainCx.drawImage(img, 0, 0);

            // Test 1: Sofa in Sage Green Velvet (#8E9F7F)
            const tintCv = document.createElement('canvas');
            tintCv.width = W;
            tintCv.height = H;
            const tcx = tintCv.getContext('2d');
            tcx.fillStyle = '#8E9F7F';
            tcx.fillRect(0, 0, W, H);
            tcx.globalCompositeOperation = 'destination-in';
            tcx.drawImage(maskSofa, 0, 0);

            mainCx.globalCompositeOperation = 'color';
            mainCx.drawImage(tintCv, 0, 0);

            // Test 2: Accent Wall in Smoked Oak (#3A3530)
            const tintAccent = document.createElement('canvas');
            tintAccent.width = W;
            tintAccent.height = H;
            const acx = tintAccent.getContext('2d');
            acx.fillStyle = '#3A3530';
            acx.fillRect(0, 0, W, H);
            acx.globalCompositeOperation = 'destination-in';
            acx.drawImage(maskAccent, 0, 0);

            mainCx.globalCompositeOperation = 'color';
            mainCx.drawImage(tintAccent, 0, 0);

            return cv.toDataURL('image/jpeg', 0.92);
          })();
        `);

        const b64 = compResult.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFileSync(path.join(__dirname, 'calib_living_preview.jpg'), Buffer.from(b64, 'base64'));
        console.log('Saved scratch/calib_living_preview.jpg');

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

