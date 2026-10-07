"""Four approved references only. Exact RGB + binary alpha, no resampling."""
from collections import deque
from pathlib import Path
import argparse
import base64
import hashlib
import io
import json
import urllib.request
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
REFERENCES = ROOT / 'assets/reference/fandom'
OUTPUT = ROOT / 'public/game/experiments/fandom-extracted'
PADDING = 2
# These are reviewed source-space exceptions, not a universal animal extractor.
# Expected palettes/counts validate every animal pixel; they do not select pixels.
PROFILES = {
    'pig': dict(region='farm', cdn='3/30/Pig.png', size=(120, 120),
        sha256='4c0e575ec3e8f79723b5a87607a6297cecce6dae979922943ce23fed50190ef1',
        shadow=(136, 130, 93), shadow_box=(26, 106, 96, 114), signature=(146, 140, 99),
        animal_colors=((251, 192, 208), (232, 174, 190), (0, 0, 0), (136, 136, 136)), count=2496,
        enclosed_background_seed=(89, 66), enclosed_background_count=16),
    'kangaroo': dict(region='outback', cdn='5/56/Kangaroo.png', size=(120, 120),
        sha256='2e65973c19776b4b3057a4a5244c6b77bc9137e5ce2be2429ac8d31e8fcb7083',
        shadow=(136, 130, 93), shadow_box=(23, 106, 101, 114), signature=(146, 140, 99),
        animal_colors=((169, 108, 58), (239, 217, 207), (206, 186, 174), (129, 66, 35),
                       (0, 0, 0), (136, 136, 136)), count=2384),
    'cockatoo': dict(region='outback', cdn='b/b6/Cockatoo.png', size=(120, 120),
        sha256='be9c5cbb6ed2208d4f1be738fa232433b0ca71d3f398a78a9b57c13ca0ac7947',
        shadow=(135, 126, 96), shadow_box=(25, 106, 90, 114), signature=(145, 135, 102),
        animal_colors=((255, 255, 255), (217, 217, 217), (255, 245, 139), (247, 239, 155),
                       (66, 66, 66), (0, 0, 0), (136, 136, 136)), count=2256),
    'bear': dict(region='northern', cdn='a/a4/Bear.png', size=(150, 150),
        sha256='dfc3dc2cbd2a7afab098c76d6913391aa9d09e8f916cd88e5ef1ecc226fdb1e5',
        shadow=(136, 131, 93), shadow_box=(16, 129, 123, 141), signature=None,
        animal_colors=((142, 92, 28), (118, 74, 17), (0, 0, 0), (136, 136, 136)), count=6660),
}


def bounds(points):
    return (min(x for x, y in points), min(y for x, y in points),
            max(x for x, y in points) + 1, max(y for x, y in points) + 1)


def components(points, diagonal=False):
    remaining = set(points)
    offsets = ((-1, 0), (1, 0), (0, -1), (0, 1))
    if diagonal:
        offsets += ((-1, -1), (1, -1), (-1, 1), (1, 1))
    result = []
    while remaining:
        seed = min(remaining, key=lambda p: (p[1], p[0]))
        remaining.remove(seed)
        part, queue = {seed}, deque([seed])
        while queue:
            x, y = queue.popleft()
            for dx, dy in offsets:
                neighbor = (x + dx, y + dy)
                if neighbor in remaining:
                    remaining.remove(neighbor)
                    part.add(neighbor)
                    queue.append(neighbor)
        result.append(part)
    return result


def exterior_background(source, background, removed):
    """Exact-color four-connected fill; already removed nuisance pixels open gaps."""
    width, height = source.size
    def eligible(p):
        return p in removed or source.getpixel(p)[:3] == background
    seeds = {(x, y) for y in range(height) for x in range(width)
             if (x in (0, width - 1) or y in (0, height - 1)) and eligible((x, y))}
    reached, queue = set(seeds), deque(sorted(seeds))
    while queue:
        x, y = queue.popleft()
        for p in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= p[0] < width and 0 <= p[1] < height and p not in reached and eligible(p):
                reached.add(p)
                queue.append(p)
    return reached


