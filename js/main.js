// On Load
function onLoad() {
  let isDark = window.localStorage.getItem("isDark?");
  let checkBox = document.querySelector(".checkbox");
  let checkBox1 = document.querySelector(".checkbox1");
  let checkBox2 = document.querySelector(".checkbox2");
  let html = document.querySelector("html");
  let body = document.querySelector("body");

  // Make sure we have all the required elements
  if (html && body) {
    // Set initial state immediately
    if (isDark === "true") {
      html.classList.add("darkMode");
      body.classList.add("dark-mode");
      if (checkBox) checkBox.checked = true;
      if (checkBox1) checkBox1.checked = true;
      if (checkBox2) checkBox2.checked = true;
    } else {
      html.classList.remove("darkMode");
      body.classList.remove("dark-mode");
      if (checkBox) checkBox.checked = false;
      if (checkBox1) checkBox1.checked = false;
      if (checkBox2) checkBox2.checked = false;
    }

    // Update navbar brand image immediately
    updateNavbarBrandImage(isDark === "true");
  }
}

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

// Events Count Down
function countDown() {
  let countdownDate = new Date("Sept 28, 2023 23:59:59").getTime();

  // Check if countdown elements exist
  let daysElement = document.querySelector(".days");
  let hoursElement = document.querySelector(".hours");
  let minutesElement = document.querySelector(".minutes");
  let secondsElement = document.querySelector(".seconds");

  // Only set up the countdown if all required elements exist
  if (daysElement && hoursElement && minutesElement && secondsElement) {
    let counter = setInterval(() => {
      // Get Time Now
      let timeNow = new Date().getTime();
      // Find The Date Difference Between Now And Countdown Date
      let dateDiff = countdownDate - timeNow;

      // Get TIme Units
      let days = Math.floor(dateDiff / (1000 * 60 * 60 * 24));
      let hours = Math.floor(
        (dateDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((dateDiff % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((dateDiff % (1000 * 60)) / 1000);

      daysElement.innerHTML = days < 10 ? `0${days}` : days;
      hoursElement.innerHTML = hours < 10 ? `0${hours}` : hours;
      minutesElement.innerHTML = minutes < 10 ? `0${minutes}` : minutes;
      secondsElement.innerHTML = seconds < 10 ? `0${seconds}` : seconds;

      if (dateDiff <= 0) {
        clearInterval(counter);
      }
    }, 1000);
  }
}

// Skills Width
function skillsWidth() {
  // Find The Desired Section
  let section = document.querySelector("#ourSkills");
  let progressBar = document.querySelectorAll(".progress");

  window.addEventListener("scroll", () => {
    if (window.scrollY >= section.offsetTop - 150) {
      progressBar.forEach((bar) => {
        bar.style.width = bar.dataset.width;
      });
    }

    if (window.scrollY < section.offsetTop - 200) {
      progressBar.forEach((bar) => {
        bar.style.width = 0;
      });
    }
  });
}

// Stats Count
function statsCount() {
  let nums = document.querySelectorAll(".number");
  let section = document.querySelector("#ourAwesomeStats");
  let started = false; // is function started ? no

  window.addEventListener("scroll", () => {
    if (window.scrollY >= section.offsetTop - 200) {
      if (!started) {
        nums.forEach((number) => {
          startCount(number);
        });
      }
      started = true;
    }
  });

  function startCount(element) {
    let goal = element.dataset.goal;
    let counter = setInterval(() => {
      element.textContent++;
      if (element.textContent === goal) {
        clearInterval(counter);
      }
    }, 2000 / goal);
  }
}

// Dots Entering
function dotsEntering() {
  let section1 = document.querySelector("#latestEvents");
  let section2 = document.querySelector("#pricingPlans");
  let dots1 = document.querySelectorAll(".dots-up");
  let dots2 = document.querySelectorAll(".dots-down");

  // First Section
  window.addEventListener("scroll", () => {
    if (window.scrollY >= section1.offsetTop - 300) {
      dots1[0].style.right = 0;
    }
  });
  window.addEventListener("scroll", () => {
    if (window.scrollY >= section1.offsetTop - 200) {
      dots2[0].style.left = 0;
    }
  });

  // Second Section
  window.addEventListener("scroll", () => {
    if (window.scrollY >= section2.offsetTop - 300) {
      dots1[1].style.right = 0;
    }
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY >= section2.offsetTop - 200) {
      dots2[1].style.left = 0;
    }
  });
}

// Dots Outing
function dotsOuting() {
  let section1 = document.querySelector("#latestEvents");
  let section2 = document.querySelector("#pricingPlans");
  let dots1 = document.querySelectorAll(".dots-up");
  let dots2 = document.querySelectorAll(".dots-down");

  // First Section
  window.addEventListener("scroll", () => {
    if (window.scrollY >= section1.offsetTop + 200) {
      dots1[0].style.right = `-210px`;
    }
  });
  window.addEventListener("scroll", () => {
    if (window.scrollY >= section1.offsetTop + 300) {
      dots2[0].style.left = `-210px`;
    }
  });

  // Second Section
  window.addEventListener("scroll", () => {
    if (window.scrollY >= section2.offsetTop + 200) {
      dots1[1].style.right = `-210px`;
    }
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY >= section2.offsetTop + 300) {
      dots2[1].style.left = `-210px`;
    }
  });
}

// Hide and Show Header
function hidingShowingHeader() {
  let header = document.querySelector("header");
  let section1 = document.querySelector("#articles");
  let section2 = document.querySelector(".footer");
  let scroll1 = window.scrollY;

  document.addEventListener("scroll", () => {
    if (
      this.scrollY >= section1.offsetTop &&
      this.screenY <= section2.offsetTop
    ) {
      if (scroll1 > this.scrollY) {
        header.style.top = "0";
        scroll1 = this.scrollY;
      } else {
        header.style.top = "-100px";
        scroll1 = this.scrollY;
      }
    }
  });
}

// Other Links Button On Mobile Screens
function buttonClick() {
  let button = document.querySelector("button");
  let megaMenu = document.querySelector(".megaMenu2");
  let exit = document.querySelector(".up");

  // Check if elements exist before adding event listeners
  if (button && megaMenu) {
    button.addEventListener("click", () => {
      megaMenu.style.top = `100%`;
      megaMenu.style.opacity = `1`;
      megaMenu.style.zIndex = `100`;
    });
  }

  if (exit) {
    exit.addEventListener("click", () => {
      if (megaMenu) {
        megaMenu.style.top = `-1000px`;
        megaMenu.style.opacity = `0`;
        megaMenu.style.zIndex = `-1`;
      }
    });
  }

  let goOut = document.querySelectorAll(".linksMenu li");
  if (goOut.length > 0 && megaMenu) {
    goOut.forEach((li) => {
      li.addEventListener("click", () => {
        megaMenu.style.top = `-10000px`;
        megaMenu.style.opacity = `0`;
        megaMenu.style.zIndex = `-1`;
      });
    });
  }
}

// Scroll To Top Button
function showUpScrollToTopButton() {
  let scrollToTopButton = document.querySelector(".scrollToTop");

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

// Robust typing effect function
async function typeText(element, text, speed) {
  if (!element || !text) {
    return;
  }


  // Clear any existing typing animation
  if (element.typingTimeout) {
    clearTimeout(element.typingTimeout);
  }

  // Clear the element
  element.textContent = '';

  // Create a span to hold the text
  const textSpan = document.createElement('span');
  element.appendChild(textSpan);

  // Type each character
  for (let i = 0; i < text.length; i++) {
    textSpan.textContent = text.substring(0, i + 1);
    await new Promise(resolve => {
      element.typingTimeout = setTimeout(resolve, speed);
    });
  }


  // Clean up
  delete element.typingTimeout;
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
    } else {
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
    const landingTitle1 = document.getElementById('landing-title1');
    const landingTitle2 = document.getElementById('landing-title2');
    const landingParagraph = document.getElementById('landing-paragraph');

    // Clear existing content
    if (landingTitle1) landingTitle1.textContent = '';
    if (landingTitle2) landingTitle2.textContent = '';
    if (landingParagraph) landingParagraph.textContent = '';

    // Animate first title (h3)
    if (landingTitle1) {
      const titleKey = landingTitle1.getAttribute('data-lang');
      const titleTranslation = translations[lang][titleKey];
      if (titleTranslation) {
        typeText(landingTitle1, titleTranslation, 50);
      }
    }

    // Animate second title (h1)
    if (landingTitle2) {
      const titleKey = landingTitle2.getAttribute('data-lang');
      const titleTranslation = translations[lang][titleKey];
      if (titleTranslation) {
        setTimeout(() => {
          typeText(landingTitle2, titleTranslation, 50);
        }, 500);
      }
    }

    // Animate paragraph
    if (landingParagraph) {
      const paraKey = landingParagraph.getAttribute('data-lang');
      const paraTranslation = translations[lang][paraKey];
      if (paraTranslation) {
        setTimeout(() => {
          typeText(landingParagraph, paraTranslation, 30);
        }, 1000);
      }
    }
  }
};

// Initialize language system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  LangSystem.init();

  // Listen for language changes and update filters accordingly
  document.addEventListener('languageChanged', (event) => {
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

// Initialize all functions safely with a comprehensive check
document.addEventListener('DOMContentLoaded', function () {
  try {
    // Apply theme state immediately before any other initialization
    setupThemeToggle();
    setupThemeObserver();

    // Check what page elements exist before calling functions
    // Count down timer elements
    if (document.querySelector(".days") || document.querySelector(".hours")) {
      countDown();
    }

    // Skills section
    if (document.querySelector("#ourSkills")) {
      skillsWidth();
    }

    // Stats section
    if (document.querySelector("#ourAwesomeStats")) {
      statsCount();
    }

    // Dots elements
    if (document.querySelector(".dots-up") || document.querySelector(".dots-down")) {
      dotsEntering();
      dotsOuting();
    }

    // Header element
    if (document.querySelector("header")) {
      hidingShowingHeader();
    }

    // Mobile menu button - check both elements
    const button = document.querySelector("button");
    const megaMenu = document.querySelector(".megaMenu2");
    if (button && megaMenu) {
      buttonClick();
    }

    // Scroll to top button
    if (document.querySelector(".scrollToTop")) {
      showUpScrollToTopButton();
    }

  } catch (error) {
  }
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

  // Update total images display
  document.getElementById('totalImages').textContent = imagePaths.length;
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
  const prevBtn = document.querySelector('.overlay-nav.prev-btn');
  const nextBtn = document.querySelector('.overlay-nav.next-btn');

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
  const totalImages = imagePaths.length;

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
        const videoCards = videoTrack.querySelectorAll('.video-card');
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
        const isRtl = isRTLMode();


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
