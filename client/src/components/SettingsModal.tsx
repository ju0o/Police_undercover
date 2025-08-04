import React, { useState } from 'react';
import './SettingsModal.css';

interface ModalSettings {
  sound: {
    master: number;
    music: number;
    sfx: number;
  };
  graphics: {
    quality: 'low' | 'medium' | 'high';
    fullscreen: boolean;
    vsync: boolean;
  };
  controls: {
    keybindings: Record<string, string>;
  };
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ModalSettings;
  onSettingsChange: (settings: ModalSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [currentSettings, setCurrentSettings] = useState<ModalSettings>(settings);
  const [activeTab, setActiveTab] = useState<'sound' | 'graphics' | 'controls'>('sound');

  if (!isOpen) return null;

  const handleSettingChange = (category: keyof ModalSettings, key: string, value: any) => {
    const newSettings = {
      ...currentSettings,
      [category]: {
        ...currentSettings[category],
        [key]: value
      }
    };
    setCurrentSettings(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(currentSettings);
    onClose();
  };

  const handleCancel = () => {
    setCurrentSettings(settings);
    onClose();
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2 className="settings-title">설정</h2>
          <button className="settings-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === 'sound' ? 'active' : ''}`}
            onClick={() => setActiveTab('sound')}
          >
            🔊 사운드
          </button>
          <button 
            className={`settings-tab ${activeTab === 'graphics' ? 'active' : ''}`}
            onClick={() => setActiveTab('graphics')}
          >
            🎮 그래픽
          </button>
          <button 
            className={`settings-tab ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            ⌨️ 조작
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'sound' && (
            <div className="settings-section">
              <h3>사운드 설정</h3>
              
              <div className="setting-item">
                <label>마스터 볼륨</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentSettings.sound.master}
                  onChange={(e) => handleSettingChange('sound', 'master', parseInt(e.target.value))}
                />
                <span>{currentSettings.sound.master}%</span>
              </div>

              <div className="setting-item">
                <label>음악 볼륨</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentSettings.sound.music}
                  onChange={(e) => handleSettingChange('sound', 'music', parseInt(e.target.value))}
                />
                <span>{currentSettings.sound.music}%</span>
              </div>

              <div className="setting-item">
                <label>효과음 볼륨</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentSettings.sound.sfx}
                  onChange={(e) => handleSettingChange('sound', 'sfx', parseInt(e.target.value))}
                />
                <span>{currentSettings.sound.sfx}%</span>
              </div>
            </div>
          )}

          {activeTab === 'graphics' && (
            <div className="settings-section">
              <h3>그래픽 설정</h3>
              
              <div className="setting-item">
                <label>화질</label>
                <select
                  value={currentSettings.graphics.quality}
                  onChange={(e) => handleSettingChange('graphics', 'quality', e.target.value)}
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </div>

              <div className="setting-item">
                <label>전체화면</label>
                <input
                  type="checkbox"
                  checked={currentSettings.graphics.fullscreen}
                  onChange={(e) => handleSettingChange('graphics', 'fullscreen', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <label>수직동기화</label>
                <input
                  type="checkbox"
                  checked={currentSettings.graphics.vsync}
                  onChange={(e) => handleSettingChange('graphics', 'vsync', e.target.checked)}
                />
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="settings-section">
              <h3>조작 설정</h3>
              
              <div className="keybindings">
                <div className="keybinding-item">
                  <label>이동</label>
                  <span className="keybinding-key">WASD</span>
                </div>
                <div className="keybinding-item">
                  <label>미션 수행</label>
                  <span className="keybinding-key">E</span>
                </div>
                <div className="keybinding-item">
                  <label>킬</label>
                  <span className="keybinding-key">K</span>
                </div>
                <div className="keybinding-item">
                  <label>회의 소집</label>
                  <span className="keybinding-key">Q</span>
                </div>
                <div className="keybinding-item">
                  <label>맵 열기</label>
                  <span className="keybinding-key">M</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="settings-btn settings-btn-cancel" onClick={handleCancel}>
            취소
          </button>
          <button className="settings-btn settings-btn-save" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;