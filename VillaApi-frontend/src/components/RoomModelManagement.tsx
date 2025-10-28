import React, { useState } from 'react';
import './RoomModelManagement.css';

interface RoomModel {
  code: string;
  description: string;
}

const RoomModelManagement: React.FC = () => {
  const [roomModels, setRoomModels] = useState<RoomModel[]>([
    { code: 'STANDARD', description: 'Dhomë Standarde' },
    { code: 'DELUXE', description: 'Dhomë Deluxe' },
    { code: 'SUITE', description: 'Suitë' },
    { code: 'FAMILY', description: 'Dhomë Familjare' },
    { code: 'ECONOMY', description: 'Dhomë Ekonomike' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModel, setEditingModel] = useState<RoomModel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModels = roomModels.filter(model =>
    model.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddModel = (modelData: Omit<RoomModel, 'code'>) => {
    const newModel: RoomModel = {
      ...modelData,
      code: modelData.description.toUpperCase().replace(/\s+/g, '_')
    };
    setRoomModels(prev => [...prev, newModel]);
    setShowAddModal(false);
  };

  const handleEditModel = (modelData: Omit<RoomModel, 'code'>) => {
    if (editingModel) {
      setRoomModels(prev =>
        prev.map(model =>
          model.code === editingModel.code
            ? { ...model, description: modelData.description }
            : model
        )
      );
      setEditingModel(null);
    }
  };

  const handleDeleteModel = (code: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë model dhome?')) {
      setRoomModels(prev => prev.filter(model => model.code !== code));
    }
  };

  const handleEdit = (model: RoomModel) => {
    setEditingModel(model);
  };

  return (
    <div className="room-model-management">
      <div className="room-model-header">
        <h2>Menaxhimi i Modeleve të Dhomave</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="add-model-btn"
        >
          + Shto Model të Ri
        </button>
      </div>

      <div className="room-model-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Kërko model dhome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="room-models-grid">
        {filteredModels.map(model => (
          <div key={model.code} className="room-model-card">
            <div className="model-info">
              <h3 className="model-code">{model.code}</h3>
              <p className="model-description">{model.description}</p>
            </div>
            <div className="model-actions">
              <button 
                onClick={() => handleEdit(model)}
                className="edit-btn"
                title="Ndrysho"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDeleteModel(model.code)}
                className="delete-btn"
                title="Fshi"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <RoomModelModal
          onSave={handleAddModel}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingModel && (
        <RoomModelModal
          model={editingModel}
          onSave={handleEditModel}
          onClose={() => setEditingModel(null)}
        />
      )}
    </div>
  );
};

interface RoomModelModalProps {
  model?: RoomModel;
  onSave: (modelData: Omit<RoomModel, 'code'>) => void;
  onClose: () => void;
}

const RoomModelModal: React.FC<RoomModelModalProps> = ({ model, onSave, onClose }) => {
  const [description, setDescription] = useState(model?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Përshkrimi i modelit është i detyrueshëm');
      return;
    }

    if (description.length < 3) {
      setError('Përshkrimi duhet të ketë të paktën 3 karaktere');
      return;
    }

    onSave({
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
          <h2>{model ? 'Ndrysho Modelin e Dhomës' : 'Shto Model të Ri'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="description">Përshkrimi i Modelit:</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shkruani përshkrimin e modelit"
              className="form-input"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {model ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModelManagement;
