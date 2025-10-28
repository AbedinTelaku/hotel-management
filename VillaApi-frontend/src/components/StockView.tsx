import React, { useState, useEffect } from 'react';
import { supplyAndSellService, StockItem } from '../services';
import { ApiError } from '../services/api';
import './StockView.css';

interface StockViewProps {
  onBack?: () => void;
}

const StockView: React.FC<StockViewProps> = ({ onBack }) => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Search/filter/sort controls removed from UI; keep a simple list

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
        console.log('📦 Stock loaded:', response.data);
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

  // Display items as received from database (no sorting)
  const displayItems = stockItems;

  if (loading) {
    return (
      <div className="stock-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Duke ngarkuar stokun...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-view">
        <div className="error-container">
          <h3>Gabim në ngarkimin e stokut</h3>
          <p>{error}</p>
          <button onClick={loadStock} className="retry-button">
            Provo Përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-view">
      <div className="stock-header">
        <div className="header-title-section">
          <h2>Stoku i Produkteve</h2>
          {onBack && (
            <button onClick={onBack} className="back-to-rooms-btn-stock">
              ← Kthehu te Dhomat
            </button>
          )}
        </div>
        <button onClick={loadStock} className="refresh-button">
          🔄 Rifresko
        </button>
      </div>

      {/* Filters, search and summary cards removed as requested */}

      {/* Stock Table */}
      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Kategoria</th>
              <th>Artikulli</th>
              <th>Sasia</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item) => (
              <tr key={item.productCode} className="stock-row">
                <td className="product-category">{item.category}</td>
                <td className="product-name">{item.productName}</td>
                <td className="stock-number">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {displayItems.length === 0 && (
          <div className="no-results">
            <p>Nuk ka produkte në stok.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockView;
