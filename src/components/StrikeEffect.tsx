import React from 'react';
import { StrikeEffect as StrikeEffectType } from '../types';

interface StrikeEffectProps {
  strike: StrikeEffectType;
}

const StrikeEffect: React.FC<StrikeEffectProps> = ({ strike }) => {
  const frames = 5; // 5 frames for strike animation
  const currentFrame = strike.frame % frames;
  
  // Use individual frame files instead of spritesheet
  const frameFiles = [
    'SFX304_00.png',
    'SFX304_01.png', 
    'SFX304_02.png',
    'SFX304_03.png',
    'SFX304_05.png' // Note: SFX304_04.png is missing, using 05 instead
  ];
  
  const scale = 1.5; // 3x upscale
  const frameWidth = 64 * scale; // 192px (assuming 64px per frame)
  const frameHeight = 64 * scale; // 192px
  
  const style: React.CSSProperties = {
    position: 'absolute',
    left: strike.x - frameWidth / 2, // Center the scaled frame
    top: strike.y - frameHeight / 2, // Center the scaled sprite
    width: frameWidth,         // Show only one frame (192px wide)
    height: frameHeight,       // 192px tall
    backgroundImage: `url(/assets/vfx/strike/${frameFiles[currentFrame]})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    pointerEvents: 'none',
    zIndex: 15, // Above enemies but below UI
  };

  return <div style={style} />;
};

export default StrikeEffect;
