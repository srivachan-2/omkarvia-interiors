const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8127;
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
  const userDataDir = path.join(process.env.TEMP, 'chrome-masks-profile-' + Date.now());

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
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

      const tabs = await getJSON('http://127.0.0.1:9227/json/list');
      let tab = tabs.find(t => t.type === 'page');
      if (!tab) tab = await getJSON(`http://127.0.0.1:9227/json/new?about:blank`);

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

        // Generate masks in Chrome Canvas with full 2D subpixel precision
        const result = await evalJs(`
          (async () => {
            const W = 1376, H = 768;
            const masks = {};

            function createMaskCanvas() {
              const cv = document.createElement('canvas');
              cv.width = W;
              cv.height = H;
              const cx = cv.getContext('2d');
              cx.imageSmoothingEnabled = true;
              cx.imageSmoothingQuality = 'high';
              return { cv, cx };
            }

            // -------------------------------------------------------------
            // 1. KITCHEN MASKS
            // -------------------------------------------------------------

            // --- KITCHEN UPPER CABINETS ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Main upper wall cabinet run & range hood enclosure
              // Left cabinets (x: 409 to 520, y: 140 to 330)
              // Hood enclosure (x: 520 to 668, y: 140 to 290)
              // Right upper cabinets (x: 668 to 792, y: 140 to 330)
              // Tall pantry / fridge run (x: 792 to 956, y: 140 to 488)
              cx.beginPath();
              cx.moveTo(409, 140);
              cx.lineTo(956, 140);
              cx.lineTo(956, 488);
              cx.lineTo(792, 488);
              cx.lineTo(792, 330);
              cx.lineTo(668, 330);
              cx.lineTo(668, 292); // Hood bottom
              cx.lineTo(520, 292);
              cx.lineTo(520, 330);
              cx.lineTo(409, 330);
              cx.closePath();
              cx.fill();

              // Cutout the 3 hanging pendant lights that hang in front of cabinets
              cx.globalCompositeOperation = 'destination-out';

              // Pendant 1 (left): rod x=390 (outside upper cabinet, left is at 409, so not overlapping!)
              // Pendant 2 (center): rod at x=500
              // Rod
              cx.fillRect(499, 140, 3, 90);
              // Brass fixture head
              cx.fillRect(487, 230, 26, 30);
              // Glass cylinder shade
              cx.fillRect(485, 260, 30, 68);

              // Pendant 3 (right): rod at x=610
              // Rod
              cx.fillRect(609, 140, 3, 90);
              // Brass fixture head
              cx.fillRect(597, 230, 26, 30);
              // Glass cylinder shade
              cx.fillRect(595, 260, 30, 68);

              // Right door frame mullion at x=956
              cx.fillRect(956, 140, 20, 400);

              masks['kitchen-upper-cabinets'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN LOWER CABINETS (PERIMETER & ISLAND) ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // A. Perimeter lower cabinets on left
              // From under white countertop (y=432) to kickplate (y=572), x: 85 to 368
              cx.beginPath();
              cx.moveTo(85, 432);
              cx.lineTo(368, 432);
              cx.lineTo(368, 560);
              cx.lineTo(415, 560);
              cx.lineTo(415, 580);
              cx.lineTo(85, 574);
              cx.closePath();
              cx.fill();

              // B. Island lower fluted front face
              // Bounds:
              // Top: y = 448 (under marble overhang)
              // Bottom: y = 636 (kickplate / floor line)
              // Left: x = 428 (inside edge of left waterfall marble)
              // Right: x = 972 (inside edge of right waterfall marble)
              cx.beginPath();
              cx.rect(428, 448, 544, 188);
              cx.fill();

              // C. Cut out the 3 barstools sitting in front of the island
              cx.globalCompositeOperation = 'destination-out';

              function cutStool(xCenter) {
                // Backrest (woven wicker/cord rectangle with rounded corners)
                const bw = 114;
                const bx = xCenter - bw / 2;
                cx.beginPath();
                cx.roundRect(bx, 444, bw, 62, [6, 6, 2, 2]);
                cx.fill();

                // Seat cushion / frame
                const sw = 104;
                const sx = xCenter - sw / 2;
                cx.beginPath();
                cx.roundRect(sx, 506, sw, 44, [2, 2, 6, 6]);
                cx.fill();

                // Left front leg
                cx.beginPath();
                cx.moveTo(sx + 2, 548);
                cx.lineTo(sx + 18, 548);
                cx.lineTo(sx + 15, 640);
                cx.lineTo(sx - 1, 640);
                cx.closePath();
                cx.fill();

                // Right front leg
                cx.beginPath();
                cx.moveTo(sx + sw - 18, 548);
                cx.lineTo(sx + sw - 2, 548);
                cx.lineTo(sx + sw + 1, 640);
                cx.lineTo(sx + sw - 15, 640);
                cx.closePath();
                cx.fill();

                // Left back leg (visible inside)
                cx.beginPath();
                cx.rect(sx + 14, 548, 12, 92);
                cx.fill();

                // Right back leg (visible inside)
                cx.beginPath();
                cx.rect(sx + sw - 26, 548, 12, 92);
                cx.fill();

                // Footrest stretcher bar
                cx.beginPath();
                cx.rect(sx, 630, sw, 10);
                cx.fill();
              }

              // Stool 1 (left): center at x = 492
              cutStool(492);
              // Stool 2 (middle): center at x = 694
              cutStool(694);
              // Stool 3 (right): center at x = 896
              cutStool(896);

              masks['kitchen-lower-cabinets'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN COUNTERTOP ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Perimeter countertop slab
              cx.beginPath();
              cx.moveTo(85, 398);
              cx.lineTo(370, 398);
              cx.lineTo(370, 432);
              cx.lineTo(85, 432);
              cx.closePath();
              cx.fill();

              // Island countertop slab (top slab & waterfall sides)
              // Top slab
              cx.beginPath();
              cx.rect(394, 420, 612, 28);
              cx.fill();

              // Left waterfall edge
              cx.beginPath();
              cx.moveTo(394, 420);
              cx.lineTo(428, 448);
              cx.lineTo(428, 676);
              cx.lineTo(394, 676);
              cx.closePath();
              cx.fill();

              // Right waterfall edge
              cx.beginPath();
              cx.moveTo(972, 448);
              cx.lineTo(1006, 420);
              cx.lineTo(1006, 676);
              cx.lineTo(972, 676);
              cx.closePath();
              cx.fill();

              masks['kitchen-countertop'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN BACKSPLASH ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Marble slab backsplash behind range & prep area
              cx.beginPath();
              cx.moveTo(360, 330);
              cx.lineTo(520, 330);
              cx.lineTo(520, 292); // up to range hood underside
              cx.lineTo(668, 292);
              cx.lineTo(668, 330);
              cx.lineTo(792, 330);
              cx.lineTo(792, 432);
              cx.lineTo(360, 432);
              cx.closePath();
              cx.fill();

              // Cutout stove grates & condiments
              cx.globalCompositeOperation = 'destination-out';
              cx.fillRect(495, 370, 190, 65); // cooktop / burners / knobs

              masks['kitchen-backsplash'] = cv.toDataURL('image/png');
            }

            // --- KITCHEN HARDWARE ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Tall pantry long vertical handles (x: 852 and 860, y: 320 to 420)
              cx.fillRect(853, 318, 3, 110);
              cx.fillRect(861, 318, 3, 110);

              // Perimeter drawer handles
              cx.fillRect(115, 452, 25, 4);
              cx.fillRect(115, 492, 25, 4);
              cx.fillRect(115, 532, 25, 4);

              cx.fillRect(205, 452, 25, 4);
              cx.fillRect(205, 492, 25, 4);
              cx.fillRect(205, 532, 25, 4);

              // Sink faucet
              cx.fillRect(160, 350, 16, 50);

              masks['kitchen-hardware'] = cv.toDataURL('image/png');
            }


            // -------------------------------------------------------------
            // 2. LIVING ROOM MASKS
            // -------------------------------------------------------------

            // --- LIVING ACCENT WALL (Fluted Wood Media Wall) ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Media wall bounding box
              cx.beginPath();
              cx.rect(66, 26, 376, 442);
              cx.fill();

              // Cutout the Samsung Frame TV
              cx.globalCompositeOperation = 'destination-out';
              // Outer black TV frame & display: x from 214 to 406, y from 236 to 432
              cx.fillRect(214, 236, 192, 196);

              masks['living-accent-wall'] = cv.toDataURL('image/png');
            }

            // --- LIVING SOFA (Curved Bouclé Sofa) ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Exact organic contour of the curved sofa
              cx.beginPath();
              // Left armrest base
              cx.moveTo(562, 545);
              // Left armrest curving up
              cx.bezierCurveTo(555, 510, 565, 475, 580, 460);
              // Crest of backrest towards center
              cx.bezierCurveTo(620, 440, 700, 436, 790, 436);
              // Crest towards right armrest
              cx.bezierCurveTo(890, 436, 970, 445, 1010, 470);
              // Right armrest curving down
              cx.bezierCurveTo(1028, 490, 1028, 535, 1022, 560);
              // Bottom right edge on rug
              cx.bezierCurveTo(980, 585, 930, 595, 870, 596);
              // Bottom left edge towards base
              cx.bezierCurveTo(720, 596, 620, 575, 562, 545);
              cx.closePath();
              cx.fill();

              // Cutout foreground coffee table, vase, branches, and books
              cx.globalCompositeOperation = 'destination-out';

              // Coffee table top slab: x from 578 to 894, y from 534 to 625
              cx.beginPath();
              cx.moveTo(578, 540);
              cx.lineTo(894, 540);
              cx.lineTo(894, 610);
              cx.lineTo(578, 610);
              cx.closePath();
              cx.fill();

              // Ceramic vase & botanical eucalyptus branches (x ~ 620 to 760, y ~ 380 to 540)
              cx.beginPath();
              cx.ellipse(686, 500, 36, 42, 0, 0, Math.PI * 2);
              cx.fill();
              // Branches stem & foliage
              cx.beginPath();
              cx.moveTo(680, 460);
              cx.lineTo(650, 400);
              cx.lineTo(670, 380);
              cx.lineTo(740, 420);
              cx.lineTo(710, 470);
              cx.closePath();
              cx.fill();

              masks['living-sofa'] = cv.toDataURL('image/png');
            }

            // --- LIVING CURTAINS (Drapery Only - NO Window, NO Trees!) ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Left sheer drapes: from media wall (x: 448) to window left reveal (x: 618)
              // Top: y = 125, Bottom: y = 550
              cx.beginPath();
              cx.rect(448, 125, 170, 425);
              cx.fill();

              // Right sheer drapes: from window right reveal (x: 982) to right wall (x: 1160)
              // Top: y = 125, Bottom: y = 550
              cx.beginPath();
              cx.rect(982, 125, 178, 425);
              cx.fill();

              // Cutout sofa backrest overlap on left drapes
              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.moveTo(562, 545);
              cx.bezierCurveTo(555, 510, 565, 475, 580, 460);
              cx.lineTo(618, 460);
              cx.lineTo(618, 550);
              cx.lineTo(562, 550);
              cx.closePath();
              cx.fill();

              // Cutout potted plants and armchairs on right drapes
              cx.beginPath();
              cx.rect(982, 450, 178, 100);
              cx.fill();

              masks['living-curtains'] = cv.toDataURL('image/png');
            }

            // --- LIVING WALLS (Architectural Wall Surfaces Only - NO Ceiling, NO Window!) ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Wall alcove behind floor lamp (between media wall and left curtains)
              cx.beginPath();
              cx.rect(442, 125, 16, 375);
              cx.fill();

              // Upper wall header above window (between ceiling cove y=125 and window top y=152)
              cx.beginPath();
              cx.rect(442, 125, 718, 27);
              cx.fill();

              // Right side alcove wall (to the right of curtains)
              cx.beginPath();
              cx.rect(1160, 125, 120, 360);
              cx.fill();

              masks['living-walls'] = cv.toDataURL('image/png');
            }

            // --- LIVING WOOD (TV Credenza & Coffee Table) ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              // Floating TV credenza under media wall
              cx.beginPath();
              cx.rect(66, 468, 420, 216);
              cx.fill();

              // Coffee table
              cx.beginPath();
              cx.moveTo(578, 540);
              cx.lineTo(894, 540);
              cx.lineTo(894, 625);
              cx.lineTo(578, 625);
              cx.closePath();
              cx.fill();

              // Coffee table base
              cx.beginPath();
              cx.moveTo(645, 625);
              cx.lineTo(830, 625);
              cx.lineTo(830, 748);
              cx.lineTo(645, 748);
              cx.closePath();
              cx.fill();

              // Cutout vase, bowl, books on table
              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.ellipse(686, 500, 36, 42, 0, 0, Math.PI * 2);
              cx.fill();

              masks['living-wood'] = cv.toDataURL('image/png');
            }

            // --- LIVING COFFEE TABLE (Separate coffee table mask) ---
            {
              const { cv, cx } = createMaskCanvas();
              cx.fillStyle = '#ffffff';

              cx.beginPath();
              cx.rect(578, 540, 316, 85);
              cx.rect(645, 625, 185, 123);
              cx.fill();

              cx.globalCompositeOperation = 'destination-out';
              cx.beginPath();
              cx.ellipse(686, 500, 36, 42, 0, 0, Math.PI * 2);
              cx.fill();

              masks['living-coffee-table'] = cv.toDataURL('image/png');
            }

            return masks;
          })();
        `);

        console.log('Generated masks:', Object.keys(result));

        // Save each mask to assets/studio/masks/
        for (const [maskName, dataUrl] of Object.entries(result)) {
          const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
          const outPath = path.join(ROOT_DIR, 'assets', 'studio', 'masks', `${maskName}.png`);
          fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
          console.log(`Saved mask: assets/studio/masks/${maskName}.png`);
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

