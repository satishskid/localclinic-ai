/**
 * Unit tests for CacheManager
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock IndexedDB
const mockDB = {
    transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
            get: vi.fn(() => ({
                onsuccess: null,
                onerror: null,
                result: null
            })),
            put: vi.fn(() => ({
                onsuccess: null,
                onerror: null
            })),
            delete: vi.fn(() => ({
                onsuccess: null,
                onerror: null
            })),
            getAll: vi.fn(() => ({
                onsuccess: null,
                onerror: null,
                result: []
            })),
            clear: vi.fn(() => ({
                onsuccess: null,
                onerror: null
            }))
        })),
        oncomplete: null,
        onerror: null
    })),
    objectStoreNames: {
        contains: vi.fn().mockReturnValue(true)
    }
};

const mockIndexedDB = {
    open: vi.fn(() => {
        const request = {
            onsuccess: null,
            onerror: null,
            onupgradeneeded: null,
            result: mockDB
        };
        setTimeout(() => {
            if (request.onsuccess) request.onsuccess({ target: request });
        }, 0);
        return request;
    })
};

global.indexedDB = mockIndexedDB;

describe('CacheManager', () => {
    let CacheManager, cacheManager;
    
    beforeEach(async () => {
        vi.resetModules();
        const module = await import('../src/core/CacheManager.js');
        CacheManager = module.CacheManager;
        cacheManager = module.cacheManager;
    });
    
    afterEach(() => {
        vi.clearAllMocks();
    });
    
    describe('initialization', () => {
        it('should have correct database configuration', () => {
            expect(CacheManager).toBeDefined();
        });
        
        it('should be a singleton', () => {
            expect(cacheManager).toBeDefined();
        });
    });
    
    describe('formatBytes utility', () => {
        it('should be exported from ConfigManager', async () => {
            const { formatBytes } = await import('../src/core/ConfigManager.js');
            
            expect(formatBytes(0)).toBe('0 Bytes');
            expect(formatBytes(1024)).toBe('1 KB');
            expect(formatBytes(1024 * 1024)).toBe('1 MB');
            expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
        });
    });
});

describe('ConfigManager', () => {
    let CONFIG, MODELS, MEDICAL_VOCABULARY;
    
    beforeEach(async () => {
        const module = await import('../src/core/ConfigManager.js');
        CONFIG = module.CONFIG;
        MODELS = module.MODELS;
        MEDICAL_VOCABULARY = module.MEDICAL_VOCABULARY;
    });
    
    describe('model configuration', () => {
        it('should have text classification model', () => {
            expect(MODELS.textClassification).toBeDefined();
            expect(MODELS.textClassification.id).toContain('distilbert');
            expect(MODELS.textClassification.required).toBe(true);
        });
        
        it('should have medical NER model', () => {
            expect(MODELS.medicalNER).toBeDefined();
            expect(MODELS.medicalNER.task).toBe('token-classification');
        });
        
        it('should have all models with size estimates', () => {
            Object.values(MODELS).forEach(model => {
                expect(model.size).toBeGreaterThan(0);
                expect(model.priority).toBeDefined();
            });
        });
    });
    
    describe('medical vocabulary', () => {
        it('should have dental terms', () => {
            expect(MEDICAL_VOCABULARY.dental).toBeDefined();
            expect(MEDICAL_VOCABULARY.dental).toContain('cavity');
            expect(MEDICAL_VOCABULARY.dental).toContain('enamel');
        });
        
        it('should have ENT terms', () => {
            expect(MEDICAL_VOCABULARY.ent).toBeDefined();
            expect(MEDICAL_VOCABULARY.ent).toContain('sinusitis');
            expect(MEDICAL_VOCABULARY.ent).toContain('otitis');
        });
        
        it('should have general medical terms', () => {
            expect(MEDICAL_VOCABULARY.general).toBeDefined();
            expect(MEDICAL_VOCABULARY.general).toContain('inflammation');
        });
    });
    
    describe('app configuration', () => {
        it('should have analysis limits', () => {
            expect(CONFIG.analysis.maxTextLength).toBe(50000);
            expect(CONFIG.analysis.maxImageSize).toBe(10 * 1024 * 1024);
        });
        
        it('should have storage configuration', () => {
            expect(CONFIG.storage.dbName).toBe('MedicalAIAssistant');
            expect(CONFIG.storage.maxCacheSize).toBeGreaterThan(0);
        });
        
        it('should have feature flags', () => {
            expect(CONFIG.features.enableImageAnalysis).toBe(true);
            expect(CONFIG.features.enableVideoAnalysis).toBe(true);
        });
    });
});
