/**
 * Name management for the Group Division App
 */

const NameManager = {
    // Array to store all names
    allNames: [],
    
    // Index of the name currently being edited (-1 if none)
    editingNameIndex: -1,
    
    /**
     * Initializes the name manager
     */
    init: function() {
        // Load saved names
        this.allNames = Storage.loadNames();
        if (this.allNames.length > 0) {
            this.updateNamesList();
            this.updateNameDropdowns(this.allNames);
            Utils.showNotification(`Loaded ${this.allNames.length} saved names`);
        }
    },
    
    /**
     * Adds names to the list, avoiding duplicates
     * @param {string[]} names - Array of names to add
     */
    addNames: function(names) {
        // Add non-duplicate names
        names.forEach(name => {
            if (!this.allNames.includes(name)) {
                this.allNames.push(name);
            }
        });
        
        // Sort alphabetically
        this.allNames.sort();
        
        // Update UI and storage
        this.updateNamesList();
        this.updateNameDropdowns(this.allNames);
        Storage.saveNames(this.allNames);
    },
    
    /**
     * Deletes a name by index
     * @param {number} index - The index of the name to delete
     */
    deleteName: function(index) {
        const name = this.allNames[index];
        this.allNames.splice(index, 1);
        
        this.updateNamesList();
        this.updateNameDropdowns(this.allNames);
        Storage.saveNames(this.allNames);
        
        Utils.showNotification(`Removed "${name}"`);
    },
    
    /**
     * Clears all names
     */
    clearAllNames: function() {
        if (this.allNames.length === 0) return;
        
        if (confirm(`Are you sure you want to delete all ${this.allNames.length} names?`)) {
            this.allNames = [];
            this.updateNamesList();
            this.updateNameDropdowns(this.allNames);
            Storage.saveNames(this.allNames);
            
            Utils.showNotification('All names cleared');
        }
    },
    
    /**
     * Updates the list of names in the UI
     */
    updateNamesList: function() {
        const namesList = document.getElementById('names-list');
        const nameCount = document.getElementById('name-count');
        
        // Clear current list
        namesList.innerHTML = '';
        
        // Update count display
        nameCount.textContent = `${this.allNames.length} names`;
        
        // Show empty state if no names
        if (this.allNames.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-state';
            emptyItem.textContent = 'No names added yet';
            namesList.appendChild(emptyItem);
            return;
        }
        
        // Add each name to the list
        this.allNames.forEach((name, index) => {
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
            editBtn.addEventListener('click', () => this.openEditModal(name, index));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-name';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete name';
            deleteBtn.addEventListener('click', () => this.deleteName(index));
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            li.appendChild(nameText);
            li.appendChild(actions);
            
            namesList.appendChild(li);
        });
    },
    
    /**
     * Updates all name dropdowns with current names
     * @param {string[]} names - Array of names to add as options
     */
    updateNameDropdowns: function(names) {
        // Update all exception select dropdowns
        document.querySelectorAll('.exception-name1, .exception-name2').forEach(select => {
            this.updateSingleDropdown(select, names);
        });
        
        // Update all "must be together" select dropdowns
        document.querySelectorAll('.together-name1, .together-name2').forEach(select => {
            this.updateSingleDropdown(select, names);
        });
    },
    
    /**
     * Updates a single dropdown with the list of names
     * @param {HTMLSelectElement} select - The select element to update
     * @param {string[]} names - Array of names to add as options
     * @param {string} currentValue - Optional current value to preserve
     */
    updateSingleDropdown: function(select, names, currentValue = '') {
        const currentSelection = currentValue || select.value;
        
        // Clear existing options except the first one (placeholder)
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
        
        // Re-select previous value if possible
        if (currentSelection && names.includes(currentSelection)) {
            select.value = currentSelection;
        }
    },
    
    /**
     * Opens the edit modal for a specific name
     * @param {string} name - The name being edited
     * @param {number} index - The index of the name in the allNames array
     */
    openEditModal: function(name, index) {
        const editModal = document.getElementById('edit-modal');
        const editNameInput = document.getElementById('edit-name-input');
        
        editNameInput.value = name;
        this.editingNameIndex = index;
        
        editModal.classList.add('active');
        editNameInput.focus();
    },
    
    /**
     * Closes the edit modal
     */
    closeModal: function() {
        const editModal = document.getElementById('edit-modal');
        editModal.classList.remove('active');
        this.editingNameIndex = -1;
    },
    
    /**
     * Saves the edited name
     */
    saveEditedName: function() {
        const editNameInput = document.getElementById('edit-name-input');
        const newName = editNameInput.value.trim();
        
        if (newName && this.editingNameIndex !== -1) {
            const oldName = this.allNames[this.editingNameIndex];
            this.allNames[this.editingNameIndex] = newName;
            
            this.updateNamesList();
            this.updateNameDropdowns(this.allNames);
            Storage.saveNames(this.allNames);
            
            Utils.showNotification(`Changed "${oldName}" to "${newName}"`);
            this.closeModal();
        }
    }
};