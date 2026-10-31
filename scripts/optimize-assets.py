"""Optional source-asset encoding. Normal Node builds use the tracked results.

Python dependencies: Pillow==12.3.0, fonttools[woff]==4.68.0.
Creates responsive copies without cropping and subsets the site's Latin fonts.
Original PNG/TTF sources and licenses remain unchanged. Only tracked results ship.
"""
from pathlib import Path
import sys

root = Path(__file__).resolve().parent.parent
# Optional local dependency folder; normal Node builds never execute this script.
sys.path.insert(0, str(root / ".dev" / "pydeps"))
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools import subset

assets = root / "assets"
for name in ["cafe-hero", "resources-banner"]:
    with Image.open(assets / f"{name}.png") as image:
        image.convert("RGB").save(assets / f"{name}.webp", quality=88, method=6)
        if name == "cafe-hero":
            for width in [480, 800, 1200]:
                height = round(image.height * width / image.width)
                image.convert("RGB").resize((width, height), Image.Resampling.LANCZOS).save(
                    assets / f"{name}-{width}.webp", quality=84, method=6
                )

# Latin/extended Latin includes Turkish/German and names in the original exam.
# Keep combining marks, punctuation, currencies, arrows and common math symbols.
ranges = [(0x0000, 0x017F), (0x0300, 0x036F), (0x2000, 0x206F),
          (0x2190, 0x21FF)]
codepoints = {point for first, last in ranges for point in range(first, last + 1)}
codepoints.update([0x1E9E, 0x20AC, 0x2212, 0x2713, 0xFFFD])
for name in ["Newsreader-Bold", "Newsreader-SemiBold", "Lato-Regular", "Lato-SemiBold", "Lato-Bold"]:
    font = TTFont(assets / f"{name}.ttf", recalcTimestamp=False)
    output_name = name
    if name.startswith("Lato-"):
        # Preserve the original unmodified WOFF2 source; it is no longer published.
        original = TTFont(assets / f"{name}.ttf", recalcTimestamp=False)
        original.flavor = "woff2"
        original.save(assets / f"{name}.woff2")
        weight = name.split("-", 1)[1]
        output_name = f"BaulingoSans-{weight}"
    expected = set(font.getBestCmap()) & codepoints
    options = subset.Options()
    options.layout_features = ["kern", "liga", "clig", "calt", "locl", "mark", "mkmk"]
    options.name_IDs = ["*"]
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    if name.startswith("Lato-"):
        # Lato is an OFL Reserved Font Name. Give the modified subset new primary
        # names while keeping copyright, author, original project and license IDs.
        renamed = {1: "Baulingo Sans", 2: weight, 3: f"BaulingoSans-{weight};subset-1",
                   4: f"Baulingo Sans {weight}", 6: f"BaulingoSans-{weight}",
                   16: "Baulingo Sans", 17: weight, 18: f"Baulingo Sans {weight}",
                   21: "Baulingo Sans", 22: weight, 25: "BaulingoSans"}
        for record in font["name"].names:
            if record.nameID in renamed:
                record.string = renamed[record.nameID].encode(record.getEncoding())
        for name_id in [1, 2, 3, 4, 6, 16, 17]:
            font["name"].setName(renamed[name_id], name_id, 3, 1, 0x409)
    font.flavor = "woff2"
    font.save(assets / f"{output_name}.woff2")
    result = TTFont(assets / f"{output_name}.woff2")
    missing = expected - set(result.getBestCmap())
    if missing:
        raise RuntimeError(f"{name} lost retained characters: {sorted(missing)}")
    if name.startswith("Lato-"):
        assert all("Lato" not in record.toUnicode() for record in result["name"].names if record.nameID in renamed)
    print(f"{output_name}: {(assets / f'{output_name}.woff2').stat().st_size:,} bytes; retained glyph coverage verified")

(assets / "BaulingoSans-OFL.txt").write_text(
    "Baulingo Sans is a web subset derived from Lato for Turkish/German use.\n"
    "Modified by the Baulingo project, 2026. Primary font names were changed\n"
    "to respect Lato's Reserved Font Name. Original attribution and license follow.\n\n"
    + (assets / "Lato-OFL.txt").read_text(encoding="utf-8"), encoding="utf-8"
)
