// 🎮 GAME CONFIGURATION - Everything in one place!
/*configures the player, enemy, bullet, game screen, and helper functions*/
// ========================================
// 🎯 PLAYER CONFIGURATION
// ========================================
export const PLAYER_CONFIG = {
  // Position on screen
  POSITION: {
    x: 100,        // Left side of screen
    y: 240,        // Will be set at runtime to 50% of viewport height
  },
  
  // Health settings
  HEALTH: {
    max: 100,
    damage: 20,   // Damage taken when enemy touches player
  },
  
  // Animation settings
  ANIMATION: {
    frames: 6,           // Number of frames in sprite sheet
    ticksPerFrame: 2,    // How many game ticks per animation frame (60/2 = 30 FPS)
  },
  
  // Visual settings
  VISUAL: {
    scale: 3,            // Sprite scale multiplier
    baseWidth: 32,       // Base sprite width before scaling
    baseHeight: 48,      // Base sprite height before scaling
  },
  
  // Hitbox settings (fractions of sprite size)
  HITBOX: {
    width: 0.4,          // 60% of sprite width
    height: 0.7,         // 70% of sprite height
    offsetX: 0.3,        // 20% offset from left edge
    offsetY: 0.15,       // 15% offset from top edge
  }
} as const;

// ========================================
// 🎯 ENEMY CONFIGURATION
// ========================================
export const ENEMY_CONFIGS = {
  wisp: {
    type: 'wisp',
    health: 10,
    speed: 1.4, // 2x faster (was 0.8)
    damage: 10,
    points: 10,
    spriteConfig: {
      frames: 10,
      direction: 'horizontal',
      scale: 2
    },
    spawn: {
      x: () => 1120,
      y: () => PLAYER_CONFIG.POSITION.y + 30,
    },
    hitbox: { width: 0.6, height: 0.6, offsetX: 0.2, offsetY: 0.2 }
  },
  eyeball: {
    type: 'eyeball',
    health: 20,
    speed: 1.2,
    damage: 8,
    points: 20,
    spriteConfig: {
      frames: 7,
      direction: 'vertical',
      scale: 2,
      sourceWidth: 39,
      sourceHeight: 48.7
    },
    spawn: {
      x: () => 1120,
      y: () => PLAYER_CONFIG.POSITION.y+35,
    },
    // Round-ish body, tighter hitbox
    hitbox: { width: 0.4, height: 0.3, offsetX: 0.3, offsetY: 0.3}
  },
  bat: {
    type: 'bat',
    health: 7,
    speed: 2.0, // 2x faster (was 1.5)
    damage: 15,
    points: 15,
    spriteConfig: {
      frames: 6,
      direction: 'vertical',
      rows: 2,
      cols: 4,
      scale: 2
    },
    spawn: {
      x: () => 1120,
      y: () => PLAYER_CONFIG.POSITION.y + 30,
    },
    hitbox: { width: 0.5, height: 0.5, offsetX: 0.25, offsetY: 0.25 }
  },
  ghost: {
    type: 'ghost',
    health: 60,
    speed: 0.5, // 2x faster (was 0.5)
    damage: 15,
    points: 20,
    spriteConfig: {
      frames: 8,
      direction: 'vertical',
      scale: 3
    },
    spawn: {
      x: () => 1120,
      y: () => PLAYER_CONFIG.POSITION.y + 20,
    },
    hitbox: { width: 0.45, height: 0.65, offsetX: 0.225, offsetY: 0.2 }
  },
  undead: {
    type: 'undead',
    health: 1000,
    speed: 0.9, // Boss moves slowly
    damage: 10, // Reduced damage per attack
    points: 100,
    spriteConfig: {
      frames: 8,
      direction: 'horizontal',
      rows: 2,
      cols: 4,
      scale: 7
    },
    spawn: {
      x: () => 1050, // Spawn at right edge
      y: () => PLAYER_CONFIG.POSITION.y - 60,
    },
    hitbox: { width: 0.5, height: 0.8, offsetX: 0.25, offsetY: 0.1 }
  },
  nothing: {
    type: 'nothing',
    health: 0,
    speed: 0,
    damage: 0,
    points: 0,
    spriteConfig: {
      frames: 1,
      direction: 'horizontal',
      scale: 1
    },
    spawn: {
      x: () => 0,
      y: () => 0,
    },
    hitbox: { width: 0, height: 0, offsetX: 0, offsetY: 0 }
  }
} as const;

export const ENEMY_CONFIG = {
  // Animation settings (applies to all enemies)
  ANIMATION: {
    defaultTicksPerFrame: 1,  
  },
  
  // Individual enemy animation speeds (optional overrides)
  ANIMATION_OVERRIDES: {
    wisp: 2,      
    bat: 2,      
    ghost: 2,     
    undead: 2,    
    eyeball: 3,
    nothing: 1,
  },
  
  // Spawn settings
  SPAWN: {
    x: 1100,  // Right edge of 1200px game area
    y: PLAYER_CONFIG.POSITION.y,  // Same y as the witch
    interval: 3000,  // Base spawn interval in ms
    randomVariation: 2000,  // Random variation added to interval
  } as { x: number; y: number; interval: number; randomVariation: number },
  
  // Visual settings
  VISUAL: {
    scale: 2,
    baseWidth: 32,
    baseHeight: 32,
  }
} as const;

// ========================================
// 🎯 BULLET CONFIGURATION  
// ========================================
export const BULLET_CONFIG = {
  // Visual settings
  VISUAL: {
    width: 20,
    height: 10,
    speed: 12,
    damage: 10,
  },
  
  // Spawn position relative to player
  SPAWN_OFFSET: {
    x: 60,  // Pixels to the right of player
    y: 70,  // Pixels below player top
  },
  
  // Hitbox configuration (ratios relative to sprite size)
  HITBOX: {
    width: 0.6,    // 60% of sprite width
    height: 0.6,   // 60% of sprite height
    offsetX: 0.4,  // 20% offset from left
    offsetY: 0.2,  // 20% offset from top
  }
} as const;

