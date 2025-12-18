/**
 * Popup Script - AI Medical Assistant Browser Extension
 * Handles user interactions in the extension popup
 */

// State
let currentAnalysisType = 'diagnosis';
let lastResults = null;
let clinicalContext = {
    specialty: null,
    ageGroup: null,
    reportType: null
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    initializeContextFilters();
    initializeTypeButtons();
    initializeActionButtons();
    initializeResultButtons();
    checkInstructions();
    await checkModelStatus();
    loadSavedContext();
});

// Initialize clinical context filters
function initializeContextFilters() {
    const specialtySelect = document.getElementById('specialty-filter');
    const ageSelect = document.getElementById('age-filter');
    const reportSelect = document.getElementById('report-filter');
    
    specialtySelect?.addEventListener('change', (e) => {
        clinicalContext.specialty = e.target.value || null;
        updateReportOptions(e.target.value);
        updateContextSummary();
        saveContext();
    });
    
    ageSelect?.addEventListener('change', (e) => {
        clinicalContext.ageGroup = e.target.value || null;
        updateContextSummary();
        saveContext();
    });
    
    reportSelect?.addEventListener('change', (e) => {
        clinicalContext.reportType = e.target.value || null;
        updateContextSummary();
        saveContext();
    });
}

// Update report type options based on specialty
function updateReportOptions(specialty) {
    const reportSelect = document.getElementById('report-filter');
    if (!reportSelect) return;
    
    // Show all options but highlight relevant ones
    const optgroups = reportSelect.querySelectorAll('optgroup');
    optgroups.forEach(group => {
        const label = group.label.toLowerCase();
        if (!specialty || label === specialty || label === 'general') {
            group.style.display = '';
        } else {
            group.style.display = 'none';
        }
    });
}

// Update context summary badge
function updateContextSummary() {
    const summaryEl = document.getElementById('context-summary');
    if (!summaryEl) return;
    
    const parts = [];
    
    const specialtyLabels = {
        ent: '👂 ENT',
        dental: '🦷 Dental',
        dermatology: '🔬 Derm',
        vitals: '💓 Vitals',
        cardiology: '❤️ Cardio',
        radiology: '📷 Radiology',
        gastro: '🔍 Gastro'
    };
    
    const ageLabels = {
        neonate: 'Neonate',
        infant: 'Infant',
        toddler: 'Toddler',
        child: 'Child',
        adolescent: 'Adolescent',
        adult: 'Adult',
        elderly: 'Elderly'
    };
    
    if (clinicalContext.specialty) {
        parts.push(specialtyLabels[clinicalContext.specialty] || clinicalContext.specialty);
    }
    
    if (clinicalContext.ageGroup) {
        parts.push(ageLabels[clinicalContext.ageGroup] || clinicalContext.ageGroup);
    }
    
    const badgeClass = clinicalContext.specialty || '';
    const text = parts.length > 0 ? parts.join(' • ') : 'General Analysis';
    
    summaryEl.innerHTML = `<span class="context-badge ${badgeClass}">${text}</span>`;
}

// Save context to storage
function saveContext() {
    chrome.storage.local.set({ clinicalContext });
}

// Load saved context
function loadSavedContext() {
    chrome.storage.local.get(['clinicalContext'], (result) => {
        if (result.clinicalContext) {
            clinicalContext = result.clinicalContext;
            
            // Update UI
            const specialtySelect = document.getElementById('specialty-filter');
            const ageSelect = document.getElementById('age-filter');
            const reportSelect = document.getElementById('report-filter');
            
            if (specialtySelect && clinicalContext.specialty) {
                specialtySelect.value = clinicalContext.specialty;
                updateReportOptions(clinicalContext.specialty);
            }
            if (ageSelect && clinicalContext.ageGroup) {
                ageSelect.value = clinicalContext.ageGroup;
            }
            if (reportSelect && clinicalContext.reportType) {
                reportSelect.value = clinicalContext.reportType;
            }
            
            updateContextSummary();
        }
    });
}

// Check if we should show instructions
function checkInstructions() {
    chrome.storage.local.get(['hideInstructions'], (result) => {
        if (result.hideInstructions) {
            document.getElementById('instructions').style.display = 'none';
        }
    });

    document.getElementById('hide-instructions')?.addEventListener('click', () => {
        chrome.storage.local.set({ hideInstructions: true });
        document.getElementById('instructions').style.display = 'none';
    });
}

// Check AI model status
async function checkModelStatus() {
    const statusEl = document.getElementById('status');
    
    // Check if model is loaded
    chrome.storage.local.get(['modelLoaded'], (result) => {
        if (result.modelLoaded) {
            statusEl.innerHTML = '<span class="status-dot ready"></span><span>Ready</span>';
        } else {
            statusEl.innerHTML = '<span class="status-dot loading"></span><span>Loading AI...</span>';
            // Trigger model loading in background
            chrome.runtime.sendMessage({ action: 'loadModel' });
        }
    });
}

