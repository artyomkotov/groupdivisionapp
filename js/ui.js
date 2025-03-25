/**
 * UI management for the Group Division App
 */

const UI = {
    /**
     * Initializes the UI
     */
    init: function() {
        this.setupEventListeners();
        this.setupTabSwitching();
    },
    
    /**
     * Sets up all event listeners
     */
    setupEventListeners: function() {
        // Input section
        document.getElementById('add-names').addEventListener('click', this.handleAddNames);
        document.getElementById('file-input').addEventListener('change', this.handleFileUpload);
        
        // Name management
        document.getElementById('delete-all-names').addEventListener('click', () => NameManager.clearAllNames());
        
        // Group size controls
        const groupSizeSlider = document.getElementById('group-size-slider');
        const groupSizeInput = document.getElementById('group-size');
        
        groupSizeSlider.addEventListener('input', function() {
            const value = this.value;
            groupSizeInput.value = value;
            document.getElementById('group-size-display').textContent = value;
        });
        
        groupSizeInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 2) value = 2;
            if (value > 20) value = 20;
            
            if (value <= 10) {
                groupSizeSlider.value = value;
            }
            
            groupSizeInput.value = value;
            document.getElementById('group-size-display').textContent = value;
        });
        
        // Exception and together pairs
        document.getElementById('add-exception').addEventListener('click', this.handleAddException);
        document.getElementById('add-together').addEventListener('click', this.handleAddTogether);
        
        document.querySelector('.remove-exception').addEventListener('click', function() {
            const container = document.getElementById('exceptions-container');
            if (container.querySelectorAll('.exception-pair').length > 1) {
                this.closest('.exception-pair').remove();
            }
        });
        
        document.querySelector('.remove-together').addEventListener('click', function() {
            const container = document.getElementById('together-container');
            if (container.querySelectorAll('.together-pair').length > 1) {
                this.closest('.together-pair').remove();
            }
        });
        
        // Modal actions
        document.getElementById('close-modal').addEventListener('click', () => NameManager.closeModal());
        document.getElementById('cancel-edit').addEventListener('click', () => NameManager.closeModal());
        document.getElementById('save-edit').addEventListener('click', () => NameManager.saveEditedName());
        
        // Generate and manage groups
        document.getElementById('generate-groups').addEventListener('click', this.handleGenerateGroups);
        document.getElementById('clear-groups').addEventListener('click', this.handleClearGroups);
        document.getElementById('download-groups').addEventListener('click', this.handleDownloadGroups);
    },
    
    /**
     * Sets up tab switching for manual entry and file upload
     */
    setupTabSwitching: function() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                document.getElementById(tabId).classList.add('active');
            });
        });
    },
    
    /**
     * Handles adding names from the textarea
     */
    handleAddNames: function() {
        const namesInput = document.getElementById('names-input');
        const names = namesInput.value.trim().split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');
            
        if (names.length === 0) {
            Utils.showNotification('Please enter at least one name', 'error');
            return;
        }
        
        NameManager.addNames(names);
        namesInput.value = '';
        
        Utils.showNotification(`Added ${names.length} names`);
    },
    
    /**
     * Handles file upload for importing names
     * @param {Event} e - The change event from the file input
     */
    handleFileUpload: function(e) {
        const file = this.files[0];
        if (!file) return;
        
        const fileName = file.name;
        const fileLabel = this.nextElementSibling.querySelector('span');
        fileLabel.textContent = fileName || 'Choose a file';
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            let names = [];
            
            if (fileName.toLowerCase().endsWith('.csv')) {
                names = content.trim().split(/\r?\n/).flatMap(line => 
                    line.split(',').map(name => name.trim()).filter(name => name)
                );
            } else {
                names = content.trim().split(/\r?\n/).map(name => name.trim()).filter(name => name);
            }
            
            if (names.length > 0) {
                NameManager.addNames(names);
                Utils.showNotification(`Added ${names.length} names from file`);
            }
        };
        
        reader.readAsText(file);
    },
    
    /**
     * Handles adding a new exception pair
     */
    handleAddException: function() {
        const exceptionsContainer = document.getElementById('exceptions-container');
        const exceptionPair = document.querySelector('.exception-pair').cloneNode(true);
        const removeBtn = exceptionPair.querySelector('.remove-exception');
        
        exceptionPair.querySelectorAll('select').forEach(select => {
            select.value = '';
            NameManager.updateSingleDropdown(select, NameManager.allNames);
        });
        
        removeBtn.addEventListener('click', function() {
            exceptionPair.remove();
        });
        
        exceptionsContainer.appendChild(exceptionPair);
    },
    
    /**
     * Handles adding a new "must be together" pair
     */
    handleAddTogether: function() {
        const togetherContainer = document.getElementById('together-container');
        const togetherPair = document.querySelector('.together-pair').cloneNode(true);
        const removeBtn = togetherPair.querySelector('.remove-together');
        
        togetherPair.querySelectorAll('select').forEach(select => {
            select.value = '';
            NameManager.updateSingleDropdown(select, NameManager.allNames);
        });
        
        removeBtn.addEventListener('click', function() {
            togetherPair.remove();
        });
        
        togetherContainer.appendChild(togetherPair);
    },
    
    /**
     * Gets exception pairs from the UI
     * @returns {string[][]} - Array of name pairs that should not be together
     */
    getExceptionPairs: function() {
        const pairs = [];
        document.querySelectorAll('.exception-pair').forEach(pair => {
            const name1 = pair.querySelector('.exception-name1').value;
            const name2 = pair.querySelector('.exception-name2').value;
            if (name1 && name2 && name1 !== name2) {
                pairs.push([name1, name2]);
            }
        });
        return pairs;
    },
    
    /**
     * Gets "must be together" pairs from the UI
     * @returns {string[][]} - Array of name pairs that must be together
     */
    getTogetherPairs: function() {
        const pairs = [];
        document.querySelectorAll('.together-pair').forEach(pair => {
            const name1 = pair.querySelector('.together-name1').value;
            const name2 = pair.querySelector('.together-name2').value;
            if (name1 && name2 && name1 !== name2) {
                pairs.push([name1, name2]);
            }
        });
        return pairs;
    },
    
    /**
     * Handles generating groups
     */
    handleGenerateGroups: function() {
        const allNames = NameManager.allNames;
        
        if (allNames.length < 2) {
            Utils.showNotification('Please add at least 2 names', 'error');
            return;
        }
        
        const groupSizeInput = document.getElementById('group-size');
        const groupSizeSlider = document.getElementById('group-size-slider');
        const groupSizeDisplay = document.getElementById('group-size-display');
        
        const groupSize = parseInt(groupSizeInput.value);
        const totalPeople = allNames.length;
        
        // Validate group size
        if (groupSize > totalPeople) {
            const maxPossibleGroups = Math.floor(totalPeople / 2);
            const suggestedGroupSize = Math.ceil(totalPeople / maxPossibleGroups);
            
            groupSizeInput.value = suggestedGroupSize;
            groupSizeDisplay.textContent = suggestedGroupSize;
            if (suggestedGroupSize <= 10) {
                groupSizeSlider.value = suggestedGroupSize;
            }
            
            Utils.showNotification(`Cannot create groups of ${groupSize} with only ${totalPeople} people. Group size adjusted to ${suggestedGroupSize}.`, 'warning');
            return;
        }
        
        // Additional validation for single group
        if (groupSize === totalPeople && totalPeople > 3) {
            const suggestedGroupSize = Math.ceil(totalPeople / 2);
            groupSizeInput.value = suggestedGroupSize;
            groupSizeDisplay.textContent = suggestedGroupSize;
            if (suggestedGroupSize <= 10) {
                groupSizeSlider.value = suggestedGroupSize;
            }
            
            Utils.showNotification(`Creating one group with all people defeats the purpose. Group size adjusted to ${suggestedGroupSize} to create multiple groups.`, 'warning');
            return;
        }
        
        // Get constraint pairs
        const exceptions = UI.getExceptionPairs();
        const togetherPairs = UI.getTogetherPairs();
        
        // Validate together constraints
        const togetherValidation = GroupGenerator.validateTogetherConstraints(allNames, togetherPairs, groupSize);
        if (!togetherValidation.valid) {
            Utils.showNotification(togetherValidation.message, 'error');
            return;
        }
        
        // Generate and display groups
        const groups = GroupGenerator.generateGroups(allNames, groupSize, exceptions, togetherPairs);
        UI.displayGroups(groups);
        
        // Enable group action buttons
        document.getElementById('download-groups').disabled = false;
        document.getElementById('clear-groups').disabled = false;
    },
    
    /**
     * Displays the generated groups in the UI
     * @param {{name: string, members: string[]}[]} groups - Array of group objects
     */
    displayGroups: function(groups) {
        const groupsContainer = document.getElementById('groups-container');
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
                memberItem.addEventListener('dragstart', DragDrop.handleDragStart);
                memberItem.addEventListener('dragend', DragDrop.handleDragEnd);
                
                memberList.appendChild(memberItem);
            });
            
            groupCard.appendChild(groupHeader);
            groupCard.appendChild(memberList);
            
            // Add drop event listeners
            groupCard.addEventListener('dragover', DragDrop.handleDragOver);
            groupCard.addEventListener('dragleave', DragDrop.handleDragLeave);
            groupCard.addEventListener('drop', DragDrop.handleDrop);
            
            groupsContainer.appendChild(groupCard);
        });
        
        // Add empty group placeholder
        const emptyGroup = document.createElement('div');
        emptyGroup.className = 'group-placeholder';
        emptyGroup.textContent = 'Drag members here to create a new group';
        emptyGroup.addEventListener('dragover', DragDrop.handleDragOver);
        emptyGroup.addEventListener('dragleave', DragDrop.handleDragLeave);
        emptyGroup.addEventListener('drop', DragDrop.handleDropOnEmpty);
        groupsContainer.appendChild(emptyGroup);
    },
    
    /**
     * Handles clearing the generated groups
     */
    handleClearGroups: function() {
        const groupsContainer = document.getElementById('groups-container');
        groupsContainer.innerHTML = '<p class="empty-state">Generated groups will appear here</p>';
        
        document.getElementById('download-groups').disabled = true;
        document.getElementById('clear-groups').disabled = true;
    },
    
    /**
     * Handles downloading the generated groups as a text file
     */
    handleDownloadGroups: function() {
        const groups = [];
        
        document.querySelectorAll('.group-card').forEach(groupCard => {
            const groupName = groupCard.querySelector('h3').childNodes[0].textContent;
            const members = [];
            
            groupCard.querySelectorAll('li').forEach(li => {
                members.push(li.textContent);
            });
            
            groups.push({ name: groupName, members });
        });
        
        // Generate content
        let content = 'Groups Generated by Group Division App\n\n';
        
        groups.forEach(group => {
            content += `${group.name}\n`;
            content += '-'.repeat(group.name.length) + '\n';
            group.members.forEach(member => {
                content += `- ${member}\n`;
            });
            content += '\n';
        });
        
        // Create download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_groups.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};