// ========================================
// 🎯 GAME SCREEN CONFIGURATION
// ========================================
export const SCREEN_CONFIG = {
  // Screen boundaries
  BOUNDARIES: {
    left: -100,     // Where enemies are removed (off left side)
    right: () => window.innerWidth + 50,  // Where bullets are removed (off right side)
  },
  
  // Collision detection
  COLLISION: {
    playerRadius: 50,  // Player collision radius
    enemySize: 64,     // Enemy collision size (32 * 2 scale)
    bulletSize: 20,    // Bullet collision size
  }
} as const;

// ========================================
// 👁️ EYEBALL SLIDE (12-frame vertical animation)
// Frames stay in the same position; only the frame changes
export const EYEBALL_SLIDE = {
  frames: 12,
  // Native per-frame size for eyeball_slide spritesheet (adjust if needed to match asset)
  sourceWidth: 128,
  sourceHeight: 48,
  // Per-frame hitbox offsets: eyeball sprite position within each 128x48 frame
  // Based on typical slide animation where eyeball moves from left to right across frame
  
  //offsets: Array.from({ length: 12 }, () => ({ x: 0, y: 0 })) as { x: number; y: number }[]
  offsets: [
    { x: 155,  y: 0 },   // Frame 0: eyeball on left side
    { x: 130, y: 0 },   // Frame 1: moving right
    { x: 110, y: 0 },   // Frame 2: continuing right
    { x: 80, y: 0 },   // Frame 3: center-left
    { x: 50, y: 0 },   // Frame 4: center
    { x: 35, y: 0 },   // Frame 5: center-right
    { x: 10, y: 0 },   // Frame 6: right side
    { x: 5, y: 0 },   // Frame 7: further right
    { x: 0, y: 0 },   // Frame 8: near right edge
    { x: 155, y: 0 },   // Frame 9: right edge
    { x: 155, y: 0 },   // Frame 10: almost off right
    { x: 155, y: 0 },   // Frame 11: far right
  ] as { x: number; y: number }[],
} as const;

// ========================================
// 🎵 AUDIO CONFIGURATION
// ========================================
export const AUDIO_CONFIG = {
  // Background music tracks
  BACKGROUND_MUSIC: {
    startScreen: {
      file: '/assets/sfx/same shit, different day.wav',
      volume: 0.3,
      loop: true,
    },
    gameScreen: {
      file: '/assets/sfx/go for it.wav',
      volume: 0.3,
      loop: true,
    },
    bossWave: {
      file: '/assets/sfx/alarm.wav',
      volume: 0.3,
      loop: true,
    },
  },
  
  // Sound effects
  SOUND_EFFECTS: {
    bullet: {
      file: '/assets/sfx/star_sparkle.wav',
      volume: 0.2, // 20% volume for SFX
    },
    hit: {
      file: '/assets/sfx/hit1.wav',
      volume: 0.2, // 30% volume for hit sound
    },
    impact: {
      file: '/assets/sfx/impact.wav',
      volume: 0.3, // 30% volume for impact sound
    },
    wind: {
      file: '/assets/sfx/wind.wav',
      volume: 0.25, // 25% volume for wind sound
    },
    heal: {
      file: '/assets/sfx/heal.wav',
      volume: 0.3, // 30% volume for heal sound
    },
    slash: {
      file: '/assets/sfx/slash.wav',
      volume: 0.3, // 30% volume for slash sound
    },
    ultimate: {
      file: '/assets/sfx/ultimate.wav',
      volume: 0.4, // 40% volume for ultimate sound
    },
  },
  
  // Audio settings
  SETTINGS: {
    masterVolume: 1.0, // Master volume control
    musicEnabled: true,
    sfxEnabled: true,
  }
} as const;

// ========================================
// 🎯 HELPER FUNCTIONS
// ========================================

// Get animation speed for any enemy type
export function getEnemyAnimationSpeed(enemyType: string): number {
  return ENEMY_CONFIG.ANIMATION_OVERRIDES[enemyType as keyof typeof ENEMY_CONFIG.ANIMATION_OVERRIDES] 
    || ENEMY_CONFIG.ANIMATION.defaultTicksPerFrame;
}

// Get enemy configuration by type
export function getEnemyConfig(enemyType: keyof typeof ENEMY_CONFIGS) {
  return ENEMY_CONFIGS[enemyType];
}

// Get player position
export function getPlayerPosition() {
  return PLAYER_CONFIG.POSITION;
}

// Get enemy spawn position
export function getEnemySpawnPosition(enemyType?: keyof typeof ENEMY_CONFIGS) {
  if (enemyType) {
    const conf = ENEMY_CONFIGS[enemyType];
    if (conf.spawn) {
      return { 
        x: typeof conf.spawn.x === 'function' ? conf.spawn.x() : conf.spawn.x,
        y: typeof conf.spawn.y === 'function' ? conf.spawn.y() : conf.spawn.y
      };
    }
  }
  return {
    x: ENEMY_CONFIG.SPAWN.x,
    y: ENEMY_CONFIG.SPAWN.y,
  };
}

// Get bullet spawn position relative to player
export function getBulletSpawnPosition(playerX: number, playerY: number) {
  return {
    x: playerX + BULLET_CONFIG.SPAWN_OFFSET.x,
    y: playerY + BULLET_CONFIG.SPAWN_OFFSET.y,
  };
}
