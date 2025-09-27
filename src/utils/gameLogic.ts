/*updates the player animation, enemy spawning, bullet movement, handling typing etc.*/
import { GameState, GameAction } from '../types';
import { createBullet, createWind, createImpact, getRandomWord, createEnemy } from './gameUtils';
import { DamageEffect } from '../types';
import { PLAYER_CONFIG, getEnemyAnimationSpeed, EYEBALL_SLIDE, BULLET_CONFIG } from '../config/gameConfig';
import { updateWaveSystem } from './waveSpawner';
import { playBulletSound, playHitSound, playImpactSound, playWindSound, playHealSound, playSlashSound } from './audioManager';
import { getDifficultyConfig } from '../config/difficultyConfig';

let frameCount = 0;
let accumulatedTime = 0;

// Helper function to create damage effects
function createDamageEffect(x: number, y: number, value: number, type: 'damage' | 'heal'): DamageEffect {
  return {
    id: `damage_${Date.now()}_${Math.random()}`,
    x: x,
    y: y,
    value: value,
    type: type,
    active: true,
    duration: 1500, // 1.5 seconds
    startTime: Date.now(),
    opacity: 1
  };
}

export function updateGameLogic(gameState: GameState, dispatch: React.Dispatch<GameAction>, deltaTime: number) {
  if (!gameState.gameRunning) return;

  frameCount++;
  accumulatedTime += deltaTime;
  // Update player animation
  const playerFrames = PLAYER_CONFIG.ANIMATION.frames;
  const playerTicksPerFrame = PLAYER_CONFIG.ANIMATION.ticksPerFrame;
  
  const playerAnimationSpeed = (1000 / 30) * playerTicksPerFrame; // 30fps base, ms per frame
  const playerFrame = Math.floor(accumulatedTime / playerAnimationSpeed) % (playerFrames * playerTicksPerFrame); 
  
  dispatch({
    type: 'UPDATE_PLAYER',
    payload: {
      frame: playerFrame
    }
  });

  // Update wave system (replaces old random spawning)
  updateWaveSystem(gameState, dispatch, Date.now());

  // Update enemies
  gameState.enemies.forEach(enemy => {
    if (!enemy.active || enemy.type === 'nothing') return;
    
    // Skip dying undead enemies - they should not move or attack
    if ((enemy.type as string) === 'undead' && enemy.dying) return;

    let newX = enemy.x;
    let newY = enemy.y;

    let movementSpeed = enemy.speed * 60;

    // Check for fire effect slowdown with difficulty multiplier
    const difficultyConfig = getDifficultyConfig(gameState.difficulty);
    const fireSlowMultiplier = 0.6 * difficultyConfig.multipliers.impactFireSlowSpeed;
    gameState.fireEffects.forEach(fire => {
      if (!fire.active) return;
      const distance = Math.sqrt(
        Math.pow(enemy.x - fire.x, 2) + Math.pow(enemy.y - fire.y, 2)
      );
      if (distance <= 100) {
        movementSpeed *= fireSlowMultiplier; 
      }
    });

    if (enemy.type === 'eyeball') {
      const dx = enemy.x - gameState.player.x;
      if (enemy.state !== 'slide' && dx <= 170) {
        enemy.state = 'slide';
        enemy.baseX = enemy.x-140;
        enemy.baseY = enemy.y;
        enemy.slidePhase = 0;
      }
      if (enemy.state === 'slide') {
        newX = enemy.baseX || enemy.x;
        newY = enemy.baseY || enemy.y;
      } else if (enemy.speed > 0) {
        newX = enemy.x - (movementSpeed * deltaTime / 1000);
        newY = enemy.y + (Math.random() - 0.5) * 0.5;
      }
    } else if ((enemy.type as string) === 'undead') {
      // Undead boss special movement and attack logic
      handleUndeadBossLogic(enemy, gameState, dispatch, deltaTime);
      return; // Skip normal enemy update for undead boss
    } else if (enemy.speed > 0) {
      newX = enemy.x - (movementSpeed * deltaTime / 1000);
      newY = enemy.y + (Math.random() - 0.5) * 0.5;
    }  
    // Time-based animation (30fps)
    const ticksPerFrame = getEnemyAnimationSpeed(enemy.type);
    const animationSpeed = (1000 / 30) * ticksPerFrame; // 30fps base, ms per frame
    const totalFrames = (enemy.type === 'eyeball' && enemy.state === 'slide') ? EYEBALL_SLIDE.frames : enemy.config.spriteConfig.frames;
    const enemyFrame = Math.floor(accumulatedTime / animationSpeed) % (totalFrames * ticksPerFrame);

    dispatch({
      type: 'UPDATE_ENEMY',
      payload: {
        id: enemy.id,
        updates: {
          x: newX,
          y: newY,
          frame: enemyFrame
        }
      }
    });

    // Check if enemy reached player (collision detection using hitboxes)
    // Player hitbox from config
    const playerSpriteWidth = PLAYER_CONFIG.VISUAL.scale * PLAYER_CONFIG.VISUAL.baseWidth;
    const playerSpriteHeight = PLAYER_CONFIG.VISUAL.scale * PLAYER_CONFIG.VISUAL.baseHeight;
    const playerHb = PLAYER_CONFIG.HITBOX;
    const playerLeft = gameState.player.x + playerSpriteWidth * playerHb.offsetX;
    const playerTop = gameState.player.y + playerSpriteHeight * playerHb.offsetY;
    const playerRight = playerLeft + playerSpriteWidth * playerHb.width;
    const playerBottom = playerTop + playerSpriteHeight * playerHb.height;
    
    // Enemy hitbox from config, apply slide offsets for eyeball
    const scaleEnemy = enemy.config.spriteConfig.scale || 2;
    // For eyeball, always use walk sprite dimensions for consistent hitbox size
    const baseW = enemy.config.spriteConfig.sourceWidth || 32;
    const baseH = enemy.config.spriteConfig.sourceHeight || 32;
    const enemySpriteWidth = scaleEnemy * baseW;
    const enemySpriteHeight = scaleEnemy * baseH;
    const enemyHb = (enemy.config as any).hitbox || { width: 0.7, height: 0.7, offsetX: 0.15, offsetY: 0.15 };
    let rectX = newX;
    let rectY = newY;
    
    // Apply eyeball slide per-frame offsets to hitbox position
    if (enemy.type === 'eyeball' && enemy.state === 'slide') {
      const ticksPerFrame = getEnemyAnimationSpeed(enemy.type);
      const localFrameIndex = Math.floor(enemy.frame / ticksPerFrame) % EYEBALL_SLIDE.frames;
      const offset = EYEBALL_SLIDE.offsets[localFrameIndex];
      rectX += offset.x;
      rectY += offset.y;
    }
    
    const enemyLeft = rectX + enemySpriteWidth * enemyHb.offsetX;
    const enemyTop = rectY + enemySpriteHeight * enemyHb.offsetY;
    const enemyRight = enemyLeft + enemySpriteWidth * enemyHb.width;
    const enemyBottom = enemyTop + enemySpriteHeight * enemyHb.height;
    
    if (enemyRight > playerLeft && 
        enemyLeft < playerRight &&
        enemyBottom > playerTop && 
        enemyTop < playerBottom) {
      
      // Skip collision for dying undead enemies
      if ((enemy.type as string) === 'undead' && enemy.dying) return;
      
      // Check collision cooldown for eyeballs (prevent damage every frame)
      const currentTime = Date.now();
      const collisionCooldown = 1000; // 1 second cooldown
      const canCollide = !enemy.lastCollisionTime || (currentTime - enemy.lastCollisionTime) > collisionCooldown;
      
      if (canCollide) {
        // Player takes damage
        const newHealth = Math.max(0, gameState.player.health - enemy.damage);
        const damageAmount = gameState.player.health - newHealth;
        dispatch({
          type: 'UPDATE_PLAYER',
          payload: { health: newHealth }
        });
        
        // Create damage effect over word display
        const damageEffect = createDamageEffect(
          360, // Center of screen (word display area)
          window.innerHeight - 170, // Over word display area
          damageAmount,
          'damage'
        );
        dispatch({ type: 'ADD_DAMAGE_EFFECT', payload: damageEffect });
        
        // Play hit sound effect
        playHitSound();

        // For eyeballs, reduce their health instead of removing them immediately
        if (enemy.type === 'eyeball') {
          const newEnemyHealth = Math.max(0, enemy.health - 5); // Eyeball takes 5 damage per collision
          if (newEnemyHealth <= 0) {
            // Eyeball dies when health depleted
            dispatch({ type: 'UPDATE_SCORE', payload: enemy.points });
            dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
          } else {
            // Update eyeball health and collision time
            dispatch({
              type: 'UPDATE_ENEMY',
              payload: {
                id: enemy.id,
                updates: { 
                  health: newEnemyHealth,
                  lastCollisionTime: currentTime
                }
              }
            });
          }
        } else {
          // Other enemies are removed immediately (original behavior)
          dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
        }

        // Check game over
        if (newHealth <= 0 && !gameState.playerDeathAnimation.active) {
          dispatch({ type: 'STOP_WPM_TRACKING' });
          dispatch({ type: 'START_PLAYER_DEATH_ANIMATION' });
        }
      }
    }

    // Remove enemies that went off screen (left side) - except undead boss
    if (newX < -100 && (enemy as any).type !== 'undead') {
      dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
    }
  });

  // Update bullets
  gameState.bullets.forEach(bullet => {
    if (!bullet.active) return;
 // Time-based movement (convert speed from pixels per frame to pixels per second for 30fps)
    const bulletSpeed = bullet.speed * 60; // Convert from pixels per frame to pixels per second (doubled for 30fps)
    const newX = bullet.x + (bulletSpeed * deltaTime / 1000);
    const newY = bullet.y;
    
    dispatch({
      type: 'UPDATE_BULLET',
      payload: {
        id: bullet.id,
        updates: { x: newX, y: newY }
      }
    });

    // Check bullet-enemy collisions using hitboxes
    // Sort enemies by distance from bullet to hit closest enemy first
    const sortedEnemies = [...gameState.enemies]
      .filter(enemy => enemy.active)
      .sort((a, b) => {
        const distA = Math.abs(a.x - newX);
        const distB = Math.abs(b.x - newX);
        return distA - distB;
      });

    let bulletHit = false;
    for (const enemy of sortedEnemies) {
      if (bulletHit) break; // Stop checking if bullet already hit something
      
      // Enemy hitbox from config ratios
      const config = enemy.config.spriteConfig;
      const scale = config.scale || 2;
      const baseWidth = config.sourceWidth || 32;
      const baseHeight = config.sourceHeight || 32;
      const hitboxWidth = baseWidth * scale;
      const hitboxHeight = baseHeight * scale;
      
      const hb = (enemy.config as any).hitbox || { width: 0.7, height: 0.7, offsetX: 0.15, offsetY: 0.15 };
      let hbLeft = hitboxWidth * hb.offsetX;
      let hbTop = hitboxHeight * hb.offsetY;

      // Apply eyeball slide per-frame offset for collision detection
      if (enemy.type === 'eyeball' && enemy.state === 'slide') {
        const ticksPerFrame = getEnemyAnimationSpeed(enemy.type);
        const localFrameIndex = Math.floor(enemy.frame / ticksPerFrame) % EYEBALL_SLIDE.frames;
        const offset = EYEBALL_SLIDE.offsets[localFrameIndex];
        hbLeft += offset.x;
        hbTop += offset.y;
      }

      const enemyLeft = enemy.x + hbLeft;
      const enemyTop = enemy.y + hbTop;
      const enemyRight = enemyLeft + hitboxWidth * hb.width;
      const enemyBottom = enemyTop + hitboxHeight * hb.height;

      // Bullet hitbox (smaller than visual sprite)
      const bulletSpriteWidth = 16 * 3; // 48px (16 * 3 scale)
      const bulletSpriteHeight = 16 * 3; // 48px
      const bulletHitbox = BULLET_CONFIG.HITBOX;
      
      const bulletHitboxWidth = bulletSpriteWidth * bulletHitbox.width;
      const bulletHitboxHeight = bulletSpriteHeight * bulletHitbox.height;
      const bulletLeft = newX + (bulletSpriteWidth * bulletHitbox.offsetX);
      const bulletTop = newY + (bulletSpriteHeight * bulletHitbox.offsetY);
      const bulletRight = bulletLeft + bulletHitboxWidth;
      const bulletBottom = bulletTop + bulletHitboxHeight;
      
      if (bulletRight > enemyLeft && 
          bulletLeft < enemyRight &&
          bulletBottom > enemyTop && 
          bulletTop < enemyBottom) {
        // Hit enemy
        const newHealth = Math.max(0, enemy.health - bullet.damage);
        
        if (newHealth <= 0) {
          // Enemy defeated
          if ((enemy.type as string) === 'undead') {
            // Only start death animation if not already dying
            if (!enemy.dying) {
              // Start undead death animation and mark as dying
              dispatch({ 
                type: 'START_UNDEAD_DEATH_ANIMATION', 
                payload: { x: enemy.x, y: enemy.y } 
              });
              dispatch({
                type: 'UPDATE_ENEMY',
                payload: {
                  id: enemy.id,
                  updates: { dying: true }
                }
              });
            }
          } else {
            // Remove other enemies immediately
            dispatch({ type: 'UPDATE_SCORE', payload: enemy.points });
            dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
          }
        } else {
          // Enemy damaged
          dispatch({
            type: 'UPDATE_ENEMY',
            payload: {
              id: enemy.id,
              updates: { health: newHealth }
            }
          });
        }
        
        // Remove bullet and stop checking
        dispatch({ type: 'REMOVE_BULLET', payload: bullet.id });
        bulletHit = true;
        break;
      }
    }

    // Remove bullets that went off screen
    if (newX > window.innerWidth + 50) {
      dispatch({ type: 'REMOVE_BULLET', payload: bullet.id });
    }
  });

  // Update wind projectiles
  if (gameState.winds.length > 0) {
    console.log('Processing wind projectiles:', gameState.winds.length);
  }
  gameState.winds.forEach(wind => {
    if (!wind.active) return;

    // Time-based animation (30fps)
    const windAnimationSpeed = (1000 / 30) * 2; // 30fps base, 2 ticks per frame
    const newFrame = Math.floor(accumulatedTime / windAnimationSpeed) % 16; // 16 frames total

    // Time-based movement (convert speed from pixels per frame to pixels per second for 30fps)
    const windSpeed = wind.speed * 60; // Convert from pixels per frame to pixels per second (doubled for 30fps)
    const newX = wind.x + (windSpeed * deltaTime / 1000);
    const newY = wind.y;
    
    dispatch({
      type: 'UPDATE_WIND',
      payload: {
        id: wind.id,
        updates: { 
          x: newX, 
          y: newY, 
          frame: newFrame, 
          hitEnemies: wind.hitEnemies,
          knockbackEnemies: wind.knockbackEnemies
        }
      }
    });

    // Check wind-enemy collisions - wind can penetrate multiple enemies
    const activeEnemies = gameState.enemies.filter(enemy => enemy.active);
    
    for (const enemy of activeEnemies) {
      // Check collision along the wind's movement path to avoid missing fast-moving collisions
      const windMovementDistance = (windSpeed * deltaTime / 1000);
      const windStartX = wind.x - windMovementDistance;
      const windEndX = wind.x;
      
      // Check if enemy is within the wind's movement path
      const enemyInPath = enemy.x >= windStartX && enemy.x <= windEndX + 60; // 60px buffer
      
      if (enemyInPath) {
        // Calculate distance from enemy to wind's current position
        const distance = Math.sqrt(
          Math.pow(enemy.x - wind.x, 2) + Math.pow(enemy.y - wind.y, 2)
        );
        
        // Wind hitbox (adjust size as needed)
        const windHitbox = 80; // Increased hitbox size for better collision
        if (distance < windHitbox) {
        // Only damage enemies once
        if (!wind.hitEnemies.has(enemy.id)) {
          console.log('Wind hit enemy for damage:', enemy.id, 'distance:', distance);
          wind.hitEnemies.add(enemy.id);
          
          // Deal damage
          const newHealth = Math.max(0, enemy.health - wind.damage);
          const isDead = newHealth <= 0;
          
          if (isDead) {
            if ((enemy.type as string) === 'undead') {
              // Only start death animation if not already dying
              if (!enemy.dying) {
                // Start undead death animation and mark as dying
                dispatch({ 
                  type: 'START_UNDEAD_DEATH_ANIMATION', 
                  payload: { x: enemy.x, y: enemy.y } 
                });
                dispatch({
                  type: 'UPDATE_ENEMY',
                  payload: {
                    id: enemy.id,
                    updates: { dying: true }
                  }
                });
              }
            } else {
              // Remove other enemies immediately
              dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
              dispatch({ type: 'UPDATE_SCORE', payload: enemy.points });
            }
            playHitSound();
          } else {
            dispatch({
              type: 'UPDATE_ENEMY',
              payload: {
                id: enemy.id,
                updates: { health: newHealth }
              }
            });
          }
          }
        }
      }
      
      // Apply knockback after wind has passed through (when wind is past the enemy)
      if (wind.hitEnemies.has(enemy.id) && !wind.knockbackEnemies.has(enemy.id)) {
        // Check if wind has passed the enemy (wind.x > enemy.x + some threshold)
        if (newX > enemy.x + 30) { // 30px threshold to ensure wind has passed
          console.log('Applying knockback to enemy:', enemy.id);
          wind.knockbackEnemies.add(enemy.id);
          
          // Apply difficulty multiplier to knockback distance
          const difficultyConfig = getDifficultyConfig(gameState.difficulty);
          let knockbackMultiplier = difficultyConfig.multipliers.windKnockbackDistance;
          
          // Ghosts have 0.5x knockback distance
          if (enemy.type === 'ghost') {
            knockbackMultiplier *= 0.5;
          }
          
          const knockbackDistance = wind.knockback * knockbackMultiplier;
          const knockbackX = enemy.x + knockbackDistance;
          
          dispatch({
            type: 'UPDATE_ENEMY',
            payload: {
              id: enemy.id,
              updates: { x: knockbackX }
            }
          });
        }
      }
    }

    // Remove wind that went off screen
    if (newX > window.innerWidth + 50) {
      dispatch({ type: 'REMOVE_WIND', payload: wind.id });
    }
  });

  // Update impact projectiles
  gameState.impacts.forEach(impact => {
    if (!impact.active) return;

    // Time-based animation (30fps) - use individual frameTime for each impact
    const impactAnimationSpeed = (1000 / 30) * 2; // 30fps base, 2 ticks per frame
    const newFrameTime = impact.frameTime + deltaTime;
    const newFrame = Math.floor(newFrameTime / impactAnimationSpeed) % 7; // 7 frames total

    dispatch({
      type: 'UPDATE_IMPACT',
      payload: {
        id: impact.id,
        updates: { 
          frame: newFrame, 
          frameTime: newFrameTime
        }
      }
    });

    // Deal damage immediately when impact appears (first frame)
    if (!impact.hasHit) {
      console.log('Impact dealing damage to enemies in range');
      
      // Find all enemies in range
      const activeEnemies = gameState.enemies.filter(enemy => enemy.active);
      const enemiesInRange = activeEnemies.filter(enemy => {
        // For eyeballs in slide state, use the actual collision position with slide offsets
        let enemyX = enemy.x;
        let enemyY = enemy.y;
        
        if (enemy.type === 'eyeball' && enemy.state === 'slide') {
          const ticksPerFrame = getEnemyAnimationSpeed(enemy.type);
          const localFrameIndex = Math.floor(enemy.frame / ticksPerFrame) % EYEBALL_SLIDE.frames;
          const offset = EYEBALL_SLIDE.offsets[localFrameIndex];
          enemyX += offset.x;
          enemyY += offset.y;
        }
        
        const distance = Math.sqrt(
          Math.pow(enemyX - impact.x, 2) + Math.pow(enemyY - impact.y, 2)
        );
        return distance <= impact.range;
      });

      console.log(`Found ${enemiesInRange.length} enemies in impact range`);

      if (enemiesInRange.length > 0) {
        // Apply difficulty multiplier to impact damage
        const difficultyConfig = getDifficultyConfig(gameState.difficulty);
        const adjustedTotalDamage = impact.totalDamage * difficultyConfig.multipliers.impactDamage;
        const damagePerEnemy = adjustedTotalDamage / enemiesInRange.length;
        
        enemiesInRange.forEach(enemy => {
          const newHealth = Math.max(0, enemy.health - damagePerEnemy);
          const isDead = newHealth <= 0;
          
          if (isDead) {
            if ((enemy.type as string) === 'undead') {
              // Only start death animation if not already dying
              if (!enemy.dying) {
                // Start undead death animation and mark as dying
                dispatch({ 
                  type: 'START_UNDEAD_DEATH_ANIMATION', 
                  payload: { x: enemy.x, y: enemy.y } 
                });
                dispatch({
                  type: 'UPDATE_ENEMY',
                  payload: {
                    id: enemy.id,
                    updates: { dying: true }
                  }
                });
              }
            } else {
              // Remove other enemies immediately
              dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
              dispatch({ type: 'UPDATE_SCORE', payload: enemy.points });
            }
            playHitSound();
          } else {
            dispatch({
              type: 'UPDATE_ENEMY',
              payload: {
                id: enemy.id,
                updates: { health: newHealth }
              }
            });
          }
        });

        // Mark impact as having hit
        dispatch({
          type: 'UPDATE_IMPACT',
          payload: {
            id: impact.id,
            updates: { hasHit: true }
          }
        });
      }
    }

    // Remove impact after animation completes (7 frames * 100ms = 700ms)
    if (newFrameTime >= 7 * impactAnimationSpeed) {
      dispatch({ type: 'REMOVE_IMPACT', payload: impact.id });
    }
  });

  // Handle ultimate skill activation
  if (gameState.ultimateActive) {
    // Deactivate ultimate after one frame (enemy clearing happens in VFX update)
    dispatch({ type: 'DEACTIVATE_ULTIMATE' });
  }

  // Ultimate VFX animation and flash timing
  if (gameState.ultimateVfx && gameState.ultimateVfx.active) {
    const animSpeed = (1000 / 30) * 2; // 30fps base, 2 ticks per frame
    const vfxNewTime = (gameState.ultimateVfx.frameTime || 0) + deltaTime;
    const vfxFrame = Math.min(16, Math.floor(vfxNewTime / animSpeed)); // 17 frames (0-16), no looping
    dispatch({ type: 'UPDATE_ULTIMATE_VFX', payload: { frameTime: vfxNewTime, frame: vfxFrame } });
    
    // Clear enemies at frame 6
    if (vfxFrame === 12 && gameState.ultimateVfx.frame !== 6) {
      // Clear all enemies except undead (deal 100 damage to undead)
      gameState.enemies.forEach(enemy => {
        if ((enemy.type as string) === 'undead') {
          const newHealth = Math.max(0, enemy.health - 25);
          if (newHealth <= 0) {
            // Start undead death animation and mark as dying
            dispatch({ 
              type: 'START_UNDEAD_DEATH_ANIMATION', 
              payload: { x: enemy.x, y: enemy.y } 
            });
            dispatch({
              type: 'UPDATE_ENEMY',
              payload: {
                id: enemy.id,
                updates: { dying: true }
              }
            });
          } else {
            dispatch({
              type: 'UPDATE_ENEMY',
              payload: {
                id: enemy.id,
                updates: { health: newHealth }
              }
            });
          }
        } else {
          // Remove all other enemies
          dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
          dispatch({ type: 'UPDATE_SCORE', payload: enemy.points });
        }
      });
    }
    
    // Clear VFX only after flash has finished (6 frames + 2000ms = ~2.67s total)
    const flashStart = 6 * animSpeed; // 6th frame
    const flashDuration = 2000; // 2s flash duration
    const totalDuration = flashStart + flashDuration;
    if (vfxNewTime >= totalDuration) {
      dispatch({ type: 'CLEAR_ULTIMATE_VFX' });
    }
  }

  // Update skill effects
  gameState.skillEffects.forEach(effect => {
    if (!effect.active) return;

    const currentTime = Date.now();
    const elapsed = currentTime - effect.startTime;

    if (elapsed >= effect.duration) {
      // Effect expired
      dispatch({ type: 'REMOVE_SKILL_EFFECT', payload: effect.id });
      return;
    }

    // Handle different skill effects
    switch (effect.type) {
      case 'knockback_wind':
        // Apply knockback damage to enemies in range
        gameState.enemies.forEach(enemy => {
          if (!enemy.active) return;

          const distance = Math.sqrt(
            Math.pow(enemy.x - effect.x, 2) + Math.pow(enemy.y - effect.y, 2)
          );

          if (distance <= effect.range) {
            // Apply damage and knockback with difficulty multiplier
            const newHealth = Math.max(0, enemy.health - effect.damage);
            const difficultyConfig = getDifficultyConfig(gameState.difficulty);
            let knockbackMultiplier = difficultyConfig.multipliers.windKnockbackDistance;
            
            // Ghosts have 0.5x knockback distance
            if (enemy.type === 'ghost') {
              knockbackMultiplier *= 0.5;
            }
            
            const knockbackDistance = 300 * knockbackMultiplier; // Apply difficulty multiplier to knockback
            const knockbackX = enemy.x + knockbackDistance;

            if (newHealth <= 0) {
              if ((enemy.type as string) === 'undead') {
                // Start undead death animation and mark as dying
                dispatch({ 
                  type: 'START_UNDEAD_DEATH_ANIMATION', 
                  payload: { x: enemy.x, y: enemy.y } 
                });
                dispatch({
                  type: 'UPDATE_ENEMY',
                  payload: {
                    id: enemy.id,
                    updates: { dying: true }
                  }
                });
              } else {
                // Remove other enemies immediately
                dispatch({ type: 'UPDATE_SCORE', payload: enemy.points });
                dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
              }
            } else {
              dispatch({
                type: 'UPDATE_ENEMY',
                payload: {
                  id: enemy.id,
                  updates: { 
                    health: newHealth,
                    x: knockbackX
                  }
                }
              });
            }
          }
        });
        break;

      case 'ranged_impact':
        // Apply distributed damage to enemies in range
        const enemiesInRange = gameState.enemies.filter(enemy => {
          if (!enemy.active) return false;
          const distance = Math.sqrt(
            Math.pow(enemy.x - effect.x, 2) + Math.pow(enemy.y - effect.y, 2)
          );
          return distance <= effect.range;
        });

        if (enemiesInRange.length > 0) {
          const damagePerEnemy = Math.floor(effect.damage / enemiesInRange.length);
          
          enemiesInRange.forEach(enemy => {
            const newHealth = Math.max(0, enemy.health - damagePerEnemy);
            
            if (newHealth <= 0) {
              if ((enemy.type as string) === 'undead') {
                // Start undead death animation and mark as dying
                dispatch({ 
                  type: 'START_UNDEAD_DEATH_ANIMATION', 
                  payload: { x: enemy.x, y: enemy.y } 
                });
                dispatch({
                  type: 'UPDATE_ENEMY',
                  payload: {
                    id: enemy.id,
                    updates: { dying: true }
                  }
                });
              } else {
                // Remove other enemies immediately
                dispatch({ type: 'UPDATE_SCORE', payload: enemy.points });
                dispatch({ type: 'REMOVE_ENEMY', payload: enemy.id });
              }
            } else {
              dispatch({
                type: 'UPDATE_ENEMY',
                payload: {
                  id: enemy.id,
                  updates: { health: newHealth }
                }
              });
            }
          });
        }
        break;
    }
  });

  // Update fire effects
  gameState.fireEffects.forEach(fire => {
    if (!fire.active) return;

    const currentTime = Date.now();
    const elapsed = currentTime - fire.startTime;

    if (elapsed >= fire.duration) {
      // Fire effect expired
      dispatch({ type: 'REMOVE_FIRE_EFFECT', payload: fire.id });
      return;
    }

    // Update fire animation
    const animationSpeed = (1000 / 30) * 2; // 30fps base, 2 ticks per frame
    const newFrameTime = fire.frameTime + deltaTime;
    const newFrame = Math.floor(newFrameTime / animationSpeed) % 8; // 8 frames

    dispatch({ 
      type: 'UPDATE_FIRE_EFFECT', 
      payload: { 
        id: fire.id, 
        updates: { frame: newFrame, frameTime: newFrameTime } 
      } 
    });
  });

  // Update strike effects
  gameState.strikeEffects.forEach(strike => {
    if (!strike.active) return;

    const currentTime = Date.now();
    const elapsed = currentTime - strike.startTime;
    const animationSpeed = (1000 / 30) * 2; // 30fps base, 2 ticks per frame

    if (elapsed >= animationSpeed * 5) {
      // Strike effect expired
      dispatch({ type: 'REMOVE_STRIKE_EFFECT', payload: strike.id });
      return;
    }

    // Update strike animation
    const newFrameTime = strike.frameTime + deltaTime;
    const newFrame = Math.floor(newFrameTime / animationSpeed) % 5; // 5 frames

    dispatch({ 
      type: 'UPDATE_STRIKE_EFFECT', 
      payload: { 
        id: strike.id, 
        updates: { frame: newFrame, frameTime: newFrameTime } 
      } 
    });
  });

  // Update damage effects
  gameState.damageEffects.forEach(effect => {
    if (!effect.active) return;

    const currentTime = Date.now();
    const elapsed = currentTime - effect.startTime;

    if (elapsed >= effect.duration) {
      // Effect expired
      dispatch({ type: 'REMOVE_DAMAGE_EFFECT', payload: effect.id });
      return;
    }

    // Update opacity (fade out over time)
    const newOpacity = Math.max(0, 1 - (elapsed / effect.duration));
    
    dispatch({ 
      type: 'UPDATE_DAMAGE_EFFECT', 
      payload: { 
        id: effect.id, 
        updates: { opacity: newOpacity } 
      } 
    });
  });

  // Update undead death animation
  if (gameState.undeadDeathAnimation.active) {
    const currentTime = Date.now();
    const elapsed = currentTime - gameState.undeadDeathAnimation.startTime;
    const animationSpeed = 100; // 100ms per frame
    
    // Animation has 20 frames total
    let newFrame = Math.floor(elapsed / animationSpeed);
    
    // Update undead death animation frame
    if (newFrame !== gameState.undeadDeathAnimation.frame) {
      dispatch({ type: 'UPDATE_UNDEAD_DEATH_ANIMATION', payload: { frame: newFrame } });
    }
    
    // If we've completed all frames, stop the animation and remove dying undead
    if (newFrame >= 20) {
      dispatch({ type: 'STOP_UNDEAD_DEATH_ANIMATION' });
      
      // Find and remove any dying undead enemies
      const dyingUndead = gameState.enemies.find(enemy => (enemy.type as string) === 'undead' && enemy.dying);
      if (dyingUndead) {
        dispatch({ type: 'REMOVE_ENEMY', payload: dyingUndead.id });
        dispatch({ type: 'UPDATE_SCORE', payload: dyingUndead.points });
        
      }
    }
  }

  // Update player death animation
  if (gameState.playerDeathAnimation.active) {
    const currentTime = Date.now();
    const elapsed = currentTime - gameState.playerDeathAnimation.startTime;
    const animationSpeed = 100; // 100ms per frame
    
    // Animation has 12 frames total
    let newFrame = Math.floor(elapsed / animationSpeed);
    
    // Update death animation frame
    
    // If we've completed all frames, wait 1 second then go to game over
    if (newFrame >= 12) {
      newFrame = 11; // Stay on last frame
      if (elapsed >= (12 * animationSpeed) + 1000) { // 1 second pause on last frame
        dispatch({ type: 'GAME_OVER' });
        return;
      }
    }
    
    if (newFrame !== gameState.playerDeathAnimation.frame) {
      dispatch({ type: 'UPDATE_DEATH_ANIMATION', payload: { frame: newFrame } });
    }
  }
}

