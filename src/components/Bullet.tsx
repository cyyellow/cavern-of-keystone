import React from 'react';
import { Bullet as BulletType } from '../types';
import { BULLET_CONFIG } from '../config/gameConfig';

interface BulletProps {
  bullet: BulletType;
}

const Bullet: React.FC<BulletProps> = ({ bullet }) => {
  const frames = 15;
  const animationSpeed = (1000 / 30) * 1; // 30fps base, 1 tick per frame
  const currentFrame = Math.floor(Date.now() / animationSpeed) % frames;
  
  const spriteWidth = 16;
  const spriteHeight = 16;
  const scale = 3; // Make bullets bigger
  const displayWidth = spriteWidth * scale;
  const displayHeight = spriteHeight * scale;

  // Bullet hitbox configuration (smaller than visual sprite)
  const hitboxConfig = BULLET_CONFIG.HITBOX;

  // Calculate hitbox dimensions and position
  const hitboxWidth = displayWidth * hitboxConfig.width;
  const hitboxHeight = displayHeight * hitboxConfig.height;
  const hitboxLeft = displayWidth * hitboxConfig.offsetX;
  const hitboxTop = displayHeight * hitboxConfig.offsetY;

  return (
    <div 
      className="game-object bullet"
      style={{
        left: bullet.x,
        top: bullet.y,
        width: displayWidth,
        height: displayHeight,
      }}
    >
      <div
        className="sprite"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(/assets/bullet/fireball/1_${currentFrame}.png)`,
          backgroundSize: '100% 100%'
        }}
      />
      {/* Debug hitbox */}
      <div 
        className="hitbox-debug" 
        style={{
          left: hitboxLeft,
          top: hitboxTop,
          width: hitboxWidth,
          height: hitboxHeight,
        }}
      />
    </div>
  );
};

export default Bullet;
