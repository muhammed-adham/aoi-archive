// Date Range Picker with Presets

class DateRangePicker {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            startDateId: 'start-date',
            endDateId: 'end-date',
            presets: [
                { label: 'Today', days: 0 },
                { label: 'Yesterday', days: -1 },
                { label: 'Last 7 days', days: -7 },
                { label: 'This month', type: 'thisMonth' },
                { label: 'Last month', type: 'lastMonth' },
                { label: 'This year', type: 'thisYear' },
                { label: 'Last year', type: 'lastYear' },
                { label: 'Custom Range', type: 'custom' }
            ],
            onChange: null,
            ...options
        };
        
        this.isOpen = false;
        this.startDate = null;
        this.endDate = null;
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.isArabic = localStorage.getItem('selectedLanguage') === 'ar';
        this.inRangeSelection = false;
        this.tempStartDate = null;
        
        this.render();
        this.attachEvents();
        
        // Listen for language changes at window level
        window.addEventListener('languageChanged', (event) => {
            this.updateLanguage(event.detail.language);
        });

        // Also listen for settings loaded event
        window.addEventListener('settingsLoaded', (event) => {
            this.updateLanguage(event.detail.language);
        });

        // Initial language setup
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
        this.updateLanguage(currentLang);
    }
    
    render() {
        // Create main container
        this.container.classList.add('date-range-picker-container');
        
        // Create the input display
        this.displayElement = document.createElement('div');
        this.displayElement.className = 'date-range-display date-picker-trigger';
        
        // Calendar icon
        // const calendarIcon = document.createElement('i');
        // calendarIcon.className = 'fas fa-calendar';
        // this.displayElement.appendChild(calendarIcon);
        
        // Display text
        this.displayText = document.createElement('span');
        this.displayText.className = 'date-range-text';
        this.displayText.textContent = this.isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        this.displayElement.appendChild(this.displayText);
        
        // Create the dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'date-range-dropdown';
        
        // Create preset section
        const presetSection = document.createElement('div');
        presetSection.className = 'date-range-presets';
        
        // Add presets
        this.options.presets.forEach(preset => {
            const presetBtn = document.createElement('button');
            presetBtn.className = 'date-range-preset';
            presetBtn.textContent = this.isArabic ? this.getArabicLabel(preset.label) : preset.label;
            presetBtn.dataset.preset = preset.type || preset.days;
            presetSection.appendChild(presetBtn);
        });
        
        this.dropdown.appendChild(presetSection);
        
        // Create the calendar overlay for custom range
        this.calendarOverlay = document.createElement('div');
        this.calendarOverlay.className = 'calendar-overlay';
        
        // Create calendar container
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
        
        // Calendar header with month/year navigation
        const calendarHeader = document.createElement('div');
        calendarHeader.className = 'calendar-header';
        
        // Previous month button
        this.prevMonthBtn = document.createElement('button');
        this.prevMonthBtn.className = 'calendar-nav-btn prev-month';
        this.prevMonthBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        calendarHeader.appendChild(this.prevMonthBtn);
        
        // Month/Year display
        this.monthYearDisplay = document.createElement('div');
        this.monthYearDisplay.className = 'month-year-display';
        calendarHeader.appendChild(this.monthYearDisplay);
        
        // Next month button
        this.nextMonthBtn = document.createElement('button');
        this.nextMonthBtn.className = 'calendar-nav-btn next-month';
        this.nextMonthBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        calendarHeader.appendChild(this.nextMonthBtn);
        
        calendarContainer.appendChild(calendarHeader);
        
        // Calendar body with days
        this.calendarBody = document.createElement('div');
        this.calendarBody.className = 'calendar-body';
        calendarContainer.appendChild(this.calendarBody);
        
        // Calendar footer with buttons
        const calendarFooter = document.createElement('div');
        calendarFooter.className = 'calendar-footer';
        
        // Apply button
        const applyBtn = document.createElement('button');
        applyBtn.className = 'calendar-apply-btn';
        applyBtn.textContent = this.isArabic ? 'تطبيق' : 'Apply';
        calendarFooter.appendChild(applyBtn);
        
        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'calendar-cancel-btn';
        cancelBtn.textContent = this.isArabic ? 'إلغاء' : 'Cancel';
        calendarFooter.appendChild(cancelBtn);
        
        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'calendar-clear-btn';
        clearBtn.textContent = this.isArabic ? 'مسح' : 'Clear';
        calendarFooter.appendChild(clearBtn);
        
        calendarContainer.appendChild(calendarFooter);
        this.calendarOverlay.appendChild(calendarContainer);
        
        // Add elements to container
        this.container.appendChild(this.displayElement);
        this.container.appendChild(this.dropdown);
        document.body.appendChild(this.calendarOverlay);
    }
    
    getArabicLabel(label) {
        const arabicLabels = {
            'Today': 'اليوم',
            'Yesterday': 'أمس',
            'Last 7 days': 'آخر ٧ أيام',
            'This month': 'هذا الشهر',
            'Last month': 'الشهر الماضي',
            'This year': 'هذا العام',
            'Last year': 'العام الماضي',
            'Custom Range': 'نطاق مخصص'
        };
        return arabicLabels[label] || label;
    }
    
    attachEvents() {
        // Toggle dropdown on display click
        this.displayElement.addEventListener('click', () => {
            this.toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && this.isOpen) {
                this.closeDropdown();
            }
        });
        
        // Preset buttons
        const presetButtons = this.dropdown.querySelectorAll('.date-range-preset');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const presetValue = btn.dataset.preset;
                
                if (presetValue === 'custom') {
                    this.openCalendarOverlay();
                } else {
                    this.applyPreset(presetValue);
                }
            });
        });
        
        // Calendar navigation
        this.prevMonthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.changeMonth(-1);
        });
        
        this.nextMonthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.changeMonth(1);
        });
        
        // Calendar buttons
        const applyBtn = this.calendarOverlay.querySelector('.calendar-apply-btn');
        const cancelBtn = this.calendarOverlay.querySelector('.calendar-cancel-btn');
        const clearBtn = this.calendarOverlay.querySelector('.calendar-clear-btn');
        
        applyBtn.addEventListener('click', () => {
            if (this.startDate && this.endDate) {
                this.updateDisplay();
                this.closeCalendarOverlay();
                this.closeDropdown();
                this.notifyChange();
            } else {
                alert(this.isArabic ? 'يرجى تحديد تاريخ البدء والانتهاء' : 'Please select both start and end dates');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.closeCalendarOverlay();
        });
        
        clearBtn.addEventListener('click', () => {
            this.clearDateRange();
            this.closeCalendarOverlay();
        });
    }
    
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        this.dropdown.style.display = 'block';
        this.isOpen = true;
        this.displayElement.classList.add('active');
        
        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', this.outsideClickHandler);
        }, 10);
    }
    
    closeDropdown() {
        this.dropdown.style.display = 'none';
        this.isOpen = false;
        this.displayElement.classList.remove('active');
        
        // Remove click outside listener
        document.removeEventListener('click', this.outsideClickHandler);
    }
    
    outsideClickHandler = (e) => {
        if (!this.container.contains(e.target)) {
            this.closeDropdown();
        }
    }
    
    openCalendarOverlay() {
        this.calendarOverlay.style.display = 'flex';
        this.renderCalendar();
    }
    
    closeCalendarOverlay() {
        this.calendarOverlay.style.display = 'none';
    }
    
    renderCalendar() {
        // Use the stored current month and year
        const currentDate = new Date(this.currentYear, this.currentMonth);
        
        // Update month/year display
        this.monthYearDisplay.textContent = currentDate.toLocaleDateString(this.isArabic ? 'ar-EG' : 'en-US', {
            month: 'long',
            year: 'numeric'
        });
        
        // Clear previous calendar
        this.calendarBody.innerHTML = '';
        
        // Create weekdays header
        const weekdays = document.createElement('div');
        weekdays.className = 'calendar-weekdays';
        const weekdayNames = this.isArabic ? 
            ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'] :
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        weekdayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            weekdays.appendChild(dayElement);
        });
        
        this.calendarBody.appendChild(weekdays);
        
        // Create days grid
        const daysGrid = document.createElement('div');
        daysGrid.className = 'calendar-days';
        
        // Get first day of month and total days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Add empty cells for days before first of month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            daysGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = this.isArabic ? this.toArabicNumeral(day) : day;
            
            const currentDate = new Date(this.currentYear, this.currentMonth, day);
            
            // Add classes for selected dates
            if (this.startDate && this.startDate.toDateString() === currentDate.toDateString()) {
                dayElement.classList.add('range-start');
            }
            if (this.endDate && this.endDate.toDateString() === currentDate.toDateString()) {
                dayElement.classList.add('range-end');
            }
            if (this.startDate && this.endDate && 
                currentDate > this.startDate && currentDate < this.endDate) {
                dayElement.classList.add('in-range');
            }
            
            // Add click handler
            dayElement.addEventListener('click', () => {
                this.handleDayClick(currentDate);
            });
            
            daysGrid.appendChild(dayElement);
        }
        
        this.calendarBody.appendChild(daysGrid);
        
        // Update navigation arrows direction based on language
        this.updateNavigationArrows();
    }
    
    toArabicNumeral(num) {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return num.toString().split('').map(digit => 
            isNaN(parseInt(digit)) ? digit : arabicNumerals[parseInt(digit)]
        ).join('');
    }
    
    updateNavigationArrows() {
        // Set correct arrow icons and directions based on language
        if (this.isArabic) {
            this.prevMonthBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            this.nextMonthBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        } else {
            this.prevMonthBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            this.nextMonthBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        }
    }
    
    changeMonth(delta) {
        // Update the current month and year
        this.currentMonth += delta;
        
        // Handle year change if needed
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        
        // Re-render the calendar
        this.renderCalendar();
    }
    
    handleDayClick(date) {
        if (!this.startDate || (this.startDate && this.endDate)) {
            // Start new range
            this.startDate = date;
            this.endDate = null;
            this.inRangeSelection = true;
        } else {
            // Complete range
            if (date < this.startDate) {
                this.endDate = this.startDate;
                this.startDate = date;
            } else {
                this.endDate = date;
            }
            this.inRangeSelection = false;
        }
        
        this.renderCalendar();
    }
    
    applyPreset(preset) {
        const today = new Date();
        let start, end;
        
        if (preset === 'thisYear') {
            // This year: Jan 1 to Dec 31 of current year
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
        } else if (preset === 'lastYear') {
            // Last year: Jan 1 to Dec 31 of previous year
            start = new Date(today.getFullYear() - 1, 0, 1);
            end = new Date(today.getFullYear() - 1, 11, 31);
        } else if (preset === 'thisMonth') {
            // This month: 1st day to last day of current month
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (preset === 'lastMonth') {
            // Last month: 1st day to last day of previous month
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        } else {
            // Days-based presets
            const days = parseInt(preset);
            if (days === 0) {
                // Today
                start = new Date(today);
                end = new Date(today);
            } else {
                // Days ago to today
                start = new Date(today);
                start.setDate(start.getDate() + days);
                end = new Date(today);
            }
        }
        
        this.startDate = start;
        this.endDate = end;
        
        this.updateDisplay();
        this.closeDropdown();
        this.notifyChange();
    }
    
    clearDateRange() {
        this.startDate = null;
        this.endDate = null;
        
        // Reset display text
        this.displayText.textContent = this.isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        
        // Reset the hidden input elements
        const startDateEl = document.getElementById(this.options.startDateId);
        const endDateEl = document.getElementById(this.options.endDateId);
        
        if (startDateEl) startDateEl.value = '';
        if (endDateEl) endDateEl.value = '';
        
        // Notify any change listeners
        this.notifyChange();
    }
    
    updateDisplay() {
        if (this.startDate && this.endDate) {
            const startFormatted = this.formatDisplayDate(this.startDate);
            const endFormatted = this.formatDisplayDate(this.endDate);
            
            // Check if start and end dates are the same
            if (this.startDate.toDateString() === this.endDate.toDateString()) {
                this.displayText.textContent = startFormatted;
            } else {
                this.displayText.textContent = `${startFormatted} - ${endFormatted}`;
            }
        } else {
            this.displayText.textContent = this.isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        }
    }
    
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }
    
    formatDisplayDate(date) {
        return date.toLocaleDateString(this.isArabic ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    notifyChange() {
        // Get actual DOM elements for compatibility with existing code
        const startDateEl = document.getElementById(this.options.startDateId);
        const endDateEl = document.getElementById(this.options.endDateId);
        
        // Update actual DOM elements
        if (startDateEl) {
            startDateEl.value = this.startDate ? this.formatDateForInput(this.startDate) : '';
        }
        
        if (endDateEl) {
            endDateEl.value = this.endDate ? this.formatDateForInput(this.endDate) : '';
        }
        
        // Trigger a change event on both inputs
        if (startDateEl) {
            startDateEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (endDateEl) {
            endDateEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Call onChange callback if provided
        if (typeof this.options.onChange === 'function') {
            this.options.onChange({
                startDate: this.startDate,
                endDate: this.endDate
            });
        }
    }
    
    // Public methods to get current values
    getStartDate() {
        return this.startDate;
    }
    
    getEndDate() {
        return this.endDate;
    }
    
    // Method to set date programmatically
    setDateRange(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        
        this.updateDisplay();
    }
    
    // Update language based on language change
    updateLanguage(language) {
        // Update isArabic flag
        this.isArabic = language === 'ar';
        
        // Update display text
        if (this.startDate && this.endDate) {
            this.updateDisplay();
        } else {
            this.displayText.textContent = this.isArabic ? 'اختر نطاق التاريخ' : 'Select date range';
        }
        
        // Update presets
        const presetButtons = this.dropdown.querySelectorAll('.date-range-preset');
        presetButtons.forEach(btn => {
            const presetType = btn.dataset.preset;
            let label;
            
            switch(presetType) {
                case '0': label = this.isArabic ? 'اليوم' : 'Today'; break;
                case '-1': label = this.isArabic ? 'أمس' : 'Yesterday'; break;
                case '-7': label = this.isArabic ? 'آخر ٧ أيام' : 'Last 7 days'; break;
                case 'thisMonth': label = this.isArabic ? 'هذا الشهر' : 'This month'; break;
                case 'lastMonth': label = this.isArabic ? 'الشهر الماضي' : 'Last month'; break;
                case 'thisYear': label = this.isArabic ? 'هذا العام' : 'This year'; break;
                case 'lastYear': label = this.isArabic ? 'العام الماضي' : 'Last year'; break;
                case 'custom': label = this.isArabic ? 'نطاق مخصص' : 'Custom Range'; break;
                default: label = btn.textContent;
            }
            
            btn.textContent = label;
        });
        
        // Update calendar if it's open
        if (this.calendarOverlay.style.display === 'flex') {
            this.renderCalendar();
        }
        
        // Update buttons in calendar footer
        const applyBtn = this.calendarOverlay.querySelector('.calendar-apply-btn');
        const cancelBtn = this.calendarOverlay.querySelector('.calendar-cancel-btn');
        const clearBtn = this.calendarOverlay.querySelector('.calendar-clear-btn');
        
        if (applyBtn) applyBtn.textContent = this.isArabic ? 'تطبيق' : 'Apply';
        if (cancelBtn) cancelBtn.textContent = this.isArabic ? 'إلغاء' : 'Cancel';
        if (clearBtn) clearBtn.textContent = this.isArabic ? 'مسح' : 'Clear';
        
        // Update navigation arrows
        this.updateNavigationArrows();

        // Force a re-render of the calendar to ensure all translations are applied
        if (this.calendarOverlay.style.display === 'flex') {
            this.renderCalendar();
        }
    }
}

// Initialize the picker when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const dateFilterContainer = document.querySelector('.filter-group.date-filter');
    if (dateFilterContainer) {
        // Use the existing date-picker-container if present, otherwise create one
        let datePickerContainer = dateFilterContainer.querySelector('.date-picker-container');
        if (!datePickerContainer) {
            datePickerContainer = document.createElement('div');
            datePickerContainer.className = 'date-picker-container';
            dateFilterContainer.appendChild(datePickerContainer);
        }
        
        // Create hidden inputs if they don't exist
        let startDateInput = document.getElementById('start-date');
        let endDateInput = document.getElementById('end-date');
        
        if (!startDateInput) {
            startDateInput = document.createElement('input');
            startDateInput.type = 'hidden';
            startDateInput.id = 'start-date';
            dateFilterContainer.appendChild(startDateInput);
        }
        
        if (!endDateInput) {
            endDateInput = document.createElement('input');
            endDateInput.type = 'hidden';
            endDateInput.id = 'end-date';
            dateFilterContainer.appendChild(endDateInput);
        }
        
        // Initialize the date range picker
        const dateRangePicker = new DateRangePicker(datePickerContainer, {
            startDateId: 'start-date',
            endDateId: 'end-date',
            onChange: (dates) => {
                // Update the clear filters button state
                const clearFiltersBtn = document.getElementById('clear-filters');
                if (clearFiltersBtn) {
                    clearFiltersBtn.disabled = !dates.startDate && !dates.endDate;
                }
                
                // Filter articles based on date range
                filterArticles();
            }
        });
        
        // Store the picker instance globally
        window.dateRangePicker = dateRangePicker;
        
        // Make the update language function available globally
        window.updateDateRangePicker = function(language) {
            if (window.dateRangePicker) {
                window.dateRangePicker.updateLanguage(language);
            }
        };
    }
});

// Function to filter articles based on selected date range
function filterArticles() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate && !endDate) {
        // If no dates are selected, show all articles
        document.querySelectorAll('.box').forEach(box => {
            box.style.display = 'block';
        });
        return;
    }
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    document.querySelectorAll('.box').forEach(box => {
        const articleDate = new Date(box.getAttribute('data-date'));
        let show = true;
        
        if (start && articleDate < start) {
            show = false;
        }
        if (end && articleDate > end) {
            show = false;
        }
        
        box.style.display = show ? 'block' : 'none';
    });
} 