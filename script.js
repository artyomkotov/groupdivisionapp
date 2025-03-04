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

// Wait until the entire HTML document has loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
    // ===============================================================
    // ELEMENT REFERENCES - Getting all HTML elements we need to work with
    // ===============================================================
    
    // Input section elements
    const namesInput = document.getElementById('names-input');           // Textarea for entering names
    const fileInput = document.getElementById('file-input');             // File input for uploading names
    const addNamesBtn = document.getElementById('add-names');            // Button to add names from textarea
    
    // Name management elements
    const namesList = document.getElementById('names-list');             // List showing all added names
    const nameCount = document.getElementById('name-count');             // Shows count of added names
    const deleteAllNamesBtn = document.getElementById('delete-all-names'); // Button to delete all names
    
    // Settings section elements
    const groupSizeInput = document.getElementById('group-size');         // Number input for group size
    const groupSizeSlider = document.getElementById('group-size-slider'); // Slider for group size
    const groupSizeDisplay = document.getElementById('group-size-display'); // Text display of current group size
    const addExceptionBtn = document.getElementById('add-exception');     // Button to add exceptions
    const addTogetherBtn = document.getElementById('add-together');       // Button to add must-be-together pairs
    
    // Results section elements
    const generateGroupsBtn = document.getElementById('generate-groups'); // Button to generate groups
    const downloadGroupsBtn = document.getElementById('download-groups'); // Button to download groups
    const clearGroupsBtn = document.getElementById('clear-groups');       // Button to clear groups
    const groupsContainer = document.getElementById('groups-container');  // Container for group results
    
    // Container elements for pairs
    const exceptionsContainer = document.getElementById('exceptions-container'); // Container for exception pairs
    const togetherContainer = document.getElementById('together-container');    // Container for together pairs
    
    // Modal elements for editing names
    const editModal = document.getElementById('edit-modal');              // Modal dialog for editing names
    const editNameInput = document.getElementById('edit-name-input');     // Input field in the edit modal
    const saveEditBtn = document.getElementById('save-edit');             // Button to save edited name
    const cancelEditBtn = document.getElementById('cancel-edit');         // Button to cancel editing
    const closeModalBtn = document.getElementById('close-modal');         // X button to close modal
    
    // ===============================================================
    // STATE VARIABLES - Data that changes throughout app usage
    // ===============================================================
    
    // Array to store all names
    let allNames = [];
    
    // Tracks which name is being edited (by its index in the allNames array)
    let editingNameIndex = -1;

    // ===============================================================
    // MODAL FUNCTIONALITY - For editing names
    // ===============================================================
    
    // Close the modal when close button is clicked
    closeModalBtn.addEventListener('click', closeModal);
    // Close the modal when cancel button is clicked
    cancelEditBtn.addEventListener('click', closeModal);
    
    // Save the edited name when save button is clicked
    saveEditBtn.addEventListener('click', function() {
        // Get the new name from the input field and remove extra spaces
        const newName = editNameInput.value.trim();
        
        // Only proceed if there is a name and we know which name is being edited
        if (newName && editingNameIndex !== -1) {
            // Store the old name for the notification message
            const oldName = allNames[editingNameIndex];
            
            // Update the name in our array
            allNames[editingNameIndex] = newName;
            
            // Update the UI elements
            updateNamesList();           // Refresh the names list
            updateNameDropdowns(allNames); // Update dropdowns that use names
            
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
        // Set the input field to show the current name
        editNameInput.value = name;
        
        // Store which name we're editing for when the save button is clicked
        editingNameIndex = index;
        
        // Display the modal by adding the 'active' class
        editModal.classList.add('active');
        
        // Focus the cursor in the input field for immediate typing
        editNameInput.focus();
    }
    
    /**
     * Closes the edit modal and resets the editing state
     */
    function closeModal() {
        // Hide the modal by removing the 'active' class
        editModal.classList.remove('active');
        
        // Reset the editing index so we're not editing any name
        editingNameIndex = -1;
    }

    // ===============================================================
    // GROUP SIZE CONTROLS - Syncing slider and number input
    // ===============================================================
    
    // Update number input when slider is moved
    groupSizeSlider.addEventListener('input', function() {
        // Get the current slider value
        const value = this.value;
        
        // Update the number input to match the slider
        groupSizeInput.value = value;
        
        // Update the display text to show the current value
        groupSizeDisplay.textContent = value;
    });
    
    // Update slider when number input is changed
    groupSizeInput.addEventListener('input', function() {
        // Parse the input to a number (inputs return strings by default)
        let value = parseInt(this.value);
        
        // Enforce minimum and maximum values
        if (value < 2) value = 2;  // Min group size is 2
        if (value > 20) value = 20; // Max group size is 20
        
        // Update the slider if the value is within its range (the slider only goes to 10)
        if (value <= 10) {
            groupSizeSlider.value = value;
        }
        
        // Always update the display text
        groupSizeDisplay.textContent = value;
    });
    
    // ===============================================================
    // TAB FUNCTIONALITY - Switching between manual entry and file upload
    // ===============================================================
    
    // Get all tab buttons and content sections
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add click event listeners to each tab button
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs (deactivating them)
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to the clicked tab (activating it)
            btn.classList.add('active');
            
            // Get the ID of the content to show from the data-tab attribute
            const tabId = btn.dataset.tab;
            
            // Activate the corresponding content section
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // ===============================================================
    // FILE INPUT HANDLING - Processing uploaded name files
    // ===============================================================
    
    fileInput.addEventListener('change', function() {
        // Get the selected file (if any)
        const file = this.files[0];
        if (!file) return;  // Exit if no file selected
        
        // Get the file name for UI feedback
        const fileName = file.name;
        
        // Update the file label to show the selected file
        const fileLabel = this.nextElementSibling.querySelector('span');
        fileLabel.textContent = fileName || 'Choose a file';
        
        // Create a FileReader to read the file contents
        const reader = new FileReader();
        
        // Set up what happens when the file is loaded
        reader.onload = function(e) {
            // Get the file content as text
            const content = e.target.result;
            let names = [];
            
            // Process the file based on its extension
            if (fileName.toLowerCase().endsWith('.csv')) {
                // For CSV files: split by lines, then by commas
                names = content.trim().split(/\r?\n/).flatMap(line => 
                    line.split(',').map(name => name.trim()).filter(name => name)
                );
            } else {
                // For TXT files: split by lines
                names = content.trim().split(/\r?\n/).map(name => name.trim()).filter(name => name);
            }
            
            // Add the names if any were found
            if (names.length > 0) {
                saveNames(names);               // Save to our array
                updateNamesList();              // Update the names list
                updateNameDropdowns(allNames);  // Update selection dropdowns
                
                // Show notification with how many names were added
                showNotification(`Added ${names.length} names from file`);
            }
        };
        
        // Start reading the file as text
        reader.readAsText(file);
    });
    
    // ===============================================================
    // NAME MANAGEMENT FUNCTIONALITY - Displaying and editing names
    // ===============================================================
    
    /**
     * Updates the list of names shown in the UI
     */
    function updateNamesList() {
        // Clear the current list of names
        namesList.innerHTML = '';
        
        // Update the count display
        nameCount.textContent = `${allNames.length} names`;
        
        // If there are no names, show the empty state message
        if (allNames.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-state';
            emptyItem.textContent = 'No names added yet';
            namesList.appendChild(emptyItem);
            return;
        }
        
        // Add each name to the list with edit and delete buttons
        allNames.forEach((name, index) => {
            // Create a list item for the name
            const li = document.createElement('li');
            
            // Create a span for the name text
            const nameText = document.createElement('span');
            nameText.className = 'name-text';
            nameText.textContent = name;
            
            // Create a container for the action buttons
            const actions = document.createElement('div');
            actions.className = 'name-actions';
            
            // Create edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-name';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit name';
            editBtn.addEventListener('click', () => openEditModal(name, index));
            
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-name';
            deleteBtn.innerHTML = '<i class="fas fa-trash'></i>';
            deleteBtn.title = 'Delete name';
            deleteBtn.addEventListener('click', () => deleteName(index));
            
            // Add both buttons to the actions container
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            // Add the name text and actions to the list item
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
        // Get the name for the notification message
        const name = allNames[index];
        
        // Remove the name from our array
        allNames.splice(index, 1);
        
        // Update the UI
        updateNamesList();
        updateNameDropdowns(allNames);
        
        // Show notification
        showNotification(`Removed "${name}"`);
    }
    
    // Setup the Delete All button
    deleteAllNamesBtn.addEventListener('click', function() {
        // Don't do anything if there are no names
        if (allNames.length === 0) return;
        
        // Ask for confirmation before deleting all names
        if (confirm(`Are you sure you want to delete all ${allNames.length} names?`)) {
            // Clear the names array
            allNames = [];
            
            // Update the UI
            updateNamesList();
            updateNameDropdowns(allNames);
            
            // Show notification
            showNotification('All names cleared');
        }
    });

    // ===============================================================
    // EXCEPTION AND TOGETHER PAIRS - UI Management
    // ===============================================================
    
    // Add a new exception pair when the button is clicked
    addExceptionBtn.addEventListener('click', function() {
        // Clone the first exception pair to create a new one
        const exceptionPair = document.querySelector('.exception-pair').cloneNode(true);
        const removeBtn = exceptionPair.querySelector('.remove-exception');
        
        // Reset the selections in the cloned pair
        exceptionPair.querySelectorAll('select').forEach(select => {
            select.value = '';
            // Fill the dropdowns with current names
            updateSingleDropdown(select, allNames);
        });
        
        // Add functionality to the remove button
        removeBtn.addEventListener('click', function() {
            exceptionPair.remove(); // Remove this pair when clicked
        });
        
        // Add the new pair to the container
        exceptionsContainer.appendChild(exceptionPair);
    });
    
    // Add a new "must be together" pair when the button is clicked
    addTogetherBtn.addEventListener('click', function() {
        // Clone the first together pair to create a new one
        const togetherPair = document.querySelector('.together-pair').cloneNode(true);
        const removeBtn = togetherPair.querySelector('.remove-together');
        
        // Reset the selections in the cloned pair
        togetherPair.querySelectorAll('select').forEach(select => {
            select.value = '';
            // Fill the dropdowns with current names
            updateSingleDropdown(select, allNames);
        });
        
        // Add functionality to the remove button
        removeBtn.addEventListener('click', function() {
            togetherPair.remove(); // Remove this pair when clicked
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
    
    // Handle removing the first together pair
    document.querySelector('.remove-together').addEventListener('click', function() {
        // Only allow removal if there's more than one pair
        if (togetherContainer.querySelectorAll('.together-pair').length > 1) {
            this.closest('.together-pair').remove();
        }
    });

    // ===============================================================
    // NAME MANAGEMENT - Adding and storing names
    // ===============================================================
    
    /**
     * Saves names to our array, avoiding duplicates
     * @param {string[]} names - Array of names to save
     */
    function saveNames(names) {
        // Add each new unique name to the list
        names.forEach(name => {
            // Only add if the name doesn't already exist
            if (!allNames.includes(name)) {
                allNames.push(name);
            }
        });
        
        // Sort alphabetically for easier reference
        allNames.sort();
    }
    
    /**
     * Updates all name dropdowns with current names
     * @param {string[]} names - Array of names to add to dropdowns
     */
    function updateNameDropdowns(names) {
        // Update all exception select dropdowns
        document.querySelectorAll('.exception-name1, .exception-name2').forEach(select => {
            updateSingleDropdown(select, names);
        });
        
        // Update all together select dropdowns
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
        // Save the current selection if there is one
        const currentSelection = currentValue || select.value;
        
        // Clear existing options except the placeholder
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add each name as a new option
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
        
        // Restore the previous selection if it still exists
        if (currentSelection && names.includes(currentSelection)) {
            select.value = currentSelection;
        }
    }
    
    // Clear groups
    clearGroupsBtn.addEventListener('click', function() {
        groupsContainer.innerHTML = '<p class="empty-state">Generated groups will appear here</p>';
        downloadGroupsBtn.disabled = true;
        clearGroupsBtn.disabled = true;
    });
    
    // Update the generate groups functionality with validation
    generateGroupsBtn.addEventListener('click', function() {
        if (allNames.length < 2) {
            showNotification('Please add at least 2 names', 'error');
            return;
        }
        
        // Get settings
        const groupSize = parseInt(groupSizeInput.value);
        const totalPeople = allNames.length;
        
        // Validate group size
        if (groupSize > totalPeople) {
            // Calculate appropriate max group size
            const maxPossibleGroups = Math.floor(totalPeople / 2);
            const suggestedGroupSize = Math.ceil(totalPeople / maxPossibleGroups);
            
            // Update the UI with a maximum valid group size
            groupSizeInput.value = suggestedGroupSize;
            groupSizeDisplay.textContent = suggestedGroupSize;
            if (suggestedGroupSize <= 10) {
                groupSizeSlider.value = suggestedGroupSize;
            }
            
            showNotification(`Cannot create groups of ${groupSize} with only ${totalPeople} people. Group size adjusted to ${suggestedGroupSize}.`, 'warning');
            return;
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
        
        const exceptions = getExceptionPairs();
        const togetherPairs = getTogetherPairs();
        
        // Validate "must be together" constraints
        const togetherValidation = validateTogetherConstraints(allNames, togetherPairs, groupSize);
        if (!togetherValidation.valid) {
            showNotification(togetherValidation.message, 'error');
            return;
        }
        
        // Generate groups based on settings
        const groups = generateGroups(allNames, groupSize, exceptions, togetherPairs);
        
        // Display the generated groups
        displayGroups(groups);
        
        // Enable the buttons
        downloadGroupsBtn.disabled = false;
        clearGroupsBtn.disabled = false;
    });
    
    // Updates the exception dropdowns when names are added
    addNamesBtn.addEventListener('click', function() {
        // Get names from textarea
        const names = namesInput.value.trim().split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');
            
        if (names.length === 0) {
            showNotification('Please enter at least one name', 'error');
            return;
        }
        
        // Save names and update UI
        saveNames(names);
        updateNamesList();
        updateNameDropdowns(allNames);
        
        // Clear the textarea
        namesInput.value = '';
        
        showNotification(`Added ${names.length} names`);
    });

    // Download the generated groups
    downloadGroupsBtn.addEventListener('click', function() {
        // Get all groups from the UI
        const groups = [];
        
        document.querySelectorAll('.group-card').forEach(groupCard => {
            const groupName = groupCard.querySelector('h3').childNodes[0].textContent;
            const members = [];
            
            groupCard.querySelectorAll('li').forEach(li => {
                members.push(li.textContent);
            });
            
            groups.push({ name: groupName, members });
        });
        
        // Generate text content
        let content = 'Groups Generated by Group Division App\n\n';
        
        groups.forEach(group => {
            content += `${group.name}\n`;
            content += '-'.repeat(group.name.length) + '\n';
            group.members.forEach(member => {
                content += `- ${member}\n`;
            });
            content += '\n';
        });
        
        // Create and trigger download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_groups.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Helper function to get "must be together" pairs
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
    
    // Helper function to get exception pairs
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
    
    // Generate groups algorithm
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
    
    // Handle "must be together" pairs
    function handleMustBeTogether(names, togetherPairs) {
        // Create a copy of names to work with
        let processedNames = [...names];
        
        // Map to track which names are combined
        const combinedMap = {};
        
        // For each "must be together" pair
        togetherPairs.forEach(pair => {
            const [name1, name2] = pair;
            
            // Only process if both names exist in our list
            if (processedNames.includes(name1) && processedNames.includes(name2)) {
                // Remove both names
                processedNames = processedNames.filter(name => name !== name1 && name !== name2);
                
                // Add them back as a combined unit
                const combinedName = `${name1}|${name2}`;
                processedNames.push(combinedName);
                
                // Track the combined names
                combinedMap[name1] = combinedName;
                combinedMap[name2] = combinedName;
            }
        });
        
        // Handle transitive relationships (if A must be with B and B must be with C, then A must be with C)
        let madeChanges = true;
        while (madeChanges) {
            madeChanges = false;
            
            for (let i = 0; i < processedNames.length; i++) {
                const name = processedNames[i];
                if (name.includes('|')) {
                    const parts = name.split('|');
                    
                    // Check each part against the combinedMap for further combinations
                    for (const part of parts) {
                        for (const [key, value] of Object.entries(combinedMap)) {
                            if (value !== name && value.includes(part)) {
                                // Found another combination
                                const otherParts = value.split('|').filter(p => p !== part);
                                
                                // Remove both combined entries
                                processedNames = processedNames.filter(n => n !== name && n !== value);
                                
                                // Create new combined entry
                                const newCombined = [...new Set([...parts, ...otherParts])].join('|');
                                processedNames.push(newCombined);
                                
                                // Update the map
                                for (const p of [...parts, ...otherParts]) {
                                    combinedMap[p] = newCombined;
                                }
                                
                                madeChanges = true;
                                break;
                            }
                        }
                        if (madeChanges) break;
                    }
                }
                if (madeChanges) break;
            }
        }
        
        return processedNames;
    }
    
    // Shuffle array
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Create initial groups
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
    
    // Handle exceptions
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
    
    // Clean up combined names
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
    
    // Display groups in the UI
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
    
    // Update the showNotification function and related styles
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

    // Drag and Drop functionality
    let draggedItem = null;
    let sourceGroupId = null;

    function handleDragStart(e) {
        draggedItem = e.target;
        sourceGroupId = e.target.closest('.group-card').dataset.groupId;
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

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
    
    // Add a new function to validate "must be together" constraints
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
    
    // Initialize the app
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
