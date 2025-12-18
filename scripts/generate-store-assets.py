#!/usr/bin/env python3
"""Generate Chrome Web Store assets for AI Medical Assistant"""

from PIL import Image, ImageDraw, ImageFont
import os

# Colors
PRIMARY_BLUE = (41, 98, 255)  # Medical blue
DARK_BG = (26, 32, 44)  # Dark background
WHITE = (255, 255, 255)
LIGHT_GRAY = (240, 240, 245)
GREEN = (72, 187, 120)  # Success green
TEAL = (56, 178, 172)  # Medical teal

OUTPUT_DIR = "/Users/spr/localAIscreen/store-assets"

def draw_rounded_rect(draw, coords, radius, fill):
    """Draw a rounded rectangle"""
    x1, y1, x2, y2 = coords
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
    draw.ellipse([x1, y1, x1 + radius * 2, y1 + radius * 2], fill=fill)
    draw.ellipse([x2 - radius * 2, y1, x2, y1 + radius * 2], fill=fill)
    draw.ellipse([x1, y2 - radius * 2, x1 + radius * 2, y2], fill=fill)
    draw.ellipse([x2 - radius * 2, y2 - radius * 2, x2, y2], fill=fill)

def draw_medical_cross(draw, center_x, center_y, size, color):
    """Draw a medical cross symbol"""
    half = size // 2
    third = size // 6
    # Vertical bar
    draw.rectangle([center_x - third, center_y - half, center_x + third, center_y + half], fill=color)
    # Horizontal bar
    draw.rectangle([center_x - half, center_y - third, center_x + half, center_y + third], fill=color)

def create_screenshot_1(width=1280, height=800):
    """Main interface screenshot"""
    img = Image.new('RGB', (width, height), DARK_BG)
    draw = ImageDraw.Draw(img)
    
    # Browser chrome simulation (top bar)
    draw.rectangle([0, 0, width, 60], fill=(45, 55, 72))
    
    # URL bar
    draw_rounded_rect(draw, [200, 15, 900, 45], 15, (60, 70, 90))
    draw.text((220, 22), "emr.hospital.com/patient/dashboard", fill=(180, 180, 190))
    
    # Main content area (simulated EMR)
    draw.rectangle([0, 60, width, height], fill=(250, 250, 252))
    
    # Sidebar (EMR navigation)
    draw.rectangle([0, 60, 200, height], fill=(240, 242, 245))
    
    # Extension popup (overlay)
    popup_x, popup_y = 850, 80
    popup_w, popup_h = 380, 500
    
    # Popup shadow
    draw.rectangle([popup_x + 5, popup_y + 5, popup_x + popup_w + 5, popup_y + popup_h + 5], fill=(0, 0, 0, 50))
    
    # Popup background
    draw_rounded_rect(draw, [popup_x, popup_y, popup_x + popup_w, popup_y + popup_h], 12, WHITE)
    
    # Popup header
    draw_rounded_rect(draw, [popup_x, popup_y, popup_x + popup_w, popup_y + 70], 12, PRIMARY_BLUE)
    draw.rectangle([popup_x, popup_y + 50, popup_x + popup_w, popup_y + 70], fill=PRIMARY_BLUE)
    
    # Medical cross icon
    draw_medical_cross(draw, popup_x + 40, popup_y + 35, 30, WHITE)
    
    # Header text
    draw.text((popup_x + 70, popup_y + 18), "AI Medical Assistant", fill=WHITE)
    draw.text((popup_x + 70, popup_y + 40), "Local Analysis - 100% Private", fill=(200, 210, 255))
    
    # Specialty buttons
    specialties = ["ENT", "Dental", "Dermatology", "Cardiology", "Radiology"]
    btn_y = popup_y + 90
    for i, spec in enumerate(specialties):
        btn_color = TEAL if i == 0 else (230, 235, 240)
        text_color = WHITE if i == 0 else (60, 60, 70)
        draw_rounded_rect(draw, [popup_x + 20, btn_y, popup_x + popup_w - 20, btn_y + 40], 8, btn_color)
        draw.text((popup_x + 40, btn_y + 10), spec, fill=text_color)
        btn_y += 50
    
    # Status indicator
    draw.ellipse([popup_x + 20, popup_y + popup_h - 50, popup_x + 35, popup_y + popup_h - 35], fill=GREEN)
    draw.text((popup_x + 45, popup_y + popup_h - 48), "Ready - All processing local", fill=(100, 100, 110))
    
    # Simulated EMR content
    draw.text((220, 80), "Patient Dashboard", fill=(40, 50, 70))
    draw.rectangle([220, 110, 800, 300], fill=WHITE, outline=(220, 225, 230))
    draw.text((240, 130), "Clinical Notes", fill=(60, 70, 90))
    draw.text((240, 160), "Patient presents with symptoms of...", fill=(100, 110, 130))
    draw.text((240, 185), "Physical examination reveals...", fill=(100, 110, 130))
    draw.text((240, 210), "Assessment and Plan:", fill=(100, 110, 130))
    
    # Highlight showing selection
    draw.rectangle([235, 155, 500, 175], fill=(255, 255, 200, 100), outline=(255, 200, 50))
    
    img.save(os.path.join(OUTPUT_DIR, "screenshot-1-main-interface.png"), "PNG")
    print("Created screenshot-1-main-interface.png")

