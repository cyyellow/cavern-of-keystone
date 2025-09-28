/*Wave spawner logic for managing enemy waves*/
import { GameState, GameAction } from '../types';
// EnemyType is defined inline since it's not exported from types
type EnemyType = 'wisp' | 'bat' | 'ghost' | 'undead' | 'eyeball' | 'nothing';
import { getWaveById, getNextWave, getDifficultyScaling } from '../config/waveConfig';
import { createEnemy } from './gameUtils';
import { playBackgroundMusic } from './audioManager';
import { getDifficultyConfig } from '../config/difficultyConfig';

// Filter enemy spawns based on difficulty level for waves 1-5
function filterEnemySpawnsForDifficulty(enemySpawns: any[], difficulty: 'easy' | 'normal' | 'hard') {
  if (difficulty === 'hard') {
    // 60 WPM - use all enemies (no filtering)
    return enemySpawns;
  }
  
  const filteredSpawns = [];
  
  for (let i = 0; i < enemySpawns.length; i++) {
    const spawn = enemySpawns[i];
    
    if (difficulty === 'normal') {
      // 40 WPM - omit some enemies (skip every 4th enemy after index 2)
      if (i >= 2 && (i - 2) % 4 === 0) {
        continue; // Skip this enemy spawn
      }
    } else if (difficulty === 'easy') {
      // 20 WPM - omit more enemies (skip every 2nd enemy after index 1)
      if (i >= 1 && (i - 1) % 2 === 0) {
        continue; // Skip this enemy spawn
      }
    }
    
    filteredSpawns.push(spawn);
  }
  
  return filteredSpawns;
}

