import React from 'react';

interface WordDisplayProps {
  word: string;
  nextWord: string;
  typedIndex: number;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ word, nextWord, typedIndex }) => {
  const renderWord = () => {
    return word.split('').map((char, index) => {
      let className = 'word-char';
      
      if (index < typedIndex) {
        className += ' char-typed';
      } else if (index === typedIndex) {
        className += ' char-current';
      } else {
        className += ' char-remaining';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const renderPreviewWord = () => {
    return nextWord.split('').map((char, index) => {
      return (
        <span key={index} className="word-char char-preview">
          {char}
        </span>
      );
    });
  };

  return (
    <div className="word-display">
      <div className="current-word">
        {renderWord()}
      </div>
      {nextWord && (
        <div className="next-word-preview">
          {renderPreviewWord()}
        </div>
      )}
    </div>
  );
};

export default WordDisplay;
