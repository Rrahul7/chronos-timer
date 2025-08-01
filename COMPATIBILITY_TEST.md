# Chronos Compatibility Test Guide

## For Testers: Verify Installation

### System Requirements Check
```bash
# Check macOS version (needs 10.15+)
sw_vers

# Check architecture 
uname -m
# x86_64 = Intel Mac
# arm64 = Apple Silicon Mac
```

### Download the Right Version
- **Intel Mac**: Use `Chronos-1.0.0.dmg`
- **Apple Silicon**: Use `Chronos-1.0.0-arm64.dmg`

### Installation Test Steps
1. Download appropriate DMG
2. Double-click to mount
3. Drag to Applications
4. Right-click → Open (first time only)
5. Verify timer appears in menu bar
6. Test basic functionality:
   - Set 30-second timer
   - Verify sound notification
   - Verify visual notification
   - Check settings panel

### Report Issues
If installation fails, please provide:
- macOS version: `sw_vers`
- Mac architecture: `uname -m`
- Exact error message
- Screenshot if possible

### Common Fixes
```bash
# If "damaged" error:
sudo xattr -cr /Applications/Chronos.app

# If permission issues:
sudo chmod +x /Applications/Chronos.app/Contents/MacOS/Chronos

# If Gatekeeper blocks:
sudo spctl --add /Applications/Chronos.app
```