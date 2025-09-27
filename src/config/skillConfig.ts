import { Skill } from '../types';

export const SKILLS: Skill[] = [
  {
    type: 'heal',
    name: 'Heal',
    description: 'Restore 5 health when word is completed',
    icon: '/assets/images/3.png',
    wordLength: 3,
    wordList: [], // Will be loaded from words3.txt
    healAmount: 10
  },
  {
    type: 'bullet',
    name: 'Bullet',
    description: 'Shoot a bullet at enemies',
    icon: '/assets/images/5.png',
    wordLength: 5,
    wordList: [], // Will be loaded from words.txt
    damage: 10
  },
  {
    type: 'knockback',
    name: 'Knockback Wind',
    description: 'Unleash a fast knockback wind that deals 7 damage and knocks enemies back 100px',
    icon: '/assets/images/7.png',
    wordLength: 7,
    wordList: [], // Will be loaded from words7.txt
    damage: 3,
    knockback: 75,
    speed: 12
  },
  {
    type: 'impact',
    name: 'Ranged Impact',
    description: 'Create an impact dealing 40 damage shared among all enemies in range',
    icon: '/assets/images/9.png',
    wordLength: 9,
    wordList: [], // Will be loaded from words9.txt
    damage: 40,
    range: 250
  }
];

export const getSkillByType = (type: string): Skill | undefined => {
  return SKILLS.find(skill => skill.type === type);
};

export const getSkillByWordLength = (wordLength: number): Skill | undefined => {
  return SKILLS.find(skill => skill.wordLength === wordLength);
};
