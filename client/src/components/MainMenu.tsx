// [client/src/components/MainMenu.tsx] - 메인 메뉴 컴포넌트
// 방 목록, 방 생성, 코드 입력 기능

import React, { useState } from 'react';
import './MainMenu.css';

interface Room {
  name: string;
  playerCount: number;
  maxPlayers: number;
  gameStarted: boolean;
}

interface MainMenuProps {
  nickname: string;
  availableRooms: Room[];
  onCreateRoom: (roomName: string, options: any) => void;
  onJoinRoom: (roomName: string) => void;
  onJoinByCode: (roomCode: string) => void;
  onLogout: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  nickname,
  availableRooms,
  onCreateRoom,
  onJoinRoom,
  onJoinByCode,
  onLogout
}) => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinByCode, setShowJoinByCode] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  
  // 커스텀 옵션 상태
  const [customOptions, setCustomOptions] = useState({
    maxPlayers: 10,
    impostorCount: 2,
    killCooldown: 30,
    gameMode: 'classic'
  });

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      setError('방 이름을 입력해주세요.');
      return;
    }
    if (newRoomName.length > 20) {
      setError('방 이름은 20글자 이하여야 합니다.');
      return;
    }
    
    const roomOptions = {
      isPrivate: isPrivateRoom,
      maxPlayers: customOptions.maxPlayers,
      impostorCount: customOptions.impostorCount,
      killCooldown: customOptions.killCooldown,
      gameMode: customOptions.gameMode,
      ...(isPrivateRoom && { roomCode: Math.random().toString(36).substr(2, 6).toUpperCase() })
    };
    
    onCreateRoom(newRoomName.trim(), roomOptions);
    setShowCreateRoom(false);
    setNewRoomName('');
    setIsPrivateRoom(false);
    setCustomOptions({
      maxPlayers: 10,
      impostorCount: 2,
      killCooldown: 30,
      gameMode: 'classic'
    });
    setError('');
  };

  const handleJoinByCode = () => {
    if (!roomCode.trim()) {
      setError('방 코드를 입력해주세요.');
      return;
    }
    if (roomCode.length !== 6) {
      setError('방 코드는 6자리입니다.');
      return;
    }
    
    onJoinByCode(roomCode.toUpperCase());
    setShowJoinByCode(false);
    setRoomCode('');
    setError('');
  };

  return (
    <div className="main-menu">
      <div className="main-menu-container">
        {/* 헤더 */}
        <div className="menu-header">
          <h1>🕵️ Police Undercover</h1>
          <div className="user-info">
            <span>환영합니다, {nickname}님!</span>
            <button onClick={onLogout} className="logout-btn">로그아웃</button>
          </div>
        </div>

        {/* 메인 액션 버튼들 */}
        <div className="menu-actions">
          <button 
            onClick={() => setShowCreateRoom(true)}
            className="action-btn create-btn"
          >
            🏠 방 만들기
          </button>
          
          <button 
            onClick={() => setShowJoinByCode(true)}
            className="action-btn join-code-btn"
          >
            🔢 코드로 입장
          </button>
        </div>

        {/* 공개방 목록 */}
        <div className="rooms-section">
          <h2>🌐 공개방 목록</h2>
          {availableRooms.length === 0 ? (
            <div className="no-rooms">
              <p>현재 생성된 공개방이 없습니다.</p>
              <p>새로운 방을 만들어보세요! 🎮</p>
            </div>
          ) : (
            <div className="rooms-list">
              {availableRooms.map((room) => (
                <div key={room.name} className="room-item">
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <span className="player-count">
                      👥 {room.playerCount}/{room.maxPlayers}
                    </span>
                    <span className={`game-status ${room.gameStarted ? 'playing' : 'waiting'}`}>
                      {room.gameStarted ? '🎮 게임 중' : '⏳ 대기 중'}
                    </span>
                  </div>
                  <button 
                    onClick={() => onJoinRoom(room.name)}
                    disabled={room.gameStarted || room.playerCount >= room.maxPlayers}
                    className="join-room-btn"
                  >
                    입장
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 방 생성 모달 */}
        {showCreateRoom && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>새 방 만들기</h3>
              <div className="modal-content">
                <div className="input-group">
                  <label>방 이름</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="방 이름을 입력하세요"
                    maxLength={20}
                  />
                </div>
                
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={isPrivateRoom}
                      onChange={(e) => setIsPrivateRoom(e.target.checked)}
                    />
                    🔒 비공개방 (코드로만 입장 가능)
                  </label>
                </div>

                {/* 커스텀 옵션 */}
                <div className="custom-options">
                  <h4>🎮 커스텀 설정</h4>
                  <div className="options-grid">
                    <div className="option-group">
                      <label>최대 플레이어</label>
                      <select 
                        value={customOptions.maxPlayers}
                        onChange={(e) => setCustomOptions(prev => ({...prev, maxPlayers: parseInt(e.target.value)}))}
                      >
                        <option value="4">4명</option>
                        <option value="6">6명</option>
                        <option value="8">8명</option>
                        <option value="10">10명</option>
                        <option value="12">12명</option>
                      </select>
                    </div>
                    <div className="option-group">
                      <label>임포스터 수</label>
                      <select 
                        value={customOptions.impostorCount}
                        onChange={(e) => setCustomOptions(prev => ({...prev, impostorCount: parseInt(e.target.value)}))}
                      >
                        <option value="1">1명</option>
                        <option value="2">2명</option>
                        <option value="3">3명</option>
                      </select>
                    </div>
                    <div className="option-group">
                      <label>킬 쿨다운</label>
                      <select 
                        value={customOptions.killCooldown}
                        onChange={(e) => setCustomOptions(prev => ({...prev, killCooldown: parseInt(e.target.value)}))}
                      >
                        <option value="15">15초</option>
                        <option value="30">30초</option>
                        <option value="45">45초</option>
                        <option value="60">60초</option>
                      </select>
                    </div>
                    <div className="option-group">
                      <label>게임 모드</label>
                      <select 
                        value={customOptions.gameMode}
                        onChange={(e) => setCustomOptions(prev => ({...prev, gameMode: e.target.value}))}
                      >
                        <option value="classic">클래식</option>
                        <option value="detective">탐정 모드</option>
                        <option value="custom">커스텀</option>
                      </select>
                    </div>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}
              </div>
              
              <div className="modal-actions">
                <button onClick={handleCreateRoom} className="confirm-btn">
                  방 만들기
                </button>
                <button 
                  onClick={() => {
                    setShowCreateRoom(false);
                    setNewRoomName('');
                    setIsPrivateRoom(false);
                    setError('');
                  }} 
                  className="cancel-btn"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 코드 입력 모달 */}
        {showJoinByCode && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>방 코드 입력</h3>
              <div className="modal-content">
                <div className="input-group">
                  <label>6자리 방 코드</label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="예: ABC123"
                    maxLength={6}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
              </div>
              
              <div className="modal-actions">
                <button onClick={handleJoinByCode} className="confirm-btn">
                  입장
                </button>
                <button 
                  onClick={() => {
                    setShowJoinByCode(false);
                    setRoomCode('');
                    setError('');
                  }} 
                  className="cancel-btn"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;