def create_screenshot_2(width=1280, height=800):
    """Analysis results screenshot"""
    img = Image.new('RGB', (width, height), LIGHT_GRAY)
    draw = ImageDraw.Draw(img)
    
    # Browser top bar
    draw.rectangle([0, 0, width, 60], fill=(45, 55, 72))
    draw_rounded_rect(draw, [200, 15, 900, 45], 15, (60, 70, 90))
    draw.text((220, 22), "clinic.medicalrecords.com/notes", fill=(180, 180, 190))
    
    # Main content
    draw.rectangle([0, 60, width, height], fill=(248, 250, 252))
    
    # Analysis panel on right
    panel_x = 750
    draw.rectangle([panel_x, 60, width, height], fill=WHITE)
    draw.rectangle([panel_x, 60, panel_x + 2, height], fill=(220, 225, 230))
    
    # Panel header
    draw.rectangle([panel_x, 60, width, 120], fill=PRIMARY_BLUE)
    draw_medical_cross(draw, panel_x + 35, 90, 25, WHITE)
    draw.text((panel_x + 60, 75), "Analysis Results", fill=WHITE)
    draw.text((panel_x + 60, 95), "ENT Specialty", fill=(180, 200, 255))
    
    # Analysis content
    y = 140
    draw.text((panel_x + 20, y), "Key Findings", fill=(40, 50, 70))
    y += 30
    
    findings = [
        "Bilateral otitis media identified",
        "Tympanic membrane inflammation",
        "Recommend audiometry follow-up"
    ]
    for finding in findings:
        draw.ellipse([panel_x + 25, y + 5, panel_x + 35, y + 15], fill=GREEN)
        draw.text((panel_x + 45, y), finding, fill=(70, 80, 100))
        y += 35
    
    y += 20
    draw.text((panel_x + 20, y), "Medical Terms Extracted", fill=(40, 50, 70))
    y += 30
    
    terms = ["Otitis Media", "Tympanic", "Audiometry"]
    term_x = panel_x + 25
    for term in terms:
        draw_rounded_rect(draw, [term_x, y, term_x + 100, y + 28], 5, (230, 240, 255))
        draw.text((term_x + 10, y + 5), term, fill=PRIMARY_BLUE)
        term_x += 110
    
    # Left side - clinical note
    draw.rectangle([30, 80, 720, 550], fill=WHITE, outline=(220, 225, 230))
    draw.text((50, 100), "Clinical Note - ENT Consultation", fill=(40, 50, 70))
    draw.rectangle([50, 130, 700, 132], fill=(230, 235, 240))
    
    note_lines = [
        "Chief Complaint: Ear pain and hearing difficulty x 3 days",
        "",
        "History of Present Illness:",
        "Patient is a 45-year-old presenting with bilateral ear pain,",
        "decreased hearing, and sensation of fullness. Denies fever,",
        "drainage, or recent URI symptoms.",
        "",
        "Physical Examination:",
        "Ears: Bilateral TM erythema with decreased mobility.",
        "No perforation or drainage noted."
    ]
    y = 150
    for line in note_lines:
        draw.text((50, y), line, fill=(70, 80, 100))
        y += 25
    
    # Privacy badge
    draw_rounded_rect(draw, [panel_x + 20, height - 80, width - 20, height - 30], 8, (230, 255, 230))
    draw.ellipse([panel_x + 30, height - 70, panel_x + 50, height - 50], fill=GREEN)
    draw.text((panel_x + 60, height - 68), "100% Local Processing", fill=(40, 100, 60))
    draw.text((panel_x + 60, height - 48), "No data sent to servers", fill=(80, 130, 90))
    
    img.save(os.path.join(OUTPUT_DIR, "screenshot-2-analysis.png"), "PNG")
    print("Created screenshot-2-analysis.png")

