import urllib.request
import re
import sys

base_urls = [
    'http://localhost:8080/',
    'http://localhost:8080/projects',
    'http://localhost:8080/projects/'
]

print("=== TESTING HTTP ROUTES ===")
for url in base_urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req)
        status = resp.getcode()
        final_url = resp.geturl()
        print(f"URL: {url:<32} -> Status: {status} (Final: {final_url})")
        assert status == 200, f"Expected 200 for {url}"
    except Exception as e:
        print(f"FAILED {url}: {e}")
        sys.exit(1)

print("\n=== TESTING PROJECTS PAGE CONTENT & ASSETS ===")
req = urllib.request.Request('http://localhost:8080/projects', headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req)
html = resp.read().decode('utf-8')

title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
title = title_match.group(1).strip() if title_match else "NO TITLE"
print("Page Title:", title)
assert "Projects" in title, "Title must mention Projects"

nav_match = re.search(r'<nav[^>]*id=["\']siteNav["\'][^>]*>(.*?)</nav>', html, re.DOTALL)
if nav_match:
    nav_links = re.findall(r'<a[^>]*>(.*?)</a>', nav_match.group(1))
    print("Header Nav Links:", [re.sub(r'<[^>]*>', '', l).strip() for l in nav_links])
    assert any("Projects" in l for l in nav_links), "Projects must be in nav links"

# Check all images in the projects page
imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
print(f"Total img tags on projects page: {len(imgs)}")

broken = []
for src in set(imgs):
    img_url = f"http://localhost:8080/{src.lstrip('/')}"
    try:
        img_resp = urllib.request.urlopen(img_url)
        if img_resp.getcode() != 200:
            broken.append((src, img_resp.getcode()))
    except Exception as e:
        broken.append((src, str(e)))

if broken:
    print(f"BROKEN IMAGES ({len(broken)}):", broken)
    sys.exit(1)
else:
    print(f"ALL {len(set(imgs))} UNIQUE IMAGES LOADED SUCCESSFULLY WITH HTTP 200 OK!")

print("\n=== TESTING HOMEPAGE VIEW ALL PROJECTS CTA ===")
home_resp = urllib.request.urlopen('http://localhost:8080/')
home_html = home_resp.read().decode('utf-8')

assert 'id="viewAllProjectsBtn"' in home_html, "View All Projects CTA must be present on homepage"
assert 'href="/projects"' in home_html, "Link to /projects must be present on homepage"

# Count service cards in #services
svc_section = re.search(r'<section[^>]+id=["\']services["\'][^>]*>(.*?)</section>', home_html, re.DOTALL)
if svc_section:
    cards = re.findall(r'<article class=["\']service-card', svc_section.group(1))
    print(f"Homepage preview project cards count: {len(cards)}")
    assert len(cards) == 6, f"Expected 6 preview cards on homepage, got {len(cards)}"

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
