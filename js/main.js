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
    console.log('typeText: Missing element or text', { element, text });
    return;
  }
  
  console.log('typeText: Starting animation', { elementId: element.id, text });
  
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
  
  console.log('typeText: Animation complete', { elementId: element.id });
  
  // Clean up
  delete element.typingTimeout;
}

// Single Source of Truth Language System
const LangSystem = {
  init() {
    console.log('LangSystem: Initializing');
    // Get language directly from localStorage using consistent key
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    console.log('LangSystem: Saved language', savedLang);
    
    // Set up language toggle
    const langToggle = document.getElementById('chklang');
    if (langToggle) {
      console.log('LangSystem: Found language toggle');
      // Set initial state directly
      langToggle.checked = savedLang === 'ar';
      
      // Remove any existing listeners by cloning
      const newToggle = langToggle.cloneNode(true);
      langToggle.parentNode.replaceChild(newToggle, langToggle);
      
      // Add single event listener for direct changes
      newToggle.addEventListener('change', (e) => {
        console.log('LangSystem: Language toggle changed');
        e.preventDefault(); // Prevent any default behavior
        const newLang = newToggle.checked ? 'ar' : 'en';
        this.changeLang(newLang);
      });
    } else {
      console.log('LangSystem: Language toggle not found');
    }
    
    // Apply language immediately
    this.changeLang(savedLang);
  },
  
  changeLang(lang) {
    console.log('LangSystem: Changing language to', lang);
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
    console.log('LangSystem: Updating content for language', lang);
    // Update regular elements immediately
    document.querySelectorAll('[data-lang], [data-i18n]').forEach(element => {
      const key = element.getAttribute('data-lang') || element.getAttribute('data-i18n');
      const translation = translations[lang][key];
      if (!translation) {
        console.log('LangSystem: No translation found for key', key);
        return;
      }
      
      // Skip landing page elements that need animation
      if (element.id === 'landing-title1' || element.id === 'landing-title2' || element.id === 'landing-paragraph') {
        console.log('LangSystem: Skipping animated element', element.id);
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
    console.log('LangSystem: Updating landing page for language', lang);
    const landingTitle1 = document.getElementById('landing-title1');
    const landingTitle2 = document.getElementById('landing-title2');
    const landingParagraph = document.getElementById('landing-paragraph');
    
    console.log('LangSystem: Landing elements found', {
      title1: !!landingTitle1,
      title2: !!landingTitle2,
      paragraph: !!landingParagraph
    });
    
    // Clear existing content
    if (landingTitle1) landingTitle1.textContent = '';
    if (landingTitle2) landingTitle2.textContent = '';
    if (landingParagraph) landingParagraph.textContent = '';
    
    // Animate first title (h3)
    if (landingTitle1) {
      const titleKey = landingTitle1.getAttribute('data-lang');
      const titleTranslation = translations[lang][titleKey];
      console.log('LangSystem: First title translation', { key: titleKey, translation: titleTranslation });
      if (titleTranslation) {
        typeText(landingTitle1, titleTranslation, 50);
      }
    }
    
    // Animate second title (h1)
    if (landingTitle2) {
      const titleKey = landingTitle2.getAttribute('data-lang');
      const titleTranslation = translations[lang][titleKey];
      console.log('LangSystem: Second title translation', { key: titleKey, translation: titleTranslation });
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
      console.log('LangSystem: Paragraph translation', { key: paraKey, translation: paraTranslation });
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
  console.log('DOM Content Loaded: Initializing LangSystem');
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
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  
  if (searchInput) {
    searchInput.addEventListener('input', function() {
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
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Apply theme state immediately before any other initialization
    applyThemeState();
    
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
    
    // Dark mode elements
    const darkModeElements = document.querySelector(".checkbox") || 
                          document.querySelector(".checkbox1") || 
                          document.querySelector(".checkbox2");
    if (darkModeElements) {
      darkModeButton();
      onLoad();
    }
    
    // Set up theme observer
    setupThemeObserver();
    
  } catch (error) {
    console.log("Error initializing JavaScript functionality:", error);
  }
});

// Add event listener for page load
window.addEventListener('load', function() {
  // Apply theme state after a small delay to ensure DOM is ready
  setTimeout(applyThemeState, 0);
});

// Add event listener for page visibility changes
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // Apply theme state after a small delay
    setTimeout(applyThemeState, 0);
  }
});

// Theme switcher functionality
const themeToggle = document.getElementById('chk');
if (themeToggle) {
  themeToggle.addEventListener('change', function() {
    document.body.classList.toggle('dark-mode');
    // Update navbar brand image based on theme
    const navbarBrand = document.querySelector('.navbar-brand img');
    if (navbarBrand) {
      navbarBrand.src = document.body.classList.contains('dark-mode') 
        ? 'images/3-white.png' 
        : 'images/3.png';
    }
  });
}
