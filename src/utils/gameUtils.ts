/*creates enemies, bullets, and checks collisions*/
import { Enemy, Bullet, Wind, Impact, Position, SkillType } from '../types';
import { getEnemySpawnPosition, getEnemyConfig, ENEMY_CONFIGS } from '../config/gameConfig';
import { getSkillByType } from '../config/skillConfig';

export function getSkillConfig(skillType: SkillType) {
  return getSkillByType(skillType);
}

export function getRandomWord(words: string[], currentWord?: string): string {
  if (words.length === 0) return 'hello';
  
  // If we have only one word, return it
  if (words.length === 1) return words[0];
  
  // Try to get a different word than the current one
  let newWord;
  let attempts = 0;
  do {
    newWord = words[Math.floor(Math.random() * words.length)];
    attempts++;
  } while (newWord === currentWord && attempts < 10); // Prevent infinite loop
  
  return newWord;
}

export function createEnemy(type: keyof typeof ENEMY_CONFIGS, id: string): Enemy {
  const config = getEnemyConfig(type);
  const spawnPos = getEnemySpawnPosition(type);
  return {
    id,
    type: config.type,
    x: spawnPos.x,
    y: spawnPos.y,
    health: config.health,
    maxHealth: config.health,
    speed: config.speed,
    damage: config.damage,
    points: config.points,
    frame: 0,
    active: true,
    config
  };
}

export function createBullet(startX: number, startY: number, id: string, skillType: SkillType = 'bullet'): Bullet {
  const skillConfig = getSkillConfig(skillType);
  return {
    id,
    x: startX-10,
    y: startY-20,
    targetX: 0, // Not used in simple movement
    targetY: 0, // Not used in simple movement
    speed: 8, // Match reference speed (could be made configurable)
    damage: skillConfig?.damage || 10,
    active: true,
    frame: 0
  };
}

export function createWind(startX: number, startY: number, id: string, skillType: SkillType = 'knockback'): Wind {
  const skillConfig = getSkillConfig(skillType);
  return {
    id,
    x: startX,
    y: startY,
    targetX: 0, // Not used in simple movement
    targetY: 0, // Not used in simple movement
    speed: skillConfig?.speed || 12, // Use skill speed or default
    damage: skillConfig?.damage || 7,
    knockback: skillConfig?.knockback || 100,
    active: true,
    frame: 0,
    frameTime: 0,
    hitEnemies: new Set<string>(),
    knockbackEnemies: new Set<string>()
  };
}

export function createImpact(startX: number, startY: number, id: string, skillType: SkillType = 'impact'): Impact {
  const skillConfig = getSkillConfig(skillType);
  return {
    id,
    x: startX+100,
    y: startY+20,
    range: skillConfig?.range || 750, // Use skill range or default
    totalDamage: skillConfig?.damage || 30, // Total damage to be shared
    active: true,
    frame: 0,
    frameTime: 0,
    hasHit: false
  };
}

// WPM calculation function
export function calculateWPM(charactersTyped: number, startTime: number | null, endTime?: number | null): number {
  if (!startTime) return 0;
  
  const currentTime = endTime || Date.now();
  const timeElapsed = (currentTime - startTime) / 1000; // Convert to seconds
  const minutes = timeElapsed / 60; // Convert to minutes
  
  if (minutes === 0) return 0;
  
  // WPM = (characters / 4) / minutes
  return Math.round((charactersTyped / 4) / minutes);
}

export function getDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function checkCollision(obj1: Position & { width?: number; height?: number }, obj2: Position & { width?: number; height?: number }): boolean {
  const w1 = obj1.width || 32;
  const h1 = obj1.height || 32;
  const w2 = obj2.width || 32;
  const h2 = obj2.height || 32;

  return (
    obj1.x < obj2.x + w2 &&
    obj1.x + w1 > obj2.x &&
    obj1.y < obj2.y + h2 &&
    obj1.y + h1 > obj2.y
  );
}

export function getRandomEnemyType(): keyof typeof ENEMY_CONFIGS {
  // Early mix including eyeball: 50% bat, 30% wisp, 20% eyeball
  const random = Math.random();
  if (random < 0.5) return 'bat';
  if (random < 0.8) return 'wisp';
  return 'eyeball';
}
