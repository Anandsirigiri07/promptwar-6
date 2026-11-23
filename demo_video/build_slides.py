import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SLIDE_W = 1920
SLIDE_H = 1080

def get_font(size, bold=False):
    font_path = "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"
    try:
        return ImageFont.truetype(font_path, size)
    except Exception:
        return ImageFont.load_default()

def create_base_canvas():
    # Subtle vertical gradient background
    base = Image.new("RGB", (SLIDE_W, SLIDE_H), (15, 23, 19))
    draw = ImageDraw.Draw(base)
    # Header background bar
    draw.rectangle([0, 0, SLIDE_W, 70], fill=(18, 28, 23))
    draw.line([0, 70, SLIDE_W, 70], fill=(44, 62, 52), width=2)
    return base

def draw_header(draw, act_num, act_title):
    font_brand = get_font(26, bold=True)
    font_tag = get_font(18, bold=False)
    font_act = get_font(20, bold=True)
    
    # Brand logo pill
    draw.rectangle([40, 16, 230, 54], fill=(30, 48, 38), outline=(66, 122, 91), width=1)
    draw.text((55, 20), "VAYUWISE", fill=(255, 255, 255), font=font_brand)
    draw.text((180, 20), "AI", fill=(52, 211, 153), font=font_brand)
    
    # Subtitle
    draw.text((250, 25), "Urban Smog Intelligence & Family Protection Platform", fill=(160, 185, 172), font=font_tag)
    
    # Act Pill (Right)
    act_text = f"ACT {act_num}: {act_title.upper()}"
    bbox = font_act.getbbox(act_text)
    w = bbox[2] - bbox[0]
    draw.rectangle([SLIDE_W - w - 70, 16, SLIDE_W - 40, 54], fill=(22, 36, 29), outline=(78, 142, 106), width=1)
    draw.text((SLIDE_W - w - 55, 22), act_text, fill=(52, 211, 153), font=font_act)

def draw_window_frame(canvas, screenshot_path, x=290, y=90, w=1340, h=810):
    if not os.path.exists(screenshot_path):
        return
    
    # Window header height
    win_header_h = 36
    total_h = h + win_header_h
    
    # Drop shadow
    shadow_img = Image.new("RGBA", (w + 40, total_h + 40), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_img)
    s_draw.rounded_rectangle([15, 15, w + 25, total_h + 25], radius=16, fill=(0, 0, 0, 140))
    shadow_blur = shadow_img.filter(ImageFilter.GaussianBlur(12))
    canvas.paste(shadow_blur, (x - 20, y - 20), shadow_blur)
    
    # Window outer container
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle([x, y, x + w, y + total_h], radius=12, fill=(35, 45, 40), outline=(60, 80, 70), width=1)
    
    # Window header bar
    draw.rounded_rectangle([x, y, x + w, y + win_header_h], radius=12, fill=(28, 36, 32))
    draw.rectangle([x, y + win_header_h - 10, x + w, y + win_header_h], fill=(28, 36, 32)) # square bottom corners
    
    # Window 3 dots (mac style)
    draw.ellipse([x + 16, y + 12, x + 28, y + 24], fill=(255, 95, 86)) # Red
    draw.ellipse([x + 36, y + 12, x + 48, y + 24], fill=(255, 189, 46)) # Yellow
    draw.ellipse([x + 56, y + 12, x + 68, y + 24], fill=(39, 201, 63)) # Green
    
    # URL pill in window header
    font_url = get_font(13, bold=False)
    draw.rounded_rectangle([x + 90, y + 8, x + w - 90, y + 28], radius=6, fill=(18, 24, 21), outline=(45, 60, 52), width=1)
    draw.text((x + 105, y + 10), "https://vayuwise.local:5173", fill=(140, 165, 150), font=font_url)
    
    # Load and resize screenshot
    shot = Image.open(screenshot_path).convert("RGB")
    shot_resized = shot.resize((w, h), Image.Resampling.LANCZOS)
    canvas.paste(shot_resized, (x, y + win_header_h))

