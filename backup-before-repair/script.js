(() => {
  // Site base path (works at domain root, in a sub-folder, in Live Server, and on file://)
  const SITE_BASE = (() => {
    try { return new URL('./', (document.currentScript && document.currentScript.src) || document.baseURI).pathname; }
    catch (e) { return '/'; }
  })();
  // Logical route of the current URL, independent of where the site is hosted: '/', '/projects', '/try-it-out'
  function currentRoute() {
    let p = window.location.pathname;
    if (p.indexOf(SITE_BASE) === 0) p = p.slice(SITE_BASE.length);
    return '/' + p.replace(/^\/+/, '').replace(/index\.html$/, '');
  }
  // Lock every static <img> to its absolute URL so later URL changes (pushState) can never break lazy-loaded images
  document.querySelectorAll('img[src]').forEach(img => {
    const abs = img.src;
    if (abs && img.getAttribute('src') !== abs) img.setAttribute('src', abs);
  });
  // history API throws on file:// - never let that kill the script
  function safeHistory(method, state, url) {
    try { history[method](state, '', url); } catch (e) { /* ignore */ }
  }
  // DOM Elements
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const siteNav = document.getElementById('siteNav');
  const heroForm = document.getElementById('heroQuoteForm');
  const heroFormSuccess = document.getElementById('heroFormSuccess');
  const toast = document.getElementById('toast');
  const yearSpan = document.getElementById('year');

  // Lightbox Elements
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxEnquireBtn = document.getElementById('lightboxEnquireBtn');

  let toastTimer = null;

  // Set Copyright Year
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ==========================================================================
  // INTERACTIVE CIRCULAR ROOM-SELECTION WHEEL SYSTEM (12 ROOMS)
  // ==========================================================================
  const ROOMS = [
    {
      id: 'living-room',
      name: 'Living Room',
      tag: 'SPACE 01 / 12',
      desc: 'Grand, welcoming spaces styled with bespoke media consoles, fluted paneling, and layered ambient lighting.',
      image: SITE_BASE + 'assets/living-room.webp',
      service: 'Living Room',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M2 13v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zM6 20v2M18 20v2"/></svg>',
      labelLine1: 'Living',
      labelLine2: 'Room'
    },
    {
      id: 'modular-kitchen',
      name: 'Modular Kitchen',
      tag: 'SPACE 02 / 12',
      desc: 'Ergonomic German-hardware kitchens engineered with quartz countertops and seamless pantry storage.',
      image: SITE_BASE + 'assets/hero-kitchen.jpg',
      service: 'Modular Kitchen',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M7 9h2M15 9h2M7 13h10M7 16h4"/></svg>',
      labelLine1: 'Modular',
      labelLine2: 'Kitchen'
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      tag: 'SPACE 03 / 12',
      desc: 'Serene master suites with acoustic paneling, custom upholstered headboards, and restful warm tones.',
      image: SITE_BASE + 'assets/bedroom.webp',
      service: 'Bedroom',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v4h4V8"/></svg>',
      labelLine1: 'Bedroom',
      labelLine2: ''
    },
    {
      id: 'tv-units',
      name: 'TV Units',
      tag: 'SPACE 04 / 12',
      desc: 'Architectural media feature walls featuring stone cladding, warm profile backlighting, and concealed wire ducts.',
      image: SITE_BASE + 'assets/tv-unit.webp',
      service: 'TV Units',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4M7 8h10"/></svg>',
      labelLine1: 'TV',
      labelLine2: 'Units'
    },
    {
      id: 'study-room',
      name: 'Study Room',
      tag: 'SPACE 05 / 12',
      desc: 'Productive home executive offices with built-in bookshelves, ergonomic work desks, and noise-dampening finishes.',
      image: SITE_BASE + 'assets/home-office.webp',
      service: 'Study Room',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M4 15h16M6 15v4M18 15v4M8 11h8V7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4z"/></svg>',
      labelLine1: 'Study',
      labelLine2: 'Room'
    },
    {
      id: 'dining-room',
      name: 'Dining Room',
      tag: 'SPACE 06 / 12',
      desc: 'Elegant dining rooms styled with statement chandeliers, custom credenzas, and marble-finish table settings.',
      image: SITE_BASE + 'assets/dining-room.jpg',
      service: 'Dining Room',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h18M5 13v7M19 13v7M7 9h10M12 5v8M8 5h2M14 5h2"/></svg>',
      labelLine1: 'Dining',
      labelLine2: 'Room'
    },
    {
      id: 'kids-room',
      name: 'Kids Room',
      tag: 'SPACE 07 / 12',
      desc: 'Imaginative, modular spaces featuring safe rounded joinery, vibrant study nooks, and organized play areas.',
      image: SITE_BASE + 'assets/kids-bedroom.jpg',
      service: 'Kids Room',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3L12 3zM12 11v8M8 19l4-6 4 6"/></svg>',
      labelLine1: 'Kids',
      labelLine2: 'Room'
    },
    {
      id: 'balcony',
      name: 'Balcony',
      tag: 'SPACE 08 / 12',
      desc: 'Serene outdoor balconies with weatherproof deck flooring, vertical green planters, and chic bistro seating.',
      image: SITE_BASE + 'assets/balcony.jpg',
      service: 'Balcony',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h18M3 18h18M6 14v4M10 14v4M14 14v4M18 14v4M12 3a5 5 0 0 1 5 5v2H7V8a5 5 0 0 1 5-5z"/></svg>',
      labelLine1: 'Balcony',
      labelLine2: ''
    },
    {
      id: 'wardrobes',
      name: 'Wardrobes',
      tag: 'SPACE 09 / 12',
      desc: 'Bespoke floor-to-ceiling glass and lacquer wardrobes with integrated sensor LEDs and luxury organizers.',
      image: SITE_BASE + 'assets/wardrobes.webp',
      service: 'Wardrobes',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>',
      labelLine1: 'Wardrobes',
      labelLine2: ''
    },
    {
      id: 'storage',
      name: 'Storage',
      tag: 'SPACE 10 / 12',
      desc: 'Concealed utility cabinetry and smart organizers designed to keep high-end residences uncluttered and pristine.',
      image: SITE_BASE + 'assets/storage.jpg',
      service: 'Storage',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="10" y1="6" x2="14" y2="6"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>',
      labelLine1: 'Storage',
      labelLine2: ''
    },
    {
      id: 'guest-room',
      name: 'Guest Room',
      tag: 'SPACE 11 / 12',
      desc: 'Boutique hotel-inspired guest suites designed with warm hospitality, luggage niches, and ambient reading lights.',
      image: SITE_BASE + 'assets/guest-bedroom.jpg',
      service: 'Guest Room',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19h18M3 11a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M8 12h8"/></svg>',
      labelLine1: 'Guest',
      labelLine2: 'Room'
    },
    {
      id: 'pooja-room',
      name: 'Pooja Room',
      tag: 'SPACE 12 / 12',
      desc: 'Sacred prayer sanctuaries crafted with intricately routed CNC jali screens, brass bell accents, and teakwood mandirs.',
      image: SITE_BASE + 'assets/pooja-unit.jpg',
      service: 'Pooja Room',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1.5 2-3 4-3 6.5a3 3 0 0 0 6 0c0-2.5-1.5-4.5-3-6.5zM4 17h16c0 2-3.5 3-8 3s-8-1-8-3zM7 14h10v3H7z"/></svg>',
      labelLine1: 'Pooja',
      labelLine2: 'Room'
    }
  ];

  let currentRoomIndex = 0;

  function initRoomWheel() {
    const wheelSvg = document.getElementById('wheelSvg');
    const thumbStripScroll = document.getElementById('thumbStripScroll');
    if (!wheelSvg) return;

    // Preload all 12 interior photos in background
    ROOMS.forEach(room => {
      const img = new Image();
      img.src = room.image;
    });

    const CX = 270;
    const CY = 270;
    const RO = 250;
    const RI = 142;
    const TOTAL = ROOMS.length;
    const STEP = 360 / TOTAL;
    const START_OFFSET = -105; // Centers Room 0 at 12 o'clock (-90 deg)

    let svgHtml = '';

    // Defs for filters/effects if needed
    svgHtml += `
      <defs>
        <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#C5A059" flood-opacity="0.5"/>
        </filter>
      </defs>
    `;

    // Render 12 Annular Segments
    ROOMS.forEach((room, i) => {
      const startDeg = START_OFFSET + i * STEP;
      const endDeg = startDeg + STEP;
      const midDeg = startDeg + STEP / 2;

      const startRad = (startDeg * Math.PI) / 180;
      const endRad = (endDeg * Math.PI) / 180;
      const midRad = (midDeg * Math.PI) / 180;

      const p1x = (CX + RO * Math.cos(startRad)).toFixed(2);
      const p1y = (CY + RO * Math.sin(startRad)).toFixed(2);
      const p2x = (CX + RO * Math.cos(endRad)).toFixed(2);
      const p2y = (CY + RO * Math.sin(endRad)).toFixed(2);
      const p3x = (CX + RI * Math.cos(endRad)).toFixed(2);
      const p3y = (CY + RI * Math.sin(endRad)).toFixed(2);
      const p4x = (CX + RI * Math.cos(startRad)).toFixed(2);
      const p4y = (CY + RI * Math.sin(startRad)).toFixed(2);

      const pathData = `M ${p1x} ${p1y} A ${RO} ${RO} 0 0 1 ${p2x} ${p2y} L ${p3x} ${p3y} A ${RI} ${RI} 0 0 0 ${p4x} ${p4y} Z`;

      // Icon & Label positions along radial bisector
      const R_ICON = 210;
      const R_LABEL = 170;

      const ix = (CX + R_ICON * Math.cos(midRad)).toFixed(2);
      const iy = (CY + R_ICON * Math.sin(midRad)).toFixed(2);
      const lx = (CX + R_LABEL * Math.cos(midRad)).toFixed(2);
      const ly = (CY + R_LABEL * Math.sin(midRad)).toFixed(2);

      // Angle calculation to keep text upright
      let textAngle = midDeg + 90;
      if (textAngle > 90 && textAngle <= 270) {
        textAngle -= 180;
      } else if (textAngle > 270) {
        textAngle -= 360;
      } else if (textAngle < -90) {
        textAngle += 180;
      }

      // Extract raw inner SVG contents
      const innerIcon = room.iconSvg.replace(/<svg[^>]*>|<\/svg>/gi, '');

      svgHtml += `
        <g class="wheel-segment ${i === 0 ? 'active' : ''}" data-room-index="${i}" tabindex="0" role="button" aria-label="${room.name}">
          <path class="wheel-seg-path" d="${pathData}" />
          <!-- Upright Line Icon -->
          <g class="wheel-seg-icon-wrap" transform="translate(${(parseFloat(ix) - 10).toFixed(2)}, ${(parseFloat(iy) - 10).toFixed(2)})">
            <svg width="20" height="20" viewBox="0 0 24 24" class="wheel-seg-icon" aria-hidden="true">
              ${innerIcon}
            </svg>
          </g>
          <!-- Room Label -->
          <text class="wheel-seg-label" transform="translate(${lx}, ${ly}) rotate(${textAngle.toFixed(1)})">
            ${room.labelLine2
              ? `<tspan x="0" dy="-0.5em">${room.labelLine1}</tspan><tspan x="0" dy="1.15em">${room.labelLine2}</tspan>`
              : `<tspan x="0" dy="0.32em">${room.labelLine1}</tspan>`
            }
          </text>
        </g>
      `;

      // Thin Gold Radial Separator between segments
      svgHtml += `
        <line class="wheel-separator"
          x1="${p4x}" y1="${p4y}"
          x2="${p1x}" y2="${p1y}"
          stroke="#DFC182" stroke-width="1.4" stroke-opacity="0.85" pointer-events="none" />
      `;
    });

    // Outer & Inner Gold Rims
    svgHtml += `
      <circle cx="${CX}" cy="${CY}" r="${RO}" fill="none" stroke="#DFC182" stroke-width="2.2" pointer-events="none" />
      <circle cx="${CX}" cy="${CY}" r="${RO + 4}" fill="none" stroke="rgba(197, 160, 89, 0.4)" stroke-width="1" stroke-dasharray="3 4" pointer-events="none" />
      <circle cx="${CX}" cy="${CY}" r="${RI}" fill="none" stroke="#DFC182" stroke-width="1.8" pointer-events="none" />
    `;

    wheelSvg.innerHTML = svgHtml;

    // Render Bottom Room Thumbnail Cards
    if (thumbStripScroll) {
      thumbStripScroll.innerHTML = ROOMS.map((room, i) => `
        <button type="button" class="thumb-card ${i === 0 ? 'active' : ''}" data-room-index="${i}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" aria-label="Select ${room.name}">
          <img src="${room.image}" alt="${room.name}" loading="lazy">
          <span class="thumb-name">${room.name}</span>
        </button>
      `).join('');
    }

    // ------------------------------------------------------------------------
    // Automatic Wheel Selection & Rotation Engine (Every 4s, Pause on Interaction)
    // ------------------------------------------------------------------------
    const AUTO_INTERVAL_MS = 4000;
    const RESUME_DELAY_MS = 6000;

    let autoTimer = null;
    let resumeTimer = null;
    let isUserHovering = false;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function stopAutoRotation() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function startAutoRotation() {
      stopAutoRotation();
      if (prefersReducedMotion || isUserHovering) return;

      autoTimer = setInterval(() => {
        selectWheelRoom(currentRoomIndex + 1);
      }, AUTO_INTERVAL_MS);
    }

    function pauseAndScheduleResume() {
      stopAutoRotation();
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      if (prefersReducedMotion) return;

      resumeTimer = setTimeout(() => {
        if (!isUserHovering) {
          startAutoRotation();
        }
      }, RESUME_DELAY_MS);
    }

    function handleUserSelection(idx) {
      selectWheelRoom(idx);
      pauseAndScheduleResume();
    }

    // Attach Event Listeners to Segments
    wheelSvg.querySelectorAll('.wheel-segment').forEach(seg => {
      seg.addEventListener('click', () => {
        const idx = parseInt(seg.getAttribute('data-room-index'), 10);
        handleUserSelection(idx);
      });

      seg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(seg.getAttribute('data-room-index'), 10);
          handleUserSelection(idx);
        }
      });
    });

    // Attach Event Listeners to Thumbnails
    if (thumbStripScroll) {
      thumbStripScroll.querySelectorAll('.thumb-card').forEach(thumb => {
        thumb.addEventListener('click', () => {
          const idx = parseInt(thumb.getAttribute('data-room-index'), 10);
          handleUserSelection(idx);
        });
      });
    }

    // Nav Arrows
    const prevBtn = document.getElementById('wheelPrevBtn');
    const nextBtn = document.getElementById('wheelNextBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => handleUserSelection(currentRoomIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => handleUserSelection(currentRoomIndex + 1));
    }

    // Keyboard navigation and hover/focus/touch handling on wheel container
    const wheelContainer = document.getElementById('wheelContainer');
    if (wheelContainer) {
      wheelContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          handleUserSelection(currentRoomIndex + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          handleUserSelection(currentRoomIndex - 1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          handleUserSelection(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          handleUserSelection(ROOMS.length - 1);
        }
      });

      wheelContainer.addEventListener('mouseenter', () => {
        isUserHovering = true;
        stopAutoRotation();
      });

      wheelContainer.addEventListener('mouseleave', () => {
        isUserHovering = false;
        pauseAndScheduleResume();
      });

      wheelContainer.addEventListener('touchstart', () => {
        isUserHovering = true;
        stopAutoRotation();
      }, { passive: true });

      wheelContainer.addEventListener('touchend', () => {
        isUserHovering = false;
        pauseAndScheduleResume();
      }, { passive: true });

      wheelContainer.addEventListener('focusin', () => {
        isUserHovering = true;
        stopAutoRotation();
      });

      wheelContainer.addEventListener('focusout', () => {
        isUserHovering = false;
        pauseAndScheduleResume();
      });
    }

    // Pause on hover / touch over thumbnail strip
    if (roomThumbnailStrip) {
      roomThumbnailStrip.addEventListener('mouseenter', () => {
        isUserHovering = true;
        stopAutoRotation();
      });

      roomThumbnailStrip.addEventListener('mouseleave', () => {
        isUserHovering = false;
        pauseAndScheduleResume();
      });

      roomThumbnailStrip.addEventListener('touchstart', () => {
        isUserHovering = true;
        stopAutoRotation();
      }, { passive: true });

      roomThumbnailStrip.addEventListener('touchend', () => {
        isUserHovering = false;
        pauseAndScheduleResume();
      }, { passive: true });
    }

    // Page Visibility handling
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoRotation();
      } else if (!isUserHovering) {
        startAutoRotation();
      }
    });

    // View All Rooms Toggle Button
    const thumbViewAllBtn = document.getElementById('thumbViewAllBtn');
    if (thumbViewAllBtn && roomThumbnailStrip) {
      thumbViewAllBtn.addEventListener('click', () => {
        const isExpanded = roomThumbnailStrip.classList.toggle('expanded');
        const span = thumbViewAllBtn.querySelector('span');
        if (span) {
          span.textContent = isExpanded ? 'Show Single Row' : 'View All 12 Rooms';
        }
        pauseAndScheduleResume();
      });
    }

    // "View Designs" button inside Center Hub
    const hubViewBtn = document.getElementById('hubViewBtn');
    if (hubViewBtn) {
      hubViewBtn.addEventListener('click', () => {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Set Initial State
    selectWheelRoom(0, true);

    // Launch Auto Rotation
    startAutoRotation();
  }

  let crossfadeTimer = null;
  let hubTimer = null;

  function selectWheelRoom(index, isInitial = false) {
    if (index < 0) index = ROOMS.length - 1;
    if (index >= ROOMS.length) index = 0;

    if (!isInitial && index === currentRoomIndex) return;

    currentRoomIndex = index;
    const room = ROOMS[index];

    // 1. Update SVG Wheel Highlighted Segment
    const segments = document.querySelectorAll('.wheel-segment');
    segments.forEach((seg, i) => {
      const isActive = i === index;
      seg.classList.toggle('active', isActive);
      seg.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 2. Synchronize Thumbnails
    const strip = document.getElementById('thumbStripScroll');
    const thumbs = document.querySelectorAll('.thumb-card');
    thumbs.forEach((thumb, i) => {
      const isActive = i === index;
      thumb.classList.toggle('active', isActive);
      thumb.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive && !isInitial && strip) {
        // Horizontally center active thumbnail inside thumbnail strip without scrolling the window or changing page scroll position
        const targetScrollLeft = thumb.offsetLeft - (strip.clientWidth / 2) + (thumb.offsetWidth / 2);
        strip.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth'
        });
      }
    });

    // 3. Update Center Hub Content with smooth transition
    const hubInner = document.querySelector('.hub-inner');
    const hubTag = document.getElementById('hubTag');
    const hubIconBox = document.getElementById('hubIconBox');
    const hubRoomName = document.getElementById('hubRoomName');
    const hubRoomDesc = document.getElementById('hubRoomDesc');

    if (hubTimer) {
      clearTimeout(hubTimer);
      hubTimer = null;
    }

    if (hubInner && !isInitial) {
      hubInner.classList.add('hub-updating');
      hubTimer = setTimeout(() => {
        if (hubTag) hubTag.textContent = room.tag;
        if (hubIconBox) hubIconBox.innerHTML = room.iconSvg;
        if (hubRoomName) hubRoomName.textContent = room.name;
        if (hubRoomDesc) hubRoomDesc.textContent = room.desc;
        hubInner.classList.remove('hub-updating');
      }, 120);
    } else {
      if (hubTag) hubTag.textContent = room.tag;
      if (hubIconBox) hubIconBox.innerHTML = room.iconSvg;
      if (hubRoomName) hubRoomName.textContent = room.name;
      if (hubRoomDesc) hubRoomDesc.textContent = room.desc;
    }

    // 4. Update CTA Buttons & Form Integration
    const heroDiscussCta = document.getElementById('heroDiscussCta');
    if (heroDiscussCta) {
      heroDiscussCta.setAttribute('data-service', room.name);
    }

    const hubViewBtn = document.getElementById('hubViewBtn');
    if (hubViewBtn) {
      hubViewBtn.setAttribute('data-room-id', room.id);
      hubViewBtn.setAttribute('data-room-name', room.name);
    }

    // 5. Dynamic Background Image Crossfade (No Flickering, Glitch-Free)
    const bgActive = document.getElementById('heroBgActive');
    const bgNext = document.getElementById('heroBgNext');

    if (bgActive && bgNext) {
      if (crossfadeTimer) {
        clearTimeout(crossfadeTimer);
        crossfadeTimer = null;
      }

      if (isInitial) {
        bgActive.style.backgroundImage = `url('${room.image}')`;
        bgNext.style.opacity = '0';
      } else {
        bgNext.style.backgroundImage = `url('${room.image}')`;
        bgNext.style.opacity = '1';

        crossfadeTimer = setTimeout(() => {
          bgActive.style.backgroundImage = `url('${room.image}')`;
          bgNext.style.opacity = '0';
        }, 520);
      }
    }
  }

  // Initialize Room Selection Wheel on DOM ready
  initRoomWheel();

  // 1. Sticky Header Scroll Effect
  function handleScroll() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Active Navigation Spy on Scroll
  const navLinks = document.querySelectorAll('.site-nav .nav-link');
  const sections = document.querySelectorAll('section[id], main > section');

  function updateActiveNavLink() {
    if (currentRoute().startsWith('/projects') || document.body.classList.contains('projects-view-active')) {
      return;
    }
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href.endsWith(`#${currentId}`) || (currentId === 'founder-story' && href.endsWith('#our-story'))) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }
  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  // 3. Reveal Animation on Scroll
  const revealTargets = document.querySelectorAll(
    '.section-heading, .approach-card, .emi-copy, .emi-step-card, .service-card, .process-inner, .collection-card, .reference-card, .legacy-panel, .contact-card'
  );
  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(index % 4) * 80}ms`;
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  // 4. Toast Notification
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 4000);
  }

  // 5. Quote Modal Management
  // ==========================================================================
  // CONSULTATION POPUP  (states: closed | open | minimized)
  //  - one form element, never re-mounted, so values survive minimize/reopen
  //  - auto-opens once, 7s after load; never again after any open/minimize/close
  //  - submission goes through submitLead() -> window.OMKARVIA_CONFIG.leadEndpoint
  // ==========================================================================
  const consult = (() => {
    const AUTO_DELAY_MS = 7000;
    const ANIM_MS = 380;
    const STORE_KEY = 'omkarvia.consult.v1';
    const WHATSAPP_NUMBER = '919493806363';

    const root = document.getElementById('quoteModal');
    const dialog = document.getElementById('consultModal');
    const fab = document.getElementById('consultFab');
    const form = document.getElementById('modalQuoteForm');
    if (!root || !dialog || !fab || !form) {
      return { open() {}, close() {}, minimize() {}, isOpen: () => false };
    }
    const btnMin = document.getElementById('consultMinimize');
    const submitBtn = document.getElementById('consultSubmit');
    const successBox = document.getElementById('formSuccess');
    const alertBox = document.getElementById('consultError');
    const alertMsg = document.getElementById('consultErrorMsg');
    const waLink = document.getElementById('consultWhatsapp');
    const photo = dialog.querySelector('.consult-photo');
    const fields = {
      name: document.getElementById('modalName'),
      phone: document.getElementById('modalPhone'),
      email: document.getElementById('modalEmail'),
      service: document.getElementById('modalService'),
      location: document.getElementById('modalLocation')
    };

    let state = 'closed';
    let autoTimer = null;
    let animTimer = null;
    let opener = null;
    let submitting = false;
    let submitted = false;
    let pointerStartedOnBackdrop = false;
    let memSession = {};

    const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- session memory (sessionStorage, with in-memory fallback) ----
    function readSession() {
      try { return Object.assign({}, memSession, JSON.parse(sessionStorage.getItem(STORE_KEY)) || {}); }
      catch (e) { return memSession; }
    }
    function writeSession(patch) {
      memSession = Object.assign({}, memSession, patch);
      try { sessionStorage.setItem(STORE_KEY, JSON.stringify(Object.assign({}, readSession(), patch))); } catch (e) { /* storage unavailable */ }
    }

    // ---- scroll lock (compensates scrollbar width so the page does not jump) ----
    function lockScroll() {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      if (gap > 0) document.body.style.paddingRight = gap + 'px';
      document.body.classList.add('modal-open');
    }
    function unlockScroll() {
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    }

    // ---- project-type mapping for existing [data-service] buttons ----
    function mapProjectType(name) {
      const n = String(name || '').toLowerCase();
      if (!n || n.includes('consultation')) return '';
      if (n.includes('full home') || n.includes('complete') || n.includes('whole home')) return 'Complete Home Interiors';
      if (n.includes('kitchen')) return 'Modular Kitchen';
      if (n.includes('bedroom') || n.includes('wardrobe') || n.includes('kids') || n.includes('guest')) return 'Bedroom Interiors';
      if (n.includes('living') || n.includes('tv')) return 'Living Room';
      if (n.includes('renovat')) return 'Renovation';
      return 'Other';
    }
    function preselect(service) {
      const target = mapProjectType(service);
      // never overwrite something the visitor already chose
      if (target && !fields.service.value) fields.service.value = target;
    }

    // ---- validation ----
    const NAME_RE = /^[\p{L}][\p{L}\p{M}\s.'’-]{1,79}$/u;
    const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

    function normalizeIndianPhone(raw) {
      let d = String(raw || '').replace(/[\s\-().]/g, '');
      if (/[^\d+]/.test(d) || (d.indexOf('+') > 0) || (d.match(/\+/g) || []).length > 1) return null;
      if (d.startsWith('+')) {
        if (!d.startsWith('+91')) return null;
        d = d.slice(3);
      } else if (d.startsWith('0091')) {
        d = d.slice(4);
      } else if (d.length === 12 && d.startsWith('91')) {
        d = d.slice(2);
      } else if (d.length === 11 && d.startsWith('0')) {
        d = d.slice(1);
      }
      if (!/^[6-9]\d{9}$/.test(d)) return null;
      if (/^(\d)\1{9}$/.test(d)) return null;                       // 9999999999
      if ('01234567890'.includes(d) || '09876543210'.includes(d)) return null; // 1234567890 / 9876543210
      return '+91' + d;
    }

    const validators = {
      name(v) {
        v = v.trim().replace(/\s+/g, ' ');
        if (!v) return 'Please enter your full name.';
        if (!NAME_RE.test(v)) return 'Please enter a valid name (letters only).';
        return '';
      },
      phone(v) {
        if (!v.trim()) return 'Please enter your phone number.';
        return normalizeIndianPhone(v) ? '' : 'Enter a valid 10-digit Indian mobile number (optional +91).';
      },
      email(v) {
        v = v.trim();
        if (!v) return 'Please enter your email address.';
        if (v.length > 120 || v.includes('..') || !EMAIL_RE.test(v)) return 'Please enter a valid email address.';
        return '';
      },
      service(v) { return v ? '' : 'Please select a project type.'; },
      location(v) { return v ? '' : 'Please select your location.'; }
    };

    function setFieldError(key, message) {
      const input = fields[key];
      const wrap = input.closest('.consult-field');
      const errEl = document.getElementById('err-' + key);
      wrap.classList.toggle('has-error', !!message);
      if (message) { input.setAttribute('aria-invalid', 'true'); } else { input.removeAttribute('aria-invalid'); }
      errEl.textContent = message;
      errEl.hidden = !message;
    }
    function validateField(key) {
      const message = validators[key](fields[key].value);
      setFieldError(key, message);
      return !message;
    }
    function validateAll() {
      let firstBad = null;
      Object.keys(fields).forEach(key => {
        if (!validateField(key) && !firstBad) firstBad = fields[key];
      });
      return firstBad;
    }

    Object.keys(fields).forEach(key => {
      const input = fields[key];
      input.addEventListener('blur', () => { if (input.value || input.closest('.consult-field').classList.contains('has-error')) validateField(key); });
      input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => {
        if (input.closest('.consult-field').classList.contains('has-error')) validateField(key);
        hideAlert();
      });
    });

    // ---- alert + success ----
    function hideAlert() { alertBox.hidden = true; }
    function showAlert(message, payload) {
      alertMsg.textContent = message;
      const bits = [];
      bits.push("Hello OMKARVIA Interiors! I'd like a free consultation.");
      if (payload) {
        bits.push('Name: ' + payload.name + '. Project: ' + payload.projectType + ' in ' + payload.location + '.');
        bits.push('Please call me on ' + payload.phone + '.');
      }
      waLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(bits.join(' '));
      alertBox.hidden = false;
    }
    function setLoading(on) {
      submitting = on;
      submitBtn.disabled = on;
      submitBtn.classList.toggle('is-loading', on);
      submitBtn.setAttribute('aria-busy', on ? 'true' : 'false');
      submitBtn.querySelector('.consult-submit-label').textContent = on ? 'Sending…' : 'Request Free Consultation →';
    }
    function resetAfterSuccess() {
      form.reset();
      Object.keys(fields).forEach(key => setFieldError(key, ''));
      hideAlert();
      successBox.hidden = true;
      form.hidden = false;
      dialog.querySelectorAll('.consult-panel > .consult-desc').forEach(el => { el.hidden = false; });
      submitted = false;
    }

    // ---- submission (the only place that talks to the network) ----
    function submitLead(payload) {
      const cfg = window.OMKARVIA_CONFIG || {};
      const endpoint = (cfg.leadEndpoint || '').trim();
      if (!endpoint) {
        return Promise.reject(Object.assign(new Error('Lead endpoint is not configured'), { code: 'NOT_CONFIGURED' }));
      }
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = controller ? window.setTimeout(() => controller.abort(), cfg.requestTimeoutMs || 15000) : null;
      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      }).then(res => {
        if (!res.ok) throw Object.assign(new Error('HTTP ' + res.status), { code: 'HTTP_ERROR' });
        return res.json().catch(() => ({})).then(body => {
          if (body && (body.success === false || body.ok === false)) {
            throw Object.assign(new Error('Service rejected the request'), { code: 'REJECTED' });
          }
          return body;
        });
      }).catch(err => {
        if (err && err.name === 'AbortError') throw Object.assign(new Error('Timed out'), { code: 'TIMEOUT' });
        if (err && err.code) throw err;
        throw Object.assign(new Error('Network error'), { code: 'NETWORK' });
      }).finally(() => { if (timer) window.clearTimeout(timer); });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (submitting) return;
      hideAlert();
      const firstBad = validateAll();
      if (firstBad) { firstBad.focus(); return; }

      const payload = {
        name: fields.name.value.trim().replace(/\s+/g, ' '),
        phone: normalizeIndianPhone(fields.phone.value),
        email: fields.email.value.trim(),
        projectType: fields.service.value,
        location: fields.location.value,
        source: 'website-consultation-popup',
        pageUrl: window.location.href.split('#')[0],
        submittedAt: new Date().toISOString()
      };

      setLoading(true);
      submitLead(payload).then(() => {
        setLoading(false);
        submitted = true;
        document.getElementById('consultSuccessTitle').textContent = 'Thank you, ' + payload.name.split(' ')[0] + '!';
        form.hidden = true;
        dialog.querySelectorAll('.consult-panel > .consult-desc').forEach(el => { el.hidden = true; });
        successBox.hidden = false;
        if (state === 'open') successBox.focus({ preventScroll: true });
        else showToast('Consultation request received. Our team will contact you shortly.');
      }).catch(err => {
        setLoading(false);
        const msg = err && err.code === 'NOT_CONFIGURED'
          ? "Online requests aren't switched on for this website yet, so your details were not sent. Your entries are kept - please reach us directly:"
          : "We couldn't send your request just now. Your details are still here - please try again, or reach us directly:";
        showAlert(msg, payload);
        if (state === 'open') alertBox.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    });

    // ---- state machine ----
    function clearAnimTimer() { if (animTimer) { window.clearTimeout(animTimer); animTimer = null; } }
    function cancelAuto() { if (autoTimer) { window.clearTimeout(autoTimer); autoTimer = null; } }

    function placeDialogAt(fabRect) {
      // express the FAB's centre as a translate/scale relative to the dialog's resting position
      const d = dialog.getBoundingClientRect();
      const tx = (fabRect.left + fabRect.width / 2) - (d.left + d.width / 2);
      const ty = (fabRect.top + fabRect.height / 2) - (d.top + d.height / 2);
      dialog.style.setProperty('--tx', tx.toFixed(1) + 'px');
      dialog.style.setProperty('--ty', ty.toFixed(1) + 'px');
      dialog.style.setProperty('--ts', Math.max(0.06, fabRect.width / d.width).toFixed(3));
    }
    function clearDialogOffset() {
      dialog.style.removeProperty('--tx');
      dialog.style.removeProperty('--ty');
      dialog.style.removeProperty('--ts');
    }

    function open(service, options) {
      options = options || {};
      cancelAuto();
      clearAnimTimer();
      if (service) preselect(service);
      if (state === 'open') { dialog.focus({ preventScroll: true }); return; }

      const active = document.activeElement;
      opener = (active && active !== document.body && !dialog.contains(active)) ? active : (opener || null);
      if (submitted) resetAfterSuccess();

      const fromFab = state === 'minimized' && !fab.hidden;
      const fabRect = fromFab ? fab.getBoundingClientRect() : null;
      state = 'open';
      writeSession({ autoHandled: true, mode: 'open' });

      lockScroll();
      root.hidden = false;
      root.classList.remove('is-visible', 'is-animating');

      const animate = !prefersReducedMotion();
      if (animate && fabRect) {
        // measure the resting position first, then start the dialog at the icon
        dialog.style.transition = 'none';
        dialog.style.transform = 'none';
        placeDialogAt(fabRect);
        void dialog.offsetWidth;
        dialog.style.transform = '';
        void dialog.offsetWidth;
        dialog.style.transition = '';
        fab.classList.add('is-out');
      } else {
        clearDialogOffset();
        if (fromFab) fab.classList.add('is-out');
      }
      root.classList.add('is-animating');
      // two frames so the browser registers the start state before transitioning
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => root.classList.add('is-visible')));

      animTimer = window.setTimeout(() => {
        animTimer = null;
        root.classList.remove('is-animating');
        fab.hidden = true;
        fab.classList.remove('is-out', 'is-in', 'is-measuring');
        dialog.focus({ preventScroll: true });
      }, animate ? ANIM_MS + 40 : 0);
      if (!animate) { fab.hidden = true; fab.classList.remove('is-out', 'is-in'); }
    }

    function minimize() {
      if (state !== 'open') return;
      clearAnimTimer();
      state = 'minimized';
      writeSession({ autoHandled: true, mode: 'minimized' });

      // show the icon invisibly so we know exactly where to fly to
      fab.hidden = false;
      fab.classList.remove('is-out', 'is-in');
      fab.classList.add('is-measuring');
      const fabRect = fab.getBoundingClientRect();
      const animate = !prefersReducedMotion();

      if (animate) placeDialogAt(fabRect); else clearDialogOffset();
      root.classList.add('is-animating');
      root.classList.remove('is-visible');

      animTimer = window.setTimeout(() => {
        animTimer = null;
        root.hidden = true;
        root.classList.remove('is-animating');
        clearDialogOffset();
        unlockScroll();
        fab.classList.remove('is-measuring');
        if (animate) fab.classList.add('is-in');
        fab.focus({ preventScroll: true });
      }, animate ? ANIM_MS : 0);
    }

    function close() {
      if (state === 'closed') return;
      cancelAuto();
      clearAnimTimer();
      const wasOpen = state === 'open';
      state = 'closed';
      writeSession({ autoHandled: true, mode: 'closed' });
      fab.hidden = true;
      fab.classList.remove('is-out', 'is-in', 'is-measuring');
      if (!wasOpen) return;

      const animate = !prefersReducedMotion();
      clearDialogOffset();                       // plain fade + shrink, not a fly-to-icon
      root.classList.add('is-animating');
      root.classList.remove('is-visible');
      animTimer = window.setTimeout(() => {
        animTimer = null;
        root.hidden = true;
        root.classList.remove('is-animating');
        unlockScroll();
        if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
        opener = null;
      }, animate ? 260 : 0);
    }

    // ---- wiring ----
    document.querySelectorAll('[data-open-quote]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        open(button.getAttribute('data-service') || '');
      });
    });
    root.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', close));
    btnMin.addEventListener('click', minimize);
    fab.addEventListener('click', () => open());

    // backdrop click closes - but only if the press AND release both happened on the backdrop
    root.addEventListener('pointerdown', (e) => { pointerStartedOnBackdrop = e.target === root; });
    root.addEventListener('click', (e) => {
      if (e.target === root && pointerStartedOnBackdrop) close();
      pointerStartedOnBackdrop = false;
    });

    // focus trap inside the dialog
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || state !== 'open') return;
      const list = Array.from(dialog.querySelectorAll('button, input, select, a[href], [tabindex="0"]'))
        .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    });

    // ---- initial state + one-time automatic trigger ----
    function scheduleAuto() {
      cancelAuto();
      autoTimer = window.setTimeout(function tick() {
        autoTimer = null;
        if (state !== 'closed' || readSession().autoHandled) return;
        const lb = document.getElementById('imageLightbox');
        if (lb && !lb.hidden) { autoTimer = window.setTimeout(tick, 3000); return; }   // never stack on the image viewer
        open('', { auto: true });
      }, AUTO_DELAY_MS);
    }

    const saved = readSession();
    if (saved.mode === 'minimized' || saved.mode === 'open') {
      state = 'minimized';            // reload / page change inside the same session: keep the icon
      fab.hidden = false;
    } else if (!saved.autoHandled) {
      scheduleAuto();
    }

    // warm the photo cache after the page has settled so the popup never flashes an empty panel
    window.addEventListener('load', () => {
      window.setTimeout(() => { if (photo) { const img = new Image(); img.src = photo.currentSrc || photo.src; } }, 1500);
    });
    // cleanup: no timers survive the page
    window.addEventListener('pagehide', () => { cancelAuto(); clearAnimTimer(); });

    return { open, close, minimize, isOpen: () => state === 'open' };
  })();

  function openModal(service) { consult.open(service || ''); }
  function closeModal() { consult.close(); }

  // Service Card Click to open quote with service selected
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicking button inside, let button handler deal with it
      if (e.target.closest('button')) return;
      const serviceName = card.getAttribute('data-service-card') || '';
      openModal(serviceName);
    });
  });

  // 6. Gallery Lightbox Functionality
  function openLightbox(imgSrc, title, desc, tag, service) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = desc;
    if (lightboxTag) lightboxTag.textContent = tag;
    if (lightboxEnquireBtn) {
      lightboxEnquireBtn.setAttribute('data-service', service || 'Full Home Interiors');
    }
    lightbox.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('[data-gallery-item]').forEach(item => {
    const img = item.querySelector('img');
    const titleEl = item.querySelector('h3');
    const descEl = item.querySelector('p');
    const tagEl = item.querySelector('span');
    const enquireBtn = item.querySelector('.reference-enquire');

    const previewBtn = item.querySelector('.preview-btn');
    if (previewBtn && img) {
      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const imgSrc = img.getAttribute('src');
        const title = titleEl ? titleEl.textContent : 'Interior Design Inspiration';
        const desc = descEl ? descEl.textContent : '';
        const tag = tagEl ? tagEl.textContent : 'INSPIRATION';
        const service = enquireBtn ? enquireBtn.getAttribute('data-service') : 'Full Home Interiors';
        openLightbox(imgSrc, title, desc, tag, service);
      });
    }

    // Clicking image area also opens lightbox
    const imgWrap = item.querySelector('.reference-img-wrap');
    if (imgWrap && img) {
      imgWrap.addEventListener('click', () => {
        const imgSrc = img.getAttribute('src');
        const title = titleEl ? titleEl.textContent : 'Interior Design Inspiration';
        const desc = descEl ? descEl.textContent : '';
        const tag = tagEl ? tagEl.textContent : 'INSPIRATION';
        const service = enquireBtn ? enquireBtn.getAttribute('data-service') : 'Full Home Interiors';
        openLightbox(imgSrc, title, desc, tag, service);
      });
    }
  });

  document.querySelectorAll('[data-close-lightbox]').forEach(btn => {
    btn.addEventListener('click', closeLightbox);
  });

  // 7. Keyboard Navigation (Escape & Tab Trap)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox && !lightbox.hidden) closeLightbox();
      else if (consult.isOpen()) consult.close();
    }
  });

  // 8. Lead Consultation Form Handler (Sync Hero Form with Modal & WhatsApp)
  function handleFormSubmit(event, form, source) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const email = String(data.get('email') || '').trim();
    const service = String(data.get('service') || 'Full Home Interiors').trim();

    if (source === 'hero') {
      form.hidden = true;
      if (heroFormSuccess) {
        heroFormSuccess.hidden = false;
        const h3 = heroFormSuccess.querySelector('h3');
        const msg = heroFormSuccess.querySelector('.success-msg');
        if (h3) h3.textContent = `Thank You, ${name || 'Valued Client'}!`;
        if (msg) {
          msg.textContent = `We have received your enquiry for ${service}. Our Hyderabad design team (+91 94938 06363) will connect with you promptly.`;
        }
      }
      showToast('Enquiry received! Connecting with our Hyderabad design team...');

      // Pre-filled WhatsApp enquiry link for immediate response
      const waText = encodeURIComponent(
        `Hello OMKARVIA Interiors! My name is ${name}. I am looking for ${service} for my home in Hyderabad. Please share design references and flexible EMI details.`
      );
      const waUrl = `https://wa.me/919493806363?text=${waText}`;

      window.setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 1200);
      return;
    }
  }

  if (heroForm) {
    heroForm.addEventListener('submit', (e) => handleFormSubmit(e, heroForm, 'hero'));
  }

  const heroResetBtn = document.getElementById('heroResetBtn');
  if (heroResetBtn && heroForm && heroFormSuccess) {
    heroResetBtn.addEventListener('click', () => {
      heroForm.reset();
      heroForm.hidden = false;
      heroFormSuccess.hidden = true;
    });
  }

  // 9. Mobile Menu Toggle
  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    siteNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (siteNav.classList.contains('open') && !siteNav.contains(e.target) && !menuToggle.contains(e.target)) {
        siteNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 10. Why Choose Us Statistics Carousel Touch Interaction
  const statsCarouselWrapper = document.querySelector('.stats-carousel-wrapper');
  const statsTrack = document.querySelector('.stats-carousel-track');
  if (statsCarouselWrapper && statsTrack) {
    statsCarouselWrapper.addEventListener('touchstart', () => {
      statsTrack.style.animationPlayState = 'paused';
    }, { passive: true });

    statsCarouselWrapper.addEventListener('touchend', () => {
      statsTrack.style.animationPlayState = 'running';
    }, { passive: true });

    statsCarouselWrapper.addEventListener('touchcancel', () => {
      statsTrack.style.animationPlayState = 'running';
    }, { passive: true });
  }

  // 11. Subtle Scroll Reveal for Our Story and Founder Sections
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.12
      });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('is-revealed'));
    }
  }

  // 12. Touch Feedback for Interactive Brand and Experience Cards
  const interactiveCards = document.querySelectorAll('.brand-card, .experience-logo-card');
  interactiveCards.forEach(card => {
    card.addEventListener('touchstart', () => {
      card.classList.add('touch-active');
    }, { passive: true });
    card.addEventListener('touchend', () => {
      setTimeout(() => card.classList.remove('touch-active'), 180);
    }, { passive: true });
    card.addEventListener('touchcancel', () => {
      card.classList.remove('touch-active');
    }, { passive: true });
  });

  // 13. Letter-by-Letter Typing Animation for Hero Heading
  const typingLine1 = document.getElementById('typingLine1');
  const typingLine2 = document.getElementById('typingLine2');
  const typingCursor = document.getElementById('typingCursor');

  if (typingLine1 && typingLine2 && typingCursor) {
    const text1 = 'Complete Home Interiors,';
    const text2 = 'Room by Room.';

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      typingLine1.textContent = text1;
      typingLine2.textContent = text2;
      typingCursor.style.display = 'none';
    } else {
      let isTyping = false;
      let timer = null;

      const typeSequence = () => {
        typingLine1.textContent = '';
        typingLine2.textContent = '';
        typingCursor.classList.add('is-typing');

        let i = 0;
        let j = 0;

        const typeChar1 = () => {
          if (i < text1.length) {
            typingLine1.textContent += text1.charAt(i);
            i++;
            const delay = text1.charAt(i - 1) === ',' ? 240 : (Math.floor(Math.random() * 25) + 55);
            timer = setTimeout(typeChar1, delay);
          } else {
            timer = setTimeout(typeChar2, 260);
          }
        };

        const typeChar2 = () => {
          if (j < text2.length) {
            typingLine2.textContent += text2.charAt(j);
            j++;
            const delay = text2.charAt(j - 1) === '.' ? 350 : (Math.floor(Math.random() * 25) + 60);
            timer = setTimeout(typeChar2, delay);
          } else {
            // Typing complete: let cursor blink and keep text visible for 4.5 seconds
            typingCursor.classList.remove('is-typing');
            timer = setTimeout(eraseSequence, 4500);
          }
        };

        const eraseSequence = () => {
          typingCursor.classList.add('is-typing');

          const eraseChar2 = () => {
            if (typingLine2.textContent.length > 0) {
              typingLine2.textContent = typingLine2.textContent.slice(0, -1);
              timer = setTimeout(eraseChar2, 22);
            } else {
              timer = setTimeout(eraseChar1, 120);
            }
          };

          const eraseChar1 = () => {
            if (typingLine1.textContent.length > 0) {
              typingLine1.textContent = typingLine1.textContent.slice(0, -1);
              timer = setTimeout(eraseChar1, 20);
            } else {
              typingCursor.classList.remove('is-typing');
              timer = setTimeout(typeSequence, 450);
            }
          };

          eraseChar2();
        };

        typeChar1();
      };

      // Start after initial page render
      setTimeout(typeSequence, 400);
    }
  }

  // 14. Smooth Drag-to-Scroll on Desktop for Warranty Badges
  const highlightsStrip = document.querySelector('.hero-highlights-strip');
  if (highlightsStrip) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    highlightsStrip.addEventListener('mousedown', (e) => {
      isDown = true;
      highlightsStrip.style.cursor = 'grabbing';
      startX = e.pageX - highlightsStrip.offsetLeft;
      scrollLeft = highlightsStrip.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        if (highlightsStrip) highlightsStrip.style.cursor = '';
      }
    });

    highlightsStrip.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - highlightsStrip.offsetLeft;
      const walk = (x - startX) * 1.5;
      highlightsStrip.scrollLeft = scrollLeft - walk;
    });
  }

  // ==========================================================================
  // 15. URL ROUTER & INTERACTIVE STUDIO (/projects & /try-it-out)
  // ==========================================================================
  // Make root-absolute links ('/projects', '/#services') work wherever the site is hosted
  document.querySelectorAll('a[href^="/"]').forEach(a => {
    const h = a.getAttribute('href');
    if (h.startsWith('//')) return;
    a.setAttribute('data-orig-href', h);
    a.setAttribute('href', SITE_BASE + h.slice(1));
  });

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
        if (!currentRoute().startsWith('/try-it-out')) safeHistory('replaceState', { page: 'studio' }, SITE_BASE + 'try-it-out');
      } else if (currentRoute() !== '/try-it-out') {
        safeHistory('pushState', { page: 'studio' }, SITE_BASE + 'try-it-out');
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
        if (!currentRoute().startsWith('/projects')) safeHistory('replaceState', { page: 'projects' }, SITE_BASE + 'projects');
      } else if (currentRoute() !== '/projects') {
        safeHistory('pushState', { page: 'projects' }, SITE_BASE + 'projects');
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

      const newUrl = SITE_BASE + (targetHash || '');
      if (replace) {
        safeHistory('replaceState', { page: 'home' }, newUrl);
      } else if (currentRoute() !== '/' || window.location.hash !== targetHash) {
        safeHistory('pushState', { page: 'home' }, newUrl);
      }
    }
  }

  // Intercept Navigation Link Clicks
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('data-orig-href') || anchor.getAttribute('href');
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
      if (currentRoute().startsWith('/projects') || currentRoute().startsWith('/try-it-out') || document.body.classList.contains('projects-view-active') || document.body.classList.contains('studio-view-active')) {
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
    if (currentRoute().startsWith('/try-it-out')) {
      setRoute('/try-it-out', true);
    } else if (currentRoute().startsWith('/projects')) {
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
    // ==========================================================================
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
  const valLivingCoffee = document.getElementById('valLivingCoffee');
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

  // Keep the current comparison image visible until the replacement has loaded.
  // A timed src swap can reveal the viewport background while a room JPEG is decoding.
  function loadComparisonImage(img, src, fade = false) {
    if (!img || !src) return;
    if (img.src === new URL(src, document.baseURI).href && img.complete && img.naturalWidth > 0) return;

    const requestId = (Number(img.dataset.loadRequestId) || 0) + 1;
    img.dataset.loadRequestId = String(requestId);
    const preload = new Image();
    preload.onload = () => {
      if (img.dataset.loadRequestId !== String(requestId)) return;
      if (fade) img.style.opacity = '0.6';
      img.src = preload.src;
      img.style.opacity = '1';
    };
    preload.onerror = () => {
      // Preserve the last valid room image instead of displaying a blank preview.
      if (img.dataset.loadRequestId === String(requestId)) img.style.opacity = '1';
    };
    preload.src = src;
    if (preload.complete && preload.naturalWidth > 0) preload.onload();
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
    if (compImgBefore) loadComparisonImage(compImgBefore, room.presets['warm-neutral'].image);

    // After image
    if (compImgAfter) loadComparisonImage(compImgAfter, preset.image, animate);

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
      else if (surfaceId === 'living-coffee-table' && valLivingCoffee) valLivingCoffee.textContent = name;

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
      setSurfaceLayer('kitchen-hardware', btn.getAttribute('data-color') || '#C59B4B', 1);
    });
  });

  document.querySelectorAll('[data-group="living-trim"]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="living-trim"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.getAttribute('data-name');
      if (valLivingTrim) valLivingTrim.textContent = name;
      setSurfaceLayer('living-metal', btn.getAttribute('data-color') || '#C59B4B', 1);
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

  // Quote Flow Pre-fill ("Discuss My Design")
  const studioDiscussBtn = document.getElementById('studioDiscussBtn');
  if (studioDiscussBtn) {
    studioDiscussBtn.addEventListener('click', () => {
      const room = STUDIO_DATA[studioActiveRoom];
      const preset = room ? room.presets[studioActivePreset] : null;
      let detailSummary = '';
      if (studioActiveRoom === 'kitchen') {
        const upper = valKitchenUpper ? valKitchenUpper.textContent : 'Custom';
        const lower = valKitchenLower ? valKitchenLower.textContent : 'Custom';
        const counter = valKitchenCounter ? valKitchenCounter.textContent : 'Custom';
        detailSummary = `(${upper} upper, ${lower} lower, ${counter} counter)`;
      } else if (studioActiveRoom === 'living') {
        const wall = valLivingWall ? valLivingWall.textContent : 'Custom';
        const sofa = valLivingSofa ? valLivingSofa.textContent : 'Custom';
        const media = valLivingAccent ? valLivingAccent.textContent : 'Custom';
        detailSummary = `(${wall} walls, ${sofa} sofa, ${media} media wall)`;
      } else {
        const wall = valWallColor ? valWallColor.textContent : '';
        const wood = valWood ? valWood.textContent : '';
        const trim = valTrim ? valTrim.textContent : '';
        detailSummary = `(${wall} walls, ${wood} millwork, ${trim} accents)`;
      }

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
        summaryEl.innerHTML = `<strong>Selected Design:</strong> ${room ? room.name : 'Interior'} · <em>${preset ? preset.name : 'Custom'} Palette</em> ${detailSummary}`;
      }
    });
  }

  // Initial Route Check on Page Load
  if (currentRoute().startsWith('/try-it-out')) {
    setRoute('/try-it-out', true);
  } else if (currentRoute().startsWith('/projects')) {
    setRoute('/projects', true);
  } else if (window.location.hash) {
    setRoute('/', true, window.location.hash);
  }
})();
