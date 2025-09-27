
export const loadSkillWordLists = async (): Promise<{ [key: string]: string[] }> => {
  try {
    const [words3, words5, words7, words9] = await Promise.all([
      fetch('./words3.txt').then(res => res.text()),
      fetch('./words.txt').then(res => res.text()),
      fetch('./words7.txt').then(res => res.text()),
      fetch('./words9.txt').then(res => res.text())
    ]);

    return {
      '3': words3.split('\n').filter(word => word.trim().length > 0).map(word => word.trim()),
      '5': words5.split('\n').filter(word => word.trim().length > 0).map(word => word.trim()),
      '7': words7.split('\n').filter(word => word.trim().length > 0).map(word => word.trim()),
      '9': words9.split('\n').filter(word => word.trim().length > 0).map(word => word.trim())
    };
  } catch (error) {
    console.error('Error loading skill word lists:', error);
    return {
      '3': [],
      '5': [],
      '7': [],
      '9': []
    };
  }
};

export const getWordsForSkill = (skillType: string, wordLists: { [key: string]: string[] }): string[] => {
  const skillWordLength = skillType === 'heal' ? '3' : 
                         skillType === 'bullet' ? '5' : 
                         skillType === 'knockback' ? '7' : '9';
  return wordLists[skillWordLength] || [];
};