export function handleTyping(gameState: GameState, dispatch: React.Dispatch<GameAction>, char: string) {
  // Debug function: Press 0 to die immediately

  // Make sure we have a current word and it's not empty
  if (!gameState.currentWord || gameState.currentWord.length === 0) {
    return;
  }


  // Case-insensitive comparison
  const expectedChar = gameState.currentWord[gameState.typedIndex].toLowerCase();
  const typedChar = char.toLowerCase();
  
  if (expectedChar === typedChar) {
    const newTypedIndex = gameState.typedIndex + 1;
    
    // Track character typed (only if WPM tracking has started)
    if (gameState.wpmTracking.startTime !== null) {
      dispatch({ type: 'UPDATE_CHARACTERS_TYPED', payload: 1 });
    }
    
    // Add energy for successful typing (1% per character)
    dispatch({ type: 'UPDATE_ULTIMATE_ENERGY', payload: 0.5 });
    
    if (newTypedIndex >= gameState.currentWord.length) {
      // Check if it's a 9-letter word for fire effect
      if (gameState.currentWord.length === 9) {
        // Clear existing fire effects first
        gameState.fireEffects.forEach(fire => {
          dispatch({ type: 'REMOVE_FIRE_EFFECT', payload: fire.id });
        });
        
        // Spawn 3 fires at positions 300px, 400px, 500px with specific sprites
        const firePositions = [300, 400, 500];
        const spriteIndices = [4, 2, 0]; // 5th, 3rd, 2nd sprites (0-indexed: 4, 2, 1)
        const currentTime = Date.now();
        
        firePositions.forEach((x, index) => {
          const fireId = `fire_${currentTime}_${index}`;
          const spriteIndex = spriteIndices[index]; // Use specific sprite for each position
          
          const fireEffect = {
            id: fireId,
            x: x,
            y: gameState.player.y + 60,
            spriteIndex: spriteIndex,
            active: true,
            duration: 4000, // 4 seconds
            startTime: currentTime,
            frame: 0,
            frameTime: 0,
            zindex: 1
          };
          
          dispatch({ type: 'ADD_FIRE_EFFECT', payload: fireEffect });
        });
      }
      
      // Word completed - activate skill
      activateSkill(gameState, dispatch);
      
      // Track word completed (only if WPM tracking has started)
      if (gameState.wpmTracking.startTime !== null) {
        dispatch({ type: 'UPDATE_WORDS_TYPED', payload: 1 });
      }
      
      // Move next word to current word and get new next word
      const selectedSkill = gameState.skills.find(skill => skill.type === gameState.selectedSkill);
      const wordList = selectedSkill?.wordList || gameState.words;
      const newCurrentWord = gameState.nextWord;
      const newNextWord = getRandomWord(wordList, newCurrentWord);
      dispatch({
        type: 'UPDATE_WORD',
        payload: { word: newCurrentWord, typedIndex: 0 }
      });
      dispatch({
        type: 'UPDATE_NEXT_WORD',
        payload: newNextWord
      });
    } else {
      // Update typed index
      dispatch({
        type: 'UPDATE_WORD',
        payload: { word: gameState.currentWord, typedIndex: newTypedIndex }
      });
    }
  }
  // Note: We don't reset on wrong character to prevent word reversion
  // The user can continue typing the correct characters
}


