/**
 * Drag and drop functionality for group reorganization
 */

const DragDrop = {
    // Track the currently dragged item and its source group
    draggedItem: null,
    sourceGroupId: null,
    
    /**
     * Initializes drag and drop handlers
     */
    init: function() {
        // We don't need to do anything here since event listeners
        // are added when groups are created
    },
    
    /**
     * Handles the drag start event
     * @param {DragEvent} e - The drag event
     */
    handleDragStart: function(e) {
        DragDrop.draggedItem = e.target;
        DragDrop.sourceGroupId = e.target.closest('.group-card').dataset.groupId;
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    },
    
    /**
     * Handles the drag end event
     * @param {DragEvent} e - The drag event
     */
    handleDragEnd: function(e) {
        e.target.classList.remove('dragging');
    },
    
    /**
     * Handles the drag over event
     * @param {DragEvent} e - The drag event
     */
    handleDragOver: function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    },
    
    /**
     * Handles the drag leave event
     * @param {DragEvent} e - The drag event
     */
    handleDragLeave: function(e) {
        this.classList.remove('drag-over');
    },
    
    /**
     * Handles the drop event
     * @param {DragEvent} e - The drag event
     */
    handleDrop: function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (DragDrop.draggedItem) {
            const targetGroup = this;
            const targetGroupId = targetGroup.dataset.groupId;
            
            // Only move if dropping into a different group
            if (DragDrop.sourceGroupId !== targetGroupId) {
                // Update the source group's count
                const sourceGroup = document.querySelector(`.group-card[data-group-id="${DragDrop.sourceGroupId}"]`);
                const sourceGroupCount = sourceGroup.querySelector('.group-count');
                sourceGroupCount.textContent = parseInt(sourceGroupCount.textContent) - 1;
                
                // Update the target group's count
                const targetGroupCount = targetGroup.querySelector('.group-count');
                targetGroupCount.textContent = parseInt(targetGroupCount.textContent) + 1;
                
                // Move the item
                targetGroup.querySelector('.member-list').appendChild(DragDrop.draggedItem);
            }
            
            DragDrop.draggedItem = null;
            DragDrop.sourceGroupId = null;
        }
    },
    
    /**
     * Handles the drop event on an empty group placeholder
     * @param {DragEvent} e - The drag event
     */
    handleDropOnEmpty: function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (DragDrop.draggedItem) {
            // Create a new group
            const groupsContainer = document.getElementById('groups-container');
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
            const sourceGroup = document.querySelector(`.group-card[data-group-id="${DragDrop.sourceGroupId}"]`);
            const sourceGroupCount = sourceGroup.querySelector('.group-count');
            sourceGroupCount.textContent = parseInt(sourceGroupCount.textContent) - 1;
            
            // Move the item
            memberList.appendChild(DragDrop.draggedItem);
            
            newGroup.appendChild(groupHeader);
            newGroup.appendChild(memberList);
            
            // Add drop event listeners to the new group
            newGroup.addEventListener('dragover', DragDrop.handleDragOver);
            newGroup.addEventListener('dragleave', DragDrop.handleDragLeave);
            newGroup.addEventListener('drop', DragDrop.handleDrop);
            
            // Insert before the placeholder
            groupsContainer.insertBefore(newGroup, this);
            
            DragDrop.draggedItem = null;
            DragDrop.sourceGroupId = null;
        }
    }
};