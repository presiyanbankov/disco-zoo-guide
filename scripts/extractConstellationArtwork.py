"""Replay six individually reviewed Constellation alpha masks, no thresholds."""
import hashlib
import json
from PIL import Image
from reviewedAlphaMask import ROOT, REFERENCES, reviewed_pixels, alpha_only_output


def main():
    profiles = json.loads((ROOT / 'scripts/constellationExtractionProfiles.json').read_text())
    manifest_path = ROOT / 'src/components/animals/hqArtwork.json'
    manifest = json.loads(manifest_path.read_text())
    records = []
    for profile in profiles:
        path = REFERENCES / (profile['id'] + '.png')
        assert hashlib.sha256(path.read_bytes()).hexdigest() == profile['sha256']
        with Image.open(path) as original:
            assert original.format == 'PNG' and list(original.size) == profile['sourceSize']
            source = original.convert('RGBA')
        retained = reviewed_pixels(source, profile)
        output, crop = alpha_only_output(source, retained)
        src = f"/game/animals-hq/{profile['region']}/{profile['id']}.png"
        destination = ROOT / 'public' / src.lstrip('/')
        destination.parent.mkdir(parents=True, exist_ok=True)
        output.save(destination)
        manifest[f"/game/animals/{profile['region']}/{profile['id']}.svg"] = dict(
            src=src, width=output.width, height=output.height, originalFallback=False)
        records.append(dict(id=profile['id'], status='HQ', sourceSize=list(source.size),
                            outputSize=list(output.size), crop=list(crop), retainedPixels=len(retained),
                            sourceSha256=profile['sha256'], maskSha256=profile['maskSha256'],
                            rgbChanges=0, binaryAlpha=True, padding=2, resampled=False))
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
    (REFERENCES / 'constellation-validation.json').write_text(json.dumps(records, indent=2) + '\n')
    print(json.dumps(records, indent=2))


if __name__ == '__main__':
    main()
