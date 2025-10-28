import React, { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import './ChangeRoomModal.css';

interface Room {
  roomNo: string;
  title: string;
  roomModel: string;
  isActive: boolean;
}

interface ChangeRoomModalProps {
  roomMovementId: number;
  currentRoomNo: string;
  roomModel: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangeRoomModal: React.FC<ChangeRoomModalProps> = ({
  roomMovementId,
  currentRoomNo,
  roomModel,
  onClose,
  onSuccess
}) => {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomNo, setSelectedRoomNo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAvailableRooms();
  }, [roomModel]);

  const loadAvailableRooms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await roomService.getAvailableRooms(roomModel);
      
      if (response.isSuccessfull && response.data) {
        // Filter out current room from available rooms
        const filteredRooms = response.data.filter(room => room.roomNo !== currentRoomNo);
        setAvailableRooms(filteredRooms);
        
        if (filteredRooms.length > 0) {
          setSelectedRoomNo(filteredRooms[0].roomNo);
        }
      } else {
        throw new Error('Failed to load available rooms');
      }
    } catch (error) {
      console.error('Error loading available rooms:', error);
      setError('Gabim në ngarkimin e dhomave të disponueshme');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomNo) {
      setError('Ju lutemi zgjidhni një dhomë');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await roomService.changeRoom(roomMovementId, selectedRoomNo);
      
      if (response.isSuccessfull) {
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to change room');
      }
    } catch (error) {
      console.error('Error changing room:', error);
      setError('Gabim në ndryshimin e dhomës');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content change-room-modal">
        <div className="modal-header">
          <h2>Ndrysho Dhomën</h2>
          <button className="close-button" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="current-room-info">
            <h3>Dhoma Aktuale: {currentRoomNo}</h3>
            <p>Modeli: {roomModel}</p>
          </div>

          <div className="form-group">
            <label htmlFor="newRoom">Zgjidhni Dhomën e Re:</label>
            <select
              id="newRoom"
              value={selectedRoomNo}
              onChange={(e) => setSelectedRoomNo(e.target.value)}
              className="form-select"
              disabled={loading}
            >
              <option value="">Zgjidhni dhomën e re</option>
              {availableRooms.map((room) => (
                <option key={room.roomNo} value={room.roomNo}>
                  {room.title} ({room.roomNo})
                </option>
              ))}
            </select>
          </div>

          {availableRooms.length === 0 && !loading && (
            <div className="no-rooms-message">
              <p>Nuk ka dhoma të disponueshme për këtë model.</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              disabled={loading}
            >
              Anulo
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading || !selectedRoomNo || availableRooms.length === 0}
            >
              {loading ? 'Duke Ndryshuar...' : 'Ndrysho Dhomën'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeRoomModal;
