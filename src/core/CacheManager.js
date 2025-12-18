/**
 * Cache Manager - Handles IndexedDB storage for AI models and data
 * Enables offline functionality after first model download
 */
export class CacheManager {
    constructor() {
        this.dbName = 'AImedicalAssistantDB';
        this.dbVersion = 1;
        this.db = null;
        this.stores = {
            models: 'models',
            settings: 'settings',
            reports: 'reports'
        };
    }

    /**
     * Initialize IndexedDB connection
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ CacheManager: IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Models store - for AI model files
                if (!db.objectStoreNames.contains(this.stores.models)) {
                    const modelsStore = db.createObjectStore(this.stores.models, { keyPath: 'id' });
                    modelsStore.createIndex('name', 'name', { unique: false });
                    modelsStore.createIndex('version', 'version', { unique: false });
                    modelsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Settings store - for app configuration
                if (!db.objectStoreNames.contains(this.stores.settings)) {
                    db.createObjectStore(this.stores.settings, { keyPath: 'key' });
                }

                // Reports store - for saved report drafts
                if (!db.objectStoreNames.contains(this.stores.reports)) {
                    const reportsStore = db.createObjectStore(this.stores.reports, { keyPath: 'id' });
                    reportsStore.createIndex('patientId', 'patientId', { unique: false });
                    reportsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                console.log('✅ CacheManager: Database schema created');
            };
        });
    }

    /**
     * Check if a model is cached
     */
    async isModelCached(modelId) {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.models], 'readonly');
            const store = transaction.objectStore(this.stores.models);
            const request = store.get(modelId);

            request.onsuccess = () => {
                resolve(!!request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Get cached model data
     */
    async getModel(modelId) {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.models], 'readonly');
            const store = transaction.objectStore(this.stores.models);
            const request = store.get(modelId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Save model to cache
     */
    async saveModel(modelId, modelData, metadata = {}) {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.models], 'readwrite');
            const store = transaction.objectStore(this.stores.models);

            const record = {
                id: modelId,
                name: metadata.name || modelId,
                version: metadata.version || '1.0.0',
                data: modelData,
                size: metadata.size || 0,
                timestamp: Date.now(),
                metadata
            };

            const request = store.put(record);

            request.onsuccess = () => {
                console.log(`✅ Model cached: ${modelId}`);
                resolve(record);
            };

            request.onerror = () => {
                console.error(`❌ Failed to cache model: ${modelId}`, request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Delete model from cache
     */
    async deleteModel(modelId) {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.models], 'readwrite');
            const store = transaction.objectStore(this.stores.models);
            const request = store.delete(modelId);

            request.onsuccess = () => {
                console.log(`✅ Model deleted: ${modelId}`);
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Get all cached models
     */
    async getAllModels() {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.models], 'readonly');
            const store = transaction.objectStore(this.stores.models);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Get total cache size
     */
    async getCacheSize() {
        const models = await this.getAllModels();
        return models.reduce((total, model) => total + (model.size || 0), 0);
    }

    /**
     * Clear all cached models
     */
    async clearModelCache() {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.models], 'readwrite');
            const store = transaction.objectStore(this.stores.models);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('✅ Model cache cleared');
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Settings methods
    async getSetting(key, defaultValue = null) {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.settings], 'readonly');
            const store = transaction.objectStore(this.stores.settings);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result?.value ?? defaultValue);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async setSetting(key, value) {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.settings], 'readwrite');
            const store = transaction.objectStore(this.stores.settings);
            const request = store.put({ key, value, timestamp: Date.now() });

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Report methods
    async saveReport(report) {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.reports], 'readwrite');
            const store = transaction.objectStore(this.stores.reports);
            
            report.timestamp = Date.now();
            const request = store.put(report);

            request.onsuccess = () => {
                resolve(report);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getReport(reportId) {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.reports], 'readonly');
            const store = transaction.objectStore(this.stores.reports);
            const request = store.get(reportId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getAllReports() {
        if (!this.db) await this.initialize();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.reports], 'readonly');
            const store = transaction.objectStore(this.stores.reports);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

// Singleton instance
export const cacheManager = new CacheManager();
