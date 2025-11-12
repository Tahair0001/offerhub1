// Sample shop offers data
let shopOffers = [];
let editingOfferId = null; // Track which offer is being edited

// Function to display offers in the table
function displayOffersTable() {
    const tableBody = document.querySelector('#offersTable tbody');
    const offersCount = document.querySelector('.offers-count');
    
    if (shopOffers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-offers">
                    <i class="fas fa-inbox"></i>
                    <p>No offers yet. Create your first offer!</p>
                </td>
            </tr>
        `;
        offersCount.textContent = '0 active offers';
        return;
    }
    
    const activeOffers = shopOffers.filter(offer => offer.status === 'active').length;
    offersCount.textContent = `${activeOffers} active offers`;
    
    tableBody.innerHTML = '';
    
    shopOffers.forEach(offer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${offer.title}</strong>
                ${offer.description ? `<br><small style="color: #666;">${offer.description}</small>` : ''}
            </td>
            <td>
                <span class="offer-discount">${offer.discount}</span>
            </td>
            <td>
                <span class="status-badge status-${offer.status}">
                    ${offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-edit" onclick="editOffer(${offer.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-sm btn-delete" onclick="deleteOffer(${offer.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to add a new offer
function addNewOffer(offerData) {
    const newOffer = {
        id: shopOffers.length > 0 ? Math.max(...shopOffers.map(o => o.id)) + 1 : 1,
        title: offerData.title,
        discount: offerData.discount,
        description: offerData.description,
        status: 'active',
        image: offerData.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    shopOffers.unshift(newOffer);
    displayOffersTable();
    
    // Show success message
    showNotification('Offer added successfully!', 'success');
}

// Function to edit an offer
function editOffer(offerId) {
    const offer = shopOffers.find(o => o.id === offerId);
    if (offer) {
        // Store the offer ID being edited
        editingOfferId = offerId;
        
        // Populate form with offer data
        document.getElementById('offerTitle').value = offer.title;
        document.getElementById('offerDiscount').value = offer.discount;
        document.getElementById('offerDescription').value = offer.description || '';
        
        // Update form button text
        const submitBtn = document.querySelector('#offerForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Offer';
        }
        
        // Scroll to form
        document.getElementById('offerForm').scrollIntoView({ behavior: 'smooth' });
        
        showNotification('Offer loaded into form. Update and submit to save changes.', 'info');
    }
}

// Make editOffer globally accessible
window.editOffer = editOffer;

// Function to delete an offer
async function deleteOffer(offerId) {
    if (confirm('Are you sure you want to delete this offer?')) {
        try {
            // Try to delete from Supabase
            if (window.supabaseClient && window.supabaseClient.supabase) {
                const { error } = await window.supabaseClient.supabase
                    .from('offers')
                    .delete()
                    .eq('id', offerId);
                
                if (error) {
                    console.error('Error deleting offer:', error);
                    showNotification('Error deleting offer from database', 'error');
                } else {
                    showNotification('Offer deleted successfully!', 'success');
                    // Reload offers
                    const { data: { user } } = await window.supabaseClient.auth.getCurrentUser();
                    if (user) {
                        await loadShopOffers(user.id);
                    }
                }
            } else {
                // Fallback: delete from local array
                shopOffers = shopOffers.filter(offer => offer.id !== offerId);
                displayOffersTable();
                showNotification('Offer deleted successfully!', 'success');
            }
        } catch (error) {
            console.error('Error in deleteOffer:', error);
            showNotification('Error deleting offer', 'error');
        }
    }
}

// Make deleteOffer globally accessible
window.deleteOffer = deleteOffer;

// Function to show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication first
    await checkDashboardAuth();
    
    // Display initial offers
    displayOffersTable();
    
    // Handle offer form submission
    const offerForm = document.getElementById('offerForm');
    if (offerForm) {
        offerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('offerTitle').value;
            const discount = document.getElementById('offerDiscount').value;
            const description = document.getElementById('offerDescription').value;
            const imageFile = document.getElementById('offerImage').files[0];
            const locationUrl = document.getElementById('locationUrl').value;
            
            // Basic validation
            if (!title || !discount) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Create offer data
            const offerData = {
                title,
                discount,
                description,
                locationUrl
            };
            
            // Handle image upload (in a real app, you would upload to server)
            if (imageFile) {
                // For demo, we'll just use a placeholder
                offerData.image = URL.createObjectURL(imageFile);
            }
            
            // Check if we're editing an existing offer
            if (editingOfferId) {
                // Update existing offer
                const updated = await updateOfferInSupabase(editingOfferId, offerData);
                if (updated) {
                    editingOfferId = null;
                    // Reset form button
                    const submitBtn = document.querySelector('#offerForm button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Submit Offer';
                    }
                }
            } else {
                // Save new offer to Supabase
                const saved = await saveOfferToSupabase(offerData);
                
                if (saved) {
                    // Offer was saved to database, offers will be reloaded by saveOfferToSupabase
                } else {
                    // If save failed, still add to local array for demo purposes
                    addNewOffer(offerData);
                }
            }
            
            // Reset the form
            offerForm.reset();
            editingOfferId = null;
            
            // Reset image upload button
            const uploadBtn = document.querySelector('.upload-btn');
            if (uploadBtn) {
                uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Choose Image';
                uploadBtn.style.borderColor = '#ddd';
                uploadBtn.style.background = '#f8fafc';
            }
            
            // Reset form button text
            const submitBtn = document.querySelector('#offerForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Submit Offer';
            }
        });
    }
    
    // Edit shop info button
    const editShopBtn = document.getElementById('editShopBtn');
    if (editShopBtn) {
        editShopBtn.addEventListener('click', function() {
            alert('Edit Shop Info form would open here in a real application.');
        });
    }
    
    // Logout button is handled by common.js, but we can add custom handling here if needed
    // The common.js will handle logout and redirect
    
    // Image upload preview (basic implementation)
    const imageUpload = document.getElementById('offerImage');
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                const uploadBtn = document.querySelector('.upload-btn');
                uploadBtn.innerHTML = `<i class="fas fa-check"></i> ${fileName}`;
                uploadBtn.style.borderColor = '#4CAF50';
                uploadBtn.style.background = '#E8F5E8';
            }
        });
    }
});

// Check dashboard authentication
async function checkDashboardAuth() {
    try {
        if (!window.supabaseClient) {
            console.log('Supabase client not ready');
            setTimeout(checkDashboardAuth, 500);
            return;
        }

        const { data: { user }, error } = await window.supabaseClient.auth.getCurrentUser();
        
        if (error || !user) {
            // User is not authenticated, redirect to login
            showNotification('Please log in to access the dashboard', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // User is authenticated, update UI with user info
        await updateDashboardUserInfo(user);
        await loadShopOffers(user.id);
        
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
    }
}

// Update dashboard with user info
async function updateDashboardUserInfo(user) {
    const userWelcome = document.querySelector('.user-welcome');
    const shopName = document.querySelector('.shop-info-card h2');
    const shopLocation = document.querySelector('.shop-details p');
    
    if (userWelcome) {
        const displayName = user.user_metadata?.shop_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        userWelcome.textContent = `Hi, ${displayName}!`;
    }
    
    // Try to load shop info from database
    try {
        const { data: shops, error } = await window.supabaseClient.data.getShops();
        if (!error && shops) {
            const userShop = shops.find(shop => shop.owner_id === user.id);
            if (userShop) {
                if (shopName) {
                    shopName.textContent = userShop.name;
                }
                if (shopLocation) {
                    shopLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${userShop.location || 'Kalaburagi, Karnataka'}`;
                }
                return;
            }
        }
    } catch (error) {
        console.error('Error loading shop info:', error);
    }
    
    // Fallback to user metadata
    if (shopName && user.user_metadata?.shop_name) {
        shopName.textContent = user.user_metadata.shop_name;
    }
}

