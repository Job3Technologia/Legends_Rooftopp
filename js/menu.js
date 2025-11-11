// Menu Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Menu Navigation Active State
    const menuNavItems = document.querySelectorAll('.menu-nav-item');
    const menuSections = document.querySelectorAll('.menu-section');
    
    // Function to update active navigation item
    function updateActiveNavItem() {
        let current = '';
        menuSections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        menuNavItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    }
    
    // Update active nav item on scroll
    window.addEventListener('scroll', updateActiveNavItem);
    
    // Smooth scrolling for menu navigation
    menuNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 120;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Menu Item Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = Math.random() * 0.3 + 's';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        observer.observe(item);
    });
    
    // Menu Search Functionality (if search bar is added)
    function setupMenuSearch() {
        const searchInput = document.querySelector('#menu-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const menuItems = document.querySelectorAll('.menu-item');
            
            menuItems.forEach(item => {
                const itemName = item.querySelector('h3').textContent.toLowerCase();
                const itemDescription = item.querySelector('.menu-item-description').textContent.toLowerCase();
                const itemTags = Array.from(item.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
                
                const matchesSearch = itemName.includes(searchTerm) || 
                                    itemDescription.includes(searchTerm) ||
                                    itemTags.some(tag => tag.includes(searchTerm));
                
                if (matchesSearch || searchTerm === '') {
                    item.style.display = 'block';
                    item.style.animationDelay = '0s';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // Initialize search functionality
    setupMenuSearch();
    
    // Menu Category Filtering (if filter buttons are added)
    function setupMenuFiltering() {
        const filterButtons = document.querySelectorAll('.menu-filter-btn');
        if (!filterButtons.length) return;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                const menuItems = document.querySelectorAll('.menu-item');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter items
                menuItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                        item.style.animationDelay = '0s';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
    
    // Initialize filtering
    setupMenuFiltering();
    
    // Price Range Filter (if price filter is added)
    function setupPriceFilter() {
        const priceFilter = document.querySelector('#price-filter');
        if (!priceFilter) return;
        
        priceFilter.addEventListener('change', function() {
            const maxPrice = parseInt(this.value);
            const menuItems = document.querySelectorAll('.menu-item');
            
            menuItems.forEach(item => {
                const priceText = item.querySelector('.menu-item-price').textContent;
                const price = parseInt(priceText.replace('R', ''));
                
                if (price <= maxPrice || this.value === 'all') {
                    item.style.display = 'block';
                    item.style.animationDelay = '0s';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // Initialize price filter
    setupPriceFilter();
    
    // Menu Item Quick View (if quick view functionality is added)
    function setupQuickView() {
        const quickViewButtons = document.querySelectorAll('.quick-view-btn');
        if (!quickViewButtons.length) return;
        
        quickViewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const menuItem = this.closest('.menu-item');
                const itemName = menuItem.querySelector('h3').textContent;
                const itemDescription = menuItem.querySelector('.menu-item-description').textContent;
                const itemPrice = menuItem.querySelector('.menu-item-price').textContent;
                const itemImage = menuItem.querySelector('img').src;
                
                // Create and show modal (implementation depends on modal system)
                showQuickViewModal({
                    name: itemName,
                    description: itemDescription,
                    price: itemPrice,
                    image: itemImage
                });
            });
        });
    }
    
    // Initialize quick view
    setupQuickView();
    
    // Menu Sharing Functionality
    function setupMenuSharing() {
        const shareButtons = document.querySelectorAll('.share-menu-item');
        if (!shareButtons.length) return;
        
        shareButtons.forEach(button => {
            button.addEventListener('click', function() {
                const menuItem = this.closest('.menu-item');
                const itemName = menuItem.querySelector('h3').textContent;
                const itemPrice = menuItem.querySelector('.menu-item-price').textContent;
                
                if (navigator.share) {
                    navigator.share({
                        title: `${itemName} - Legends Rooftop Pub`,
                        text: `Check out this delicious item from our menu: ${itemName} for ${itemPrice}`,
                        url: window.location.href
                    });
                } else {
                    // Fallback for browsers that don't support Web Share API
                    const shareText = `Check out this delicious item from Legends Rooftop Pub: ${itemName} for ${itemPrice}`;
                    navigator.clipboard.writeText(shareText).then(() => {
                        alert('Menu item details copied to clipboard!');
                    });
                }
            });
        });
    }
    
    // Initialize sharing
    setupMenuSharing();
    
    // Nutritional Information Toggle (if nutritional info is added)
    function setupNutritionalInfo() {
        const nutritionButtons = document.querySelectorAll('.nutrition-toggle');
        if (!nutritionButtons.length) return;
        
        nutritionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const menuItem = this.closest('.menu-item');
                const nutritionInfo = menuItem.querySelector('.nutrition-info');
                
                if (nutritionInfo) {
                    nutritionInfo.classList.toggle('visible');
                    this.textContent = nutritionInfo.classList.contains('visible') ? 'Hide Nutrition' : 'Show Nutrition';
                }
            });
        });
    }
    
    // Initialize nutritional info
    setupNutritionalInfo();
    
    // Menu PDF Generation (if download button is added)
    function setupMenuDownload() {
        const downloadButton = document.querySelector('#download-menu');
        if (!downloadButton) return;
        
        downloadButton.addEventListener('click', function() {
            // Create a simple text version of the menu for download
            const menuData = {
                restaurant: 'Legends Rooftop Pub & Restaurant',
                date: new Date().toLocaleDateString(),
                categories: {}
            };
            
            const sections = document.querySelectorAll('.menu-section');
            sections.forEach(section => {
                const categoryName = section.querySelector('h2').textContent;
                const items = [];
                
                section.querySelectorAll('.menu-item').forEach(item => {
                    const name = item.querySelector('h3').textContent;
                    const price = item.querySelector('.menu-item-price').textContent;
                    const description = item.querySelector('.menu-item-description').textContent;
                    
                    items.push({
                        name: name,
                        price: price,
                        description: description
                    });
                });
                
                menuData.categories[categoryName] = items;
            });
            
            // Convert to text format
            let menuText = `${menuData.restaurant}\nMenu - ${menuData.date}\n\n`;
            
            for (const [category, items] of Object.entries(menuData.categories)) {
                menuText += `${category.toUpperCase()}\n`;
                menuText += '='.repeat(category.length) + '\n\n';
                
                items.forEach(item => {
                    menuText += `${item.name} - ${item.price}\n`;
                    menuText += `${item.description}\n\n`;
                });
                
                menuText += '\n';
            }
            
            // Create and download file
            const blob = new Blob([menuText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'legends-menu.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    
    // Initialize menu download
    setupMenuDownload();
    
    // Initialize on page load
    updateActiveNavItem();
    
    console.log('Menu page functionality initialized');
});