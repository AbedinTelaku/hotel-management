import React, { useState } from 'react';
import './RoomPriceManagement.css';

interface RoomPrice {
  id: string;
  bookingType: 'pushim' | '24h' | 'fjetje' | 'tjeter';
  name: string;
  price: number;
  description: string;
}

const RoomPriceManagement: React.FC = () => {
  const [roomPrices, setRoomPrices] = useState<RoomPrice[]>([
    {
      id: 'pushim',
      bookingType: 'pushim',
      name: 'Pushim',
      price: 0,
      description: 'Çmimi për pushim (pa pagesë)'
    },
    {
      id: '24h',
      bookingType: '24h',
      name: '24 Orë',
      price: 0,
      description: 'Çmimi për 24 orë'
    },
    {
      id: 'fjetje',
      bookingType: 'fjetje',
      name: 'Fjetje',
      price: 20,
      description: 'Çmimi për fjetje (në orë)'
    },
    {
      id: 'tjeter',
      bookingType: 'tjeter',
      name: 'Tjetër',
      price: 0,
      description: 'Çmimi për lloje të tjera rezervimesh'
    }
  ]);

  const [editingPrice, setEditingPrice] = useState<RoomPrice | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEditPrice = (price: RoomPrice) => {
    setEditingPrice(price);
  };

  const handleSavePrice = (priceData: Omit<RoomPrice, 'id'>) => {
    if (editingPrice) {
      setRoomPrices(prev => 
        prev.map(price => 
          price.id === editingPrice.id 
            ? { ...price, ...priceData }
            : price
        )
      );
      setEditingPrice(null);
    }
  };

  const handleAddPrice = (priceData: Omit<RoomPrice, 'id'>) => {
    const newPrice: RoomPrice = {
      ...priceData,
      id: Date.now().toString()
    };
    setRoomPrices(prev => [...prev, newPrice]);
    setShowAddModal(false);
  };

  const handleDeletePrice = (priceId: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë çmim?')) {
      setRoomPrices(prev => prev.filter(price => price.id !== priceId));
    }
  };

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case 'pushim': return 'Pushim';
      case '24h': return '24 Orë';
      case 'fjetje': return 'Fjetje';
      case 'tjeter': return 'Tjetër';
      default: return type;
    }
  };

  return (
    <div className="room-price-management">
      <div className="price-header">
        <h2>Menaxhimi i Çmimeve të Dhomave</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="add-price-btn"
        >
          + Shto Çmim të Ri
        </button>
      </div>

      <div className="prices-grid">
        {roomPrices.map(price => (
          <div key={price.id} className="price-card">
            <div className="price-info">
              <h3>{price.name}</h3>
              <p className="price-description">{price.description}</p>
              <div className="price-amount">
                <span className="price-label">Çmimi:</span>
                <span className="price-value">
                  {price.price > 0 ? `€${price.price}` : 'Pa pagesë'}
                </span>
              </div>
            </div>
            <div className="price-actions">
              <button 
                onClick={() => handleEditPrice(price)}
                className="edit-btn"
                title="Ndrysho"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDeletePrice(price.id)}
                className="delete-btn"
                title="Fshi"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingPrice && (
        <PriceModal
          price={editingPrice}
          onSave={handleSavePrice}
          onClose={() => setEditingPrice(null)}
        />
      )}

      {showAddModal && (
        <PriceModal
          onSave={handleAddPrice}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

interface PriceModalProps {
  price?: RoomPrice;
  onSave: (priceData: Omit<RoomPrice, 'id'>) => void;
  onClose: () => void;
}

const PriceModal: React.FC<PriceModalProps> = ({ price, onSave, onClose }) => {
  const [name, setName] = useState(price?.name || '');
  const [bookingType, setBookingType] = useState<'pushim' | '24h' | 'fjetje' | 'tjeter'>(
    price?.bookingType || 'pushim'
  );
  const [priceValue, setPriceValue] = useState(price?.price?.toString() || '');
  const [description, setDescription] = useState(price?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Emri është i detyrueshëm');
      return;
    }

    if (!description.trim()) {
      setError('Përshkrimi është i detyrueshëm');
      return;
    }

    const priceNum = parseFloat(priceValue);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Çmimi duhet të jetë një numër pozitiv');
      return;
    }

    onSave({
      name: name.trim(),
      bookingType,
      price: priceNum,
      description: description.trim()
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
          <h2>{price ? 'Ndrysho Çmimin' : 'Shto Çmim të Ri'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Emri:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shkruani emrin e çmimit"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bookingType">Lloji i Rezervimit:</label>
            <select
              id="bookingType"
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value as any)}
              className="form-select"
            >
              <option value="pushim">Pushim</option>
              <option value="24h">24 Orë</option>
              <option value="fjetje">Fjetje</option>
              <option value="tjeter">Tjetër</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Çmimi (€):</label>
            <input
              type="number"
              id="price"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              placeholder="Shkruani çmimin (0 për pa pagesë)"
              className="form-input"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Përshkrimi:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shkruani përshkrimin e çmimit"
              className="form-textarea"
              rows={3}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {price ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomPriceManagement;
