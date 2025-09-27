import React from 'react';
import { calculateWPM } from '../utils/gameUtils';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  wpmTracking: {
    startTime: number | null;
    endTime: number | null;
    charactersTyped: number;
    wordsTyped: number;
  };
  diedInTutorial: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  enableInfiniteMode: boolean;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, wpmTracking, diedInTutorial, difficulty, enableInfiniteMode }) => {


  const averageWPM = calculateWPM(wpmTracking.charactersTyped, wpmTracking.startTime, wpmTracking.endTime);

  const getDifficultyText = () => {
    const difficultyText = difficulty.slice(0).toUpperCase();
    return enableInfiniteMode ? `${difficultyText} INFINITE` : difficultyText;
  };

  return (
    <div className="screen game-over-screen">
      <h1 className="game-over-title">Game Over</h1>
      
      
      {/* Blue Witch Death Animation - Last Frame */}
      <div className="game-over-death-sprite" />
      <p className="difficulty-marker">{getDifficultyText()}</p>
      <p className="final-score">Score: {score}</p>
      
      {!diedInTutorial && (
        <div className="wpm-metrics">
          <p className="words-typed">Words typed: {wpmTracking.wordsTyped}</p>
          <p className="average-wpm">Average WPM: {averageWPM}</p>
        </div>
      )}

      <button className="restart-button" onClick={onRestart}>
        Play Again
      </button>
    </div>
  );
};

export default GameOverScreen;
