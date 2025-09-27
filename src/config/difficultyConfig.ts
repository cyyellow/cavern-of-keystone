// Difficulty configuration for the game
// Each difficulty level has multipliers for various game mechanics

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  name: string;
  wpm: number;
  multipliers: {
    enemySpeed: number;
    enemyHealth: number;
    enemyDamage: number;
    spawnDelay: number;
    interSpawnDelay: number;
    undeadSlowAttackSpeed: number;
    undeadFastAttackSpeed: number;
    undeadCooldownTime: number;
    undeadHealth: number;
    bossWaveMobSpawnProbability: number;
    windKnockbackDistance: number;
    impactDamage: number;
    impactFireSlowSpeed: number;
  };
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    name: 'EASY',
    wpm: 20,
    multipliers: {
      enemySpeed: 0.6,      
      enemyHealth: 0.7,    
      enemyDamage: 0.8,   
      spawnDelay: 1.5,     
      interSpawnDelay: 1.5,
      undeadSlowAttackSpeed: 1.2,  // 30% slower slow attacks
      undeadFastAttackSpeed: 2,  // 20% slower fast attacks
      undeadCooldownTime: 1.5,     // 50% longer cooldown
      undeadHealth: 0.5,           // 50% less health
      bossWaveMobSpawnProbability: 0.3, // 30% chance to spawn mobs
      windKnockbackDistance: 0.7,  // 50% more knockback distance
      impactDamage: 1.0,           // 30% more impact damage
      impactFireSlowSpeed: 1.0,    // 50% stronger fire slow effect
    } // kind of about 20... but a little too hard, i want to find a way to make it easier, and less clunky to play
  },
  normal: {
    name: 'NORMAL',
    wpm: 40,
    multipliers: {
      enemySpeed: 1.0,   
      enemyHealth: 1.0,     
      enemyDamage: 1.0,     
      spawnDelay: 1.0,      
      interSpawnDelay: 1.0,
      undeadSlowAttackSpeed: 1.0,  
      undeadFastAttackSpeed: 1.5,  
      undeadCooldownTime: 1.0,     
      undeadHealth: 1.0,          
      bossWaveMobSpawnProbability: 0.8,
      windKnockbackDistance: 1.0,  // Normal knockback distance
      impactDamage: 1.0,           // Normal impact damage
      impactFireSlowSpeed: 1.0,    // Normal fire slow effect
    }
  },
  hard: {
    name: 'HARD',
    wpm: 60,
    multipliers: {
      enemySpeed: 1.2,  
      enemyHealth: 1.0, 
      enemyDamage: 1.0, 
      spawnDelay: 0.7, 
      interSpawnDelay: 0.8,
      // is actually time multiplier not speed
      undeadSlowAttackSpeed: 0.8,  
      undeadFastAttackSpeed: 0.75,  
      undeadCooldownTime: 0.8,    
      undeadHealth: 1.0,           
      bossWaveMobSpawnProbability: 1.2,
      windKnockbackDistance: 1.0,  // 30% less knockback distance
      impactDamage: 1.1,           // 20% less impact damage
      impactFireSlowSpeed: 1.1,    // 30% weaker fire slow effect
    }
  }
};

// Helper function to get difficulty config by level
export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[level];
}

// Helper function to get all difficulty levels
export function getAllDifficultyLevels(): DifficultyLevel[] {
  return ['easy', 'normal', 'hard'];
}

// Helper function to get next difficulty level (for cycling)
export function getNextDifficultyLevel(current: DifficultyLevel): DifficultyLevel {
  const levels = getAllDifficultyLevels();
  const currentIndex = levels.indexOf(current);
  return levels[(currentIndex + 1) % levels.length];
}

// Helper function to get previous difficulty level (for cycling)
export function getPreviousDifficultyLevel(current: DifficultyLevel): DifficultyLevel {
  const levels = getAllDifficultyLevels();
  const currentIndex = levels.indexOf(current);
  return levels[(currentIndex - 1 + levels.length) % levels.length];
}
