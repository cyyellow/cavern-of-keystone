import React from 'react';
import { Enemy as EnemyType } from '../types';
import { getEnemyAnimationSpeed, EYEBALL_SLIDE } from '../config/gameConfig';

interface EnemyProps {
  enemy: EnemyType;
  gameState?: any; // Add gameState to check for undead death animation
}

const Enemy: React.FC<EnemyProps> = ({ enemy, gameState }) => {
  const getSpriteStyle = () => {
    const config = enemy.config.spriteConfig;
    const ticksPerFrame = getEnemyAnimationSpeed(enemy.type);
    const totalFrames = (enemy.type === 'eyeball' && enemy.state === 'slide') ? EYEBALL_SLIDE.frames : config.frames;
    const frameIndex = Math.floor(enemy.frame / ticksPerFrame) % totalFrames;
    const scale = config.scale || 2;
    // Base source frame size from config; default to 32x32
    const baseWidth = config.sourceWidth || 32;
    const baseHeight = config.sourceHeight || 32;
    let spriteWidth = baseWidth * scale;
    let spriteHeight = baseHeight * scale;

    switch (enemy.type) {
      case 'wisp':
        // 10 frames horizontal
        return {
          width: spriteWidth,
          height: spriteHeight,
          backgroundSize: `${spriteWidth * 10}px ${spriteHeight}px`,
          backgroundPosition: `${-frameIndex * spriteWidth}px 0px`,
        };
      
      case 'eyeball': {
        // Render based on current state: normal walk (vertical 7) or slide (vertical 12)
        const isSliding = enemy.state === 'slide';
        const totalFramesLocal = isSliding ? EYEBALL_SLIDE.frames : 7;
        // If sliding, use slide's native frame dimensions for the box to avoid squish
        if (isSliding) {
          const slideW = EYEBALL_SLIDE.sourceWidth || baseWidth;
          const slideH = EYEBALL_SLIDE.sourceHeight || baseHeight;
          spriteWidth = slideW * scale;
          spriteHeight = slideH * scale;
        }
        return {
          width: spriteWidth,
          height: spriteHeight,
          backgroundSize: `${spriteWidth}px ${spriteHeight * totalFramesLocal}px`,
          backgroundPosition: `0px ${-frameIndex * spriteHeight}px`,
        };
      }
        
      case 'bat':
        // 6 frames: 4 on top row, 2 on bottom right
        if (frameIndex < 4) {
          // Top row
          return {
            width: spriteWidth,
            height: spriteHeight,
            backgroundSize: `${spriteWidth * 4}px ${spriteHeight * 2}px`,
            backgroundPosition: `${-frameIndex * spriteWidth}px 0px`,
          };
        } else {
          // Bottom row (frames 4-5, positioned at columns 2-3)
          const bottomFrameIndex = frameIndex - 4;
          return {
            width: spriteWidth,
            height: spriteHeight,
            backgroundSize: `${spriteWidth * 4}px ${spriteHeight * 2}px`,
            backgroundPosition: `${-(bottomFrameIndex) * spriteWidth}px ${-spriteHeight}px`,
          };
        }
        
      case 'ghost':
        // 8x8 spritesheet, use 3rd column (index 2)
        const col = 2;
        const row = frameIndex;
        return {
          width: spriteWidth,
          height: spriteHeight,
          backgroundSize: `${spriteWidth * 8}px ${spriteHeight * 8}px`,
          backgroundPosition: `${-col * spriteWidth}px ${-row * spriteHeight}px`,
        };
        
      case 'undead':
        // Handle different animation states
        if (enemy.bossState === 'attacking') {
          // Attack animation: 12 frames, 2 rows, 6 columns each (100x100 per frame)
          const attackFrames = 6;
          const attackFrameIndex = Math.floor(enemy.frame / ticksPerFrame) % attackFrames;
          const attackCol = attackFrameIndex % 6;
          return {
            width: spriteWidth,
            height: spriteHeight,
            backgroundSize: `${spriteWidth * 6}px ${spriteHeight * 2}px`,
            backgroundPosition: `${-attackCol * spriteWidth}px ${spriteHeight}px`,
          };
        } else {
          // Idle animation: 8 frames: 2 rows, 4 columns each
          const undeadRow = Math.floor(frameIndex / 4);
          const undeadCol = frameIndex % 4;
          return {
            width: spriteWidth,
            height: spriteHeight,
            backgroundSize: `${spriteWidth * 4}px ${spriteHeight * 2}px`,
            backgroundPosition: `${-undeadCol * spriteWidth}px ${-undeadRow * spriteHeight}px`,
          };
        }
        
      default:
        return {
          width: spriteWidth,
          height: spriteHeight,
          backgroundSize: `${spriteWidth}px ${spriteHeight}px`,
          backgroundPosition: '0px 0px',
        };
    }
  };

  const getSpriteImage = () => {
    switch (enemy.type) {
      case 'wisp':
        return '/assets/sprites/wisp.png';
      case 'eyeball':
        return enemy.state === 'slide'
          ? '/assets/sprites/eyeball_slide.PNG'
          : '/assets/sprites/eyeball_walk.PNG';
      case 'bat':
        // Use enemy ID to generate consistent random choice between blue and purple
        const hash = enemy.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        return Math.abs(hash) % 2 === 0 
          ? '/assets/sprites/bluebat_Flying.png'
          : '/assets/sprites/purplebat_Flying.png';
      case 'ghost':
        return '/assets/sprites/ghost.png';
      case 'undead':
        return enemy.bossState === 'attacking' 
          ? '/assets/sprites/undead_atk.png'
          : '/assets/sprites/undead_idle2.png';
      default:
        return '/assets/sprites/wisp.png';
    }
  };

  const spriteStyle = getSpriteStyle();

  // Hide undead enemy during death animation
  if (enemy.type === 'undead' && enemy.dying && gameState?.undeadDeathAnimation?.active) {
    return null;
  }

  // Compute hitbox rectangle in pixels based on config ratios
  const getHitboxStyle = () => {
    // For eyeball, always use walk sprite dimensions for consistent hitbox size
    const config = enemy.config.spriteConfig;
    const scale = config.scale || 2;
    const baseWidth = config.sourceWidth || 32;
    const baseHeight = config.sourceHeight || 32;
    const hitboxWidth = baseWidth * scale;
    const hitboxHeight = baseHeight * scale;
    
    const hb = enemy.config.hitbox || { width: 0.7, height: 0.7, offsetX: 0.15, offsetY: 0.15 };
    const hbWidth = Math.max(2, hitboxWidth * hb.width);
    const hbHeight = Math.max(2, hitboxHeight * hb.height);

    // Base offsets inside sprite box
    let hbLeft = hitboxWidth * hb.offsetX;
    let hbTop = hitboxHeight * hb.offsetY;

    // Apply eyeball slide per-frame visual offset to debug box so it matches collision
    if (enemy.type === 'eyeball' && enemy.state === 'slide') {
      const ticksPerFrame = getEnemyAnimationSpeed(enemy.type);
      const localFrameIndex = Math.floor(enemy.frame / ticksPerFrame) % EYEBALL_SLIDE.frames;
      const offset = EYEBALL_SLIDE.offsets[localFrameIndex];
      hbLeft += offset.x;
      hbTop += offset.y;
    }
    return {
      left: hbLeft,
      top: hbTop,
      width: hbWidth,
      height: hbHeight,
    };
  };

  return (
    <div 
      className="game-object enemy"
      style={{
        left: enemy.x,
        top: enemy.y,
        width: spriteStyle.width,
        height: spriteStyle.height,
      }}
    >
      <div
        className="sprite"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${getSpriteImage()})`,
          backgroundPosition: spriteStyle.backgroundPosition,
          backgroundSize: spriteStyle.backgroundSize,
          imageRendering: 'pixelated',
        }}
      />
      {/* Debug: show actual hitbox */}
      <div className="hitbox-debug" style={getHitboxStyle()} />
      
      {/* Health bar for enemies */}
      {enemy.health < enemy.maxHealth && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: (() => {
              // For eyeball slide, position health bar to follow hitbox
              if (enemy.type === 'eyeball' && enemy.state === 'slide') {
                const config = enemy.config.spriteConfig;
                const scale = config.scale || 2;
                const baseWidth = config.sourceWidth || 32;
                const hitboxWidth = baseWidth * scale;
                const hb = enemy.config.hitbox || { width: 0.7, height: 0.7, offsetX: 0.15, offsetY: 0.15 };
                const hbLeft = hitboxWidth * hb.offsetX;
                
                // Apply slide offset
                const ticksPerFrame = getEnemyAnimationSpeed(enemy.type);
                const localFrameIndex = Math.floor(enemy.frame / ticksPerFrame) % EYEBALL_SLIDE.frames;
                const offset = EYEBALL_SLIDE.offsets[localFrameIndex];
                const finalLeft = hbLeft + offset.x;
                
                return `${finalLeft}px`;
              }
              return '50%';
            })(),
            transform: enemy.type === 'eyeball' && enemy.state === 'slide' ? 'none' : 'translateX(-50%)',
            width: '60px', // Fixed width regardless of sprite size
            height: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              width: `${(enemy.health / enemy.maxHealth) * 100}%`,
              height: '100%',
              backgroundColor: '#E070B2',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Enemy;
