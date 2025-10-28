import React, { useState, useEffect } from 'react';
import { productService, Product } from '../services';
import { ApiError } from '../services/api';
import './DrinksModal.css';

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

interface DrinksModalProps {
  roomName: string;
  onClose: () => void;
  onGenerateInvoice: (items: DrinkItem[], total: number) => void;
}

const drinks: Drink[] = [
  // Alkool
  { id: 'smirnoff', name: 'Smirnoff', category: 'Alkool', price: 8 },
  { id: 'corona', name: 'Corona', category: 'Alkool', price: 4 },
  { id: 'heineken', name: 'Heineken', category: 'Alkool', price: 3.5 },
  { id: 'birre', name: 'Birre', category: 'Alkool', price: 2.5 },
  { id: 'birre_shkupi', name: 'Birre Shkupi', category: 'Alkool', price: 2 },
  { id: 'tuborg', name: 'Tuborg', category: 'Alkool', price: 3 },
  { id: 'vere', name: 'Vere', category: 'Alkool', price: 15 },
  { id: 'jack_daniels', name: 'Jack Daniels', category: 'Alkool', price: 12 },
  { id: 'chivas', name: 'Chivas', category: 'Alkool', price: 18 },
  { id: 'vodka', name: 'Vodka', category: 'Alkool', price: 10 },
  { id: 'jager', name: 'Jägermeister', category: 'Alkool', price: 14 },
  { id: 'terkila', name: 'Tequila', category: 'Alkool', price: 11 },
  { id: 'stock', name: 'Stock', category: 'Alkool', price: 9 },
  { id: 'malibu', name: 'Malibu', category: 'Alkool', price: 13 },
  { id: 'gin', name: 'Gin', category: 'Alkool', price: 16 },
  { id: 'tonic', name: 'Tonic', category: 'Alkool', price: 7 },
  { id: 'martini', name: 'Martini', category: 'Alkool', price: 20 },
  { id: 'baileys', name: 'Baileys', category: 'Alkool', price: 15 },
  { id: 'alaska', name: 'Alaska', category: 'Alkool', price: 6 },
  
  // Joalkool
  { id: 'coca_cola', name: 'Coca Cola', category: 'Joalkool', price: 2 },
  { id: 'pepsi', name: 'Pepsi', category: 'Joalkool', price: 2 },
  { id: 'fanta', name: 'Fanta', category: 'Joalkool', price: 2 },
  { id: 'sprite', name: 'Sprite', category: 'Joalkool', price: 2 },
  { id: 'water', name: 'Ujë', category: 'Joalkool', price: 1 },
  { id: 'juice', name: 'Lëng', category: 'Joalkool', price: 3 },
  { id: 'coffee', name: 'Kafe', category: 'Joalkool', price: 2.5 },
  { id: 'tea', name: 'Çaj', category: 'Joalkool', price: 2 },
  
  // Ushqim
  { id: 'pizza', name: 'Pizza', category: 'Ushqim', price: 8 },
  { id: 'burger', name: 'Burger', category: 'Ushqim', price: 6 },
  { id: 'sandwich', name: 'Sandwich', category: 'Ushqim', price: 4 },
  { id: 'salad', name: 'Sallatë', category: 'Ushqim', price: 5 },
  { id: 'pasta', name: 'Pasta', category: 'Ushqim', price: 7 },
  { id: 'chicken', name: 'Pule', category: 'Ushqim', price: 9 },
  { id: 'fish', name: 'Peshk', category: 'Ushqim', price: 12 },
  { id: 'steak', name: 'Biftek', category: 'Ushqim', price: 15 },
];

const DrinksModal: React.FC<DrinksModalProps> = ({ roomName, onClose, onGenerateInvoice }) => {
  const [selectedItems, setSelectedItems] = useState<DrinkItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Alkool');

  const categories = ['Alkool', 'Joalkool', 'Ushqim'];
  const filteredDrinks = drinks.filter(drink => drink.category === selectedCategory);

  const addDrink = (drink: Drink) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.drink.id === drink.id);
      if (existing) {
        return prev.map(item =>
          item.drink.id === drink.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { drink, quantity: 1 }];
      }
    });
  };

  const removeDrink = (drinkId: string) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.drink.id === drinkId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.drink.id === drinkId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter(item => item.drink.id !== drinkId);
      }
    });
  };

  const getTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.drink.price * item.quantity), 0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="drinks-modal-backdrop" onClick={handleBackdropClick}>
      <div className="drinks-modal-content">
        <div className="drinks-modal-header">
          <h2>Porosit për {roomName}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="drinks-modal-body">
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="drinks-grid">
            {filteredDrinks.map(drink => (
              <div key={drink.id} className="drink-item">
                <div className="drink-info">
                  <h4>{drink.name}</h4>
                  <p className="drink-price">€{drink.price}</p>
                </div>
                <button
                  className="add-drink-btn"
                  onClick={() => addDrink(drink)}
                >
                  +
                </button>
              </div>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <div className="selected-items">
              <h3>Porosia juaj:</h3>
              <div className="items-list">
                {selectedItems.map(item => (
                  <div key={item.drink.id} className="selected-item">
                    <div className="item-info">
                      <span className="item-name">{item.drink.name}</span>
                      <span className="item-price">€{item.drink.price}</span>
                    </div>
                    <div className="quantity-controls">
                      <button onClick={() => removeDrink(item.drink.id)}>-</button>
                      <span className="quantity">{item.quantity}</span>
                      <button onClick={() => addDrink(item.drink)}>+</button>
                    </div>
                    <div className="item-total">
                      €{(item.drink.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="total-section">
                <div className="total-amount">
                  <strong>Total: €{getTotal().toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="drinks-modal-actions">
          <button onClick={onClose} className="cancel-button">
            Anulo
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={() => onGenerateInvoice(selectedItems, getTotal())}
              className="invoice-button"
            >
              Fatura
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrinksModal;
