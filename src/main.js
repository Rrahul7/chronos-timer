const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize store for persistent settings
const store = new Store();

class MenuTimer {
  constructor() {
    this.tray = null;
    this.window = null;
    this.timer = null;
    this.isRunning = false;
    this.timeRemaining = 0;
    this.totalTime = 0;
    this.notificationSettings = {
      soundNotifications: true,
      visualNotifications: true
    };
  }

  init() {
    // Load saved notification settings
    this.loadNotificationSettings();
    
    // Create tray icon
    this.createTray();
    
    // Create main window (hidden initially)
    this.createWindow();
    
    // Set up IPC handlers
    this.setupIPC();
    
    // Hide dock icon on macOS
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
  }

  loadNotificationSettings() {
    const savedSettings = store.get('notificationSettings');
    if (savedSettings) {
      this.notificationSettings = { ...this.notificationSettings, ...savedSettings };
    }
  }

  createTray() {
    // Create a simple tray icon that works on macOS
    const icon = nativeImage.createEmpty();
    icon.setTemplateImage(true);
    this.tray = new Tray(icon);
    this.updateTrayTitle('⏱');
    
    this.tray.setToolTip('Chronos');
    
    // Handle click on tray icon
    this.tray.on('click', () => {
      this.toggleWindow();
    });
    
    // Handle right-click for context menu
    this.tray.on('right-click', () => {
      this.showContextMenu();
    });
  }



  updateTrayTitle(text) {
    if (process.platform === 'darwin') {
      this.tray.setTitle(text);
    }
  }

  showContextMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: this.isRunning ? 'Stop Timer' : 'Start Timer',
        click: () => {
          if (this.isRunning) {
            this.stopTimer();
          } else {
            this.toggleWindow();
          }
        }
      },
      {
        label: 'Reset Timer',
        click: () => this.resetTimer()
      },
      { type: 'separator' },
      {
        label: 'Show Timer',
        click: () => this.showWindow()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ]);
    
    this.tray.popUpContextMenu(contextMenu);
  }

  createWindow() {
    this.window = new BrowserWindow({
      width: 300,
      height: 550,
      show: false,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.window.loadFile('src/renderer.html');

    // Hide window when it loses focus
    this.window.on('blur', () => {
      if (!this.window.isDestroyed() && !this.window.webContents.isDevToolsOpened()) {
        this.window.hide();
      }
    });

    // Clean up when window is closed
    this.window.on('closed', () => {
      this.window = null;
    });

    // Handle window being destroyed
    this.window.on('destroyed', () => {
      this.window = null;
    });
  }

  toggleWindow() {
    if (this.window && !this.window.isDestroyed() && this.window.isVisible()) {
      this.window.hide();
    } else {
      this.showWindow();
    }
  }

  showWindow() {
    if (!this.window || this.window.isDestroyed()) {
      this.createWindow();
    }
    
    const trayBounds = this.tray.getBounds();
    const windowBounds = this.window.getBounds();
    
    // Position window near tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
    const y = Math.round(trayBounds.y + trayBounds.height + 4);
    
    this.window.setPosition(x, y, false);
    this.window.show();
    this.window.focus();
  }

  setupIPC() {
    ipcMain.on('start-timer', (event, seconds) => {
      this.startTimer(seconds);
    });

    ipcMain.on('stop-timer', () => {
      this.stopTimer();
    });

    ipcMain.on('reset-timer', () => {
      this.resetTimer();
    });

    ipcMain.on('get-timer-state', (event) => {
      event.reply('timer-state', {
        isRunning: this.isRunning,
        timeRemaining: this.timeRemaining,
        totalTime: this.totalTime
      });
    });

    ipcMain.on('update-notification-settings', (event, settings) => {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      store.set('notificationSettings', this.notificationSettings);
    });
  }

  startTimer(seconds) {
    if (this.isRunning) return;
    
    this.totalTime = seconds;
    this.timeRemaining = seconds;
    this.isRunning = true;
    
    // Notify timer start
    this.showNotification('start', 'Timer Started', `${this.formatTime(seconds)} timer is now running.`);
    this.playNotificationSound('start');
    
    this.timer = setInterval(() => {
      this.timeRemaining--;
      
      // Update tray title with remaining time
      this.updateTrayTitle(this.formatTime(this.timeRemaining));
      
      // Send update to renderer
      if (this.window && !this.window.isDestroyed() && this.window.webContents) {
        try {
          this.window.webContents.send('timer-update', {
            isRunning: this.isRunning,
            timeRemaining: this.timeRemaining,
            totalTime: this.totalTime
          });
        } catch (error) {
          // Window or webContents has been destroyed, ignore error
        }
      }
      
      if (this.timeRemaining <= 0) {
        this.timerComplete();
      }
    }, 1000);
  }

  stopTimer() {
    if (!this.isRunning) return;
    
    const wasRunning = this.isRunning;
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.updateTrayTitle('⏱');
    
    // Only show stop notification if manually stopped (not on completion)
    if (wasRunning && this.timeRemaining > 0) {
      this.showNotification('pause', 'Timer Stopped', `Timer paused with ${this.formatTime(this.timeRemaining)} remaining.`);
      this.playNotificationSound('pause');
    }
    
    // Send update to renderer
    if (this.window && !this.window.isDestroyed() && this.window.webContents) {
      try {
        this.window.webContents.send('timer-update', {
          isRunning: this.isRunning,
          timeRemaining: this.timeRemaining,
          totalTime: this.totalTime
        });
      } catch (error) {
        // Window or webContents has been destroyed, ignore error
      }
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timeRemaining = 0;
    this.totalTime = 0;
    
    this.updateTrayTitle('⏱');
    
    // Send update to renderer
    if (this.window && !this.window.isDestroyed() && this.window.webContents) {
      try {
        this.window.webContents.send('timer-update', {
          isRunning: this.isRunning,
          timeRemaining: this.timeRemaining,
          totalTime: this.totalTime
        });
      } catch (error) {
        // Window or webContents has been destroyed, ignore error
      }
    }
  }

  timerComplete() {
    this.stopTimer();
    
    // Show enhanced notification
    this.showNotification('complete', 'Timer Complete!', `Your ${this.formatTime(this.totalTime)} timer has finished.`);
    
    // Flash tray icon sequence
    this.flashTrayIcon();
    
    // Play completion sound
    this.playNotificationSound('complete');
  }

  showNotification(type, title, body) {
    // Check if visual notifications are enabled
    if (!this.notificationSettings.visualNotifications) {
      return;
    }

    // Create system notification
    const notification = new Notification({
      title: title,
      body: body,
      icon: path.join(__dirname, '../build/icon.png'),
      sound: false, // We'll handle sound separately for better control
      urgency: type === 'complete' ? 'critical' : 'normal'
    });

    notification.show();

    // Auto-dismiss after 5 seconds for non-critical notifications
    if (type !== 'complete') {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Show window on completion notification
    if (type === 'complete') {
      notification.on('click', () => {
        this.showWindow();
      });
    }
  }

  playNotificationSound(type) {
    // Check if sound notifications are enabled
    if (!this.notificationSettings.soundNotifications) {
      return;
    }
    
    // Play different sounds for different notifications
    if (type === 'complete') {
      this.playCompletionSound();
    } else if (type === 'start') {
      this.playStartSound();
    } else if (type === 'pause') {
      this.playPauseSound();
    }
  }

  playCompletionSound() {
    // Play system completion sound
    try {
      const { shell } = require('electron');
      
      // Use macOS system sound
      if (process.platform === 'darwin') {
        require('child_process').exec('afplay /System/Library/Sounds/Glass.aiff');
      }
    } catch (error) {
      console.log('Could not play system sound:', error);
    }
  }

  playStartSound() {
    try {
      if (process.platform === 'darwin') {
        require('child_process').exec('afplay /System/Library/Sounds/Tink.aiff');
      }
    } catch (error) {
      console.log('Could not play start sound:', error);
    }
  }

  playPauseSound() {
    try {
      if (process.platform === 'darwin') {
        require('child_process').exec('afplay /System/Library/Sounds/Pop.aiff');
      }
    } catch (error) {
      console.log('Could not play pause sound:', error);
    }
  }

  flashTrayIcon() {
    let flashCount = 0;
    const maxFlashes = 6;
    
    const flashInterval = setInterval(() => {
      if (flashCount >= maxFlashes) {
        clearInterval(flashInterval);
        this.updateTrayTitle('⏱');
        return;
      }
      
      // Alternate between alert and normal states
      this.updateTrayTitle(flashCount % 2 === 0 ? '🔔' : '⏰');
      flashCount++;
    }, 500);
  }

  formatTime(seconds) {
    if (seconds <= 0) return '⏱';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // Clean up method for app shutdown
  cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }
}

// Global menuTimer instance for cleanup
let menuTimerInstance = null;

// App event handlers
app.whenReady().then(() => {
  menuTimerInstance = new MenuTimer();
  menuTimerInstance.init();
});

app.on('window-all-closed', (e) => {
  // Prevent app from quitting when all windows are closed
  e.preventDefault();
});

app.on('activate', () => {
  // On macOS, don't create new windows when dock icon is clicked
});

// Handle app termination
app.on('before-quit', () => {
  // Clean up any running timers
  if (menuTimerInstance) {
    menuTimerInstance.cleanup();
  }
});