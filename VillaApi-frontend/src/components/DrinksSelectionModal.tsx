import React, { useState, useEffect } from 'react';
import { supplyAndSellService } from '../services/supplyAndSellService';
import { productService } from '../services/productService';
import './DrinksSelectionModal.css';

interface Product {
  code: string;
  title: string;
  price: number;
  stock: number;
  unit: string;
}

interface ProductCategory {
  code: string;
  description: string;
  isActive: boolean;
}

interface CartItem {
  productCode: string;
  productTitle: string;
  quantity: number;
  price: number;
  total: number;
}

interface DrinksSelectionModalProps {
  roomMovementId: number;
  roomNo: string;
  isFree: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DrinksSelectionModal: React.FC<DrinksSelectionModalProps> = ({
  roomMovementId,
  roomNo,
  isFree,
  onClose,
  onSuccess
}) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await productService.getActiveCategories();
      
      if (response.isSuccessfull && response.data) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0].code);
        }
      } else {
        throw new Error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Gabim në ngarkimin e kategorive');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categoryCode: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await productService.getProductsByCategory(categoryCode);
      
      if (response.isSuccessfull && response.data) {
        setProducts(response.data);
      } else {
        throw new Error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Gabim në ngarkimin e produkteve');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productCode === product.code);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productCode === product.code 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productCode: product.code,
        productTitle: product.title,
        quantity: 1,
        price: product.price,
        total: product.price
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (productCode: string) => {
    setCart(cart.filter(item => item.productCode !== productCode));
  };

  const updateQuantity = (productCode: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productCode);
      return;
    }
    
    setCart(cart.map(item => 
      item.productCode === productCode 
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setError('Shtoni të paktën një produkt në shportë');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const billData = {
        dateAndTime: new Date().toISOString(),
        isSupply: false,
        isFree: isFree,
        roomNo: roomNo,
        isDebt: false,
        isMistake: false,
        discount: 0,
        items: cart.map(item => ({
          productCode: item.productCode,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await supplyAndSellService.addBill(billData);
      
      if (response.isSuccessfull) {
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to add drinks');
      }
    } catch (error) {
      console.error('Error adding drinks:', error);
      setError('Gabim në shtimin e pijeve');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content drinks-selection-modal">
        <div className="modal-header">
          <h2>{isFree ? 'Pije Gratis' : 'Pije'} - Dhoma {roomNo}</h2>
          <button className="close-button" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="drinks-content">
          <div className="categories-section">
            <h3>Kategoritë</h3>
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category.code}
                  className={`category-tab ${selectedCategory === category.code ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.code)}
                  disabled={loading}
                >
                  {category.description}
                </button>
              ))}
            </div>
          </div>

          <div className="products-section">
            <h3>Produktet</h3>
            <div className="products-grid">
              {products.map(product => (
                <div key={product.code} className="product-card">
                  <div className="product-info">
                    <h4>{product.title}</h4>
                    <p className="product-price">€{product.price}</p>
                  </div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                    disabled={loading || product.stock <= 0}
                  >
                    Shto
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-section">
            <h3>Shporta ({cart.length})</h3>
            {cart.length === 0 ? (
              <p className="empty-cart">Shporta është bosh</p>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.productCode} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.productTitle}</span>
                      <span className="item-price">€{item.price}</span>
                    </div>
                    <div className="item-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.productCode, item.quantity - 1)}
                        disabled={loading}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.productCode, item.quantity + 1)}
                        disabled={loading}
                      >
                        +
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.productCode)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>Total: €{getTotalAmount().toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-actions">
          <button 
            type="button" 
            onClick={onClose} 
            className="cancel-button"
            disabled={loading}
          >
            Anulo
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            className="save-button"
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Duke Ruajtur...' : (isFree ? 'Ruaj Pije Gratis' : 'Ruaj Pije')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrinksSelectionModal;
