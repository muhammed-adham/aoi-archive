// Initialize date range picker and handle filtering
document.addEventListener('DOMContentLoaded', () => {
    // Initialize date range picker
    const dateFilterContainer = document.querySelector('.filter-group.date-filter');
    if (dateFilterContainer) {
        // Remove the old date range inputs
        const oldInputs = dateFilterContainer.querySelector('.date-range-inputs');
        if (oldInputs) {
            oldInputs.remove();
        }
        
        // Check if date picker container already exists, use it if it does
        let datePickerContainer = dateFilterContainer.querySelector('.date-picker-container');
        if (!datePickerContainer) {
            // Only create a new container if one doesn't already exist
            datePickerContainer = document.createElement('div');
            datePickerContainer.className = 'date-picker-container';
            dateFilterContainer.appendChild(datePickerContainer);
        } else {
            // Clear the existing container 
            datePickerContainer.innerHTML = '';
        }
        
        // Create hidden inputs if they don't exist
        if (!document.getElementById('start-date')) {
            const startInput = document.createElement('input');
            startInput.type = 'hidden';
            startInput.id = 'start-date';
            dateFilterContainer.appendChild(startInput);
        }
        
        if (!document.getElementById('end-date')) {
            const endInput = document.createElement('input');
            endInput.type = 'hidden';
            endInput.id = 'end-date';
            dateFilterContainer.appendChild(endInput);
        }
        
        // Initialize the date range picker
        const dateRangePicker = new DateRangePicker(datePickerContainer);
        
        // Store a reference globally so other scripts can access it
        window.dateRangePicker = dateRangePicker;
        
        // Check for existing values and apply them
        const startDateEl = document.getElementById('start-date');
        const endDateEl = document.getElementById('end-date');
        
        if (startDateEl && startDateEl.value && endDateEl && endDateEl.value) {
            dateRangePicker.setDateRange(
                new Date(startDateEl.value),
                new Date(endDateEl.value)
            );
        }
    }

    // Handle filtering
    const filterInputs = document.querySelectorAll('#category-filter, #sort-by, #start-date, #end-date');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    
    
    function updateFilterButtonState() {
        const hasActiveFilters = Array.from(filterInputs).some(input => input.value !== '');
        clearFiltersBtn.disabled = !hasActiveFilters;
    }
    
    function filterArticles() {
        const category = document.getElementById('category-filter').value;
        const sortBy = document.getElementById('sort-by').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        const articles = document.querySelectorAll('.box');
        
        articles.forEach(article => {
            const articleDate = article.dataset.date;
            const articleTitle = article.dataset.title;
            const articleCategory = article.dataset.category;
            
            let showArticle = true;
            
            // Filter by category
            if (category && articleCategory !== category) {
                showArticle = false;
            }
            
            // Filter by date range
            if (startDate && articleDate < startDate) {
                showArticle = false;
            }
            if (endDate && articleDate > endDate) {
                showArticle = false;
            }
            
            // Show/hide article
            article.style.display = showArticle ? 'block' : 'none';
        });
        
        // Sort articles
        const articlesArray = Array.from(articles);
        articlesArray.sort((a, b) => {
            const aDate = a.dataset.date;
            const bDate = b.dataset.date;
            const aTitle = a.dataset.title;
            const bTitle = b.dataset.title;
            
            switch (sortBy) {
                case 'date-desc':
                    return bDate.localeCompare(aDate);
                case 'date-asc':
                    return aDate.localeCompare(bDate);
                case 'title-asc':
                    return aTitle.localeCompare(bTitle);
                case 'title-desc':
                    return bTitle.localeCompare(aTitle);
                default:
                    return 0;
            }
        });
        
        // Reorder articles in the DOM
        const container = articles[0].parentNode;
        articlesArray.forEach(article => {
            container.appendChild(article);
        });
        
        // Update filter button state
        updateFilterButtonState();
    }
    
    // Add event listeners
    filterInputs.forEach(input => {
        input.addEventListener('change', filterArticles);
    });
    
    clearFiltersBtn.addEventListener('click', () => {
        console.log('Clear filters button clicked');
        const selects = document.querySelectorAll('select');
        const inputs = document.querySelectorAll('input');
        console.log('Selects found:', selects.length);
        console.log('Inputs found:', inputs.length);

        // Brute-force reset all selects
        selects.forEach(select => {
            select.selectedIndex = 0;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Brute-force reset all inputs
        inputs.forEach(input => {
            input.value = '';
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Reset date range picker if available
        if (window.dateRangePicker) {
            window.dateRangePicker.clearDateRange();
        }

        // Update UI and filter display
        filterArticles();

        // Update article count if needed
        const articleCount = document.getElementById('article-count');
        if (articleCount) {
            const visibleArticles = document.querySelectorAll('.box[style="display: block"]');
            articleCount.textContent = visibleArticles.length;
        }
    });
    
    // Initial filter button state
    updateFilterButtonState();
}); 