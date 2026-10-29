import os, re

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# 1. Add "Try It Out" navigation link to site-nav
old_nav = '''        <a class="nav-link" href="/projects" data-route="/projects">Projects</a>
        <a class="nav-link" href="/#our-story" data-route="/#our-story">Our Story</a>'''

new_nav = '''        <a class="nav-link" href="/projects" data-route="/projects">Projects</a>
        <a class="nav-link" href="/try-it-out" data-route="/try-it-out">Try It Out</a>
        <a class="nav-link" href="/#our-story" data-route="/#our-story">Our Story</a>'''

if old_nav in index_html:
    index_html = index_html.replace(old_nav, new_nav, 1)
    print("Added Try It Out to header nav in index.html")

# 2. Add "Try It Out" to footer links
old_footer = '''        <a class="nav-link" href="/projects" data-route="/projects">Projects</a>
        <a class="nav-link" href="/#our-story" data-route="/#our-story">Our Story</a>'''
old_footer_links = '''        <a href="/projects" data-route="/projects">Projects</a>
        <a href="/#our-story" data-route="/#our-story">Our Story</a>'''
new_footer_links = '''        <a href="/projects" data-route="/projects">Projects</a>
        <a href="/try-it-out" data-route="/try-it-out">Try It Out</a>
        <a href="/#our-story" data-route="/#our-story">Our Story</a>'''

if old_footer_links in index_html:
    index_html = index_html.replace(old_footer_links, new_footer_links, 1)
    print("Added Try It Out to footer links in index.html")

# 3. Add promo card on the projects page view (right above filter bar in projects-page-hero)
promo_card_html = '''
            <!-- Try It Out Promotional Banner -->
            <div class="studio-promo-section">
              <div class="studio-promo-card">
                <div>
                  <div class="studio-promo-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <span>INTERACTIVE DESIGN STUDIO</span>
                  </div>
                  <p class="studio-promo-eyebrow">TRY IT OUT</p>
                  <h2 class="studio-promo-title">Your Space. Your Style. Your Imagination.</h2>
                  <p class="studio-promo-lead">Not sure which look suits your home? Explore different colour palettes, finishes, and interior styles before you make your decision.</p>
                </div>
                <a href="/try-it-out" class="studio-promo-cta-btn" data-route="/try-it-out" id="startDesigningBtn">
                  <span>Start Designing →</span>
                </a>
              </div>
            </div>
'''

target_pos = '            <div class="projects-filter-bar"'
if target_pos in index_html and 'class="studio-promo-card"' not in index_html:
    index_html = index_html.replace(target_pos, promo_card_html + '\n' + target_pos, 1)
    print("Added Try It Out promo card in projects page view in index.html")

