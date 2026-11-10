"""Unicode-aware replacements for cv2.putText / cv2.getTextSize.

OpenCV's Hershey fonts only cover ASCII, so Cyrillic text renders as "???".
These helpers draw with Pillow and a TrueType font that has Cyrillic glyphs.
If Pillow or such a font is not available, they fall back to cv2 with the
text transliterated to Latin, so labels stay readable either way.

The signatures mirror OpenCV: `org` is the bottom-left corner of the text
baseline and `font_scale` is a FONT_HERSHEY_SIMPLEX scale, so call sites keep
their existing layout arithmetic.
"""
import logging
import os
from typing import Dict, Optional, Tuple

import cv2
import numpy as np

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover - Pillow ships with ultralytics
    Image = ImageDraw = ImageFont = None

logger = logging.getLogger(__name__)

# FONT_HERSHEY_SIMPLEX at scale 1.0 has a cap height of ~22 px; a TrueType
# font at N px has a cap height of ~0.72 * N, so N ~= 30 * scale.
_PX_PER_HERSHEY_SCALE = 30.0

_FONT_CANDIDATES = [
    # Windows
    r"C:\Windows\Fonts\arial.ttf",
    r"C:\Windows\Fonts\segoeui.ttf",
    # Linux
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/TTF/DejaVuSans.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    # macOS
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
    # Font that ultralytics downloads into its user config dir for plotting
    os.path.join(os.environ.get("APPDATA", ""), "Ultralytics", "Arial.Unicode.ttf"),
    os.path.expanduser("~/Library/Application Support/Ultralytics/Arial.Unicode.ttf"),
    os.path.expanduser("~/.config/Ultralytics/Arial.Unicode.ttf"),
]

_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}

_font_path: Optional[str] = None
_font_path_resolved = False
_font_cache: Dict[int, "ImageFont.FreeTypeFont"] = {}


def _find_font_path() -> Optional[str]:
    global _font_path, _font_path_resolved
    if not _font_path_resolved:
        _font_path_resolved = True
        candidates = [os.environ.get("AGROVISION_FONT", "")] + _FONT_CANDIDATES
        _font_path = next((p for p in candidates if p and os.path.isfile(p)), None)
        if ImageFont is None:
            logger.warning("[Text] Pillow not installed; overlay text will be transliterated")
        elif _font_path is None:
            logger.warning("[Text] No Cyrillic TTF font found (set AGROVISION_FONT); "
                           "overlay text will be transliterated")
    return _font_path


def _get_font(font_scale: float) -> Optional["ImageFont.FreeTypeFont"]:
    if ImageFont is None:
        return None
    path = _find_font_path()
    if path is None:
        return None
    size = max(6, int(round(font_scale * _PX_PER_HERSHEY_SCALE)))
    font = _font_cache.get(size)
    if font is None:
        try:
            font = ImageFont.truetype(path, size)
        except OSError:
            logger.warning("[Text] Cannot load font %s", path)
            return None
        _font_cache[size] = font
    return font


def transliterate(text: str) -> str:
    out = []
    for i, ch in enumerate(text):
        low = ch.lower()
        if low in _TRANSLIT:
            lat = _TRANSLIT[low]
            if ch != low:
                # "Ж" -> "Zh" in "Жук", but "ZH" inside an all-caps word.
                neighbours = text[max(0, i - 1):i] + text[i + 1:i + 2]
                in_caps_word = any(c.isalpha() and c.isupper() for c in neighbours)
                lat = lat.upper() if in_caps_word else lat.capitalize()
            out.append(lat)
        elif ord(ch) < 128:
            out.append(ch)
        else:
            out.append("?")
    return "".join(out)


def _stroke(thickness: int) -> int:
    return 1 if thickness >= 2 else 0


def get_text_size(text: str, font_scale: float, thickness: int = 1) -> Tuple[Tuple[int, int], int]:
    """Like cv2.getTextSize: ((width, height_above_baseline), baseline)."""
    font = _get_font(font_scale)
    if font is None:
        return cv2.getTextSize(transliterate(text), cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
    left, top, right, bottom = font.getbbox(text, anchor="ls", stroke_width=_stroke(thickness))
    return (int(right - min(0, left)), int(-top)), int(max(0, bottom))


def put_text(img: np.ndarray, text: str, org: Tuple[int, int], font_scale: float,
             color: Tuple[int, int, int], thickness: int = 1) -> None:
    """Like cv2.putText with FONT_HERSHEY_SIMPLEX, but Unicode-capable. Draws in place."""
    font = _get_font(font_scale)
    if font is None:
        cv2.putText(img, transliterate(text), org, cv2.FONT_HERSHEY_SIMPLEX,
                    font_scale, color, thickness, cv2.LINE_AA)
        return

    x, y = int(org[0]), int(org[1])
    stroke = _stroke(thickness)
    left, top, right, bottom = font.getbbox(text, anchor="ls", stroke_width=stroke)
    h, w = img.shape[:2]
    x0, y0 = max(0, x + int(left)), max(0, y + int(top))
    x1, y1 = min(w, x + int(right) + 1), min(h, y + int(bottom) + 1)
    if x1 <= x0 or y1 <= y0:
        return

    # Only round-trip the small region under the text through PIL.
    roi = Image.fromarray(cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2RGB))
    rgb = (int(color[2]), int(color[1]), int(color[0]))
    ImageDraw.Draw(roi).text((x - x0, y - y0), text, font=font, fill=rgb, anchor="ls",
                             stroke_width=stroke, stroke_fill=rgb)
    img[y0:y1, x0:x1] = cv2.cvtColor(np.asarray(roi), cv2.COLOR_RGB2BGR)
