# Chrome Web Store Submission Form Data

**Ready to copy-paste into the Chrome Web Store Developer Dashboard**

---

## Basic Information

### Extension Name
```
AI Medical Assistant - Local EMR Analysis
```

### Summary (132 characters max)
```
HIPAA-friendly AI assistant for medical professionals. Analyze clinical notes, images & videos locally - no data leaves your device.
```

### Description (Up to 16,000 characters)
```
AI Medical Assistant is a privacy-first clinical decision support tool designed for healthcare professionals. All analysis happens locally on your device using advanced AI models - no patient data ever leaves your browser.

KEY FEATURES:

🔒 Complete Privacy
• All processing happens locally on your device
• Zero data collection or transmission
• No cloud servers, no tracking, no analytics
• HIPAA-friendly architecture by design

🏥 Multi-Specialty Support
• ENT (Ear, Nose, Throat)
• Dental & Oral Health
• Dermatology & Skin Conditions
• Vital Signs Analysis
• Cardiology
• Radiology
• Gastroenterology
• Pediatrics
• Women's Health

📋 Smart Analysis
• Clinical note summarization
• Medical terminology extraction
• Key findings identification
• Age-appropriate analysis (Neonate to Geriatric)
• 25+ clinical report types

💡 Easy to Use
• Right-click on any medical text, image, or video
• Instant analysis in sidebar panel
• Export reports in multiple formats
• Works offline after initial setup

WHO IS THIS FOR?

• Physicians and Specialists
• Nurses and Nurse Practitioners
• Medical Students and Residents
• Healthcare Administrators
• Clinical Researchers

HOW IT WORKS:

1. Select any clinical text or right-click on medical images/videos
2. Choose "Analyze with AI Medical Assistant" from the context menu
3. View instant AI-powered analysis in the sidebar
4. Export or share findings as needed

TECHNICAL DETAILS:

• Uses Transformers.js for browser-based AI inference
• Models load on first use (~50MB download)
• Works entirely offline after model download
• No external API calls or data transmission

PRIVACY COMMITMENT:

We built this tool with privacy as the foundation, not an afterthought. Healthcare data is sensitive, and we believe it should never leave your control. That's why every analysis happens right on your device using cutting-edge browser AI technology.

Read our full privacy policy: https://satishskid.github.io/localclinic-ai/

DISCLAIMER:

This tool is designed to assist healthcare professionals and is not intended to replace clinical judgment. Always verify AI-generated analysis against your professional expertise and established medical guidelines.
```

---

## Category
```
Productivity
```

### Additional Category (optional)
```
Developer Tools
```

---

## Language
```
English
```

---

## Graphics Assets

### Store Icon (128x128 PNG)
**File:** `browser-extension/icons/icon128.png`
- Already created and included in extension

### Screenshots (1280x800 or 640x400, JPG or PNG)
**Required:** At least 1, up to 5

1. **screenshot-1-main-interface.png** - Main popup interface showing specialty selection
2. **screenshot-2-text-analysis.png** - Text analysis feature with clinical notes
3. **screenshot-3-context-menu.png** - Right-click context menu integration

### Promotional Images (optional but recommended)

| Asset | Size | File |
|-------|------|------|
| Small Promo Tile | 440x280 | `promo-small-440x280.png` |
| Large Promo Tile | 920x680 | `promo-large-440x680.png` |
| Marquee | 1400x560 | `promo-marquee-1400x560.png` |

---

## Privacy Practices

### Single Purpose Description
```
This extension provides AI-powered analysis of medical text, images, and videos to assist healthcare professionals. All processing occurs locally on the user's device with no data collection or transmission.
```

### Permission Justifications

| Permission | Justification |
|------------|---------------|
| `activeTab` | Required to analyze content on the current page when user initiates analysis |
| `contextMenus` | Provides right-click menu for easy access to analysis features |
| `storage` | Saves user preferences and analysis history locally |
| `scripting` | Injects content script to capture selected text and display analysis results |

### Data Usage Disclosures

**Does your extension collect user data?**
```
No
```

**Data Type Certifications:**
- [ ] Personally identifiable information - NOT COLLECTED
- [ ] Health information - NOT COLLECTED
- [ ] Financial information - NOT COLLECTED
- [ ] Authentication information - NOT COLLECTED
- [ ] Personal communications - NOT COLLECTED
- [ ] Location - NOT COLLECTED
- [ ] Web history - NOT COLLECTED
- [ ] User activity - NOT COLLECTED

---

## Privacy Policy URL
```
https://satishskid.github.io/localclinic-ai/
```

---

## Distribution

### Visibility
```
Public
```

### Regions
```
All regions
```

---

## Contact Information

### Developer Email (Required)
```
[YOUR_EMAIL_HERE]
```

### Website (Optional)
```
https://github.com/satishskid/localclinic-ai
```

---

## Additional Notes for Reviewers

```
This extension uses Transformers.js (https://huggingface.co/docs/transformers.js) 
to run AI models directly in the browser. No external servers are contacted for 
any analysis. The extension loads AI models on first use from Hugging Face's CDN, 
after which it can work completely offline.

Key privacy features:
- No data collection whatsoever
- No analytics or tracking
- No external API calls for analysis
- All processing happens locally using WebGPU/WASM
- User data never leaves the browser

Test the extension by:
1. Load unpacked in chrome://extensions
2. Navigate to any webpage with medical-related text
3. Select text and right-click to see context menu
4. Click the extension icon to open the popup interface
```

---

## Checklist Before Submission

- [ ] Extension ZIP file ready (`dist-extension/ai-medical-assistant.zip`)
- [ ] Icon 128x128 PNG included in ZIP
- [ ] At least 1 screenshot prepared
- [ ] Privacy policy published and accessible
- [ ] Developer email verified in Chrome Web Store account
- [ ] $5 one-time developer fee paid (if first extension)
- [ ] Manifest version is 3
- [ ] All permissions justified
