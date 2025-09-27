/*Wave system configuration for structured enemy spawning*/
// EnemyType is defined inline since it's not exported from types
type EnemyType = 'wisp' | 'bat' | 'ghost' | 'undead' | 'eyeball' | 'nothing';

// Individual enemy spawn within a wave
export interface EnemySpawn {
  type: EnemyType;
  delay: number; // Delay in milliseconds after previous enemy type in this wave
  interSpawnDelay: number; // Delay in milliseconds between individual spawns of this enemy type
  count: number; // How many of this enemy to spawn
  hint?: string; // Optional hint text to display during spawning
}

// A complete wave with multiple enemy types
export interface Wave {
  id: number;
  name: string;
  enemies: EnemySpawn[];
  waveDelay: number; // Delay in milliseconds before this wave starts
  description?: string;
}

// Wave progression configuration
export interface WaveConfig {
  waves: Wave[];
  infiniteWaves: boolean; // Whether to loop waves after completion
  infiniteWaveDelay: number; // Delay between wave loops
  difficultyScaling: number; // Multiplier for enemy health/speed in infinite waves
}

// Predefined wave configurations
export const WAVE_CONFIGS: WaveConfig = {
  waves: [
    {
      id: 0,
      name: "Tutorial Wave",
      description: "Let's learn the basic controls!",
      waveDelay: 2000, // 2 seconds after game starts
      enemies: [
        { 
          type: 'nothing', 
          delay: 2000, 
          interSpawnDelay: 5000, 
          count: 2, 
          hint: " You are a witch. The Keystone spawns enemies, don't let them hurt you! " 
        },
        { 
          type: 'wisp', 
          delay: 0, 
          interSpawnDelay: 5000, 
          count: 2, 
          hint: " Type words to shoot bullets at enemies. " 
        },
        { 
          type: 'bat', 
          delay: 5000, 
          interSpawnDelay: 5000, 
          count: 2, 
          hint: " Enemies have different health and speed!" 
        },
        { 
          type: 'nothing', 
          delay: 5000, 
          interSpawnDelay: 0, 
          count: 1, 
          hint: " There are two bars on the left. The top bar is your HP. When it reaches 0, you will die." 
        },
        { 
          type: 'nothing', 
          delay: 8000, 
          interSpawnDelay: 0, 
          count: 1, 
          hint: " The bottom bar is the ENERGY charged. When it reaches 100%, you can unleash an explosion!" 
        },
        { 
          type: 'wisp', 
          delay: 8000, 
          interSpawnDelay: 800, 
          count: 3, 
          hint: " Here, try it out!" 
        },
        { 
          type: 'nothing', 
          delay: 5000, 
          interSpawnDelay: 0, 
          count: 1, 
          hint: " Press 7 to select windspell. This can knock back enemies, but deals little damage. " 
        },
        { 
          type: 'wisp', 
          delay: 6000, 
          interSpawnDelay: 4000, 
          count: 3, 
          hint: " Bullets can be selected again by pressing 5! " 
        },
        { 
          type: 'ghost', 
          delay: 8000, 
          interSpawnDelay: 0, 
          count: 1, 
          hint: " Press 9 to select blast. This is a ranged attack that deals shared damage. " 
        },
        { 
          type: 'eyeball', 
          delay: 8000, 
          interSpawnDelay: 2000, 
          count: 3, 
          hint: " See the blue fire? They can slow the enemy's movement." 
        },
        { 
          type: 'nothing', 
          delay: 8000, 
          interSpawnDelay: 0, 
          count: 1, 
          hint: " The blue fire will disappear after some time, and the enemy will return to full speed!" 
        },
        { 
          type: 'nothing', 
          delay: 8000, 
          interSpawnDelay: 0, 
          count: 1, 
          hint: " Running low on health? Press 3 to select healing. " 
        },
        { 
          type: 'nothing', 
          delay: 5000, 
          interSpawnDelay: 0, 
          count: 1, 
          hint: " Type 3 letter words, and heal 10 HP each time! " 
        },
        { 
          type: 'nothing', 
          delay: 8000, 
          interSpawnDelay: 5000, 
          count: 2, 
          hint: " Now, are you ready? " 
        },
      ]
    },
    {
      id: 1,
      name: "First Wave",
      description: "Here's the real deal!",
      waveDelay: 2000, // 5 seconds after previous wave
      enemies: [
        { type: 'wisp', delay: 2000, interSpawnDelay: 2000, count: 5 }, 
        { type: 'bat', delay: 3000, interSpawnDelay: 2000, count: 3 }, 
        { type: 'ghost', delay: 0, interSpawnDelay: 0, count: 1 },  
        { type: 'bat', delay: 2500, interSpawnDelay: 2000, count: 2 }, 
        { type: 'wisp', delay: 2500, interSpawnDelay: 1500, count: 2 }, 
        { type: 'bat', delay: 0, interSpawnDelay: 0, count: 1 }, 
        { type: 'wisp', delay: 3000, interSpawnDelay: 1500, count: 2 },  
        { type: 'bat', delay: 0, interSpawnDelay: 0, count: 1 }, 
        { type: 'ghost', delay: 0, interSpawnDelay: 0, count: 1 }, 
      ]
    },
    {
      id: 2,
      name: "Mixed Wave",
      description: "Warmed up yet?",
      waveDelay: 8000, // 5 seconds after previous wave
      enemies: [
        { type: 'bat', delay: 2000, interSpawnDelay: 1500, count: 3 }, 
        { type: 'ghost', delay: 0, interSpawnDelay: 1000, count: 3 }, 
        { type: 'bat', delay: 2000, interSpawnDelay: 1500, count: 3 }, 
        { type: 'wisp', delay: 3000, interSpawnDelay: 1200, count: 2 },
        { type: 'bat', delay: 0, interSpawnDelay: 1200, count: 2 },   
        { type: 'wisp', delay: 1200, interSpawnDelay: 1200, count: 2 },
        { type: 'eyeball', delay: 3000, interSpawnDelay: 2000, count: 3 },
        { type: 'bat', delay: 2000, interSpawnDelay: 1500, count: 3 }, 
        { type: 'ghost', delay: 0, interSpawnDelay: 1000, count: 3 }, 
        { type: 'bat', delay: 2000, interSpawnDelay: 1500, count: 3 }, 
        { type: 'wisp', delay: 3000, interSpawnDelay: 1200, count: 2 },
        { type: 'bat', delay: 0, interSpawnDelay: 1200, count: 2 },   
        { type: 'wisp', delay: 1200, interSpawnDelay: 1200, count: 2 },
        { type: 'eyeball', delay: 3000, interSpawnDelay: 2000, count: 3 },
      ]
    },
    {
      id: 3,
      name: "Fast Wave",
      description: "努力! 未來! A BEAUTIFUL STAR!",
      waveDelay: 8000,
      enemies: [
        { type: 'bat', delay: 2000, interSpawnDelay: 1500, count: 4 },  
        { type: 'wisp', delay: 1500, interSpawnDelay: 1000, count: 2 }, 
        { type: 'bat', delay: 1500, interSpawnDelay: 0, count: 1 },   
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 2 }, 
        { type: 'bat', delay: 1000, interSpawnDelay: 0, count: 1 },    
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 1 }, 
        { type: 'bat', delay: 1000, interSpawnDelay: 0, count: 1 },    
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 1 }, 
        { type: 'bat', delay: 1000, interSpawnDelay: 0, count: 1 },   
        { type: 'eyeball', delay: 1000, interSpawnDelay: 0, count: 1 },  
        { type: 'bat', delay: 2000, interSpawnDelay: 1500, count: 4 },  
        { type: 'wisp', delay: 1500, interSpawnDelay: 1000, count: 2 }, 
        { type: 'bat', delay: 1500, interSpawnDelay: 0, count: 1 },   
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 2 }, 
        { type: 'bat', delay: 1000, interSpawnDelay: 0, count: 1 },    
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 1 }, 
        { type: 'bat', delay: 1000, interSpawnDelay: 0, count: 1 },    
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 1 }, 
        { type: 'bat', delay: 1000, interSpawnDelay: 0, count: 1 },   
        { type: 'eyeball', delay: 1000, interSpawnDelay: 0, count: 1 },  
      ]
    },
    {
      id: 4,
      name: "Tank Wave",
      description: "Okay I swear I'm not going to hold back anymore.",
      waveDelay: 8000,
      enemies: [
        { type: 'ghost', delay: 2000, interSpawnDelay: 2000, count: 2 },  
        { type: 'eyeball', delay: 2000, interSpawnDelay: 2000, count: 2 },    
        { type: 'bat', delay: 3000, interSpawnDelay: 2000, count: 3 }, 
        { type: 'ghost', delay: 2000, interSpawnDelay: 0, count: 1 },  
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 1 },     
        { type: 'bat', delay: 2000, interSpawnDelay: 1200, count: 3 },  
        { type: 'eyeball', delay: 2000, interSpawnDelay: 1500, count: 2 }, 
        { type: 'ghost', delay: 1000, interSpawnDelay: 1000, count: 2 },  
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 3 },      
        { type: 'bat', delay: 2000, interSpawnDelay: 1000, count: 2 }, 
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 1 },     
        { type: 'bat', delay: 2000, interSpawnDelay: 1200, count: 3 },  
        { type: 'eyeball', delay: 2000, interSpawnDelay: 1500, count: 2 }, 
        { type: 'ghost', delay: 1000, interSpawnDelay: 1000, count: 2 },  
        { type: 'wisp', delay: 1000, interSpawnDelay: 1000, count: 3 },      
        { type: 'bat', delay: 2000, interSpawnDelay: 1000, count: 2 }, 
      ]
    },
    {
      id: 5,
      name: "Eyeball Invasion",
      description: "Take this! Hahahahaha",
      waveDelay: 10000,
      enemies: [
        { type: 'bat', delay: 1500, interSpawnDelay: 800, count: 5 }, 
        { type: 'eyeball', delay: 2000, interSpawnDelay: 1200, count: 3 },   
        { type: 'eyeball', delay: 2000, interSpawnDelay: 1000, count: 4 },    
        { type: 'bat', delay: 3000, interSpawnDelay: 1000, count: 3 },        
        { type: 'eyeball', delay: 2000, interSpawnDelay: 800, count: 5 },       
        { type: 'eyeball', delay: 2000, interSpawnDelay: 600, count: 4 },   
        { type: 'bat', delay: 3000, interSpawnDelay: 1000, count: 3 },   
        { type: 'eyeball', delay: 2000, interSpawnDelay: 1200, count: 3 },   
        { type: 'eyeball', delay: 2000, interSpawnDelay: 1000, count: 4 },    
        { type: 'bat', delay: 3000, interSpawnDelay: 1000, count: 3 },        
        { type: 'eyeball', delay: 2000, interSpawnDelay: 800, count: 5 },       
        { type: 'eyeball', delay: 2000, interSpawnDelay: 600, count: 4 },   
        { type: 'bat', delay: 3000, interSpawnDelay: 1000, count: 3 },     
      ]
    },
    {
      id: 1,
      name: "Boss wave",
      description: "Remember to heal!",
      waveDelay: 3500,
      enemies: [
        { type: 'undead', delay: 6000, interSpawnDelay: 0, count: 1 },  
      ]
    },
  ],
  infiniteWaves: true,
  infiniteWaveDelay: 8000, // 8 seconds between wave loops
  difficultyScaling: 1.1 // 10% increase in difficulty each loop
};

