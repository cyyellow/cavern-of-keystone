import React from 'react';

interface WinScreenProps {
  score: number;
  onRestart: () => void;
  wpmTracking: {
    startTime: number | null;
    endTime: number | null;
    charactersTyped: number;
    wordsTyped: number;
  };
  difficulty: 'easy' | 'normal' | 'hard';
  enableInfiniteMode: boolean;
}

const WinScreen: React.FC<WinScreenProps> = ({ score, onRestart, wpmTracking, difficulty, enableInfiniteMode }) => {


  const calculateWPM = (charactersTyped: number, startTime: number | null, endTime?: number | null): number => {
    if (!startTime) return 0;
    
    const currentTime = endTime || Date.now();
    const timeElapsed = (currentTime - startTime) / 1000; // Convert to seconds
    const minutes = timeElapsed / 60; // Convert to minutes
    
    if (minutes === 0) return 0;
    
    // WPM = (characters / 4) / minutes
    return Math.round((charactersTyped / 4) / minutes);
  };

  const averageWPM = calculateWPM(wpmTracking.charactersTyped, wpmTracking.startTime, wpmTracking.endTime);

  const getDifficultyText = () => {
    const difficultyText = difficulty.slice(0).toUpperCase();
    return enableInfiniteMode ? `${difficultyText} INFINITE` : difficultyText;
  };

  return (
    <div className="screen win-screen">
      <h1 className="win-title">Victory!</h1>
      
      {/* Blue Witch Idle Sprite */}
      <div className="win-witch-sprite" />
      
      <p className="difficulty-marker">{getDifficultyText()}</p>
      <p className="final-score">Score: {score}</p>
      
      <div className="wpm-metrics">
        <p className="words-typed">Words typed: {wpmTracking.wordsTyped}</p>
        <p className="average-wpm">Average WPM: {averageWPM}</p>
      </div>

      <button className="restart-button" onClick={onRestart}>
        Play Again
      </button>
    </div>
  );
};

export default WinScreen;
