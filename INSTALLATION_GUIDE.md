# Chronos Installation Guide

## Common Installation Issues & Solutions

### 1. "App can't be opened because it is from an unidentified developer"

**Solution:**
1. Right-click on Chronos.app in Applications folder
2. Select "Open" from context menu
3. Click "Open" in the dialog that appears
4. The app will now run and be remembered as safe

**Alternative:**
```bash
# Remove quarantine attribute (run in Terminal)
sudo xattr -rd com.apple.quarantine /Applications/Chronos.app
```

### 2. "Chronos is damaged and can't be opened"

**Solution:**
```bash
# Remove quarantine and extended attributes
sudo xattr -cr /Applications/Chronos.app
```

### 3. Gatekeeper Blocking Installation

**Temporary Disable (not recommended):**
```bash
sudo spctl --master-disable
# Install the app, then re-enable:
sudo spctl --master-enable
```

**Better Solution:**
```bash
# Allow this specific app
sudo spctl --add /Applications/Chronos.app
```

### 4. Architecture Compatibility Issues

**Check your Mac type:**
- **Intel Macs**: Use `Chronos-1.0.0.dmg`
- **Apple Silicon (M1/M2/M3)**: Use `Chronos-1.0.0-arm64.dmg`

**Check your architecture:**
```bash
uname -m
# x86_64 = Intel
# arm64 = Apple Silicon
```

### 5. Permission Issues

**Fix permissions:**
```bash
sudo chmod +x /Applications/Chronos.app/Contents/MacOS/Chronos
```

## Step-by-Step Installation

### Method 1: Standard Installation
1. Download the appropriate DMG file for your Mac
2. Double-click the DMG to mount it
3. Drag Chronos to the Applications folder
4. Right-click Chronos in Applications → "Open"
5. Click "Open" when warned about unidentified developer

### Method 2: Terminal Installation (if issues persist)
```bash
# 1. Download and mount DMG
# 2. Copy app to Applications
cp -R "/Volumes/Chronos 1.0.0/Chronos.app" /Applications/

# 3. Remove quarantine
sudo xattr -cr /Applications/Chronos.app

# 4. Fix permissions
sudo chmod +x /Applications/Chronos.app/Contents/MacOS/Chronos

# 5. Allow through Gatekeeper
sudo spctl --add /Applications/Chronos.app
```

## Troubleshooting Commands

### Check what's blocking the app:
```bash
spctl -a -v /Applications/Chronos.app
```

### List extended attributes:
```bash
xattr -l /Applications/Chronos.app
```

### Check app signature:
```bash
codesign -dv /Applications/Chronos.app
```

## Contact Support

If you continue experiencing issues:
1. Share the specific error message
2. Include your macOS version: `sw_vers`
3. Include your Mac architecture: `uname -m`