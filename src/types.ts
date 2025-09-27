export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteConfig {
  frames: number;
  direction: 'horizontal' | 'vertical';
  rows?: number;
  cols?: number;
  scale?: number;
  // Source frame pixel size for this spritesheet (pre-scale)
  sourceWidth?: number;
  sourceHeight?: number;
}

export interface SpawnConfig {
  x: number | (() => number);
  y: number | (() => number);
}

export interface HitboxRatios {
  width: number;     // fraction of sprite width (0..1)
  height: number;    // fraction of sprite height (0..1)
  offsetX: number;   // fraction of sprite width (0..1)
  offsetY: number;   // fraction of sprite height (0..1)
}

export interface EnemyConfig {
  type: 'wisp' | 'bat' | 'ghost' | 'undead' | 'eyeball' | 'nothing';
  health: number;
  speed: number;
  damage: number;
  points: number;
  spriteConfig: SpriteConfig;
  spawn?: SpawnConfig;
  hitbox?: HitboxRatios;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  active: boolean;
  frame: number;
}

export interface Wind {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  knockback: number;
  active: boolean;
  frame: number;
  frameTime: number;
  hitEnemies: Set<string>; // Track enemies that have been hit for damage
  knockbackEnemies: Set<string>; // Track enemies that have been knocked back
}

export interface Impact {
  id: string;
  x: number;
  y: number;
  range: number;
  totalDamage: number;
  active: boolean;
  frame: number;
  frameTime: number;
  hasHit: boolean; // Track if impact has already dealt damage
}

export type SkillType = 'heal' | 'bullet' | 'knockback' | 'impact';

export interface Skill {
  type: SkillType;
  name: string;
  description: string;
  icon: string;
  wordLength: number;
  wordList: string[];
  cooldown?: number;
  damage?: number;
  range?: number;
  knockback?: number;
  healAmount?: number;
  speed?: number;
}

export interface SkillEffect {
  id: string;
  type: 'knockback_wind' | 'ranged_impact';
  x: number;
  y: number;
  range: number;
  damage: number;
  active: boolean;
  duration: number;
  startTime: number;
}

export interface FireEffect {
  id: string;
  x: number;
  y: number;
  spriteIndex: number; // 0-4 for random sprite selection
  active: boolean;
  duration: number;
  startTime: number;
  frame: number;
  frameTime: number;
}

export interface StrikeEffect {
  id: string;
  x: number;
  y: number;
  active: boolean;
  duration: number;
  startTime: number;
  frame: number;
  frameTime: number;
}

export interface DamageEffect {
  id: string;
  x: number;
  y: number;
  value: number;
  type: 'damage' | 'heal';
  active: boolean;
  duration: number;
  startTime: number;
  opacity: number;
}

export interface UndeadDeathAnimation {
  active: boolean;
  frame: number;
  startTime: number;
  x: number;
  y: number;
}

export interface Enemy extends Position {
  id: string;
  type: 'wisp' | 'bat' | 'ghost' | 'undead' | 'eyeball' | 'nothing';
  health: number;
  dying?: boolean; // New field to track if enemy is in death animation
  maxHealth: number;
  speed: number;
  damage: number;
  points: number;
  frame: number;
  active: boolean;
  config: EnemyConfig;
  // Optional behavior fields for special enemies
  state?: 'normal' | 'slide';
  baseX?: number;
  baseY?: number;
  slidePhase?: number;
  lastCollisionTime?: number;
  // Boss-specific fields
  bossState?: 'moving' | 'attacking' | 'cooldown';
  attackPhase?: 'slow_attacks' | 'fast_attacks';
  attackCount?: number;
  lastAttackTime?: number;
  targetX?: number;
  hasReachedTarget?: boolean;
  lastAttackFrame?: number; // Track the last frame when an attack was performed
}

export interface Player extends Position {
  health: number;
  maxHealth: number;
  frame: number;
  status: 'idle' | 'damaged';
}

export interface WaveState {
  currentWaveId: number;
  completedWaves: number;
  waveStartTime: number;
  nextSpawnTime: number;
  currentEnemyIndex: number;
  isWaveActive: boolean;
  waveDelayRemaining: number;
  currentLoopCount: number; // Track how many of current enemy type we've spawned
  isBossWaveSpawned: boolean; // Track if boss wave has been fully spawned
}

export interface GameState {
  currentScreen: 'start' | 'game' | 'gameOver' | 'win';
  score: number;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  winds: Wind[];
  impacts: Impact[];
  currentWord: string;
  nextWord: string;
  typedIndex: number;
  words: string[];
  gameRunning: boolean;
  waveState: WaveState;
  selectedSkill: SkillType;
  skills: Skill[];
  skillEffects: SkillEffect[];
  fireEffects: FireEffect[];
  strikeEffects: StrikeEffect[];
  damageEffects: DamageEffect[];
  showHints: boolean;
  enableTutorialWave: boolean;
  enableInfiniteMode: boolean;
  crystalFlashing: boolean;
  crystalInDarkMode: boolean;
  playerDeathAnimation: {
    active: boolean;
    frame: number;
    startTime: number;
  };
  undeadDeathAnimation: UndeadDeathAnimation;
  waveAnnouncement: {
    visible: boolean;
    waveNumber: number;
    hint?: string;
  };
  currentHint: string;
  // WPM tracking
  wpmTracking: {
    startTime: number | null; // When WPM tracking started (wave 2)
    endTime: number | null; // When WPM tracking ended (game over)
    charactersTyped: number; // Total characters typed
    wordsTyped: number; // Total words completed
  };
  // Ultimate skill system
  ultimateEnergy: number; // Energy percentage (0-100)
  ultimateReady: boolean; // Whether ultimate is ready to use
  ultimateActive: boolean; // Whether ultimate is currently active
  // Ultimate visual effect
  ultimateVfx?: {
    active: boolean;
    frame: number;
    frameTime: number; // ms accumulated
    startTime: number; // ms timestamp
  };
  
