/**
 * Group Division App - Main JavaScript
 * 
 * This file handles all the functionality of the Group Division App:
 * - Adding and managing names
 * - Handling user input from forms
 * - Implementing the group generation algorithm
 * - Creating and manipulating the UI elements
 * - Managing drag-and-drop interactions
 * - Validating user inputs
 */

// This code runs after the entire HTML document has been loaded
document.addEventListener('DOMContentLoaded', function() {
    // ===============================================================
    // ELEMENT REFERENCES - Getting all HTML elements we need to work with
    // ===============================================================
    
    // Input section elements - These are the elements in the "Input Names" card
    const namesInput = document.getElementById('names-input');           // Textarea where users type names
    const fileInput = document.getElementById('file-input');             // Input element for uploading a file
    const addNamesBtn = document.getElementById('add-names');            // Button to add names from the textarea
    
    // Name management elements - These are in the "Manage Names" card
    const namesList = document.getElementById('names-list');             // List (<ul>) that will display all the names
    const nameCount = document.getElementById('name-count');             // Span to display the number of names
    const deleteAllNamesBtn = document.getElementById('delete-all-names'); // Button to clear all names
    
    // Settings section elements - These are in the "Settings" card
    const groupSizeInput = document.getElementById('group-size');         // Number input for specifying group size
    const groupSizeSlider = document.getElementById('group-size-slider'); // Slider for specifying group size
    const groupSizeDisplay = document.getElementById('group-size-display'); // Span to display the selected group size
    const addExceptionBtn = document.getElementById('add-exception');     // Button to add a new exception pair
    const addTogetherBtn = document.getElementById('add-together');       // Button to add a new "must be together" pair
    
    // Results section elements - These are in the "Generated Groups" card
    const generateGroupsBtn = document.getElementById('generate-groups'); // Button to trigger group generation
    const downloadGroupsBtn = document.getElementById('download-groups'); // Button to download the generated groups
    const clearGroupsBtn = document.getElementById('clear-groups');       // Button to clear the generated groups
    const groupsContainer = document.getElementById('groups-container');  // Container (<div>) where group results will be displayed
    
    // Container elements for exception and "must be together" pairs
    const exceptionsContainer = document.getElementById('exceptions-container'); // Container for exception pairs
    const togetherContainer = document.getElementById('together-container');    // Container for "must be together" pairs
    
    // Modal elements for editing names - These are in the pop-up modal
    const editModal = document.getElementById('edit-modal');              // The entire modal dialog
    const editNameInput = document.getElementById('edit-name-input');     // Input field in the modal for editing the name
    const saveEditBtn = document.getElementById('save-edit');             // Button to save the edited name
    const cancelEditBtn = document.getElementById('cancel-edit');         // Button to cancel editing
    const closeModalBtn = document.getElementById('close-modal');         // The "X" button to close the modal
    
    // ===============================================================
    // STATE VARIABLES - Data that changes throughout app usage
    // ===============================================================
    
    // Array to store all names entered by the user
    let allNames = [];
    
    // Index of the name currently being edited in the modal (-1 if no name is being edited)
    let editingNameIndex = -1;

    // ===============================================================
    // MODAL FUNCTIONALITY - Code for opening, closing, and saving changes in the edit name modal
    // ===============================================================
    
    // When the close button in the modal is clicked, call the closeModal function
    closeModalBtn.addEventListener('click', closeModal);
    // When the cancel button in the modal is clicked, call the closeModal function
    cancelEditBtn.addEventListener('click', closeModal);
    
    // When the save button in the modal is clicked, save the changes
    saveEditBtn.addEventListener('click', function() {
        // Get the new name from the input field and remove any extra spaces from the start and end
        const newName = editNameInput.value.trim();
        
        // Check if the new name is not empty and we are actually editing a name
        if (newName && editingNameIndex !== -1) {
            // Store the old name for use in the notification message
            const oldName = allNames[editingNameIndex];
            
            // Update the name in our allNames array with the new name
            allNames[editingNameIndex] = newName;
            
            // Update the UI to reflect the changes
            updateNamesList();           // Refresh the displayed list of names
            updateNameDropdowns(allNames); // Update any dropdowns that contain the list of names
            
            // Show a notification to confirm the change
            showNotification(`Changed "${oldName}" to "${newName}"`);
            
            // Close the modal
            closeModal();
        }
    });
    
    /**
     * Opens the edit modal for a specific name
     * @param {string} name - The name being edited
     * @param {number} index - The index of the name in the allNames array
     */
    function openEditModal(name, index) {
        // Set the input field in the modal to show the current name
        editNameInput.value = name;
        
        // Store the index of the name we're editing so we can save changes later
        editingNameIndex = index;
        
        // Make the modal visible by adding the 'active' class
        editModal.classList.add('active');
        
        // Put the cursor in the input field so the user can start typing immediately
        editNameInput.focus();
    }
    
    /**
     * Closes the edit modal and resets the editing state
     */
    function closeModal() {
        // Hide the modal by removing the 'active' class
        editModal.classList.remove('active');
        
        // Reset the editing index so we don't accidentally edit the wrong name later
        editingNameIndex = -1;
    }

    // ===============================================================
    // GROUP SIZE CONTROLS - Code for syncing the slider and number input for group size
    // ===============================================================
    
    // When the slider is moved, update the number input and display
    groupSizeSlider.addEventListener('input', function() {
        // Get the current value of the slider
        const value = this.value;
        
        // Set the number input to the same value
        groupSizeInput.value = value;
        
        // Update the display text to show the current value
        groupSizeDisplay.textContent = value;
    });
    
    // When the number input is changed, update the slider and display
    groupSizeInput.addEventListener('input', function() {
        // Get the value from the number input and convert it to an integer
        let value = parseInt(this.value);
        
        // Make sure the value is within the allowed range
        if (value < 2) value = 2;  // Minimum group size is 2
        if (value > 20) value = 20; // Maximum group size is 20
        
        // Update the slider if the value is within its range (the slider only goes to 10)
        if (value <= 10) {
            groupSizeSlider.value = value;
        }
        
        // Update the number input to reflect the corrected value
        groupSizeInput.value = value;
        
        // Update the display text to show the current value
        groupSizeDisplay.textContent = value;
    });
    
    // ===============================================================
    // TAB FUNCTIONALITY - Code for switching between manual entry and file upload
    // ===============================================================
    
    // Get all tab buttons and content sections
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add a click event listener to each tab button
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove the 'active' class from all tab buttons (deactivate all tabs)
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Remove the 'active' class from all tab content sections (hide all content)
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add the 'active' class to the clicked tab button (activate the tab)
            btn.classList.add('active');
            
            // Get the ID of the content section associated with the clicked tab
            const tabId = btn.dataset.tab;
            
            // Show the corresponding content section by adding the 'active' class
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // ===============================================================
    // FILE INPUT HANDLING - Code for reading and processing uploaded files
    // ===============================================================
    
    // When a file is selected, process it
    fileInput.addEventListener('change', function() {
        // Get the selected file
        const file = this.files[0];
        
        // If no file was selected, exit the function
        if (!file) return;
        
        // Get the file name for display purposes
        const fileName = file.name;
        
        // Update the file label to show the selected file name
        const fileLabel = this.nextElementSibling.querySelector('span');
        fileLabel.textContent = fileName || 'Choose a file';
        
        // Create a new FileReader to read the file contents
        const reader = new FileReader();
        
        // Define what happens when the file is finished loading
        reader.onload = function(e) {
            // Get the file content as text
            const content = e.target.result;
            
            // Create an array to hold the names
            let names = [];
            
            // Process the file based on its extension
            if (fileName.toLowerCase().endsWith('.csv')) {
                // If it's a CSV file, split by newlines, then by commas
                names = content.trim().split(/\r?\n/).flatMap(line => 
                    line.split(',').map(name => name.trim()).filter(name => name)
                );
            } else {
                // If it's a TXT file, split by newlines
                names = content.trim().split(/\r?\n/).map(name => name.trim()).filter(name => name);
            }
            
            // If we found any names, add them to the list
            if (names.length > 0) {
                saveNames(names);               // Save the names to our array
                updateNamesList();              // Update the displayed list of names
                updateNameDropdowns(allNames);  // Update the dropdowns in the settings
                
                // Show a notification to confirm the names were added
                showNotification(`Added ${names.length} names from file`);
            }
        };
        
        // Start reading the file as text
        reader.readAsText(file);
    });
    
    // ===============================================================
    // NAME MANAGEMENT FUNCTIONALITY - Code for displaying, editing, and deleting names
    // ===============================================================
    
    /**
     * Updates the list of names displayed in the UI
     */
    function updateNamesList() {
        // Clear the current list of names
        namesList.innerHTML = '';
        
        // Update the count display
        nameCount.textContent = `${allNames.length} names`;
        
        // If there are no names in the list, show a message
        if (allNames.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-state';
            emptyItem.textContent = 'No names added yet';
            namesList.appendChild(emptyItem);
            return;
        }
        
        // Loop through each name in the allNames array
        allNames.forEach((name, index) => {
            // Create a list item for the name
            const li = document.createElement('li');
            
            // Create a span to hold the name text
            const nameText = document.createElement('span');
            nameText.className = 'name-text';
            nameText.textContent = name;
            
            // Create a div to hold the action buttons (edit and delete)
            const actions = document.createElement('div');
            actions.className = 'name-actions';
            
            // Create the edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-name';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>'; // Use Font Awesome icon
            editBtn.title = 'Edit name';
            editBtn.addEventListener('click', () => openEditModal(name, index)); // Open modal on click
            
            // Create the delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-name';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'; // Use Font Awesome icon
            deleteBtn.title = 'Delete name';
            deleteBtn.addEventListener('click', () => deleteName(index)); // Delete name on click
            
            // Add the buttons to the actions div
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            // Add the name and actions to the list item
            li.appendChild(nameText);
            li.appendChild(actions);
            
            // Add the list item to the names list
            namesList.appendChild(li);
        });
    }
    
    /**
     * Deletes a name from the array and updates the UI
     * @param {number} index - The index of the name to delete
     */
    function deleteName(index) {
        // Get the name that will be deleted (for the notification)
        const name = allNames[index];
        
        // Remove the name from the array
        allNames.splice(index, 1);
        
        // Update the UI to reflect the change
        updateNamesList();
        updateNameDropdowns(allNames);
        
        // Show a notification to confirm the deletion
        showNotification(`Removed "${name}"`);
    }
    
    // When the "Clear All" button is clicked, clear the list of names
    deleteAllNamesBtn.addEventListener('click', function() {
        // If there are no names, do nothing
        if (allNames.length === 0) return;
        
        // Confirm that the user wants to delete all names
        if (confirm(`Are you sure you want to delete all ${allNames.length} names?`)) {
            // Clear the allNames array
            allNames = [];
            
            // Update the UI to reflect the change
            updateNamesList();
            updateNameDropdowns(allNames);
            
            // Show a notification to confirm the action
            showNotification('All names cleared');
        }
    });

    // ===============================================================
    // EXCEPTION AND TOGETHER PAIRS - Code for managing the UI for exception and "must be together" pairs
    // ===============================================================
    
    // When the "Add Exception" button is clicked, add a new exception pair
    addExceptionBtn.addEventListener('click', function() {
        // Clone the first exception pair to create a new one
        const exceptionPair = document.querySelector('.exception-pair').cloneNode(true);
        
        // Get the remove button from the cloned pair
        const removeBtn = exceptionPair.querySelector('.remove-exception');
        
        // Reset the selections in the cloned pair
        exceptionPair.querySelectorAll('select').forEach(select => {
            select.value = ''; // Clear the selected value
            updateSingleDropdown(select, allNames); // Fill the dropdown with current names
        });
        
        // Add functionality to the remove button
        removeBtn.addEventListener('click', function() {
            exceptionPair.remove(); // Remove this pair when the button is clicked
        });
        
        // Add the new pair to the container
        exceptionsContainer.appendChild(exceptionPair);
    });
    
    // When the "Add Together" button is clicked, add a new "must be together" pair
    addTogetherBtn.addEventListener('click', function() {
        // Clone the first "must be together" pair to create a new one
        const togetherPair = document.querySelector('.together-pair').cloneNode(true);
        
        // Get the remove button from the cloned pair
        const removeBtn = togetherPair.querySelector('.remove-together');
        
        // Reset the selections in the cloned pair
        togetherPair.querySelectorAll('select').forEach(select => {
            select.value = ''; // Clear the selected value
            updateSingleDropdown(select, allNames); // Fill the dropdown with current names
        });
        
        // Add functionality to the remove button
        removeBtn.addEventListener('click', function() {
            togetherPair.remove(); // Remove this pair when the button is clicked
        });
        
        // Add the new pair to the container
        togetherContainer.appendChild(togetherPair);
    });
    
    // Handle removing the first exception pair
    document.querySelector('.remove-exception').addEventListener('click', function() {
        // Only allow removal if there's more than one pair
        if (exceptionsContainer.querySelectorAll('.exception-pair').length > 1) {
            this.closest('.exception-pair').remove();
        }
    });
    
    // Handle removing the first "must be together" pair
    document.querySelector('.remove-together').addEventListener('click', function() {
        // Only allow removal if there's more than one pair
        if (togetherContainer.querySelectorAll('.together-pair').length > 1) {
            this.closest('.together-pair').remove();
        }
    });
    
    // ===============================================================
    // NAME MANAGEMENT - Code for adding and storing names
    // ===============================================================
    
    /**
     * Saves names to our array, avoiding duplicates
     * @param {string[]} names - Array of names to save
     */
    function saveNames(names) {
        // Loop through each name in the provided array
        names.forEach(name => {
            // Check if the name is already in our allNames array
            if (!allNames.includes(name)) {
                // If it's not, add it to the array
                allNames.push(name);
            }
        });
        
        // Sort the array alphabetically for easier management
        allNames.sort();
    }
    
    /**
     * Updates all name dropdowns with current names
     * This function is called whenever the list of names changes
     * @param {string[]} names - Array of names to add as options
     */
    function updateNameDropdowns(names) {
        // Update all exception select dropdowns
        document.querySelectorAll('.exception-name1, .exception-name2').forEach(select => {
            updateSingleDropdown(select, names);
        });
        
        // Update all "must be together" select dropdowns
        document.querySelectorAll('.together-name1, .together-name2').forEach(select => {
            updateSingleDropdown(select, names);
        });
    }
    
    /**
     * Updates a single dropdown with the list of names
     * @param {HTMLSelectElement} select - The select element to update
     * @param {string[]} names - Array of names to add as options
     * @param {string} currentValue - Optional current value to preserve
     */
    function updateSingleDropdown(select, names, currentValue = '') {
        // Save the currently selected value (if any)
        const currentSelection = currentValue || select.value;
        
        // Clear existing options from the select element, except the first one (the placeholder)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add each name as a new option in the select element
        names.forEach(name => {
            const option = document.createElement('option'); // Create a new <option> element
            option.value = name;                            // Set the value of the option
            option.textContent = name;                        // Set the text displayed in the option
            select.appendChild(option);                     // Add the option to the select element
        });
        
        // If there was a previously selected value and it's still in the list, re-select it
        if (currentSelection && names.includes(currentSelection)) {
            select.value = currentSelection;
        }
    }
    
    // ===============================================================
    // CLEAR GROUPS - Code for clearing the generated groups from the UI
    // ===============================================================
    
    // When the "Clear Groups" button is clicked, clear the generated groups
    clearGroupsBtn.addEventListener('click', function() {
        // Clear the HTML inside the groups container and show the empty state message
        groupsContainer.innerHTML = '<p class="empty-state">Generated groups will appear here</p>';
        
        // Disable the download and clear buttons since there are no groups to download or clear
        downloadGroupsBtn.disabled = true;
        clearGroupsBtn.disabled = true;
    });
    
    // ===============================================================
    // GENERATE GROUPS - Main function to generate and display the groups
    // ===============================================================
    
    // When the "Generate Groups" button is clicked, generate and display the groups
    generateGroupsBtn.addEventListener('click', function() {
        // Check if there are at least two names before generating groups
        if (allNames.length < 2) {
            showNotification('Please add at least 2 names', 'error');
            return;
        }
        
        // Get the group size from the input field
        const groupSize = parseInt(groupSizeInput.value);
        
        // Get the total number of people
        const totalPeople = allNames.length;
        
        // Validate that the group size is not larger than the total number of people
        if (groupSize > totalPeople) {
            // Calculate the maximum possible group size
            const maxPossibleGroups = Math.floor(totalPeople / 2);
            const suggestedGroupSize = Math.ceil(totalPeople / maxPossibleGroups);
            
            // Update the UI with the maximum valid group size
            groupSizeInput.value = suggestedGroupSize;
            groupSizeDisplay.textContent = suggestedGroupSize;
            if (suggestedGroupSize <= 10) {
                groupSizeSlider.value = suggestedGroupSize;
            }
            
            // Show a notification to inform the user that the group size was adjusted
            showNotification(`Cannot create groups of ${groupSize} with only ${totalPeople} people. Group size adjusted to ${suggestedGroupSize}.`, 'warning');
            return; // Stop the group generation process
        }
        
        // Additional validation: ensure we can create at least 2 groups if there are enough people
        if (groupSize === totalPeople && totalPeople > 3) {
            const suggestedGroupSize = Math.ceil(totalPeople / 2);
            groupSizeInput.value = suggestedGroupSize;
            groupSizeDisplay.textContent = suggestedGroupSize;
            if (suggestedGroupSize <= 10) {
                groupSizeSlider.value = suggestedGroupSize;
            }
            
            showNotification(`Creating one group with all people defeats the purpose. Group size adjusted to ${suggestedGroupSize} to create multiple groups.`, 'warning');
            return;
        }
        
        // Get the exception and "must be together" pairs from the UI
        const exceptions = getExceptionPairs();
        const togetherPairs = getTogetherPairs();
        
        // Validate that the "must be together" constraints are valid
        const togetherValidation = validateTogetherConstraints(allNames, togetherPairs, groupSize);
        if (!togetherValidation.valid) {
            showNotification(togetherValidation.message, 'error');
            return;
        }
        
        // Generate the groups based on the settings
        const groups = generateGroups(allNames, groupSize, exceptions, togetherPairs);
        
        // Display the generated groups in the UI
        displayGroups(groups);
        
        // Enable the download and clear buttons
        downloadGroupsBtn.disabled = false;
        clearGroupsBtn.disabled = false;
    });
    
    // ===============================================================
    // ADD NAMES - Code for adding names from the textarea
    // ===============================================================
    
    // When the "Add Names" button is clicked, add the names from the textarea
    addNamesBtn.addEventListener('click', function() {
        // Get the names from the textarea, split by newlines, and trim each name
        const names = namesInput.value.trim().split('\n')
            .map(name => name.trim())
            .filter(name => name !== ''); // Remove any empty names
            
        // If there are no names, show an error message and exit
        if (names.length === 0) {
            showNotification('Please enter at least one name', 'error');
            return;
        }
        
        // Save the names to our array and update the UI
        saveNames(names);       // Save the names to the allNames array
        updateNamesList();      // Update the displayed list of names
        updateNameDropdowns(allNames); // Update the dropdowns in the settings
        
        // Clear the textarea
        namesInput.value = '';
        
        // Show a notification to confirm the names were added
        showNotification(`Added ${names.length} names`);
    });

    // ===============================================================
    // DOWNLOAD GROUPS - Code for downloading the generated groups as a text file
    // ===============================================================
    
    // When the "Download Groups" button is clicked, download the groups as a text file
    downloadGroupsBtn.addEventListener('click', function() {
        // Get all the group cards from the UI
        const groups = [];
        
        // Loop through each group card
        document.querySelectorAll('.group-card').forEach(groupCard => {
            // Get the group name from the header
            const groupName = groupCard.querySelector('h3').childNodes[0].textContent;
            
            // Create an array to hold the members of the group
            const members = [];
            
            // Loop through each list item in the group card
            groupCard.querySelectorAll('li').forEach(li => {
                // Add the text content of the list item to the members array
                members.push(li.textContent);
            });
            
            // Add the group name and members to the groups array
            groups.push({ name: groupName, members });
        });
        
        // Generate the text content for the download file
        let content = 'Groups Generated by Group Division App\n\n';
        
        // Loop through each group and add its information to the content
        groups.forEach(group => {
            content += `${group.name}\n`;
            content += '-'.repeat(group.name.length) + '\n'; // Add a line of dashes
            group.members.forEach(member => {
                content += `- ${member}\n`; // Add each member with a dash
            });
            content += '\n'; // Add a newline between groups
        });
        
        // Create a Blob (Binary Large Object) with the content
        const blob = new Blob([content], { type: 'text/plain' });
        
        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);
        
        // Create a link element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_groups.txt'; // Set the file name
        
        // Add the link to the document body (it doesn't have to be visible)
        document.body.appendChild(a);
        
        // Programmatically click the link to trigger the download
        a.click();
        
        // Remove the link from the document body
        document.body.removeChild(a);
        
        // Revoke the URL to free up memory
        URL.revokeObjectURL(url);
    });
    
    // ===============================================================
    // HELPER FUNCTIONS - Functions that are used by other functions
    // ===============================================================
    
    /**
     * Helper function to get "must be together" pairs from the UI
     * @returns {string[][]} - Array of name pairs that must be together
     */
    function getTogetherPairs() {
        const pairs = [];
        document.querySelectorAll('.together-pair').forEach(pair => {
            const name1 = pair.querySelector('.together-name1').value;
            const name2 = pair.querySelector('.together-name2').value;
            if (name1 && name2 && name1 !== name2) {
                pairs.push([name1, name2]);
            }
        });
        return pairs;
    }
    
    /**
     * Helper function to get exception pairs from the UI
     * @returns {string[][]} - Array of name pairs that should not be together
     */
    function getExceptionPairs() {
        const pairs = [];
        document.querySelectorAll('.exception-pair').forEach(pair => {
            const name1 = pair.querySelector('.exception-name1').value;
            const name2 = pair.querySelector('.exception-name2').value;
            if (name1 && name2 && name1 !== name2) {
                pairs.push([name1, name2]);
            }
        });
        return pairs;
    }
    
    // ===============================================================
    // GROUP GENERATION ALGORITHM - Core logic for creating the groups
    // ===============================================================
    
    /**
     * Generates the groups based on the provided names and settings
     * @param {string[]} names - Array of names to divide into groups
     * @param {number} groupSize - The desired size of each group
     * @param {string[][]} exceptions - Array of name pairs that should not be together
     * @param {string[][]} mustBeTogether - Array of name pairs that must be together
     * @returns {{name: string, members: string[]}[]} - Array of group objects
     */
    function generateGroups(names, groupSize, exceptions, mustBeTogether) {
        // Step 1: Handle "must be together" constraints
        let processedNames = handleMustBeTogether(names, mustBeTogether);
        
        // Step 2: Shuffle the names randomly
        processedNames = shuffleArray(processedNames);
        
        // Step 3: Create initial groups
        let groups = createInitialGroups(processedNames, groupSize);
        
        // Step 4: Handle exceptions
        groups = handleExceptions(groups, exceptions);
        
        // Step 5: Clean up any combined names
        groups = cleanupCombinedNames(groups);
        
        return groups;
    }
    
    /**
     * Handles the "must be together" constraints by combining names
     * @param {string[]} names - Array of names to process
     * @param {string[][]} togetherPairs - Array of name pairs that must be together
     * @returns {string[]} - Processed array of names with combined names
     */
    function handleMustBeTogether(names, togetherPairs) {
        // Create a copy of the names array to avoid modifying the original
        let processedNames = [...names];
        
        // Create a map to track which names are combined
        const combinedMap = {};
        
        // Loop through each "must be together" pair
        togetherPairs.forEach(pair => {
            const [name1, name2] = pair;
            
            // Only process if both names exist in our list
            if (processedNames.includes(name1) && processedNames.includes(name2)) {
                // Remove both names from the array
                processedNames = processedNames.filter(name => name !== name1 && name !== name2);
                
                // Add them back as a combined unit (e.g., "Alice|Bob")
                const combinedName = `${name1}|${name2}`;
                processedNames.push(combinedName);
                
                // Track the combined names in the map
                combinedMap[name1] = combinedName;
                combinedMap[name2] = combinedName;
            }
        });
        
        // Handle transitive relationships (if A must be with B and B must be with C, then A must be with C)
        let madeChanges = true;
        while (madeChanges) {
            madeChanges = false;
            
            // Loop through each name in the processed names
            for (let i = 0; i < processedNames.length; i++) {
                const name = processedNames[i];
                
                // If the name is a combined name (contains '|')
                if (name.includes('|')) {
                    const parts = name.split('|');
                    
                    // Check each part of the combined name against the combinedMap
                    for (const part of parts) {
                        // Loop through each entry in the combinedMap
                        for (const [key, value] of Object.entries(combinedMap)) {
                            // If the value is not the same as the current name and includes the part
                            if (value !== name && value.includes(part)) {
                                // Found another combination
                                const otherParts = value.split('|').filter(p => p !== part);
                                
                                // Remove both combined entries from the processedNames
                                processedNames = processedNames.filter(n => n !== name && n !== value);
                                
                                // Create a new combined entry with all parts
                                const newCombined = [...new Set([...parts, ...otherParts])].join('|');
                                processedNames.push(newCombined);
                                
                                // Update the combinedMap with the new combined entry
                                for (const p of [...parts, ...otherParts]) {
                                    combinedMap[p] = newCombined;
                                }
                                
                                madeChanges = true; // Mark that changes were made
                                break; // Exit the inner loop
                            }
                        }
                        if (madeChanges) break; // Exit the outer loop
                    }
                }
                if (madeChanges) break; // Exit the main loop
            }
        }
        
        return processedNames;
    }
    
    /**
     * Shuffles an array randomly using the Fisher-Yates algorithm
     * @param {any[]} array - The array to shuffle
     * @returns {any[]} - The shuffled array
     */
    function shuffleArray(array) {
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
    
    /**
     * Creates initial groups from the processed names
     * @param {string[]} processedNames - Array of processed names
     * @param {number} groupSize - The desired size of each group
     * @returns {{name: string, members: string[]}[]} - Array of initial group objects
     */
    function createInitialGroups(processedNames, groupSize) {
        const groups = [];
        
        // Calculate how many groups we need
        const totalMembers = processedNames.reduce((count, name) => {
            return count + (name.includes('|') ? name.split('|').length : 1);
        }, 0);
        
        // Calculate the number of groups needed
        let numberOfGroups = Math.floor(totalMembers / groupSize);
        if (totalMembers % groupSize !== 0) {
            numberOfGroups++; // Add an extra group for remaining members
        }
        
        // If there's only one group needed, return all names in a single group
        if (numberOfGroups <= 1) {
            return [{
                name: "Group 1",
                members: processedNames
            }];
        }
        
        // Create empty groups
        for (let i = 0; i < numberOfGroups; i++) {
            groups.push({
                name: `Group ${i + 1}`,
                members: []
            });
        }
        
        // Track the effective size of each group, considering that combined names count as multiple people
        const effectiveGroupSizes = Array(numberOfGroups).fill(0);
        
        // First pass: assign combined names first to ensure they don't split across groups
        const combinedNames = processedNames.filter(name => name.includes('|'));
        const singleNames = processedNames.filter(name => !name.includes('|'));
        
        // Sort combined names by size (descending) to place larger combinations first
        combinedNames.sort((a, b) => b.split('|').length - a.split('|').length);
        
        // Assign combined names
        for (const name of combinedNames) {
            const memberCount = name.split('|').length;
            // Find the group with the least number of effective members
            const targetGroupIndex = effectiveGroupSizes.indexOf(Math.min(...effectiveGroupSizes));
            
            groups[targetGroupIndex].members.push(name);
            effectiveGroupSizes[targetGroupIndex] += memberCount;
        }
        
        // Shuffle single names for randomness
        const shuffledNames = shuffleArray(singleNames);
        
        // Second pass: distribute the single names evenly
        for (const name of shuffledNames) {
            // Find the group with the least number of effective members
            const targetGroupIndex = effectiveGroupSizes.indexOf(Math.min(...effectiveGroupSizes));
            
            groups[targetGroupIndex].members.push(name);
            effectiveGroupSizes[targetGroupIndex] += 1;
        }
        
        return groups;
    }
    
    /**
     * Handles exceptions by ensuring specified pairs are not in the same group
     * @param {{name: string, members: string[]}[]} groups - Array of group objects
     * @param {string[][]} exceptions - Array of name pairs that should not be together
     * @returns {{name: string, members: string[]}[]} - Array of group objects with exceptions handled
     */
    function handleExceptions(groups, exceptions) {
        // If no exceptions, return the groups as is
        if (exceptions.length === 0) return groups;
        
        // Try to fix exceptions with a limited number of swaps
        const maxSwaps = 50;
        let swaps = 0;
        
        while (swaps < maxSwaps) {
            // Find a violated exception
            let violatedExceptionIndex = -1;
            let violatedGroup = -1;
            
            for (let i = 0; i < exceptions.length; i++) {
                const [name1, name2] = exceptions[i];
                
                // Check each group for both names
                for (let g = 0; g < groups.length; g++) {
                    const group = groups[g];
                    const containsName1 = group.members.some(m => 
                        m === name1 || (m.includes('|') && m.split('|').includes(name1))
                    );
                    const containsName2 = group.members.some(m => 
                        m === name2 || (m.includes('|') && m.split('|').includes(name2))
                    );
                    
                    if (containsName1 && containsName2) {
                        violatedExceptionIndex = i;
                        violatedGroup = g;
                        break;
                    }
                }
                
                if (violatedExceptionIndex !== -1) break;
            }
            
            // If no violations found, we're done
            if (violatedExceptionIndex === -1) break;
            
            // Try to fix the violation
            const [name1, name2] = exceptions[violatedExceptionIndex];
            
            // Find name2 in the violated group
            let indexInGroup = -1;
            for (let i = 0; i < groups[violatedGroup].members.length; i++) {
                const member = groups[violatedGroup].members[i];
                if (member === name2 || (member.includes('|') && member.split('|').includes(name2))) {
                    indexInGroup = i;
                    break;
                }
            }
            
            // Try to find another group to swap with
            let swapSuccessful = false;
            for (let g = 0; g < groups.length; g++) {
                if (g === violatedGroup) continue;
                
                // Try to find a member in this group that won't cause another violation when swapped
                for (let i = 0; i < groups[g].members.length; i++) {
                    const memberToSwap = groups[g].members[i];
                    
                    // Check if swapping would cause another violation
                    let wouldCauseViolation = false;
                    for (const [exName1, exName2] of exceptions) {
                        // Check if name2 would violate with someone in the target group
                        if ((memberToSwap === exName1 || (memberToSwap.includes('|') && memberToSwap.split('|').includes(exName1))) && 
                            groups[g].members.some(m => m === exName2 || (m.includes('|') && m.split('|').includes(exName2)))) {
                            wouldCauseViolation = true;
                            break;
                        }
                        // Check if memberToSwap would violate with someone in the source group
                        if ((name1 === exName1 || (name1.includes('|') && name1.split('|').includes(exName1))) && 
                            memberToSwap === exName2 || (memberToSwap.includes('|') && memberToSwap.split('|').includes(exName2))) {
                            wouldCauseViolation = true;
                            break;
                        }
                    }
                    
                    if (!wouldCauseViolation) {
                        // Swap members between groups
                        [groups[violatedGroup].members[indexInGroup], groups[g].members[i]] = 
                            [groups[g].members[i], groups[violatedGroup].members[indexInGroup]];
                        
                        swaps++;
                        swapSuccessful = true;
                        break;
                    }
                }
                
                if (swapSuccessful) break;
            }
            
            // If we couldn't find a valid swap, give up on this exception
            if (!swapSuccessful) {
                exceptions.splice(violatedExceptionIndex, 1);
                showNotification(`Couldn't resolve all exceptions. Some constraints may not be satisfied.`, 'warning');
            }
        }
        
        if (swaps >= maxSwaps) {
            showNotification(`Maximum swap attempts reached. Some constraints may not be satisfied.`, 'warning');
        }
        
        return groups;
    }
    
    /**
     * Cleans up combined names by splitting them into individual names
     * @param {{name: string, members: string[]}[]} groups - Array of group objects
     * @returns {{name: string, members: string[]}[]} - Array of group objects with individual names
     */
    function cleanupCombinedNames(groups) {
        return groups.map(group => {
            // Create a new group object
            const newGroup = { ...group, members: [] };
            
            // Process each member
            group.members.forEach(member => {
                if (member.includes('|')) {
                    // Split combined names
                    newGroup.members.push(...member.split('|'));
                } else {
                    // Keep single names as is
                    newGroup.members.push(member);
                }
            });
            
            return newGroup;
        });
    }
    
    /**
     * Displays the generated groups in the UI
     * @param {{name: string, members: string[]}[]} groups - Array of group objects
     */
    function displayGroups(groups) {
        // Clear existing groups
        groupsContainer.innerHTML = '';
        
        // Add each group
        groups.forEach((group, index) => {
            const groupCard = document.createElement('div');
            groupCard.className = 'group-card';
            groupCard.dataset.groupId = index;
            
            const groupHeader = document.createElement('h3');
            groupHeader.textContent = group.name;
            
            const memberCount = document.createElement('span');
            memberCount.className = 'group-count';
            memberCount.textContent = group.members.length;
            groupHeader.appendChild(memberCount);
            
            const memberList = document.createElement('ul');
            memberList.className = 'member-list';
            
            // Add each member to the list
            group.members.forEach(member => {
                const memberItem = document.createElement('li');
                memberItem.textContent = member;
                memberItem.setAttribute('draggable', true);
                memberItem.dataset.member = member;
                
                // Add drag event listeners
                memberItem.addEventListener('dragstart', handleDragStart);
                memberItem.addEventListener('dragend', handleDragEnd);
                
                memberList.appendChild(memberItem);
            });
            
            groupCard.appendChild(groupHeader);
            groupCard.appendChild(memberList);
            
            // Add drop event listeners
            groupCard.addEventListener('dragover', handleDragOver);
            groupCard.addEventListener('dragleave', handleDragLeave);
            groupCard.addEventListener('drop', handleDrop);
            
            groupsContainer.appendChild(groupCard);
        });
        
        // Add empty group placeholder
        const emptyGroup = document.createElement('div');
        emptyGroup.className = 'group-placeholder';
        emptyGroup.textContent = 'Drag members here to create a new group';
        emptyGroup.addEventListener('dragover', handleDragOver);
        emptyGroup.addEventListener('dragleave', handleDragLeave);
        emptyGroup.addEventListener('drop', handleDropOnEmpty);
        groupsContainer.appendChild(emptyGroup);
    }
    
    /**
     * Shows a notification message
     * @param {string} message - The message to display
     * @param {string} [type='success'] - The type of notification ('success', 'error', 'warning')
     */
    function showNotification(message, type = 'success') {
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
    }

    // ===============================================================
    // DRAG AND DROP FUNCTIONALITY - Code for handling drag-and-drop interactions
    // ===============================================================
    
    let draggedItem = null;
    let sourceGroupId = null;

    /**
     * Handles the drag start event
     * @param {DragEvent} e - The drag event
     */
    function handleDragStart(e) {
        draggedItem = e.target;
        sourceGroupId = e.target.closest('.group-card').dataset.groupId;
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }

    /**
     * Handles the drag end event
     * @param {DragEvent} e - The drag event
     */
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    /**
     * Handles the drag over event
     * @param {DragEvent} e - The drag event
     */
    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    /**
     * Handles the drag leave event
     * @param {DragEvent} e - The drag event
     */
    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    /**
     * Handles the drop event
     * @param {DragEvent} e - The drag event
     */
    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (draggedItem) {
            const targetGroup = this;
            const targetGroupId = targetGroup.dataset.groupId;
            
            // Only move if dropping into a different group
            if (sourceGroupId !== targetGroupId) {
                // Update the source group's count
                const sourceGroup = document.querySelector(`.group-card[data-group-id="${sourceGroupId}"]`);
                const sourceGroupCount = sourceGroup.querySelector('.group-count');
                sourceGroupCount.textContent = parseInt(sourceGroupCount.textContent) - 1;
                
                // Update the target group's count
                const targetGroupCount = targetGroup.querySelector('.group-count');
                targetGroupCount.textContent = parseInt(targetGroupCount.textContent) + 1;
                
                // Move the item
                targetGroup.querySelector('.member-list').appendChild(draggedItem);
            }
            
            draggedItem = null;
            sourceGroupId = null;
        }
    }

    /**
     * Handles the drop event on an empty group placeholder
     * @param {DragEvent} e - The drag event
     */
    function handleDropOnEmpty(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (draggedItem) {
            // Create a new group
            const newGroupId = document.querySelectorAll('.group-card').length;
            const newGroup = document.createElement('div');
            newGroup.className = 'group-card';
            newGroup.dataset.groupId = newGroupId;
            
            const groupHeader = document.createElement('h3');
            groupHeader.textContent = `New Group`;
            const memberCount = document.createElement('span');
            memberCount.className = 'group-count';
            memberCount.textContent = '1';
            groupHeader.appendChild(memberCount);
            
            const memberList = document.createElement('ul');
            memberList.className = 'member-list';
            
            // Update the source group's count
            const sourceGroup = document.querySelector(`.group-card[data-group-id="${sourceGroupId}"]`);
            const sourceGroupCount = sourceGroup.querySelector('.group-count');
            sourceGroupCount.textContent = parseInt(sourceGroupCount.textContent) - 1;
            
            // Move the item
            memberList.appendChild(draggedItem);
            
            newGroup.appendChild(groupHeader);
            newGroup.appendChild(memberList);
            
            // Add drop event listeners to the new group
            newGroup.addEventListener('dragover', handleDragOver);
            newGroup.addEventListener('dragleave', handleDragLeave);
            newGroup.addEventListener('drop', handleDrop);
            
            // Insert before the placeholder
            groupsContainer.insertBefore(newGroup, this);
            
            draggedItem = null;
            sourceGroupId = null;
        }
    }
    
    /**
     * Validates the "must be together" constraints
     * @param {string[]} names - Array of names
     * @param {string[][]} togetherPairs - Array of name pairs that must be together
     * @param {number} groupSize - The desired size of each group
     * @returns {{valid: boolean, message?: string}} - Validation result
     */
    function validateTogetherConstraints(names, togetherPairs, groupSize) {
        if (togetherPairs.length === 0) {
            return { valid: true };
        }
        
        // Process together pairs to find the largest must-be-together group
        const graph = {};
        names.forEach(name => {
            graph[name] = [];
        });
        
        togetherPairs.forEach(([name1, name2]) => {
            if (graph[name1]) graph[name1].push(name2);
            if (graph[name2]) graph[name2].push(name1);
        });
        
        // Find connected components (groups that must be together)
        const visited = new Set();
        let largestComponentSize = 0;
        
        function dfs(node, component) {
            visited.add(node);
            component.push(node);
            
            for (const neighbor of graph[node] || []) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor, component);
                }
            }
        }
        
        for (const name of names) {
            if (!visited.has(name)) {
                const component = [];
                dfs(name, component);
                
                largestComponentSize = Math.max(largestComponentSize, component.length);
            }
        }
        
        // If the largest must-be-together group is larger than the group size, it's invalid
        if (largestComponentSize > groupSize) {
            return {
                valid: false,
                message: `You have specified that ${largestComponentSize} people must be together, but the group size is only ${groupSize}. Please increase the group size or remove some "must be together" constraints.`
            };
        }
        
        return { valid: true };
    }
    
    // ===============================================================
    // INITIALIZATION - Code to initialize the app and load saved data
    // ===============================================================
    
    /**
     * Initializes the app by loading saved data and setting up event listeners
     */
    function initializeApp() {
        // Check for localStorage support
        try {
            // Try to load data from localStorage
            const savedNames = localStorage.getItem('groupDivisionApp_names');
            if (savedNames) {
                allNames = JSON.parse(savedNames);
                updateNamesList();
                updateNameDropdowns(allNames);
                showNotification(`Loaded ${allNames.length} saved names`);
            }
            
            // Save data on unload
            window.addEventListener('beforeunload', function() {
                localStorage.setItem('groupDivisionApp_names', JSON.stringify(allNames));
            });
        } catch (e) {
            console.error("Local storage not available:", e);
        }
    }
    
    // Call initialize function
    initializeApp();
});
