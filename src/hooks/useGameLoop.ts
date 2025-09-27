import { useEffect, useRef } from 'react';
import { GameState, GameAction } from '../types';
import { updateGameLogic } from '../utils/gameLogic';

export function useGameLoop(gameState: GameState, dispatch: React.Dispatch<GameAction>) {
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const gameStateRef = useRef<GameState>(gameState);

  // Update the ref whenever gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!gameState.gameRunning || gameState.currentScreen !== 'game') {
      return;
    }

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Update game logic with current state
      updateGameLogic(gameStateRef.current, dispatch, deltaTime);

      // Continue the loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gameRunning, gameState.currentScreen, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
}
