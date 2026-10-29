import subprocess
import time
import urllib.request

server = subprocess.Popen(['python', '-m', 'http.server', '8089'])
time.sleep(2)
try:
    urls = [
        'http://localhost:8089/try-it-out/',
        'http://localhost:8089/index.html',
        'http://localhost:8089/styles.css',
        'http://localhost:8089/script.js',
        'http://localhost:8089/assets/studio/kitchen-warm-neutral.jpg',
        'http://localhost:8089/assets/studio/masks/kitchen-upper-cabinets.png',
        'http://localhost:8089/assets/studio/masks/living-sofa.png',
        'http://localhost:8089/assets/studio/masks/bedroom-bed.png'
    ]
    for u in urls:
        resp = urllib.request.urlopen(u)
        print(f'{u} -> HTTP {resp.status} (length: {len(resp.read())} bytes)')
finally:
    server.terminate()
    server.wait()
print('Server probe complete!')

