import React, { useState, useEffect } from 'react';
import { roomService, roomTypeService, RoomTypeWithPrice } from '../services';
import { ApiError } from '../services/api';
import './AddExtraModal.css';

interface AddExtraModalProps {
  room: {
    id: number;
    name: string;
    title: string;
    roomMovementId?: number;
    roomModel?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const AddExtraModal: React.FC<AddExtraModalProps> = ({ room, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    roomType: '',
    isDebt: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extraOptions, setExtraOptions] = useState<RoomTypeWithPrice[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [selectedExtra, setSelectedExtra] = useState<RoomTypeWithPrice | null>(null);

  // Fetch extra options from API
  useEffect(() => {
    const fetchExtras = async () => {
      if (!room.roomModel) {
        setError('Room model nuk është i disponueshëm');
        setLoadingExtras(false);
        return;
      }

      try {
        setLoadingExtras(true);
        const response = await roomTypeService.getExtraRoomTypes(room.roomModel);
        
        if (response.isSuccessfull && response.data) {
          setExtraOptions(response.data);
          
          // Auto-select the first option if available
          if (response.data.length > 0) {
            const firstOption = response.data[0];
            setFormData(prev => ({ ...prev, roomType: firstOption.code }));
            setSelectedExtra(firstOption);
          }
        } else {
          setError('Nuk u gjetën opcione extra');
        }
      } catch (err) {
        console.error('❌ Error fetching extra options:', err);
        setError('Gabim në ngarkimin e opcioneve extra');
      } finally {
        setLoadingExtras(false);
      }
    };

    fetchExtras();
  }, [room.roomModel]);

  // Handle extra option selection
  const handleExtraSelection = (extra: RoomTypeWithPrice) => {
    setSelectedExtra(extra);
    setFormData(prev => ({ ...prev, roomType: extra.code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room.roomMovementId) {
      setError('Room movement ID nuk është i disponueshëm');
      return;
    }

    if (!selectedExtra) {
      setError('Ju lutem zgjidhni një opsion extra');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const extraData = {
        roomMovementId: room.roomMovementId,
        roomType: selectedExtra.code,
        isDebt: formData.isDebt,
        hours: selectedExtra.hours,
        price: selectedExtra.price
      };

      console.log('🔄 Adding extra to room:', {
        roomNo: room.name,
        roomMovementId: room.roomMovementId,
        extraData,
        selectedExtra
      });

      const response = await roomService.addExtraInRoom(extraData);

      if (response.isSuccessfull) {
        console.log('✅ Extra added successfully to room:', room.name);
        onSuccess();
        // Don't call onClose() here - let the parent handle it
      } else {
        throw new Error(response.errorMessage || 'Gabim në shtimin e extra');
      }
    } catch (error) {
      console.error('❌ Error adding extra:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në shtimin e extra');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loadingExtras) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content add-extra-modal">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Duke ngarkuar opcionet extra...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content add-extra-modal">
        <div className="modal-header">
          <h2>Shto Extra për Dhomën {room.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-extra-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {extraOptions.length === 0 ? (
            <div className="no-options-message">
              Nuk ka opcione extra të disponueshme për këtë dhomë
            </div>
          ) : (
            <>
              <div className="extra-options-label">
                <h3>Zgjidhni opsionin e dëshiruar:</h3>
              </div>
              
              <div className="extra-options-grid">
                {extraOptions.map((extra) => (
                  <div
                    key={extra.code}
                    className={`extra-option-card ${selectedExtra?.code === extra.code ? 'selected' : ''}`}
                    onClick={() => handleExtraSelection(extra)}
                  >
                    <div className="extra-option-header">
                      <h4>{extra.description}</h4>
                    </div>
                    <div className="extra-option-details">
                      <div className="detail-item">
                        <span className="detail-label">Orët:</span>
                        <span className="detail-value">{extra.hours}h</span>
                      </div>
                      <div className="detail-item price-detail">
                        <span className="detail-label">Çmimi:</span>
                        <span className="detail-value">€{extra.price.toFixed(2)}</span>
                      </div>
                    </div>
                    {selectedExtra?.code === extra.code && (
                      <div className="selected-indicator">✓</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isDebt}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isDebt: e.target.checked 
                    }))}
                  />
                  <span className="checkmark"></span>
                  Shëno si borxh
                </label>
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Anulo
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !selectedExtra || extraOptions.length === 0}
            >
              {loading ? 'Duke shtuar...' : 'Shto Extra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExtraModal;
