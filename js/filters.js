// Initialize filters when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing filters.js");
    
    // Wait a brief moment to ensure custom dropdowns have initialized
    setTimeout(() => {
        // Get all filter elements
        const categoryFilter = document.getElementById('category-filter');
        const sortByFilter = document.getElementById('sort-by');
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        const clearFiltersBtn = document.getElementById('clear-filters');
        
        console.log("Filter elements found:", {
            categoryFilter: categoryFilter?.id,
            sortByFilter: sortByFilter?.id,
            startDateInput: startDateInput?.id,
            endDateInput: endDateInput?.id,
            clearFiltersBtn: clearFiltersBtn?.id
        });

        // Add event listeners to all filter inputs
        if (categoryFilter) {
            console.log("Adding change listener to category filter");
            categoryFilter.addEventListener('change', function() {
                console.log("Category filter changed to:", this.value);
                filterArticles();
            });
        }
        
        if (sortByFilter) {
            console.log("Adding change listener to sort filter");
            sortByFilter.addEventListener('change', function() {
                console.log("Sort filter changed to:", this.value);
                filterArticles();
            });
        }
        
        if (startDateInput) {
            console.log("Adding change listener to start date input");
            startDateInput.addEventListener('change', filterArticles);
        }
        
        if (endDateInput) {
            console.log("Adding change listener to end date input");
            endDateInput.addEventListener('change', filterArticles);
        }

        // Add event listener to clear filters button
        if (clearFiltersBtn) {
            console.log("Adding click listener to clear filters button");
            clearFiltersBtn.addEventListener('click', clearFilters);
        }

        // Initial filter state
        console.log("Setting initial filter state");
        updateFilterButtonState();
        
        // Run initial filter
        filterArticles();
    }, 200);
});

// Function to filter articles based on selected criteria
function filterArticles() {
    // Get the current values from filter elements
    const categoryFilter = document.getElementById('category-filter');
    const sortByFilter = document.getElementById('sort-by');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    // Extract values with fallbacks
    const category = categoryFilter ? categoryFilter.value : '';
    const sortBy = sortByFilter ? sortByFilter.value : 'date-desc';
    const startDate = startDateInput ? startDateInput.value : '';
    const endDate = endDateInput ? endDateInput.value : '';
    
    console.log('Filtering with:', { 
        category, 
        sortBy, 
        startDate, 
        endDate,
        categoryElement: categoryFilter,
        categoryOptions: categoryFilter ? Array.from(categoryFilter.options).map(opt => ({ value: opt.value, text: opt.text })) : []
    });

    // Get all article elements
    const articles = document.querySelectorAll('#articles .box');
    const articlesArray = Array.from(articles);
    let visibleCount = 0;
    const totalCount = articlesArray.length;
    
    // Filter articles
    articlesArray.forEach(article => {
        const articleDate = new Date(article.dataset.date);
        const articleCategory = article.dataset.category;
        
        console.log(`Article category: "${articleCategory}", selected category: "${category}"`);
        
        let showArticle = true;

        // Filter by category - only hide if category is selected and doesn't match
        if (category && category !== '' && category !== 'all' && articleCategory !== category) {
            console.log(`Hiding article with category ${articleCategory} because it doesn't match ${category}`);
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

    // Log visible count
    console.log(`Filtered results: ${visibleCount} articles visible out of ${totalCount}`);

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
    const container = articles[0]?.parentNode;
    if (container) {
        visibleArticles.forEach(article => {
            container.appendChild(article);
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

    // Reset all filter inputs
    if (categoryFilter) categoryFilter.value = '';
    if (sortByFilter) sortByFilter.value = 'date-desc'; // Reset to default sort
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    
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
            const isArabic = document.dir === 'rtl' || localStorage.getItem('language') === 'ar';
            dateRangeDisplay.textContent = isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        }
    }
    
    // Show all articles
    const articles = document.querySelectorAll('#articles .box');
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
    const searchInput = document.getElementById('searchInput');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    // Check if any filters are applied
    const hasCategory = categoryFilter && categoryFilter.value !== '';
    const hasSort = sortByFilter && sortByFilter.value !== 'date-desc';
    const hasStartDate = startDateInput && startDateInput.value !== '';
    const hasEndDate = endDateInput && endDateInput.value !== '';
    const hasSearch = searchInput && searchInput.value.trim() !== '';
    
    // Enable/disable the clear filters button
    if (clearFiltersBtn) {
        const hasFilters = hasCategory || hasSort || hasStartDate || hasEndDate || hasSearch;
        clearFiltersBtn.disabled = !hasFilters;
        
        // Update counter icon based on filter state
        updateCounterIcon(hasFilters);
    }
} 