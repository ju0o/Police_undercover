// [client/src/features/game/MissionModal.tsx]

import React from 'react';

type Mission = { id: number; name: string; x: number; y: number };

const MissionModal = ({
  mission,
  onComplete,
  onClose,
}: {
  mission: Mission;
  onComplete: () => void;
  onClose: () => void;
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 200,
        top: 200,
        width: 240,
        height: 160,
        background: '#fff',
        border: '2px solid #888',
        borderRadius: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 20px #0007',
      }}
    >
      <h3>{mission.name}</h3>
      <p>간단 미션 예시<br />버튼 클릭으로 완료!</p>
      <button onClick={onComplete}>미션 완료</button>
      <button onClick={onClose} style={{ marginTop: 8 }}>
        닫기
      </button>
    </div>
  );
};

export default MissionModal;
