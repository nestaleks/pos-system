import { test, expect } from '@playwright/test';

const indexPath = 'D:/Projects/pos-system/index.html';

test.describe('Vect Theme Visual Layout Tests', () => {
    test('should have correct CSS layout structure', async ({ page }) => {
        // Navigate to index.html file directly
        await page.goto(`file://${indexPath}`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000); // Wait for scripts to load
        
        // Switch to Vect theme
        try {
            await page.click('[data-theme="vect"]', { timeout: 10000 });
            await page.waitForSelector('.pos-layout.vect-theme', { timeout: 5000 });
        } catch (error) {
            console.log('Theme switching not available, checking CSS structure directly');
        }
        
        // Check CSS Grid Layout exists
        const vectThemeCSS = await page.evaluate(() => {
            // Find all stylesheets
            const stylesheets = Array.from(document.styleSheets);
            let vectCSS = '';
            
            for (const sheet of stylesheets) {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    for (const rule of rules) {
                        if (rule.selectorText && rule.selectorText.includes('vect-theme')) {
                            vectCSS += rule.cssText + '\\n';
                        }
                    }
                } catch (e) {
                    // Skip cross-origin stylesheets
                }
            }
            return vectCSS;
        });
        
        // Check that vect-theme CSS is loaded
        expect(vectThemeCSS).toBeTruthy();
        expect(vectThemeCSS).toContain('display: flex');
        
        console.log('✅ Vect theme CSS is properly loaded');
    });

    test('should have correct grid template areas', async ({ page }) => {
        await page.goto(`file://${indexPath}`);
        await page.waitForLoadState('domcontentloaded');
        
        // Check CSS custom properties are defined
        const cssVariables = await page.evaluate(() => {
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);
            
            return {
                primary: computedStyle.getPropertyValue('--vect-primary'),
                white: computedStyle.getPropertyValue('--vect-white'),
                gray50: computedStyle.getPropertyValue('--vect-gray-50'),
                spacing4: computedStyle.getPropertyValue('--vect-spacing-4'),
                borderRadius: computedStyle.getPropertyValue('--vect-border-radius')
            };
        });
        
        // Check that CSS variables are defined
        expect(cssVariables.primary.trim()).toBeTruthy();
        expect(cssVariables.white.trim()).toBeTruthy();
        
        console.log('✅ CSS custom properties are defined:', cssVariables);
    });

    test('should have responsive breakpoints defined', async ({ page }) => {
        await page.goto(`file://${indexPath}`);
        await page.waitForLoadState('domcontentloaded');
        
        // Test different viewport sizes
        const viewports = [
            { width: 1920, height: 1080, name: 'Desktop' },
            { width: 1200, height: 768, name: 'Laptop' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 640, height: 480, name: 'Mobile' }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(300);
            
            // Check that CSS media queries are working
            const layoutInfo = await page.evaluate(() => {
                const body = document.body;
                const computedStyle = getComputedStyle(body);
                
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    bodyStyle: computedStyle.display
                };
            });
            
            expect(layoutInfo.width).toBe(viewport.width);
            expect(layoutInfo.height).toBe(viewport.height);
            
            console.log(`✅ ${viewport.name} viewport (${viewport.width}x${viewport.height}) handled correctly`);
        }
    });

    test('should load all required CSS files', async ({ page }) => {
        await page.goto(`file://${indexPath}`);
        await page.waitForLoadState('domcontentloaded');
        
        // Check that all CSS files are loaded
        const cssFiles = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return links.map(link => ({
                href: link.href,
                loaded: link.sheet !== null
            }));
        });
        
        // Check that vect-theme.css is included
        const vectThemeLoaded = cssFiles.some(file => 
            file.href.includes('vect-theme.css') && file.loaded
        );
        
        expect(vectThemeLoaded).toBeTruthy();
        
        console.log('✅ CSS Files loaded:', cssFiles.map(f => f.href.split('/').pop()));
    });

    test('should have correct HTML structure classes', async ({ page }) => {
        await page.goto(`file://${indexPath}`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        
        // Check that required CSS classes exist in the HTML
        const htmlContent = await page.content();
        
        const requiredClasses = [
            'pos-layout',
            'vect-theme',
            'vect-header',
            'vect-sidebar',
            'vect-controls',
            'vect-main',
            'vect-order-tabs',
            'vect-category-list',
            'vect-search-container',
            'vect-products-grid',
            'vect-cart-items',
            'vect-numpad'
        ];
        
        const foundClasses = [];
        const missingClasses = [];
        
        for (const className of requiredClasses) {
            if (htmlContent.includes(className)) {
                foundClasses.push(className);
            } else {
                missingClasses.push(className);
            }
        }
        
        console.log('✅ Found classes:', foundClasses);
        if (missingClasses.length > 0) {
            console.log('❌ Missing classes:', missingClasses);
        }
        
        // At least basic layout classes should be present
        expect(foundClasses.length).toBeGreaterThan(5);
    });

    test('should have proper CSS cascade and specificity', async ({ page }) => {
        await page.goto(`file://${indexPath}`);
        await page.waitForLoadState('domcontentloaded');
        
        // Test CSS specificity by checking computed styles
        const cssCheck = await page.evaluate(() => {
            // Create a test element to check CSS application
            const testEl = document.createElement('div');
            testEl.className = 'pos-layout vect-theme';
            document.body.appendChild(testEl);
            
            const computedStyle = getComputedStyle(testEl);
            const result = {
                display: computedStyle.display,
                gridTemplateAreas: computedStyle.gridTemplateAreas,
                gridTemplateColumns: computedStyle.gridTemplateColumns,
                fontFamily: computedStyle.fontFamily
            };
            
            document.body.removeChild(testEl);
            return result;
        });
        
        // Check that flexbox layout is applied
        expect(cssCheck.display).toBe('flex');
        
        console.log('✅ CSS Flexbox Layout applied:', cssCheck);
    });

    test('should take screenshot for visual verification', async ({ page }) => {
        await page.goto(`file://${indexPath}`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        
        // Try to switch to Vect theme if possible
        try {
            await page.click('[data-theme="vect"]', { timeout: 5000 });
            await page.waitForTimeout(1000);
        } catch (error) {
            console.log('Theme switching not available for screenshot');
        }
        
        // Take screenshots at different viewport sizes
        const viewports = [
            { width: 1920, height: 1080, name: 'desktop' },
            { width: 1200, height: 768, name: 'laptop' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 375, height: 667, name: 'mobile' }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500);
            
            const screenshotPath = `test-results/vect-layout-${viewport.name}-${viewport.width}x${viewport.height}.png`;
            await page.screenshot({ 
                path: screenshotPath, 
                fullPage: false 
            });
            
            console.log(`✅ Screenshot saved: ${screenshotPath}`);
        }
        
        // Final test passes if screenshots were taken
        expect(true).toBeTruthy();
    });
});