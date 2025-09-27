import React from 'react';
import { Player as PlayerType, GameState } from '../types';
import { PLAYER_CONFIG } from '../config/gameConfig';

interface PlayerProps {
  player: PlayerType;
  gameState: GameState;
}

const Player: React.FC<PlayerProps> = ({ player, gameState }) => {
  const playerFrames = PLAYER_CONFIG.ANIMATION.frames;
  const playerTicksPerFrame = PLAYER_CONFIG.ANIMATION.ticksPerFrame;
  const frameIndex = Math.floor(player.frame / playerTicksPerFrame) % playerFrames;
  const scale = PLAYER_CONFIG.VISUAL.scale;
  const baseWidth = PLAYER_CONFIG.VISUAL.baseWidth;
  const baseHeight = PLAYER_CONFIG.VISUAL.baseHeight;
  const spriteWidth = baseWidth * scale;
  const spriteHeight = baseHeight * scale;

  // Compute hitbox rectangle in pixels based on config ratios
  const getHitboxStyle = () => {
    const hb = PLAYER_CONFIG.HITBOX;
    const hbWidth = Math.max(2, spriteWidth * hb.width);
    const hbHeight = Math.max(2, spriteHeight * hb.height);
    const hbLeft = spriteWidth * hb.offsetX;
    const hbTop = spriteHeight * hb.offsetY;
    return {
      left: hbLeft,
      top: hbTop,
      width: hbWidth,
      height: hbHeight,
    };
  };

  // Hide player during death animation
  if (gameState.playerDeathAnimation.active) {
    return null;
  }

  return (
    <div 
      className="game-object player"
      style={{
        left: player.x,
        top: player.y,
        width: spriteWidth,
        height: spriteHeight,
      }}
    >
      <div
        className="sprite"
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: 'url(../public/assets/sprites/B_witch_idle.png)',
          backgroundPosition: `0px ${-frameIndex * spriteHeight}px`,
          backgroundSize: `${spriteWidth}px ${spriteHeight * 6}px`,
          imageRendering: 'pixelated',
        }}
      />
      {/* Debug: show actual hitbox */}
      <div className="hitbox-debug" style={getHitboxStyle()} />
    </div>
  );
};

export default Player;
