class ReceiptView {
    constructor(receiptData, options = {}) {
        this.receiptData = receiptData;
        this.showHeader = options.showHeader !== false;
        this.showFooter = options.showFooter !== false;
        this.printable = options.printable !== false;
        this.className = options.className || '';
        this.businessInfo = options.businessInfo || this.getDefaultBusinessInfo();
    }

    render() {
        const classes = [
            'receipt-view',
            this.printable ? 'receipt-printable' : '',
            this.className
        ].filter(Boolean).join(' ');

        const headerHtml = this.showHeader ? this.renderHeader() : '';
        const footerHtml = this.showFooter ? this.renderFooter() : '';

        return `
            <div class="${classes}">
                ${headerHtml}
                <div class="receipt-content">
                    ${this.renderReceiptInfo()}
                    ${this.renderItemsList()}
                    ${this.renderTotals()}
                    ${this.renderPaymentInfo()}
                </div>
                ${footerHtml}
            </div>
        `;
    }

    renderHeader() {
        return `
            <div class="receipt-header">
                <div class="business-name">${this.businessInfo.name}</div>
                <div class="business-address">${this.businessInfo.address}</div>
                <div class="business-phone">${this.businessInfo.phone}</div>
                ${this.businessInfo.website ? `<div class="business-website">${this.businessInfo.website}</div>` : ''}
            </div>
        `;
    }

    renderReceiptInfo() {
        const date = new Date(this.receiptData.timestamp);
        const dateStr = date.toLocaleDateString('en-EU');
        const timeStr = date.toLocaleTimeString('en-EU');

        return `
            <div class="receipt-info">
                <div class="receipt-number">Receipt #${this.receiptData.receiptNumber}</div>
                <div class="receipt-datetime">
                    <span class="receipt-date">${dateStr}</span>
                    <span class="receipt-time">${timeStr}</span>
                </div>
                ${this.receiptData.cashier ? `<div class="receipt-cashier">Cashier: ${this.receiptData.cashier}</div>` : ''}
            </div>
        `;
    }

    renderItemsList() {
        if (!this.receiptData.items || this.receiptData.items.length === 0) {
            return '<div class="receipt-no-items">No items</div>';
        }

        const itemsHtml = this.receiptData.items.map(item => `
            <div class="receipt-item">
                <div class="item-line-1">
                    <span class="item-name">${item.name}</span>
                    <span class="item-total">${this.formatPrice(item.price * item.quantity)}</span>
                </div>
                <div class="item-line-2">
                    <span class="item-details">${item.quantity} × ${this.formatPrice(item.price)}</span>
                </div>
            </div>
        `).join('');

        return `
            <div class="receipt-items">
                <div class="receipt-items-header">ITEMS</div>
                ${itemsHtml}
            </div>
        `;
    }

    renderTotals() {
        const subtotal = this.receiptData.subtotal || 0;
        const tax = this.receiptData.tax || 0;
        const discount = this.receiptData.discount || 0;
        const total = this.receiptData.total || 0;

        return `
            <div class="receipt-totals">
                <div class="receipt-line">
                    <span class="label">Subtotal:</span>
                    <span class="value">${this.formatPrice(subtotal)}</span>
                </div>
                ${discount > 0 ? `
                    <div class="receipt-line discount">
                        <span class="label">Discount:</span>
                        <span class="value">-${this.formatPrice(discount)}</span>
                    </div>
                ` : ''}
                ${tax > 0 ? `
                    <div class="receipt-line">
                        <span class="label">VAT:</span>
                        <span class="value">${this.formatPrice(tax)}</span>
                    </div>
                ` : ''}
                <div class="receipt-line total">
                    <span class="label">TOTAL:</span>
                    <span class="value">${this.formatPrice(total)}</span>
                </div>
            </div>
        `;
    }

    renderPaymentInfo() {
        if (!this.receiptData.payment) return '';

        const payment = this.receiptData.payment;
        const change = (payment.received || 0) - (payment.amount || 0);

        return `
            <div class="receipt-payment">
                <div class="receipt-line">
                    <span class="label">Payment method:</span>
                    <span class="value">${this.getPaymentMethodName(payment.method)}</span>
                </div>
                ${payment.received ? `
                    <div class="receipt-line">
                        <span class="label">Received:</span>
                        <span class="value">${this.formatPrice(payment.received)}</span>
                    </div>
                ` : ''}
                ${change > 0 ? `
                    <div class="receipt-line">
                        <span class="label">Change:</span>
                        <span class="value">${this.formatPrice(change)}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderFooter() {
        return `
            <div class="receipt-footer">
                <div class="footer-message">Thank you for your purchase!</div>
                <div class="footer-info">Exchange and return within 14 days with receipt</div>
            </div>
        `;
    }

    getPaymentMethodName(method) {
        const methods = {
            'cash': 'Cash',
            'card': 'Bank Card',
            'contactless': 'Contactless Payment',
            'mobile': 'Mobile Payment'
        };
        return methods[method] || method;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    }

    getDefaultBusinessInfo() {
        return {
            name: 'POS System',
            address: '123 Example Street, City',
            phone: '+44 (0) 123 456 789',
            website: 'www.pos-system.com'
        };
    }

    print() {
        const printWindow = window.open('', '_blank');
        const printContent = this.render();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Receipt #${this.receiptData.receiptNumber}</title>
                <style>
                    ${this.getPrintStyles()}
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }

    getPrintStyles() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; }
            .receipt-view { width: 58mm; margin: 0 auto; }
            .receipt-header { text-align: center; margin-bottom: 10px; }
            .business-name { font-weight: bold; font-size: 14px; }
            .receipt-info { margin: 10px 0; border-bottom: 1px dashed #000; padding-bottom: 5px; }
            .receipt-items { margin: 10px 0; }
            .receipt-item { margin: 5px 0; }
            .item-line-1 { display: flex; justify-content: space-between; }
            .item-line-2 { font-size: 10px; color: #666; }
            .receipt-totals { border-top: 1px dashed #000; padding-top: 5px; }
            .receipt-line { display: flex; justify-content: space-between; margin: 2px 0; }
            .receipt-line.total { font-weight: bold; border-top: 1px solid #000; padding-top: 3px; }
            .receipt-footer { text-align: center; margin-top: 10px; font-size: 10px; }
        `;
    }

    static create(receiptData, options = {}) {
        const receipt = new ReceiptView(receiptData, options);
        const element = document.createElement('div');
        element.innerHTML = receipt.render();
        const receiptElement = element.firstElementChild;
        
        // Save reference to object for method access
        receiptElement._receiptInstance = receipt;
        
        return receiptElement;
    }

    static createPrintable(receiptData, options = {}) {
        const printableOptions = {
            ...options,
            printable: true,
            className: (options.className || '') + ' receipt-print-view'
        };
        
        return ReceiptView.create(receiptData, printableOptions);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReceiptView;
}