// Settings Loader - Ensures settings are applied before any content is shown
(function() {
    // Create a style element to hide content until settings are loaded
    const style = document.createElement('style');
    style.textContent = `
        .settings-loading {
            visibility: hidden !important;
        }
    `;
    document.head.appendChild(style);
    document.documentElement.classList.add('settings-loading');

    // Function to load and apply settings
    function loadSettings() {
        // Get saved settings
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
        const isDark = localStorage.getItem('isDark?') === 'true';

        // Apply language settings
        document.documentElement.lang = savedLanguage;
        document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
        document.body.classList.toggle('rtl', savedLanguage === 'ar');

        // Apply theme settings
        if (isDark) {
            document.documentElement.classList.add('darkMode');
            document.body.classList.add('dark-mode');
        }

        // Remove loading class to show content
        document.documentElement.classList.remove('settings-loading');

        // Dispatch event that settings are loaded
        window.dispatchEvent(new CustomEvent('settingsLoaded', {
            detail: {
                language: savedLanguage,
                isDark: isDark
            }
        }));
    }

    // Load settings as early as possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSettings);
    } else {
        loadSettings();
    }
})(); 