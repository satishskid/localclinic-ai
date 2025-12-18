# Chrome Web Store Submission Checklist

## Pre-Submission Requirements

### Files Ready
- [x] Extension ZIP: `dist-extension/ai-medical-assistant.zip` (39.8KB)
- [x] Icon 128x128: `browser-extension/icons/icon128.png`
- [x] Privacy Policy: `docs/index.html` (for GitHub Pages)
- [x] Form Data: `store-assets/CHROME_STORE_FORM_DATA.md`

### Technical Validation
- [x] Manifest V3 compliance verified
- [x] All 39 unit tests passing
- [x] Extension loads in Chrome (unpacked)
- [x] Context menu appears on right-click
- [x] Popup opens and displays correctly
- [x] No console errors

### Privacy Policy
- [x] Privacy policy written (`PRIVACY_POLICY.md`)
- [x] HTML version created (`docs/index.html`)
- [ ] GitHub Pages enabled (Settings > Pages > Deploy from branch: main, folder: /docs)
- [ ] Privacy URL accessible: `https://satishskid.github.io/ConciousAI/`

---

## Submission Steps

### Step 1: Enable GitHub Pages
1. Go to https://github.com/satishskid/localclinic-ai/settings/pages
2. Under "Source", select "Deploy from a branch"
3. Select branch: `main`
4. Select folder: `/docs`
5. Click "Save"
6. Wait 1-2 minutes for deployment
7. Verify: https://satishskid.github.io/localclinic-ai/

### Step 2: Chrome Web Store Developer Account
1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with Google account
3. Pay $5 one-time registration fee (if first time)
4. Verify your email address

### Step 3: Create New Item
1. Click "New Item"
2. Upload `dist-extension/ai-medical-assistant.zip`
3. Wait for upload to complete

### Step 4: Fill Store Listing
Copy from `store-assets/CHROME_STORE_FORM_DATA.md`:
- Extension name
- Summary (132 chars)
- Description
- Category: Productivity

### Step 5: Upload Graphics
1. Store icon: Already in ZIP (128x128)
2. Screenshots: Create or use placeholder (1280x800)
3. Promotional tiles (optional)

### Step 6: Privacy Practices
1. Single purpose description: Copy from form data
2. Permission justifications: Fill for each permission
3. Data usage: Certify "No data collection"
4. Privacy policy URL: `https://satishskid.github.io/ConciousAI/`

### Step 7: Distribution
1. Visibility: Public
2. Regions: All regions

### Step 8: Submit for Review
1. Review all information
2. Click "Submit for review"
3. Expected review time: 1-3 business days

---

## Post-Submission

### If Rejected
- Check email for rejection reason
- Common issues:
  - Missing permission justifications
  - Privacy policy not accessible
  - Screenshots not matching actual extension
  - Description claims not verifiable

### After Approval
- Extension will be live on Chrome Web Store
- Share the store URL
- Update GitHub README with store link

---

## Quick Reference

| Item | Value |
|------|-------|
| ZIP File | `dist-extension/ai-medical-assistant.zip` |
| ZIP Size | 39.8 KB |
| Privacy URL | `https://satishskid.github.io/localclinic-ai/` |
| GitHub Repo | `https://github.com/satishskid/localclinic-ai` |
| Manifest Version | 3 |
| Permissions | activeTab, contextMenus, storage, scripting |
