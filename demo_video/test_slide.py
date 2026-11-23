import os
from PIL import Image, ImageDraw, ImageFont

img = Image.new("RGB", (1920, 1080), (18, 26, 22))
draw = ImageDraw.Draw(img)

# Try loading standard Windows fonts
try:
    font_large = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 64)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 32)
except Exception:
    font_large = ImageFont.load_default()
    font_sub = ImageFont.load_default()

draw.text((100, 100), "VAYUWISE AI — Urban Air Quality Platform", fill=(255, 255, 255), font=font_large)
draw.text((100, 200), "Test Slide Generation", fill=(110, 169, 136), font=font_sub)

os.makedirs("demo_video/slides", exist_ok=True)
img.save("demo_video/slides/test.png")
print("Test image created successfully at demo_video/slides/test.png")