// Load shop offers for the logged-in user
async function loadShopOffers(userId) {
    try {
        // Get shop for this user
        const { data: shops, error } = await window.supabaseClient.data.getShops();
        if (error || !shops) {
            console.log('No shops found for user');
            return;
        }
        
        // Find shop owned by this user
        const userShop = shops.find(shop => shop.owner_id === userId);
        if (!userShop) {
            console.log('No shop found for this user');
            // Store userShopId for later use
            window.currentUserShopId = null;
            return;
        }
        
        // Store shop ID for creating offers
        window.currentUserShopId = userShop.id;
        
        // Load offers for this shop
        const { data: offers, error: offersError } = await window.supabaseClient.data.getShopOffers(userShop.id);
        if (!offersError && offers) {
            // Update shopOffers array
            shopOffers = offers.map(offer => ({
                id: offer.id,
                title: offer.title,
                discount: offer.discount,
                description: offer.description,
                status: offer.status || 'active',
                image: offer.image_url,
                createdAt: offer.created_at
            }));
            displayOffersTable();
        }
    } catch (error) {
        console.error('Error loading shop offers:', error);
    }
}

// Save offer to Supabase
async function saveOfferToSupabase(offerData) {
    try {
        if (!window.currentUserShopId) {
            console.error('No shop ID found for user');
            showNotification('Unable to save offer: Shop not found', 'error');
            return false;
        }

        const offerToSave = {
            shop_id: window.currentUserShopId,
            title: offerData.title,
            discount: offerData.discount,
            description: offerData.description || '',
            status: 'active',
            image_url: offerData.image || null,
            category: 'general' // You can add category selection to the form
        };

        const { data, error } = await window.supabaseClient.data.addOffer(offerToSave);
        
        if (error) {
            console.error('Error saving offer:', error);
            showNotification('Error saving offer to database: ' + error.message, 'error');
            return false;
        } else {
            console.log('Offer saved successfully:', data);
            showNotification('Offer saved successfully!', 'success');
            
            // Reload offers from database
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getCurrentUser();
                if (user) {
                    await loadShopOffers(user.id);
                }
            }
            return true;
        }
    } catch (error) {
        console.error('Error in saveOfferToSupabase:', error);
        showNotification('Error saving offer', 'error');
        return false;
    }
}

// Update offer in Supabase
async function updateOfferInSupabase(offerId, offerData) {
    try {
        if (!window.supabaseClient || !window.supabaseClient.supabase) {
            showNotification('Database connection not available', 'error');
            return false;
        }

        const offerToUpdate = {
            title: offerData.title,
            discount: offerData.discount,
            description: offerData.description || '',
            image_url: offerData.image || null
        };

        const { data, error } = await window.supabaseClient.supabase
            .from('offers')
            .update(offerToUpdate)
            .eq('id', offerId)
            .select();
        
        if (error) {
            console.error('Error updating offer:', error);
            showNotification('Error updating offer: ' + error.message, 'error');
            return false;
        } else {
            console.log('Offer updated successfully:', data);
            showNotification('Offer updated successfully!', 'success');
            
            // Reload offers from database
            const { data: { user } } = await window.supabaseClient.auth.getCurrentUser();
            if (user) {
                await loadShopOffers(user.id);
            }
            return true;
        }
    } catch (error) {
        console.error('Error in updateOfferInSupabase:', error);
        showNotification('Error updating offer', 'error');
        return false;
    }
}

// Add CSS for slideIn animation
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