import os, re

index_path = 'index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Section title button in #services
old_svc_btn = '''          <button class="button button-outline" type="button" data-open-quote>
            <span>Discuss Your Space</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>'''

new_svc_btn = '''          <a class="button button-outline view-all-projects-header-btn" href="/projects" data-route="/projects">
            <span>Explore All Projects</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>'''

if old_svc_btn in html:
    html = html.replace(old_svc_btn, new_svc_btn, 1)
    print("Updated services header button")

# 2. Update cards 07-12 in homepage #services to 6 preview cards + View All Projects banner
card_split_marker = '          <!-- 07 Pooja Units -->'
card_end_marker = '''        </div>
      </div>
    </section>'''

preview_cta = '''        </div>

        <!-- View All Projects Banner / CTA -->
        <div class="projects-preview-cta-wrap">
          <div class="projects-preview-cta-card">
            <div class="projects-preview-cta-text">
              <h3>Discover All 12 Curated Interior Spaces</h3>
              <p>Explore our complete design portfolio including pooja units, false ceiling concepts, foyer designs, and bathroom interiors.</p>
            </div>
            <a href="/projects" class="button button-gold view-all-projects-btn" data-route="/projects" id="viewAllProjectsBtn">
              <span>View All Projects</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      </div>
    </section>'''

# Find the section containing cards 7 to 12
if card_split_marker in html:
    idx1 = html.find(card_split_marker)
    idx2 = html.find(card_end_marker, idx1)
    if idx1 != -1 and idx2 != -1:
        html = html[:idx1] + preview_cta + html[idx2 + len(card_end_marker):]
        print("Replaced cards 7-12 with preview CTA in homepage #services")

# 3. Wrap homepage in <div id="homepageView">
if '<main id="main">\n    <div id="homepageView">' not in html:
    html = html.replace('<main id="main">', '<main id="main">\n    <div id="homepageView">', 1)
    # close it right before </main>
    html = html.replace('    </section>\n  </main>', '    </section>\n    </div><!-- end #homepageView -->\n  </main>', 1)
    print("Wrapped homepage sections in #homepageView")

# 4. Update footer links
old_footer = '''      <div class="footer-links">
        <a href="#home">Home</a>
        <a href="#why-us">Why Omkarvia</a>
        <a href="#services">Services</a>
        <a href="#our-story">Our Story</a>
        <a href="#contact">Contact</a>
        <a href="tel:+919493806363">+91 94938 06363</a>
        <a href="mailto:info@omkarvia.in">info@omkarvia.in</a>
        <button class="footer-quote-btn" type="button" data-open-quote>Get a Free Quote</button>
      </div>'''

new_footer = '''      <div class="footer-links">
        <a href="/#home" data-route="/">Home</a>
        <a href="/#why-us" data-route="/#why-us">Why Omkarvia</a>
        <a href="/#services" data-route="/#services">Services</a>
        <a href="/projects" data-route="/projects">Projects</a>
        <a href="/#our-story" data-route="/#our-story">Our Story</a>
        <a href="/#contact" data-route="/#contact">Contact</a>
        <a href="tel:+919493806363">+91 94938 06363</a>
        <a href="mailto:info@omkarvia.in">info@omkarvia.in</a>
        <button class="footer-quote-btn" type="button" data-open-quote>Get a Free Quote</button>
      </div>'''

if old_footer in html:
    html = html.replace(old_footer, new_footer, 1)
    print("Updated footer links")

