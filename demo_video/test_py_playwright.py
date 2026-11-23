import os
from playwright.sync_api import sync_playwright

os.makedirs("demo_video/test_recordings", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless=True,
        args=["--no-sandbox", "--disable-setuid-sandbox"]
    )
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir="demo_video/test_recordings",
        record_video_size={"width": 1920, "height": 1080}
    )
    page = context.new_page()
    page.goto("http://localhost:5173/", wait_until="networkidle")
    # Wait for loading spinner to disappear
    page.wait_for_timeout(3000)
    video_path = page.video.path()
    context.close()
    browser.close()
    print("Video recorded successfully to:", video_path)
