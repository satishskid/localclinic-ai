#!/usr/bin/env node
/**
 * Production Build Script for Web Application
 * Creates optimized build with model pre-caching support
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🏗️  Building Medical AI Assistant Web App...\n');

// Step 1: Clean previous build
console.log('1. Cleaning previous build...');
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Step 2: Run Vite build
console.log('2. Running Vite production build...');
try {
    execSync('npm run build', { 
        cwd: rootDir, 
        stdio: 'inherit' 
    });
} catch (error) {
    console.error('❌ Vite build failed:', error.message);
    process.exit(1);
}

// Step 3: Generate service worker for offline support
console.log('3. Generating service worker...');
const swContent = `
// Service Worker for Medical AI Assistant
const CACHE_NAME = 'medical-ai-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/index.js',
    '/assets/index.css'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like model downloads from HuggingFace)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200) {
                    return response;
                }
                
                // Clone and cache
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                
                return response;
            });
        })
    );
});
`;

fs.writeFileSync(path.join(distDir, 'sw.js'), swContent.trim());

// Step 4: Add service worker registration to index.html
console.log('4. Adding service worker registration...');
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    const swRegistration = `
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('Service Worker registered'))
                    .catch(err => console.error('SW registration failed:', err));
            });
        }
    </script>
    `;
    
    indexContent = indexContent.replace('</head>', `${swRegistration}</head>`);
    fs.writeFileSync(indexPath, indexContent);
}

// Step 5: Create manifest.json for PWA
console.log('5. Creating PWA manifest...');
const manifest = {
    name: 'Medical AI Assistant',
    short_name: 'MedAI',
    description: 'AI-powered medical analysis assistant for ENT and dental professionals',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
        {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
        },
        {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
        }
    ]
};
fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Step 6: Create icons directory with placeholder info
const iconsDir = path.join(distDir, 'icons');
fs.mkdirSync(iconsDir, { recursive: true });
fs.writeFileSync(path.join(iconsDir, 'README.txt'), `
Place your PWA icons here:
- icon-192.png (192x192 pixels)
- icon-512.png (512x512 pixels)

You can use tools like:
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/
`);

// Step 7: Build summary
console.log('\n✅ Build complete!\n');
console.log('📁 Output directory:', distDir);
console.log('\nTo deploy:');
console.log('  1. Add your PWA icons to dist/icons/');
console.log('  2. Upload the dist/ folder to your web server');
console.log('  3. Ensure HTTPS is configured');
console.log('  4. Set proper CORS headers for model downloads');
console.log('\nTo test locally:');
console.log('  npx serve dist');
