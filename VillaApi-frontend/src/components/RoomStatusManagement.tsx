import React, { useState } from 'react';
import './RoomStatusManagement.css';

interface RoomStatus {
  id: string;
  name: string;
  color: string;
  description: string;
  isActive: boolean;
  orderNo: number;
}

interface Room {
  roomNo: string;
  title: string;
  status: string;
  lastUpdated: string;
  currentUser?: string;
  roomMovementId?: number;
  debt?: number;
  paid?: boolean;
  bookingType?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

interface RoomStatusManagementProps {
  userRole?: 'admin' | 'worker';
}

const RoomStatusManagement: React.FC<RoomStatusManagementProps> = ({ userRole = 'worker' }) => {
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([
    { id: 'available', name: 'E Lirë', color: '#27ae60', description: 'Dhomë e disponueshme për rezervim', isActive: true, orderNo: 1 },
    { id: 'occupied', name: 'E Zënë', color: '#e74c3c', description: 'Dhomë e rezervuar dhe në përdorim', isActive: true, orderNo: 2 },
    { id: 'maintenance', name: 'Mirëmbajtje', color: '#f39c12', description: 'Dhomë në mirëmbajtje', isActive: true, orderNo: 3 },
    { id: 'cleaning', name: 'Pastrim', color: '#3498db', description: 'Dhomë në proces pastrimi', isActive: true, orderNo: 4 },
    { id: 'out_of_order', name: 'Jashtë Shërbimit', color: '#95a5a6', description: 'Dhomë jashtë shërbimit', isActive: true, orderNo: 5 }
  ]);

  const [rooms, setRooms] = useState<Room[]>([
    { roomNo: '101', title: 'Dhoma 101', status: 'available', lastUpdated: '2024-01-15 10:30', currentUser: undefined },
    { roomNo: '102', title: 'Dhoma 102', status: 'occupied', lastUpdated: '2024-01-15 09:15', currentUser: 'Përdorues 1', roomMovementId: 1, debt: 25.50, paid: false, bookingType: 'fjetje', checkInTime: '2024-01-15 09:00' },
    { roomNo: '103', title: 'Dhoma 103', status: 'cleaning', lastUpdated: '2024-01-15 11:00', currentUser: 'Punëtor Pastrimi' },
    { roomNo: '104', title: 'Dhoma 104', status: 'maintenance', lastUpdated: '2024-01-15 08:45', currentUser: 'Teknik' },
    { roomNo: '105', title: 'Dhoma 105', status: 'available', lastUpdated: '2024-01-15 12:00', currentUser: undefined },
    { roomNo: '106', title: 'Dhoma 106', status: 'occupied', lastUpdated: '2024-01-15 10:00', currentUser: 'Përdorues 2', roomMovementId: 2, debt: 0, paid: true, bookingType: '24h', checkInTime: '2024-01-15 10:00' },
    { roomNo: '107', title: 'Dhoma 107', status: 'out_of_order', lastUpdated: '2024-01-14 16:30', currentUser: undefined },
    { roomNo: '108', title: 'Dhoma 108', status: 'available', lastUpdated: '2024-01-15 11:30', currentUser: undefined }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<RoomStatus | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomStatusModal, setShowRoomStatusModal] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRooms = rooms.filter(room => 
    filterStatus === 'all' || room.status === filterStatus
  );

  const getStatusInfo = (statusId: string) => {
    return roomStatuses.find(s => s.id === statusId) || roomStatuses[0];
  };

  const handleAddStatus = (statusData: Omit<RoomStatus, 'id' | 'orderNo'>) => {
    const newStatus: RoomStatus = {
      ...statusData,
      id: statusData.name.toLowerCase().replace(/\s+/g, '_'),
      orderNo: Math.max(...roomStatuses.map(s => s.orderNo)) + 1
    };
    setRoomStatuses(prev => [...prev, newStatus]);
    setShowAddModal(false);
  };

  const handleEditStatus = (statusData: Omit<RoomStatus, 'id' | 'orderNo'>) => {
    if (editingStatus) {
      setRoomStatuses(prev =>
        prev.map(status =>
          status.id === editingStatus.id
            ? { ...status, ...statusData }
            : status
        )
      );
      setEditingStatus(null);
    }
  };

  const handleDeleteStatus = (id: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë status?')) {
      setRoomStatuses(prev => prev.filter(status => status.id !== id));
    }
  };

  const handleEdit = (status: RoomStatus) => {
    setEditingStatus(status);
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomStatusModal(true);
  };

  const handleAdvancedOperations = (room: Room) => {
    setSelectedRoom(room);
    setShowAdvancedModal(true);
  };

  const handleRoomStatusChange = (roomNo: string, newStatus: string) => {
    setRooms(prev =>
      prev.map(room =>
        room.roomNo === roomNo
          ? { ...room, status: newStatus, lastUpdated: new Date().toLocaleString('sq-AL') }
          : room
      )
    );
    setShowRoomStatusModal(false);
    setSelectedRoom(null);
  };

  const handleMistake = (roomMovementId: number) => {
    if (window.confirm('A jeni të sigurt që doni të shënoni këtë si gabim?')) {
      setRooms(prev =>
        prev.map(room =>
          room.roomMovementId === roomMovementId
            ? { ...room, status: 'available', lastUpdated: new Date().toLocaleString('sq-AL'), currentUser: undefined, roomMovementId: undefined, debt: undefined, paid: undefined, bookingType: undefined, checkInTime: undefined }
            : room
        )
      );
      setShowAdvancedModal(false);
      setSelectedRoom(null);
      alert('Gabimi u shënua me sukses!');
    }
  };

  const handleChangeRoom = (roomMovementId: number, newRoomNo: string) => {
    if (window.confirm(`A jeni të sigurt që doni të ndryshoni dhomën në ${newRoomNo}?`)) {
      setRooms(prev =>
        prev.map(room => {
          if (room.roomMovementId === roomMovementId) {
            return { ...room, roomNo: newRoomNo, title: `Dhoma ${newRoomNo}`, lastUpdated: new Date().toLocaleString('sq-AL') };
          }
          return room;
        })
      );
      setShowAdvancedModal(false);
      setSelectedRoom(null);
      alert('Dhoma u ndryshua me sukses!');
    }
  };

  const handleConfirmPaid = (roomMovementId: number) => {
    if (window.confirm('A jeni të sigurt që doni të konfirmoni pagesën?')) {
      setRooms(prev =>
        prev.map(room =>
          room.roomMovementId === roomMovementId
            ? { ...room, paid: true, debt: 0, lastUpdated: new Date().toLocaleString('sq-AL') }
            : room
        )
      );
      setShowAdvancedModal(false);
      setSelectedRoom(null);
      alert('Pagesa u konfirmua me sukses!');
    }
  };

  const handleConfirmAllDebt = (roomMovementId: number) => {
    if (window.confirm('A jeni të sigurt që doni të konfirmoni të gjithë borxhin?')) {
      setRooms(prev =>
        prev.map(room =>
          room.roomMovementId === roomMovementId
            ? { ...room, debt: 0, paid: true, lastUpdated: new Date().toLocaleString('sq-AL') }
            : room
        )
      );
      setShowAdvancedModal(false);
      setSelectedRoom(null);
      alert('Borhxi u konfirmua me sukses!');
    }
  };

  const handleCloseRoom = (roomMovementId: number) => {
    if (window.confirm('A jeni të sigurt që doni të mbyllni dhomën?')) {
      setRooms(prev =>
        prev.map(room =>
          room.roomMovementId === roomMovementId
            ? { ...room, status: 'available', lastUpdated: new Date().toLocaleString('sq-AL'), currentUser: undefined, roomMovementId: undefined, debt: undefined, paid: undefined, bookingType: undefined, checkInTime: undefined, checkOutTime: new Date().toLocaleString('sq-AL') }
            : room
        )
      );
      setShowAdvancedModal(false);
      setSelectedRoom(null);
      alert('Dhoma u mbyll me sukses!');
    }
  };

  return (
    <div className="room-status-management">
      <div className="room-status-header">
        <h2>Menaxhimi i Statusit të Dhomave</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="add-status-btn"
        >
          + Shto Status të Ri
        </button>
      </div>

      <div className="status-overview">
        <h3>Statuset e Disponueshme</h3>
        <div className="status-list">
          {roomStatuses.map(status => (
            <div key={status.id} className="status-item">
              <div 
                className="status-color" 
                style={{ backgroundColor: status.color }}
              ></div>
              <div className="status-info">
                <span className="status-name">{status.name}</span>
                <span className="status-description">{status.description}</span>
              </div>
              <div className="status-actions">
                <button 
                  onClick={() => handleEdit(status)}
                  className="edit-btn"
                  title="Ndrysho"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteStatus(status.id)}
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

      <div className="rooms-section">
        <div className="rooms-header">
          <h3>Dhomat dhe Statuset e Tyre</h3>
          <div className="status-filter">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Të Gjitha</option>
              {roomStatuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rooms-grid">
          {filteredRooms.map(room => {
            const statusInfo = getStatusInfo(room.status);
            return (
              <div 
                key={room.roomNo} 
                className="room-card"
                onClick={() => handleRoomClick(room)}
              >
                <div className="room-header">
                  <h4 className="room-title">{room.title}</h4>
                  <div 
                    className="room-status-badge"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    {statusInfo.name}
                  </div>
                </div>
                <div className="room-details">
                  <div className="detail-row">
                    <span className="detail-label">Përditësuar:</span>
                    <span className="detail-value">{room.lastUpdated}</span>
                  </div>
                  {room.currentUser && (
                    <div className="detail-row">
                      <span className="detail-label">Përdorues:</span>
                      <span className="detail-value">{room.currentUser}</span>
                    </div>
                  )}
                  {room.bookingType && (
                    <div className="detail-row">
                      <span className="detail-label">Lloji:</span>
                      <span className="detail-value">{room.bookingType}</span>
                    </div>
                  )}
                  {room.debt !== undefined && (
                    <div className="detail-row">
                      <span className="detail-label">Borhxi:</span>
                      <span className={`detail-value ${room.debt > 0 ? 'debt' : 'paid'}`}>
                        €{room.debt.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {room.paid !== undefined && (
                    <div className="detail-row">
                      <span className="detail-label">Statusi:</span>
                      <span className={`detail-value ${room.paid ? 'paid' : 'unpaid'}`}>
                        {room.paid ? 'E Paguar' : 'E Papaguar'}
                      </span>
                    </div>
                  )}
                </div>
                {room.roomMovementId && (
                  <div className="room-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvancedOperations(room);
                      }}
                      className="advanced-btn"
                      title="Operacione të Avancuara"
                    >
                      ⚙️ Operacione
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <StatusModal
          onSave={handleAddStatus}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingStatus && (
        <StatusModal
          status={editingStatus}
          onSave={handleEditStatus}
          onClose={() => setEditingStatus(null)}
        />
      )}

      {showRoomStatusModal && selectedRoom && (
        <RoomStatusModal
          room={selectedRoom}
          statuses={roomStatuses}
          onStatusChange={handleRoomStatusChange}
          onClose={() => {
            setShowRoomStatusModal(false);
            setSelectedRoom(null);
          }}
        />
      )}

      {showAdvancedModal && selectedRoom && (
        <AdvancedRoomOperationsModal
          room={selectedRoom}
          userRole={userRole}
          onMistake={handleMistake}
          onChangeRoom={handleChangeRoom}
          onConfirmPaid={handleConfirmPaid}
          onConfirmAllDebt={handleConfirmAllDebt}
          onCloseRoom={handleCloseRoom}
          onClose={() => {
            setShowAdvancedModal(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
};

interface StatusModalProps {
  status?: RoomStatus;
  onSave: (statusData: Omit<RoomStatus, 'id' | 'orderNo'>) => void;
  onClose: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ status, onSave, onClose }) => {
  const [name, setName] = useState(status?.name || '');
  const [color, setColor] = useState(status?.color || '#3498db');
  const [description, setDescription] = useState(status?.description || '');
  const [isActive, setIsActive] = useState(status?.isActive ?? true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Emri i statusit është i detyrueshëm');
      return;
    }

    if (!description.trim()) {
      setError('Përshkrimi është i detyrueshëm');
      return;
    }

    onSave({
      name: name.trim(),
      color,
      description: description.trim(),
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
          <h2>{status ? 'Ndrysho Statusin' : 'Shto Status të Ri'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Emri i Statusit:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shkruani emrin e statusit"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Ngjyra:</label>
            <div className="color-input-group">
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3498db"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Përshkrimi:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shkruani përshkrimin e statusit"
              className="form-textarea"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">Status Aktiv</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {status ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RoomStatusModalProps {
  room: Room;
  statuses: RoomStatus[];
  onStatusChange: (roomNo: string, newStatus: string) => void;
  onClose: () => void;
}

const RoomStatusModal: React.FC<RoomStatusModalProps> = ({ room, statuses, onStatusChange, onClose }) => {
  const handleStatusSelect = (statusId: string) => {
    onStatusChange(room.roomNo, statusId);
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
          <h2>Ndrysho Statusin - {room.title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="current-status">
            <h3>Statusi Aktual:</h3>
            <div 
              className="current-status-badge"
              style={{ backgroundColor: statuses.find(s => s.id === room.status)?.color }}
            >
              {statuses.find(s => s.id === room.status)?.name}
            </div>
          </div>

          <div className="status-options">
            <h3>Zgjidhni Statusin e Ri:</h3>
            <div className="status-grid">
              {statuses.map(status => (
                <button
                  key={status.id}
                  className={`status-option ${room.status === status.id ? 'current' : ''}`}
                  onClick={() => handleStatusSelect(status.id)}
                  style={{ borderColor: status.color }}
                >
                  <div 
                    className="status-option-color"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="status-option-name">{status.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">
            Mbyll
          </button>
        </div>
      </div>
    </div>
  );
};

interface AdvancedRoomOperationsModalProps {
  room: Room;
  userRole?: 'admin' | 'worker';
  onMistake: (roomMovementId: number) => void;
  onChangeRoom: (roomMovementId: number, newRoomNo: string) => void;
  onConfirmPaid: (roomMovementId: number) => void;
  onConfirmAllDebt: (roomMovementId: number) => void;
  onCloseRoom: (roomMovementId: number) => void;
  onClose: () => void;
}

const AdvancedRoomOperationsModal: React.FC<AdvancedRoomOperationsModalProps> = ({ 
  room, 
  userRole = 'worker',
  onMistake, 
  onChangeRoom, 
  onConfirmPaid, 
  onConfirmAllDebt, 
  onCloseRoom, 
  onClose 
}) => {
  const [newRoomNo, setNewRoomNo] = useState('');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!room.roomMovementId) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content advanced-modal">
        <div className="modal-header">
          <h2>Operacione të Avancuara - {room.title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="room-info">
            <h3>Informacioni i Dhomës:</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Lloji i Rezervimit:</span>
                <span className="info-value">{room.bookingType || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Borhxi:</span>
                <span className={`info-value ${room.debt && room.debt > 0 ? 'debt' : 'paid'}`}>
                  €{room.debt?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Statusi i Pagesës:</span>
                <span className={`info-value ${room.paid ? 'paid' : 'unpaid'}`}>
                  {room.paid ? 'E Paguar' : 'E Papaguar'}
                </span>
              </div>
              {room.checkInTime && (
                <div className="info-item">
                  <span className="info-label">Koha e Hyrjes:</span>
                  <span className="info-value">{room.checkInTime}</span>
                </div>
              )}
            </div>
          </div>

          <div className="operations-section">
            <h3>Operacionet e Disponueshme ({userRole === 'admin' ? 'Admin' : 'Punëtor'}):</h3>
            <div className="operations-grid">
              <button 
                className="operation-btn mistake-btn"
                onClick={() => onMistake(room.roomMovementId!)}
                title="Shëno si gabim dhe liro dhomën"
              >
                ❌ Gabim
              </button>

              <button 
                className="operation-btn confirm-paid-btn"
                onClick={() => onConfirmPaid(room.roomMovementId!)}
                disabled={room.paid}
                title="Konfirmo pagesën"
              >
                💰 Konfirmo Pagesën
              </button>

              <button 
                className="operation-btn confirm-debt-btn"
                onClick={() => onConfirmAllDebt(room.roomMovementId!)}
                disabled={room.debt === 0}
                title="Konfirmo të gjithë borxhin"
              >
                📋 Konfirmo Borxhin
              </button>

              <button 
                className="operation-btn close-room-btn"
                onClick={() => onCloseRoom(room.roomMovementId!)}
                title="Mbyll dhomën"
              >
                🚪 Mbyll Dhomën
              </button>
            </div>

            <div className="change-room-section">
              <h4>Ndrysho Dhomën:</h4>
              <div className="change-room-form">
                <input
                  type="text"
                  value={newRoomNo}
                  onChange={(e) => setNewRoomNo(e.target.value)}
                  placeholder="Numri i dhomës së re"
                  className="form-input"
                />
                <button 
                  className="operation-btn change-room-btn"
                  onClick={() => {
                    if (newRoomNo.trim()) {
                      onChangeRoom(room.roomMovementId!, newRoomNo.trim());
                    }
                  }}
                  disabled={!newRoomNo.trim()}
                  title="Ndrysho dhomën"
                >
                  🔄 Ndrysho Dhomën
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">
            Mbyll
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomStatusManagement;
