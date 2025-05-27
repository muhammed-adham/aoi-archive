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
        
        // Enhanced recognition configuration
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3; // Get multiple recognition alternatives

        // Set up recognition event handlers
        recognition.onresult = handleRecognitionResult;
        recognition.onend = handleRecognitionEnd;
        recognition.onerror = handleRecognitionError;
        recognition.onaudiostart = handleAudioStart;
        recognition.onaudioend = handleAudioEnd;
        recognition.onspeechstart = handleSpeechStart;
        recognition.onspeechend = handleSpeechEnd;
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
            const result = event.results[lastResultIndex];
            
            // Get the best result and alternatives
            let bestResult = result[0].transcript;
            let confidence = result[0].confidence;
            
            // Debug log the recognition result
            console.log('Recognition result:', {
                transcript: bestResult,
                confidence: confidence,
                isFinal: result.isFinal
            });
            
            // If confidence is low, try alternatives
            if (confidence < 0.7 && result.length > 1) {
                // Try to find a better match from alternatives
                for (let i = 1; i < result.length; i++) {
                    if (result[i].confidence > confidence) {
                        bestResult = result[i].transcript;
                        confidence = result[i].confidence;
                        console.log('Using alternative result:', {
                            transcript: bestResult,
                            confidence: confidence
                        });
                    }
                }
            }

            // Remove duplicate consecutive words
            let words = removeDuplicateWords(bestResult);
            console.log('After removing duplicates:', words);

            // Check for bad words
            if (containsBadWords(words)) {
                // Filter out bad words or use a general message
                const currentLang = getCurrentLanguage();
                const warningText = currentLang === 'ar' ?
                    'اعد المحاولة' :
                    'Try again';

                // Either filter the content or show warning
                searchInput.value = filterBadWords(words);
                console.log('Bad words filtered:', searchInput.value);

                // Optionally display a warning message
                console.warn('Bad words detected and filtered');
            } else {
                // Update the search input with processed spoken words
                searchInput.value = words;
                console.log('Updated search input:', searchInput.value);
            }

            // Trigger search only on final results to avoid excessive searches
            if (result.isFinal) {
                // Only trigger search if content is appropriate
                if (!containsBadWords(words)) {
                    // Normalize the search text
                    const normalizedWords = normalizeSearchText(words);
                    console.log('Normalized words:', normalizedWords);
                    
                    // Update the input value
                    searchInput.value = normalizedWords;
                    
                    // Show confidence level in console for debugging
                    console.log(`Recognition confidence: ${confidence}`);
                    
                    // Show loading state
                    if (typeof showLoadingState === 'function') {
                        showLoadingState();
                    }
                    
                    // Create a new input event with all required properties
                    const inputEvent = new InputEvent('input', {
                        bubbles: true,
                        cancelable: true,
                        composed: true,
                        data: normalizedWords,
                        inputType: 'insertText',
                        isComposing: false,
                        detail: {
                            inputType: 'insertText',
                            data: normalizedWords,
                            isComposing: false
                        }
                    });
                    
                    // Dispatch the input event
                    searchInput.dispatchEvent(inputEvent);
                    console.log('Dispatched input event with:', normalizedWords);
                    
                    // Use the same delay as manual typing (300ms)
                    setTimeout(() => {
                        // Force a filter update
                        if (typeof filterArticles === 'function') {
                            console.log('Calling filterArticles()');
                            filterArticles();
                        }
                        
                        // Hide loading state
                        if (typeof hideLoadingState === 'function') {
                            hideLoadingState();
                        }
                    }, 300);
                }
            }
        } catch (error) {
            console.error('Error processing speech results:', error);
            resetVoiceSearch();
        }
    }

    // Function to handle recognition end
    function handleRecognitionEnd() {
        console.log('Recognition ended');
        resetVoiceSearch();
        
        // Trigger search if there's text in the input
        if (searchInput && searchInput.value) {
            console.log('Search input has value:', searchInput.value);
            
            // Normalize the search text
            const normalizedValue = normalizeSearchText(searchInput.value);
            console.log('Normalized value:', normalizedValue);
            
            // Update the input value
            searchInput.value = normalizedValue;
            
            // Show loading state
            if (typeof showLoadingState === 'function') {
                showLoadingState();
            }
            
            // Create a new input event with all required properties
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                composed: true,
                data: normalizedValue,
                inputType: 'insertText',
                isComposing: false,
                detail: {
                    inputType: 'insertText',
                    data: normalizedValue,
                    isComposing: false
                }
            });
            
            // Dispatch the input event
            searchInput.dispatchEvent(inputEvent);
            console.log('Dispatched final input event with:', normalizedValue);
            
            // Use the same delay as manual typing (300ms)
            setTimeout(() => {
                // Force a filter update
                if (typeof filterArticles === 'function') {
                    console.log('Calling final filterArticles()');
                    filterArticles();
                }
                
                // Hide loading state
                if (typeof hideLoadingState === 'function') {
                    hideLoadingState();
                }
            }, 300);
        }
    }

    // Function to handle recognition errors
    function handleRecognitionError(event) {
        console.error('Speech recognition error:', event.error);
        
        // Provide user feedback based on error type
        const currentLang = getCurrentLanguage();
        let errorMessage = '';
        
        switch(event.error) {
            case 'no-speech':
                errorMessage = currentLang === 'ar' ? 
                    'لم يتم اكتشاف أي كلام' : 
                    'No speech was detected';
                break;
            case 'audio-capture':
                errorMessage = currentLang === 'ar' ? 
                    'لم يتم العثور على ميكروفون' : 
                    'No microphone was found';
                break;
            case 'not-allowed':
                errorMessage = currentLang === 'ar' ? 
                    'يرجى السماح بالوصول إلى الميكروفون' : 
                    'Please allow microphone access';
                break;
            case 'network':
                errorMessage = currentLang === 'ar' ? 
                    'خطأ في الاتصال بالشبكة' : 
                    'Network error occurred';
                break;
            default:
                errorMessage = currentLang === 'ar' ? 
                    'حدث خطأ في التعرف على الصوت' : 
                    'Speech recognition error occurred';
        }
        
        // Show error message in search input
        if (searchInput) {
            searchInput.value = '';
            searchInput.placeholder = errorMessage;
            setTimeout(() => {
                const currentLang = getCurrentLanguage();
                searchInput.placeholder = currentLang === 'ar' ? 
                    'بحث في الإنجازات...' : 
                    'Search achievements...';
            }, 3000);
        }
        
        forceResetVoiceSearch();
    }

    // Audio event handlers
    function handleAudioStart() {
        console.log('Audio capturing started');
    }

    function handleAudioEnd() {
        console.log('Audio capturing ended');
    }

    function handleSpeechStart() {
        console.log('Speech detected');
    }

    function handleSpeechEnd() {
        console.log('Speech ended');
    }

    // Function to provide feedback when recording starts/stops
    function provideFeedback(type) {
        // Try vibration first
        if ('vibrate' in navigator) {
            if (type === 'start') {
                navigator.vibrate(50);
            } else if (type === 'stop') {
                navigator.vibrate([30, 50, 30]);
            }
        }

        // Add visual feedback for all devices
        const voiceSearchBtn = document.getElementById('voice-search');
        if (voiceSearchBtn) {
            // Add a temporary class for visual feedback
            voiceSearchBtn.classList.add('feedback');
            setTimeout(() => {
                voiceSearchBtn.classList.remove('feedback');
            }, 200);
        }
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

            // Provide feedback for recording start
            provideFeedback('start');

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
                // Provide feedback for recording stop
                provideFeedback('stop');
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
        // Use Egyptian Arabic for better accuracy with Egyptian dialect
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