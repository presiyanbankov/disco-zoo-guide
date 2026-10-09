"""Pixel-level regression checks for the 17 reviewed restoration masks."""
import hashlib
import json
import unittest
from PIL import Image
from reviewedAlphaMask import ROOT, REFERENCES, reviewed_pixels, alpha_only_output

PROFILES = json.loads((ROOT / 'scripts/constellationExtractionProfiles.json').read_text()) + [
    p for p in json.loads((ROOT / 'scripts/timelessExtractionProfiles.json').read_text())
    if p['method'] == 'reviewed-mask']


class ReviewedArtworkTest(unittest.TestCase):
    def test_changed_mask_requires_review(self):
        profile = {**PROFILES[0], 'maskSha256': 'wrong-hash'}
        source = Image.open(REFERENCES / (profile['id'] + '.png')).convert('RGBA')
        with self.assertRaisesRegex(AssertionError, 're-review required'):
            reviewed_pixels(source, profile)

    def test_mask_cannot_be_rescaled(self):
        profile = PROFILES[0]
        with self.assertRaises(AssertionError):
            reviewed_pixels(Image.new('RGBA', (5, 5)), profile)

    def test_padding_outside_source_invents_no_visible_pixels(self):
        source = Image.new('RGBA', (1, 1), (17, 28, 39, 255))
        output, crop = alpha_only_output(source, {(0, 0)})
        self.assertEqual(crop, (-2, -2, 3, 3))
        self.assertEqual(output.size, (5, 5))
        self.assertEqual(output.getpixel((2, 2)), (17, 28, 39, 255))
        self.assertEqual(sum(a == 255 for a in output.getchannel('A').get_flattened_data()), 1)


def artwork_case(profile):
    def test(self):
        path = REFERENCES / (profile['id'] + '.png')
        self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), profile['sha256'])
        with Image.open(path) as original:
            self.assertEqual(original.format, 'PNG')
            self.assertEqual(list(original.size), profile['sourceSize'])
            source = original.convert('RGBA')
        retained = reviewed_pixels(source, profile)
        expected, crop = alpha_only_output(source, retained)
        output_path = ROOT / 'public/game/animals-hq' / profile['region'] / (profile['id'] + '.png')
        with Image.open(output_path) as output:
            self.assertEqual(output.mode, 'RGBA')
            self.assertEqual(output.size, expected.size)
            self.assertEqual(output.tobytes(), expected.tobytes())
            self.assertEqual(set(output.getchannel('A').get_flattened_data()), {0, 255})
            self.assertEqual(output.getchannel('A').getbbox(), (2, 2, output.width - 2, output.height - 2))
            # Iterate every output pixel, not just the asserted retained count.
            for y in range(output.height):
                for x in range(output.width):
                    pixel = output.getpixel((x, y))
                    if pixel[3]:
                        coordinate = (x + crop[0], y + crop[1])
                        self.assertIn(coordinate, retained)
                        self.assertEqual(pixel[:3], source.getpixel(coordinate)[:3])
    return test


for profile in PROFILES:
    setattr(ReviewedArtworkTest, 'test_' + profile['id'].replace('-', '_'), artwork_case(profile))

if __name__ == '__main__':
    unittest.main()
