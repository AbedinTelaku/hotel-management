import React, { useState } from 'react';
import './SystemSettings.css';

interface SystemSettings {
  general: {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    currency: string;
    timezone: string;
    language: string;
  };
  business: {
    workingHours: {
      start: string;
      end: string;
      days: string[];
    };
    defaultRoomPrice: number;
    defaultExtraHourPrice: number;
    shippingCost: number;
    taxRate: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    lowStockAlerts: boolean;
    paymentReminders: boolean;
    systemAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
    twoFactorAuth: boolean;
    loginAttempts: number;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    backupLocation: string;
    retentionDays: number;
  };
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      businessName: 'Villa Motel',
      businessAddress: 'Rruga e Dibrës, Tirana, Albania',
      businessPhone: '+355 4X XXX XXX',
      businessEmail: 'info@villamotel.com',
      currency: 'EUR',
      timezone: 'Europe/Tirane',
      language: 'sq'
    },
    business: {
      workingHours: {
        start: '08:00',
        end: '24:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      defaultRoomPrice: 25.00,
      defaultExtraHourPrice: 5.00,
      shippingCost: 2.00,
      taxRate: 20.00
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      lowStockAlerts: true,
      paymentReminders: true,
      systemAlerts: true
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireStrongPassword: true,
      twoFactorAuth: false,
      loginAttempts: 5
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupLocation: 'local',
      retentionDays: 30
    }
  });

  const [activeTab, setActiveTab] = useState<'general' | 'business' | 'notifications' | 'security' | 'backup'>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedSettingChange = (section: keyof SystemSettings, parentField: string, childField: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...(prev[section] as any)[parentField],
          [childField]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', settings);
    setHasChanges(false);
    setIsEditing(false);
    alert('Cilësimet u ruajtën me sukses!');
  };

  const handleCancel = () => {
    // Reset to original values
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm('A jeni të sigurt që doni të rivendosni cilësimet në vlerat e paracaktuara?')) {
      // Reset to default values
      setHasChanges(false);
      setIsEditing(false);
      alert('Cilësimet u rivendosën në vlerat e paracaktuara!');
    }
  };

  return (
    <div className="system-settings">
      <div className="settings-header">
        <h2>Cilësimet e Sistemit</h2>
        <div className="header-actions">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-btn"
            >
              ✏️ Ndrysho
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                onClick={handleSave}
                className="save-btn"
                disabled={!hasChanges}
              >
                💾 Ruaj
              </button>
              <button 
                onClick={handleCancel}
                className="cancel-btn"
              >
                ❌ Anulo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          🏢 Të Përgjithshme
        </button>
        <button 
          className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          💼 Biznesi
        </button>
        <button 
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Njoftimet
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Siguria
        </button>
        <button 
          className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          💾 Backup
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="general-tab">
            <div className="settings-section">
              <h3>Informacioni i Biznesit</h3>
              <div className="settings-grid">
                <div className="setting-group">
                  <label htmlFor="businessName">Emri i Biznesit:</label>
                  <input
                    type="text"
                    id="businessName"
                    value={settings.general.businessName}
                    onChange={(e) => handleSettingChange('general', 'businessName', e.target.value)}
                    className="setting-input"
                    disabled={!isEditing}
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="businessAddress">Adresa:</label>
                  <textarea
                    id="businessAddress"
                    value={settings.general.businessAddress}
                    onChange={(e) => handleSettingChange('general', 'businessAddress', e.target.value)}
                    className="setting-textarea"
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="businessPhone">Telefoni:</label>
                  <input
                    type="tel"
                    id="businessPhone"
                    value={settings.general.businessPhone}
                    onChange={(e) => handleSettingChange('general', 'businessPhone', e.target.value)}
                    className="setting-input"
                    disabled={!isEditing}
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="businessEmail">Email:</label>
                  <input
                    type="email"
                    id="businessEmail"
                    value={settings.general.businessEmail}
                    onChange={(e) => handleSettingChange('general', 'businessEmail', e.target.value)}
                    className="setting-input"
                    disabled={!isEditing}
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="currency">Monedha:</label>
                  <select
                    id="currency"
                    value={settings.general.currency}
                    onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                    className="setting-select"
                    disabled={!isEditing}
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                    <option value="ALL">Lek (L)</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="timezone">Zona Kohore:</label>
                  <select
                    id="timezone"
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    className="setting-select"
                    disabled={!isEditing}
                  >
                    <option value="Europe/Tirane">Europe/Tirane</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="language">Gjuha:</label>
                  <select
                    id="language"
                    value={settings.general.language}
                    onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                    className="setting-select"
                    disabled={!isEditing}
                  >
                    <option value="sq">Shqip</option>
                    <option value="en">English</option>
                    <option value="it">Italiano</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="business-tab">
            <div className="settings-section">
              <h3>Orët e Punës</h3>
              <div className="settings-grid">
                <div className="setting-group">
                  <label htmlFor="workStart">Ora e Fillimit:</label>
                  <input
                    type="time"
                    id="workStart"
                    value={settings.business.workingHours.start}
                    onChange={(e) => handleNestedSettingChange('business', 'workingHours', 'start', e.target.value)}
                    className="setting-input"
                    disabled={!isEditing}
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="workEnd">Ora e Mbarimit:</label>
                  <input
                    type="time"
                    id="workEnd"
                    value={settings.business.workingHours.end}
                    onChange={(e) => handleNestedSettingChange('business', 'workingHours', 'end', e.target.value)}
                    className="setting-input"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Çmimet e Paracaktuara</h3>
              <div className="settings-grid">
                <div className="setting-group">
                  <label htmlFor="defaultRoomPrice">Çmimi i Paracaktuar i Dhomës (€):</label>
                  <input
                    type="number"
                    id="defaultRoomPrice"
                    value={settings.business.defaultRoomPrice}
                    onChange={(e) => handleSettingChange('business', 'defaultRoomPrice', parseFloat(e.target.value))}
                    className="setting-input"
                    disabled={!isEditing}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="defaultExtraHourPrice">Çmimi për Orë Shtesë (€):</label>
                  <input
                    type="number"
                    id="defaultExtraHourPrice"
                    value={settings.business.defaultExtraHourPrice}
                    onChange={(e) => handleSettingChange('business', 'defaultExtraHourPrice', parseFloat(e.target.value))}
                    className="setting-input"
                    disabled={!isEditing}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="shippingCost">Kostoja e Transportit (€):</label>
                  <input
                    type="number"
                    id="shippingCost"
                    value={settings.business.shippingCost}
                    onChange={(e) => handleSettingChange('business', 'shippingCost', parseFloat(e.target.value))}
                    className="setting-input"
                    disabled={!isEditing}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="taxRate">Norma e Taksës (%):</label>
                  <input
                    type="number"
                    id="taxRate"
                    value={settings.business.taxRate}
                    onChange={(e) => handleSettingChange('business', 'taxRate', parseFloat(e.target.value))}
                    className="setting-input"
                    disabled={!isEditing}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            <div className="settings-section">
              <h3>Cilësimet e Njoftimeve</h3>
              <div className="settings-grid">
                <div className="setting-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      className="setting-checkbox"
                      disabled={!isEditing}
                    />
                    <span className="checkbox-text">Njoftimet me Email</span>
                  </label>
                </div>

                <div className="setting-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.smsNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                      className="setting-checkbox"
                      disabled={!isEditing}
                    />
                    <span className="checkbox-text">Njoftimet me SMS</span>
                  </label>
                </div>

                <div className="setting-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.lowStockAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'lowStockAlerts', e.target.checked)}
                      className="setting-checkbox"
                      disabled={!isEditing}
                    />
                    <span className="checkbox-text">Sinjalizimet për Stok të Ulët</span>
                  </label>
                </div>

                <div className="setting-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.paymentReminders}
                      onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
                      className="setting-checkbox"
                      disabled={!isEditing}
                    />
                    <span className="checkbox-text">Kujtimet për Pagesa</span>
                  </label>
                </div>

                <div className="setting-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                      className="setting-checkbox"
                      disabled={!isEditing}
                    />
                    <span className="checkbox-text">Sinjalizimet e Sistemit</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-tab">
            <div className="settings-section">
              <h3>Cilësimet e Sigurisë</h3>
              <div className="settings-grid">
                <div className="setting-group">
                  <label htmlFor="sessionTimeout">Koha e Skadimit të Sesionit (minuta):</label>
                  <input
                    type="number"
                    id="sessionTimeout"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="setting-input"
                    disabled={!isEditing}
                    min="5"
                    max="480"
                  />
                </div>

                <div className="setting-group">
                  <label htmlFor="passwordMinLength">Gjatësia Minimale e Fjalëkalimit:</label>
                  <input
                    type="number"
                    id="passwordMinLength"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    className="setting-input"
                    disabled={!isEditing}
                    min="6"
                    max="20"
                  />
                </div>

                <div className="setting-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.security.requireStrongPassword}
                      onChange={(e) => handleSettingChange('security', 'requireStrongPassword', e.target.checked)}
                      className="setting-checkbox"
                      disabled={!isEditing}
                    />
                    <span className="checkbox-text">Kërko Fjalëkalim të Fortë</span>
                  </label>
                </div>

                <div className="setting-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                      className="setting-checkbox"
                      disabled={!isEditing}
                    />
                    <span className="checkbox-text">Autentifikimi me Dy Faktorë</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label htmlFor="loginAttempts">Numri i Përpjekjeve të Lejuara për Hyrje:</label>
                  <input
                    type="number"
                    id="loginAttempts"
                    value={settings.security.loginAttempts}
                    onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                    className="setting-input"
                    disabled={!isEditing}
                    min="3"
                    max="10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="backup-tab">
            <div className="settings-section">
              <h3>Cilësimet e Backup</h3>
              <div className="settings-grid">
                <div className="setting-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.backup.autoBackup}
                      onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                      className="setting-checkbox"
                      disabled={!isEditing}
                    />
                    <span className="checkbox-text">Backup Automatik</span>
                  </label>
                </div>

                <div className="setting-group">
                  <label htmlFor="backupFrequency">Frekuenca e Backup:</label>
                  <select
                    id="backupFrequency"
                    value={settings.backup.backupFrequency}
                    onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                    className="setting-select"
                    disabled={!isEditing}
                  >
                    <option value="hourly">Çdo Orë</option>
                    <option value="daily">Çdo Ditë</option>
                    <option value="weekly">Çdo Javë</option>
                    <option value="monthly">Çdo Muaj</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="backupLocation">Vendndodhja e Backup:</label>
                  <select
                    id="backupLocation"
                    value={settings.backup.backupLocation}
                    onChange={(e) => handleSettingChange('backup', 'backupLocation', e.target.value)}
                    className="setting-select"
                    disabled={!isEditing}
                  >
                    <option value="local">Lokal</option>
                    <option value="cloud">Cloud</option>
                    <option value="external">Disk i Jashtëm</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="retentionDays">Ditët e Ruajtjes:</label>
                  <input
                    type="number"
                    id="retentionDays"
                    value={settings.backup.retentionDays}
                    onChange={(e) => handleSettingChange('backup', 'retentionDays', parseInt(e.target.value))}
                    className="setting-input"
                    disabled={!isEditing}
                    min="1"
                    max="365"
                  />
                </div>
              </div>
            </div>

            <div className="backup-actions">
              <button className="backup-btn">
                💾 Bëj Backup Tani
              </button>
              <button className="restore-btn">
                🔄 Rivendos nga Backup
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-footer">
        <button 
          onClick={handleReset}
          className="reset-btn"
        >
          🔄 Rivendos në Paracaktuar
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
