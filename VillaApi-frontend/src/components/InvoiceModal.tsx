import React, { useState } from 'react';
import './InvoiceModal.css';

interface Drink {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface DrinkItem {
  drink: Drink;
  quantity: number;
}

interface InvoiceModalProps {
  roomName: string;
  items: DrinkItem[];
  total: number;
  onClose: () => void;
  onOrder: () => void;
  onCloseInvoice: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  roomName, 
  items, 
  total, 
  onClose, 
  onOrder, 
  onCloseInvoice 
}) => {
  const [invoiceNumber] = useState(() => Math.floor(Math.random() * 10000) + 1000);
  const [currentDate] = useState(() => new Date().toLocaleDateString('sq-AL'));

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="invoice-modal-backdrop" onClick={handleBackdropClick}>
      <div className="invoice-modal-content">
        <div className="invoice-modal-header">
          <h2>Fatura #{invoiceNumber}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="invoice-body">
          <div className="invoice-header">
            <div className="invoice-info">
              <h3>Motel Management System</h3>
              <p>Fatura #{invoiceNumber}</p>
              <p>Data: {currentDate}</p>
              <p>Dhoma: {roomName}</p>
            </div>
          </div>

          <div className="invoice-items">
            <div className="items-header">
              <div className="item-name-header">Artikulli</div>
              <div className="item-quantity-header">Sasia</div>
              <div className="item-price-header">Çmimi</div>
              <div className="item-total-header">Totali</div>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="invoice-item">
                <div className="item-name">{item.drink.name}</div>
                <div className="item-quantity">{item.quantity}</div>
                <div className="item-price">€{item.drink.price.toFixed(2)}</div>
                <div className="item-total">€{(item.drink.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="invoice-total">
            <div className="total-line">
              <span className="total-label">Totali:</span>
              <span className="total-amount">€{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="invoice-footer">
            <p>Faleminderit për porosinë tuaj!</p>
            <p>Motel Management System</p>
          </div>
        </div>

        <div className="invoice-actions">
          <button onClick={onClose} className="cancel-button">
            Anulo
          </button>
          <button onClick={onOrder} className="order-button">
            Porosit
          </button>
          <button onClick={onCloseInvoice} className="close-invoice-button">
            Mbyll Faturën
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
