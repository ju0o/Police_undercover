import React from 'react';
import './ErrorModal.css';

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
  showRetry?: boolean;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  title = "오류 발생",
  message,
  onRetry,
  onClose,
  showRetry = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="error-modal-overlay">
      <div className="error-modal">
        <div className="error-modal-header">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">{title}</h3>
        </div>
        
        <div className="error-modal-body">
          <p className="error-message">{message}</p>
        </div>
        
        <div className="error-modal-footer">
          {showRetry && onRetry && (
            <button 
              className="error-btn error-btn-retry"
              onClick={onRetry}
            >
              다시 시도
            </button>
          )}
          
          {onClose && (
            <button 
              className="error-btn error-btn-close"
              onClick={onClose}
            >
              {showRetry ? '취소' : '확인'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;