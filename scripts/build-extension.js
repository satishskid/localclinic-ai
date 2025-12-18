#!/usr/bin/env node
/**
 * Production Build Script for Browser Extension
 * Creates a ready-to-submit extension package
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const extensionSrc = path.join(rootDir, 'browser-extension');
const outputDir = path.join(rootDir, 'dist-extension');

console.log('🧩 Building Medical AI Assistant Browser Extension...\n');

// Step 1: Clean and create output directory
console.log('1. Preparing output directory...');
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
}
fs.mkdirSync(outputDir, { recursive: true });

// Step 2: Copy extension files
console.log('2. Copying extension files...');
const filesToCopy = [
    'manifest.json',
    'popup.html',
    'popup.css',
    'popup.js',
    'background.js',
    'content-script.js',
    'content-style.css',
    'README.md'
];

filesToCopy.forEach(file => {
    const src = path.join(extensionSrc, file);
    const dest = path.join(outputDir, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`   ✓ ${file}`);
    } else {
        console.log(`   ⚠ Missing: ${file}`);
    }
});

// Step 3: Copy icons directory
console.log('3. Copying icons...');
const iconsSrc = path.join(extensionSrc, 'icons');
const iconsDest = path.join(outputDir, 'icons');
if (fs.existsSync(iconsSrc)) {
    fs.mkdirSync(iconsDest, { recursive: true });
    fs.readdirSync(iconsSrc).forEach(file => {
        fs.copyFileSync(path.join(iconsSrc, file), path.join(iconsDest, file));
    });
    console.log('   ✓ Icons copied');
} else {
    fs.mkdirSync(iconsDest, { recursive: true });
    console.log('   ⚠ No icons found - placeholder created');
}

// Step 4: Generate production icons if needed
console.log('4. Checking icons...');
const requiredIcons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
const missingIcons = requiredIcons.filter(icon => 
    !fs.existsSync(path.join(iconsDest, icon))
);

if (missingIcons.length > 0) {
    console.log(`   ⚠ Missing icons: ${missingIcons.join(', ')}`);
    
    // Create placeholder SVG icons that can be converted
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
        <rect width="128" height="128" rx="16" fill="#2563eb"/>
        <text x="64" y="80" font-size="72" text-anchor="middle" fill="white">🤖</text>
    </svg>`;
    
    fs.writeFileSync(path.join(iconsDest, 'icon.svg'), svgIcon);
    console.log('   Created icon.svg - convert to PNG with required sizes');
}

// Step 5: Validate manifest
console.log('5. Validating manifest...');
const manifestPath = path.join(outputDir, 'manifest.json');
try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    const required = ['name', 'version', 'manifest_version', 'permissions'];
    const missing = required.filter(key => !manifest[key]);
    
    if (missing.length > 0) {
        console.log(`   ❌ Missing required fields: ${missing.join(', ')}`);
    } else {
        console.log(`   ✓ Manifest valid (v${manifest.version}, MV${manifest.manifest_version})`);
    }
    
    // Check permissions
    if (manifest.permissions) {
        console.log(`   Permissions: ${manifest.permissions.join(', ')}`);
    }
} catch (error) {
    console.log(`   ❌ Invalid manifest: ${error.message}`);
}

// Step 6: Create ZIP for Chrome Web Store
console.log('6. Creating extension package...');

async function createZip() {
    const zipPath = path.join(rootDir, 'medical-ai-extension.zip');
    
    // Remove existing zip
    if (fs.existsSync(zipPath)) {
        fs.rmSync(zipPath);
    }
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            const sizeKB = (archive.pointer() / 1024).toFixed(2);
            console.log(`   ✓ Created: medical-ai-extension.zip (${sizeKB} KB)`);
            resolve(zipPath);
        });
        
        archive.on('error', (err) => {
            console.log(`   ❌ Failed to create ZIP: ${err.message}`);
            reject(err);
        });
        
        archive.pipe(output);
        archive.directory(outputDir, false);
        archive.finalize();
    });
}

// Check if archiver is available
try {
    await createZip();
} catch (error) {
    console.log('   ⚠ archiver not installed - run: npm install archiver');
    console.log('   Manual ZIP: Compress the dist-extension folder');
}

// Step 7: Generate submission checklist
console.log('\n7. Generating submission checklist...');
const checklist = `
# Chrome Web Store Submission Checklist

## Before Submission
- [ ] Update version number in manifest.json
- [ ] Add proper PNG icons (16x16, 32x32, 48x48, 128x128)
- [ ] Test extension locally in Chrome
- [ ] Test on sample medical application pages
- [ ] Verify AI analysis works correctly
- [ ] Test offline functionality

## Store Listing Requirements
- [ ] Extension name (max 45 characters)
- [ ] Short description (max 132 characters)
- [ ] Detailed description
- [ ] At least 1 screenshot (1280x800 or 640x400)
- [ ] Small promotional tile (440x280)
- [ ] Category: Productivity or Health
- [ ] Privacy policy URL (required for medical apps)

## Privacy & Security
- [ ] No unnecessary permissions
- [ ] Data handling disclosure
- [ ] HIPAA compliance statement
- [ ] No remote code execution
- [ ] All AI runs locally (privacy feature)

## Testing Checklist
- [ ] Selection analysis works
- [ ] Page content analysis works
- [ ] Results panel displays correctly
- [ ] Settings persist across sessions
- [ ] Works on various medical portals
- [ ] Error handling for edge cases

## Submission URLs
- Chrome Web Store: https://chrome.google.com/webstore/devconsole
- Edge Add-ons: https://partner.microsoft.com/dashboard/microsoftedge
- Firefox Add-ons: https://addons.mozilla.org/developers/

## Files Ready
- Location: dist-extension/
- Package: medical-ai-extension.zip
`;

fs.writeFileSync(path.join(outputDir, 'SUBMISSION_CHECKLIST.md'), checklist.trim());
console.log('   ✓ Created SUBMISSION_CHECKLIST.md');

// Final summary
console.log('\n' + '='.repeat(50));
console.log('✅ Extension build complete!\n');
console.log('📁 Files:', outputDir);
console.log('📦 Package: medical-ai-extension.zip');
console.log('\nNext steps:');
console.log('  1. Add PNG icons (16, 32, 48, 128 pixels)');
console.log('  2. Test: chrome://extensions → Load unpacked → select dist-extension/');
console.log('  3. Review SUBMISSION_CHECKLIST.md');
console.log('  4. Submit to Chrome Web Store');
