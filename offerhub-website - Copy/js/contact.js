// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <h3>Message Sent Successfully!</h3>
        <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
    `;
    
    // Insert success message before the form
    if (contactForm) {
        contactForm.parentNode.insertBefore(successMessage, contactForm);
        
        // Handle form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Basic validation
            if (!formData.name || !formData.email || !formData.message) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Email validation
            if (!isValidEmail(formData.email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Sending...';
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
            
            // Simulate API call (in real app, this would be a fetch/ajax call)
            setTimeout(() => {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
                
                // Show success message
                successMessage.classList.add('show');
                contactForm.reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 5000);
                
                // Log form data (in real app, this would be sent to server)
                console.log('Contact form submitted:', formData);
                showNotification('Your message has been sent successfully!', 'success');
                
            }, 2000);
        });
    }
    
    // Login/Signup buttons
    const loginBtn = document.querySelector('.btn-outline');
    const signupBtn = document.querySelector('.btn-primary');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            alert('Login functionality would go here');
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            alert('Signup functionality would go here');
        });
    }
    
    // FAQ "See More" link
    const seeMoreFaq = document.querySelector('.see-more-faq');
    if (seeMoreFaq) {
        seeMoreFaq.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This would open a full FAQ page in a real application.');
        });
    }
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification function (reuse from dashboard)
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Add CSS for animations if not already present
if (!document.querySelector('#contact-animations')) {
    const style = document.createElement('style');
    style.id = 'contact-animations';
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