// Initialize analysis type buttons
function initializeTypeButtons() {
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAnalysisType = btn.dataset.type;
        });
    });
}

// Initialize action buttons
function initializeActionButtons() {
    // Analyze Selection
    document.getElementById('analyze-selection')?.addEventListener('click', async () => {
        showLoading('Getting selected text...');
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.tabs.sendMessage(tab.id, { action: 'getSelection' }, async (response) => {
                if (response && response.text) {
                    await analyzeContent(response.text, 'text');
                } else {
                    hideLoading();
                    showNotification('No text selected. Please highlight some text on the page first.');
                }
            });
        } catch (error) {
            hideLoading();
            showNotification('Error: ' + error.message);
        }
    });

    // Analyze Entire Page
    document.getElementById('analyze-page')?.addEventListener('click', async () => {
        showLoading('Scanning page content...');
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' }, async (response) => {
                if (response && response.content) {
                    await analyzeContent(response.content, 'page');
                } else {
                    hideLoading();
                    showNotification('Could not extract page content.');
                }
            });
        } catch (error) {
            hideLoading();
            showNotification('Error: ' + error.message);
        }
    });

    // Capture Region
    document.getElementById('capture-region')?.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Close popup and activate capture mode
        chrome.tabs.sendMessage(tab.id, { action: 'startCapture' });
        window.close();
    });

    // Analyze Image (info button)
    document.getElementById('analyze-image')?.addEventListener('click', () => {
        showNotification('Right-click on any image on the page and select "Analyze with AI Medical Assistant"');
    });
}

// Initialize result action buttons
function initializeResultButtons() {
    document.getElementById('copy-results')?.addEventListener('click', () => {
        if (lastResults) {
            const textToCopy = formatResultsAsText(lastResults);
            navigator.clipboard.writeText(textToCopy);
            showNotification('Results copied to clipboard!');
        }
    });

    document.getElementById('add-to-report')?.addEventListener('click', () => {
        if (lastResults) {
            chrome.storage.local.get(['reportFindings'], (result) => {
                const findings = result.reportFindings || [];
                findings.push({
                    ...lastResults,
                    addedAt: new Date().toISOString()
                });
                chrome.storage.local.set({ reportFindings: findings });
                showNotification('Added to report! (' + findings.length + ' findings total)');
            });
        }
    });
}

// Analyze content
async function analyzeContent(content, contentType) {
    showLoading('AI analyzing...');
    
    try {
        // Get current clinical context
        const context = getClinicalContext();
        
        // Send to background script for analysis
        chrome.runtime.sendMessage({
            action: 'analyze',
            content: content,
            contentType: contentType,
            analysisType: currentAnalysisType,
            clinicalContext: context
        }, (response) => {
            hideLoading();
            
            if (response && response.success) {
                lastResults = {
                    ...response.results,
                    clinicalContext: context
                };
                displayResults(response.results);
            } else {
                showNotification('Analysis failed. Please try again.');
            }
        });
    } catch (error) {
        hideLoading();
        showNotification('Error: ' + error.message);
    }
}

// Display results
function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');
    
    let html = '';
    
    // Show clinical context if available
    if (results.specialty || results.ageGroup || results.reportType) {
        const contextParts = [];
        if (results.specialty && results.specialty !== 'general') {
            contextParts.push(formatContextLabel(results.specialty));
        }
        if (results.ageGroup && results.ageGroup !== 'adult') {
            contextParts.push(formatContextLabel(results.ageGroup));
        }
        if (results.reportType && results.reportType !== 'examination') {
            contextParts.push(formatContextLabel(results.reportType));
        }
        if (contextParts.length > 0) {
            html += `<div class="context-badge" style="font-size: 10px; color: #0ea5e9; margin-bottom: 8px; padding: 4px 8px; background: #e0f2fe; border-radius: 4px; display: inline-block;">📋 ${contextParts.join(' • ')}</div>`;
        }
    }
    
    if (results.summary) {
        html += `<div class="summary"><strong>Summary:</strong> ${results.summary}</div>`;
    }
    
    if (results.findings && results.findings.length > 0) {
        html += '<div class="findings-list" style="margin-top: 10px;"><strong>Findings:</strong><ul style="margin: 5px 0 0 15px;">';
        results.findings.forEach(finding => {
            html += `<li class="finding">${finding}</li>`;
        });
        html += '</ul></div>';
    }
    
    if (results.recommendations && results.recommendations.length > 0) {
        html += '<div class="recommendations-list" style="margin-top: 10px;"><strong>Recommendations:</strong><ul style="margin: 5px 0 0 15px;">';
        results.recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
        });
        html += '</ul></div>';
    }
    
    if (results.confidence) {
        const confidencePercent = Math.round(results.confidence * 100);
        html += `<div class="confidence" style="margin-top: 10px; font-size: 11px; color: #64748b;">Confidence: ${confidencePercent}%</div>`;
    }
    
    resultsContent.innerHTML = html;
    resultsSection.style.display = 'block';
}

