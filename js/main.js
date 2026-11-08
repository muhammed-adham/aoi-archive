/* exported changeImage, changeOverlayImage, closeFullscreenOverlay, openVideoModal, closeVideoModal, playInMainPlayer
   (these are called from inline onclick handlers in details.html, so they must stay global) */

// Function to update navbar brand image
function updateNavbarBrandImage(isDark) {
  const navbarBrand = document.querySelector('.navbar-brand img');
  if (navbarBrand) {
    navbarBrand.src = isDark ? 'images/3-white.png' : 'images/3.png';
  }
}

// Function to check and apply theme state
function applyThemeState() {
  const isDark = window.localStorage.getItem("isDark?") === "true";
  const html = document.querySelector("html");
  const body = document.querySelector("body");

  if (html && body) {
    // Add a temporary class to prevent flashing
    html.classList.add('theme-transitioning');

    if (isDark) {
      html.classList.add("darkMode");
      body.classList.add("dark-mode");
    } else {
      html.classList.remove("darkMode");
      body.classList.remove("dark-mode");
    }

    // Update navbar brand image
    updateNavbarBrandImage(isDark);

    // Remove the transition class after a short delay
    setTimeout(() => {
      html.classList.remove('theme-transitioning');
    }, 50);
  }
}

// Add a MutationObserver to watch for theme changes
function setupThemeObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isDark = document.body.classList.contains('dark-mode');
        updateNavbarBrandImage(isDark);
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
}

// Function to setup theme toggle
function setupThemeToggle() {
  const darkModeToggles = document.querySelectorAll('.checkbox, .checkbox1, .checkbox2');
  const html = document.documentElement;
  const body = document.body;

  // Function to update theme state
  function updateThemeState(isDark) {
    // Add a temporary class to prevent flashing
    html.classList.add('theme-transitioning');

    if (isDark) {
      html.classList.add("darkMode");
      body.classList.add("dark-mode");
    } else {
      html.classList.remove("darkMode");
      body.classList.remove("dark-mode");
    }

    // Update navbar brand image
    updateNavbarBrandImage(isDark);

    // Remove the transition class after a short delay
    setTimeout(() => {
      html.classList.remove('theme-transitioning');
    }, 50);
  }

  // Set initial state from localStorage
  const isDark = localStorage.getItem("isDark?") === "true";
  updateThemeState(isDark);

  // Update all toggle checkboxes
  darkModeToggles.forEach(toggle => {
    if (toggle) {
      toggle.checked = isDark;
    }
  });

  // Add event listeners to all toggle checkboxes
  darkModeToggles.forEach(toggle => {
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        const isDark = e.target.checked;
        localStorage.setItem("isDark?", isDark);
        updateThemeState(isDark);

        // Update all other toggle checkboxes
        darkModeToggles.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            otherToggle.checked = isDark;
          }
        });
      });
    }
  });
}






// Hide and Show Header: hides fully on scroll down, returns on scroll up
function hidingShowingHeader() {
  const header = document.querySelector("header");
  if (!header) return;

  const THRESHOLD = 8; // ignore tiny scroll jitters
  let lastY = window.scrollY;

  function update() {
    const y = Math.max(window.scrollY, 0);
    const delta = y - lastY;
    const menuOpen = header.querySelector(".navbar-collapse.show");

    if (y <= header.offsetHeight || menuOpen) {
      header.classList.remove("header-hidden");
      lastY = y;
    } else if (Math.abs(delta) > THRESHOLD) {
      header.classList.toggle("header-hidden", delta > 0);
      lastY = y;
    }
  }

  window.addEventListener("scroll", update, { passive: true });
}


// Scroll To Top Button
function showUpScrollToTopButton() {
  const scrollToTopButton = document.querySelector(".scrollToTop");

  window.addEventListener("scroll", () => {
    if (this.scrollY >= 300) {
      scrollToTopButton.classList.add("showUp");
    } else {
      scrollToTopButton.classList.remove("showUp");
    }
  });

  scrollToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
    });
  });
}


