import re

def update_file(path, is_subfolder=True):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    asset_prefix = '../assets/studio/' if is_subfolder else 'assets/studio/'

    new_panel_body = f'''              <div class="panel-tab-body">
                <!-- TAB 1: COLOR PALETTE -->
                <div class="panel-tab-content" id="tab-colors">
                  <!-- BEDROOM COLORS -->
                  <div class="room-control-group" data-room-panel="bedroom">
                    <!-- Wall Colours -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Wall Colour</span>
                        <span class="control-selected-val" id="valWallColor">Warm Ivory</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Wall Colour">
                        <button type="button" class="swatch-btn active" data-surface="bedroom-walls" data-name="Warm Ivory" data-color="#FAF5EE">
                          <span class="swatch-circle" style="background: #FAF5EE;"></span>
                          <span class="swatch-text">Warm Ivory</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-walls" data-name="Beige" data-color="#E8DCB8">
                          <span class="swatch-circle" style="background: #E8DCB8;"></span>
                          <span class="swatch-text">Beige</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-walls" data-name="Greige" data-color="#D3CDC4">
                          <span class="swatch-circle" style="background: #D3CDC4;"></span>
                          <span class="swatch-text">Greige</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-walls" data-name="Sage Green" data-color="#9CAF88">
                          <span class="swatch-circle" style="background: #9CAF88;"></span>
                          <span class="swatch-text">Sage Green</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-walls" data-name="Slate Blue" data-color="#4A6B82">
                          <span class="swatch-circle" style="background: #4A6B82;"></span>
                          <span class="swatch-text">Slate Blue</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-walls" data-name="Terracotta" data-color="#C26D53">
                          <span class="swatch-circle" style="background: #C26D53;"></span>
                          <span class="swatch-text">Terracotta</span>
                        </button>
                      </div>
                    </div>

                    <!-- Accent Headboard Wall -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Accent Wall Finish</span>
                        <span class="control-selected-val" id="valAccentColor">Natural Oak</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Accent Wall">
                        <button type="button" class="swatch-btn active" data-surface="bedroom-accent" data-name="Natural Oak" data-color="transparent">
                          <span class="swatch-circle" style="background: linear-gradient(135deg, #DEBA88 0%, #C49E68 100%);"></span>
                          <span class="swatch-text">Natural Oak</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-accent" data-name="Muted Gold" data-color="#C59B4B">
                          <span class="swatch-circle" style="background: #C59B4B;"></span>
                          <span class="swatch-text">Muted Gold</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-accent" data-name="Sage Green" data-color="#9CAF88">
                          <span class="swatch-circle" style="background: #9CAF88;"></span>
                          <span class="swatch-text">Sage Green</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-accent" data-name="Navy" data-color="#123451">
                          <span class="swatch-circle" style="background: #123451;"></span>
                          <span class="swatch-text">Navy</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-accent" data-name="Terracotta" data-color="#C26D53">
                          <span class="swatch-circle" style="background: #C26D53;"></span>
                          <span class="swatch-text">Terracotta</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-accent" data-name="Charcoal" data-color="#343A40">
                          <span class="swatch-circle" style="background: #343A40;"></span>
                          <span class="swatch-text">Charcoal</span>
                        </button>
                      </div>
                    </div>

                    <!-- Bed Upholstery -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title" id="labelUpholstery">Bed Upholstery</span>
                        <span class="control-selected-val" id="valUpholstery">Cream Bouclé</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Bed Upholstery">
                        <button type="button" class="swatch-btn active" data-surface="bedroom-bed" data-name="Cream Bouclé" data-color="transparent">
                          <span class="swatch-circle" style="background: #F7F3EC; border: 1px solid #CCC;"></span>
                          <span class="swatch-text">Cream</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-bed" data-name="Taupe Linen" data-color="#C9B8A2">
                          <span class="swatch-circle" style="background: #C9B8A2;"></span>
                          <span class="swatch-text">Taupe</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-bed" data-name="Sage Velvet" data-color="#98A78A">
                          <span class="swatch-circle" style="background: #98A78A;"></span>
                          <span class="swatch-text">Sage</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-bed" data-name="Navy Chenille" data-color="#182C45">
                          <span class="swatch-circle" style="background: #182C45;"></span>
                          <span class="swatch-text">Navy</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="bedroom-bed" data-name="Slate Grey" data-color="#6E7781">
                          <span class="swatch-circle" style="background: #6E7781;"></span>
                          <span class="swatch-text">Grey</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- KITCHEN COLORS -->
                  <div class="room-control-group" data-room-panel="kitchen" hidden>
                    <!-- Upper Cabinet Colour -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Upper Cabinet Colour</span>
                        <span class="control-selected-val" id="valKitchenUpper">Warm Ivory</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Upper Cabinet Colour">
                        <button type="button" class="swatch-btn active" data-surface="kitchen-upper" data-name="Warm Ivory" data-color="#FAF5EE">
                          <span class="swatch-circle" style="background: #FAF5EE;"></span>
                          <span class="swatch-text">Warm Ivory</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-upper" data-name="Beige" data-color="#E8DCB8">
                          <span class="swatch-circle" style="background: #E8DCB8;"></span>
                          <span class="swatch-text">Beige</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-upper" data-name="Greige" data-color="#D3CDC4">
                          <span class="swatch-circle" style="background: #D3CDC4;"></span>
                          <span class="swatch-text">Greige</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-upper" data-name="Sage Green" data-color="#8E9F7F">
                          <span class="swatch-circle" style="background: #8E9F7F;"></span>
                          <span class="swatch-text">Sage Green</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-upper" data-name="Slate Blue" data-color="#4A6B82">
                          <span class="swatch-circle" style="background: #4A6B82;"></span>
                          <span class="swatch-text">Slate Blue</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-upper" data-name="Navy" data-color="#152A42">
                          <span class="swatch-circle" style="background: #152A42;"></span>
                          <span class="swatch-text">Navy</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-upper" data-name="Charcoal" data-color="#343A40">
                          <span class="swatch-circle" style="background: #343A40;"></span>
                          <span class="swatch-text">Charcoal</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-upper" data-name="Muted Gold" data-color="#C59B4B">
                          <span class="swatch-circle" style="background: #C59B4B;"></span>
                          <span class="swatch-text">Muted Gold</span>
                        </button>
                      </div>
                    </div>

                    <!-- Lower Cabinet Colour (Independently Customizable!) -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Lower Cabinet Colour</span>
                        <span class="control-selected-val" id="valKitchenLower">Natural Oak</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Lower Cabinet Colour">
                        <button type="button" class="swatch-btn" data-surface="kitchen-lower" data-name="Warm Ivory" data-color="#FAF5EE">
                          <span class="swatch-circle" style="background: #FAF5EE;"></span>
                          <span class="swatch-text">Warm Ivory</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-lower" data-name="Beige" data-color="#E8DCB8">
                          <span class="swatch-circle" style="background: #E8DCB8;"></span>
                          <span class="swatch-text">Beige</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-lower" data-name="Greige" data-color="#D3CDC4">
                          <span class="swatch-circle" style="background: #D3CDC4;"></span>
                          <span class="swatch-text">Greige</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-lower" data-name="Sage Green" data-color="#8E9F7F">
                          <span class="swatch-circle" style="background: #8E9F7F;"></span>
                          <span class="swatch-text">Sage Green</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-lower" data-name="Slate Blue" data-color="#4A6B82">
                          <span class="swatch-circle" style="background: #4A6B82;"></span>
                          <span class="swatch-text">Slate Blue</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-lower" data-name="Navy" data-color="#152A42">
                          <span class="swatch-circle" style="background: #152A42;"></span>
                          <span class="swatch-text">Navy</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-lower" data-name="Charcoal" data-color="#343A40">
                          <span class="swatch-circle" style="background: #343A40;"></span>
                          <span class="swatch-text">Charcoal</span>
                        </button>
                        <button type="button" class="swatch-btn active" data-surface="kitchen-lower" data-name="Natural Oak" data-color="transparent">
                          <span class="swatch-circle" style="background: linear-gradient(135deg, #DEBA88 0%, #C49E68 100%);"></span>
                          <span class="swatch-text">Natural Oak</span>
                        </button>
                      </div>
                    </div>

                    <!-- Countertop Finish -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Countertop Finish</span>
                        <span class="control-selected-val" id="valKitchenCounter">Carrara Quartz</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Countertop Finish">
                        <button type="button" class="swatch-btn active" data-surface="kitchen-counter" data-name="Carrara Quartz" data-color="transparent">
                          <span class="swatch-circle" style="background: #FFFFFF; border: 1px solid #CCC;"></span>
                          <span class="swatch-text">Carrara</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-counter" data-name="Calacatta Gold" data-color="#F2EBD9">
                          <span class="swatch-circle" style="background: #F2EBD9;"></span>
                          <span class="swatch-text">Calacatta</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-counter" data-name="Nero Marquina" data-color="#24282C">
                          <span class="swatch-circle" style="background: #24282C;"></span>
                          <span class="swatch-text">Nero Black</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-counter" data-name="Warm Sandstone" data-color="#D6C7B2">
                          <span class="swatch-circle" style="background: #D6C7B2;"></span>
                          <span class="swatch-text">Sandstone</span>
                        </button>
                      </div>
                    </div>

                    <!-- Backsplash Colour / Finish -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Backsplash Finish</span>
                        <span class="control-selected-val" id="valKitchenBacksplash">Marble Slab</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Backsplash Finish">
                        <button type="button" class="swatch-btn active" data-surface="kitchen-backsplash" data-name="Marble Slab" data-color="transparent">
                          <span class="swatch-circle" style="background: #F8F9FA; border: 1px solid #CCC;"></span>
                          <span class="swatch-text">Marble</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-backsplash" data-name="Sage Glazed" data-color="#93A585">
                          <span class="swatch-circle" style="background: #93A585;"></span>
                          <span class="swatch-text">Sage Tile</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-backsplash" data-name="Muted Gold" data-color="#D0AB68">
                          <span class="swatch-circle" style="background: #D0AB68;"></span>
                          <span class="swatch-text">Gold Quartz</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="kitchen-backsplash" data-name="Charcoal Slate" data-color="#3A3F45">
                          <span class="swatch-circle" style="background: #3A3F45;"></span>
                          <span class="swatch-text">Slate</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- LIVING ROOM COLORS -->
                  <div class="room-control-group" data-room-panel="living" hidden>
                    <!-- Wall Colour -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Wall Colour</span>
                        <span class="control-selected-val" id="valLivingWall">Warm Ivory</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Wall Colour">
                        <button type="button" class="swatch-btn active" data-surface="living-walls" data-name="Warm Ivory" data-color="#FAF5EE">
                          <span class="swatch-circle" style="background: #FAF5EE;"></span>
                          <span class="swatch-text">Warm Ivory</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-walls" data-name="Beige" data-color="#E8DCB8">
                          <span class="swatch-circle" style="background: #E8DCB8;"></span>
                          <span class="swatch-text">Beige</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-walls" data-name="Greige" data-color="#D3CDC4">
                          <span class="swatch-circle" style="background: #D3CDC4;"></span>
                          <span class="swatch-text">Greige</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-walls" data-name="Sage Green" data-color="#8E9F7F">
                          <span class="swatch-circle" style="background: #8E9F7F;"></span>
                          <span class="swatch-text">Sage Green</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-walls" data-name="Slate Blue" data-color="#4A6B82">
                          <span class="swatch-circle" style="background: #4A6B82;"></span>
                          <span class="swatch-text">Slate Blue</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-walls" data-name="Navy" data-color="#152A42">
                          <span class="swatch-circle" style="background: #152A42;"></span>
                          <span class="swatch-text">Navy</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-walls" data-name="Terracotta" data-color="#C26D53">
                          <span class="swatch-circle" style="background: #C26D53;"></span>
                          <span class="swatch-text">Terracotta</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-walls" data-name="Charcoal" data-color="#343A40">
                          <span class="swatch-circle" style="background: #343A40;"></span>
                          <span class="swatch-text">Charcoal</span>
                        </button>
                      </div>
                    </div>

                    <!-- Sofa Upholstery (Visibly changes sofa independently!) -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Sofa Upholstery</span>
                        <span class="control-selected-val" id="valLivingSofa">Cream Bouclé</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Sofa Upholstery">
                        <button type="button" class="swatch-btn active" data-surface="living-sofa" data-name="Cream Bouclé" data-color="transparent">
                          <span class="swatch-circle" style="background: #F7F3EC; border: 1px solid #CCC;"></span>
                          <span class="swatch-text">Cream</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-sofa" data-name="Taupe Linen" data-color="#C9B8A2">
                          <span class="swatch-circle" style="background: #C9B8A2;"></span>
                          <span class="swatch-text">Taupe</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-sofa" data-name="Sage Velvet" data-color="#8E9F7F">
                          <span class="swatch-circle" style="background: #8E9F7F;"></span>
                          <span class="swatch-text">Sage</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-sofa" data-name="Navy Chenille" data-color="#182C45">
                          <span class="swatch-circle" style="background: #182C45;"></span>
                          <span class="swatch-text">Navy</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-sofa" data-name="Slate Grey" data-color="#6E7781">
                          <span class="swatch-circle" style="background: #6E7781;"></span>
                          <span class="swatch-text">Grey</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-sofa" data-name="Terracotta" data-color="#C26D53">
                          <span class="swatch-circle" style="background: #C26D53;"></span>
                          <span class="swatch-text">Terracotta</span>
                        </button>
                      </div>
                    </div>

                    <!-- Curtain Drapery -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Curtain Drapery</span>
                        <span class="control-selected-val" id="valLivingCurtains">Warm Sheer</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Curtain Drapery">
                        <button type="button" class="swatch-btn active" data-surface="living-curtains" data-name="Warm Sheer" data-color="transparent">
                          <span class="swatch-circle" style="background: #F8F5EE; border: 1px solid #CCC;"></span>
                          <span class="swatch-text">Sheer</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-curtains" data-name="Slate Grey" data-color="#7C848C">
                          <span class="swatch-circle" style="background: #7C848C;"></span>
                          <span class="swatch-text">Grey</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-curtains" data-name="Navy" data-color="#182C45">
                          <span class="swatch-circle" style="background: #182C45;"></span>
                          <span class="swatch-text">Navy</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-curtains" data-name="Sage Olive" data-color="#839276">
                          <span class="swatch-circle" style="background: #839276;"></span>
                          <span class="swatch-text">Olive</span>
                        </button>
                      </div>
                    </div>

                    <!-- Media Accent Wall Finish -->
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Media Accent Wall</span>
                        <span class="control-selected-val" id="valLivingAccent">Fluted Natural Oak</span>
                      </div>
                      <div class="swatches-grid" role="radiogroup" aria-label="Select Accent Wall">
                        <button type="button" class="swatch-btn active" data-surface="living-accent" data-name="Natural Oak" data-color="transparent">
                          <span class="swatch-circle" style="background: linear-gradient(135deg, #DEBA88 0%, #C49E68 100%);"></span>
                          <span class="swatch-text">Oak</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-accent" data-name="Smoked Oak" data-color="#3A3530">
                          <span class="swatch-circle" style="background: #3A3530;"></span>
                          <span class="swatch-text">Smoked</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-accent" data-name="Walnut" data-color="#6A4932">
                          <span class="swatch-circle" style="background: #6A4932;"></span>
                          <span class="swatch-text">Walnut</span>
                        </button>
                        <button type="button" class="swatch-btn" data-surface="living-accent" data-name="Slate Charcoal" data-color="#343A40">
                          <span class="swatch-circle" style="background: #343A40;"></span>
                          <span class="swatch-text">Charcoal</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- SHARED LIGHTING & AMBIANCE SLIDER -->
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
                  <!-- BEDROOM MATERIALS -->
                  <div class="room-control-group" data-room-panel="bedroom">
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title" id="labelWood">Wardrobe / Millwork Finish</span>
                        <span class="control-selected-val" id="valWood">Natural Oak</span>
                      </div>
                      <div class="materials-grid" role="radiogroup" aria-label="Select Wood Finish">
                        <button type="button" class="material-card-btn active" data-surface="bedroom-millwork" data-name="Natural Oak" data-color="transparent">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #DEBA88 0%, #C49E68 100%);"></div>
                          <span class="material-name">Natural Oak</span>
                          <span class="material-type">Fluted Timber</span>
                        </button>
                        <button type="button" class="material-card-btn" data-surface="bedroom-millwork" data-name="Light Ash" data-color="#E6D8C4">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #E6D8C4 0%, #D8C7AF 100%);"></div>
                          <span class="material-name">Light Ash</span>
                          <span class="material-type">Smooth Grain</span>
                        </button>
                        <button type="button" class="material-card-btn" data-surface="bedroom-millwork" data-name="Walnut" data-color="#6A4932">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #6A4932 0%, #4E3423 100%);"></div>
                          <span class="material-name">Walnut</span>
                          <span class="material-type">Rich Dark</span>
                        </button>
                        <button type="button" class="material-card-btn" data-surface="bedroom-millwork" data-name="Dark Wood" data-color="#3A3530">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #3A3530 0%, #25221F 100%);"></div>
                          <span class="material-name">Dark Wood</span>
                          <span class="material-type">Smoked Oak</span>
                        </button>
                        <button type="button" class="material-card-btn" data-surface="bedroom-millwork" data-name="Matte White" data-color="#F8F9FA">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);"></div>
                          <span class="material-name">Matte White</span>
                          <span class="material-type">Acrylic Shutter</span>
                        </button>
                        <button type="button" class="material-card-btn" data-surface="bedroom-millwork" data-name="Charcoal" data-color="#343A40">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #343A40 0%, #212529 100%);"></div>
                          <span class="material-name">Charcoal</span>
                          <span class="material-type">Slate Texture</span>
                        </button>
                      </div>
                    </div>

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

                  <!-- KITCHEN MATERIALS -->
                  <div class="room-control-group" data-room-panel="kitchen" hidden>
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Cabinet Shutter Finish</span>
                        <span class="control-selected-val" id="valKitchenFinish">Matte Laminate</span>
                      </div>
                      <div class="materials-grid" role="radiogroup" aria-label="Select Cabinet Finish">
                        <button type="button" class="material-card-btn active" data-group="kitchen-finish" data-name="Matte Laminate">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #FAF5EE 0%, #E8DCB8 100%);"></div>
                          <span class="material-name">Matte Laminate</span>
                          <span class="material-type">Anti-fingerprint</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="kitchen-finish" data-name="Natural Oak">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #DEBA88 0%, #C49E68 100%);"></div>
                          <span class="material-name">Natural Oak</span>
                          <span class="material-type">Textured Grain</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="kitchen-finish" data-name="Rich Walnut">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #6A4932 0%, #4E3423 100%);"></div>
                          <span class="material-name">Rich Walnut</span>
                          <span class="material-type">Warm Timber</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="kitchen-finish" data-name="High Gloss Acrylic">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #FFFFFF 0%, #DFE4EA 100%);"></div>
                          <span class="material-name">Gloss Acrylic</span>
                          <span class="material-type">Reflective Mirror</span>
                        </button>
                      </div>
                    </div>

                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Handle &amp; Hardware Trim</span>
                        <span class="control-selected-val" id="valKitchenHardware">Brushed Brass</span>
                      </div>
                      <div class="materials-grid" role="radiogroup" aria-label="Select Hardware Trim">
                        <button type="button" class="material-card-btn active" data-group="kitchen-hardware" data-name="Brushed Brass">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #C59B4B 0%, #E0BE77 100%);"></div>
                          <span class="material-name">Brushed Brass</span>
                          <span class="material-type">PVD Coating</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="kitchen-hardware" data-name="Matte Black">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #2D3436 0%, #1E272C 100%);"></div>
                          <span class="material-name">Matte Black</span>
                          <span class="material-type">Industrial Metal</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="kitchen-hardware" data-name="Brushed Nickel">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #D1D8E0 0%, #A5B1C2 100%);"></div>
                          <span class="material-name">Brushed Nickel</span>
                          <span class="material-type">Stainless Tone</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="kitchen-hardware" data-name="Champagne Bronze">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #C3A37C 0%, #9F7E56 100%);"></div>
                          <span class="material-name">Champagne</span>
                          <span class="material-type">Satin Luxury</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- LIVING ROOM MATERIALS -->
                  <div class="room-control-group" data-room-panel="living" hidden>
                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">TV Unit &amp; Coffee Table Wood</span>
                        <span class="control-selected-val" id="valLivingWood">Natural Oak</span>
                      </div>
                      <div class="materials-grid" role="radiogroup" aria-label="Select Wood Tone">
                        <button type="button" class="material-card-btn active" data-surface="living-wood" data-name="Natural Oak" data-color="transparent">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #DEBA88 0%, #C49E68 100%);"></div>
                          <span class="material-name">Natural Oak</span>
                          <span class="material-type">Fluted Timber</span>
                        </button>
                        <button type="button" class="material-card-btn" data-surface="living-wood" data-name="Rich Walnut" data-color="#6A4932">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #6A4932 0%, #4E3423 100%);"></div>
                          <span class="material-name">Rich Walnut</span>
                          <span class="material-type">Solid Grain</span>
                        </button>
                        <button type="button" class="material-card-btn" data-surface="living-wood" data-name="Smoked Oak" data-color="#3A3530">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #3A3530 0%, #25221F 100%);"></div>
                          <span class="material-name">Smoked Oak</span>
                          <span class="material-type">Dark Minimalist</span>
                        </button>
                        <button type="button" class="material-card-btn" data-surface="living-wood" data-name="Marble Console" data-color="#FFFFFF">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #FFFFFF 0%, #E6E9EC 100%);"></div>
                          <span class="material-name">Marble Top</span>
                          <span class="material-type">Quartz Inlay</span>
                        </button>
                      </div>
                    </div>

                    <div class="control-section">
                      <div class="control-label-row">
                        <span class="control-title">Decorative Metal Accents</span>
                        <span class="control-selected-val" id="valLivingTrim">Brushed Brass</span>
                      </div>
                      <div class="materials-grid" role="radiogroup" aria-label="Select Metal Accents">
                        <button type="button" class="material-card-btn active" data-group="living-trim" data-name="Brushed Brass">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #C59B4B 0%, #E0BE77 100%);"></div>
                          <span class="material-name">Brushed Brass</span>
                          <span class="material-type">Pendant &amp; Lamp</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="living-trim" data-name="Matte Black">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #2D3436 0%, #1E272C 100%);"></div>
                          <span class="material-name">Matte Black</span>
                          <span class="material-type">Modern Architectural</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="living-trim" data-name="Champagne Bronze">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #C3A37C 0%, #9F7E56 100%);"></div>
                          <span class="material-name">Champagne</span>
                          <span class="material-type">Warm Metal</span>
                        </button>
                        <button type="button" class="material-card-btn" data-group="living-trim" data-name="Brushed Chrome">
                          <div class="material-color-box" style="background: linear-gradient(135deg, #DCE2E8 0%, #B8C2CC 100%);"></div>
                          <span class="material-name">Brushed Chrome</span>
                          <span class="material-type">Sleek Profile</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- TAB 3: LAYOUT -->
                <div class="panel-tab-content" id="tab-layout" hidden>
                  <div class="room-control-group" data-room-panel="bedroom">
                    <div class="layout-notice-card">
                      <div class="layout-notice-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                      </div>
                      <h4>Bedroom Spatial &amp; Wardrobe Planning</h4>
                      <p>Every apartment and villa in Hyderabad has distinct bedroom dimensions. Our senior architects customize floor-to-ceiling sliding wardrobes, acoustic wall paneling, and integrated reading alcoves tailored to your floor plan.</p>
                      <button class="button button-gold" type="button" data-open-quote data-service="Bedroom Interior Design" style="font-size: 13px; padding: 10px 20px;">
                        <span>Plan Custom Bedroom</span>
                      </button>
                    </div>
                  </div>
                  <div class="room-control-group" data-room-panel="kitchen" hidden>
                    <div class="layout-notice-card">
                      <div class="layout-notice-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                      </div>
                      <h4>Modular Kitchen Ergonomics &amp; Layout</h4>
                      <p>Whether you require an Island Breakfast Counter, an L-Shaped Kitchen with Tall Pantry, or a Parallel Galley with German Blum tandem drawers, we engineer the golden work triangle for your cooking habits.</p>
                      <button class="button button-gold" type="button" data-open-quote data-service="Modular Kitchen Design" style="font-size: 13px; padding: 10px 20px;">
                        <span>Plan Kitchen Layout</span>
                      </button>
                    </div>
                  </div>
                  <div class="room-control-group" data-room-panel="living" hidden>
                    <div class="layout-notice-card">
                      <div class="layout-notice-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                      </div>
                      <h4>Living Room &amp; Media Wall Elevation</h4>
                      <p>Create an inviting entertainment zone with concealed wire routing, backlit fluted acoustic paneling, floating credenzas, and integrated dining dividers designed specifically for your space.</p>
                      <button class="button button-gold" type="button" data-open-quote data-service="Living Room Interior Design" style="font-size: 13px; padding: 10px 20px;">
                        <span>Plan Living Room</span>
                      </button>
                    </div>
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
                <img src="{asset_prefix}bedroom-warm-neutral.jpg" alt="Original room design" class="comp-img-before" id="compImgBefore">

                <!-- 2. Right After Image (Customized Look with clip-path) -->
                <div class="comp-after-layer" id="compAfterLayer">
                  <img src="{asset_prefix}bedroom-warm-neutral.jpg" alt="Customized room look" class="comp-img-after" id="compImgAfter">
                  <div class="room-surface-overlays" id="roomSurfacesContainer">
                    <!-- Kitchen Overlays -->
                    <div class="surface-mask-layer" id="mask-kitchen-upper"></div>
                    <div class="surface-mask-layer" id="mask-kitchen-lower"></div>
                    <div class="surface-mask-layer" id="mask-kitchen-counter"></div>
                    <div class="surface-mask-layer" id="mask-kitchen-backsplash"></div>
                    <!-- Living Room Overlays -->
                    <div class="surface-mask-layer" id="mask-living-walls"></div>
                    <div class="surface-mask-layer" id="mask-living-accent"></div>
                    <div class="surface-mask-layer" id="mask-living-sofa"></div>
                    <div class="surface-mask-layer" id="mask-living-curtains"></div>
                    <div class="surface-mask-layer" id="mask-living-wood"></div>
                    <!-- Bedroom Overlays -->
                    <div class="surface-mask-layer" id="mask-bedroom-walls"></div>
                    <div class="surface-mask-layer" id="mask-bedroom-accent"></div>
                    <div class="surface-mask-layer" id="mask-bedroom-bed"></div>
                    <div class="surface-mask-layer" id="mask-bedroom-millwork"></div>
                  </div>
                  <div class="dynamic-swatch-tint" id="dynamicSwatchTint"></div>
                </div>'''

    pattern = re.compile(
        r'<div class="panel-tab-body">.*?<div class="dynamic-swatch-tint" id="dynamicSwatchTint"></div>\s*</div>',
        re.DOTALL
    )

    if pattern.search(content):
        updated = pattern.sub(new_panel_body, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f'Successfully updated {path}')
    else:
        print(f'Pattern not matched in {path}')

update_file('try-it-out/index.html', is_subfolder=True)
update_file('index.html', is_subfolder=False)

