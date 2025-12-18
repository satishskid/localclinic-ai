/**
 * Unit tests for OfflineManager
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('OfflineManager', () => {
    let OfflineManager, offlineManager;
    
    beforeEach(async () => {
        // Mock navigator
        Object.defineProperty(global, 'navigator', {
            value: {
                onLine: true,
                connection: {
                    effectiveType: '4g',
                    downlink: 10,
                    saveData: false
                }
            },
            writable: true
        });
        
        // Mock window
        global.window = {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        };
        
        // Mock fetch
        global.fetch = vi.fn().mockResolvedValue({ ok: true });
        
        vi.resetModules();
        const module = await import('../src/core/OfflineManager.js');
        OfflineManager = module.OfflineManager;
        offlineManager = module.offlineManager;
    });
    
    afterEach(() => {
        vi.clearAllMocks();
    });
    
    describe('initialization', () => {
        it('should detect initial online status', () => {
            const manager = new OfflineManager();
            expect(manager.isOnline).toBe(true);
        });
        
        it('should register event listeners', () => {
            new OfflineManager();
            expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
            expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
        });
    });
    
    describe('getStatus', () => {
        it('should return network status', () => {
            const manager = new OfflineManager();
            const status = manager.getStatus();
            
            expect(status.isOnline).toBe(true);
            expect(status.effectiveType).toBe('4g');
        });
    });
    
    describe('isSlowConnection', () => {
        it('should detect fast connection', () => {
            const manager = new OfflineManager();
            expect(manager.isSlowConnection()).toBe(false);
        });
        
        it('should detect slow connection', () => {
            navigator.connection.effectiveType = '2g';
            const manager = new OfflineManager();
            expect(manager.isSlowConnection()).toBe(true);
        });
        
        it('should detect data saver mode', () => {
            navigator.connection.saveData = true;
            const manager = new OfflineManager();
            expect(manager.isSlowConnection()).toBe(true);
        });
    });
    
    describe('event system', () => {
        it('should register and call listeners', () => {
            const manager = new OfflineManager();
            const callback = vi.fn();
            
            manager.on('testEvent', callback);
            manager.emit('testEvent', { data: 'test' });
            
            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });
        
        it('should remove listeners', () => {
            const manager = new OfflineManager();
            const callback = vi.fn();
            
            manager.on('testEvent', callback);
            manager.off('testEvent', callback);
            manager.emit('testEvent');
            
            expect(callback).not.toHaveBeenCalled();
        });
    });
    
    describe('offline queue', () => {
        it('should queue actions when offline', () => {
            const manager = new OfflineManager();
            manager.isOnline = false;
            
            manager.queueForOnline('submitReport', { id: 123 });
            
            expect(manager.offlineQueue.length).toBe(1);
            expect(manager.offlineQueue[0].action).toBe('submitReport');
        });
    });
    
    describe('fetchWithFallback', () => {
        it('should return fallback when offline', async () => {
            const manager = new OfflineManager();
            manager.isOnline = false;
            
            const result = await manager.fetchWithFallback(
                'https://api.example.com/data',
                {},
                { cached: true }
            );
            
            expect(result.fromCache).toBe(true);
            expect(result.data.cached).toBe(true);
        });
        
        it('should throw when offline without fallback', async () => {
            const manager = new OfflineManager();
            manager.isOnline = false;
            
            await expect(
                manager.fetchWithFallback('https://api.example.com/data')
            ).rejects.toThrow('No internet connection');
        });
    });
});
