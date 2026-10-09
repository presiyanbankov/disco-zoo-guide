"""Individually reviewed Timeless profiles; alpha-only, source-hash protected.

Uncertain artwork is explicitly skipped, never sent through a generic mask.
Reuses the established connectivity helpers without changing classic profiles.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image
from extractFandomPrototype import ROOT, REFERENCES, exterior_background, components, bounds
from reviewedAlphaMask import reviewed_pixels


def main():
    profiles = json.loads((ROOT / 'scripts/timelessExtractionProfiles.json').read_text())
    manifest_path = ROOT / 'src/components/animals/hqArtwork.json'
    manifest = json.loads(manifest_path.read_text())
    validation = []
    for profile in profiles:
        path = REFERENCES / (profile['id'] + '.png')
        assert hashlib.sha256(path.read_bytes()).hexdigest() == profile['sha256']
        source = Image.open(path).convert('RGBA')
        assert list(source.size) == profile['sourceSize']
        if profile['status'] != 'HQ':
            validation.append(dict(id=profile['id'], status='fallback'))
            continue
        points = {(x, y) for y in range(source.height) for x in range(source.width)}
        if profile['method'] == 'reviewed-mask':
            retained = reviewed_pixels(source, profile)
        elif profile['method'] == 'opaque-alpha':
            # Rhinoceros alpha 53 is a reviewed shadow, not an animal edge.
            # Horologium already has binary alpha. Keep its opaque internal black.
            retained = {p for p in points if source.getpixel(p)[3] == 255}
        else:
            bg = tuple(profile['backgroundRgb'])
            shadow = tuple(profile['shadowRgb'])
            x0, y0, x1, y1 = profile['shadowBox']
            nuisance = {(x, y) for y in range(y0, y1) for x in range(x0, x1)
                        if source.getpixel((x, y))[:3] == shadow}
            removed = nuisance | exterior_background(source, bg, nuisance)
            for opening in profile['enclosedBackground']:
                candidates = {p for p in points - removed if source.getpixel(p)[:3] == bg}
                hole = next(c for c in components(candidates) if tuple(opening['seed']) in c)
                assert len(hole) == opening['count']
                removed |= hole
            retained = points - removed
            assert all(source.getpixel(p)[:3] not in (bg, shadow) for p in retained)
        assert len(retained) == profile['retainedPixels']
        b = bounds(retained)
        crop = (b[0] - 2, b[1] - 2, b[2] + 2, b[3] + 2)
        masked = source.copy()
        for p in points - retained:
            masked.putpixel(p, source.getpixel(p)[:3] + (0,))
        output = masked.crop(crop)  # Integer crop only; never resample or resize.
        assert set(output.getchannel('A').get_flattened_data()) == {0, 255}
        assert output.getchannel('A').getbbox() == (2, 2, output.width - 2, output.height - 2)
        for x, y in retained:
            assert output.getpixel((x - crop[0], y - crop[1])) == source.getpixel((x, y))
        src = f"/game/animals-hq/{profile['region']}/{profile['id']}.png"
        destination = ROOT / 'public' / src.lstrip('/')
        destination.parent.mkdir(parents=True, exist_ok=True)
        output.save(destination)
        entry = dict(src=src, width=output.width, height=output.height)
        if profile.get('originalFallback') is False:
            entry['originalFallback'] = False
        manifest[f"/game/animals/{profile['region']}/{profile['id']}.svg"] = entry
        validation.append(dict(id=profile['id'], status='HQ', sourceSize=list(source.size),
                               outputSize=list(output.size), crop=list(crop), retainedPixels=len(retained),
                               sourceSha256=profile['sha256'], maskSha256=profile.get('maskSha256'),
                               rgbChanges=0, binaryAlpha=True, padding=2, resampled=False))
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
    (REFERENCES / 'timeless-validation.json').write_text(json.dumps(validation, indent=2) + '\n')
    print(json.dumps(validation, indent=2))


if __name__ == '__main__':
    main()
