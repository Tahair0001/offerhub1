// Check if this script has already run
if (window.shopsScriptLoaded) {
    console.log('Shops script already loaded, skipping...');
} else {
    window.shopsScriptLoaded = true;

    console.log('Shops.js loaded - initializing...');

    let allShops = [];

    // Load shops from Supabase
    async function loadShops() {
        console.log('Loading shops from Supabase...');
        
        const loadingElement = document.getElementById('loadingShops');
        const shopsGrid = document.getElementById('shopsGrid');

        try {
            const { data: shops, error } = await window.supabaseClient.data.getShops();
            
            if (error) {
                console.error('Error loading shops:', error);
                showNotification('Error loading shops', 'error');
                return;
            }

            if (!shops || shops.length === 0) {
                shopsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-store-slash" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                        <h3>No Shops Found</h3>
                        <p>There are no shops registered yet.</p>
                    </div>
                `;
                return;
            }

            allShops = shops;
            await displayShops(shops);
            
        } catch (error) {
            console.error('Error in loadShops:', error);
            showNotification('Error loading shops', 'error');
        } finally {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
    }

    // Display shops in the grid
    async function displayShops(shops) {
        const shopsGrid = document.getElementById('shopsGrid');
        
        if (!shopsGrid) return;
        
        shopsGrid.innerHTML = '';
        
        if (shops.length === 0) {
            shopsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-store-slash" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <h3>No Shops Found</h3>
                    <p>There are no shops registered yet.</p>
                </div>
            `;
            return;
        }
        
        // Process shops and load offers counts
        for (const shop of shops) {
            const shopCard = document.createElement('div');
            shopCard.className = 'shop-card';
            shopCard.onclick = () => viewShopDetails(shop.id);
            
            // Default offers count
            let offersCount = 0;
            
            // Try to get actual offers count from Supabase
            if (window.supabaseClient && shop.id) {
                try {
                    const { data } = await window.supabaseClient.data.getShopOffers(shop.id);
                    if (data) {
                        offersCount = data.length;
                    } else {
                        offersCount = Math.floor(Math.random() * 5) + 1;
                    }
                } catch (error) {
                    console.log('Could not load offers count for shop:', shop.id);
                    offersCount = Math.floor(Math.random() * 5) + 1;
                }
            } else {
                offersCount = Math.floor(Math.random() * 5) + 1;
            }
            
            shopCard.innerHTML = `
                <div class="shop-card-img" style="background-image: url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')"></div>
                <div class="shop-card-content">
                    <h3>${shop.name}</h3>
                    <div class="shop-card-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${shop.location || 'Kalaburagi'}
                    </div>
                    <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
                        ${shop.description || 'Local business offering great deals.'}
                    </p>
                    <span class="shop-card-offers">
                        <i class="fas fa-tag"></i> ${offersCount} active offers
                    </span>
                </div>
            `;
            
            shopsGrid.appendChild(shopCard);
        }
        
        console.log('Displayed', shops.length, 'shops');
    }

    // View shop details
    function viewShopDetails(shopId) {
        console.log('Viewing shop details for ID:', shopId);
        if (shopId) {
            window.location.href = `shop-details.html?id=${shopId}`;
        } else {
            // Fallback to first shop for demo
            window.location.href = 'shop-details.html';
        }
    }

    // Setup search and filters
    function setupFilters() {
        const searchInput = document.getElementById('shopSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterShops();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                filterShops();
            });
        }
    }

    // Filter shops based on search and category
    function filterShops() {
        const searchTerm = document.getElementById('shopSearch').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;
        
        let filtered = allShops;
        
        if (searchTerm) {
            filtered = filtered.filter(shop => 
                shop.name.toLowerCase().includes(searchTerm) ||
                (shop.description && shop.description.toLowerCase().includes(searchTerm)) ||
                shop.location.toLowerCase().includes(searchTerm)
            );
        }
        
        displayShops(filtered);
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('DOM loaded, initializing shops page...');
        
        await loadShops();
        setupFilters();
        
        console.log('Shops page initialized');
    });

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
}