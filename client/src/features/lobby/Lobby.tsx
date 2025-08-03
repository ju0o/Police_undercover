// [client/src/features/lobby/Lobby.tsx] - 메인 로비 컴포넌트
// 방 목록, 방 생성, 방 입장 기능

import React, { useState, useEffect } from 'react';
import './Lobby.css';

interface Room {
  name: string;
  playerCount: number;
  maxPlayers: number;
  gameState: string;
  hasPassword: boolean;
  hostName: string;
  options: any;
}

interface LobbyProps {
  playerName: string;
  rooms: Room[];
  onCreateRoom: (roomName: string, options: any, password?: string) => void;
  onJoinRoom: (roomName: string, password?: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Lobby: React.FC<LobbyProps> = ({
  playerName,
  rooms,
  onCreateRoom,
  onJoinRoom,
  onLogout,
  onOpenSettings
}) => {
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);
  const [joinPassword, setJoinPassword] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  // 방 생성 폼 상태
  const [createForm, setCreateForm] = useState({
    roomName: '',
    password: '',
    maxPlayers: 10,
    killCooldown: 30,
    emergencyMeetings: 3,
    discussionTime: 60,
    votingTime: 30,
    anonymousVotes: false,
    taskbarUpdates: true,
    visualTasks: true,
    skipVoteMethod: 'majority',
    gameSpeed: 1,
    multipleImpostors: true,
    confirmEjects: true
  });

  // 새로고침으로 방 목록 업데이트
  const refreshRooms = () => {
    // 실제로는 서버에서 방 목록을 다시 요청
    console.log('Refreshing room list...');
  };

  // 방 생성 처리
  const handleCreateRoom = () => {
    if (!createForm.roomName.trim()) {
      alert('방 이름을 입력해주세요.');
      return;
    }

    if (createForm.roomName.length > 20) {
      alert('방 이름은 20글자 이하로 입력해주세요.');
      return;
    }

    const options = {
      maxPlayers: createForm.maxPlayers,
      killCooldown: createForm.killCooldown,
      emergencyMeetings: createForm.emergencyMeetings,
      discussionTime: createForm.discussionTime,
      votingTime: createForm.votingTime,
      anonymousVotes: createForm.anonymousVotes,
      taskbarUpdates: createForm.taskbarUpdates,
      visualTasks: createForm.visualTasks,
      skipVoteMethod: createForm.skipVoteMethod,
      gameSpeed: createForm.gameSpeed,
      multipleImpostors: createForm.multipleImpostors,
      confirmEjects: createForm.confirmEjects
    };

    onCreateRoom(
      createForm.roomName.trim(),
      options,
      createForm.password || undefined
    );

    setShowCreateRoom(false);
    setCreateForm({ ...createForm, roomName: '', password: '' });
  };

  // 방 입장 처리
  const handleJoinRoom = (roomName: string, hasPassword: boolean) => {
    if (hasPassword) {
      setSelectedRoom(roomName);
      setShowPasswordModal(true);
    } else {
      onJoinRoom(roomName);
    }
  };

  // 비밀번호 방 입장
  const handlePasswordJoin = () => {
    if (selectedRoom) {
      onJoinRoom(selectedRoom, joinPassword);
      setShowPasswordModal(false);
      setJoinPassword('');
      setSelectedRoom('');
    }
  };

  // 폼 입력 처리
  const handleFormChange = (field: string, value: any) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 게임 상태 한글 변환
  const getGameStateText = (state: string) => {
    switch (state) {
      case 'waiting': return '대기중';
      case 'playing': return '게임중';
      case 'meeting': return '회의중';
      default: return state;
    }
  };

  // 게임 상태별 색상 클래스
  const getGameStateClass = (state: string) => {
    switch (state) {
      case 'waiting': return 'waiting';
      case 'playing': return 'playing';
      case 'meeting': return 'meeting';
      default: return 'unknown';
    }
  };

  return (
    <div className="lobby">
      {/* 헤더 */}
      <header className="lobby-header">
        <div className="player-info">
          <h2>🕵️ Police Undercover</h2>
          <p>환영합니다, <strong>{playerName}</strong>님!</p>
        </div>
        <div className="header-actions">
          <button onClick={refreshRooms} className="refresh-btn">
            🔄 새로고침
          </button>
          <button onClick={onOpenSettings} className="settings-btn">
            ⚙️ 설정
          </button>
          <button onClick={onLogout} className="logout-btn">
            🚪 로그아웃
          </button>
        </div>
      </header>

      <div className="lobby-content">
        {/* 방 목록 */}
        <section className="room-list-section">
          <div className="section-header">
            <h3>게임 방 목록 ({rooms.length})</h3>
            <button 
              onClick={() => setShowCreateRoom(true)}
              className="create-room-btn"
            >
              ➕ 방 만들기
            </button>
          </div>

          <div className="room-list">
            {rooms.length === 0 ? (
              <div className="no-rooms">
                <p>현재 생성된 방이 없습니다.</p>
                <p>새로운 방을 만들어보세요!</p>
              </div>
            ) : (
              rooms.map((room, index) => (
                <div key={index} className="room-card">
                  <div className="room-info">
                    <div className="room-header">
                      <h4 className="room-name">
                        {room.hasPassword && <span className="password-icon">🔒</span>}
                        {room.name}
                      </h4>
                      <span className={`game-state ${getGameStateClass(room.gameState)}`}>
                        {getGameStateText(room.gameState)}
                      </span>
                    </div>
                    <div className="room-details">
                      <span className="player-count">
                        👥 {room.playerCount}/{room.maxPlayers}
                      </span>
                      <span className="host-name">
                        🎭 {room.hostName}
                      </span>
                    </div>
                  </div>
                  <div className="room-actions">
                    <button
                      onClick={() => handleJoinRoom(room.name, room.hasPassword)}
                      disabled={room.playerCount >= room.maxPlayers || room.gameState === 'playing'}
                      className="join-btn"
                    >
                      {room.gameState === 'playing' ? '게임중' : 
                       room.playerCount >= room.maxPlayers ? '가득함' : '입장'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 통계 및 정보 */}
        <aside className="lobby-sidebar">
          <div className="stats-card">
            <h4>오늘의 통계</h4>
            <div className="stat-item">
              <span>활성 방: {rooms.length}</span>
            </div>
            <div className="stat-item">
              <span>온라인 플레이어: {rooms.reduce((sum, room) => sum + room.playerCount, 0)}</span>
            </div>
          </div>

          <div className="announcements-card">
            <h4>공지사항</h4>
            <div className="announcement">
              <p>🎉 새로운 역할 '변신술사'가 추가되었습니다!</p>
            </div>
            <div className="announcement">
              <p>🔧 서버 안정성이 개선되었습니다.</p>
            </div>
          </div>

          <div className="tips-card">
            <h4>게임 팁</h4>
            <ul>
              <li>🕵️ 탐정은 시체에서 단서를 얻을 수 있습니다</li>
              <li>👮 경찰은 임포스터를 체포할 수 있습니다</li>
              <li>⚕️ 의무관은 다른 플레이어를 보호할 수 있습니다</li>
              <li>🧪 과학자는 바이탈을 확인할 수 있습니다</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* 방 생성 모달 */}
      {showCreateRoom && (
        <div className="modal-overlay">
          <div className="modal create-room-modal">
            <div className="modal-header">
              <h3>새 방 만들기</h3>
              <button onClick={() => setShowCreateRoom(false)} className="close-btn">×</button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>방 이름</label>
                <input
                  type="text"
                  value={createForm.roomName}
                  onChange={(e) => handleFormChange('roomName', e.target.value)}
                  placeholder="방 이름을 입력하세요"
                  maxLength={20}
                />
              </div>

              <div className="form-group">
                <label>비밀번호 (선택)</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  placeholder="비밀번호 (공개방일 경우 비워두세요)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>최대 플레이어</label>
                  <select
                    value={createForm.maxPlayers}
                    onChange={(e) => handleFormChange('maxPlayers', parseInt(e.target.value))}
                  >
                    <option value={6}>6명</option>
                    <option value={8}>8명</option>
                    <option value={10}>10명</option>
                    <option value={12}>12명</option>
                    <option value={15}>15명</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>킬 쿨다운</label>
                  <select
                    value={createForm.killCooldown}
                    onChange={(e) => handleFormChange('killCooldown', parseInt(e.target.value))}
                  >
                    <option value={15}>15초</option>
                    <option value={20}>20초</option>
                    <option value={25}>25초</option>
                    <option value={30}>30초</option>
                    <option value={35}>35초</option>
                    <option value={40}>40초</option>
                    <option value={45}>45초</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>토론 시간</label>
                  <select
                    value={createForm.discussionTime}
                    onChange={(e) => handleFormChange('discussionTime', parseInt(e.target.value))}
                  >
                    <option value={30}>30초</option>
                    <option value={45}>45초</option>
                    <option value={60}>60초</option>
                    <option value={90}>90초</option>
                    <option value={120}>120초</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>투표 시간</label>
                  <select
                    value={createForm.votingTime}
                    onChange={(e) => handleFormChange('votingTime', parseInt(e.target.value))}
                  >
                    <option value={15}>15초</option>
                    <option value={30}>30초</option>
                    <option value={45}>45초</option>
                    <option value={60}>60초</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>긴급 회의 횟수</label>
                <select
                  value={createForm.emergencyMeetings}
                  onChange={(e) => handleFormChange('emergencyMeetings', parseInt(e.target.value))}
                >
                  <option value={0}>0번</option>
                  <option value={1}>1번</option>
                  <option value={2}>2번</option>
                  <option value={3}>3번</option>
                  <option value={4}>4번</option>
                  <option value={5}>5번</option>
                </select>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={createForm.anonymousVotes}
                    onChange={(e) => handleFormChange('anonymousVotes', e.target.checked)}
                  />
                  익명 투표
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={createForm.confirmEjects}
                    onChange={(e) => handleFormChange('confirmEjects', e.target.checked)}
                  />
                  추방 결과 공개
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={createForm.visualTasks}
                    onChange={(e) => handleFormChange('visualTasks', e.target.checked)}
                  />
                  시각적 태스크
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={createForm.multipleImpostors}
                    onChange={(e) => handleFormChange('multipleImpostors', e.target.checked)}
                  />
                  다중 임포스터
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowCreateRoom(false)} className="cancel-btn">
                취소
              </button>
              <button onClick={handleCreateRoom} className="confirm-btn">
                방 만들기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal password-modal">
            <div className="modal-header">
              <h3>비밀번호 입력</h3>
              <button onClick={() => setShowPasswordModal(false)} className="close-btn">×</button>
            </div>
            
            <div className="modal-content">
              <p>방 "{selectedRoom}"에 입장하려면 비밀번호를 입력하세요.</p>
              <input
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="비밀번호 입력"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordJoin()}
              />
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowPasswordModal(false)} className="cancel-btn">
                취소
              </button>
              <button onClick={handlePasswordJoin} className="confirm-btn">
                입장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
