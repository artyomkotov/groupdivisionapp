document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const namesInput = document.getElementById('names-input');
    const fileInput = document.getElementById('file-input');
    const addNamesBtn = document.getElementById('add-names');
    const namesList = document.getElementById('names-list');
    const nameCount = document.getElementById('name-count');
    const deleteAllNamesBtn = document.getElementById('delete-all-names');
    const groupSizeInput = document.getElementById('group-size');
    const groupSizeSlider = document.getElementById('group-size-slider');
    const groupSizeDisplay = document.getElementById('group-size-display');
    const addExceptionBtn = document.getElementById('add-exception');
    const addTogetherBtn = document.getElementById('add-together');
    const generateGroupsBtn = document.getElementById('generate-groups');
    const downloadGroupsBtn = document.getElementById('download-groups');
    const clearGroupsBtn = document.getElementById('clear-groups');
    const exceptionsContainer = document.getElementById('exceptions-container');
    const togetherContainer = document.getElementById('together-container');
    const groupsContainer = document.getElementById('groups-container');
    const editModal = document.getElementById('edit-modal');
    const editNameInput = document.getElementById('edit-name-input');
    const saveEditBtn = document.getElementById('save-edit');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const closeModalBtn = document.getElementById('close-modal');
    
    // Store all names
    let allNames = [];
    let editingNameIndex = -1;

    // Modal functionality
    closeModalBtn.addEventListener('click', closeModal);
    cancelEditBtn.addEventListener('click', closeModal);
    
    saveEditBtn.addEventListener('click', function() {
        const newName = editNameInput.value.trim();
        if (newName && editingNameIndex !== -1) {
            // Update the name in our array
            const oldName = allNames[editingNameIndex];
            allNames[editingNameIndex] = newName;
            
            // Update the UI
            updateNamesList();
            updateNameDropdowns(allNames);
            
            // Show notification
            showNotification(`Changed "${oldName}" to "${newName}"`);
            
            // Close the modal
            closeModal();
        }
    });
    
    function openEditModal(name, index) {
        editNameInput.value = name;
        editingNameIndex = index;
        editModal.classList.add('active');
        editNameInput.focus();
    }
    
    function closeModal() {
        editModal.classList.remove('active');
        editingNameIndex = -1;
    }

    // Sync slider and number input
    groupSizeSlider.addEventListener('input', function() {
        const value = this.value;
        groupSizeInput.value = value;
        groupSizeDisplay.textContent = value;
    });
    
    groupSizeInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        // Ensure value is within range
        if (value < 2) value = 2;
        if (value > 20) value = 20;
        
        // Update slider if within its range
        if (value <= 10) {
            groupSizeSlider.value = value;
        }
        
        groupSizeDisplay.textContent = value;
    });
    
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
    
    // File input handling
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        
        const fileName = file.name;
        const fileLabel = this.nextElementSibling.querySelector('span');
        fileLabel.textContent = fileName || 'Choose a file';
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            let names = [];
            
            // Process based on file extension
            if (fileName.toLowerCase().endsWith('.csv')) {
                // Process CSV - split by newlines, then by commas
                names = content.trim().split(/\r?\n/).flatMap(line => 
                    line.split(',').map(name => name.trim()).filter(name => name)
                );
            } else {
                // Process TXT - split by newlines
                names = content.trim().split(/\r?\n/).map(name => name.trim()).filter(name => name);
            }
            
            // Add the names
            if (names.length > 0) {
                saveNames(names);
                updateNamesList();
                updateNameDropdowns(allNames);
                // Show notification
                showNotification(`Added ${names.length} names from file`);
            }
        };
        
        reader.readAsText(file);
    });
    
    // Name management functionality
    function updateNamesList() {
        // Clear the current list
        namesList.innerHTML = '';
        
        // Update the count display
        nameCount.textContent = `${allNames.length} names`;
        
        if (allNames.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-state';
            emptyItem.textContent = 'No names added yet';
            namesList.appendChild(emptyItem);
            return;
        }
        
        // Add each name to the list
        allNames.forEach((name, index) => {
            const li = document.createElement('li');
            
            const nameText = document.createElement('span');
            nameText.className = 'name-text';
            nameText.textContent = name;
            
            const actions = document.createElement('div');
            actions.className = 'name-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-name';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit name';
            editBtn.addEventListener('click', () => openEditModal(name, index));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-name';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete name';
            deleteBtn.addEventListener('click', () => deleteName(index));
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            li.appendChild(nameText);
            li.appendChild(actions);
            
            namesList.appendChild(li);
        });
    }
    
    function deleteName(index) {
        const name = allNames[index];
        allNames.splice(index, 1);
        updateNamesList();
        updateNameDropdowns(allNames);
        showNotification(`Removed "${name}"`);
    }
    
    deleteAllNamesBtn.addEventListener('click', function() {
        if (allNames.length === 0) return;
        
        if (confirm(`Are you sure you want to delete all ${allNames.length} names?`)) {
            allNames = [];
            updateNamesList();
            updateNameDropdowns(allNames);
            showNotification('All names cleared');
        }
    });
    
    // Add exceptions UI
    addExceptionBtn.addEventListener('click', function() {
        const exceptionPair = document.querySelector('.exception-pair').cloneNode(true);
        const removeBtn = exceptionPair.querySelector('.remove-exception');
        
        // Reset selections in the cloned pair
        exceptionPair.querySelectorAll('select').forEach(select => {
            select.value = '';
            // Re-populate with current names
            updateSingleDropdown(select, allNames);
        });
        
        // Add remove functionality
        removeBtn.addEventListener('click', function() {
            exceptionPair.remove();
        });
        
        exceptionsContainer.appendChild(exceptionPair);
    });
    
    // Add "must be together" UI
    addTogetherBtn.addEventListener('click', function() {
        const togetherPair = document.querySelector('.together-pair').cloneNode(true);
        const removeBtn = togetherPair.querySelector('.remove-together');
        
        // Reset selections in the cloned pair
        togetherPair.querySelectorAll('select').forEach(select => {
            select.value = '';
            // Re-populate with current names
            updateSingleDropdown(select, allNames);
        });
        
        // Add remove functionality
        removeBtn.addEventListener('click', function() {
            togetherPair.remove();
        });
        
        togetherContainer.appendChild(togetherPair);
    });
    
    // Remove exception handler for initial pair
    document.querySelector('.remove-exception').addEventListener('click', function() {
        if (exceptionsContainer.querySelectorAll('.exception-pair').length > 1) {
            this.closest('.exception-pair').remove();
        }
    });
    
    // Remove together handler for initial pair
    document.querySelector('.remove-together').addEventListener('click', function() {
        if (togetherContainer.querySelectorAll('.together-pair').length > 1) {
            this.closest('.together-pair').remove();
        }
    });
    
    // Save names to our array
    function saveNames(names) {
        // Add new unique names to the list
        names.forEach(name => {
            if (!allNames.includes(name)) {
                allNames.push(name);
            }
        });
        
        // Sort alphabetically
        allNames.sort();
    }
    
    // Update name dropdowns for both exceptions and together pairs
    function updateNameDropdowns(names) {
        // Update all exception selects
        document.querySelectorAll('.exception-name1, .exception-name2').forEach(select => {
            updateSingleDropdown(select, names);
        });
        
        // Update all together selects
        document.querySelectorAll('.together-name1, .together-name2').forEach(select => {
            updateSingleDropdown(select, names);
        });
    }
    
    // Update a single dropdown with names
    function updateSingleDropdown(select, names, currentValue = '') {
        // Save current selection if there is one
        const currentSelection = currentValue || select.value;
        
        // Clear options except the placeholder
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add new options
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
        
        // Restore selection if it still exists
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
    
    // Generate groups button - main functionality
    generateGroupsBtn.addEventListener('click', function() {
        if (allNames.length < 2) {
            showNotification('Please add at least 2 names', 'error');
            return;
        }
        
        // Get settings
        const groupSize = parseInt(groupSizeInput.value);
        const exceptions = getExceptionPairs();
        const togetherPairs = getTogetherPairs();
        
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
        let currentGroup = [];
        
        // Calculate how many groups we need
        const totalMembers = processedNames.reduce((count, name) => {
            return count + (name.includes('|') ? name.split('|').length : 1);
        }, 0);
        
        const numberOfGroups = Math.ceil(totalMembers / groupSize);
        
        // If there's only one group needed, return all names in a single group
        if (numberOfGroups <= 1) {
            return [{
                name: "Group 1",
                members: processedNames
            }];
        }
        
        // Create groups with approximately equal sizes
        const idealGroupSize = Math.ceil(processedNames.length / numberOfGroups);
        
        for (let i = 0; i < numberOfGroups; i++) {
            groups.push({
                name: `Group ${i + 1}`,
                members: []
            });
        }
        
        // Assign names to groups
        let groupIndex = 0;
        processedNames.forEach(name => {
            groups[groupIndex].members.push(name);
            groupIndex = (groupIndex + 1) % groups.length;
        });
        
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
