import React from 'react';
import { GameState } from '../types';

interface HintDisplayProps {
  gameState: GameState;
}

const HintDisplay: React.FC<HintDisplayProps> = ({ gameState }) => {
  if (!gameState.currentHint || !gameState.showHints) {
    return null;
  }

  return (
    <div className="hint-display">
      {gameState.currentHint}
    </div>
  );
};

export default HintDisplay;
