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
    if (isDark) {
      html.classList.add("darkMode");
      body.classList.add("dark-mode");
    } else {
      html.classList.remove("darkMode");
      body.classList.remove("dark-mode");
    }
    updateNavbarBrandImage(isDark);
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

// On Load Languages
function onLoadLanguages() {
  const savedLanguage = localStorage.getItem('language') || 'en';
  const checkBoxlang = document.querySelector('.checkboxlang');
  let body = document.querySelector("body");

  // Only proceed if we have the language checkbox and body
  if (!checkBoxlang || !body) return;

  let email = document.querySelector(".email1");
  let subscribe = document.querySelector(".subscribee");
  let name = document.querySelector(".namee");
  let email1 = document.querySelector(".emaill");
  let mobile = document.querySelector(".mobilee");
  let message = document.querySelector(".messagee");
  let submit = document.querySelector(".sendd");
  let copyright = document.querySelector(".copyright");

  // Set initial state
  if (savedLanguage === 'ar') {
    checkBoxlang.checked = true;
    body.classList.add('rtl');
    body.setAttribute('dir', 'rtl');
  } else {
    checkBoxlang.checked = false;
    body.classList.remove('rtl');
    body.removeAttribute('dir');
  }

  // Update language switch
  checkBoxlang.addEventListener('change', function() {
    const newLanguage = this.checked ? 'ar' : 'en';
    localStorage.setItem('language', newLanguage);
    
    // Add transition class
    body.classList.add('language-transition');
    
    // Update UI
    if (newLanguage === 'ar') {
      body.classList.add('rtl');
      body.setAttribute('dir', 'rtl');
    } else {
      body.classList.remove('rtl');
      body.removeAttribute('dir');
    }
    
    // Update content
    translate(newLanguage);
    
    // Remove transition class after animation
    setTimeout(() => {
      body.classList.remove('language-transition');
    }, 300);
  });
}

// Initialize language switcher
document.addEventListener('DOMContentLoaded', () => {
  onLoadLanguages();
});

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
        header.style.top = "72px";
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

// Dark Mode Button
function darkModeButton() {
  let checkBox = document.querySelector(".checkbox");
  let checkBox1 = document.querySelector(".checkbox1");
  let checkBox2 = document.querySelector(".checkbox2");

  let html = document.querySelector("html");
  let body = document.querySelector("body");

  if (checkBox && html && body) {
    checkBox.addEventListener("change", () => {
      if (checkBox.checked) {
        html.classList.add("darkMode");
        body.classList.add("dark-mode");
        updateNavbarBrandImage(true);
      } else {
        html.classList.remove("darkMode");
        body.classList.remove("dark-mode");
        updateNavbarBrandImage(false);
      }
    });
  }

  if (checkBox1 && html && body) {
    checkBox1.addEventListener("change", () => {
      if (checkBox1.checked) {
        html.classList.add("darkMode");
        body.classList.add("dark-mode");
        updateNavbarBrandImage(true);
      } else {
        html.classList.remove("darkMode");
        body.classList.remove("dark-mode");
        updateNavbarBrandImage(false);
      }
    });
  }

  if (checkBox2 && html && body) {
    checkBox2.addEventListener("change", () => {
      if (checkBox2.checked) {
        html.classList.add("darkMode");
        body.classList.add("dark-mode");
        updateNavbarBrandImage(true);
      } else {
        html.classList.remove("darkMode");
        body.classList.remove("dark-mode");
        updateNavbarBrandImage(false);
      }
    });
  }
}

// Is Dark Mode?
function addtoLocalStorage() {
  let checkBox = document.querySelector(".checkbox");
  let checkBox1 = document.querySelector(".checkbox1");
  let checkBox2 = document.querySelector(".checkbox2");

  let dark = false;

  checkBox.addEventListener("change", () => {
    if (checkBox.checked) {
      dark = true;
      window.localStorage.setItem("isDark?", dark);
    } else {
      dark = false;
      window.localStorage.setItem("isDark?", dark);
    }
  });

  checkBox1.addEventListener("change", () => {
    if (checkBox1.checked) {
      dark = true;
      window.localStorage.setItem("isDark?", dark);
    } else {
      dark = false;
      window.localStorage.setItem("isDark?", dark);
    }
  });

  checkBox2.addEventListener("change", () => {
    if (checkBox2.checked) {
      dark = true;
      window.localStorage.setItem("isDark?", dark);
    } else {
      dark = false;
      window.localStorage.setItem("isDark?", dark);
    }
  });
}

function translate(language) {
  let lang = language;
  let allDom = document.querySelectorAll("*");

  fetch(
    `https://raw.githubusercontent.com/Mohamed-Waled/webSite/main/languages/${lang}.json`
  )
    .then((response) => {
      return response.json();
    })
    .then((jsondata) => {
      for (const key in jsondata) {
        allDom.forEach((element) => {
          for (const attr of element.attributes) {
            if (element.hasAttribute("data-lang")) {
              if (attr.name === "data-lang") {
                if (attr.value === key) {
                  element.innerHTML = jsondata[key];
                }
              }
            }
          }
        });
      }
    });
}

//Change Languages Button
function changeLanguagesButton() {
  let checkBoxlang = document.querySelector(".checkboxlang");
  let checkBoxlang1 = document.querySelector(".checkboxlang1");
  let checkBoxlang2 = document.querySelector(".checkboxlang2");

  let email = document.querySelector(".email1");
  let subscribe = document.querySelector(".subscribee");
  let name = document.querySelector(".namee");
  let email1 = document.querySelector(".emaill");
  let mobile = document.querySelector(".mobilee");
  let message = document.querySelector(".messagee");
  let submit = document.querySelector(".sendd");
  let copyright = document.querySelector(".copyright");

  let body = document.querySelector("body");

  checkBoxlang.addEventListener("change", () => {
    if (checkBoxlang.checked) {
      translate("ar");
      body.classList.add("rtl");
      body.setAttribute("dir", "rtl");
      email.setAttribute("placeholder", "ادخل بريدك الإلكترونى");
      subscribe.setAttribute("value", "اشترك");
      submit.setAttribute("value", "ارسل");
      name.setAttribute("placeholder", "ادخل أسمك");
      email1.setAttribute("placeholder", "ادخل بريدك الالكترونى");
      mobile.setAttribute("placeholder", "ادخل رقم هاتفك");
      message.setAttribute("placeholder", "ادخل رسالتك");
      copyright.innerHTML = `تمت برمجتها بكل ال ❤ بواسطة
      <a href="https://github.com/Mohamed-Waled" target="_blank"
        >م : محمد وليد</a
      >.`;
    } else {
      translate("en");
      body.classList.remove("rtl");
      body.removeAttribute("dir", "rtl");
      email.setAttribute("placeholder", "Enter Your Email");
      subscribe.setAttribute("value", "Subscribe");
      submit.setAttribute("value", "Send");
      name.setAttribute("placeholder", "Your Name");
      email1.setAttribute("placeholder", "Your Email");
      mobile.setAttribute("placeholder", "Your Phone");
      message.setAttribute("placeholder", "Tell Us About Your Needs");
      copyright.innerHTML = `coded with ❤ by
      <a href="https://github.com/Mohamed-Waled" target="_blank"
        >Eng: mohamed waled</a
      >.`;
    }
  });

  checkBoxlang1.addEventListener("change", () => {
    if (checkBoxlang1.checked) {
      translate("ar");
      body.classList.add("rtl");
      body.setAttribute("dir", "rtl");
      email.setAttribute("placeholder", "ادخل بريدك الإلكترونى");
      subscribe.setAttribute("value", "اشترك");
      submit.setAttribute("value", "ارسل");
      name.setAttribute("placeholder", "ادخل أسمك");
      email1.setAttribute("placeholder", "ادخل بريدك الالكترونى");
      mobile.setAttribute("placeholder", "ادخل رقم هاتفك");
      message.setAttribute("placeholder", "ادخل رسالتك");
      copyright.innerHTML = `تمت برمجتها بكل ال ❤ بواسطة
      <a href="https://github.com/Mohamed-Waled" target="_blank"
        >م : محمد وليد</a
      >.`;
    } else {
      translate("en");
      body.classList.remove("rtl");
      body.removeAttribute("dir", "rtl");
      email.setAttribute("placeholder", "Enter Your Email");
      subscribe.setAttribute("value", "Subscribe");
      submit.setAttribute("value", "Send");
      name.setAttribute("placeholder", "Your Name");
      email1.setAttribute("placeholder", "Your Email");
      mobile.setAttribute("placeholder", "Your Phone");
      message.setAttribute("placeholder", "Tell Us About Your Needs");
      copyright.innerHTML = `coded with ❤ by
      <a href="https://github.com/Mohamed-Waled" target="_blank"
        >Eng: mohamed waled</a
      >.`;
    }
  });

  checkBoxlang2.addEventListener("change", () => {
    if (checkBoxlang2.checked) {
      translate("ar");
      body.classList.add("rtl");
      body.setAttribute("dir", "rtl");
      email.setAttribute("placeholder", "ادخل بريدك الإلكترونى");
      subscribe.setAttribute("value", "اشترك");
      submit.setAttribute("value", "ارسل");
      name.setAttribute("placeholder", "ادخل أسمك");
      email1.setAttribute("placeholder", "ادخل بريدك الالكترونى");
      mobile.setAttribute("placeholder", "ادخل رقم هاتفك");
      message.setAttribute("placeholder", "ادخل رسالتك");
      copyright.innerHTML = `تمت برمجتها بكل ال ❤ بواسطة
      <a href="https://github.com/Mohamed-Waled" target="_blank"
        >م : محمد وليد</a
      >.`;
    } else {
      translate("en");
      body.classList.remove("rtl");
      body.removeAttribute("dir", "rtl");
      email.setAttribute("placeholder", "Enter Your Email");
      subscribe.setAttribute("value", "Subscribe");
      submit.setAttribute("value", "Send");
      name.setAttribute("placeholder", "Your Name");
      email1.setAttribute("placeholder", "Your Email");
      mobile.setAttribute("placeholder", "Your Phone");
      message.setAttribute("placeholder", "Tell Us About Your Needs");
      copyright.innerHTML = `coded with ❤ by
      <a href="https://github.com/Mohamed-Waled" target="_blank"
        >Eng: mohamed waled</a
      >.`;
    }
  });
}

