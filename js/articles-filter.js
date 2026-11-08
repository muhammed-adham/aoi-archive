/* exported showLoadingState, hideLoadingState, updateFilterButtonState
   (shared with voice-search.js and the other filter scripts, so they must stay global) */
// Initialize filters when the document is ready
document.addEventListener('DOMContentLoaded', () => {

    // Wait a brief moment to ensure custom dropdowns have initialized
    setTimeout(() => {
        // Get all filter elements
        const categoryFilter = document.getElementById('category-filter');
        const sortByFilter = document.getElementById('sort-by');
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const clearFiltersBtn = document.getElementById('clear-filters');
        const searchInput = document.getElementById('search-input');


        // Add loading indicator and listing states containers if not already present
        initializeListingStates();

        // Add event listeners to search input
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterContent(); // Call filterContent directly
            });
        }

        // Add event listeners to all filter inputs
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                filterContent();
            });
        }

        if (sortByFilter) {
            sortByFilter.addEventListener('change', function() {
                filterContent();
            });
        }

        if (startDateInput) {
            startDateInput.addEventListener('change', function() {
                filterContent();
            });
        }

        if (endDateInput) {
            endDateInput.addEventListener('change', function() {
                filterContent();
            });
        }

        // Add event listener to clear filters button
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function() {
                clearFilters();
            });
        }

        // Initial filter state
        updateFilterButtonState();

        // Run initial filter
        filterContent();
    }, 200);

    // Listen for language changes and update filters accordingly
    document.addEventListener('translationsLoaded', () => {
        // Give some time for the translations to be applied to the DOM
        setTimeout(() => {
            // If you have custom dropdowns, refresh them here
            if (window.customDropdowns) {
                if (window.customDropdowns.category) {
                    window.customDropdowns.category.refresh();
                }
                if (window.customDropdowns.sort) {
                    window.customDropdowns.sort.refresh();
                }
            }

            // Update the filters UI and re-apply filtering
            filterContent();
            updateFilterButtonState();
        }, 100);
    });
});

// Function to initialize listing states
function initializeListingStates() {
    // Make sure we're working with the content container
    const contentContainer = document.querySelector('#articles .container, #videos .video-grid');
    if (!contentContainer) return;

    // Add listing-container class if it doesn't have it
    if (!contentContainer.classList.contains('listing-container')) {
        contentContainer.classList.add('listing-container');
    }

    // Check if we already have the loading state element
    let loadingState = contentContainer.querySelector('.listing-state.loading');
    if (!loadingState) {
        loadingState = document.createElement('div');
        loadingState.className = 'listing-state loading';
        loadingState.innerHTML = `
        `;
        contentContainer.appendChild(loadingState);
    }

    // Check if we already have the no results message element
    let noResults = document.getElementById('no-results-message');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'no-results-message';
        noResults.className = 'no-results-message';

        // Set the text based on current language using consistent method
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        noResults.textContent = currentLang === 'ar' ?
            'لم يتم العثور على نتائج للبحث. حاول تعديل معايير البحث والفلترة.' :
            'No results found. Try adjusting your search and filter criteria.';

        contentContainer.appendChild(noResults);
    }
}

// Function to show loading state
function showLoadingState() {
    const contentContainer = document.querySelector('#articles .container, #videos .video-grid');
    if (!contentContainer) return;

    const loadingState = contentContainer.querySelector('.listing-state.loading');
    const contentItems = contentContainer.querySelectorAll('.box, .video-card-wrapper');

    // Only show loading state if we have items to filter
    if (loadingState && contentItems.length > 0) {
        loadingState.style.display = 'flex';

        // Optional: temporarily reduce opacity of content items
        contentItems.forEach(item => {
            item.style.opacity = '0.5';
            item.style.pointerEvents = 'none'; // Prevent interaction during loading
        });
    }
}

// Function to hide loading state
function hideLoadingState() {
    const contentContainer = document.querySelector('#articles .container, #videos .video-grid');
    if (!contentContainer) return;

    const loadingState = contentContainer.querySelector('.listing-state.loading');
    const contentItems = contentContainer.querySelectorAll('.box, .video-card-wrapper');

    if (loadingState) {
        loadingState.style.display = 'none';
    }

    // Restore opacity of content items
    contentItems.forEach(item => {
        item.style.opacity = '1';
        item.style.pointerEvents = 'auto'; // Re-enable interaction
    });
}

