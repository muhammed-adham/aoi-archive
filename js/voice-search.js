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

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = true;

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

    // Handle voice button click
    voiceSearchBtn.addEventListener('mousedown', handleVoiceStart);
    voiceSearchBtn.addEventListener('touchstart', handleVoiceStart);
    
    // Add mouseup/touchend event listeners to stop recording
    voiceSearchBtn.addEventListener('mouseup', handleVoiceStop);
    voiceSearchBtn.addEventListener('touchend', handleVoiceStop);
    
    // Add mouseleave/touchcancel event listeners to stop recording if interaction ends
    voiceSearchBtn.addEventListener('mouseleave', handleVoiceStop);
    voiceSearchBtn.addEventListener('touchcancel', handleVoiceStop);

    // Function to handle voice start
    function handleVoiceStart(event) {
        // Prevent default behavior for touch events
        if (event.type === 'touchstart') {
            event.preventDefault();
        }
        
        try {
            // Update language before starting recognition
            updateRecognitionLanguage();
            
            recognition.start();
            isListening = true;
            voiceSearchBtn.classList.add('listening');
            searchInput.classList.add('voice-listening');

            // Use appropriate language for placeholder
            const currentLang = getCurrentLanguage();
            const listeningText = currentLang === 'ar' ? 'جاري الاستماع...' : 'Listening...';
            searchInput.placeholder = listeningText;

            voiceSearchBtn.innerHTML = '<i class="fas fa-stop"></i>';
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            resetVoiceSearch();
        }
    }

    // Function to handle voice stop
    function handleVoiceStop(event) {
        // Prevent default behavior for touch events
        if (event.type === 'touchend' || event.type === 'touchcancel') {
            event.preventDefault();
        }
        
        if (isListening) {
            recognition.stop();
        }
    }

    // Handle recognition results
    recognition.onresult = (event) => {
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
                    // Trigger search
                    const inputEvent = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    searchInput.dispatchEvent(inputEvent);
                }
            }
        } catch (error) {
            console.error('Error processing speech results:', error);
        }
    };

    // Handle recognition end
    recognition.onend = () => {
        resetVoiceSearch();
        
        // Trigger search if there's text in the input
        if (searchInput && searchInput.value) {
            const inputEvent = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            searchInput.dispatchEvent(inputEvent);
        }
    };

    // Handle recognition errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        resetVoiceSearch();
    };

    // Helper function to reset voice search state
    function resetVoiceSearch() {
        isListening = false;
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
}); 