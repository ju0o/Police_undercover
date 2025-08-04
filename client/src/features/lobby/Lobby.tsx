// [client/src/features/lobby/Lobby.tsx] - 경찰/언더커버 컨셉 로비 컴포넌트
// 완전한 게임 모드 커스터마이징 기능 포함

import { useState } from 'react';
import './Lobby.css';

interface Room {
  name: string;
  playerCount: number;
  maxPlayers: number;
  gameState: string;
  hasPassword: boolean;
  hostName?: string;
  options?: any;
  createdAt?: number;
  gameMode?: string;
  map?: string;
}

interface LobbyProps {
  playerName: string;
  rooms: Room[];
  onCreateRoom: (roomName: string, options: any, password?: string) => void;
  onJoinRoom: (roomName: string, password?: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

// 게임 모드 프리셋
const GAME_MODES = {
  classic: {
    name: '클래식 모드',
    description: '기본적인 경찰 vs 언더커버 게임',
    impostorCount: 1,
    crewCount: 7,
    missions: ['electrical_wires', 'fuel_engine', 'fix_lights', 'clear_asteroids', 'swipe_card'],
    killCooldown: 30,
    emergencyMeetings: 1,
    discussionTime: 120,
    votingTime: 30
  },
  detective: {
    name: '탐정 모드',
    description: '탐정이 포함된 고급 게임',
    impostorCount: 2,
    crewCount: 8,
    missions: ['electrical_wires', 'fuel_engine', 'fix_lights', 'clear_asteroids', 'swipe_card', 'security_code', 'reaction_test'],
    killCooldown: 25,
    emergencyMeetings: 2,
    discussionTime: 150,
    votingTime: 45
  },
  undercover: {
    name: '언더커버 모드',
    description: '다중 언더커버가 있는 복잡한 게임',
    impostorCount: 3,
    crewCount: 9,
    missions: ['electrical_wires', 'fuel_engine', 'fix_lights', 'clear_asteroids', 'swipe_card', 'security_code', 'reaction_test', 'memory_game'],
    killCooldown: 20,
    emergencyMeetings: 3,
    discussionTime: 180,
    votingTime: 60
  },
  custom: {
    name: '커스텀 모드',
    description: '완전히 커스터마이징 가능한 게임',
    impostorCount: 1,
    crewCount: 7,
    missions: ['electrical_wires', 'fuel_engine', 'fix_lights'],
    killCooldown: 30,
    emergencyMeetings: 1,
    discussionTime: 120,
    votingTime: 30
  }
};

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
  const [selectedGameMode, setSelectedGameMode] = useState<string>('classic');

  // 방 생성 폼 상태
  const [createForm, setCreateForm] = useState({
    roomName: '',
    password: '',
    maxPlayers: 10,
    impostorCount: 1,
    crewCount: 7,
    killCooldown: 30,
    emergencyMeetings: 1,
    discussionTime: 120,
    votingTime: 30,
    anonymousVotes: false,
    taskbarUpdates: true,
    visualTasks: true,
    skipVoteMethod: 'majority',
    gameSpeed: 1,
    multipleImpostors: true,
    confirmEjects: true,
    selectedMissions: ['electrical_wires', 'fuel_engine', 'fix_lights', 'clear_asteroids', 'swipe_card'],
    gameMode: 'classic',
    map: 'spaceship',
    isPrivate: false
  });

  // 새로고침으로 방 목록 업데이트
  const refreshRooms = () => {
    console.log('Refreshing room list...');
    // 실제로는 부모 컴포넌트에서 방 목록을 다시 가져오는 함수를 호출해야 함
    // 여기서는 로컬 상태를 초기화하는 역할만 함
  };

  // 게임 모드 변경 처리
  const handleGameModeChange = (mode: string) => {
    setSelectedGameMode(mode);
    const gameMode = GAME_MODES[mode as keyof typeof GAME_MODES];
    
    if (gameMode) {
      setCreateForm(prev => ({
        ...prev,
        impostorCount: gameMode.impostorCount,
        crewCount: gameMode.crewCount,
        missions: gameMode.missions,
        killCooldown: gameMode.killCooldown,
        emergencyMeetings: gameMode.emergencyMeetings,
        discussionTime: gameMode.discussionTime,
        votingTime: gameMode.votingTime,
        maxPlayers: gameMode.impostorCount + gameMode.crewCount
      }));
    }
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

    // 특수문자 검증
    const validNameRegex = /^[a-zA-Z0-9가-힣\s]+$/;
    if (!validNameRegex.test(createForm.roomName.trim())) {
      alert('방 이름에는 영문, 숫자, 한글, 공백만 사용 가능합니다.');
      return;
    }

    const options = {
      maxPlayers: createForm.maxPlayers,
      impostorCount: createForm.impostorCount,
      crewCount: createForm.crewCount,
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
      confirmEjects: createForm.confirmEjects,
      selectedMissions: createForm.selectedMissions,
      gameMode: selectedGameMode,
      map: createForm.map,
      isPrivate: createForm.isPrivate
    };

    onCreateRoom(
      createForm.roomName.trim(),
      options,
      createForm.password || undefined
    );

    setShowCreateRoom(false);
    setCreateForm({ 
      ...createForm, 
      roomName: '', 
      password: '',
      gameMode: 'classic',
      map: 'spaceship',
      isPrivate: false
    });
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

  // 미션 선택 처리
  const handleMissionToggle = (missionId: string) => {
    setCreateForm(prev => ({
      ...prev,
      selectedMissions: prev.selectedMissions.includes(missionId)
        ? prev.selectedMissions.filter(id => id !== missionId)
        : [...prev.selectedMissions, missionId]
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
            {rooms.filter(room => room && room.name && room.name.trim() !== '').length === 0 ? (
              <div className="no-rooms">
                <p>현재 활성화된 방이 없습니다.</p>
                <p>새로운 방을 만들어보세요!</p>
                <button 
                  onClick={refreshRooms}
                  className="refresh-btn"
                  style={{ marginTop: '15px' }}
                >
                  🔄 새로고침
                </button>
              </div>
            ) : (
              rooms
                .filter(room => room && room.name && room.name.trim() !== '') // 유효한 방만 필터링
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) // 최신순 정렬
                .map((room, index) => (
                <div key={`${room.name}-${index}`} className="room-card">
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
                      {room.hostName && (
                        <span className="host-name">
                          🎭 {room.hostName}
                        </span>
                      )}
                      {room.gameMode && (
                        <span className="game-mode">
                          🎮 {room.gameMode === 'classic' ? '클래식' : 
                              room.gameMode === 'detective' ? '탐정' : 
                              room.gameMode === 'undercover' ? '언더커버' : 
                              room.gameMode === 'custom' ? '커스텀' : room.gameMode}
                        </span>
                      )}
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
              {/* 기본 정보 */}
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

              {/* 게임 모드 선택 */}
              <div className="form-group">
                <label>게임 모드</label>
                <div className="game-mode-selector">
                  {Object.entries(GAME_MODES).map(([key, mode]) => (
                    <div
                      key={key}
                      className={`game-mode-option ${selectedGameMode === key ? 'selected' : ''}`}
                      onClick={() => handleGameModeChange(key)}
                    >
                      <div className="mode-header">
                        <h4>{mode.name}</h4>
                        <span className="mode-description">{mode.description}</span>
                      </div>
                      <div className="mode-details">
                        <span>언더커버: {mode.impostorCount}명</span>
                        <span>경찰: {mode.crewCount}명</span>
                        <span>미션: {mode.missions.length}개</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 플레이어 수 설정 */}
              <div className="form-row">
                <div className="form-group">
                  <label>언더커버 수</label>
                  <select
                    value={createForm.impostorCount}
                    onChange={(e) => handleFormChange('impostorCount', parseInt(e.target.value))}
                    disabled={selectedGameMode !== 'custom'}
                  >
                    <option value={1}>1명</option>
                    <option value={2}>2명</option>
                    <option value={3}>3명</option>
                    <option value={4}>4명</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>경찰 수</label>
                  <select
                    value={createForm.crewCount}
                    onChange={(e) => handleFormChange('crewCount', parseInt(e.target.value))}
                    disabled={selectedGameMode !== 'custom'}
                  >
                    <option value={5}>5명</option>
                    <option value={6}>6명</option>
                    <option value={7}>7명</option>
                    <option value={8}>8명</option>
                    <option value={9}>9명</option>
                    <option value={10}>10명</option>
                  </select>
                </div>
              </div>

              {/* 게임 설정 */}
              <div className="form-row">
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
                    <option value={150}>150초</option>
                    <option value={180}>180초</option>
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

              {/* 미션 선택 (커스텀 모드에서만) */}
              {selectedGameMode === 'custom' && (
                <div className="form-group">
                  <label>미션 선택</label>
                  <div className="mission-selector">
                    {Object.entries({
                      'electrical_wires': '전선 연결',
                      'fuel_engine': '엔진 연료 주입',
                      'fix_lights': '조명 수리',
                      'clear_asteroids': '소행성 제거',
                      'swipe_card': '카드 인증',
                      'security_code': '보안 코드 입력',
                      'reaction_test': '반응 속도 테스트',
                      'memory_game': '기억력 게임'
                    }).map(([id, name]) => (
                      <label key={id} className="mission-checkbox">
                        <input
                          type="checkbox"
                          checked={createForm.selectedMissions.includes(id)}
                          onChange={() => handleMissionToggle(id)}
                        />
                        <span>{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 맵 선택 */}
              <div className="form-group">
                <label>맵 선택</label>
                <select
                  value={createForm.map}
                  onChange={(e) => handleFormChange('map', e.target.value)}
                >
                  <option value="spaceship">우주선</option>
                  <option value="office">사무실</option>
                  <option value="laboratory">연구소</option>
                </select>
              </div>

              {/* 추가 옵션 */}
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
                  다중 언더커버
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={createForm.isPrivate}
                    onChange={(e) => handleFormChange('isPrivate', e.target.checked)}
                  />
                  비공개 방 (초대 코드 필요)
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
