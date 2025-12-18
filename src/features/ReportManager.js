/**
 * Report Manager
 * Handles report creation, editing, and submission
 * Manages the workflow from AI findings to final report
 */
export class ReportManager {
    constructor() {
        this.currentReport = this.createNewReport();
        this.drafts = [];
        this.loadDrafts();
    }
    
    createNewReport() {
        return {
            id: this.generateId(),
            patientInfo: {
                name: '',
                id: '',
                dateOfBirth: ''
            },
            examinationDate: new Date().toISOString().split('T')[0],
            findings: [],
            doctorNotes: '',
            diagnosis: '',
            recommendations: [],
            aiAssisted: true,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    
    generateId() {
        return 'RPT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    
    addFinding(finding) {
        if (!finding || finding.trim().length === 0) return;
        
        const findingObj = {
            id: Date.now(),
            content: finding,
            source: 'ai-analysis',
            addedAt: new Date().toISOString(),
            verified: false
        };
        
        this.currentReport.findings.push(findingObj);
        this.updateUI();
        this.autoSave();
        
        return findingObj;
    }
    
    removeFinding(findingId) {
        this.currentReport.findings = this.currentReport.findings.filter(f => f.id !== findingId);
        this.updateUI();
        this.autoSave();
    }
    
    verifyFinding(findingId) {
        const finding = this.currentReport.findings.find(f => f.id === findingId);
        if (finding) {
            finding.verified = true;
            finding.verifiedAt = new Date().toISOString();
        }
        this.autoSave();
    }
    
    updatePatientInfo() {
        this.currentReport.patientInfo = {
            name: document.getElementById('patient-name')?.value || '',
            id: document.getElementById('patient-id')?.value || ''
        };
        this.currentReport.examinationDate = document.getElementById('exam-date')?.value || '';
    }
    
    updateNotes() {
        this.currentReport.doctorNotes = document.getElementById('doctor-notes')?.value || '';
        this.currentReport.diagnosis = document.getElementById('final-diagnosis')?.value || '';
    }
    
    updateUI() {
        const findingsList = document.getElementById('findings-list');
        if (!findingsList) return;
        
        if (this.currentReport.findings.length === 0) {
            findingsList.innerHTML = '<p class="placeholder-text">No findings added yet. Run AI analysis and add results.</p>';
            return;
        }
        
        findingsList.innerHTML = this.currentReport.findings.map(finding => `
            <div class="finding-item" data-id="${finding.id}">
                <i class="fas ${finding.verified ? 'fa-check-circle' : 'fa-circle'}"></i>
                <span class="finding-content">${this.truncate(finding.content, 100)}</span>
                <i class="fas fa-times remove-finding" onclick="window.medicalAssistantApp.reportManager.removeFinding(${finding.id})"></i>
            </div>
        `).join('');
    }
    
    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    saveDraft() {
        this.updatePatientInfo();
        this.updateNotes();
        this.currentReport.updatedAt = new Date().toISOString();
        this.currentReport.status = 'draft';
        
        // Save to local storage
        const draftIndex = this.drafts.findIndex(d => d.id === this.currentReport.id);
        if (draftIndex >= 0) {
            this.drafts[draftIndex] = { ...this.currentReport };
        } else {
            this.drafts.push({ ...this.currentReport });
        }
        
        this.saveDraftsToStorage();
        return this.currentReport;
    }
    
    autoSave() {
        // Debounced auto-save
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveDraft();
        }, 2000);
    }
    
    loadDrafts() {
        try {
            const saved = localStorage.getItem('reportDrafts');
            if (saved) {
                this.drafts = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load drafts:', error);
            this.drafts = [];
        }
    }
    
    saveDraftsToStorage() {
        try {
            localStorage.setItem('reportDrafts', JSON.stringify(this.drafts));
        } catch (error) {
            console.warn('Could not save drafts:', error);
        }
    }
    
    loadDraft(draftId) {
        const draft = this.drafts.find(d => d.id === draftId);
        if (draft) {
            this.currentReport = { ...draft };
            this.populateForm();
            this.updateUI();
        }
    }
    
    populateForm() {
        const { patientInfo, examinationDate, doctorNotes, diagnosis } = this.currentReport;
        
        if (document.getElementById('patient-name')) {
            document.getElementById('patient-name').value = patientInfo.name || '';
        }
        if (document.getElementById('patient-id')) {
            document.getElementById('patient-id').value = patientInfo.id || '';
        }
        if (document.getElementById('exam-date')) {
            document.getElementById('exam-date').value = examinationDate || '';
        }
        if (document.getElementById('doctor-notes')) {
            document.getElementById('doctor-notes').value = doctorNotes || '';
        }
        if (document.getElementById('final-diagnosis')) {
            document.getElementById('final-diagnosis').value = diagnosis || '';
        }
    }
    
    deleteDraft(draftId) {
        this.drafts = this.drafts.filter(d => d.id !== draftId);
        this.saveDraftsToStorage();
    }
    
    async submitReport() {
        this.updatePatientInfo();
        this.updateNotes();
        
        // Validate required fields
        const errors = this.validateReport();
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }
        
        this.currentReport.status = 'submitted';
        this.currentReport.submittedAt = new Date().toISOString();
        
        // Prepare report for submission (only structured data, no raw media)
        const reportData = this.prepareForSubmission();
        
        // In production, this would send to your backend server
        // For now, we simulate the submission
        console.log('📤 Submitting report:', reportData);
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear draft after successful submission
        this.deleteDraft(this.currentReport.id);
        
        // Reset to new report
        const submittedReport = { ...this.currentReport };
        this.currentReport = this.createNewReport();
        this.populateForm();
        this.updateUI();
        
        return submittedReport;
    }
    
    validateReport() {
        const errors = [];
        
        if (!this.currentReport.patientInfo.name) {
            errors.push('Patient name is required');
        }
        if (!this.currentReport.patientInfo.id) {
            errors.push('Patient ID is required');
        }
        if (this.currentReport.findings.length === 0) {
            errors.push('At least one finding is required');
        }
        
        return errors;
    }
    
    prepareForSubmission() {
        // Create a clean copy without any media blobs
        return {
            reportId: this.currentReport.id,
            patient: {
                name: this.currentReport.patientInfo.name,
                id: this.currentReport.patientInfo.id
            },
            examination: {
                date: this.currentReport.examinationDate,
                type: 'ENT/Dental'
            },
            findings: this.currentReport.findings.map(f => ({
                content: f.content,
                source: f.source,
                verified: f.verified
            })),
            doctorNotes: this.currentReport.doctorNotes,
            diagnosis: this.currentReport.diagnosis,
            metadata: {
                aiAssisted: true,
                submittedAt: new Date().toISOString(),
                localProcessing: true // Indicates AI ran locally
            }
        };
    }
    
    exportAsPDF() {
        // This would use a library like jsPDF or html2pdf
        console.log('PDF export would be implemented here');
        // For now, just log the report
        console.log(this.prepareForSubmission());
    }
    
    exportAsJSON() {
        const data = this.prepareForSubmission();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${this.currentReport.id}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    getDrafts() {
        return this.drafts;
    }
    
    getCurrentReport() {
        return this.currentReport;
    }
}
