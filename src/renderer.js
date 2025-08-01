const { ipcRenderer } = require('electron');

class TimerRenderer {
    constructor() {
        this.isRunning = false;
        this.timeRemaining = 0;
        this.totalTime = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.requestTimerState();
    }
    
    initializeElements() {
        this.timeText = document.getElementById('timeText');
        this.progressBar = document.getElementById('progressBar');
        this.startStopBtn = document.getElementById('startStopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.hoursInput = document.getElementById('hoursInput');
        this.minutesInput = document.getElementById('minutesInput');
        this.secondsInput = document.getElementById('secondsInput');
        this.validationMessage = document.getElementById('validationMessage');
        this.timerApp = document.querySelector('.timer-app');
        this.soundNotifications = document.getElementById('soundNotifications');
        this.visualNotifications = document.getElementById('visualNotifications');
    }
    
    setupEventListeners() {
        // Start/Stop button
        this.startStopBtn.addEventListener('click', () => {
            if (this.isRunning) {
                this.stopTimer();
            } else {
                this.startTimer();
            }
        });
        
        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.resetTimer();
        });
        
        // Quick timer buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const seconds = parseInt(btn.dataset.seconds);
                this.setTimeFromSeconds(seconds);
            });
        });
        
        // Input validation
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => {
                this.validateInputs();
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.startTimer();
                }
            });
        });
        
        // Notification settings
        this.soundNotifications.addEventListener('change', () => {
            this.saveNotificationSettings();
        });
        
        this.visualNotifications.addEventListener('change', () => {
            this.saveNotificationSettings();
        });
        
        // Load saved notification settings
        this.loadNotificationSettings();
        
        // IPC listeners
        ipcRenderer.on('timer-state', (event, state) => {
            this.updateState(state);
        });
        
        ipcRenderer.on('timer-update', (event, state) => {
            this.updateState(state);
        });
    }
    
    requestTimerState() {
        ipcRenderer.send('get-timer-state');
    }
    
    updateState(state) {
        this.isRunning = state.isRunning;
        this.timeRemaining = state.timeRemaining;
        this.totalTime = state.totalTime;
        
        this.updateDisplay();
        this.updateUI();
    }
    
    updateDisplay() {
        // Update time text
        this.timeText.textContent = this.formatTime(this.timeRemaining);
        
        // Update progress bar
        if (this.totalTime > 0) {
            const progress = ((this.totalTime - this.timeRemaining) / this.totalTime) * 100;
            this.progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        } else {
            this.progressBar.style.width = '0%';
        }
    }
    
    updateUI() {
        // Update button text and state
        this.startStopBtn.textContent = this.isRunning ? 'Stop' : 'Start';
        this.startStopBtn.className = this.isRunning ? 'btn primary stop' : 'btn primary';
        
        // Update app class for styling
        if (this.isRunning) {
            this.timerApp.classList.add('timer-running');
        } else {
            this.timerApp.classList.remove('timer-running');
        }
        
        // Disable/enable inputs
        const inputs = [this.hoursInput, this.minutesInput, this.secondsInput];
        inputs.forEach(input => {
            input.disabled = this.isRunning;
        });
        
        // If timer is not running and we have remaining time, populate inputs
        if (!this.isRunning && this.timeRemaining > 0) {
            this.setTimeFromSeconds(this.timeRemaining);
        }
    }
    
    startTimer() {
        if (this.isRunning) return;
        
        const totalSeconds = this.getTotalSeconds();
        
        if (!this.validateTime(totalSeconds)) {
            return;
        }
        
        this.clearValidationMessage();
        ipcRenderer.send('start-timer', totalSeconds);
    }
    
    stopTimer() {
        ipcRenderer.send('stop-timer');
    }
    
    resetTimer() {
        ipcRenderer.send('reset-timer');
        // Clear inputs
        this.hoursInput.value = 0;
        this.minutesInput.value = 5;
        this.secondsInput.value = 0;
        this.clearValidationMessage();
    }
    
    getTotalSeconds() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    
    setTimeFromSeconds(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        this.hoursInput.value = hours;
        this.minutesInput.value = minutes;
        this.secondsInput.value = seconds;
        
        this.validateInputs();
    }
    
    validateTime(totalSeconds) {
        // Check minimum time (30 seconds)
        if (totalSeconds < 30) {
            this.showValidationMessage('Minimum timer duration is 30 seconds');
            return false;
        }
        
        // Check maximum time (6 hours = 21600 seconds)
        if (totalSeconds > 21600) {
            this.showValidationMessage('Maximum timer duration is 6 hours');
            return false;
        }
        
        return true;
    }
    
    validateInputs() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        // Ensure values are within valid ranges
        if (hours < 0 || hours > 6) {
            this.hoursInput.value = Math.max(0, Math.min(6, hours));
        }
        
        if (minutes < 0 || minutes > 59) {
            this.minutesInput.value = Math.max(0, Math.min(59, minutes));
        }
        
        if (seconds < 0 || seconds > 59) {
            this.secondsInput.value = Math.max(0, Math.min(59, seconds));
        }
        
        const totalSeconds = this.getTotalSeconds();
        
        if (totalSeconds > 0) {
            if (totalSeconds < 30) {
                this.showValidationMessage('Minimum: 30 seconds');
            } else if (totalSeconds > 21600) {
                this.showValidationMessage('Maximum: 6 hours');
            } else {
                this.clearValidationMessage();
            }
        } else {
            this.clearValidationMessage();
        }
    }
    
    showValidationMessage(message) {
        this.validationMessage.textContent = message;
    }
    
    clearValidationMessage() {
        this.validationMessage.textContent = '';
    }
    
    formatTime(totalSeconds) {
        if (totalSeconds <= 0) return '00:00';
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    saveNotificationSettings() {
        const settings = {
            soundNotifications: this.soundNotifications.checked,
            visualNotifications: this.visualNotifications.checked
        };
        
        localStorage.setItem('chronos-notification-settings', JSON.stringify(settings));
        
        // Send settings to main process
        ipcRenderer.send('update-notification-settings', settings);
    }
    
    loadNotificationSettings() {
        try {
            const savedSettings = localStorage.getItem('chronos-notification-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.soundNotifications.checked = settings.soundNotifications !== false;
                this.visualNotifications.checked = settings.visualNotifications !== false;
                
                // Send loaded settings to main process
                ipcRenderer.send('update-notification-settings', settings);
            }
        } catch (error) {
            console.log('Could not load notification settings:', error);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TimerRenderer();
});