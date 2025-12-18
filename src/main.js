// Main Application Entry Point
import { App } from './app/App.js';
import { ModelManager } from './ai/ModelManager.js';
import { SelectionManager } from './features/SelectionManager.js';
import { AnalysisManager } from './features/AnalysisManager.js';
import { ReportManager } from './features/ReportManager.js';
import { UIManager } from './ui/UIManager.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏥 AI Medical Assistant - Initializing...');
    
    // Initialize core components
    const modelManager = new ModelManager();
    const uiManager = new UIManager();
    const selectionManager = new SelectionManager();
    const analysisManager = new AnalysisManager(modelManager);
    const reportManager = new ReportManager();
    
    // Initialize main app
    const app = new App({
        modelManager,
        uiManager,
        selectionManager,
        analysisManager,
        reportManager
    });
    
    await app.initialize();
    
    // Make app globally accessible for debugging
    window.medicalAssistantApp = app;
    
    console.log('✅ AI Medical Assistant - Ready');
});
