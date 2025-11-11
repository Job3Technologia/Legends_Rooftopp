// Gallery Page JavaScript

class GalleryManager {
    constructor() {
        this.currentFilter = 'all';
        this.currentImageIndex = 0;
        this.galleryItems = [];
        this.filteredItems = [];
        this.isLightboxOpen = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadGalleryItems();
        this.setupIntersectionObserver();
        this.setupKeyboardNavigation();
    }
    
    bindEvents() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterGallery(filter);
            });
        });
        
        // Gallery items
        document.addEventListener('click', (e) => {
            if (e.target.closest('.gallery-item')) {
                const item = e.target.closest('.gallery-item');
                const index = Array.from(this.filteredItems).indexOf(item);
                this.openLightbox(index);
            }
        });
        
        // Lightbox controls
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxPrev = document.querySelector('.lightbox-prev');
        const lightboxNext = document.querySelector('.lightbox-next');
        
        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => this.closeLightbox());
        }
        
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', () => this.navigateLightbox('prev'));
        }
        
        if (lightboxNext) {
            lightboxNext.addEventListener('click', () => this.navigateLightbox('next'));
        }
        
        // Lightbox thumbnails
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lightbox-thumbnail')) {
                const thumbnail = e.target.closest('.lightbox-thumbnail');
                const index = parseInt(thumbnail.dataset.index);
                this.showLightboxImage(index);
            }
        });
        
        // Close lightbox on background click
        const lightboxModal = document.querySelector('.lightbox-modal');
        if (lightboxModal) {
            lightboxModal.addEventListener('click', (e) => {
                if (e.target === lightboxModal) {
                    this.closeLightbox();
                }
            });
        }
        
        // Smooth scrolling for filter section
        const galleryFilters = document.querySelector('.gallery-filters');
        if (galleryFilters) {
            let lastScrollTop = 0;
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    galleryFilters.style.transform = 'translateY(-100%)';
                } else {
                    galleryFilters.style.transform = 'translateY(0)';
                }
                lastScrollTop = scrollTop;
            });
        }
    }
    
    loadGalleryItems() {
        this.galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        this.filteredItems = [...this.galleryItems];
        
        // Add lazy loading for images
        this.galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img && img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }
    
    filterGallery(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Filter items
        this.galleryItems.forEach(item => {
            const category = item.dataset.category;
            
            if (filter === 'all' || category === filter) {
                item.classList.remove('filtered-out');
                item.classList.add('filtered-in');
            } else {
                item.classList.remove('filtered-in');
                item.classList.add('filtered-out');
            }
        });
        
        // Update filtered items array
        this.filteredItems = this.galleryItems.filter(item => {
            const category = item.dataset.category;
            return filter === 'all' || category === filter;
        });
        
        // Trigger reflow for animation
        this.filteredItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animationDelay = `${index * 0.1}s`;
            }, index * 50);
        });
        
        // Update URL without page reload
        const url = new URL(window.location);
        if (filter !== 'all') {
            url.searchParams.set('category', filter);
        } else {
            url.searchParams.delete('category');
        }
        window.history.replaceState({}, '', url);
        
        // Track filter usage
        this.trackEvent('Gallery Filter', 'Filter Applied', filter);
    }
    
    openLightbox(index) {
        if (index < 0 || index >= this.filteredItems.length) return;
        
        this.currentImageIndex = index;
        this.isLightboxOpen = true;
        
        const lightboxModal = document.querySelector('.lightbox-modal');
        const lightboxModalContent = document.querySelector('.lightbox-content');
        
        if (lightboxModal && lightboxModalContent) {
            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            this.showLightboxImage(index);
            this.updateLightboxThumbnails();
            
            // Focus management
            lightboxModalContent.focus();
            
            // Track lightbox usage
            this.trackEvent('Gallery Lightbox', 'Lightbox Opened', `Image ${index + 1}`);
        }
    }
    
    closeLightbox() {
        this.isLightboxOpen = false;
        
        const lightboxModal = document.querySelector('.lightbox-modal');
        if (lightboxModal) {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Return focus to the gallery item
            if (this.filteredItems[this.currentImageIndex]) {
                this.filteredItems[this.currentImageIndex].focus();
            }
        }
    }
    
    navigateLightbox(direction) {
        if (!this.isLightboxOpen) return;
        
        let newIndex;
        if (direction === 'prev') {
            newIndex = this.currentImageIndex > 0 ? this.currentImageIndex - 1 : this.filteredItems.length - 1;
        } else {
            newIndex = this.currentImageIndex < this.filteredItems.length - 1 ? this.currentImageIndex + 1 : 0;
        }
        
        this.showLightboxImage(newIndex);
        this.updateLightboxThumbnails();
        
        // Track navigation
        this.trackEvent('Gallery Lightbox', `Navigation ${direction}`, `Image ${newIndex + 1}`);
    }
    
    showLightboxImage(index) {
        if (index < 0 || index >= this.filteredItems.length) return;
        
        this.currentImageIndex = index;
        
        const currentItem = this.filteredItems[index];
        const img = currentItem.querySelector('img');
        const title = currentItem.querySelector('.gallery-overlay-content h3')?.textContent || '';
        const description = currentItem.querySelector('.gallery-overlay-content p')?.textContent || '';
        
        const lightboxImage = document.querySelector('.lightbox-image-container img');
        const lightboxTitle = document.querySelector('.lightbox-caption h3');
        const lightboxDescription = document.querySelector('.lightbox-caption p');
        
        if (lightboxImage && img) {
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt;
        }
        
        if (lightboxTitle) {
            lightboxTitle.textContent = title;
        }
        
        if (lightboxDescription) {
            lightboxDescription.textContent = description;
        }
        
        // Update active thumbnail
        document.querySelectorAll('.lightbox-thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
    
    updateLightboxThumbnails() {
        const thumbnailsContainer = document.querySelector('.lightbox-thumbnails');
        if (!thumbnailsContainer) return;
        
        thumbnailsContainer.innerHTML = '';
        
        this.filteredItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'lightbox-thumbnail';
                thumbnail.dataset.index = index;
                thumbnail.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
                
                if (index === this.currentImageIndex) {
                    thumbnail.classList.add('active');
                }
                
                thumbnailsContainer.appendChild(thumbnail);
            }
        });
        
        // Scroll to active thumbnail
        setTimeout(() => {
            const activeThumbnail = thumbnailsContainer.querySelector('.lightbox-thumbnail.active');
            if (activeThumbnail) {
                activeThumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }
        }, 100);
    }
    
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img');
                    if (img && img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        this.galleryItems.forEach(item => {
            imageObserver.observe(item);
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isLightboxOpen) return;
            
            switch (e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigateLightbox('prev');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigateLightbox('next');
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.closeLightbox();
                    break;
            }
        });
    }
    
    // Utility methods
    trackEvent(category, action, label = '') {
        // Placeholder for analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        
        console.log(`Analytics: ${category} - ${action} - ${label}`);
    }
    
    // Public API methods
    getCurrentFilter() {
        return this.currentFilter;
    }
    
    getFilteredCount() {
        return this.filteredItems.length;
    }
    
    refreshGallery() {
        this.loadGalleryItems();
        this.filterGallery(this.currentFilter);
    }
    
    // Performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Accessibility features
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new GalleryManager();
    
    // Check for filter parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');
    
    if (categoryFilter) {
        setTimeout(() => {
            gallery.filterGallery(categoryFilter);
        }, 100);
    }
    
    // Expose gallery instance to global scope for debugging
    window.galleryManager = gallery;
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Gallery page loaded in ${loadTime}ms`);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    'name': 'gallery_load',
                    'value': loadTime
                });
            }
        });
    }
    
    // Error handling
    window.addEventListener('error', (e) => {
        console.error('Gallery error:', e.error);
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                'description': e.error.message,
                'fatal': false
            });
        }
    });
    
    // Service worker registration for offline support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed');
            });
    }
});

// Additional utility functions
function shareGalleryImage(imageSrc, title) {
    if (navigator.share) {
        navigator.share({
            title: title || 'Legends Rooftop Gallery',
            text: 'Check out this amazing image from Legends Rooftop Pub & Restaurant!',
            url: imageSrc
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(imageSrc).then(() => {
            alert('Image link copied to clipboard!');
        });
    }
}

function downloadGalleryImage(imageSrc, filename) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename || 'legends-gallery-image.jpg';
    link.click();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryManager;
}