# 4. Add #studioPageView right after #projectsPageView
studio_page_html = '''
    <!-- =====================================================================
         DEDICATED TRY IT OUT INTERACTIVE DESIGN STUDIO VIEW (/try-it-out)
         ===================================================================== -->
    <div id="studioPageView" hidden>
      <section class="studio-page-section" id="studioPage" aria-labelledby="studioHeading">
        <!-- Studio Header -->
        <div class="studio-header">
          <div class="studio-header-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>INTERACTIVE DESIGN STUDIO</span>
          </div>
          <p class="studio-promo-eyebrow">TRY IT OUT</p>
          <h1 id="studioHeading" class="studio-title">Your Space. Your Style. Your Imagination.</h1>
          <p class="studio-lead">Explore colours, experiment with finishes, and discover a space that feels uniquely yours.</p>
        </div>

        <!-- 1. Room Picker View (Choose A Room) -->
        <div class="room-picker-container" id="roomPickerView">
          <h2 class="room-picker-title">Step 1: Choose a Room to Customize</h2>
          <p class="room-picker-subhead">Select an interior space below to enter the interactive design configurator.</p>

          <div class="room-picker-grid">
            <!-- Bedroom -->
            <div class="room-picker-card" data-select-room="bedroom" tabindex="0" role="button" aria-label="Customize Master Bedroom">
              <div class="room-picker-img-wrap">
                <img src="assets/studio/bedroom-warm-neutral.jpg" alt="Master Bedroom Preview" loading="lazy">
                <span class="room-picker-badge">POPULAR</span>
              </div>
              <div class="room-picker-body">
                <h3>Master Bedroom</h3>
                <p>Personalize acoustic headboard paneling, soft wall colours, luxury bed upholstery, and wardrobe textures.</p>
                <div class="room-picker-btn">
                  <span>Customize Bedroom</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </div>
            </div>

            <!-- Modular Kitchen -->
            <div class="room-picker-card" data-select-room="kitchen" tabindex="0" role="button" aria-label="Customize Modular Kitchen">
              <div class="room-picker-img-wrap">
                <img src="assets/studio/kitchen-warm-neutral.jpg" alt="Modular Kitchen Preview" loading="lazy">
                <span class="room-picker-badge">CHEF'S PICK</span>
              </div>
              <div class="room-picker-body">
                <h3>Modular Kitchen</h3>
                <p>Configure lower and upper cabinet shutter finishes, quartz countertops, backsplash stone, and brass fittings.</p>
                <div class="room-picker-btn">
                  <span>Customize Kitchen</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </div>
            </div>

            <!-- Living Room -->
            <div class="room-picker-card" data-select-room="living" tabindex="0" role="button" aria-label="Customize Living Room">
              <div class="room-picker-img-wrap">
                <img src="assets/studio/living-warm-neutral.jpg" alt="Living Room Preview" loading="lazy">
                <span class="room-picker-badge">FLAGSHIP</span>
              </div>
              <div class="room-picker-body">
                <h3>Living Room</h3>
                <p>Explore fluted wood media consoles, accent wall tones, bouclé sofa fabrics, and layered architectural illumination.</p>
                <div class="room-picker-btn">
                  <span>Customize Living Room</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Interactive Studio Configurator View -->
        <div class="studio-workspace-container" id="studioWorkspaceView" hidden>
          <!-- Workspace Topbar Controls -->
          <div class="studio-topbar">
            <div class="studio-topbar-left">
              <button type="button" class="switch-room-btn" id="switchRoomBtn" aria-label="Switch room">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                <span>Switch Room</span>
              </button>
              <div class="current-room-badge">
                <span>Space:</span> <strong id="currentRoomTitle">Master Bedroom</strong>
              </div>
            </div>

            <div class="studio-topbar-right">
              <button type="button" class="reset-design-btn" id="resetStudioBtn" aria-label="Reset design to default">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          <!-- Main Configurator 2-Column Grid -->
          <div class="studio-grid">
            <!-- Left Side: Customization Panel -->
            <aside class="customizer-panel" aria-label="Studio customization controls">
              <div class="panel-tabs-bar" role="tablist">
                <button type="button" class="panel-tab active" data-tab="tab-colors" role="tab" aria-selected="true">Color Palette</button>
                <button type="button" class="panel-tab" data-tab="tab-materials" role="tab" aria-selected="false">Materials</button>
                <button type="button" class="panel-tab" data-tab="tab-layout" role="tab" aria-selected="false">Layout</button>
              </div>

              <div class="panel-tab-body">
                <!-- TAB 1: COLOR PALETTE -->
                <div class="panel-tab-content" id="tab-colors">
                  <!-- A. Wall Colours -->
                  <div class="control-section">
                    <div class="control-label-row">
                      <span class="control-title">Wall Colour</span>
                      <span class="control-selected-val" id="valWallColor">Warm Ivory</span>
                    </div>
                    <div class="swatches-grid" role="radiogroup" aria-label="Select Wall Colour">
                      <button type="button" class="swatch-btn active" data-group="wall" data-name="Warm Ivory" data-color="#FAF5EE">
                        <span class="swatch-circle" style="background: #FAF5EE;"></span>
                        <span class="swatch-text">Warm Ivory</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="wall" data-name="Beige" data-color="#E8DCB8">
                        <span class="swatch-circle" style="background: #E8DCB8;"></span>
                        <span class="swatch-text">Beige</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="wall" data-name="Greige" data-color="#D3CDC4">
                        <span class="swatch-circle" style="background: #D3CDC4;"></span>
                        <span class="swatch-text">Greige</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="wall" data-name="Sage Green" data-color="#9CAF88">
                        <span class="swatch-circle" style="background: #9CAF88;"></span>
                        <span class="swatch-text">Sage Green</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="wall" data-name="Slate Blue" data-color="#4A6B82">
                        <span class="swatch-circle" style="background: #4A6B82;"></span>
                        <span class="swatch-text">Slate Blue</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="wall" data-name="Terracotta" data-color="#C26D53">
                        <span class="swatch-circle" style="background: #C26D53;"></span>
                        <span class="swatch-text">Terracotta</span>
                      </button>
                    </div>
                  </div>

                  <!-- B. Accent Colours -->
                  <div class="control-section">
                    <div class="control-label-row">
                      <span class="control-title">Accent Colour</span>
                      <span class="control-selected-val" id="valAccentColor">Muted Gold</span>
                    </div>
                    <div class="swatches-grid" role="radiogroup" aria-label="Select Accent Colour">
                      <button type="button" class="swatch-btn active" data-group="accent" data-name="Muted Gold" data-color="#C59B4B">
                        <span class="swatch-circle" style="background: #C59B4B;"></span>
                        <span class="swatch-text">Muted Gold</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="accent" data-name="Sage Green" data-color="#9CAF88">
                        <span class="swatch-circle" style="background: #9CAF88;"></span>
                        <span class="swatch-text">Sage Green</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="accent" data-name="Navy" data-color="#123451">
                        <span class="swatch-circle" style="background: #123451;"></span>
                        <span class="swatch-text">Navy</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="accent" data-name="Terracotta" data-color="#C26D53">
                        <span class="swatch-circle" style="background: #C26D53;"></span>
                        <span class="swatch-text">Terracotta</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="accent" data-name="Charcoal" data-color="#343A40">
                        <span class="swatch-circle" style="background: #343A40;"></span>
                        <span class="swatch-text">Charcoal</span>
                      </button>
                    </div>
                  </div>

                  <!-- C. Bed / Sofa Upholstery -->
                  <div class="control-section">
                    <div class="control-label-row">
                      <span class="control-title" id="labelUpholstery">Bed Upholstery</span>
                      <span class="control-selected-val" id="valUpholstery">Cream Bouclé</span>
                    </div>
                    <div class="swatches-grid" role="radiogroup" aria-label="Select Upholstery">
                      <button type="button" class="swatch-btn active" data-group="upholstery" data-name="Cream Bouclé" data-color="#F7F3EC">
                        <span class="swatch-circle" style="background: #F7F3EC;"></span>
                        <span class="swatch-text">Cream</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="upholstery" data-name="Taupe Linen" data-color="#C9B8A2">
                        <span class="swatch-circle" style="background: #C9B8A2;"></span>
                        <span class="swatch-text">Taupe</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="upholstery" data-name="Sage Velvet" data-color="#98A78A">
                        <span class="swatch-circle" style="background: #98A78A;"></span>
                        <span class="swatch-text">Sage</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="upholstery" data-name="Navy Chenille" data-color="#182C45">
                        <span class="swatch-circle" style="background: #182C45;"></span>
                        <span class="swatch-text">Navy</span>
                      </button>
                      <button type="button" class="swatch-btn" data-group="upholstery" data-name="Slate Grey" data-color="#6E7781">
                        <span class="swatch-circle" style="background: #6E7781;"></span>
                        <span class="swatch-text">Grey</span>
                      </button>
                    </div>
                  </div>

                  <!-- D. Lighting & Ambiance Slider -->
                  <div class="control-section">
                    <div class="control-label-row">
                      <span class="control-title">Lighting &amp; Ambiance</span>
                      <span class="control-selected-val" id="valLighting">Warm Ambient (100%)</span>
                    </div>
                    <div class="lighting-slider-wrap">
                      <input type="range" class="lighting-slider" id="lightingSlider" min="70" max="130" value="100" step="5" aria-label="Adjust room lighting">
                      <div class="lighting-range-labels">
                        <span>Warm Dim (2700K)</span>
                        <span>Balanced (3000K)</span>
                        <span>Bright Daylight (4000K)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- TAB 2: MATERIALS -->
                <div class="panel-tab-content" id="tab-materials" hidden>
                  <div class="control-section">
                    <div class="control-label-row">
                      <span class="control-title" id="labelWood">Wardrobe / Millwork Finish</span>
                      <span class="control-selected-val" id="valWood">Natural Oak</span>
                    </div>
                    <div class="materials-grid" role="radiogroup" aria-label="Select Wood Finish">
                      <button type="button" class="material-card-btn active" data-group="wood" data-name="Natural Oak" data-preset="warm-neutral">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #DEBA88 0%, #C49E68 100%);"></div>
                        <span class="material-name">Natural Oak</span>
                        <span class="material-type">Fluted Timber</span>
                      </button>
                      <button type="button" class="material-card-btn" data-group="wood" data-name="Light Ash" data-preset="warm-neutral">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #E6D8C4 0%, #D8C7AF 100%);"></div>
                        <span class="material-name">Light Ash</span>
                        <span class="material-type">Smooth Grain</span>
                      </button>
                      <button type="button" class="material-card-btn" data-group="wood" data-name="Walnut" data-preset="royal-blue">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #6A4932 0%, #4E3423 100%);"></div>
                        <span class="material-name">Walnut</span>
                        <span class="material-type">Rich Dark</span>
                      </button>
                      <button type="button" class="material-card-btn" data-group="wood" data-name="Dark Wood" data-preset="modern-grey">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #3A3530 0%, #25221F 100%);"></div>
                        <span class="material-name">Dark Wood</span>
                        <span class="material-type">Smoked Oak</span>
                      </button>
                      <button type="button" class="material-card-btn" data-group="wood" data-name="Matte White" data-preset="modern-grey">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);"></div>
                        <span class="material-name">Matte White</span>
                        <span class="material-type">Acrylic Shutter</span>
                      </button>
                      <button type="button" class="material-card-btn" data-group="wood" data-name="Charcoal" data-preset="modern-grey">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #343A40 0%, #212529 100%);"></div>
                        <span class="material-name">Charcoal</span>
                        <span class="material-type">Slate Texture</span>
                      </button>
                    </div>
                  </div>

                  <!-- Countertop & Trim Accents -->
                  <div class="control-section">
                    <div class="control-label-row">
                      <span class="control-title">Surface &amp; Hardware Trim</span>
                      <span class="control-selected-val" id="valTrim">Brushed Brass</span>
                    </div>
                    <div class="materials-grid" role="radiogroup" aria-label="Select Trim Material">
                      <button type="button" class="material-card-btn active" data-group="trim" data-name="Brushed Brass">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #C59B4B 0%, #E0BE77 100%);"></div>
                        <span class="material-name">Brushed Brass</span>
                        <span class="material-type">PVD Hardware</span>
                      </button>
                      <button type="button" class="material-card-btn" data-group="trim" data-name="Matte Black">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #2D3436 0%, #1E272C 100%);"></div>
                        <span class="material-name">Matte Black</span>
                        <span class="material-type">Sleek Metal</span>
                      </button>
                      <button type="button" class="material-card-btn" data-group="trim" data-name="Carrara Marble">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #FFFFFF 0%, #DFE4EA 100%);"></div>
                        <span class="material-name">Carrara Marble</span>
                        <span class="material-type">Italian Stone</span>
                      </button>
                      <button type="button" class="material-card-btn" data-group="trim" data-name="Fluted Glass">
                        <div class="material-color-box" style="background: linear-gradient(135deg, #E2EDF8 0%, #BDD4E7 100%);"></div>
                        <span class="material-name">Fluted Glass</span>
                        <span class="material-type">Acoustic Shutter</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- TAB 3: LAYOUT -->
                <div class="panel-tab-content" id="tab-layout" hidden>
                  <div class="layout-notice-card">
                    <div class="layout-notice-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    </div>
                    <h4>Custom Layout Alterations</h4>
                    <p>Every apartment and villa in Hyderabad has distinct structural dimensions. Our senior architects develop tailor-made 2D floor plans, 3D room elevations, and civil modifications during your personal design consultation.</p>
                    <button class="button button-gold" type="button" data-open-quote data-service="Design Consultation" style="font-size: 13px; padding: 10px 20px;">
                      <span>Plan Custom Layout</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Right Side: Visualization Viewport & Before/After Slider -->
            <div class="studio-visualization-column">
              <div class="room-viewport" id="roomViewport" role="region" aria-label="Interactive Before and After Room Visualization">
                <!-- Floating Corner Labels -->
                <span class="comp-label comp-label-left">ORIGINAL DESIGN</span>
                <span class="comp-label comp-label-right" id="customLookLabel">CUSTOMIZED LOOK</span>

                <!-- 1. Left Before Image (Original Warm Neutral Base) -->
                <img src="assets/studio/bedroom-warm-neutral.jpg" alt="Original room design" class="comp-img-before" id="compImgBefore">

                <!-- 2. Right After Image (Customized Look with clip-path) -->
                <div class="comp-after-layer" id="compAfterLayer">
                  <img src="assets/studio/bedroom-warm-neutral.jpg" alt="Customized room look" class="comp-img-after" id="compImgAfter">
                  <div class="dynamic-swatch-tint" id="dynamicSwatchTint"></div>
                </div>

                <!-- 3. Comparison Divider Handle -->
                <div class="comp-divider" id="compDivider" tabindex="0" role="slider" aria-label="Before and after comparison slider" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                  <div class="comp-handle" aria-hidden="true">
                    <span>◀▶</span>
                  </div>
                </div>
              </div>

              <!-- Bottom Row: Presets Track -->
              <div class="presets-section">
                <div class="presets-header-row">
                  <span class="presets-title">Curated Style Presets</span>
                  <span class="presets-hint">Click a style preset to instantly transform the room</span>
                </div>

                <div class="presets-track" id="presetsTrack" role="radiogroup" aria-label="Select design preset">
                  <!-- Preset 1: Warm Neutral -->
                  <button type="button" class="preset-card-btn active" data-preset="warm-neutral" role="radio" aria-checked="true">
                    <div class="preset-thumb-wrap">
                      <img src="assets/studio/bedroom-warm-neutral.jpg" alt="Warm Neutral" loading="lazy">
                    </div>
                    <div class="preset-meta">
                      <span class="preset-name">Warm Neutral</span>
                      <span class="preset-desc">Ivory &amp; Natural Oak</span>
                    </div>
                  </button>

                  <!-- Preset 2: Modern Grey -->
                  <button type="button" class="preset-card-btn" data-preset="modern-grey" role="radio" aria-checked="false">
                    <div class="preset-thumb-wrap">
                      <img src="assets/studio/bedroom-modern-grey.jpg" alt="Modern Grey" loading="lazy">
                    </div>
                    <div class="preset-meta">
                      <span class="preset-name">Modern Grey</span>
                      <span class="preset-desc">Greige &amp; Charcoal</span>
                    </div>
                  </button>

                  <!-- Preset 3: Sage Green -->
                  <button type="button" class="preset-card-btn" data-preset="sage-green" role="radio" aria-checked="false">
                    <div class="preset-thumb-wrap">
                      <img src="assets/studio/bedroom-sage-green.jpg" alt="Sage Green" loading="lazy">
                    </div>
                    <div class="preset-meta">
                      <span class="preset-name">Sage Green</span>
                      <span class="preset-desc">Organic &amp; Serene</span>
                    </div>
                  </button>

                  <!-- Preset 4: Royal Blue -->
                  <button type="button" class="preset-card-btn" data-preset="royal-blue" role="radio" aria-checked="false">
                    <div class="preset-thumb-wrap">
                      <img src="assets/studio/bedroom-royal-blue.jpg" alt="Royal Blue" loading="lazy">
                    </div>
                    <div class="preset-meta">
                      <span class="preset-name">Royal Blue</span>
                      <span class="preset-desc">Navy Velvet &amp; Gold</span>
                    </div>
                  </button>

                  <!-- Preset 5: Terracotta -->
                  <button type="button" class="preset-card-btn" data-preset="terracotta" role="radio" aria-checked="false">
                    <div class="preset-thumb-wrap">
                      <img src="assets/studio/bedroom-terracotta.jpg" alt="Terracotta" loading="lazy">
                    </div>
                    <div class="preset-meta">
                      <span class="preset-name">Terracotta</span>
                      <span class="preset-desc">Earthy Rust &amp; Teak</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Love This Look? Request a Quote Flow -->
          <div class="studio-quote-banner">
            <div class="studio-quote-text">
              <h3>Love This Look?</h3>
              <p>Let's bring your vision to life with Omkarvia Interiors. Get custom pricing, material samples, and 3D architectural renders for your home.</p>
            </div>
            <button type="button" class="discuss-design-btn" id="studioDiscussBtn" data-open-quote>
              <span>Discuss My Design</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
'''