# 5. Define the dedicated projects page section markup
projects_page_html = '''
    <!-- =====================================================================
         DEDICATED PROJECTS PAGE VIEW (/projects)
         ===================================================================== -->
    <div id="projectsPageView" hidden>
      <section class="projects-page-section" id="projectsPage" aria-labelledby="projectsPageHeading">
        <!-- Hero Header -->
        <div class="projects-page-hero">
          <div class="projects-page-hero-container">
            <div class="gold-accent-eyebrow">
              <span class="eyebrow-line" aria-hidden="true"></span>
              <span class="eyebrow-text">OUR PORTFOLIO</span>
              <span class="eyebrow-line" aria-hidden="true"></span>
            </div>
            <h1 id="projectsPageHeading" class="projects-page-title">Our Projects</h1>
            <p class="projects-page-lead">Complete home interiors, room by room. Real reference designs and quality craftsmanship executed across Hyderabad.</p>

            <!-- Space Category Filter Buttons -->
            <div class="projects-filter-bar" role="toolbar" aria-label="Filter projects by space">
              <button type="button" class="filter-btn active" data-filter="all">All Spaces (12)</button>
              <button type="button" class="filter-btn" data-filter="kitchen">Kitchen</button>
              <button type="button" class="filter-btn" data-filter="living">Living &amp; TV</button>
              <button type="button" class="filter-btn" data-filter="bedroom">Bedrooms</button>
              <button type="button" class="filter-btn" data-filter="storage">Wardrobes</button>
              <button type="button" class="filter-btn" data-filter="workspace">Office</button>
              <button type="button" class="filter-btn" data-filter="mandir">Mandir</button>
              <button type="button" class="filter-btn" data-filter="ceiling">Ceiling</button>
              <button type="button" class="filter-btn" data-filter="foyer">Foyer</button>
              <button type="button" class="filter-btn" data-filter="bathroom">Bathrooms</button>
            </div>
          </div>
        </div>

        <!-- Full Projects Gallery Grid -->
        <div class="projects-gallery-section">
          <div class="section-container">
            <div class="projects-full-grid" id="projectsFullGrid">
              <!-- 01 Modular Kitchens -->
              <article class="service-card project-grid-item" data-category="kitchen" data-service-card="Modular Kitchen">
                <div class="service-img-wrap">
                  <img src="assets/modular-kitchen.webp" alt="Modern modular kitchen design with quartz countertop" loading="lazy">
                  <span class="service-badge">01 · KITCHEN</span>
                </div>
                <div class="service-card-body">
                  <h3>Modular Kitchens</h3>
                  <p>Ergonomic layouts, smart storage and durable countertops.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Modular Kitchen">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 02 Living Rooms -->
              <article class="service-card project-grid-item" data-category="living" data-service-card="Living Room">
                <div class="service-img-wrap">
                  <img src="assets/living-room.webp" alt="Warm living room interior with layered lighting" loading="lazy">
                  <span class="service-badge">02 · LIVING</span>
                </div>
                <div class="service-card-body">
                  <h3>Living Rooms</h3>
                  <p>Warm tones, accent walls and balanced layered lighting.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Living Room">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 03 Bedrooms -->
              <article class="service-card project-grid-item" data-category="bedroom" data-service-card="Bedroom & Wardrobes">
                <div class="service-img-wrap">
                  <img src="assets/bedroom.webp" alt="Calm master bedroom interior sanctuary" loading="lazy">
                  <span class="service-badge">03 · BEDROOM</span>
                </div>
                <div class="service-card-body">
                  <h3>Bedrooms</h3>
                  <p>Restful sanctuaries with acoustic headboards and mood lighting.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Bedroom & Wardrobes">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 04 Wardrobes & Storage -->
              <article class="service-card project-grid-item" data-category="storage" data-service-card="Bedroom & Wardrobes">
                <div class="service-img-wrap">
                  <img src="assets/wardrobes.webp" alt="Floor to ceiling modular wardrobe organizer" loading="lazy">
                  <span class="service-badge">04 · STORAGE</span>
                </div>
                <div class="service-card-body">
                  <h3>Wardrobes &amp; Storage</h3>
                  <p>Floor-to-ceiling modular organizers with premium glass or wood shutters.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Bedroom & Wardrobes">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 05 Office Interiors -->
              <article class="service-card project-grid-item" data-category="workspace" data-service-card="Office Interiors">
                <div class="service-img-wrap">
                  <img src="assets/home-office.webp" alt="Home workspace setup with ergonomic desk" loading="lazy">
                  <span class="service-badge">05 · WORKSPACE</span>
                </div>
                <div class="service-card-body">
                  <h3>Office Interiors</h3>
                  <p>Ergonomic workstations, integrated bookshelves and wire management.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Office Interiors">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 06 TV Units & Furniture -->
              <article class="service-card project-grid-item" data-category="living" data-service-card="Living Room">
                <div class="service-img-wrap">
                  <img src="assets/tv-unit.webp" alt="Minimalist fluted TV console and display ledge" loading="lazy">
                  <span class="service-badge">06 · TV UNITS</span>
                </div>
                <div class="service-card-body">
                  <h3>TV Units &amp; Furniture</h3>
                  <p>Fluted wall paneling, floating media consoles and display ledges.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Living Room">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 07 Pooja Units -->
              <article class="service-card project-grid-item" data-category="mandir" data-service-card="Full Home Interiors">
                <div class="service-img-wrap">
                  <img src="assets/pooja-unit.jpg" alt="Teak wood and marble pooja unit with brass jali" loading="lazy">
                  <span class="service-badge">07 · MANDIR</span>
                </div>
                <div class="service-card-body">
                  <h3>Pooja Units</h3>
                  <p>Sacred mandirs with warm backlit jali screens and marble pedestals.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Full Home Interiors">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 08 False Ceiling & Lighting -->
              <article class="service-card project-grid-item" data-category="ceiling" data-service-card="Full Home Interiors">
                <div class="service-img-wrap">
                  <img src="assets/false-ceiling.jpg" alt="Modern false ceiling with cove lighting" loading="lazy">
                  <span class="service-badge">08 · CEILING</span>
                </div>
                <div class="service-card-body">
                  <h3>False Ceiling &amp; Lighting</h3>
                  <p>Ambient LED cove illumination and magnetic track spotlighting.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Full Home Interiors">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 09 Foyer Designs -->
              <article class="service-card project-grid-item" data-category="foyer" data-service-card="Full Home Interiors">
                <div class="service-img-wrap">
                  <img src="assets/foyer-design.jpg" alt="Modern foyer entryway with circular mirror" loading="lazy">
                  <span class="service-badge">09 · FOYER</span>
                </div>
                <div class="service-card-body">
                  <h3>Foyer Designs</h3>
                  <p>Inviting entryways with fluted wall paneling, consoles and mirrors.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Full Home Interiors">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 10 Kids' Bedrooms -->
              <article class="service-card project-grid-item" data-category="bedroom" data-service-card="Full Home Interiors">
                <div class="service-img-wrap">
                  <img src="assets/kids-bedroom.jpg" alt="Organized kids bedroom with study desk" loading="lazy">
                  <span class="service-badge">10 · KIDS ROOM</span>
                </div>
                <div class="service-card-body">
                  <h3>Kids' Bedrooms</h3>
                  <p>Adaptive spaces with ergonomic study areas and organized storage.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Full Home Interiors">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 11 Bathroom Interiors -->
              <article class="service-card project-grid-item" data-category="bathroom" data-service-card="Full Home Interiors">
                <div class="service-img-wrap">
                  <img src="assets/bathroom-interior.jpg" alt="Modern master bathroom vanity" loading="lazy">
                  <span class="service-badge">11 · BATHROOM</span>
                </div>
                <div class="service-card-body">
                  <h3>Bathroom Interiors</h3>
                  <p>Spa-like vanities, backlit mirrors and anti-skid porcelain finishes.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Full Home Interiors">
                    <span>Book Consultation</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>

              <!-- 12 Space Planning & Custom Civil -->
              <article class="service-card compact-card project-grid-item" data-category="solutions" data-service-card="Design Consultation">
                <div class="compact-card-body">
                  <span class="service-num-pill">12 · SOLUTIONS</span>
                  <h3>Space Planning &amp; Custom Civil</h3>
                  <p>Layouts, wallpaper, movable furniture, and uPVC installations.</p>
                  <button class="service-cta" type="button" data-open-quote data-service="Design Consultation">
                    <span>Plan Layout</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </button>
                </div>
              </article>
            </div>

            <!-- Projects CTA Consultation Banner -->
            <div class="projects-cta-banner">
              <div>
                <h3>Planning an Interior Project in Hyderabad?</h3>
                <p>Discuss floor plans, material selections, and clear estimates with our design team. No obligations, 100% transparent pricing.</p>
              </div>
              <button class="button button-gold" type="button" data-open-quote data-service="Full Home Interiors">
                <span>Book Free Consultation</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
'''

