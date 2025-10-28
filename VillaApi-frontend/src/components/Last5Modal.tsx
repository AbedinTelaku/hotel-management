import React, { useState, useEffect } from 'react';
import { supplyAndSellService, SupplyAndSell } from '../services';
import { ApiError } from '../services/api';
import './Last5Modal.css';

interface Last5ModalProps {
  onClose: () => void;
}

interface Last5Entry {
  id: number;
  roomNo: string;
  totalAmount: number;
  isPaid: boolean;
  isDebt: boolean;
  createdDate: string;
  items: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

const Last5Modal: React.FC<Last5ModalProps> = ({ onClose }) => {
  const [last5Entries, setLast5Entries] = useState<Last5Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLast5Entries();
  }, []);

  const loadLast5Entries = async () => {
    try {
      setLoading(true);
      setError('');

      // Get bills from the last 7 days to ensure we have recent data
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 7);

      const response = await supplyAndSellService.getBills(fromDate, toDate);
      
      if (response.isSuccessfull && response.data) {
        // Sort by creation date and take the last 5
        const sortedBills = response.data
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
          .slice(0, 5);
        
        setLast5Entries(sortedBills);
        console.log('✅ Last 5 entries loaded:', sortedBills);
      } else {
        setError(response.errorMessage || 'Gabim në ngarkimin e të dhënave');
      }
    } catch (error) {
      console.error('Error loading last 5 entries:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ngarkimin e të dhënave');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (isPaid: boolean, isDebt: boolean) => {
    if (isPaid) return { text: 'E Paguar', class: 'status-paid' };
    if (isDebt) return { text: 'Borxh', class: 'status-debt' };
    return { text: 'E Papaguar', class: 'status-unpaid' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sq-AL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content last5-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Duke ngarkuar të dhënat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content last5-modal">
        <div className="modal-header">
          <h2>5 Faturat e Fundit</h2>
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

        <div className="last5-content">
          {last5Entries.length === 0 ? (
            <div className="no-entries">
              <p>Nuk ka faturat e fundit të disponueshme.</p>
            </div>
          ) : (
            <div className="entries-list">
              {last5Entries.map((entry, index) => {
                const paymentStatus = getPaymentStatus(entry.isPaid, entry.isDebt);
                return (
                  <div key={entry.id} className="entry-card">
                    <div className="entry-header">
                      <div className="entry-info">
                        <h3>Fatura #{entry.id}</h3>
                        <span className="room-number">Dhoma: {entry.roomNo}</span>
                        <span className="entry-date">{formatDate(entry.createdDate)}</span>
                      </div>
                      <div className="entry-amount">
                        <span className="amount">€{entry.totalAmount.toFixed(2)}</span>
                        <span className={`payment-status ${paymentStatus.class}`}>
                          {paymentStatus.text}
                        </span>
                      </div>
                    </div>
                    
                    {entry.items && entry.items.length > 0 && (
                      <div className="entry-items">
                        <h4>Artikujt:</h4>
                        <div className="items-list">
                          {entry.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="item-row">
                              <span className="item-name">{item.productName}</span>
                              <span className="item-quantity">x{item.quantity}</span>
                              <span className="item-price">€{item.price.toFixed(2)}</span>
                              <span className="item-total">€{item.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

export default Last5Modal;
