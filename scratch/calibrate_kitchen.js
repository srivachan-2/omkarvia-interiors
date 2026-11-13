const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8131;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-calib-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9231',
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

      const tabs = await getJSON('http://127.0.0.1:9231/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9231/json/new?about:blank`);

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

            const W = 1376, H = 768;
            const maskCv = document.createElement('canvas');
            maskCv.width = W;
            maskCv.height = H;
            const cx = maskCv.getContext('2d');
            cx.imageSmoothingEnabled = true;
            cx.imageSmoothingQuality = 'high';

            // 1. Perimeter Lower Cabinets (Left)
            cx.fillStyle = '#ffffff';
            cx.beginPath();
            cx.moveTo(0, 438);
            cx.lineTo(268, 438);
            cx.lineTo(268, 574);
            cx.lineTo(85, 574);
            cx.lineTo(85, 690);
            cx.lineTo(0, 690);
            cx.closePath();
            cx.fill();

            // 2. Island Lower Fluted Panel Face
            cx.beginPath();
            cx.rect(428, 452, 544, 184);
            cx.fill();

            // 3. Cut out the 3 barstools
            cx.globalCompositeOperation = 'destination-out';

            function cutStool(xCenter) {
              // Woven backrest
              const bw = 116;
              const bx = xCenter - bw / 2;
              cx.beginPath();
              cx.roundRect(bx, 444, bw, 62, [8, 8, 2, 2]);
              cx.fill();

              // Woven seat & seat frame
              const sw = 108;
              const sx = xCenter - sw / 2;
              cx.beginPath();
              cx.roundRect(sx, 506, sw, 46, [2, 2, 6, 6]);
              cx.fill();

              // Left front leg
              cx.beginPath();
              cx.moveTo(sx - 1, 552);
              cx.lineTo(sx + 16, 552);
              cx.lineTo(sx + 13, 640);
              cx.lineTo(sx - 3, 640);
              cx.closePath();
              cx.fill();

              // Right front leg
              cx.beginPath();
              cx.moveTo(sx + sw - 16, 552);
              cx.lineTo(sx + sw + 1, 552);
              cx.lineTo(sx + sw + 3, 640);
              cx.lineTo(sx + sw - 13, 640);
              cx.closePath();
              cx.fill();

              // Inner back legs
              cx.beginPath();
              cx.rect(sx + 13, 552, 13, 88);
              cx.rect(sx + sw - 26, 552, 13, 88);
              cx.fill();

              // Footrest stretcher bar
              cx.beginPath();
              cx.rect(sx - 2, 628, sw + 4, 12);
              cx.fill();
            }

            cutStool(506);
            cutStool(702);
            cutStool(898);

            // Now composite Navy color using 'color' blend mode
            const cv = document.createElement('canvas');
            cv.width = W;
            cv.height = H;
            const mainCx = cv.getContext('2d');
            mainCx.drawImage(img, 0, 0);

            const tintCv = document.createElement('canvas');
            tintCv.width = W;
            tintCv.height = H;
            const tcx = tintCv.getContext('2d');
            tcx.fillStyle = '#152A42'; // Navy
            tcx.fillRect(0, 0, W, H);
            tcx.globalCompositeOperation = 'destination-in';
            tcx.drawImage(maskCv, 0, 0);

            mainCx.globalCompositeOperation = 'color';
            mainCx.drawImage(tintCv, 0, 0);

            return cv.toDataURL('image/jpeg', 0.92);
          })();
        `);

        const b64 = compResult.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFileSync(path.join(__dirname, 'calib_navy_island.jpg'), Buffer.from(b64, 'base64'));
        console.log('Saved scratch/calib_navy_island.jpg');

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
