import React, { useState } from 'react';
import './SuggestionCarNameManagement.css';

interface CarSuggestion {
  id: string;
  carName: string;
  carModel: string;
  carColor: string;
  licensePlate: string;
  isActive: boolean;
  usageCount: number;
  lastUsed: string;
  createdAt: string;
}

const SuggestionCarNameManagement: React.FC = () => {
  const [carSuggestions, setCarSuggestions] = useState<CarSuggestion[]>([
    {
      id: '1',
      carName: 'BMW X5',
      carModel: 'X5',
      carColor: 'E Bardhë',
      licensePlate: 'PZ 123 AB',
      isActive: true,
      usageCount: 15,
      lastUsed: '2024-01-15',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      carName: 'Mercedes C-Class',
      carModel: 'C200',
      carColor: 'E Zezë',
      licensePlate: 'PR 456 CD',
      isActive: true,
      usageCount: 8,
      lastUsed: '2024-01-14',
      createdAt: '2024-01-02'
    },
    {
      id: '3',
      carName: 'Audi A4',
      carModel: 'A4',
      carColor: 'E Gri',
      licensePlate: 'GJ 789 EF',
      isActive: true,
      usageCount: 12,
      lastUsed: '2024-01-13',
      createdAt: '2024-01-03'
    },
    {
      id: '4',
      carName: 'Toyota Corolla',
      carModel: 'Corolla',
      carColor: 'E Kuqe',
      licensePlate: 'TR 321 GH',
      isActive: false,
      usageCount: 3,
      lastUsed: '2024-01-10',
      createdAt: '2024-01-05'
    },
    {
      id: '5',
      carName: 'Volkswagen Golf',
      carModel: 'Golf 7',
      carColor: 'E Blu',
      licensePlate: 'SH 654 IJ',
      isActive: true,
      usageCount: 20,
      lastUsed: '2024-01-16',
      createdAt: '2024-01-08'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<CarSuggestion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'carName' | 'usageCount' | 'lastUsed' | 'createdAt'>('carName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredSuggestions = carSuggestions.filter(suggestion => {
    const matchesSearch = suggestion.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.carModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.carColor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'active') matchesFilter = suggestion.isActive;
    else if (filterStatus === 'inactive') matchesFilter = !suggestion.isActive;
    
    return matchesSearch && matchesFilter;
  });

  const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'carName':
        aValue = a.carName.toLowerCase();
        bValue = b.carName.toLowerCase();
        break;
      case 'usageCount':
        aValue = a.usageCount;
        bValue = b.usageCount;
        break;
      case 'lastUsed':
        aValue = new Date(a.lastUsed);
        bValue = new Date(b.lastUsed);
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleAddSuggestion = (suggestionData: Omit<CarSuggestion, 'id' | 'usageCount' | 'lastUsed' | 'createdAt'>) => {
    const newSuggestion: CarSuggestion = {
      ...suggestionData,
      id: Date.now().toString(),
      usageCount: 0,
      lastUsed: '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCarSuggestions(prev => [...prev, newSuggestion]);
    setShowAddModal(false);
  };

  const handleEditSuggestion = (suggestionData: Omit<CarSuggestion, 'id' | 'usageCount' | 'lastUsed' | 'createdAt'>) => {
    if (editingSuggestion) {
      setCarSuggestions(prev =>
        prev.map(suggestion =>
          suggestion.id === editingSuggestion.id
            ? { ...suggestion, ...suggestionData }
            : suggestion
        )
      );
      setEditingSuggestion(null);
    }
  };

  const handleDeleteSuggestion = (id: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë sugjerim?')) {
      setCarSuggestions(prev => prev.filter(suggestion => suggestion.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setCarSuggestions(prev =>
      prev.map(suggestion =>
        suggestion.id === id
          ? { ...suggestion, isActive: !suggestion.isActive }
          : suggestion
      )
    );
  };

  const handleUseSuggestion = (id: string) => {
    setCarSuggestions(prev =>
      prev.map(suggestion =>
        suggestion.id === id
          ? { 
              ...suggestion, 
              usageCount: suggestion.usageCount + 1,
              lastUsed: new Date().toISOString().split('T')[0]
            }
          : suggestion
      )
    );
  };

  const handleEdit = (suggestion: CarSuggestion) => {
    setEditingSuggestion(suggestion);
  };

  const totalSuggestions = carSuggestions.length;
  const activeSuggestions = carSuggestions.filter(s => s.isActive).length;
  const totalUsage = carSuggestions.reduce((sum, s) => sum + s.usageCount, 0);
  const mostUsed = carSuggestions.reduce((max, s) => s.usageCount > max.usageCount ? s : max, carSuggestions[0]);

  return (
    <div className="car-suggestion-management">
      <div className="car-suggestion-header">
        <h2>Menaxhimi i Sugjerimeve të Makinave</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="add-suggestion-btn"
        >
          + Shto Sugjerim të Ri
        </button>
      </div>

      <div className="car-suggestion-stats">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <span className="stat-number">{totalSuggestions}</span>
            <span className="stat-label">Sugjerime Totale</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-number">{activeSuggestions}</span>
            <span className="stat-label">Sugjerime Aktive</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-number">{totalUsage}</span>
            <span className="stat-label">Përdorime Totale</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <span className="stat-number">{mostUsed?.usageCount || 0}</span>
            <span className="stat-label">Më e Përdorura</span>
          </div>
        </div>
      </div>

      <div className="car-suggestion-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Kërko:</label>
            <input
              type="text"
              id="search"
              placeholder="Emër, model, ngjyrë, targë..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Statusi:</label>
            <select 
              id="status-filter"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">Të Gjitha</option>
              <option value="active">Aktive</option>
              <option value="inactive">Joaktive</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Rendit sipas:</label>
            <select 
              id="sort-by"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="carName">Emri i Makinës</option>
              <option value="usageCount">Numri i Përdorimeve</option>
              <option value="lastUsed">Përdorimi i Fundit</option>
              <option value="createdAt">Data e Krijimit</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-order">Renditja:</label>
            <select 
              id="sort-order"
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="filter-select"
            >
              <option value="asc">Ngjitëse</option>
              <option value="desc">Zbritëse</option>
            </select>
          </div>
        </div>
      </div>

      <div className="car-suggestions-grid">
        {sortedSuggestions.map(suggestion => (
          <div key={suggestion.id} className={`car-suggestion-card ${!suggestion.isActive ? 'inactive' : ''}`}>
            <div className="suggestion-header">
              <div className="suggestion-info">
                <h3 className="car-name">{suggestion.carName}</h3>
                <span className="car-model">{suggestion.carModel}</span>
              </div>
              <div className="suggestion-status">
                <span className={`status-badge ${suggestion.isActive ? 'active' : 'inactive'}`}>
                  {suggestion.isActive ? '✅ Aktiv' : '❌ Joaktiv'}
                </span>
              </div>
            </div>

            <div className="suggestion-details">
              <div className="detail-row">
                <span className="detail-label">Ngjyra:</span>
                <span className="detail-value">{suggestion.carColor}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Targa:</span>
                <span className="detail-value license-plate">{suggestion.licensePlate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Përdorime:</span>
                <span className="detail-value usage-count">{suggestion.usageCount}</span>
              </div>
              {suggestion.lastUsed && (
                <div className="detail-row">
                  <span className="detail-label">Përdorimi i Fundit:</span>
                  <span className="detail-value">{new Date(suggestion.lastUsed).toLocaleDateString('sq-AL')}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Krijuar:</span>
                <span className="detail-value">{new Date(suggestion.createdAt).toLocaleDateString('sq-AL')}</span>
              </div>
            </div>

            <div className="suggestion-actions">
              <button 
                onClick={() => handleUseSuggestion(suggestion.id)}
                className="use-btn"
                title="Përdor Sugjerimin"
                disabled={!suggestion.isActive}
              >
                🚗 Përdor
              </button>
              <button 
                onClick={() => handleToggleActive(suggestion.id)}
                className={`toggle-btn ${suggestion.isActive ? 'deactivate' : 'activate'}`}
                title={suggestion.isActive ? 'Deaktivizo' : 'Aktivizo'}
              >
                {suggestion.isActive ? '⏸️' : '▶️'}
              </button>
              <button 
                onClick={() => handleEdit(suggestion)}
                className="edit-btn"
                title="Ndrysho"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDeleteSuggestion(suggestion.id)}
                className="delete-btn"
                title="Fshi"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedSuggestions.length === 0 && (
        <div className="no-results">
          <p>Nuk u gjetën sugjerime për këto kritere.</p>
        </div>
      )}

      {showAddModal && (
        <CarSuggestionModal
          onSave={handleAddSuggestion}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingSuggestion && (
        <CarSuggestionModal
          suggestion={editingSuggestion}
          onSave={handleEditSuggestion}
          onClose={() => setEditingSuggestion(null)}
        />
      )}
    </div>
  );
};

interface CarSuggestionModalProps {
  suggestion?: CarSuggestion;
  onSave: (suggestionData: Omit<CarSuggestion, 'id' | 'usageCount' | 'lastUsed' | 'createdAt'>) => void;
  onClose: () => void;
}

const CarSuggestionModal: React.FC<CarSuggestionModalProps> = ({ suggestion, onSave, onClose }) => {
  const [carName, setCarName] = useState(suggestion?.carName || '');
  const [carModel, setCarModel] = useState(suggestion?.carModel || '');
  const [carColor, setCarColor] = useState(suggestion?.carColor || '');
  const [licensePlate, setLicensePlate] = useState(suggestion?.licensePlate || '');
  const [isActive, setIsActive] = useState(suggestion?.isActive ?? true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!carName.trim()) {
      setError('Emri i makinës është i detyrueshëm');
      return;
    }

    if (!carModel.trim()) {
      setError('Modeli i makinës është i detyrueshëm');
      return;
    }

    if (!carColor.trim()) {
      setError('Ngjyra e makinës është e detyrueshme');
      return;
    }

    if (!licensePlate.trim()) {
      setError('Targa e makinës është e detyrueshme');
      return;
    }

    onSave({
      carName: carName.trim(),
      carModel: carModel.trim(),
      carColor: carColor.trim(),
      licensePlate: licensePlate.trim().toUpperCase(),
      isActive
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
          <h2>{suggestion ? 'Ndrysho Sugjerimin' : 'Shto Sugjerim të Ri'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="carName">Emri i Makinës:</label>
            <input
              type="text"
              id="carName"
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              placeholder="Shkruani emrin e makinës"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="carModel">Modeli:</label>
            <input
              type="text"
              id="carModel"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              placeholder="Shkruani modelin e makinës"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="carColor">Ngjyra:</label>
            <select
              id="carColor"
              value={carColor}
              onChange={(e) => setCarColor(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Zgjidhni ngjyrën</option>
              <option value="E Bardhë">E Bardhë</option>
              <option value="E Zezë">E Zezë</option>
              <option value="E Gri">E Gri</option>
              <option value="E Kuqe">E Kuqe</option>
              <option value="E Blu">E Blu</option>
              <option value="E Gjelbër">E Gjelbër</option>
              <option value="E Verdhë">E Verdhë</option>
              <option value="E Kafe">E Kafe</option>
              <option value="E Argjendtë">E Argjendtë</option>
              <option value="E Artë">E Artë</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="licensePlate">Targa:</label>
            <input
              type="text"
              id="licensePlate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="Shkruani targën e makinës"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">Sugjerimi Aktiv</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {suggestion ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionCarNameManagement;
