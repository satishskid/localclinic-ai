/**
 * Clinical Context Filter Manager
 * Provides UI and logic for clinical context selection
 * Helps AI provide more accurate, focused analysis
 */
import { SPECIALTIES, AGE_GROUPS, REPORT_TYPES, GENDER_OPTIONS, buildAnalysisContext } from '../core/ConfigManager.js';

export class ClinicalContextManager {
    constructor() {
        this.currentContext = {
            specialty: null,
            ageGroup: null,
            reportType: null,
            gender: null
        };
        this.listeners = [];
        this.container = null;
    }

    /**
     * Initialize the context filter UI
     */
    initialize(containerId = 'clinical-context-filters') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            this.container = this.createContainer();
        }
        this.render();
        this.loadSavedContext();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'clinical-context-filters';
        container.className = 'clinical-context-panel';
        return container;
    }

    /**
     * Render the filter UI
     */
    render() {
        this.container.innerHTML = `
            <div class="context-header">
                <h3>📋 Clinical Context</h3>
                <p class="context-hint">Set context for more accurate AI analysis</p>
            </div>
            
            <div class="context-filters">
                <!-- Specialty Filter -->
                <div class="filter-group">
                    <label for="specialty-select">
                        <span class="filter-icon">🏥</span> Specialty
                    </label>
                    <select id="specialty-select" class="context-select">
                        <option value="">-- Select Specialty --</option>
                        ${Object.entries(SPECIALTIES).map(([key, spec]) => `
                            <option value="${key}">${spec.icon} ${spec.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Report Type Filter -->
                <div class="filter-group">
                    <label for="report-type-select">
                        <span class="filter-icon">📄</span> Report Type
                    </label>
                    <select id="report-type-select" class="context-select">
                        <option value="">-- Select Report Type --</option>
                    </select>
                </div>
                
                <!-- Age Group Filter -->
                <div class="filter-group">
                    <label for="age-group-select">
                        <span class="filter-icon">👤</span> Age Group
                    </label>
                    <select id="age-group-select" class="context-select">
                        <option value="">-- Select Age Group --</option>
                        ${Object.entries(AGE_GROUPS).map(([key, age]) => `
                            <option value="${key}">${age.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Gender Filter -->
                <div class="filter-group">
                    <label for="gender-select">
                        <span class="filter-icon">⚧️</span> Gender
                    </label>
                    <select id="gender-select" class="context-select">
                        <option value="">-- Select Gender --</option>
                        ${Object.entries(GENDER_OPTIONS).map(([key, gender]) => `
                            <option value="${key}">${gender.icon} ${gender.name}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <!-- Context Summary -->
            <div class="context-summary" id="context-summary">
                <span class="summary-label">Current Context:</span>
                <span class="summary-value" id="context-summary-text">General Analysis</span>
            </div>
            
            <!-- Quick Presets -->
            <div class="context-presets">
                <span class="presets-label">Quick Presets:</span>
                <div class="preset-buttons">
                    <button class="preset-btn" data-preset="ent-adult">👂 ENT Adult</button>
                    <button class="preset-btn" data-preset="dental-child">🦷 Dental Child</button>
                    <button class="preset-btn" data-preset="skin-adult">🔬 Derm Adult</button>
                    <button class="preset-btn" data-preset="vitals-elderly">💓 Vitals Elder</button>
                    <button class="preset-btn" data-preset="clear">🔄 Clear All</button>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Attach event listeners to filter controls
     */
    attachEventListeners() {
        // Specialty change
        const specialtySelect = this.container.querySelector('#specialty-select');
        specialtySelect?.addEventListener('change', (e) => {
            this.updateContext('specialty', e.target.value || null);
            this.updateReportTypeOptions(e.target.value);
        });

        // Report type change
        const reportSelect = this.container.querySelector('#report-type-select');
        reportSelect?.addEventListener('change', (e) => {
            this.updateContext('reportType', e.target.value || null);
        });

        // Age group change
        const ageSelect = this.container.querySelector('#age-group-select');
        ageSelect?.addEventListener('change', (e) => {
            this.updateContext('ageGroup', e.target.value || null);
        });

        // Gender change
        const genderSelect = this.container.querySelector('#gender-select');
        genderSelect?.addEventListener('change', (e) => {
            this.updateContext('gender', e.target.value || null);
        });

        // Preset buttons
        const presetBtns = this.container.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyPreset(btn.dataset.preset);
            });
        });
    }

    /**
     * Update report type options based on selected specialty
     */
    updateReportTypeOptions(specialtyId) {
        const reportSelect = this.container.querySelector('#report-type-select');
        if (!reportSelect) return;

        let options = '<option value="">-- Select Report Type --</option>';
        
        if (specialtyId && SPECIALTIES[specialtyId]) {
            // Show report types for this specialty
            const relevantTypes = Object.entries(REPORT_TYPES)
                .filter(([_, type]) => type.specialty === specialtyId || type.specialty === 'general');
            
            relevantTypes.forEach(([key, type]) => {
                options += `<option value="${key}">${type.icon} ${type.name}</option>`;
            });
        } else {
            // Show all report types
            Object.entries(REPORT_TYPES).forEach(([key, type]) => {
                options += `<option value="${key}">${type.icon} ${type.name}</option>`;
            });
        }
        
        reportSelect.innerHTML = options;
    }

    /**
     * Update context and notify listeners
     */
    updateContext(key, value) {
        this.currentContext[key] = value;
        this.saveContext();
        this.updateSummary();
        this.notifyListeners();
    }

    /**
     * Apply a preset configuration
     */
    applyPreset(presetId) {
        const presets = {
            'ent-adult': { specialty: 'ent', ageGroup: 'adult', reportType: null, gender: null },
            'dental-child': { specialty: 'dental', ageGroup: 'child', reportType: null, gender: null },
            'skin-adult': { specialty: 'dermatology', ageGroup: 'adult', reportType: null, gender: null },
            'vitals-elderly': { specialty: 'vitals', ageGroup: 'elderly', reportType: null, gender: null },
            'clear': { specialty: null, ageGroup: null, reportType: null, gender: null }
        };

        const preset = presets[presetId];
        if (preset) {
            this.currentContext = { ...preset };
            this.updateUIFromContext();
            this.saveContext();
            this.updateSummary();
            this.notifyListeners();
        }
    }

    /**
     * Update UI controls from current context
     */
    updateUIFromContext() {
        const specialtySelect = this.container.querySelector('#specialty-select');
        const reportSelect = this.container.querySelector('#report-type-select');
        const ageSelect = this.container.querySelector('#age-group-select');
        const genderSelect = this.container.querySelector('#gender-select');

        if (specialtySelect) specialtySelect.value = this.currentContext.specialty || '';
        if (ageSelect) ageSelect.value = this.currentContext.ageGroup || '';
        if (genderSelect) genderSelect.value = this.currentContext.gender || '';
        
        // Update report type options then set value
        this.updateReportTypeOptions(this.currentContext.specialty);
        if (reportSelect) reportSelect.value = this.currentContext.reportType || '';
    }

    /**
     * Update the context summary display
     */
    updateSummary() {
        const summaryEl = this.container.querySelector('#context-summary-text');
        if (!summaryEl) return;

        const parts = [];
        
        if (this.currentContext.specialty) {
            const spec = SPECIALTIES[this.currentContext.specialty];
            parts.push(`${spec.icon} ${spec.name}`);
        }
        
        if (this.currentContext.ageGroup) {
            const age = AGE_GROUPS[this.currentContext.ageGroup];
            parts.push(age.name);
        }
        
        if (this.currentContext.reportType) {
            const report = REPORT_TYPES[this.currentContext.reportType];
            parts.push(report.name);
        }
        
        if (this.currentContext.gender && this.currentContext.gender !== 'not_specified') {
            const gender = GENDER_OPTIONS[this.currentContext.gender];
            parts.push(gender.name);
        }

        summaryEl.textContent = parts.length > 0 ? parts.join(' • ') : 'General Analysis';
    }

    /**
     * Save context to localStorage
     */
    saveContext() {
        try {
            localStorage.setItem('medai_clinical_context', JSON.stringify(this.currentContext));
        } catch (e) {
            console.warn('Could not save clinical context:', e);
        }
    }

    /**
     * Load saved context from localStorage
     */
    loadSavedContext() {
        try {
            const saved = localStorage.getItem('medai_clinical_context');
            if (saved) {
                this.currentContext = JSON.parse(saved);
                this.updateUIFromContext();
                this.updateSummary();
            }
        } catch (e) {
            console.warn('Could not load clinical context:', e);
        }
    }

    /**
     * Get the built analysis context
     */
    getAnalysisContext() {
        return buildAnalysisContext(this.currentContext);
    }

    /**
     * Get current raw context
     */
    getCurrentContext() {
        return { ...this.currentContext };
    }

    /**
     * Add context change listener
     */
    onContextChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove context change listener
     */
    offContextChange(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    /**
     * Notify all listeners of context change
     */
    notifyListeners() {
        const context = this.getAnalysisContext();
        this.listeners.forEach(callback => callback(context, this.currentContext));
    }

    /**
     * Get HTML for inline/compact filter (for extension popup)
     */
    getCompactHTML() {
        return `
            <div class="compact-context">
                <select id="compact-specialty" class="compact-select" title="Specialty">
                    <option value="">🏥 Specialty</option>
                    ${Object.entries(SPECIALTIES).map(([key, spec]) => `
                        <option value="${key}">${spec.icon} ${spec.name}</option>
                    `).join('')}
                </select>
                <select id="compact-age" class="compact-select" title="Age Group">
                    <option value="">👤 Age</option>
                    ${Object.entries(AGE_GROUPS).map(([key, age]) => `
                        <option value="${key}">${age.name.split(' ')[0]}</option>
                    `).join('')}
                </select>
            </div>
        `;
    }
}

// Export singleton
export const clinicalContext = new ClinicalContextManager();
