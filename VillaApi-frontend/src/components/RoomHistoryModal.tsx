import React, { useState, useEffect } from 'react';
import { roomService, RoomDetails } from '../services';
import { ApiError } from '../services/api';
import './RoomHistoryModal.css';

interface RoomHistoryModalProps {
  roomNo: string;
  roomMovementId: number;
  onClose: () => void;
}

const RoomHistoryModal: React.FC<RoomHistoryModalProps> = ({ roomNo, roomMovementId, onClose }) => {
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoomDetails();
  }, [roomMovementId]);

  const loadRoomDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await roomService.getRoomDetails(roomMovementId);
      if (response.isSuccessfull && response.data) {
        setRoomDetails(response.data);
      } else {
        setError('Nuk mund të ngarkohen detajet e dhomës');
      }
    } catch (error) {
      console.error('Error loading room details:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ngarkimin e detajeve');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content room-history-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Duke ngarkuar historinë e dhomës...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content room-history-modal">
        <div className="modal-header">
          <h2>Historia e {roomNo}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        {roomDetails && (
          <div className="room-history-content">
            <div className="room-info-section">
              <h3>Informacioni i Dhomës</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Dhoma:</label>
                  <span>{roomDetails.roomTitle}</span>
                </div>
                <div className="info-item">
                  <label>Lloji:</label>
                  <span>{roomDetails.roomTypeDescription}</span>
                </div>
                <div className="info-item">
                  <label>Koha e Fillimit:</label>
                  <span>{new Date(roomDetails.startTime).toLocaleString('sq-AL')}</span>
                </div>
                <div className="info-item">
                  <label>Koha e Kaluar:</label>
                  <span>{roomDetails.spendTime}</span>
                </div>
                {roomDetails.clientPlateNo && (
                  <div className="info-item">
                    <label>Tabela:</label>
                    <span>{roomDetails.clientPlateNo}</span>
                  </div>
                )}
                {roomDetails.clientCarName && (
                  <div className="info-item">
                    <label>Vetura:</label>
                    <span>{roomDetails.clientCarName}</span>
                  </div>
                )}
                {roomDetails.clientDocument && (
                  <div className="info-item">
                    <label>Dokumenti:</label>
                    <span>{roomDetails.clientDocument}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pricing-section">
              <h3>Llogaritja e Çmimeve</h3>
              <div className="pricing-grid">
                <div className="pricing-item">
                  <label>Çmimi i Dhomës:</label>
                  <span className="price">€{roomDetails.roomAmount.toFixed(2)}</span>
                </div>
                <div className="pricing-item">
                  <label>Çmimi i Pijeve:</label>
                  <span className="price">€{roomDetails.marketAmount.toFixed(2)}</span>
                </div>
                {roomDetails.gratisAmount > 0 && (
                  <div className="pricing-item">
                    <label>Gratis:</label>
                    <span className="price gratis">-€{roomDetails.gratisAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pricing-item total">
                  <label>Totali:</label>
                  <span className="price total">€{roomDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="debt-section">
              <h3>Statusi i Pagesës</h3>
              <div className="debt-grid">
                <div className="debt-item">
                  <label>Borxhi i Dhomës:</label>
                  <span className={`debt ${roomDetails.roomDebt > 0 ? 'unpaid' : 'paid'}`}>
                    €{roomDetails.roomDebt.toFixed(2)}
                  </span>
                </div>
                <div className="debt-item">
                  <label>Borxhi i Pijeve:</label>
                  <span className={`debt ${roomDetails.marketDebt > 0 ? 'unpaid' : 'paid'}`}>
                    €{roomDetails.marketDebt.toFixed(2)}
                  </span>
                </div>
                <div className="debt-item total">
                  <label>Totali i Borxhit:</label>
                  <span className={`debt total ${(roomDetails.roomDebt + roomDetails.marketDebt) > 0 ? 'unpaid' : 'paid'}`}>
                    €{(roomDetails.roomDebt + roomDetails.marketDebt).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {roomDetails.extras && (
              <div className="extras-section">
                <h3>Shtesa</h3>
                <p>{roomDetails.extras}</p>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="close-button">
            Mbyll
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomHistoryModal;
