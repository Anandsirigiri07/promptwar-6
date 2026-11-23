import os
from playwright.sync_api import sync_playwright

routes = [
    ("/", "Landing"),
    ("/dashboard", "Dashboard"),
    ("/routine", "Routine"),
    ("/commute", "Commute"),
    ("/indoor-air", "Indoor Air"),
    ("/community", "Community"),
    ("/advisories", "Advisories"),
    ("/profile", "Profile")
]

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        headless=True
    )
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    
    for r, name in routes:
        url = f"http://localhost:5173{r}"
        page.goto(url, wait_until="networkidle")
        # Wait until the loading spinner is gone
        page.wait_for_timeout(1500)
        has_spinner = page.locator('text="Loading Air Intelligence Module"').count() > 0
        h1_text = page.locator('h1').all_text_contents()
        print(f"[{name}] URL: {r} | Spinner present: {has_spinner} | H1: {h1_text}")
    
    browser.close()
