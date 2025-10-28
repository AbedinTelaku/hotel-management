import React, { useState } from 'react';
import './SupplyAndSellManagement.css';

interface Bill {
  id: string;
  roomNo: string;
  roomMovementId: number;
  billDate: string;
  totalAmount: number;
  isPaid: boolean;
  isDebt: boolean;
  items: BillItem[];
  lastUpdated: string;
}

interface BillItem {
  id: string;
  billId: string;
  productCode: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

interface Product {
  code: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
}

const SupplyAndSellManagement: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([
    {
      id: '1',
      roomNo: '102',
      roomMovementId: 1,
      billDate: '2024-01-15 10:30:00',
      totalAmount: 45.50,
      isPaid: false,
      isDebt: true,
      lastUpdated: '2024-01-15 11:00:00',
      items: [
        {
          id: '1',
          billId: '1',
          productCode: 'SMIRNOFF',
          productTitle: 'Smirnoff',
          quantity: 2,
          unitPrice: 8.00,
          totalPrice: 16.00,
          category: 'Alkool'
        },
        {
          id: '2',
          billId: '1',
          productCode: 'CORONA',
          productTitle: 'Corona',
          quantity: 3,
          unitPrice: 4.00,
          totalPrice: 12.00,
          category: 'Alkool'
        },
        {
          id: '3',
          billId: '1',
          productCode: 'PIZZA',
          productTitle: 'Pizza',
          quantity: 2,
          unitPrice: 8.75,
          totalPrice: 17.50,
          category: 'Ushqim'
        }
      ]
    },
    {
      id: '2',
      roomNo: '106',
      roomMovementId: 2,
      billDate: '2024-01-15 09:15:00',
      totalAmount: 24.00,
      isPaid: true,
      isDebt: false,
      lastUpdated: '2024-01-15 09:45:00',
      items: [
        {
          id: '4',
          billId: '2',
          productCode: 'COCA_COLA',
          productTitle: 'Coca Cola',
          quantity: 6,
          unitPrice: 2.00,
          totalPrice: 12.00,
          category: 'Joalkool'
        },
        {
          id: '5',
          billId: '2',
          productCode: 'CORONA',
          productTitle: 'Corona',
          quantity: 3,
          unitPrice: 4.00,
          totalPrice: 12.00,
          category: 'Alkool'
        }
      ]
    }
  ]);

  const [products] = useState<Product[]>([
    { code: 'SMIRNOFF', title: 'Smirnoff', category: 'Alkool', price: 8.00, stock: 25, unit: 'bottles' },
    { code: 'CORONA', title: 'Corona', category: 'Alkool', price: 4.00, stock: 15, unit: 'bottles' },
    { code: 'COCA_COLA', title: 'Coca Cola', category: 'Joalkool', price: 2.00, stock: 30, unit: 'bottles' },
    { code: 'PIZZA', title: 'Pizza', category: 'Ushqim', price: 8.75, stock: 12, unit: 'pieces' }
  ]);