// Single Source of Truth Language System
const LangSystem = {
  init() {
    // Get language directly from localStorage using consistent key
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';

    // Set up language toggle
    const langToggle = document.getElementById('chklang');
    if (langToggle) {
      // Set initial state directly
      langToggle.checked = savedLang === 'ar';

      // Remove any existing listeners by cloning
      const newToggle = langToggle.cloneNode(true);
      langToggle.parentNode.replaceChild(newToggle, langToggle);

      // Add single event listener for direct changes
      newToggle.addEventListener('change', (e) => {
        e.preventDefault(); // Prevent any default behavior
        const newLang = newToggle.checked ? 'ar' : 'en';
        this.changeLang(newLang);
      });
    }

    // Apply language immediately
    this.changeLang(savedLang);
  },

  changeLang(lang) {
    // Update localStorage with consistent key
    localStorage.setItem('selectedLanguage', lang);

    // Update document direction and language attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', lang === 'ar');

    // Update content immediately
    this.updateContent(lang);

    // Dispatch a single event for other systems
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: lang }
    }));
  },

  updateContent(lang) {
    // Update regular elements immediately
    document.querySelectorAll('[data-lang], [data-i18n]').forEach(element => {
      const key = element.getAttribute('data-lang') || element.getAttribute('data-i18n');
      const translation = translations[lang][key];
      if (!translation) {
        return;
      }

      // Skip landing page elements that need animation
      if (element.id === 'landing-title1' || element.id === 'landing-title2' || element.id === 'landing-paragraph') {
        return;
      }

      element.textContent = translation;
    });

    // Update placeholders immediately
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = translations[lang][key];
      if (translation) {
        element.placeholder = translation;
      }
    });

    // Handle landing page animations
    this.updateLandingPage(lang);
  },

  updateLandingPage(lang) {
    // Hero text is set instantly (no typing animation)
    ['landing-title1', 'landing-title2', 'landing-paragraph'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const translation = translations[lang][el.getAttribute('data-lang')];
      if (translation) el.textContent = translation;
    });
  }
};

// Initialize language system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LangSystem.init();

  // Listen for language changes and update filters accordingly
  document.addEventListener('languageChanged', () => {
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
      if (typeof filterArticles === 'function') {
        filterArticles();
      }
      if (typeof updateFilterButtonState === 'function') {
        updateFilterButtonState();
      }
    }, 100);
  });
});

// Search functionality
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search-input');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value.toLowerCase().trim();
      const boxes = document.querySelectorAll('#articles .box');

      boxes.forEach(box => {
        const title = box.querySelector('h3').textContent.toLowerCase();
        const description = box.querySelector('p').textContent.toLowerCase();
        const category = box.getAttribute('data-category').toLowerCase();

        // Check if any of the content matches the search term
        if (title.includes(searchTerm) ||
          description.includes(searchTerm) ||
          category.includes(searchTerm)) {
          box.style.display = 'block';
        } else {
          box.style.display = 'none';
        }
      });

      // Show a message if no results found
      const visibleBoxes = document.querySelectorAll('#articles .box[style="display: block"]');
      const noResultsMsg = document.getElementById('no-results-message');



      if (visibleBoxes.length === 0 && searchTerm !== '') {
        // Create message if it doesn't exist
        if (!noResultsMsg) {
          const message = document.createElement('p');
          message.id = 'no-results-message';
          message.className = 'no-results';
          message.textContent = 'No results found. Please try a different search term.';

          const container = document.querySelector('#articles .container');
          container.appendChild(message);
        } else {
          noResultsMsg.style.display = 'block';
        }
      } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
      }
    });
  }
});

// Page widgets that exist on every page, once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupThemeObserver();

  if (document.querySelector('header')) hidingShowingHeader();
  if (document.querySelector('.scrollToTop')) showUpScrollToTopButton();
});

// Add event listener for page load
window.addEventListener('load', function () {
  // Apply theme state after a small delay to ensure DOM is ready
  setTimeout(applyThemeState, 0);
});

// Add event listener for page visibility changes
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) {
    // Apply theme state after a small delay
    setTimeout(applyThemeState, 0);
  }
});

// Show More Btns visibility changes
document.addEventListener('DOMContentLoaded', function () {
  const showMoreButtons = document.querySelectorAll('.show-more-btn');
  let currentLang = localStorage.getItem('selectedLanguage') || 'en';

  showMoreButtons.forEach(button => {
    const btnText = button.querySelector('.btn-text');
    const collapseId = button.getAttribute('data-bs-target');
    const collapseElement = document.querySelector(collapseId);

    // Set initial text
    btnText.textContent = translations[currentLang].showMore;

    // Listen for collapse events
    collapseElement.addEventListener('show.bs.collapse', function () {
      btnText.textContent = translations[currentLang].showLess;
    });

    collapseElement.addEventListener('hide.bs.collapse', function () {
      btnText.textContent = translations[currentLang].showMore;
    });
  });

  // Update button text when language changes
  const languageToggle = document.getElementById('chklang');
  if (languageToggle) {
    languageToggle.addEventListener('change', function () {
      currentLang = this.checked ? 'ar' : 'en';
      showMoreButtons.forEach(button => {
        const btnText = button.querySelector('.btn-text');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        btnText.textContent = translations[currentLang][isExpanded ? 'showLess' : 'showMore'];
      });
    });
  }
});

