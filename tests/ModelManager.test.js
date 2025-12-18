/**
 * Unit tests for ModelManager
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('../src/core/CacheManager.js', () => ({
    cacheManager: {
        initialize: vi.fn().mockResolvedValue(),
        isModelCached: vi.fn().mockResolvedValue(false),
        saveModel: vi.fn().mockResolvedValue(),
        getCacheSize: vi.fn().mockResolvedValue(0),
        clearModelCache: vi.fn().mockResolvedValue()
    }
}));

vi.mock('../src/core/OfflineManager.js', () => ({
    offlineManager: {
        isOnline: true,
        on: vi.fn(),
        off: vi.fn()
    }
}));

vi.mock('@xenova/transformers', () => ({
    pipeline: vi.fn().mockImplementation(() => Promise.resolve(
        vi.fn().mockResolvedValue([{ label: 'POSITIVE', score: 0.95 }])
    )),
    env: {
        allowLocalModels: false,
        useBrowserCache: true,
        cacheDir: '.cache'
    }
}));

describe('ModelManager', () => {
    let ModelManager;
    
    beforeEach(async () => {
        vi.resetModules();
        const module = await import('../src/ai/ModelManager.js');
        ModelManager = module.ModelManager;
    });
    
    afterEach(() => {
        vi.clearAllMocks();
    });
    
    describe('initialization', () => {
        it('should initialize with default state', () => {
            const manager = new ModelManager();
            expect(manager.isInitialized).toBe(false);
            expect(manager.useLocalModel).toBe(true);
            expect(manager.pipelines.size).toBe(0);
        });
        
        it('should report ready status correctly', () => {
            const manager = new ModelManager();
            expect(manager.isReady()).toBe(false);
        });
        
        it('should return correct status before initialization', () => {
            const manager = new ModelManager();
            const status = manager.getStatus();
            expect(status.initialized).toBe(false);
            expect(status.localModelAvailable).toBe(true);
        });
    });
    
    describe('analyzeText', () => {
        it('should throw error for empty text', async () => {
            const manager = new ModelManager();
            await expect(manager.analyzeText('', 'diagnosis')).rejects.toThrow('No text provided');
        });
        
        it('should throw error for whitespace-only text', async () => {
            const manager = new ModelManager();
            await expect(manager.analyzeText('   ', 'diagnosis')).rejects.toThrow('No text provided');
        });
        
        it('should use fallback analysis when not initialized', async () => {
            const manager = new ModelManager();
            const result = await manager.analyzeText('Patient has ear pain', 'diagnosis');
            
            expect(result).toBeDefined();
            expect(result.summary).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
        });
        
        it('should detect medical keywords', async () => {
            const manager = new ModelManager();
            const result = await manager.analyzeText(
                'Patient presents with severe ear pain and tinnitus',
                'diagnosis'
            );
            
            expect(result.findings).toBeDefined();
            expect(result.findings.length).toBeGreaterThan(0);
        });
    });
    
    describe('analyzeImage', () => {
        it('should return structured image analysis', async () => {
            const manager = new ModelManager();
            const result = await manager.analyzeImage('test-image-data', 'diagnosis');
            
            expect(result).toBeDefined();
            expect(result.summary).toBeDefined();
            expect(result.findings).toBeDefined();
            expect(result.recommendations).toBeDefined();
        });
    });
    
    describe('analyzeVideo', () => {
        it('should return structured video analysis', async () => {
            const manager = new ModelManager();
            const result = await manager.analyzeVideo('test-video-data', 'diagnosis');
            
            expect(result).toBeDefined();
            expect(result.summary).toBeDefined();
            expect(result.findings).toBeDefined();
        });
    });
    
    describe('medical analysis', () => {
        it('should generate diagnosis analysis', async () => {
            const manager = new ModelManager();
            const result = await manager.analyzeText(
                'Patient presents with chronic sinusitis and nasal congestion',
                'diagnosis'
            );
            
            expect(result.summary).toContain('sinusitis');
            expect(result.recommendations.length).toBeGreaterThan(0);
        });
        
        it('should generate summary analysis', async () => {
            const manager = new ModelManager();
            const result = await manager.analyzeText(
                'Patient has dental pain in the lower molar region',
                'summary'
            );
            
            expect(result.summary).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0.8);
        });
        
        it('should generate findings analysis', async () => {
            const manager = new ModelManager();
            const result = await manager.analyzeText(
                'Examination reveals mild inflammation of the gingiva',
                'findings'
            );
            
            expect(result.findings).toBeDefined();
            expect(result.findings.length).toBeGreaterThan(0);
        });
        
        it('should generate recommendations', async () => {
            const manager = new ModelManager();
            const result = await manager.analyzeText(
                'Suspected throat infection with mild fever',
                'recommendations'
            );
            
            expect(result.recommendations).toBeDefined();
            expect(result.recommendations.length).toBeGreaterThan(0);
        });
    });
});

describe('Medical Vocabulary Detection', () => {
    let ModelManager;
    
    beforeEach(async () => {
        vi.resetModules();
        const module = await import('../src/ai/ModelManager.js');
        ModelManager = module.ModelManager;
    });
    
    it('should detect dental terms', async () => {
        const manager = new ModelManager();
        const result = await manager.analyzeText(
            'Patient has cavity in the enamel with dentin exposure',
            'findings'
        );
        
        expect(result.findings.some(f => 
            f.toLowerCase().includes('cavity') || 
            f.toLowerCase().includes('enamel') ||
            f.toLowerCase().includes('dentin')
        )).toBe(true);
    });
    
    it('should detect ENT terms', async () => {
        const manager = new ModelManager();
        const result = await manager.analyzeText(
            'Bilateral otitis media with tympanic membrane changes',
            'findings'
        );
        
        expect(result.findings.length).toBeGreaterThan(0);
    });
    
    it('should detect severity indicators', async () => {
        const manager = new ModelManager();
        const result = await manager.analyzeText(
            'Severe acute pharyngitis requiring treatment',
            'diagnosis'
        );
        
        expect(result.confidence).toBeGreaterThan(0.6);
    });
});
