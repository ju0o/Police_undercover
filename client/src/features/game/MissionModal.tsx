// [client/src/features/game/MissionModal.tsx] - 완전한 미션 모달 컴포넌트
// 실제 미니게임을 포함한 인터랙티브한 미션 시스템

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import './MissionModal.css';

// ============================
// 타입 정의
// ============================

interface MissionData {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  description?: string;
  timeLimit?: number;
  requiredSteps?: number;
  config: any;
}

interface MissionModalProps {
  isOpen: boolean;
  missionData: MissionData | null;
  socket: Socket | null;
  roomName: string;
  onClose: () => void;
  onComplete: (result: MissionResult) => void;
}

interface MissionResult {
  success: boolean;
  timeSpent?: number;
  accuracy?: number;
  steps?: number;
}

// ============================
// 미션 타입별 컴포넌트
// ============================

// 순서 맞추기 미션
const SequenceMission: React.FC<{
  missionData: MissionData;
  onComplete: (result: MissionResult) => void;
}> = ({ missionData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [sequence, setSequence] = useState<string[]>([]);
  const [isDisplaying, setIsDisplaying] = useState(true);
  // const [correct, setCorrect] = useState(0);
  // const [wrong, setWrong] = useState(0);
  const [startTime] = useState(Date.now());

  const colors = missionData.config.colors || ['red', 'blue', 'green', 'yellow'];

  useEffect(() => {
    setSequence(missionData.config.sequence || colors);
  }, [missionData]);

  useEffect(() => {
    if (isDisplaying) {
      const timer = setTimeout(() => {
        setIsDisplaying(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDisplaying]);

  const handleColorClick = (color: string) => {
    if (isDisplaying) return;

    const newInput = [...userInput, color];
    setUserInput(newInput);

    if (color === sequence[currentStep]) {
      // setCorrect(prev => prev + 1);
      setCurrentStep(prev => prev + 1);

      if (currentStep + 1 >= sequence.length) {
        const timeSpent = Date.now() - startTime;
        onComplete({
          success: true,
          timeSpent,
          accuracy: 100,
          steps: sequence.length
        });
      }
    } else {
      // setWrong(prev => prev + 1);
      // onFail();
    }
  };

  if (isDisplaying) {
    return (
      <div className="mission-display">
        <h3>순서를 기억하세요!</h3>
        <div className="sequence-display">
          {sequence.map((color, index) => (
            <div
              key={index}
              className={`color-box ${color}`}
              style={{ animationDelay: `${index * 500}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mission-input">
      <h3>순서대로 클릭하세요</h3>
      <div className="color-grid">
        {colors.map((color: string) => (
          <button
            key={color}
            className={`color-button ${color}`}
            onClick={() => handleColorClick(color)}
          >
            {color}
          </button>
        ))}
      </div>
      <div className="progress">
        진행도: {currentStep}/{sequence.length}
      </div>
    </div>
  );
};

// 진행률 채우기 미션
const ProgressMission: React.FC<{
  missionData: MissionData;
  onComplete: (result: MissionResult) => void;
}> = ({ missionData, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [startTime] = useState(Date.now());
  const maxClicks = missionData.config.maxClicks || 10;
  const targetProgress = missionData.config.targetProgress || 100;
  const incrementPerClick = missionData.config.incrementPerClick || 10;

  const handleClick = () => {
    if (clicks >= maxClicks) return;

    const newProgress = Math.min(progress + incrementPerClick, targetProgress);
    const newClicks = clicks + 1;
    
    setProgress(newProgress);
    setClicks(newClicks);

    if (newProgress >= targetProgress) {
      const timeSpent = Date.now() - startTime;
      onComplete({
        success: true,
        timeSpent,
        accuracy: 100,
        steps: newClicks
      });
    }
  };

  return (
    <div className="progress-mission">
      <h3>{missionData.name}</h3>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(progress / targetProgress) * 100}%` }}
        />
        <span className="progress-text">{progress}%</span>
      </div>
      <button 
        className="progress-button"
        onClick={handleClick}
        disabled={clicks >= maxClicks || progress >= targetProgress}
      >
        클릭하여 진행 ({clicks}/{maxClicks})
      </button>
    </div>
  );
};

// 스위치 조작 미션
const SwitchMission: React.FC<{
  missionData: MissionData;
  onComplete: (result: MissionResult) => void;
}> = ({ missionData, onComplete }) => {
  const [switches, setSwitches] = useState<boolean[]>([]);
  const [startTime] = useState(Date.now());
  const targetStates = missionData.config.targetStates || [true, false, true];
  const labels = missionData.config.labels || ['스위치 1', '스위치 2', '스위치 3'];

  useEffect(() => {
    setSwitches(new Array(targetStates.length).fill(false));
  }, [targetStates]);

  const handleSwitchToggle = (index: number) => {
    const newSwitches = [...switches];
    newSwitches[index] = !newSwitches[index];
    setSwitches(newSwitches);

    // 완료 조건 확인
    const isComplete = newSwitches.every((state, i) => state === targetStates[i]);
    if (isComplete) {
      const timeSpent = Date.now() - startTime;
      onComplete({
        success: true,
        timeSpent,
        accuracy: 100,
        steps: targetStates.length
      });
    }
  };

  return (
    <div className="switch-mission">
      <h3>{missionData.name}</h3>
      <div className="switches-container">
        {switches.map((state, index) => (
          <div key={index} className="switch-item">
            <label className="switch-label">{labels[index]}</label>
            <button
              className={`switch-button ${state ? 'on' : 'off'}`}
              onClick={() => handleSwitchToggle(index)}
            >
              {state ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>
      <div className="target-hint">
        목표: {targetStates.map((state: boolean, i: number) => `${labels[i]}: ${state ? 'ON' : 'OFF'}`).join(', ')}
      </div>
    </div>
  );
};

// 클릭 미션 (소행성 제거)
const ClickMission: React.FC<{
  missionData: MissionData;
  onComplete: (result: MissionResult) => void;
}> = ({ missionData, onComplete }) => {
  const [asteroids, setAsteroids] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [clicked, setClicked] = useState(0);
  const [startTime] = useState(Date.now());
  const total = missionData.config.asteroidCount || 8;
  const spawnInterval = missionData.config.spawnInterval || 800;

  useEffect(() => {
    const spawnAsteroid = () => {
      if (asteroids.length < total) {
        const newAsteroid = {
          id: Date.now(),
          x: Math.random() * 300 + 50,
          y: Math.random() * 200 + 50
        };
        setAsteroids(prev => [...prev, newAsteroid]);
      }
    };

    const interval = setInterval(spawnAsteroid, spawnInterval);
    return () => clearInterval(interval);
  }, [asteroids.length, total, spawnInterval]);

  const handleAsteroidClick = (asteroidId: number) => {
    setAsteroids(prev => prev.filter(a => a.id !== asteroidId));
    setClicked(prev => prev + 1);

    if (clicked + 1 >= total) {
      const timeSpent = Date.now() - startTime;
      onComplete({
        success: true,
        timeSpent,
        accuracy: 100,
        steps: total
      });
    }
  };

  return (
    <div className="click-mission">
      <h3>{missionData.name}</h3>
      <div className="asteroid-field">
        {asteroids.map(asteroid => (
          <div
            key={asteroid.id}
            className="asteroid"
            style={{ left: asteroid.x, top: asteroid.y }}
            onClick={() => handleAsteroidClick(asteroid.id)}
          />
        ))}
      </div>
      <div className="progress">
        제거된 소행성: {clicked}/{total}
      </div>
    </div>
  );
};

// 스와이프 미션 (카드 인증)
const SwipeMission: React.FC<{
  missionData: MissionData;
  onComplete: (result: MissionResult) => void;
}> = ({ missionData, onComplete }) => {
  const [swipeStart, setSwipeStart] = useState<{x: number, y: number} | null>(null);
  const [swipeEnd, setSwipeEnd] = useState<{x: number, y: number} | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startTime] = useState(Date.now());
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeStart({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const touch = e.touches[0];
    setSwipeEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!swipeStart || !swipeEnd) return;

    const distance = Math.sqrt(
      Math.pow(swipeEnd.x - swipeStart.x, 2) + 
      Math.pow(swipeEnd.y - swipeStart.y, 2)
    );

    const direction = Math.abs(swipeEnd.x - swipeStart.x) > Math.abs(swipeEnd.y - swipeStart.y)
      ? (swipeEnd.x > swipeStart.x ? 'right' : 'left')
      : (swipeEnd.y > swipeStart.y ? 'down' : 'up');

    const speed = distance / (Date.now() - startTime);

    if (distance >= 100 && direction === 'right' && speed <= 2) {
      const timeSpent = Date.now() - startTime;
      onComplete({
        success: true,
        timeSpent,
        accuracy: 100,
        steps: 1
      });
    }

    setIsSwiping(false);
    setSwipeStart(null);
    setSwipeEnd(null);
  };

  return (
    <div className="swipe-mission">
      <h3>{missionData.name}</h3>
      <div className="swipe-instructions">
        카드를 오른쪽으로 스와이프하세요
      </div>
      <div
        ref={cardRef}
        className={`swipe-card ${isSwiping ? 'swiping' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="card-content">
          <div className="card-icon">💳</div>
          <div className="card-text">스와이프</div>
        </div>
      </div>
    </div>
  );
};

// 반응 속도 테스트
const ReactionMission: React.FC<{
  missionData: MissionData;
  onComplete: (result: MissionResult) => void;
}> = ({ missionData, onComplete }) => {
  const [isTargetVisible, setIsTargetVisible] = useState(false);
  const [targets, setTargets] = useState(0);
  const [clicked, setClicked] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime] = useState(Date.now());
  const [targetStartTime, setTargetStartTime] = useState(0);
  const total = missionData.config.targetCount || 5;
  const minDelay = missionData.config.minDelay || 1000;
  const maxDelay = missionData.config.maxDelay || 3000;

  useEffect(() => {
    if (targets < total) {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      const timer = setTimeout(() => {
        setIsTargetVisible(true);
        setTargetStartTime(Date.now());
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [targets, total, minDelay, maxDelay]);

  const handleTargetClick = () => {
    if (!isTargetVisible) return;

    const reactionTime = Date.now() - targetStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);
    setClicked(prev => prev + 1);
    setIsTargetVisible(false);
    setTargets(prev => prev + 1);

    if (clicked + 1 >= total) {
      const timeSpent = Date.now() - startTime;
      const avgReactionTime = reactionTimes.reduce((a, b) => a + b, reactionTime) / (reactionTimes.length + 1);
      const accuracy = Math.max(0, 100 - avgReactionTime / 10);
      
      onComplete({
        success: true,
        timeSpent,
        accuracy: Math.round(accuracy),
        steps: total
      });
    }
  };

  return (
    <div className="reaction-mission">
      <h3>{missionData.name}</h3>
      <div className="reaction-field">
        {isTargetVisible && (
          <div 
            className="reaction-target"
            onClick={handleTargetClick}
          />
        )}
      </div>
      <div className="progress">
        완료: {clicked}/{total}
      </div>
    </div>
  );
};

// 기억력 게임
const MemoryMission: React.FC<{
  missionData: MissionData;
  onComplete: (result: MissionResult) => void;
}> = ({ missionData, onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [displayMode, setDisplayMode] = useState(true);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const sequenceLength = missionData.config.sequenceLength || 5;
  const displayTime = missionData.config.displayTime || 1000;

  useEffect(() => {
    if (sequence.length === 0) {
      const newSequence = [];
      for (let i = 0; i < sequenceLength; i++) {
        newSequence.push(Math.floor(Math.random() * 4) + 1);
      }
      setSequence(newSequence);
    }
  }, [sequenceLength]);

  useEffect(() => {
    if (displayMode && sequence.length > 0) {
      if (displayIndex < sequence.length) {
        const timer = setTimeout(() => {
          setDisplayIndex(prev => prev + 1);
        }, displayTime);
        return () => clearTimeout(timer);
      } else {
        setDisplayMode(false);
        setDisplayIndex(0);
      }
    }
  }, [displayMode, displayIndex, sequence.length, displayTime]);

  const handleNumberClick = (number: number) => {
    if (displayMode) return;

    const newInput = [...userInput, number];
    setUserInput(newInput);

    if (number !== sequence[userInput.length]) {
      // onFail();
      return;
    }

    if (newInput.length === sequence.length) {
      const timeSpent = Date.now() - startTime;
      onComplete({
        success: true,
        timeSpent,
        accuracy: 100,
        steps: sequence.length
      });
    }
  };

  if (displayMode) {
    return (
      <div className="memory-display">
        <h3>순서를 기억하세요!</h3>
        <div className="number-display">
          {displayIndex < sequence.length && (
            <div className="display-number">
              {sequence[displayIndex]}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="memory-input">
      <h3>순서대로 클릭하세요</h3>
      <div className="number-grid">
        {[1, 2, 3, 4].map(number => (
          <button
            key={number}
            className="number-button"
            onClick={() => handleNumberClick(number)}
          >
            {number}
          </button>
        ))}
      </div>
      <div className="progress">
        입력: {userInput.length}/{sequence.length}
      </div>
    </div>
  );
};

// ============================
// 메인 미션 모달 컴포넌트
// ============================

const MissionModal: React.FC<MissionModalProps> = ({
  isOpen,
  missionData,
  socket,
  roomName,
  onClose,
  onComplete
}) => {
  const [currentMission, setCurrentMission] = useState<MissionData | null>(null);
  const [missionStartTime, setMissionStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isOpen && missionData) {
      setCurrentMission(missionData);
      setMissionStartTime(Date.now());
      setTimeLeft(missionData.timeLimit || 30000);
    }
  }, [isOpen, missionData]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            handleMissionFail();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleMissionComplete = useCallback((result: MissionResult) => {
    if (socket && roomName && currentMission) {
      socket.emit('completeMission', {
        roomName,
        missionId: currentMission.id,
        result: {
          ...result,
          timeSpent: Date.now() - missionStartTime
        }
      });
    }
    
    onComplete(result);
    onClose();
  }, [socket, roomName, currentMission, missionStartTime, onComplete, onClose]);

  const handleMissionFail = useCallback(() => {
    onComplete({
      success: false,
      timeSpent: Date.now() - missionStartTime
    });
    onClose();
  }, [missionStartTime, onComplete, onClose]);

  const renderMissionComponent = () => {
    if (!currentMission) return null;

    const props = {
      missionData: currentMission,
      onComplete: handleMissionComplete
    };

    switch (currentMission.type) {
      case 'sequence':
        return <SequenceMission {...props} />;
      case 'progress':
        return <ProgressMission {...props} />;
      case 'switch':
        return <SwitchMission {...props} />;
      case 'click':
        return <ClickMission {...props} />;
      case 'swipe':
        return <SwipeMission {...props} />;
      case 'reaction':
        return <ReactionMission {...props} />;
      case 'memory':
        return <MemoryMission {...props} />;
      default:
        return <div>지원하지 않는 미션 타입입니다.</div>;
    }
  };

  if (!isOpen || !currentMission) return null;

  return (
    <div className="mission-modal-overlay">
      <div className="mission-modal">
        <div className="mission-header">
          <h2>{currentMission.name}</h2>
          <div className="mission-info">
            <span className="difficulty">{currentMission.difficulty}</span>
            <span className="time-left">{Math.ceil(timeLeft / 1000)}초 남음</span>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="mission-content">
          <div className="mission-description">
            {currentMission.description}
          </div>
          
          <div className="mission-game">
            {renderMissionComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionModal;