  // Tutorial state tracking
  diedInTutorial: boolean;
  
  // Difficulty settings
  difficulty: 'easy' | 'normal' | 'hard';
}

export type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'GAME_OVER' }
  | { type: 'WIN_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'LOAD_WORDS'; payload: string[] }
  | { type: 'UPDATE_PLAYER'; payload: Partial<Player> }
  | { type: 'ADD_ENEMY'; payload: Enemy }
  | { type: 'REMOVE_ENEMY'; payload: string }
  | { type: 'UPDATE_ENEMY'; payload: { id: string; updates: Partial<Enemy> } }
  | { type: 'ADD_BULLET'; payload: Bullet }
  | { type: 'REMOVE_BULLET'; payload: string }
  | { type: 'UPDATE_BULLET'; payload: { id: string; updates: Partial<Bullet> } }
  | { type: 'ADD_WIND'; payload: Wind }
  | { type: 'REMOVE_WIND'; payload: string }
  | { type: 'UPDATE_WIND'; payload: { id: string; updates: Partial<Wind> } }
  | { type: 'ADD_IMPACT'; payload: Impact }
  | { type: 'REMOVE_IMPACT'; payload: string }
  | { type: 'UPDATE_IMPACT'; payload: { id: string; updates: Partial<Impact> } }
  | { type: 'UPDATE_WORD'; payload: { word: string; typedIndex: number } }
  | { type: 'UPDATE_NEXT_WORD'; payload: string }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'TICK' }
  | { type: 'START_WAVE'; payload: { waveId: number; startTime: number } }
  | { type: 'COMPLETE_WAVE' }
  | { type: 'UPDATE_WAVE_STATE'; payload: Partial<WaveState> }
  | { type: 'SPAWN_ENEMY_FROM_WAVE'; payload: { enemyType: string; count: number } }
  | { type: 'SELECT_SKILL'; payload: SkillType }
  | { type: 'LOAD_SKILL_WORDS'; payload: { [key: string]: string[] } }
  | { type: 'ADD_SKILL_EFFECT'; payload: SkillEffect }
  | { type: 'REMOVE_SKILL_EFFECT'; payload: string }
  | { type: 'ADD_FIRE_EFFECT'; payload: FireEffect }
  | { type: 'REMOVE_FIRE_EFFECT'; payload: string }
  | { type: 'UPDATE_FIRE_EFFECT'; payload: { id: string; updates: Partial<FireEffect> } }
  | { type: 'ADD_STRIKE_EFFECT'; payload: StrikeEffect }
  | { type: 'REMOVE_STRIKE_EFFECT'; payload: string }
  | { type: 'UPDATE_STRIKE_EFFECT'; payload: { id: string; updates: Partial<StrikeEffect> } }
  | { type: 'ADD_DAMAGE_EFFECT'; payload: DamageEffect }
  | { type: 'REMOVE_DAMAGE_EFFECT'; payload: string }
  | { type: 'UPDATE_DAMAGE_EFFECT'; payload: { id: string; updates: Partial<DamageEffect> } }
  | { type: 'START_WPM_TRACKING' }
  | { type: 'STOP_WPM_TRACKING' }
  | { type: 'UPDATE_CHARACTERS_TYPED'; payload: number }
  | { type: 'UPDATE_WORDS_TYPED'; payload: number }
  | { type: 'UPDATE_ULTIMATE_ENERGY'; payload: number }
  | { type: 'ACTIVATE_ULTIMATE' }
  | { type: 'DEACTIVATE_ULTIMATE' }
  | { type: 'UPDATE_ULTIMATE_VFX'; payload: Partial<NonNullable<GameState['ultimateVfx']>> }
  | { type: 'CLEAR_ULTIMATE_VFX' }
  | { type: 'DEBUG_DIE' }
  | { type: 'UPDATE_SKILL_EFFECT'; payload: { id: string; updates: Partial<SkillEffect> } }
  | { type: 'TOGGLE_HINTS' }
  | { type: 'TOGGLE_TUTORIAL_WAVE' }
  | { type: 'TOGGLE_INFINITE_MODE' }
  | { type: 'START_CRYSTAL_FLASH' }
  | { type: 'STOP_CRYSTAL_FLASH' }
  | { type: 'SET_CRYSTAL_DARK_MODE'; payload: boolean }
  | { type: 'START_PLAYER_DEATH_ANIMATION' }
  | { type: 'UPDATE_DEATH_ANIMATION'; payload: { frame: number } }
  | { type: 'START_UNDEAD_DEATH_ANIMATION'; payload: { x: number; y: number } }
  | { type: 'UPDATE_UNDEAD_DEATH_ANIMATION'; payload: { frame: number } }
  | { type: 'STOP_UNDEAD_DEATH_ANIMATION' }
  | { type: 'SHOW_WAVE_ANNOUNCEMENT'; payload: { waveNumber: number; hint?: string } }
  | { type: 'HIDE_WAVE_ANNOUNCEMENT' }
  | { type: 'UPDATE_CURRENT_HINT'; payload: string }
  | { type: 'SKIP_TUTORIAL' }
  | { type: 'SET_ULTIMATE_ENERGY'; payload: number }
  | { type: 'SET_DIFFICULTY'; payload: 'easy' | 'normal' | 'hard' };
