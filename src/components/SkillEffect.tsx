import React from 'react';
import { SkillEffect as SkillEffectType } from '../types';

interface SkillEffectProps {
  effect: SkillEffectType;
}

const SkillEffect: React.FC<SkillEffectProps> = ({ effect }) => {
  if (!effect.active) return null;

  const currentTime = Date.now();
  const elapsed = currentTime - effect.startTime;
  const progress = Math.min(elapsed / effect.duration, 1);

  // Calculate visual properties based on effect type
  let visualStyle: React.CSSProperties = {};

  switch (effect.type) {
    case 'knockback_wind':
      // Wind effect - horizontal line expanding outward
      visualStyle = {
        position: 'absolute',
        left: effect.x - effect.range * progress,
        top: effect.y - 20,
        width: effect.range * 2 * progress,
        height: 40,
        backgroundColor: 'rgba(0, 255, 255, 0.3)',
        border: '2px solid #00ffff',
        borderRadius: '20px',
        pointerEvents: 'none',
        zIndex: 10
      };
      break;

    case 'ranged_impact':
      // Impact effect - circular area
      const radius = effect.range * progress;
      visualStyle = {
        position: 'absolute',
        left: effect.x - radius,
        top: effect.y - radius,
        width: radius * 2,
        height: radius * 2,
        backgroundColor: 'rgba(255, 100, 0, 0.2)',
        border: '3px solid #ff6400',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 10
      };
      break;
  }

  return <div style={visualStyle} />;
};

export default SkillEffect;