def draw_lower_third(canvas, title, description, pills=[]):
    draw = ImageDraw.Draw(canvas)
    
    # Lower third container bar
    bar_y = 930
    bar_h = 130
    
    # Semi-transparent dark overlay
    overlay = Image.new("RGBA", (SLIDE_W - 80, bar_h), (12, 18, 15, 235))
    o_draw = ImageDraw.Draw(overlay)
    o_draw.rounded_rectangle([0, 0, SLIDE_W - 80, bar_h], radius=14, fill=(12, 18, 15, 240), outline=(52, 211, 153), width=2)
    canvas.paste(overlay, (40, bar_y), overlay)
    
    font_title = get_font(26, bold=True)
    font_desc = get_font(18, bold=False)
    font_pill = get_font(14, bold=True)
    
    # Title
    draw.text((70, bar_y + 16), title, fill=(255, 255, 255), font=font_title)
    
    # Description
    draw.text((70, bar_y + 54), description, fill=(185, 205, 195), font=font_desc)
    
    # Badges / Pills on the right side
    pill_x = SLIDE_W - 80
    for pill_tuple in reversed(pills):
        pill_text = pill_tuple[0]
        bg = pill_tuple[1]
        border = pill_tuple[2]
        fg = pill_tuple[3]
        bbox = font_pill.getbbox(pill_text)
        pw = bbox[2] - bbox[0] + 24
        pill_x -= (pw + 12)
        draw.rounded_rectangle([pill_x, bar_y + 20, pill_x + pw, bar_y + 50], radius=8, fill=bg, outline=border, width=1)
        draw.text((pill_x + 12, bar_y + 25), pill_text, fill=fg, font=font_pill)

