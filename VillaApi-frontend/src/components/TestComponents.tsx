import React from 'react';
import RoomModelManagement from './RoomModelManagement';
import RoomTypeManagement from './RoomTypeManagement';
import RoomStatusManagement from './RoomStatusManagement';
import RoomHistory from './RoomHistory';
import RoomDetailsView from './RoomDetailsView';
import ProductCategoryManagement from './ProductCategoryManagement';
import ProductStockManagement from './ProductStockManagement';
import PaymentManagement from './PaymentManagement';
import DashboardAnalytics from './DashboardAnalytics';
import SystemSettings from './SystemSettings';
import ApiTestPanel from './ApiTestPanel';

interface TestComponentsProps {
  userRole?: 'admin' | 'worker';
}

const TestComponents: React.FC<TestComponentsProps> = ({ userRole = 'worker' }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test i të Gjitha Komponentëve të Rinj</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>🧪 API Test Panel</h2>
        <ApiTestPanel />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Dashboard Analytics</h2>
        <DashboardAnalytics />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Room Model Management</h2>
        <RoomModelManagement />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Room Type Management</h2>
        <RoomTypeManagement />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Room Status Management</h2>
        <RoomStatusManagement userRole={userRole} />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Room History</h2>
        <RoomHistory />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Room Details View</h2>
        <RoomDetailsView roomNo="101" />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Product Category Management</h2>
        <ProductCategoryManagement />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Product Stock Management</h2>
        <ProductStockManagement />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Payment Management</h2>
        <PaymentManagement />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>System Settings</h2>
        <SystemSettings />
      </div>
    </div>
  );
};

export default TestComponents;
