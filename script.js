document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const namesInput = document.getElementById('names-input');
    const fileInput = document.getElementById('file-input');
    const addNamesBtn = document.getElementById('add-names');
    const groupSizeInput = document.getElementById('group-size');
    const addExceptionBtn = document.getElementById('add-exception');
    const generateGroupsBtn = document.getElementById('generate-groups');
    const downloadGroupsBtn = document.getElementById('download-groups');
    const clearGroupsBtn = document.getElementById('clear-groups');
    const exceptionsContainer = document.getElementById('exceptions-container');
    const groupsContainer = document.getElementById('groups-container');
    
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // File input handling for UI feedback
    fileInput.addEventListener('change', function() {
        const fileName = this.files[0]?.name || '';
        const fileLabel = this.nextElementSibling.querySelector('span');
        fileLabel.textContent = fileName || 'Choose a file';
    });
    
    // Add exceptions UI
    addExceptionBtn.addEventListener('click', function() {
        const exceptionPair = document.querySelector('.exception-pair').cloneNode(true);
        const removeBtn = exceptionPair.querySelector('.remove-exception');
        
        // Reset selections in the cloned pair
        exceptionPair.querySelectorAll('select').forEach(select => {
            select.value = '';
        });
        
        // Add remove functionality
        removeBtn.addEventListener('click', function() {
            exceptionPair.remove();
        });
        
        exceptionsContainer.appendChild(exceptionPair);
    });
    
    // Remove exception handler for initial pair
    document.querySelector('.remove-exception').addEventListener('click', function() {
        if (exceptionsContainer.querySelectorAll('.exception-pair').length > 1) {
            this.closest('.exception-pair').remove();
        }
    });
    
    // Clear groups
    clearGroupsBtn.addEventListener('click', function() {
        groupsContainer.innerHTML = '<p class="empty-state">Generated groups will appear here</p>';
        downloadGroupsBtn.disabled = true;
        clearGroupsBtn.disabled = true;
    });
    
    // This is just UI setup, the actual functionality will be implemented by you
    // Stub for the generate groups button - just clears the UI and enables buttons
    generateGroupsBtn.addEventListener('click', function() {
        // You'll implement the actual group generation
        // For now, just toggle the buttons state for the UI demo
        downloadGroupsBtn.disabled = false;
        clearGroupsBtn.disabled = false;
        
        // Clear the empty state message
        if (groupsContainer.querySelector('.empty-state')) {
            groupsContainer.innerHTML = '';
        }
        
        // Message for the user to implement the functionality
        groupsContainer.innerHTML = '<p class="empty-state">You need to implement the group generation functionality!</p>';
    });
    
    // Updates the exception dropdowns when names are added
    // This is stubbed since you'll implement the actual names management
    addNamesBtn.addEventListener('click', function() {
        // You'll implement the name addition and validation logic
        console.log('Add names button clicked - functionality to be implemented');
    });
});
