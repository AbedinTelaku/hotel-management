import React, { useState, useEffect } from 'react';
import { productService, Product } from '../services/productService';
import { supplyAndSellService, StockItem } from '../services/supplyAndSellService';
import './ProductStockManagement.css';

interface ProductStock {
  id: string;
  code: string;
  title: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  price: number;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  supplier?: string;
  location?: string;
}

interface StockMovement {
  id: string;
  productCode: string;
  productTitle: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  user: string;
  notes?: string;
}

interface ProductStockManagementProps {
  onBack?: () => void;
}

const ProductStockManagement: React.FC<ProductStockManagementProps> = ({ onBack }) => {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([
    {
      id: '1',
      productCode: 'SMIRNOFF',
      productTitle: 'Smirnoff',
      type: 'in',
      quantity: 50,
      reason: 'Purchase Order #123',
      date: '2024-01-15 10:30:00',
      user: 'Admin',
      notes: 'New shipment received'
    },
    {
      id: '2',
      productCode: 'CORONA',
      productTitle: 'Corona',
      type: 'out',
      quantity: 10,
      reason: 'Sale',
      date: '2024-01-15 09:15:00',
      user: 'Worker 1',
      notes: 'Sold to customer'
    },
    {
      id: '3',
      productCode: 'COCA_COLA',
      productTitle: 'Coca Cola',
      type: 'out',
      quantity: 25,
      reason: 'Sale',
      date: '2024-01-14 16:45:00',
      user: 'Worker 2',
      notes: 'Last bottles sold'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'stock' | 'movements' | 'reports' | 'alerts'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductStock | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { text: 'Në Stok', color: '#27ae60', icon: '✅' };
      case 'low_stock':
        return { text: 'Stok i Ulët', color: '#f39c12', icon: '⚠️' };
      case 'out_of_stock':
        return { text: 'Jashtë Stokut', color: '#e74c3c', icon: '❌' };
      default:
        return { text: 'I Panjohur', color: '#7f8c8d', icon: '❓' };
    }
  };

  const getMovementTypeInfo = (type: string) => {
    switch (type) {
      case 'in':
        return { text: 'Hyrje', color: '#27ae60', icon: '⬆️' };
      case 'out':
        return { text: 'Dalje', color: '#e74c3c', icon: '⬇️' };
      case 'adjustment':
        return { text: 'Rregullim', color: '#3498db', icon: '🔄' };
      default:
        return { text: 'I Panjohur', color: '#7f8c8d', icon: '❓' };
    }
  };

  const handleStockAdjustment = (product: ProductStock) => {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  };

  const handleAdjustmentSubmit = async (adjustmentData: { type: 'in' | 'out' | 'adjustment'; quantity: number; reason: string; notes?: string }) => {
    if (!selectedProduct) return;

    const newStock = adjustmentData.type === 'in' 
      ? selectedProduct.currentStock + adjustmentData.quantity
      : adjustmentData.type === 'out'
      ? selectedProduct.currentStock - adjustmentData.quantity
      : adjustmentData.quantity;

    // Update product stock
    setProducts(prev =>
      prev.map(product =>
        product.id === selectedProduct.id
          ? {
              ...product,
              currentStock: newStock,
              status: newStock === 0 ? 'out_of_stock' : newStock <= product.minStock ? 'low_stock' : 'in_stock',
              lastUpdated: new Date().toLocaleString('sq-AL')
            }
          : product
      )
    );

    // Add stock movement
    const newMovement: StockMovement = {
      id: Date.now().toString(),
      productCode: selectedProduct.code,
      productTitle: selectedProduct.title,
      type: adjustmentData.type,
      quantity: adjustmentData.quantity,
      reason: adjustmentData.reason,
      date: new Date().toLocaleString('sq-AL'),
      user: 'Current User',
      notes: adjustmentData.notes
    };

    setStockMovements(prev => [newMovement, ...prev]);
    await loadProducts();
    setShowAdjustModal(false);
    setSelectedProduct(null);
  };

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.status === 'low_stock').length;
  const outOfStockProducts = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.price), 0);

  // Fetch products/stock from backend on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      // Prefer supplyAndSellService.getStock for stock values
      const response = await supplyAndSellService.getStock();
      if (response.isSuccessfull && response.data) {
        // Map StockItem to ProductStock
        setProducts(response.data.map(item => ({
          id: item.productCode,
          code: item.productCode,
          title: item.productName,
          category: item.category,
          currentStock: item.currentStock,
          minStock: 0, // Set if available
          maxStock: 0, // Set if available
          unit: '', // Set if available
          price: 0, // Set if available
          lastUpdated: item.lastUpdated,
          status: item.availableStock <= 0 ? 'out_of_stock' : item.availableStock <= 5 ? 'low_stock' : 'in_stock',
        })));
      } else {
        setError(response.errorMessage || 'Gabim në ngarkimin e produkteve');
      }
    } catch (err) {
      setError('Gabim në ngarkimin e produkteve');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length 
        ? [] 
        : filteredProducts.map(p => p.id)
    );
  };

  const handleBulkUpdate = () => {
    if (selectedProducts.length === 0) {
      alert('Ju lutem zgjidhni të paktën një produkt');
      return;
    }
    setShowBulkUpdateModal(true);
  };

  return (
    <div className="product-stock-management">
      <div className="stock-header">
        <div className="header-title">
          <h2>Menaxhimi i Stokut</h2>
          {onBack && (
            <button onClick={onBack} className="back-to-rooms-btn">
              ← Kthehu te Dhomat
            </button>
          )}
        </div>
        <div className="header-actions">
          <div className="auto-refresh-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-text">Auto-refresh</span>
            </label>
          </div>
          {selectedProducts.length > 0 && (
            <button 
              onClick={handleBulkUpdate}
              className="bulk-update-btn"
            >
              🔄 Përditëso të Zgjedhurat ({selectedProducts.length})
            </button>
          )}
          <button 
            onClick={() => setActiveTab('reports')}
            className="reports-btn"
          >
            📊 Raportet
          </button>
        </div>
      </div>

      <div className="stock-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <span className="stat-number">{totalProducts}</span>
            <span className="stat-label">Produkte Totale</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <span className="stat-number">{lowStockProducts}</span>
            <span className="stat-label">Stok i Ulët</span>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <span className="stat-number">{outOfStockProducts}</span>
            <span className="stat-label">Jashtë Stokut</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-number">€{totalValue.toFixed(2)}</span>
            <span className="stat-label">Vlera Totale</span>
          </div>
        </div>
      </div>

      <div className="stock-tabs">
        <button 
          className={`tab-button ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          📦 Stoku
        </button>
        <button 
          className={`tab-button ${activeTab === 'movements' ? 'active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          📋 Lëvizjet
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📊 Raportet
        </button>
        <button 
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Sinjalizimet
        </button>
      </div>

      <div className="stock-content">
        {loading && <div className="loading-container"><div className="loading-spinner"></div><p>Duke ngarkuar stokun...</p></div>}
        {error && <div className="error-message">{error}</div>}
        {activeTab === 'stock' && (
          <div className="stock-tab">
            <div className="stock-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <button 
                    onClick={handleSelectAll}
                    className={`select-all-btn ${selectedProducts.length === filteredProducts.length ? 'all-selected' : ''}`}
                  >
                    {selectedProducts.length === filteredProducts.length ? '☑️' : '☐'} Zgjidh të Gjitha
                  </button>
                </div>
                <div className="filter-group">
                  <label htmlFor="search">Kërko:</label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Emër, kod produkti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="category-filter">Kategoria:</label>
                  <select 
                    id="category-filter"
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Të Gjitha</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="status-filter">Statusi:</label>
                  <select 
                    id="status-filter"
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Të Gjitha</option>
                    <option value="in_stock">Në Stok</option>
                    <option value="low_stock">Stok i Ulët</option>
                    <option value="out_of_stock">Jashtë Stokut</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.map(product => {
                const statusInfo = getStatusInfo(product.status);
                return (
                  <div key={product.id} className={`product-card ${product.status} ${selectedProducts.includes(product.id) ? 'selected' : ''}`}>
                    <div className="product-header">
                      <div className="product-selection">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleProductSelect(product.id)}
                          className="product-checkbox"
                        />
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{product.title}</h3>
                        <span className="product-code">{product.code}</span>
                      </div>
                      <div className="product-status">
                        <span className={`status-badge ${product.status}`}>
                          {statusInfo.icon} {statusInfo.text}
                        </span>
                      </div>
                    </div>

                    <div className="product-details">
                      <div className="detail-row">
                        <span className="detail-label">Kategoria:</span>
                        <span className="detail-value">{product.category}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Stoku Aktual:</span>
                        <span className={`stock-value ${product.status}`}>
                          {product.currentStock} {product.unit}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Stoku Minimal:</span>
                        <span className="detail-value">{product.minStock} {product.unit}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Çmimi:</span>
                        <span className="detail-value">€{product.price.toFixed(2)}</span>
                      </div>
                      {product.supplier && (
                        <div className="detail-row">
                          <span className="detail-label">Furnizuesi:</span>
                          <span className="detail-value">{product.supplier}</span>
                        </div>
                      )}
                      {product.location && (
                        <div className="detail-row">
                          <span className="detail-label">Vendndodhja:</span>
                          <span className="detail-value">{product.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="product-actions">
                      <button 
                        onClick={() => handleStockAdjustment(product)}
                        className="adjust-btn"
                      >
                        🔄 Rregullo Stokun
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="movements-tab">
            <h3>Lëvizjet e Stokut</h3>
            <div className="movements-list">
              {stockMovements.map(movement => {
                const typeInfo = getMovementTypeInfo(movement.type);
                return (
                  <div key={movement.id} className="movement-item">
                    <div className="movement-header">
                      <div className="movement-product">
                        <span className="product-name">{movement.productTitle}</span>
                        <span className="product-code">({movement.productCode})</span>
                      </div>
                      <div className="movement-type">
                        <span className={`type-badge ${movement.type}`}>
                          {typeInfo.icon} {typeInfo.text}
                        </span>
                      </div>
                    </div>

                    <div className="movement-details">
                      <div className="movement-info">
                        <div className="info-item">
                          <span className="info-label">Sasia:</span>
                          <span className="info-value">{movement.quantity}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Arsyeja:</span>
                          <span className="info-value">{movement.reason}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Data:</span>
                          <span className="info-value">{movement.date}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Përdoruesi:</span>
                          <span className="info-value">{movement.user}</span>
                        </div>
                      </div>
                      {movement.notes && (
                        <div className="movement-notes">
                          <span className="notes-label">Shënime:</span>
                          <span className="notes-value">{movement.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h3>Raportet e Stokut</h3>
            <div className="reports-grid">
              <div className="report-card">
                <h4>Produktet me Stok të Ulët</h4>
                <div className="report-content">
                  {products.filter(p => p.status === 'low_stock').map(product => (
                    <div key={product.id} className="report-item">
                      <span className="item-name">{product.title}</span>
                      <span className="item-stock">{product.currentStock}/{product.minStock}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="report-card">
                <h4>Produktet Jashtë Stokut</h4>
                <div className="report-content">
                  {products.filter(p => p.status === 'out_of_stock').map(product => (
                    <div key={product.id} className="report-item">
                      <span className="item-name">{product.title}</span>
                      <span className="item-stock">0</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="report-card">
                <h4>Vlera e Stokut sipas Kategorive</h4>
                <div className="report-content">
                  {categories.map(category => {
                    const categoryProducts = products.filter(p => p.category === category);
                    const categoryValue = categoryProducts.reduce((sum, p) => sum + (p.currentStock * p.price), 0);
                    return (
                      <div key={category} className="report-item">
                        <span className="item-name">{category}</span>
                        <span className="item-value">€{categoryValue.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="alerts-tab">
            <h3>Sinjalizimet e Stokut</h3>
            <div className="alerts-list">
              {products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').map(product => {
                const statusInfo = getStatusInfo(product.status);
                return (
                  <div key={product.id} className={`alert-item ${product.status}`}>
                    <div className="alert-icon">
                      {statusInfo.icon}
                    </div>
                    <div className="alert-content">
                      <h4 className="alert-title">{product.title}</h4>
                      <p className="alert-message">
                        {product.status === 'out_of_stock' 
                          ? 'Produkti është jashtë stokut!'
                          : `Stoku është i ulët! Vetëm ${product.currentStock} ${product.unit} të mbetura.`
                        }
                      </p>
                      <div className="alert-details">
                        <span className="alert-stock">Stoku: {product.currentStock}/{product.minStock}</span>
                        <span className="alert-location">{product.location}</span>
                      </div>
                    </div>
                    <div className="alert-actions">
                      <button 
                        onClick={() => handleStockAdjustment(product)}
                        className="alert-action-btn"
                      >
                        🔄 Rregullo
                      </button>
                    </div>
                  </div>
                );
              })}
              {products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length === 0 && (
                <div className="no-alerts">
                  <p>🎉 Nuk ka sinjalizime për stokun!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAdjustModal && selectedProduct && (
        <StockAdjustmentModal
          product={selectedProduct}
          onSave={handleAdjustmentSubmit}
          onClose={() => {
            setShowAdjustModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showBulkUpdateModal && (
        <BulkUpdateModal
          selectedProducts={selectedProducts}
          products={products}
          onSave={(updates) => {
            setProducts(prev => prev.map(product => {
              const update = updates.find(u => u.productId === product.id);
              if (update) {
                return {
                  ...product,
                  currentStock: update.newStock,
                  status: update.newStock === 0 ? 'out_of_stock' : update.newStock <= product.minStock ? 'low_stock' : 'in_stock',
                  lastUpdated: new Date().toLocaleString('sq-AL')
                };
              }
              return product;
            }));
            setSelectedProducts([]);
            setShowBulkUpdateModal(false);
          }}
          onClose={() => {
            setShowBulkUpdateModal(false);
            setSelectedProducts([]);
          }}
        />
      )}
    </div>
  );
};

interface StockAdjustmentModalProps {
  product: ProductStock;
  onSave: (data: { type: 'in' | 'out' | 'adjustment'; quantity: number; reason: string; notes?: string }) => void;
  onClose: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ product, onSave, onClose }) => {
  const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Sasia duhet të jetë një numër pozitiv');
      return;
    }

    if (!reason.trim()) {
      setError('Arsyeja është e detyrueshme');
      return;
    }

    if (type === 'out' && quantityNum > product.currentStock) {
      setError('Sasia e daljes nuk mund të jetë më e madhe se stoku aktual');
      return;
    }

    onSave({
      type,
      quantity: quantityNum,
      reason: reason.trim(),
      notes: notes.trim() || undefined
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
          <h2>Rregullo Stokun - {product.title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="type">Lloji i Rregullimit:</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="form-select"
            >
              <option value="in">Hyrje në Stok</option>
              <option value="out">Dalje nga Stoku</option>
              <option value="adjustment">Rregullim i Stokut</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Sasia:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Shkruani sasinë"
              className="form-input"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Arsyeja:</label>
            <input
              type="text"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Shkruani arsyen"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Shënime (opsionale):</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Shënime shtesë"
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="current-stock-info">
            <p><strong>Stoku Aktual:</strong> {product.currentStock} {product.unit}</p>
            <p><strong>Stoku Minimal:</strong> {product.minStock} {product.unit}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              Rregullo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BulkUpdateModalProps {
  selectedProducts: string[];
  products: ProductStock[];
  onSave: (updates: { productId: string; newStock: number }[]) => void;
  onClose: () => void;
}

const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({ selectedProducts, products, onSave, onClose }) => {
  const [updates, setUpdates] = useState<{ [key: string]: number }>({});

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  const handleStockChange = (productId: string, newStock: number) => {
    setUpdates(prev => ({
      ...prev,
      [productId]: newStock
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData = Object.entries(updates).map(([productId, newStock]) => ({
      productId,
      newStock
    }));
    onSave(updateData);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content bulk-update-modal">
        <div className="modal-header">
          <h2>Përditëso Stokun në Masë</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="bulk-update-list">
            {selectedProductsData.map(product => (
              <div key={product.id} className="bulk-update-item">
                <div className="product-info">
                  <h4>{product.title}</h4>
                  <span className="product-code">({product.code})</span>
                  <span className="current-stock">Stoku aktual: {product.currentStock} {product.unit}</span>
                </div>
                <div className="stock-input">
                  <input
                    type="number"
                    value={updates[product.id] ?? product.currentStock}
                    onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                    min="0"
                    className="form-input"
                  />
                  <span className="unit">{product.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              Përditëso të Gjitha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductStockManagement;
