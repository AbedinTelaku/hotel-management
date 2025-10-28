import React, { useState } from 'react';
import './UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'worker';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Admin',
      email: 'admin@motel.com',
      role: 'admin',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Punëtori 1',
      email: 'worker1@motel.com',
      role: 'worker',
      createdAt: '2024-01-02'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    setShowAddModal(false);
  };

  const handleEditUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (editingUser) {
      setUsers(prev => 
        prev.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...userData }
            : user
        )
      );
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë përdorues?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleChangePassword = (userId: string, newPassword: string) => {
    // Here you would typically send the password change to the backend
    alert('Fjalëkalimi u ndryshua me sukses!');
    setShowPasswordModal(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handlePasswordChange = (user: User) => {
    setShowPasswordModal(user);
  };

  return (
    <div className="user-management">
      <div className="user-header">
        <h2>Menaxhimi i Përdoruesve</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="add-user-btn"
        >
          + Shto Përdorues të Ri
        </button>
      </div>

      <div className="user-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Kërko përdorues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Emri</th>
              <th>Email</th>
              <th>Roli</th>
              <th>Data e Krijimit</th>
              <th>Veprimet</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'superadmin' ? 'Kryeadmin' : user.role === 'admin' ? 'Administrator' : 'Punëtor'}
                  </span>
                </td>
                <td>{user.createdAt}</td>
                <td>
                  <div className="user-actions">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="edit-btn"
                      title="Ndrysho"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handlePasswordChange(user)}
                      className="password-btn"
                      title="Ndrysho Fjalëkalimin"
                    >
                      🔑
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="delete-btn"
                      title="Fshi"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <UserModal
          onSave={handleAddUser}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingUser && (
        <UserModal
          user={editingUser}
          onSave={handleEditUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {showPasswordModal && (
        <PasswordModal
          user={showPasswordModal}
          onSave={handleChangePassword}
          onClose={() => setShowPasswordModal(null)}
        />
      )}
    </div>
  );
};

interface UserModalProps {
  user?: User;
  onSave: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<'superadmin' | 'admin' | 'worker'>(user?.role || 'worker');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Emri është i detyrueshëm');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Email-i duhet të jetë i vlefshëm');
      return;
    }

    if (!user && !password.trim()) {
      setError('Fjalëkalimi është i detyrueshëm për përdorues të ri');
      return;
    }

    if (password && password.length < 6) {
      setError('Fjalëkalimi duhet të ketë të paktën 6 karaktere');
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim(),
      role
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
          <h2>{user ? 'Ndrysho Përdoruesin' : 'Shto Përdorues të Ri'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Emri:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shkruani emrin"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Shkruani email-in"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Roli:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'superadmin' | 'admin' | 'worker')}
              className="form-select"
            >
              <option value="worker">Punëtor</option>
              <option value="admin">Administrator</option>
              <option value="superadmin">Kryeadmin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {user ? 'Fjalëkalimi i Ri (lëreni bosh për të ruajtur të vjetrin):' : 'Fjalëkalimi:'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={user ? 'Shkruani fjalëkalimin e ri' : 'Shkruani fjalëkalimin'}
              className="form-input"
              required={!user}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {user ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PasswordModalProps {
  user: User;
  onSave: (userId: string, newPassword: string) => void;
  onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ user, onSave, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Fjalëkalimi i ri është i detyrueshëm');
      return;
    }

    if (newPassword.length < 6) {
      setError('Fjalëkalimi duhet të ketë të paktën 6 karaktere');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      return;
    }

    onSave(user.id, newPassword);
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
          <h2>Ndrysho Fjalëkalimin - {user.name}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
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
            <label htmlFor="confirmPassword">Konfirmoni Fjalëkalimin:</label>
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

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              Ndrysho Fjalëkalimin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
