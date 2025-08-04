import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  isConnecting?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "로딩 중...", 
  progress, 
  isConnecting = false 
}) => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        
        <div className="loading-content">
          <h2 className="loading-title">Police Undercover</h2>
          <p className="loading-message">{message}</p>
          
          {isConnecting && (
            <div className="connection-status">
              <span className="connection-dot"></span>
              서버에 연결 중...
            </div>
          )}
          
          {progress !== undefined && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
              <span className="progress-text">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;