document.addEventListener('DOMContentLoaded', () => {
    // Get required elements
    const voiceSearchBtn = document.getElementById('voice-search');
    const searchInput = document.getElementById('search-input');

    // Exit early if voice search button or search input doesn't exist on this page
    if (!voiceSearchBtn || !searchInput) {
        console.log('Voice search elements not found on this page');
        return;
    }

    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported in this browser');
        voiceSearchBtn.style.display = 'none';
        return;
    }

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

        const lang = document.documentElement.lang || 'en';
        const badWordsList = lang === 'ar' ? badWordsAR : badWordsEN;
        const textLower = text.toLowerCase();

        // Check if any bad word is contained in the text
        return badWordsList.some(word => textLower.includes(word.toLowerCase()));
    }

    // Function to filter out bad words (replace with asterisks)
    function filterBadWords(text) {
        if (!text) return text;

        const lang = document.documentElement.lang || 'en';
        const badWordsList = lang === 'ar' ? badWordsAR : badWordsEN;
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

    // Voice search state
    let isListening = false;

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = true;

    // Set language based on page language
    const currentLang = document.documentElement.lang || 'en';
    recognition.lang = currentLang === 'ar' ? 'ar-EG' : 'en-US';

    // Update recognition language when language changes
    document.addEventListener('langChange', (e) => {
        recognition.lang = e.detail === 'ar' ? 'ar-EG' : 'en-US';
    });

    // Store original placeholder
    searchInput.dataset.originalPlaceholder = searchInput.placeholder || '';

    // Handle voice button click
    voiceSearchBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
            return;
        }

        try {
            recognition.start();
            isListening = true;
            voiceSearchBtn.classList.add('listening');
            searchInput.classList.add('voice-listening');

            // Use appropriate language for placeholder
            const listeningText = document.documentElement.lang === 'ar' ? 'جاري الاستماع...' : 'Listening...';
            searchInput.placeholder = listeningText;

            voiceSearchBtn.innerHTML = '<i class="fas fa-stop"></i>';
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            resetVoiceSearch();
        }
    });

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
                const warningText = document.documentElement.lang === 'ar' ?
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
            searchInput.placeholder = searchInput.dataset.originalPlaceholder || '';
        }
    }
}); 