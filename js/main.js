// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const backToTop = document.getElementById('backToTop');
const orderForm = document.getElementById('orderForm');
const orderModal = document.getElementById('orderModal');
const modalClose = document.getElementById('modal-close');
const modalOk = document.getElementById('modal-ok');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// ===== Safe DOM Element Access =====
function safeGetElement(id) {
    return document.getElementById(id);
}

function elementExists(element) {
    return element !== null;
}

// ===== State Management =====
let currentSlide = 0;
let currentTestimonial = 0;
let currentGalleryImage = 0;
let galleryImages = [];

// ===== Navigation Functions =====
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}

function handleNavScroll() {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
        backToTop.classList.add('visible');
    } else {
        navbar.classList.remove('scrolled');
        backToTop.classList.remove('visible');
    }
}

function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== Hero Slideshow Functions =====
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// ===== Testimonial Slider Functions =====
function initTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial');
    const testimonialButtons = document.querySelectorAll('.testimonial-btn');
    
    if (testimonials.length === 0) return;
    
    testimonialButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            showTestimonial(index);
        });
    });
    
    // Auto-rotate testimonials
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 6000);
}

function showTestimonial(index) {
    const testimonials = document.querySelectorAll('.testimonial');
    const testimonialButtons = document.querySelectorAll('.testimonial-btn');
    
    testimonials.forEach(testimonial => testimonial.classList.remove('active'));
    testimonialButtons.forEach(button => button.classList.remove('active'));
    
    testimonials[index].classList.add('active');
    testimonialButtons[index].classList.add('active');
    
    currentTestimonial = index;
}

// ===== Gallery Functions =====
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentGalleryImage = index;
            openLightbox(index);
        });
        
        // Store image data
        const img = item.querySelector('img');
        if (img) {
            galleryImages.push({
                src: img.dataset.full || img.src,
                alt: img.alt
            });
        }
    });
}

function openLightbox(index) {
    if (galleryImages.length === 0) return;
    
    const image = galleryImages[index];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    currentGalleryImage = index;
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    if (galleryImages.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
        newIndex = (currentGalleryImage + 1) % galleryImages.length;
    } else {
        newIndex = (currentGalleryImage - 1 + galleryImages.length) % galleryImages.length;
    }
    
    openLightbox(newIndex);
}