// Helper function to get wave by ID
export function getWaveById(id: number): Wave | undefined {
  return WAVE_CONFIGS.waves.find(wave => wave.id === id);
}

// Helper function to get next wave
export function getNextWave(currentWaveId: number, enableInfiniteMode?: boolean): Wave | undefined {
  const currentIndex = WAVE_CONFIGS.waves.findIndex(wave => wave.id === currentWaveId);
  if (currentIndex === -1) return undefined;
  
  const nextIndex = currentIndex + 1;
  if (nextIndex >= WAVE_CONFIGS.waves.length) {
    // When looping back for infinite waves, start from wave 2 (index 1) instead of tutorial wave
    // Only loop if infinite mode is enabled
    return (enableInfiniteMode !== false && WAVE_CONFIGS.infiniteWaves) ? WAVE_CONFIGS.waves[1] : undefined;
  }
  
  return WAVE_CONFIGS.waves[nextIndex];
}

// Helper function to calculate difficulty scaling for infinite waves
export function getDifficultyScaling(completedWaves: number): number {
  if (completedWaves <= WAVE_CONFIGS.waves.length) return 1;
  
  const infiniteLoops = Math.floor((completedWaves - WAVE_CONFIGS.waves.length) / WAVE_CONFIGS.waves.length);
  return Math.pow(WAVE_CONFIGS.difficultyScaling, infiniteLoops);
}
