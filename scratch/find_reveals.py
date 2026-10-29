with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
for m in re.finditer(r'<[^>]*class="[^"]*reveal-on-scroll[^"]*"[^>]*>', text):
    print(m.group(0)[:120])
