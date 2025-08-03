// [client/src/components/LoginScreen.tsx] - 로그인 화면 컴포넌트
// 닉네임 입력 및 서버 연결

import React, { useState } from 'react';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: (nickname: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 닉네임 유효성 검사
  const validateNickname = (name: string): boolean => {
    if (name.length < 2) {
      setError('닉네임은 최소 2글자 이상이어야 합니다.');
      return false;
    }
    if (name.length > 15) {
      setError('닉네임은 최대 15글자까지 가능합니다.');
      return false;
    }
    if (!/^[a-zA-Z0-9가-힣_-]+$/.test(name)) {
      setError('닉네임에는 특수문자를 사용할 수 없습니다.');
      return false;
    }
    setError('');
    return true;
  };

  // 로그인 처리
  const handleLogin = () => {
    const trimmedNickname = nickname.trim();
    
    if (!validateNickname(trimmedNickname)) {
      return;
    }

    setIsLoading(true);
    
    // 로그인 성공 후 App 컴포넌트의 handleLogin 호출
    setTimeout(() => {
      onLogin(trimmedNickname);
      setIsLoading(false);
    }, 500);
  };

  // 엔터키 처리
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  // 닉네임 변경 처리
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    
    // 실시간 유효성 검사
    if (value.trim()) {
      validateNickname(value.trim());
    } else {
      setError('');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        {/* 게임 로고 */}
        <div className="game-logo">
          <h1>🕵️ Police Undercover</h1>
          <p className="game-subtitle">Among Us Style Multiplayer Game</p>
        </div>

        {/* 로그인 폼 */}
        <div className="login-form">
          <h2>게임 시작</h2>
          
          <div className="input-group">
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              onKeyPress={handleKeyPress}
              placeholder="닉네임을 입력하세요"
              maxLength={15}
              disabled={isLoading}
              className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button
            onClick={handleLogin}
            disabled={!nickname.trim() || isLoading || Boolean(error)}
            className="login-button"
          >
            {isLoading ? (
              <span className="loading">
                <span className="spinner"></span>
                연결 중...
              </span>
            ) : (
              '게임 입장'
            )}
          </button>
        </div>

        {/* 게임 정보 */}
        <div className="game-info">
          <h3>게임 소개</h3>
          <ul>
            <li>🎭 9가지 역할로 플레이</li>
            <li>🎯 20개 이상의 다양한 미션</li>
            <li>🗳️ 전략적 회의와 투표</li>
            <li>📊 상세한 통계 시스템</li>
            <li>🎮 실시간 멀티플레이어</li>
          </ul>
        </div>

        {/* 조작법 안내 */}
        <div className="controls-info">
          <h3>조작법</h3>
          <div className="controls-grid">
            <div className="control-item">
              <span className="key">WASD</span>
              <span className="description">이동</span>
            </div>
            <div className="control-item">
              <span className="key">SPACE</span>
              <span className="description">액션/미션</span>
            </div>
            <div className="control-item">
              <span className="key">TAB</span>
              <span className="description">지도/정보</span>
            </div>
            <div className="control-item">
              <span className="key">R</span>
              <span className="description">신고</span>
            </div>
            <div className="control-item">
              <span className="key">Q</span>
              <span className="description">킬/능력</span>
            </div>
            <div className="control-item">
              <span className="key">E</span>
              <span className="description">긴급회의</span>
            </div>
          </div>
        </div>

        {/* 버전 정보 */}
        <div className="version-info">
          <p>Version 1.0.0 | Made with React & Socket.io</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;