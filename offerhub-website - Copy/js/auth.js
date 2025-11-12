// Check if this script has already run
if (window.authScriptLoaded) {
    console.log('Auth script already loaded, skipping...');
} else {
    window.authScriptLoaded = true;

    console.log('Auth.js loaded - initializing...');

    // Check if we should show signup form
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'signup') {
        showSignupForm();
    }

    // Form toggle functionality
    document.getElementById('showSignup')?.addEventListener('click', function(e) {
        e.preventDefault();
        showSignupForm();
    });

    document.getElementById('showLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });

    function showLoginForm() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('signupForm').classList.remove('active');
        // Clear any previous errors
        clearFormErrors();
    }

    function showSignupForm() {
        document.getElementById('signupForm').classList.add('active');
        document.getElementById('loginForm').classList.remove('active');
        // Clear any previous errors
        clearFormErrors();
    }

    // Clear form errors
    function clearFormErrors() {
        document.querySelectorAll('.form-error').forEach(error => error.remove());
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
    }

    // Show form error
    function showFormError(inputId, message) {
        const input = document.getElementById(inputId);
        const formGroup = input.closest('.form-group');
        
        // Remove existing error
        const existingError = formGroup.querySelector('.form-error');
        if (existingError) existingError.remove();
        
        // Add error class
        formGroup.classList.add('error');
        
        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #f44336;
            font-size: 14px;
            margin-top: 5px;
        `;
        
        formGroup.appendChild(errorElement);
    }

    // Login form submission
    document.getElementById('loginFormElement')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Clear previous errors
        clearFormErrors();
        
        // Basic validation
        if (!email || !password) {
            showFormError('loginEmail', 'Please fill in all fields');
            return;
        }
        
        await handleLogin(email, password);
    });

    // Signup form submission
    document.getElementById('signupFormElement')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const shopName = document.getElementById('signupShopName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        // Clear previous errors
        clearFormErrors();
        
        // Validation
        if (!shopName || !email || !password || !confirmPassword) {
            showFormError('signupShopName', 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showFormError('signupConfirmPassword', 'Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            showFormError('signupPassword', 'Password must be at least 6 characters');
            return;
        }
        
        await handleSignup(email, password, shopName);
    });

    // Handle login - FIXED VERSION
    async function handleLogin(email, password) {
        const submitBtn = document.querySelector('#loginFormElement button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;
        
        try {
            console.log('🔐 Attempting login with:', { email, password });
            
            // FIXED: Use object syntax instead of parameters
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            console.log('📨 Login response:', { data, error });
            
            if (error) {
                // Show user-friendly error messages
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Invalid email or password. Please try again.');
                } else if (error.message.includes('Email not confirmed')) {
                    throw new Error('Please check your email to confirm your account.');
                } else {
                    throw error;
                }
            }
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = 'shop-dashboard.html';
            }, 1500);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            showNotification(error.message, 'error');
            showFormError('loginEmail', error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Handle signup - FIXED VERSION
    async function handleSignup(email, password, shopName) {
        const submitBtn = document.querySelector('#signupFormElement button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;
        
        try {
            console.log('Attempting signup with:', { email, password, shopName });
            
            // FIXED: Use object syntax like login function and include metadata
            const { data, error } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        shop_name: shopName,
                        user_type: 'shop_owner',
                        full_name: shopName
                    }
                }
            });
            
            console.log('Signup response:', { data, error });
            
            if (error) {
                if (error.message.includes('User already registered')) {
                    throw new Error('An account with this email already exists. Please log in instead.');
                } else {
                    throw error;
                }
            }
            
            if (data && data.user) {
                console.log('User created, creating shop profile...');
                
                // Create shop profile - FIXED COLUMN NAMES
                try {
                    const { error: profileError } = await window.supabaseClient.supabase
                        .from('shops')
                        .insert([
                            {
                                owner_id: data.user.id,    // Changed from user_id to owner_id
                                name: shopName,
                                contact_email: email,      // Changed from email to contact_email
                                location: 'Kalaburagi',
                                description: 'Local business on OfferHub'
                            }
                        ]);

                    if (profileError) {
                        console.error('Error creating shop profile:', profileError);
                        showNotification('Account created! Please log in. (Shop profile setup incomplete)', 'success');
                    } else {
                        console.log('Shop profile created successfully');
                        showNotification('Account created successfully! Please check your email for verification.', 'success');
                    }
                } catch (profileError) {
                    console.error('Error in shop profile creation:', profileError);
                    showNotification('Account created! Please log in. (Shop profile setup incomplete)', 'success');
                }
            } else {
                showNotification('Account created successfully! Please check your email for verification.', 'success');
            }
            
            // Switch to login form after successful signup
            setTimeout(() => {
                showLoginForm();
                document.getElementById('signupFormElement').reset();
            }, 3000);
            
        } catch (error) {
            console.error('Signup error:', error);
            showNotification(error.message, 'error');
            showFormError('signupEmail', error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Notification function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => notification.remove());
        
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
        }, 5000);
    }

    // Add CSS for form errors
    const style = document.createElement('style');
    style.textContent = `
        .form-group.error input {
            border-color: #f44336 !important;
        }
        
        .form-error {
            color: #f44336;
            font-size: 14px;
            margin-top: 5px;
        }
        
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
    `;
    document.head.appendChild(style);
}