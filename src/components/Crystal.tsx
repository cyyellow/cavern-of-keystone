import React from 'react';

interface CrystalProps {
  x: number;
  y: number;
  isDarkMode?: boolean;
  isFlashing?: boolean;
}

const Crystal: React.FC<CrystalProps> = ({ x, y, isDarkMode = false, isFlashing = false }) => {
  const frames = 24;
  // Use time-based animation for crystal (it's not tied to game state)
  const animationSpeed = (1000 / 30) * 3; // 30fps base, 2 ticks per frame
  const currentFrame = Math.floor(Date.now() / animationSpeed) % frames;
  
  // Flash effect logic - smooth phasing when flashing
  const shouldFlash = isFlashing; // Always apply flash animation when flashing state is true
  
  const spriteWidth = 64;
  const spriteHeight = 64;
  const scale = 2;

  return (
    <div
      className={`game-object crystal ${isDarkMode ? 'dark-crystal' : ''}`}
      style={{
        left: x - (spriteWidth * scale) / 2, // Center the crystal
        top: y - (spriteHeight * scale) / 2,
        width: spriteWidth * scale,
        height: spriteHeight * scale,
        zIndex: 1, // Below enemies but above background
      }}
    >
      <div
        className={`sprite ${shouldFlash ? 'crystal-flash-glow' : ''} ${isDarkMode ? 'crystal-dark-glow' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: isDarkMode 
            ? 'url(./assets/sprites/crystal/crystal_dark_64x64_24f_20d_no_light_no_border.png)'
            : 'url(./assets/sprites/crystal/crystal_dark_64x64_24f_20d_normal.png)',
          backgroundPosition: `${-currentFrame * spriteWidth * scale}px 0px`,
          backgroundSize: `${spriteWidth * frames * scale}px ${spriteHeight * scale}px`
        }}
      />
    </div>
  );
};

export default Crystal;
