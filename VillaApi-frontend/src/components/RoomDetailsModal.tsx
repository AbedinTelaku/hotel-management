import React, { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import './RoomDetailsModal.css';

interface RoomDetails {
  roomMovementId: number;
  roomNo: string;
  roomTitle: string;
  clientPlateNo?: string;
  clientDocument?: string;
  clientCarName?: string;
  roomTypeDescription: string;
  startTime: string;
  spendTime: string;
  extras: string;
  roomDebt: number;
  marketDebt: number;
  gratisAmount: number;
  roomAmount: number;
  marketAmount: number;
  total: number;
}

interface RoomDetailsModalProps {
  roomMovementId: number;
  onClose: () => void;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  roomMovementId,
  onClose
}) => {
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
        throw new Error('Failed to load room details');
      }
    } catch (error) {
      console.error('Error loading room details:', error);
      setError('Gabim në ngarkimin e detajeve të dhomës');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '-';

    const tryParse = (val: string) => {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // Try as-is
    let date = tryParse(dateTimeString);

    // Try replacing space with 'T' (e.g. "2025-10-20 12:34:56")
    if (!date && dateTimeString.includes(' ')) {
      date = tryParse(dateTimeString.replace(' ', 'T'));
    }

    // Try appending 'Z' to treat as UTC
    if (!date && !dateTimeString.endsWith('Z')) {
      date = tryParse(dateTimeString + 'Z');
    }

    if (!date) {
      // Fallback: return original string if unparseable
      return dateTimeString;
    }

    return date.toLocaleString('sq-AL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content room-details-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Duke ngarkuar detajet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content room-details-modal">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="retry-button" onClick={loadRoomDetails}>
              Provo Përsëri
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content room-details-modal">
          <div className="error-container">
            <div className="error-icon">❌</div>
            <p>Nuk u gjetën detaje për këtë dhomë</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content room-details-modal">
        <div className="modal-header">
          <h2>Detajet e Dhomës {roomDetails.roomNo}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="room-details-content">
          <div className="details-section">
            <h3>Informacioni i Dhomës</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Dhoma:</span>
                <span className="detail-value">{roomDetails.roomTitle}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Lloji:</span>
                <span className="detail-value">{roomDetails.roomTypeDescription}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Koha e Fillimit:</span>
                <span className="detail-value">{formatDateTime(roomDetails.startTime)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Koha e Kaluar:</span>
                <span className="detail-value">{roomDetails.spendTime}</span>
              </div>
              {roomDetails.extras && (
                <div className="detail-item">
                  <span className="detail-label">Shtesa:</span>
                  <span className="detail-value">{roomDetails.extras}</span>
                </div>
              )}
            </div>
          </div>

          <div className="details-section">
            <h3>Informacioni i Klientit</h3>
            <div className="details-grid">
              {roomDetails.clientPlateNo && (
                <div className="detail-item">
                  <span className="detail-label">Tabela:</span>
                  <span className="detail-value">{roomDetails.clientPlateNo}</span>
                </div>
              )}
              {roomDetails.clientDocument && (
                <div className="detail-item">
                  <span className="detail-label">Dokumenti:</span>
                  <span className="detail-value">{roomDetails.clientDocument}</span>
                </div>
              )}
              {roomDetails.clientCarName && (
                <div className="detail-item">
                  <span className="detail-label">Vetura:</span>
                  <span className="detail-value">{roomDetails.clientCarName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="details-section">
            <h3>Llogaritja Financiare</h3>
            <div className="financial-grid">
              <div className="financial-item">
                <span className="financial-label">Shuma e Dhomës:</span>
                <span className="financial-value">{formatCurrency(roomDetails.roomAmount)}</span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Shuma e Tregut:</span>
                <span className="financial-value">{formatCurrency(roomDetails.marketAmount)}</span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Shuma Gratis:</span>
                <span className="financial-value gratis">{formatCurrency(roomDetails.gratisAmount)}</span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Borxhi i Dhomës:</span>
                <span className={`financial-value ${roomDetails.roomDebt > 0 ? 'debt' : 'paid'}`}>
                  {formatCurrency(roomDetails.roomDebt)}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Borxhi i Tregut:</span>
                <span className={`financial-value ${roomDetails.marketDebt > 0 ? 'debt' : 'paid'}`}>
                  {formatCurrency(roomDetails.marketDebt)}
                </span>
              </div>
              <div className="financial-item total">
                <span className="financial-label">Totali:</span>
                <span className="financial-value total">{formatCurrency(roomDetails.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Close action removed; use header X button */}
      </div>
    </div>
  );
};

export default RoomDetailsModal;
