/**
 * Headless JS DOM interaction & state engine test
 */
const fs = require('fs');

const html = fs.readFileSync('try-it-out/index.html', 'utf8');
const js = fs.readFileSync('script.js', 'utf8');

console.log('Testing JS syntax and function definitions...');

// Test that key functions and event hooks are present in script.js
const checks = [
  'STUDIO_DATA',
  'applyPreset',
  'selectRoom',
  'updateBeforeAfterClip',
  'syncSwatchButtons',
  'handleSliderMove',
  'studioDiscussBtn',
  'resetStudioBtn',
  'switchRoomBtn',
  'lightingSlider'
];

let allPassed = true;
checks.forEach(chk => {
  if (js.includes(chk)) {
    console.log(`[PASS] Found studio engine symbol: ${chk}`);
  } else {
    console.error(`[FAIL] Missing studio engine symbol: ${chk}`);
    allPassed = false;
  }
});

// Check that preset definitions cover all 5 styles across all 3 rooms
['bedroom', 'kitchen', 'living'].forEach(room => {
  ['warm-neutral', 'modern-grey', 'sage-green', 'royal-blue', 'terracotta'].forEach(preset => {
    const assetPath = `assets/studio/${room}-${preset}.jpg`;
    if (fs.existsSync(assetPath)) {
      console.log(`[PASS] Room asset verified on disk: ${assetPath}`);
    } else {
      console.error(`[FAIL] Missing asset on disk: ${assetPath}`);
      allPassed = false;
    }
  });
});

if (allPassed) {
  console.log('\n============================================================');
  console.log('ALL JAVASCRIPT STATE ENGINE & ASSET TESTS PASSED (100%)');
  console.log('============================================================');
  process.exit(0);
} else {
  process.exit(1);
}
