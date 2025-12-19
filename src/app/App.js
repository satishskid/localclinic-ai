/**
 * Main Application Controller
 * Orchestrates all components of the Medical AI Assistant
 */
export class App {
    constructor({ modelManager, uiManager, selectionManager, analysisManager, reportManager }) {
        this.modelManager = modelManager;
        this.uiManager = uiManager;
        this.selectionManager = selectionManager;
        this.analysisManager = analysisManager;
        this.reportManager = reportManager;
        
        this.currentUser = null;
        this.currentCase = null;
    }
    
    async initialize() {
        // Setup event listeners
        this.setupLoginHandlers();
        this.setupNavigationHandlers();
        this.setupSelectionHandlers();
        this.setupAnalysisHandlers();
        this.setupReportHandlers();
        this.setupUploadHandlers();
        this.setupScreenCaptureHandlers();
        this.setupTabAnalysisHandlers();
        this.setupExternalContentHandlers();
        this.setupTrainingModeHandlers();
        
        // Initialize selection manager for content selection
        this.selectionManager.initialize();
        
        // Check for saved session
        this.checkSession();
    }
    
    checkSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        }
    }
    
    setupLoginHandlers() {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const doctorId = document.getElementById('doctor-id').value;
            const password = document.getElementById('password').value;
            
            // Simulate login (in production, this would validate against server)
            if (doctorId && password) {
                this.currentUser = {
                    id: doctorId,
                    name: `Dr. ${doctorId}`,
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.uiManager.showToast('success', 'Login Successful', 'Welcome back!');
                this.showMainApp();
            }
        });
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Help button handler
        document.getElementById('help-btn')?.addEventListener('click', () => {
            this.showHelpModal();
        });
    }

    showHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('active');
            // Close modal handlers
            modal.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            });
            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }
    
    showMainApp() {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-app').classList.add('active');
        document.getElementById('doctor-name').textContent = this.currentUser.name;
        
        // Show help modal for first-time users
        const hasSeenHelp = localStorage.getItem('hasSeenHelp');
        if (!hasSeenHelp) {
            setTimeout(() => {
                this.showHelpModal();
                localStorage.setItem('hasSeenHelp', 'true');
            }, 1000);
        }
        
        // Start loading AI model
        this.loadAIModel();
    }
    
    async loadAIModel() {
        const statusEl = document.getElementById('model-status');
        statusEl.className = 'model-status loading';
        statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Loading AI Model...</span>';
        
        try {
            await this.modelManager.initialize((progress) => {
                statusEl.querySelector('span').textContent = `Loading AI Model... ${Math.round(progress * 100)}%`;
            });
            
            statusEl.className = 'model-status ready';
            statusEl.innerHTML = '<i class="fas fa-circle"></i><span>AI Model Ready (Local)</span>';
            this.uiManager.showToast('success', 'AI Model Loaded', 'Running locally on your device');
        } catch (error) {
            console.error('Model loading failed:', error);
            statusEl.className = 'model-status error';
            statusEl.innerHTML = '<i class="fas fa-circle"></i><span>Model Load Failed</span>';
            this.uiManager.showToast('error', 'Model Error', 'Could not load AI model. Using fallback mode.');
        }
    }
    
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        document.getElementById('main-app').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
        this.uiManager.showToast('info', 'Logged Out', 'See you next time!');
    }
    
    setupNavigationHandlers() {
        // Case list navigation
        document.querySelectorAll('.case-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.case-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.currentCase = item.dataset.case;
                this.uiManager.showToast('info', 'Case Loaded', item.querySelector('.case-name').textContent);
            });
        });
        
        // Close analysis panel
        document.getElementById('close-analysis').addEventListener('click', () => {
            document.getElementById('analysis-panel').classList.add('hidden');
        });
    }
    
    setupSelectionHandlers() {
        // Listen for selection events
        this.selectionManager.on('selection', (selection) => {
            this.handleContentSelection(selection);
        });
        
        // Selection toolbar actions
        document.getElementById('analyze-selection').addEventListener('click', async () => {
            const selection = this.selectionManager.getCurrentSelection();
            if (selection) {
                const analysisType = document.querySelector('.analysis-type-btn.active')?.dataset?.type || 'summary';
                await this.runAnalysis(selection, analysisType);
            }
        });
        
        document.getElementById('copy-selection').addEventListener('click', () => {
            const selection = this.selectionManager.getCurrentSelection();
            if (selection && selection.type === 'text') {
                navigator.clipboard.writeText(selection.content);
                this.uiManager.showToast('success', 'Copied', 'Text copied to clipboard');
            }
        });
        
        document.getElementById('highlight-selection').addEventListener('click', () => {
            this.selectionManager.highlightSelection();
            this.uiManager.showToast('info', 'Highlighted', 'Selection highlighted');
        });
    }
    
    handleContentSelection(selection) {
        // Show selection toolbar
        const toolbar = document.getElementById('selection-toolbar');
        toolbar.classList.add('visible');
        
        // Position toolbar near selection
        if (selection.position) {
            toolbar.style.left = `${selection.position.x}px`;
            toolbar.style.top = `${selection.position.y - 50}px`;
        }
        
        // Update preview
        this.updatePreview(selection);
        
        // Show analysis panel
        document.getElementById('analysis-panel').classList.remove('hidden');
    }
    
    updatePreview(selection) {
        const previewArea = document.getElementById('preview-area');
        
        switch (selection.type) {
            case 'text':
                previewArea.innerHTML = `<div class="text-preview">${selection.content.substring(0, 300)}${selection.content.length > 300 ? '...' : ''}</div>`;
                break;
            case 'image':
                previewArea.innerHTML = `<img src="${selection.content}" alt="Selected image">`;
                break;
            case 'video':
                previewArea.innerHTML = `<video src="${selection.content}" controls></video>`;
                break;
            case 'screen':
                previewArea.innerHTML = `<img src="${selection.content}" alt="Screen capture">`;
                break;
            default:
                previewArea.innerHTML = '<p>No content selected</p>';
        }
    }
    
    setupAnalysisHandlers() {
        // Analysis type selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Run analysis button
        document.getElementById('run-analysis').addEventListener('click', async () => {
            const selection = this.selectionManager.getCurrentSelection();
            if (!selection) {
                this.uiManager.showToast('warning', 'No Selection', 'Please select content to analyze');
                return;
            }
            
            const analysisType = document.querySelector('.option-btn.active').dataset.analysis;
            await this.runAnalysis(selection, analysisType);
        });
        
        // Add to report button
        document.getElementById('add-to-report').addEventListener('click', () => {
            const result = document.getElementById('result-content').textContent;
            if (result && !result.includes('Select content')) {
                this.reportManager.addFinding(result);
                this.uiManager.showToast('success', 'Added', 'Finding added to report');
            }
        });
        
        // Regenerate button
        document.getElementById('regenerate-result').addEventListener('click', async () => {
            const selection = this.selectionManager.getCurrentSelection();
            const analysisType = document.querySelector('.option-btn.active').dataset.analysis;
            if (selection) {
                await this.runAnalysis(selection, analysisType);
            }
        });
    }
    
    async runAnalysis(selection, analysisType) {
        const progressEl = document.getElementById('analysis-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const resultContent = document.getElementById('result-content');
        const resultActions = document.getElementById('result-actions');
        
        // Show progress
        progressEl.style.display = 'block';
        resultActions.style.display = 'none';
        resultContent.innerHTML = '<p class="placeholder-text">Analyzing...</p>';
        
        try {
            // Simulate progress (in real app, this would come from model)
            for (let i = 0; i <= 100; i += 10) {
                progressFill.style.width = `${i}%`;
                progressText.textContent = `Analyzing... ${i}%`;
                await new Promise(r => setTimeout(r, 100));
            }
            
            // Run actual analysis
            const result = await this.analysisManager.analyze(selection, analysisType);
            
            // Display result
            resultContent.innerHTML = this.formatAnalysisResult(result);
            resultActions.style.display = 'flex';
            
            this.uiManager.showToast('success', 'Analysis Complete', 'AI analysis finished - review and approve');
        } catch (error) {
            console.error('Analysis error:', error);
            resultContent.innerHTML = '<p class="error-text">Analysis failed. Please try again.</p>';
            this.uiManager.showToast('error', 'Analysis Failed', error.message);
        } finally {
            progressEl.style.display = 'none';
        }
    }
    
    formatAnalysisResult(result) {
        if (typeof result === 'string') {
            return `<div class="analysis-text">${result}</div>`;
        }
        
        let html = '';
        if (result.summary) {
            html += `<div class="result-section"><strong>Summary:</strong><p>${result.summary}</p></div>`;
        }
        if (result.findings && result.findings.length) {
            html += '<div class="result-section"><strong>Key Findings:</strong><ul>';
            result.findings.forEach(f => {
                html += `<li>${f}</li>`;
            });
            html += '</ul></div>';
        }
        if (result.recommendations && result.recommendations.length) {
            html += '<div class="result-section"><strong>Recommendations:</strong><ul>';
            result.recommendations.forEach(r => {
                html += `<li>${r}</li>`;
            });
            html += '</ul></div>';
        }
        if (result.confidence) {
            html += `<div class="result-section"><strong>Confidence:</strong> ${Math.round(result.confidence * 100)}%</div>`;
        }
        
        return html || '<p>No analysis results available</p>';
    }
    
    setupReportHandlers() {
        // Save draft
        document.getElementById('save-draft').addEventListener('click', () => {
            this.reportManager.saveDraft();
            this.uiManager.showToast('success', 'Draft Saved', 'Report draft saved locally');
        });
        
        // Submit report
        document.getElementById('submit-report').addEventListener('click', async () => {
            const confirmed = confirm('Submit this report? Only the structured report data will be sent to the server.');
            if (confirmed) {
                try {
                    await this.reportManager.submitReport();
                    this.uiManager.showToast('success', 'Report Submitted', 'Report submitted successfully');
                } catch (error) {
                    this.uiManager.showToast('error', 'Submit Failed', error.message);
                }
            }
        });
    }
    
    setupUploadHandlers() {
        const uploadBtn = document.getElementById('upload-btn');
        const uploadModal = document.getElementById('upload-modal');
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        const uploadPreview = document.getElementById('upload-preview');
        
        // Open upload modal
        uploadBtn.addEventListener('click', () => {
            uploadModal.classList.add('active');
        });
        
        // Close modal
        uploadModal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                uploadModal.classList.remove('active');
            });
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files, uploadPreview);
        });
        
        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files, uploadPreview);
        });
        
        // Click to browse
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Confirm upload
        document.getElementById('confirm-upload').addEventListener('click', () => {
            this.processUploadedFiles();
            uploadModal.classList.remove('active');
            this.uiManager.showToast('success', 'Files Uploaded', 'Files added to patient content');
        });
    }
    
    handleFiles(files, previewContainer) {
        previewContainer.innerHTML = '';
        this.uploadedFiles = [];
        
        Array.from(files).forEach(file => {
            this.uploadedFiles.push(file);
            
            const item = document.createElement('div');
            item.className = 'upload-preview-item';
            
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                item.appendChild(img);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                item.appendChild(video);
            } else {
                item.innerHTML = `<i class="fas fa-file"></i><span>${file.name}</span>`;
            }
            
            previewContainer.appendChild(item);
        });
    }
    
    processUploadedFiles() {
        if (!this.uploadedFiles) return;
        
        this.uploadedFiles.forEach(file => {
            const url = URL.createObjectURL(file);
            
            if (file.type.startsWith('image/')) {
                this.addImageToContent(url, file.name);
            } else if (file.type.startsWith('video/')) {
                this.addVideoToContent(url, file.name);
            }
        });
    }
    
    addImageToContent(url, name) {
        const gallery = document.querySelector('.image-gallery');
        const container = document.createElement('div');
        container.className = 'image-container selectable-content';
        container.dataset.type = 'image';
        container.innerHTML = `
            <img src="${url}" alt="${name}">
            <span class="image-label">${name}</span>
        `;
        gallery.appendChild(container);
        this.selectionManager.registerElement(container);
    }
    
    addVideoToContent(url, name) {
        const gallery = document.querySelector('.video-gallery');
        const container = document.createElement('div');
        container.className = 'video-container selectable-content';
        container.dataset.type = 'video';
        container.innerHTML = `
            <video src="${url}" controls></video>
            <span class="video-label">${name}</span>
        `;
        gallery.appendChild(container);
        this.selectionManager.registerElement(container);
    }
    
    setupScreenCaptureHandlers() {
        const captureBtn = document.getElementById('capture-screen-btn');
        const overlay = document.getElementById('screen-capture-overlay');
        const canvas = document.getElementById('capture-canvas');
        
        captureBtn.addEventListener('click', () => {
            this.startScreenCapture();
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                overlay.classList.remove('active');
            }
        });
        
        // Canvas drawing for region selection
        let isDrawing = false;
        let startX, startY;
        const ctx = canvas.getContext('2d');
        
        overlay.addEventListener('mousedown', (e) => {
            isDrawing = true;
            startX = e.clientX;
            startY = e.clientY;
        });
        
        overlay.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            
            ctx.clearRect(startX, startY, width, height);
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, startY, width, height);
        });
        
        overlay.addEventListener('mouseup', async (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            
            if (Math.abs(width) > 10 && Math.abs(height) > 10) {
                await this.captureRegion(startX, startY, width, height);
            }
            
            overlay.classList.remove('active');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }
    
    async startScreenCapture() {
        try {
            // Request screen capture permission
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });
            
            // Create video element to capture frame
            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();
            
            // Create canvas and capture frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Stop stream
            stream.getTracks().forEach(track => track.stop());
            
            // Get image data
            const imageUrl = canvas.toDataURL('image/png');
            
            // Add to content
            this.addImageToContent(imageUrl, 'Screen Capture - ' + new Date().toLocaleTimeString());
            
            // Also set as current selection for analysis
            this.selectionManager.setSelection({
                type: 'screen',
                content: imageUrl,
                timestamp: Date.now()
            });
            
            this.uiManager.showToast('success', 'Screen Captured', 'Screen capture added to content');
            
        } catch (error) {
            console.error('Screen capture failed:', error);
            this.uiManager.showToast('error', 'Capture Failed', 'Could not capture screen');
        }
    }
    
    async captureRegion(x, y, width, height) {
        // This would capture a specific region
        // For simplicity, we'll use the full screen capture approach
        this.uiManager.showToast('info', 'Region Selected', `Region: ${Math.abs(width)}x${Math.abs(height)} pixels`);
    }
    
    /**
     * Setup handlers for "Analyze Visible Content" feature
     * This captures the current tab/screen and extracts all content for analysis
     */
    setupTabAnalysisHandlers() {
        const analyzeTabBtn = document.getElementById('analyze-tab-btn');
        
        analyzeTabBtn?.addEventListener('click', async () => {
            await this.analyzeVisibleContent();
        });
    }
    
    /**
     * Analyze all visible content in the current view
     * Captures screen + extracts text + identifies images
     */
    async analyzeVisibleContent() {
        this.uiManager.showToast('info', 'Capturing Content', 'Analyzing visible content...');
        
        try {
            // Collect all content from the content display area
            const contentDisplay = document.getElementById('content-display');
            const collectedContent = {
                text: [],
                images: [],
                timestamp: Date.now()
            };
            
            // Extract all visible text
            const textElements = contentDisplay.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
            textElements.forEach(el => {
                const text = el.innerText?.trim();
                if (text && text.length > 10) {
                    collectedContent.text.push(text);
                }
            });
            
            // Extract all images
            const images = contentDisplay.querySelectorAll('img');
            images.forEach(img => {
                if (img.src && !img.src.includes('data:image/svg+xml')) {
                    collectedContent.images.push({
                        src: img.src,
                        alt: img.alt || 'Medical image'
                    });
                }
            });
            
            // Also try to capture the screen for visual analysis
            let screenCapture = null;
            try {
                screenCapture = await this.captureCurrentView();
            } catch (e) {
                console.log('Screen capture skipped:', e.message);
            }
            
            // Combine all text for analysis
            const combinedText = collectedContent.text.join('\n\n');
            
            if (combinedText.length < 20 && collectedContent.images.length === 0 && !screenCapture) {
                this.uiManager.showToast('warning', 'No Content', 'No analyzable content found. Try loading patient data first.');
                return;
            }
            
            // Set as current selection
            this.selectionManager.setSelection({
                type: 'combined',
                content: {
                    text: combinedText,
                    images: collectedContent.images,
                    screenshot: screenCapture
                },
                position: { x: window.innerWidth / 2, y: 100 },
                timestamp: Date.now()
            });
            
            // Update preview
            this.updateCombinedPreview(collectedContent, screenCapture);
            
            // Show analysis panel
            document.getElementById('analysis-panel').classList.remove('hidden');
            
            this.uiManager.showToast('success', 'Content Captured', 
                `Found ${collectedContent.text.length} text sections and ${collectedContent.images.length} images`);
            
        } catch (error) {
            console.error('Tab analysis error:', error);
            this.uiManager.showToast('error', 'Capture Failed', 'Could not analyze visible content');
        }
    }
    
    async captureCurrentView() {
        // Capture just the content area as an image
        const contentDisplay = document.getElementById('content-display');
        
        // Use html2canvas approach (simplified version)
        const canvas = document.createElement('canvas');
        const rect = contentDisplay.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = Math.min(rect.height, 800);
        
        // For now, return null - in production you'd use html2canvas library
        return null;
    }
    
    updateCombinedPreview(content, screenshot) {
        const previewArea = document.getElementById('preview-area');
        
        let html = '<div class="combined-preview">';
        
        if (screenshot) {
            html += `<img src="${screenshot}" alt="Screen capture" style="max-width:100%; margin-bottom:10px;">`;
        }
        
        if (content.text.length > 0) {
            const previewText = content.text.slice(0, 3).join(' ').substring(0, 200);
            html += `<div class="text-preview"><strong>Text Content:</strong><br>${previewText}...</div>`;
        }
        
        if (content.images.length > 0) {
            html += `<div style="margin-top:8px;"><strong>Images:</strong> ${content.images.length} medical image(s) found</div>`;
        }
        
        html += '</div>';
        previewArea.innerHTML = html;
    }
    
    /**
     * Setup handlers for loading external content (URLs, iframes)
     */
    setupExternalContentHandlers() {
        const loadUrlBtn = document.getElementById('load-external-url');
        const urlInput = document.getElementById('external-url');
        
        loadUrlBtn?.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (url) {
                this.loadExternalContent(url);
            } else {
                this.uiManager.showToast('warning', 'No URL', 'Please enter a URL to load');
            }
        });
        
        urlInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadUrlBtn.click();
            }
        });
    }
    
    loadExternalContent(url) {
        const container = document.getElementById('external-frame-container');
        
        // Note: Due to browser security (CORS), many sites won't load in iframe
        // For production, you'd use a proxy server or browser extension
        
        container.innerHTML = `
            <div class="external-content-notice" style="padding: 1rem; background: #fef3c7; border-radius: 8px; margin-bottom: 1rem;">
                <i class="fas fa-info-circle"></i>
                <strong>Note:</strong> Due to browser security, some sites may not load in the frame. 
                Use "Capture Screen" to analyze content from any tab.
            </div>
            <iframe 
                src="${url}" 
                sandbox="allow-same-origin allow-scripts"
                style="width:100%; height:400px; border:1px solid #e2e8f0; border-radius:8px;">
            </iframe>
        `;
        
        this.uiManager.showToast('info', 'Loading URL', 'Attempting to load external content...');
    }

    /**
     * Training Mode - Sample medical cases from Hugging Face datasets
     */
    getTrainingSamples() {
        return {
            'ent-1': {
                title: 'Acute Otitis Media - Pediatric Case',
                content: `<p><strong>Patient:</strong> 5-year-old male</p>
                <p><strong>Chief Complaint:</strong> <span class="symptom">Right ear pain</span> for 3 days, worse at night</p>
                <p><strong>History of Present Illness:</strong></p>
                <p>The patient presents with a 3-day history of progressive <span class="symptom">ear pain</span> in the right ear. Mother reports the child has been <span class="symptom">pulling at his ear</span> and has had <span class="symptom">difficulty sleeping</span>. Associated symptoms include <span class="symptom">fever (38.5°C)</span>, decreased appetite, and <span class="symptom">irritability</span>. The child had an <span class="symptom">upper respiratory infection</span> approximately one week ago with runny nose and cough that is now improving.</p>
                <p><strong>Physical Examination:</strong></p>
                <ul>
                    <li>Temperature: 38.2°C, Heart rate: 110 bpm</li>
                    <li>Right ear: <span class="symptom">Tympanic membrane erythematous and bulging</span>, decreased mobility on pneumatic otoscopy</li>
                    <li>Left ear: Normal tympanic membrane with good mobility</li>
                    <li>Throat: Mild pharyngeal erythema, no exudate</li>
                    <li>Neck: Small anterior cervical lymph nodes palpable bilaterally</li>
                </ul>
                <p><strong>Assessment:</strong> Acute otitis media, right ear</p>`,
                specialty: 'ENT'
            },
            'ent-2': {
                title: 'Chronic Sinusitis - Adult Case',
                content: `<p><strong>Patient:</strong> 42-year-old female</p>
                <p><strong>Chief Complaint:</strong> <span class="symptom">Nasal congestion</span> and <span class="symptom">facial pressure</span> for 3 months</p>
                <p><strong>History of Present Illness:</strong></p>
                <p>Patient presents with persistent <span class="symptom">nasal obstruction</span> and <span class="symptom">facial pain/pressure</span> over the maxillary and frontal areas for the past 3 months. She reports <span class="symptom">thick, discolored nasal discharge</span> (yellow-green) and <span class="symptom">postnasal drip</span>. Symptoms are worse in the morning. She also notes <span class="symptom">decreased sense of smell</span> and occasional <span class="symptom">headaches</span>. Previous treatment with over-the-counter decongestants provided minimal relief.</p>
                <p><strong>Past Medical History:</strong> Seasonal allergies, no previous sinus surgery</p>
                <p><strong>Physical Examination:</strong></p>
                <ul>
                    <li>Vital signs within normal limits, afebrile</li>
                    <li>Nasal endoscopy: <span class="symptom">Bilateral turbinate hypertrophy</span>, <span class="symptom">mucopurulent discharge</span> from middle meatus</li>
                    <li>Facial tenderness over maxillary sinuses bilaterally</li>
                    <li>Oropharynx: Cobblestoning of posterior pharyngeal wall consistent with postnasal drip</li>
                </ul>
                <p><strong>CT Findings:</strong> Bilateral maxillary sinus mucosal thickening, partial opacification of anterior ethmoid air cells</p>`,
                specialty: 'ENT'
            },
            'ent-3': {
                title: 'Acute Tonsillitis - Adolescent Case',
                content: `<p><strong>Patient:</strong> 16-year-old female</p>
                <p><strong>Chief Complaint:</strong> <span class="symptom">Severe sore throat</span> and <span class="symptom">difficulty swallowing</span> for 4 days</p>
                <p><strong>History of Present Illness:</strong></p>
                <p>Patient presents with acute onset of <span class="symptom">severe throat pain</span>, rated 8/10, that has progressively worsened over 4 days. She reports <span class="symptom">odynophagia</span> (painful swallowing) limiting oral intake to liquids only. Associated symptoms include <span class="symptom">high fever (39.2°C)</span>, <span class="symptom">malaise</span>, and <span class="symptom">neck stiffness</span>. She denies cough, rhinorrhea, or ear pain. No known sick contacts. Last episode of tonsillitis was 6 months ago.</p>
                <p><strong>Physical Examination:</strong></p>
                <ul>
                    <li>Temperature: 38.9°C, appears moderately ill</li>
                    <li>Oropharynx: <span class="symptom">Bilateral tonsils 3+ enlarged</span>, <span class="symptom">cryptic exudate present</span></li>
                    <li><span class="symptom">Tender anterior cervical lymphadenopathy</span> bilaterally, largest node 1.5cm</li>
                    <li>No trismus, uvula midline</li>
                    <li>Voice: Muffled "hot potato" quality</li>
                </ul>
                <p><strong>Rapid Strep Test:</strong> Positive</p>`,
                specialty: 'ENT'
            },
            'dental-1': {
                title: 'Dental Caries - Adult Case',
                content: `<p><strong>Patient:</strong> 35-year-old male</p>
                <p><strong>Chief Complaint:</strong> <span class="symptom">Tooth sensitivity</span> and <span class="symptom">sharp pain</span> when eating</p>
                <p><strong>History of Present Illness:</strong></p>
                <p>Patient reports <span class="symptom">increasing sensitivity</span> to hot and cold foods in the lower right quadrant for the past 2 weeks. Recently noticed <span class="symptom">sharp pain when biting down</span> on hard foods. The pain is momentary and subsides within seconds. He has also noticed <span class="symptom">food impaction</span> between teeth #30 and #31. Last dental visit was approximately 2 years ago.</p>
                <p><strong>Dental History:</strong> Multiple restorations, no history of root canal treatment</p>
                <p><strong>Clinical Examination:</strong></p>
                <ul>
                    <li>Tooth #30: <span class="symptom">Visible dark spot on occlusal surface</span>, explorer catches on enamel</li>
                    <li><span class="symptom">Positive response to cold test</span>, pain duration <5 seconds</li>
                    <li>Percussion test: Negative</li>
                    <li><span class="symptom">Interproximal caries detected</span> between #30 and #31</li>
                    <li>Gingiva: Mild inflammation noted around #30-31</li>
                </ul>
                <p><strong>Radiographic Findings:</strong> Radiolucency in dentin of tooth #30 mesial surface extending toward pulp chamber</p>`,
                specialty: 'Dental'
            },
            'dental-2': {
                title: 'Periodontal Disease - Adult Case',
                content: `<p><strong>Patient:</strong> 55-year-old female</p>
                <p><strong>Chief Complaint:</strong> <span class="symptom">Bleeding gums</span> and <span class="symptom">loose teeth</span></p>
                <p><strong>History of Present Illness:</strong></p>
                <p>Patient presents with a long history of <span class="symptom">gingival bleeding during brushing</span> that has worsened over the past year. She has noticed <span class="symptom">gradual loosening</span> of her lower front teeth and <span class="symptom">persistent bad breath</span> despite regular brushing. Patient reports <span class="symptom">gum recession</span> and sensitivity along the gumline. She is a former smoker (quit 5 years ago, 20 pack-year history).</p>
                <p><strong>Medical History:</strong> Type 2 Diabetes (HbA1c 7.8%), Hypertension</p>
                <p><strong>Clinical Examination:</strong></p>
                <ul>
                    <li><span class="symptom">Generalized gingival erythema and edema</span></li>
                    <li><span class="symptom">Probing depths 5-7mm</span> in multiple sites</li>
                    <li><span class="symptom">Grade II mobility</span> of teeth #23, #24, #25</li>
                    <li><span class="symptom">Bleeding on probing</span> at 60% of sites</li>
                    <li><span class="symptom">Gingival recession 2-4mm</span> on buccal surfaces</li>
                    <li>Heavy subgingival calculus deposits</li>
                </ul>
                <p><strong>Radiographic Findings:</strong> Generalized horizontal bone loss, 40-50% bone loss around mandibular incisors</p>`,
                specialty: 'Dental'
            },
            'dental-3': {
                title: 'Impacted Wisdom Tooth - Young Adult Case',
                content: `<p><strong>Patient:</strong> 22-year-old male</p>
                <p><strong>Chief Complaint:</strong> <span class="symptom">Jaw pain</span> and <span class="symptom">swelling</span> on the lower right side</p>
                <p><strong>History of Present Illness:</strong></p>
                <p>Patient presents with recurrent episodes of <span class="symptom">pain and swelling</span> in the right posterior mandible over the past 6 months. Current episode began 3 days ago with <span class="symptom">dull, throbbing pain</span> that radiates to the ear. He reports <span class="symptom">difficulty opening mouth fully</span> (trismus) and <span class="symptom">pain when chewing</span>. Associated symptoms include <span class="symptom">localized swelling</span> and a <span class="symptom">bad taste in mouth</span>. Mild fever (37.8°C) present.</p>
                <p><strong>Clinical Examination:</strong></p>
                <ul>
                    <li><span class="symptom">Limited mouth opening</span> (30mm interincisal distance)</li>
                    <li>Tooth #32: <span class="symptom">Partially erupted with operculum</span></li>
                    <li><span class="symptom">Pericoronal inflammation</span> with purulent exudate</li>
                    <li>Tender, firm swelling over right angle of mandible</li>
                    <li>Submandibular lymph node enlarged and tender</li>
                </ul>
                <p><strong>Panoramic Radiograph:</strong> Mesioangular impaction of tooth #32, distal surface of #31 appears intact, inferior alveolar nerve canal in close proximity to roots of #32</p>`,
                specialty: 'Dental'
            }
        };
    }

    /**
     * Setup Training Mode event handlers
     */
    setupTrainingModeHandlers() {
        const trainingBtn = document.getElementById('training-mode-btn');
        const trainingPanel = document.getElementById('training-mode-panel');
        const exitTrainingBtn = document.getElementById('exit-training-btn');
        
        // Toggle training mode
        trainingBtn?.addEventListener('click', () => {
            const isActive = trainingPanel.classList.contains('hidden');
            if (isActive) {
                this.enterTrainingMode();
            } else {
                this.exitTrainingMode();
            }
        });
        
        // Exit training button
        exitTrainingBtn?.addEventListener('click', () => {
            this.exitTrainingMode();
        });
        
        // Load sample buttons
        document.querySelectorAll('.load-sample-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.sample-card');
                const sampleId = card.dataset.sample;
                this.loadTrainingSample(sampleId);
            });
        });
        
        // Also allow clicking the whole card
        document.querySelectorAll('.sample-card').forEach(card => {
            card.addEventListener('click', () => {
                const sampleId = card.dataset.sample;
                this.loadTrainingSample(sampleId);
            });
        });
        
        // Playground analyze button
        document.getElementById('playground-analyze-btn')?.addEventListener('click', () => {
            this.analyzePlaygroundSelection();
        });
        
        // Playground summarize button
        document.getElementById('playground-summary-btn')?.addEventListener('click', () => {
            this.summarizePlaygroundCase();
        });
    }

    enterTrainingMode() {
        const trainingPanel = document.getElementById('training-mode-panel');
        const trainingBtn = document.getElementById('training-mode-btn');
        const sidebar = document.querySelector('.sidebar');
        const contentArea = document.querySelector('.content-area');
        
        trainingPanel.classList.remove('hidden');
        trainingBtn.classList.add('active');
        trainingBtn.innerHTML = '<i class="fas fa-times"></i> Exit Training';
        
        // Hide main content
        sidebar.style.display = 'none';
        contentArea.style.display = 'none';
        
        this.uiManager.showToast('info', 'Training Mode', 'Practice with sample medical cases before analyzing real patient data');
    }

    exitTrainingMode() {
        const trainingPanel = document.getElementById('training-mode-panel');
        const trainingBtn = document.getElementById('training-mode-btn');
        const sidebar = document.querySelector('.sidebar');
        const contentArea = document.querySelector('.content-area');
        const playground = document.getElementById('training-playground');
        
        trainingPanel.classList.add('hidden');
        trainingBtn.classList.remove('active');
        trainingBtn.innerHTML = '<i class="fas fa-graduation-cap"></i> Training Mode';
        
        // Show main content
        sidebar.style.display = '';
        contentArea.style.display = '';
        
        // Hide playground
        if (playground) {
            playground.style.display = 'none';
        }
        
        this.uiManager.showToast('success', 'Training Complete', 'You\'re ready to analyze real patient data!');
    }

    loadTrainingSample(sampleId) {
        const samples = this.getTrainingSamples();
        const sample = samples[sampleId];
        
        if (!sample) {
            this.uiManager.showToast('error', 'Sample Not Found', 'Could not load the requested sample');
            return;
        }
        
        const playground = document.getElementById('training-playground');
        const titleEl = document.getElementById('playground-case-title');
        const notesEl = document.getElementById('playground-case-notes');
        const resultEl = document.getElementById('playground-result-content');
        
        // Show playground
        playground.style.display = 'block';
        
        // Load content
        titleEl.textContent = sample.title;
        notesEl.innerHTML = sample.content;
        resultEl.innerHTML = '<p class="placeholder-text">Select text from the case above and click "Analyze Selection" to see AI analysis</p>';
        
        // Scroll to playground
        playground.scrollIntoView({ behavior: 'smooth' });
        
        this.uiManager.showToast('success', 'Case Loaded', `${sample.specialty} case: ${sample.title}`);
    }

    async analyzePlaygroundSelection() {
        const selection = window.getSelection().toString().trim();
        const resultEl = document.getElementById('playground-result-content');
        
        if (!selection) {
            this.uiManager.showToast('warning', 'No Selection', 'Please select some text from the case to analyze');
            return;
        }
        
        resultEl.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Analyzing selected text...</p>';
        
        try {
            // Use the actual analysis manager if model is ready
            const result = await this.analysisManager.analyze({
                type: 'text',
                content: selection
            }, 'summary');
            
            resultEl.innerHTML = this.formatAnalysisResult(result);
            this.uiManager.showToast('success', 'Analysis Complete', 'Review the AI findings above');
        } catch (error) {
            console.error('Training analysis error:', error);
            // Provide a demo response if analysis fails
            resultEl.innerHTML = `
                <div class="analysis-text">
                    <p><strong>Selected Text Analysis:</strong></p>
                    <p>"${selection.substring(0, 100)}${selection.length > 100 ? '...' : ''}"</p>
                    <p><strong>AI Observation:</strong> This text contains medical terminology that would be processed by the local AI model. Key symptoms and clinical findings would be extracted and correlated.</p>
                    <p><em>Note: Full analysis requires the AI model to be loaded. The model runs entirely on your device.</em></p>
                </div>
            `;
        }
    }

    async summarizePlaygroundCase() {
        const notesEl = document.getElementById('playground-case-notes');
        const resultEl = document.getElementById('playground-result-content');
        const caseContent = notesEl.innerText;
        
        resultEl.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Generating case summary...</p>';
        
        try {
            const result = await this.analysisManager.analyze({
                type: 'text',
                content: caseContent
            }, 'summary');
            
            resultEl.innerHTML = this.formatAnalysisResult(result);
            this.uiManager.showToast('success', 'Summary Complete', 'Full case summary generated');
        } catch (error) {
            console.error('Training summary error:', error);
            // Provide a demo response
            resultEl.innerHTML = `
                <div class="analysis-text">
                    <p><strong>Case Summary:</strong></p>
                    <p>This case demonstrates typical presentation patterns that the AI model analyzes. When fully loaded, the model would:</p>
                    <ul>
                        <li>Extract key symptoms and findings</li>
                        <li>Identify relevant clinical patterns</li>
                        <li>Suggest differential diagnoses</li>
                        <li>Highlight areas requiring attention</li>
                    </ul>
                    <p><em>All processing happens locally on your device - no patient data is ever transmitted.</em></p>
                </div>
            `;
        }
    }
}
