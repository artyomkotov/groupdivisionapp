/**
 * Group generation for the Group Division App
 */

const GroupGenerator = {
    /**
     * Generates groups based on provided settings
     * @param {string[]} names - Array of names to divide
     * @param {number} groupSize - The target size for each group
     * @param {string[][]} exceptions - Name pairs that shouldn't be together
     * @param {string[][]} mustBeTogether - Name pairs that must be together
     * @returns {{name: string, members: string[]}[]} - Array of group objects
     */
    generateGroups: function(names, groupSize, exceptions, mustBeTogether) {
        // Step 1: Handle "must be together" constraints
        let processedNames = this.handleMustBeTogether(names, mustBeTogether);
        
        // Step 2: Shuffle the names randomly
        processedNames = Utils.shuffleArray(processedNames);
        
        // Step 3: Create initial groups
        let groups = this.createInitialGroups(processedNames, groupSize);
        
        // Step 4: Handle exceptions
        groups = this.handleExceptions(groups, exceptions);
        
        // Step 5: Clean up any combined names
        groups = this.cleanupCombinedNames(groups);
        
        return groups;
    },
    
    /**
     * Handles the "must be together" constraints by combining names
     * @param {string[]} names - Array of names to process
     * @param {string[][]} togetherPairs - Array of name pairs that must be together
     * @returns {string[]} - Processed array of names with combined names
     */
    handleMustBeTogether: function(names, togetherPairs) {
        // Create a copy of the names array to avoid modifying the original
        let processedNames = [...names];
        
        // Create a map to track which names are combined
        const combinedMap = {};
        
        // Combine paired names with a separator
        togetherPairs.forEach(pair => {
            const [name1, name2] = pair;
            
            if (processedNames.includes(name1) && processedNames.includes(name2)) {
                processedNames = processedNames.filter(name => name !== name1 && name !== name2);
                
                const combinedName = `${name1}|${name2}`;
                processedNames.push(combinedName);
                
                combinedMap[name1] = combinedName;
                combinedMap[name2] = combinedName;
            }
        });
        
        // Handle transitive relationships
        let madeChanges = true;
        while (madeChanges) {
            madeChanges = false;
            
            for (let i = 0; i < processedNames.length; i++) {
                const name = processedNames[i];
                
                if (name.includes('|')) {
                    const parts = name.split('|');
                    
                    for (const part of parts) {
                        for (const [key, value] of Object.entries(combinedMap)) {
                            if (value !== name && value.includes(part)) {
                                const otherParts = value.split('|').filter(p => p !== part);
                                
                                processedNames = processedNames.filter(n => n !== name && n !== value);
                                
                                const newCombined = [...new Set([...parts, ...otherParts])].join('|');
                                processedNames.push(newCombined);
                                
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
    },
    
    /**
     * Creates initial groups from the processed names
     * @param {string[]} processedNames - Array of processed names
     * @param {number} groupSize - The desired size of each group
     * @returns {{name: string, members: string[]}[]} - Array of initial group objects
     */
    createInitialGroups: function(processedNames, groupSize) {
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
        
        // Track effective group sizes
        const effectiveGroupSizes = Array(numberOfGroups).fill(0);
        
        // First pass: assign combined names first
        const combinedNames = processedNames.filter(name => name.includes('|'));
        const singleNames = processedNames.filter(name => !name.includes('|'));
        
        // Sort combined names by size (descending)
        combinedNames.sort((a, b) => b.split('|').length - a.split('|').length);
        
        // Assign combined names
        for (const name of combinedNames) {
            const memberCount = name.split('|').length;
            const targetGroupIndex = effectiveGroupSizes.indexOf(Math.min(...effectiveGroupSizes));
            
            groups[targetGroupIndex].members.push(name);
            effectiveGroupSizes[targetGroupIndex] += memberCount;
        }
        
        // Shuffle single names for randomness
        const shuffledNames = Utils.shuffleArray(singleNames);
        
        // Second pass: distribute the single names evenly
        for (const name of shuffledNames) {
            const targetGroupIndex = effectiveGroupSizes.indexOf(Math.min(...effectiveGroupSizes));
            
            groups[targetGroupIndex].members.push(name);
            effectiveGroupSizes[targetGroupIndex] += 1;
        }
        
        return groups;
    },
    
    /**
     * Handles exceptions by ensuring specified pairs are not in the same group
     * @param {{name: string, members: string[]}[]} groups - Array of group objects
     * @param {string[][]} exceptions - Array of name pairs that should not be together
     * @returns {{name: string, members: string[]}[]} - Array of group objects with exceptions handled
     */
    handleExceptions: function(groups, exceptions) {
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
            
            if (violatedExceptionIndex === -1) break;
            
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
                
                for (let i = 0; i < groups[g].members.length; i++) {
                    const memberToSwap = groups[g].members[i];
                    
                    // Check if swapping would cause another violation
                    let wouldCauseViolation = false;
                    for (const [exName1, exName2] of exceptions) {
                        if ((memberToSwap === exName1 || (memberToSwap.includes('|') && memberToSwap.split('|').includes(exName1))) && 
                            groups[g].members.some(m => m === exName2 || (m.includes('|') && m.split('|').includes(exName2)))) {
                            wouldCauseViolation = true;
                            break;
                        }
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
                Utils.showNotification(`Couldn't resolve all exceptions. Some constraints may not be satisfied.`, 'warning');
            }
        }
        
        if (swaps >= maxSwaps) {
            Utils.showNotification(`Maximum swap attempts reached. Some constraints may not be satisfied.`, 'warning');
        }
        
        return groups;
    },
    
    /**
     * Cleans up combined names by splitting them into individual names
     * @param {{name: string, members: string[]}[]} groups - Array of group objects
     * @returns {{name: string, members: string[]}[]} - Array of group objects with individual names
     */
    cleanupCombinedNames: function(groups) {
        return groups.map(group => {
            const newGroup = { ...group, members: [] };
            
            group.members.forEach(member => {
                if (member.includes('|')) {
                    newGroup.members.push(...member.split('|'));
                } else {
                    newGroup.members.push(member);
                }
            });
            
            return newGroup;
        });
    },
    
    /**
     * Validates if the "must be together" constraints are compatible with group size
     * @param {string[]} names - Array of names
     * @param {string[][]} togetherPairs - Array of name pairs that must be together
     * @param {number} groupSize - The desired size of each group
     * @returns {{valid: boolean, message?: string}} - Validation result
     */
    validateTogetherConstraints: function(names, togetherPairs, groupSize) {
        if (togetherPairs.length === 0) {
            return { valid: true };
        }
        
        // Process pairs to find largest must-be-together group
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
        
        // If largest must-be-together group exceeds group size, it's invalid
        if (largestComponentSize > groupSize) {
            return {
                valid: false,
                message: `You have specified that ${largestComponentSize} people must be together, but the group size is only ${groupSize}. Please increase the group size or remove some "must be together" constraints.`
            };
        }
        
        return { valid: true };
    }
};