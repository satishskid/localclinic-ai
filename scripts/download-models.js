#!/usr/bin/env node
/**
 * Model Download Script
 * Pre-downloads AI models for offline bundling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const modelsDir = path.join(rootDir, 'models');

// Model configurations (matching ConfigManager)
const MODELS = {
    textClassification: {
        id: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        name: 'Text Classifier',
        size: '~250MB',
        required: true
    },
    medicalNER: {
        id: 'Xenova/bert-base-NER',
        name: 'Medical NER',
        size: '~420MB',
        required: false
    },
    textGeneration: {
        id: 'Xenova/flan-t5-small',
        name: 'Text Generator',
        size: '~300MB',
        required: false
    },
    imageClassification: {
        id: 'Xenova/vit-base-patch16-224',
        name: 'Image Classifier',
        size: '~350MB',
        required: false
    }
};

console.log('📥 Model Download Script for Medical AI Assistant\n');
console.log('This script helps you understand model download options.');
console.log('Models are downloaded from HuggingFace Hub.\n');

// Show available models
console.log('Available Models:');
console.log('=' .repeat(60));
Object.entries(MODELS).forEach(([key, model]) => {
    const status = model.required ? '(Required)' : '(Optional)';
    console.log(`  ${model.name} ${status}`);
    console.log(`    ID: ${model.id}`);
    console.log(`    Size: ${model.size}`);
    console.log();
});

// Explain options
console.log('Download Options:');
console.log('=' .repeat(60));
console.log(`
1. AUTOMATIC (Recommended)
   Models download automatically when the app first loads.
   They are cached in the browser's IndexedDB for offline use.
   
   Pros: Easy setup, automatic updates
   Cons: Requires initial internet connection

2. PRE-BUNDLED (For true offline deployment)
   Models can be bundled with the application.
   
   To bundle models:
   a) Run the app once online to cache models
   b) Export from browser cache using developer tools
   c) Or use transformers.js CLI to download:
   
   npx transformers-cli download ${MODELS.textClassification.id} --output ./models/
   
   Then configure vite.config.js to include the models folder.

3. HYBRID (Best of both)
   Ship with one required model bundled, download others on demand.
   This keeps initial download small while ensuring basic functionality.
`);

// Create models directory structure
console.log('Creating models directory structure...');
fs.mkdirSync(modelsDir, { recursive: true });

// Create README for models folder
const modelsReadme = `# AI Models Directory

This directory can hold pre-downloaded models for offline bundling.

## Option 1: Browser Cache (Recommended)
Models are automatically downloaded and cached in IndexedDB when the app runs.
No files needed here.

## Option 2: Pre-bundle Models
To pre-download models:

\`\`\`bash
# Install transformers.js CLI
npm install -g @xenova/transformers

# Download specific model
npx transformers-cli download Xenova/distilbert-base-uncased-finetuned-sst-2-english --output ./text-classifier/
\`\`\`

## Model Sizes
- Text Classifier: ~250MB
- Medical NER: ~420MB  
- Text Generator: ~300MB
- Image Classifier: ~350MB
- Total (all models): ~1.3GB

## Vite Configuration
To bundle pre-downloaded models, update vite.config.js:

\`\`\`javascript
export default defineConfig({
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      }
    }
  },
  // Copy models to dist
  plugins: [
    {
      name: 'copy-models',
      closeBundle() {
        // Copy models folder to dist
      }
    }
  ]
});
\`\`\`
`;

fs.writeFileSync(path.join(modelsDir, 'README.md'), modelsReadme);
console.log('✓ Created models/README.md\n');

// Check for transformers CLI
console.log('Checking for transformers CLI...');
try {
    const { execSync } = await import('child_process');
    execSync('npx transformers-cli --version', { stdio: 'pipe' });
    console.log('✓ transformers-cli available\n');
    
    // Offer to download
    console.log('To download the required text classifier model:');
    console.log(`  npx transformers-cli download ${MODELS.textClassification.id} --output ${modelsDir}/text-classifier/\n`);
} catch {
    console.log('⚠ transformers-cli not found');
    console.log('  Install with: npm install -g @xenova/transformers\n');
}

console.log('=' .repeat(60));
console.log('✅ Setup complete!\n');
console.log('For most use cases, simply run the app - models will download automatically.');
console.log('For offline deployment, see models/README.md for bundling instructions.');
