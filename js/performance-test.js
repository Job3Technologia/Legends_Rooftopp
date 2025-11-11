/**
 * Performance Testing and Monitoring Script
 * Legends Rooftop Pub & Restaurant
 * 
 * This script measures and reports website performance metrics
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.thresholds = {
            FCP: 1800, // First Contentful Paint
            LCP: 2500, // Largest Contentful Paint
            FID: 100,  // First Input Delay
            CLS: 0.1,  // Cumulative Layout Shift
            TTI: 3800, // Time to Interactive
            TBT: 200   // Total Blocking Time
        };
        this.init();
    }

    init() {
        this.measureCoreWebVitals();
        this.measureResourceTiming();
        this.measureNavigationTiming();
        this.setupPerformanceObserver();
        this.logPerformanceMetrics();
    }

    measureCoreWebVitals() {
        // First Contentful Paint (FCP)
        this.measureFCP();
        
        // Largest Contentful Paint (LCP)
        this.measureLCP();
        
        // First Input Delay (FID)
        this.measureFID();
        
        // Cumulative Layout Shift (CLS)
        this.measureCLS();
        
        // Time to Interactive (TTI)
        this.measureTTI();
    }

    measureFCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.FCP = Math.round(entry.startTime);
                        this.reportMetric('FCP', this.metrics.FCP, this.thresholds.FCP);
                        observer.disconnect();
                        break;
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    measureLCP() {
        if ('PerformanceObserver' in window) {
            let lcpValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    if (entry.startTime > lcpValue) {
                        lcpValue = entry.startTime;
                        this.metrics.LCP = Math.round(lcpValue);
                    }
                }
                this.reportMetric('LCP', this.metrics.LCP, this.thresholds.LCP);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Report LCP when page is fully loaded
            window.addEventListener('load', () => {
                this.reportMetric('LCP', this.metrics.LCP, this.thresholds.LCP);
            });
        }
    }

    measureFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const fid = entry.processingStart - entry.startTime;
                    this.metrics.FID = Math.round(fid);
                    this.reportMetric('FID', this.metrics.FID, this.thresholds.FID);
                    observer.disconnect();
                    break;
                }
            });
            observer.observe({ entryTypes: ['first-input'] });
        }
    }

    measureCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.metrics.CLS = Math.round(clsValue * 1000) / 1000;
                this.reportMetric('CLS', this.metrics.CLS, this.thresholds.CLS);
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }

    measureTTI() {
        // Simplified TTI measurement
        if ('PerformanceObserver' in window) {
            let ttiValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    if (entry.entryType === 'longtask') {
                        ttiValue = entry.startTime + entry.duration;
                    }
                }
                this.metrics.TTI = Math.round(ttiValue || 5000);
                this.reportMetric('TTI', this.metrics.TTI, this.thresholds.TTI);
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    measureResourceTiming() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const resources = performance.getEntriesByType('resource');
            let totalSize = 0;
            let totalLoadTime = 0;
            
            resources.forEach(resource => {
                if (resource.transferSize) {
                    totalSize += resource.transferSize;
                }
                if (resource.duration) {
                    totalLoadTime += resource.duration;
                }
            });
            
            this.metrics.resourceCount = resources.length;
            this.metrics.totalResourceSize = Math.round(totalSize / 1024); // KB
            this.metrics.avgResourceLoadTime = Math.round(totalLoadTime / resources.length);
        }
    }

    measureNavigationTiming() {
        if ('performance' in window && 'timing' in performance) {
            const timing = performance.timing;
            const navigation = performance.navigation;
            
            this.metrics.navigationType = navigation.type;
            this.metrics.redirectCount = navigation.redirectCount;
            this.metrics.dnsLookup = timing.domainLookupEnd - timing.domainLookupStart;
            this.metrics.tcpConnection = timing.connectEnd - timing.connectStart;
            this.metrics.serverResponse = timing.responseEnd - timing.requestStart;
            this.metrics.domProcessing = timing.domComplete - timing.domLoading;
            this.metrics.totalLoadTime = timing.loadEventEnd - timing.navigationStart;
        }
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Monitor long tasks
            const longTaskObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                let totalBlockingTime = 0;
                
                entries.forEach(entry => {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        totalBlockingTime += entry.duration - 50;
                    }
                });
                
                this.metrics.TBT = Math.round(totalBlockingTime);
                this.reportMetric('TBT', this.metrics.TBT, this.thresholds.TBT);
            });
            
            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('Long task observation not supported');
            }
        }
    }

    reportMetric(name, value, threshold) {
        const status = value <= threshold ? 'PASS' : 'FAIL';
        const color = status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
        
        console.log(`%c${name}: ${value}ms (threshold: ${threshold}ms) - ${status}`, 
            `color: ${status === 'PASS' ? 'green' : 'red'}; font-weight: bold;`);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'web_vitals', {
                metric_name: name,
                metric_value: value,
                metric_status: status
            });
        }
    }

    logPerformanceMetrics() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                console.group('🚀 Performance Metrics - Legends Rooftop Pub & Restaurant');
                console.log('Core Web Vitals:', {
                    FCP: this.metrics.FCP,
                    LCP: this.metrics.LCP,
                    FID: this.metrics.FID,
                    CLS: this.metrics.CLS,
                    TTI: this.metrics.TTI,
                    TBT: this.metrics.TBT
                });
                
                console.log('Resource Metrics:', {
                    resourceCount: this.metrics.resourceCount,
                    totalResourceSize: this.metrics.totalResourceSize + 'KB',
                    avgResourceLoadTime: this.metrics.avgResourceLoadTime + 'ms'
                });
                
                console.log('Navigation Metrics:', {
                    navigationType: this.metrics.navigationType,
                    redirectCount: this.metrics.redirectCount,
                    dnsLookup: this.metrics.dnsLookup + 'ms',
                    tcpConnection: this.metrics.tcpConnection + 'ms',
                    serverResponse: this.metrics.serverResponse + 'ms',
                    domProcessing: this.metrics.domProcessing + 'ms',
                    totalLoadTime: this.metrics.totalLoadTime + 'ms'
                });
                
                this.generatePerformanceReport();
                console.groupEnd();
            }, 1000);
        });
    }

    generatePerformanceReport() {
        const scores = {
            FCP: this.calculateScore(this.metrics.FCP, this.thresholds.FCP),
            LCP: this.calculateScore(this.metrics.LCP, this.thresholds.LCP),
            FID: this.calculateScore(this.metrics.FID, this.thresholds.FID),
            CLS: this.calculateScore(this.metrics.CLS, this.thresholds.CLS),
            TTI: this.calculateScore(this.metrics.TTI, this.thresholds.TTI),
            TBT: this.calculateScore(this.metrics.TBT, this.thresholds.TBT)
        };
        
        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
        
        console.log('%c🏆 Performance Score: ' + Math.round(avgScore) + '/100', 
            'font-size: 16px; font-weight: bold; color: ' + this.getScoreColor(avgScore));
        
        if (avgScore < 90) {
            console.log('%c💡 Optimization Suggestions:', 'font-weight: bold; color: orange;');
            this.generateOptimizationSuggestions(scores);
        }
    }

    calculateScore(value, threshold) {
        if (value <= threshold) return 100;
        if (value <= threshold * 1.5) return 75;
        if (value <= threshold * 2) return 50;
        return 25;
    }

    getScoreColor(score) {
        if (score >= 90) return 'green';
        if (score >= 75) return 'orange';
        return 'red';
    }

    generateOptimizationSuggestions(scores) {
        const suggestions = [];
        
        if (scores.FCP < 90) {
            suggestions.push('🖼️ Optimize images and use next-gen formats (WebP)');
            suggestions.push('⚡ Minimize render-blocking resources');
            suggestions.push('🚀 Use a Content Delivery Network (CDN)');
        }
        
        if (scores.LCP < 90) {
            suggestions.push('🎯 Preload critical resources');
            suggestions.push('📦 Optimize server response time');
            suggestions.push('🖼️ Compress and optimize hero images');
        }
        
        if (scores.CLS < 90) {
            suggestions.push('📏 Set explicit dimensions for images and videos');
            suggestions.push('🔒 Reserve space for dynamic content');
            suggestions.push('⚡ Use font-display: swap for web fonts');
        }
        
        if (scores.TTI < 90) {
            suggestions.push('🧹 Reduce JavaScript execution time');
            suggestions.push('📦 Minimize main thread work');
            suggestions.push('⚡ Defer non-critical JavaScript');
        }
        
        suggestions.forEach(suggestion => console.log(suggestion));
    }
}

// Initialize performance monitoring
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PerformanceMonitor();
    });
} else {
    new PerformanceMonitor();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}