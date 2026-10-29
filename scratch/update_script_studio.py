import os

script_path = 'script.js'
with open(script_path, 'r', encoding='utf-8') as f:
    code = f.read()

start_marker = "  // 15. URL Router & Dedicated Projects Page Management (/projects)"
end_marker = "})();"

idx1 = code.find(start_marker)
if idx1 == -1:
    print("Could not find start marker in script.js")
    exit(1)

new_section_15 = '''  // ==========================================================================
  // 15. URL ROUTER & INTERACTIVE STUDIO (/projects & /try-it-out)
  // ==========================================================================
  const homepageView = document.getElementById('homepageView');
  const projectsPageView = document.getElementById('projectsPageView');
  const studioPageView = document.getElementById('studioPageView');

  function setRoute(path, replace = false, targetHash = '') {
    const isStudio = path === '/try-it-out' || path.startsWith('/try-it-out');
    const isProjects = path === '/projects' || path.startsWith('/projects');

    if (isStudio) {
      document.body.classList.remove('projects-view-active');
      document.body.classList.add('studio-view-active');
      document.title = 'Try It Out | Interactive Interior Design Studio - Omkarvia Interiors';

      if (homepageView) homepageView.hidden = true;
      if (projectsPageView) projectsPageView.hidden = true;
      if (studioPageView) studioPageView.hidden = false;

      // Update header active link
      document.querySelectorAll('.site-nav .nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('/try-it-out')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      if (!replace) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (replace) {
        history.replaceState({ page: 'studio' }, '', '/try-it-out');
      } else if (window.location.pathname !== '/try-it-out') {
        history.pushState({ page: 'studio' }, '', '/try-it-out');
      }
    } else if (isProjects) {
      document.body.classList.remove('studio-view-active');
      document.body.classList.add('projects-view-active');
      document.title = 'Our Projects | Omkarvia Interiors';

      if (homepageView) homepageView.hidden = true;
      if (projectsPageView) projectsPageView.hidden = false;
      if (studioPageView) studioPageView.hidden = true;

      // Update header active link
      document.querySelectorAll('.site-nav .nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('/projects')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      if (!replace) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (replace) {
        history.replaceState({ page: 'projects' }, '', '/projects');
      } else if (window.location.pathname !== '/projects') {
        history.pushState({ page: 'projects' }, '', '/projects');
      }
    } else {
      document.body.classList.remove('projects-view-active', 'studio-view-active');
      document.title = 'Omkarvia Interiors | Complete Home Interiors, Room by Room';

      if (homepageView) homepageView.hidden = false;
      if (projectsPageView) projectsPageView.hidden = true;
      if (studioPageView) studioPageView.hidden = true;

      // Update active state in nav
      document.querySelectorAll('.site-nav .nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.includes('#home') || href === '/' || href === '/#home') {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      if (targetHash) {
        const cleanId = targetHash.replace(/^#/, '');
        const targetEl = document.getElementById(cleanId);
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 60);
        }
      } else if (!replace) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      const newUrl = targetHash ? `/${targetHash}` : '/';
      if (replace) {
        history.replaceState({ page: 'home' }, '', newUrl);
      } else if (window.location.pathname !== '/' || window.location.hash !== targetHash) {
        history.pushState({ page: 'home' }, '', newUrl);
      }
    }
  }

  // Intercept Navigation Link Clicks
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    // Ignore tel, mailto, whatsapp, or external protocols
    if (href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('https://') || href.startsWith('http://')) {
      return;
    }

    // Try It Out link clicked
    if (href === '/try-it-out' || href === 'try-it-out' || href === '/try-it-out/' || anchor.getAttribute('data-route') === '/try-it-out') {
      e.preventDefault();
      setRoute('/try-it-out');
      if (siteNav && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        if (menuToggle) {
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('open');
        }
      }
      return;
    }

    // Projects link clicked
    if (href === '/projects' || href === 'projects' || href === '/projects/' || anchor.getAttribute('data-route') === '/projects') {
      e.preventDefault();
      setRoute('/projects');
      if (siteNav && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        if (menuToggle) {
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('open');
        }
      }
      return;
    }

    // Home or Anchor link clicked
    if (href === '/' || href === '/#home' || href === '#home') {
      e.preventDefault();
      setRoute('/', false, '#home');
      if (siteNav && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        if (menuToggle) {
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('open');
        }
      }
      return;
    }

    // If an anchor like /#services or #services is clicked from projects or studio
    if (href.startsWith('/#') || href.startsWith('#')) {
      const hash = href.includes('#') ? href.substring(href.indexOf('#')) : '';
      if (window.location.pathname.startsWith('/projects') || window.location.pathname.startsWith('/try-it-out') || document.body.classList.contains('projects-view-active') || document.body.classList.contains('studio-view-active')) {
        e.preventDefault();
        setRoute('/', false, hash);
      }
      if (siteNav && siteNav.classList.contains('open')) {
        siteNav.classList.remove('open');
        if (menuToggle) {
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('open');
        }
      }
    }
  });

  // Browser Back / Forward handler
  window.addEventListener('popstate', () => {
    if (window.location.pathname.startsWith('/try-it-out')) {
      setRoute('/try-it-out', true);
    } else if (window.location.pathname.startsWith('/projects')) {
      setRoute('/projects', true);
    } else {
      setRoute('/', true, window.location.hash);
    }
  });

  // Category Filtering Logic for Dedicated Projects Page
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-grid-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter') || 'all';

      projectItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category') || '';
        if (filterVal === 'all' || itemCategory.includes(filterVal)) {
          item.classList.remove('project-item-hidden');
        } else {
          item.classList.add('project-item-hidden');
        }
      });
    });
  });

  // ==========================================================================
  // 16. TRY IT OUT STUDIO CONFIGURATOR ENGINE & SLIDER LOGIC
  // ==========================================================================
  const STUDIO_DATA = {
    bedroom: {
      name: 'Master Bedroom',
      service: 'Bedroom',
      upholsteryLabel: 'Bed Upholstery',
      woodLabel: 'Wardrobe / Millwork Finish',
      presets: {
        'warm-neutral': {
          name: 'Warm Neutral',
          desc: 'Ivory & Natural Oak',
          image: 'assets/studio/bedroom-warm-neutral.jpg',
          wall: 'Warm Ivory',
          accent: 'Muted Gold',
          wood: 'Natural Oak',
          upholstery: 'Cream Bouclé',
          trim: 'Brushed Brass',
          tint: null
        },
        'modern-grey': {
          name: 'Modern Grey',
          desc: 'Greige & Charcoal',
          image: 'assets/studio/bedroom-modern-grey.jpg',
          wall: 'Greige',
          accent: 'Charcoal',
          wood: 'Dark Wood',
          upholstery: 'Slate Grey',
          trim: 'Matte Black',
          tint: null
        },
        'sage-green': {
          name: 'Sage Green',
          desc: 'Organic & Serene',
          image: 'assets/studio/bedroom-sage-green.jpg',
          wall: 'Sage Green',
          accent: 'Sage Green',
          wood: 'Natural Oak',
          upholstery: 'Sage Velvet',
          trim: 'Brushed Brass',
          tint: null
        },
        'royal-blue': {
          name: 'Royal Blue',
          desc: 'Navy Velvet & Gold',
          image: 'assets/studio/bedroom-royal-blue.jpg',
          wall: 'Warm Ivory',
          accent: 'Navy',
          wood: 'Walnut',
          upholstery: 'Navy Chenille',
          trim: 'Brushed Brass',
          tint: null
        },
        'terracotta': {
          name: 'Terracotta',
          desc: 'Earthy Rust & Teak',
          image: 'assets/studio/bedroom-terracotta.jpg',
          wall: 'Terracotta',
          accent: 'Terracotta',
          wood: 'Natural Oak',
          upholstery: 'Taupe Linen',
          trim: 'Brushed Brass',
          tint: null
        }
      }
    },
    kitchen: {
      name: 'Modular Kitchen',
      service: 'Modular Kitchen',
      upholsteryLabel: 'Bar Stool Seating',
      woodLabel: 'Cabinet Shutter Finish',
      presets: {
        'warm-neutral': {
          name: 'Warm Neutral',
          desc: 'Ivory & Oak Cabinets',
          image: 'assets/studio/kitchen-warm-neutral.jpg',
          wall: 'Warm Ivory',
          accent: 'Muted Gold',
          wood: 'Natural Oak',
          upholstery: 'Cream Bouclé',
          trim: 'Brushed Brass',
          tint: null
        },
        'modern-grey': {
          name: 'Modern Grey',
          desc: 'Slate & Charcoal Matte',
          image: 'assets/studio/kitchen-modern-grey.jpg',
          wall: 'Greige',
          accent: 'Charcoal',
          wood: 'Charcoal',
          upholstery: 'Slate Grey',
          trim: 'Matte Black',
          tint: null
        },
        'sage-green': {
          name: 'Sage Green',
          desc: 'Sage Shaker & Marble',
          image: 'assets/studio/kitchen-sage-green.jpg',
          wall: 'Sage Green',
          accent: 'Sage Green',
          wood: 'Natural Oak',
          upholstery: 'Sage Velvet',
          trim: 'Carrara Marble',
          tint: null
        },
        'royal-blue': {
          name: 'Royal Blue',
          desc: 'Navy Blue & Brass PVD',
          image: 'assets/studio/kitchen-royal-blue.jpg',
          wall: 'Warm Ivory',
          accent: 'Navy',
          wood: 'Walnut',
          upholstery: 'Navy Chenille',
          trim: 'Brushed Brass',
          tint: null
        },
        'terracotta': {
          name: 'Terracotta',
          desc: 'Warm Spice & Teak',
          image: 'assets/studio/kitchen-terracotta.jpg',
          wall: 'Terracotta',
          accent: 'Terracotta',
          wood: 'Natural Oak',
          upholstery: 'Taupe Linen',
          trim: 'Brushed Brass',
          tint: null
        }
      }
    },
    living: {
      name: 'Living Room',
      service: 'Living Room',
      upholsteryLabel: 'Sofa Fabric & Cushions',
      woodLabel: 'TV Console & Wall Paneling',
      presets: {
        'warm-neutral': {
          name: 'Warm Neutral',
          desc: 'Ivory & Oak Fluted TV Unit',
          image: 'assets/studio/living-warm-neutral.jpg',
          wall: 'Warm Ivory',
          accent: 'Muted Gold',
          wood: 'Natural Oak',
          upholstery: 'Cream Bouclé',
          trim: 'Brushed Brass',
          tint: null
        },
        'modern-grey': {
          name: 'Modern Grey',
          desc: 'Concrete & Charcoal Fluted',
          image: 'assets/studio/living-modern-grey.jpg',
          wall: 'Greige',
          accent: 'Charcoal',
          wood: 'Dark Wood',
          upholstery: 'Slate Grey',
          trim: 'Matte Black',
          tint: null
        },
        'sage-green': {
          name: 'Sage Green',
          desc: 'Botanical Olive & Oak',
          image: 'assets/studio/living-sage-green.jpg',
          wall: 'Sage Green',
          accent: 'Sage Green',
          wood: 'Natural Oak',
          upholstery: 'Sage Velvet',
          trim: 'Brushed Brass',
          tint: null
        },
        'royal-blue': {
          name: 'Royal Blue',
          desc: 'Navy Accent & Gold Trim',
          image: 'assets/studio/living-royal-blue.jpg',
          wall: 'Warm Ivory',
          accent: 'Navy',
          wood: 'Walnut',
          upholstery: 'Navy Chenille',
          trim: 'Brushed Brass',
          tint: null
        },
        'terracotta': {
          name: 'Terracotta',
          desc: 'Sunset Glow & Teak',
          image: 'assets/studio/living-terracotta.jpg',
          wall: 'Terracotta',
          accent: 'Terracotta',
          wood: 'Natural Oak',
          upholstery: 'Taupe Linen',
          trim: 'Brushed Brass',
          tint: null
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

  // Text values indicators
  const valWallColor = document.getElementById('valWallColor');
  const valAccentColor = document.getElementById('valAccentColor');
  const valUpholstery = document.getElementById('valUpholstery');
  const valWood = document.getElementById('valWood');
  const valTrim = document.getElementById('valTrim');
  const labelUpholstery = document.getElementById('labelUpholstery');
  const labelWood = document.getElementById('labelWood');

  function updateBeforeAfterClip(percent) {
    studioSliderPos = Math.max(0, Math.min(100, percent));
    if (compDivider) compDivider.style.left = studioSliderPos + '%';
    if (compAfterLayer) compAfterLayer.style.clipPath = `polygon(${studioSliderPos}% 0, 100% 0, 100% 100%, ${studioSliderPos}% 100%)`;
    if (compDivider) compDivider.setAttribute('aria-valuenow', Math.round(studioSliderPos));
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

    // Update images
    if (compImgBefore) {
      compImgBefore.src = room.presets['warm-neutral'].image;
    }

    if (compImgAfter) {
      if (animate) {
        compImgAfter.style.opacity = '0.5';
        setTimeout(() => {
          compImgAfter.src = preset.image;
          compImgAfter.style.opacity = '1';
        }, 120);
      } else {
        compImgAfter.src = preset.image;
        compImgAfter.style.opacity = '1';
      }
    }

    // Reset dynamic tint
    if (dynamicSwatchTint) {
      dynamicSwatchTint.style.opacity = '0';
      dynamicSwatchTint.style.backgroundColor = 'transparent';
    }

    // Update custom look label
    if (customLookLabel) {
      customLookLabel.textContent = preset.name.toUpperCase();
    }

    // Synchronize indicators
    if (valWallColor) valWallColor.textContent = preset.wall;
    if (valAccentColor) valAccentColor.textContent = preset.accent;
    if (valUpholstery) valUpholstery.textContent = preset.upholstery;
    if (valWood) valWood.textContent = preset.wood;
    if (valTrim) valTrim.textContent = preset.trim;

    // Synchronize swatch buttons active states
    syncSwatchButtons('wall', preset.wall);
    syncSwatchButtons('accent', preset.accent);
    syncSwatchButtons('upholstery', preset.upholstery);
    syncSwatchButtons('wood', preset.wood);
    syncSwatchButtons('trim', preset.trim);
  }

  function syncSwatchButtons(group, targetName) {
    document.querySelectorAll(`[data-group="${group}"]`).forEach(btn => {
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
    if (labelUpholstery) labelUpholstery.textContent = room.upholsteryLabel;
    if (labelWood) labelWood.textContent = room.woodLabel;

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

  // Individual Wall Swatch Click
  document.querySelectorAll('[data-group="wall"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="wall"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      const color = btn.getAttribute('data-color');
      if (valWallColor) valWallColor.textContent = name;

      // Apply dynamic tint overlay over the room visualization
      if (dynamicSwatchTint && color) {
        dynamicSwatchTint.style.backgroundColor = color;
        dynamicSwatchTint.style.opacity = '0.24';
      }
      if (customLookLabel) customLookLabel.textContent = `${name.toUpperCase()} TONES`;
    });
  });

  // Accent Swatch Click
  document.querySelectorAll('[data-group="accent"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="accent"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valAccentColor) valAccentColor.textContent = name;
    });
  });

  // Upholstery Swatch Click
  document.querySelectorAll('[data-group="upholstery"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="upholstery"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valUpholstery) valUpholstery.textContent = name;
    });
  });

  // Wood & Trim Materials Click
  document.querySelectorAll('[data-group="wood"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="wood"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valWood) valWood.textContent = name;
    });
  });

  document.querySelectorAll('[data-group="trim"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="trim"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valTrim) valTrim.textContent = name;
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

  // Before and After Drag Slider Implementation (Mouse + Touch)
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

    // Touch Support
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

    // Keyboard Accessibility for Slider
    compDivider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        updateBeforeAfterClip(studioSliderPos - 5);
      } else if (e.key === 'ArrowRight') {
        updateBeforeAfterClip(studioSliderPos + 5);
      }
    });
  }

  // Quote Flow Pre-fill ("Discuss My Design")
  const studioDiscussBtn = document.getElementById('studioDiscussBtn');
  if (studioDiscussBtn) {
    studioDiscussBtn.addEventListener('click', () => {
      const room = STUDIO_DATA[studioActiveRoom];
      const preset = room ? room.presets[studioActivePreset] : null;
      const wall = valWallColor ? valWallColor.textContent : '';
      const wood = valWood ? valWood.textContent : '';
      const trim = valTrim ? valTrim.textContent : '';

      // Pre-select service in modal
      const serviceName = room ? room.service : 'Full Home Interiors';
      openModal(serviceName);

      // Pre-fill location or details in form if available
      const descInput = document.getElementById('modalService');
      const form = document.getElementById('modalQuoteForm');
      if (form) {
        let summaryEl = document.getElementById('studioQuoteSummary');
        if (!summaryEl) {
          summaryEl = document.createElement('div');
          summaryEl.id = 'studioQuoteSummary';
          summaryEl.style.cssText = 'background: #FAF8F5; border: 1px solid #C59B4B; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; color: #123451;';
          const header = form.querySelector('.modal-header');
          if (header && header.nextSibling) {
            form.insertBefore(summaryEl, header.nextSibling);
          } else {
            form.prepend(summaryEl);
          }
        }
        summaryEl.innerHTML = `<strong>Selected Design:</strong> ${room ? room.name : 'Interior'} · <em>${preset ? preset.name : 'Custom'} Palette</em> (${wall} walls, ${wood} millwork, ${trim} accents)`;
      }
    });
  }

  // Initial Route Check on Page Load
  if (window.location.pathname.startsWith('/try-it-out')) {
    setRoute('/try-it-out', true);
  } else if (window.location.pathname.startsWith('/projects')) {
    setRoute('/projects', true);
  } else if (window.location.hash) {
    setRoute('/', true, window.location.hash);
  }
})();
'''

updated_code = code[:idx1] + new_section_15

with open(script_path, 'w', encoding='utf-8') as f:
    f.write(updated_code)

print("Updated script.js successfully!")
