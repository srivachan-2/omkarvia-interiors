import os, re

fixes = {
    'assets/brands/asian-paints.svg': (184.012, 42.291),
    'assets/brands/hafele.svg': (892.913, 153.071),
    'assets/brands/philips.svg': (499.76, 91.636),
    'assets/brands/wipro.svg': (376.8, 296.5),
}

for path, (w, h) in fixes.items():
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            c = f.read()
        if 'viewBox' not in c:
            c = re.sub(r'<svg([^>]*)>', rf'<svg\1 viewBox="0 0 {w} {h}">', c, count=1)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(c)
            print(f'Added viewBox to {path}')
        else:
            print(f'{path} already has viewBox')