/* ================================= Details ================================= */

// Video Controller
document.addEventListener("DOMContentLoaded", function () {
  // Load thumbnails
  document.querySelectorAll('#videoList li').forEach(li => {
    const videoUrl = li.getAttribute("data-video");
    const videoId = videoUrl.split("/").pop(); // get ID after /embed/
    const img = li.querySelector("img.thumbnail");
    img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    img.alt = "Video thumbnail";
  });

  // Load selected video
  const videoPlayer = document.getElementById("videoPlayer");
  const videoInfo = document.getElementById("videoInfo");

  document.querySelectorAll('#videoList li').forEach(li => {
    li.addEventListener("click", function () {
      const videoUrl = li.getAttribute("data-video");
      const info = li.getAttribute("data-info");

      videoPlayer.src = videoUrl;
      if (videoInfo) videoInfo.textContent = info;
    });
  });
});

//Thumbnail Controller
// Thumbnail slider functionality
document.addEventListener('DOMContentLoaded', function () {
  const thumbnailsWrapper = document.querySelector('.thumbnails-wrapper');
  const prevButton = document.querySelector('.slider-prev');
  const nextButton = document.querySelector('.slider-next');

  if (thumbnailsWrapper && prevButton && nextButton) {
    // Set scroll amount to thumbnail width + gap (approximately)
    const scrollAmount = 85 * 3;

    // Function to check if page is in RTL mode
    function isRTLMode() {
      return document.dir === 'rtl' || document.body.getAttribute('dir') === 'rtl';
    }

    // Function to scroll thumbnails that handles RTL mode automatically
    function scrollThumbnails(direction) {
      const scrollDir = isRTLMode() ? -direction : direction;
      thumbnailsWrapper.scrollBy({
        left: scrollDir * scrollAmount,
        behavior: 'smooth'
      });

      // After scrolling, update arrow visibility
      setTimeout(updateArrowVisibility, 300);
    }

    // Function to update arrow visibility based on scroll position
    function updateArrowVisibility() {
      const scrollPosition = thumbnailsWrapper.scrollLeft;
      const maxScroll = thumbnailsWrapper.scrollWidth - thumbnailsWrapper.clientWidth;

      // In RTL mode, scrollLeft is negative and goes from 0 to -maxScroll
      if (isRTLMode()) {
        // For RTL: show prev when not at rightmost position (scrollLeft is not 0)
        prevButton.classList.toggle('hidden', scrollPosition >= 0);
        // For RTL: show next when not at leftmost position (scrollLeft is not at -maxScroll)
        nextButton.classList.toggle('hidden', scrollPosition <= -maxScroll + 5);
      } else {
        // For LTR: show prev when not at leftmost position (scrollLeft is not 0)
        prevButton.classList.toggle('hidden', scrollPosition <= 0);
        // For LTR: show next when not at rightmost position (scrollLeft is not at maxScroll)
        nextButton.classList.toggle('hidden', scrollPosition >= maxScroll - 5);
      }
    }

    // Button click handlers
    prevButton.addEventListener('click', function () {
      scrollThumbnails(-1); // Scroll left in LTR, right in RTL
    });

    nextButton.addEventListener('click', function () {
      scrollThumbnails(1);  // Scroll right in LTR, left in RTL
    });

    // Update navigation on language change
    const langToggle = document.getElementById('chklang');
    if (langToggle) {
      langToggle.addEventListener('change', function () {
        // Small delay to allow the dir attribute to update
        setTimeout(() => {
          // Clear the scroll position to avoid confusion
          thumbnailsWrapper.scrollLeft = 0;
          updateArrowVisibility();
        }, 200);
      });
    }

    // Listen for scroll events to update arrow visibility
    thumbnailsWrapper.addEventListener('scroll', updateArrowVisibility);

    // Initial check for arrow visibility
    updateArrowVisibility();

    // Also update on window resize
    window.addEventListener('resize', updateArrowVisibility);
  }
});

// Global variables to track current image state
let imagePaths = [];
let currentImageIndex = 0;

// Function to initialize image paths from thumbnails
function initializeImagePaths() {
  const thumbnails = document.querySelectorAll('.thumbnail');
  imagePaths = Array.from(thumbnails).map(thumb => thumb.src);

  // Update total images display (only present on the details page)
  const totalImages = document.getElementById('totalImages');
  if (totalImages) totalImages.textContent = imagePaths.length;
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', function () {
  initializeImagePaths();
});

