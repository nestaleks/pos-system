class NumPad {
    constructor(options = {}) {
        this.value = options.value || '';
        this.maxLength = options.maxLength || 10;
        this.allowDecimal = options.allowDecimal !== false;
        this.currency = options.currency || '€';
        this.placeholder = options.placeholder || '0';
        this.size = options.size || 'medium'; // small, medium, large
        this.onInput = options.onInput || (() => {});
        this.onEnter = options.onEnter || (() => {});
        this.onClear = options.onClear || (() => {});
        this.className = options.className || '';
        this.showDisplay = options.showDisplay !== false;
        this.showCurrency = options.showCurrency !== false;
    }

    render() {
        const sizeClasses = {
            small: 'numpad-small',
            medium: 'numpad-medium',
            large: 'numpad-large'
        };

        const classes = [
            'numpad',
            sizeClasses[this.size],
            this.className
        ].filter(Boolean).join(' ');

        const displayHtml = this.showDisplay ? `
            <div class="numpad-display">
                <div class="numpad-value">
                    ${this.formatDisplayValue()}
                    ${this.showCurrency ? `<span class="numpad-currency">${this.currency}</span>` : ''}
                </div>
            </div>
        ` : '';

        return `
            <div class="${classes}">
                ${displayHtml}
                <div class="numpad-buttons">
                    <div class="numpad-row">
                        <button class="numpad-btn" data-action="number" data-value="7">7</button>
                        <button class="numpad-btn" data-action="number" data-value="8">8</button>
                        <button class="numpad-btn" data-action="number" data-value="9">9</button>
                        <button class="numpad-btn numpad-btn-action" data-action="backspace">⌫</button>
                    </div>
                    <div class="numpad-row">
                        <button class="numpad-btn" data-action="number" data-value="4">4</button>
                        <button class="numpad-btn" data-action="number" data-value="5">5</button>
                        <button class="numpad-btn" data-action="number" data-value="6">6</button>
                        <button class="numpad-btn numpad-btn-action" data-action="clear">C</button>
                    </div>
                    <div class="numpad-row">
                        <button class="numpad-btn" data-action="number" data-value="1">1</button>
                        <button class="numpad-btn" data-action="number" data-value="2">2</button>
                        <button class="numpad-btn" data-action="number" data-value="3">3</button>
                        <button class="numpad-btn numpad-btn-primary" data-action="enter" rowspan="2">✓</button>
                    </div>
                    <div class="numpad-row">
                        <button class="numpad-btn numpad-btn-wide" data-action="number" data-value="0">0</button>
                        ${this.allowDecimal ? '<button class="numpad-btn" data-action="decimal">.</button>' : '<button class="numpad-btn" disabled></button>'}
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents(element) {
        if (!element) return;

        const buttonsContainer = element.querySelector('.numpad-buttons');
        if (!buttonsContainer) return;

        buttonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.numpad-btn');
            if (!button || button.disabled) return;

            const action = button.dataset.action;
            const value = button.dataset.value;

            this.handleButtonClick(action, value);
            this.addButtonFeedback(button);
        });

        // Touch feedback for all buttons
        buttonsContainer.addEventListener('touchstart', (e) => {
            const button = e.target.closest('.numpad-btn');
            if (button && !button.disabled) {
                button.classList.add('numpad-btn-touched');
            }
        });

        buttonsContainer.addEventListener('touchend', (e) => {
            const button = e.target.closest('.numpad-btn');
            if (button) {
                button.classList.remove('numpad-btn-touched');
            }
        });
    }

    handleButtonClick(action, value) {
        switch (action) {
            case 'number':
                this.addNumber(value);
                break;
            case 'decimal':
                this.addDecimal();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'clear':
                this.clear();
                break;
            case 'enter':
                this.enter();
                break;
        }

        this.updateDisplay();
        this.onInput(this.value, this.getNumericValue());
    }

    addNumber(digit) {
        if (this.value.length >= this.maxLength) return;
        
        // Remove leading zeros
        if (this.value === '0' && digit !== '0') {
            this.value = digit;
        } else if (this.value !== '0') {
            this.value += digit;
        }
    }

    addDecimal() {
        if (!this.allowDecimal) return;
        
        // Only one decimal point
        if (this.value.includes('.')) return;
        
        // If empty value, add 0.
        if (!this.value) {
            this.value = '0.';
        } else {
            this.value += '.';
        }
    }

    backspace() {
        if (this.value.length > 0) {
            this.value = this.value.slice(0, -1);
        }
        
        if (this.value === '') {
            this.value = '0';
        }
    }

    clear() {
        this.value = '';
        this.onClear();
    }

    enter() {
        this.onEnter(this.value, this.getNumericValue());
    }

    setValue(newValue) {
        this.value = String(newValue);
        this.updateDisplay();
    }

    getValue() {
        return this.value;
    }

    getNumericValue() {
        const num = parseFloat(this.value);
        return isNaN(num) ? 0 : num;
    }

    formatDisplayValue() {
        if (!this.value) return this.placeholder;
        
        const numValue = this.getNumericValue();
        if (numValue === 0 && this.value !== '0') {
            return this.value; // Show as is for incomplete input
        }
        
        return new Intl.NumberFormat('en-EU', {
            minimumFractionDigits: this.value.includes('.') ? 1 : 0,
            maximumFractionDigits: 2
        }).format(numValue);
    }

    updateDisplay() {
        const element = document.querySelector('.numpad-value');
        if (element) {
            element.innerHTML = `
                ${this.formatDisplayValue()}
                ${this.showCurrency ? `<span class="numpad-currency">${this.currency}</span>` : ''}
            `;
        }
    }

    addButtonFeedback(button) {
        button.classList.add('numpad-btn-clicked');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        setTimeout(() => {
            button.classList.remove('numpad-btn-clicked');
        }, 100);
    }

    reset() {
        this.value = '';
        this.updateDisplay();
    }

    static create(options = {}) {
        const numpad = new NumPad(options);
        const element = document.createElement('div');
        element.innerHTML = numpad.render();
        const numpadElement = element.firstElementChild;
        numpad.bindEvents(numpadElement);
        
        // Save reference to object for method access
        numpadElement._numpadInstance = numpad;
        
        return numpadElement;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NumPad;
}