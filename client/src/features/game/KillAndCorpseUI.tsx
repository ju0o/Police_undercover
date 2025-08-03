// [client/src/features/game/KillAndCorpseUI.tsx]

import React from 'react';

type Player = {
  id: string;
  nickname: string;
  role: string;
  x: number;
  y: number;
};

type Corpse = {
  id: string;
  x: number;
  y: number;
  killedBy: string;
};

type Props = {
  myId: string;
  myRole: string;
  players: Player[];
  corpses: Corpse[];
  onKill: (targetId: string) => void;
  onReport: (corpseId: string) => void;
  myPos: { x: number; y: number };
  isDead: boolean;
};

const KILL_RADIUS = 40;
const CORPSE_RADIUS = 40;

const KillAndCorpseUI = ({
  myId, myRole, players, corpses, onKill, onReport, myPos, isDead
}: Props) => {
  if (isDead) return null;

  // 임포스터만 "킬" 가능, 내 근처에 타겟 있으면
  let killTarget: Player | null = null;
  if (myRole === '조직원') {
    killTarget = players.find(
      (p) =>
        p.id !== myId &&
        !corpses.find((c) => c.id === p.id) &&
        Math.sqrt((p.x - myPos.x) ** 2 + (p.y - myPos.y) ** 2) < KILL_RADIUS
    ) || null;
  }

  // 내 근처에 시체 있으면
  let foundCorpse: Corpse | null = null;
  foundCorpse = corpses.find(
    (c) => Math.sqrt((c.x - myPos.x) ** 2 + (c.y - myPos.y) ** 2) < CORPSE_RADIUS
  ) || null;

  return (
    <>
      {/* 킬 버튼 */}
      {myRole === '조직원' && killTarget && (
        <button
          style={{
            position: 'absolute',
            right: 20,
            top: 12,
            zIndex: 9999,
            background: '#e14141',
            color: '#fff',
          }}
          onClick={() => onKill(killTarget!.id)}
        >
          암살(Kill)
        </button>
      )}

      {/* 시체 신고 버튼 */}
      {foundCorpse && (
        <button
          style={{
            position: 'absolute',
            left: 120,
            top: 12,
            zIndex: 9999,
            background: '#ffe15a',
          }}
          onClick={() => onReport(foundCorpse.id)}
        >
          시체 신고
        </button>
      )}

      {/* 시체(💀) 맵에 표시 */}
      {corpses.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            left: c.x,
            top: c.y,
            width: 28,
            height: 28,
            background: '#632b2b',
            borderRadius: 16,
            border: '2px solid #fff',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>💀</span>
        </div>
      ))}
    </>
  );
};

export default KillAndCorpseUI;
