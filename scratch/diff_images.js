const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8125;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-diff-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
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

      const tabs = await getJSON('http://127.0.0.1:9225/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) {
        tab = await getJSON(`http://127.0.0.1:9225/json/new?about:blank`);
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

      ws.onopen = async () => {
        await send('Page.enable');
        await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/scratch/inspect_coords.html` });
        await new Promise(r => setTimeout(r, 1500));

        const diffResult = await evalJs(`
          (async () => {
            function loadImg(src) {
              return new Promise(res => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => res(img);
                img.src = src;
              });
            }

            const img1 = await loadImg('http://127.0.0.1:${PORT}/assets/studio/kitchen-warm-neutral.jpg');
            const img2 = await loadImg('http://127.0.0.1:${PORT}/scratch/test_calibrated_kitchen_upper.jpg');

            const cv = document.createElement('canvas');
            cv.width = 1376;
            cv.height = 768;
            const cx = cv.getContext('2d');
            
            cx.drawImage(img1, 0, 0);
            const d1 = cx.getImageData(0, 0, 1376, 768).data;
            
            cx.clearRect(0, 0, 1376, 768);
            cx.drawImage(img2, 0, 0);
            const d2 = cx.getImageData(0, 0, 1376, 768).data;

            // Generate mask where pixels differ significantly
            const maskImg = cx.createImageData(1376, 768);
            const md = maskImg.data;
            let diffCount = 0;
            let minX = 1376, maxX = 0, minY = 768, maxY = 0;

            for (let i = 0; i < d1.length; i += 4) {
              const diff = Math.abs(d1[i] - d2[i]) + Math.abs(d1[i+1] - d2[i+1]) + Math.abs(d1[i+2] - d2[i+2]);
              const pxIdx = i / 4;
              const x = pxIdx % 1376;
              const y = Math.floor(pxIdx / 1376);

              if (diff > 25) {
                diffCount++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                md[i] = 255;
                md[i+1] = 255;
                md[i+2] = 255;
                md[i+3] = 255;
              } else {
                md[i] = 0;
                md[i+1] = 0;
                md[i+2] = 0;
                md[i+3] = 0;
              }
            }

            cx.putImageData(maskImg, 0, 0);
            const maskPng = cv.toDataURL('image/png');
            return { diffCount, minX, maxX, minY, maxY, maskPng };
          })();
        `);

        console.log('Diff stats:', {
          diffCount: diffResult.diffCount,
          bounds: [diffResult.minX, diffResult.minY, diffResult.maxX, diffResult.maxY]
        });

        const b64 = diffResult.maskPng.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(path.join(__dirname, 'extracted_kitchen_upper_diff.png'), Buffer.from(b64, 'base64'));
        console.log('Saved scratch/extracted_kitchen_upper_diff.png');

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

