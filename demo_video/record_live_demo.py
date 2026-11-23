import os
import time
from playwright.sync_api import sync_playwright

CURSOR_SCRIPT = """
(() => {
  if (document.getElementById('demo-cursor')) return;
  const cursor = document.createElement('div');
  cursor.id = 'demo-cursor';
  cursor.style.position = 'fixed';
  cursor.style.width = '24px';
  cursor.style.height = '24px';
  cursor.style.borderRadius = '50%';
  cursor.style.backgroundColor = 'rgba(52, 211, 153, 0.75)';
  cursor.style.border = '2px solid white';
  cursor.style.boxShadow = '0 0 12px rgba(0,0,0,0.5)';
  cursor.style.pointerEvents = 'none';
  cursor.style.zIndex = '9999999';
  cursor.style.transition = 'transform 0.08s ease-out, background-color 0.15s ease';
  cursor.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(cursor);

  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  window.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.65)';
    cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
  });

  window.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1.0)';
    cursor.style.backgroundColor = 'rgba(52, 211, 153, 0.75)';
  });
})();
"""

def inject_cursor(page):
    try:
        page.evaluate(CURSOR_SCRIPT)
    except Exception:
        pass

def smooth_scroll(page, target_y, steps=25, delay=0.03):
    try:
        current_y = page.evaluate("window.scrollY")
        diff = target_y - current_y
        for i in range(1, steps + 1):
            y = current_y + (diff * (i / steps))
            page.evaluate(f"window.scrollTo(0, {y})")
            time.sleep(delay)
    except Exception:
        pass

def smooth_move(page, start_x, start_y, end_x, end_y, steps=15, delay=0.02):
    try:
        for i in range(1, steps + 1):
            x = start_x + (end_x - start_x) * (i / steps)
            y = start_y + (end_y - start_y) * (i / steps)
            page.mouse.move(x, y)
            time.sleep(delay)
    except Exception:
        pass

def safe_click(page, locator_str, timeout_ms=3000):
    try:
        loc = page.locator(locator_str).first
        if loc.count() > 0:
            box = loc.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"]/2, box["y"] + box["height"]/2)
            loc.click(timeout=timeout_ms)
            return True
    except Exception as e:
        print(f"[SafeClick Note] '{locator_str}' skipped: {e}")
    return False

