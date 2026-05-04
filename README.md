# 🌵 Badlands RPG: Cartel Estado

![Badlands Banner](https://img.shields.io/badge/Release-AAA_Quality-c9a444?style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo-SDK_55-000000?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-v0.74-61DAFB?style=for-the-badge&logo=react)

**Badlands RPG** is a high-fidelity, open-world survival experience set in the gritty, cartel-dominated borderlands. Built with a proprietary **Volumetric Voxel Pixel Engine**, the game delivers a unique "AAA Pixel Art" aesthetic that combines the charm of retro visuals with modern depth, lighting, and procedural complexity.

## 🚀 Key Features

### 🎨 AAA Volumetric Pixel Engine
*   **3D Depth Rendering:** Every building, tree, and vehicle is rendered as a volumetric voxel block, providing consistent lighting and perspective.
*   **Dynamic Day/Night Cycle:** Realistic lighting shifts with hue-shifting shadows and glowing neon accents that activate at dusk.
*   **Retro Dithering:** Hand-crafted dithering algorithms create organic textures for dirt, grass, and weathered concrete.

### 🗺️ Procedural World Generation
*   **Regional Ecosystems:** Distinct biomes including the **Sinaloa Mountains** (poppy plantations), **Michoacán Forest** (dense foliage), and **Tijuana Slums** (gritty urban shacks).
*   **Landmarks:** Hand-crafted, high-resolution landmarks like the **Rooster Fighting Pit**, **Cartel Ranches**, and **Vegas Casinos**.
*   **Infinite Variety:** No two sectors are identical, with procedurally generated road networks, street props, and vehicle wrecks.

### 📱 Professional UI/UX
*   **Adaptive HUD:** A responsive interface that scales from mobile handsets to desktop displays.
*   **Cinematic Rotation:** Seamlessly switches to a full-screen, minimalist "Cinematic Mode" in landscape orientation to maximize immersion.
*   **Deep Systems:** Integrated inventory, crafting, and scavenging mechanics.

## 🛠️ Tech Stack

*   **Framework:** [Expo](https://expo.dev/) (React Native)
*   **Core Logic:** TypeScript
*   **Rendering:** Custom HTML5 Canvas Engine (WebView-based)
*   **Icons:** Lucide-React-Native
*   **State Management:** Custom React Hooks & Context

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/badlands-rpg.git
    cd badlands-rpg/expo-badlands-rpg
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npx expo start
    ```

4.  **Run on your device:**
    Scan the QR code with the **Expo Go** app (Android) or **Camera app** (iOS).

## 📂 Project Structure

```text
src/
├── app/              # Expo Router pages
├── components/       # Reusable UI components
├── hooks/            # Game logic & state hooks
├── lib/              # Constants, types, and utilities
└── rendering/        # The Voxel/Pixel Engine
    ├── pixelEngine.ts   # Core volumetric drawing tools
    ├── landmarks.ts     # Landmark-specific assets
    └── nature.ts        # Procedural environment assets
```

## 📜 License

© 2026 Badlands RPG Team. All rights reserved. Professional Grade Production.
