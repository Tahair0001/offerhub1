// Common functions for all pages - Navigation, Auth, and UI consistency

// Check authentication status and update header
async function checkAuthStatus() {
    try {
        if (!window.supabaseClient) {
            console.log('Supabase client not ready yet');
            return;
        }

        const { data: { user }, error } = await window.supabaseClient.auth.getCurrentUser();
        
        if (error) {
            console.log('Auth check error:', error);
            updateHeaderForGuest();
            return;
        }
        
        if (user) {
            // User is logged in - update UI
            updateHeaderForUser(user);
        } else {
            updateHeaderForGuest();
        }
    } catch (error) {
        console.log('Auth check failed:', error);
        updateHeaderForGuest();
    }
}

// Update header for logged-in user
function updateHeaderForUser(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    // Get user type from user metadata
    const userType = user.user_metadata?.user_type || 'customer';
    const displayName = user.user_metadata?.full_name || user.user_metadata?.shop_name || user.email?.split('@')[0] || 'User';
    
    if (userType === 'shop_owner') {
        authButtons.innerHTML = `
            <span style="color: var(--primary-color, #2563eb); margin-right: 10px; font-weight: 500;">Hi, ${displayName}</span>
            <button class="btn btn-outline" id="logoutBtn">Log Out</button>
            <button class="btn btn-primary" onclick="window.location.href='shop-dashboard.html'">Dashboard</button>
        `;
    } else {
        authButtons.innerHTML = `
            <span style="color: var(--primary-color, #2563eb); margin-right: 10px; font-weight: 500;">Hi, ${displayName}</span>
            <button class="btn btn-outline" id="logoutBtn">Log Out</button>
        `;
    }
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            await handleLogout();
        });
    }
}

// Update header for guest user
function updateHeaderForGuest() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    // Check if we're on login page - don't override (it has its own button)
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    // Check if auth buttons already have login/signup buttons
    const hasLoginBtn = authButtons.querySelector('button[onclick*="login.html"]');
    if (hasLoginBtn) {
        return; // Already has login buttons, don't override
    }
    
    authButtons.innerHTML = `
        <button class="btn btn-outline" onclick="window.location.href='login.html'">Log In</button>
        <button class="btn btn-primary" onclick="window.location.href='login.html?action=signup'">Sign Up</button>
    `;
}

// Handle logout
async function handleLogout() {
    try {
        if (window.supabaseClient && window.supabaseClient.auth) {
            await window.supabaseClient.auth.signOut();
        }
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if logout fails
        window.location.href = 'index.html';
    }
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set active nav link
    setActiveNavLink();
    
    // Check auth status after a short delay to ensure supabase is loaded
    setTimeout(() => {
        checkAuthStatus();
    }, 500);
    
    // Re-check auth status when page becomes visible (user might have logged in/out in another tab)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            checkAuthStatus();
        }
    });
});

// Export functions for use in other scripts
window.checkAuthStatus = checkAuthStatus;
window.handleLogout = handleLogout;
window.setActiveNavLink = setActiveNavLink;
