import { GameState, GameAction } from '../types';
import { getDifficultyConfig, getNextDifficultyLevel, getPreviousDifficultyLevel } from '../config/difficultyConfig';

interface StartScreenProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ gameState, dispatch, onStart }) => {

  const currentDifficulty = getDifficultyConfig(gameState.difficulty);
  
  const handleDifficultyChange = (direction: 'prev' | 'next') => {
    const newDifficulty = direction === 'next' 
      ? getNextDifficultyLevel(gameState.difficulty)
      : getPreviousDifficultyLevel(gameState.difficulty);
    dispatch({ type: 'SET_DIFFICULTY', payload: newDifficulty });
  };

  return (
    <div className="screen start-screen">
      <img 
        src="./assets/images/banner.png" 
        alt="The Cavern of Keystone" 
        className="title-banner"
      />
      <div className="instructions">
        <p>A Typing Game</p>
      </div>

      <div className="difficulty-selection">
        <div className="difficulty-controls">
          <button 
            className="difficulty-arrow" 
            onClick={() => handleDifficultyChange('prev')}
            aria-label="Previous difficulty"
          >
            ◀
          </button>
          <div className="difficulty-display">
            <div className="difficulty-name">{currentDifficulty.name}</div>
            <div className="difficulty-wpm">{currentDifficulty.wpm} WPM</div>
          </div>
          <button 
            className="difficulty-arrow" 
            onClick={() => handleDifficultyChange('next')}
            aria-label="Next difficulty"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="game-settings">
        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={gameState.enableTutorialWave}
              onChange={() => dispatch({ type: 'TOGGLE_TUTORIAL_WAVE' })}
            />
            <span className="checkmark"></span>
            Enable tutorial wave
          </label>
        </div>
      </div>

      <button className="start-button" onClick={onStart}>
        Start Game
      </button>

      <button 
        className="infinite-mode-button" 
        onClick={() => {
          dispatch({ type: 'TOGGLE_INFINITE_MODE' });
          onStart();
        }}
      >
        Infinite Mode
      </button>
    </div>
  );
};

export default StartScreen;