export function updateWaveSystem(gameState: GameState, dispatch: React.Dispatch<GameAction>, currentTime: number) {
  const { waveState } = gameState;
  
  // If no wave is active, start the current wave
  if (!waveState.isWaveActive) {
    const currentWave = getWaveById(waveState.currentWaveId);
    
    // Skip tutorial wave if disabled
    if (currentWave && currentWave.id === 0 && !gameState.enableTutorialWave) {
      dispatch({
        type: 'UPDATE_WAVE_STATE',
        payload: { currentWaveId: 1 }
      });
      return;
    }
    
    if (currentWave) {
      // Apply difficulty multiplier to wave delay
      const difficultyConfig = getDifficultyConfig(gameState.difficulty);
      const adjustedWaveDelay = currentWave.waveDelay * difficultyConfig.multipliers.spawnDelay;
      const waveStartTime = currentTime + adjustedWaveDelay;
      
      // Calculate when to start spawning the first enemy type
      const firstEnemyDelay = (currentWave.enemies[0]?.delay || 0) * difficultyConfig.multipliers.spawnDelay;
      const firstSpawnTime = waveStartTime + firstEnemyDelay;
      
      // Show wave announcement after adjusted waveDelay
      setTimeout(() => {
        dispatch({
          type: 'SHOW_WAVE_ANNOUNCEMENT',
          payload: { 
            waveNumber: currentWave.id, 
            hint: currentWave.description 
          }
        });
        
        // Hide announcement after 2 seconds
        setTimeout(() => {
          dispatch({ type: 'HIDE_WAVE_ANNOUNCEMENT' });
        }, 2000);
      }, adjustedWaveDelay);
      
      dispatch({
        type: 'START_WAVE',
        payload: { waveId: currentWave.id, startTime: firstSpawnTime }
      });
      
      // Reset boss wave flag for new wave
      dispatch({
        type: 'UPDATE_WAVE_STATE',
        payload: { isBossWaveSpawned: false }
      });
      
      // Start WPM tracking when wave 2 begins (but only if not already tracking)
      if (currentWave.id === 1 && gameState.wpmTracking.startTime === null) {
        dispatch({ type: 'START_WPM_TRACKING' });
      }
      
      // Start crystal flash if this is a boss wave
      const isBossWave = currentWave.enemies.some(enemy => enemy.type === 'undead');
      if (isBossWave) {
        dispatch({ type: 'START_CRYSTAL_FLASH' });
        setTimeout(() => {
          dispatch({ type: 'STOP_CRYSTAL_FLASH' });
          dispatch({ type: 'SET_CRYSTAL_DARK_MODE', payload: true });
          // Switch to boss wave music when crystal turns dark
          playBackgroundMusic('bossWave');
        }, 8500);
      } else {
        // Not a boss wave, ensure crystal is in light mode
        dispatch({ type: 'SET_CRYSTAL_DARK_MODE', payload: false });
        // Switch back to normal game music when not in boss wave
        playBackgroundMusic('gameScreen');
      }
      
      return;
    }
  }

  // If wave is active, check for enemy spawning
  if (waveState.isWaveActive) {
    const currentWave = getWaveById(waveState.currentWaveId);
    if (!currentWave) return;

    // Check if this is a boss wave
    const hasUndeadBoss = currentWave.enemies.some(enemy => enemy.type === 'undead');
    
    // Special check for boss waves - only check if boss wave has been fully spawned
    if (hasUndeadBoss && waveState.isBossWaveSpawned) {
      // First check if undead death animation is playing
      if (gameState.undeadDeathAnimation.active) {
        return;
      }
      
      const undeadBoss = gameState.enemies.find(enemy => 
        enemy.type === 'undead' && enemy.active && !enemy.dying
      );
      
      if (!undeadBoss) {
        // Boss is dead and animation is complete, check if we should win or continue
        
        // Check if infinite mode is disabled and this is the last wave
        if (!gameState.enableInfiniteMode) {
          // Player wins! Go to win screen
          dispatch({ type: 'STOP_WPM_TRACKING' });
          dispatch({ type: 'WIN_GAME' });
          dispatch({ type: 'UPDATE_CURRENT_HINT', payload: '' });
          return;
        } else {
          // Continue to next wave (infinite mode)
          dispatch({ type: 'COMPLETE_WAVE' });
          dispatch({ type: 'UPDATE_CURRENT_HINT', payload: '' });
          return;
        }
      }
    }

    // Get filtered enemy spawns for waves 1-5 based on difficulty
    let enemySpawnsToUse = currentWave.enemies;
    if (currentWave.id >= 1 && currentWave.id <= 5) {
      enemySpawnsToUse = filterEnemySpawnsForDifficulty(currentWave.enemies, gameState.difficulty);
    }

    // Check if it's time to spawn the next enemy in the wave
    // Don't spawn if it's a boss wave that has been fully spawned
    const shouldSpawn = currentTime >= waveState.nextSpawnTime && 
                       waveState.currentEnemyIndex < enemySpawnsToUse.length &&
                       !(hasUndeadBoss && waveState.isBossWaveSpawned);
    
    if (shouldSpawn) {
      const enemySpawn = enemySpawnsToUse[waveState.currentEnemyIndex];
      
      // Show hint for this enemy type if it's the first spawn and hint exists
      if (waveState.currentLoopCount === 0 && enemySpawn.hint) {
        dispatch({
          type: 'UPDATE_CURRENT_HINT',
          payload: enemySpawn.hint
        });
        
        // Special case: Set ultimate energy to 100% for the "Here, try it out!" hint
        if (enemySpawn.hint.includes("Here, try it out!")) {
          dispatch({
            type: 'SET_ULTIMATE_ENERGY',
            payload: 100
          });
        }
      }

      // Handle 'nothing' enemy type - just show hint without spawning
      if (enemySpawn.type === 'nothing') {
        // Show hint only
      } else {
        // Spawn one enemy of the current type
        const enemyId = `enemy_${Date.now()}_${Math.random()}`;
        const enemy = createEnemy(enemySpawn.type as EnemyType, enemyId);
        
      // Apply difficulty multipliers
      const difficultyConfig = getDifficultyConfig(gameState.difficulty);
      
      // Use specific undead health multiplier for undead boss, otherwise use general enemy health
      const healthMultiplier = enemy.type === 'undead' 
        ? difficultyConfig.multipliers.undeadHealth 
        : difficultyConfig.multipliers.enemyHealth;
        
      enemy.health = Math.floor(enemy.health * healthMultiplier);
      enemy.maxHealth = enemy.health;
      enemy.speed = enemy.speed * difficultyConfig.multipliers.enemySpeed;
      enemy.damage = Math.floor(enemy.damage * difficultyConfig.multipliers.enemyDamage);
        
        // Apply difficulty scaling for infinite waves (on top of base difficulty)
        const difficultyMultiplier = getDifficultyScaling(waveState.completedWaves);
        if (difficultyMultiplier > 1) {
          enemy.health = Math.floor(enemy.health * difficultyMultiplier);
          enemy.maxHealth = enemy.health;
          enemy.speed = enemy.speed * difficultyMultiplier;
          enemy.damage = Math.floor(enemy.damage * difficultyMultiplier);
        }
        
        dispatch({ type: 'ADD_ENEMY', payload: enemy });
      }

      // Track how many of the current enemy type we've spawned
      const currentLoopCount = waveState.currentLoopCount;
      const newLoopCount = currentLoopCount + 1;
      
      if (newLoopCount >= enemySpawn.count) {
        // Move to next enemy type
        const nextEnemyIndex = waveState.currentEnemyIndex + 1;
        
        // Use the delay from the NEXT enemy type to determine when to start spawning it
        const nextEnemySpawn = currentWave.enemies[nextEnemyIndex];
        const difficultyConfig = getDifficultyConfig(gameState.difficulty);
        const nextSpawnTime = currentTime + ((nextEnemySpawn?.delay || 0) * difficultyConfig.multipliers.spawnDelay);
        
        dispatch({
          type: 'UPDATE_WAVE_STATE',
          payload: {
            currentEnemyIndex: nextEnemyIndex,
            nextSpawnTime: nextSpawnTime,
            currentLoopCount: 0 // Reset loop counter for next enemy type
          }
        });

        // Check if wave is complete
        if (nextEnemyIndex >= enemySpawnsToUse.length) {
          // Special logic for boss waves (waves with undead enemies)
          const hasUndeadBoss = currentWave.enemies.some(enemy => enemy.type === 'undead');
          
          if (hasUndeadBoss) {
            // Mark boss wave as fully spawned
            dispatch({
              type: 'UPDATE_WAVE_STATE',
              payload: {
                isBossWaveSpawned: true,
                currentEnemyIndex: enemySpawnsToUse.length - 1, // Stay on last enemy type
                nextSpawnTime: currentTime + 1000, // Check again in 1 second
                currentLoopCount: 0
              }
            });
          } else {
            // Normal wave completion
            dispatch({ type: 'COMPLETE_WAVE' });
            // Clear hint when wave completes
            dispatch({ type: 'UPDATE_CURRENT_HINT', payload: '' });
          }
        }
      } else {
        // Continue with same enemy type - use interSpawnDelay with difficulty multiplier
        const difficultyConfig = getDifficultyConfig(gameState.difficulty);
        const nextSpawnTime = currentTime + (enemySpawn.interSpawnDelay * difficultyConfig.multipliers.interSpawnDelay);
        dispatch({
          type: 'UPDATE_WAVE_STATE',
          payload: {
            nextSpawnTime: nextSpawnTime,
            currentLoopCount: newLoopCount
          }
        });
      }
    }
  }
}

