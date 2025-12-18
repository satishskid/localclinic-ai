/**
 * Offline Manager - Detects network status and manages offline mode
 * Ensures app works seamlessly with or without internet connection
 */
export class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = new Map();
        this.offlineQueue = [];
        this.initialize();
    }

    initialize() {
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Check connection periodically (every 30 seconds)
        setInterval(() => this.checkConnection(), 30000);

        console.log(`✅ OfflineManager: Initialized (${this.isOnline ? 'Online' : 'Offline'})`);
    }

    handleOnline() {
        this.isOnline = true;
        console.log('🌐 Network: Online');
        this.emit('online');
        this.processOfflineQueue();
    }

    handleOffline() {
        this.isOnline = false;
        console.log('📴 Network: Offline');
        this.emit('offline');
    }

    /**
     * Check actual network connectivity (not just navigator.onLine)
     */
    async checkConnection() {
        try {
            // Try to fetch a small resource
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            
            if (!this.isOnline) {
                this.handleOnline();
            }
            return true;
        } catch (error) {
            if (this.isOnline) {
                this.handleOffline();
            }
            return false;
        }
    }

    /**
     * Get current network status
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            effectiveType: navigator.connection?.effectiveType || 'unknown',
            downlink: navigator.connection?.downlink || 'unknown',
            saveData: navigator.connection?.saveData || false
        };
    }

    /**
     * Check if we're on a slow connection
     */
    isSlowConnection() {
        const connection = navigator.connection;
        if (!connection) return false;
        
        return connection.saveData || 
               connection.effectiveType === 'slow-2g' || 
               connection.effectiveType === '2g';
    }

    /**
     * Queue action for when online
     */
    queueForOnline(action, data) {
        this.offlineQueue.push({
            action,
            data,
            timestamp: Date.now()
        });
        console.log(`📝 Queued action for online: ${action}`);
    }

    /**
     * Process queued actions when back online
     */
    async processOfflineQueue() {
        if (!this.isOnline || this.offlineQueue.length === 0) return;

        console.log(`⏳ Processing ${this.offlineQueue.length} queued actions...`);

        while (this.offlineQueue.length > 0) {
            const item = this.offlineQueue.shift();
            try {
                this.emit('processQueuedAction', item);
            } catch (error) {
                console.error('Error processing queued action:', error);
                // Re-queue if failed
                this.offlineQueue.unshift(item);
                break;
            }
        }

        console.log('✅ Offline queue processed');
    }

    /**
     * Fetch with offline fallback
     */
    async fetchWithFallback(url, options = {}, fallbackData = null) {
        if (!this.isOnline) {
            if (fallbackData) {
                return { data: fallbackData, fromCache: true };
            }
            throw new Error('No internet connection and no cached data available');
        }

        try {
            const response = await fetch(url, {
                ...options,
                // Add timeout
                signal: AbortSignal.timeout(options.timeout || 30000)
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            return { data: await response.json(), fromCache: false };
        } catch (error) {
            if (fallbackData) {
                console.warn('Fetch failed, using fallback:', error.message);
                return { data: fallbackData, fromCache: true };
            }
            throw error;
        }
    }

    // Event system
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }
}

// Singleton instance
export const offlineManager = new OfflineManager();