  const [activeTab, setActiveTab] = useState<'bills' | 'create' | 'reports'>('bills');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'debt'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.roomNo.includes(searchTerm) || 
                         bill.id.includes(searchTerm) ||
                         bill.items.some(item => item.productTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    switch (filterStatus) {
      case 'paid':
        matchesStatus = bill.isPaid;
        break;
      case 'unpaid':
        matchesStatus = !bill.isPaid;
        break;
      case 'debt':
        matchesStatus = bill.isDebt;
        break;
    }

    return matchesSearch && matchesStatus;
  });

  const handleConfirmPaid = (billId: string) => {
    if (window.confirm('A jeni të sigurt që doni të konfirmoni pagesën?')) {
      setBills(prev => prev.map(bill => 
        bill.id === billId 
          ? { ...bill, isPaid: true, isDebt: false, lastUpdated: new Date().toLocaleString('sq-AL') }
          : bill
      ));
      alert('Pagesa u konfirmua me sukses!');
    }
  };

  const handleDeleteBill = (billId: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë faturë?')) {
      setBills(prev => prev.filter(bill => bill.id !== billId));
      alert('Fatura u fshi me sukses!');
    }
  };

  const handleUpdateQuantity = (billId: string, itemId: string, newQuantity: number) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        const updatedItems = bill.items.map(item => {
          if (item.id === itemId) {
            const totalPrice = newQuantity * item.unitPrice;
            return { ...item, quantity: newQuantity, totalPrice };
          }
          return item;
        });
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return { ...bill, items: updatedItems, totalAmount, lastUpdated: new Date().toLocaleString('sq-AL') };
      }
      return bill;
    }));
  };

  const handleDeleteItem = (billId: string, itemId: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë artikull?')) {
      setBills(prev => prev.map(bill => {
        if (bill.id === billId) {
          const updatedItems = bill.items.filter(item => item.id !== itemId);
          const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
          return { ...bill, items: updatedItems, totalAmount, lastUpdated: new Date().toLocaleString('sq-AL') };
        }
        return bill;
      }));
      alert('Artikulli u fshi me sukses!');
    }
  };

  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.isPaid).length;
  const unpaidBills = bills.filter(b => !b.isPaid).length;
  const debtBills = bills.filter(b => b.isDebt).length;
  const totalAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalDebt = bills.filter(b => b.isDebt).reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="supply-sell-management">
      <div className="supply-sell-header">
        <h2>Furnizimi</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="create-bill-btn"
        >
          + Krijo Faturë të Re
        </button>
      </div>

      <div className="supply-sell-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-number">{totalBills}</span>
            <span className="stat-label">Fatura Totale</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-number">{paidBills}</span>
            <span className="stat-label">Të Paguara</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-number">{unpaidBills}</span>
            <span className="stat-label">Të Papaguara</span>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <span className="stat-number">{debtBills}</span>
            <span className="stat-label">Borxhe</span>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-number">€{totalAmount.toFixed(2)}</span>
            <span className="stat-label">Totali</span>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <span className="stat-number">€{totalDebt.toFixed(2)}</span>
            <span className="stat-label">Borxh Total</span>
          </div>
        </div>
      </div>

      <div className="supply-sell-tabs">
        <button 
          className={`tab-button ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          📋 Furnizimi
        </button>
        <button 
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Krijo të Re
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📊 Raportet
        </button>
      </div>

      <div className="supply-sell-content">
        {activeTab === 'bills' && (
          <div className="bills-tab">
            <div className="bills-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="search">Kërko:</label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Dhomë, faturë, produkt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="status-filter">Statusi:</label>
                  <select 
                    id="status-filter"
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="filter-select"
                  >
                    <option value="all">Të Gjitha</option>
                    <option value="paid">Të Paguara</option>
                    <option value="unpaid">Të Papaguara</option>
                    <option value="debt">Borxhe</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="date-from">Nga Data:</label>
                  <input
                    type="date"
                    id="date-from"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="date-to">Deri Data:</label>
                  <input
                    type="date"
                    id="date-to"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>

            <div className="bills-grid">
              {filteredBills.map(bill => (
                <div key={bill.id} className={`bill-card ${bill.isPaid ? 'paid' : bill.isDebt ? 'debt' : 'unpaid'}`}>
                  <div className="bill-header">
                    <div className="bill-info">
                      <h3 className="bill-id">Fatura #{bill.id}</h3>
                      <span className="room-no">Dhoma {bill.roomNo}</span>
                    </div>
                    <div className="bill-status">
                      <span className={`status-badge ${bill.isPaid ? 'paid' : bill.isDebt ? 'debt' : 'unpaid'}`}>
                        {bill.isPaid ? '✅ E Paguar' : bill.isDebt ? '💳 Borxh' : '⏳ E Papaguar'}
                      </span>
                    </div>
                  </div>

                  <div className="bill-details">
                    <div className="detail-row">
                      <span className="detail-label">Data:</span>
                      <span className="detail-value">{new Date(bill.billDate).toLocaleDateString('sq-AL')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Totali:</span>
                      <span className="detail-value amount">€{bill.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Artikuj:</span>
                      <span className="detail-value">{bill.items.length}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Përditësuar:</span>
                      <span className="detail-value">{new Date(bill.lastUpdated).toLocaleString('sq-AL')}</span>
                    </div>
                  </div>

                  <div className="bill-items-preview">
                    <h4>Artikujt:</h4>
                    <div className="items-list">
                      {bill.items.slice(0, 3).map(item => (
                        <div key={item.id} className="item-preview">
                          <span className="item-name">{item.productTitle}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          <span className="item-price">€{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      {bill.items.length > 3 && (
                        <div className="more-items">
                          +{bill.items.length - 3} më shumë...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bill-actions">
                    <button 
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowBillModal(true);
                      }}
                      className="view-btn"
                    >
                      👁️ Shiko
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowAddItemModal(true);
                      }}
                      className="add-item-btn"
                    >
                      ➕ Shto
                    </button>
                    {!bill.isPaid && (
                      <button 
                        onClick={() => handleConfirmPaid(bill.id)}
                        className="confirm-btn"
                      >
                        ✅ Furnizohu
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteBill(bill.id)}
                      className="delete-btn"
                    >
                      🗑️ Fshi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h3>Raportet e Faturave</h3>
            <div className="reports-grid">
              <div className="report-card">
                <h4>Shitjet sipas Kategorive</h4>
                <div className="report-content">
                  {['Alkool', 'Joalkool', 'Ushqim'].map(category => {
                    const categoryTotal = bills.reduce((sum, bill) => 
                      sum + bill.items.filter(item => item.category === category)
                                     .reduce((itemSum, item) => itemSum + item.totalPrice, 0), 0
                    );
                    return (
                      <div key={category} className="report-item">
                        <span className="item-name">{category}</span>
                        <span className="item-value">€{categoryTotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="report-card">
                <h4>Produktet më të Shitura</h4>
                <div className="report-content">
                  {products.slice(0, 5).map(product => {
                    const totalSold = bills.reduce((sum, bill) => 
                      sum + bill.items.filter(item => item.productCode === product.code)
                                     .reduce((itemSum, item) => itemSum + item.quantity, 0), 0
                    );
                    return (
                      <div key={product.code} className="report-item">
                        <span className="item-name">{product.title}</span>
                        <span className="item-value">{totalSold} {product.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="report-card">
                <h4>Performanca Mujore</h4>
                <div className="report-content">
                  <div className="report-item">
                    <span className="item-name">Janar 2024</span>
                    <span className="item-value">€{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="report-item">
                    <span className="item-name">Mesatarja Ditore</span>
                    <span className="item-value">€{(totalAmount / 15).toFixed(2)}</span>
                  </div>
                  <div className="report-item">
                    <span className="item-name">Fatura/Ditë</span>
                    <span className="item-value">{(totalBills / 15).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showBillModal && selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onUpdateQuantity={handleUpdateQuantity}
          onDeleteItem={handleDeleteItem}
          onClose={() => {
            setShowBillModal(false);
            setSelectedBill(null);
          }}
        />
      )}
    </div>
  );
};

interface BillDetailsModalProps {
  bill: Bill;
  onUpdateQuantity: (billId: string, itemId: string, quantity: number) => void;
  onDeleteItem: (billId: string, itemId: string) => void;
  onClose: () => void;
}

const BillDetailsModal: React.FC<BillDetailsModalProps> = ({ bill, onUpdateQuantity, onDeleteItem, onClose }) => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const startEdit = (itemId: string, currentQuantity: number) => {
    setEditingItem(itemId);
    setEditQuantity(currentQuantity);
  };

  const saveEdit = () => {
    if (editingItem && editQuantity > 0) {
      onUpdateQuantity(bill.id, editingItem, editQuantity);
      setEditingItem(null);
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditQuantity(0);
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content bill-details-modal">
        <div className="modal-header">
          <h2>Detajet e Faturës #{bill.id}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="bill-summary">
            <div className="summary-row">
              <span className="summary-label">Dhoma:</span>
              <span className="summary-value">{bill.roomNo}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Data:</span>
              <span className="summary-value">{new Date(bill.billDate).toLocaleString('sq-AL')}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Statusi:</span>
              <span className={`summary-value ${bill.isPaid ? 'paid' : bill.isDebt ? 'debt' : 'unpaid'}`}>
                {bill.isPaid ? 'E Paguar' : bill.isDebt ? 'Borxh' : 'E Papaguar'}
              </span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Totali:</span>
              <span className="summary-value">€{bill.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="bill-items">
            <h3>Artikujt e Faturës</h3>
            <div className="items-table">
              <div className="table-header">
                <span>Produkti</span>
                <span>Kategoria</span>
                <span>Çmimi/Njësi</span>
                <span>Sasia</span>
                <span>Totali</span>
                <span>Veprimet</span>
              </div>
              {bill.items.map(item => (
                <div key={item.id} className="table-row">
                  <span className="item-name">{item.productTitle}</span>
                  <span className="item-category">{item.category}</span>
                  <span className="item-unit-price">€{item.unitPrice.toFixed(2)}</span>
                  <span className="item-quantity">
                    {editingItem === item.id ? (
                      <div className="quantity-edit">
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                          min="1"
                          className="quantity-input"
                        />
                        <div className="edit-actions">
                          <button onClick={saveEdit} className="save-edit-btn">✓</button>
                          <button onClick={cancelEdit} className="cancel-edit-btn">✗</button>
                        </div>
                      </div>
                    ) : (
                      <span onClick={() => startEdit(item.id, item.quantity)} className="editable-quantity">
                        {item.quantity}
                      </span>
                    )}
                  </span>
                  <span className="item-total">€{item.totalPrice.toFixed(2)}</span>
                  <span className="item-actions">
                    <button 
                      onClick={() => startEdit(item.id, item.quantity)}
                      className="edit-item-btn"
                      title="Ndrysho sasinë"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => onDeleteItem(bill.id, item.id)}
                      className="delete-item-btn"
                      title="Fshi artikullin"
                    >
                      🗑️
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="close-modal-btn">
            Mbyll
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplyAndSellManagement;