if 'id="studioPageView"' not in index_html:
    index_html = index_html.replace('</div><!-- end #homepageView -->', '</div><!-- end #homepageView -->\n' + studio_page_html, 1)
    print("Added #studioPageView to index.html")

# Write updated index.html
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)
print("Updated index.html successfully!")

# 5. Generate updated projects/index.html
projects_html = index_html
projects_html = projects_html.replace('<div id="homepageView">', '<div id="homepageView" hidden>')
projects_html = projects_html.replace('<div id="projectsPageView" hidden>', '<div id="projectsPageView">')
projects_html = re.sub(r'<title>.*?</title>', '<title>Our Projects | Omkarvia Interiors</title>', projects_html)
projects_html = projects_html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">')
projects_html = projects_html.replace('<a class="nav-link active" href="/#home" data-route="/">Home</a>', '<a class="nav-link" href="/#home" data-route="/">Home</a>')
projects_html = projects_html.replace('<a class="nav-link" href="/projects" data-route="/projects">Projects</a>', '<a class="nav-link active" href="/projects" data-route="/projects">Projects</a>')

with open('projects/index.html', 'w', encoding='utf-8') as f:
    f.write(projects_html)
print("Updated projects/index.html successfully!")

# 6. Generate standalone try-it-out/index.html
os.makedirs('try-it-out', exist_ok=True)
studio_html = index_html
studio_html = studio_html.replace('<div id="homepageView">', '<div id="homepageView" hidden>')
studio_html = studio_html.replace('<div id="projectsPageView" hidden>', '<div id="projectsPageView" hidden>')
studio_html = studio_html.replace('<div id="studioPageView" hidden>', '<div id="studioPageView">')
studio_html = re.sub(r'<title>.*?</title>', '<title>Try It Out | Interactive Interior Design Studio - Omkarvia Interiors</title>', studio_html)
studio_html = studio_html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">')
studio_html = studio_html.replace('<a class="nav-link active" href="/#home" data-route="/">Home</a>', '<a class="nav-link" href="/#home" data-route="/">Home</a>')
studio_html = studio_html.replace('<a class="nav-link" href="/try-it-out" data-route="/try-it-out">Try It Out</a>', '<a class="nav-link active" href="/try-it-out" data-route="/try-it-out">Try It Out</a>')

with open('try-it-out/index.html', 'w', encoding='utf-8') as f:
    f.write(studio_html)
print("Generated try-it-out/index.html successfully!")
