import React, { useState } from 'react';
import ProductManagement from './ProductManagement';
import StockView from './StockView';
import DrinksSale from './DrinksSale';
// DashboardAnalytics removed: open admin panel directly on Rooms
import BalanceManagement from './BalanceManagement';
import './AdminDashboard.css';

interface AdminDashboardProps {
  onBack: () => void;
}

type AdminTab = 'dashboard' | 'products' | 'stock' | 'drinks' | 'balance';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('balance');

  const tabs = [
    { id: 'products' as AdminTab, label: 'Produktet', icon: '🍺' },
    { id: 'stock' as AdminTab, label: 'Stoku', icon: '📦' },
    { id: 'drinks' as AdminTab, label: 'Furnizimi', icon: '🥤' },
    { id: 'balance' as AdminTab, label: 'Barazimi', icon: '⚖️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />;
      case 'stock':
        return <StockView />;
      case 'drinks':
        return <DrinksSale />;
      case 'balance':
        return <BalanceManagement />;
      default:
        return <BalanceManagement />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Paneli i Administratorit</h1>
        <button onClick={onBack} className="back-button">
          ← Kthehu
        </button>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
