import React, { useState } from 'react';
import './DashboardAnalytics.css';

interface DashboardStats {
  rooms: {
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
    occupancyRate: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  bookings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  payments: {
    today: number;
    pending: number;
    completed: number;
    total: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'product' | 'room';
  description: string;
  time: string;
  user: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

const DashboardAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'rooms' | 'products'>('overview');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today');

  const dashboardStats: DashboardStats = {
    rooms: {
      total: 16,
      occupied: 8,
      available: 6,
      maintenance: 2,
      occupancyRate: 50
    },
    revenue: {
      today: 125.50,
      thisWeek: 875.25,
      thisMonth: 3250.75,
      total: 15750.00
    },
    bookings: {
      today: 5,
      thisWeek: 28,
      thisMonth: 95,
      total: 450
    },
    products: {
      total: 39,
      lowStock: 3,
      outOfStock: 1,
      totalValue: 1250.50
    },
    payments: {
      today: 5,
      pending: 2,
      completed: 3,
      total: 125.50
    }
  };

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'booking',
      description: 'Rezervim i ri - Dhoma 101 (Gjergj Krasniqi)',
      time: '2 minuta më parë',
      user: 'Admin',
      status: 'success'
    },
    {
      id: '2',
      type: 'payment',
      description: 'Pagesë e konfirmuar - €25.00 (Ana Berisha)',
      time: '15 minuta më parë',
      user: 'Punëtor 1',
      status: 'success'
    },
    {
      id: '3',
      type: 'product',
      description: 'Stoku i ulët - Corona (5 bottles)',
      time: '1 orë më parë',
      user: 'Sistemi',
      status: 'warning'
    },
    {
      id: '4',
      type: 'room',
      description: 'Dhoma 103 u mbyll - Marko Petrović',
      time: '2 orë më parë',
      user: 'Punëtor 2',
      status: 'info'
    },
    {
      id: '5',
      type: 'product',
      description: 'Jashtë stokut - Coca Cola',
      time: '3 orë më parë',
      user: 'Sistemi',
      status: 'error'
    }
  ];

  const getRevenueData = (): ChartData => {
    const labels = ['Hënë', 'Martë', 'Mërkurë', 'Enjte', 'Premte', 'Shtunë', 'Diel'];
    const data = [120, 150, 180, 200, 175, 220, 190];
    
    return {
      labels,
      datasets: [{
        label: 'Të Ardhurat (€)',
        data,
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderColor: 'rgba(52, 152, 219, 1)'
      }]
    };
  };

  const getRoomOccupancyData = (): ChartData => {
    const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    const data = [45, 50, 60, 70, 65, 55];
    
    return {
      labels,
      datasets: [{
        label: 'Zënia e Dhomave (%)',
        data,
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        borderColor: 'rgba(39, 174, 96, 1)'
      }]
    };
  };

  const getProductSalesData = (): ChartData => {
    const labels = ['Alkool', 'Joalkool', 'Ushqim', 'Snacks'];
    const data = [450, 200, 300, 150];
    
    return {
      labels,
      datasets: [{
        label: 'Shitjet (€)',
        data,
        backgroundColor: [
          'rgba(231, 76, 60, 0.2)',
          'rgba(52, 152, 219, 0.2)',
          'rgba(243, 156, 18, 0.2)',
          'rgba(155, 89, 182, 0.2)'
        ],
        borderColor: [
          'rgba(231, 76, 60, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(243, 156, 18, 1)',
          'rgba(155, 89, 182, 1)'
        ]
      }]
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📋';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '🏨';
      case 'payment':
        return '💰';
      case 'product':
        return '📦';
      case 'room':
        return '🚪';
      default:
        return '📋';
    }
  };

