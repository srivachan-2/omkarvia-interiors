import os
import re

def test_files():
    print("=== Testing File Existence ===")
    masks = [
        'kitchen-upper-cabinets.png', 'kitchen-lower-cabinets.png',
        'kitchen-countertop.png', 'kitchen-backsplash.png',
        'living-accent-wall.png', 'living-sofa.png',
        'living-curtains.png', 'living-walls.png', 'living-wood.png',
        'bedroom-accent-wall.png', 'bedroom-walls.png',
        'bedroom-bed.png', 'bedroom-millwork.png'
    ]
    for m in masks:
        p = os.path.join('assets/studio/masks', m)
        assert os.path.exists(p), f"Missing mask: {p}"
        size = os.path.getsize(p)
        assert size > 0, f"Empty mask: {p}"
    print(f"All {len(masks)} masks exist and have valid file sizes.")

    rooms = ['bedroom', 'kitchen', 'living']
    presets = ['warm-neutral', 'modern-grey', 'sage-green', 'royal-blue', 'terracotta']
    for r in rooms:
        for p in presets:
            img = os.path.join('assets/studio', f"{r}-{p}.jpg")
            assert os.path.exists(img), f"Missing room preset image: {img}"
    print(f"All {len(rooms)*len(presets)} room preset images exist.")

    print("\n=== Testing HTML Elements & IDs ===")
    with open('try-it-out/index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    required_ids = [
        'studioPageView', 'studioPage', 'studioHeading',
        'roomPickerView', 'studioWorkspaceView', 'switchRoomBtn',
        'resetStudioBtn', 'currentRoomTitle', 'roomViewport',
        'compImgBefore', 'compImgAfter', 'compAfterLayer',
        'compDivider', 'customLookLabel', 'lightingSlider',
        'valLighting', 'valWallColor', 'valAccentColor',
        'valUpholstery', 'valWood', 'valTrim',
        'valKitchenUpper', 'valKitchenLower', 'valKitchenCounter',
        'valKitchenBacksplash', 'valKitchenFinish', 'valKitchenHardware',
        'valLivingWall', 'valLivingSofa', 'valLivingCurtains',
        'valLivingAccent', 'valLivingWood', 'valLivingTrim',
        'mask-kitchen-upper', 'mask-kitchen-lower', 'mask-kitchen-counter',
        'mask-kitchen-backsplash', 'mask-living-walls', 'mask-living-accent',
        'mask-living-sofa', 'mask-living-curtains', 'mask-living-wood',
        'mask-bedroom-walls', 'mask-bedroom-accent', 'mask-bedroom-bed',
        'mask-bedroom-millwork'
    ]
    for req_id in required_ids:
        assert f'id="{req_id}"' in html, f"Missing ID in try-it-out/index.html: {req_id}"
    print(f"All {len(required_ids)} required IDs verified in try-it-out/index.html.")

    # Check data-room-panel in all tabs
    for room in ['bedroom', 'kitchen', 'living']:
        assert f'data-room-panel="{room}"' in html, f"Missing room panel for {room}"

    print("\n=== Testing CSS Rules ===")
    with open('styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    assert '[hidden] {\n  display: none !important;\n}' in css or '[hidden] { display: none !important;' in css
    assert '.studio-page-section' in css
    assert '.surface-mask-layer' in css
    assert '#mask-kitchen-upper' in css
    assert '#mask-living-sofa' in css
    assert '#mask-bedroom-bed' in css

    # Verify top gap fixes: no padding-top 90px on .studio-page-section
    match = re.search(r'\.studio-page-section\s*\{([^}]+)\}', css)
    if match:
        rules = match.group(1)
        assert 'padding-top: 0' in rules or 'padding-top:0' in rules, f"Expected padding-top: 0, found: {rules}"
        print("Verified: .studio-page-section has padding-top: 0.")

    print("\n=== Testing JavaScript Syntax & Event Handlers ===")
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()

    assert 'STUDIO_DATA' in js
    assert 'selectRoom' in js
    assert 'applyPreset' in js
    assert 'setSurfaceLayer' in js
    assert 'data-surface' in js
    assert 'touchmove' in js
    assert 'touchstart' in js
    assert 'ArrowLeft' in js
    print("Verified: JavaScript contains all required room models, surface overlays, preset engines, touch listeners and keyboard navigation.")

    print("\nALL INTEGRITY TESTS PASSED!")

if __name__ == '__main__':
    test_files()