def record_full_demo():
    output_dir = "demo_video/raw_recording"
    os.makedirs(output_dir, exist_ok=True)

    print("Launching Chrome for interactive video capture (1920x1080 @ 30fps)...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--window-size=1920,1080",
                "--force-device-scale-factor=1"
            ]
        )

        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=output_dir,
            record_video_size={"width": 1920, "height": 1080}
        )

        page = context.new_page()
        start_time = time.time()
        print("Recording started at t=0.0s")

        # =========================================================================
        # ACT 1: 0:00 - 0:34 (34s) - Landing Page & The Winter Smog Crisis
        # =========================================================================
        print(">>> Act 1: Landing Page & Problem Overview (0:00 - 0:34)")
        page.goto("http://localhost:5173/", wait_until="networkidle")
        page.wait_for_timeout(2000)
        inject_cursor(page)
        page.mouse.move(960, 400)
        time.sleep(2.5)

        # Smooth scroll down through hero and pillars
        smooth_scroll(page, 450, steps=25, delay=0.03)
        time.sleep(3.0)
        
        # Scroll further down to feature module cards
        smooth_scroll(page, 950, steps=30, delay=0.03)
        time.sleep(4.0)

        smooth_scroll(page, 1500, steps=30, delay=0.03)
        time.sleep(4.0)

        # Scroll back up to the top
        smooth_scroll(page, 0, steps=35, delay=0.02)
        time.sleep(2.0)

        # Click on Air Intelligence link in sidebar
        smooth_move(page, 960, 400, 110, 230, steps=20, delay=0.02)
        time.sleep(1.0)
        if not safe_click(page, 'a[href="/dashboard"], a:has-text("Air Intelligence")'):
            page.goto("http://localhost:5173/dashboard", wait_until="networkidle")

        # =========================================================================
        # ACT 2: 0:34 - 1:04 (30s) - Real-Time Telemetry & OpenAQ v3
        # =========================================================================
        print(">>> Act 2: Air Quality Dashboard & Ground Stations (0:34 - 1:04)")
        page.wait_for_timeout(2000)
        inject_cursor(page)

        # Move mouse over AQI badge & zone card
        smooth_move(page, 110, 230, 600, 320, steps=20, delay=0.02)
        time.sleep(3.0)

        # Toggle Scenario Dropdown in top header
        try:
            scenario_select = page.locator('select[aria-label="Select Environmental Condition Scenario"]')
            if scenario_select.count() > 0:
                smooth_move(page, 600, 320, 500, 32, steps=15, delay=0.02)
                scenario_select.select_option("winter_smog_spike")
                time.sleep(2.5)
                scenario_select.select_option("inversion_trap")
                time.sleep(2.5)
                scenario_select.select_option("realtime")
                time.sleep(1.5)
        except Exception as e:
            print("[Scenario toggle note]", e)

        # Scroll down to pollutant sub-indices and meteorological inversion card
        smooth_scroll(page, 450, steps=25, delay=0.03)
        time.sleep(3.5)

        smooth_scroll(page, 800, steps=25, delay=0.03)
        time.sleep(3.5)

        # Scroll back up
        smooth_scroll(page, 0, steps=25, delay=0.02)
        time.sleep(1.5)

        # Move mouse to sidebar "AI Daily Routine"
        smooth_move(page, 600, 200, 110, 275, steps=20, delay=0.02)
        time.sleep(1.0)
        if not safe_click(page, 'a[href="/routine"], a:has-text("AI Daily Routine")'):
            page.goto("http://localhost:5173/routine", wait_until="networkidle")

        # =========================================================================
        # ACT 3: 1:04 - 1:33 (29s) - AI Personalized Routine Engine
        # =========================================================================
        print(">>> Act 3: AI-Driven Routine Planner (1:04 - 1:33)")
        page.wait_for_timeout(2000)
        inject_cursor(page)

        # Switch persona tabs
        smooth_move(page, 110, 275, 450, 220, steps=20, delay=0.02)
        time.sleep(1.0)

        safe_click(page, 'button:has-text("School"), button:has-text("Student")')
        time.sleep(2.0)

        safe_click(page, 'button:has-text("Senior"), button:has-text("Asthmatic")')
        time.sleep(2.0)

        safe_click(page, 'button:has-text("Commuter"), button:has-text("Office")')
        time.sleep(1.5)

        # Click "Generate Smog-Safe Routine" button
        safe_click(page, 'button:has-text("Generate"), button:has-text("Routine")')
        time.sleep(3.0)

        # Scroll down through generated routine timeline
        smooth_scroll(page, 450, steps=25, delay=0.03)
        time.sleep(4.0)

        smooth_scroll(page, 0, steps=25, delay=0.02)
        time.sleep(1.5)

        # Navigate to "Transit Optimizer" (/commute)
        smooth_move(page, 700, 340, 110, 320, steps=20, delay=0.02)
        time.sleep(1.0)
        if not safe_click(page, 'a[href="/commute"], a:has-text("Transit Optimizer")'):
            page.goto("http://localhost:5173/commute", wait_until="networkidle")

        # =========================================================================
        # ACT 4A: 1:33 - 1:47 (14s) - Commute Optimizer
        # =========================================================================
        print(">>> Act 4A: Commute Optimizer (1:33 - 1:47)")
        page.wait_for_timeout(2000)
        inject_cursor(page)

        smooth_move(page, 110, 320, 650, 280, steps=20, delay=0.02)
        time.sleep(2.0)

        smooth_scroll(page, 350, steps=20, delay=0.03)
        time.sleep(4.0)

        # Navigate to "Indoor Quality & DIY" (/indoor-air)
        smooth_move(page, 650, 280, 110, 365, steps=20, delay=0.02)
        time.sleep(1.0)
        if not safe_click(page, 'a[href="/indoor-air"], a:has-text("Indoor Quality")'):
            page.goto("http://localhost:5173/indoor-air", wait_until="networkidle")

        # =========================================================================
        # ACT 4B: 1:47 - 2:02 (15s) - Indoor Air Quality Simulator
        # =========================================================================
        print(">>> Act 4B: Indoor Air Simulator (1:47 - 2:02)")
        page.wait_for_timeout(2000)
        inject_cursor(page)

        # Scroll to mass balance sliders
        smooth_scroll(page, 300, steps=20, delay=0.03)
        time.sleep(3.0)

        # Scroll down to DIY Corsi-Rosenthal Box section
        smooth_scroll(page, 750, steps=25, delay=0.03)
        time.sleep(4.0)

        smooth_scroll(page, 0, steps=25, delay=0.02)
        time.sleep(1.5)

        # Navigate to "Collective Impact" (/community)
        smooth_move(page, 650, 200, 110, 410, steps=20, delay=0.02)
        time.sleep(1.0)
        if not safe_click(page, 'a[href="/community"], a:has-text("Collective Impact")'):
            page.goto("http://localhost:5173/community", wait_until="networkidle")

        # =========================================================================
        # ACT 5A: 2:02 - 2:16 (14s) - Community Collective Impact
        # =========================================================================
        print(">>> Act 5A: Community Collective Impact (2:02 - 2:16)")
        page.wait_for_timeout(2000)
        inject_cursor(page)

        smooth_move(page, 110, 410, 600, 260, steps=20, delay=0.02)
        time.sleep(2.5)

        smooth_scroll(page, 450, steps=20, delay=0.03)
        time.sleep(4.0)

        smooth_scroll(page, 0, steps=20, delay=0.02)
        time.sleep(1.5)

        # Navigate to "Emergency Center" (/advisories)
        smooth_move(page, 600, 260, 110, 455, steps=20, delay=0.02)
        time.sleep(1.0)
        if not safe_click(page, 'a[href="/advisories"], a:has-text("Emergency Center")'):
            page.goto("http://localhost:5173/advisories", wait_until="networkidle")

        # =========================================================================
        # ACT 5B: 2:16 - 2:31 (15s) - Emergency Advisories & Multilingual
        # =========================================================================
        print(">>> Act 5B: Emergency Advisories & Multilingual Layouts (2:16 - 2:31)")
        page.wait_for_timeout(2000)
        inject_cursor(page)

        smooth_move(page, 110, 455, 650, 220, steps=20, delay=0.02)
        time.sleep(2.0)

        # Switch language in navbar
        try:
            lang_select = page.locator('select[aria-label="Select Language"]')
            if lang_select.count() > 0:
                smooth_move(page, 650, 220, 1680, 32, steps=15, delay=0.02)
                lang_select.select_option("hi")
                time.sleep(2.5)
                lang_select.select_option("ar")
                time.sleep(2.5)
                lang_select.select_option("en")
                time.sleep(2.0)
        except Exception as e:
            print("[Language toggle note]", e)

        # Navigate to "Preferences" (/profile)
        smooth_move(page, 1680, 32, 110, 500, steps=25, delay=0.02)
        time.sleep(1.0)
        if not safe_click(page, 'a[href="/profile"], a:has-text("Preferences")'):
            page.goto("http://localhost:5173/profile", wait_until="networkidle")

        # =========================================================================
        # ACT 6: 2:31 - 2:54 (23s) - Profile, Auth & Standards Toggling
        # =========================================================================
        print(">>> Act 6: Profile & Standards Preferences (2:31 - 2:54)")
        page.wait_for_timeout(2000)
        inject_cursor(page)

        # Click Instant 1-Click Sign In (Evaluator Mode) button
        safe_click(page, 'button:has-text("1-Click"), button:has-text("Evaluator Mode")')
        time.sleep(2.5)

        smooth_scroll(page, 350, steps=20, delay=0.03)
        time.sleep(3.0)

        # Toggle AQI standard selector
        try:
            aqi_select = page.locator('select').last
            if aqi_select.count() > 0:
                smooth_move(page, 680, 320, 1300, 480, steps=15, delay=0.02)
                aqi_select.select_option("EPA")
                time.sleep(2.0)
                aqi_select.select_option("CPCB")
                time.sleep(2.0)
        except Exception as e:
            print("[AQI standard note]", e)

        smooth_scroll(page, 0, steps=20, delay=0.02)
        time.sleep(1.5)

        # =========================================================================
        # OUTRO: 2:54 - 3:00 (6s) - Return to Overview Hero
        # =========================================================================
        print(">>> Outro: Return to Overview (2:54 - 3:00)")
        smooth_move(page, 1300, 480, 110, 140, steps=20, delay=0.02)
        if not safe_click(page, 'a[href="/"], a:has-text("Overview")'):
            page.goto("http://localhost:5173/", wait_until="networkidle")
        
        inject_cursor(page)
        smooth_move(page, 110, 140, 960, 450, steps=25, delay=0.02)

        # Ensure exact elapsed time reaches 180.0s
        elapsed = time.time() - start_time
        remaining = 180.0 - elapsed
        print(f"Elapsed: {elapsed:.2f}s | Remaining to reach 180s: {remaining:.2f}s")
        if remaining > 0:
            time.sleep(remaining)

        video_path = page.video.path()
        context.close()
        browser.close()
        print(f"Recording completed! Raw video file: {video_path}")
        return video_path

if __name__ == "__main__":
    record_full_demo()
