import React from 'react';
import { Wind as WindType } from '../types';

interface WindProps {
  wind: WindType;
}

const Wind: React.FC<WindProps> = ({ wind }) => {
  // Use frame from game state (starts at 0, goes to 15)
  const currentFrame = wind.frame % 16; // 16 frames total
  const frameNumber = currentFrame + 1; // Frames are numbered 1-16

  const imagePath = `./assets/vfx/wind/W401-${frameNumber}.png`;
  
  // Debug logging
  console.log('Rendering wind:', wind.id, 'at', wind.x, wind.y, 'frame:', frameNumber);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: wind.x,
    top: wind.y,
    width: 128, // Adjust size as needed
    height: 128,
    transform: 'translateX(-50%) translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 10,
    backgroundImage: `url(${imagePath})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  return (
    <>
      <div className="wind-projectile" style={style} />
      <div 
        className="wind-hitbox" 
        style={{
          left: wind.x,
          top: wind.y,
        }} 
      />
    </>
  );
};

export default Wind;
