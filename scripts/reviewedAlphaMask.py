"""Apply a saved source-coordinate mask; never infer a new production boundary.

Mask preparation is a visual review step. Replay requires both source and mask
hashes, exact native dimensions, binary alpha and reviewed detail/gap anchors.
"""
import hashlib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REFERENCES = ROOT / 'assets/reference/fandom'


def reviewed_pixels(source, profile):
    mask_path = REFERENCES / profile['mask']
    assert hashlib.sha256(mask_path.read_bytes()).hexdigest() == profile['maskSha256'], 'Mask changed; re-review required'
    with Image.open(mask_path) as mask:
        assert mask.mode == 'L' and mask.size == source.size
        assert set(mask.get_flattened_data()) == {0, 255}
        for point in profile['protectedPixels']:
            assert mask.getpixel(tuple(point)) == 255, f'Lost reviewed detail: {point}'
        for point in profile['backgroundChecks']:
            assert mask.getpixel(tuple(point)) == 0, f'Blocked reviewed opening: {point}'
        retained = {(x, y) for y in range(mask.height) for x in range(mask.width)
                    if mask.getpixel((x, y)) == 255}
    assert len(retained) == profile['retainedPixels']
    return retained


def alpha_only_output(source, retained):
    # Exact integer source coordinates. Crop may add transparent padding outside
    # a tight source margin, but it never invents visible pixels or resamples.
    bounds = (min(x for x, y in retained), min(y for x, y in retained),
              max(x for x, y in retained) + 1, max(y for x, y in retained) + 1)
    crop = (bounds[0] - 2, bounds[1] - 2, bounds[2] + 2, bounds[3] + 2)
    mask = Image.new('L', source.size)
    for point in retained:
        mask.putpixel(point, 255)
    output = source.copy()
    output.putalpha(mask)  # Only alpha changes. Source RGB stays byte-identical.
    output = output.crop(crop)
    assert set(output.getchannel('A').get_flattened_data()) == {0, 255}
    assert output.getchannel('A').getbbox() == (2, 2, output.width - 2, output.height - 2)
    assert sum(a == 255 for a in output.getchannel('A').get_flattened_data()) == len(retained)
    for x, y in retained:
        pixel = output.getpixel((x - crop[0], y - crop[1]))
        assert pixel[:3] == source.getpixel((x, y))[:3] and pixel[3] == 255
    return output, crop
