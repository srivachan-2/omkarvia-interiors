import os
from PIL import Image, ImageDraw, ImageFilter

os.makedirs('assets/studio/masks', exist_ok=True)
W, H = 1376, 768

def save_mask(name, draw_fn):
    img2x = Image.new('L', (W * 2, H * 2), 0)
    draw = ImageDraw.Draw(img2x)
    draw_fn(draw, 2)
    img2x = img2x.filter(ImageFilter.GaussianBlur(radius=2))
    img = img2x.resize((W, H), Image.Resampling.LANCZOS)
    img.save(f'assets/studio/masks/{name}.png')
    print(f'Generated assets/studio/masks/{name}.png')

# ----------------- KITCHEN MASKS -----------------

def draw_kitchen_upper(draw, s):
    # Left wall upper cabinets above counter/shelf
    draw.polygon([
        (410*s, 140*s), (520*s, 140*s), (520*s, 330*s), (410*s, 330*s)
    ], fill=255)
    # Hood vent enclosure and upper trim
    draw.polygon([
        (520*s, 140*s), (665*s, 140*s), (665*s, 290*s), (520*s, 290*s)
    ], fill=255)
    # Right upper wall cabinets
    draw.polygon([
        (665*s, 140*s), (790*s, 140*s), (790*s, 290*s), (665*s, 290*s)
    ], fill=255)
    # Tall pantry cabinet run on right (up to glass door)
    draw.polygon([
        (790*s, 140*s), (955*s, 140*s), (955*s, 425*s), (790*s, 425*s)
    ], fill=255)

def draw_kitchen_lower(draw, s):
    # Left perimeter lower cabinets (drawers & doors down to kickplate)
    draw.polygon([
        (85*s, 430*s), (365*s, 430*s), (365*s, 560*s), (415*s, 560*s),
        (415*s, 580*s), (85*s, 575*s)
    ], fill=255)
    # Island front panels
    draw.polygon([
        (425*s, 465*s), (975*s, 465*s), (975*s, 645*s), (425*s, 645*s)
    ], fill=255)

def draw_kitchen_countertop(draw, s):
    # Perimeter countertop slab
    draw.polygon([
        (85*s, 400*s), (370*s, 400*s), (370*s, 430*s), (85*s, 430*s)
    ], fill=255)
    # Island countertop slab (including waterfall edges)
    draw.polygon([
        (395*s, 420*s), (1005*s, 420*s), (1005*s, 465*s), (395*s, 465*s)
    ], fill=255)
    # Left waterfall edge
    draw.polygon([
        (395*s, 420*s), (425*s, 420*s), (425*s, 680*s), (395*s, 680*s)
    ], fill=255)
    # Right waterfall edge
    draw.polygon([
        (975*s, 420*s), (1005*s, 420*s), (1005*s, 680*s), (975*s, 680*s)
    ], fill=255)

def draw_kitchen_backsplash(draw, s):
    # Backsplash wall behind stove and under upper cabinets
    draw.polygon([
        (360*s, 330*s), (790*s, 330*s), (790*s, 410*s), (360*s, 410*s)
    ], fill=255)

save_mask('kitchen-upper-cabinets', draw_kitchen_upper)
save_mask('kitchen-lower-cabinets', draw_kitchen_lower)
save_mask('kitchen-countertop', draw_kitchen_countertop)
save_mask('kitchen-backsplash', draw_kitchen_backsplash)

# ----------------- LIVING ROOM MASKS -----------------

def draw_living_accent_wall(draw, s):
    # Fluted wood media wall behind TV
    draw.polygon([
        (65*s, 15*s), (445*s, 15*s), (445*s, 470*s), (65*s, 470*s)
    ], fill=255)
    # Cut out TV display screen
    draw.polygon([
        (215*s, 205*s), (405*s, 205*s), (405*s, 450*s), (215*s, 450*s)
    ], fill=0)

