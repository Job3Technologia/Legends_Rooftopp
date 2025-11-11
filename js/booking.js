/**
 * Legends Rooftop Pub & Restaurant - Booking System
 * Advanced booking management with phone confirmation
 */

class BookingManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.bookingData = {
            date: null,
            time: null,
            table: null,
            partySize: 2,
            customer: {
                name: '',
                email: '',
                phone: '',
                specialRequests: ''
            },
            confirmationCode: null,
            bookingId: null
        };
        
        this.timeSlots = this.generateTimeSlots();
        this.tables = this.generateTableData();
        this.availableDates = this.generateAvailableDates();
        
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.initializeStep(1);
            this.setupDatePicker();
            this.setupTimeSlots();
            this.setupTableSelection();
            this.setupFormValidation();
            this.loadBookingData();
            console.log('Booking system initialized successfully');
        } catch (error) {
            console.error('Error initializing booking system:', error);
            this.showNotification('Error initializing booking system. Please refresh the page.', 'error');
        }
    }

    // Initialize booking steps
    initializeStep(step) {
        this.currentStep = step;
        this.updateStepIndicators();
        this.showStepContent(step);
        this.updateStepActions();
    }

    updateStepIndicators() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
    }

    showStepContent(step) {
        const contents = document.querySelectorAll('.booking-step-content');
        contents.forEach(content => content.classList.remove('active'));
        
        const targetContent = document.getElementById(`step-${step}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    updateStepActions() {
        const prevBtn = document.querySelector('.btn-prev');
        const nextBtn = document.querySelector('.btn-next');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'flex';
        }
        
        if (nextBtn) {
            nextBtn.textContent = this.currentStep === this.totalSteps ? 'Complete Booking' : 'Next Step';
            nextBtn.innerHTML = this.currentStep === this.totalSteps 
                ? '<i class="fas fa-check"></i> Complete Booking'
                : '<i class="fas fa-arrow-right"></i> Next Step';
        }
    }

    // Date and Time Management
    generateTimeSlots() {
        const slots = [];
        const startHour = 11; // 11 AM
        const endHour = 22; // 10 PM
        
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                if (hour === endHour && minute > 0) break;
                
                const time = new Date(2000, 0, 1, hour, minute);
                const timeString = time.toLocaleTimeString('en-ZA', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                slots.push({
                    time: timeString,
                    available: Math.random() > 0.2, // 80% availability
                    capacity: Math.floor(Math.random() * 3) + 2 // 2-4 tables available
                });
            }
        }
        return slots;
    }

    generateAvailableDates() {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            dates.push({
                date: date,
                available: Math.random() > 0.1, // 90% availability
                dayOfWeek: date.toLocaleDateString('en-ZA', { weekday: 'long' })
            });
        }
        return dates;
    }

    setupDatePicker() {
        const calendarContainer = document.querySelector('.calendar-grid');
        if (!calendarContainer) return;

        // Add weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const weekdayElement = document.createElement('div');
            weekdayElement.className = 'calendar-weekday';
            weekdayElement.textContent = day;
            calendarContainer.appendChild(weekdayElement);
        });

        // Add date buttons
        this.availableDates.forEach((dateData, index) => {
            const dateButton = document.createElement('button');
            dateButton.className = 'calendar-day';
            dateButton.textContent = dateData.date.getDate();
            dateButton.dataset.date = dateData.date.toISOString().split('T')[0];
            
            if (!dateData.available) {
                dateButton.classList.add('disabled');
                dateButton.disabled = true;
            }
            
            dateButton.addEventListener('click', () => this.selectDate(dateData.date));
            calendarContainer.appendChild(dateButton);
        });
    }

    setupTimeSlots() {
        const timeSlotsContainer = document.querySelector('.time-slots');
        if (!timeSlotsContainer) return;

        this.timeSlots.forEach(slot => {
            const timeButton = document.createElement('button');
            timeButton.className = 'time-slot';
            timeButton.textContent = slot.time;
            timeButton.dataset.time = slot.time;
            
            if (!slot.available) {
                timeButton.classList.add('unavailable');
                timeButton.disabled = true;
                timeButton.title = 'Fully booked';
            } else {
                timeButton.title = `${slot.capacity} tables available`;
            }
            
            timeButton.addEventListener('click', () => this.selectTime(slot));
            timeSlotsContainer.appendChild(timeButton);
        });
    }

    selectDate(date) {
        this.bookingData.date = date;
        
        // Update UI
        document.querySelectorAll('.calendar-day').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        this.updateBookingSummary();
        this.validateCurrentStep();
    }

    selectTime(slot) {
        if (!slot.available) return;
        
        this.bookingData.time = slot.time;
        
        // Update UI
        document.querySelectorAll('.time-slot').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`[data-time="${slot.time}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        this.updateBookingSummary();
        this.validateCurrentStep();
    }

    // Table Selection
    generateTableData() {
        const tables = [];
        const areas = [
            { name: 'Rooftop', icon: '🌅', capacity: [2, 4, 6] },
            { name: 'Main', icon: '🏠', capacity: [2, 4, 8] },
            { name: 'Braai Corner', icon: '🔥', capacity: [4, 6, 8] }
        ];
        
        let tableNumber = 1;
        areas.forEach(area => {
            area.capacity.forEach(capacity => {
                tables.push({
                    id: `table-${tableNumber}`,
                    number: tableNumber,
                    area: area.name,
                    capacity: capacity,
                    available: Math.random() > 0.3, // 70% availability
                    icon: area.icon
                });
                tableNumber++;
            });
        });
        
        return tables;
    }

    setupTableSelection() {
        const tableMapContainer = document.querySelector('.tables-grid');
        if (!tableMapContainer) return;

        this.tables.forEach(table => {
            const tableElement = document.createElement('div');
            tableElement.className = 'table';
            tableElement.dataset.tableId = table.id;
            
            if (!table.available) {
                tableElement.classList.add('unavailable');
                tableElement.title = 'Table not available';
            } else {
                tableElement.title = `Table ${table.number} - ${table.area} - Seats ${table.capacity}`;
            }
            
            tableElement.innerHTML = `
                <div class="table-number">${table.number}</div>
                <div class="table-capacity">${table.capacity}</div>
            `;
            
            tableElement.addEventListener('click', () => this.selectTable(table));
            tableMapContainer.appendChild(tableElement);
        });
    }

    selectTable(table) {
        if (!table.available) return;
        
        this.bookingData.table = table;
        
        // Update UI
        document.querySelectorAll('.table').forEach(t => {
            t.classList.remove('selected');
        });
        
        const selectedTable = document.querySelector(`[data-table-id="${table.id}"]`);
        if (selectedTable) {
            selectedTable.classList.add('selected');
        }
        
        // Update table details
        this.updateTableDetails(table);
        this.updateBookingSummary();
        this.validateCurrentStep();
    }

    updateTableDetails(table) {
        const tableInfo = document.querySelector('.table-info');
        if (tableInfo) {
            tableInfo.classList.add('has-selection');
            tableInfo.innerHTML = `
                <div>
                    <h4>Table ${table.number} - ${table.area}</h4>
                    <p>Seats ${table.capacity} guests</p>
                    <p>Perfect for your party size</p>
                </div>
            `;
        }
    }

    // Party Size Management
    setupPartySizeSelector() {
        const minusBtn = document.querySelector('.counter-btn[data-action="minus"]');
        const plusBtn = document.querySelector('.counter-btn[data-action="plus"]');
        const countDisplay = document.querySelector('.guest-count');
        
        if (!minusBtn || !plusBtn || !countDisplay) return;
        
        const updateCount = () => {
            countDisplay.textContent = this.bookingData.partySize;
            minusBtn.disabled = this.bookingData.partySize <= 1;
            plusBtn.disabled = this.bookingData.partySize >= 20;
            this.updateBookingSummary();
        };
        
        minusBtn.addEventListener('click', () => {
            if (this.bookingData.partySize > 1) {
                this.bookingData.partySize--;
                updateCount();
            }
        });
        
        plusBtn.addEventListener('click', () => {
            if (this.bookingData.partySize < 20) {
                this.bookingData.partySize++;
                updateCount();
            }
        });
        
        updateCount();
    }

    // Form Validation and Management
    setupFormValidation() {
        const form = document.querySelector('.booking-form');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'name':
                isValid = value.length >= 2;
                errorMessage = 'Please enter at least 2 characters';
                break;
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'phone':
                isValid = /^\+?(\d{10,15})$/.test(value.replace(/[\s\-\(\)]/g, ''));
                errorMessage = 'Please enter a valid phone number';
                break;
        }
        
        this.setFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    setFieldValidation(field, isValid, errorMessage) {
        field.classList.toggle('valid', isValid);
        field.classList.toggle('invalid', !isValid);
        
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = isValid ? '' : errorMessage;
            errorElement.style.display = isValid ? 'none' : 'block';
        }
    }

    validateCurrentStep() {
        let isValid = false;
        
        switch (this.currentStep) {
            case 1:
                isValid = this.bookingData.date && this.bookingData.time;
                break;
            case 2:
                isValid = this.bookingData.table && this.bookingData.partySize;
                break;
            case 3:
                isValid = this.validateCustomerForm();
                break;
            case 4:
                isValid = this.bookingData.confirmationCode;
                break;
        }
        
        const nextBtn = document.querySelector('.btn-next');
        if (nextBtn) {
            nextBtn.disabled = !isValid;
        }
    }

    validateCustomerForm() {
        const form = document.querySelector('.booking-form');
        if (!form) return false;
        
        const requiredFields = ['name', 'email', 'phone'];
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const fieldValid = this.validateField(field);
                isValid = isValid && fieldValid;
            }
        });
        
        return isValid;
    }

    // Step Navigation
    nextStep() {
        if (!this.validateCurrentStep()) return;
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.initializeStep(this.currentStep);
            
            if (this.currentStep === 4) {
                this.setupPhoneConfirmation();
            }
        } else {
            this.completeBooking();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.initializeStep(this.currentStep);
        }
    }

    // Phone Confirmation System
    setupPhoneConfirmation() {
        this.generateConfirmationCode();
        this.startConfirmationTimer();
        this.sendConfirmationCode();
    }

    generateConfirmationCode() {
        this.bookingData.confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.bookingData.bookingId = 'BK' + Date.now().toString().slice(-6);
    }

    async sendConfirmationCode() {
        try {
            // Mock SMS sending (in production, integrate with SMS service)
            console.log(`Sending confirmation code ${this.bookingData.confirmationCode} to ${this.bookingData.customer.phone}`);
            
            // Show confirmation message
            this.showConfirmationMessage();
            
            // Track analytics
            this.trackEvent('confirmation_sent', {
                booking_id: this.bookingData.bookingId,
                phone: this.bookingData.customer.phone
            });
            
        } catch (error) {
            console.error('Failed to send confirmation code:', error);
            this.showNotification('Failed to send confirmation code. Please try again.', 'error');
        }
    }

    showConfirmationMessage() {
        const message = document.querySelector('.confirmation-message p');
        if (message) {
            message.innerHTML = `We've sent a 6-digit confirmation code to <strong>${this.bookingData.customer.phone}</strong>. Please enter it below to complete your booking.`;
        }
    }

    startConfirmationTimer() {
        let timeLeft = 300; // 5 minutes
        const timerElement = document.querySelector('.confirmation-timer');
        
        if (!timerElement) return;
        
        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.innerHTML = `<i class="fas fa-clock"></i> ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.handleConfirmationTimeout();
            }
            
            timeLeft--;
        };
        
        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        this.confirmationTimer = timer;
    }

    handleConfirmationTimeout() {
        this.showNotification('Confirmation code expired. Please request a new code.', 'error');
        this.generateConfirmationCode();
        this.startConfirmationTimer();
        this.sendConfirmationCode();
    }

    verifyConfirmationCode() {
        const input = document.querySelector('.confirmation-input input');
        if (!input) return;
        
        const enteredCode = input.value.trim();
        
        if (enteredCode === this.bookingData.confirmationCode) {
            this.completeBooking();
        } else {
            this.showNotification('Invalid confirmation code. Please try again.', 'error');
            input.classList.add('invalid');
            input.focus();
            
            // Track failed attempt
            this.trackEvent('confirmation_failed', {
                booking_id: this.bookingData.bookingId,
                attempts: this.confirmationAttempts || 0
            });
        }
    }

    resendConfirmationCode() {
        this.generateConfirmationCode();
        this.sendConfirmationCode();
        this.startConfirmationTimer();
        
        // Clear input
        const input = document.querySelector('.confirmation-input input');
        if (input) {
            input.value = '';
            input.classList.remove('invalid');
        }
        
        this.showNotification('New confirmation code sent!', 'success');
    }

    // Booking Completion
    async completeBooking() {
        try {
            // Stop confirmation timer
            if (this.confirmationTimer) {
                clearInterval(this.confirmationTimer);
            }
            
            // Show loading state
            this.showLoading('Completing your booking...');
            
            // Save booking data
            await this.saveBooking();
            
            // Send confirmation email/SMS
            await this.sendBookingConfirmation();
            
            // Show success state
            this.showSuccessState();
            
            // Track analytics
            this.trackEvent('booking_completed', {
                booking_id: this.bookingData.bookingId,
                date: this.bookingData.date,
                time: this.bookingData.time,
                table: this.bookingData.table.number,
                party_size: this.bookingData.partySize
            });
            
            // Hide loading state
            this.hideLoading();
            
        } catch (error) {
            console.error('Booking completion failed:', error);
            this.hideLoading();
            this.showNotification('Failed to complete booking. Please try again.', 'error');
        }
    }

    async saveBooking() {
        // In production, this would save to a database
        const booking = {
            ...this.bookingData,
            status: 'confirmed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Save to localStorage for demo purposes
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Save current booking
        localStorage.setItem('current_booking', JSON.stringify(booking));
    }

    async sendBookingConfirmation() {
        // Mock email/SMS sending
        console.log('Sending booking confirmation:', this.bookingData);
        
        // In production, integrate with email/SMS service
        // This would include booking details, QR code, etc.
    }

    showSuccessState() {
        // Hide current step content
        document.querySelectorAll('.booking-step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show success content
        const successContent = document.getElementById('success-state');
        if (successContent) {
            successContent.classList.add('active');
            this.populateSuccessDetails();
        }
        
        // Update step indicators
        document.querySelectorAll('.step').forEach(step => {
            step.classList.add('completed');
        });
    }

    populateSuccessDetails() {
        const bookingId = document.querySelector('.booking-id');
        const bookingDate = document.querySelector('.booking-date');
        const bookingTime = document.querySelector('.booking-time');
        const bookingTable = document.querySelector('.booking-table');
        const bookingGuests = document.querySelector('.booking-guests');
        
        if (bookingId) bookingId.textContent = this.bookingData.bookingId;
        if (bookingDate) bookingDate.textContent = this.bookingData.date.toLocaleDateString('en-ZA');
        if (bookingTime) bookingTime.textContent = this.bookingData.time;
        if (bookingTable) bookingTable.textContent = `Table ${this.bookingData.table.number} (${this.bookingData.table.area})`;
        if (bookingGuests) bookingGuests.textContent = `${this.bookingData.partySize} guests`;
    }

    // Utility Functions
    updateBookingSummary() {
        const summaryElements = {
            date: document.querySelector('.summary-date'),
            time: document.querySelector('.summary-time'),
            table: document.querySelector('.summary-table'),
            guests: document.querySelector('.summary-guests')
        };
        
        if (this.bookingData.date && summaryElements.date) {
            summaryElements.date.textContent = this.bookingData.date.toLocaleDateString('en-ZA');
        }
        
        if (this.bookingData.time && summaryElements.time) {
            summaryElements.time.textContent = this.bookingData.time;
        }
        
        if (this.bookingData.table && summaryElements.table) {
            summaryElements.table.textContent = `Table ${this.bookingData.table.number}`;
        }
        
        if (summaryElements.guests) {
            summaryElements.guests.textContent = `${this.bookingData.partySize} guests`;
        }
    }

    loadBookingData() {
        const savedBooking = localStorage.getItem('current_booking');
        if (savedBooking) {
            try {
                const booking = JSON.parse(savedBooking);
                this.bookingData = { ...this.bookingData, ...booking };
                this.restoreBookingState();
            } catch (error) {
                console.error('Failed to load saved booking:', error);
            }
        }
    }

    restoreBookingState() {
        // Restore selected date
        if (this.bookingData.date) {
            const dateBtn = document.querySelector(`[data-date="${this.bookingData.date.split('T')[0]}"]`);
            if (dateBtn) dateBtn.classList.add('selected');
        }
        
        // Restore selected time
        if (this.bookingData.time) {
            const timeBtn = document.querySelector(`[data-time="${this.bookingData.time}"]`);
            if (timeBtn) timeBtn.classList.add('selected');
        }
        
        // Restore selected table
        if (this.bookingData.table) {
            const tableElement = document.querySelector(`[data-table-id="${this.bookingData.table.id}"]`);
            if (tableElement) tableElement.classList.add('selected');
            this.updateTableDetails(this.bookingData.table);
        }
        
        // Restore party size
        if (this.bookingData.partySize) {
            const countDisplay = document.querySelector('.guest-count');
            if (countDisplay) countDisplay.textContent = this.bookingData.partySize;
        }
        
        this.updateBookingSummary();
        this.validateCurrentStep();
    }

    // Event Listeners
    setupEventListeners() {
        // Step navigation
        const nextBtn = document.querySelector('.btn-next');
        const prevBtn = document.querySelector('.btn-prev');
        
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        
        // Form inputs
        const form = document.querySelector('.booking-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.nextStep();
            });
            
            // Auto-save form data
            form.addEventListener('input', (e) => {
                if (e.target.name) {
                    this.bookingData.customer[e.target.name] = e.target.value;
                    this.saveBookingData();
                }
            });
        }
        
        // Party size selector
        this.setupPartySizeSelector();
        
        // Confirmation code input
        const confirmationInput = document.querySelector('.confirmation-input input');
        if (confirmationInput) {
            confirmationInput.addEventListener('input', (e) => {
                e.target.classList.remove('invalid');
                if (e.target.value.length === 6) {
                    this.verifyConfirmationCode();
                }
            });
        }
        
        // Resend code button
        const resendBtn = document.querySelector('.btn-resend');
        if (resendBtn) {
            resendBtn.addEventListener('click', () => this.resendConfirmationCode());
        }
        
        // Terms modal
        const termsLink = document.querySelector('[data-toggle="modal"][data-target="#termsModal"]');
        const termsModal = document.getElementById('termsModal');
        const closeModal = document.querySelector('.modal-close');
        
        if (termsLink && termsModal) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                termsModal.classList.add('active');
            });
        }
        
        if (closeModal && termsModal) {
            closeModal.addEventListener('click', () => {
                termsModal.classList.remove('active');
            });
        }
        
        // Success actions
        const printBtn = document.querySelector('.btn-print');
        const shareBtn = document.querySelector('.btn-share');
        const newBookingBtn = document.querySelector('.btn-new-booking');
        
        if (printBtn) printBtn.addEventListener('click', () => this.printBooking());
        if (shareBtn) shareBtn.addEventListener('click', () => this.shareBooking());
        if (newBookingBtn) newBookingBtn.addEventListener('click', () => this.startNewBooking());
    }

    // Utility Methods
    saveBookingData() {
        localStorage.setItem('current_booking', JSON.stringify(this.bookingData));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    showLoading(message = 'Loading...') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loading);
    }

    hideLoading() {
        const loading = document.querySelector('.loading-overlay');
        if (loading) loading.remove();
    }

    printBooking() {
        window.print();
    }

    shareBooking() {
        if (navigator.share) {
            navigator.share({
                title: 'Legends Rooftop Booking',
                text: `Booking confirmed for ${this.bookingData.date.toLocaleDateString()} at ${this.bookingData.time}`,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            const text = `Legends Rooftop Booking\nDate: ${this.bookingData.date.toLocaleDateString()}\nTime: ${this.bookingData.time}\nTable: ${this.bookingData.table.number}\nBooking ID: ${this.bookingData.bookingId}`;
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Booking details copied to clipboard!', 'success');
            });
        }
    }

    startNewBooking() {
        // Clear current booking data
        localStorage.removeItem('current_booking');
        
        // Reset booking manager
        this.bookingData = {
            date: null,
            time: null,
            table: null,
            partySize: 2,
            customer: {
                name: '',
                email: '',
                phone: '',
                specialRequests: ''
            },
            confirmationCode: null,
            bookingId: null
        };
        
        // Reset UI
        document.querySelectorAll('.calendar-day.selected, .time-slot.selected, .table.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        document.querySelectorAll('.booking-step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Restart from step 1
        this.initializeStep(1);
    }

    trackEvent(eventName, data) {
        // Mock analytics tracking
        console.log('Analytics:', eventName, data);
        
        // In production, integrate with Google Analytics, Mixpanel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }
}

// Initialize booking system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const bookingManager = new BookingManager();
    
    // Expose to global scope for debugging
    window.bookingManager = bookingManager;
    
    console.log('Legends Rooftop Booking System initialized');
});