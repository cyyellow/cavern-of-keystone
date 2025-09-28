import { GameState, GameAction } from '../types';
import { getRandomWord } from '../utils/gameUtils';
import { PLAYER_CONFIG } from '../config/gameConfig';
import { getNextWave } from '../config/waveConfig';
import { playBackgroundMusic, playUltimateSound } from '../utils/audioManager';
import { SKILLS } from '../config/skillConfig';

export const initialGameState: GameState = {
  currentScreen: 'start',
  score: 0,
  player: {
    x: PLAYER_CONFIG.POSITION.x,
    y: PLAYER_CONFIG.POSITION.y,
    health: PLAYER_CONFIG.HEALTH.max,
    maxHealth: PLAYER_CONFIG.HEALTH.max,
    frame: 0,
    status: 'idle'
  },
  enemies: [],
  bullets: [],
  winds: [],
  impacts: [],
  currentWord: '',
  nextWord: '',
  typedIndex: 0,
  words: [
    'apple', 'house', 'water', 'light', 'night', 'dream', 'peace', 'happy',
    'smile', 'music', 'dance', 'story', 'magic', 'power', 'brave', 'wisdom'
  ],
  gameRunning: false,
  waveState: {
    currentWaveId: 0, // Start with first wave
    completedWaves: 0,
    waveStartTime: 0,
    nextSpawnTime: 0,
    currentEnemyIndex: 0,
    isWaveActive: false,
    waveDelayRemaining: 0,
    currentLoopCount: 0,
    isBossWaveSpawned: false
  },
  selectedSkill: 'bullet', // Default to bullet skill
  skills: SKILLS,
  skillEffects: [],
  fireEffects: [],
  strikeEffects: [],
  damageEffects: [],
  showHints: true, // Default to showing hints
  enableTutorialWave: true, // Default to enabling tutorial wave
  enableInfiniteMode: false, // Default to disabling infinite mode
  crystalFlashing: false, // Default to no crystal flash
  crystalInDarkMode: false, // Default to light crystal
  playerDeathAnimation: {
    active: false,
    frame: 0,
    startTime: 0
  },
  undeadDeathAnimation: {
    active: false,
    frame: 0,
    startTime: 0,
    x: 0,
    y: 0
  },
  waveAnnouncement: {
    visible: false,
    waveNumber: 0,
    hint: undefined
  },
  currentHint: '',
  // WPM tracking
  wpmTracking: {
    startTime: null,
    endTime: null,
    charactersTyped: 0,
    wordsTyped: 0
  },
  // Ultimate skill system
  ultimateEnergy: 0,
  ultimateReady: false,
  ultimateActive: false,
  ultimateVfx: undefined,
  
  // Tutorial state tracking
  diedInTutorial: false,
  
  // Difficulty settings
  difficulty: 'normal' // Default to normal difficulty
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      // Use the selected skill's word list, fallback to default words
      const startSelectedSkill = state.skills.find(skill => skill.type === state.selectedSkill);
      const wordList = startSelectedSkill?.wordList || state.words;
      const startNewWord = getRandomWord(wordList);
      const startNextWord = getRandomWord(wordList, startNewWord);
      return {
        ...state,
        currentScreen: 'game',
        gameRunning: true,
        score: 0,
        player: { ...initialGameState.player },
        enemies: [],
        bullets: [],
        currentWord: startNewWord,
        nextWord: startNextWord,
        typedIndex: 0,
        diedInTutorial: false
      };

    case 'GAME_OVER':
      return {
        ...state,
        currentScreen: 'gameOver',
        gameRunning: false,
        diedInTutorial: state.waveState.currentWaveId === 0
      };

    case 'WIN_GAME':
      return {
        ...state,
        currentScreen: 'win',
        gameRunning: false,
        wpmTracking: {
          ...state.wpmTracking,
          endTime: Date.now()
        }
      };

    case 'RESTART_GAME':
      return {
        ...initialGameState,
        words: state.words,
        skills: state.skills, // Preserve loaded skill word lists
        enableTutorialWave: false, // Disable tutorial for retries
        enableInfiniteMode: state.enableInfiniteMode // Preserve infinite mode setting
      };

    case 'LOAD_WORDS':
      return {
        ...state,
        words: action.payload
      };

    case 'UPDATE_PLAYER':
      return {
        ...state,
        player: { ...state.player, ...action.payload }
      };

    case 'ADD_ENEMY':
      return {
        ...state,
        enemies: [...state.enemies, action.payload]
      };

    case 'REMOVE_ENEMY':
      return {
        ...state,
        enemies: state.enemies.filter(enemy => enemy.id !== action.payload)
      };

    case 'UPDATE_ENEMY':
      return {
        ...state,
        enemies: state.enemies.map(enemy =>
          enemy.id === action.payload.id
            ? { ...enemy, ...action.payload.updates }
            : enemy
        )
      };

    case 'ADD_BULLET':
      return {
        ...state,
        bullets: [...state.bullets, action.payload]
      };

    case 'REMOVE_BULLET':
      return {
        ...state,
        bullets: state.bullets.filter(bullet => bullet.id !== action.payload)
      };

    case 'UPDATE_BULLET':
      return {
        ...state,
        bullets: state.bullets.map(bullet =>
          bullet.id === action.payload.id
            ? { ...bullet, ...action.payload.updates }
            : bullet
        )
      };

    case 'ADD_WIND':
      return {
        ...state,
        winds: [...state.winds, action.payload]
      };

    case 'REMOVE_WIND':
      return {
        ...state,
        winds: state.winds.filter(wind => wind.id !== action.payload)
      };

    case 'UPDATE_WIND':
      return {
        ...state,
        winds: state.winds.map(wind =>
          wind.id === action.payload.id
            ? { ...wind, ...action.payload.updates }
            : wind
        )
      };

    case 'ADD_IMPACT':
      return {
        ...state,
        impacts: [...state.impacts, action.payload]
      };

    case 'REMOVE_IMPACT':
      return {
        ...state,
        impacts: state.impacts.filter(impact => impact.id !== action.payload)
      };

    case 'UPDATE_IMPACT':
      return {
        ...state,
        impacts: state.impacts.map(impact =>
          impact.id === action.payload.id
            ? { ...impact, ...action.payload.updates }
            : impact
        )
      };

    case 'UPDATE_WORD':
      // Only update if the word or typedIndex actually changed
      if (state.currentWord !== action.payload.word || state.typedIndex !== action.payload.typedIndex) {
        return {
          ...state,
          currentWord: action.payload.word,
          typedIndex: action.payload.typedIndex
        };
      }
      return state;

    case 'UPDATE_NEXT_WORD':
      return {
        ...state,
        nextWord: action.payload
      };

    case 'UPDATE_SCORE':
      return {
        ...state,
        score: state.score + action.payload
      };

    case 'TICK':
      return state; // This will be handled by the game loop

    case 'START_WAVE':
      return {
        ...state,
        waveState: {
          ...state.waveState,
          currentWaveId: action.payload.waveId,
          waveStartTime: action.payload.startTime,
          isWaveActive: true,
          currentEnemyIndex: 0,
          nextSpawnTime: action.payload.startTime,
          waveDelayRemaining: 0,
          currentLoopCount: 0
        }
      };

    case 'COMPLETE_WAVE': {
      // Move to next wave
      const nextWave = getNextWave(state.waveState.currentWaveId, state.enableInfiniteMode);
      
      // Switch back to normal game music when wave completes (if not in boss wave)
      if (nextWave && !nextWave.enemies.some(enemy => enemy.type === 'undead')) {
        playBackgroundMusic('gameScreen');
      }
      
      // Heal player to full health when tutorial wave completes
      const wasTutorialWave = state.waveState.currentWaveId === 0;
      
      return {
        ...state,
        waveState: {
          ...state.waveState,
          isWaveActive: false,
          completedWaves: state.waveState.completedWaves + 1,
          currentEnemyIndex: 0,
          currentWaveId: nextWave ? nextWave.id : state.waveState.currentWaveId
        },
        // Reset crystal to light mode when wave completes
        crystalInDarkMode: false,
        crystalFlashing: false,
        // Heal player if tutorial wave completed
        player: wasTutorialWave ? {
          ...state.player,
          health: PLAYER_CONFIG.HEALTH.max
        } : state.player,
        // Reset energy to 0 when tutorial wave completes
        ultimateEnergy: wasTutorialWave ? 0 : state.ultimateEnergy,
        // Clear all enemies when tutorial wave completes
        enemies: wasTutorialWave ? [] : state.enemies,
        // Also clear projectiles when tutorial completes
        bullets: wasTutorialWave ? [] : state.bullets,
        winds: wasTutorialWave ? [] : state.winds,
        impacts: wasTutorialWave ? [] : state.impacts
      };
    }

    case 'UPDATE_WAVE_STATE':
      return {
        ...state,
        waveState: {
          ...state.waveState,
          ...action.payload
        }
      };

    case 'SPAWN_ENEMY_FROM_WAVE':
      // This will be handled by the wave spawner logic
      return state;

    case 'LOAD_SKILL_WORDS':
      const updatedSkills = state.skills.map(skill => ({
        ...skill,
        wordList: action.payload[skill.wordLength.toString()] || []
      }));
      return {
        ...state,
        skills: updatedSkills
      };

    case 'SELECT_SKILL':
      const selectSelectedSkill = state.skills.find(skill => skill.type === action.payload);
      if (selectSelectedSkill && selectSelectedSkill.wordList.length > 0) {
        // Switch to the skill's word list
        const newWord = getRandomWord(selectSelectedSkill.wordList);
        const nextWord = getRandomWord(selectSelectedSkill.wordList, newWord);
        return {
          ...state,
          selectedSkill: action.payload,
          currentWord: newWord,
          nextWord: nextWord,
          typedIndex: 0
        };
      }
      // Use fallback words when skill word list is empty
      const fallbackWords = state.words;
      const fallbackNewWord = getRandomWord(fallbackWords);
      const fallbackNextWord = getRandomWord(fallbackWords, fallbackNewWord);
      return {
        ...state,
        selectedSkill: action.payload,
        currentWord: fallbackNewWord,
        nextWord: fallbackNextWord,
        typedIndex: 0
      };

    case 'ADD_SKILL_EFFECT':
      return {
        ...state,
        skillEffects: [...state.skillEffects, action.payload]
      };

    case 'REMOVE_SKILL_EFFECT':
      return {
        ...state,
        skillEffects: state.skillEffects.filter(effect => effect.id !== action.payload)
      };

    case 'ADD_FIRE_EFFECT':
      return {
        ...state,
        fireEffects: [...state.fireEffects, action.payload]
      };

    case 'REMOVE_FIRE_EFFECT':
      return {
        ...state,
        fireEffects: state.fireEffects.filter(effect => effect.id !== action.payload)
      };

    case 'UPDATE_FIRE_EFFECT':
      return {
        ...state,
        fireEffects: state.fireEffects.map(effect =>
          effect.id === action.payload.id
            ? { ...effect, ...action.payload.updates }
            : effect
        )
      };

    case 'ADD_STRIKE_EFFECT':
      return {
        ...state,
        strikeEffects: [...state.strikeEffects, action.payload]
      };

    case 'REMOVE_STRIKE_EFFECT':
      return {
        ...state,
        strikeEffects: state.strikeEffects.filter(effect => effect.id !== action.payload)
      };

    case 'UPDATE_STRIKE_EFFECT':
      return {
        ...state,
        strikeEffects: state.strikeEffects.map(effect =>
          effect.id === action.payload.id
            ? { ...effect, ...action.payload.updates }
            : effect
        )
      };

    case 'ADD_DAMAGE_EFFECT':
      return {
        ...state,
        damageEffects: [...state.damageEffects, action.payload]
      };

    case 'REMOVE_DAMAGE_EFFECT':
      return {
        ...state,
        damageEffects: state.damageEffects.filter(effect => effect.id !== action.payload)
      };

    case 'UPDATE_DAMAGE_EFFECT':
      return {
        ...state,
        damageEffects: state.damageEffects.map(effect =>
          effect.id === action.payload.id
            ? { ...effect, ...action.payload.updates }
            : effect
        )
      };

    case 'UPDATE_SKILL_EFFECT':
      return {
        ...state,
        skillEffects: state.skillEffects.map(effect =>
          effect.id === action.payload.id
            ? { ...effect, ...action.payload.updates }
            : effect
        )
      };

    case 'TOGGLE_HINTS':
      return {
        ...state,
        showHints: !state.showHints
      };

    case 'TOGGLE_TUTORIAL_WAVE':
      return {
        ...state,
        enableTutorialWave: !state.enableTutorialWave
      };

    case 'TOGGLE_INFINITE_MODE':
      return {
        ...state,
        enableInfiniteMode: !state.enableInfiniteMode
      };

    case 'START_CRYSTAL_FLASH':
      return {
        ...state,
        crystalFlashing: true
      };

    case 'STOP_CRYSTAL_FLASH':
      return {
        ...state,
        crystalFlashing: false
      };

    case 'SET_CRYSTAL_DARK_MODE':
      return {
        ...state,
        crystalInDarkMode: action.payload
      };

    case 'START_PLAYER_DEATH_ANIMATION':
      return {
        ...state,
        playerDeathAnimation: {
          active: true,
          frame: 0,
          startTime: Date.now()
        }
      };

    case 'UPDATE_DEATH_ANIMATION':
      return {
        ...state,
        playerDeathAnimation: {
          ...state.playerDeathAnimation,
          frame: action.payload.frame
        }
      };

    case 'START_UNDEAD_DEATH_ANIMATION':
      return {
        ...state,
        undeadDeathAnimation: {
          active: true,
          frame: 0,
          startTime: Date.now(),
          x: action.payload.x,
          y: action.payload.y
        }
      };

    case 'UPDATE_UNDEAD_DEATH_ANIMATION':
      return {
        ...state,
        undeadDeathAnimation: {
          ...state.undeadDeathAnimation,
          frame: action.payload.frame
        }
      };

    case 'STOP_UNDEAD_DEATH_ANIMATION':
      return {
        ...state,
        undeadDeathAnimation: {
          ...state.undeadDeathAnimation,
          active: false
        }
      };


    case 'SHOW_WAVE_ANNOUNCEMENT':
      return {
        ...state,
        waveAnnouncement: {
          visible: true,
          waveNumber: action.payload.waveNumber,
          hint: action.payload.hint
        }
      };

    case 'HIDE_WAVE_ANNOUNCEMENT':
      return {
        ...state,
        waveAnnouncement: {
          ...state.waveAnnouncement,
          visible: false
        }
      };

    case 'UPDATE_CURRENT_HINT':
      return {
        ...state,
        currentHint: action.payload
      };

    case 'SET_ULTIMATE_ENERGY':
      return {
        ...state,
        ultimateEnergy: action.payload,
        ultimateReady: action.payload >= 100
      };

    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.payload
      };

    case 'SKIP_TUTORIAL':
      return {
        ...state,
        waveState: {
          ...state.waveState,
          currentWaveId: 1, // Skip to wave 1
          isWaveActive: false,
          waveStartTime: 0,
          nextSpawnTime: 0,
          currentEnemyIndex: 0,
          waveDelayRemaining: 0,
          currentLoopCount: 0
        },
        // Heal player to full health
        player: {
          ...state.player,
          health: PLAYER_CONFIG.HEALTH.max
        },
        // Clear all enemies and projectiles from tutorial
        enemies: [],
        bullets: [],
        winds: [],
        impacts: [],
        // Clear tutorial hints when skipping
        currentHint: ''
      };

    case 'START_WPM_TRACKING':
      return {
        ...state,
        wpmTracking: {
          ...state.wpmTracking,
          startTime: Date.now()
        }
      };

    case 'STOP_WPM_TRACKING':
      return {
        ...state,
        wpmTracking: {
          ...state.wpmTracking,
          endTime: Date.now()
        }
      };

    case 'UPDATE_CHARACTERS_TYPED':
      return {
        ...state,
        wpmTracking: {
          ...state.wpmTracking,
          charactersTyped: state.wpmTracking.charactersTyped + action.payload
        }
      };

    case 'UPDATE_WORDS_TYPED':
      return {
        ...state,
        wpmTracking: {
          ...state.wpmTracking,
          wordsTyped: state.wpmTracking.wordsTyped + action.payload
        }
      };

    case 'UPDATE_ULTIMATE_ENERGY':
      const newEnergy = Math.min(100, state.ultimateEnergy + action.payload);
      return {
        ...state,
        ultimateEnergy: newEnergy,
        ultimateReady: newEnergy >= 100
      };

    case 'ACTIVATE_ULTIMATE':
      playUltimateSound();
      return {
        ...state,
        ultimateActive: true,
        ultimateEnergy: 0,
        ultimateReady: false,
        ultimateVfx: {
          active: true,
          frame: 0,
          frameTime: 0,
          startTime: Date.now()
        }
      };

    case 'DEACTIVATE_ULTIMATE':
      return {
        ...state,
        ultimateActive: false
      };

    case 'UPDATE_ULTIMATE_VFX':
      return {
        ...state,
        ultimateVfx: {
          ...(state.ultimateVfx || { active: false, frame: 0, frameTime: 0, startTime: Date.now() }),
          ...action.payload,
        }
      };

    case 'CLEAR_ULTIMATE_VFX':
      return {
        ...state,
        ultimateVfx: undefined
      };

    case 'DEBUG_DIE':
      return {
        ...state,
        player: {
          ...state.player,
          health: 0
        },
        gameRunning: false,
        currentScreen: 'gameOver',
        wpmTracking: {
          ...state.wpmTracking,
          endTime: Date.now()
        }
      };

    default:
      return state;
  }
}
