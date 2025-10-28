import React, { useState, useEffect } from 'react';
import { productService, supplyAndSellService, Product } from '../services';
import { ApiError } from '../services/api';
import './DrinksSale.css';

interface DrinkItem { product: Product; quantity: number }

const DrinksSale: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ code: string; name: string }[]>([]);
  const [cart, setCart] = useState<DrinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true); setError('');
      const categoriesResponse = await productService.getActiveCategories();
      if (categoriesResponse.isSuccessfull && categoriesResponse.data) {
        setCategories(categoriesResponse.data.map((c: any) => ({ code: c.code, name: c.description })));
        if (categoriesResponse.data.length) setSelectedCategory(categoriesResponse.data[0].code);
      }
      const productsResponse = await productService.getAllProducts();
      if (productsResponse.isSuccessfull && productsResponse.data) setProducts(productsResponse.data);
      else setError('Nuk mund të ngarkohen produktet nga serveri');
    } catch (err) {
      const apiErr = err as ApiError; setError(apiErr?.message || 'Gabim në ngarkimin e produkteve');
    } finally { setLoading(false); }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => setCart(prev => {
    const existing = prev.find(i => i.product.code === product.code);
    if (existing) return prev.map(i => i.product.code === product.code ? { ...i, quantity: i.quantity + 1 } : i);
    return [...prev, { product, quantity: 1 }];
  });

  const removeFromCart = (productCode: string) => setCart(prev => {
    const existing = prev.find(i => i.product.code === productCode);
    if (existing && existing.quantity > 1) return prev.map(i => i.product.code === productCode ? { ...i, quantity: i.quantity - 1 } : i);
    return prev.filter(i => i.product.code !== productCode);
  });

  const getTotalPrice = () => cart.reduce((s, it) => s + (it.product.price * it.quantity), 0);

  const handleSubmitSale = async () => {
    if (!cart.length) { setError('Shtoni të paktën një produkt në shportë'); return; }
    try {
      setIsSubmitting(true); setError('');
      const items = cart.map(i => ({ productCode: i.product.code, quantity: i.quantity, price: i.product.price }));
      const billData = { dateAndTime: new Date().toISOString(), isSupply: true, isFree: false, roomNo: null, isDebt: false, isMistake: false, discount: 0, items };
      const res = await supplyAndSellService.addBill(billData);
      if (!res.isSuccessfull) throw new Error(res.errorMessage || 'Gabim');
      for (const it of cart) {
        const prod = products.find(p => p.code === it.product.code);
        const newStock = (prod?.stock || 0) + it.quantity;
        await productService.updateProduct({ code: it.product.code, title: it.product.title, category: it.product.category, price: it.product.price, isActive: it.product.isActive, orderNo: it.product.orderNo, stock: newStock });
      }
      setProducts(prev => prev.map(p => { const s = cart.find(c => c.product.code === p.code); return s ? { ...p, stock: (p.stock || 0) + s.quantity } : p; }));
      setCart([]);
      alert('Furnizimi u ruajt me sukses!');
    } catch (err) { const apiErr = err as ApiError; setError(apiErr?.message || 'Gabim në ruajtjen e furnizimit'); }
    finally { setIsSubmitting(false); }
  };

  const clearCart = () => setCart([]);

  if (loading) return (
    <div className="drinks-sale"><div className="loading-container"><div className="loading-spinner"></div><p>Duke ngarkuar produktet...</p></div></div>
  );

  return (
    <div className="drinks-sale">
      <div className="drinks-header">
        <h2>Furnizimi</h2>
        <div className="cart-summary">
          <span className="cart-count">{cart.length} produkte</span>
          <span className="cart-total" style={{ background: '#0f9d63', color: '#fff', padding: '8px 16px', borderRadius: 20, fontWeight: 600 }}>Total: €{getTotalPrice().toFixed(2)}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="drinks-content">
        <div className="products-section">
          <div className="products-header">
            <h3>Produktet</h3>
            <div className="products-filters">
              <div className="search-box"><input type="text" placeholder="Kërko produkte..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" /></div>
              <div className="category-filter"><label>Kategoria:</label><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="category-select"><option value="">Të gjitha</option>{categories.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.code} className="product-card">
                <div className="product-info">
                  <h4 className="product-name">{product.title}</h4>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">€{product.price.toFixed(2)}</p>
                </div>
                <button onClick={() => addToCart(product)} className="add-button" aria-label={`Shto ${product.title}`} title={`Shto ${product.title}`}>
                  <span className="add-plus" aria-hidden="true">+</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <div className="cart-header">
            <h3>Shporta</h3>
            {cart.length > 0 && <button onClick={clearCart} className="clear-button">Pastro</button>}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? <p className="empty-cart">Shporta është bosh</p> : cart.map(item => (
              <div key={item.product.code} className="cart-item">
                <div className="item-info"><span className="item-name">{item.product.title}</span><span className="item-price">€{item.product.price.toFixed(2)}</span></div>
                <div className="item-controls" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => removeFromCart(item.product.code)} className="quantity-btn" style={{ minWidth: 36, height: 36, fontSize: 20 }}>-</button>
                  <input type="number" min={1} max={9999} value={item.quantity} onChange={e => { let value = parseInt(e.target.value) || 1; if (value > 9999) value = 9999; setCart(prev => prev.map(ci => ci.product.code === item.product.code ? { ...ci, quantity: value } : ci)); }} className="quantity-input" style={{ width: 80, height: 40, fontSize: 22, textAlign: 'center', borderRadius: 8, border: '1px solid #ccc', margin: '0 4px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} inputMode="numeric" pattern="[0-9]*" />
                  <button onClick={() => addToCart(item.product)} className="quantity-btn" style={{ minWidth: 36, height: 36, fontSize: 20 }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="cart-footer">
              <div className="total-section"><span className="total-label">Total:</span><span className="total-amount">€{getTotalPrice().toFixed(2)}</span></div>
              <button onClick={handleSubmitSale} disabled={isSubmitting} className="submit-button">{isSubmitting ? 'Duke ruajtur...' : 'Furnizohu'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrinksSale;
                
