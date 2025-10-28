import React, { useState } from 'react';
import { authService } from '../services';
import { ApiError } from '../services/api';
import './ChangePassword.css';

interface ChangePasswordProps {
  onBack?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onBack }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!oldPassword.trim()) {
      setError('Fjalëkalimi aktual është i detyrueshëm');
      return;
    }

    if (!newPassword.trim()) {
      setError('Fjalëkalimi i ri është i detyrueshëm');
      return;
    }

    if (newPassword.length < 6) {
      setError('Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Fjalëkalimet e reja nuk përputhen');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Fjalëkalimi i ri duhet të jetë i ndryshëm nga ai aktual');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get current user ID from token or localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Nuk jeni i kyçur në sistem');
        return;
      }

      // Get all users to find the current user's ID
      const usersResponse = await authService.getAllUsers();
      if (!usersResponse.isSuccessfull || !usersResponse.data) {
        setError('Gabim në marrjen e informacionit të përdoruesit');
        return;
      }

      // Find current user by username (assuming worker username is 'worker')
      const currentUser = usersResponse.data.find(user => user.username === 'worker');
      if (!currentUser) {
        setError('Përdoruesi nuk u gjet');
        return;
      }

      const response = await authService.changePassword({
        userId: currentUser.id,
        oldPassword,
        password: newPassword
      });

      if (response.isSuccessfull) {
        setSuccess('Fjalëkalimi u ndryshua me sukses!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response.errorMessage || 'Gabim në ndryshimin e fjalëkalimit');
      }
    } catch (error) {
      console.error('Change password error:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ndryshimin e fjalëkalimit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-header">
        <div className="header-content">
          <h1>🔐 Ndrysho Fjalëkalimin</h1>
          <p>Përditëso fjalëkalimin tuaj për siguri më të mirë</p>
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

      {success && (
        <div className="success-banner">
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')} className="close-success">×</button>
        </div>
      )}

      <div className="change-password-content">
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Fjalëkalimi Aktual:</label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Shkruani fjalëkalimin aktual"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Fjalëkalimi i Ri:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Shkruani fjalëkalimin e ri"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmoni Fjalëkalimin e Ri:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmoni fjalëkalimin e ri"
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'Duke Ndryshuar...' : 'Ndrysho Fjalëkalimin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