// ===== Enhanced Order System with Phone Confirmation =====
class OrderManager {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('legendsOrders') || '[]');
        this.currentOrder = null;
        this.confirmationCode = null;
        this.smsProvider = 'mock'; // 'mock' for demo, 'twilio' for production
        this.orderTimeout = null;
        this.maxRetries = 3;
        this.retryCount = 0;
        
        this.init();
    }
    
    init() {
        this.setupOrderForm();
        this.loadPendingOrders();
        this.setupPhoneValidation();
    }
    
    setupOrderForm() {
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        }
    }
    
    setupPhoneValidation() {
        const phoneInput = document.querySelector('input[name="customerPhone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.validatePhoneNumber(e.target));
            phoneInput.addEventListener('blur', (e) => this.formatPhoneNumber(e.target));
        }
    }
    
    validatePhoneNumber(input) {
        const phone = input.value.replace(/\D/g, '');
        const isValid = phone.length >= 10 && phone.length <= 11;
        
        input.setCustomValidity(isValid ? '' : 'Please enter a valid South African phone number');
        input.classList.toggle('valid', isValid);
        input.classList.toggle('invalid', !isValid);
        
        return isValid;
    }
    
    formatPhoneNumber(input) {
        let phone = input.value.replace(/\D/g, '');
        
        if (phone.length === 10) {
            phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (phone.length === 11) {
            phone = phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
        }
        
        input.value = phone;
    }
    
    generateConfirmationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    generateOrderId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 4);
        return `LEG-${timestamp}-${random}`.toUpperCase();
    }
    
    async sendSMS(to, message) {
        // Mock SMS service for demo
        if (this.smsProvider === 'mock') {
            console.log(`SMS to ${to}: ${message}`);
            
            // Simulate SMS delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Store in localStorage for demo purposes
            const smsHistory = JSON.parse(localStorage.getItem('legendsSMS') || '[]');
            smsHistory.push({
                to,
                message,
                timestamp: new Date().toISOString(),
                status: 'sent'
            });
            localStorage.setItem('legendsSMS', JSON.stringify(smsHistory));
            
            return { success: true, messageId: `mock-${Date.now()}` };
        }
        
        // Production SMS service (Twilio)
        if (this.smsProvider === 'twilio') {
            try {
                const response = await fetch('/api/send-sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to, message })
                });
                
                return await response.json();
            } catch (error) {
                console.error('SMS sending failed:', error);
                return { success: false, error: error.message };
            }
        }
    }
    
    async handleOrderSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const orderData = Object.fromEntries(formData);
        
        // Enhanced validation
        if (!this.validateOrderForm(orderData)) {
            return;
        }
        
        // Create order object
        this.currentOrder = {
            id: this.generateOrderId(),
            customerName: orderData.customerName.trim(),
            customerPhone: orderData.customerPhone.replace(/\D/g, ''),
            orderItems: orderData.orderItems.trim(),
            orderType: orderData.orderType,
            specialInstructions: orderData.specialInstructions?.trim() || '',
            timestamp: new Date().toISOString(),
            status: 'pending',
            confirmationCode: this.generateConfirmationCode(),
            retryCount: 0,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };
        
        // Show loading state
        this.showOrderLoadingState();
        
        try {
            // Send confirmation SMS
            const smsResult = await this.sendOrderConfirmation();
            
            if (smsResult.success) {
                this.showConfirmationDialog();
                this.startConfirmationTimer();
            } else {
                this.showError('Failed to send confirmation SMS. Please try again.');
            }
        } catch (error) {
            console.error('Order submission error:', error);
            this.showError('An error occurred. Please try again.');
        }
    }
    
    validateOrderForm(data) {
        const errors = [];
        
        // Name validation
        if (!data.customerName || data.customerName.trim().length < 2) {
            errors.push('Please enter your full name (at least 2 characters)');
        }
        
        // Phone validation
        const phone = data.customerPhone.replace(/\D/g, '');
        if (phone.length < 10 || phone.length > 11) {
            errors.push('Please enter a valid South African phone number');
        }
        
        // Order items validation
        if (!data.orderItems || data.orderItems.trim().length < 5) {
            errors.push('Please describe your order (at least 5 characters)');
        }
        
        // Order type validation
        if (!data.orderType) {
            errors.push('Please select order type');
        }
        
        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        }
        
        return true;
    }
    
    async sendOrderConfirmation() {
        const message = `🍖 Legends Rooftop Order Confirmation\n\nHi ${this.currentOrder.customerName}!\n\nYour order #${this.currentOrder.id} has been received.\n\nConfirmation Code: ${this.currentOrder.confirmationCode}\n\nPlease reply with this code to confirm your order.\n\nOrder expires in 15 minutes.\n\nCall us: 031 123 4567`;
        
        return await this.sendSMS(this.currentOrder.customerPhone, message);
    }
    
    showConfirmationDialog() {
        const modalContent = document.getElementById('orderSummary');
        modalContent.innerHTML = `
            <div class="confirmation-dialog">
                <div class="confirmation-header">
                    <i class="fas fa-sms"></i>
                    <h3>Confirm Your Order</h3>
                    <p>We've sent a confirmation code to ${this.formatPhoneDisplay(this.currentOrder.customerPhone)}</p>
                </div>
                
                <div class="confirmation-form">
                    <div class="form-group">
                        <label for="confirmationCode">Enter Confirmation Code:</label>
                        <input type="text" id="confirmationCode" name="confirmationCode" 
                               placeholder="123456" maxlength="6" pattern="[0-9]{6}" required>
                        <div class="confirmation-timer">
                            <i class="fas fa-clock"></i>
                            <span id="timerDisplay">15:00</span>
                        </div>
                    </div>
                    
                    <div class="confirmation-actions">
                        <button type="button" class="btn btn-primary" id="confirmOrderBtn">
                            <i class="fas fa-check"></i> Confirm Order
                        </button>
                        <button type="button" class="btn btn-secondary" id="resendCodeBtn">
                            <i class="fas fa-redo"></i> Resend Code
                        </button>
                        <button type="button" class="btn btn-danger" id="cancelOrderBtn">
                            <i class="fas fa-times"></i> Cancel Order
                        </button>
                    </div>
                </div>
                
                <div class="order-summary-preview">
                    <h4>Order Summary:</h4>
                    <p><strong>Name:</strong> ${this.currentOrder.customerName}</p>
                    <p><strong>Phone:</strong> ${this.formatPhoneDisplay(this.currentOrder.customerPhone)}</p>
                    <p><strong>Type:</strong> ${this.currentOrder.orderType}</p>
                    <p><strong>Items:</strong></p>
                    <div class="order-items-preview">${this.currentOrder.orderItems}</div>
                </div>
                
                <div class="confirmation-help">
                    <p><i class="fas fa-info-circle"></i> Didn't receive the code? Check your SMS or call us at <strong>031 123 4567</strong></p>
                </div>
            </div>
        `;
        
        document.getElementById('orderModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Bind confirmation events
        this.bindConfirmationEvents();
    }
    
    bindConfirmationEvents() {
        const confirmBtn = document.getElementById('confirmOrderBtn');
        const resendBtn = document.getElementById('resendCodeBtn');
        const cancelBtn = document.getElementById('cancelOrderBtn');
        const codeInput = document.getElementById('confirmationCode');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmOrder());
        }
        
        if (resendBtn) {
            resendBtn.addEventListener('click', () => this.resendConfirmationCode());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelOrder());
        }
        
        if (codeInput) {
            codeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                if (e.target.value.length === 6) {
                    this.confirmOrder();
                }
            });
        }
    }
    
    startConfirmationTimer() {
        const expiresAt = new Date(this.currentOrder.expiresAt);
        const timerDisplay = document.getElementById('timerDisplay');
        
        this.orderTimeout = setInterval(() => {
            const now = new Date();
            const timeLeft = expiresAt - now;
            
            if (timeLeft <= 0) {
                this.handleOrderTimeout();
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            if (timerDisplay) {
                timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    async confirmOrder() {
        const codeInput = document.getElementById('confirmationCode');
        const enteredCode = codeInput.value.trim();
        
        if (enteredCode.length !== 6) {
            this.showError('Please enter a 6-digit confirmation code');
            return;
        }
        
        if (enteredCode !== this.currentOrder.confirmationCode) {
            this.showError('Invalid confirmation code. Please try again.');
            codeInput.value = '';
            codeInput.focus();
            return;
        }
        
        // Code is correct - process order
        this.currentOrder.status = 'confirmed';
        this.currentOrder.confirmedAt = new Date().toISOString();
        
        // Save order
        this.saveOrder(this.currentOrder);
        
        // Clear timeout
        if (this.orderTimeout) {
            clearInterval(this.orderTimeout);
        }
        
        // Send confirmation message
        await this.sendOrderConfirmedMessage();
        
        // Show success message
        this.showOrderSuccess();
        
        // Reset form
        document.getElementById('orderForm').reset();
    }
    
    async resendConfirmationCode() {
        if (this.currentOrder.retryCount >= this.maxRetries) {
            this.showError('Maximum retry attempts reached. Please place a new order.');
            return;
        }
        
        this.currentOrder.retryCount++;
        this.currentOrder.confirmationCode = this.generateConfirmationCode();
        
        try {
            const smsResult = await this.sendOrderConfirmation();
            
            if (smsResult.success) {
                this.showSuccess('Confirmation code resent successfully!');
                
                // Reset timer
                this.currentOrder.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                
                // Clear existing timer and restart
                if (this.orderTimeout) {
                    clearInterval(this.orderTimeout);
                }
                this.startConfirmationTimer();
            } else {
                this.showError('Failed to resend confirmation code.');
            }
        } catch (error) {
            this.showError('Error resending confirmation code.');
        }
    }
    
    cancelOrder() {
        if (confirm('Are you sure you want to cancel this order?')) {
            this.currentOrder.status = 'cancelled';
            this.currentOrder.cancelledAt = new Date().toISOString();
            
            // Clear timeout
            if (this.orderTimeout) {
                clearInterval(this.orderTimeout);
            }
            
            // Close modal
            document.getElementById('orderModal').classList.remove('active');
            document.body.style.overflow = '';
            
            this.showInfo('Order cancelled successfully.');
            this.currentOrder = null;
        }
    }
    
    handleOrderTimeout() {
        if (this.orderTimeout) {
            clearInterval(this.orderTimeout);
        }
        
        this.currentOrder.status = 'expired';
        this.currentOrder.expiredAt = new Date().toISOString();
        
        this.showError('Order confirmation timed out. Please place a new order.');
        
        // Close modal
        document.getElementById('orderModal').classList.remove('active');
        document.body.style.overflow = '';
        
        this.currentOrder = null;
    }
    
    async sendOrderConfirmedMessage() {
        const message = `✅ Order Confirmed!\n\nHi ${this.currentOrder.customerName},\n\nYour order #${this.currentOrder.id} has been confirmed and is being prepared.\n\nEstimated time: 30-45 minutes\n\nWe'll notify you when it's ready!\n\nCall us: 031 123 4567`;
        
        await this.sendSMS(this.currentOrder.customerPhone, message);
    }
    
    saveOrder(order) {
        this.orders.push(order);
        localStorage.setItem('legendsOrders', JSON.stringify(this.orders));
        
        // Track order
        this.trackEvent('order_confirmed', {
            order_id: order.id,
            order_type: order.orderType,
            customer_name: order.customerName,
            phone: order.customerPhone
        });
    }
    
    loadPendingOrders() {
        const now = new Date();
        const validOrders = this.orders.filter(order => {
            const expiresAt = new Date(order.expiresAt);
            return order.status === 'confirmed' && expiresAt > now;
        });
        
        if (validOrders.length > 0) {
            console.log(`Found ${validOrders.length} active orders`);
        }
    }
    
    formatPhoneDisplay(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) {
            return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    }
    
    showOrderLoadingState() {
        const modalContent = document.getElementById('orderSummary');
        modalContent.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <h3>Sending Confirmation...</h3>
                <p>Please wait while we send your confirmation code.</p>
            </div>
        `;
        
        document.getElementById('orderModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    showOrderSuccess() {
        const modalContent = document.getElementById('orderSummary');
        modalContent.innerHTML = `
            <div class="success-state">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Order Confirmed!</h3>
                <p>Your order #${this.currentOrder.id} has been confirmed.</p>
                <p>We'll prepare your food and notify you when it's ready.</p>
                <div class="success-actions">
                    <button type="button" class="btn btn-primary" onclick="orderManager.closeOrderModal()">
                        <i class="fas fa-check"></i> Great!
                    </button>
                </div>
            </div>
        `;
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            this.closeOrderModal();
        }, 5000);
    }
    
    closeOrderModal() {
        document.getElementById('orderModal').classList.remove('active');
        document.body.style.overflow = '';
        this.currentOrder = null;
    }
    
    showValidationErrors(errors) {
        const errorHtml = errors.map(error => `<li>${error}</li>`).join('');
        
        const modalContent = document.getElementById('orderSummary');
        modalContent.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Validation Errors</h3>
                <ul class="error-list">${errorHtml}</ul>
                <div class="error-actions">
                    <button type="button" class="btn btn-primary" onclick="orderManager.closeOrderModal()">
                        <i class="fas fa-edit"></i> Fix Errors
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('orderModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showInfo(message) {
        this.showNotification(message, 'info');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    trackEvent(eventName, properties = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        console.log('Event tracked:', eventName, properties);
    }
    
    // Public API methods
    getOrderHistory() {
        return this.orders;
    }
    
    getActiveOrders() {
        const now = new Date();
        return this.orders.filter(order => {
            const expiresAt = new Date(order.expiresAt);
            return order.status === 'confirmed' && expiresAt > now;
        });
    }
    
    cancelOrderById(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order && order.status === 'confirmed') {
            order.status = 'cancelled';
            order.cancelledAt = new Date().toISOString();
            localStorage.setItem('legendsOrders', JSON.stringify(this.orders));
            return true;
        }
        return false;
    }
}

// Initialize Order Manager
let orderManager;

// Legacy function for backward compatibility
function handleOrderSubmit(event) {
    if (!orderManager) {
        orderManager = new OrderManager();
    }
    return orderManager.handleOrderSubmit(event);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    orderManager = new OrderManager();
}

function validateOrderForm(data) {
    const requiredFields = ['customerName', 'customerPhone', 'orderItems', 'orderType'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return false;
        }
    }
    
    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
    if (!phoneRegex.test(data.customerPhone)) {
        alert('Please enter a valid phone number.');
        return false;
    }
    
    return true;
}

function showOrderConfirmation(orderData) {
    const orderSummary = document.getElementById('orderSummary');
    
    orderSummary.innerHTML = `
        <div class="order-details">
            <h5>Order Details:</h5>
            <p><strong>Name:</strong> ${orderData.customerName}</p>
            <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
            <p><strong>Order Type:</strong> ${orderData.orderType.charAt(0).toUpperCase() + orderData.orderType.slice(1)}</p>
            <p><strong>Items:</strong></p>
            <div class="order-items">${orderData.orderItems.replace(/\n/g, '<br>')}</div>
            ${orderData.specialInstructions ? `<p><strong>Special Instructions:</strong> ${orderData.specialInstructions}</p>` : ''}
        </div>
    `;
    
    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
    orderModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Utility Functions =====
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleLinkClick(event) {
    const target = event.target.getAttribute('href');
    
    if (target && target.startsWith('#')) {
        event.preventDefault();
        smoothScrollTo(target);
        closeMobileMenu();
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Navigation
    if (elementExists(hamburger)) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleLinkClick);
    });
    
    // Back to top button
    if (elementExists(backToTop)) {
        backToTop.addEventListener('click', scrollToTop);
    }
    
    // Window scroll
    window.addEventListener('scroll', handleNavScroll);
    
    // Order form
    if (elementExists(orderForm)) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    // Modal controls
    if (elementExists(modalClose)) {
        modalClose.addEventListener('click', closeOrderModal);
    }
    if (elementExists(modalOk)) {
        modalOk.addEventListener('click', closeOrderModal);
    }
    
    // Lightbox controls
    if (elementExists(lightboxClose)) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    if (elementExists(lightboxPrev)) {
        lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
    }
    if (elementExists(lightboxNext)) {
        lightboxNext.addEventListener('click', () => navigateLightbox('next'));
    }
    
    // Close modals on outside click
    if (elementExists(lightbox)) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    if (elementExists(orderModal)) {
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                closeOrderModal();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (elementExists(lightbox) && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                navigateLightbox('prev');
            } else if (e.key === 'ArrowRight') {
                navigateLightbox('next');
            }
        }
        
        if (elementExists(orderModal) && orderModal.classList.contains('active') && e.key === 'Escape') {
            closeOrderModal();
        }
    });
    
    // Close mobile menu when clicking outside
    if (elementExists(navbar) && elementExists(navMenu)) {
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
    
    // Form input enhancements
    const formInputs = document.querySelectorAll('.order-form input, .order-form select, .order-form textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.classList.add('focused');
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.parentElement && this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
}

// ===== Animation Functions =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .category-card, .gallery-item, .about-text, .about-image');
    animateElements.forEach(el => observer.observe(el));
}

// ===== Loading Functions =====
function showLoadingState() {
    document.body.classList.add('loading');
}

function hideLoadingState() {
    document.body.classList.remove('loading');
}

// ===== Error Handling =====
function handleImageError(img) {
    img.src = 'images/placeholder.svg';
    img.alt = 'Image not available';
}

// ===== Performance Optimizations =====
function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('lazy-image');
            imageObserver.observe(img);
        });
    }
}

// Optimize animations for performance
function optimizeAnimations() {
    // Use requestAnimationFrame for smooth animations
    let ticking = false;
    
    function updateAnimations() {
        // Update scroll-based animations
        const scrollTop = window.pageYOffset;
        
        // Add visible class to elements in viewport
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            const elementTop = element.offsetTop;
            const elementHeight = element.offsetHeight;
            const windowHeight = window.innerHeight;
            
            if (scrollTop > elementTop - windowHeight + 100) {
                element.classList.add('visible');
            }
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateAnimations);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalImages = [
            'https://i.ibb.co/hRqYtzxt/IMG-20251110-WA0047.jpg',
            'https://i.ibb.co/tTS3T6DR/IMG-20251110-WA0048.jpg',
            'https://i.ibb.co/Mydx9D5q/IMG-20251110-WA0049.jpg'
        ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Optimize font loading
function optimizeFontLoading() {
    // Add font-display: swap class to body after fonts load
    if ('fonts' in document) {
        document.fonts.ready.then(() => {
            document.body.classList.add('fonts-loaded');
        });
    }
}

// Debounce function for performance
function debounce(func, wait) {
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== Analytics Functions =====
function trackEvent(eventName, properties = {}) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', eventName, properties);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
}

// ===== Initialization =====
function init() {
    try {
        showLoadingState();
        
        // Initialize all components with error handling
        setupEventListeners();
        
        // Performance optimizations
        optimizeAnimations();
        optimizeFontLoading();
        preloadCriticalResources();
        
        // Conditionally initialize components based on page
        if (document.querySelector('.slide')) {
            initHeroSlideshow();
        }
        
        if (document.querySelector('.testimonial')) {
            initTestimonialSlider();
        }
        
        if (document.querySelector('.gallery-item')) {
            initGallery();
        }
        
        initScrollAnimations();
        lazyLoadImages();
        
        // Add animate-on-scroll classes to elements
        document.querySelectorAll('section, .card, .menu-item, .gallery-item').forEach(element => {
            element.classList.add('animate-on-scroll');
        });
        
        // Track page view
        trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
        
        hideLoadingState();
        
        console.log('Legends website initialized successfully');
    } catch (error) {
        console.error('Error initializing website:', error);
        trackEvent('initialization_error', {
            error_message: error.message,
            error_stack: error.stack
        });
        hideLoadingState();
    }
}

// ===== Page Load Events =====
document.addEventListener('DOMContentLoaded', init);

// ===== Window Load Events =====
window.addEventListener('load', () => {
    // Additional initialization after all resources are loaded
    console.log('Legends Rooftop Pub & Restaurant website loaded successfully!');
});

// ===== Error Handling =====
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    trackEvent('javascript_error', {
        error_message: e.error.message,
        error_stack: e.error.stack
    });
});

// ===== Export functions for testing =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateOrderForm,
        showOrderConfirmation,
        navigateLightbox,
        handleNavScroll
    };
}