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
                    filterVideos();
                    hideLoadingState();
                }, 300);
            });
        }

        // Add event listeners to all filter inputs
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                showLoadingState();
                setTimeout(() => {
                    filterVideos();
                    hideLoadingState();
                }, 300);
            });
        }
        
        if (sortByFilter) {
            sortByFilter.addEventListener('change', function() {
                showLoadingState();
                setTimeout(() => {
                    filterVideos();
                    hideLoadingState();
                }, 300);
            });
        }
        
        if (startDateInput) {
            startDateInput.addEventListener('change', function() {
                showLoadingState();
                setTimeout(() => {
                    filterVideos();
                    hideLoadingState();
                }, 300);
            });
        }
        
        if (endDateInput) {
            endDateInput.addEventListener('change', function() {
                showLoadingState();
                setTimeout(() => {
                    filterVideos();
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
        filterVideos();
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
            filterVideos();
            updateFilterButtonState();
        }, 100);
    });
});

// Function to initialize listing states
function initializeListingStates() {
    // Make sure we're working with the videos container
    const videosContainer = document.getElementById('videos');
    if (!videosContainer) return;
    
    // Add listing-container class if it doesn't have it
    if (!videosContainer.classList.contains('listing-container')) {
        videosContainer.classList.add('listing-container');
    }
    
    // Check if we already have the loading state element
    let loadingState = document.querySelector('.listing-state.loading');
    if (!loadingState) {
        loadingState = document.createElement('div');
        loadingState.className = 'listing-state loading';
        loadingState.innerHTML = `
            <div class="spinner"></div>
            <p class="message" data-i18n="loading_message">Loading...</p>
        `;
        videosContainer.appendChild(loadingState);
    }
    
    // Check if we already have the no results message element
    let noResults = document.getElementById('no-results-message');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'no-results-message';
        noResults.className = 'no-results-message';
        
        // Set the text based on current language
        const currentLang = document.dir === 'rtl' || localStorage.getItem('language') === 'ar' ? 'ar' : 'en';
        noResults.textContent = currentLang === 'ar' ? 
            'لم يتم العثور على نتائج للبحث. حاول تعديل معايير البحث والفلترة.' : 
            'No results found. Try adjusting your search and filter criteria.';
        
        videosContainer.appendChild(noResults);
    }
}

// Function to show loading state
function showLoadingState() {
    const loadingState = document.querySelector('.listing-state.loading');
    const videos = document.querySelectorAll('#videos .video-card-wrapper');
    
    // Only show loading state if we have videos to filter
    if (loadingState && videos.length > 0) {
        loadingState.style.display = 'flex';
        
        // Optional: temporarly reduce opacity of video items
        videos.forEach(video => {
            video.style.opacity = '0.5';
            video.style.pointerEvents = 'none'; // Prevent interaction during loading
        });
    }
}

// Function to hide loading state
function hideLoadingState() {
    const loadingState = document.querySelector('.listing-state.loading');
    const videos = document.querySelectorAll('#videos .video-card-wrapper');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    // Restore opacity of video items
    videos.forEach(video => {
        video.style.opacity = '1';
        video.style.pointerEvents = 'auto'; // Re-enable interaction
    });
}

// Function to filter videos based on selected criteria
function filterVideos() {
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
    let searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    // Normalize search term if we have the normalization function
    if (window.normalizeSearchText) {
        searchTerm = window.normalizeSearchText(searchTerm);
    }

    // Get all video elements
    const videos = document.querySelectorAll('#videos .video-card-wrapper');
    const videosArray = Array.from(videos);
    let visibleCount = 0;
    const totalCount = videosArray.length;
    
    // Filter videos
    videosArray.forEach(video => {
        const videoDate = new Date(video.dataset.date);
        const videoCategory = video.dataset.category;
        let videoTitle = video.dataset.title.toLowerCase();
        const videoTitleElement = video.querySelector('.video-card-title');
        let videoTitleText = videoTitleElement ? videoTitleElement.textContent.toLowerCase() : '';
        
        // Normalize video text if we have the normalization function
        if (window.normalizeSearchText) {
            videoTitle = window.normalizeSearchText(videoTitle);
            videoTitleText = window.normalizeSearchText(videoTitleText);
        }
        
        let showVideo = true;

        // Filter by search term
        if (searchTerm && !videoTitle.includes(searchTerm) && !videoTitleText.includes(searchTerm)) {
            showVideo = false;
        }

        // Filter by category - only hide if category is selected and doesn't match
        if (category && category !== '' && category !== 'all' && videoCategory !== category) {
            showVideo = false;
        }

        // Filter by date range
        if (startDate && new Date(startDate) > videoDate) {
            showVideo = false;
        }
        if (endDate && new Date(endDate) < videoDate) {
            showVideo = false;
        }

        // Show/hide video
        video.style.display = showVideo ? 'block' : 'none';
        if (showVideo) visibleCount++;
    });

    // Sort videos
    const visibleVideos = videosArray.filter(video => video.style.display !== 'none');
    visibleVideos.sort((a, b) => {
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

    // Reorder videos in the DOM
    const container = videos[0]?.parentNode;
    if (container) {
        visibleVideos.forEach(video => {
            container.appendChild(video);
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
    
    // Update the video count in the counter
    const articleCountElement = document.getElementById('article-count');
    
    if (articleCountElement) {
        // Update the count
        articleCountElement.textContent = visibleCount;
        
        // Highlight the counter if filtered (not showing all videos)
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
            const isArabic = document.dir === 'rtl' || localStorage.getItem('language') === 'ar';
            dateRangeDisplay.textContent = isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        }
    }
    
    // Show all videos
    const videos = document.querySelectorAll('#videos .video-card-wrapper');
    videos.forEach(video => {
        video.style.display = 'block';
    });
    
    // Update article counter
    const articleCountElement = document.getElementById('article-count');
    
    if (articleCountElement) {
        // Update the count to show all videos
        articleCountElement.textContent = videos.length;
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
    filterVideos();
    
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

// Add event listener for video thumbnails to open modal
document.addEventListener('DOMContentLoaded', () => {
    const thumbnails = document.querySelectorAll('.thumbnail-container');
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('youtube-iframe');
    const closeBtn = document.querySelector('.video-modal-close');
    
    if (!thumbnails || !modal || !iframe) return;
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const imgSrc = thumbnail.querySelector('img').src;
            // Extract video ID from YouTube thumbnail URL
            const videoId = imgSrc.match(/\/vi\/([^\/]+)\//) ? imgSrc.match(/\/vi\/([^\/]+)\//)[1] : null;
            
            if (videoId) {
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            }
        });
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            iframe.src = '';
            document.body.style.overflow = ''; // Restore scrolling
        });
    }
    
    // Close modal when clicking outside of content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            iframe.src = '';
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
}); 