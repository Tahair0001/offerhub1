// Check if this script has already run
if (window.scriptLoaded) {
    console.log('Script already loaded, skipping...');
} else {
    window.scriptLoaded = true;

    console.log('Script.js loaded - initializing...');

    // Sample offers data for landing page with UNIQUE IDs
    const offers = [
        {
            id: 1,
            title: "Fashion Street, Kalaburagi",
            discount: "Flat 40% Off on Main View",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            category: "fashion"
        },
        {
            id: 2,
            title: "Funn-Offer",
            discount: "Flat 60% Off on Main View",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            category: "entertainment"
        },
        {
            id: 3,
            title: "Electro World",
            discount: "30% Off on All Items",
            image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            category: "electronics"
        },
        {
            id: 4,
            title: "Food Paradise", 
            discount: "Buy 1 Get 1 Free",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            category: "food"
        },
        {
            id: 5,
            title: "Sports Zone",
            discount: "25% Off on Sports Gear",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            category: "sports"
        }
    ];

    // Function to display offers
    function displayOffers(offersToShow) {
        const offersGrid = document.querySelector('.offers-grid');
        
        if (!offersGrid) return;
        
        offersGrid.innerHTML = '';
        
        offersToShow.forEach(offer => {
            console.log('Creating homepage card for offer ID:', offer.id);
            
            const offerCard = document.createElement('div');
            offerCard.className = 'offer-card';
            offerCard.style.cursor = 'pointer';
            offerCard.addEventListener('click', () => {
                console.log('Homepage clicked offer ID:', offer.id);
                viewOfferDetails(offer.id);
            });
            
            offerCard.innerHTML = `
                <div class="offer-img" style="background-image: url('${offer.image}')"></div>
                <div class="offer-content">
                    <h3 class="offer-title">${offer.title}</h3>
                    <p class="offer-discount">${offer.discount}</p>
                </div>
            `;
            offersGrid.appendChild(offerCard);
        });
    }

    // Function to handle offer clicks
    function viewOfferDetails(offerId) {
        console.log('Navigating to offer details for ID:', offerId);
        window.location.href = `offer-details.html?id=${offerId}`;
    }

    // Function to set active navigation link
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Authentication status is now handled by common.js

    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, initializing main script...');
        
        // Set active navigation
        setActiveNavLink();
        
        // Display offers on landing page
        displayOffers(offers);
        
        // Search functionality with debouncing
if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Real-time search with debouncing
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (this.value.length > 0) {
                performSearch();
            } else {
                // If search is cleared, show all offers
                displayedOffers = 0;
                currentOffers = allOffers; // Store original offers
                loadOffers(offersPerLoad);
            }
        }, 500);
    });
}

// Perform search - now filters on homepage
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        // If no search term, show all offers
        displayedOffers = 0;
        currentOffers = allOffers;
        loadOffers(offersPerLoad);
        return;
    }

    showLoading();
    
    setTimeout(() => {
        // Filter offers based on search term
        const filteredOffers = allOffers.filter(offer => 
            offer.shopName.toLowerCase().includes(searchTerm) ||
            offer.item.toLowerCase().includes(searchTerm) ||
            offer.description.toLowerCase().includes(searchTerm) ||
            offer.category.toLowerCase().includes(searchTerm)
        );
        
        displayedOffers = 0;
        currentOffers = filteredOffers;
        
        if (filteredOffers.length === 0) {
            offersContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info" style="border-radius: 15px;">
                        <i class="fas fa-search fa-2x mb-3 d-block"></i>
                        <h5>No offers found for "${searchTerm}"</h5>
                        <p>Try searching with different keywords or browse all categories.</p>
                        <button class="btn btn-primary mt-2" onclick="clearSearch()">Show All Offers</button>
                    </div>
                </div>
            `;
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        } else {
            loadOffers(offersPerLoad);
            showToast(`Found ${filteredOffers.length} offers for "${searchTerm}"`, 'success');
        }
        
        hideLoading();
    }, 500);
}

// Clear search and show all offers
function clearSearch() {
    searchInput.value = '';
    displayedOffers = 0;
    currentOffers = allOffers;
    loadOffers(offersPerLoad);
    
    // Reset category filter to "All"
    const allCategoryBtn = document.querySelector('[data-category="all"]');
    if (allCategoryBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        allCategoryBtn.classList.add('active');
    }
}

        // Also allow pressing Enter in search
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const searchTerm = e.target.value;
                    if (searchTerm) {
                        window.location.href = `offers.html?search=${encodeURIComponent(searchTerm)}`;
                    }
                }
            });
        }

        // Get Started button functionality
        const getStartedBtn = document.querySelector('.cta .btn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', function() {
                window.location.href = 'login.html?action=signup';
            });
        }
        
        // Login/Signup buttons in header
        const loginBtn = document.querySelector('.auth-buttons .btn-outline');
        const signupBtn = document.querySelector('.auth-buttons .btn-primary');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                window.location.href = 'login.html';
            });
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', function() {
                window.location.href = 'login.html?action=signup';
            });
        }
        
        // Authentication status is handled by common.js
        
        console.log('Main script initialized successfully');
    });

    // Make functions available globally
    window.displayOffers = displayOffers;
    window.viewOfferDetails = viewOfferDetails;
}