  return (
    <div className="dashboard-analytics">
      <div className="dashboard-header">
        <h2>Dashboard - Statistikat e Përgjithshme</h2>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="time-range-select"
          >
            <option value="today">Sot</option>
            <option value="week">Këtë Javë</option>
            <option value="month">Këtë Muaj</option>
            <option value="year">Këtë Vit</option>
          </select>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Përmbledhje
        </button>
        <button 
          className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          💰 Të Ardhurat
        </button>
        <button 
          className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          🏨 Dhomat
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Produktet
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">🏨</div>
                <div className="stat-content">
                  <span className="stat-number">{dashboardStats.rooms.occupancyRate}%</span>
                  <span className="stat-label">Zënia e Dhomave</span>
                  <span className="stat-detail">{dashboardStats.rooms.occupied}/{dashboardStats.rooms.total} dhoma</span>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <span className="stat-number">€{dashboardStats.revenue.today.toFixed(2)}</span>
                  <span className="stat-label">Të Ardhurat Sot</span>
                  <span className="stat-detail">€{dashboardStats.revenue.thisWeek.toFixed(2)} këtë javë</span>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <span className="stat-number">{dashboardStats.bookings.today}</span>
                  <span className="stat-label">Rezervime Sot</span>
                  <span className="stat-detail">{dashboardStats.bookings.thisWeek} këtë javë</span>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <span className="stat-number">{dashboardStats.products.lowStock + dashboardStats.products.outOfStock}</span>
                  <span className="stat-label">Produkte me Problem</span>
                  <span className="stat-detail">{dashboardStats.products.lowStock} stok i ulët, {dashboardStats.products.outOfStock} jashtë stokut</span>
                </div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-card">
                <h3>Statusi i Dhomave</h3>
                <div className="room-status-grid">
                  <div className="room-status-item available">
                    <span className="status-icon">✅</span>
                    <span className="status-count">{dashboardStats.rooms.available}</span>
                    <span className="status-label">E Lirë</span>
                  </div>
                  <div className="room-status-item occupied">
                    <span className="status-icon">🔒</span>
                    <span className="status-count">{dashboardStats.rooms.occupied}</span>
                    <span className="status-label">E Zënë</span>
                  </div>
                  <div className="room-status-item maintenance">
                    <span className="status-icon">🔧</span>
                    <span className="status-count">{dashboardStats.rooms.maintenance}</span>
                    <span className="status-label">Mirëmbajtje</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Aktiviteti i Fundit</h3>
                <div className="activity-list">
                  {recentActivities.slice(0, 5).map(activity => (
                    <div key={activity.id} className={`activity-item ${activity.status}`}>
                      <div className="activity-icon">
                        {getActivityTypeIcon(activity.type)}
                      </div>
                      <div className="activity-content">
                        <p className="activity-description">{activity.description}</p>
                        <div className="activity-meta">
                          <span className="activity-time">{activity.time}</span>
                          <span className="activity-user">- {activity.user}</span>
                        </div>
                      </div>
                      <div className="activity-status">
                        {getStatusIcon(activity.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="revenue-tab">
            <div className="revenue-stats">
              <div className="revenue-card">
                <h3>Të Ardhurat Sot</h3>
                <div className="revenue-amount">€{dashboardStats.revenue.today.toFixed(2)}</div>
                <div className="revenue-change positive">+12% nga dje</div>
              </div>
              <div className="revenue-card">
                <h3>Të Ardhurat Këtë Javë</h3>
                <div className="revenue-amount">€{dashboardStats.revenue.thisWeek.toFixed(2)}</div>
                <div className="revenue-change positive">+8% nga javën e kaluar</div>
              </div>
              <div className="revenue-card">
                <h3>Të Ardhurat Këtë Muaj</h3>
                <div className="revenue-amount">€{dashboardStats.revenue.thisMonth.toFixed(2)}</div>
                <div className="revenue-change positive">+15% nga muajin e kaluar</div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Grafiku i Të Ardhurave (7 ditët e fundit)</h3>
              <div className="chart-placeholder">
                <div className="chart-mock">
                  <div className="chart-bars">
                    {[120, 150, 180, 200, 175, 220, 190].map((value, index) => (
                      <div 
                        key={index} 
                        className="chart-bar"
                        style={{ height: `${(value / 250) * 100}%` }}
                      >
                        <span className="bar-value">€{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    {['Hënë', 'Martë', 'Mërkurë', 'Enjte', 'Premte', 'Shtunë', 'Diel'].map((label, index) => (
                      <span key={index} className="chart-label">{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="rooms-tab">
            <div className="rooms-stats">
              <div className="rooms-card">
                <h3>Zënia e Dhomave</h3>
                <div className="occupancy-rate">{dashboardStats.rooms.occupancyRate}%</div>
                <div className="occupancy-detail">
                  {dashboardStats.rooms.occupied} nga {dashboardStats.rooms.total} dhoma janë të zëna
                </div>
              </div>
              <div className="rooms-card">
                <h3>Rezervime Sot</h3>
                <div className="bookings-count">{dashboardStats.bookings.today}</div>
                <div className="bookings-detail">
                  {dashboardStats.bookings.thisWeek} rezervime këtë javë
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Zënia e Dhomave Gjatë Ditës</h3>
              <div className="chart-placeholder">
                <div className="chart-mock">
                  <div className="chart-bars">
                    {[45, 50, 60, 70, 65, 55].map((value, index) => (
                      <div 
                        key={index} 
                        className="chart-bar"
                        style={{ height: `${value}%`, backgroundColor: '#27ae60' }}
                      >
                        <span className="bar-value">{value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((label, index) => (
                      <span key={index} className="chart-label">{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-tab">
            <div className="products-stats">
              <div className="products-card">
                <h3>Produktet Totale</h3>
                <div className="products-count">{dashboardStats.products.total}</div>
                <div className="products-detail">
                  Vlera totale: €{dashboardStats.products.totalValue.toFixed(2)}
                </div>
              </div>
              <div className="products-card warning">
                <h3>Produkte me Problem</h3>
                <div className="products-count">{dashboardStats.products.lowStock + dashboardStats.products.outOfStock}</div>
                <div className="products-detail">
                  {dashboardStats.products.lowStock} stok i ulët, {dashboardStats.products.outOfStock} jashtë stokut
                </div>
              </div>
            </div>

            <div className="chart-container">
              <h3>Shitjet sipas Kategorive</h3>
              <div className="chart-placeholder">
                <div className="chart-mock">
                  <div className="chart-bars">
                    {[
                      { value: 450, color: '#e74c3c', label: 'Alkool' },
                      { value: 200, color: '#3498db', label: 'Joalkool' },
                      { value: 300, color: '#f39c12', label: 'Ushqim' },
                      { value: 150, color: '#9b59b6', label: 'Snacks' }
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        className="chart-bar"
                        style={{ 
                          height: `${(item.value / 500) * 100}%`,
                          backgroundColor: item.color
                        }}
                      >
                        <span className="bar-value">€{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    {['Alkool', 'Joalkool', 'Ushqim', 'Snacks'].map((label, index) => (
                      <span key={index} className="chart-label">{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAnalytics;
