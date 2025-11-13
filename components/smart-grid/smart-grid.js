class SmartGrid {
    constructor(options = {}) {
        this.items = options.items || [];
        this.columns = options.columns || 'auto'; // auto, 2, 3, 4, 5, 6
        this.gap = options.gap || 'medium'; // small, medium, large
        this.responsive = options.responsive !== false;
        this.className = options.className || '';
        this.onItemClick = options.onItemClick || (() => {});
    }

    render() {
        const gapClasses = {
            small: 'grid-gap-small',
            medium: 'grid-gap-medium',
            large: 'grid-gap-large'
        };

        const columnClasses = {
            auto: 'grid-cols-auto',
            2: 'grid-cols-2',
            3: 'grid-cols-3',
            4: 'grid-cols-4',
            5: 'grid-cols-5',
            6: 'grid-cols-6'
        };

        const classes = [
            'smart-grid',
            columnClasses[this.columns],
            gapClasses[this.gap],
            this.responsive ? 'grid-responsive' : '',
            this.className
        ].filter(Boolean).join(' ');

        const itemsHtml = this.items.map(item => this.renderGridItem(item)).join('');

        return `
            <div class="${classes}">
                ${itemsHtml}
            </div>
        `;
    }

    renderGridItem(item) {
        const iconHtml = item.icon ? `<div class="grid-item-icon">${item.icon}</div>` : '';
        const badgeHtml = item.badge ? `<div class="grid-item-badge">${item.badge}</div>` : '';
        
        const sizeClass = item.size ? `grid-item-${item.size}` : '';
        const variantClass = item.variant ? `grid-item-${item.variant}` : '';
        
        const classes = [
            'grid-item',
            'touch-button',
            sizeClass,
            variantClass,
            item.className || ''
        ].filter(Boolean).join(' ');

        return `
            <div 
                class="${classes}"
                data-item-id="${item.id || ''}"
                data-item-action="${item.action || ''}"
            >
                ${badgeHtml}
                ${iconHtml}
                <div class="grid-item-content">
                    <div class="grid-item-title">${item.title || ''}</div>
                    <div class="grid-item-subtitle">${item.subtitle || ''}</div>
                </div>
            </div>
        `;
    }

    bindEvents(element) {
        if (!element) return;

        // Event delegation for grid items
        element.addEventListener('click', (e) => {
            const gridItem = e.target.closest('.grid-item');
            if (!gridItem) return;

            const itemId = gridItem.dataset.itemId;
            const action = gridItem.dataset.itemAction;
            const item = this.items.find(item => item.id === itemId);

            if (item && item.onClick) {
                item.onClick(item, e);
            } else if (action) {
                this.handleAction(action, item, e);
            }

            this.onItemClick(item || { id: itemId, action }, e);
            this.addClickFeedback(gridItem);
        });

        // Touch feedback
        element.addEventListener('touchstart', (e) => {
            const gridItem = e.target.closest('.grid-item');
            if (gridItem) {
                gridItem.classList.add('grid-item-touched');
            }
        });

        element.addEventListener('touchend', (e) => {
            const gridItem = e.target.closest('.grid-item');
            if (gridItem) {
                gridItem.classList.remove('grid-item-touched');
            }
        });
    }

    handleAction(action, item, event) {
        const actionEvent = new CustomEvent(`pos:grid:${action}`, {
            detail: { item, originalEvent: event },
            bubbles: true
        });
        document.dispatchEvent(actionEvent);
    }

    addClickFeedback(element) {
        element.classList.add('grid-item-clicked');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        setTimeout(() => {
            element.classList.remove('grid-item-clicked');
        }, 150);
    }

    updateItems(newItems) {
        this.items = newItems;
        return this.render();
    }

    addItem(item) {
        this.items.push(item);
        return this.render();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        return this.render();
    }

    updateItem(itemId, updates) {
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.items[itemIndex] = { ...this.items[itemIndex], ...updates };
        }
        return this.render();
    }

    static create(options = {}) {
        const grid = new SmartGrid(options);
        const element = document.createElement('div');
        element.innerHTML = grid.render();
        const gridElement = element.firstElementChild;
        grid.bindEvents(gridElement);
        return gridElement;
    }

    static createHomeGrid(options = {}) {
        const defaultItems = [
            {
                id: 'products',
                title: 'Products',
                subtitle: 'Product Catalog',
                icon: '🛍️',
                action: 'navigate',
                variant: 'primary',
                size: 'large'
            },
            {
                id: 'cart',
                title: 'Cart',
                subtitle: 'Current Order',
                icon: '🛒',
                action: 'navigate',
                variant: 'secondary',
                badge: '0'
            },
            {
                id: 'payment',
                title: 'Payment',
                subtitle: 'Customer Payment',
                icon: '💳',
                action: 'navigate',
                variant: 'success'
            },
            {
                id: 'reports',
                title: 'Reports',
                subtitle: 'Sales Statistics',
                icon: '📊',
                action: 'navigate',
                variant: 'info'
            },
            {
                id: 'settings',
                title: 'Settings',
                subtitle: 'POS Configuration',
                icon: '⚙️',
                action: 'navigate',
                variant: 'secondary'
            },
            {
                id: 'help',
                title: 'Help',
                subtitle: 'User Guide',
                icon: '❓',
                action: 'navigate',
                variant: 'secondary'
            }
        ];

        const gridOptions = {
            items: defaultItems,
            columns: 'auto',
            gap: 'medium',
            responsive: true,
            className: 'home-grid',
            ...options
        };

        return SmartGrid.create(gridOptions);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartGrid;
}