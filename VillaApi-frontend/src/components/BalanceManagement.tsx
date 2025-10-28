import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { userService } from '../services/userService';
import { paymentService, Payment } from '../services/paymentService';
import './BalanceManagement.css';

const BalanceManagement: React.FC = () => {
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  // Calculate payment breakdown
  const calculatePaymentBreakdown = () => {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const mistake = payments.filter(payment => payment.isMistake).reduce((sum, payment) => sum + payment.amount, 0);
    const staff = payments.filter(payment => payment.isForStaff).reduce((sum, payment) => sum + payment.amount, 0);
    const settlement = total - mistake - staff; // Për barazim = Total - Gabim - Staff
    
    console.log('💰 Payment breakdown:', {
      total,
      mistake,
      staff,
      settlement,
      allPayments: payments.map(p => ({
        amount: p.amount,
        isMistake: p.isMistake,
        isForStaff: p.isForStaff,
        displayText: p.displayText,
        Koha: p.Koha
      }))
    });
    
    return { total, mistake, staff, settlement };
  };

  console.log('🔍 BalanceManagement render:', {
    selectedEmployeeId,
    paymentsCount: payments.length,
    showSettleModal,
    loading,
    isSettling
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('🔍 Fetching users for dropdown...');
        const response = await userService.getAllUsers();
        if (response.isSuccessfull && response.data) {
          console.log('✅ Fetched users:', response.data);
          const mappedUsers = response.data.map(u => ({ id: u.id, username: u.username }));
          setUsers(mappedUsers);
          console.log('✅ Mapped users for dropdown:', mappedUsers);
        } else {
          console.log('❌ Failed to fetch users:', response.errorMessage);
          setError('Gabim në ngarkimin e përdoruesve');
        }
      } catch (err) {
        console.log('❌ Error fetching users:', err);
        setError('Gabim në ngarkimin e përdoruesve');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log('🔍 Users updated, count:', users.length);
  }, [users]);

  // Load payments automatically when employee is selected
  const loadPayments = async (employeeId: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentService.getRoomSettlementsByEmployee(employeeId);
      if (response.isSuccessfull && response.data) {
        // Sort payments by latest date first (most recent at the top)
        const sortedPayments = response.data.sort((a: Payment, b: Payment) => {
          const dateA = new Date(a.enteredOn);
          const dateB = new Date(b.enteredOn);
          return dateB.getTime() - dateA.getTime(); // Descending order (latest first)
        });
        setPayments(sortedPayments);
      } else {
        setPayments([]);
        setError(response.errorMessage || 'Gabim në ngarkimin e pagesave');
      }
    } catch (err) {
      setPayments([]);
      setError('Gabim në ngarkimin e pagesave');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load payments when employee changes
  useEffect(() => {
    if (selectedEmployeeId && selectedEmployeeId !== "" && !isNaN(Number(selectedEmployeeId))) {
      loadPayments(Number(selectedEmployeeId));
    } else {
      setPayments([]);
    }
  }, [selectedEmployeeId]);

  // Handle settle employee
  const handleSettleClick = () => {
    console.log('🔍 Barazohu clicked:', {
      selectedEmployeeId,
      paymentsLength: payments.length,
      showSettleModal
    });
    
    if (selectedEmployeeId && payments.length > 0) {
      console.log('✅ Opening settle modal...');
      setShowSettleModal(true);
      console.log('✅ Modal state set to true');
    } else {
      console.log('❌ Cannot open modal:', {
        hasEmployeeId: !!selectedEmployeeId,
        hasPayments: payments.length > 0
      });
    }
  };

  const handleSettleConfirm = async () => {
    if (!selectedEmployeeId) return;

    setIsSettling(true);
    setShowSettleModal(false);
    setError('');

    try {
      const response = await paymentService.confirmPaymentsByEmployee(Number(selectedEmployeeId));
      
      if (response.isSuccessfull) {
        console.log('✅ Employee settled successfully');
        // Clear payments and reload
        setPayments([]);
        // Reload to confirm the payments are gone
        await loadPayments(Number(selectedEmployeeId));
      } else {
        setError(response.errorMessage || 'Gabim në barazimin e punëtorit');
      }
    } catch (err) {
      console.error('❌ Error settling employee:', err);
      setError('Gabim në barazimin e punëtorit');
    } finally {
      setIsSettling(false);
    }
  };

  const handleSettleCancel = () => {
    setShowSettleModal(false);
  };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on backdrop, not on modal content
    if (e.target === e.currentTarget) {
      setShowSettleModal(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    
    const date = new Date(dateTimeString);

const formatted = date.toLocaleString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).replace(',', '');

    return formatted;
  };

  return (
    <>
      <div className="balance-management" data-view={viewMode} style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
        {/* Header */}
        <div className="balance-header">
          <div className="header-content">
            <h2>⚖️ Barazimi i Sistemit</h2>
            <p className="header-subtitle">Menaxhimi i pagesave të punëtorëve</p>
          </div>
        </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Payments Section */}
      <div className="payments-section" style={{ overflow: 'visible' }}>
          <div className="employee-selector">
            <div className="selector-group">
              <label htmlFor="employee-select" className="selector-label">
                👤 Zgjidh Punëtorin:
              </label>
        {Array.isArray(users) && users.length > 0 ? (
                <select
                  id="employee-select"
                  value={selectedEmployeeId ?? ""}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedEmployeeId(val === "" ? null : val);
                  }}
                  className="employee-select"
                >
                  <option value="">-- Zgjidh një punëtor --</option>
                  {users
                    .filter(user => user.id !== undefined && user.id !== null)
                    .map((user, idx) => (
                      <option key={`user-option-${idx}-${user.id}`} value={String(user.id)}>
                        {user.username || '(pa emër)'}
                      </option>
                    ))}
                </select>
              ) : (
                <div className="no-users-message">
                  <span>❌ Nuk ka punëtorë të disponueshëm!</span>
                </div>
              )}
            </div>
          </div>

          {/* Payments Table */}
          {(payments.length > 0 || loading) && (
            <div className="payments-table-container" style={{ overflow: 'visible' }}>
              <div className="table-header">
                <div className="header-left">
                  <h3>📋 Barazimet e Punëtorit</h3>
                  <span className="sort-indicator">🕒 Më të rejat në krye</span>
                </div>
                <div className="table-actions">
                  <button 
                    className="settle-employee-btn"
                    onClick={handleSettleClick}
                    disabled={isSettling || loading || payments.length === 0}
                  >
                    <span className="btn-icon">⚖️</span>
                    <span className="btn-text">
                      {isSettling ? 'Duke Barazuar...' : 'Barazohu'}
                    </span>
                    {isSettling && <span className="btn-spinner">⏳</span>}
                  </button>
                  <span className="record-count">
                    {payments.length} regjistrime
                  </span>
                </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="desktop-table-container">
                <table className="payments-table">
              <thead>
                <tr>
                      <th>📝 Përshkrimi</th>
                      <th>💰 Shuma</th>
                      <th>📋 Koha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                      <tr>
                        <td colSpan={5} className="loading-cell">
                          <div className="loading-spinner"></div>
                          <span>Duke ngarkuar barazimet...</span>
                        </td>
                      </tr>
                ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-cell">
                          <div className="empty-state">
                            <span className="empty-icon">📭</span>
                            <span>Nuk ka barazime për këtë punëtor</span>
                          </div>
                        </td>
                      </tr>
                ) : (
                  payments.map((p, idx) => (
                    <tr key={`payment-row-${idx}-${p.displayText}-${p.amount}-${p.Koha}`}>
                     
                          <td>
                            <span className="description-text">{p.displayText}</span>
                          </td>
                          <td>
                            <span className="amount-value">€{p.amount.toFixed(2)}</span>
                          </td>
                          <td>
                            <span className="description-text">{formatDateTime(p.enteredOn.toString())}</span>
                          </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-container">
                {loading ? (
                  <div className="mobile-loading-state">
                    <div className="loading-spinner"></div>
                    <span>Duke ngarkuar barazimet...</span>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="mobile-empty-state">
                    <div className="empty-icon">📭</div>
                    <span>Nuk ka barazime për këtë punëtor</span>
                  </div>
                ) : (
                  <div className="payment-cards-grid">
                    {payments.map((p, idx) => (
                      <div key={`payment-card-${idx}-${p.displayText}-${p.amount}-${p.Koha}`} className="payment-card">
                        
                        <div className="payment-card-content">
                          
                          
                          <div className="payment-info-row">
                            <span className="info-label">📝 Përshkrimi:</span>
                            <span className="description-text">{p.displayText}</span>
                          </div>
                          
                          <div className="payment-info-row">
                            <span className="info-label">💰 Shuma:</span>
                            <span className="amount-value">€{p.amount.toFixed(2)}</span>
                          </div>

                          <div className="payment-info-row">
                            <span className="info-label">📝 Koha:</span>
                            <span className="description-text">{formatDateTime(p.enteredOn.toString())}</span>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary Statistics */}
              {payments.length > 0 && (
                <div className="payments-summary">
                  <div className="summary-cards">
                    {(() => {
                      const breakdown = calculatePaymentBreakdown();
                      return (
                        <div className="breakdown-container">
                          <div className="breakdown-item">
                            <span className="breakdown-label">Total:</span>
                            <span className="breakdown-value">€{breakdown.total.toFixed(2)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">Gabim:</span>
                            <span className="breakdown-value mistake">€{breakdown.mistake.toFixed(2)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">Staff:</span>
                            <span className="breakdown-value staff">€{breakdown.staff.toFixed(2)}</span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">Për barazim:</span>
                            <span className="breakdown-value settlement-amount">€{breakdown.settlement.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settle Confirmation Modal - Rendered via Portal */}
      {showSettleModal && ReactDOM.createPortal(
        <div 
          className="modal-backdrop settle-modal-backdrop" 
          onClick={handleModalBackdropClick}
        >
          <div 
            className="modal-content settle-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header settle-modal-header">
              <p className="modal-description">
                A dëshironi që ta barazoni këtë punëtor?
              </p>
              
              <div className="modal-stats">
                <div className="stat-item">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-label">Regjistrime</div>
                    <div className="stat-value">{payments.length}</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-label">Shuma Totale</div>
                    <div className="stat-value">€{payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions settle-modal-actions">
              <button 
                onClick={handleSettleCancel} 
                className="modal-btn modal-btn-cancel"
                type="button"
              >
                <span className="btn-icon">↩️</span>
                <span className="btn-text">Anulo</span>
              </button>
              <button 
                onClick={handleSettleConfirm} 
                className="modal-btn modal-btn-confirm"
                type="button"
              >
                <span className="btn-icon">⚖️</span>
                <span className="btn-text">Barazohu</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default BalanceManagement;