def create_screenshot_3(width=1280, height=800):
    """Context menu screenshot"""
    img = Image.new('RGB', (width, height), LIGHT_GRAY)
    draw = ImageDraw.Draw(img)
    
    # Browser top bar
    draw.rectangle([0, 0, width, 60], fill=(45, 55, 72))
    draw_rounded_rect(draw, [200, 15, 900, 45], 15, (60, 70, 90))
    draw.text((220, 22), "hospital.ehr-system.com/patient", fill=(180, 180, 190))
    
    # Main content
    draw.rectangle([0, 60, width, height], fill=(252, 253, 255))
    
    # Clinical text area
    draw.rectangle([100, 100, 900, 500], fill=WHITE, outline=(220, 225, 230))
    draw.text((120, 120), "Patient Clinical Summary", fill=(40, 50, 70))
    draw.rectangle([120, 150, 880, 152], fill=(230, 235, 240))
    
    # Selected text (highlighted)
    text_lines = [
        "The patient presents with a 2-week history of progressive",
        "dysphagia and odynophagia. Examination reveals erythematous",
        "pharyngeal mucosa with bilateral tonsillar enlargement."
    ]
    y = 180
    for i, line in enumerate(text_lines):
        if i < 2:
            # Highlighted selection
            draw.rectangle([120, y - 2, 850, y + 22], fill=(179, 205, 255))
        draw.text((120, y), line, fill=(50, 60, 80))
        y += 30
    
    # Context menu
    menu_x, menu_y = 400, 250
    menu_w, menu_h = 280, 220
    
    # Menu shadow
    draw.rectangle([menu_x + 4, menu_y + 4, menu_x + menu_w + 4, menu_y + menu_h + 4], fill=(180, 180, 180))
    
    # Menu background
    draw.rectangle([menu_x, menu_y, menu_x + menu_w, menu_y + menu_h], fill=WHITE, outline=(200, 200, 210))
    
    # Menu items
    menu_items = [
        ("Copy", False),
        ("Cut", False),
        ("Paste", False),
        (None, False),  # Separator
        ("AI Medical Assistant", True),
    ]
    
    item_y = menu_y + 8
    for item, highlight in menu_items:
        if item is None:
            draw.rectangle([menu_x + 10, item_y + 5, menu_x + menu_w - 10, item_y + 6], fill=(220, 220, 230))
            item_y += 15
        else:
            if highlight:
                draw.rectangle([menu_x + 5, item_y, menu_x + menu_w - 5, item_y + 32], fill=PRIMARY_BLUE)
                draw_medical_cross(draw, menu_x + 25, item_y + 16, 16, WHITE)
                draw.text((menu_x + 45, item_y + 8), item, fill=WHITE)
            else:
                draw.text((menu_x + 25, item_y + 8), item, fill=(60, 60, 70))
            item_y += 35
    
    # Submenu
    submenu_x = menu_x + menu_w - 5
    submenu_y = item_y - 35 - 20
    submenu_w = 200
    submenu_h = 180
    
    draw.rectangle([submenu_x + 4, submenu_y + 4, submenu_x + submenu_w + 4, submenu_y + submenu_h + 4], fill=(180, 180, 180))
    draw.rectangle([submenu_x, submenu_y, submenu_x + submenu_w, submenu_y + submenu_h], fill=WHITE, outline=(200, 200, 210))
    
    submenu_items = ["Analyze Selection", "Summarize Text", "Extract Terms", "Generate Report"]
    sub_y = submenu_y + 10
    for i, item in enumerate(submenu_items):
        if i == 0:
            draw.rectangle([submenu_x + 5, sub_y, submenu_x + submenu_w - 5, sub_y + 30], fill=(240, 245, 255))
        draw.text((submenu_x + 20, sub_y + 6), item, fill=(50, 60, 80))
        sub_y += 38
    
    # Info text at bottom
    draw.text((100, 600), "Right-click on any medical text to analyze with AI", fill=(100, 110, 130))
    draw.text((100, 630), "All processing happens locally on your device", fill=(120, 130, 150))
    
    img.save(os.path.join(OUTPUT_DIR, "screenshot-3-context-menu.png"), "PNG")
    print("Created screenshot-3-context-menu.png")