if 'id="projectsPageView"' not in html:
    html = html.replace('</div><!-- end #homepageView -->', '</div><!-- end #homepageView -->\n' + projects_page_html, 1)
    print("Added #projectsPageView into main")

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html successfully!")

# 6. Now generate the standalone projects/index.html page!
os.makedirs('projects', exist_ok=True)
projects_page_file = 'projects/index.html'

# For projects/index.html, base is href="/" so all assets, CSS, JS load seamlessly!
projects_html = html
# In projects/index.html, #homepageView is hidden, and #projectsPageView is NOT hidden!
projects_html = projects_html.replace('<div id="homepageView">', '<div id="homepageView" hidden>')
projects_html = projects_html.replace('<div id="projectsPageView" hidden>', '<div id="projectsPageView">')
# Set title tag
projects_html = re.sub(r'<title>.*?</title>', '<title>Our Projects | Omkarvia Interiors</title>', projects_html)
# Add <base href="/"> into head right after <meta charset="utf-8">
projects_html = projects_html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">')
# Update header nav active class on Projects
projects_html = projects_html.replace('<a class="nav-link active" href="/#home" data-route="/">Home</a>', '<a class="nav-link" href="/#home" data-route="/">Home</a>')
projects_html = projects_html.replace('<a class="nav-link" href="/projects" data-route="/projects">Projects</a>', '<a class="nav-link active" href="/projects" data-route="/projects">Projects</a>')

with open(projects_page_file, 'w', encoding='utf-8') as f:
    f.write(projects_html)
print("Generated projects/index.html successfully!")
