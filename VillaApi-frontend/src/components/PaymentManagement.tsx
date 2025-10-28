import React, { useState } from 'react';
import './PaymentManagement.css';

interface Payment {
  id: string;
  roomNo: string;
  clientName: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'other';
  paymentType: 'room' | 'product' | 'service' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  date: string;
  processedBy: string;
  notes?: string;
}

interface PaymentSummary {
  totalAmount: number;
  totalTransactions: number;
  pendingAmount: number;
  completedAmount: number;
  cashAmount: number;
  cardAmount: number;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      roomNo: '101',
      clientName: 'Gjergj Krasniqi',
      amount: 25.00,
      paymentMethod: 'cash',
      paymentType: 'room',
      status: 'completed',
      description: 'Pagesa për dhomën 101 - Pushim',
      date: '2024-01-15 14:30:00',
      processedBy: 'Admin',
      notes: 'Pagesa në para të gatshme'
    },
    {
      id: '2',
      roomNo: '102',
      clientName: 'Ana Berisha',
      amount: 50.00,
      paymentMethod: 'cash',
      paymentType: 'room',
      status: 'pending',
      description: 'Pagesa për dhomën 102 - 24 Orë',
      date: '2024-01-15 10:15:00',
      processedBy: 'Punëtor 1',
      notes: 'Pagesa e papaguar'
    },
    {
      id: '3',
      roomNo: '103',
      clientName: 'Marko Petrović',
      amount: 35.00,
      paymentMethod: 'cash',
      paymentType: 'room',
      status: 'completed',
      description: 'Pagesa për dhomën 103 - Fjetje',
      date: '2024-01-15 08:00:00',
      processedBy: 'Punëtor 2'
    },
    {
      id: '4',
      roomNo: 'N/A',
      clientName: 'Sara Hoxha',
      amount: 15.00,
      paymentMethod: 'cash',
      paymentType: 'product',
      status: 'completed',
      description: 'Blerje produkte - Coca Cola, Pizza',
      date: '2024-01-15 12:45:00',
      processedBy: 'Admin'
    },
    {
      id: '5',
      roomNo: '104',
      clientName: 'Dritan Gashi',
      amount: 8.00,
      paymentMethod: 'cash',
      paymentType: 'room',
      status: 'completed',
      description: 'Pagesa për dhomën 104 - Extra 1 Orë',
      date: '2024-01-15 13:00:00',
      processedBy: 'Punëtor 1'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'payments' | 'summary' | 'reports'>('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
    const matchesType = filterType === 'all' || payment.paymentType === filterType;
    const matchesDate = !selectedDate || payment.date.startsWith(selectedDate);
    
    return matchesSearch && matchesStatus && matchesMethod && matchesType && matchesDate;
  });

  const paymentSummary: PaymentSummary = {
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    totalTransactions: payments.length,
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    completedAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    cashAmount: payments.filter(p => p.paymentMethod === 'cash').reduce((sum, p) => sum + p.amount, 0),
    cardAmount: payments.filter(p => p.paymentMethod === 'card').reduce((sum, p) => sum + p.amount, 0)
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Përfunduar', color: '#27ae60', icon: '✅' };
      case 'pending':
        return { text: 'Në Pritje', color: '#f39c12', icon: '⏳' };
      case 'failed':
        return { text: 'Dështuar', color: '#e74c3c', icon: '❌' };
      case 'refunded':
        return { text: 'Rikthyer', color: '#9b59b6', icon: '🔄' };
      default:
        return { text: 'I Panjohur', color: '#7f8c8d', icon: '❓' };
    }
  };

  const getMethodInfo = (method: string) => {
    switch (method) {
      case 'cash':
        return { text: 'Para të Gatshme', color: '#27ae60', icon: '💵' };
      case 'card':
        return { text: 'Kartë', color: '#3498db', icon: '💳' };
      case 'other':
        return { text: 'Tjetër', color: '#7f8c8d', icon: '💰' };
      default:
        return { text: 'I Panjohur', color: '#7f8c8d', icon: '❓' };
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'room':
        return { text: 'Dhomë', color: '#3498db', icon: '🏨' };
      case 'product':
        return { text: 'Produkt', color: '#e67e22', icon: '📦' };
      case 'service':
        return { text: 'Shërbim', color: '#9b59b6', icon: '🔧' };
      case 'other':
        return { text: 'Tjetër', color: '#7f8c8d', icon: '📋' };
      default:
        return { text: 'I Panjohur', color: '#7f8c8d', icon: '❓' };
    }
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (paymentData: Omit<Payment, 'id' | 'date' | 'processedBy'>) => {
    if (editingPayment) {
      // Update existing payment
      setPayments(prev =>
        prev.map(payment =>
          payment.id === editingPayment.id
            ? { ...payment, ...paymentData }
            : payment
        )
      );
    } else {
      // Add new payment
      const newPayment: Payment = {
        ...paymentData,
        id: Date.now().toString(),
        date: new Date().toLocaleString('sq-AL'),
        processedBy: 'Current User'
      };
      setPayments(prev => [newPayment, ...prev]);
    }
    setShowPaymentModal(false);
    setEditingPayment(null);
  };

  const handleStatusChange = (paymentId: string, newStatus: string) => {
    setPayments(prev =>
      prev.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: newStatus as any }
          : payment
      )
    );
  };

  const handleDeletePayment = (paymentId: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë pagesë?')) {
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));
    }
  };

  return (
    <div className="payment-management">
      <div className="payment-header">
        <h2>Menaxhimi i Pagesave</h2>
        <button 
          onClick={handleAddPayment}
          className="add-payment-btn"
        >
          + Shto Pagesë të Re
        </button>
      </div>

      <div className="payment-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-number">€{paymentSummary.totalAmount.toFixed(2)}</span>
            <span className="stat-label">Shuma Totale</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-number">{paymentSummary.totalTransactions}</span>
            <span className="stat-label">Transaksione</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-number">€{paymentSummary.pendingAmount.toFixed(2)}</span>
            <span className="stat-label">Në Pritje</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-number">€{paymentSummary.completedAmount.toFixed(2)}</span>
            <span className="stat-label">Përfunduar</span>
          </div>
        </div>
      </div>

      <div className="payment-tabs">
        <button 
          className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          💰 Pagesat
        </button>
        <button 
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 Përmbledhje
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📈 Raportet
        </button>
      </div>

      <div className="payment-content">
        {activeTab === 'payments' && (
          <div className="payments-tab">
            <div className="payment-filters">
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="search">Kërko:</label>
                  <input
                    type="text"
                    id="search"
                    placeholder="Klient, dhomë, përshkrim..."
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
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Të Gjitha</option>
                    <option value="completed">Përfunduar</option>
                    <option value="pending">Në Pritje</option>
                    <option value="failed">Dështuar</option>
                    <option value="refunded">Rikthyer</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="method-filter">Metoda:</label>
                  <select 
                    id="method-filter"
                    value={filterMethod} 
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Të Gjitha</option>
                    <option value="cash">Para të Gatshme</option>
                    <option value="card">Kartë</option>
                    <option value="other">Tjetër</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="type-filter">Lloji:</label>
                  <select 
                    id="type-filter"
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Të Gjitha</option>
                    <option value="room">Dhomë</option>
                    <option value="product">Produkt</option>
                    <option value="service">Shërbim</option>
                    <option value="other">Tjetër</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="date-filter">Data:</label>
                  <input
                    type="date"
                    id="date-filter"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>

            <div className="payments-list">
              {filteredPayments.map(payment => {
                const statusInfo = getStatusInfo(payment.status);
                const methodInfo = getMethodInfo(payment.paymentMethod);
                const typeInfo = getTypeInfo(payment.paymentType);
                
                return (
                  <div key={payment.id} className="payment-card">
                    <div className="payment-header-card">
                      <div className="payment-info">
                        <h3 className="payment-amount">€{payment.amount.toFixed(2)}</h3>
                        <div className="payment-meta">
                          <span className="client-name">{payment.clientName}</span>
                          {payment.roomNo !== 'N/A' && (
                            <span className="room-number">Dhoma {payment.roomNo}</span>
                          )}
                        </div>
                      </div>
                      <div className="payment-badges">
                        <span className={`status-badge ${payment.status}`}>
                          {statusInfo.icon} {statusInfo.text}
                        </span>
                        <span className={`method-badge ${payment.paymentMethod}`}>
                          {methodInfo.icon} {methodInfo.text}
                        </span>
                        <span className={`type-badge ${payment.paymentType}`}>
                          {typeInfo.icon} {typeInfo.text}
                        </span>
                      </div>
                    </div>

                    <div className="payment-details">
                      <p className="payment-description">{payment.description}</p>
                      <div className="payment-meta-details">
                        <div className="meta-item">
                          <span className="meta-label">Data:</span>
                          <span className="meta-value">{payment.date}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Procesuar nga:</span>
                          <span className="meta-value">{payment.processedBy}</span>
                        </div>
                        {payment.notes && (
                          <div className="meta-item">
                            <span className="meta-label">Shënime:</span>
                            <span className="meta-value">{payment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="payment-actions">
                      {payment.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusChange(payment.id, 'completed')}
                          className="action-btn complete"
                        >
                          ✅ Konfirmo
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditPayment(payment)}
                        className="action-btn edit"
                      >
                        ✏️ Ndrysho
                      </button>
                      <button 
                        onClick={() => handleDeletePayment(payment.id)}
                        className="action-btn delete"
                      >
                        🗑️ Fshi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="summary-tab">
            <h3>Përmbledhja e Pagesave</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <h4>Statistikat e Përgjithshme</h4>
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="summary-label">Shuma Totale:</span>
                    <span className="summary-value">€{paymentSummary.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Transaksione Totale:</span>
                    <span className="summary-value">{paymentSummary.totalTransactions}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Shuma Mesatare:</span>
                    <span className="summary-value">€{(paymentSummary.totalAmount / paymentSummary.totalTransactions).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h4>Sipas Statusit</h4>
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="summary-label">Përfunduar:</span>
                    <span className="summary-value success">€{paymentSummary.completedAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Në Pritje:</span>
                    <span className="summary-value warning">€{paymentSummary.pendingAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Dështuar:</span>
                    <span className="summary-value danger">€{payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h4>Sipas Metodës së Pagesës</h4>
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="summary-label">Para të Gatshme:</span>
                    <span className="summary-value">€{paymentSummary.cashAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Kartë:</span>
                    <span className="summary-value">€{paymentSummary.cardAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Tjetër:</span>
                    <span className="summary-value">€{payments.filter(p => p.paymentMethod === 'other').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h4>Sipas Llojit</h4>
                <div className="summary-content">
                  <div className="summary-item">
                    <span className="summary-label">Dhoma:</span>
                    <span className="summary-value">€{payments.filter(p => p.paymentType === 'room').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Produkt:</span>
                    <span className="summary-value">€{payments.filter(p => p.paymentType === 'product').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Shërbim:</span>
                    <span className="summary-value">€{payments.filter(p => p.paymentType === 'service').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h3>Raportet e Pagesave</h3>
            <div className="reports-grid">
              <div className="report-card">
                <h4>Pagesat e Ditës</h4>
                <div className="report-content">
                  {payments.filter(p => p.date.startsWith(new Date().toISOString().split('T')[0])).map(payment => (
                    <div key={payment.id} className="report-item">
                      <span className="item-name">{payment.clientName}</span>
                      <span className="item-amount">€{payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="report-card">
                <h4>Pagesat e Papaguara</h4>
                <div className="report-content">
                  {payments.filter(p => p.status === 'pending').map(payment => (
                    <div key={payment.id} className="report-item">
                      <span className="item-name">{payment.clientName}</span>
                      <span className="item-amount">€{payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="report-card">
                <h4>Top 5 Pagesat</h4>
                <div className="report-content">
                  {payments
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map(payment => (
                    <div key={payment.id} className="report-item">
                      <span className="item-name">{payment.clientName}</span>
                      <span className="item-amount">€{payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <PaymentModal
          payment={editingPayment}
          onSave={handlePaymentSubmit}
          onClose={() => {
            setShowPaymentModal(false);
            setEditingPayment(null);
          }}
        />
      )}
    </div>
  );
};

interface PaymentModalProps {
  payment?: Payment | null;
  onSave: (data: Omit<Payment, 'id' | 'date' | 'processedBy'>) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ payment, onSave, onClose }) => {
  const [roomNo, setRoomNo] = useState(payment?.roomNo || '');
  const [clientName, setClientName] = useState(payment?.clientName || '');
  const [amount, setAmount] = useState(payment?.amount?.toString() || '');
  const [paymentMethod, setPaymentMethod] = useState(payment?.paymentMethod || 'cash');
  const [paymentType, setPaymentType] = useState(payment?.paymentType || 'room');
  const [status, setStatus] = useState(payment?.status || 'pending');
  const [description, setDescription] = useState(payment?.description || '');
  const [notes, setNotes] = useState(payment?.notes || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientName.trim()) {
      setError('Emri i klientit është i detyrueshëm');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Shuma duhet të jetë një numër pozitiv');
      return;
    }

    if (!description.trim()) {
      setError('Përshkrimi është i detyrueshëm');
      return;
    }

    onSave({
      roomNo: roomNo.trim() || 'N/A',
      clientName: clientName.trim(),
      amount: amountNum,
      paymentMethod: paymentMethod as any,
      paymentType: paymentType as any,
      status: status as any,
      description: description.trim(),
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
          <h2>{payment ? 'Ndrysho Pagesën' : 'Shto Pagesë të Re'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="roomNo">Numri i Dhomës:</label>
              <input
                type="text"
                id="roomNo"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                placeholder="101, 102, ose N/A"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientName">Emri i Klientit:</label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Shkruani emrin e klientit"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Shuma (€):</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Metoda e Pagesës:</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-select"
              >
                <option value="cash">Para të Gatshme</option>
                <option value="card">Kartë</option>
                <option value="other">Tjetër</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentType">Lloji i Pagesës:</label>
              <select
                id="paymentType"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="form-select"
              >
                <option value="room">Dhomë</option>
                <option value="product">Produkt</option>
                <option value="service">Shërbim</option>
                <option value="other">Tjetër</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Statusi:</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
              >
                <option value="pending">Në Pritje</option>
                <option value="completed">Përfunduar</option>
                <option value="failed">Dështuar</option>
                <option value="refunded">Rikthyer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Përshkrimi:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Përshkrimi i pagesës"
              className="form-textarea"
              rows={3}
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
              rows={2}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {payment ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentManagement;
