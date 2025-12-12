/**
 * Global Password Toggle Utility
 * Auto-initializes for all password inputs with toggle buttons
 * 
 * Usage: Just include this script and it will work automatically!
 * Or call: window.togglePasswordVisibility(buttonElement)
 */

(function() {
    'use strict';

    /**
     * Toggle password visibility for a specific input
     * @param {HTMLElement} button - The toggle button clicked
     */
    window.togglePasswordVisibility = function(button) {
        // Find the password input (sibling or in same input-group)
        const inputGroup = button.closest('.input-group');
        const passwordInput = inputGroup ? 
            inputGroup.querySelector('input[type="password"], input[type="text"]') : 
            button.previousElementSibling;
        
        if (!passwordInput) {
            console.error('Password input not found!');
            return;
        }

        // Find the icon (inside button or direct child)
        const icon = button.querySelector('i') || button.querySelector('.fa-eye, .fa-eye-slash');
        
        // Toggle password visibility
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            if (icon) {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        } else {
            passwordInput.type = 'password';
            if (icon) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    };

    /**
     * Auto-initialize all password toggle buttons
     */
    function initPasswordToggles() {
        // Find all password toggle buttons
        const toggleButtons = document.querySelectorAll(
            '.password-toggle-btn, [data-toggle="password"], .toggle-password'
        );

        toggleButtons.forEach(button => {
            // Remove old onclick if exists
            button.removeAttribute('onclick');
            
            // Add click event listener
            button.addEventListener('click', function(e) {
                e.preventDefault();
                window.togglePasswordVisibility(this);
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPasswordToggles);
    } else {
        initPasswordToggles();
    }

    // Re-initialize after dynamic content loads
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    initPasswordToggles();
                }
            });
        });

        // Start observing after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        } else {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    console.log('✅ Global Password Toggle Utility loaded!');
})();