// Function to filter content based on selected criteria
function filterContent() {
    
    // Get the current values from filter elements
    const categoryFilter = document.getElementById('category-filter');
    const sortByFilter = document.getElementById('sort-by');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const searchInput = document.getElementById('search-input');

    // Extract values with fallbacks
    const category = categoryFilter ? categoryFilter.value : '';
    const sortBy = sortByFilter ? sortByFilter.value : 'date-desc';
    const startDate = startDateInput ? startDateInput.value : '';
    const endDate = endDateInput ? endDateInput.value : '';
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';


    // Get all content elements
    const contentContainer = document.querySelector('#articles .container, #videos .video-grid');

    if (!contentContainer) {
        return;
    }

    const contentItems = contentContainer.querySelectorAll('.box, .video-card-wrapper');

    const contentArray = Array.from(contentItems);
    let visibleCount = 0;
    const totalCount = contentArray.length;

    // Filter content items
    contentArray.forEach(item => {
        const itemDate = new Date(item.dataset.date);
        const itemCategory = item.dataset.category;
        const itemTitle = item.dataset.title;
        const itemTitleElement = item.querySelector('h3, .video-card-title');
        const itemDesc = item.querySelector('p');
        const itemTitleText = itemTitleElement ? itemTitleElement.textContent.toLowerCase() : '';
        const itemDescText = itemDesc ? itemDesc.textContent.toLowerCase() : '';


        let showItem = true;

        // Filter by search term
        if (searchTerm) {
            const matchesSearch = 
                itemTitleText.includes(searchTerm) || 
                itemDescText.includes(searchTerm) ||
                (itemTitle && itemTitle.toLowerCase().includes(searchTerm));
            
            if (!matchesSearch) {
                showItem = false;
            }
        }

        // Filter by category - only hide if category is selected and doesn't match
        if (category && category !== '' && category !== 'all' && itemCategory !== category) {
            showItem = false;
        }

        // Filter by date range
        if (startDate && new Date(startDate) > itemDate) {
            showItem = false;
        }
        if (endDate && new Date(endDate) < itemDate) {
            showItem = false;
        }

        // Show/hide item
        item.style.display = showItem ? 'block' : 'none';
        if (showItem) visibleCount++;
    });


    // Sort content items
    const visibleItems = contentArray.filter(item => item.style.display !== 'none');
    visibleItems.sort((a, b) => {
        const aDate = new Date(a.dataset.date);
        const bDate = new Date(b.dataset.date);
        const aTitle = a.dataset.title;
        const bTitle = b.dataset.title;

        switch (sortBy) {
            case 'date-desc':
                return bDate - aDate;
            case 'date-asc':
                return aDate - bDate;
            case 'title-asc':
                return aTitle.localeCompare(bTitle);
            case 'title-desc':
                return bTitle.localeCompare(aTitle);
            default:
                return 0;
        }
    });

    // Reorder items in the DOM
    if (contentContainer) {
        visibleItems.forEach(item => {
            contentContainer.appendChild(item);
        });
    }

    // Update filter button state
    updateFilterButtonState();

    // Show message if no results
    const noResultsMessage = document.getElementById('no-results-message');
    if (noResultsMessage) {
        if (visibleCount === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    }

    // Update the content count in the counter
    const contentCountElement = document.getElementById('article-count');

    if (contentCountElement) {
        // Update the count
        contentCountElement.textContent = visibleCount;

        // Highlight the counter if filtered (not showing all items)
        const counterContainer = document.querySelector('.article-counter');
        if (counterContainer) {
            if (visibleCount < totalCount) {
                counterContainer.classList.add('filtered');
                updateCounterIcon(true);
            } else {
                counterContainer.classList.remove('filtered');
                updateCounterIcon(false);
            }
        }
    }
}

// Function to clear all filters
function clearFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortByFilter = document.getElementById('sort-by');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const searchInput = document.getElementById('search-input');

    // Reset all filter inputs
    if (categoryFilter) categoryFilter.value = 'all';
    if (sortByFilter) sortByFilter.value = 'date-desc'; // Reset to default sort
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    if (searchInput) searchInput.value = '';

    // Update custom dropdowns if available
    if (window.customDropdowns) {
        if (window.customDropdowns.category) {
            window.customDropdowns.category.updateValue('all');
        }
        if (window.customDropdowns.sort) {
            window.customDropdowns.sort.updateValue('date-desc');
        }
    }

    // Clear date range picker display if available
    if (window.dateRangePicker) {
        window.dateRangePicker.clearDateRange();
    } else {
        const dateRangeDisplay = document.querySelector('.date-range-display .date-range-text');
        if (dateRangeDisplay) {
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';
            dateRangeDisplay.textContent = currentLang === 'ar' ? 'اختر نطاق التاريخ' : 'Select date range';
        }
    }

    // Show all content items
    const contentContainer = document.querySelector('#articles .container, #videos .video-grid');
    if (!contentContainer) return;

    const contentItems = contentContainer.querySelectorAll('.box, .video-card-wrapper');
    contentItems.forEach(item => {
        item.style.display = 'block';
    });

    // Update content counter
    const contentCountElement = document.getElementById('article-count');

    if (contentCountElement) {
        // Update the count to show all items
        contentCountElement.textContent = contentItems.length;
    }

    // Remove filtered highlight
    const counterContainer = document.querySelector('.article-counter');
    if (counterContainer) {
        counterContainer.classList.remove('filtered');
        updateCounterIcon(false);
    }

    // Hide no results message
    const noResultsMessage = document.getElementById('no-results-message');
    if (noResultsMessage) {
        noResultsMessage.style.display = 'none';
    }

    // Reset filter state
    filterContent();

    // Disable the clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.disabled = true;
    }
}

// Helper function to update the counter icon based on filter state
function updateCounterIcon(isFiltered) {
    const counterIcon = document.querySelector('.article-counter i');
    if (!counterIcon) return;

    if (isFiltered) {
        // Change to a filtered state icon
        counterIcon.classList.remove('fa-filter');
        counterIcon.classList.add('fa-filter-circle-xmark');
    } else {
        // Change back to default icon
        counterIcon.classList.remove('fa-filter-circle-xmark');
        counterIcon.classList.add('fa-filter');
    }
}

// Update the filter button state
function updateFilterButtonState() {
    // Get all filter elements
    const categoryFilter = document.getElementById('category-filter');
    const sortByFilter = document.getElementById('sort-by');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const searchInput = document.getElementById('search-input');

    // Check if any filter is active
    const categoryActive = categoryFilter && categoryFilter.value !== '';
    const sortByActive = sortByFilter && sortByFilter.value !== 'date-desc'; // Check if not default
    const dateRangeActive = (startDateInput && startDateInput.value !== '') || (endDateInput && endDateInput.value !== '');
    const searchActive = searchInput && searchInput.value !== '';

    // Enable/disable clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.disabled = !(categoryActive || sortByActive || dateRangeActive || searchActive);
    }
} 