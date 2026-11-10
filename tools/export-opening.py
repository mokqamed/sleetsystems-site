"""Export the lightweight website opening from the approved 60 fps motion.

Run with Python and Pillow installed: python3 tools/export-opening.py
The canonical intro remains unchanged for the dashboard and native apps.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent / 'assets' / 'sleet-motion'
with Image.open(root / 'sleet-loading-intro.webp') as source:
    frames, durations = [], []
    for index in range(source.n_frames):
        source.seek(index)
        source.load()
        frames.append(source.copy().resize((128, 128), Image.Resampling.LANCZOS))
        durations.append(source.info['duration'])
    frames[0].save(root / 'sleet-opening-intro.webp', save_all=True,
                   append_images=frames[1:], duration=durations, loop=1,
                   quality=82, method=6)
with Image.open(root / 'sleet-loading-still.png') as source:
    source.resize((128, 128), Image.Resampling.LANCZOS).save(
        root / 'sleet-opening-still.webp', quality=85, method=6)
