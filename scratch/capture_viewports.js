const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(process.env.TEMP, 'chrome-vp-profile-' + Date.now());

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--user-data-dir=' + userDataDir
]);

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

setTimeout(async () => {
  try {
    const tabs = await getJSON('http://127.0.0.1:9222/json/list');
    let tab = tabs.find(t => t.type === 'page');
    if (!tab) {
      tab = await getJSON('http://127.0.0.1:9222/json/new?http://localhost:8080/%23home');
    }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let id = 1;
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
        const curId = id++;
        callbacks.set(curId, resolve);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    ws.onopen = async () => {
      await send('Page.enable');
      await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: 'http://localhost:8080/#home' });
      await new Promise(r => setTimeout(r, 2000));

      const viewports = [
        { name: 'desktop_1440', w: 1440, h: 900, m: false },
        { name: 'tablet_1024', w: 1024, h: 768, m: false },
        { name: 'tablet_768', w: 768, h: 1024, m: false },
        { name: 'mobile_390', w: 390, h: 844, m: true }
      ];

      for (const vp of viewports) {
        await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.m });
        await new Promise(r => setTimeout(r, 600));
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(__dirname, `view_${vp.name}.png`), Buffer.from(shot.result.data, 'base64'));
        console.log(`Saved scratch/view_${vp.name}.png`);
      }

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
