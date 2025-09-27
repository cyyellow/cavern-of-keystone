import React from 'react';
import { GameState, GameAction, SkillType } from '../types';

interface SkillBarProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const SkillBar: React.FC<SkillBarProps> = ({ gameState, dispatch }) => {
  const handleSkillSelect = (skillType: SkillType) => {
    dispatch({ type: 'SELECT_SKILL', payload: skillType });
  };

  return (
    <div className="skill-bar">
      <div className="skill-slots">
        {gameState.skills.map((skill) => (
          <div
            key={skill.type}
            className={`skill-slot ${gameState.selectedSkill === skill.type ? 'selected' : ''}`}
            onClick={() => handleSkillSelect(skill.type)}
            title={`${skill.name} (${skill.description})`}
          >
            <div className="skill-icon-container">
              <img 
                src={skill.icon} 
                alt={skill.name}
                className="skill-icon"
              />
            </div>
            <div className="skill-number">{skill.wordLength}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillBar;
