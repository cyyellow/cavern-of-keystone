import React from 'react';
import { GameState } from '../types';

interface PlayerDeathAnimationProps {
  gameState: GameState;
}

const PlayerDeathAnimation: React.FC<PlayerDeathAnimationProps> = ({ gameState }) => {
  if (!gameState.playerDeathAnimation.active) return null;

  const deathAnim = gameState.playerDeathAnimation;
  const frame = deathAnim.frame;
  
  // Death animation is active
  
  // Animation layout: 12 frames vertical
  // First 6 frames (top): 32x48 each
  // Last 6 frames (bottom): 32x32 each
  const spriteWidth = 32;
  const spriteHeight = frame < 6 ? 48 : 32;
  const scale = 3; // Scale up for visibility
  
  // Calculate frame position in sprite sheet
  let frameY;
  let topOffset = 0;
  
  if (frame < 6) {
    // Top row frames (32x48)
    frameY = frame * 48;
  } else {
    // Bottom row frames (32x32) - need to align bottom with 32x48 sprites
    frameY = (6 * 48) + ((frame - 6) * 32);
    // Offset by the difference in height (48 - 32 = 16 pixels) to align bottoms
    topOffset = 16 * scale;
  }

  // Total sprite sheet height: 6 * 48 + 6 * 32 = 288 + 192 = 480
  const totalSheetHeight = 6 * 48 + 6 * 32; // 480

  return (
    <div
      className="player-death-animation"
      style={{
        position: 'absolute',
        left: gameState.player.x, // Match player position exactly (no centering offset)
        top: gameState.player.y + topOffset,  // Add offset for 32x32 frames to align bottoms
        width: spriteWidth * scale,
        height: spriteHeight * scale,
        zIndex: 20, // Above everything else
        backgroundImage: 'url(./assets/sprites/B_witch_death.png)',
        backgroundPosition: `0px ${-frameY * scale}px`,
        backgroundSize: `${32 * scale}px ${totalSheetHeight * scale}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default PlayerDeathAnimation;
