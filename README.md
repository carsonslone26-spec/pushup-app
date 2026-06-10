# Stellar Rogue

A fast-paced roguelite space shooter with gorgeous visuals, procedural music, and addictive gameplay. Survive waves of increasingly dangerous enemies, collect powerful weapons, and upgrade your ship between runs.

![Stellar Rogue](https://img.shields.io/badge/version-1.0.0-00ffcc)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20Mac-blue)
![Engine](https://img.shields.io/badge/engine-Phaser%203-purple)

## Features

### Core Gameplay
- **Smooth 60fps** arcade action with responsive controls
- **6 enemy types** with unique AI behaviors (Chase, Strafe, Bomb, Snipe, Tank, Swarm)
- **3 boss encounters** with multi-phase attack patterns
- **5 weapon types**: Pulse Laser, Plasma Cannon, Spread Shot, Homing Missiles, Ion Beam
- **Procedural wave generation** with dynamic difficulty scaling
- **Weapon drops** from enemies - collect new weapons mid-run

### Roguelite Progression
- **10 permanent upgrades** between runs (Damage, Fire Rate, Speed, Health, Shield, Shield Regen, Dash, Magnet, Luck, Crit)
- **Credit system** - earn currency to invest in your ship
- **Persistent stats** tracking total runs, best wave, kills, and more
- **Multiple ship builds** via different upgrade paths

### Visual & Audio Polish
- **WebGL rendering** with particle effects and smooth animations
- **Procedural electronic soundtrack** that responds to gameplay intensity
- **Screen shake** and hit flash for impactful combat
- **Multi-layer parallax starfield** with nebula effects
- **Damage numbers** with critical hit indicators
- **Minimap** showing enemy positions

### User Interface
- **Full menu system** - Main menu, Settings, Upgrades, Pause, Game Over
- **HUD** with health/shield bars, XP progress, wave counter, score, and minimap
- **Settings** - Volume sliders, screen shake toggle, damage numbers toggle
- **Save system** using localStorage (works in browser and Electron)

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| Left Click / Space | Fire (auto-fire is enabled by default) |
| Shift | Dash (invulnerable dodge) |
| Q / 1-3 | Switch weapons |
| ESC | Pause |
| F11 | Toggle fullscreen (Electron) |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Opens the game at http://localhost:3000

### Production Build
```bash
npm run build
```
Outputs static files to `dist/` folder.

### Electron (Desktop/Steam)
```bash
npm run electron
```
Runs the game in a desktop window.

### Building for Steam
```bash
npm run electron:build
```
Produces platform-specific installers in the `release/` folder.

## Steam Distribution

This game is packaged with Electron for Steam distribution. To publish:

1. Run `npm run electron:build` to create the distributable
2. Create a Steamworks partner account at https://partner.steamgames.com
3. Set up your app in the Steamworks dashboard
4. Upload the build using SteamPipe (Valve's upload tool)
5. Configure store page, achievements, etc.

The Electron wrapper provides:
- Native window management
- Fullscreen support
- Proper Steam overlay integration
- Save data in the standard user data directory

## Architecture

```
src/
├── main.js              # Game configuration & entry point
├── scenes/              # Phaser scenes
│   ├── BootScene.js     # Initial boot
│   ├── PreloadScene.js  # Asset generation (procedural)
│   ├── MainMenuScene.js # Main menu with stats
│   ├── GameScene.js     # Core gameplay loop
│   ├── HUDScene.js      # In-game UI overlay
│   ├── PauseScene.js    # Pause menu
│   ├── GameOverScene.js # Results screen
│   ├── UpgradeScene.js  # Permanent upgrades shop
│   └── SettingsScene.js # Audio/visual settings
├── entities/            # Game objects
│   ├── Player.js        # Player ship with stats & abilities
│   ├── Enemy.js         # Enemy base with AI behaviors
│   └── Boss.js          # Boss encounters with phases
├── systems/             # Game systems
│   ├── ProjectileManager.js  # Bullet pools & homing logic
│   ├── EnemyManager.js       # Spawning & formations
│   ├── WaveManager.js        # Wave progression & difficulty
│   ├── ParticleManager.js    # Visual effects
│   ├── PickupManager.js      # Loot drops & magnets
│   ├── SaveManager.js        # Persistent save data
│   └── MusicManager.js       # Procedural audio
├── utils/
│   └── Constants.js     # Game balance data
electron/
└── main.js              # Electron window setup
```

## Tech Stack
- **Phaser 3** - Game framework (WebGL)
- **Vite** - Build tool & dev server
- **Electron** - Desktop packaging for Steam
- **Web Audio API** - Procedural sound & music

## License
MIT
