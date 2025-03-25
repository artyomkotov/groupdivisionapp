/**
 * Storage operations for the Group Division App
 */

const Storage = {
    // Key for storing names in localStorage
    NAMES_STORAGE_KEY: 'groupDivisionApp_names',
    
    /**
     * Saves names to localStorage
     * @param {string[]} names - Array of names to save
     */
    saveNames: function(names) {
        try {
            localStorage.setItem(this.NAMES_STORAGE_KEY, JSON.stringify(names));
        } catch (e) {
            console.error("Error saving names to localStorage:", e);
        }
    },
    
    /**
     * Loads names from localStorage
     * @returns {string[]} - Array of names, or empty array if none found
     */
    loadNames: function() {
        try {
            const savedNames = localStorage.getItem(this.NAMES_STORAGE_KEY);
            return savedNames ? JSON.parse(savedNames) : [];
        } catch (e) {
            console.error("Error loading names from localStorage:", e);
            return [];
        }
    }
};