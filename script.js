document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const namesInput = document.getElementById('names-input');
    const fileInput = document.getElementById('file-input');
    const addNamesBtn = document.getElementById('add-names');
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
    
    // Add "must be together" UI
    addTogetherBtn.addEventListener('click', function() {
        const togetherPair = document.querySelector('.together-pair').cloneNode(true);
        const removeBtn = togetherPair.querySelector('.remove-together');
        
        // Reset selections in the cloned pair
        togetherPair.querySelectorAll('select').forEach(select => {
            select.value = '';
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
    
    // Update name dropdowns for both exceptions and together pairs
    function updateNameDropdowns(names) {
        // Function to update a single select element
        function updateSelect(select, names, currentValue = '') {
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
        
        // Update all exception selects
        document.querySelectorAll('.exception-name1, .exception-name2').forEach(select => {
            updateSelect(select, names);
        });
        
        // Update all together selects
        document.querySelectorAll('.together-name1, .together-name2').forEach(select => {
            updateSelect(select, names);
        });
    }
    
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

        // Create example groups for UI demonstration
        // You will replace this with your actual group generation code
        createExampleGroups();
    });
    
    // Updates the exception dropdowns when names are added
    // This is stubbed since you'll implement the actual names management
    addNamesBtn.addEventListener('click', function() {
        // This is just a placeholder for demonstration
        // In your implementation, you'll extract the actual names from the input
        const demoNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace'];
        updateNameDropdowns(demoNames);
        console.log('Add names button clicked - functionality to be implemented');
    });

    // Create example groups for demonstration (you'll replace this with actual functionality)
    function createExampleGroups() {
        groupsContainer.innerHTML = '';
        
        // Example groups - you will replace this with your actual group generation logic
        const exampleGroups = [
            { name: "Group 1", members: ["Alice", "Bob", "Charlie", "David"] },
            { name: "Group 2", members: ["Eva", "Frank", "Grace", "Henry"] },
            { name: "Group 3", members: ["Ivy", "Jack", "Kate", "Leo"] },
            { name: "Group 4", members: ["Maya", "Noah", "Olivia", "Paul"] },
        ];
        
        exampleGroups.forEach((group, index) => {
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
            
            // Add drop event listeners to the group
            groupCard.addEventListener('dragover', handleDragOver);
            groupCard.addEventListener('dragleave', handleDragLeave);
            groupCard.addEventListener('drop', handleDrop);
            
            groupsContainer.appendChild(groupCard);
        });

        // Add an empty group placeholder
        const emptyGroup = document.createElement('div');
        emptyGroup.className = 'group-placeholder';
        emptyGroup.textContent = 'Drag members here to create a new group';
        emptyGroup.addEventListener('dragover', handleDragOver);
        emptyGroup.addEventListener('dragleave', handleDragLeave);
        emptyGroup.addEventListener('drop', handleDropOnEmpty);
        groupsContainer.appendChild(emptyGroup);
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
});
