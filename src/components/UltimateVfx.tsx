import React from 'react';

interface UltimateVfxProps {
  vfx: {
    active: boolean;
    frame: number;
    frameTime: number;
    startTime: number;
  };
}

const UltimateVfx: React.FC<UltimateVfxProps> = ({ vfx }) => {
  const frame = Math.max(0, Math.min(16, vfx.frame));
  const frameNumber = frame.toString().padStart(4, '0');
  const animationSpeed = (1000 / 30) * 2; // must match gameLogic
  const flashStart = 6 * animationSpeed; // which frame flash starts at
  const flashEnd = flashStart + 2000; // 1.4s duration
  const showFlash = vfx.frameTime >= flashStart && vfx.frameTime < flashEnd;
  let flashOpacity = 0;
  if (showFlash) {
    const t = Math.max(0, Math.min(1, (vfx.frameTime - flashStart) / 2000));
    // Fade in (0->0.3): 0 -> 1.0, Fade out (0.3->1): 1.0 -> 0 (longer fade out)
    flashOpacity = t < 0.2 ? (t / 0.2) * 1.0 : (1 - (t - 0.2) / 0.8) * 1.0;
  }

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '30%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    height: 300,
    pointerEvents: 'none',
    zIndex: 60,
    backgroundImage: `url(/assets/vfx/ultimate/frame${frameNumber}.png)`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as any,
  };

  const flashStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    background: '#f7eee1',
    opacity: flashOpacity,
    zIndex: 55,
    pointerEvents: 'none',
  };

  return (
    <>
      {showFlash && <div className="ultimate-flash" style={flashStyle} />}
      <div className="ultimate-vfx" style={containerStyle} />
    </>
  );
};

export default UltimateVfx;