// Function to change the main image when a thumbnail is clicked
function changeImage(src) {
  const mainImage = document.getElementById('mainImage');

  // Add fade-out effect
  mainImage.style.opacity = '0';
  mainImage.style.transition = 'opacity 0.3s ease';

  // Change image after fade out
  setTimeout(function () {
    mainImage.src = src;

    // Update current image index for the overlay
    const thumbnails = document.querySelectorAll('.thumbnail');
    currentImageIndex = Array.from(thumbnails).findIndex(thumb => thumb.src.includes(src));

    // Update indicators
    updateImageIndicators(currentImageIndex);

    // Fade back in
    mainImage.style.opacity = '1';
  }, 300);

  // Highlight the selected thumbnail
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach(thumb => {
    thumb.classList.remove('selected');
  });

  const selectedThumbnail = Array.from(thumbnails).find(thumb => thumb.src.includes(src));
  if (selectedThumbnail) {
    selectedThumbnail.classList.add('selected');

    // Scroll the thumbnail into view if needed
    selectedThumbnail.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }
}

// Initialize with first thumbnail selected
document.addEventListener('DOMContentLoaded', function () {
  const firstThumbnail = document.querySelector('.thumbnail');
  if (firstThumbnail) {
    firstThumbnail.classList.add('selected');
  }
});

// Fullscreen overlay functions
function openFullscreenOverlay(src) {
  const overlay = document.getElementById('fullscreenOverlay');
  const overlayImage = document.getElementById('overlayImage');

  // Set the image source
  overlayImage.src = src;

  // Update current image index
  const thumbnails = document.querySelectorAll('.thumbnail');
  currentImageIndex = Array.from(thumbnails).findIndex(thumb => thumb.src.includes(src));

  // Update counter
  document.getElementById('currentImageIndex').textContent = currentImageIndex + 1;

  // Show overlay with transition
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.classList.add('active');
  }, 10);

  // Add loaded class when image is loaded
  overlayImage.onload = function () {
    overlayImage.classList.add('loaded');
  };

  // Disable body scroll
  document.body.style.overflow = 'hidden';

  // Listen for keyboard events
  document.addEventListener('keydown', handleKeyPress);
}

function closeFullscreenOverlay() {
  const overlay = document.getElementById('fullscreenOverlay');
  const overlayImage = document.getElementById('overlayImage');

  // Hide with transition
  overlay.classList.remove('active');
  setTimeout(() => {
    overlay.style.display = 'none';
    overlayImage.classList.remove('loaded');
  }, 300);

  // Re-enable body scroll
  document.body.style.overflow = 'auto';

  // Remove keyboard event listener
  document.removeEventListener('keydown', handleKeyPress);
}

function changeOverlayImage(direction) {
  const overlayImage = document.getElementById('overlayImage');

  // Remove loaded class
  overlayImage.classList.remove('loaded');

  // Calculate new index based on direction
  const isRTL = document.dir === 'rtl' || document.body.getAttribute('dir') === 'rtl';
  const effectiveDirection = isRTL ? -direction : direction;

  currentImageIndex = (currentImageIndex + effectiveDirection + imagePaths.length) % imagePaths.length;

  // Update counter
  document.getElementById('currentImageIndex').textContent = currentImageIndex + 1;

  // Update navigation buttons visibility
  updateOverlayNavVisibility();

  // Change the image with fade effect
  setTimeout(() => {
    overlayImage.src = imagePaths[currentImageIndex];

    // Add loaded class when image is loaded
    overlayImage.onload = function () {
      overlayImage.classList.add('loaded');
    };
  }, 300);
}

function updateOverlayNavVisibility() {
  const prevBtn = document.querySelector('.overlay-nav.prev-btn');
  const nextBtn = document.querySelector('.overlay-nav.next-btn');

  if (!prevBtn || !nextBtn) return;

  // Hide previous button if at first image
  // prevBtn.classList.toggle('hidden', currentImageIndex === 0);

  // Hide next button if at last image
  // nextBtn.classList.toggle('hidden', currentImageIndex === totalImages - 1);
}

function handleKeyPress(e) {
  // Handle arrow keys and escape
  switch (e.key) {
    case 'Escape':
      closeFullscreenOverlay();
      break;
    case 'ArrowLeft':
      changeOverlayImage(-1);
      break;
    case 'ArrowRight':
      changeOverlayImage(1);
      break;
  }
}

// Standalone overlay functionality
document.addEventListener('DOMContentLoaded', function () {
  initializeOverlay();
});

// If the DOM is already loaded, run initialization immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeOverlay();
}

