from urllib.parse import urljoin, urlparse

def test_route(page_url, script_src):
    # script_src absolute
    base = urljoin(page_url, script_src)
    site_base = urljoin(base, './')
    site_base_path = urlparse(site_base).path
    page_path = urlparse(page_url).path

    print(f"page={page_url}")
    print(f"  script_src={script_src} -> absolute={base}")
    print(f"  site_base_path={site_base_path}")
    print(f"  page_path={page_path}")

test_route('http://localhost:8080/try-it-out/', '../script.js')
test_route('http://localhost:8080/try-it-out', '../script.js')
test_route('http://localhost:8080/', 'script.js')
test_route('file:///C:/demo/try-it-out/index.html', '../script.js')
