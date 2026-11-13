const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8134;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-final-masks-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9234',
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

      const tabs = await getJSON('http://127.0.0.1:9234/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9234/json/new?about:blank`);

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

        const result = await evalJs(`
          (async () => {
            const W = 1376, H = 768;
            const masks = {};

            function createMask() {
              const cv = document.createElement('canvas');
              cv.width = W;
              cv.height = H;
              const cx = cv.getContext('2d');
              cx.imageSmoothingEnabled = true;
              cx.imageSmoothingQuality = 'high';
              return { cv, cx };
            }

            // =========================================================================
            // 1. KITCHEN PRECISION MASKS
            // =========================================================================

            // --- KITCHEN UPPER CABINETS ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Main upper wall cabinet run & tall pantry:
              // Left cabinets: x = 409 to 520, y = 140 to 330
              // Hood enclosure: x = 520 to 668, y = 140 to 292
              // Right upper cabinets: x = 668 to 792, y = 140 to 330
              // Tall pantry / integrated fridge: x = 792 to 956, y = 140 to 490
              cx.beginPath();
              cx.moveTo(409, 140);
              cx.lineTo(956, 140);
              cx.lineTo(956, 490);
              cx.lineTo(792, 490);
              cx.lineTo(792, 330);
              cx.lineTo(668, 330);
              cx.lineTo(668, 292); // Hood bottom opening
              cx.lineTo(520, 292);
              cx.lineTo(520, 330);
              cx.lineTo(409, 330);
              cx.closePath();
              cx.fill();

              // Cutout the hanging pendant lamps
              cx.globalCompositeOperation = 'destination-out';

              function cutPendant(xCenter) {
                // Brass rod
                cx.fillRect(xCenter - 2, 140, 4, 90);
                // Brass socket / body
                cx.beginPath();
                cx.roundRect(xCenter - 12, 230, 24, 30, 2);
                cx.fill();
                // Fluted glass cylinder shade
                cx.beginPath();
                cx.roundRect(xCenter - 15, 260, 30, 68, [2, 2, 4, 4]);
                cx.fill();
              }

              cutPendant(500); // Center pendant
              cutPendant(610); // Right pendant (Left pendant at 390 is outside cabinet run)

              masks['kitchen-upper-cabinets'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN LOWER CABINETS (Perimeter & Island Fluted Panels) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // A. Perimeter lower cabinets on left
              // Front drawers facing camera: x = 0 to 268, y = 438 to 574 (and lowest drawer down to 690)
              cx.beginPath();
              cx.moveTo(0, 438);
              cx.lineTo(268, 438);
              cx.lineTo(268, 574);
              cx.lineTo(85, 574);
              cx.lineTo(85, 690);
              cx.lineTo(0, 690);
              cx.closePath();
              cx.fill();

              // B. Island front fluted panel face
              // Bounded under countertop overhang: y = 452
              // Toe-kick / floor shadow line: y = 636
              // Left inner waterfall edge: x = 428
              // Right inner waterfall edge: x = 972
              cx.beginPath();
              cx.rect(428, 452, 544, 184);
              cx.fill();

              // C. Cut out the 3 barstools sitting in front of the island
              cx.globalCompositeOperation = 'destination-out';

              function cutStool(xCenter) {
                // Woven backrest: 116px wide, y from 444 to 506
                const bw = 116;
                const bx = xCenter - bw / 2;
                cx.beginPath();
                cx.roundRect(bx, 444, bw, 62, [8, 8, 2, 2]);
                cx.fill();

                // Woven seat cushion & frame: 108px wide, y from 506 to 552
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

              // Stool 1 (left): center at x = 506
              cutStool(506);
              // Stool 2 (middle): center at x = 702
              cutStool(702);
              // Stool 3 (right): center at x = 898
              cutStool(898);

              masks['kitchen-lower-cabinets'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN COUNTERTOP ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Perimeter countertop slab: x = 0 to 370, y = 398 to 438
              cx.beginPath();
              cx.rect(0, 398, 370, 40);
              cx.fill();

              // Island marble countertop
              // Top slab: x = 394 to 1006, y = 420 to 452
              cx.beginPath();
              cx.rect(394, 420, 612, 32);
              cx.fill();

              // Left waterfall edge: x = 394 to 428, y = 420 to 676
              cx.beginPath();
              cx.moveTo(394, 420);
              cx.lineTo(428, 452);
              cx.lineTo(428, 676);
              cx.lineTo(394, 676);
              cx.closePath();
              cx.fill();

              // Right waterfall edge: x = 972 to 1006, y = 420 to 676
              cx.beginPath();
              cx.moveTo(972, 452);
              cx.lineTo(1006, 420);
              cx.lineTo(1006, 676);
              cx.lineTo(972, 676);
              cx.closePath();
              cx.fill();

              masks['kitchen-countertop'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN BACKSPLASH ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Marble slab backsplash
              cx.beginPath();
              cx.moveTo(0, 330);
              cx.lineTo(520, 330);
              cx.lineTo(520, 292); // under hood
              cx.lineTo(668, 292);
              cx.lineTo(668, 330);
              cx.lineTo(792, 330);
              cx.lineTo(792, 438);
              cx.lineTo(0, 438);
              cx.closePath();
              cx.fill();

              // Cutout cooktop grates & sink faucet
              cx.globalCompositeOperation = 'destination-out';
              cx.fillRect(515, 380, 150, 58); // cooktop / knobs
              cx.fillRect(158, 350, 18, 50);  // faucet

              masks['kitchen-backsplash'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN HARDWARE ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Tall pantry long vertical brass pulls: x: 853, 861, y: 318 to 428
              cx.fillRect(853, 318, 3, 110);
              cx.fillRect(861, 318, 3, 110);

              // Perimeter drawer handles
              cx.fillRect(115, 456, 26, 4);
              cx.fillRect(115, 496, 26, 4);
              cx.fillRect(115, 536, 26, 4);

              cx.fillRect(205, 456, 26, 4);
              cx.fillRect(205, 496, 26, 4);
              cx.fillRect(205, 536, 26, 4);

              // Brass sink faucet
              cx.fillRect(158, 350, 18, 50);

              masks['kitchen-hardware'] = cv.toDataURL('image/png');
            }


            // =========================================================================
            // 2. LIVING ROOM PRECISION MASKS
            // =========================================================================

            // --- LIVING ACCENT WALL (Fluted Wood Media Wall) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Fluted timber media wall: x = 66 to 442, y = 26 to 468
              cx.beginPath();
              cx.rect(66, 26, 376, 442);
              cx.fill();

              // Cutout Samsung Frame TV and soundbar
              cx.globalCompositeOperation = 'destination-out';
              // Samsung Frame TV: x = 214 to 406, y = 236 to 432
              cx.fillRect(214, 236, 192, 196);
              // Soundbar
              cx.fillRect(260, 452, 130, 16);

              masks['living-accent-wall'] = cv.toDataURL('image/png');
            }

            // --- LIVING SOFA (Curved Bouclé Sofa) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Smooth organic outline of curved sofa
              cx.beginPath();
              cx.moveTo(562, 545);
              cx.bezierCurveTo(555, 510, 565, 475, 580, 460);
              cx.bezierCurveTo(620, 440, 700, 436, 790, 436);
              cx.bezierCurveTo(890, 436, 970, 445, 1010, 470);
              cx.bezierCurveTo(1028, 490, 1028, 535, 1022, 560);
              cx.bezierCurveTo(980, 585, 930, 595, 870, 596);
              cx.bezierCurveTo(720, 596, 620, 575, 562, 545);
              cx.closePath();
              cx.fill();

              // Cutout coffee table and vase with branches
              cx.globalCompositeOperation = 'destination-out';

              // Coffee table top slab
              cx.fillRect(578, 536, 316, 80);

              // Ceramic vase & branches
              cx.beginPath();
              cx.ellipse(686, 500, 32, 42, 0, 0, Math.PI * 2);
              cx.fill();
              cx.beginPath();
              cx.moveTo(686, 460);
              cx.lineTo(650, 400);
              cx.lineTo(670, 380);
              cx.lineTo(740, 420);
              cx.lineTo(710, 470);
              cx.closePath();
              cx.fill();

              masks['living-sofa'] = cv.toDataURL('image/png');
            }

            // --- LIVING CURTAINS (Drapery Folds Only - NO Window, NO Trees!) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Left sheer drapes: x = 448 to 760, y = 140 to 560
              cx.beginPath();
              cx.rect(448, 140, 312, 420);
              cx.fill();

              // Right sheer drapes: x = 980 to 1180, y = 140 to 560
              cx.beginPath();
              cx.rect(980, 140, 200, 420);
              cx.fill();

              // Cutout sofa backrest overlap on left drape
              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.moveTo(562, 545);
              cx.bezierCurveTo(555, 510, 565, 475, 580, 460);
              cx.lineTo(760, 460);
              cx.lineTo(760, 560);
              cx.lineTo(562, 560);
              cx.closePath();
              cx.fill();

              masks['living-curtains'] = cv.toDataURL('image/png');
            }

            // --- LIVING WALLS (Architectural Walls - NO Ceiling, NO Window!) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Left wall alcove behind floor lamp: x = 442 to 452, y = 140 to 480
              cx.beginPath();
              cx.rect(442, 140, 10, 340);
              cx.fill();

              // Right wall alcove: x = 1180 to 1280, y = 140 to 480
              cx.beginPath();
              cx.rect(1180, 140, 100, 340);
              cx.fill();

              masks['living-walls'] = cv.toDataURL('image/png');
            }

            // --- LIVING WOOD (TV Credenza & Coffee Table) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Floating TV credenza under media wall: x = 66 to 486, y = 468 to 685
              cx.beginPath();
              cx.rect(66, 468, 420, 217);
              cx.fill();

              // Coffee table: x = 578 to 894, y = 536 to 748
              cx.beginPath();
              cx.rect(578, 536, 316, 212);
              cx.fill();

              // Cutout vase, bowl, books
              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.ellipse(686, 500, 32, 42, 0, 0, Math.PI * 2);
              cx.fill();

              masks['living-wood'] = cv.toDataURL('image/png');
            }

            // --- LIVING COFFEE TABLE ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              cx.beginPath();
              cx.rect(578, 536, 316, 212);
              cx.fill();

              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.ellipse(686, 500, 32, 42, 0, 0, Math.PI * 2);
              cx.fill();

              masks['living-coffee-table'] = cv.toDataURL('image/png');
            }

            return masks;
          })();
        `);

        for (const [maskName, dataUrl] of Object.entries(result)) {
          const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
          const outPath = path.join(ROOT_DIR, 'assets', 'studio', 'masks', `${maskName}.png`);
          fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
          console.log(`Saved final precision mask: assets/studio/masks/${maskName}.png`);
        }

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