/*skill creation: includes position (created instance of object) and logic */
function activateSkill(gameState: GameState, dispatch: React.Dispatch<GameAction>) {
  const selectedSkill = gameState.skills.find(skill => skill.type === gameState.selectedSkill);
  if (!selectedSkill) return;

  switch (selectedSkill.type) {
    case 'heal':
      // Heal skill - restore health
      const healAmount = selectedSkill.healAmount || 10;
      const newHealth = Math.min(
        gameState.player.maxHealth, 
        gameState.player.health + healAmount
      );
      const actualHealAmount = newHealth - gameState.player.health;
      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { health: newHealth }
      });
      
      // Create heal effect over word display
      const healEffect = createDamageEffect(
        360, // Center of screen (word display area)
        window.innerHeight - 170, // Over word display area
        actualHealAmount,
        'heal'
      );
      dispatch({ type: 'ADD_DAMAGE_EFFECT', payload: healEffect });
      
      playHealSound();
      break;

    case 'bullet':
      // Bullet skill - shoot bullet (current behavior)
      const bullet = createBullet(
        gameState.player.x + BULLET_CONFIG.SPAWN_OFFSET.x,
        gameState.player.y + BULLET_CONFIG.SPAWN_OFFSET.y,
        `bullet_${Date.now()}_${Math.random()}`,
        'bullet'
      );
      dispatch({ type: 'ADD_BULLET', payload: bullet });
      playBulletSound();
      break;

    case 'knockback':
      // Knockback wind skill - create wind projectile
      const wind = createWind(
        gameState.player.x + 60, 
        gameState.player.y + 70, 
        `wind_${Date.now()}_${Math.random()}`,
        'knockback'
      );
      console.log('Creating wind projectile:', wind);
      dispatch({ type: 'ADD_WIND', payload: wind });
      playWindSound();
      break;

    case 'impact':
      // Ranged impact skill - create impact projectile
      const impact = createImpact(
        gameState.player.x + 200,
        gameState.player.y + 20,
        `impact_${Date.now()}_${Math.random()}`,
        'impact'
      );
      console.log('Creating impact projectile:', impact);
      dispatch({ type: 'ADD_IMPACT', payload: impact });
      playImpactSound();
      break;
  }
}

