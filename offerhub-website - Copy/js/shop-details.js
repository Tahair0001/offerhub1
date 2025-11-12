// Check if this script has already run
if (window.shopDetailsScriptLoaded) {
    console.log('Shop details script already loaded, skipping...');
} else {
    window.shopDetailsScriptLoaded = true;

    console.log('Shop-details.js loaded - initializing...');

    // Function to get shop ID from URL
    function getShopIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // Function to load and display shop data
    async function loadShopDetails(shopId) {
        console.log('Loading shop details for ID:', shopId);

        try {
            // Test connection first
            const connectionTest = await window.supabaseClient.testConnection();
            if (!connectionTest) {
                showNotification('Database connection failed', 'error');
                return;
            }

            let shop;
            
            if (shopId && shopId !== 'null' && shopId !== 'demo-shop-id') {
                // Get specific shop by ID
                const { data: shopData, error } = await window.supabaseClient.data.getShopDetails(shopId);
                if (error) {
                    console.error('Error loading specific shop:', error);
                    shop = await getFirstShop();
                } else {
                    shop = shopData;
                }
            } else {
                // Use first shop for demo
                shop = await getFirstShop();
            }

            if (!shop) {
                console.error('No shop found');
                showNotification('Shop not found', 'error');
                return;
            }

            console.log('Loaded shop:', shop);

            // Safely update shop info in UI
            safeSetTextContent('shopName', shop.name);
            safeSetTextContent('shopNameBreadcrumb', shop.name);
            safeSetTextContent('shopLocation', shop.location);
            safeSetTextContent('shopDescription', shop.description || 'No description available.');

            // Load shop offers and reviews
            await Promise.all([
                loadShopOffers(shop.id),
                loadShopReviews(shop.id)
            ]);

            console.log(`Loaded ${shop.name} with real data!`);

        } catch (error) {
            console.error('Error in loadShopDetails:', error);
            showNotification('Error loading shop details: ' + error.message, 'error');
        }
    }

    // Helper function to safely set text content
    function safeSetTextContent(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`Element with id '${elementId}' not found`);
        }
    }

    // Get first shop as fallback
    async function getFirstShop() {
        try {
            const { data: shops, error } = await window.supabaseClient.data.getShops();
            if (error || !shops || shops.length === 0) {
                return null;
            }
            return shops[0];
        } catch (error) {
            console.error('Error getting first shop:', error);
            return null;
        }
    }

    // Load shop offers
    async function loadShopOffers(shopId) {
        try {
            const { data: offers, error } = await window.supabaseClient.data.getShopOffers(shopId);
            
            if (error) {
                console.error('Error loading shop offers:', error);
                return;
            }

            displayShopOffers(offers || []);
            
        } catch (error) {
            console.error('Error in loadShopOffers:', error);
        }
    }

    // Load shop reviews
    async function loadShopReviews(shopId) {
        try {
            const { data: reviews, error } = await window.supabaseClient.data.getShopReviews(shopId);
            
            if (error) {
                console.error('Error loading shop reviews:', error);
                return;
            }

            displayShopReviews(reviews || []);
            
        } catch (error) {
            console.error('Error in loadShopReviews:', error);
        }
    }

    // Display shop offers
    function displayShopOffers(offers) {
        const offersGrid = document.getElementById('shopOffersGrid');
        const offersCount = document.getElementById('offersCount');
        
        if (!offersGrid) {
            console.warn('Shop offers grid not found');
            return;
        }

        if (offers.length === 0) {
            offersGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-tag" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <h3>No Active Offers</h3>
                    <p>This shop doesn't have any active offers at the moment.</p>
                </div>
            `;
            safeSetTextContent('offersCount', '0 active offers');
            return;
        }

        offersGrid.innerHTML = '';
        safeSetTextContent('offersCount', `${offers.length} active offers`);

        offers.forEach(offer => {
            const offerCard = document.createElement('div');
            offerCard.className = 'shop-offer-card';
            offerCard.innerHTML = `
                <h4>${offer.title}</h4>
                <p class="shop-offer-discount">${offer.discount}</p>
                <p style="color: #666; margin-bottom: 15px;">${offer.description || 'Special offer available'}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: #888;">
                        <i class="fas fa-calendar"></i> 
                        Added: ${new Date(offer.created_at).toLocaleDateString()}
                    </small>
                    <button class="btn btn-primary btn-sm" onclick="useOffer('${offer.id}', '${offer.title}')">
                        Use Offer
                    </button>
                </div>
            `;
            offersGrid.appendChild(offerCard);
        });

        console.log('Displayed', offers.length, 'shop offers');
    }

    // Display shop reviews
    function displayShopReviews(reviews) {
        const reviewsContainer = document.getElementById('reviewsContainer');
        const ratingText = document.getElementById('shopRatingText');
        
        if (!reviewsContainer) {
            console.warn('Reviews container not found');
            return;
        }

        // Calculate average rating
        const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0;

        // Update rating display
        updateRatingStars(averageRating);
        safeSetTextContent('shopRatingText', `${averageRating.toFixed(1)} (${reviews.length} reviews)`);

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to review this shop!</p>
                </div>
            `;
            return;
        }

        reviewsContainer.innerHTML = '';
        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            
            // Generate star rating HTML
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= review.rating) {
                    starsHtml += '<i class="fas fa-star"></i>';
                } else {
                    starsHtml += '<i class="far fa-star"></i>';
                }
            }
            
            reviewCard.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${getInitials(review.customer_name)}</div>
                        <div class="reviewer-details">
                            <h4>${review.customer_name}</h4>
                            <span class="review-date">${formatDate(review.created_at)}</span>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${starsHtml}
                    </div>
                </div>
                <div class="review-text">
                    ${review.comment || 'No comment provided.'}
                </div>
            `;
            reviewsContainer.appendChild(reviewCard);
        });

        console.log('Displayed', reviews.length, 'shop reviews');
    }

    // Helper functions
    function getInitials(name) {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function updateRatingStars(rating) {
        const starsContainer = document.getElementById('shopStars');
        if (!starsContainer) return;

        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        starsContainer.innerHTML = starsHtml;
    }

    // Global functions
    window.useOffer = function(offerId, offerTitle) {
        showNotification(`Show this offer to shop staff: "${offerTitle}"`, 'success');
    };

    // Setup event listeners
    function setupEventListeners() {
        // Get Directions button
        const directionsBtn = document.getElementById('getDirectionsBtn');
        if (directionsBtn) {
            directionsBtn.addEventListener('click', function() {
                const shopName = document.getElementById('shopName').textContent;
                showNotification(`Opening directions to ${shopName}`, 'info');
            });
        }

        // Save Shop button
        const saveShopBtn = document.getElementById('saveShopBtn');
        if (saveShopBtn) {
            saveShopBtn.addEventListener('click', function() {
                const icon = saveShopBtn.querySelector('i');
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    saveShopBtn.innerHTML = '<i class="fas fa-heart"></i> Saved';
                    showNotification('Shop saved to your favorites!', 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    saveShopBtn.innerHTML = '<i class="far fa-heart"></i> Save Shop';
                    showNotification('Shop removed from favorites', 'info');
                }
            });
        }

        // Write Review button
        const writeReviewBtn = document.getElementById('writeReviewBtn');
        if (writeReviewBtn) {
            writeReviewBtn.addEventListener('click', function() {
                showNotification('Review form would open here. Users can rate and comment.', 'info');
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
        console.log('DOM loaded, initializing shop details page...');
        
        // Get shop ID from URL
        const shopId = getShopIdFromURL();
        console.log('Shop ID from URL:', shopId);
        
        // Load shop data
        await loadShopDetails(shopId);
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('Shop details page initialized');
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification button {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
}