import { useReducer, useEffect, useCallback, useState, useRef } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import WinScreen from './components/WinScreen';
import { gameReducer, initialGameState } from './reducers/gameReducer';
import { useGameLoop } from './hooks/useGameLoop';
import { loadSkillWordLists } from './utils/skillWordLoader';
import { handleTyping } from './utils/gameLogic';
import { stopBackgroundMusic, playBackgroundMusic } from './utils/audioManager';
import { GameState } from './types';

function App() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [wordsLoaded, setWordsLoaded] = useState(false);
  const gameStateRef = useRef<GameState>(gameState);

  // Update the ref whenever gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Load words on component mount
  useEffect(() => {
    loadSkillWordLists().then(skillWords => {
      dispatch({ type: 'LOAD_SKILL_WORDS', payload: skillWords });
      setWordsLoaded(true);
    }).catch(error => {
      console.error('Failed to load skill words:', error);
      setWordsLoaded(true); // Still allow game to start with fallback words
    });
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const currentState = gameStateRef.current;
    if (currentState.currentScreen === 'game' && currentState.gameRunning) {
      if (event.key === 'Enter') {
        // Check for ultimate activation first
        if (currentState.ultimateReady && !currentState.ultimateActive) {
          dispatch({ type: 'ACTIVATE_ULTIMATE' });
        } 
      } 
      else if (event.key === '3' || event.key === '5' || event.key === '7' || event.key === '9') {
        // Handle skill selection - only change if current word length is different
        if (currentState.currentWord.length != parseInt(event.key)) {
          const skillType = event.key === '3' ? 'heal' : 
                           event.key === '5' ? 'bullet' : 
                           event.key === '7' ? 'knockback' : 'impact';
          dispatch({ type: 'SELECT_SKILL', payload: skillType });
        }
      } 
      else if (event.key.length === 1) {
        // Type character
        handleTyping(currentState, dispatch, event.key);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = () => {
    if (wordsLoaded) {
      dispatch({ type: 'START_GAME' });
      // Switch to game screen music when game starts
      playBackgroundMusic('gameScreen');
    }
  };

  const restartGame = () => {
    dispatch({ type: 'RESTART_GAME' });
    // Switch back to start screen music when restarting
    playBackgroundMusic('startScreen');
  };

  // Handle music transitions based on screen changes
  useEffect(() => {
    if (gameState.currentScreen === 'gameOver' || gameState.currentScreen === 'win') {
      stopBackgroundMusic();
    } else if (gameState.currentScreen === 'start') {
      playBackgroundMusic('startScreen');
    }
  }, [gameState.currentScreen]);

  // Use the game loop hook
  useGameLoop(gameState, dispatch);

  if (!wordsLoaded) {
    return (
      <div className="game-container">
        <div className="screen start-screen">
          <h1 className="title">The Cavern of Keystone</h1>
          <p className="subtitle">Loading words...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {gameState.currentScreen === 'start' && (
        <StartScreen 
          gameState={gameState}
          dispatch={dispatch}
          onStart={startGame} 
        />
      )}
      {gameState.currentScreen === 'game' && (
        <GameScreen 
          gameState={gameState} 
          dispatch={dispatch}
        />
      )}
      {gameState.currentScreen === 'gameOver' && (
        <GameOverScreen 
          score={gameState.score}
          onRestart={restartGame}
          wpmTracking={gameState.wpmTracking}
          diedInTutorial={gameState.diedInTutorial}
          difficulty={gameState.difficulty}
          enableInfiniteMode={gameState.enableInfiniteMode}
        />
      )}
      {gameState.currentScreen === 'win' && (
        <WinScreen 
          score={gameState.score}
          onRestart={restartGame}
          wpmTracking={gameState.wpmTracking}
          difficulty={gameState.difficulty}
          enableInfiniteMode={gameState.enableInfiniteMode}
        />
      )}
    </div>
  );
}

export default App;
