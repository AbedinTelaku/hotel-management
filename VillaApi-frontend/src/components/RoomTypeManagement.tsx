import React, { useState } from 'react';
import './RoomTypeManagement.css';

interface RoomType {
  code: string;
  description: string;
  hours: number;
  isCustom: boolean;
  isExtra: boolean;
  orderNo: number;
}

const RoomTypeManagement: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { code: 'PUSH', description: 'Pushim', hours: 0, isCustom: false, isExtra: false, orderNo: 1 },
    { code: '24H', description: '24 Orë', hours: 24, isCustom: false, isExtra: false, orderNo: 2 },
    { code: 'FJET', description: 'Fjetje', hours: 12, isCustom: false, isExtra: false, orderNo: 3 },
    { code: 'TJET', description: 'Tjetër', hours: 0, isCustom: true, isExtra: false, orderNo: 4 },
    { code: 'EXT1', description: 'Extra 1 Orë', hours: 1, isCustom: false, isExtra: true, orderNo: 5 },
    { code: 'EXT2', description: 'Extra 2 Orë', hours: 2, isCustom: false, isExtra: true, orderNo: 6 }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'basic' | 'extra' | 'custom'>('all');

  const filteredTypes = roomTypes.filter(type => {
    const matchesSearch = type.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'basic') matchesFilter = !type.isExtra && !type.isCustom;
    else if (filterType === 'extra') matchesFilter = type.isExtra;
    else if (filterType === 'custom') matchesFilter = type.isCustom;
    
    return matchesSearch && matchesFilter;
  });

  const handleAddType = (typeData: Omit<RoomType, 'code' | 'orderNo'>) => {
    const newType: RoomType = {
      ...typeData,
      code: typeData.description.toUpperCase().substring(0, 5).replace(/\s+/g, ''),
      orderNo: Math.max(...roomTypes.map(t => t.orderNo)) + 1
    };
    setRoomTypes(prev => [...prev, newType]);
    setShowAddModal(false);
  };

  const handleEditType = (typeData: Omit<RoomType, 'code' | 'orderNo'>) => {
    if (editingType) {
      setRoomTypes(prev =>
        prev.map(type =>
          type.code === editingType.code
            ? { ...type, ...typeData }
            : type
        )
      );
      setEditingType(null);
    }
  };

  const handleDeleteType = (code: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë lloj dhome?')) {
      setRoomTypes(prev => prev.filter(type => type.code !== code));
    }
  };

  const handleEdit = (type: RoomType) => {
    setEditingType(type);
  };

  const getTypeBadge = (type: RoomType) => {
    if (type.isExtra) return { text: 'Extra', class: 'badge-extra' };
    if (type.isCustom) return { text: 'Custom', class: 'badge-custom' };
    return { text: 'Basic', class: 'badge-basic' };
  };

  return (
    <div className="room-type-management">
      <div className="room-type-header">
        <h2>Menaxhimi i Llojeve të Dhomave</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="add-type-btn"
        >
          + Shto Lloj të Ri
        </button>
      </div>

      <div className="room-type-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Të Gjitha
          </button>
          <button 
            className={`filter-tab ${filterType === 'basic' ? 'active' : ''}`}
            onClick={() => setFilterType('basic')}
          >
            Basic
          </button>
          <button 
            className={`filter-tab ${filterType === 'extra' ? 'active' : ''}`}
            onClick={() => setFilterType('extra')}
          >
            Extra
          </button>
          <button 
            className={`filter-tab ${filterType === 'custom' ? 'active' : ''}`}
            onClick={() => setFilterType('custom')}
          >
            Custom
          </button>
        </div>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Kërko lloj dhome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="room-types-grid">
        {filteredTypes.map(type => {
          const badge = getTypeBadge(type);
          return (
            <div key={type.code} className="room-type-card">
              <div className="type-info">
                <div className="type-header">
                  <h3 className="type-code">{type.code}</h3>
                  <span className={`type-badge ${badge.class}`}>
                    {badge.text}
                  </span>
                </div>
                <p className="type-description">{type.description}</p>
                <div className="type-details">
                  <div className="detail-item">
                    <span className="detail-label">Orët:</span>
                    <span className="detail-value">{type.hours}h</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Renditja:</span>
                    <span className="detail-value">#{type.orderNo}</span>
                  </div>
                </div>
              </div>
              <div className="type-actions">
                <button 
                  onClick={() => handleEdit(type)}
                  className="edit-btn"
                  title="Ndrysho"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteType(type.code)}
                  className="delete-btn"
                  title="Fshi"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <RoomTypeModal
          onSave={handleAddType}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingType && (
        <RoomTypeModal
          type={editingType}
          onSave={handleEditType}
          onClose={() => setEditingType(null)}
        />
      )}
    </div>
  );
};

interface RoomTypeModalProps {
  type?: RoomType;
  onSave: (typeData: Omit<RoomType, 'code' | 'orderNo'>) => void;
  onClose: () => void;
}

const RoomTypeModal: React.FC<RoomTypeModalProps> = ({ type, onSave, onClose }) => {
  const [description, setDescription] = useState(type?.description || '');
  const [hours, setHours] = useState(type?.hours?.toString() || '0');
  const [isCustom, setIsCustom] = useState(type?.isCustom || false);
  const [isExtra, setIsExtra] = useState(type?.isExtra || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Përshkrimi është i detyrueshëm');
      return;
    }

    if (description.length < 2) {
      setError('Përshkrimi duhet të ketë të paktën 2 karaktere');
      return;
    }

    const hoursNum = parseInt(hours);
    if (isNaN(hoursNum) || hoursNum < 0) {
      setError('Orët duhet të jenë një numër pozitiv');
      return;
    }

    if (isCustom && isExtra) {
      setError('Një lloj dhome nuk mund të jetë edhe custom edhe extra');
      return;
    }

    onSave({
      description: description.trim(),
      hours: hoursNum,
      isCustom,
      isExtra
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{type ? 'Ndrysho Llojin e Dhomës' : 'Shto Lloj të Ri'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="description">Përshkrimi:</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shkruani përshkrimin"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hours">Orët:</label>
            <input
              type="number"
              id="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Numri i orëve"
              className="form-input"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isCustom}
                onChange={(e) => {
                  setIsCustom(e.target.checked);
                  if (e.target.checked) setIsExtra(false);
                }}
                className="checkbox-input"
              />
              <span className="checkbox-text">Lloj Custom</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isExtra}
                onChange={(e) => {
                  setIsExtra(e.target.checked);
                  if (e.target.checked) setIsCustom(false);
                }}
                className="checkbox-input"
              />
              <span className="checkbox-text">Lloj Extra</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {type ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomTypeManagement;
