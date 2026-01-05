# Phaser 3 + Electron + Steam Game

A complete HTML5 game built with Phaser 3, packaged with Electron, and integrated with Steam using steamworks.js. This project follows the **Composition Pattern** architecture for maximum modularity and AI-assisted development efficiency.

## 🎮 Features

- **Phaser 3 Game Engine** - Full-featured 2D game framework
- **Electron Desktop Wrapper** - Native desktop application
- **Steam Integration** - Achievements, Rich Presence, and Steam Deck support
- **Component-Based Architecture** - Modular, reusable game logic
- **Steam Deck Verified Ready** - Dynamic input prompts and virtual keyboard support
- **Object Pooling** - Optimized performance for 60 FPS gameplay

## 🏗️ Architecture

This project uses a **Composition over Inheritance** pattern:

```
Entity (Sprite)
  ├─ MovementComponent
  ├─ HealthComponent
  ├─ ShootingComponent
  └─ AIComponent
```

Each component is a standalone, reusable class that can be attached to any GameObject.

## 📁 Project Structure

```
Html5/
├── src/
│   ├── electron/
│   │   ├── main.js          # Electron main process
│   │   └── preload.js       # IPC bridge
│   └── game/
│       ├── index.html       # Game HTML
│       └── js/
│           ├── main.js      # Phaser config
│           ├── core/
│           │   ├── BaseComponent.js
│           │   ├── GameManager.js
│           │   └── SteamDeckUI.js
│           ├── components/
│           │   ├── MovementComponent.js
│           │   ├── HealthComponent.js
│           │   ├── AnimationComponent.js
│           │   ├── ShootingComponent.js
│           │   └── EnemyAIComponent.js
│           ├── factories/
│           │   ├── PlayerFactory.js
│           │   └── EnemyFactory.js
│           └── scenes/
│               ├── BootScene.js
│               └── MainScene.js
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Steam client (for testing Steam features)

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:linux  # Linux
npm run build:all    # All platforms
```

## 🎯 Game Controls

### Keyboard
- **WASD** / **Arrow Keys** - Move
- **SPACE** - Shoot

### Steam Deck
- **Left Stick** - Move
- **A Button** - Shoot

## 🔧 Steam Integration

### Setting Up Steam

1. Replace the App ID in `src/electron/main.js`:
   ```javascript
   const client = steamworks.init(YOUR_APP_ID); // Replace 480
   ```

2. Add your achievements in Steam Partner dashboard

3. Test with `steam_appid.txt` in root directory:
   ```
   YOUR_APP_ID
   ```

### Steam Features Implemented

- ✅ **Initialization** - Auto-detects Steam client
- ✅ **User Info** - Retrieves Steam username
- ✅ **Achievements** - Unlock achievements via `GameManager.unlockAchievement()`
- ✅ **Rich Presence** - Shows current game state
- ✅ **Steam Deck Detection** - `isOnSteamDeck()` API
- ✅ **Virtual Keyboard** - Steam Deck on-screen keyboard support
- ✅ **Overlay Support** - Steam overlay (Shift+Tab) enabled

## 🎨 Component System

### Creating a Custom Component

```javascript
import BaseComponent from '../core/BaseComponent.js';

class CustomComponent extends BaseComponent {
    constructor(gameObject, scene, config = {}) {
        super(gameObject, scene, config);
        // Your initialization
    }

    onEnable() {
        // Called when component is enabled
    }

    update(time, delta) {
        // Called every frame
    }

    destroy() {
        // Cleanup
        super.destroy();
    }
}

export default CustomComponent;
```

### Using Components

```javascript
// Create entity
const player = scene.add.sprite(x, y, 'player');
scene.physics.add.existing(player);

// Add components
const movement = new MovementComponent(player, scene, { speed: 200 });
const health = new HealthComponent(player, scene, { maxHealth: 100 });

// Enable components
movement.enable();
health.enable();
```

## 🔌 IPC Bridge (Main ↔ Renderer)

The preload script exposes a secure Steam API to the renderer process:

```javascript
// In game code (renderer)
const userName = await window.steam.getUserName();
const isOnDeck = await window.steam.isOnSteamDeck();
await window.steam.unlockAchievement('ACH_FIRST_GAME');
```

## ⚡ Performance Optimizations

- **Object Pooling** - Bullets are recycled, not created/destroyed
- **Texture Atlases** - Ready for sprite sheet integration
- **WebGL Batching** - Optimized draw calls
- **Electron Flags** - Hardware acceleration enabled
- **ASAR Packaging** - Faster file loading

## 🛠️ Development Tips

### Running with DevTools

```bash
npm run dev
```

This opens the Electron DevTools for debugging.

### Testing Without Steam

The game gracefully degrades when Steam is not available. All Steam APIs have fallback behaviors.

### Adding New Enemies

```javascript
import EnemyFactory from './factories/EnemyFactory.js';

const enemy = EnemyFactory.create(scene, x, y, playerReference);
scene.enemies.add(enemy);
```

## 📦 Building for Steam

### electron-builder Configuration

The `package.json` includes build configuration:

```json
{
  "build": {
    "asar": true,
    "files": ["src/**/*", "assets/**/*"],
    "win": { "target": ["nsis"] },
    "linux": { "target": ["AppImage"] }
  }
}
```

### Deployment Checklist

- [ ] Replace App ID in `main.js`
- [ ] Add game assets to `assets/` folder
- [ ] Configure achievements in Steam dashboard
- [ ] Build for target platforms
- [ ] Upload to SteamPipe via `steamcmd`
- [ ] Test on Steam Deck (if targeting Verified status)

## 🎓 Architecture Benefits

### Why Composition?

1. **Modularity** - Each component is isolated and testable
2. **Reusability** - Components work on any GameObject
3. **AI-Friendly** - Small files are easier for AI to reason about
4. **Maintainability** - Changes to one component don't affect others

### Why Electron?

1. **JavaScript Throughout** - No language switching
2. **Stable Runtime** - Bundled Chromium ensures consistency
3. **Steam Integration** - Native Node.js addon support
4. **Cross-Platform** - Windows, Linux, macOS from one codebase

### Why Phaser 3?

1. **LLM Training Data** - Extensive documentation in AI training sets
2. **Batteries Included** - Physics, audio, input all built-in
3. **Active Community** - Large ecosystem of examples
4. **WebGL Performance** - Hardware-accelerated 2D rendering

## 📝 License

MIT

## 🤝 Contributing

This project is designed for AI-assisted development. When extending:

1. Keep components under 100 lines
2. Use the factory pattern for entity creation
3. Emit events for inter-component communication
4. Test on both desktop and Steam Deck

## 🔗 Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [steamworks.js GitHub](https://github.com/ceifa/steamworks.js)
- [Steam Partner Documentation](https://partner.steamgames.com/doc/home)

---

**Built with the Generative Game Development Blueprint** - Architected for AI agents and human developers working together.