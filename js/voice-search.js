document.addEventListener('DOMContentLoaded', () => {
    // Get required elements
    const voiceSearchBtn = document.getElementById('voice-search');
    const searchInput = document.getElementById('search-input');

    // Exit early if voice search button or search input doesn't exist on this page
    if (!voiceSearchBtn || !searchInput) {
        return;
    }

    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceSearchBtn.style.display = 'none';
        return;
    }

    // Utility function to normalize Arabic text
    function normalizeArabicText(text) {
        if (!text) return '';
        
        // Return original text if it's not a string
        if (typeof text !== 'string') return text;
        
        // Arabic character normalization mapping
        const normalizationMap = {
            // Alif forms
            'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
            // Hamza forms
            'ؤ': 'و', 'ئ': 'ي',
            // Taa marbuta and haa
            'ة': 'ه',
            // Yaa and Alif Maqsura
            'ى': 'ي',
            // Kaf and keheh
            'ك': 'ك', 'ڪ': 'ك',
            // Remove diacritics (tashkeel)
            'َ': '', 'ُ': '', 'ِ': '', 'ّ': '', 'ً': '', 'ٌ': '', 'ٍ': '', 'ْ': ''
        };
        
        // Replace characters according to the mapping
        return text.split('').map(char => normalizationMap[char] || char).join('');
    }

    // Function to normalize search text
    function normalizeSearchText(text) {
        if (!text) return '';
        
        // First normalize Arabic characters
        let normalizedText = normalizeArabicText(text);
        
        // Convert to lowercase for case-insensitive matching
        normalizedText = normalizedText.toLowerCase();
        
        // Remove extra spaces
        normalizedText = normalizedText.replace(/\s+/g, ' ').trim();
        
        return normalizedText;
    }

    // Make normalization functions globally available
    window.normalizeArabicText = normalizeArabicText;
    window.normalizeSearchText = normalizeSearchText;

    // Bad words lists (these are placeholder examples - add more as needed)
    const badWordsEN = [
        'fuckoff', 'fuck', 'fucker', 'motherfucker', 'bitch', 'dick'
        // Add more English bad words here
    ];

    const badWordsAR = [
         'ام', 'امك', 'كس', 'متناك', 'متناكه', 'متناكة'
        // Add more Arabic bad words here
    ];

    // Function to check for bad words
    function containsBadWords(text) {
        if (!text) return false;

        // Get current language from localStorage or fallback to document.dir
        const currentLang = getCurrentLanguage();
        const badWordsList = currentLang === 'ar' ? badWordsAR : badWordsEN;
        const textLower = text.toLowerCase();

        // Check if any bad word is contained in the text
        return badWordsList.some(word => textLower.includes(word.toLowerCase()));
    }

    // Function to filter out bad words (replace with asterisks)
    function filterBadWords(text) {
        if (!text) return text;

        // Get current language from localStorage or fallback to document.dir
        const currentLang = getCurrentLanguage();
        const badWordsList = currentLang === 'ar' ? badWordsAR : badWordsEN;
        let filteredText = text;

        badWordsList.forEach(word => {
            const regex = new RegExp(word, 'gi');
            const asterisks = '*'.repeat(word.length);
            filteredText = filteredText.replace(regex, asterisks);
        });

        return filteredText;
    }

    // Function to remove duplicate consecutive words
    function removeDuplicateWords(text) {
        if (!text) return text;
        
        // Split text into words
        const words = text.split(/\s+/);
        const result = [];
        
        // Process each word
        for (let i = 0; i < words.length; i++) {
            // Add word if it's different from the previous one
            if (i === 0 || words[i].toLowerCase() !== words[i-1].toLowerCase()) {
                result.push(words[i]);
            }
        }
        
        // Join words back into a string
        return result.join(' ');
    }

    // Helper function to get the current language from localStorage or fallback
    function getCurrentLanguage() {
        // First check localStorage for the selected language
        const storedLanguage = localStorage.getItem('selectedLanguage');
        if (storedLanguage) {
            return storedLanguage; // 'ar' or 'en'
        }
        
        // If not in localStorage, check document direction
        return document.dir === 'rtl' ? 'ar' : 'en';
    }

    // Voice search state
    let isListening = false;
    let recognition = null;
    let isProcessing = false;
    let clickTimeout = null;
    let lastClickTime = 0; // Track last click time

    // Initialize speech recognition
    function initializeRecognition() {
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {
                console.log('Recognition already stopped');
            }
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = false;
        recognition.interimResults = true;

        // Set up recognition event handlers
        recognition.onresult = handleRecognitionResult;
        recognition.onend = handleRecognitionEnd;
        recognition.onerror = handleRecognitionError;
    }

    // Function to force reset voice search
    function forceResetVoiceSearch() {
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {
                console.log('Force stop recognition');
            }
        }
        resetVoiceSearch();
    }

    // Function to handle recognition results
    function handleRecognitionResult(event) {
        try {
            // Get most recent result
            const lastResultIndex = event.results.length - 1;
            let words = event.results[lastResultIndex][0].transcript;

            // Remove duplicate consecutive words
            words = removeDuplicateWords(words);

            // Check for bad words
            if (containsBadWords(words)) {
                // Filter out bad words or use a general message
                const currentLang = getCurrentLanguage();
                const warningText = currentLang === 'ar' ?
                    'اعد المحاولة' :
                    'Try again';

                // Either filter the content or show warning
                searchInput.value = filterBadWords(words);

                // Optionally display a warning message
                console.warn('Bad words detected and filtered');
            } else {
                // Update the search input with processed spoken words
                searchInput.value = words;
            }

            // Trigger search only on final results to avoid excessive searches
            if (event.results[lastResultIndex].isFinal) {
                // Only trigger search if content is appropriate
                if (!containsBadWords(words)) {
                    // Normalize the search text
                    const normalizedWords = normalizeSearchText(words);
                    searchInput.value = normalizedWords;
                    
                    // Trigger search with a slight delay to ensure value is set
                    setTimeout(() => {
                        // Create and dispatch both input and change events
                        const inputEvent = new Event('input', {
                            bubbles: true,
                            cancelable: true,
                        });
                        const changeEvent = new Event('change', {
                            bubbles: true,
                            cancelable: true,
                        });
                        searchInput.dispatchEvent(inputEvent);
                        searchInput.dispatchEvent(changeEvent);
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error processing speech results:', error);
            resetVoiceSearch();
        }
    }

    // Function to handle recognition end
    function handleRecognitionEnd() {
        resetVoiceSearch();
        
        // Trigger search if there's text in the input
        if (searchInput && searchInput.value) {
            // Normalize the search text
            const normalizedValue = normalizeSearchText(searchInput.value);
            searchInput.value = normalizedValue;
            
            // Create and dispatch both input and change events
            const inputEvent = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            const changeEvent = new Event('change', {
                bubbles: true,
                cancelable: true,
            });
            searchInput.dispatchEvent(inputEvent);
            searchInput.dispatchEvent(changeEvent);
        }
    }

    // Function to handle recognition errors
    function handleRecognitionError(event) {
        console.error('Speech recognition error:', event.error);
        forceResetVoiceSearch();
    }

    // Function to handle voice start
    function handleVoiceStart(event) {
        // Prevent default behavior for touch events
        if (event.type === 'touchstart') {
            event.preventDefault();
        }

        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - lastClickTime;
        lastClickTime = currentTime;

        // If double click detected (less than 300ms between clicks)
        if (timeSinceLastClick < 300) {
            forceResetVoiceSearch();
            return;
        }

        // Prevent rapid clicks
        if (isProcessing) {
            return;
        }
        
        try {
            isProcessing = true;

            // If already listening, stop first
            if (isListening) {
                recognition.stop();
                isProcessing = false;
                return;
            }

            // Clear any existing timeout
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }

            // Initialize new recognition instance
            initializeRecognition();
            
            // Update language before starting recognition
            updateRecognitionLanguage();
            
            recognition.start();
            isListening = true;
            voiceSearchBtn.classList.add('listening');
            searchInput.classList.add('voice-listening');

            // Vibrate on mobile devices when recording starts
            if ('vibrate' in navigator) {
                // Short vibration (50ms) to indicate recording start
                navigator.vibrate(50);
            }

            // Use appropriate language for placeholder
            const currentLang = getCurrentLanguage();
            const listeningText = currentLang === 'ar' ? 'جاري الاستماع...' : 'Listening...';
            searchInput.placeholder = listeningText;

            voiceSearchBtn.innerHTML = '<i class="fas fa-stop"></i>';

            // Reset processing flag after a short delay
            setTimeout(() => {
                isProcessing = false;
            }, 300);
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            forceResetVoiceSearch();
            isProcessing = false;
        }
    }

    // Function to handle voice stop
    function handleVoiceStop(event) {
        // Prevent default behavior for touch events
        if (event.type === 'touchend' || event.type === 'touchcancel') {
            event.preventDefault();
        }
        
        if (isListening) {
            try {
                recognition.stop();
                // Vibrate on mobile devices when recording stops
                if ('vibrate' in navigator) {
                    // Two short vibrations (30ms each) to indicate recording stop
                    navigator.vibrate([30, 50, 30]);
                }
            } catch (error) {
                console.error('Error stopping recognition:', error);
                forceResetVoiceSearch();
            }
        }
    }

    // Helper function to reset voice search state
    function resetVoiceSearch() {
        isListening = false;
        isProcessing = false;
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
        if (voiceSearchBtn) {
            voiceSearchBtn.classList.remove('listening');
            voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
        if (searchInput) {
            searchInput.classList.remove('voice-listening');
            const currentLang = getCurrentLanguage();
            const placeholder = currentLang === 'ar' ? 'بحث في الإنجازات...' : 'Search achievements...';
            searchInput.placeholder = placeholder;
        }
    }

    // Initialize recognition on page load
    initializeRecognition();

    // Handle voice button click with debounce
    voiceSearchBtn.addEventListener('mousedown', (event) => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
        clickTimeout = setTimeout(() => {
            handleVoiceStart(event);
        }, 50);
    });
    
    voiceSearchBtn.addEventListener('touchstart', (event) => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
        clickTimeout = setTimeout(() => {
            handleVoiceStart(event);
        }, 50);
    });
    
    // Add mouseup/touchend event listeners to stop recording
    voiceSearchBtn.addEventListener('mouseup', handleVoiceStop);
    voiceSearchBtn.addEventListener('touchend', handleVoiceStop);
    
    // Add mouseleave/touchcancel event listeners to stop recording if interaction ends
    voiceSearchBtn.addEventListener('mouseleave', handleVoiceStop);
    voiceSearchBtn.addEventListener('touchcancel', handleVoiceStop);

    // Add safety timeout to force reset if stuck
    setInterval(() => {
        if (isListening && !isProcessing) {
            const currentTime = Date.now();
            if (currentTime - lastClickTime > 10000) { // Force reset if stuck for more than 10 seconds
                forceResetVoiceSearch();
            }
        }
    }, 1000);

    // Set language based on current language setting
    function updateRecognitionLanguage() {
        const currentLang = getCurrentLanguage();
        recognition.lang = currentLang === 'ar' ? 'ar-EG' : 'en-US';
        console.log(`Speech recognition language set to: ${recognition.lang}`);
    }
    
    // Set initial language
    updateRecognitionLanguage();

    // Update recognition language when language changes
    document.addEventListener('langChange', (e) => {
        updateRecognitionLanguage();
    });
    
    // Also monitor language toggle changes
    const langToggle = document.getElementById('chklang');
    if (langToggle) {
        langToggle.addEventListener('change', () => {
            // Small delay to allow language change to complete
            setTimeout(updateRecognitionLanguage, 100);
        });
    }

    // Store original placeholder
    searchInput.dataset.originalPlaceholder = searchInput.placeholder || '';
}); 