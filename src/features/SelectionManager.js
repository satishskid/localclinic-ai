/**
 * Selection Manager
 * Handles text, image, video, and screen region selection
 * Provides unified interface for content selection across the application
 */
export class SelectionManager {
    constructor() {
        this.currentSelection = null;
        this.listeners = new Map();
        this.highlightedElements = [];
    }
    
    initialize() {
        this.setupTextSelection();
        this.setupContentSelection();
        this.setupKeyboardShortcuts();
    }
    
    setupTextSelection() {
        // Monitor text selection in the content area
        document.addEventListener('mouseup', (e) => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText.length > 0) {
                // Check if selection is within content area
                const contentDisplay = document.getElementById('content-display');
                if (contentDisplay && contentDisplay.contains(selection.anchorNode)) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    
                    this.setSelection({
                        type: 'text',
                        content: selectedText,
                        position: {
                            x: rect.left + rect.width / 2,
                            y: rect.top
                        },
                        timestamp: Date.now()
                    });
                }
            }
        });
        
        // Hide toolbar when clicking elsewhere
        document.addEventListener('mousedown', (e) => {
            const toolbar = document.getElementById('selection-toolbar');
            if (toolbar && !toolbar.contains(e.target)) {
                // Small delay to allow click handlers to process
                setTimeout(() => {
                    const selection = window.getSelection();
                    if (!selection.toString().trim()) {
                        toolbar.classList.remove('visible');
                    }
                }, 100);
            }
        });
    }
    
    setupContentSelection() {
        // Handle clicks on selectable content (images, videos)
        document.addEventListener('click', (e) => {
            const selectableContent = e.target.closest('.selectable-content');
            
            if (selectableContent) {
                // Deselect previous
                document.querySelectorAll('.selectable-content.selected').forEach(el => {
                    if (el !== selectableContent) {
                        el.classList.remove('selected');
                    }
                });
                
                // Toggle selection
                selectableContent.classList.toggle('selected');
                
                if (selectableContent.classList.contains('selected')) {
                    const type = selectableContent.dataset.type;
                    let content = '';
                    
                    switch (type) {
                        case 'image':
                            const img = selectableContent.querySelector('img');
                            content = img ? img.src : '';
                            break;
                        case 'video':
                            const video = selectableContent.querySelector('video');
                            content = video ? video.src : '';
                            // Also get current frame if video is paused
                            if (video && video.paused) {
                                content = this.captureVideoFrame(video);
                            }
                            break;
                    }
                    
                    const rect = selectableContent.getBoundingClientRect();
                    
                    this.setSelection({
                        type: type,
                        content: content,
                        element: selectableContent,
                        position: {
                            x: rect.left + rect.width / 2,
                            y: rect.top
                        },
                        timestamp: Date.now()
                    });
                } else {
                    this.clearSelection();
                }
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + A: Analyze selection
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                if (this.currentSelection) {
                    this.emit('analyze-request', this.currentSelection);
                }
            }
            
            // Escape: Clear selection
            if (e.key === 'Escape') {
                this.clearSelection();
                document.getElementById('selection-toolbar')?.classList.remove('visible');
            }
        });
    }
    
    captureVideoFrame(video) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Could not capture video frame:', error);
            return video.src;
        }
    }
    
    setSelection(selection) {
        this.currentSelection = selection;
        this.emit('selection', selection);
    }
    
    getCurrentSelection() {
        return this.currentSelection;
    }
    
    clearSelection() {
        this.currentSelection = null;
        document.querySelectorAll('.selectable-content.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.emit('selection-cleared');
    }
    
    highlightSelection() {
        if (!this.currentSelection) return;
        
        if (this.currentSelection.type === 'text') {
            // Create highlight span
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const highlight = document.createElement('mark');
                highlight.className = 'ai-highlight';
                highlight.style.backgroundColor = 'rgba(37, 99, 235, 0.2)';
                highlight.style.padding = '2px 0';
                
                try {
                    range.surroundContents(highlight);
                    this.highlightedElements.push(highlight);
                } catch (error) {
                    // Handle complex selections that cross DOM boundaries
                    console.warn('Could not highlight selection:', error);
                }
            }
        } else if (this.currentSelection.element) {
            this.currentSelection.element.style.outline = '3px solid var(--primary-color)';
            this.highlightedElements.push(this.currentSelection.element);
        }
    }
    
    clearHighlights() {
        this.highlightedElements.forEach(el => {
            if (el.tagName === 'MARK') {
                el.replaceWith(...el.childNodes);
            } else {
                el.style.outline = '';
            }
        });
        this.highlightedElements = [];
    }
    
    registerElement(element) {
        // Make an element selectable
        element.classList.add('selectable-content');
        element.dataset.type = element.dataset.type || 'content';
    }
    
    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
    
    // Get selection as structured data for analysis
    getSelectionForAnalysis() {
        if (!this.currentSelection) return null;
        
        return {
            type: this.currentSelection.type,
            content: this.currentSelection.content,
            metadata: {
                timestamp: this.currentSelection.timestamp,
                source: 'user-selection'
            }
        };
    }
}