def make_intro_slide():
    img = Image.new("RGB", (SLIDE_W, SLIDE_H), (12, 18, 15))
    draw = ImageDraw.Draw(img)
    
    # Radial aesthetic circles
    draw.ellipse([SLIDE_W//2 - 500, SLIDE_H//2 - 500, SLIDE_W//2 + 500, SLIDE_H//2 + 500], outline=(25, 45, 35), width=2)
    draw.ellipse([SLIDE_W//2 - 350, SLIDE_H//2 - 350, SLIDE_W//2 + 350, SLIDE_H//2 + 350], outline=(35, 65, 50), width=3)
    
    font_hero = get_font(72, bold=True)
    font_sub = get_font(32, bold=True)
    font_body = get_font(22, bold=False)
    font_pill = get_font(16, bold=True)
    
    # Hero Title
    title = "VAYUWISE AI"
    draw.text((SLIDE_W//2 - 250, 240), title, fill=(255, 255, 255), font=font_hero)
    draw.text((SLIDE_W//2 + 190, 240), "✨", fill=(52, 211, 153), font=font_hero)
    
    # Subtitle
    subtitle = "Breathe Smarter. Live Safer. Build Cleaner Communities."
    bbox = font_sub.getbbox(subtitle)
    w = bbox[2] - bbox[0]
    draw.text((SLIDE_W//2 - w//2, 340), subtitle, fill=(52, 211, 153), font=font_sub)
    
    # Description
    desc = "Full-Stack GenAI Urban Air Quality, Winter Smog Intelligence & Family Protection Platform"
    bbox_d = font_body.getbbox(desc)
    w_d = bbox_d[2] - bbox_d[0]
    draw.text((SLIDE_W//2 - w_d//2, 410), desc, fill=(180, 205, 190), font=font_body)
    
    # Challenge banner
    chal = "Hack2Skill Challenge 6 Submission — Full Production Demo Walkthrough (3 Minutes)"
    bbox_c = font_body.getbbox(chal)
    w_c = bbox_c[2] - bbox_c[0]
    draw.text((SLIDE_W//2 - w_c//2, 470), chal, fill=(250, 204, 21), font=font_body)
    
    # Feature Badges
    badges = [
        ("CPCB NAQI (India) Standard", (20, 50, 35), (40, 100, 70), (220, 255, 230)),
        ("US EPA AQI Standard", (20, 45, 60), (40, 90, 130), (210, 240, 255)),
        ("OpenAQ v3 Ground Stations", (50, 35, 20), (120, 80, 30), (255, 235, 200)),
        ("Copernicus CAMS Forecaster", (40, 25, 55), (90, 50, 120), (245, 220, 255)),
        ("Google Gemini GenAI Engine", (20, 50, 50), (40, 110, 110), (200, 255, 255)),
        ("Firebase Cloud Architecture", (60, 25, 20), (130, 50, 40), (255, 220, 210)),
    ]
    
    bx = 180
    by = 580
    for b_text, bg, border, fg in badges:
        bbox_b = font_pill.getbbox(b_text)
        bw = bbox_b[2] - bbox_b[0] + 32
        if bx + bw > SLIDE_W - 100:
            bx = 180
            by += 60
        draw.rounded_rectangle([bx, by, bx + bw, by + 46], radius=10, fill=bg, outline=border, width=2)
        draw.text((bx + 16, by + 12), b_text, fill=fg, font=font_pill)
        bx += bw + 24
        
    return img

def make_outro_slide():
    img = Image.new("RGB", (SLIDE_W, SLIDE_H), (12, 18, 15))
    draw = ImageDraw.Draw(img)
    
    font_hero = get_font(60, bold=True)
    font_sub = get_font(28, bold=True)
    font_body = get_font(20, bold=False)
    font_pill = get_font(18, bold=True)
    
    draw.text((SLIDE_W//2 - 220, 200), "VAYUWISE AI", fill=(255, 255, 255), font=font_hero)
    
    sub = "Protecting Families • Empowering Citizens • Advancing Clean Air"
    bbox = font_sub.getbbox(sub)
    draw.text((SLIDE_W//2 - (bbox[2]-bbox[0])//2, 285), sub, fill=(52, 211, 153), font=font_sub)
    
    # URL & Status Card
    draw.rounded_rectangle([SLIDE_W//2 - 400, 370, SLIDE_W//2 + 400, 580], radius=16, fill=(18, 28, 23), outline=(52, 211, 153), width=2)
    draw.text((SLIDE_W//2 - 360, 400), "Platform Deployment Endpoints:", fill=(250, 204, 21), font=font_pill)
    draw.text((SLIDE_W//2 - 360, 445), "• Client Web App: http://localhost:5173", fill=(255, 255, 255), font=font_body)
    draw.text((SLIDE_W//2 - 360, 480), "• Express 5 Backend API: http://localhost:3001/api", fill=(255, 255, 255), font=font_body)
    draw.text((SLIDE_W//2 - 360, 515), "• Air Quality Telemetry: OpenAQ v3 Ground Station (New Delhi CAAQMS)", fill=(180, 210, 195), font=font_body)
    
    draw.text((SLIDE_W//2 - 160, 640), "Thank You for Watching!", fill=(255, 255, 255), font=font_sub)
    
    return img

def build_all_slides():
    os.makedirs("demo_video/slides", exist_ok=True)
    
    # Slide 1: Intro Card
    print("Generating Slide 1 (Intro)...")
    s1 = make_intro_slide()
    s1.save("demo_video/slides/slide_01_intro.png")
    
    # Slide 2: Act 1 - Landing Page
    print("Generating Slide 2 (Landing Page)...")
    s2 = create_base_canvas()
    draw = ImageDraw.Draw(s2)
    draw_header(draw, "I", "Winter Smog Crisis & The VAYUWISE Vision")
    draw_window_frame(s2, "demo_video/screenshots/step_10_shot_1.png")
    draw_lower_third(s2, 
        "Act I: The Winter Smog Crisis & The VAYUWISE Vision",
        "Addressing hazardous urban inversions with dual CPCB NAQI & US EPA regulatory compliance.",
        [
            ("Dual Standard", (20, 50, 35), (40, 100, 70), (220, 255, 230)),
            ("Hack2Skill Ch-6", (40, 30, 10), (120, 80, 20), (250, 204, 21)),
            ("Full-Stack", (20, 45, 60), (40, 90, 130), (210, 240, 255))
        ]
    )
    s2.save("demo_video/slides/slide_02_landing.png")
    
    # Slide 3: Act 2 - Dashboard (OpenAQ + CAMS)
    print("Generating Slide 3 (Air Quality Dashboard)...")
    s3 = create_base_canvas()
    draw = ImageDraw.Draw(s3)
    draw_header(draw, "II", "Real-Time Ground Monitoring & Atmospheric Telemetry")
    draw_window_frame(s3, "demo_video/screenshots/step_10_shot_2.png")
    draw_lower_third(s3,
        "Act II: OpenAQ v3 Ground Stations & Copernicus Forecaster",
        "Calibrated physical sensors with Copernicus CAMS weather, inversion detection, and NAQI breakdown.",
        [
            ("OpenAQ v3 Ground Station", (50, 25, 20), (130, 50, 30), (255, 220, 200)),
            ("Live AQI: 314", (60, 20, 20), (160, 40, 40), (255, 180, 180)),
            ("Inversion Alerts", (40, 35, 10), (120, 90, 20), (250, 220, 100))
        ]
    )
    s3.save("demo_video/slides/slide_03_dashboard.png")
    
    # Slide 4: Act 3 - AI Routine Engine
    print("Generating Slide 4 (Personalized Routine)...")
    s4 = create_base_canvas()
    draw = ImageDraw.Draw(s4)
    draw_header(draw, "III", "AI-Driven Personalized Routine Engine")
    draw_window_frame(s4, "demo_video/screenshots/step_10_shot_3.png")
    draw_lower_third(s4,
        "Act III: Role-Tailored Smog Protection & Gemini AI Insights",
        "Hour-by-hour exposure schedules for commuters, students, workers, and asthmatic seniors with offline fallback.",
        [
            ("Google Gemini", (20, 50, 50), (40, 110, 110), (200, 255, 255)),
            ("Deterministic Fallback", (20, 45, 30), (40, 95, 60), (210, 255, 230)),
            ("Zero Hallucination", (40, 25, 55), (90, 50, 120), (245, 220, 255))
        ]
    )
    s4.save("demo_video/slides/slide_04_routine.png")
    
    # Slide 5: Act 4A - Commute Planner
    print("Generating Slide 5 (Commute Planner)...")
    s5 = create_base_canvas()
    draw = ImageDraw.Draw(s5)
    draw_header(draw, "IV-A", "Clean-Air Commute & Transit Optimization")
    draw_window_frame(s5, "demo_video/screenshots/step_10_shot_4.png")
    draw_lower_third(s5,
        "Act IV: Multi-Modal Transit Comparison & Exposure Dose",
        "Dijkstra-evaluated transit routes comparing Metro, AC bus, and open auto inhaled PM2.5 doses.",
        [
            ("Dijkstra Routing", (20, 45, 60), (40, 90, 130), (210, 240, 255)),
            ("Delhi Metro vs Bus", (30, 45, 25), (60, 100, 50), (220, 255, 210)),
            ("Physical Inhaled Dose", (50, 30, 15), (120, 70, 30), (255, 220, 190))
        ]
    )
    s5.save("demo_video/slides/slide_05_commute.png")
    
    # Slide 6: Act 4B - Indoor Air Simulator
    print("Generating Slide 6 (Indoor Air Simulator)...")
    s6 = create_base_canvas()
    draw = ImageDraw.Draw(s6)
    draw_header(draw, "IV-B", "Physics-Based Indoor Air Mass Balance")
    draw_window_frame(s6, "demo_video/screenshots/step_10_shot_5.png")
    draw_lower_third(s6,
        "Act IV: Mass-Balance IAQ Decay Curves & HEPA CADR Sizing",
        "Calculates natural ACH, air-cleaner sizing, and DIY Corsi-Rosenthal filtration efficacy.",
        [
            ("Physics Mass-Balance", (20, 50, 35), (40, 100, 70), (220, 255, 230)),
            ("HEPA CADR Math", (40, 25, 55), (90, 50, 120), (245, 220, 255)),
            ("DIY Air Cleaners", (50, 35, 10), (120, 90, 20), (250, 220, 120))
        ]
    )
    s6.save("demo_video/slides/slide_06_indoor.png")
    
    # Slide 7: Act 5A - Community Action
    print("Generating Slide 7 (Community Action)...")
    s7 = create_base_canvas()
    draw = ImageDraw.Draw(s7)
    draw_header(draw, "V-A", "Community Collective Impact & Verified Pledges")
    draw_window_frame(s7, "demo_video/screenshots/step_10_shot_6.png")
    draw_lower_third(s7,
        "Act V: Collective Citizen Action & Avoided Emissions",
        "Track verified community pledges, carpool clusters, and cumulative kg CO2 and PM2.5 grams saved.",
        [
            ("Verified Pledges", (20, 45, 60), (40, 90, 130), (210, 240, 255)),
            ("Avoided Emissions", (20, 50, 35), (40, 100, 70), (220, 255, 230)),
            ("Idempotent Actions", (40, 30, 10), (120, 80, 20), (250, 204, 21))
        ]
    )
    s7.save("demo_video/slides/slide_07_community.png")
    
    # Slide 8: Act 5B - Emergency Advisories
    print("Generating Slide 8 (Emergency Advisories)...")
    s8 = create_base_canvas()
    draw = ImageDraw.Draw(s8)
    draw_header(draw, "V-B", "Emergency Smog Advisories & Multilingual Delivery")
    draw_window_frame(s8, "demo_video/screenshots/step_10_shot_7.png")
    draw_lower_third(s8,
        "Act V: GRAP-IV Emergency Mitigation & 5-Language Access",
        "Urgent advisories with Hindi, Kannada, Spanish, and bidirectional Arabic RTL layouts.",
        [
            ("GRAP-IV Guidance", (60, 20, 20), (160, 40, 40), (255, 180, 180)),
            ("5 Languages", (30, 45, 25), (60, 100, 50), (220, 255, 210)),
            ("RTL Arabic Layout", (40, 25, 55), (90, 50, 120), (245, 220, 255))
        ]
    )
    s8.save("demo_video/slides/slide_08_advisories.png")
    
    # Slide 9: Act 6 - Architecture & Preferences
    print("Generating Slide 9 (Profile & Architecture)...")
    s9 = create_base_canvas()
    draw = ImageDraw.Draw(s9)
    draw_header(draw, "VI", "Enterprise Architecture & Standards Control")
    draw_window_frame(s9, "demo_video/screenshots/step_10_shot_8.png")
    draw_lower_third(s9,
        "Act VI: Full-Stack React 19, Express 5 & Firebase Cloud",
        "Resilient local and cloud auth, CPCB/EPA standard toggling, and complete zero-downtime persistence.",
        [
            ("React 19 + TypeScript", (20, 45, 60), (40, 90, 130), (210, 240, 255)),
            ("Firebase Admin & SDK", (50, 25, 20), (130, 50, 30), (255, 220, 200)),
            ("Express 5 Backend", (20, 50, 35), (40, 100, 70), (220, 255, 230))
        ]
    )
    s9.save("demo_video/slides/slide_09_profile.png")
    
    # Slide 10: Outro Card
    print("Generating Slide 10 (Outro)...")
    s10 = make_outro_slide()
    s10.save("demo_video/slides/slide_10_outro.png")
    print("All 10 slides generated successfully in demo_video/slides/")

if __name__ == "__main__":
    build_all_slides()