// Format context label for display
function formatContextLabel(value) {
    const labels = {
        // Specialties
        'ent': 'ENT',
        'dental': 'Dental',
        'dermatology': 'Dermatology',
        'pediatrics': 'Pediatrics',
        'womens_health': "Women's Health",
        'vitals': 'Vitals',
        'cardiology': 'Cardiology',
        'radiology': 'Radiology',
        'gastro': 'Gastro',
        'general': 'General',
        
        // Age groups
        'neonate': 'Neonate',
        'infant': 'Infant',
        'toddler': 'Toddler',
        'child': 'Child',
        'adolescent': 'Adolescent',
        'adult': 'Adult',
        'elderly': 'Elderly',
        
        // Report types - ENT
        'audiometry': 'Audiometry',
        'laryngoscopy': 'Laryngoscopy',
        'ct_sinus': 'CT Sinus',
        
        // Report types - Dental
        'panoramic_xray': 'Panoramic X-Ray',
        'periapical_xray': 'Periapical X-Ray',
        'cbct': 'CBCT 3D',
        'intraoral_photo': 'Intraoral Photo',
        
        // Report types - Dermatology
        'dermoscopy': 'Dermoscopy',
        'skin_photo': 'Skin Photo',
        'wound_assessment': 'Wound Assessment',
        
        // Report types - Pediatrics
        'well_child_exam': 'Well Child Exam',
        'newborn_exam': 'Newborn Exam',
        'growth_chart': 'Growth Chart',
        'developmental_screen': 'Developmental Screen',
        'immunization_record': 'Immunization Record',
        'school_physical': 'School Physical',
        
        // Report types - Women's Health
        'pelvic_exam': 'Pelvic Exam',
        'pap_smear': 'Pap Smear',
        'mammogram': 'Mammogram',
        'pelvic_ultrasound': 'Pelvic Ultrasound',
        'transvaginal_ultrasound': 'Transvaginal US',
        'fertility_labs': 'Fertility Labs',
        'prenatal_visit': 'Prenatal Visit',
        'fetal_ultrasound': 'Fetal Ultrasound',
        
        // Report types - Cardiology
        'ecg_12lead': '12-Lead ECG',
        'echocardiogram': 'Echocardiogram',
        
        // Report types - Radiology
        'xray': 'X-Ray',
        'ct_scan': 'CT Scan',
        'mri': 'MRI',
        'ultrasound': 'Ultrasound',
        
        // Report types - General
        'clinical_notes': 'Clinical Notes',
        'lab_results': 'Lab Results',
        'prescription': 'Prescription'
    };
    return labels[value] || value;
}

// Format results as plain text for copying
function formatResultsAsText(results) {
    let text = '=== AI Medical Assistant Analysis ===\n\n';
    
    // Include clinical context if available
    if (results.clinicalContext) {
        const ctx = results.clinicalContext;
        text += 'Clinical Context:\n';
        if (ctx.specialty && ctx.specialty !== 'general') {
            text += `  Specialty: ${formatContextLabel(ctx.specialty)}\n`;
        }
        if (ctx.ageGroup && ctx.ageGroup !== 'adult') {
            text += `  Age Group: ${formatContextLabel(ctx.ageGroup)}\n`;
        }
        if (ctx.reportType && ctx.reportType !== 'examination') {
            text += `  Report Type: ${formatContextLabel(ctx.reportType)}\n`;
        }
        text += '\n';
    }
    
    if (results.summary) {
        text += `Summary: ${results.summary}\n\n`;
    }
    
    if (results.findings && results.findings.length > 0) {
        text += 'Findings:\n';
        results.findings.forEach((finding, i) => {
            text += `  ${i + 1}. ${finding}\n`;
        });
        text += '\n';
    }
    
    if (results.recommendations && results.recommendations.length > 0) {
        text += 'Recommendations:\n';
        results.recommendations.forEach((rec, i) => {
            text += `  ${i + 1}. ${rec}\n`;
        });
        text += '\n';
    }
    
    text += `\nGenerated: ${new Date().toLocaleString()}\n`;
    text += 'Note: AI analysis performed locally - no data sent to external servers.';
    
    return text;
}

// Show loading overlay
function showLoading(message) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loading-overlay';
    overlay.innerHTML = `
        <div class="spinner"></div>
        <span style="font-size: 13px; color: #64748b;">${message}</span>
    `;
    document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loading-overlay')?.remove();
}

// Show notification
function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        right: 10px;
        padding: 10px 15px;
        background: #1e293b;
        color: white;
        border-radius: 8px;
        font-size: 12px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}
