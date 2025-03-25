/**
 * Utility functions for the Group Division App
 */

// Namespace for utilities
const Utils = {
    /**
     * Shows a notification message
     * @param {string} message - The message to display
     * @param {string} [type='success'] - The type of notification ('success', 'error', 'warning')
     */
    showNotification: function(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add it to the DOM
        document.body.appendChild(notification);
        
        // Trigger reflow to ensure the transition works
        notification.offsetHeight;
        
        // Show the notification by adding the active class
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
            
            // Remove from DOM after transition completes
            setTimeout(() => {
                notification.remove();
            }, 500); // Match this to the transition duration in CSS
        }, 3000);
    },
    
    /**
     * Shuffles an array randomly using the Fisher-Yates algorithm
     * @param {any[]} array - The array to shuffle
     * @returns {any[]} - The shuffled array
     */
    shuffleArray: function(array) {
        // Create a copy of the array to avoid modifying the original
        const shuffled = [...array];
        
        // Perform the Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
            // Generate a random index between 0 and i
            const j = Math.floor(Math.random() * (i + 1));
            
            // Swap the elements at i and j
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};