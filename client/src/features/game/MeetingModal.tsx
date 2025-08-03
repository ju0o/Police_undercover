// [client/src/features/game/MeetingModal.tsx]

import React, { useState } from 'react';

type Player = { id: string; nickname: string; role: string; x: number; y: number };

const MeetingModal = ({
  myId,
  players,
  onVote,
  votes,
  phase,
  onEndVoting,
  chat,
  onSendChat,
}: {
  myId: string;
  players: Player[];
  onVote: (targetId: string) => void;
  votes: Record<string, string>;
  phase: string | null;
  onEndVoting: () => void;
  chat: { nickname: string; message: string }[];
  onSendChat: (msg: string) => void;
}) => {
  const [voteTarget, setVoteTarget] = useState<string>('');
  const [message, setMessage] = useState('');
  return (
    <div style={{
      position: 'absolute', left: 80, top: 100, width: 480, height: 400, background: '#fff',
      border: '2px solid #888', borderRadius: 16, zIndex: 9999, display: 'flex', flexDirection: 'column'
    }}>
      <h2>🗳️ 회의 {phase === 'discussion' ? '토론' : '투표'}</h2>
      <div style={{ flex: 1, display: 'flex' }}>
        {/* 플레이어 투표 */}
        <div style={{ flex: 1 }}>
          <ul>
            {players.map((p) => (
              <li key={p.id} style={{ margin: 4 }}>
                <button
                  style={{ fontWeight: p.id === voteTarget ? 'bold' : undefined }}
                  disabled={!!votes[myId]}
                  onClick={() => setVoteTarget(p.id)}
                >
                  {p.nickname} ({p.id === myId ? '나' : p.role[0]})
                </button>
                {votes &&
                  Object.values(votes).filter((v) => v === p.id).length > 0 &&
                  <span> - 득표: {Object.values(votes).filter((v) => v === p.id).length}</span>}
              </li>
            ))}
            <li>
              <button onClick={() => setVoteTarget('SKIP')} disabled={!!votes[myId]}>
                스킵
              </button>
            </li>
          </ul>
          {!votes[myId] && (
            <button
              onClick={() => onVote(voteTarget)}
              disabled={!voteTarget}
              style={{ marginTop: 12 }}
            >
              투표 제출
            </button>
          )}
        </div>
        {/* 회의 채팅 */}
        <div style={{ flex: 1, marginLeft: 8, borderLeft: '1px solid #eee', paddingLeft: 8 }}>
          <div style={{ height: 220, overflowY: 'auto', background: '#f9f9f9', padding: 4, borderRadius: 8 }}>
            {chat.map((c, i) => (
              <div key={i}><b>{c.nickname}:</b> {c.message}</div>
            ))}
          </div>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onSendChat(message);
                setMessage('');
              }
            }}
            placeholder="채팅 입력"
            style={{ marginTop: 8, width: '90%' }}
          />
        </div>
      </div>
      {phase === 'voting' && (
        <button onClick={onEndVoting} style={{ marginTop: 16 }}>투표 종료</button>
      )}
    </div>
  );
};

export default MeetingModal;
