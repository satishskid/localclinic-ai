/**
 * Content Script - AI Medical Assistant
 * Injected into every page to handle selection, capture, and display results
 */

// State
let captureMode = false;
let resultsPanel = null;

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getSelection':
            const selectedText = window.getSelection().toString().trim();
            sendResponse({ text: selectedText });
            break;
            
        case 'getPageContent':
            const content = extractPageContent();
            sendResponse({ content: content });
            break;
            
        case 'startCapture':
            startRegionCapture();
            sendResponse({ success: true });
            break;
            
        case 'analyzeImage':
            analyzeImageFromContext(request.imageUrl);
            sendResponse({ success: true });
            break;
            
        case 'showResults':
            showResultsPanel(request.results);
            sendResponse({ success: true });
            break;
    }
    return true;
});

// Extract all text content from page
function extractPageContent() {
    const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, span, div');
    const textParts = [];
    
    contentElements.forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 20 && !textParts.includes(text)) {
            // Avoid duplicate content
            let isDuplicate = textParts.some(existing => 
                existing.includes(text) || text.includes(existing)
            );
            if (!isDuplicate) {
                textParts.push(text);
            }
        }
    });
    
    return textParts.slice(0, 50).join('\n\n'); // Limit to first 50 sections
}

// Start region capture mode
function startRegionCapture() {
    captureMode = true;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'ai-capture-overlay';
    overlay.innerHTML = `
        <div class="ai-capture-instructions">
            <span>🎯 Click and drag to select a region to analyze</span>
            <button id="ai-capture-cancel">Cancel (ESC)</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Variables for drawing
    let startX, startY, selectionBox;
    let isDrawing = false;
    
    // Mouse handlers
    const handleMouseDown = (e) => {
        if (e.target.id === 'ai-capture-cancel') {
            cancelCapture();
            return;
        }
        
        isDrawing = true;
        startX = e.clientX;
        startY = e.clientY;
        
        selectionBox = document.createElement('div');
        selectionBox.className = 'ai-capture-selection';
        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
        overlay.appendChild(selectionBox);
    };
    
    const handleMouseMove = (e) => {
        if (!isDrawing || !selectionBox) return;
        
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        
        selectionBox.style.width = Math.abs(width) + 'px';
        selectionBox.style.height = Math.abs(height) + 'px';
        selectionBox.style.left = (width < 0 ? e.clientX : startX) + 'px';
        selectionBox.style.top = (height < 0 ? e.clientY : startY) + 'px';
    };
    
    const handleMouseUp = (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        
        const rect = selectionBox.getBoundingClientRect();
        
        if (rect.width > 20 && rect.height > 20) {
            captureRegion(rect);
        }
        
        cancelCapture();
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            cancelCapture();
        }
    };
    
    const cancelCapture = () => {
        captureMode = false;
        overlay.remove();
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('keydown', handleKeyDown);
    };
    
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
}

// Capture a specific region
async function captureRegion(rect) {
    // Get elements within the region
    const elements = document.elementsFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
    );
    
    let capturedText = '';
    let capturedImages = [];
    
    elements.forEach(el => {
        if (el.tagName === 'IMG') {
            capturedImages.push(el.src);
        }
        const text = el.innerText?.trim();
        if (text) {
            capturedText += text + '\n';
        }
    });
    
    // Send for analysis
    if (capturedText || capturedImages.length > 0) {
        chrome.runtime.sendMessage({
            action: 'analyze',
            content: capturedText || 'Image region captured',
            contentType: capturedImages.length > 0 ? 'image' : 'text',
            analysisType: 'diagnosis'
        }, (response) => {
            if (response && response.success) {
                showResultsPanel(response.results);
            }
        });
    }
}

// Analyze image from context menu
function analyzeImageFromContext(imageUrl) {
    chrome.runtime.sendMessage({
        action: 'analyze',
        content: imageUrl,
        contentType: 'image',
        analysisType: 'diagnosis'
    }, (response) => {
        if (response && response.success) {
            showResultsPanel(response.results);
        }
    });
}

// Show results panel
function showResultsPanel(results) {
    // Remove existing panel
    if (resultsPanel) {
        resultsPanel.remove();
    }
    
    resultsPanel = document.createElement('div');
    resultsPanel.id = 'ai-results-panel';
    resultsPanel.innerHTML = `
        <div class="ai-results-header">
            <span>🤖 AI Medical Assistant</span>
            <button class="ai-results-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="ai-results-content">
            ${results.summary ? `<div class="ai-results-summary"><strong>Summary:</strong> ${results.summary}</div>` : ''}
            
            ${results.findings && results.findings.length > 0 ? `
                <div class="ai-results-section">
                    <strong>Key Findings:</strong>
                    <ul>
                        ${results.findings.map(f => `<li>✓ ${f}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${results.recommendations && results.recommendations.length > 0 ? `
                <div class="ai-results-section">
                    <strong>Recommendations:</strong>
                    <ul>
                        ${results.recommendations.map(r => `<li>💡 ${r}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${results.confidence ? `
                <div class="ai-results-confidence">
                    Confidence: ${Math.round(results.confidence * 100)}%
                </div>
            ` : ''}
        </div>
        <div class="ai-results-footer">
            <button class="ai-results-btn" onclick="navigator.clipboard.writeText(this.parentElement.previousElementSibling.innerText); this.innerText='Copied!';">📋 Copy</button>
            <button class="ai-results-btn primary" onclick="this.parentElement.parentElement.remove();">✓ Done</button>
        </div>
        <div class="ai-results-privacy">
            🔒 Analysis performed locally - no data sent to servers
        </div>
    `;
    
    document.body.appendChild(resultsPanel);
    
    // Make draggable
    makeDraggable(resultsPanel);
}

// Make element draggable
function makeDraggable(element) {
    const header = element.querySelector('.ai-results-header');
    let isDragging = false;
    let offsetX, offsetY;
    
    header.style.cursor = 'move';
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        element.style.left = (e.clientX - offsetX) + 'px';
        element.style.top = (e.clientY - offsetY) + 'px';
        element.style.right = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Add floating action button
function addFloatingButton() {
    // Check if already exists
    if (document.getElementById('ai-floating-btn')) return;
    
    const btn = document.createElement('div');
    btn.id = 'ai-floating-btn';
    btn.innerHTML = '🤖';
    btn.title = 'AI Medical Assistant - Select text and click';
    
    btn.addEventListener('click', () => {
        const selectedText = window.getSelection().toString().trim();
        
        if (selectedText) {
            chrome.runtime.sendMessage({
                action: 'analyze',
                content: selectedText,
                contentType: 'text',
                analysisType: 'diagnosis'
            }, (response) => {
                if (response && response.success) {
                    showResultsPanel(response.results);
                }
            });
        } else {
            // Show popup
            chrome.runtime.sendMessage({ action: 'openPopup' });
        }
    });
    
    document.body.appendChild(btn);
}

// Initialize
addFloatingButton();
