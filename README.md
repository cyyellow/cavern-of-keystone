# The Cavern of Keystone

A single-player typing-based tower defense game built with React, TypeScript, and CSS. Defend your tower by typing words to unleash powerful skills against incoming enemies!

## 🎮 Features

### **Core Gameplay**
- **Typing-based Combat**: Type words to activate skills and defeat enemies
- **Four Unique Skills**:
  - **Heal** (3 letters): Restore health
  - **Bullet** (5 letters): Shoot projectiles at enemies
  - **Wind** (7 letters): Knockback attack with wind effects
  - **Impact** (9 letters): Devastating area-of-effect attack
- **Ultimate Skill**: Build up energy to unleash a powerful screen-clearing ultimate attack

### **Enemy Types**
- **Wisp** (weak, fast)
- **Bat** (medium health, medium speed) - Randomly spawns as blue or purple variants
- **Ghost** (strong, slow, reduced knockback resistance)
- **Eyeball** (slides and walks with different movement patterns)
- **Undead Boss** (final boss with special death animation)

### **Game Systems**
- **Wave-based Progression**: 10 unique waves plus infinite mode
- **Difficulty Levels**: Easy (20 WPM), Normal (40 WPM), Hard (60 WPM)
- **Infinite Mode**: Endless waves for high-score chasing
- **Health & Energy Systems**: Manage health and energy for ultimate attacks
- **Score & WPM Tracking**: Track your typing performance
- **Visual Effects**: Impact effects, fire effects, wind effects, and more

### **Audio & Visual**
- **Pixel Art Sprites**: Hand-crafted pixel art animations
- **Sound Effects**: Audio feedback for all actions (bullets, impacts, healing, etc.)
- **Background Music**: Dynamic music that changes based on game state
- **Visual Effects**: Screen-shaking impacts, floating damage numbers, death animations

## 🎯 How to Play

1. **Choose Difficulty**: Select Easy, Normal, or Hard mode
2. **Choose Game Mode**: Standard game or Infinite mode
3. **Type to Attack**: Type the words that appear to activate skills
4. **Manage Resources**: Watch your health and energy bars
5. **Defeat the Boss**: Survive 10 waves to face the Undead Boss
6. **Aim for High Scores**: Try to achieve the highest WPM and score possible!

## ⌨️ Controls

- **Typing**: Type letters to complete words and activate skills
- **Enter**: Manually trigger completed skills
- **Mouse**: Click buttons for menus and restarting

## 🚀 Installation & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── StartScreen.tsx      # Game start screen with difficulty selection
│   ├── GameScreen.tsx       # Main game interface
│   ├── GameOverScreen.tsx   # Game over screen with stats
│   ├── WinScreen.tsx        # Victory screen
│   ├── Player.tsx           # Player character with idle animation
│   ├── Enemy.tsx            # Enemy sprites and animations
│   ├── Bullet.tsx           # Bullet projectiles
│   ├── WordDisplay.tsx      # Word typing interface
│   ├── SkillBar.tsx         # Skill cooldown indicators
│   ├── DamageEffect.tsx     # Floating damage numbers
│   ├── PlayerDeathAnimation.tsx  # Player death sequence
│   ├── UndeadDeathAnimation.tsx  # Boss death sequence
│   ├── FireEffect.tsx       # Fire visual effects
│   ├── Impact.tsx           # Impact visual effects
│   ├── Wind.tsx             # Wind visual effects
│   ├── UltimateVfx.tsx      # Ultimate skill effects
│   ├── StrikeEffect.tsx     # Strike visual effects
│   ├── Crystal.tsx          # Enemy spawn crystal
│   ├── HintDisplay.tsx      # Game hints and tips
│   ├── WaveDisplay.tsx      # Wave progress indicator
│   ├── WaveAnnouncement.tsx # Wave transition announcements
│   └── GameOverScreen.tsx   # Game over interface
├── config/                  # Game configuration
│   ├── gameConfig.ts        # Core game settings and enemy stats
│   ├── skillConfig.ts       # Skill definitions and properties
│   ├── waveConfig.ts        # Wave configurations and enemy spawns
│   └── difficultyConfig.ts  # Difficulty multipliers and settings
├── hooks/                   # Custom React hooks
│   └── useGameLoop.ts       # 60 FPS game loop
├── reducers/                # State management
│   └── gameReducer.ts       # Game state reducer with all actions
├── utils/                   # Utility functions
│   ├── gameLogic.ts         # Core game mechanics and collision detection
│   ├── gameUtils.ts         # Helper functions and calculations
│   ├── audioManager.ts      # Audio playback management
│   ├── skillWordLoader.ts   # Word list loading for skills
│   └── waveSpawner.ts       # Enemy spawning and wave management
├── types.ts                 # TypeScript type definitions
├── index.css                # Global styles and animations
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

## 🎨 Assets

The game uses carefully curated pixel art assets:

- **`public/assets/sprites/`** - Character spritesheets and animations
- **`public/assets/images/`** - UI elements and backgrounds  
- **`public/assets/vfx/`** - Visual effects (fire, impact, wind, ultimate, strike)
- **`public/assets/bullet/`** - Bullet animations
- **`public/assets/sfx/`** - Sound effects and background music
- **`public/assets/`** - Font files for UI typography
- **Word Lists**: `words.txt`, `words3.txt`, `words7.txt`, `words9.txt` (filtered for family-friendly content)

## 🎯 Game Mechanics

### **Skill System**
- Each skill requires typing a word of specific length
- Skills have cooldowns and visual indicators
- Ultimate skill charges over time and clears the screen

### **Enemy AI**
- Different movement patterns for each enemy type
- Boss enemies have special attack patterns
- Eyeballs have unique sliding mechanics

### **Difficulty Scaling**
- Enemy health, speed, and spawn rates scale with difficulty
- Skill effectiveness adjusts based on difficulty level
- Wave progression varies by difficulty setting

### **Visual Polish**
- Smooth 60 FPS animations
- Screen shake effects for impacts
- Floating damage numbers
- Death animations for player and boss
- Dynamic background music

## 🛠️ Technical Details

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **State Management**: useReducer for complex game state
- **Animation**: CSS-based sprite animations with requestAnimationFrame
- **Audio**: Web Audio API integration
- **Performance**: Optimized 60 FPS game loop
- **Code Quality**: TypeScript for type safety and better development experience

## 🎮 Game Modes

- **Standard Mode**: Complete 10 waves to defeat the Undead Boss
- **Infinite Mode**: Endless waves for high-score chasing
- **Difficulty Levels**: Easy (20 WPM), Normal (40 WPM), Hard (60 WPM)

## 🏆 Scoring System

- **Points**: Earn points for defeating enemies (varies by enemy type)
- **WPM Tracking**: Monitor your typing speed and accuracy
- **High Scores**: Track your best performance across different difficulties

## 🎵 Audio Features

- **Background Music**: Dynamic music that changes with game state
- **Sound Effects**: Audio feedback for all game actions
- **Volume Controls**: Adjustable audio levels

## 🚀 Deployment

The game is ready for deployment to any static hosting service:
- Vercel, Netlify, GitHub Pages, etc.
- Builds to static files with `npm run build`
- No server-side requirements

---

**Enjoy defending The Cavern of Keystone!** 🏰⚔️