function initializeOverlay() {
  // Get references to overlay elements
  const overlay = document.getElementById('fullscreenOverlay');
  const overlayImage = document.getElementById('overlayImage');
  const testButton = document.getElementById('testOverlayBtn');
  const mainImage = document.getElementById('mainImage');

  // Set up test button click handler
  if (testButton) {
    testButton.addEventListener('click', function () {
      openFullscreenOverlay(mainImage.src);
    });
  }

  // Make sure main image is clickable
  const mainImageContainer = document.getElementById('mainImageContainer');
  if (mainImage && mainImageContainer) {
    // Add click event to both the image and its container
    mainImage.addEventListener('click', function () {
      openFullscreenOverlay(this.src);
    });

    mainImageContainer.addEventListener('click', function () {
      openFullscreenOverlay(mainImage.src);
    });

  }

  // Populate image paths immediately
  const thumbnails = document.querySelectorAll('.thumbnail');
  const imagePaths = Array.from(thumbnails).map(thumb => thumb.src);

  // Update total images count
  const totalImagesElement = document.getElementById('totalImages');
  if (totalImagesElement) {
    totalImagesElement.textContent = imagePaths.length;
  }

  // Expose necessary variables and functions to global scope
  window.imagePaths = imagePaths;
  window.currentImageIndex = 0;

  window.openFullscreenOverlay = function (src) {

    // Set the image source
    overlayImage.src = src;

    // Find current image index
    window.currentImageIndex = imagePaths.findIndex(path => path.includes(src.split('/').pop()));
    if (window.currentImageIndex === -1) window.currentImageIndex = 0;

    // Update counter
    document.getElementById('currentImageIndex').textContent = window.currentImageIndex + 1;

    // Update navigation buttons visibility
    if (typeof updateOverlayNavVisibility === 'function') {
      updateOverlayNavVisibility();
    } else {
      // If the function isn't defined yet, create a simple version
      const prevBtn = document.querySelector('.overlay-nav.prev-btn');
      const nextBtn = document.querySelector('.overlay-nav.next-btn');
      const totalImages = imagePaths.length;

      // Hide previous button if at first image
      if (prevBtn) prevBtn.classList.toggle('hidden', window.currentImageIndex === 0);

      // Hide next button if at last image
      if (nextBtn) nextBtn.classList.toggle('hidden', window.currentImageIndex === totalImages - 1);
    }

    // Show overlay with transition
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);

    // Add loaded class when image is loaded
    overlayImage.onload = function () {
      overlayImage.classList.add('loaded');
    };

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Listen for keyboard events
    document.addEventListener('keydown', handleKeyPress);
  };

  window.closeFullscreenOverlay = function () {
    // Hide with transition
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
      overlayImage.classList.remove('loaded');
    }, 300);

    // Re-enable body scroll
    document.body.style.overflow = 'auto';

    // Remove keyboard event listener
    document.removeEventListener('keydown', handleKeyPress);
  };

  window.changeOverlayImage = function (direction) {
    // Remove loaded class
    overlayImage.classList.remove('loaded');

    // Calculate new index based on direction
    const isRTL = document.dir === 'rtl' || document.body.getAttribute('dir') === 'rtl';
    const effectiveDirection = isRTL ? -direction : direction;

    window.currentImageIndex = (window.currentImageIndex + effectiveDirection + imagePaths.length) % imagePaths.length;

    // Update counter
    document.getElementById('currentImageIndex').textContent = window.currentImageIndex + 1;

    // Change the image with fade effect
    setTimeout(() => {
      overlayImage.src = imagePaths[window.currentImageIndex];

      // Add loaded class when image is loaded
      overlayImage.onload = function () {
        overlayImage.classList.add('loaded');
      };
    }, 300);
  };

  function handleKeyPress(e) {
    // Handle arrow keys and escape
    switch (e.key) {
      case 'Escape':
        window.closeFullscreenOverlay();
        break;
      case 'ArrowLeft':
        window.changeOverlayImage(-1);
        break;
      case 'ArrowRight':
        window.changeOverlayImage(1);
        break;
    }
  }

  window.handleKeyPress = handleKeyPress;
}

