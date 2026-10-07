"""Publish only individually reviewed, exact-pixel Fandom extraction profiles."""
from pathlib import Path
import base64
import json
from PIL import Image, ImageDraw
from extractFandomPrototype import ROOT, REFERENCES, extract

HQ = ROOT / 'public/game/animals-hq'
REVIEW = ROOT / 'public/game/experiments/fandom-extracted-all'
PROFILE_FILE = ROOT / 'scripts/fandomExtractionProfiles.json'
MANIFEST = ROOT / 'src/components/animals/hqArtwork.json'
REGIONS = ('farm', 'outback', 'savanna', 'northern', 'polar', 'jungle', 'moon')


def load_profiles():
    profiles = json.loads(PROFILE_FILE.read_text())
    assert len(profiles) == 42 and len({p['id'] for p in profiles}) == 42
    for profile in profiles:
        assert profile['region'] in REGIONS
        for field in ('size', 'shadow', 'shadow_box'):
            profile[field] = tuple(profile[field])
        if profile['signature']:
            profile['signature'] = tuple(profile['signature'])
        profile['animal_colors'] = tuple(tuple(c) for c in profile['animal_colors'])
    return profiles


def write_review(results, unresolved):
    rows = []
    records = []
    for region in REGIONS:
        members = [r for r in results if r[0]['region'] == region]
        sheet = Image.new('RGB', (900, len(members) * 210 + 60), '#10171b')
        draw = ImageDraw.Draw(sheet)
        draw.text((20, 16), f'{region.upper()} | original / Fandom reference / exact HQ extraction (native)', fill='#e6ecd9')
        for index, (profile, source, output, record) in enumerate(members):
            name, animal_id = profile['name'], profile['id']
            original_path = f'/game/animals/{region}/{animal_id}.png'
            hq_path = f'/game/animals-hq/{region}/{animal_id}.png'
            original_file = ROOT / 'public' / original_path.lstrip('/')
            original = Image.open(original_file).convert('RGBA') if original_file.exists() else None
            y = 60 + index * 210
            draw.text((20, y), name, fill='#e6ecd9')
            for x, image, label in ((20, original, 'ORIGINAL 32x23'), (260, source, 'FANDOM SOURCE'), (520, output, 'EXTRACTED HQ / NATIVE')):
                draw.text((x, y + 22), label, fill='#aab8aa')
                if image is not None:
                    sheet.paste(image, (x, y + 44), image)  # No resizing of review images.
                else:
                    draw.text((x, y + 44), 'No original sprite supplied', fill='#aab8aa')
            embedded = base64.b64encode((REFERENCES / f'{animal_id}.png').read_bytes()).decode()
            rows.append(f'''<section id="{animal_id}"><h2>{region.upper()} / {name}</h2><div class="comparison">
            <figure><figcaption>Original production sprite</figcaption><div class="stage original">{f'<img src="{original_path}" width="32" height="23" alt="Original {name}">' if original is not None else '<span>No original sprite supplied</span>'}</div><p>Existing sources remain untouched.</p></figure>
            <figure><figcaption>Fandom source / native</figcaption><div class="stage"><img src="data:image/png;base64,{embedded}" width="{source.width}" height="{source.height}" alt="Fandom source for {name}"></div><p>{source.width}x{source.height}</p></figure>
            <figure><figcaption>Extracted HQ / native</figcaption><div class="stage"><img src="{hq_path}" width="{output.width}" height="{output.height}" alt="Extracted {name}"></div><p>{output.width}x{output.height} / 2px padding</p></figure>
            <figure><figcaption>HQ / collection-size preview</figcaption><div class="stage card"><img src="{hq_path}" width="{output.width}" height="{output.height}" alt="HQ {name} card preview"></div><p>{profile['notes']}</p></figure>
            </div></section>''')
            records.append(record)
        sheet.save(REVIEW / f'{region}-comparison.png')
    html = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Disco Zoo — reviewed HQ animal extraction</title>
    <style>body{margin:0;padding:24px;background:#0b1014;color:#e6ecd9;font:14px system-ui}main{max-width:1200px;margin:auto}h1{font-size:26px}h2{font-size:20px;margin-top:40px}.comparison{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}figure{margin:0;padding:14px;background:#141d23}figcaption{min-height:36px;font-size:13px}.stage{min-height:170px;display:flex;align-items:center;justify-content:center;background:conic-gradient(#26343d 25%,#1b282f 0 50%,#26343d 0 75%,#1b282f 0) 0 0/16px 16px}.stage img{image-rendering:pixelated;object-fit:contain}.original img{width:96px;height:69px}.card img{width:auto;height:auto;max-width:112px;max-height:100px}p{color:#aab8aa;line-height:1.6;font-size:12px}button{padding:12px 16px;color:inherit;background:#26343d;border:1px solid #91a77c;cursor:pointer}button:focus-visible{outline:2px solid #d6efa6;outline-offset:3px}.light .stage{background:#e4e6dc}a{color:#d6efa6}@media(max-width:850px){.comparison{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:480px){body{padding:16px}.comparison{grid-template-columns:1fr}.original img{width:64px;height:46px}.card img{max-width:88px;max-height:80px}}</style>
    <main><h1>Reviewed animal extractions</h1><p>Exact source RGB; alpha-only masks; native pixels; 2px transparent padding. Original canonical sprites remain untouched. Browser scaling only, with crisp pixel rendering.</p><button id="background" aria-pressed="false">Light background</button>'''
    html += ''.join(rows)
    html += '<p>Unresolved: ' + (', '.join(r['animal'] for r in unresolved) or 'none') + '</p>'
    html += '''<p><a href="validation.json">Validation / source inventory</a></p></main><script>document.getElementById('background').onclick=function(){const light=document.body.classList.toggle('light');this.setAttribute('aria-pressed',String(light));this.textContent=light?'Checkerboard background':'Light background';};</script></html>'''
    (REVIEW / 'index.html').write_text(html, encoding='utf-8')
    (REVIEW / 'validation.json').write_text(json.dumps(dict(animals=records, unresolved=unresolved), indent=2) + '\n', encoding='utf-8')


def main():
    if not __debug__:
        raise RuntimeError('Run without -O: pixel validation must remain enabled')
    REVIEW.mkdir(parents=True, exist_ok=True)
    results, unresolved, manifest = [], [], {}
    for profile in load_profiles():
        animal_id, region = profile['id'], profile['region']
        try:
            assert profile['review_status'] == 'reviewed', 'Profile awaits visual review'
            staging = REVIEW / 'validated' / f'{animal_id}.png'
            source, output, record = extract(animal_id, profile, staging)
            destination = HQ / region / f'{animal_id}.png'
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(staging.read_bytes())
            record.update(region=region, name=profile['name'], localFile=str(destination.relative_to(ROOT)).replace('\\', '/'), notes=profile['notes'], reviewedShadowMask=dict(rgb=profile['shadow'], bounds=profile['shadow_box']), reviewedEnclosedBackground=profile['enclosed_background'])
            manifest[f'/game/animals/{region}/{animal_id}.png'] = dict(src=f'/game/animals-hq/{region}/{animal_id}.png', width=output.width, height=output.height)
            results.append((profile, source, output, record))
        except (AssertionError, FileNotFoundError, ValueError) as error:
            unresolved.append(dict(animal=animal_id, reason=str(error)))
    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    write_review(results, unresolved)
    print(json.dumps(dict(validated=len(results), unresolved=unresolved, dimensions={p['id']:o.size for p,s,o,r in results}), indent=2))


if __name__ == '__main__':
    main()
