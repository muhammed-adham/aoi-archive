// Custom Filter Dropdowns for Category and Sort
document.addEventListener('DOMContentLoaded', function() {
    // Make sure translations are loaded before proceeding
    // Some browsers might delay window.translations availability
    const waitForTranslations = function(callback) {
        if (window.translations) {
            callback();
        } else {
            setTimeout(function() {
                waitForTranslations(callback);
            }, 50);
        }
    };

    waitForTranslations(function() {
        // Check if we're in Arabic/RTL mode using consistent method
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        const isRTL = currentLang === 'ar';
        
        // Function to get translation for a key
        function getTranslation(key, defaultText) {
            if (window.translations && 
                window.translations[currentLang] && 
                window.translations[currentLang][key]) {
                return window.translations[currentLang][key];
            }
            return defaultText;
        }
        
        // Function to create custom dropdowns
        function createCustomDropdown(selectElement, labelText) {
            if (!selectElement) return;
            
            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'filter-group';
            
            // Create label if provided
            if (labelText) {
                const label = document.createElement('label');
                
                // Check if we need to translate the label
                const langKey = selectElement.id === 'category-filter' ? 'category' : 
                            (selectElement.id === 'sort-by' ? 'sortBy' : null);
                
                if (langKey) {
                    label.setAttribute('data-lang', langKey);
                    label.textContent = getTranslation(langKey, labelText);
                } else {
                    label.textContent = labelText;
                }
                
                wrapper.appendChild(label);
            }
            
            // Store the original select element id
            const originalId = selectElement.id;
            const originalName = selectElement.name;
            
            // Create dropdown container
            const dropdown = document.createElement('div');
            dropdown.className = 'filter-dropdown';
            dropdown.dataset.for = originalId;
            
            // Create dropdown button with current selected value
            const btn = document.createElement('button');
            btn.className = 'filter-dropdown-btn';
            
            // Get selected option
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            
            // Get text from translation
            if (selectedOption) {
                const langKey = selectedOption.getAttribute('data-lang');
                if (langKey) {
                    btn.setAttribute('data-lang', langKey);
                    btn.textContent = getTranslation(langKey, selectedOption.textContent);
                } else {
                    btn.textContent = selectedOption.textContent;
                }
            } else {
                btn.textContent = 'Select';
            }
            
            btn.type = 'button';
            
            // Create dropdown menu
            const menu = document.createElement('div');
            menu.className = 'filter-dropdown-menu';
            
            // Add options from select element
            Array.from(selectElement.options).forEach(option => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'filter-option';
                
                // Get text from translation if available
                const langKey = option.getAttribute('data-lang');
                if (langKey) {
                    optionBtn.setAttribute('data-lang', langKey);
                    optionBtn.textContent = getTranslation(langKey, option.textContent);
                } else {
                    optionBtn.textContent = option.textContent;
                }
                
                optionBtn.dataset.value = option.value;
                optionBtn.dataset.originalLangKey = langKey || '';
                
                if (option.selected) {
                    optionBtn.classList.add('selected');
                }
                
                optionBtn.addEventListener('click', () => {
                    // Update UI
                    btn.textContent = optionBtn.textContent;
                    if (langKey) {
                        btn.setAttribute('data-lang', langKey);
                    } else {
                        btn.removeAttribute('data-lang');
                    }
                    
                    menu.querySelectorAll('.filter-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    optionBtn.classList.add('selected');
                    
                    // Update the hidden select element value
                    const hiddenSelect = document.getElementById(originalId);
                    const optionValue = optionBtn.dataset.value; // Get value from dataset
                    
                    if (hiddenSelect) {
                        hiddenSelect.value = optionValue;
                        hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        console.error('Hidden select not found:', originalId);
                    }
                    
                    // Close dropdown
                    btn.classList.remove('active');
                    menu.classList.remove('show');
                });
                
                menu.appendChild(optionBtn);
            });
            
            // Toggle dropdown on button click
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close all other open dropdowns
                document.querySelectorAll('.filter-dropdown-btn.active').forEach(activeBtn => {
                    if (activeBtn !== btn) {
                        activeBtn.classList.remove('active');
                        activeBtn.nextElementSibling.classList.remove('show');
                    }
                });
                
                // Toggle current dropdown
                btn.classList.toggle('active');
                menu.classList.toggle('show');
            });
            
            // Add elements to the DOM
            dropdown.appendChild(btn);
            dropdown.appendChild(menu);
            wrapper.appendChild(dropdown);
            
            // Create a hidden select to maintain the original filtering functionality
            // This is important to keep the existing filters.js functionality intact
            const hiddenSelect = document.createElement('select');
            hiddenSelect.style.display = 'none';
            hiddenSelect.id = originalId;
            hiddenSelect.name = originalName || originalId;
            
            // Copy all options to the hidden select
            Array.from(selectElement.options).forEach(option => {
                const newOption = document.createElement('option');
                newOption.value = option.value;
                newOption.textContent = option.textContent;
                if (option.selected) {
                    newOption.selected = true;
                }
                hiddenSelect.appendChild(newOption);
            });
            
            wrapper.appendChild(hiddenSelect);
            
            // Replace the original select with our custom dropdown
            selectElement.parentNode.replaceChild(wrapper, selectElement);
            
            return {
                wrapper, 
                dropdown, 
                hiddenSelect,
                updateValue: function(value) {
                    
                    // Update hidden select first
                    if (hiddenSelect.value !== value) {
                        hiddenSelect.value = value;
                        
                        // Update visual state
                        const selectedOption = Array.from(menu.querySelectorAll('.filter-option'))
                            .find(opt => opt.dataset.value === value);
                        
                        if (selectedOption) {
                            btn.textContent = selectedOption.textContent;
                            
                            menu.querySelectorAll('.filter-option').forEach(opt => {
                                opt.classList.remove('selected');
                            });
                            selectedOption.classList.add('selected');
                        } else {
                            // If no option found, set to first option (often "All")
                            const firstOption = menu.querySelector('.filter-option');
                            if (firstOption) {
                                btn.textContent = firstOption.textContent;
                                menu.querySelectorAll('.filter-option').forEach(opt => {
                                    opt.classList.remove('selected');
                                });
                                firstOption.classList.add('selected');
                            }
                        }
                        
                        // Trigger change event on the hidden select
                        hiddenSelect.dispatchEvent(new Event('change', {bubbles: true}));
                    }
                },
                refresh: function() {
                    // Update all option translations
                    const currentLang = localStorage.getItem('language') || 'en';
                    if (!window.translations || !window.translations[currentLang]) return;
                    
                    // Update dropdown options
                    menu.querySelectorAll('.filter-option').forEach(option => {
                        const langKey = option.dataset.originalLangKey;
                        if (langKey && window.translations[currentLang][langKey]) {
                            option.textContent = window.translations[currentLang][langKey];
                        }
                    });
                    
                    // Update the currently selected button text
                    const selectedOption = menu.querySelector('.filter-option.selected');
                    if (selectedOption) {
                        btn.textContent = selectedOption.textContent;
                    }
                    
                    // Update label if it exists
                    const label = wrapper.querySelector('label[data-lang]');
                    if (label) {
                        const labelKey = label.getAttribute('data-lang');
                        if (labelKey && window.translations[currentLang][labelKey]) {
                            label.textContent = window.translations[currentLang][labelKey];
                        }
                    }

                    // Force visibility update - sometimes needed for RTL layouts
                    wrapper.style.display = 'none';
                    setTimeout(() => {
                        wrapper.style.display = '';
                    }, 0);
                }
            };
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.filter-dropdown-btn.active').forEach(btn => {
                btn.classList.remove('active');
                btn.nextElementSibling.classList.remove('show');
            });
        });
        
        // Function to update translations for all dropdown elements
        function updateAllTranslations() {
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';
            const translations = window.translations || {};
            
            if (!translations[currentLang]) return;
            
            // Batch all DOM operations
            const updates = [];
            
            // Collect all updates first without modifying DOM
            document.querySelectorAll('[data-lang]').forEach(element => {
                const key = element.getAttribute('data-lang');
                const translation = translations[currentLang][key];
                
                if (translation) {
                    updates.push({
                        element: element,
                        key: key,
                        translation: translation
                    });
                }
            });
            
            // Apply all updates in a single batch to minimize reflows/repaints
            requestAnimationFrame(() => {
                updates.forEach(update => {
                    const { element, translation } = update;
                    
                    // Special handling for input placeholder
                    if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                });
                
                // Handle custom filter labels more explicitly
                const categoryLabel = document.querySelector('.filter-dropdown[data-for="category-filter"]')?.closest('.filter-group')?.querySelector('label[data-lang="category"]');
                if (categoryLabel && translations[currentLang].category) {
                    categoryLabel.textContent = translations[currentLang].category;
                }
                
                const sortByLabel = document.querySelector('.filter-dropdown[data-for="sort-by"]')?.closest('.filter-group')?.querySelector('label[data-lang="sortBy"]');
                if (sortByLabel && translations[currentLang].sortBy) {
                    sortByLabel.textContent = translations[currentLang].sortBy;
                }
                
                // Update custom filter components
                document.querySelectorAll('.filter-option.selected').forEach(selected => {
                    const btn = selected.closest('.filter-dropdown').querySelector('.filter-dropdown-btn');
                    if (btn) {
                        btn.textContent = selected.textContent;
                    }
                });
                
                // Fire event when translations are complete
                document.dispatchEvent(new CustomEvent('languageChanged', {
                    detail: { language: currentLang }
                }));
            });
        }
        
        // Keep references to dropdowns for external manipulation
        const dropdowns = {};
        
        // Initialize dropdowns
        const categorySelect = document.querySelector('select.category-filter');
        const sortSelect = document.querySelector('select.sort-filter');
        
        if (categorySelect) {
            // Use translated label
            const categoryLabel = getTranslation('category', 'Category');
            dropdowns.category = createCustomDropdown(categorySelect, categoryLabel);
        }
        
        if (sortSelect) {
            // Use translated label
            const sortLabel = getTranslation('sortBy', 'Sort By');
            dropdowns.sort = createCustomDropdown(sortSelect, sortLabel);
        }
        
        // Run initial translation update
        updateAllTranslations();
        
        // Make translations globally available
        window.updateFilterDropdowns = function(language) {
            if (!window.translations || !window.translations[language]) return;
            
            // Update all dropdown elements with the new language
            updateAllTranslations();
            
            // Also refresh all dropdown components
            if (window.customDropdowns) {
                if (window.customDropdowns.category) {
                    window.customDropdowns.category.refresh();
                }
                if (window.customDropdowns.sort) {
                    window.customDropdowns.sort.refresh();
                }
            }
        };
        
        // Make window.customDropdowns available for other scripts
        window.customDropdowns = dropdowns;
        
        // Initialize dropdowns with a slight delay to ensure everything is ready
        setTimeout(() => {
            
            // Reset initial values
            if (dropdowns.category) {
                dropdowns.category.updateValue('');
            }
            
            if (dropdowns.sort) {
                dropdowns.sort.updateValue('date-desc');
            }
            
            // Manually call filterArticles to ensure initial state is correct
            if (typeof filterArticles === 'function') {
                filterArticles();
            } else {
                console.warn("filterArticles function not found - filter functionality may be available yet");
            }
        }, 200); // Small delay to ensure everything is properly set up
    });
}); 