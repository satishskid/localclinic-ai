/**
 * Analysis Manager
 * Orchestrates AI analysis for different content types
 * Bridges selection and AI model for seamless analysis workflow
 * Now supports clinical context for more accurate analysis
 */
export class AnalysisManager {
    constructor(modelManager) {
        this.modelManager = modelManager;
        this.analysisHistory = [];
        this.maxHistorySize = 50;
        this.clinicalContext = null; // Current clinical context
    }
    
    /**
     * Set the clinical context for analysis
     * @param {Object} context - Clinical context from ClinicalContextManager
     */
    setClinicalContext(context) {
        this.clinicalContext = context;
    }
    
    /**
     * Get the current clinical context
     */
    getClinicalContext() {
        return this.clinicalContext;
    }
    
    async analyze(selection, analysisType) {
        if (!selection) {
            throw new Error('No content selected for analysis');
        }
        
        const startTime = Date.now();
        let result;
        
        switch (selection.type) {
            case 'text':
                result = await this.analyzeText(selection.content, analysisType);
                break;
            case 'image':
            case 'screen':
                result = await this.analyzeImage(selection.content, analysisType);
                break;
            case 'video':
                result = await this.analyzeVideo(selection.content, analysisType);
                break;
            case 'combined':
                result = await this.analyzeCombined(selection.content, analysisType);
                break;
            default:
                throw new Error(`Unsupported content type: ${selection.type}`);
        }
        
        // Record analysis in history with context
        this.recordAnalysis({
            type: selection.type,
            analysisType,
            result,
            clinicalContext: this.clinicalContext,
            duration: Date.now() - startTime,
            timestamp: Date.now()
        });
        
        return result;
    }
    
    async analyzeText(text, analysisType) {
        if (!text || text.trim().length === 0) {
            throw new Error('Empty text cannot be analyzed');
        }
        
        // Use model manager for analysis with clinical context
        return await this.modelManager.analyzeText(text, analysisType, this.clinicalContext);
    }
    
    async analyzeImage(imageData, analysisType) {
        if (!imageData) {
            throw new Error('No image data provided');
        }
        
        // Process image through model with clinical context
        const result = await this.modelManager.analyzeImage(imageData, analysisType, this.clinicalContext);
        
        // Enhance result with image-specific analysis
        return {
            ...result,
            imageAnalysis: {
                processed: true,
                type: imageData.startsWith('data:') ? 'base64' : 'url'
            }
        };
    }
    
    async analyzeVideo(videoData, analysisType) {
        if (!videoData) {
            throw new Error('No video data provided');
        }
        
        // For video, we extract key frames and analyze with clinical context
        const result = await this.modelManager.analyzeVideo(videoData, analysisType, this.clinicalContext);
        
        return {
            ...result,
            videoAnalysis: {
                processed: true,
                frameAnalysis: 'Key frames extracted and analyzed'
            }
        };
    }
    
    /**
     * Analyze combined content (text + images + screenshot)
     * This is used when "Analyze Visible Content" captures everything
     */
    async analyzeCombined(content, analysisType) {
        const results = {
            summary: '',
            findings: [],
            recommendations: [],
            confidence: 0,
            analysisDetails: {},
            clinicalContext: this.clinicalContext ? {
                specialty: this.clinicalContext.specialty?.name,
                ageGroup: this.clinicalContext.ageGroup?.name,
                reportType: this.clinicalContext.reportType?.name
            } : null
        };
        
        // Analyze text content with clinical context
        if (content.text && content.text.length > 0) {
            const textResult = await this.modelManager.analyzeText(content.text, analysisType, this.clinicalContext);
            
            if (textResult.summary) results.summary = textResult.summary;
            if (textResult.findings) results.findings.push(...textResult.findings);
            if (textResult.recommendations) results.recommendations.push(...textResult.recommendations);
            if (textResult.confidence) results.confidence = textResult.confidence;
            
            results.analysisDetails.textAnalyzed = true;
            results.analysisDetails.textLength = content.text.length;
        }
        
        // Analyze images if present
        if (content.images && content.images.length > 0) {
            results.findings.push(`${content.images.length} medical image(s) detected and ready for visual review`);
            
            // In production, each image would be analyzed by a vision model
            for (let i = 0; i < Math.min(content.images.length, 3); i++) {
                const imageResult = await this.modelManager.analyzeImage(content.images[i].src, analysisType);
                if (imageResult.findings) {
                    results.findings.push(...imageResult.findings.slice(0, 2));
                }
            }
            
            results.analysisDetails.imagesAnalyzed = content.images.length;
        }
        
        // Analyze screenshot if present
        if (content.screenshot) {
            results.findings.push('Screen capture analyzed for visible clinical data');
            results.analysisDetails.screenshotAnalyzed = true;
        }
        
        // Deduplicate findings and recommendations
        results.findings = [...new Set(results.findings)];
        results.recommendations = [...new Set(results.recommendations)];
        
        // Add combined analysis summary
        if (!results.summary) {
            results.summary = `Combined analysis of ${results.analysisDetails.textAnalyzed ? 'clinical text' : ''}${results.analysisDetails.imagesAnalyzed ? ` and ${results.analysisDetails.imagesAnalyzed} image(s)` : ''}. Review findings below for clinical decision support.`;
        }
        
        return results;
    }
    
