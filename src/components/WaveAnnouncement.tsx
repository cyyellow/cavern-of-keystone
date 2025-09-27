import React from 'react';
import { GameState } from '../types';

interface WaveAnnouncementProps {
  gameState: GameState;
}

const WaveAnnouncement: React.FC<WaveAnnouncementProps> = ({ gameState }) => {
  if (!gameState.waveAnnouncement.visible) {
    return null;
  }

  return (
    <div className="wave-announcement">
      <div className="wave-announcement-content">
        <h2 className="wave-title">Wave {gameState.waveAnnouncement.waveNumber}</h2>
        {gameState.showHints && gameState.waveAnnouncement.hint && (
          <p className="wave-hint">{gameState.waveAnnouncement.hint}</p>
        )}
      </div>
    </div>
  );
};

export default WaveAnnouncement;
