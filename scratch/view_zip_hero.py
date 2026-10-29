import zipfile, re

z_path = r'c:\Users\sriva_d9116k2\Downloads\omkarvia-professional-merged.zip'
with zipfile.ZipFile(z_path) as z:
    html = z.read('omkarvia-website-demo/index.html').decode('utf-8')
    hero_match = re.search(r'(<section class="hero"[^>]*>.*?</section>)', html, re.DOTALL)
    if hero_match:
        with open('scratch/original_hero.html', 'w', encoding='utf-8') as out:
            out.write(hero_match.group(1))
        print("Hero written to scratch/original_hero.html")
