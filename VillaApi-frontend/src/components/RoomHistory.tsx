import React, { useState } from 'react';
import './RoomHistory.css';

interface RoomHistoryEntry {
  id: string;
  roomNo: string;
  roomTitle: string;
  clientName?: string;
  clientPlateNo?: string;
  clientDocument?: string;
  clientCarName?: string;
  entryTime: string;
  exitTime?: string;
  duration: string;
  roomType: string;
  totalPrice: number;
  isPaid: boolean;
  status: 'active' | 'completed' | 'cancelled';
  enteredBy: string;
  closedBy?: string;
}

const RoomHistory: React.FC = () => {
  const [historyEntries, setHistoryEntries] = useState<RoomHistoryEntry[]>([
    {
      id: '1',
      roomNo: '101',
      roomTitle: 'Dhoma 101',
      clientName: 'Gjergj Krasniqi',
      clientPlateNo: 'AB 123 CD',
      clientDocument: '1234567890',
      clientCarName: 'BMW X5',
      entryTime: '2024-01-15 10:30:00',
      exitTime: '2024-01-15 14:30:00',
      duration: '4h 0m',
      roomType: 'Pushim',
      totalPrice: 25.00,
      isPaid: true,
      status: 'completed',
      enteredBy: 'Admin',
      closedBy: 'Admin'
    },
    {
      id: '2',
      roomNo: '102',
      roomTitle: 'Dhoma 102',
      clientName: 'Ana Berisha',
      clientPlateNo: 'EF 456 GH',
      clientDocument: '0987654321',
      clientCarName: 'Mercedes C-Class',
      entryTime: '2024-01-15 09:15:00',
      duration: '2h 45m',
      roomType: '24 Orë',
      totalPrice: 50.00,
      isPaid: false,
      status: 'active',
      enteredBy: 'Punëtor 1'
    },
    {
      id: '3',
      roomNo: '103',
      roomTitle: 'Dhoma 103',
      clientName: 'Marko Petrović',
      clientPlateNo: 'IJ 789 KL',
      clientDocument: '1122334455',
      clientCarName: 'Audi A4',
      entryTime: '2024-01-14 20:00:00',
      exitTime: '2024-01-15 08:00:00',
      duration: '12h 0m',
      roomType: 'Fjetje',
      totalPrice: 35.00,
      isPaid: true,
      status: 'completed',
      enteredBy: 'Punëtor 2',
      closedBy: 'Punëtor 1'
    },
    {
      id: '4',
      roomNo: '104',
      roomTitle: 'Dhoma 104',
      clientName: 'Sara Hoxha',
      clientPlateNo: 'MN 012 OP',
      clientDocument: '5566778899',
      clientCarName: 'Volkswagen Golf',
      entryTime: '2024-01-15 11:00:00',
      duration: '1h 30m',
      roomType: 'Tjetër',
      totalPrice: 15.00,
      isPaid: true,
      status: 'completed',
      enteredBy: 'Admin',
      closedBy: 'Admin'
    },
    {
      id: '5',
      roomNo: '105',
      roomTitle: 'Dhoma 105',
      clientName: 'Dritan Gashi',
      clientPlateNo: 'QR 345 ST',
      clientDocument: '9988776655',
      clientCarName: 'Toyota Corolla',
      entryTime: '2024-01-15 12:00:00',
      duration: '0h 45m',
      roomType: 'Extra 1 Orë',
      totalPrice: 8.00,
      isPaid: false,
      status: 'active',
      enteredBy: 'Punëtor 1'
    }
  ]);

  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'entryTime' | 'exitTime' | 'totalPrice' | 'duration'>('entryTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredEntries = historyEntries.filter(entry => {
    const matchesRoom = selectedRoom === 'all' || entry.roomNo === selectedRoom;
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
    const matchesDate = !selectedDate || entry.entryTime.startsWith(selectedDate);
    const matchesSearch = !searchTerm || 
      entry.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.clientPlateNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.clientDocument?.includes(searchTerm) ||
      entry.roomNo.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRoom && matchesStatus && matchesDate && matchesSearch;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'entryTime':
        aValue = new Date(a.entryTime);
        bValue = new Date(b.entryTime);
        break;
      case 'exitTime':
        aValue = a.exitTime ? new Date(a.exitTime) : new Date(0);
        bValue = b.exitTime ? new Date(b.exitTime) : new Date(0);
        break;
      case 'totalPrice':
        aValue = a.totalPrice;
        bValue = b.totalPrice;
        break;
      case 'duration':
        const aDuration = parseDuration(a.duration);
        const bDuration = parseDuration(b.duration);
        aValue = aDuration;
        bValue = bDuration;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 0;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Aktiv', class: 'status-active' };
      case 'completed':
        return { text: 'Përfunduar', class: 'status-completed' };
      case 'cancelled':
        return { text: 'Anuluar', class: 'status-cancelled' };
      default:
        return { text: 'I Panjohur', class: 'status-unknown' };
    }
  };

  const getPaymentBadge = (isPaid: boolean) => {
    return isPaid 
      ? { text: 'E Paguar', class: 'payment-paid' }
      : { text: 'E Papaguar', class: 'payment-unpaid' };
  };

  const uniqueRooms = Array.from(new Set(historyEntries.map(entry => entry.roomNo))).sort();

  const totalRevenue = historyEntries
    .filter(entry => entry.isPaid)
    .reduce((sum, entry) => sum + entry.totalPrice, 0);

  const activeBookings = historyEntries.filter(entry => entry.status === 'active').length;

  return (
    <div className="room-history">
      <div className="room-history-header">
        <h2>Historiku i Rezervimeve</h2>
        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-label">Të Ardhurat:</span>
            <span className="stat-value">€{totalRevenue.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rezervime Aktive:</span>
            <span className="stat-value">{activeBookings}</span>
          </div>
        </div>
      </div>

      <div className="history-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="room-filter">Dhoma:</label>
            <select 
              id="room-filter"
              value={selectedRoom} 
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="filter-select"
            >
              <option value="all">Të Gjitha</option>
              {uniqueRooms.map(room => (
                <option key={room} value={room}>Dhoma {room}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Statusi:</label>
            <select 
              id="status-filter"
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Të Gjitha</option>
              <option value="active">Aktiv</option>
              <option value="completed">Përfunduar</option>
              <option value="cancelled">Anuluar</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter">Data:</label>
            <input
              type="date"
              id="date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="search">Kërko:</label>
            <input
              type="text"
              id="search"
              placeholder="Emër, targë, dokument..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="sort-controls">
          <div className="sort-group">
            <label htmlFor="sort-by">Rendit sipas:</label>
            <select 
              id="sort-by"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="entryTime">Koha e Hyrjes</option>
              <option value="exitTime">Koha e Daljes</option>
              <option value="totalPrice">Çmimi Total</option>
              <option value="duration">Kohëzgjatja</option>
            </select>
          </div>

          <div className="sort-group">
            <label htmlFor="sort-order">Renditja:</label>
            <select 
              id="sort-order"
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="sort-select"
            >
              <option value="desc">Zbritëse</option>
              <option value="asc">Ngjitëse</option>
            </select>
          </div>
        </div>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Dhoma</th>
              <th>Klienti</th>
              <th>Lloji</th>
              <th>Hyrje</th>
              <th>Dalje</th>
              <th>Kohëzgjatja</th>
              <th>Çmimi</th>
              <th>Statusi</th>
              <th>Pagesa</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map(entry => {
              const statusBadge = getStatusBadge(entry.status);
              const paymentBadge = getPaymentBadge(entry.isPaid);
              
              return (
                <tr key={entry.id} className="history-row">
                  <td>
                    <div className="room-info">
                      <span className="room-number">{entry.roomNo}</span>
                      <span className="room-title">{entry.roomTitle}</span>
                    </div>
                  </td>
                  <td>
                    <div className="client-info">
                      <div className="client-name">{entry.clientName || 'N/A'}</div>
                      {entry.clientPlateNo && (
                        <div className="client-plate">{entry.clientPlateNo}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="room-type">{entry.roomType}</span>
                  </td>
                  <td>
                    <div className="time-info">
                      <div className="time-date">{new Date(entry.entryTime).toLocaleDateString('sq-AL')}</div>
                      <div className="time-time">{new Date(entry.entryTime).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </td>
                  <td>
                    {entry.exitTime ? (
                      <div className="time-info">
                        <div className="time-date">{new Date(entry.exitTime).toLocaleDateString('sq-AL')}</div>
                        <div className="time-time">{new Date(entry.exitTime).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ) : (
                      <span className="no-exit">-</span>
                    )}
                  </td>
                  <td>
                    <span className="duration">{entry.duration}</span>
                  </td>
                  <td>
                    <span className="price">€{entry.totalPrice.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${paymentBadge.class}`}>
                      {paymentBadge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedEntries.length === 0 && (
          <div className="no-results">
            <p>Nuk u gjetën rezultate për këto kritere.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomHistory;
