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
                // Show loading state
                showLoadingState();
                
                // Use a slight delay to mimic search process
                setTimeout(() => {
                    filterArticles();
                    hideLoadingState();
                }, 300);
            });
        }

        // Add event listeners to all filter inputs
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                showLoadingState();
                setTimeout(() => {
                    filterArticles();
                    hideLoadingState();
                }, 300);
            });
        }
        
        if (sortByFilter) {
            sortByFilter.addEventListener('change', function() {
                showLoadingState();
                setTimeout(() => {
                    filterArticles();
                    hideLoadingState();
                }, 300);
            });
        }
        
        if (startDateInput) {
            startDateInput.addEventListener('change', function() {
                showLoadingState();
                setTimeout(() => {
                    filterArticles();
                    hideLoadingState();
                }, 300);
            });
        }
        
        if (endDateInput) {
            endDateInput.addEventListener('change', function() {
                showLoadingState();
                setTimeout(() => {
                    filterArticles();
                    hideLoadingState();
                }, 300);
            });
        }

        // Add event listener to clear filters button
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function() {
                showLoadingState();
                setTimeout(() => {
                    clearFilters();
                    hideLoadingState();
                }, 300);
            });
        }

        // Initial filter state
        updateFilterButtonState();
        
        // Run initial filter
        filterArticles();
    }, 200);
    
    // Listen for language changes and update filters accordingly
    document.addEventListener('translationsLoaded', (event) => {
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
            filterArticles();
            updateFilterButtonState();
        }, 100);
    });
});

// Function to initialize listing states
function initializeListingStates() {
    // Make sure we're working with the articles container
    const articlesContainer = document.querySelector('#articles .container');
    if (!articlesContainer) return;
    
    // Add listing-container class if it doesn't have it
    if (!articlesContainer.classList.contains('listing-container')) {
        articlesContainer.classList.add('listing-container');
    }
    
    // Check if we already have the loading state element
    let loadingState = articlesContainer.querySelector('.listing-state.loading');
    if (!loadingState) {
        loadingState = document.createElement('div');
        loadingState.className = 'listing-state loading';
        loadingState.innerHTML = `
        `;
        articlesContainer.appendChild(loadingState);
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
        
        articlesContainer.appendChild(noResults);
    }
}

// Function to show loading state
function showLoadingState() {
    const articlesContainer = document.querySelector('#articles .container');
    if (!articlesContainer) return;
    
    const loadingState = articlesContainer.querySelector('.listing-state.loading');
    const articles = articlesContainer.querySelectorAll('.box');
    
    // Only show loading state if we have articles to filter
    if (loadingState && articles.length > 0) {
        loadingState.style.display = 'flex';
        
        // Optional: temporarly reduce opacity of article items
        articles.forEach(article => {
            article.style.opacity = '0.5';
            article.style.pointerEvents = 'none'; // Prevent interaction during loading
        });
    }
}

// Function to hide loading state
function hideLoadingState() {
    const articlesContainer = document.querySelector('#articles .container');
    if (!articlesContainer) return;
    
    const loadingState = articlesContainer.querySelector('.listing-state.loading');
    const articles = articlesContainer.querySelectorAll('.box');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    // Restore opacity of article items
    articles.forEach(article => {
        article.style.opacity = '1';
        article.style.pointerEvents = 'auto'; // Re-enable interaction
    });
}

// Function to filter articles based on selected criteria
function filterArticles() {
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
    let searchTerm = searchInput ? searchInput.value : '';
    
    // Normalize search term if we have the normalization function
    if (window.normalizeSearchText) {
        searchTerm = window.normalizeSearchText(searchTerm);
    }

    // Get all article elements
    const articlesContainer = document.querySelector('#articles .container');
    if (!articlesContainer) return;
    
    const articles = articlesContainer.querySelectorAll('.box');
    const articlesArray = Array.from(articles);
    let visibleCount = 0;
    const totalCount = articlesArray.length;
    
    // Filter articles
    articlesArray.forEach(article => {
        const articleDate = new Date(article.dataset.date);
        const articleCategory = article.dataset.category;
        let articleTitle = article.dataset.title;
        const articleTitleElement = article.querySelector('h3');
        const articleDesc = article.querySelector('p');
        let articleTitleText = articleTitleElement ? articleTitleElement.textContent : '';
        let articleDescText = articleDesc ? articleDesc.textContent : '';
        
        // Normalize article text if we have the normalization function
        if (window.normalizeSearchText) {
            articleTitle = window.normalizeSearchText(articleTitle);
            articleTitleText = window.normalizeSearchText(articleTitleText);
            articleDescText = window.normalizeSearchText(articleDescText);
        }
        
        let showArticle = true;

        // Filter by search term - more lenient matching for voice input
        if (searchTerm) {
            // Split search term into words for partial matching
            const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
            
            // Check if any of the search words are found in the article
            const hasMatch = searchWords.some(word => {
                // Try exact match first
                if (articleTitle.includes(word) || 
                    articleTitleText.includes(word) || 
                    articleDescText.includes(word)) {
                    return true;
                }
                
                // Try partial match if exact match fails
                return articleTitle.split(/\s+/).some(titleWord => titleWord.includes(word)) ||
                       articleTitleText.split(/\s+/).some(titleWord => titleWord.includes(word)) ||
                       articleDescText.split(/\s+/).some(descWord => descWord.includes(word));
            });
            
            if (!hasMatch) {
                showArticle = false;
            }
        }

        // Filter by category - only hide if category is selected and doesn't match
        if (category && category !== '' && category !== 'all' && articleCategory !== category) {
            showArticle = false;
        }

        // Filter by date range
        if (startDate && new Date(startDate) > articleDate) {
            showArticle = false;
        }
        if (endDate && new Date(endDate) < articleDate) {
            showArticle = false;
        }

        // Show/hide article
        article.style.display = showArticle ? 'block' : 'none';
        if (showArticle) visibleCount++;
    });

    // Sort articles
    const visibleArticles = articlesArray.filter(article => article.style.display !== 'none');
    visibleArticles.sort((a, b) => {
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

    // Reorder articles in the DOM
    if (articlesContainer) {
        visibleArticles.forEach(article => {
            articlesContainer.appendChild(article);
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
    
    // Update the article count in the counter
    const articleCountElement = document.getElementById('article-count');
    
    if (articleCountElement) {
        // Update the count
        articleCountElement.textContent = visibleCount;
        
        // Highlight the counter if filtered (not showing all articles)
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
    if (categoryFilter) categoryFilter.value = '';
    if (sortByFilter) sortByFilter.value = 'date-desc'; // Reset to default sort
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    if (searchInput) searchInput.value = '';
    
    // Update custom dropdowns if available
    if (window.customDropdowns) {
        if (window.customDropdowns.category) {
            window.customDropdowns.category.updateValue('');
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
    
    // Show all articles
    const articlesContainer = document.querySelector('#articles .container');
    if (!articlesContainer) return;
    
    const articles = articlesContainer.querySelectorAll('.box');
    articles.forEach(article => {
        article.style.display = 'block';
    });
    
    // Update article counter
    const articleCountElement = document.getElementById('article-count');
    
    if (articleCountElement) {
        // Update the count to show all articles
        articleCountElement.textContent = articles.length;
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
    filterArticles();
    
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
        counterIcon.classList.add('fa-funnel-dollar');
    } else {
        // Change back to default icon
        counterIcon.classList.remove('fa-funnel-dollar');
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