/* <!-- Video Player JavaScript --> */
  // Content Filter Functionality
  document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const contentSections = document.querySelectorAll('[data-content-type]');

    // Initialize with 'all' filter
    applyActiveFilter('all');

    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
      button.addEventListener('click', function () {
        const filter = this.getAttribute('data-filter');

        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Apply the filter
        applyActiveFilter(filter);
      });
    });

    // Function to apply the active filter
    function applyActiveFilter(filter) {
      // First fade out all content
      contentSections.forEach(section => {
        section.classList.add('fade-out');
      });

      // After transition completes, show/hide sections based on filter
      setTimeout(() => {
        contentSections.forEach(section => {
          const contentType = section.getAttribute('data-content-type');

          if (filter === 'all' || filter === contentType) {
            section.classList.remove('hidden-content');
            setTimeout(() => {
              section.classList.remove('fade-out');
              section.classList.add('fade-in');
            }, 50);
          } else {
            section.classList.add('hidden-content');
          }
        });

        // When Videos or News is selected nothing inside the images/description
        // layout is visible any more: hide the whole layout box too, so it does not
        // leave an empty gap above the section that should now sit right below the filters.
        const detailsLayout = document.querySelector('.details-layout');
        if (detailsLayout) {
          const anyVisible = Array.from(detailsLayout.querySelectorAll('[data-content-type]'))
            .some(section => !section.classList.contains('hidden-content'));
          detailsLayout.classList.toggle('hidden-content', !anyVisible);
        }

        // Trigger window resize to ensure sliders update properly
        window.dispatchEvent(new Event('resize'));
      }, 300);
    }
  });

  // Main Video Player Function
  function playInMainPlayer(videoCard) {
    // Get video information from data attributes
    const videoId = videoCard.getAttribute('data-video-id');
    const videoTitle = videoCard.getAttribute('data-video-title');
    const videoDesc = videoCard.getAttribute('data-video-desc');

    // Update main player
    const mainPlayer = document.getElementById('mainVideoPlayer');
    const mainTitle = document.getElementById('mainVideoTitle');
    const mainDesc = document.getElementById('mainVideoDescription');

    // Add a loading class to the container
    const container = document.querySelector('.main-video-container');
    container.classList.add('loading');

    // Update video source with slight delay to allow for loading animation
    setTimeout(() => {
      mainPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      mainTitle.textContent = videoTitle;
      mainDesc.textContent = videoDesc;

      // Remove the loading class
      container.classList.remove('loading');

      // Highlight the active video card
      const videoCards = document.querySelectorAll('.video-card');
      const currentIndex = Array.from(videoCards).indexOf(videoCard);

      videoCards.forEach(card => {
        card.classList.remove('active');
      });
      videoCard.classList.add('active');

      // Update video indicators
      updateVideoIndicators(currentIndex);

      // Scroll the selected thumbnail into better view within the slider
      centerSelectedVideoInSlider(videoCard);

      // Scroll to the main video area if on mobile
      if (window.innerWidth < 768) {
        document.querySelector('.main-video-container').scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  }

  // Function to center the selected video card in the slider
  function centerSelectedVideoInSlider(videoCard) {
    const sliderTrack = document.querySelector('.video-slider-track');
    const sliderWrapper = document.querySelector('.video-slider-track-wrapper');

    if (!sliderTrack || !sliderWrapper) return;

    // Get all video cards and determine special positions
    const videoCards = sliderTrack.querySelectorAll('.video-card');
    const totalCards = videoCards.length;
    const isFirstVideo = videoCard === videoCards[0];
    const isSecondVideo = videoCard === videoCards[1];
    const isLastVideo = videoCard === videoCards[totalCards - 1];

    // Calculate max scroll position
    const containerWidth = sliderWrapper.offsetWidth;
    const trackWidth = sliderTrack.scrollWidth;
    const maxScroll = Math.max(0, trackWidth - containerWidth);

    // Handle special cases for first, second, and last video
    if (isFirstVideo || isSecondVideo) {
      // First or second video: reset to beginning position
      sliderTrack.style.transition = 'transform 0.5s ease';
      sliderTrack.style.transform = 'translateX(0)';
      window.currentVideoPosition = 0;
      return;
    }

    if (isLastVideo) {
      // Last video: go to end position
      const isRTL = document.dir === 'rtl' || document.body.getAttribute('dir') === 'rtl';
      const endPosition = isRTL ? maxScroll : -maxScroll;

      sliderTrack.style.transition = 'transform 0.5s ease';
      sliderTrack.style.transform = `translateX(${endPosition}px)`;
      window.currentVideoPosition = Math.abs(endPosition);
      return;
    }

    // For other videos, continue with normal centering
    // Check if RTL mode is active
    const isRTL = document.dir === 'rtl' || document.body.getAttribute('dir') === 'rtl';

    // Calculate the current scroll position and the card's position
    const wrapperRect = sliderWrapper.getBoundingClientRect();
    const cardRect = videoCard.getBoundingClientRect();

    // Calculate center positions
    const wrapperCenter = wrapperRect.left + (wrapperRect.width / 2);
    const cardCenter = cardRect.left + (cardRect.width / 2);

    // Calculate how far the card is from the center
    const distanceFromCenter = cardCenter - wrapperCenter;

    // Get the current transform value
    let currentTranslate = 0;
    const transformValue = sliderTrack.style.transform;
    if (transformValue) {
      const match = transformValue.match(/translateX\(([-\d.]+)px\)/);
      if (match && match[1]) {
        currentTranslate = parseFloat(match[1]);
      }
    }

    // Calculate new position, accounting for RTL if needed
    let newTranslate = currentTranslate;
    if (isRTL) {
      newTranslate -= distanceFromCenter;
    } else {
      newTranslate -= distanceFromCenter;
    }

    // Apply boundary limits
    if (Math.abs(newTranslate) > maxScroll) {
      newTranslate = isRTL ? maxScroll : -maxScroll;
    }
    if (newTranslate > 0 && !isRTL) newTranslate = 0;
    if (newTranslate < 0 && isRTL) newTranslate = 0;

    // Apply the new transform with smooth animation
    sliderTrack.style.transition = 'transform 0.5s ease';
    sliderTrack.style.transform = `translateX(${newTranslate}px)`;

    // Update the stored position for the slider navigation
    window.currentVideoPosition = Math.abs(newTranslate);
  }

  // Video Modal Functions
  function openVideoModal(videoSrc) {
    // Get modal elements
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');

    // Set video source
    videoFrame.src = videoSrc;

    // Show modal with a fade effect
    modal.style.display = 'block';
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Add escape key event listener
    document.addEventListener('keydown', handleVideoModalKeyPress);
  }

  function closeVideoModal() {
    // Get modal elements
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');

    // Fade out and hide
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
      // Clear video source to stop playback
      videoFrame.src = '';
    }, 300);

    // Re-enable body scroll
    document.body.style.overflow = 'auto';

    // Remove key event listener
    document.removeEventListener('keydown', handleVideoModalKeyPress);
  }

  function handleVideoModalKeyPress(e) {
    if (e.key === 'Escape') {
      closeVideoModal();
    }
  }

  // Close the modal if user clicks outside of content
  window.addEventListener('click', function (event) {
    const modal = document.getElementById('videoModal');
    if (event.target === modal) {
      closeVideoModal();
    }
  });

  // Initialize the first video as active on page load
  document.addEventListener('DOMContentLoaded', function () {
    const firstVideoCard = document.querySelector('.video-card');
    if (firstVideoCard) {
      // Just add active class without triggering centering
      firstVideoCard.classList.add('active');

      // Reset track position to ensure we start at the beginning
      const videoTrack = document.querySelector('.video-slider-track');
      if (videoTrack) {
        videoTrack.style.transform = 'translateX(0)';
        window.currentVideoPosition = 0;
      }
    }
  });



  // Video slider navigation
  document.addEventListener('DOMContentLoaded', function () {
    const videoTrack = document.querySelector('.video-slider-track');
    const prevButton = document.querySelector('.video-prev-btn');
    const nextButton = document.querySelector('.video-next-btn');

    // Ensure buttons are visible by default until we can check them
    if (prevButton) {
      prevButton.classList.remove('hidden');
      prevButton.style.opacity = "1";
      prevButton.style.visibility = "visible";
    }

    if (nextButton) {
      nextButton.classList.remove('hidden');
      nextButton.style.opacity = "1";
      nextButton.style.visibility = "visible";
    }

    if (videoTrack && prevButton && nextButton) {
      // Set scroll amount to slide one video card at a time
      const scrollAmount = 280; // Card width + gap

      // Initialize global position tracker
      window.currentVideoPosition = 0;

      // Function to check if page is in RTL mode
      function isRTLMode() {
        return document.dir === 'rtl' || document.body.getAttribute('dir') === 'rtl';
      }

      // Function to scroll videos that handles RTL mode
      function scrollVideos(direction) {
        const isRtl = isRTLMode();
        // For RTL, we do NOT reverse the logical direction, but the visual transform will be opposite
        const containerWidth = videoTrack.parentElement.offsetWidth;
        const trackWidth = videoTrack.scrollWidth;
        const maxScroll = Math.max(0, trackWidth - containerWidth);

        // Update current position - use the global tracker
        window.currentVideoPosition = window.currentVideoPosition || 0;
        window.currentVideoPosition += (direction * scrollAmount);

        // Apply boundary limits
        if (window.currentVideoPosition < 0) window.currentVideoPosition = 0;
        if (window.currentVideoPosition > maxScroll) window.currentVideoPosition = maxScroll;

        // Apply transform for smooth sliding
        // For RTL, we invert the sign of the transform
        const translateValue = isRtl ? window.currentVideoPosition : -window.currentVideoPosition;
        videoTrack.style.transform = `translateX(${translateValue}px)`;

      }

      // Function to check if there are more cards to scroll
      function updateButtonVisibility() {
        const containerWidth = videoTrack.parentElement.offsetWidth;
        const trackWidth = videoTrack.scrollWidth;


        // In RTL mode, we don't swap the buttons logically - we keep the same button references
        // but the arrow appearance is flipped via CSS

        // Only show prev button if not at the start
        if (window.currentVideoPosition <= 0) {
          prevButton.classList.add('hidden');
          prevButton.style.opacity = "0";
          prevButton.style.visibility = "hidden";
        } else {
          prevButton.classList.remove('hidden');
          prevButton.style.opacity = "1";
          prevButton.style.visibility = "visible";
        }

        // Only show next button if not at the end
        if (window.currentVideoPosition >= trackWidth - containerWidth) {
          nextButton.classList.add('hidden');
          nextButton.style.opacity = "0";
          nextButton.style.visibility = "hidden";
        } else {
          nextButton.classList.remove('hidden');
          nextButton.style.opacity = "1";
          nextButton.style.visibility = "visible";
        }
      }

      // Button click handlers
      prevButton.addEventListener('click', function () {
        scrollVideos(-1);
        updateButtonVisibility();
      });

      nextButton.addEventListener('click', function () {
        scrollVideos(1);
        updateButtonVisibility();
      });

      // Update on language change
      const langToggle = document.getElementById('chklang');
      if (langToggle) {
        langToggle.addEventListener('change', function () {
          // Reset position on language change to avoid confusion
          setTimeout(() => {
            window.currentVideoPosition = 0;
            videoTrack.style.transform = 'translateX(0)';
            updateButtonVisibility();
          }, 50);
        });
      }

      // Handle window resize
      window.addEventListener('resize', function () {
        // Reset position on window resize
        window.currentVideoPosition = 0;
        videoTrack.style.transform = 'translateX(0)';
        updateButtonVisibility();
      });

      // Initial button visibility check - with delay to ensure DOM calculations are accurate
      setTimeout(() => {
        updateButtonVisibility();
      }, 300);
    }
  });



  // Initialize slide indicators for both image and video sliders
  document.addEventListener('DOMContentLoaded', function () {
    initializeImageIndicators();
    initializeVideoIndicators();
  });

  // Generate and initialize image indicators
  function initializeImageIndicators() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const indicatorsContainer = document.querySelector('.image-indicators');

    if (!thumbnails.length || !indicatorsContainer) return;

    // Clear any existing indicators
    indicatorsContainer.innerHTML = '';

    // Create an indicator dot for each thumbnail
    thumbnails.forEach((thumb, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator-dot');

      // Set first indicator as active by default
      if (index === 0) {
        indicator.classList.add('active');
      }

      // Add click event to change image
      indicator.addEventListener('click', function () {
        changeImage(thumb.src);
      });

      indicatorsContainer.appendChild(indicator);
    });
  }

  // Generate and initialize video indicators
  function initializeVideoIndicators() {
    const videoCards = document.querySelectorAll('.video-card');
    const indicatorsContainer = document.querySelector('.video-indicators');

    if (!videoCards.length || !indicatorsContainer) return;

    // Clear any existing indicators
    indicatorsContainer.innerHTML = '';

    // Create an indicator dot for each video
    videoCards.forEach((card, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator-dot');

      // Set first indicator as active by default
      if (index === 0) {
        indicator.classList.add('active');
      }

      // Add click event to play video
      indicator.addEventListener('click', function () {
        playInMainPlayer(card);
        updateVideoIndicators(index);
      });

      indicatorsContainer.appendChild(indicator);
    });
  }

  // Update indicator active state for images
  function updateImageIndicators(index) {
    const indicators = document.querySelectorAll('.image-indicators .indicator-dot');

    if (!indicators.length) return;

    // Remove active class from all indicators
    indicators.forEach(dot => dot.classList.remove('active'));

    // Add active class to current indicator
    if (indicators[index]) {
      indicators[index].classList.add('active');
    }
  }

  // Update indicator active state for videos
  function updateVideoIndicators(index) {
    const indicators = document.querySelectorAll('.video-indicators .indicator-dot');

    if (!indicators.length) return;

    // Remove active class from all indicators
    indicators.forEach(dot => dot.classList.remove('active'));

    // Add active class to current indicator
    if (indicators[index]) {
      indicators[index].classList.add('active');
    }
  }

  // Thumbnail slider functionality
