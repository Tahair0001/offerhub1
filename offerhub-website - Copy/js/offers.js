// Check if this script has already run
if (window.offersScriptLoaded) {
    console.log('Offers script already loaded, skipping...');
} else {
    window.offersScriptLoaded = true;
    
    console.log('Offers.js loaded - initializing...');

    // Global variables for offers page
    let allOffers = [];
    let filteredOffers = [];
    let currentPage = 1; // Fixed: Added this variable
    const offersPerPage = 9; // Fixed: Added this variable

    // Simple fallback data with UNIQUE IDs
    const fallbackOffers = [
        {
            id: 1,
            title: "Fashion Street, Kalaburagi",
            discount: "Flat 40% Off on Men's Wear",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "1.2 km",
            shop: "Fashion Street",
            description: "Get amazing discounts on our latest men's wear collection.",
            category: "fashion"
        },
        {
            id: 2,
            title: "Funn-Offer",
            discount: "Flat 60% Off on All Games",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi", 
            distance: "0.8 km",
            shop: "Funn-Offer",
            description: "Exciting entertainment offers with huge discounts on all games.",
            category: "entertainment"
        },
        {
            id: 3,
            title: "Electro World",
            discount: "30% Off on Electronics",
            image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "2.1 km",
            shop: "Electro World",
            description: "Latest electronics with amazing discounts.",
            category: "electronics"
        },
        {
            id: 4,
            title: "Food Paradise",
            discount: "Buy 1 Get 1 Free",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "1.5 km",
            shop: "Food Paradise",
            description: "Delicious food offers with buy one get one free.",
            category: "food"
        },
        {
            id: 5,
            title: "Book Haven",
            discount: "25% Off on All Books",
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "0.9 km",
            shop: "Book Haven",
            description: "Wide collection of books with great discounts.",
            category: "books"
        },
        {
            id: 6,
            title: "Sports Zone",
            discount: "35% Off on Sports Gear",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "1.8 km",
            shop: "Sports Zone",
            description: "Premium sports equipment at discounted prices.",
            category: "sports"
        },
        {
            id: 7,
            title: "Beauty Palace",
            discount: "Buy 2 Get 1 Free",
            image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "1.1 km",
            shop: "Beauty Palace",
            description: "Cosmetics and beauty products with amazing offers.",
            category: "beauty"
        },
        {
            id: 8,
            title: "Mobile World",
            discount: "15% Off on Smartphones",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "2.3 km",
            shop: "Mobile World",
            description: "Latest smartphones with special discounts.",
            category: "electronics"
        },
        {
            id: 9,
            title: "Coffee Corner",
            discount: "50% Off on All Beverages",
            image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "0.5 km",
            shop: "Coffee Corner",
            description: "Refreshing beverages at half price.",
            category: "food"
        },
        {
            id: 10,
            title: "Furniture Mart",
            discount: "40% Off on Home Furniture",
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            location: "Kalaburagi",
            distance: "3.2 km",
            shop: "Furniture Mart",
            description: "Quality furniture for your home with great discounts.",
            category: "home"
        }
    ];

    // Display offers function
    function displayOffers(offers, page = 1) {
        console.log('Displaying offers:', offers.length);
        const offersGrid = document.getElementById('allOffersGrid');
        
        if (!offersGrid) {
            console.error('Offers grid element not found!');
            return;
        }
        
        const startIndex = (page - 1) * offersPerPage;
        const endIndex = startIndex + offersPerPage;
        const paginatedOffers = offers.slice(startIndex, endIndex);
        
        offersGrid.innerHTML = '';
        
        if (paginatedOffers.length === 0) {
            offersGrid.innerHTML = `
                <div class="no-offers" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>No offers found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }
        
        paginatedOffers.forEach(offer => {
            console.log('Creating card for offer ID:', offer.id, offer.title);
            
            const offerCard = document.createElement('div');
            offerCard.className = 'offer-card';
            offerCard.style.cursor = 'pointer';
            
            offerCard.addEventListener('click', () => {
                console.log('Clicked offer ID:', offer.id);
                viewOfferDetails(offer.id);
            });
            
            offerCard.innerHTML = `
                <div class="offer-img" style="background-image: url('${offer.image}')"></div>
                <div class="offer-content">
                    <h3 class="offer-title">${offer.title}</h3>
                    <p class="offer-discount">${offer.discount}</p>
                    <p style="color: var(--gray); font-size: 14px; margin: 5px 0;">
                        <i class="fas fa-map-marker-alt"></i> ${offer.distance} away
                    </p>
                    <button class="get-directions" onclick="event.stopPropagation(); getDirections('${offer.title}')">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                </div>
            `;
            offersGrid.appendChild(offerCard);
        });
        
        updatePagination(offers.length, page);
    }

    // Function to handle offer clicks
    function viewOfferDetails(offerId) {
        console.log('Navigating to offer details for ID:', offerId);
        window.location.href = `offer-details.html?id=${offerId}`;
    }

    // Load offers from Supabase
    async function loadOffersFromSupabase() {
        console.log('Starting to load offers from Supabase...');
        
        // Test connection first
        const connectionTest = await window.supabaseClient.testConnection();
        if (!connectionTest) {
            console.log('Supabase connection failed, using fallback data');
            showNotification('Using demo data (database connection failed)', 'info');
            return fallbackOffers;
        }
        
        try {
            console.log('Fetching offers data...');
            const { data, error } = await window.supabaseClient.data.getOffers();
            
            if (error) {
                console.error('Error fetching offers:', error);
                showNotification('Error loading offers: ' + error.message, 'error');
                return fallbackOffers;
            }
            
            if (!data || data.length === 0) {
                console.log('No offers found in database');
                showNotification('No offers in database, using demo data', 'info');
                return fallbackOffers;
            }
            
            console.log('Successfully loaded offers from Supabase:', data.length);
            
            // Transform the data
            const transformedOffers = data.map(offer => ({
                id: offer.id,
                title: offer.shops?.name || offer.title || 'Unknown Shop',
                discount: offer.discount || 'Special Offer',
                image: offer.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                location: offer.shops?.location || 'Kalaburagi',
                distance: (Math.random() * 3 + 0.5).toFixed(1) + ' km',
                shop: offer.shops?.name || 'Local Shop',
                description: offer.description || 'Great deal available now!',
                category: offer.category || 'general'
            }));
            
            console.log(`Loaded ${transformedOffers.length} offers from database`);
            return transformedOffers;
            
        } catch (error) {
            console.error('Unexpected error:', error);
            showNotification('Unexpected error: ' + error.message, 'error');
            return fallbackOffers;
        }
    }

    // Update pagination
    function updatePagination(totalOffers, currentPage) {
        console.log(`Pagination: ${totalOffers} offers, page ${currentPage}`);
        
        const totalPages = Math.ceil(totalOffers / offersPerPage);
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const paginationNumbers = document.getElementById('paginationNumbers');
        
        if (!prevBtn || !nextBtn || !paginationNumbers) {
            console.log('Pagination elements not found');
            return;
        }
        
        // Update previous button
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayOffers(filteredOffers.length > 0 ? filteredOffers : allOffers, currentPage);
            }
        };
        
        // Update next button
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayOffers(filteredOffers.length > 0 ? filteredOffers : allOffers, currentPage);
            }
        };
        
        // Update page numbers
        paginationNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-number ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                currentPage = i;
                displayOffers(filteredOffers.length > 0 ? filteredOffers : allOffers, currentPage);
            };
            paginationNumbers.appendChild(pageBtn);
        }
    }

    // Get directions function
    function getDirections(shopName) {
        alert(`Opening directions to ${shopName}`);
        // In a real app, this would open Google Maps
        // const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopName + ' Kalaburagi')}`;
        // window.open(mapsUrl, '_blank');
    }

    // Simple notification function
    function showNotification(message, type = 'info') {
        console.log('Notification:', message);
        
        // Ensure toast container exists
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast notification using CSS classes
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        
        // Set background color based on type using CSS variables
        let bgColor;
        switch(type) {
            case 'error':
                bgColor = 'var(--danger)';
                break;
            case 'success':
                bgColor = 'var(--success)';
                break;
            case 'info':
            default:
                bgColor = 'var(--primary)';
                break;
        }
        
        toast.style.background = bgColor;
        toast.style.color = 'white';
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('DOM loaded, initializing offers page...');
        
        // Load offers
        allOffers = await loadOffersFromSupabase();
        filteredOffers = [...allOffers];
        console.log('Final offers to display:', allOffers);
        
        // Display offers
        displayOffers(allOffers, currentPage);
        
        // Setup search functionality
        const searchInput = document.getElementById('offerSearch');
        const searchButton = document.querySelector('.search-filter button');
        
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                currentPage = 1;
                const searchTerm = this.value.toLowerCase();
                filteredOffers = allOffers.filter(offer => 
                    offer.title.toLowerCase().includes(searchTerm) ||
                    offer.discount.toLowerCase().includes(searchTerm) ||
                    offer.shop.toLowerCase().includes(searchTerm) ||
                    offer.category.toLowerCase().includes(searchTerm)
                );
                displayOffers(filteredOffers, currentPage);
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const searchInput = document.getElementById('offerSearch');
                if (searchInput) {
                    currentPage = 1;
                    const searchTerm = searchInput.value.toLowerCase();
                    filteredOffers = allOffers.filter(offer => 
                        offer.title.toLowerCase().includes(searchTerm) ||
                        offer.discount.toLowerCase().includes(searchTerm) ||
                        offer.shop.toLowerCase().includes(searchTerm) ||
                        offer.category.toLowerCase().includes(searchTerm)
                    );
                    displayOffers(filteredOffers, currentPage);
                }
            });
        }
        
        // Setup city filter
        const cityFilter = document.getElementById('cityFilter');
        if (cityFilter) {
            cityFilter.addEventListener('change', function() {
                currentPage = 1;
                const city = this.value;
                if (city) {
                    filteredOffers = allOffers.filter(offer => 
                        offer.location.toLowerCase().includes(city.toLowerCase())
                    );
                } else {
                    filteredOffers = [...allOffers];
                }
                displayOffers(filteredOffers, currentPage);
            });
        }
        
        // Setup sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', function() {
                currentPage = 1;
                const sortBy = this.value;
                
                let sortedOffers = [...(filteredOffers.length > 0 ? filteredOffers : allOffers)];
                
                switch(sortBy) {
                    case 'popular':
                        // Sort by some popularity metric (random for demo)
                        sortedOffers.sort(() => Math.random() - 0.5);
                        break;
                    case 'discount':
                        // Sort by discount percentage (extract number from discount text)
                        sortedOffers.sort((a, b) => {
                            const discountA = parseInt(a.discount.match(/\d+/)?.[0] || 0);
                            const discountB = parseInt(b.discount.match(/\d+/)?.[0] || 0);
                            return discountB - discountA;
                        });
                        break;
                    case 'distance':
                        // Sort by distance
                        sortedOffers.sort((a, b) => {
                            const distA = parseFloat(a.distance);
                            const distB = parseFloat(b.distance);
                            return distA - distB;
                        });
                        break;
                    default:
                        // Latest (original order)
                        break;
                }
                
                displayOffers(sortedOffers, currentPage);
            });
        }
    });
}