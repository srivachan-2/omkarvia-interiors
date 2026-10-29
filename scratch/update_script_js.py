import re

with open('script.js', 'r', encoding='utf-8') as f:
    code = f.read()

new_studio_engine = '''  // ==========================================================================
  // 16. TRY IT OUT STUDIO CONFIGURATOR ENGINE & SLIDER LOGIC
  // ==========================================================================
  const STUDIO_DATA = {
    bedroom: {
      name: 'Master Bedroom',
      service: 'Bedroom Interior Design',
      upholsteryLabel: 'Bed Upholstery',
      woodLabel: 'Wardrobe / Millwork Finish',
      presets: {
        'warm-neutral': {
          name: 'Warm Neutral',
          desc: 'Ivory & Natural Oak',
          image: SITE_BASE + 'assets/studio/bedroom-warm-neutral.jpg',
          wall: 'Warm Ivory',
          accent: 'Natural Oak',
          upholstery: 'Cream Bouclé',
          wood: 'Natural Oak',
          trim: 'Brushed Brass',
          surfaces: {}
        },
        'modern-grey': {
          name: 'Modern Grey',
          desc: 'Greige & Smoked Wood',
          image: SITE_BASE + 'assets/studio/bedroom-modern-grey.jpg',
          wall: 'Greige',
          accent: 'Charcoal',
          upholstery: 'Slate Grey',
          wood: 'Dark Wood',
          trim: 'Matte Black',
          surfaces: {}
        },
        'sage-green': {
          name: 'Sage Green',
          desc: 'Organic & Serene',
          image: SITE_BASE + 'assets/studio/bedroom-sage-green.jpg',
          wall: 'Sage Green',
          accent: 'Sage Green',
          upholstery: 'Sage Velvet',
          wood: 'Natural Oak',
          trim: 'Brushed Brass',
          surfaces: {}
        },
        'royal-blue': {
          name: 'Royal Blue',
          desc: 'Navy Velvet & Gold',
          image: SITE_BASE + 'assets/studio/bedroom-royal-blue.jpg',
          wall: 'Warm Ivory',
          accent: 'Navy',
          upholstery: 'Navy Chenille',
          wood: 'Walnut',
          trim: 'Brushed Brass',
          surfaces: {}
        },
        'terracotta': {
          name: 'Terracotta',
          desc: 'Earthy Rust & Teak',
          image: SITE_BASE + 'assets/studio/bedroom-terracotta.jpg',
          wall: 'Terracotta',
          accent: 'Terracotta',
          upholstery: 'Taupe Linen',
          wood: 'Natural Oak',
          trim: 'Brushed Brass',
          surfaces: {}
        }
      }
    },
    kitchen: {
      name: 'Modular Kitchen',
      service: 'Modular Kitchen Design',
      upholsteryLabel: 'Cabinet Style',
      woodLabel: 'Cabinet Shutter Finish',
      presets: {
        'warm-neutral': {
          name: 'Warm Neutral',
          desc: 'Ivory & Oak Cabinets',
          image: SITE_BASE + 'assets/studio/kitchen-warm-neutral.jpg',
          upper: 'Warm Ivory',
          lower: 'Natural Oak',
          counter: 'Carrara Quartz',
          backsplash: 'Marble Slab',
          finish: 'Matte Laminate',
          hardware: 'Brushed Brass',
          surfaces: {}
        },
        'modern-grey': {
          name: 'Modern Grey',
          desc: 'Greige & Charcoal Slate',
          image: SITE_BASE + 'assets/studio/kitchen-modern-grey.jpg',
          upper: 'Greige',
          lower: 'Charcoal',
          counter: 'Nero Marquina',
          backsplash: 'Charcoal Slate',
          finish: 'Matte Laminate',
          hardware: 'Matte Black',
          surfaces: {
            'kitchen-upper': { color: '#B5AEA4', opacity: 0.8 },
            'kitchen-lower': { color: '#2B2F34', opacity: 0.88 },
            'kitchen-counter': { color: '#24282C', opacity: 0.75 },
            'kitchen-backsplash': { color: '#3A3F45', opacity: 0.8 }
          }
        },
        'sage-green': {
          name: 'Sage Green',
          desc: 'Sage Shaker & Marble',
          image: SITE_BASE + 'assets/studio/kitchen-sage-green.jpg',
          upper: 'Sage Green',
          lower: 'Natural Oak',
          counter: 'Carrara Quartz',
          backsplash: 'Sage Glazed',
          finish: 'Matte Laminate',
          hardware: 'Brushed Brass',
          surfaces: {
            'kitchen-upper': { color: '#8E9F7F', opacity: 0.82 },
            'kitchen-backsplash': { color: '#93A585', opacity: 0.65 }
          }
        },
        'royal-blue': {
          name: 'Royal Blue',
          desc: 'Navy Blue & Brass PVD',
          image: SITE_BASE + 'assets/studio/kitchen-royal-blue.jpg',
          upper: 'Warm Ivory',
          lower: 'Navy',
          counter: 'Calacatta Gold',
          backsplash: 'Muted Gold',
          finish: 'Rich Walnut',
          hardware: 'Brushed Brass',
          surfaces: {
            'kitchen-lower': { color: '#152A42', opacity: 0.88 },
            'kitchen-backsplash': { color: '#D0AB68', opacity: 0.6 }
          }
        },
        'terracotta': {
          name: 'Terracotta',
          desc: 'Warm Spice & Teak',
          image: SITE_BASE + 'assets/studio/kitchen-terracotta.jpg',
          upper: 'Muted Gold',
          lower: 'Charcoal',
          counter: 'Warm Sandstone',
          backsplash: 'Muted Gold',
          finish: 'Natural Oak',
          hardware: 'Champagne Bronze',
          surfaces: {
            'kitchen-upper': { color: '#C59B4B', opacity: 0.75 },
            'kitchen-lower': { color: '#343A40', opacity: 0.82 },
            'kitchen-counter': { color: '#D6C7B2', opacity: 0.65 }
          }
        }
      }
    },
    living: {
      name: 'Living Room',
      service: 'Living Room Interior Design',
      upholsteryLabel: 'Sofa Fabric & Cushions',
      woodLabel: 'TV Console & Wall Paneling',
      presets: {
        'warm-neutral': {
          name: 'Warm Neutral',
          desc: 'Ivory & Oak Fluted TV Unit',
          image: SITE_BASE + 'assets/studio/living-warm-neutral.jpg',
          wall: 'Warm Ivory',
          sofa: 'Cream Bouclé',
          curtains: 'Warm Sheer',
          accent: 'Natural Oak',
          wood: 'Natural Oak',
          trim: 'Brushed Brass',
          surfaces: {}
        },
        'modern-grey': {
          name: 'Modern Grey',
          desc: 'Concrete & Charcoal Fluted',
          image: SITE_BASE + 'assets/studio/living-modern-grey.jpg',
          wall: 'Greige',
          sofa: 'Slate Grey',
          curtains: 'Slate Grey',
          accent: 'Smoked Oak',
          wood: 'Smoked Oak',
          trim: 'Matte Black',
          surfaces: {
            'living-sofa': { color: '#6E7781', opacity: 0.82 },
            'living-accent': { color: '#3A3530', opacity: 0.85 },
            'living-curtains': { color: '#7C848C', opacity: 0.65 }
          }
        },
        'sage-green': {
          name: 'Sage Green',
          desc: 'Botanical Olive & Oak',
          image: SITE_BASE + 'assets/studio/living-sage-green.jpg',
          wall: 'Sage Green',
          sofa: 'Sage Velvet',
          curtains: 'Sage Olive',
          accent: 'Natural Oak',
          wood: 'Natural Oak',
          trim: 'Brushed Brass',
          surfaces: {
            'living-sofa': { color: '#8E9F7F', opacity: 0.82 },
            'living-walls': { color: '#8E9F7F', opacity: 0.65 },
            'living-curtains': { color: '#839276', opacity: 0.6 }
          }
        },
        'royal-blue': {
          name: 'Royal Blue',
          desc: 'Navy Accent & Gold Trim',
          image: SITE_BASE + 'assets/studio/living-royal-blue.jpg',
          wall: 'Warm Ivory',
          sofa: 'Navy Chenille',
          curtains: 'Navy',
          accent: 'Walnut',
          wood: 'Rich Walnut',
          trim: 'Brushed Brass',
          surfaces: {
            'living-sofa': { color: '#182C45', opacity: 0.88 },
            'living-curtains': { color: '#182C45', opacity: 0.7 },
            'living-accent': { color: '#6A4932', opacity: 0.75 }
          }
        },
        'terracotta': {
          name: 'Terracotta',
          desc: 'Sunset Glow & Teak',
          image: SITE_BASE + 'assets/studio/living-terracotta.jpg',
          wall: 'Terracotta',
          sofa: 'Terracotta',
          curtains: 'Warm Sheer',
          accent: 'Natural Oak',
          wood: 'Natural Oak',
          trim: 'Champagne Bronze',
          surfaces: {
            'living-sofa': { color: '#C26D53', opacity: 0.82 },
            'living-walls': { color: '#C26D53', opacity: 0.65 }
          }
        }
      }
    }
  };

  let studioActiveRoom = 'bedroom';
  let studioActivePreset = 'warm-neutral';
  let studioSliderPos = 50; // percentage
  let studioLighting = 100;

  const roomPickerView = document.getElementById('roomPickerView');
  const studioWorkspaceView = document.getElementById('studioWorkspaceView');
  const currentRoomTitle = document.getElementById('currentRoomTitle');
  const switchRoomBtn = document.getElementById('switchRoomBtn');
  const resetStudioBtn = document.getElementById('resetStudioBtn');
  const compImgBefore = document.getElementById('compImgBefore');
  const compImgAfter = document.getElementById('compImgAfter');
  const compAfterLayer = document.getElementById('compAfterLayer');
  const compDivider = document.getElementById('compDivider');
  const roomViewport = document.getElementById('roomViewport');
  const dynamicSwatchTint = document.getElementById('dynamicSwatchTint');
  const customLookLabel = document.getElementById('customLookLabel');
  const lightingSlider = document.getElementById('lightingSlider');
  const valLighting = document.getElementById('valLighting');

  // Text value indicator references
  const valWallColor = document.getElementById('valWallColor');
  const valAccentColor = document.getElementById('valAccentColor');
  const valUpholstery = document.getElementById('valUpholstery');
  const valWood = document.getElementById('valWood');
  const valTrim = document.getElementById('valTrim');

  const valKitchenUpper = document.getElementById('valKitchenUpper');
  const valKitchenLower = document.getElementById('valKitchenLower');
  const valKitchenCounter = document.getElementById('valKitchenCounter');
  const valKitchenBacksplash = document.getElementById('valKitchenBacksplash');
  const valKitchenFinish = document.getElementById('valKitchenFinish');
  const valKitchenHardware = document.getElementById('valKitchenHardware');

  const valLivingWall = document.getElementById('valLivingWall');
  const valLivingSofa = document.getElementById('valLivingSofa');
  const valLivingCurtains = document.getElementById('valLivingCurtains');
  const valLivingAccent = document.getElementById('valLivingAccent');
  const valLivingWood = document.getElementById('valLivingWood');
  const valLivingTrim = document.getElementById('valLivingTrim');

  function updateBeforeAfterClip(percent) {
    studioSliderPos = Math.max(0, Math.min(100, percent));
    if (compDivider) compDivider.style.left = studioSliderPos + '%';
    if (compAfterLayer) compAfterLayer.style.clipPath = `polygon(${studioSliderPos}% 0, 100% 0, 100% 100%, ${studioSliderPos}% 100%)`;
    if (compDivider) compDivider.setAttribute('aria-valuenow', Math.round(studioSliderPos));
  }

  function clearAllSurfaceOverlays() {
    document.querySelectorAll('.surface-mask-layer').forEach(layer => {
      layer.style.opacity = '0';
      layer.style.backgroundColor = 'transparent';
    });
    if (dynamicSwatchTint) {
      dynamicSwatchTint.style.opacity = '0';
      dynamicSwatchTint.style.backgroundColor = 'transparent';
    }
  }

  function setSurfaceLayer(surfaceId, color, opacity = 0.82) {
    const el = document.getElementById('mask-' + surfaceId);
    if (!el) return;
    if (!color || color === 'transparent') {
      el.style.opacity = '0';
      el.style.backgroundColor = 'transparent';
    } else {
      el.style.backgroundColor = color;
      el.style.opacity = String(opacity);
    }
  }

  function applyPreset(presetKey, animate = true) {
    studioActivePreset = presetKey;
    const room = STUDIO_DATA[studioActiveRoom];
    if (!room) return;
    const preset = room.presets[presetKey] || room.presets['warm-neutral'];

    // Update preset track active button
    document.querySelectorAll('.preset-card-btn').forEach(btn => {
      const p = btn.getAttribute('data-preset');
      const isActive = p === presetKey;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // Before image is ALWAYS the original baseline warm-neutral design
    if (compImgBefore) {
      compImgBefore.src = room.presets['warm-neutral'].image;
    }

    // After image
    if (compImgAfter) {
      if (animate) {
        compImgAfter.style.opacity = '0.6';
        setTimeout(() => {
          compImgAfter.src = preset.image;
          compImgAfter.style.opacity = '1';
        }, 110);
      } else {
        compImgAfter.src = preset.image;
        compImgAfter.style.opacity = '1';
      }
    }

    // Clear previous surface tints
    clearAllSurfaceOverlays();

    // Apply preset surfaces if any
    if (preset.surfaces) {
      Object.keys(preset.surfaces).forEach(surfKey => {
        const s = preset.surfaces[surfKey];
        setSurfaceLayer(surfKey, s.color, s.opacity);
      });
    }

    // Update custom look label
    if (customLookLabel) {
      customLookLabel.textContent = preset.name.toUpperCase();
    }

    // Synchronize UI labels & active swatches per room
    if (studioActiveRoom === 'bedroom') {
      if (valWallColor) valWallColor.textContent = preset.wall || 'Warm Ivory';
      if (valAccentColor) valAccentColor.textContent = preset.accent || 'Natural Oak';
      if (valUpholstery) valUpholstery.textContent = preset.upholstery || 'Cream Bouclé';
      if (valWood) valWood.textContent = preset.wood || 'Natural Oak';
      if (valTrim) valTrim.textContent = preset.trim || 'Brushed Brass';

      syncSurfaceButtons('bedroom-walls', preset.wall);
      syncSurfaceButtons('bedroom-accent', preset.accent);
      syncSurfaceButtons('bedroom-bed', preset.upholstery);
      syncSurfaceButtons('bedroom-millwork', preset.wood);
      syncGroupButtons('trim', preset.trim);
    } else if (studioActiveRoom === 'kitchen') {
      if (valKitchenUpper) valKitchenUpper.textContent = preset.upper || 'Warm Ivory';
      if (valKitchenLower) valKitchenLower.textContent = preset.lower || 'Natural Oak';
      if (valKitchenCounter) valKitchenCounter.textContent = preset.counter || 'Carrara Quartz';
      if (valKitchenBacksplash) valKitchenBacksplash.textContent = preset.backsplash || 'Marble Slab';
      if (valKitchenFinish) valKitchenFinish.textContent = preset.finish || 'Matte Laminate';
      if (valKitchenHardware) valKitchenHardware.textContent = preset.hardware || 'Brushed Brass';

      syncSurfaceButtons('kitchen-upper', preset.upper);
      syncSurfaceButtons('kitchen-lower', preset.lower);
      syncSurfaceButtons('kitchen-counter', preset.counter);
      syncSurfaceButtons('kitchen-backsplash', preset.backsplash);
      syncGroupButtons('kitchen-finish', preset.finish);
      syncGroupButtons('kitchen-hardware', preset.hardware);
    } else if (studioActiveRoom === 'living') {
      if (valLivingWall) valLivingWall.textContent = preset.wall || 'Warm Ivory';
      if (valLivingSofa) valLivingSofa.textContent = preset.sofa || 'Cream Bouclé';
      if (valLivingCurtains) valLivingCurtains.textContent = preset.curtains || 'Warm Sheer';
      if (valLivingAccent) valLivingAccent.textContent = preset.accent || 'Natural Oak';
      if (valLivingWood) valLivingWood.textContent = preset.wood || 'Natural Oak';
      if (valLivingTrim) valLivingTrim.textContent = preset.trim || 'Brushed Brass';

      syncSurfaceButtons('living-walls', preset.wall);
      syncSurfaceButtons('living-sofa', preset.sofa);
      syncSurfaceButtons('living-curtains', preset.curtains);
      syncSurfaceButtons('living-accent', preset.accent);
      syncSurfaceButtons('living-wood', preset.wood);
      syncGroupButtons('living-trim', preset.trim);
    }
  }

  function syncSurfaceButtons(surfaceId, targetName) {
    if (!targetName) return;
    document.querySelectorAll(`[data-surface="${surfaceId}"]`).forEach(btn => {
      const name = btn.getAttribute('data-name');
      const isMatch = name && (name.toLowerCase() === targetName.toLowerCase() || targetName.toLowerCase().includes(name.toLowerCase()));
      btn.classList.toggle('active', isMatch);
    });
  }

  function syncGroupButtons(groupName, targetName) {
    if (!targetName) return;
    document.querySelectorAll(`[data-group="${groupName}"]`).forEach(btn => {
      const name = btn.getAttribute('data-name');
      const isMatch = name && (name.toLowerCase() === targetName.toLowerCase() || targetName.toLowerCase().includes(name.toLowerCase()));
      btn.classList.toggle('active', isMatch);
    });
  }

  function selectRoom(roomId) {
    if (!STUDIO_DATA[roomId]) roomId = 'bedroom';
    studioActiveRoom = roomId;
    const room = STUDIO_DATA[roomId];

    if (currentRoomTitle) currentRoomTitle.textContent = room.name;

    // Show only the current room's panel controls in all tabs
    document.querySelectorAll('.room-control-group').forEach(group => {
      const p = group.getAttribute('data-room-panel');
      group.hidden = p !== roomId;
    });

    // Update Preset thumbnails for this room
    document.querySelectorAll('.preset-card-btn').forEach(btn => {
      const pKey = btn.getAttribute('data-preset');
      const pData = room.presets[pKey];
      if (pData) {
        const thumb = btn.querySelector('.preset-thumb-wrap img');
        if (thumb) thumb.src = pData.image;
        const desc = btn.querySelector('.preset-desc');
        if (desc) desc.textContent = pData.desc;
      }
    });

    if (roomPickerView) roomPickerView.hidden = true;
    if (studioWorkspaceView) studioWorkspaceView.hidden = false;

    applyPreset('warm-neutral', false);
    updateBeforeAfterClip(50);
  }

  // Room Picker Cards Click
  document.querySelectorAll('[data-select-room]').forEach(card => {
    card.addEventListener('click', () => {
      const room = card.getAttribute('data-select-room');
      selectRoom(room);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const room = card.getAttribute('data-select-room');
        selectRoom(room);
      }
    });
  });

  // Switch Room Button Click
  if (switchRoomBtn) {
    switchRoomBtn.addEventListener('click', () => {
      if (studioWorkspaceView) studioWorkspaceView.hidden = true;
      if (roomPickerView) roomPickerView.hidden = false;
      window.scrollTo({ top: 120, behavior: 'smooth' });
    });
  }

  // Reset Studio Button Click
  if (resetStudioBtn) {
    resetStudioBtn.addEventListener('click', () => {
      applyPreset('warm-neutral', true);
      clearAllSurfaceOverlays();
      if (lightingSlider) lightingSlider.value = '100';
      if (valLighting) valLighting.textContent = 'Warm Ambient (100%)';
      if (compAfterLayer) compAfterLayer.style.filter = 'brightness(100%)';
      updateBeforeAfterClip(50);
      showToast('Studio selections restored to default design.');
    });
  }

  // Preset Buttons Click
  document.querySelectorAll('.preset-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      applyPreset(presetKey, true);
    });
  });

  // Panel Tabs Switching
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const targetId = tab.getAttribute('data-tab');
      document.querySelectorAll('.panel-tab-content').forEach(content => {
        content.hidden = content.id !== targetId;
      });
    });
  });

  // Surface Swatches & Materials Click (Dynamic Precision Recoloring)
  document.querySelectorAll('[data-surface]').forEach(btn => {
    btn.addEventListener('click', () => {
      const surfaceId = btn.getAttribute('data-surface');
      const name = btn.getAttribute('data-name');
      const color = btn.getAttribute('data-color');

      // Update active state among siblings with the same data-surface
      document.querySelectorAll(`[data-surface="${surfaceId}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update corresponding indicator text
      if (surfaceId === 'bedroom-walls' && valWallColor) valWallColor.textContent = name;
      else if (surfaceId === 'bedroom-accent' && valAccentColor) valAccentColor.textContent = name;
      else if (surfaceId === 'bedroom-bed' && valUpholstery) valUpholstery.textContent = name;
      else if (surfaceId === 'bedroom-millwork' && valWood) valWood.textContent = name;
      else if (surfaceId === 'kitchen-upper' && valKitchenUpper) valKitchenUpper.textContent = name;
      else if (surfaceId === 'kitchen-lower' && valKitchenLower) valKitchenLower.textContent = name;
      else if (surfaceId === 'kitchen-counter' && valKitchenCounter) valKitchenCounter.textContent = name;
      else if (surfaceId === 'kitchen-backsplash' && valKitchenBacksplash) valKitchenBacksplash.textContent = name;
      else if (surfaceId === 'living-walls' && valLivingWall) valLivingWall.textContent = name;
      else if (surfaceId === 'living-sofa' && valLivingSofa) valLivingSofa.textContent = name;
      else if (surfaceId === 'living-curtains' && valLivingCurtains) valLivingCurtains.textContent = name;
      else if (surfaceId === 'living-accent' && valLivingAccent) valLivingAccent.textContent = name;
      else if (surfaceId === 'living-wood' && valLivingWood) valLivingWood.textContent = name;

      // Real-time visible surface recoloring via precision mask overlay
      setSurfaceLayer(surfaceId, color, 0.82);

      if (customLookLabel) customLookLabel.textContent = 'CUSTOMIZED LOOK';
    });
  });

  // Group-based material clicks (Trim, finishes)
  document.querySelectorAll('[data-group="trim"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="trim"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valTrim) valTrim.textContent = name;
    });
  });

  document.querySelectorAll('[data-group="kitchen-finish"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="kitchen-finish"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valKitchenFinish) valKitchenFinish.textContent = name;
    });
  });

  document.querySelectorAll('[data-group="kitchen-hardware"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="kitchen-hardware"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valKitchenHardware) valKitchenHardware.textContent = name;
    });
  });

  document.querySelectorAll('[data-group="living-trim"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="living-trim"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valLivingTrim) valLivingTrim.textContent = name;
    });
  });

  // Lighting Slider Input
  if (lightingSlider) {
    lightingSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      studioLighting = val;
      if (valLighting) {
        valLighting.textContent = val < 90 ? `Warm Dim (${val}%)` : (val > 110 ? `Daylight Bright (${val}%)` : `Warm Balanced (${val}%)`);
      }
      if (compAfterLayer) {
        compAfterLayer.style.filter = `brightness(${val}%) contrast(${100 + (val-100)*0.2}%)`;
      }
    });
  }

  // Before and After Drag Slider Implementation (Mouse + Touch + Keyboard)
  let isDraggingSlider = false;

  function handleSliderMove(clientX) {
    if (!roomViewport) return;
    const rect = roomViewport.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const pct = (offsetX / rect.width) * 100;
    updateBeforeAfterClip(pct);
  }

  if (compDivider && roomViewport) {
    compDivider.addEventListener('mousedown', (e) => {
      isDraggingSlider = true;
      e.preventDefault();
    });

    roomViewport.addEventListener('mousedown', (e) => {
      isDraggingSlider = true;
      handleSliderMove(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingSlider = false;
    });

    // Touch Support (Mobile & Tablet)
    compDivider.addEventListener('touchstart', (e) => {
      isDraggingSlider = true;
    }, { passive: true });

    roomViewport.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        isDraggingSlider = true;
        handleSliderMove(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingSlider && e.touches && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDraggingSlider = false;
    });

    // Accessible keyboard control
    compDivider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateBeforeAfterClip(studioSliderPos - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateBeforeAfterClip(studioSliderPos + 5);
      }
    });
  }
'''

start_idx = code.find('// 16. TRY IT OUT STUDIO CONFIGURATOR ENGINE')
end_idx = code.find('// Quote Flow Pre-fill ("Discuss My Design")')

if start_idx != -1 and end_idx != -1:
    updated_code = code[:start_idx] + new_studio_engine + '\n  ' + code[end_idx:]
    with open('script.js', 'w', encoding='utf-8') as f:
        f.write(updated_code)
    print('script.js updated successfully!')
else:
    print('Indices:', start_idx, end_idx)