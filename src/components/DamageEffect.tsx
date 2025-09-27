import React from 'react';
import { DamageEffect as DamageEffectType } from '../types';

interface DamageEffectProps {
  effect: DamageEffectType;
}

const DamageEffect: React.FC<DamageEffectProps> = ({ effect }) => {
  const { x, y, value, type, opacity } = effect;
  
  const displayValue = type === 'damage' ? `-${value}` : `+${value}`;
  const color = type === 'damage' ? '#ff4444' :'rgb(59, 233, 120)';
  
  return (
    <div
      className="damage-effect"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        color: color,
        fontSize: '24px',
        fontWeight: 'bold',
        fontFamily: 'Pixelade, monospace',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        opacity: opacity,
        pointerEvents: 'none',
        zIndex: 1000,
        transform: 'translate(-50%, -50%)',
        animation: 'damageFloat 1.5s ease-out forwards'
      }}
    >
      {displayValue}
    </div>
  );
};

export default DamageEffect;
