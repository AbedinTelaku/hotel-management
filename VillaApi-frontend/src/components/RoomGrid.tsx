import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import RoomModal from './RoomModal';
import { roomService, RoomView } from '../services';
import { ApiError } from '../services/api';
import useRealTimeTimer from '../hooks/useRealTimeTimer';
import './RoomGrid.css';
import './RoomGrid.reserving.css';
import * as signalR from "@microsoft/signalr";

interface Room {
  id: number;
  name: string;
  title: string;
  status: 'available' | 'occupied' | 'maintenance';
  bookingType?: 'pushim' | '24h' | 'fjetje' | 'tjeter';
  roomTypeDescription?: string;
  isExtraRoomType?: boolean;
  tables?: string;
  vehicle?: string;
  price?: string;
  paid?: boolean;
  roomMovementId?: number;
  orderNo?: number;
  roomModel?: string;
  amountDebt?: number;
  hours?: number;
  minuteLeft?: number;
  startTime?: string; // When the room was opened (legacy)
  entryOn?: string; // Koha kur u hap dhoma nga API (ISO string)
}

interface RoomGridProps {
  userRole?: 'admin' | 'worker';
}

// Component for real-time room timer with explicit "Minutat" label
const RoomTimer: React.FC<{
  room: Room;
  startTime?: string;
}> = ({ room, startTime }) => {
  // Use actual hours from API data instead of static booking type hours
  const getDurationHours = () => {
    // If we have hours from API (includes extra time), use that
    if (room.hours && room.hours > 0) {
      console.log(`🕐 Room ${room.name}: Using API hours ${room.hours} (includes extra time)`);
      return room.hours;
    }
    
    // Fallback to booking type hours if no API hours available
    const fallbackHours = (() => {
      switch (room.bookingType) {
        case 'pushim': return 3; // 3 hours for pushim
        case '24h': return 24; // 24 hours for 24h
        case 'fjetje': return 12; // 12 hours for fjetje (overnight)
        case 'tjeter': return 4; // 4 hours for tjeter
        default: return 0;
      }
    })();
    
    console.log(`🕐 Room ${room.name}: Using fallback hours ${fallbackHours} for booking type ${room.bookingType}`);
    return fallbackHours;
  };

  const timer = useRealTimeTimer({
    startTime: startTime || room.startTime || room.entryOn || '',
    durationHours: getDurationHours(),
    isActive: room.status === 'occupied' && !!room.bookingType,
    updateInterval: 1000 // Update every 1 second for real-time display
  });

  if (room.status !== 'occupied' || !room.bookingType) {
    return null;
  }

  // Only show hours and minutes, no seconds
  let displayTime = timer.timeLeft;
  if (!timer.isExpired && timer.timeLeft) {
    // Remove seconds from the display
    displayTime = timer.timeLeft.replace(/\s*\d+s$/, '');
  }

  return (
    <motion.div
      className={`room-time-left ${timer.isExpired ? 'time-expired' : 'time-remaining'}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
    >
      <motion.div
        animate={timer.isExpired ? { 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ 
          duration: 2, 
          repeat: timer.isExpired ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {timer.isExpired ? (
          '⏰ Koha Skadoi'
        ) : (
          <span className="room-time-main">
            <span role="img" aria-label="clock" style={{marginRight: 4}}>🕒</span>
            {displayTime}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};

const RoomGrid: React.FC<RoomGridProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Load rooms from API
  useEffect(() => {
    loadRooms();
  }, []);

  // Force re-render when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Refresh trigger activated, re-rendering...');
    }
  }, [refreshTrigger]);

  // Force re-render when forceUpdate changes
  useEffect(() => {
    if (forceUpdate > 0) {
      console.log('🔄 Force update triggered, re-rendering...');
    }
  }, [forceUpdate]);

  // Update selectedRoom when rooms data changes
  useEffect(() => {
    console.log('🔍 useEffect triggered for selectedRoom update:', {
      'selectedRoom exists': !!selectedRoom,
      'rooms.length': rooms.length,
      'isModalOpen': isModalOpen,
      'selectedRoom.id': selectedRoom?.id,
      'selectedRoom.name': selectedRoom?.name
    });
    
    if (selectedRoom && rooms.length > 0) {
      // Find the updated room data for the currently selected room
      const updatedRoom = rooms.find(r => r.id === selectedRoom.id || r.name === selectedRoom.name);
      console.log('🔍 Looking for updated room:', {
        'searching for id': selectedRoom.id,
        'searching for name': selectedRoom.name,
        'found room': !!updatedRoom,
        'found room id': updatedRoom?.id,
        'found room name': updatedRoom?.name,
        'found room amountDebt': updatedRoom?.amountDebt
      });
      
      if (updatedRoom && isModalOpen) {
        console.log('🔄 Updating selectedRoom with fresh data:', {
          'selectedRoom.id': selectedRoom.id,
          'selectedRoom.name': selectedRoom.name,
          'oldRoomMovementId': selectedRoom.roomMovementId,
          'newRoomMovementId': updatedRoom.roomMovementId,
          'oldAmountDebt': selectedRoom.amountDebt,
          'newAmountDebt': updatedRoom.amountDebt,
          'oldPaid': selectedRoom.paid,
          'newPaid': updatedRoom.paid,
          'rooms.length': rooms.length,
          'isModalOpen': isModalOpen
        });
        setSelectedRoom(updatedRoom);
      } else if (selectedRoom && isModalOpen) {
        console.log('🔍 No updated room found for selectedRoom:', {
          'selectedRoom.id': selectedRoom.id,
          'selectedRoom.name': selectedRoom.name,
          'rooms.length': rooms.length,
          'isModalOpen': isModalOpen,
          'availableRoomIds': rooms.map(r => ({ id: r.id, name: r.name }))
        });
      }
    }
  }, [rooms, refreshTrigger]);

    // Auto-refresh when modal opens for occupied rooms with debt
    useEffect(() => {
      if (isModalOpen && selectedRoom && selectedRoom.status === 'occupied') {
        console.log('🔍 Modal opened for occupied room, checking debt data...', {
          'roomId': selectedRoom.id,
          'roomName': selectedRoom.name,
          'amountDebt': selectedRoom.amountDebt,
          'paid': selectedRoom.paid
        });
        
        // If amountDebt is undefined or 0 but paid is false, do a silent refresh
        if ((selectedRoom.amountDebt === undefined || selectedRoom.amountDebt === 0) && selectedRoom.paid === false) {
          console.log('🔄 Debt data seems incomplete, doing silent refresh...');
          
          // Single silent refresh after a short delay
          setTimeout(() => silentRefreshDebtData(), 100);
        }
      }
    }, [isModalOpen, selectedRoom]);

  const refreshRoomData = () => {
    console.log('refreshRoomData called - forcing refresh...');
    setRefreshTrigger(prev => prev + 1);
    setForceUpdate(prev => prev + 1);
    
    // Force re-render with a small delay to ensure state updates
    setTimeout(() => {
      console.log('🔄 Forcing re-render after timeout...');
      loadRooms();
    }, 100);
    
    // Additional force update after a longer delay
    setTimeout(() => {
      console.log('🔄 Additional force update...');
      setForceUpdate(prev => prev + 1);
    }, 200);
  };

  // Auto-refresh for debt data - silent refresh that user won't notice
  const silentRefreshDebtData = () => {
    console.log('🔄 Silent refresh for debt data...');
    loadRooms();
  };

  // Test function for manual refresh
  const testRefresh = () => {
    console.log('🔄 Test refresh triggered...');
    silentRefreshDebtData();
  };

  useEffect(() => {
  // Create SignalR connection
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7210/roomshub") // Adjust port if your API runs elsewhere
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // Start connection and listen for room updates
  connection
    .start()
    .then(() => {
      console.log("✅ Connected to RoomsHub successfully");

      connection.on("RoomHasBeenUpdated", (roomNo) => {
        console.log("🛰️ RoomHasBeenUpdated received from API for room:", roomNo);
        // Trigger a refresh when the backend notifies us
        loadRooms();
      });
    })
    .catch((err) => console.error("❌ Error connecting to SignalR hub:", err));

  // Cleanup on unmount
  return () => {
    if (connection) {
      console.log("🔌 Disconnecting from RoomsHub...");
      connection.stop();
    }
  };
}, []);


  const loadRooms = async () => {
    try {
      console.log('🔄 Loading rooms from API...');
      setLoading(true);
      setError('');
      
      const response = await roomService.getRooms();
      
      if (response.isSuccessfull && response.data) {
        // Convert API data to local format
        const apiRooms: RoomView[] = response.data;
        
        console.log('🔍 API Rooms data:', apiRooms.map(room => ({
          roomNo: room.roomNo,
          amountDebt: room.amountDebt,
          roomMovementId: room.roomMovementId,
          isOpen: room.isOpen
        })));
        
        // Get current rooms to preserve roomMovementId
        setRooms(prevRooms => {
          const convertedRooms: Room[] = apiRooms.map((room, index) => {
            // Ensure we have a valid ID - use roomNo if it's a valid number, otherwise use index
            const roomId = room.roomNo && !isNaN(parseInt(room.roomNo)) ? parseInt(room.roomNo) : index + 1;
            
            // Determine status based on isOpen and roomType
            let status: 'available' | 'occupied' | 'maintenance' = 'available';
            if (room.isOpen) {
              status = 'occupied';
            }
            
            // Find existing room to preserve roomMovementId and booking type
            const existingRoom = prevRooms.find(r => r.name === (room.roomNo || `Dhoma ${index + 1}`));
            
            // Convert room type code to frontend format
            let bookingType: 'pushim' | '24h' | 'fjetje' | 'tjeter' | undefined;
            if (room.roomType) {
              switch (room.roomType) {
                case 'P': bookingType = 'pushim'; break;
                case '24h': bookingType = '24h'; break;
                case 'F': bookingType = 'fjetje'; break;
                case 'T': bookingType = 'tjeter'; break;
                case 'EXT1': 
                  // For extra rooms, try to determine the original booking type
                  // We'll use the existing room's booking type or default to pushim
                  bookingType = existingRoom?.bookingType || 'pushim';
                  break;
                default:
                  // For any other room types, try to preserve existing booking type
                  bookingType = existingRoom?.bookingType;
                  break;
              }
            }
            
            
            // Check for saved drinks info in localStorage (only for occupied rooms)
            let finalPrice = room.price ? room.price.toString() : '';
            if (status === 'occupied') {
              const savedDrinks = localStorage.getItem(`drinks_${roomId}`);
              if (savedDrinks) {
                try {
                  const drinksInfo = JSON.parse(savedDrinks);
                  const isRecent = (Date.now() - drinksInfo.timestamp) < 3600000; // 1 hour
                  if (isRecent && drinksInfo.total > 0) {
                    // Add drinks total to room price
                    const roomPrice = parseFloat(room.price?.toString() || '0');
                    const drinksTotal = drinksInfo.total || 0;
                    finalPrice = (roomPrice + drinksTotal).toString();
                    console.log('🍹 Loaded drinks for room', room.roomNo, 'Total:', finalPrice);
                  }
                } catch (error) {
                  console.error('Error loading saved drinks for room', room.roomNo, error);
                  localStorage.removeItem(`drinks_${roomId}`);
                }
              }
            }

            const mappedRoom = {
              id: roomId,
              name: room.roomNo || `Dhoma ${index + 1}`, // Use roomNo directly
              title: room.title || `Dhoma ${room.roomNo}`,
              status: status,
              bookingType: bookingType,
              roomTypeDescription: room.roomTypeDescription,
              isExtraRoomType: room.isExtraRoomType || false,
              tables: room.clientPlateNo || existingRoom?.tables || '', // Përdorim të dhënat nga API ose nga dhoma ekzistuese
              vehicle: room.clientCarName || existingRoom?.vehicle || '', // Përdorim të dhënat nga API ose nga dhoma ekzistuese
              price: finalPrice,
              paid: (() => {
                // First, try to restore from localStorage
                try {
                  const savedPaymentStatus = localStorage.getItem(`payment_status_${roomId}`);
                  if (savedPaymentStatus) {
                    const { paid, timestamp } = JSON.parse(savedPaymentStatus);
                    // Check if the saved status is recent (within 24 hours)
                    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                      return paid;
                    }
                  }
                } catch (error) {
                  // Error loading payment status from localStorage
                }
                
                // Fallback to existing room state or debt calculation
                // If amountDebt > 0, there's debt, so paid should be false
                // If amountDebt <= 0, no debt, so paid should be true
                return existingRoom?.paid !== undefined ? existingRoom.paid : (room.amountDebt <= 0);
              })(),
              roomMovementId: room.roomMovementId || existingRoom?.roomMovementId || undefined,
              orderNo: room.orderNo,
              roomModel: room.roomModel,
              amountDebt: (() => {
                console.log('🔍 Mapping amountDebt for room', room.roomNo, ':', {
                  'room.amountDebt': room.amountDebt,
                  'typeof': typeof room.amountDebt,
                  'isNaN': isNaN(room.amountDebt),
                  'existingRoom?.amountDebt': existingRoom?.amountDebt
                });
                return room.amountDebt;
              })(),
              hours: room.hours,
              minuteLeft: room.minuteLeft,
              entryOn: room.entryOn // Shtojmë kohën e hapjes nga API
            };
          
            
            
            
            return mappedRoom;
          });
          
          return convertedRooms;
        });
      } else {
        // Fallback to default rooms if API fails
        const defaultRooms = Array.from({ length: 16 }, (_, i) => ({
          id: i + 1,
          name: `Dhoma ${i + 1}`,
          status: 'available' as const
        }));
        setRooms(defaultRooms.map(room => ({ ...room, title: `Dhoma ${room.name}` })));
        setError('Nuk mund të ngarkohen dhomat nga serveri. Përdoret lista e paracaktuar.');
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ngarkimin e dhomave');
      
      // Fallback to default rooms if API fails
      const defaultRooms = Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        name: `Dhoma ${i + 1}`,
        status: 'available' as const
      }));
      setRooms(defaultRooms.map(room => ({ ...room, title: `Dhoma ${room.name}` })));
    } finally {
      setLoading(false);
      console.log('✅ loadRooms completed');
    }
  };

  const handleRoomClick = (room: Room) => {
    console.log('🖱️ Room clicked:', {
      name: room.name,
      status: room.status,
      roomMovementId: room.roomMovementId,
      isEditMode: userRole === 'admin' && room.status === 'occupied',
      fullRoomObject: room
    });
    
    // If opening a new room (not occupied), clear any existing drinks data
    if (room.status !== 'occupied') {
      localStorage.removeItem(`drinks_${room.id}`);
      console.log('🍹 Cleared drinks data for new room', room.id);
    }
    
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleSaveBooking = async (bookingData: {
    bookingType: 'pushim' | '24h' | 'fjetje' | 'tjeter';
    tables: string;
    vehicle: string;
    price: string;
    paid: boolean;
    startTime?: string;
    hours?: string; // Custom hours for "Tjeter" booking type
  }) => {
    if (selectedRoom) {
      try {
        console.log('🔄 Saving booking for room:', {
          roomNo: selectedRoom.name,
          bookingData,
          isEditMode: userRole === 'admin' && selectedRoom.status === 'occupied'
        });

        // For edit mode, we should not call openRoom as it resets the timer
        // Instead, we should update the room data without changing the start time
        if (userRole === 'admin' && selectedRoom.status === 'occupied') {
          console.log('⚠️ Edit mode detected - preserving existing start time:', selectedRoom.entryOn);
          // For edit mode, update the room data in local state
          setRooms(prevRooms =>
            prevRooms.map(room =>
              room.id === selectedRoom.id
                ? {
                    ...room,
                    ...bookingData,
                    // Preserve status and movementId
                    status: 'occupied',
                    roomMovementId: room.roomMovementId,
                    entryOn: room.entryOn,
                    startTime: room.startTime,
                  }
                : room
            )
          );

          // Save payment status to localStorage for edit mode
          localStorage.setItem(`payment_status_${selectedRoom.id}`, JSON.stringify({
            paid: bookingData.paid,
            timestamp: Date.now()
          }));

          // Optionally, here you can call an API to persist the edit if needed
          // await roomService.updateRoom(selectedRoom.id, bookingData);
          console.log('✅ Room data updated in edit mode (timer preserved, local state updated)');
        } else {
          // For new bookings, use openRoom
          const response = await roomService.openRoom({
            roomNo: selectedRoom.name,
            bookingType: bookingData.bookingType,
            tables: bookingData.tables,
            vehicle: bookingData.vehicle,
            price: bookingData.price,
            paid: bookingData.paid,
            hours: bookingData.hours // Pass custom hours for "Tjeter" booking type
          });

          // Save payment status to localStorage for new bookings
          localStorage.setItem(`payment_status_${selectedRoom.id}`, JSON.stringify({
            paid: bookingData.paid,
            timestamp: Date.now()
          }));

          if (response.isSuccessfull && response.data) {
            console.log('✅ Room booking saved successfully, roomMovementId:', response.data);
            // Update local state with roomMovementId
            // Clear any existing drinks data for this room when opening a new booking
            localStorage.removeItem(`drinks_${selectedRoom.id}`);
            console.log('🍹 Cleared drinks data for room', selectedRoom.id, 'when opening new booking');

            setRooms(prevRooms =>
              prevRooms.map(room =>
                room.id === selectedRoom.id
                  ? {
                      ...room,
                      ...bookingData,
                      status: 'occupied' as const,
                      roomMovementId: response.data,
                      startTime: bookingData.startTime || new Date().toISOString(),
                      entryOn: new Date().toISOString(), // Ruajmë kohën e hapjes
                      tables: bookingData.tables || '', // Ruajmë numrin e tabelave
                      vehicle: bookingData.vehicle || '' // Ruajmë informacionin e veturës
                    }
                  : room
              )
            );
          } else {
            setError(response.errorMessage || 'Gabim në hapjen e dhomës');
          }
        }
        
        // For both edit mode and new bookings, close the modal
        setIsModalOpen(false);
        setSelectedRoom(null);
        
      } catch (error) {
        console.error('Error saving room:', error);
        const apiError = error as ApiError;
        setError(apiError.message || 'Gabim në ruajtjen e dhomës');
      }
    }
  };

  const handleCloseRoom = async (room: Room) => {
    if (room.roomMovementId) {
      try {
        console.log('🔄 Closing room:', room.name, 'with roomMovementId:', room.roomMovementId);
        
        const response = await roomService.closeRoom(room.roomMovementId);
        
        if (response.isSuccessfull) {
          console.log('✅ Room closed successfully');
          // Update local state
          setRooms(prevRooms =>
            prevRooms.map(r =>
              r.id === room.id
                ? {
                    ...r,
                    status: 'available' as const,
                    bookingType: undefined,
                    tables: '',
                    vehicle: '',
                    price: '',
                    paid: undefined, // ndryshuar nga false në undefined
                    roomMovementId: undefined,
                    title: '',
                    roomTypeDescription: '',
                    amountDebt: undefined,
                    orderNo: undefined,
                    roomModel: '',
                    hours: undefined,
                    minuteLeft: undefined,
                    entryOn: undefined,
                    startTime: undefined
                  }
                : r
            )
          );
        } else {
          setError(response.errorMessage || 'Gabim në mbylljen e dhomës');
        }
      } catch (error) {
        console.error('Error closing room:', error);
        const apiError = error as ApiError;
        setError(apiError.message || 'Gabim në mbylljen e dhomës');
      }
    }
  };


  const handlePaymentToggle = async (roomId: number, isPaid: boolean) => {
    try {
      // Update local state immediately for better UX
      setRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId 
            ? { ...room, paid: isPaid }
            : room
        )
      );

      // Save payment status to localStorage for persistence
      localStorage.setItem(`payment_status_${roomId}`, JSON.stringify({
        paid: isPaid,
        timestamp: Date.now()
      }));

      // Here you could add API call to update payment status in backend
      // await roomService.updatePaymentStatus(roomId, isPaid);
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('Gabim gjatë përditësimit të statusit të pagesës');
    }
  };


  const isOverdue = (room: Room) => {
    if (room.status !== 'occupied') return false;
    // Prefer API-provided minuteLeft if available
    if (typeof room.minuteLeft === 'number') {
      return room.minuteLeft < 0;
    }
    // Fallback: compute from entryOn + hours
    try {
      if (room.entryOn && room.hours && room.hours > 0) {
        const start = new Date(room.entryOn).getTime();
        const end = start + room.hours * 60 * 60 * 1000;
        return Date.now() > end;
      }
    } catch {}
    return false;
  };

  const getCardStatusClass = (room: Room) => {
    if (room.status === 'available') return 'room-available';
    if (isOverdue(room)) return 'room-overdue';
    if (room.isExtraRoomType) return 'room-extra';
    if (room.status === 'occupied') return 'room-occupied';
    if (room.status === 'maintenance') return 'room-maintenance';
    return 'room-available';
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Duke ngarkuar dhomat...</p>
      </div>
    );
  }

  return (
    <div className="room-grid-container">
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="room-grid-header">
        <h1>Menaxhimi i Dhomave</h1>
        <div className="header-actions">
          {/* Butonat për të gjithë përdoruesit */}
          <button 
            onClick={() => navigate('/stock')} 
            className="stock-button"
            title="Shiko stokun e pijeve"
          >
            📦 Stoku
          </button>
          
          <button 
            onClick={() => navigate('/market')} 
            className="market-button"
            title="Market për shitje pijesh"
          >
            🛒 Market
          </button>

          {/* Butonat vetëm për worker */}
          {userRole === 'worker' && (
            <>
              <button 
                onClick={() => navigate('/market-staff')} 
                className="market-staff-button"
                title="Market për stafin (pa pagesë)"
              >
                👥 Gratis
              </button>
              
              <button 
                onClick={() => navigate('/change-password')} 
                className="change-password-button"
                title="Ndrysho fjalëkalimin"
              >
                🔐 Ndrysho passwordin
              </button>
            </>
          )}

          {/* Butoni vetëm për admin */}
          {userRole === 'admin' && (
            <>
              <button 
                onClick={() => navigate('/staff')} 
                className="staff-button"
                title="Menaxho stafin"
              >
                👥 Stafi
              </button>
              
              <button 
                onClick={() => navigate('/admin')} 
                className="admin-button"
                title="Paneli i plotë i administratorit"
              >
                👑 Paneli i Administratorit
              </button>
            </>
          )}
        </div>
      </div>

      <motion.div 
        className="room-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence>
          {rooms.map((room, index) => (
            <motion.div
              key={`${room.id}-${refreshTrigger}-${forceUpdate}`}
              className={`room-card ${getCardStatusClass(room)} ${(isModalOpen && selectedRoom && selectedRoom.id === room.id && room.status !== 'occupied') ? 'room-card-reserving' : ''}`}
              initial={{ 
                opacity: 0, 
                y: 50, 
                scale: 0.8,
                rotateX: -15
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: 0
              }}
              exit={{ 
                opacity: 0, 
                y: -50, 
                scale: 0.8,
                rotateX: 15
              }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -12, 
                scale: 1.03,
                rotateY: 5,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
              }}
              whileTap={{ 
                scale: 0.95,
                rotateY: 0
              }}
              layout
            >
              <motion.div 
                className="room-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <motion.div 
                  className="room-number"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Dhoma: {room.name}
                </motion.div>
              </motion.div>

              {/* Show room details only when occupied */}
              {room.status === 'occupied' && (
                <motion.div 
                  className="room-details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.1 }}
                >
                  {/* Row 1: Car/table info and price */}
                  <div className="room-details-row-1">
                    <span className="room-vehicle-info">
                      🚗 {room.tables}
                    </span>
                   {room.amountDebt != null && room.amountDebt < 0 && (
                  <span className="room-price">
                    {parseFloat(room.amountDebt?.toString()).toFixed(2)}€
                  </span>
                )}
                  </div>

                  {/* Row 2: Booking Type (Pushim) - Left aligned, separate row */}
                  <div className="room-details-row-2">
                    <span className="room-booking-type">
                      {(room.roomTypeDescription || room.bookingType || '').toString()}
                    </span>
                  </div>

                  {/* Row 3: Timer - Center aligned, separate row */}
                  <div className="room-details-row-3">
                    <RoomTimer room={room} startTime={room.startTime} />
                  </div>
                </motion.div>
              )}
              
              {/* {!room.bookingType && room.price && (
                <motion.div 
                  className="room-price"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  €{room.price}
                </motion.div>
              )}
               */}
              {/* Room management buttons */}
              <motion.div 
                className="room-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                {room.status === 'available' && (
                  <motion.button 
                    className="open-room-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoomClick(room);
                    }}
                    title="Hap dhomën"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Hap Dhomen
                  </motion.button>
                )}

                {room.status === 'occupied' && (
                  <>
                    <motion.button 
                      className="manage-room-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoomClick(room);
                      }}
                      title="Detajet e dhomës"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      Detail
                    </motion.button>
                    <motion.button 
                      className="close-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseRoom(room);
                      }}
                      title="Mbyll dhomën"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      Mbyll
                    </motion.button>
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {isModalOpen && selectedRoom && (
        <RoomModal
          key={`modal-${selectedRoom.id}-${refreshTrigger}-${forceUpdate}`}
          room={selectedRoom}
          onSave={handleSaveBooking}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRoom(null);
          }}
          isEditMode={userRole === 'admin' && selectedRoom.status === 'occupied'}
          userRole={userRole}
          onCloseRoom={async () => {
            await handleCloseRoom(selectedRoom);
            setIsModalOpen(false);
            setSelectedRoom(null);
          }}
          onPaymentStatusChange={handlePaymentToggle}
          onRoomDataRefresh={refreshRoomData}
        />
      )}


    </div>
  );
};

export default RoomGrid;