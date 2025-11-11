/**
 * Testimonials and Reviews Management System
 * Handles review display, filtering, sorting, and submission
 */

class TestimonialsManager {
    constructor() {
        this.reviews = [];
        this.filteredReviews = [];
        this.currentPage = 1;
        this.reviewsPerPage = 10;
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        
        this.init();
    }

    init() {
        try {
            this.loadSampleReviews();
            this.setupEventListeners();
            this.renderReviews();
            this.setupFormHandlers();
            this.initializeAnalytics();
            console.log('Testimonials system initialized successfully');
        } catch (error) {
            console.error('Error initializing testimonials system:', error);
            this.showNotification('Error loading reviews. Please refresh the page.', 'error');
        }
    }

    /**
     * Load sample reviews data
     */
    loadSampleReviews() {
        this.reviews = [
            {
                id: 1,
                name: "Thabo Mthembu",
                rating: 5,
                title: "Best Braai in Umlazi!",
                content: "The best braai in Umlazi! The rooftop atmosphere is amazing, and their kota sandwiches are to die for. The service is excellent and the staff is very friendly. Highly recommend!",
                date: "2024-01-15",
                visitDate: "2024-01-10",
                helpful: 24,
                verified: true,
                photos: ["review1.jpg", "review2.jpg"],
                recommend: true,
                response: {
                    author: "Legends Team",
                    content: "Thank you so much Thabo! We're thrilled you enjoyed your experience. We look forward to welcoming you back soon!",
                    date: "2024-01-16"
                }
            },
            {
                id: 2,
                name: "Nomusa Dlamini",
                rating: 5,
                title: "Perfect Family Gathering Spot",
                content: "Legends has become our go-to spot for family gatherings. The food is consistently excellent, and the service is top-notch! The kids love the atmosphere and we always feel welcome.",
                date: "2024-01-10",
                visitDate: "2024-01-08",
                helpful: 18,
                verified: true,
                photos: ["review3.jpg"],
                recommend: true
            },
            {
                id: 3,
                name: "Sipho Khumalo",
                rating: 4,
                title: "Great Food, Nice View",
                content: "Great food with a nice rooftop view. The braai platter was delicious and well-presented. Service was a bit slow during peak hours but the quality made up for it. Will definitely return!",
                date: "2024-01-05",
                visitDate: "2024-01-03",
                helpful: 15,
                verified: true,
                recommend: true
            },
            {
                id: 4,
                name: "Lindiwe Mthethwa",
                rating: 5,
                title: "Authentic Kasi Experience",
                content: "Authentic Kasi experience with a modern twist! The traditional dishes are prepared with love and the rooftop setting adds such a special touch. The music and ambiance are perfect.",
                date: "2023-12-28",
                visitDate: "2023-12-25",
                helpful: 22,
                verified: true,
                photos: ["review4.jpg", "review5.jpg"],
                recommend: true
            },
            {
                id: 5,
                name: "Bongani Zulu",
                rating: 5,
                title: "Excellent Service",
                content: "Excellent service and amazing food! The staff went above and beyond to make our anniversary dinner special. The kota platter and traditional drinks were outstanding.",
                date: "2023-12-20",
                visitDate: "2023-12-18",
                helpful: 19,
                verified: true,
                recommend: true,
                response: {
                    author: "Legends Team",
                    content: "Congratulations on your anniversary Bongani! We're honored to have been part of your special celebration. Thank you for choosing Legends!",
                    date: "2023-12-21"
                }
            },
            {
                id: 6,
                name: "Zanele Mncube",
                rating: 4,
                title: "Lovely Atmosphere",
                content: "Lovely atmosphere and great food. The rooftop setting is perfect for sundowners. The menu has good variety and the prices are reasonable for the quality offered.",
                date: "2023-12-15",
                visitDate: "2023-12-12",
                helpful: 12,
                verified: true,
                recommend: true
            },
            {
                id: 7,
                name: "Mandla Ngcobo",
                rating: 5,
                title: "Best Kota in Town",
                content: "Best kota in town! The portions are generous and the flavors are authentic. The rooftop view of Umlazi is breathtaking, especially during sunset. Highly recommended!",
                date: "2023-12-10",
                visitDate: "2023-12-08",
                helpful: 16,
                verified: true,
                photos: ["review6.jpg"],
                recommend: true
            },
            {
                id: 8,
                name: "Thandeka Mthembu",
                rating: 5,
                title: "Perfect for Special Occasions",
                content: "Perfect venue for special occasions! We celebrated my mother's birthday here and everything was exceptional. The staff arranged a special dessert and made her feel very special.",
                date: "2023-12-05",
                visitDate: "2023-12-03",
                helpful: 21,
                verified: true,
                recommend: true,
                response: {
                    author: "Legends Team",
                    content: "Thank you for celebrating with us Thandeka! We're so happy your mother had a wonderful birthday. It was our pleasure to make her day special!",
                    date: "2023-12-06"
                }
            },
            {
                id: 9,
                name: "Sibusiso Ndlovu",
                rating: 4,
                title: "Great Food Quality",
                content: "Great food quality and presentation. The braai meats are always perfectly cooked. The only minor issue is the parking can be challenging on busy nights, but the experience is worth it.",
                date: "2023-11-30",
                visitDate: "2023-11-28",
                helpful: 14,
                verified: true,
                recommend: true
            },
            {
                id: 10,
                name: "Nokuthula Shabalala",
                rating: 5,
                title: "Hidden Gem",
                content: "Hidden gem in Umlazi! The combination of traditional flavors with modern presentation is outstanding. The rooftop setting makes it feel like you're dining in the city center.",
                date: "2023-11-25",
                visitDate: "2023-11-22",
                helpful: 17,
                verified: true,
                photos: ["review7.jpg"],
                recommend: true
            }
        ];
        
        this.filteredReviews = [...this.reviews];
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter controls
        const ratingFilter = document.getElementById('ratingFilter');
        const sortReviews = document.getElementById('sortReviews');
        
        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.currentPage = 1;
                this.filterAndSortReviews();
                this.renderReviews();
            });
        }
        
        if (sortReviews) {
            sortReviews.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.filterAndSortReviews();
                this.renderReviews();
            });
        }

        // Modal handlers
        const reviewModalClose = document.getElementById('reviewModalClose');
        const reviewModalOk = document.getElementById('reviewModalOk');
        
        if (reviewModalClose) {
            reviewModalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (reviewModalOk) {
            reviewModalOk.addEventListener('click', () => this.closeModal());
        }

        // Close modal on outside click
        const modal = document.getElementById('reviewSuccessModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        const reviewForm = document.getElementById('reviewForm');
        const writeAnotherReview = document.getElementById('writeAnotherReview');
        
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => this.handleReviewSubmit(e));
        }
        
        if (writeAnotherReview) {
            writeAnotherReview.addEventListener('click', () => this.resetReviewForm());
        }
    }

    /**
     * Filter and sort reviews
     */
    filterAndSortReviews() {
        // Filter by rating
        let filtered = this.reviews;
        
        if (this.currentFilter !== 'all') {
            const minRating = parseInt(this.currentFilter);
            filtered = filtered.filter(review => review.rating >= minRating);
        }
        
        // Sort reviews
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.date) - new Date(a.date);
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'highest':
                    return b.rating - a.rating;
                case 'lowest':
                    return a.rating - b.rating;
                case 'helpful':
                    return b.helpful - a.helpful;
                default:
                    return 0;
            }
        });
        
        this.filteredReviews = filtered;
    }

    /**
     * Render reviews
     */
    renderReviews() {
        const container = document.getElementById('reviewsContainer');
        const pagination = document.getElementById('reviewsPagination');
        
        if (!container) return;
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.reviewsPerPage;
        const endIndex = startIndex + this.reviewsPerPage;
        const paginatedReviews = this.filteredReviews.slice(startIndex, endIndex);
        
        // Render reviews
        if (paginatedReviews.length === 0) {
            container.innerHTML = `
                <div class="no-reviews">
                    <i class="fas fa-comment-slash"></i>
                    <h3>No reviews found</h3>
                    <p>Be the first to share your experience!</p>
                </div>
            `;
        } else {
            container.innerHTML = paginatedReviews.map(review => this.createReviewCard(review)).join('');
        }
        
        // Render pagination
        this.renderPagination();
        
        // Update statistics
        this.updateStatistics();
    }

    /**
     * Create review card HTML
     */
    createReviewCard(review) {
        const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const ratingStars = this.generateRatingStars(review.rating);
        const reviewDate = new Date(review.date).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="review-card" data-review-id="${review.id}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${initials}</div>
                        <div class="reviewer-details">
                            <h4>${review.name}</h4>
                            <div class="review-meta">
                                <div class="review-date">${reviewDate}</div>
                                <div class="review-rating">${ratingStars}</div>
                            </div>
                        </div>
                    </div>
                    ${review.verified ? '<div class="review-verified"><i class="fas fa-check-circle"></i> Verified</div>' : ''}
                </div>
                <div class="review-content">
                    <h5>${review.title}</h5>
                    <p>${review.content}</p>
                    ${review.photos && review.photos.length > 0 ? `
                        <div class="review-photos">
                            ${review.photos.map(photo => `
                                <div class="review-photo">
                                    <img src="images/reviews/${photo}" alt="Review photo" loading="lazy">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="review-footer">
                    <div class="review-actions">
                        <button class="review-action" onclick="testimonialsManager.markHelpful(${review.id})">
                            <i class="fas fa-thumbs-up"></i>
                            Helpful (${review.helpful})
                        </button>
                        <button class="review-action" onclick="testimonialsManager.shareReview(${review.id})">
                            <i class="fas fa-share"></i>
                            Share
                        </button>
                    </div>
                    ${review.recommend ? '<div class="review-recommend"><i class="fas fa-heart"></i> Recommends</div>' : ''}
                </div>
                ${review.response ? `
                    <div class="review-response">
                        <div class="response-header">
                            <strong>${review.response.author}</strong>
                            <span>${new Date(review.response.date).toLocaleDateString('en-ZA')}</span>
                        </div>
                        <p>${review.response.content}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate rating stars HTML
     */
    generateRatingStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    /**
     * Render pagination
     */
    renderPagination() {
        const pagination = document.getElementById('reviewsPagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(this.filteredReviews.length / this.reviewsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="testimonialsManager.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="testimonialsManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="testimonialsManager.goToPage(${i})">${i}</button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
            paginationHTML += `<button class="pagination-btn" onclick="testimonialsManager.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="testimonialsManager.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        // Page info
        paginationHTML += `
            <span class="pagination-info">
                Page ${this.currentPage} of ${totalPages} (${this.filteredReviews.length} reviews)
            </span>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    /**
     * Go to specific page
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredReviews.length / this.reviewsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderReviews();
            this.scrollToTop();
        }
    }

    /**
     * Scroll to top of reviews
     */
    scrollToTop() {
        const container = document.getElementById('reviewsContainer');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Mark review as helpful
     */
    markHelpful(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            review.helpful++;
            this.filterAndSortReviews();
            this.renderReviews();
            
            // Track analytics
            this.trackEvent('review_helpful', { review_id: reviewId });
            
            // Show feedback
            this.showNotification('Thank you for your feedback!', 'success');
        }
    }

    /**
     * Share review
     */
    shareReview(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            const shareText = `Check out this review of Legends Rooftop by ${review.name}: "${review.title}" - ${review.rating}/5 stars!`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Legends Rooftop Review',
                    text: shareText,
                    url: window.location.href
                });
            } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareText).then(() => {
                    this.showNotification('Review link copied to clipboard!', 'success');
                });
            }
            
            this.trackEvent('review_share', { review_id: reviewId });
        }
    }

    /**
     * Handle review form submission
     */
    handleReviewSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const review = {
            id: Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            rating: parseInt(formData.get('rating')),
            title: formData.get('title'),
            content: formData.get('content'),
            visitDate: formData.get('visitDate'),
            date: new Date().toISOString().split('T')[0],
            helpful: 0,
            verified: false,
            recommend: formData.has('recommend'),
            newsletter: formData.has('newsletter')
        };
        
        // Validate form
        if (!this.validateReview(review)) {
            return;
        }
        
        // Add review to the beginning of the array
        this.reviews.unshift(review);
        this.filterAndSortReviews();
        
        // Show success
        this.showReviewSuccess();
        
        // Track analytics
        this.trackEvent('review_submitted', { rating: review.rating });
        
        // Send confirmation email (mock)
        this.sendConfirmationEmail(review);
    }

    /**
     * Validate review form
     */
    validateReview(review) {
        if (!review.name || review.name.length < 2) {
            this.showNotification('Please enter your name (minimum 2 characters)', 'error');
            return false;
        }
        
        if (!review.email || !this.isValidEmail(review.email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }
        
        if (!review.rating || review.rating < 1 || review.rating > 5) {
            this.showNotification('Please select a rating', 'error');
            return false;
        }
        
        if (!review.title || review.title.length < 5) {
            this.showNotification('Please enter a review title (minimum 5 characters)', 'error');
            return false;
        }
        
        if (!review.content || review.content.length < 20) {
            this.showNotification('Please write a detailed review (minimum 20 characters)', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show review success
     */
    showReviewSuccess() {
        const form = document.getElementById('writeReviewForm');
        const success = document.getElementById('reviewSuccess');
        const modal = document.getElementById('reviewSuccessModal');
        
        if (form && success) {
            form.style.display = 'none';
            success.style.display = 'block';
        }
        
        if (modal) {
            modal.style.display = 'block';
        }
        
        // Re-render reviews to include the new one
        this.renderReviews();
    }

    /**
     * Reset review form
     */
    resetReviewForm() {
        const form = document.getElementById('writeReviewForm');
        const success = document.getElementById('reviewSuccess');
        
        if (form && success) {
            form.reset();
            form.style.display = 'block';
            success.style.display = 'none';
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('reviewSuccessModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Send confirmation email (mock)
     */
    sendConfirmationEmail(review) {
        // Mock email sending
        console.log(`Confirmation email sent to ${review.email}`);
        
        // In a real implementation, this would make an API call to your backend
        // to send the confirmation email
    }

    /**
     * Update statistics
     */
    updateStatistics() {
        const totalReviews = this.reviews.length;
        const averageRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
        const recommendCount = this.reviews.filter(review => review.recommend).length;
        const recommendPercentage = Math.round((recommendCount / totalReviews) * 100);
        
        // Update DOM elements
        const stats = {
            averageRating: document.querySelector('.stat-content h3'),
            totalReviews: document.querySelectorAll('.stat-content h3')[1],
            recommendPercentage: document.querySelectorAll('.stat-content h3')[2]
        };
        
        if (stats.averageRating) stats.averageRating.textContent = averageRating.toFixed(1);
        if (stats.totalReviews) stats.totalReviews.textContent = totalReviews.toLocaleString();
        if (stats.recommendPercentage) stats.recommendPercentage.textContent = `${recommendPercentage}%`;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                }
                .notification-success { border-left: 4px solid #28a745; }
                .notification-error { border-left: 4px solid #dc3545; }
                .notification-info { border-left: 4px solid #17a2b8; }
                .notification-content { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
                .notification-close { background: none; border: none; cursor: pointer; color: #666; }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Initialize analytics
     */
    initializeAnalytics() {
        // Track page view
        this.trackEvent('testimonials_page_view');
        
        // Track time on page
        this.startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
            this.trackEvent('testimonials_time_spent', { duration: timeSpent });
        });
    }

    /**
     * Track analytics events
     */
    trackEvent(eventName, properties = {}) {
        // Mock analytics - in real implementation, use Google Analytics, Mixpanel, etc.
        console.log('Analytics Event:', eventName, properties);
        
        // Example Google Analytics 4 (if gtag is available)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
    }
}

// Initialize testimonials manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.testimonialsManager = new TestimonialsManager();
});