class TouchButton {
    constructor(options = {}) {
        this.text = options.text || '';
        this.icon = options.icon || '';
        this.size = options.size || 'medium'; // small, medium, large, xl
        this.variant = options.variant || 'primary'; // primary, secondary, success, warning, danger
        this.disabled = options.disabled || false;
        this.onClick = options.onClick || (() => {});
        this.className = options.className || '';
        this.dataAttributes = options.dataAttributes || {};
        this.hapticFeedback = options.hapticFeedback !== false;
    }

    render() {
        const sizeClasses = {
            small: 'touch-btn-small',
            medium: 'touch-btn-medium', 
            large: 'touch-btn-large',
            xl: 'touch-btn-xl'
        };

        const variantClasses = {
            primary: 'touch-btn-primary',
            secondary: 'touch-btn-secondary',
            success: 'touch-btn-success',
            warning: 'touch-btn-warning',
            danger: 'touch-btn-danger'
        };

        const classes = [
            'touch-button',
            sizeClasses[this.size],
            variantClasses[this.variant],
            this.className
        ].filter(Boolean).join(' ');

        const dataAttrs = Object.entries(this.dataAttributes)
            .map(([key, value]) => `data-${key}="${value}"`)
            .join(' ');

        const iconHtml = this.icon ? `<span class="touch-btn-icon">${this.icon}</span>` : '';
        const textHtml = this.text ? `<span class="touch-btn-text">${this.text}</span>` : '';

        return `
            <button 
                class="${classes}"
                ${this.disabled ? 'disabled' : ''}
                ${dataAttrs}
            >
                ${iconHtml}
                ${textHtml}
            </button>
        `;
    }

    bindEvents(element) {
        if (!element) return;

        element.addEventListener('click', (e) => {
            if (this.disabled) return;
            
            this.triggerHapticFeedback();
            this.addClickAnimation(element);
            this.onClick(e);
        });

        element.addEventListener('touchstart', () => {
            if (!this.disabled) {
                element.classList.add('touch-active');
            }
        });

        element.addEventListener('touchend', () => {
            element.classList.remove('touch-active');
        });

        element.addEventListener('touchcancel', () => {
            element.classList.remove('touch-active');
        });
    }

    triggerHapticFeedback() {
        if (!this.hapticFeedback || !navigator.vibrate) return;
        
        try {
            navigator.vibrate(50); // 50ms vibration
        } catch (error) {
            // Ignore vibration errors
        }
    }

    addClickAnimation(element) {
        element.classList.add('touch-clicked');
        
        setTimeout(() => {
            element.classList.remove('touch-clicked');
        }, 150);
    }

    static create(options) {
        const button = new TouchButton(options);
        const element = document.createElement('div');
        element.innerHTML = button.render();
        const buttonElement = element.firstElementChild;
        button.bindEvents(buttonElement);
        return buttonElement;
    }

    static createMultiple(buttonsConfig) {
        return buttonsConfig.map(config => TouchButton.create(config));
    }
}

// Utility function for creating quick touch buttons
function createTouchButton(text, onClick, options = {}) {
    return TouchButton.create({
        text,
        onClick,
        ...options
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchButton;
}