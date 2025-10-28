import React, { useState } from 'react';
import './PrivilegeManagement.css';

interface Privilege {
  id: string;
  code: string;
  name: string;
  description: string;
  formName: string;
  isActive: boolean;
}

interface UserPrivilege {
  userId: string;
  userName: string;
  privileges: Privilege[];
}

interface FormCapability {
  formName: string;
  capabilities: string[];
}

const PrivilegeManagement: React.FC = () => {
  const [privileges, setPrivileges] = useState<Privilege[]>([
    {
      id: '1',
      code: 'VIEW_ROOMS',
      name: 'Shiko Dhomat',
      description: 'Mund të shohë listën e dhomave',
      formName: 'RoomGrid',
      isActive: true
    },
    {
      id: '2',
      code: 'EDIT_ROOMS',
      name: 'Ndrysho Dhomat',
      description: 'Mund të ndryshojë dhomat',
      formName: 'RoomGrid',
      isActive: true
    },
    {
      id: '3',
      code: 'VIEW_PRODUCTS',
      name: 'Shiko Produktet',
      description: 'Mund të shohë listën e produkteve',
      formName: 'ProductManagement',
      isActive: true
    },
    {
      id: '4',
      code: 'EDIT_PRODUCTS',
      name: 'Ndrysho Produktet',
      description: 'Mund të ndryshojë produktet',
      formName: 'ProductManagement',
      isActive: true
    },
    {
      id: '5',
      code: 'VIEW_USERS',
      name: 'Shiko Përdoruesit',
      description: 'Mund të shohë listën e përdoruesve',
      formName: 'UserManagement',
      isActive: true
    },
    {
      id: '6',
      code: 'EDIT_USERS',
      name: 'Ndrysho Përdoruesit',
      description: 'Mund të ndryshojë përdoruesit',
      formName: 'UserManagement',
      isActive: true
    },
    {
      id: '7',
      code: 'VIEW_PAYMENTS',
      name: 'Shiko Pagesat',
      description: 'Mund të shohë pagesat',
      formName: 'PaymentManagement',
      isActive: true
    },
    {
      id: '8',
      code: 'CONFIRM_PAYMENTS',
      name: 'Konfirmo Pagesat',
      description: 'Mund të konfirmojë pagesat',
      formName: 'PaymentManagement',
      isActive: true
    }
  ]);

  const [userPrivileges, setUserPrivileges] = useState<UserPrivilege[]>([
    {
      userId: '1',
      userName: 'Admin',
      privileges: privileges.filter(p => ['VIEW_ROOMS', 'EDIT_ROOMS', 'VIEW_PRODUCTS', 'EDIT_PRODUCTS', 'VIEW_USERS', 'EDIT_USERS', 'VIEW_PAYMENTS', 'CONFIRM_PAYMENTS'].includes(p.code))
    },
    {
      userId: '2',
      userName: 'Punëtori 1',
      privileges: privileges.filter(p => ['VIEW_ROOMS', 'VIEW_PRODUCTS', 'VIEW_PAYMENTS'].includes(p.code))
    }
  ]);

  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrivilege, setEditingPrivilege] = useState<Privilege | null>(null);

  const forms = ['RoomGrid', 'ProductManagement', 'UserManagement', 'PaymentManagement', 'AdminDashboard'];

  const filteredPrivileges = privileges.filter(privilege => {
    const matchesSearch = privilege.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         privilege.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         privilege.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesForm = selectedForm === '' || privilege.formName === selectedForm;
    
    return matchesSearch && matchesForm;
  });

  const handleAddPrivilege = (privilegeData: Omit<Privilege, 'id'>) => {
    const newPrivilege: Privilege = {
      ...privilegeData,
      id: Date.now().toString()
    };
    setPrivileges(prev => [...prev, newPrivilege]);
    setShowAddModal(false);
  };

  const handleEditPrivilege = (privilegeData: Omit<Privilege, 'id'>) => {
    if (editingPrivilege) {
      setPrivileges(prev =>
        prev.map(privilege =>
          privilege.id === editingPrivilege.id
            ? { ...privilege, ...privilegeData }
            : privilege
        )
      );
      setEditingPrivilege(null);
    }
  };

  const handleDeletePrivilege = (id: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë privilegj?')) {
      setPrivileges(prev => prev.filter(privilege => privilege.id !== id));
      // Remove from user privileges as well
      setUserPrivileges(prev =>
        prev.map(user => ({
          ...user,
          privileges: user.privileges.filter(p => p.id !== id)
        }))
      );
    }
  };

  const handleTogglePrivilege = (id: string) => {
    setPrivileges(prev =>
      prev.map(privilege =>
        privilege.id === id
          ? { ...privilege, isActive: !privilege.isActive }
          : privilege
      )
    );
  };

  const handleEdit = (privilege: Privilege) => {
    setEditingPrivilege(privilege);
  };

  const handleUserPrivilegeChange = (userId: string, privilegeId: string, hasPrivilege: boolean) => {
    setUserPrivileges(prev =>
      prev.map(user => {
        if (user.userId === userId) {
          if (hasPrivilege) {
            const privilege = privileges.find(p => p.id === privilegeId);
            if (privilege && !user.privileges.find(p => p.id === privilegeId)) {
              return {
                ...user,
                privileges: [...user.privileges, privilege]
              };
            }
          } else {
            return {
              ...user,
              privileges: user.privileges.filter(p => p.id !== privilegeId)
            };
          }
        }
        return user;
      })
    );
  };

  const getFormCapabilities = (formName: string): FormCapability => {
    const formPrivileges = privileges.filter(p => p.formName === formName);
    return {
      formName,
      capabilities: formPrivileges.map(p => p.code)
    };
  };

  const totalPrivileges = privileges.length;
  const activePrivileges = privileges.filter(p => p.isActive).length;
  const totalUsers = userPrivileges.length;

  return (
    <div className="privilege-management">
      <div className="privilege-header">
        <h2>Menaxhimi i Privilegjeve</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="add-privilege-btn"
        >
          + Shto Privilegj të Ri
        </button>
      </div>

      <div className="privilege-stats">
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-content">
            <span className="stat-number">{totalPrivileges}</span>
            <span className="stat-label">Privilegje Totale</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-number">{activePrivileges}</span>
            <span className="stat-label">Privilegje Aktive</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-number">{totalUsers}</span>
            <span className="stat-label">Përdorues</span>
          </div>
        </div>
      </div>

      <div className="privilege-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Kërko:</label>
            <input
              type="text"
              id="search"
              placeholder="Emër, përshkrim, kod..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="form-filter">Forma:</label>
            <select 
              id="form-filter"
              value={selectedForm} 
              onChange={(e) => setSelectedForm(e.target.value)}
              className="filter-select"
            >
              <option value="">Të Gjitha</option>
              {forms.map(form => (
                <option key={form} value={form}>{form}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="privilege-tabs">
        <div className="tab-content">
          <div className="privileges-section">
            <h3>Lista e Privilegjeve</h3>
            <div className="privileges-grid">
              {filteredPrivileges.map(privilege => (
                <div key={privilege.id} className={`privilege-card ${!privilege.isActive ? 'inactive' : ''}`}>
                  <div className="privilege-header-card">
                    <div className="privilege-info">
                      <h4 className="privilege-name">{privilege.name}</h4>
                      <span className="privilege-code">{privilege.code}</span>
                    </div>
                    <div className="privilege-status">
                      <span className={`status-badge ${privilege.isActive ? 'active' : 'inactive'}`}>
                        {privilege.isActive ? '✅ Aktiv' : '❌ Joaktiv'}
                      </span>
                    </div>
                  </div>

                  <div className="privilege-description">
                    <p>{privilege.description}</p>
                  </div>

                  <div className="privilege-details">
                    <div className="detail-item">
                      <span className="detail-label">Forma:</span>
                      <span className="detail-value">{privilege.formName}</span>
                    </div>
                  </div>

                  <div className="privilege-actions">
                    <button 
                      onClick={() => handleTogglePrivilege(privilege.id)}
                      className={`toggle-btn ${privilege.isActive ? 'deactivate' : 'activate'}`}
                      title={privilege.isActive ? 'Deaktivizo' : 'Aktivizo'}
                    >
                      {privilege.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button 
                      onClick={() => handleEdit(privilege)}
                      className="edit-btn"
                      title="Ndrysho"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeletePrivilege(privilege.id)}
                      className="delete-btn"
                      title="Fshi"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="user-privileges-section">
            <h3>Privilegjet e Përdoruesve</h3>
            <div className="user-privileges-table">
              <table>
                <thead>
                  <tr>
                    <th>Përdoruesi</th>
                    {privileges.map(privilege => (
                      <th key={privilege.id} title={privilege.description}>
                        {privilege.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {userPrivileges.map(user => (
                    <tr key={user.userId}>
                      <td className="user-name">{user.userName}</td>
                      {privileges.map(privilege => {
                        const hasPrivilege = user.privileges.some(p => p.id === privilege.id);
                        return (
                          <td key={privilege.id} className="privilege-cell">
                            <input
                              type="checkbox"
                              checked={hasPrivilege}
                              onChange={(e) => handleUserPrivilegeChange(user.userId, privilege.id, e.target.checked)}
                              disabled={!privilege.isActive}
                              className="privilege-checkbox"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <PrivilegeModal
          onSave={handleAddPrivilege}
          onClose={() => setShowAddModal(false)}
          forms={forms}
        />
      )}

      {editingPrivilege && (
        <PrivilegeModal
          privilege={editingPrivilege}
          onSave={handleEditPrivilege}
          onClose={() => setEditingPrivilege(null)}
          forms={forms}
        />
      )}
    </div>
  );
};

interface PrivilegeModalProps {
  privilege?: Privilege;
  onSave: (privilegeData: Omit<Privilege, 'id'>) => void;
  onClose: () => void;
  forms: string[];
}

const PrivilegeModal: React.FC<PrivilegeModalProps> = ({ privilege, onSave, onClose, forms }) => {
  const [name, setName] = useState(privilege?.name || '');
  const [code, setCode] = useState(privilege?.code || '');
  const [description, setDescription] = useState(privilege?.description || '');
  const [formName, setFormName] = useState(privilege?.formName || '');
  const [isActive, setIsActive] = useState(privilege?.isActive ?? true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Emri i privilegjit është i detyrueshëm');
      return;
    }

    if (!code.trim()) {
      setError('Kodi i privilegjit është i detyrueshëm');
      return;
    }

    if (!description.trim()) {
      setError('Përshkrimi është i detyrueshëm');
      return;
    }

    if (!formName) {
      setError('Forma është e detyrueshme');
      return;
    }

    onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      formName,
      isActive
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
          <h2>{privilege ? 'Ndrysho Privilegjin' : 'Shto Privilegj të Ri'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Emri i Privilegjit:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shkruani emrin e privilegjit"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Kodi i Privilegjit:</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Shkruani kodin e privilegjit"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Përshkrimi:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shkruani përshkrimin e privilegjit"
              className="form-textarea"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="formName">Forma:</label>
            <select
              id="formName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Zgjidhni formën</option>
              {forms.map(form => (
                <option key={form} value={form}>{form}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">Privilegji Aktiv</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {privilege ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrivilegeManagement;