def create_small_promo(width=440, height=280):
    """Small promo tile 440x280"""
    img = Image.new('RGB', (width, height), PRIMARY_BLUE)
    draw = ImageDraw.Draw(img)
    
    # Gradient effect (simple)
    for i in range(height):
        alpha = i / height
        r = int(PRIMARY_BLUE[0] * (1 - alpha * 0.3))
        g = int(PRIMARY_BLUE[1] * (1 - alpha * 0.3))
        b = int(min(255, PRIMARY_BLUE[2] * (1 + alpha * 0.1)))
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    # Medical cross
    draw_medical_cross(draw, 70, 140, 80, WHITE)
    
    # Text
    draw.text((130, 80), "AI Medical", fill=WHITE)
    draw.text((130, 115), "Assistant", fill=WHITE)
    
    draw.text((130, 160), "Analyze clinical text,", fill=(200, 215, 255))
    draw.text((130, 185), "images & videos locally", fill=(200, 215, 255))
    
    # Privacy badge
    draw_rounded_rect(draw, [130, 220, 350, 250], 5, (255, 255, 255, 50))
    draw.ellipse([140, 227, 156, 243], fill=GREEN)
    draw.text((165, 227), "100% Private", fill=WHITE)
    
    img.save(os.path.join(OUTPUT_DIR, "promo-small-440x280.png"), "PNG")
    print("Created promo-small-440x280.png")

def create_marquee_promo(width=1400, height=560):
    """Marquee promo tile 1400x560"""
    img = Image.new('RGB', (width, height), DARK_BG)
    draw = ImageDraw.Draw(img)
    
    # Background pattern - subtle medical crosses
    for x in range(0, width, 100):
        for y in range(0, height, 100):
            draw_medical_cross(draw, x + 50, y + 50, 20, (40, 50, 65))
    
    # Main content area
    draw_rounded_rect(draw, [50, 50, width - 50, height - 50], 20, (35, 45, 60))
    
    # Left side - text
    draw.text((100, 120), "AI Medical Assistant", fill=WHITE)
    draw.text((100, 180), "Local Clinical Analysis", fill=PRIMARY_BLUE)
    
    draw.text((100, 260), "Analyze medical text, images & videos", fill=(180, 190, 210))
    draw.text((100, 300), "with AI that runs 100% on your device.", fill=(180, 190, 210))
    draw.text((100, 340), "Your patient data never leaves your browser.", fill=(180, 190, 210))
    
    # Feature list
    features = [
        "9 Medical Specialties",
        "HIPAA-Friendly Architecture", 
        "No Cloud Required",
        "Works Offline"
    ]
    y = 420
    x = 100
    for feat in features:
        draw.ellipse([x, y + 3, x + 14, y + 17], fill=GREEN)
        draw.text((x + 25, y), feat, fill=(200, 210, 225))
        x += 280
    
    # Right side - mock UI
    ui_x = 900
    draw_rounded_rect(draw, [ui_x, 80, width - 80, height - 80], 15, WHITE)
    
    # UI header
    draw_rounded_rect(draw, [ui_x, 80, width - 80, 150], 15, PRIMARY_BLUE)
    draw.rectangle([ui_x, 130, width - 80, 150], fill=PRIMARY_BLUE)
    draw_medical_cross(draw, ui_x + 40, 115, 30, WHITE)
    draw.text((ui_x + 70, 100), "AI Medical Assistant", fill=WHITE)
    
    # UI content
    specs = ["ENT", "Dental", "Dermatology", "Cardiology"]
    btn_y = 170
    for spec in specs:
        draw_rounded_rect(draw, [ui_x + 20, btn_y, width - 100, btn_y + 35], 6, (240, 245, 250))
        draw.text((ui_x + 40, btn_y + 8), spec, fill=(60, 70, 90))
        btn_y += 50
    
    # Status
    draw.ellipse([ui_x + 25, height - 130, ui_x + 40, height - 115], fill=GREEN)
    draw.text((ui_x + 50, height - 130), "Ready", fill=(80, 100, 80))
    
    img.save(os.path.join(OUTPUT_DIR, "promo-marquee-1400x560.png"), "PNG")
    print("Created promo-marquee-1400x560.png")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("Generating Chrome Web Store assets...")
    print()
    
    # Screenshots (1280x800)
    create_screenshot_1()
    create_screenshot_2()
    create_screenshot_3()
    
    # Promo tiles
    create_small_promo()
    create_marquee_promo()
    
    print()
    print("All assets created in:", OUTPUT_DIR)
    print()
    print("Files created:")
    for f in os.listdir(OUTPUT_DIR):
        if f.endswith('.png'):
            path = os.path.join(OUTPUT_DIR, f)
            size = os.path.getsize(path)
            print(f"  {f} ({size:,} bytes)")
