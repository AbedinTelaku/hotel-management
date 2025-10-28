import React, { useState, useEffect } from 'react';
import { productService, supplyAndSellService } from '../services';
import { ApiError } from '../services/api';
import './DrinksModal.css';

interface Drink {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number; // Add stock information
}

interface DrinkItem {
  drink: Drink;
  quantity: number;
}

interface DrinksModalProps {
  roomName: string;
  roomMovementId?: number;
  onClose: () => void;
  onGenerateInvoice: (items: DrinkItem[], total: number) => void;
  isFree?: boolean; // when true, bill will be marked as free (no charge to room)
}

const DrinksModalNew: React.FC<DrinksModalProps> = ({ roomName, roomMovementId, onClose, onGenerateInvoice, isFree = false }) => {
  console.log('🍹 DrinksModalNew opened with:', {
    roomName,
    roomMovementId,
    hasRoomMovementId: !!roomMovementId,
    isFree
  });

  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<{code: string, name: string}[]>([]);
  const [cart, setCart] = useState<DrinkItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      // Load categories first
      const categoriesResponse = await productService.getActiveCategories();
      if (categoriesResponse.isSuccessfull && categoriesResponse.data) {
        const categoryData = categoriesResponse.data.map(cat => ({code: cat.code, name: cat.description}));
        setCategories(categoryData);
        if (categoryData.length > 0) {
          setSelectedCategory(categoryData[0].code);
        }
      }

      // Load products
      const productsResponse = await productService.getAllProducts();
      if (productsResponse.isSuccessfull && productsResponse.data) {
        const convertedDrinks: Drink[] = productsResponse.data.map(product => ({
          id: product.code,
          name: product.title,
          category: product.category,
          price: product.price,
          stock: product.stock || 0 // Include stock information
        }));
        setDrinks(convertedDrinks);
        console.log('✅ Drinks loaded from backend:', convertedDrinks);
      } else {
        setError('Nuk mund të ngarkohen produktet nga serveri');
      }
    } catch (error) {
      console.error('Error loading drinks:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ngarkimin e produkteve');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrinks = drinks.filter(drink => {
    const matchesCategory = selectedCategory === '' || drink.category === selectedCategory;
    const matchesSearch = drink.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (drink: Drink) => {
    // REMOVED: Stock validation to allow negative stock for drinks
    // Allow adding to cart regardless of stock level (can go negative)

    setCart(prev => {
      const existingItem = prev.find(item => item.drink.id === drink.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        
        return prev.map(item =>
          item.drink.id === drink.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prev, { drink, quantity: 1 }];
      }
    });
  };

  // Removal disabled by requirement (items cannot be removed once selected)

  const updateQuantity = (drinkId: string, quantity: number) => {
    // Prevent decreasing or removing items after selection (both free and normal modes)
    const current = cart.find(i => i.drink.id === drinkId)?.quantity ?? 0;
    if (quantity <= current) {
      return; // lock: cannot decrease or remove once added
    }
    // Increase quantity
    setCart(prev => {
      return prev.map(item =>
        item.drink.id === drinkId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.drink.price * item.quantity), 0);
  };

  const handleGenerateInvoice = async () => {
    try {
      setLoading(true);
      setError('');

      // Convert cart items to SupplyAndSellItemsParameters
      const items = cart.map(item => ({
        productCode: item.drink.id,
        quantity: item.quantity,
        // In free mode send price 0, backend will still decrement stock via quantity
        price: isFree ? 0 : item.drink.price
      }));

      // Create SupplyAndSell bill with correct parameters
      // Requirements summary:
      // - dateAndTime: now (ISO)
      // - isSupply: false (we are selling, not supplying stock)
      // - isFree: depends on modal mode
      // - roomNo: string (use roomName)
      // - isDebt: false, isMistake: false, discount: 0
      const billData = {
        dateAndTime: new Date().toISOString(),
        isSupply: false,
        isFree: isFree,
        roomNo: roomName,
        isDebt: false,
        isMistake: false,
        discount: 0,
        items: items
      };

      // Add the bill using SupplyAndSell service
      const response = await supplyAndSellService.addBill(billData);

      if (!response.isSuccessfull) {
        // Check if it's a stock error (MyException 30)
        if (response.errorMessage && response.errorMessage.includes('Nuk ka stok të mjaftueshëm')) {
          throw new Error(response.errorMessage);
        }
        throw new Error(response.errorMessage || 'Gabim në ruajtjen e faturës');
      }

      console.log('✅ Drinks bill created successfully:', response.data);
      // Only update room invoice/total when not free; for free mode force total 0
      onGenerateInvoice(cart, isFree ? 0 : getTotalPrice());
      onClose();
    } catch (error) {
      console.error('❌ Error saving drinks:', error);
      const apiError = error as ApiError;
      
      // Handle stock-related errors with better messaging
      if (apiError.message && apiError.message.includes('Nuk ka stok të mjaftueshëm')) {
        setError(`⚠️ ${apiError.message}`);
      } else {
        setError(apiError.message || 'Gabim në ruajtjen e pijeve');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content drinks-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Duke ngarkuar produktet...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="drinks-modal-backdrop" onClick={handleBackdropClick}>
      <div className="drinks-modal-content">
        <div className="drinks-modal-header">
          <h2>{isFree ? 'Pije Gratis' : 'Pije'} për {roomName}</h2>
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

        <div className="drinks-modal-body">
          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Të Gjitha
            </button>
            {categories.map(category => (
              <button
                key={category.code}
                className={`category-tab ${selectedCategory === category.code ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.code)}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Kërko produkt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="drinks-grid">
            {filteredDrinks.map(drink => (
              <div key={drink.id} className="drink-item">
                <div className="drink-info">
                  <h4>{drink.name}</h4>
                  <p className="drink-price">€{drink.price}</p>
                  
                </div>
                <button
                  onClick={() => addToCart(drink)}
                  className="add-drink-btn"
                >
                  +
                </button>
              </div>
            ))}
          </div>

          {filteredDrinks.length === 0 && (
            <div className="no-products">
              <p>Nuk u gjetën produkte për këtë kategori.</p>
            </div>
          )}

          {cart.length > 0 && (
            <div className="selected-items">
              <h3>Shporta ({cart.length} artikuj)</h3>
              <div className="items-list">
                {cart.map(item => (
                  <div key={item.drink.id} className="selected-item">
                    <div className="item-info">
                      <span className="item-name">{item.drink.name}</span>
                      <span className="item-price">€{item.drink.price}</span>
                    </div>
                    
                    <div className="item-total">€{(item.drink.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="total-section">
                <div className="total-amount">
                  <strong>Totali: €{getTotalPrice().toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

          {cart.length > 0 && (
            <div className="drinks-modal-actions">
              <button onClick={onClose} className="cancel-button">
                Anulo
              </button>
              <button onClick={handleGenerateInvoice} className="invoice-button">
                {isFree ? 'Regjistro Pije Gratis' : 'Gjenero Faturë'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrinksModalNew;
