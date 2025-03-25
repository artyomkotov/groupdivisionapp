/**
 * Main entry point for the Group Division App
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all the modules
    UI.init();
    NameManager.init();
    DragDrop.init();
    
    console.log('Group Division App initialized');
});