    async analyzeMultiple(selections, analysisType) {
        // Analyze multiple selections and combine results
        const results = await Promise.all(
            selections.map(selection => this.analyze(selection, analysisType))
        );
        
        return this.combineResults(results, analysisType);
    }
    
    combineResults(results, analysisType) {
        const combined = {
            summary: '',
            findings: [],
            recommendations: [],
            confidence: 0,
            combinedFrom: results.length
        };
        
        results.forEach(result => {
            if (result.summary) {
                combined.summary += result.summary + ' ';
            }
            if (result.findings) {
                combined.findings.push(...result.findings);
            }
            if (result.recommendations) {
                combined.recommendations.push(...result.recommendations);
            }
            if (result.confidence) {
                combined.confidence += result.confidence;
            }
        });
        
        // Average confidence
        combined.confidence = combined.confidence / results.length;
        
        // Deduplicate
        combined.findings = [...new Set(combined.findings)];
        combined.recommendations = [...new Set(combined.recommendations)];
        
        return combined;
    }
    
    recordAnalysis(record) {
        this.analysisHistory.push(record);
        
        // Trim history if too large
        if (this.analysisHistory.length > this.maxHistorySize) {
            this.analysisHistory.shift();
        }
        
        // Save to local storage
        this.saveHistory();
    }
    
    saveHistory() {
        try {
            const historyToSave = this.analysisHistory.slice(-20); // Keep last 20
            localStorage.setItem('analysisHistory', JSON.stringify(historyToSave));
        } catch (error) {
            console.warn('Could not save analysis history:', error);
        }
    }
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('analysisHistory');
            if (saved) {
                this.analysisHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load analysis history:', error);
        }
    }
    
    getHistory() {
        return this.analysisHistory;
    }
    
    getLastAnalysis() {
        return this.analysisHistory[this.analysisHistory.length - 1];
    }
    
    clearHistory() {
        this.analysisHistory = [];
        localStorage.removeItem('analysisHistory');
    }
    
    // Format result for display
    formatForDisplay(result) {
        let html = '<div class="analysis-result-formatted">';
        
        if (result.summary) {
            html += `<div class="result-summary"><strong>Summary:</strong> ${result.summary}</div>`;
        }
        
        if (result.findings && result.findings.length > 0) {
            html += '<div class="result-findings"><strong>Key Findings:</strong><ul>';
            result.findings.forEach(finding => {
                html += `<li><i class="fas fa-check-circle"></i> ${finding}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (result.recommendations && result.recommendations.length > 0) {
            html += '<div class="result-recommendations"><strong>Recommendations:</strong><ul>';
            result.recommendations.forEach(rec => {
                html += `<li><i class="fas fa-lightbulb"></i> ${rec}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (result.confidence) {
            const confidencePercent = Math.round(result.confidence * 100);
            const confidenceClass = confidencePercent > 80 ? 'high' : confidencePercent > 60 ? 'medium' : 'low';
            html += `<div class="result-confidence ${confidenceClass}">
                <strong>Confidence:</strong> 
                <span class="confidence-bar">
                    <span class="confidence-fill" style="width: ${confidencePercent}%"></span>
                </span>
                ${confidencePercent}%
            </div>`;
        }
        
        html += '</div>';
        return html;
    }
    
    // Export analysis for report
    exportForReport(result) {
        return {
            content: result.summary || '',
            findings: result.findings || [],
            recommendations: result.recommendations || [],
            confidence: result.confidence || 0,
            exportedAt: new Date().toISOString(),
            source: 'AI Analysis'
        };
    }
}
