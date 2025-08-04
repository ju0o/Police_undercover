// [client/src/features/result/GameResults.tsx] - 게임 결과 화면 컴포넌트
// 승부 결과, 통계, 플레이어 성과 등 표시

import React, { useState } from 'react';
import './GameResults.css';

// PlayerResult는 types/game.ts에서 import

import type { GameResults as GameResultsType } from '../../types/game';

interface GameResultsProps {
  results: GameResultsType;
  playerData: any;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({
  results,
  playerData,
  onPlayAgain,
  onBackToLobby
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'stats'>('overview');

  // 승리 조건 한글 변환
  const getWinConditionText = (condition: string) => {
    switch (condition) {
      case 'crewmates_tasks': return '크루메이트가 모든 미션을 완료했습니다';
      case 'crewmates_vote': return '크루메이트가 모든 임포스터를 추방했습니다';
      case 'impostors_kill': return '임포스터가 크루메이트 수와 같아졌습니다';
      case 'impostors_sabotage': return '임포스터가 사보타주에 성공했습니다';
      case 'time_limit': return '시간 제한에 도달했습니다';
      default: return condition;
    }
  };

  // 팀 색상 반환
  const getTeamColor = (team: string) => {
    switch (team) {
      case 'crewmate': return '#4CAF50';
      case 'impostor': return '#F44336';
      case 'neutral': return '#FF9800';
      default: return '#757575';
    }
  };

  // 역할 아이콘 반환
  const getRoleIcon = (roleId: string) => {
    const icons: {[key: string]: string} = {
      crewmate: '👨‍🚀',
      impostor: '👹',
      detective: '🕵️',
      police: '👮',
      scientist: '🧪',
      medic: '⚕️',
      organization: '🏢',
      audit_team: '📊',
      jester: '🃏',
      survivor: '🛡️',
      shapeshifter: '🎭'
    };
    return icons[roleId] || '❓';
  };

  // 게임 시간 포맷
  const formatGameTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 성과 배지 렌더링
  const renderAchievements = (achievements: string[]) => (
    <div className="achievements">
      {achievements.map((achievement, index) => (
        <span key={index} className="achievement-badge">
          {achievement}
        </span>
      ))}
    </div>
  );

  // 개요 탭 렌더링
  const renderOverviewTab = () => (
    <div className="overview-tab">
      <div className="game-result-header">
        <div className="result-banner" style={{ backgroundColor: getTeamColor(results.winningTeam || '') }}>
          <h2>
            {results.winningTeam === 'crewmate' ? '🚀 크루메이트 승리!' : 
             results.winningTeam === 'impostor' ? '👹 임포스터 승리!' : '🎭 중립 역할 승리!'}
          </h2>
          <p>{getWinConditionText(results.winCondition)}</p>
        </div>

        {results.mvpPlayer && (
          <div className="mvp-section">
            <h3>🏆 MVP</h3>
            <div className="mvp-card">
              <div className="mvp-info">
                <span className="mvp-role">{getRoleIcon(results.mvpPlayer.role.id)}</span>
                <span className="mvp-name">{results.mvpPlayer.nickname}</span>
                <span className="mvp-role-name">({results.mvpPlayer.role.name})</span>
              </div>
              <div className="mvp-stats">
                <div>킬: {(results.mvpPlayer as any)?.kills || 0}</div>
                <div>미션: {(results.mvpPlayer as any)?.missionsCompleted || 0}</div>
                <div>투표 정확도: {(results.mvpPlayer as any)?.voteAccuracy?.toFixed(1) || '0.0'}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-summary">
        <h3>게임 요약</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">게임 시간</div>
            <div className="summary-value">{formatGameTime(results.gameLength || 0)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">총 킬</div>
            <div className="summary-value">{results.totalKills}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">미션 완료</div>
            <div className="summary-value">{results.completedMissions}/{results.totalMissions}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">회의 소집</div>
            <div className="summary-value">{results.meetingsCalled}</div>
          </div>
        </div>
      </div>

      {/* 내 결과 */}
      {playerData && (
        <div className="my-result">
          <h3>내 게임 결과</h3>
          <div className="my-result-card">
            <div className="my-result-header">
              <span className="my-role">{getRoleIcon(playerData.role.id)}</span>
              <span className="my-name">{playerData.nickname}</span>
              <span className="my-role-name">({playerData.role.name})</span>
              <span className={`my-result-badge ${playerData.isWinner ? 'win' : 'lose'}`}>
                {playerData.isWinner ? '승리' : '패배'}
              </span>
            </div>
            <div className="my-stats-grid">
              <div>킬: {playerData.kills || 0}</div>
              <div>데스: {playerData.deaths || 0}</div>
              <div>미션: {playerData.missionsCompleted || 0}</div>
              <div>투표 정확도: {(playerData.voteAccuracy || 0).toFixed(1)}%</div>
              <div>생존 시간: {formatGameTime(playerData.survivalTime || 0)}</div>
            </div>
            {playerData.achievements && playerData.achievements.length > 0 && (
              <div className="my-achievements">
                <h4>획득한 성과</h4>
                {renderAchievements(playerData.achievements)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // 플레이어 탭 렌더링
  const renderPlayersTab = () => (
    <div className="players-tab">
      <h3>플레이어 결과</h3>
      <div className="players-results">
        {(results as any).playerResults
          .sort((a: any, b: any) => (b.isWinner ? 1 : 0) - (a.isWinner ? 1 : 0))
          .map((player: any, index: number) => (
            <div key={player.id} className="player-result-card">
              <div className="player-result-header">
                <div className="player-rank">#{index + 1}</div>
                <div className="player-info">
                  <span className="player-role">{getRoleIcon(player.role.id)}</span>
                  <span className="player-name">{player.nickname}</span>
                  <span className="player-role-name">({player.role.name})</span>
                </div>
                <span className={`result-badge ${player.isWinner ? 'win' : 'lose'}`}>
                  {player.isWinner ? '승리' : '패배'}
                </span>
              </div>
              
              <div className="player-stats">
                <div className="stat-row">
                  <span>킬</span>
                  <span>{player.kills}</span>
                </div>
                <div className="stat-row">
                  <span>데스</span>
                  <span>{player.deaths}</span>
                </div>
                <div className="stat-row">
                  <span>미션</span>
                  <span>{player.missionsCompleted}</span>
                </div>
                <div className="stat-row">
                  <span>투표 정확도</span>
                  <span>{player.voteAccuracy.toFixed(1)}%</span>
                </div>
                <div className="stat-row">
                  <span>생존 시간</span>
                  <span>{formatGameTime(player.survivalTime)}</span>
                </div>
              </div>

              {player.achievements.length > 0 && (
                <div className="player-achievements">
                  {renderAchievements(player.achievements)}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  // 통계 탭 렌더링
  const renderStatsTab = () => (
    <div className="stats-tab">
      <h3>게임 통계</h3>
      
      <div className="stats-section">
        <h4>팀별 성과</h4>
        <div className="team-stats">
          <div className="team-stat-card crewmate">
            <h5>🚀 크루메이트</h5>
            <div>플레이어: {(results as any).playerResults.filter((p: any) => p.role.team === 'crewmate').length}명</div>
            <div>미션 완료: {results.completedMissions}/{results.totalMissions}</div>
                          <div>생존자: {(results as any).playerResults.filter((p: any) => p.role.team === 'crewmate' && p.deaths === 0).length}명</div>
          </div>
          
          <div className="team-stat-card impostor">
            <h5>👹 임포스터</h5>
            <div>플레이어: {(results as any).playerResults.filter((p: any) => p.role.team === 'impostor').length}명</div>
            <div>총 킬: {results.totalKills}</div>
                          <div>생존자: {(results as any).playerResults.filter((p: any) => p.role.team === 'impostor' && p.deaths === 0).length}명</div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h4>역할별 통계</h4>
        <div className="role-stats">
          {Object.entries(
            (results as any).playerResults.reduce((acc: any, player: any) => {
              const roleId = player.role.id;
              if (!acc[roleId]) {
                acc[roleId] = {
                  name: player.role.name,
                  icon: getRoleIcon(roleId),
                  count: 0,
                  wins: 0,
                  totalKills: 0,
                  totalMissions: 0
                };
              }
              acc[roleId].count++;
              if (player.isWinner) acc[roleId].wins++;
              acc[roleId].totalKills += player.kills;
              acc[roleId].totalMissions += player.missionsCompleted;
              return acc;
            }, {})
          ).map(([roleId, stats]: [string, any]) => (
            <div key={roleId} className="role-stat-card">
              <div className="role-stat-header">
                <span className="role-icon">{stats.icon}</span>
                <span className="role-name">{stats.name}</span>
              </div>
              <div className="role-stat-details">
                <div>플레이어: {stats.count}명</div>
                <div>승률: {((stats.wins / stats.count) * 100).toFixed(1)}%</div>
                <div>평균 킬: {(stats.totalKills / stats.count).toFixed(1)}</div>
                <div>평균 미션: {(stats.totalMissions / stats.count).toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {results.statistics && (
        <div className="stats-section">
          <h4>세부 통계</h4>
          <div className="detailed-stats">
            <div>평균 킬 간격: {Math.round(results.statistics.averageKillInterval / 1000)}초</div>
            <div>가장 위험한 구역: {results.statistics.mostDangerousArea || '알 수 없음'}</div>
            <div>가장 활발한 플레이어: {results.statistics.mostActivePlayer || '알 수 없음'}</div>
            <div>평균 회의 길이: {Math.round(results.statistics.averageMeetingLength / 1000)}초</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="game-results">
      <div className="results-container">
        {/* 탭 네비게이션 */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            개요
          </button>
          <button
            className={`tab-button ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            플레이어
          </button>
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            통계
          </button>
        </div>

        {/* 탭 내용 */}
        <div className="tab-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'players' && renderPlayersTab()}
          {activeTab === 'stats' && renderStatsTab()}
        </div>

        {/* 액션 버튼 */}
        <div className="results-actions">
          <button onClick={onPlayAgain} className="play-again-btn">
            다시 플레이
          </button>
          <button onClick={onBackToLobby} className="back-to-lobby-btn">
            로비로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResults;