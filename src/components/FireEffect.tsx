import React from 'react';
import { FireEffect as FireEffectType } from '../types';

interface FireEffectProps {
  fire: FireEffectType;
}

const FireEffect: React.FC<FireEffectProps> = ({ fire }) => {
  const frames = 8; // 8 frames horizontal
  const currentFrame = fire.frame % frames;
  
  // Choose sprite based on spriteIndex (0-4)
  const spriteName = `fire_asset_blue_${fire.spriteIndex + 1}`;
  
  // Calculate opacity based on remaining time (fade over last 1 second)
  const elapsed = Date.now() - fire.startTime;
  const fadeStart = fire.duration - 1000; // Start fading 1 second before end
  const fadeProgress = Math.max(0, Math.min(1, (elapsed - fadeStart) / 1000));
  const opacity = 1 - fadeProgress;

  const scale = 3; // 3x upscale
  const frameWidth = 32 * scale; // 96px
  const frameHeight = 48 * scale; // 144px
  const spritesheetWidth = 256 * scale; // 768px
  const spritesheetHeight = 48 * scale; // 144px
  const frameOffset = 32 * scale; // 96px per frame
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: fire.x - frameWidth / 2, // Center the scaled frame
    top: fire.y - frameHeight / 2, // Center the scaled sprite
    width: frameWidth,         // Show only one frame (96px wide)
    height: frameHeight,       // 144px tall
    backgroundImage: `url(./assets/vfx/fire_asset_blue/${spriteName}.png)`,
    backgroundPosition: `-${currentFrame * frameOffset}px 0`, // 96px per frame
    backgroundSize: `${spritesheetWidth}px ${spritesheetHeight}px`, // Scaled spritesheet size
    backgroundRepeat: 'no-repeat',
    opacity: opacity,
    pointerEvents: 'none',
    zIndex: 5, // Behind enemies (enemies are typically z-index 10+)
  };

  return <div style={style} />;
};

export default FireEffect;
