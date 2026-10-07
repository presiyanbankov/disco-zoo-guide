"""Offline, three-sprite-only comparison. Never overwrites source icons."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/game/experiments/sprite-upscale'
SUBJECTS = ('kangaroo', 'koala', 'cockatoo')
METHODS = ('nearest-4x', 'scale2x-nearest-4x', 'scale4x')


def scale2x(image):
    """Scale2x's documented RGBA equality rules, with clamped boundaries."""
    width, height = image.size
    pixels = image.load()
    result = Image.new('RGBA', (width * 2, height * 2))
    target = result.load()
    for y in range(height):
        for x in range(width):
            e = pixels[x, y]
            b = pixels[x, max(0, y - 1)]
            d = pixels[max(0, x - 1), y]
            f = pixels[min(width - 1, x + 1), y]
            h = pixels[x, min(height - 1, y + 1)]
            values = (e, e, e, e)
            if b != h and d != f:
                values = (d if d == b else e, f if b == f else e,
                          d if d == h else e, f if h == f else e)
            for index, value in enumerate(values):
                target[x * 2 + index % 2, y * 2 + index // 2] = value
    return result


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGB', (920, 730), '#0b1014')
    draw = ImageDraw.Draw(sheet)
    draw.text((24, 20), 'THREE-SPRITE EXPERIMENT | 4x | source icons unchanged', fill='#e5e8df')
    draw.text((24, 44), 'Dark and light backgrounds; full RGBA equality; no invented colors.', fill='#a4afa7')
    metrics = []
    for row, subject in enumerate(SUBJECTS):
        path = ROOT / f'public/game/animals/outback/{subject}.png'
        before = hashlib.sha256(path.read_bytes()).hexdigest()
        source = Image.open(path).convert('RGBA')
        assert source.size == (32, 23)
        twice = scale2x(source)
        variants = (source.resize((128, 92), Image.Resampling.NEAREST),
                    twice.resize((128, 92), Image.Resampling.NEAREST), scale2x(twice))
        palette = set(source.get_flattened_data())
        baseline = list(variants[0].get_flattened_data())
        draw.text((24, 85 + row * 212), subject.upper(), fill='#e5e8df')
        for col, (method, variant) in enumerate(zip(METHODS, variants)):
            assert variant.size == (128, 92)
            assert set(variant.get_flattened_data()).issubset(palette)
            filename = f'{subject}-{method}.png'
            variant.save(OUT / filename)
            changed = sum(a != b for a, b in zip(baseline, variant.get_flattened_data()))
            metrics.append({'file': filename, 'changedPixelsVsNearest': changed,
                            'size': [128, 92], 'sourceSHA256': before,
                            'rgbaPalettePreserved': True})
            x, y = 24 + col * 296, 108 + row * 212
            draw.text((x, y), method, fill='#c8d3c4')
            for offset, color in ((0, '#171e24'), (138, '#deded5')):
                draw.rectangle((x + offset, y + 22, x + offset + 132, y + 120), fill=color)
                sheet.paste(variant, (x + offset + 2, y + 25), variant)
            draw.text((x, y + 132), f'{changed} pixels changed vs nearest', fill='#a4afa7')
        assert hashlib.sha256(path.read_bytes()).hexdigest() == before
    sheet.save(OUT / 'comparison.png')
    (OUT / 'metrics.json').write_text(json.dumps(metrics, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(metrics, indent=2))


if __name__ == '__main__':
    main()
