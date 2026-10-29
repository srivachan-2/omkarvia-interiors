with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
idx1 = text.find('id="homepageView"')
idx2 = text.find('<!-- end #homepageView -->')
home_html = text[idx1:idx2]
for m in re.finditer(r'<section([^>]*)>', home_html):
    print(m.group(0))
