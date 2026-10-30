"""Optional source-asset encoding. Normal Node builds use the tracked results.

Python dependencies: Pillow==12.3.0, fonttools[woff]==4.68.0.
No cropping, resizing, font subsetting or artwork changes.
"""
from pathlib import Path
from PIL import Image
from fontTools.ttLib import TTFont

assets = Path(__file__).resolve().parent.parent / "assets"
for name in ["cafe-hero", "resources-banner"]:
    with Image.open(assets / f"{name}.png") as image:
        image.convert("RGB").save(assets / f"{name}.webp", quality=88, method=6)
for name in ["Newsreader-Bold", "Newsreader-SemiBold", "Lato-Regular", "Lato-SemiBold", "Lato-Bold"]:
    font = TTFont(assets / f"{name}.ttf")
    font.flavor = "woff2"
    font.save(assets / f"{name}.woff2")
