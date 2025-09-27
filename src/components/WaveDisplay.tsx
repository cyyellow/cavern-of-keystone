import React from 'react';
import { GameState } from '../types';
import { getWaveProgress, getNextWaveInfo } from '../utils/waveSpawner';

interface WaveDisplayProps {
  gameState: GameState;
}

export const WaveDisplay: React.FC<WaveDisplayProps> = ({ gameState }) => {
  const waveProgress = getWaveProgress(gameState);
  const nextWaveInfo = getNextWaveInfo(gameState);

  return (
    <div className="wave-display">
      <div className="wave-info">
        <h3>Wave {gameState.waveState.currentWaveId}: {waveProgress.waveName}</h3>
        <div className="wave-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${waveProgress.progress}%` }}
            />
          </div>
          <span className="progress-text">
            {waveProgress.enemiesRemaining} / {waveProgress.totalEnemies} enemies
          </span>
        </div>
      </div>
      
      {!gameState.waveState.isWaveActive && (
        <div className="next-wave">
          <p>Next: {nextWaveInfo.name}</p>
          {nextWaveInfo.description && (
            <p className="wave-description">{nextWaveInfo.description}</p>
          )}
        </div>
      )}
      
      <div className="wave-stats">
        <p>Completed Waves: {gameState.waveState.completedWaves}</p>
      </div>
    </div>
  );
};
