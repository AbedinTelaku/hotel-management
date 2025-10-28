import React, { useState, useEffect } from 'react';
import { productService, supplyAndSellService, Product } from '../services';
import { ApiError } from '../services/api';
import './SimpleMarket.css';
import { Navigate } from 'react-router-dom';

interface DrinkItem {
  product: Product;
  quantity: number;
}

interface SimpleMarketProps {
  onBack?: () => void;
  isForStaff?: boolean;
}

const SimpleMarket: React.FC<SimpleMarketProps> = ({ onBack, isForStaff = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{code: string, name: string}[]>([]);
  const [cart, setCart] = useState<DrinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      // Load categories first
      const categoriesResponse = await productService.getActiveCategories();
      console.log('📂 Categories response:', categoriesResponse);
      if (categoriesResponse.isSuccessfull && categoriesResponse.data && categoriesResponse.data.length > 0) {
        const mappedCategories = categoriesResponse.data.map(cat => ({
          code: cat.code,
          name: cat.title || (cat.code === '001' ? 'Alkoolike' : cat.code === '002' ? 'Joalkoolike' : cat.code)
        }));
        console.log('📂 Mapped categories:', mappedCategories);
        setCategories(mappedCategories);
      } else {
        console.log('❌ Categories failed to load, using fallback categories');
        // Fallback categories if API doesn't work
        setCategories([
          { code: 'alkool', name: 'Alkoolike' },
          { code: 'joalkool', name: 'Joalkoolike' }
        ]);
      }

      // Load products
      const response = await productService.getAllProducts();
      
      if (response.isSuccessfull && response.data) {
        setProducts(response.data);
        console.log('🛒 Products loaded:', response.data);
      } else {
        setError(response.errorMessage || 'Gabim në ngarkimin e produkteve');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ngarkimin e produkteve');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    // REMOVED: Stock validation to allow negative stock for drinks
    // Allow adding to cart regardless of stock level (can go negative)

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.code === product.code);
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        
        return prevCart.map(item =>
          item.product.code === product.code
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productCode: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.code !== productCode));
  };

  const updateQuantity = (productCode: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productCode);
      return;
    }
    
    // REMOVED: Stock validation to allow negative stock for drinks
    setCart(prevCart => {
      return prevCart.map(item =>
        item.product.code === productCode
          ? { ...item, quantity }
          : item
      );
    });
  };

  const getTotalPrice = () => {
    // Calculate actual total price for both staff and regular users
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Shporta është bosh');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const billData = {
        dateAndTime: new Date().toISOString(),
        isSupply: false, // We are selling, not supplying
        isFree: isForStaff, // For staff, mark as free so it doesn't affect settlements
        roomNo: null, // Simple market doesn't need room
        isDebt: false, // Cash payment
        isMistake: false,
        discount: 0,
        items: cart.map(item => ({
          productCode: item.product.code,
          quantity: item.quantity,
          price: item.product.price // Always use actual product price
        }))
      };

      const response = await supplyAndSellService.addBill(billData);
      
      if (response.isSuccessfull) {
        console.log('✅ Sale completed successfully');
        setCart([]);
        window.location.href = "/";
        // Reload products to update stock
        await loadProducts();
      } else {
        // Check if it's a stock error (MyException 30)
        if (response.errorMessage && response.errorMessage.includes('Nuk ka stok të mjaftueshëm')) {
          setError(`⚠️ ${response.errorMessage}`);
        } else {
          setError(response.errorMessage || 'Gabim në shitjen e produkteve');
        }
      }
    } catch (error) {
      console.error('Error selling products:', error);
      const apiError = error as ApiError;
      
      // Handle stock-related errors with better messaging
      if (apiError.message && apiError.message.includes('Nuk ka stok të mjaftueshëm')) {
        setError(`⚠️ ${apiError.message}`);
      } else {
        setError(apiError.message || 'Gabim në shitjen e produkteve');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.isActive;
  });

  if (loading) {
    return (
      <div className="simple-market-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Duke ngarkuar marketin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-market-container">
      <div className="market-header">
        <div className="header-content">
          <h1>{isForStaff ? '👥 Market per Staff' : '🛒 Market i Thjeshtë'}</h1>
          <p>{isForStaff ? 'Shitje pijesh për stafin (pa pagesë)' : 'Shitje pijesh pa rezervim dhome'}</p>
        </div>
        {onBack && (
          <button onClick={onBack} className="back-button">
            ← Kthehu te Dhomat
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="market-content">
        <div className="market-sidebar">
          <div className="filters-section">
            <h3>Filtro Produktet</h3>
            
            <div className="search-box">
              <input
                type="text"
                placeholder="Kërko produkte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="category-filter">
              <label>Kategoria:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
                style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px', fontSize: '16px', outline: 'none' }}
              >
                <option value="">Të gjitha kategoritë</option>
                {categories.map(category => (
                  <option key={category.code} value={category.code}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cart-section">
            <h3>Shporta ({cart.length} produkte)</h3>
            {cart.length === 0 ? (
              <p className="empty-cart">Shporta është bosh</p>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.product.code} className="cart-item">
                    <div className="cart-item-info">
                      <span className="product-name">{item.product.title}</span>
                      <span className="product-price">€{item.product.price.toFixed(2)}</span>
                      <span className="product-subtotal">
                        {item.quantity}x = €{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        onClick={() => updateQuantity(item.product.code, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateQuantity(item.product.code, Math.max(1, Number(e.target.value)))}
                        className="quantity-input"
                        style={{ width: '50px', textAlign: 'center', fontWeight: 600, fontSize: '16px', border: '2px solid #e5e7eb', borderRadius: '8px', margin: '0 8px' }}
                      />
                      <button
                        onClick={() => updateQuantity(item.product.code, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.code)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <div className="cart-total" style={{
                  padding: '8px', // smaller padding
                  background: isForStaff ? '#e0f2fe' : '#fffbe6', // different background for staff
                  borderRadius: '8px', // smaller radius
                  textAlign: 'center',
                  margin: '10px 0', // less margin
                  border: isForStaff ? '1px solid #06b6d4' : '1px solid #f59e0b', // different border for staff
                  fontSize: '16px', // smaller font
                  fontWeight: '600', // less bold
                  color: isForStaff ? '#0891b2' : '#d97706', // different color for staff
                  boxShadow: isForStaff ? '0 1px 4px rgba(6,182,212,0.08)' : '0 1px 4px rgba(245,158,11,0.08)'
                }}>
                  {isForStaff ? `Totali: €${getTotalPrice().toFixed(2)} (Për Stafin)` : `Totali: €${getTotalPrice().toFixed(2)}`}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  className="submit-btn"
                  style={{
                    padding: '14px 32px', // larger button
                    fontSize: '20px', // larger text
                    fontWeight: '700',
                    borderRadius: '10px',
                    background: isForStaff ? 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: isForStaff ? '0 2px 8px rgba(6,182,212,0.10)' : '0 2px 8px rgba(245,158,11,0.10)',
                    cursor: isSubmitting || cart.length === 0 ? 'not-allowed' : 'pointer',
                    marginTop: '8px',
                    transition: 'background 0.2s, transform 0.2s',
                  }}
                >
                  {isSubmitting ? 'Duke Procesuar...' : (isForStaff ? 'Konfirmo për Stafin' : 'Konfirmo Shitjen')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.code} className="products-grid">
              <div className="product-info">
                <h4>{product.title}</h4>
                <p className="drink-price">€{product.price.toFixed(2)}</p>
                
              </div>
              <button
                onClick={() => addToCart(product)}
                className="add-to-cart-btn"
              >
                +
              </button>
            </div>
          ))}
          
          {filteredProducts.length === 0 && (
            <div className="no-products">
              <p>Nuk u gjetën produkte për këtë kërkesë.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleMarket;
