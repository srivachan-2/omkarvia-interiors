const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8130;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-pmasks-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9230',
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

      const tabs = await getJSON('http://127.0.0.1:9230/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9230/json/new?about:blank`);

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
            // 1. KITCHEN MASKS (Calibrated to kitchen-warm-neutral.jpg)
            // =========================================================================

            // --- KITCHEN UPPER CABINETS ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Main upper wall cabinet run:
              // Left cabinets: x = 296 to 378, y = 140 to 330
              // Range hood enclosure: x = 378 to 486, y = 140 to 292
              // Right upper cabinets: x = 486 to 576, y = 140 to 330
              // Tall pantry / fridge cabinet: x = 576 to 694, y = 140 to 490
              cx.beginPath();
              cx.moveTo(296, 140);
              cx.lineTo(694, 140);
              cx.lineTo(694, 490);
              cx.lineTo(576, 490);
              cx.lineTo(576, 330);
              cx.lineTo(486, 330);
              cx.lineTo(486, 292); // Hood bottom opening
              cx.lineTo(378, 292);
              cx.lineTo(378, 330);
              cx.lineTo(296, 330);
              cx.closePath();
              cx.fill();

              // Cutout the 3 hanging pendant lights
              cx.globalCompositeOperation = 'destination-out';

              function cutPendant(xCenter) {
                // Brass rod
                cx.fillRect(xCenter - 2, 140, 4, 38);
                // Brass fixture socket / body
                cx.beginPath();
                cx.roundRect(xCenter - 11, 178, 22, 28, 2);
                cx.fill();
                // Fluted glass cylinder shade
                cx.beginPath();
                cx.roundRect(xCenter - 15, 206, 30, 56, [2, 2, 4, 4]);
                cx.fill();
              }

              // Pendant 1 (left): center at x = 390
              cutPendant(390);
              // Pendant 2 (middle): center at x = 500
              cutPendant(500);
              // Pendant 3 (right): center at x = 610
              cutPendant(610);

              masks['kitchen-upper-cabinets'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN LOWER CABINETS (Perimeter & Island Fluting) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // A. Perimeter lower cabinets on left
              // From x = 0 to 266, y = 432 to 574 (and down to 720 on far left)
              cx.beginPath();
              cx.moveTo(0, 432);
              cx.lineTo(266, 432);
              cx.lineTo(266, 550);
              cx.lineTo(296, 550);
              cx.lineTo(296, 580);
              cx.lineTo(62, 720);
              cx.lineTo(0, 720);
              cx.closePath();
              cx.fill();

              // B. Island front fluted wood panel
              // Bounded under countertop overhang: y = 448
              // Toe-kick / floor shadow line: y = 636
              // Left inner waterfall edge: x = 308
              // Right inner waterfall edge: x = 708
              cx.beginPath();
              cx.rect(308, 448, 400, 188);
              cx.fill();

              // C. Cut out the 3 barstools in front of the island
              cx.globalCompositeOperation = 'destination-out';

              function cutStool(xCenter) {
                // Woven backrest (curved woven panel)
                const bw = 84;
                const bx = xCenter - bw / 2;
                cx.beginPath();
                cx.roundRect(bx, 445, bw, 55, [6, 6, 2, 2]);
                cx.fill();

                // Woven seat cushion & seat frame
                const sw = 76;
                const sx = xCenter - sw / 2;
                cx.beginPath();
                cx.roundRect(sx, 500, sw, 44, [2, 2, 4, 4]);
                cx.fill();

                // Left front leg
                cx.beginPath();
                cx.moveTo(sx + 1, 544);
                cx.lineTo(sx + 15, 544);
                cx.lineTo(sx + 13, 638);
                cx.lineTo(sx - 1, 638);
                cx.closePath();
                cx.fill();

                // Right front leg
                cx.beginPath();
                cx.moveTo(sx + sw - 15, 544);
                cx.lineTo(sx + sw - 1, 544);
                cx.lineTo(sx + sw + 1, 638);
                cx.lineTo(sx + sw - 13, 638);
                cx.closePath();
                cx.fill();

                // Inner rear legs visible inside
                cx.beginPath();
                cx.rect(sx + 12, 544, 10, 94);
                cx.rect(sx + sw - 22, 544, 10, 94);
                cx.fill();

                // Horizontal footrest stretcher bar
                cx.beginPath();
                cx.rect(sx, 630, sw, 10);
                cx.fill();
              }

              // Stool 1 (left): center at x = 362
              cutStool(362);
              // Stool 2 (middle): center at x = 508
              cutStool(508);
              // Stool 3 (right): center at x = 654
              cutStool(654);

              masks['kitchen-lower-cabinets'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN COUNTERTOP ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Perimeter countertop slab: x = 0 to 266, y = 396 to 432
              cx.beginPath();
              cx.rect(0, 396, 268, 36);
              cx.fill();

              // Island countertop slab (top slab & waterfall sides)
              // Top slab: x = 288 to 732, y = 420 to 448
              cx.beginPath();
              cx.rect(288, 420, 444, 28);
              cx.fill();

              // Left waterfall edge: x = 288 to 308, y = 420 to 676
              cx.beginPath();
              cx.moveTo(288, 420);
              cx.lineTo(308, 448);
              cx.lineTo(308, 676);
              cx.lineTo(288, 676);
              cx.closePath();
              cx.fill();

              // Right waterfall edge: x = 708 to 732, y = 420 to 676
              cx.beginPath();
              cx.moveTo(708, 448);
              cx.lineTo(732, 420);
              cx.lineTo(732, 676);
              cx.lineTo(708, 676);
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
              cx.lineTo(378, 330);
              cx.lineTo(378, 292); // under hood
              cx.lineTo(486, 292);
              cx.lineTo(486, 330);
              cx.lineTo(576, 330);
              cx.lineTo(576, 420);
              cx.lineTo(0, 420);
              cx.closePath();
              cx.fill();

              // Cutout cooktop burners & appliances
              cx.globalCompositeOperation = 'destination-out';
              cx.fillRect(378, 385, 110, 45); // cooktop knobs/grate
              cx.fillRect(150, 350, 16, 50); // faucet

              masks['kitchen-backsplash'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN HARDWARE ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Tall pantry long vertical brass handles (x: 620, 626, y: 320 to 420)
              cx.fillRect(620, 320, 3, 100);
              cx.fillRect(626, 320, 3, 100);

              // Perimeter drawer handles
              cx.fillRect(80, 452, 20, 4);
              cx.fillRect(80, 492, 20, 4);
              cx.fillRect(80, 532, 20, 4);

              // Faucet
              cx.fillRect(150, 350, 16, 50);

              masks['kitchen-hardware'] = cv.toDataURL('image/png');
            }


            // =========================================================================
            // 2. LIVING ROOM MASKS (Calibrated to living-warm-neutral.jpg)
            // =========================================================================

            // --- LIVING ACCENT WALL (Fluted Wood Media Wall) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Fluted timber media wall: x = 48 to 324, y = 20 to 568
              cx.beginPath();
              cx.rect(48, 20, 276, 548);
              cx.fill();

              // Cutout Samsung Frame TV and console
              cx.globalCompositeOperation = 'destination-out';
              // Samsung Frame TV: x = 156 to 296, y = 270 to 480
              cx.fillRect(156, 270, 140, 210);
              // Soundbar
              cx.fillRect(188, 512, 94, 20);
              // Floating console top
              cx.fillRect(48, 498, 276, 70);

              masks['living-accent-wall'] = cv.toDataURL('image/png');
            }

            // --- LIVING SOFA (Curved Bouclé Sofa) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Curved bouclé sofa in center
              // Left armrest: (410, 580)
              // Crest of backrest: (430, 500) -> (518, 460) -> (600, 462) -> (670, 470)
              // Right armrest: (744, 490) -> (748, 580) -> (744, 610)
              // Base: (730, 650) -> (518, 654) -> (410, 580)
              cx.beginPath();
              cx.moveTo(410, 580);
              cx.bezierCurveTo(405, 540, 412, 495, 430, 475);
              cx.bezierCurveTo(460, 455, 520, 450, 580, 452);
              cx.bezierCurveTo(640, 454, 700, 462, 735, 482);
              cx.bezierCurveTo(752, 505, 752, 545, 746, 580);
              cx.bezierCurveTo(738, 615, 715, 645, 670, 652);
              cx.bezierCurveTo(580, 656, 480, 650, 425, 620);
              cx.bezierCurveTo(415, 610, 410, 595, 410, 580);
              cx.closePath();
              cx.fill();

              // Cutout coffee table and vase/branches
              cx.globalCompositeOperation = 'destination-out';

              // Coffee table top slab: x = 422 to 654, y = 626 to 680
              cx.beginPath();
              cx.rect(422, 626, 232, 60);
              cx.fill();

              // Ceramic vase and botanical foliage in center
              cx.beginPath();
              cx.ellipse(518, 530, 26, 32, 0, 0, Math.PI * 2);
              cx.fill();
              // Foliage
              cx.beginPath();
              cx.moveTo(518, 500);
              cx.lineTo(470, 430);
              cx.lineTo(520, 390);
              cx.lineTo(570, 430);
              cx.lineTo(530, 500);
              cx.closePath();
              cx.fill();

              masks['living-sofa'] = cv.toDataURL('image/png');
            }

            // --- LIVING CURTAINS (Drapery Folds Only - NO Window, NO Trees!) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Left sheer drapes: x = 390 to 556, y = 160 to 560
              cx.beginPath();
              cx.rect(390, 160, 166, 400);
              cx.fill();

              // Right sheer drapes: x = 720 to 864, y = 160 to 560
              cx.beginPath();
              cx.rect(720, 160, 144, 400);
              cx.fill();

              // Cutout sofa overlap on left drape
              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.moveTo(410, 580);
              cx.bezierCurveTo(405, 540, 412, 495, 430, 475);
              cx.lineTo(556, 475);
              cx.lineTo(556, 560);
              cx.lineTo(410, 560);
              cx.closePath();
              cx.fill();

              masks['living-curtains'] = cv.toDataURL('image/png');
            }

            // --- LIVING WALLS (Architectural Walls - NO Ceiling, NO Window!) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Wall alcove behind floor lamp: x = 324 to 390, y = 160 to 520
              cx.beginPath();
              cx.rect(324, 160, 66, 360);
              cx.fill();

              // Header band above drapes: x = 324 to 864, y = 160 to 182
              cx.beginPath();
              cx.rect(324, 160, 540, 22);
              cx.fill();

              // Right wall alcove: x = 864 to 960, y = 160 to 520
              cx.beginPath();
              cx.rect(864, 160, 96, 360);
              cx.fill();

              masks['living-walls'] = cv.toDataURL('image/png');
            }

            // --- LIVING WOOD (TV Credenza & Coffee Table) ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              // Floating TV credenza under media wall: x = 48 to 354, y = 500 to 710
              cx.beginPath();
              cx.rect(48, 500, 306, 210);
              cx.fill();

              // Coffee table: x = 422 to 654, y = 626 to 768
              cx.beginPath();
              cx.rect(422, 626, 232, 142);
              cx.fill();

              // Cutout vase, bowl, books
              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.ellipse(518, 530, 26, 32, 0, 0, Math.PI * 2);
              cx.fill();

              masks['living-wood'] = cv.toDataURL('image/png');
            }

            // --- LIVING COFFEE TABLE ---
            {
              const { cv, cx } = createMask();
              cx.fillStyle = '#ffffff';

              cx.beginPath();
              cx.rect(422, 626, 232, 142);
              cx.fill();

              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.ellipse(518, 530, 26, 32, 0, 0, Math.PI * 2);
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
          console.log(`Updated precision mask: assets/studio/masks/${maskName}.png`);
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

