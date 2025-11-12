// Customer authentication
if (window.customerAuthScriptLoaded) {
    console.log('Customer auth script already loaded, skipping...');
} else {
    window.customerAuthScriptLoaded = true;

    console.log('Customer auth.js loaded - initializing...');

    // Form toggle functionality
    document.getElementById('showCustomerSignup')?.addEventListener('click', function(e) {
        e.preventDefault();
        showCustomerSignupForm();
    });

    document.getElementById('showCustomerLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        showCustomerLoginForm();
    });

    function showCustomerLoginForm() {
        document.querySelector('#customerSignupForm').classList.remove('active');
        document.querySelector('#customerLoginForm').closest('.auth-form').classList.add('active');
        clearFormErrors();
    }

    function showCustomerSignupForm() {
        document.querySelector('#customerLoginForm').closest('.auth-form').classList.remove('active');
        document.querySelector('#customerSignupForm').classList.add('active');
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

    // Customer login form
    document.getElementById('customerLoginForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('customerEmail').value;
        const password = document.getElementById('customerPassword').value;
        
        // Clear previous errors
        clearFormErrors();
        
        // Basic validation
        if (!email || !password) {
            showFormError('customerEmail', 'Please fill in all fields');
            return;
        }
        
        await handleCustomerLogin(email, password);
    });

    // Customer signup form
    document.getElementById('customerSignupFormElement')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('customerName').value;
        const email = document.getElementById('customerSignupEmail').value;
        const password = document.getElementById('customerSignupPassword').value;
        
        // Clear previous errors
        clearFormErrors();
        
        // Validation
        if (!name || !email || !password) {
            showFormError('customerName', 'Please fill in all fields');
            return;
        }
        
        if (password.length < 6) {
            showFormError('customerSignupPassword', 'Password must be at least 6 characters');
            return;
        }
        
        await handleCustomerSignup(email, password, name);
    });

    // Handle customer login
    async function handleCustomerLogin(email, password) {
        const submitBtn = document.querySelector('#customerLoginForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;
        
        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Invalid email or password. Please try again.');
                } else {
                    throw error;
                }
            }
            
            showNotification('Login successful!', 'success');
            
            // Redirect back to previous page or home
            setTimeout(() => {
                const referrer = document.referrer;
                if (referrer && referrer.includes('offerhub')) {
                    window.location.href = referrer;
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);
            
        } catch (error) {
            console.error('Customer login error:', error);
            showNotification(error.message, 'error');
            showFormError('customerEmail', error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Handle customer signup
    // Handle customer signup - UPDATED VERSION
async function handleCustomerSignup(email, password, name) {
    const submitBtn = document.querySelector('#customerSignupFormElement button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    try {
        console.log('Attempting customer signup with:', { email, password, name });
        
        // Use the CORRECT Supabase v2 syntax
        const { data, error } = await window.supabaseClient.auth.signUp(
            email,
            password,
            {
                full_name: name,
                user_type: 'customer'
            }
        );
        
        console.log('Customer signup response:', { data, error });
        
        if (error) {
            if (error.message.includes('User already registered')) {
                throw new Error('An account with this email already exists. Please log in instead.');
            } else {
                throw error;
            }
        }
        
        showNotification('Account created successfully! You can now log in.', 'success');
        
        // Switch to login form
        setTimeout(() => {
            showCustomerLoginForm();
            document.getElementById('customerSignupFormElement').reset();
        }, 3000);
        
    } catch (error) {
        console.error('Customer signup error:', error);
        showNotification(error.message, 'error');
        showFormError('customerSignupEmail', error.message);
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
}