def extract(name, profile, output_path=None):
    path = REFERENCES / f'{name}.png'
    raw = path.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == profile['sha256'], f'{name}: source changed; re-review required'
    with Image.open(io.BytesIO(raw)) as image:
        assert image.format == 'PNG' and image.size == profile['size']
        source = image.convert('RGBA')  # RGB channel values are unchanged.
    width, height = source.size
    all_points = {(x, y) for y in range(height) for x in range(width)}
    corners = [source.getpixel(p)[:3] for p in ((0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1))]
    assert len(set(corners)) == 1, f'{name}: ambiguous corners'
    assert source.getchannel('A').getextrema() == (255, 255)
    first = exterior_background(source, corners[0], set())
    initial_parts = components(all_points - first, diagonal=True)
    nuisance, removed_parts = set(), []
    for role, color, box in (
        ('shadow', profile['shadow'], profile['shadow_box']),
        ('signature', profile['signature'], (102, 114, 119, 119)),
    ):
        if color is None:
            continue
        x0, y0, x1, y1 = box
        candidates = {(x, y) for y in range(y0, y1) for x in range(x0, x1)
                      if source.getpixel((x, y))[:3] == color}
        assert candidates, f'{name}: expected {role} not found'
        for part in components(candidates, diagonal=True):
            nuisance.update(part)
            removed_parts.append(dict(role=role, pixels=len(part), bounds=bounds(part), rgb=color))
    # The shadow used to seal background pockets under feet; reopen by topology.
    removed = first | nuisance | exterior_background(source, corners[0], nuisance)
    openings = list(profile.get('enclosed_background', []))
    if 'enclosed_background_seed' in profile:
        openings.append(dict(seed=profile['enclosed_background_seed'], count=profile['enclosed_background_count'], label='tail-opening'))
    for opening in openings:
        # Only individually reviewed openings; never clear enclosed colors globally.
        seed = tuple(opening['seed'])
        candidates = {p for p in all_points - removed if source.getpixel(p)[:3] == corners[0]}
        hole = next((part for part in components(candidates) if seed in part), set())
        assert len(hole) == opening['count'], f'{name}: reviewed opening changed'
        removed.update(hole)
        removed_parts.append(dict(role=f"reviewed-{opening['label']}", pixels=len(hole), bounds=bounds(hole), rgb=corners[0]))
    retained = all_points - removed
    assert retained, f'{name}: empty foreground'
    animal_box = bounds(retained)
    crop = (animal_box[0] - PADDING, animal_box[1] - PADDING,
            animal_box[2] + PADDING, animal_box[3] + PADDING)
    assert crop[0] >= 0 and crop[1] >= 0 and crop[2] <= width and crop[3] <= height
    masked = source.copy()
    for point in removed:
        masked.putpixel(point, source.getpixel(point)[:3] + (0,))
    output = masked.crop(crop)  # Integer translation only. No resize/resample call.
    # Independent reviewed pixel coverage: every source animal-color pixel survives.
    expected = {p for p in all_points if source.getpixel(p)[:3] in profile['animal_colors']}
    assert len(expected) == profile['count'] and retained == expected, f'{name}: lost or extra pixels; stop'
    assert set(output.getchannel('A').get_flattened_data()) == {0, 255}
    for y in range(output.height):
        for x in range(output.width):
            original = source.getpixel((x + crop[0], y + crop[1]))
            pixel = output.getpixel((x, y))
            assert pixel[:3] == original[:3], f'{name}: recolored pixel'
            assert pixel[3] in (0, original[3])
    output_path = output_path or OUTPUT / f'{name}.png'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output.save(output_path)
    with Image.open(output_path) as saved:
        assert saved.convert('RGBA').tobytes() == output.tobytes()
    palette = lambda points: sorted(set(source.getpixel(p)[:3] for p in points))
    record = dict(animal=name, sourceURL=source_url(profile), filePage=profile.get('file_page', f'https://discozoo.fandom.com/wiki/File:{name.capitalize()}.png'),
        sourceSHA256=profile['sha256'], sourceDimensions=source.size, animalBounds=animal_box,
        cropBounds=crop, outputDimensions=output.size, padding=PADDING, backgroundRGB=corners[0],
        sourceRGBColors=palette(all_points), retainedRGBColors=palette(retained),
        animalPixels=len(retained), missingAnimalPixels=len(expected - retained), addedAnimalPixels=len(retained - expected),
        recoloredPixels=0, artificialSemitransparentPixels=0, alphaValues=[0, 255],
        initialForegroundComponents=[dict(pixels=len(p), bounds=bounds(p)) for p in initial_parts],
        removedComponents=removed_parts, finalForegroundComponents=[dict(pixels=len(p), bounds=bounds(p)) for p in components(retained, diagonal=True)],
        sourcePixelsPerOutputPixel=1, scaleFactor=1, resampling=False,
        outputSHA256=hashlib.sha256(output_path.read_bytes()).hexdigest())
    return source, output, record


def source_url(profile):
    return f"https://static.wikia.nocookie.net/discozoo/images/{profile['cdn']}/revision/latest?format=original"