// Handle undead boss special behavior
function handleUndeadBossLogic(enemy: any, gameState: any, dispatch: any, deltaTime: number) {
  const currentTime = Date.now();
  
  // Initialize boss state if not set
  if (!enemy.bossState) {
    enemy.bossState = 'moving';
    enemy.targetX = gameState.player.x + 350;
    enemy.hasReachedTarget = false;
    enemy.attackPhase = 'slow_attacks';
    enemy.attackCount = 0;
    enemy.lastAttackFrame = -1; // Initialize to -1 so first attack can trigger
  }

  let newX = enemy.x;
  let newY = enemy.y;
  let newBossState = enemy.bossState;
  let newAttackPhase = enemy.attackPhase;
  let newAttackCount = enemy.attackCount;

  
  // Update animation frame
  const ticksPerFrame = getEnemyAnimationSpeed(enemy.type);
  
  // Apply difficulty multipliers to attack speed
  const difficultyConfig = getDifficultyConfig(gameState.difficulty);
  const slowAttackMultiplier = difficultyConfig.multipliers.undeadSlowAttackSpeed;
  const fastAttackMultiplier = difficultyConfig.multipliers.undeadFastAttackSpeed;
  
  const baseSlowSpeed = (1000 / 30) * ticksPerFrame * 2.5;
  const baseFastSpeed = (1000 / 30) * ticksPerFrame;
  
  const animationSpeed = enemy.attackPhase == 'slow_attacks' 
    ? baseSlowSpeed * slowAttackMultiplier 
    : baseFastSpeed * fastAttackMultiplier;
    
  const totalFrames = enemy.bossState === 'attacking' ? 6 : enemy.config.spriteConfig.frames;
  const enemyFrame = Math.floor(accumulatedTime / animationSpeed) % (totalFrames * ticksPerFrame);


  if (enemy.bossState === 'moving') {
    // Move towards target position
    const targetX = enemy.targetX || (gameState.player.x + 400);
    const distance = Math.abs(enemy.x - targetX);
    
    if (distance > 5) {
      // Move towards target
      const direction = targetX < enemy.x ? -1 : 1;
      const movementSpeed = enemy.speed * 60; // Convert to pixels per second
      newX = enemy.x + (direction * movementSpeed * deltaTime / 1000);
    } else {
      // Reached target, start attacking
      newBossState = 'attacking';
      newAttackPhase = 'slow_attacks';
      newAttackCount = 0;
      enemy.hasReachedTarget = true;
      enemy.lastAttackFrame = -1; // Reset for new attack phase
    }
  } else if (enemy.bossState === 'attacking') {
    // Handle attack phases
    if (enemy.attackPhase === 'slow_attacks') {
      // 2 slow attacks
      if (enemy.attackCount < 2) {
        // Attack on frame 2 of the attack animation (frame 1 in 0-indexed)
        if (enemyFrame === 1 && enemy.lastAttackFrame !== 1) {
          // Perform attack
          performUndeadAttack(enemy, gameState, dispatch);
          enemy.lastAttackFrame = 1; // Mark that we've attacked on this frame
        }
        else if (enemyFrame !== 1) {
          if (enemyFrame === 5 && enemy.lastAttackFrame === 1) { // reusing the number lmao
            newAttackCount = enemy.attackCount + 1;
            enemy.lastAttackFrame = -1;
          }
        }
      } else {
        // Move to fast attacks
        newAttackPhase = 'fast_attacks';
        newAttackCount = 0;
        enemy.lastAttackFrame = -1; // Reset for fast attacks
      }
    } else if (enemy.attackPhase === 'fast_attacks') {
      // 10 fast attacks
      if (enemy.attackCount < 10) {
        // Attack on frame 2 of the attack animation (frame 1 in 0-indexed)
        if (enemyFrame === 1 && enemy.lastAttackFrame !== 1) {
          // Perform attack
          performUndeadAttack(enemy, gameState, dispatch);
          enemy.lastAttackFrame = 1; // Mark that we've attacked on this frame
        }
        else if (enemyFrame !== 1) {
          if (enemyFrame === 5 && enemy.lastAttackFrame === 1) { // reusing the number lmao
            newAttackCount = enemy.attackCount + 1;
            enemy.lastAttackFrame = -1;
          }
        }
      } else {
        // Move to cooldown
        newBossState = 'cooldown';
        enemy.lastAttackTime = currentTime;
      }
    }
  } else if (enemy.bossState === 'cooldown') {
    // Apply difficulty multiplier to cooldown duration
    const baseCooldownDuration = 15000; // 15 seconds base
    const cooldownMultiplier = difficultyConfig.multipliers.undeadCooldownTime;
    const cooldownDuration = baseCooldownDuration * cooldownMultiplier;
    const cooldownElapsed = enemy.lastAttackTime ? (currentTime - enemy.lastAttackTime) : 0;
    
    // Spawn additional mobs during cooldown (optional feature)
    const mobSpawnProbability = difficultyConfig.multipliers.bossWaveMobSpawnProbability * 0.01; // Convert to per-frame probability
    if (cooldownElapsed > 500 && cooldownElapsed < 7500 && Math.random() < mobSpawnProbability) {
      // Spawn random mobs during cooldown based on difficulty
      const mobTypes = ['wisp', 'bat', 'eyeball', 'wisp', 'bat'];
      const randomType = mobTypes[Math.floor(Math.random() * mobTypes.length)];
      const mobId = `boss_mob_${Date.now()}_${Math.random()}`;
      const mob = createEnemy(randomType as any, mobId);
      
      // Spawn mob at right edge with same Y position as normal waves
      mob.x = 1100;
      // Use the same Y position logic as normal enemy spawning
      if (randomType === 'wisp') {
        mob.y = gameState.player.y + 20; // Same as wisp spawn position
      } else if (randomType === 'bat') {
        mob.y = gameState.player.y + 30; // Same as bat spawn position  
      } else if (randomType === 'eyeball') {
        mob.y = gameState.player.y + 35; // Same as eyeball spawn position
      } else {
        mob.y = gameState.player.y + 20; // Default fallback
      }
      
      dispatch({ type: 'ADD_ENEMY', payload: mob });
    }
    
    if (cooldownElapsed >= cooldownDuration) {
      // Reset to moving phase and update target position
      newBossState = 'moving';
      enemy.targetX = gameState.player.x + 350;
      enemy.hasReachedTarget = false;
      newAttackPhase = 'slow_attacks';
      newAttackCount = 0;
      enemy.lastAttackFrame = -1; // Reset for new cycle
    }
  }

  // Update enemy
  dispatch({
    type: 'UPDATE_ENEMY',
    payload: {
      id: enemy.id,
      updates: {
        x: newX,
        y: newY,
        frame: enemyFrame,
        bossState: newBossState,
        attackPhase: newAttackPhase,
        attackCount: newAttackCount,
        lastAttackTime: enemy.lastAttackTime,
        lastAttackFrame: enemy.lastAttackFrame
      }
    }
  });
}

