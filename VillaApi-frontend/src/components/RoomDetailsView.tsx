import React, { useState } from 'react';
import './RoomDetailsView.css';

interface RoomDetails {
  roomNo: string;
  title: string;
  roomModel: string;
  status: string;
  isActive: boolean;
  currentBooking?: {
    id: string;
    clientName: string;
    clientPlateNo: string;
    clientDocument: string;
    clientCarName: string;
    entryTime: string;
    roomType: string;
    totalPrice: number;
    isPaid: boolean;
    enteredBy: string;
  };
  recentBookings: {
    id: string;
    clientName: string;
    entryTime: string;
    exitTime: string;
    duration: string;
    roomType: string;
    totalPrice: number;
    isPaid: boolean;
    status: string;
  }[];
  statistics: {
    totalBookings: number;
    totalRevenue: number;
    averageDuration: string;
    lastCleaned: string;
    maintenanceCount: number;
  };
}

interface RoomDetailsViewProps {
  roomNo?: string;
  onClose?: () => void;
}

const RoomDetailsView: React.FC<RoomDetailsViewProps> = ({ roomNo = '101', onClose }) => {
  const [roomDetails, setRoomDetails] = useState<RoomDetails>({
    roomNo: '101',
    title: 'Dhoma 101',
    roomModel: 'STANDARD',
    status: 'occupied',
    isActive: true,
    currentBooking: {
      id: '1',
      clientName: 'Gjergj Krasniqi',
      clientPlateNo: 'AB 123 CD',
      clientDocument: '1234567890',
      clientCarName: 'BMW X5',
      entryTime: '2024-01-15 10:30:00',
      roomType: 'Pushim',
      totalPrice: 25.00,
      isPaid: false,
      enteredBy: 'Admin'
    },
    recentBookings: [
      {
        id: '2',
        clientName: 'Ana Berisha',
        entryTime: '2024-01-14 15:30:00',
        exitTime: '2024-01-14 18:30:00',
        duration: '3h 0m',
        roomType: '24 Orë',
        totalPrice: 50.00,
        isPaid: true,
        status: 'completed'
      },
      {
        id: '3',
        clientName: 'Marko Petrović',
        entryTime: '2024-01-13 20:00:00',
        exitTime: '2024-01-14 08:00:00',
        duration: '12h 0m',
        roomType: 'Fjetje',
        totalPrice: 35.00,
        isPaid: true,
        status: 'completed'
      },
      {
        id: '4',
        clientName: 'Sara Hoxha',
        entryTime: '2024-01-12 11:00:00',
        exitTime: '2024-01-12 13:30:00',
        duration: '2h 30m',
        roomType: 'Tjetër',
        totalPrice: 15.00,
        isPaid: true,
        status: 'completed'
      }
    ],
    statistics: {
      totalBookings: 45,
      totalRevenue: 1250.50,
      averageDuration: '4h 15m',
      lastCleaned: '2024-01-15 08:00:00',
      maintenanceCount: 2
    }
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'current' | 'history' | 'statistics'>('overview');

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'E Lirë', color: '#27ae60', icon: '✅' };
      case 'occupied':
        return { text: 'E Zënë', color: '#e74c3c', icon: '🔒' };
      case 'maintenance':
        return { text: 'Mirëmbajtje', color: '#f39c12', icon: '🔧' };
      case 'cleaning':
        return { text: 'Pastrim', color: '#3498db', icon: '🧹' };
      case 'out_of_order':
        return { text: 'Jashtë Shërbimit', color: '#95a5a6', icon: '❌' };
      default:
        return { text: 'I Panjohur', color: '#7f8c8d', icon: '❓' };
    }
  };

  const statusInfo = getStatusInfo(roomDetails.status);

  const handleStatusChange = (newStatus: string) => {
    setRoomDetails(prev => ({
      ...prev,
      status: newStatus
    }));
  };

  const handleCloseRoom = () => {
    if (window.confirm('A jeni të sigurt që doni ta mbyllni këtë dhomë?')) {
      setRoomDetails(prev => ({
        ...prev,
        status: 'available',
        currentBooking: undefined
      }));
    }
  };

  const handleMarkPaid = () => {
    if (roomDetails.currentBooking) {
      setRoomDetails(prev => ({
        ...prev,
        currentBooking: {
          ...prev.currentBooking!,
          isPaid: true
        }
      }));
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('sq-AL'),
      time: date.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const calculateDuration = (entryTime: string, exitTime?: string) => {
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    const diffMs = exit.getTime() - entry.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="room-details-view">
      <div className="room-details-header">
        <div className="header-info">
          <h2>{roomDetails.title}</h2>
          <div className="room-meta">
            <span className="room-model">Model: {roomDetails.roomModel}</span>
            <span className={`room-status ${roomDetails.status}`}>
              {statusInfo.icon} {statusInfo.text}
            </span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-button">
            ×
          </button>
        )}
      </div>

      <div className="room-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 Përmbledhje
        </button>
        <button 
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          🔒 Rezervimi Aktual
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📚 Historiku
        </button>
        <button 
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          📊 Statistikat
        </button>
      </div>

      <div className="room-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Statusi Aktual</h3>
                <div className="status-display">
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: statusInfo.color }}
                  ></div>
                  <span className="status-text">{statusInfo.text}</span>
                </div>
                {roomDetails.currentBooking && (
                  <div className="current-booking-info">
                    <p><strong>Klienti:</strong> {roomDetails.currentBooking.clientName}</p>
                    <p><strong>Hyrje:</strong> {formatDateTime(roomDetails.currentBooking.entryTime).date} {formatDateTime(roomDetails.currentBooking.entryTime).time}</p>
                    <p><strong>Kohëzgjatja:</strong> {calculateDuration(roomDetails.currentBooking.entryTime)}</p>
                  </div>
                )}
              </div>

              <div className="overview-card">
                <h3>Statistikat e Shpejta</h3>
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="stat-number">{roomDetails.statistics.totalBookings}</span>
                    <span className="stat-label">Rezervime</span>
                  </div>
                  <div className="quick-stat">
                    <span className="stat-number">€{roomDetails.statistics.totalRevenue.toFixed(2)}</span>
                    <span className="stat-label">Të Ardhura</span>
                  </div>
                  <div className="quick-stat">
                    <span className="stat-number">{roomDetails.statistics.averageDuration}</span>
                    <span className="stat-label">Kohëzgjatja Mesatare</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Veprimet e Shpejta</h3>
                <div className="quick-actions">
                  {roomDetails.status === 'occupied' && (
                    <>
                      <button 
                        onClick={handleMarkPaid}
                        className={`action-btn ${roomDetails.currentBooking?.isPaid ? 'paid' : 'unpaid'}`}
                        disabled={roomDetails.currentBooking?.isPaid}
                      >
                        {roomDetails.currentBooking?.isPaid ? '✅ E Paguar' : '💰 Shëno si të Paguar'}
                      </button>
                      <button onClick={handleCloseRoom} className="action-btn close">
                        🚪 Mbyll Dhomën
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setActiveTab('current')}
                    className="action-btn info"
                  >
                    👁️ Shiko Detajet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'current' && roomDetails.currentBooking && (
          <div className="current-tab">
            <div className="current-booking">
              <h3>Rezervimi Aktual</h3>
              <div className="booking-details">
                <div className="detail-section">
                  <h4>Informacioni i Klientit</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Emri:</label>
                      <span>{roomDetails.currentBooking.clientName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Targa:</label>
                      <span>{roomDetails.currentBooking.clientPlateNo}</span>
                    </div>
                    <div className="detail-item">
                      <label>Dokumenti:</label>
                      <span>{roomDetails.currentBooking.clientDocument}</span>
                    </div>
                    <div className="detail-item">
                      <label>Makina:</label>
                      <span>{roomDetails.currentBooking.clientCarName}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Detajet e Rezervimit</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Lloji i Dhomës:</label>
                      <span>{roomDetails.currentBooking.roomType}</span>
                    </div>
                    <div className="detail-item">
                      <label>Koha e Hyrjes:</label>
                      <span>{formatDateTime(roomDetails.currentBooking.entryTime).date} {formatDateTime(roomDetails.currentBooking.entryTime).time}</span>
                    </div>
                    <div className="detail-item">
                      <label>Kohëzgjatja:</label>
                      <span>{calculateDuration(roomDetails.currentBooking.entryTime)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Çmimi Total:</label>
                      <span className="price">€{roomDetails.currentBooking.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Statusi i Pagesës:</label>
                      <span className={`payment-status ${roomDetails.currentBooking.isPaid ? 'paid' : 'unpaid'}`}>
                        {roomDetails.currentBooking.isPaid ? '✅ E Paguar' : '❌ E Papaguar'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Regjistruar nga:</label>
                      <span>{roomDetails.currentBooking.enteredBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <h3>Historiku i Rezervimeve</h3>
            <div className="history-list">
              {roomDetails.recentBookings.map(booking => (
                <div key={booking.id} className="history-item">
                  <div className="history-header">
                    <span className="client-name">{booking.clientName}</span>
                    <span className={`booking-status ${booking.status}`}>
                      {booking.status === 'completed' ? '✅' : '❌'} {booking.status}
                    </span>
                  </div>
                  <div className="history-details">
                    <div className="history-info">
                      <span><strong>Lloji:</strong> {booking.roomType}</span>
                      <span><strong>Hyrje:</strong> {formatDateTime(booking.entryTime).date} {formatDateTime(booking.entryTime).time}</span>
                      <span><strong>Dalje:</strong> {formatDateTime(booking.exitTime).date} {formatDateTime(booking.exitTime).time}</span>
                      <span><strong>Kohëzgjatja:</strong> {booking.duration}</span>
                    </div>
                    <div className="history-price">
                      <span className="price">€{booking.totalPrice.toFixed(2)}</span>
                      <span className={`payment-status ${booking.isPaid ? 'paid' : 'unpaid'}`}>
                        {booking.isPaid ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="statistics-tab">
            <h3>Statistikat e Dhomës</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <span className="stat-number">{roomDetails.statistics.totalBookings}</span>
                  <span className="stat-label">Rezervime Totale</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <span className="stat-number">€{roomDetails.statistics.totalRevenue.toFixed(2)}</span>
                  <span className="stat-label">Të Ardhura Totale</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <span className="stat-number">{roomDetails.statistics.averageDuration}</span>
                  <span className="stat-label">Kohëzgjatja Mesatare</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🧹</div>
                <div className="stat-content">
                  <span className="stat-number">{formatDateTime(roomDetails.statistics.lastCleaned).date}</span>
                  <span className="stat-label">Pastruar Së Fundmi</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🔧</div>
                <div className="stat-content">
                  <span className="stat-number">{roomDetails.statistics.maintenanceCount}</span>
                  <span className="stat-label">Mirëmbajtje</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsView;
