/**
 * UI Manager
 * Handles common UI operations like toasts, modals, and notifications
 */
export class UIManager {
    constructor() {
        this.toastContainer = null;
        this.initializeToastContainer();
    }
    
    initializeToastContainer() {
        this.toastContainer = document.getElementById('toast-container');
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
    }
    
    showToast(type, title, message, duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    }
    
    showModal(options) {
        const { title, content, buttons = [], onClose } = options;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="btn btn-icon modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${typeof content === 'string' ? content : ''}
                </div>
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="btn ${btn.primary ? 'btn-primary' : 'btn-secondary'}" data-action="${btn.action}">
                            ${btn.icon ? `<i class="fas fa-${btn.icon}"></i>` : ''}
                            ${btn.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Handle content if it's an element
        if (typeof content !== 'string') {
            modal.querySelector('.modal-body').appendChild(content);
        }
        
        // Event handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
            if (onClose) onClose();
        });
        
        // Button handlers
        buttons.forEach(btn => {
            const button = modal.querySelector(`[data-action="${btn.action}"]`);
            if (button && btn.onClick) {
                button.addEventListener('click', () => {
                    btn.onClick();
                    if (btn.closeOnClick !== false) {
                        this.closeModal(modal);
                    }
                });
            }
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
                if (onClose) onClose();
            }
        });
        
        document.body.appendChild(modal);
        return modal;
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);
    }
    
    showConfirm(title, message) {
        return new Promise((resolve) => {
            this.showModal({
                title,
                content: `<p>${message}</p>`,
                buttons: [
                    {
                        label: 'Cancel',
                        action: 'cancel',
                        onClick: () => resolve(false)
                    },
                    {
                        label: 'Confirm',
                        action: 'confirm',
                        primary: true,
                        onClick: () => resolve(true)
                    }
                ],
                onClose: () => resolve(false)
            });
        });
    }
    
    showLoading(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.id = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(loader);
        return loader;
    }
    
    hideLoading() {
        const loader = document.getElementById('loading-overlay');
        if (loader) {
            loader.remove();
        }
    }
    
    updateProgress(element, progress, text) {
        if (element) {
            const progressBar = element.querySelector('.progress-fill');
            const progressText = element.querySelector('.progress-text');
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            if (progressText && text) {
                progressText.textContent = text;
            }
        }
    }
    
    // Utility to format dates
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }
    
    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
    
    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('success', 'Copied', 'Text copied to clipboard');
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            this.showToast('error', 'Copy Failed', 'Could not copy to clipboard');
            return false;
        }
    }
}
