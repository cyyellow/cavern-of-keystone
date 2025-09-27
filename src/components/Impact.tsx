import React from 'react';
import { Impact as ImpactType } from '../types';

interface ImpactProps {
  impact: ImpactType;
}

const Impact: React.FC<ImpactProps> = ({ impact }) => {
  // Use frame from game state (starts at 0, goes to 6)
  const currentFrame = impact.frame % 7; // 7 frames total (frame0000 to frame0006)
  const frameNumber = currentFrame.toString().padStart(4, '0'); // Format as frame0000, frame0001, etc.

  const imagePath = `../public/assets/vfx/impact/frame${frameNumber}.png`;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: impact.x,
    top: impact.y,
    width: impact.range * 2, // Size based on range
    height: impact.range * 2,
    transform: 'translateX(-50%) translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 7,
    backgroundImage: `url(${imagePath})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  };

  return (
    <>
      <div className="impact-projectile" style={style} />
      <div 
        className="impact-hitbox" 
        style={{
          left: impact.x,
          top: impact.y,
          width: impact.range * 1.5,
          height: impact.range * 1.5,
        }} 
      />
    </>
  );
};

export default Impact;