// Perform undead boss attack
function performUndeadAttack(enemy: any, gameState: any, dispatch: any) {
  // Don't attack if undead is dying
  if (enemy.dying) return;
  
  // Deal damage to player
  const newHealth = Math.max(0, gameState.player.health - enemy.damage);
  const damageAmount = gameState.player.health - newHealth;
  dispatch({
    type: 'UPDATE_PLAYER',
    payload: { health: newHealth }
  });
  
  // Create damage effect over word display
  const damageEffect = createDamageEffect(
    360, // Center of screen (word display area)
    window.innerHeight - 170, // Over word display area
    damageAmount,
    'damage'
  );
  dispatch({ type: 'ADD_DAMAGE_EFFECT', payload: damageEffect });
  
  // Create strike effect at player position
  const strikeId = `strike_${Date.now()}_${Math.random()}`;
  const currentTime = Date.now();
  const strikeEffect = {
    id: strikeId,
    x: gameState.player.x + 50, // Slightly offset from player center
    y: gameState.player.y + 30,
    active: true,
    duration: 500, // 0.5 seconds
    startTime: currentTime,
    frame: 0,
    frameTime: 0
  };
  
  dispatch({ type: 'ADD_STRIKE_EFFECT', payload: strikeEffect });
  
  // Play slash sound effect for undead boss attack
  playSlashSound();
  
  // Check game over
  if (newHealth <= 0 && !gameState.playerDeathAnimation.active) {
    dispatch({ type: 'STOP_WPM_TRACKING' });
    dispatch({ type: 'START_PLAYER_DEATH_ANIMATION' });
  }
}