def draw_living_sofa(draw, s):
    # Curved bouclé sofa
    draw.polygon([
        (560*s, 550*s), (580*s, 460*s), (640*s, 440*s), (800*s, 435*s),
        (960*s, 440*s), (1025*s, 470*s), (1025*s, 560*s), (940*s, 600*s),
        (720*s, 600*s), (680*s, 550*s), (560*s, 550*s)
    ], fill=255)
    # Cut out coffee table overlap and vase
    draw.polygon([
        (580*s, 530*s), (880*s, 530*s), (880*s, 610*s), (580*s, 610*s)
    ], fill=0)

def draw_living_curtains(draw, s):
    # Sheer drapes on left of window
    draw.polygon([
        (535*s, 120*s), (760*s, 120*s), (760*s, 550*s), (535*s, 550*s)
    ], fill=255)
    # Sheer drapes on right of window
    draw.polygon([
        (985*s, 120*s), (1180*s, 120*s), (1180*s, 550*s), (985*s, 550*s)
    ], fill=255)

def draw_living_walls(draw, s):
    # Ceiling cove and surrounding room walls
    draw.polygon([
        (0*s, 0*s), (1376*s, 0*s), (1376*s, 120*s), (0*s, 120*s)
    ], fill=255)
    # Wall alcove behind floor lamp
    draw.polygon([
        (445*s, 120*s), (535*s, 120*s), (535*s, 550*s), (445*s, 550*s)
    ], fill=255)

def draw_living_wood(draw, s):
    # TV console / credenza
    draw.polygon([
        (65*s, 460*s), (485*s, 460*s), (485*s, 685*s), (65*s, 685*s)
    ], fill=255)
    # Coffee table
    draw.polygon([
        (580*s, 535*s), (895*s, 535*s), (895*s, 755*s), (580*s, 755*s)
    ], fill=255)

save_mask('living-accent-wall', draw_living_accent_wall)
save_mask('living-sofa', draw_living_sofa)
save_mask('living-curtains', draw_living_curtains)
save_mask('living-walls', draw_living_walls)
save_mask('living-wood', draw_living_wood)

# ----------------- BEDROOM MASKS -----------------

def draw_bedroom_accent_wall(draw, s):
    # Fluted timber paneling
    draw.polygon([
        (360*s, 230*s), (1020*s, 230*s), (1020*s, 560*s), (360*s, 560*s)
    ], fill=255)

def draw_bedroom_walls(draw, s):
    # Upper headboard wall above the fluting
    draw.polygon([
        (360*s, 90*s), (1020*s, 90*s), (1020*s, 230*s), (360*s, 230*s)
    ], fill=255)
    # Right wall alcove with picture frames
    draw.polygon([
        (1020*s, 90*s), (1310*s, 90*s), (1310*s, 580*s), (1020*s, 580*s)
    ], fill=255)

def draw_bedroom_bed(draw, s):
    # Bed headboard
    draw.polygon([
        (525*s, 350*s), (845*s, 350*s), (845*s, 475*s), (525*s, 475*s)
    ], fill=255)
    # Bed duvet quilt, throw blanket, bed frame
    draw.polygon([
        (395*s, 470*s), (970*s, 470*s), (970*s, 670*s), (395*s, 670*s)
    ], fill=255)

def draw_bedroom_millwork(draw, s):
    # Left nightstand
    draw.polygon([
        (395*s, 470*s), (505*s, 470*s), (505*s, 585*s), (395*s, 585*s)
    ], fill=255)
    # Right nightstand
    draw.polygon([
        (870*s, 470*s), (990*s, 470*s), (990*s, 585*s), (870*s, 585*s)
    ], fill=255)

save_mask('bedroom-accent-wall', draw_bedroom_accent_wall)
save_mask('bedroom-walls', draw_bedroom_walls)
save_mask('bedroom-bed', draw_bedroom_bed)
save_mask('bedroom-millwork', draw_bedroom_millwork)

print('Masks regenerated with precise boundaries!')
