# Changelog

All notable changes to the **Badlands RPG** project will be documented in this file.

## [1.2.0] - 2026-04-30
### 🚀 Added
- **AAA Voxel Engine:** Initial release of the proprietary volumetric pixel engine.
- **Tijuana Slums:** New regional building style featuring rusted corrugated roofs and side-shack attachments.
- **Crop Plantations:** Procedural plantation logic for Sinaloa and Michoacán, including poppy flower variants.
- **Rooster Fighting Pit:** Redesigned landmark with an outdoor dirt ring, fencing, and atmospheric lighting.
- **Cinematic Landscape Mode:** Added automatic HUD hiding and immersive layout switching on device rotation.

### 🛠️ Changed
- **Vehicle Rendering:** Replaced procedural primitives with high-resolution voxel models for sedans, pickups, SUVs, and lowriders.
- **UI Responsiveness:** Migrated to `useWindowDimensions` for real-time layout updates across all device sizes.
- **Rendering Pipeline:** Shifted to a pre-rendered static world approach for massive performance gains at high zoom levels.

### 🐞 Fixed
- **WebView Scoping:** Resolved a critical bug where injected scripts couldn't access camZoom variables.
- **Syntax Stability:** Fixed several unterminated template literals and JSX tags that were causing build crashes.
- **Layout Overlap:** Resolved visual conflict between the Event Log and the Sector Map on mobile devices.

## [1.1.0] - 2026-04-29
### 🚀 Added
- **Basic Procedural Maps:** Initial implementation of the road and tile grid system.
- **Landmark System:** Added support for unique hand-crafted buildings across regions.

### 🛠️ Changed
- **Migration to Expo:** Successfully ported the core game loop from Vite to Expo SDK 55.

---
*Professional Grade Production Tracking*
