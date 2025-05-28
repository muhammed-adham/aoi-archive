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

    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Check if running on HTTPS
    const isHTTPS = window.location.protocol === 'https:';

    // Check if running on Vercel
    const isVercel = window.location.hostname.includes('vercel.app');

    console.log('Environment checks:', {
        isIOS,
        isHTTPS,
        isVercel,
        hostname: window.location.hostname,
        protocol: window.location.protocol
    });

    // Debug info for iOS troubleshooting
    console.log('Voice search debug info:', {
        isIOS: isIOS,
        hasWebkitSpeechRecognition: 'webkitSpeechRecognition' in window,
        hasSpeechRecognition: 'SpeechRecognition' in window,
        isHTTPS: isHTTPS,
        userAgent: navigator.userAgent,
        hostname: window.location.hostname
    });

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

        // Remove extra spaces and special characters
        normalizedText = normalizedText
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ')  // Clean up any spaces left after removing punctuation
            .trim();

        // Debug log the normalization steps
        console.log('Text normalization steps:', {
            original: text,
            afterArabic: normalizeArabicText(text),
            afterLowercase: normalizedText.toLowerCase(),
            final: normalizedText
        });

        return normalizedText;
    }

    // Make normalization functions globally available
    window.normalizeArabicText = normalizeArabicText;
    window.normalizeSearchText = normalizeSearchText;

    // Bad words lists (these are placeholder examples - add more as needed)
    const badWordsEN = [
        "fuck", "fucker", "fucking", "fuckoff", "motherfucker", "bitch", "sonofabitch",
        "ass", "asshole", "bastard", "shit", "bullshit", "dick", "dickhead", "pussy",
        "cunt", "slut", "whore", "jerk", "prick", "nigger", "nigga", "retard", "fag",
        "faggot", "crap", "twat", "damn", "goddamn", "cock", "balls", "nutsack", "shithead"
    ];

    const badWordsAR = [
        "كس", "طيز", "زب", "متناك", "متناكة", "متناكه", "نيك", "انكح", "قحب", "قحبة", "قواد",
        "شرموطة", "شرموطه", "خرا", "عرص", "منيك", "يلعن", "ابن الكلب", "كلب", "حيوان", "زبالة",
        "نصبة", "تفو", "احا", "منيوك", "خنيث", "مخنث", "وسخ", "وسخة", "خنزير", "مغفل", "غبي"
    ];

    // Helper function to escape regex special characters
    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Function to check for bad words
    function containsBadWords(text) {
        if (!text) return false;

        // Get current language from localStorage or fallback to document.dir
        const currentLang = getCurrentLanguage();
        const badWordsList = currentLang === 'ar' ? badWordsAR : badWordsEN;
        const textLower = text.toLowerCase();

        // Check if any bad word is contained in the text
        return badWordsList.some(word => new RegExp(`\\b${escapeRegex(word)}\\b`, 'i').test(text));
    }

    // Function to filter out bad words (replace with asterisks)
    function filterBadWords(text) {
        if (!text) return text;

        // Get current language from localStorage or fallback to document.dir
        const currentLang = getCurrentLanguage();
        const badWordsList = currentLang === 'ar' ? badWordsAR : badWordsEN;
        let filteredText = text;

        badWordsList.forEach(word => {
            const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
            filteredText = filteredText.replace(regex, ''); // remove word completely
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
            if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
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
    let holdTimer = null;
    let isHolding = false;
    let holdStartTime = 0;
    let minHoldTime = 200; // Minimum hold time in milliseconds

    // Updated recognition initialization for better iOS compatibility
    function initializeRecognition() {
        if (recognition) {
            try {
                recognition.stop();
                recognition = null;
            } catch (e) {
                console.log('Previous recognition cleanup');
            }
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported');
            return;
        }

        recognition = new SpeechRecognition();

        // Base configuration - more suitable for hold-to-record
        recognition.continuous = true; // Keep listening while held
        recognition.interimResults = true; // Show results as they come
        recognition.maxAlternatives = 1;

        // iOS-specific additional settings
        if (isIOS) {
            // More conservative settings for iOS
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            // Check for HTTPS requirement
            if (!isHTTPS && !window.location.hostname.includes('localhost')) {
                console.error('iOS requires HTTPS for speech recognition');
                const currentLang = getCurrentLanguage();
                const errorMsg = currentLang === 'ar' ?
                    'يرجى استخدام HTTPS للبحث الصوتي' :
                    'HTTPS required for voice search on iOS';

                if (searchInput) {
                    searchInput.placeholder = errorMsg;
                }
                return;
            }
        } else {
            // Non-iOS devices can use more advanced features
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 3;
        }

        // Event handlers
        recognition.onstart = () => {
            console.log('Recognition started');
            isListening = true;
        };

        recognition.onresult = handleRecognitionResult;
        recognition.onend = handleRecognitionEnd;
        recognition.onerror = handleRecognitionError;

        // Additional iOS-specific handlers
        if (isIOS) {
            recognition.onspeechstart = () => {
                console.log('iOS: Speech detected');
            };

            recognition.onspeechend = () => {
                console.log('iOS: Speech ended');
            };

            recognition.onaudiostart = () => {
                console.log('iOS: Audio started');
            };

            recognition.onaudioend = () => {
                console.log('iOS: Audio ended');
            };
        }
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
            let interimTranscript = '';
    
            // Collect interim transcripts
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                interimTranscript += event.results[i][0].transcript + ' ';
            }
    
            // Trim and process
            interimTranscript = interimTranscript.trim();
    
            // Remove duplicate consecutive words
            let words = removeDuplicateWords(interimTranscript);
    
            // Check for bad words
            if (containsBadWords(words)) {
                words = filterBadWords(words);
                console.warn('Bad words detected and filtered');
            }
    
            // Update the input in real time
            searchInput.value = words;
    
            console.log('Live speech update:', {
                transcript: words,
                isFinal: event.results[event.results.length - 1].isFinal
            });
    
            // If it's the final result, normalize and process
            if (event.results[event.results.length - 1].isFinal) {
                processVoiceSearchResult(words);
            }
    
        } catch (error) {
            console.error('Error processing speech results:', error);
            resetVoiceSearch();
        }
    }
    

    // Function to process voice search results
    function processVoiceSearchResult(words) {
        // Only trigger search if content is appropriate
        if (!containsBadWords(words) && words.trim()) {
            // Normalize the search text
            const normalizedWords = normalizeSearchText(words);
            console.log('Normalized words:', normalizedWords);

            // Update the input value with normalized text
            searchInput.value = normalizedWords;

            // Show loading state
            if (typeof showLoadingState === 'function') {
                showLoadingState();
            }

            // Create and dispatch multiple events to ensure mobile compatibility
            const events = [
                new Event('focus', { bubbles: true }),
                new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    data: normalizedWords,
                    inputType: 'insertText',
                    isComposing: false
                }),
                new Event('change', { bubbles: true })
            ];

            // Dispatch events in sequence
            events.forEach(event => {
                searchInput.dispatchEvent(event);
                console.log('Dispatched event:', event.type, 'with value:', normalizedWords);
            });

            // Use the same delay as manual typing (300ms)
            setTimeout(() => {
                // Force a filter update
                if (typeof filterArticles === 'function') {
                    console.log('Calling filterArticles() with value:', normalizedWords);
                    filterArticles();
                }

                // Hide loading state
                if (typeof hideLoadingState === 'function') {
                    hideLoadingState();
                }
            }, 300);
        }
    }

    // Function to handle recognition end
    function handleRecognitionEnd() {
        console.log('Recognition ended, isIOS:', isIOS, 'isHolding:', isHolding);

        // On iOS, ensure the search is triggered if we have content
        if (isIOS && searchInput && searchInput.value) {
            console.log('iOS: Triggering final search with value:', searchInput.value);
            processVoiceSearchResult(searchInput.value);
        }

        // If we're not holding anymore, reset everything
        if (!isHolding) {
            resetVoiceSearch();
        }
    }

    // Enhanced error handling for iOS
    function handleRecognitionError(event) {
        console.error('Speech recognition error:', {
            error: event.error,
            message: event.message,
            isIOS,
            isHTTPS,
            userAgent: navigator.userAgent
        });

        const currentLang = getCurrentLanguage();
        let errorMessage = '';

        switch (event.error) {
            case 'no-speech':
                errorMessage = currentLang === 'ar' ?
                    'لم يتم اكتشاف أي كلام' :
                    'No speech detected';
                break;
            case 'audio-capture':
                errorMessage = currentLang === 'ar' ?
                    'لا يمكن الوصول للميكروفون' :
                    'Cannot access microphone';
                break;
            case 'not-allowed':
                errorMessage = currentLang === 'ar' ?
                    'يرجى السماح بالوصول للميكروفون' :
                    'Please allow microphone access';
                break;
            case 'network':
                errorMessage = currentLang === 'ar' ?
                    'خطأ في الشبكة' :
                    'Network error';
                break;
            case 'service-not-allowed':
                errorMessage = currentLang === 'ar' ?
                    'الخدمة غير متاحة' :
                    'Service not available';
                break;
            case 'start-failed':
                errorMessage = currentLang === 'ar' ?
                    'فشل في بدء التسجيل' :
                    'Failed to start recording';
                break;
            default:
                errorMessage = currentLang === 'ar' ?
                    'حدث خطأ، حاول مرة أخرى' :
                    'Error occurred, try again';
        }

        // Show error in placeholder
        if (searchInput) {
            searchInput.value = '';
            searchInput.placeholder = errorMessage;
            setTimeout(() => {
                const currentLang = getCurrentLanguage();
                searchInput.placeholder = currentLang === 'ar' ?
                    'لم يتم اكتشاف أي كلام' :
                    'No speech detected';
            }, 3000);
        }

        forceResetVoiceSearch();
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

    // Function to start voice recognition
    function startVoiceRecognition() {
        try {
            // Initialize recognition with iOS-specific settings
            initializeRecognition();
            updateRecognitionLanguage();

            if (!recognition) {
                throw new Error('Failed to initialize recognition');
            }

            // Start recognition
            recognition.start();
            isListening = true;

            // Update UI
            voiceSearchBtn.classList.add('listening');
            searchInput.classList.add('voice-listening');
            voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';

            // voiceSearchBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';

            // Provide feedback
            provideFeedback('start');

            // Update placeholder
            const currentLang = getCurrentLanguage();
            const listeningText = currentLang === 'ar' ? 'جاري الاستماع... (اتركه للتوقف)' : 'Listening... (release to stop)';
            searchInput.placeholder = listeningText;

            console.log('Voice recognition started successfully');

        } catch (error) {
            console.error('Error starting voice recognition:', error);
            handleRecognitionError({ error: 'start-failed' });
        }
    }

    // Function to stop voice recognition
    function stopVoiceRecognition() {
        try {
            if (recognition && isListening) {
                recognition.stop();
                console.log('Voice recognition stopped by user');

                // Process final result if we have content
                if (searchInput && searchInput.value) {
                    processVoiceSearchResult(searchInput.value);
                }
            }
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
        }

        resetVoiceSearch();
    }

    // Function to handle hold start
    function handleHoldStart(event) {
        event.preventDefault();
        event.stopPropagation();

        // Prevent if already processing
        if (isProcessing || isListening) {
            console.log('Already processing or listening, ignoring hold start');
            return;
        }

        console.log('Hold start detected');
        holdStartTime = Date.now();
        isHolding = true;

        // Start hold timer
        holdTimer = setTimeout(() => {
            if (isHolding) {
                console.log('Hold time reached, starting voice recognition');
                isProcessing = true;
                startVoiceRecognition();
            }
        }, minHoldTime);

        // Visual feedback for hold start
        voiceSearchBtn.classList.add('holding');
    }

    // Function to handle hold end
    function handleHoldEnd(event) {
        event.preventDefault();
        event.stopPropagation();

        console.log('Hold end detected');
        const holdDuration = Date.now() - holdStartTime;

        // Clear hold timer
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }

        // Remove visual feedback
        voiceSearchBtn.classList.remove('holding');

        // If we were holding for sufficient time and listening, stop recognition
        if (isHolding && holdDuration >= minHoldTime && isListening) {
            console.log('Stopping voice recognition after hold end');
            stopVoiceRecognition();
        } else if (isHolding && holdDuration < minHoldTime) {
            console.log('Hold too short, ignoring');
        }

        isHolding = false;
        isProcessing = false;
    }

    // Helper function to reset voice search state
    function resetVoiceSearch() {
        isListening = false;
        isProcessing = false;
        isHolding = false;

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }

        if (voiceSearchBtn) {
            voiceSearchBtn.classList.remove('listening', 'holding');
            voiceSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }

        if (searchInput) {
            searchInput.classList.remove('voice-listening');
            const currentLang = getCurrentLanguage();
            const placeholder = currentLang === 'ar' ? 'اضغط مع الاستمرار للبحث الصوتي...' : 'Hold to voice search...';
            searchInput.placeholder = placeholder;
        }

        // Provide stop feedback
        provideFeedback('stop');
    }

    // Set language based on current language setting
    function updateRecognitionLanguage() {
        if (!recognition) return;

        const currentLang = getCurrentLanguage();
        // Use Egyptian Arabic for better accuracy with Egyptian dialect
        recognition.lang = currentLang === 'ar' ? 'ar-EG' : 'en-US';
        console.log(`Speech recognition language set to: ${recognition.lang}`);
    }

    // Initialize recognition on page load
    initializeRecognition();

    // Event handling for hold-to-record
    if (isIOS) {
        // iOS: Use touch events
        voiceSearchBtn.addEventListener('touchstart', handleHoldStart, { passive: false });
        voiceSearchBtn.addEventListener('touchend', handleHoldEnd, { passive: false });
        voiceSearchBtn.addEventListener('touchcancel', handleHoldEnd, { passive: false });

        // Prevent context menu on long press
        voiceSearchBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Handle iOS-specific page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && (isListening || isHolding)) {
                console.log('Page hidden, stopping recognition');
                forceResetVoiceSearch();
            }
        });

    } else {
        // Desktop/Android: Use mouse events
        voiceSearchBtn.addEventListener('mousedown', handleHoldStart);
        voiceSearchBtn.addEventListener('mouseup', handleHoldEnd);
        voiceSearchBtn.addEventListener('mouseleave', handleHoldEnd);

        // Also support touch events for Android
        voiceSearchBtn.addEventListener('touchstart', handleHoldStart, { passive: false });
        voiceSearchBtn.addEventListener('touchend', handleHoldEnd, { passive: false });
        voiceSearchBtn.addEventListener('touchcancel', handleHoldEnd, { passive: false });
    }

    // Prevent click events from interfering
    voiceSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    // Add safety timeout to force reset if stuck
    setInterval(() => {
        if (isListening && !isHolding) {
            const currentTime = Date.now();
            if (currentTime - holdStartTime > 30000) { // Force reset if stuck for more than 30 seconds
                console.log('Safety timeout triggered, force reset');
                forceResetVoiceSearch();
            }
        }
    }, 1000);

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

    // Store original placeholder and update it for hold-to-record
    if (searchInput) {
        const currentLang = getCurrentLanguage();
        const holdPlaceholder = currentLang === 'ar' ? 'اضغط مع الاستمرار للبحث الصوتي...' : 'Hold to voice search...';
        searchInput.placeholder = holdPlaceholder;
        searchInput.dataset.originalPlaceholder = holdPlaceholder;
        console.log("Voice search configured for hold-to-record", searchInput);
    }
});