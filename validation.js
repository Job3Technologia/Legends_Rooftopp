/**
 * Website Validation Script
 * Tests key functionality and reports issues
 */

class WebsiteValidator {
    constructor() {
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
        this.init();
    }

    init() {
        console.log('🔍 Starting website validation...');
        this.validateHTMLStructure();
        this.validateCSSClasses();
        this.validateJavaScriptFunctions();
        this.validateSEOElements();
        this.validateAccessibility();
        this.validatePerformance();
        this.generateReport();
    }

    validateHTMLStructure() {
        // Check for essential HTML elements
        const essentialElements = [
            { selector: 'title', name: 'Page Title' },
            { selector: 'meta[name="description"]', name: 'Meta Description' },
            { selector: 'meta[name="viewport"]', name: 'Viewport Meta' },
            { selector: 'nav', name: 'Navigation' },
            { selector: 'main, body', name: 'Main Content' },
            { selector: 'footer', name: 'Footer' }
        ];

        essentialElements.forEach(element => {
            if (document.querySelector(element.selector)) {
                this.results.passed.push(`✅ ${element.name} found`);
            } else {
                this.results.failed.push(`❌ ${element.name} missing`);
            }
        });
    }

    validateCSSClasses() {
        // Check for essential CSS classes
        const essentialClasses = [
            'navbar', 'hero', 'features', 'menu', 'gallery',
            'btn', 'container', 'section-header', 'card'
        ];

        essentialClasses.forEach(className => {
            if (document.querySelector(`.${className}`)) {
                this.results.passed.push(`✅ CSS class .${className} found`);
            } else {
                this.results.warnings.push(`⚠️ CSS class .${className} not found`);
            }
        });
    }

    validateJavaScriptFunctions() {
        // Check for essential JavaScript functions
        const essentialFunctions = [
            'init', 'setupEventListeners', 'lazyLoadImages',
            'handleImageError', 'showLoadingState', 'hideLoadingState'
        ];

        essentialFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                this.results.passed.push(`✅ JavaScript function ${funcName} exists`);
            } else {
                this.results.failed.push(`❌ JavaScript function ${funcName} missing`);
            }
        });
    }

    validateSEOElements() {
        // Check SEO elements
        const seoChecks = [
            {
                test: () => document.title.length > 10 && document.title.length < 70,
                name: 'Title Length',
                message: 'Title should be between 10-70 characters'
            },
            {
                test: () => {
                    const desc = document.querySelector('meta[name="description"]');
                    return desc && desc.content.length > 50 && desc.content.length < 160;
                },
                name: 'Meta Description Length',
                message: 'Meta description should be between 50-160 characters'
            },
            {
                test: () => document.querySelectorAll('h1').length === 1,
                name: 'Single H1 Tag',
                message: 'Should have exactly one H1 tag'
            },
            {
                test: () => document.querySelector('meta[name="viewport"]')?.content.includes('width=device-width'),
                name: 'Mobile Viewport',
                message: 'Should have mobile viewport meta tag'
            }
        ];

        seoChecks.forEach(check => {
            if (check.test()) {
                this.results.passed.push(`✅ SEO: ${check.name}`);
            } else {
                this.results.failed.push(`❌ SEO: ${check.name} - ${check.message}`);
            }
        });
    }

    validateAccessibility() {
        // Basic accessibility checks
        const a11yChecks = [
            {
                test: () => document.querySelectorAll('img[alt]').length > 0,
                name: 'Image Alt Text',
                message: 'Images should have alt attributes'
            },
            {
                test: () => document.querySelectorAll('a[href]').length > 0,
                name: 'Link Href Attributes',
                message: 'Links should have href attributes'
            },
            {
                test: () => document.documentElement.lang,
                name: 'HTML Lang Attribute',
                message: 'HTML element should have lang attribute'
            },
            {
                test: () => document.querySelectorAll('button, a').length > 0,
                name: 'Interactive Elements',
                message: 'Should have interactive elements'
            }
        ];

        a11yChecks.forEach(check => {
            if (check.test()) {
                this.results.passed.push(`✅ Accessibility: ${check.name}`);
            } else {
                this.results.warnings.push(`⚠️ Accessibility: ${check.name} - ${check.message}`);
            }
        });
    }

    validatePerformance() {
        // Performance validation
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                if (loadTime < 3000) {
                    this.results.passed.push(`✅ Performance: Fast load time (${loadTime}ms)`);
                } else {
                    this.results.warnings.push(`⚠️ Performance: Slow load time (${loadTime}ms)`);
                }
            }
        }

        // Check for performance monitoring
        if (document.querySelector('script[src*="performance"]')) {
            this.results.passed.push('✅ Performance monitoring script loaded');
        }
    }

    generateReport() {
        console.group('🚀 Legends Website Validation Report');
        
        console.log(`\n📊 Summary:`);
        console.log(`✅ Passed: ${this.results.passed.length}`);
        console.log(`❌ Failed: ${this.results.failed.length}`);
        console.log(`⚠️ Warnings: ${this.results.warnings.length}`);

        if (this.results.passed.length > 0) {
            console.log(`\n✅ Passed Tests:`);
            this.results.passed.forEach(result => console.log(result));
        }

        if (this.results.failed.length > 0) {
            console.log(`\n❌ Failed Tests:`);
            this.results.failed.forEach(result => console.log(result));
        }

        if (this.results.warnings.length > 0) {
            console.log(`\n⚠️ Warnings:`);
            this.results.warnings.forEach(result => console.log(result));
        }

        const score = Math.round((this.results.passed.length / 
            (this.results.passed.length + this.results.failed.length)) * 100);
        
        console.log(`\n🏆 Overall Score: ${score}%`);
        
        if (score >= 90) {
            console.log('%c🎉 Excellent! Website is ready for production.', 'color: green; font-weight: bold;');
        } else if (score >= 75) {
            console.log('%c👍 Good! Website needs minor improvements.', 'color: orange; font-weight: bold;');
        } else {
            console.log('%c⚠️ Needs Improvement! Address the failed tests.', 'color: red; font-weight: bold;');
        }

        console.groupEnd();
    }
}

// Initialize validation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WebsiteValidator();
    });
} else {
    new WebsiteValidator();
}