const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8133;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-liv-perfect-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9233',
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

      const tabs = await getJSON('http://127.0.0.1:9233/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9233/json/new?about:blank`);

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
            const W = 1376, H = 768;

            // 1. Accent Wall Mask
            const maskAccentCv = document.createElement('canvas');
            maskAccentCv.width = W;
            maskAccentCv.height = H;
            const acx = maskAccentCv.getContext('2d');
            acx.fillStyle = '#ffffff';
            acx.fillRect(66, 26, 376, 442);
            acx.globalCompositeOperation = 'destination-out';
            acx.fillRect(214, 236, 192, 196); // TV
            acx.fillRect(260, 452, 130, 16);  // Soundbar

            // 2. Sofa Mask
            const maskSofaCv = document.createElement('canvas');
            maskSofaCv.width = W;
            maskSofaCv.height = H;
            const scx = maskSofaCv.getContext('2d');
            scx.fillStyle = '#ffffff';
            scx.beginPath();
            scx.moveTo(562, 545);
            scx.bezierCurveTo(555, 510, 565, 475, 580, 460);
            scx.bezierCurveTo(620, 440, 700, 436, 790, 436);
            scx.bezierCurveTo(890, 436, 970, 445, 1010, 470);
            scx.bezierCurveTo(1028, 490, 1028, 535, 1022, 560);
            scx.bezierCurveTo(980, 585, 930, 595, 870, 596);
            scx.bezierCurveTo(720, 596, 620, 575, 562, 545);
            scx.closePath();
            scx.fill();

            // Cutout coffee table and vase
            scx.globalCompositeOperation = 'destination-out';
            scx.fillRect(578, 536, 316, 80); // coffee table top
            scx.beginPath();
            scx.ellipse(686, 500, 32, 42, 0, 0, Math.PI * 2); // ceramic vase
            scx.fill();
            scx.beginPath();
            scx.moveTo(686, 460);
            scx.lineTo(650, 400);
            scx.lineTo(670, 380);
            scx.lineTo(740, 420);
            scx.lineTo(710, 470);
            scx.closePath();
            scx.fill();

            // Main composite
            const cv = document.createElement('canvas');
            cv.width = W;
            cv.height = H;
            const mainCx = cv.getContext('2d');
            mainCx.drawImage(img, 0, 0);

            // Blend Sofa in Navy Chenille (#182C45)
            const tintSofa = document.createElement('canvas');
            tintSofa.width = W;
            tintSofa.height = H;
            const ts = tintSofa.getContext('2d');
            ts.fillStyle = '#182C45';
            ts.fillRect(0, 0, W, H);
            ts.globalCompositeOperation = 'destination-in';
            ts.drawImage(maskSofaCv, 0, 0);

            mainCx.globalCompositeOperation = 'color';
            mainCx.drawImage(tintSofa, 0, 0);

            // Blend Accent Wall in Walnut (#5A3825)
            const tintAcc = document.createElement('canvas');
            tintAcc.width = W;
            tintAcc.height = H;
            const ta = tintAcc.getContext('2d');
            ta.fillStyle = '#5A3825';
            ta.fillRect(0, 0, W, H);
            ta.globalCompositeOperation = 'destination-in';
            ta.drawImage(maskAccentCv, 0, 0);

            mainCx.drawImage(tintAcc, 0, 0);

            return cv.toDataURL('image/jpeg', 0.92);
          })();
        `);

        const b64 = compResult.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFileSync(path.join(__dirname, 'calib_living_perfect.jpg'), Buffer.from(b64, 'base64'));
        console.log('Saved scratch/calib_living_perfect.jpg');

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