// Is Arabic?
function addLanguagetoLocalStorage() {
  let checkBoxlang = document.querySelector(".checkboxlang");
  let checkBoxlang1 = document.querySelector(".checkboxlang1");
  let checkBoxlang2 = document.querySelector(".checkboxlang2");

  let arabic = false;

  checkBoxlang.addEventListener("change", () => {
    if (checkBoxlang.checked) {
      arabic = true;
      window.localStorage.setItem("isArabic?", arabic);
    } else {
      arabic = false;
      window.localStorage.setItem("isArabic?", arabic);
    }
  });

  checkBoxlang1.addEventListener("change", () => {
    if (checkBoxlang1.checked) {
      arabic = true;
      window.localStorage.setItem("isArabic?", arabic);
    } else {
      arabic = false;
      window.localStorage.setItem("isArabic?", arabic);
    }
  });

  checkBoxlang2.addEventListener("change", () => {
    if (checkBoxlang2.checked) {
      arabic = true;
      window.localStorage.setItem("isArabic?", arabic);
    } else {
      arabic = false;
      window.localStorage.setItem("isArabic?", arabic);
    }
  });
}

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
    // Apply theme state immediately
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
      addtoLocalStorage();
      onLoad();
    }
    
    // Language switcher elements
    const langElements = document.querySelector(".checkboxlang") || 
                       document.querySelector(".checkboxlang1") || 
                       document.querySelector(".checkboxlang2");
    if (langElements) {
      changeLanguagesButton();
      addLanguagetoLocalStorage();
      onLoadLanguages();
    }
    
    // Set up theme observer
    setupThemeObserver();
    
  } catch (error) {
    console.log("Error initializing JavaScript functionality:", error);
  }
});

// Add event listener for page load
window.addEventListener('load', function() {
  applyThemeState();
});

// Add event listener for page visibility changes
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    applyThemeState();
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
