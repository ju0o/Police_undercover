// [client/src/components/ControlsOverlay.tsx] - 작동법 오버레이 컴포넌트
// H키로 표시/숨김 가능한 반투명 오버레이

import React, { useEffect } from 'react';
import './ControlsOverlay.css';

interface ControlsOverlayProps {
  isVisible: boolean;
  onToggle: () => void;
}

const ControlsOverlay: React.FC<ControlsOverlayProps> = ({ isVisible, onToggle }) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key && event.key.toLowerCase() === 'h') {
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToggle]);

  if (!isVisible) return null;

  return (
    <div className="controls-overlay">
      <div className="controls-overlay-header">
        <h3>⌨️ 조작법</h3>
        <button onClick={onToggle} className="close-overlay-btn">×</button>
      </div>
      
      <div className="controls-overlay-content">
        <div className="control-row">
          <span className="overlay-key">WASD</span>
          <span className="overlay-desc">이동</span>
        </div>
        <div className="control-row">
          <span className="overlay-key">SPACE</span>
          <span className="overlay-desc">액션/미션</span>
        </div>
        <div className="control-row">
          <span className="overlay-key">TAB</span>
          <span className="overlay-desc">지도/정보</span>
        </div>
        <div className="control-row">
          <span className="overlay-key">R</span>
          <span className="overlay-desc">신고</span>
        </div>
        <div className="control-row">
          <span className="overlay-key">Q</span>
          <span className="overlay-desc">킬/능력</span>
        </div>
        <div className="control-row">
          <span className="overlay-key">E</span>
          <span className="overlay-desc">긴급회의</span>
        </div>
        <div className="control-row">
          <span className="overlay-key">H</span>
          <span className="overlay-desc">조작법 표시/숨김</span>
        </div>
      </div>
      
      <div className="overlay-hint">
        H키를 눌러 숨기기
      </div>
    </div>
  );
};

export default ControlsOverlay;