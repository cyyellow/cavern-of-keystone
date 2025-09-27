import React from 'react';
import { GameState, GameAction } from '../types';
import Player from './Player';
import Enemy from './Enemy';
import Bullet from './Bullet';
import Wind from './Wind';
import Impact from './Impact';
import WordDisplay from './WordDisplay';
import WaveAnnouncement from './WaveAnnouncement';
import HintDisplay from './HintDisplay';
import Crystal from './Crystal';
import SkillBar from './SkillBar';
import SkillEffect from './SkillEffect';
import UltimateVfx from './UltimateVfx';
import FireEffect from './FireEffect';
import StrikeEffect from './StrikeEffect';
import DamageEffect from './DamageEffect';
import UndeadDeathAnimation from './UndeadDeathAnimation';
import PlayerDeathAnimation from './PlayerDeathAnimation';

interface GameScreenProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameState, dispatch }) => {
  const crystalX = 1150;
  const crystalY = 300;
  
  // Crystal mode is now controlled by gameState.crystalInDarkMode
  return (
    <div className="screen game-screen">
      {/* Wave Announcement */}
      <WaveAnnouncement gameState={gameState} />

      {/* Hint Display */}
      <HintDisplay gameState={gameState} />

      {/* Game UI */}
      <div className="game-ui">
        {/* Health Bar */}
        <img src="/assets/images/heart.png" alt="Health" className="health-icon" />
        <div className="health-bar">
          <div 
            className="health-fill" 
            style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
          />
        </div>
        <div className="health-text">
          HP {gameState.player.health}/{gameState.player.maxHealth}
        </div>
        {/* Energy Bar */}
        <img src="/assets/images/energy.png" alt="Energy" className="energy-icon" />
        <div className="energy-bar">
          <div 
            className="energy-fill" 
            style={{ width: `${Math.round(gameState.ultimateEnergy)}%` }} // format with round
          />
        </div>
        <div className="energy-text">
          {gameState.ultimateReady ? (
            <span className="ultimate-ready"> PRESS ENTER </span>
          ) : (
            `ENERGY ${Math.floor(gameState.ultimateEnergy)}%`
          )}
        </div>

        {/* Score */}
        <div className="score">Score: {gameState.score}</div>

        {/* Word Display */}
        <WordDisplay 
          word={gameState.currentWord}
          nextWord={gameState.nextWord}
          typedIndex={gameState.typedIndex}
        />

        {/* Skill Bar */}
        <SkillBar gameState={gameState} dispatch={dispatch} />

        {/* Damage Effects */}
        {gameState.damageEffects.map(effect => (
          <DamageEffect key={effect.id} effect={effect} />
        ))}
      </div>

      {/* Skip Tutorial Button - only show during tutorial wave */}
      {gameState.waveState.currentWaveId === 0 && (
        <button 
          className="skip-tutorial-button"
          onClick={() => {
            console.log('Skip tutorial button clicked!');
            dispatch({ type: 'SKIP_TUTORIAL' });
          }}
        >
          Skip Tutorial
        </button>
      )}

      {/* Fixed Game Area */}
      <div className="game-area">
        {/* Game Objects */}
        <Player player={gameState.player} gameState={gameState} />
        
        {/* Crystal Base - Enemy Spawn Point */}
        <Crystal 
          x={crystalX} 
          y={crystalY} 
          isDarkMode={gameState.crystalInDarkMode} 
          isFlashing={gameState.crystalFlashing}
        />
        
        {gameState.enemies.map(enemy => (
          <Enemy key={enemy.id} enemy={enemy} gameState={gameState} />
        ))}
        
        {gameState.bullets.map(bullet => (
          <Bullet key={bullet.id} bullet={bullet} />
        ))}
        
        {gameState.winds.map(wind => (
          <Wind key={wind.id} wind={wind} />
        ))}
        
        {gameState.impacts.map(impact => (
          <Impact key={impact.id} impact={impact} />
        ))}
        
        {gameState.skillEffects.map(effect => (
          <SkillEffect key={effect.id} effect={effect} />
        ))}

        {gameState.fireEffects.map(fire => (
          <FireEffect key={fire.id} fire={fire} />
        ))}

        {gameState.strikeEffects.map(strike => (
          <StrikeEffect key={strike.id} strike={strike} />
        ))}

        {/* Player Death Animation */}
        <PlayerDeathAnimation gameState={gameState} />

        {/* Undead Death Animation */}
        <UndeadDeathAnimation animation={gameState.undeadDeathAnimation} />

        {/* Ultimate VFX */}
        {gameState.ultimateVfx?.active && (
          <UltimateVfx vfx={gameState.ultimateVfx!} />
        )}
      </div>
    </div>
  );
};

export default GameScreen;
