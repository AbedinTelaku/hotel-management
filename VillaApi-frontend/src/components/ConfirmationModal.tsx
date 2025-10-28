import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmText = 'Po',
  cancelText = 'Jo',
  onConfirm,
  onCancel,
  isLoading = false,
  isDestructive = false
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content confirmation-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          {!isLoading && (
            <button className="close-button" onClick={onCancel}>
              ×
            </button>
          )}
        </div>

        <div className="confirmation-content">
          <div className="confirmation-icon">
            {isDestructive ? '⚠️' : '❓'}
          </div>
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            className="cancel-button"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className={`confirm-button ${isDestructive ? 'destructive' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Duke Përpunuar...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