// Helper function to get wave progress for UI
export function getWaveProgress(gameState: GameState) {
  const { waveState } = gameState;
  const currentWave = getWaveById(waveState.currentWaveId);
  
  if (!currentWave || !waveState.isWaveActive) {
    return {
      waveName: 'Preparing...',
      progress: 0,
      enemiesRemaining: 0,
      totalEnemies: 0
    };
  }

  const totalEnemies = currentWave.enemies.reduce((sum, spawn) => sum + spawn.count, 0);
  const enemiesSpawned = currentWave.enemies
    .slice(0, waveState.currentEnemyIndex)
    .reduce((sum, spawn) => sum + spawn.count, 0);
  
  return {
    waveName: currentWave.name,
    progress: totalEnemies > 0 ? (enemiesSpawned / totalEnemies) * 100 : 0,
    enemiesRemaining: totalEnemies - enemiesSpawned,
    totalEnemies: totalEnemies
  };
}

// Helper function to get next wave info
export function getNextWaveInfo(gameState: GameState) {
  const { waveState } = gameState;
  const nextWave = getNextWave(waveState.currentWaveId);
  
  if (!nextWave) {
    return {
      name: 'No more waves',
      description: 'All waves completed!',
      delay: 0
    };
  }

  return {
    name: nextWave.name,
    description: nextWave.description || '',
    delay: nextWave.waveDelay
  };
}