def comparison(results):
    sheet = Image.new('RGB', (900, 4 * 210 + 60), '#10171b')
    draw = ImageDraw.Draw(sheet)
    draw.text((20, 16), 'Native pixels only | current / Fandom reference / exact foreground', fill='#e6ecd9')
    rows = []
    for index, (name, source, output, record) in enumerate(results):
        profile = PROFILES[name]
        current_path = f'/game/animals/{profile["region"]}/{name}.png'
        current = Image.open(ROOT / 'public' / current_path.lstrip('/')).convert('RGBA')
        y = 60 + index * 210
        draw.text((20, y), name.upper(), fill='#e6ecd9')
        for x, image, label in ((20, current, 'CURRENT 32x23'), (260, source, 'FANDOM SOURCE'), (520, output, 'EXTRACTED / NATIVE')):
            draw.text((x, y + 22), label, fill='#aab8aa')
            sheet.paste(image, (x, y + 44), image)
        encoded = base64.b64encode((REFERENCES / f'{name}.png').read_bytes()).decode()
        rows.append(f'''<section><h2>{name.capitalize()}</h2><div class="comparisons">
          <figure><figcaption>Current production sprite</figcaption><div class="stage card"><img src="{current_path}" width="32" height="23" alt="Current {name}"></div><p>32 × 23 source; current card size</p></figure>
          <figure><figcaption>Fandom reference / native</figcaption><div class="stage"><img src="data:image/png;base64,{encoded}" width="{source.width}" height="{source.height}" alt="Fandom {name} with background"></div><p>{source.width} × {source.height}</p></figure>
          <figure><figcaption>Extracted / native</figcaption><div class="stage"><img src="{name}.png" width="{output.width}" height="{output.height}" alt="Extracted {name} at native size"></div><p>{output.width} × {output.height}; 2px padding</p></figure>
          <figure><figcaption>Extracted / card-size preview</figcaption><div class="stage card"><img src="{name}.png" width="{output.width}" height="{output.height}" alt="Extracted {name} at card size"></div><p>Contained within 96 × 69 (64 × 46 on phones)</p></figure>
          </div></section>''')
    sheet.save(OUTPUT / 'comparison.png')
    html = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fandom exact-pixel extraction prototype</title>
    <style>body{margin:0;padding:24px;background:#0b1014;color:#e6ecd9;font:14px system-ui}main{max-width:1200px;margin:auto}h1{font-size:26px}h2{margin-top:32px}.comparisons{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}figure{margin:0;padding:14px;background:#141d23}figcaption{min-height:36px;font-size:13px}.stage{min-height:170px;display:flex;align-items:center;justify-content:center;background:conic-gradient(#26343d 25%,#1b282f 0 50%,#26343d 0 75%,#1b282f 0) 0 0/16px 16px}.stage img{image-rendering:pixelated;object-fit:contain}.card img{width:auto;height:auto;max-width:96px;max-height:69px}.card img[src^="/game/animals/"]{width:96px;height:69px;max-width:none;max-height:none}p{color:#aab8aa;line-height:1.6;font-size:12px}button{padding:12px 16px;color:inherit;background:#26343d;border:1px solid #91a77c;cursor:pointer}button:focus-visible{outline:2px solid #d6efa6;outline-offset:3px}.light .stage{background:#e4e6dc}a{color:#d6efa6}@media(max-width:850px){.comparisons{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){body{padding:16px}.comparisons{grid-template-columns:1fr}.card img{max-width:64px;max-height:46px}.card img[src^="/game/animals/"]{width:64px;height:46px}}</style>
    <main><h1>Exact-pixel foreground extraction — four-animal prototype</h1><p>No resampling, color changes, blur, upscaling or AI. Current production assets are untouched. Card-size previews use browser nearest-neighbor rendering only; extracted PNGs retain native source pixels.</p><button id="background" aria-pressed="false">Light background</button>'''
    html += ''.join(rows)
    html += '''<p><a href="comparison.png">Native-size contact sheet</a> · <a href="validation.json">Pixel validation</a></p></main><script>document.getElementById('background').onclick=function(){const light=document.body.classList.toggle('light');this.setAttribute('aria-pressed',String(light));this.textContent=light?'Checkerboard background':'Light background';};</script></html>'''
    (OUTPUT / 'index.html').write_text(html, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true', help='Fetch missing approved reference PNGs; never overwrite existing references')
    args = parser.parse_args()
    REFERENCES.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    results = []
    for name, profile in PROFILES.items():
        path = REFERENCES / f'{name}.png'
        if args.download and not path.exists():
            request = urllib.request.Request(source_url(profile), headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://discozoo.fandom.com/'})
            data = urllib.request.urlopen(request, timeout=30).read()
            assert hashlib.sha256(data).hexdigest() == profile['sha256'], f'{name}: changed source; do not extract'
            path.write_bytes(data)
        source, output, record = extract(name, profile)
        results.append((name, source, output, record))
    comparison(results)
    (OUTPUT / 'validation.json').write_text(json.dumps([r[3] for r in results], indent=2) + '\n', encoding='utf-8')
    print(json.dumps([dict(animal=r[0], source=r[3]['sourceDimensions'], output=r[3]['outputDimensions'], animalPixels=r[3]['animalPixels'], removedComponents=r[3]['removedComponents']) for r in results], indent=2))


if __name__ == '__main__':
    main()
