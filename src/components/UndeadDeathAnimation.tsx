import React from 'react';
import { UndeadDeathAnimation as UndeadDeathAnimationType } from '../types';

interface UndeadDeathAnimationProps {
  animation: UndeadDeathAnimationType;
}

const UndeadDeathAnimation: React.FC<UndeadDeathAnimationProps> = ({ animation }) => {
  if (!animation.active) return null;

  const frame = animation.frame;
  
  // Animation layout: 20 frames, 2 rows, 10 cols, played RIGHT TO LEFT and up to down
  // Sprite sheet: 1000x200 (10 cols * 100px, 2 rows * 100px)
  // Match undead boss scaling: base 32x32 * scale 7 = 224x224
  const baseWidth = 32;
  const baseHeight = 32;
  const scale = 7; // Match undead boss scale
  const spriteWidth = baseWidth * scale; // 224
  const spriteHeight = baseHeight * scale; // 224
  
  // Calculate frame position in sprite sheet (right to left, up to down)
  // Frame 0: top-right (col 9, row 0)
  // Frame 1: top-right-1 (col 8, row 0)
  // ...
  // Frame 9: top-left (col 0, row 0)
  // Frame 10: bottom-right (col 9, row 1)
  // Frame 11: bottom-right-1 (col 8, row 1)
  // ...
  // Frame 19: bottom-left (col 0, row 1)
  
  const col = 9 - (frame % 10); // Right to left: start at col 9, go to col 0
  const row = Math.floor(frame / 10); // Up to down: row 0 for frames 0-9, row 1 for frames 10-19
  
  // Source sprite sheet has 100x100 frames, but we're scaling to 224x224
  const sourceFrameSize = 100; // Original frame size in sprite sheet
  const frameX = col * sourceFrameSize;
  const frameY = row * sourceFrameSize;
  
  // Calculate the scale factor to fit 100x100 frames into 224x224 display
  const frameScale = spriteWidth / sourceFrameSize; // 224 / 100 = 2.24


  return (
    <div
      className="undead-death-animation"
      style={{
        position: 'absolute',
        left: animation.x,
        top: animation.y,
        width: spriteWidth,
        height: spriteHeight,
        zIndex: 25, // Above everything else
        backgroundImage: 'url(../public/assets/sprites/undead_death.png)',
        backgroundPosition: `${-frameX * frameScale}px ${-frameY * frameScale}px`,
        backgroundSize: `${1000 * frameScale}px ${200 * frameScale}px`,
        imageRendering: 'pixelated',
        pointerEvents: 'none',
      }}
    />
  );
};

export default UndeadDeathAnimation;
