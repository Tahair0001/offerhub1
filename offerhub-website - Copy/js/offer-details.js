// Check if this script has already run
if (window.offerDetailsScriptLoaded) {
    console.log('Offer details script already loaded, skipping...');
} else {
    window.offerDetailsScriptLoaded = true;

    console.log('Offer-details.js loaded - initializing...');

    // Function to get offer ID from URL
    function getOfferIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Sample offer data with ALL unique offers
    const sampleOffers = {
        1: {
            id: 1,
            title: "Fashion Street, Kalaburagi",
            discount: "Flat 40% Off on Men's Wear",
            description: "Get amazing discounts on our latest collection. Perfect for summer fashion with trendy designs and comfortable fabrics.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            shop: "Fashion Street",
            location: "Kalaburagi",
            category: "fashion",
            validUntil: "December 31, 2023",
            businessHours: "10:00 AM - 9:00 PM",
            shopDescription: "Leading fashion retailer in Kalaburagi offering the latest trends in clothing and accessories."
        },
        2: {
            id: 2,
            title: "Funn-Offer",
            discount: "Flat 60% Off on All Games",
            description: "Exciting entertainment offers with huge discounts. Perfect for family fun and weekend activities.",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            shop: "Funn-Offer",
            location: "Kalaburagi",
            category: "entertainment",
            validUntil: "November 30, 2023",
            businessHours: "11:00 AM - 11:00 PM",
            shopDescription: "Your go-to destination for entertainment and fun activities in the city."
        },
        3: {
            id: 3,
            title: "Electro World",
            discount: "30% Off on Electronics",
            description: "Latest electronics with amazing discounts. From smartphones to home appliances with warranty.",
            image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            shop: "Electro World",
            location: "Kalaburagi",
            category: "electronics",
            validUntil: "January 15, 2024",
            businessHours: "9:00 AM - 8:00 PM",
            shopDescription: "Premium electronics store offering the latest gadgets and home appliances."
        },
        4: {
            id: 4,
            title: "Food Paradise",
            discount: "Buy 1 Get 1 Free",
            description: "Delicious food offers with buy one get one free on selected items. Perfect for food lovers.",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            shop: "Food Paradise",
            location: "Kalaburagi",
            category: "food",
            validUntil: "December 15, 2023",
            businessHours: "8:00 AM - 11:00 PM",
            shopDescription: "Popular restaurant serving delicious cuisine with great ambiance."
        },
        5: {
            id: 5,
            title: "Sports Zone",
            discount: "25% Off on Sports Gear",
            description: "Get fit with our amazing sports gear discounts. Perfect for athletes and fitness enthusiasts.",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            shop: "Sports Zone",
            location: "Kalaburagi",
            category: "sports",
            validUntil: "January 31, 2024",
            businessHours: "7:00 AM - 10:00 PM",
            shopDescription: "Complete sports equipment store for all your fitness needs."
        }
    };

    // Load and display offer details
    async function loadOfferDetails(offerId) {
        console.log('Loading offer details for ID:', offerId);

        try {
            let offer;
            
            // Try to load from Supabase first
            if (offerId && window.supabaseClient) {
                try {
                    const connectionTest = await window.supabaseClient.testConnection();
                    if (connectionTest) {
                        const { data, error } = await window.supabaseClient.data.getOfferById(offerId);
                        if (!error && data) {
                            // Transform Supabase data to match our format
                            offer = {
                                id: data.id,
                                title: data.title || data.shops?.name || 'Special Offer',
                                discount: data.discount || 'Special Discount',
                                description: data.description || 'Great deal available now!',
                                image: data.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                                shop: data.shops?.name || 'Local Shop',
                                location: data.shops?.location || 'Kalaburagi',
                                category: data.category || 'general',
                                validUntil: data.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                                businessHours: '10:00 AM - 9:00 PM',
                                shopDescription: data.shops?.description || 'Local business on OfferHub'
                            };
                            console.log('Loaded offer from Supabase:', offer.title);
                        }
                    }
                } catch (supabaseError) {
                    console.log('Supabase load failed, using sample data:', supabaseError);
                }
            }
            
            // Fallback to sample data
            if (!offer) {
                if (offerId && sampleOffers[offerId]) {
                    offer = sampleOffers[offerId];
                    console.log('Found offer in sample data:', offer.title);
                } else {
                    // Use first offer for demo
                    offer = sampleOffers[1];
                    console.log('Using default offer:', offer.title);
                }
            }

            displayOfferDetails(offer);
            loadSimilarOffers(offer.category, offer.id);
            
        } catch (error) {
            console.error('Error loading offer details:', error);
            showNotification('Error loading offer details', 'error');
        }
    }

    // Display offer details in the UI
    function displayOfferDetails(offer) {
        console.log('Displaying offer:', offer.title);
        
        // Update main offer information
        safeSetTextContent('offerMainTitle', offer.title);
        safeSetTextContent('offerSubtitle', offer.discount);
        safeSetTextContent('offerTitleBreadcrumb', offer.title);
        safeSetTextContent('offerDetailTitle', offer.title);
        safeSetTextContent('offerDetailDiscount', offer.discount);
        safeSetTextContent('shopNameSpan', offer.shop);
        safeSetTextContent('locationSpan', offer.location);
        safeSetTextContent('offerDescription', offer.description);
        safeSetTextContent('shopInfo', offer.shopDescription);
        safeSetTextContent('validUntil', offer.validUntil);
        safeSetTextContent('businessHours', offer.businessHours);
        safeSetTextContent('offerCategory', offer.category.charAt(0).toUpperCase() + offer.category.slice(1));

        // Update offer image
        const imageContainer = document.getElementById('offerImageContainer');
        if (imageContainer) {
            imageContainer.innerHTML = `
                <img src="${offer.image}" alt="${offer.title}" style="width: 100%; border-radius: 10px;">
            `;
        }

        console.log('Successfully displayed offer details');
    }

    // Load similar offers
    function loadSimilarOffers(category, currentOfferId) {
        const similarOffersContainer = document.getElementById('similarOffers');
        if (!similarOffersContainer) return;

        // Filter sample offers by category, excluding current offer
        const similarOffers = Object.values(sampleOffers).filter(offer => 
            offer.category === category && offer.id !== currentOfferId
        ).slice(0, 3);

        if (similarOffers.length === 0) {
            similarOffersContainer.innerHTML = '<p>No similar offers found.</p>';
            return;
        }

        similarOffersContainer.innerHTML = '';
        similarOffers.forEach(offer => {
            const offerElement = document.createElement('div');
            offerElement.className = 'similar-offer';
            offerElement.style.cssText = `
                padding: 15px;
                margin-bottom: 10px;
                background: var(--light);
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.2s;
            `;
            offerElement.onmouseenter = () => {
                offerElement.style.transform = 'translateX(5px)';
            };
            offerElement.onmouseleave = () => {
                offerElement.style.transform = 'translateX(0)';
            };
            offerElement.onclick = () => {
                window.location.href = `offer-details.html?id=${offer.id}`;
            };

            offerElement.innerHTML = `
                <strong>${offer.title}</strong>
                <p style="color: var(--secondary); margin: 5px 0; font-weight: 600;">${offer.discount}</p>
                <small style="color: var(--gray);">${offer.shop}</small>
            `;
            similarOffersContainer.appendChild(offerElement);
        });
    }

    // Helper function to safely set text content
    function safeSetTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        } else {
            console.warn('Element not found:', elementId);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Get Directions button
        const directionsBtn = document.getElementById('getDirectionsBtn');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', function() {
                const shopName = document.getElementById('shopNameSpan').textContent;
                showNotification(`Opening directions to ${shopName}`, 'info');
            });
        }

        // Save Offer button
        const saveOfferBtn = document.getElementById('saveOfferBtn');
        if (saveOfferBtn) {
            saveOfferBtn.addEventListener('click', function() {
                const icon = saveOfferBtn.querySelector('i');
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    saveOfferBtn.innerHTML = '<i class="fas fa-heart"></i> Saved';
                    showNotification('Offer saved to your favorites!', 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    saveOfferBtn.innerHTML = '<i class="far fa-heart"></i> Save Offer';
                    showNotification('Offer removed from favorites', 'info');
                }
            });
        }

        // Share Offer button
        const shareOfferBtn = document.getElementById('shareOfferBtn');
        if (shareOfferBtn) {
            shareOfferBtn.addEventListener('click', function() {
                const offerTitle = document.getElementById('offerDetailTitle').textContent;
                const offerDiscount = document.getElementById('offerDetailDiscount').textContent;
                const shareText = `Check out this amazing offer: ${offerTitle} - ${offerDiscount}`;
                
                if (navigator.share) {
                    navigator.share({
                        title: 'OfferHub - Amazing Deal',
                        text: shareText,
                        url: window.location.href
                    });
                } else {
                    navigator.clipboard.writeText(shareText + ' ' + window.location.href);
                    showNotification('Offer link copied to clipboard!', 'success');
                }
            });
        }

        // View Shop button
        const viewShopBtn = document.getElementById('viewShopBtn');
        if (viewShopBtn) {
            viewShopBtn.addEventListener('click', function() {
                // Try to get shop ID from current offer data
                const shopName = document.getElementById('shopNameSpan').textContent;
                // For now, redirect to shops page - in a real app, we'd have shop ID
                window.location.href = 'shops.html';
            });
        }

        // Call Shop button
        const callShopBtn = document.getElementById('callShopBtn');
        if (callShopBtn) {
            callShopBtn.addEventListener('click', function() {
                showNotification('This would initiate a call to the shop', 'info');
            });
        }

        // Message Shop button
        const messageShopBtn = document.getElementById('messageShopBtn');
        if (messageShopBtn) {
            messageShopBtn.addEventListener('click', function() {
                showNotification('This would open a messaging interface', 'info');
            });
        }
    }

    // Notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('DOM loaded, initializing offer details page...');
        
        // Get offer ID from URL
        const offerId = getOfferIdFromURL();
        console.log('Offer ID from URL:', offerId);
        
        // Load offer data
        await loadOfferDetails(offerId);
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('Offer details page initialized');
    });
}