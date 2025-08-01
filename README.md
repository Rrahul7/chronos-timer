# Chronos - Menu Bar Timer

[![Download](https://img.shields.io/github/downloads/Rrahul7/chronos-timer/total)](https://github.com/Rrahul7/chronos-timer/releases)
[![Latest Release](https://img.shields.io/github/v/release/Rrahul7/chronos-timer)](https://github.com/Rrahul7/chronos-timer/releases/latest)

A beautiful, feature-rich timer application that lives in your macOS menu bar.

## 📥 Quick Download

Choose the right version for your Mac:
- **Intel Mac**: [Download Chronos-1.0.0.dmg](https://github.com/Rrahul7/chronos-timer/releases/latest/download/Chronos-1.0.0.dmg)
- **Apple Silicon (M1/M2/M3)**: [Download Chronos-1.0.0-arm64.dmg](https://github.com/Rrahul7/chronos-timer/releases/latest/download/Chronos-1.0.0-arm64.dmg)


## Features

- **Menu Bar Integration**: Lives in your macOS top menu bar for easy access
- **Timer Range**: Set timers from 30 seconds to 6 hours
- **Quick Timers**: Pre-set buttons for common timer durations (30s, 1m, 5m, 10m, 30m, 1h)
- **Visual Progress**: Progress bar shows timer completion
- **Notifications**: Desktop notification when timer completes
- **Always Accessible**: Right-click menu for quick actions
- **Clean UI**: Modern, beautiful interface with gradient background

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development**:
   ```bash
   npm start
   ```

3. **Build for Distribution**:
   ```bash
   npm run build
   ```

## Usage

### Starting the Timer
1. Click the timer icon (⏱) in your menu bar
2. Set your desired time using:
   - Hours, Minutes, Seconds inputs
   - Quick timer buttons (30s, 1m, 5m, 10m, 30m, 1h)
3. Click "Start" to begin the countdown

### Timer Controls
- **Start/Stop**: Click the main button to start or stop the timer
- **Reset**: Reset the timer to zero
- **Menu Bar Display**: Current time remaining shows in the menu bar

### Right-Click Menu
Right-click the menu bar icon for quick actions:
- Start/Stop Timer
- Reset Timer
- Show Timer Window
- Quit Application

### Timer Constraints
- **Minimum**: 30 seconds
- **Maximum**: 6 hours
- Validation prevents invalid timer durations

## Technical Details

### Built With
- **Electron**: Cross-platform desktop app framework
- **Node.js**: JavaScript runtime
- **HTML/CSS/JavaScript**: Frontend technologies

### Architecture
- **Main Process** (`src/main.js`): Handles menu bar integration, timer logic, and system notifications
- **Renderer Process** (`src/renderer.html/css/js`): User interface and timer controls
- **IPC Communication**: Seamless communication between main and renderer processes

### Key Files
- `src/main.js` - Main Electron process, menu bar integration
- `src/renderer.html` - Timer UI structure
- `src/renderer.css` - Styling and animations
- `src/renderer.js` - Timer controls and state management
- `package.json` - Project configuration and dependencies

## Development

### Scripts
- `npm start` - Run in development mode
- `npm run dev` - Run with development flags
- `npm run build` - Build application for distribution
- `npm run dist` - Create distributable packages

### Platform Support
- **Primary**: macOS (menu bar integration)
- **Potential**: Windows/Linux (with modifications for system tray)

## Features in Detail

### Menu Bar Integration
- Displays current timer status
- Shows remaining time during countdown
- Template icon that adapts to system theme
- Hides from dock to stay unobtrusive

### Timer Functionality
- Accurate second-by-second countdown
- Persists timer state across window open/close
- Visual and audio notification on completion
- Progress indicator for visual feedback

### User Interface
- Responsive design with hover effects
- Input validation with helpful error messages
- Quick-access timer buttons for common durations
- Smooth animations and transitions

## License

MIT License - Feel free to use and modify as needed.