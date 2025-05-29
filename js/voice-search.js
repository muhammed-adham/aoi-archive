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

    // Enhanced Audio Context for cross-platform sound generation
    let audioContext = null;
    let audioBuffers = {};
    let isAudioInitialized = false;

    // Initialize audio context (iOS requires user interaction first)
    function initializeAudio() {
        if (isAudioInitialized) return;
        
        try {
            // Use webkit prefix for older iOS versions
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioContext = new AudioContext();
                
                // Create sound buffers
                createSoundBuffers();
                isAudioInitialized = true;
                console.log('Audio context initialized successfully');
            }
        } catch (error) {
            console.warn('Audio context initialization failed:', error);
            // Fallback to HTML5 audio
            initializeHTMLAudio();
        }
    }

    // Create programmatic sound buffers for better iOS compatibility
    function createSoundBuffers() {
        if (!audioContext) return;

        // Create different sound types
        const sounds = {
            start: { frequency: 800, duration: 0.1, type: 'sine' },
            stop: { frequency: 600, duration: 0.15, type: 'sine' },
            error: { frequency: 300, duration: 0.2, type: 'sawtooth' },
            success: { frequency: 1000, duration: 0.12, type: 'sine' }
        };

        Object.keys(sounds).forEach(soundType => {
            const sound = sounds[soundType];
            const sampleRate = audioContext.sampleRate;
            const numSamples = sampleRate * sound.duration;
            const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
            const channelData = buffer.getChannelData(0);

            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;

                switch (sound.type) {
                    case 'sine':
                        sample = Math.sin(2 * Math.PI * sound.frequency * t);
                        break;
                    case 'sawtooth':
                        sample = 2 * (t * sound.frequency - Math.floor(t * sound.frequency + 0.5));
                        break;
                }

                // Apply envelope to prevent clicks
                const envelope = Math.sin(Math.PI * t / sound.duration);
                channelData[i] = sample * envelope * 0.1; // Low volume
            }

            audioBuffers[soundType] = buffer;
        });
    }

    // HTML5 Audio fallback for devices that don't support Web Audio API
    let htmlAudioElements = {};

    function initializeHTMLAudio() {
        // Create data URLs for different sound types
        const sounds = {
            start: createBeepDataURL(800, 0.1),
            stop: createBeepDataURL(600, 0.15),
            error: createBeepDataURL(300, 0.2),
            success: createBeepDataURL(1000, 0.12)
        };

        Object.keys(sounds).forEach(soundType => {
            const audio = new Audio();
            audio.src = sounds[soundType];
            audio.preload = 'auto';
            audio.volume = 0.1;
            htmlAudioElements[soundType] = audio;
        });

        console.log('HTML5 Audio fallback initialized');
    }

    // Create beep sound as data URL
    function createBeepDataURL(frequency, duration) {
        const sampleRate = 44100;
        const numSamples = sampleRate * duration;
        const samples = new Int16Array(numSamples);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const sample = Math.sin(2 * Math.PI * frequency * t);
            const envelope = Math.sin(Math.PI * t / duration);
            samples[i] = sample * envelope * 32767 * 0.1;
        }

        // Convert to WAV format
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples.length * 2, true);

        // Audio data
        let offset = 44;
        for (let i = 0; i < samples.length; i++) {
            view.setInt16(offset, samples[i], true);
            offset += 2;
        }

        const blob = new Blob([buffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }

    // Play sound function with fallbacks
    function playSound(soundType) {
        // Don't play sounds if user hasn't interacted yet (autoplay policy)
        if (!isAudioInitialized) {
            return;
        }

        try {
            if (audioContext && audioBuffers[soundType]) {
                // Web Audio API (preferred for iOS)
                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();
                
                source.buffer = audioBuffers[soundType];
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                gainNode.gain.value = 0.1; // Low volume
                
                source.start(0);
                console.log(`Played Web Audio sound: ${soundType}`);
            } else if (htmlAudioElements[soundType]) {
                // HTML5 Audio fallback
                const audio = htmlAudioElements[soundType];
                audio.currentTime = 0;
                const playPromise = audio.play();
                
                if (playPromise) {
                    playPromise.catch(error => {
                        console.warn('HTML5 audio play failed:', error);
                    });
                }
                console.log(`Played HTML5 sound: ${soundType}`);
            }
        } catch (error) {
            console.warn('Sound play failed:', error);
        }
    }

    // Enhanced vibration function with iOS optimization
    function triggerVibration(pattern) {
        if (!navigator.vibrate) {
            console.log('Vibration not supported');
            return;
        }

        try {
            // iOS Safari has limited vibration support
            if (isIOS) {
                // Use simple vibration for iOS
                navigator.vibrate(50);
            } else {
                // Use pattern for Android/other devices
                navigator.vibrate(pattern);
            }
            console.log('Vibration triggered:', pattern);
        } catch (error) {
            console.warn('Vibration failed:', error);
        }
    }

    // Enhanced Arabic text normalization with better matching
    function normalizeArabicText(text) {
        if (!text || typeof text !== 'string') return text || '';

        // Arabic character normalization mapping - Enhanced for better search matching
        const normalizationMap = {
            // Alif forms - normalize all to bare alif
            'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
            // Hamza forms
            'ؤ': 'و', 'ئ': 'ي',
            // Taa marbuta and haa - key fix for غابه/الغابه matching
            'ة': 'ه', 'ه': 'ه',
            // Yaa and Alif Maqsura
            'ى': 'ي',
            // Kaf variations
            'ك': 'ك', 'ڪ': 'ك',
            // Remove all diacritics (tashkeel)
            'َ': '', 'ُ': '', 'ِ': '', 'ّ': '', 'ً': '', 'ٌ': '', 'ٍ': '', 'ْ': '',
            'ٓ': '', 'ٔ': '', 'ٕ': '', 'ٖ': '', 'ٗ': '', '٘': '', 'ٙ': '', 'ٚ': '', 'ٛ': '', 'ٜ': '', 'ٝ': '', 'ٞ': '', 'ٟ': ''
        };

        return text.split('').map(char => normalizationMap[char] || char).join('');
    }

    // Enhanced search text normalization for better Arabic matching
    function normalizeSearchText(text) {
        if (!text) return '';

        // First normalize Arabic characters
        let normalizedText = normalizeArabicText(text);

        // Convert to lowercase for case-insensitive matching
        normalizedText = normalizedText.toLowerCase();

        // Remove Arabic definite articles for better matching (ال، الـ)
        normalizedText = normalizedText.replace(/^ال+/g, '').replace(/\bال+/g, '');

        // Remove extra spaces and special characters
        normalizedText = normalizedText
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ')  // Clean up any spaces left after removing punctuation
            .trim();

        console.log('Enhanced text normalization:', {
            original: text,
            afterArabic: normalizeArabicText(text),
            afterArticleRemoval: normalizedText,
            final: normalizedText
        });

        return normalizedText;
    }

    // Make normalization functions globally available
    window.normalizeArabicText = normalizeArabicText;
    window.normalizeSearchText = normalizeSearchText;

    // Bad words lists (keeping your existing implementation)
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
        const currentLang = getCurrentLanguage();
        const badWordsList = currentLang === 'ar' ? badWordsAR : badWordsEN;
        return badWordsList.some(word => new RegExp(`\\b${escapeRegex(word)}\\b`, 'i').test(text));
    }

    // Function to filter out bad words
    function filterBadWords(text) {
        if (!text) return text;
        const currentLang = getCurrentLanguage();
        const badWordsList = currentLang === 'ar' ? badWordsAR : badWordsEN;
        let filteredText = text;
        badWordsList.forEach(word => {
            const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
            filteredText = filteredText.replace(regex, '');
        });
        return filteredText;
    }

    // Function to remove duplicate consecutive words
    function removeDuplicateWords(text) {
        if (!text) return text;
        const words = text.split(/\s+/);
        const result = [];
        for (let i = 0; i < words.length; i++) {
            if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
                result.push(words[i]);
            }
        }
        return result.join(' ');
    }

    // Helper function to get the current language
    function getCurrentLanguage() {
        const storedLanguage = localStorage.getItem('selectedLanguage');
        if (storedLanguage) {
            return storedLanguage;
        }
        return document.dir === 'rtl' ? 'ar' : 'en';
    }

    // Voice search state
    let isListening = false;
    let recognition = null;
    let isProcessing = false;
    let holdTimer = null;
    let isHolding = false;
    let holdStartTime = 0;
    let minHoldTime = isIOS ? 150 : 200; // Shorter for iOS
    let finalTranscript = '';
    let interimResults = '';
    let recognitionTimeout = null;
    let forceStopTimer = null;

    // Enhanced recognition initialization with iOS fixes
    function initializeRecognition() {
        if (recognition) {
            try {
                recognition.stop();
                recognition = null;
            } catch (e) {
                console.log('Previous recognition cleanup');
            }
        }

        // Clear any existing timers
        if (recognitionTimeout) {
            clearTimeout(recognitionTimeout);
            recognitionTimeout = null;
        }
        if (forceStopTimer) {
            clearTimeout(forceStopTimer);
            forceStopTimer = null;
        }

        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported');
            return;
        }

        recognition = new SpeechRecognition();

        // iOS-optimized settings with better error handling
        if (isIOS) {
            recognition.continuous = false; // Critical for iOS
            recognition.interimResults = false; // iOS has issues with interim results
            recognition.maxAlternatives = 1;
            
            // Check HTTPS requirement
            if (!isHTTPS && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
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
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 3;
        }

        // Enhanced event handlers
        recognition.onstart = handleRecognitionStart;
        recognition.onresult = handleRecognitionResult;
        recognition.onend = handleRecognitionEnd;
        recognition.onerror = handleRecognitionError;

        // Additional iOS-specific handlers
        if (isIOS) {
            recognition.onspeechstart = () => console.log('iOS: Speech detected');
            recognition.onspeechend = () => console.log('iOS: Speech ended');
            recognition.onaudiostart = () => console.log('iOS: Audio started');
            recognition.onaudioend = () => console.log('iOS: Audio ended');
            recognition.onnomatch = () => console.log('iOS: No match found');
            recognition.onsoundstart = () => console.log('iOS: Sound started');
            recognition.onsoundend = () => console.log('iOS: Sound ended');
        }
    }

    // Enhanced recognition start handler
    function handleRecognitionStart() {
        console.log('Recognition started');
        isListening = true;
        finalTranscript = '';
        interimResults = '';

        // Play start sound and vibrate
        playSound('start');
        triggerVibration([50]);

        // Set a force stop timer for iOS
        if (isIOS) {
            forceStopTimer = setTimeout(() => {
                if (isListening && !isHolding) {
                    console.log('iOS: Force stopping recognition due to timeout');
                    forceResetVoiceSearch();
                }
            }, 10000); // 10 seconds max for iOS
        }
    }

    // Enhanced recognition result handler
    function handleRecognitionResult(event) {
        try {
            console.log('Recognition result event:', {
                resultIndex: event.resultIndex,
                resultsLength: event.results.length,
                isIOS: isIOS
            });

            let transcript = '';
            let isFinalResult = false;

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                const resultText = result[0].transcript;
                
                console.log(`Result ${i}:`, {
                    text: resultText,
                    isFinal: result.isFinal,
                    confidence: result[0].confidence
                });

                if (result.isFinal) {
                    finalTranscript += resultText + ' ';
                    isFinalResult = true;
                } else {
                    interimResults = resultText;
                }
            }

            // Enhanced iOS handling
            if (isIOS) {
                if (isFinalResult && finalTranscript.trim()) {
                    transcript = finalTranscript.trim();
                    console.log('iOS final transcript:', transcript);
                    processVoiceSearchResult(transcript);
                }
            } else {
                transcript = finalTranscript + interimResults;
                transcript = removeDuplicateWords(transcript.trim());
                
                if (containsBadWords(transcript)) {
                    transcript = filterBadWords(transcript);
                    console.warn('Bad words detected and filtered');
                }
                
                searchInput.value = transcript;
                console.log('Live speech update:', { transcript, isFinal: isFinalResult });
                
                if (isFinalResult) {
                    processVoiceSearchResult(transcript);
                }
            }

        } catch (error) {
            console.error('Error processing speech results:', error);
            resetVoiceSearch();
        }
    }

    // Enhanced recognition end handler - KEY FIX for iOS
    function handleRecognitionEnd() {
        console.log('Recognition ended', {
            isIOS: isIOS,
            isHolding: isHolding,
            finalTranscript: finalTranscript,
            inputValue: searchInput ? searchInput.value : 'no input'
        });

        // Play stop sound and vibrate
        playSound('stop');
        triggerVibration([30, 50, 30]);

        // Clear force stop timer
        if (forceStopTimer) {
            clearTimeout(forceStopTimer);
            forceStopTimer = null;
        }

        // Enhanced iOS handling
        if (isIOS) {
            const currentValue = searchInput ? searchInput.value : '';
            const transcriptToProcess = finalTranscript.trim() || currentValue.trim();
            
            if (transcriptToProcess && !containsBadWords(transcriptToProcess)) {
                console.log('iOS: Processing final transcript on end:', transcriptToProcess);
                processVoiceSearchResult(transcriptToProcess);
                playSound('success'); // Success sound
            } else if (!transcriptToProcess) {
                console.log('iOS: No transcript to process');
                showNoSpeechMessage();
                playSound('error'); // Error sound
            }
        }

        // KEY FIX: Always reset after processing
        setTimeout(() => {
            resetVoiceSearch();
        }, 100);
    }

    // Enhanced error handling
    function handleRecognitionError(event) {
        console.error('Speech recognition error:', {
            error: event.error,
            message: event.message,
            isIOS,
            isHTTPS,
            userAgent: navigator.userAgent
        });

        // Play error sound and vibrate
        playSound('error');
        triggerVibration([100, 50, 100]);

        const currentLang = getCurrentLanguage();
        let errorMessage = '';

        switch (event.error) {
            case 'no-speech':
                errorMessage = currentLang === 'ar' ? 'لم يتم اكتشاف أي كلام' : 'No speech detected';
                break;
            case 'audio-capture':
                errorMessage = currentLang === 'ar' ? 'لا يمكن الوصول للميكروفون' : 'Cannot access microphone';
                break;
            case 'not-allowed':
                errorMessage = currentLang === 'ar' ? 'يرجى السماح بالوصول للميكروفون' : 'Please allow microphone access';
                break;
            case 'network':
                errorMessage = currentLang === 'ar' ? 'خطأ في الشبكة' : 'Network error';
                break;
            case 'service-not-allowed':
                errorMessage = currentLang === 'ar' ? 'الخدمة غير متاحة' : 'Service not available';
                break;
            default:
                errorMessage = currentLang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Error occurred, try again';
        }

        showErrorMessage(errorMessage);
        forceResetVoiceSearch();
    }

    // Helper function to show error messages
    function showErrorMessage(message) {
        if (searchInput) {
            searchInput.value = '';
            searchInput.placeholder = message;
            setTimeout(() => {
                const currentLang = getCurrentLanguage();
                const holdPlaceholder = currentLang === 'ar' ? 'اضغط مع الاستمرار للبحث الصوتي...' : 'Hold to voice search...';
                searchInput.placeholder = holdPlaceholder;
            }, 3000);
        }
    }

    // Helper function to show no speech message
    function showNoSpeechMessage() {
        const currentLang = getCurrentLanguage();
        const noSpeechMsg = currentLang === 'ar' ? 'لم يتم اكتشاف أي كلام' : 'No speech detected';
        showErrorMessage(noSpeechMsg);
    }

    // Enhanced feedback function with audio and vibration
    function provideFeedback(type) {
        switch (type) {
            case 'start':
                playSound('start');
                triggerVibration([50]);
                break;
            case 'stop':
                playSound('stop');
                triggerVibration([30, 50, 30]);
                break;
            case 'error':
                playSound('error');
                triggerVibration([100, 50, 100]);
                break;
            case 'success':
                playSound('success');
                triggerVibration([25, 25, 25]);
                break;
        }

        // Visual feedback
        if (voiceSearchBtn) {
            voiceSearchBtn.classList.add('feedback');
            setTimeout(() => {
                voiceSearchBtn.classList.remove('feedback');
            }, 200);
        }
    }

    // Enhanced voice search processing
    function processVoiceSearchResult(words) {
        if (!words || !words.trim()) {
            console.log('Empty result, ignoring');
            return;
        }

        words = removeDuplicateWords(words.trim());

        if (containsBadWords(words)) {
            words = filterBadWords(words);
            console.warn('Bad words detected and filtered');
        }

        if (!containsBadWords(words) && words.trim()) {
            const normalizedWords = normalizeSearchText(words);
            console.log('Normalized words:', normalizedWords);

            searchInput.value = normalizedWords;

            if (typeof showLoadingState === 'function') {
                showLoadingState();
            }

            triggerSearchEvents(normalizedWords);

            // Play success sound and vibrate
            provideFeedback('success');

            // Use appropriate delay based on device
            const delay = isIOS ? 150 : 300;
            setTimeout(() => {
                if (typeof filterArticles === 'function') {
                    console.log('Calling filterArticles() with value:', normalizedWords);
                    filterArticles();
                }

                if (typeof hideLoadingState === 'function') {
                    hideLoadingState();
                }
            }, delay);
        }
    }

    // Enhanced event triggering for better mobile compatibility
    function triggerSearchEvents(normalizedWords) {
        searchInput.focus();

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
            new Event('change', { bubbles: true }),
            new KeyboardEvent('keyup', { 
                bubbles: true, 
                key: 'Enter', 
                keyCode: 13 
            })
        ];

        events.forEach((event, index) => {
            setTimeout(() => {
                searchInput.dispatchEvent(event);
                console.log('Dispatched event:', event.type, 'with value:', normalizedWords);
            }, index * (isIOS ? 5 : 10));
        });

        // Force value assignment for iOS
        setTimeout(() => {
            searchInput.value = normalizedWords;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }, isIOS ? 25 : 50);
    }

    // Enhanced start voice recognition
    function startVoiceRecognition() {
        try {
            initializeRecognition();
            updateRecognitionLanguage();

            if (!recognition) {
                throw new Error('Failed to initialize recognition');
            }

            // Request microphone permission for iOS
            if (isIOS && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(() => {
                        console.log('iOS: Microphone permission granted');
                        startRecognitionAfterPermission();
                    })
                    .catch((error) => {
                        console.error('iOS: Microphone permission denied:', error);
                        handleRecognitionError({ error: 'not-allowed' });
                    });
            } else {
                startRecognitionAfterPermission();
            }

        } catch (error) {
            console.error('Error starting voice recognition:', error);
            handleRecognitionError({ error: 'start-failed' });
        }
    }

    // Start recognition after permission
    function startRecognitionAfterPermission() {
        try {
            recognition.start();
            isListening = true;

            // Update UI
            voiceSearchBtn.classList.add('listening');
            searchInput.classList.add('voice-listening');
            voiceSearchBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';

            provideFeedback('start');

            const currentLang = getCurrentLanguage();
            const listeningText = currentLang === 'ar' ? 'جاري الاستماع... (اتركه للتوقف)' : 'Listening... (release to stop)';
            searchInput.placeholder = listeningText;

            console.log('Voice recognition started successfully');

        } catch (error) {
            console.error('Error in startRecognitionAfterPermission:', error);
            handleRecognitionError({ error: 'start-failed' });
        }
    }

    // Enhanced stop voice recognition
    function stopVoiceRecognition() {
        try {
            if (recognition && isListening) {
                recognition.stop();
                console.log('Voice recognition stopped by user');
            }
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
        }
    }

    // Enhanced hold start handler
    function handleHoldStart(event) {
        event.preventDefault();
        event.stopPropagation();

        if (isProcessing || isListening) {
            console.log('Already processing or listening, ignoring hold start');
            return;
        }

        // Initialize audio on first user interaction (required for iOS)
        if (!isAudioInitialized) {
            initializeAudio();
        }

        console.log('Hold start detected');
        holdStartTime = Date.now();
        isHolding = true;

        holdTimer = setTimeout(() => {
            if (isHolding) {
                console.log('Hold time reached, starting voice recognition');
                isProcessing = true;
                startVoiceRecognition();
            }
        }, minHoldTime);

        voiceSearchBtn.classList.add('holding');
        
        // Immediate visual feedback
        provideFeedback('start');
    }

    // Enhanced hold end handler - KEY FIX for iOS
    function handleHoldEnd(event) {
        event.preventDefault();
        event.stopPropagation();

        console.log('Hold end detected');
        const holdDuration = Date.now() - holdStartTime;

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }

        voiceSearchBtn.classList.remove('holding');

        // KEY FIX: Enhanced iOS handling
        if (isHolding) {
            if (isListening) {
                console.log('Stopping voice recognition after hold end');
                stopVoiceRecognition();
                // For iOS, don't reset immediately - let onend handle it
                if (!isIOS) {
                    setTimeout(() => resetVoiceSearch(), 100);
                }
            } else if (holdDuration < minHoldTime) {
                console.log('Hold too short, ignoring');
                provideFeedback('error');
            }
        }

        isHolding = false;
        isProcessing = false;
    }

    // Force reset function
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

    // Enhanced reset function
    function resetVoiceSearch() {
        console.log('Resetting voice search state');
        
        isListening = false;
        isProcessing = false;
        isHolding = false;
        finalTranscript = '';
        interimResults = '';

        // Clear all timers
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        if (recognitionTimeout) {
            clearTimeout(recognitionTimeout);
            recognitionTimeout = null;
        }
        if (forceStopTimer) {
            clearTimeout(forceStopTimer);
            forceStopTimer = null;
        }

        // Reset UI
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

        provideFeedback('stop');
    }

    // Set recognition language
    function updateRecognitionLanguage() {
        if (!recognition) return;
        const currentLang = getCurrentLanguage();
        recognition.lang = currentLang === 'ar' ? 'ar-EG' : 'en-US';
        console.log(`Speech recognition language set to: ${recognition.lang}`);
    }

    // Initialize recognition
    initializeRecognition();

    // Enhanced event listeners for iOS
    if (isIOS) {
        voiceSearchBtn.addEventListener('touchstart', handleHoldStart, { passive: false });
        voiceSearchBtn.addEventListener('touchend', handleHoldEnd, { passive: false });
        voiceSearchBtn.addEventListener('touchcancel', handleHoldEnd, { passive: false });
        voiceSearchBtn.addEventListener('contextmenu', (e) => e.preventDefault());

        // iOS-specific page visibility handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && (isListening || isHolding)) {
                console.log('iOS: Page hidden, stopping recognition');
                forceResetVoiceSearch();
            }
        });

        window.addEventListener('pagehide', () => {
            if (isListening || isHolding) {
                console.log('iOS: Page hiding, stopping recognition');
                forceResetVoiceSearch();
            }
        });
    } else {
        // Desktop/Android events
        voiceSearchBtn.addEventListener('mousedown', handleHoldStart);
        voiceSearchBtn.addEventListener('mouseup', handleHoldEnd);
        voiceSearchBtn.addEventListener('mouseleave', handleHoldEnd);
        voiceSearchBtn.addEventListener('touchstart', handleHoldStart, { passive: false });
        voiceSearchBtn.addEventListener('touchend', handleHoldEnd, { passive: false });
        voiceSearchBtn.addEventListener('touchcancel', handleHoldEnd, { passive: false });
    }

    // Prevent click events
    voiceSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    // Safety timeout with shorter interval for iOS
    setInterval(() => {
        if (isListening && !isHolding) {
            const currentTime = Date.now();
            const timeoutDuration = isIOS ? 12000 : 30000;
            
            if (currentTime - holdStartTime > timeoutDuration) {
                console.log('Safety timeout triggered, force reset');
                forceResetVoiceSearch();
            }
        }
    }, 1000);

    // Set initial language and placeholder
    updateRecognitionLanguage();
    if (searchInput) {
        const currentLang = getCurrentLanguage();
        const holdPlaceholder = currentLang === 'ar' ? 'اضغط مع الاستمرار للبحث الصوتي...' : 'Hold to voice search...';
        searchInput.placeholder = holdPlaceholder;
        searchInput.dataset.originalPlaceholder = holdPlaceholder;
    }

    // Language change event listeners
    document.addEventListener('langChange', () => {
        setTimeout(updateRecognitionLanguage, 100);
    });

    const langToggle = document.getElementById('chklang');
    if (langToggle) {
        langToggle.addEventListener('change', () => {
            setTimeout(updateRecognitionLanguage, 100);
        });
    }

    // iOS debugging
    if (isIOS) {
        console.log('iOS Voice Search Enhanced Debug Info:', {
            webkitSpeechRecognition: typeof window.webkitSpeechRecognition,
            speechRecognition: typeof window.SpeechRecognition,
            isHTTPS: isHTTPS,
            hostname: window.location.hostname,
            userAgent: navigator.userAgent,
            mediaDevices: typeof navigator.mediaDevices,
            getUserMedia: typeof navigator.mediaDevices?.getUserMedia,
            minHoldTime: minHoldTime
        });

        // Test microphone access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => console.log('iOS: Initial microphone test passed'))
                .catch((error) => console.warn('iOS: Initial microphone test failed:', error));
        }
    }

    console.log('Enhanced voice search initialized successfully');
});