import React, { useState, useEffect } from 'react';
import { userService, CreateUserRequest } from '../services/userService';
import { paymentService, Payment } from '../services/paymentService';
import { ApiError } from '../services/api';
import './StaffView.css';

interface User {
  id: number;
  username: string;
  email?: string;
  role?: string;
  isActive: boolean;
  createdOn?: string;
  lastLogin?: string;
  isAdmin?: boolean;
}


interface StaffViewProps {
  onBack?: () => void;
}

const StaffView: React.FC<StaffViewProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);
  
  // Registration form states
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Payment calculation states
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');


  useEffect(() => {
    const initializeComponent = async () => {
      await loadStaff();
      // Check admin status after staff is loaded
      setTimeout(() => {
        checkCurrentUserAdminStatus();
      }, 100);
    };
    initializeComponent();
  }, []);

  // Check admin status when users array changes
  useEffect(() => {
    if (users.length > 0 && !currentUserIsAdmin) {
      console.log('🔍 Users loaded, checking admin status...');
      checkCurrentUserAdminStatus();
    }
  }, [users, currentUserIsAdmin]);

  const checkCurrentUserAdminStatus = () => {
    try {
      console.log('🔍 checkCurrentUserAdminStatus called, current admin status:', currentUserIsAdmin);
      
      // If already admin, don't change it
      if (currentUserIsAdmin) {
        console.log('🔍 Already admin, no need to check again');
        return;
      }
      
      // Get the current user from localStorage or token
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('❌ No token found');
        setCurrentUserIsAdmin(false);
        return;
      }

      // SECURITY FIX: Use token claims directly instead of database lookup
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 Full token payload:', payload);
      
      // Check isAdmin claim directly from token
      const isAdminFromToken = payload.isAdmin === 'True' || payload.isAdmin === true || payload.isAdmin === 'true';
      
      console.log('🔍 Admin status from token:', { isAdminFromToken, isAdminClaim: payload.isAdmin });
      
      if (isAdminFromToken) {
        console.log('✅ User is admin according to token');
        setCurrentUserIsAdmin(true);
      } else {
        console.log('❌ User is not admin according to token');
        setCurrentUserIsAdmin(false);
      }
      
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      setCurrentUserIsAdmin(false);
    }
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await userService.getAllUsers();
      
      if (response.isSuccessfull && response.data) {
        setUsers(response.data);
        console.log('👥 Staff loaded:', response.data);
      } else {
        setError(response.errorMessage || 'Gabim në ngarkimin e stafit');
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ngarkimin e stafit');
    } finally {
      setLoading(false);
    }
  };


  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!newUsername.trim()) {
      setError('Ju lutem shkruani emrin e përdoruesit');
      setIsSubmitting(false);
      return;
    }

    if (!newPassword.trim()) {
      setError('Ju lutem shkruani fjalëkalimin');
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 4) {
      setError('Fjalëkalimi duhet të jetë të paktën 4 karaktere');
      setIsSubmitting(false);
      return;
    }

    try {
      const userData: CreateUserRequest = {
        username: newUsername.trim(),
        password: newPassword,
        isAdmin: isAdmin
      };

      console.log('🔍 Attempting to create user:', userData);
      const response = await userService.createUser(userData);
      console.log('🔍 Create user response:', response);

      if (response.isSuccessfull) {
        console.log('✅ User created successfully');
        // Reset form
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
        setIsAdmin(false);
        setShowRegistrationForm(false);
        // Reload staff list
        await loadStaff();
      } else {
        console.error('❌ Create user failed:', response.errorMessage);
        setError(response.errorMessage || 'Gabim në krijimin e përdoruesit');
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në krijimin e përdoruesit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAdminStatus = async (userId: number, _currentAdminStatus: boolean) => {
    if (!currentUserIsAdmin) {
      setError('Vetëm admini mund të ndryshojë statusin e përdoruesit');
      return;
    }

    // Find the user
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowAdminModal(true);
    }
  };

  const handleDeleteUser = async (userId: number, _username: string) => {
    if (!currentUserIsAdmin) {
      setError('Vetëm admini mund të fshijë përdoruesit');
      return;
    }

    // Find the user
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowDeleteModal(true);
    }
  };

  // Handle payment calculation for user
  const handleUserPaymentCalculation = async (userId: number, username: string) => {
    try {
      setPaymentLoading(true);
      setPaymentError('');
      
      console.log('🔍 Loading payments for user:', { userId, username });
      
      const response = await paymentService.getPaymentsByEmployee(userId);
      
      if (response.isSuccessfull && response.data) {
        console.log('✅ User payments loaded:', response.data);
        console.log('🔍 Payment details:', response.data.map(p => ({
          displayText: p.displayText,
          amount: p.amount,
          isMistake: p.isMistake,
          roomDetailsId: p.roomDetailsId,
          supplyAndSellItemsId: p.supplyAndSellItemsId
        })));
        setUserPayments(response.data);
        
        // Find the user and set as selected
        const user = users.find(u => u.id === userId);
        if (user) {
          setSelectedUser(user);
          setShowPaymentModal(true);
        }
      } else {
        setPaymentError(response.errorMessage || 'Gabim në ngarkimin e pagesave');
      }
    } catch (error) {
      console.error('❌ Error loading user payments:', error);
      const apiError = error as ApiError;
      setPaymentError(apiError.message || 'Gabim në ngarkimin e pagesave');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Calculate payment breakdown
  const calculatePaymentBreakdown = () => {
    if (!userPayments || userPayments.length === 0) {
      return {
        total: 0,
        mistake: 0,
        staff: 0,
        settlement: 0
      };
    }

    console.log('🔍 Calculating breakdown for payments:', userPayments);

    const total = userPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Filter mistakes (payments with isMistake = true)
    const mistake = userPayments
      .filter(payment => payment.isMistake)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Filter staff payments (payments marked as isForStaff = true and not mistakes)
    const staff = userPayments
      .filter(payment => !payment.isMistake && payment.isForStaff)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Room settlements are payments with RoomDetailsId (room confirmations) that are not staff and not mistakes
    const roomSettlements = userPayments
      .filter(payment => !payment.isMistake && payment.roomDetailsId && !payment.isForStaff)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Settlement = Staff payments + Room settlements - Mistakes
    const settlement = staff + roomSettlements - mistake;

    console.log('💰 Breakdown calculated:', {
      total,
      mistake,
      staff,
      roomSettlements,
      settlement,
      allPayments: userPayments.map(p => ({
        displayText: p.displayText,
        amount: p.amount,
        isMistake: p.isMistake,
        isForStaff: p.isForStaff,
        roomDetailsId: p.roomDetailsId,
        supplyAndSellItemsId: p.supplyAndSellItemsId
      }))
    });

    return { total, mistake, staff, settlement };
  };


  // Confirm admin status change
  const confirmAdminChange = async () => {
    if (!selectedUser) return;

    try {
      setError('');
      const response = await userService.updateAdminStatus(selectedUser.id, !selectedUser.isAdmin);
      
      if (response.isSuccessfull) {
        console.log('✅ Admin status updated successfully');
        await loadStaff();
        await checkCurrentUserAdminStatus();
      } else {
        setError(response.errorMessage || 'Gabim në ndryshimin e statusit të adminit');
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ndryshimin e statusit të adminit');
    } finally {
      setShowAdminModal(false);
      setSelectedUser(null);
    }
  };

  // Confirm user deletion
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setError('');
      const response = await userService.deleteUser(selectedUser.id);
      
      if (response.isSuccessfull) {
        console.log('✅ User deleted successfully');
        await loadStaff();
      } else {
        setError(response.errorMessage || 'Gabim në fshirjen e përdoruesit');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në fshirjen e përdoruesit');
    } finally {
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <div className="staff-view-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Duke ngarkuar stafin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-view-container">
      <div className="staff-header">
        <div className="header-content">
          <h1>👥 Menaxhimi i Stafit</h1>
          <p>Shiko dhe menaxho përdoruesit e sistemit</p>
          <p style={{fontSize: '12px', color: currentUserIsAdmin ? '#10b981' : '#ef4444', marginTop: '4px'}}>
            Status: {currentUserIsAdmin ? '✅ Admin' : '❌ Jo Admin'}
          </p>
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

      <div className="staff-content">
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Kërko përdorues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="action-buttons">
            {currentUserIsAdmin && (
              <button 
                onClick={() => setShowRegistrationForm(!showRegistrationForm)}
                className="add-user-button"
              >
                {showRegistrationForm ? '❌ Anulo' : '➕ Shto Përdorues të Ri'}
              </button>
            )}
          </div>
        </div>

        {/* Registration Form */}
        {showRegistrationForm && (
          <div className="registration-form-container">
            <div className="registration-form">
              <h3>➕ Shto Përdorues të Ri</h3>
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label htmlFor="newUsername">Emri i Përdoruesit:</label>
                  <input
                    type="text"
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Shkruani emrin e përdoruesit"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">Fjalëkalimi:</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Shkruani fjalëkalimin"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Konfirmoni Fjalëkalimin:</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmoni fjalëkalimin"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isAdmin}
                      onChange={(e) => setIsAdmin(e.target.checked)}
                    />
                  </label>
                </div>
                
                <div className="form-buttons">
                  <button 
                    type="button" 
                    onClick={() => setShowRegistrationForm(false)}
                    className="cancel-button"
                  >
                    Anulo
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Duke u regjistruar...' : 'Regjistro Përdoruesin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Përdoruesi</th>
                <th>Admin</th>
                <th>Veprime</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(user => !searchTerm || user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((user, idx) => (
                  <tr key={user.id ?? idx} className="staff-row">
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      <div className="user-details">
                        <div className="username">{user.username}</div>
                      </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-section">
                        <button
                          onClick={() => handleToggleAdminStatus(user.id, user.isAdmin || false)}
                          className={`admin-toggle-button ${user.isAdmin ? 'admin' : 'user'}`}
                          disabled={!currentUserIsAdmin}
                          title={currentUserIsAdmin ? 'Klikoni për të ndryshuar statusin e adminit' : 'Vetëm admini mund të ndryshojë statusin e adminit'}
                        >
                          {user.isAdmin ? 'Heq Admin' : 'Bëj Admin'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="delete-button"
                          disabled={!currentUserIsAdmin}
                          title={currentUserIsAdmin ? 'Fshi përdoruesin' : 'Vetëm admini mund të fshijë përdoruesit'}
                        >
                          🗑️ Fshi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="no-results">
              <p>Nuk u gjetën përdorues për këtë kërkesë.</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Status Change Modal */}
      {showAdminModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Konfirmo Ndryshimin e Statusit të Adminit</h3>
            <p>
              A doni të {selectedUser.isAdmin ? 'heqni' : 'jepni'} privilegjet e adminit për përdoruesin 
              <strong> "{selectedUser.username}"</strong>?
            </p>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel-button" 
                onClick={() => {
                  setShowAdminModal(false);
                  setSelectedUser(null);
                }}
              >
                ❌ Anulo
              </button>
              <button 
                className="modal-button confirm-button" 
                onClick={confirmAdminChange}
              >
                ✅ Konfirmo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Konfirmo Fshirjen e Përdoruesit</h3>
            <p>
              A jeni të sigurt që doni të fshini përdoruesin 
              <strong> "{selectedUser.username}"</strong>?
            </p>
            <p className="warning-text">
              ⚠️ Ky veprim nuk mund të anulohet!
            </p>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel-button" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                ❌ Anulo
              </button>
              <button 
                className="modal-button delete-button" 
                onClick={confirmDeleteUser}
              >
                🗑️ Fshi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Calculation Modal */}
      {showPaymentModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <h3>💰 Kalkulimi i Pagesave - {selectedUser.username}</h3>
            
            {paymentError && (
              <div className="error-banner">
                <span>⚠️ {paymentError}</span>
              </div>
            )}
            
            {paymentLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Duke ngarkuar pagesat...</p>
              </div>
            ) : (
              <div className="payment-breakdown">
                {(() => {
                  const breakdown = calculatePaymentBreakdown();
                  return (
                    <div className="breakdown-container">
                      <div className="breakdown-item">
                        <span className="breakdown-label">Total:</span>
                        <span className="breakdown-value">€{breakdown.total.toFixed(2)} Total</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Gabim:</span>
                        <span className="breakdown-value mistake">€{breakdown.mistake.toFixed(2)} isMistake</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">Staff:</span>
                        <span className="breakdown-value staff">€{breakdown.staff.toFixed(2)} ForStaff</span>
                      </div>
                      <div className="breakdown-item settlement">
                        <span className="breakdown-label">Për barazim:</span>
                        <span className="breakdown-value settlement-amount">€{breakdown.settlement.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
                
                {userPayments.length > 0 && (
                  <div className="payments-list">
                    <h4>📋 Lista e Pagesave:</h4>
                    <div className="payments-scroll">
                      {userPayments.map((payment, idx) => (
                        <div key={`payment-${idx}`} className={`payment-item ${payment.isMistake ? 'mistake' : 'success'}`}>
                          <div className="payment-description">
                            {payment.displayText}
                            <div className="payment-type-info">
                              {payment.roomDetailsId && <span className="type-badge room">🏨 Room</span>}
                              {payment.supplyAndSellItemsId && <span className="type-badge staff">🛒 Staff</span>}
                              {payment.isForStaff && <span className="type-badge staff">👥 ForStaff</span>}
                              {payment.isMistake && <span className="type-badge mistake">❌ Mistake</span>}
                            </div>
                          </div>
                          <div className="payment-amount">€{payment.amount.toFixed(2)}</div>
                          <div className="payment-status">
                            {payment.isMistake ? '❌ Gabim' : '✅ Sukses'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="modal-buttons">
              <button 
                className="modal-button cancel-button" 
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedUser(null);
                  setUserPayments([]);
                  setPaymentError('');
                }}
              >
                ❌ Mbyll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
