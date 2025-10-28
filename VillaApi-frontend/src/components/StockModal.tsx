import React, { useState, useEffect } from 'react';
import { supplyAndSellService, StockItem } from '../services';
import { ApiError } from '../services/api';
import './StockModal.css';

interface StockModalProps {
  onClose: () => void;
}

const StockModal: React.FC<StockModalProps> = ({ onClose }) => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await supplyAndSellService.getStock();
      
      if (response.isSuccessfull && response.data) {
        setStockItems(response.data);
        console.log('✅ Stock loaded:', response.data);
      } else {
        setError(response.errorMessage || 'Gabim në ngarkimin e stokut');
      }
    } catch (error) {
      console.error('Error loading stock:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ngarkimin e stokut');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(stockItems.map(item => item.category))];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content stock-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Duke ngarkuar stokun...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content stock-modal">
        <div className="modal-header">
          <h2>Stoku i Produkteve</h2>
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

        <div className="stock-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Kërko produkt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">Të Gjitha Kategoritë</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stock-table-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Kategoria</th>
                <th>Produkti</th>
                <th>Stoku</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                return (
                  <tr key={item.productCode} className="stock-row">
                    <td className="product-category">{item.category}</td>
                    <td className="product-name">{item.productName}</td>                    
                    <td className="current-stock">{item.quantity}</td>
                    
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="no-items">
              <p>Nuk u gjetën produkte për këtë kërkim.</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="close-button">
            Mbyll
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockModal;
