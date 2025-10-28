import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import './RoomModal.css';
import InvoiceModal from './InvoiceModal';
import DrinksModalNew from './DrinksModalNew';
import RoomDetailsModal from './RoomDetailsModal';
import AddExtraModal from './AddExtraModal';
import ConfirmationModal from './ConfirmationModal';
import useRealTimeTimer from '../hooks/useRealTimeTimer';
import { roomService } from '../services/roomService';
import { supplyAndSellService } from '../services';
import { suggestionCarNameService } from '../services/suggestionCarNameService';
import { roomPriceService } from '../services/roomPriceService';
import { roomTypeService } from '../services/roomTypeService';

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

interface RoomModalProps {
  room: Room;
  onSave: (bookingData: {
    bookingType: 'pushim' | '24h' | 'fjetje' | 'tjeter';
    tables: string;
    vehicle: string;
    price: string;
    paid: boolean;
    startTime?: string;
    hours?: string; // Custom hours for "Tjeter" booking type
  }) => void;
  onClose: () => void;
  isEditMode?: boolean;
  userRole?: 'admin' | 'worker';
  onCloseRoom?: () => void;
  onPaymentStatusChange?: (roomId: number, isPaid: boolean) => void;
  onRoomDataRefresh?: () => void;
}

const RoomModal: React.FC<RoomModalProps> = ({ room, onSave, onClose, isEditMode = false, userRole = 'worker', onCloseRoom, onPaymentStatusChange, onRoomDataRefresh }) => {

  const [bookingType, setBookingType] = useState<'pushim' | '24h' | 'fjetje' | 'tjeter'>(
    room.bookingType || 'pushim'
  );
  const [tables, setTables] = useState(room.tables || '');
  const [vehicle, setVehicle] = useState(room.vehicle || '');
  const [price, setPrice] = useState(room.price || '');
  const [paid, setPaid] = useState(room.paid || false);
  const [error, setError] = useState('');
  const [showDrinksModal, setShowDrinksModal] = useState(false);
  const [drinksIsFree, setDrinksIsFree] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [showMistakeConfirmation, setShowMistakeConfirmation] = useState(false);
  const [showConfirmDebtModal, setShowConfirmDebtModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Car autocomplete states
  const [carSuggestions, setCarSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(-1);
  const [suggestionCarNames, setSuggestionCarNames] = useState<string[]>([]);
  const [isVeturaRoom, setIsVeturaRoom] = useState<boolean>(false);

  // Room pricing and type states
  const [roomPrices, setRoomPrices] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [hours, setHours] = useState('');

  // Derived flag to determine if the room currently has debt
  const hasDebt = React.useMemo(() => {
    console.log('🔍 hasDebt calculation:', {
      'room.amountDebt': room.amountDebt,
      'typeof amountDebt': typeof room.amountDebt,
      'paid': paid,
      'amountDebt < 0': typeof room.amountDebt === 'number' ? room.amountDebt < 0 : 'N/A',
      'paid === false': paid === false
    });
    
    if (typeof room.amountDebt === 'number') {
      const result = room.amountDebt < 0;
      console.log('🔍 Using amountDebt calculation:', result);
      return result;
    }
    // Fallback to payment flag: unpaid => assume has debt, paid => no debt
    const result = paid === false;
    console.log('🔍 Using paid fallback calculation:', result);
    return result;
  }, [room.amountDebt, paid]);

  // Lista e markave të veturave (pa modele specifike) - fallback për dhoma që nuk janë Vetura
  const fallbackCarNames = [
    // Markat Gjermane
    'Volkswagen', 'BMW', 'Mercedes', 'Audi', 'Porsche', 'Opel', 'Smart',
    
    // Markat Japoneze
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Lexus', 'Infiniti', 'Suzuki', 'Daihatsu', 'Isuzu',
    
    // Markat Koreane
    'Hyundai', 'Kia', 'Genesis', 'SsangYong',
    
    // Markat Amerikane
    'Ford', 'Chevrolet', 'Cadillac', 'Buick', 'GMC', 'Dodge', 'Jeep', 'Chrysler', 'Lincoln', 'Tesla', 'Ram',
    
    // Markat Franceze
    'Renault', 'Peugeot', 'Citroën', 'DS Automobiles', 'Alpine',
    
    // Markat Italiane
    'Fiat', 'Alfa Romeo', 'Lancia', 'Maserati', 'Ferrari', 'Lamborghini', 'Bugatti',
    
    // Markat Suedeze
    'Volvo', 'Saab', 'Koenigsegg',
    
    // Markat Britanike
    'Jaguar', 'Land Rover', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren', 'Lotus', 'Mini',
    
    // Markat Çeke dhe E tjera Evropiane
    'Skoda', 'Seat', 'Cupra', 'Dacia', 'Lada', 'UAZ', 'GAZ', 'Tatra',
    
    // Markat Kineze
    'BYD', 'Geely', 'Great Wall', 'Chery', 'JAC', 'BAIC', 'SAIC', 'Dongfeng', 'FAW', 'Lynk & Co', 'NIO', 'XPeng', 'Li Auto',
    
    // Markat Indiane
    'Tata', 'Mahindra', 'Maruti Suzuki', 'Bajaj', 'Hero',
    
    // Markat Austriake dhe Suedeze
    'KTM', 'Polaris', 'Can-Am',
    
    // Markat Tjera Evropiane
    'Bugatti', 'Koenigsegg', 'Rimac', 'Pininfarina',
    
    // Markat Tjera Aziatike
    'Proton', 'Perodua', 'Geely', 'Haval', 'Weilai', 'Xpeng'
  ];

  // Real-time timer for occupied rooms
  const getDurationHours = (bookingType?: string) => {
    // If we have hours from API (includes extra time), use that
    if (room.hours && room.hours > 0) {
      console.log(`🕐 RoomModal: Using API hours ${room.hours} (includes extra time)`);
      return room.hours;
    }
    
    // Try to get hours from room types database
    if (roomTypes.length > 0 && bookingType) {
      const getRoomTypeCode = (bookingType: string): string => {
        switch (bookingType) {
          case 'pushim': return 'P';
          case '24h': return '24h';
          case 'fjetje': return 'F';
          case 'tjeter': return 'T';
          default: return 'P';
        }
      };

      const roomTypeCode = getRoomTypeCode(bookingType);
      const roomType = roomTypes.find(rt => rt.code === roomTypeCode);
      
      if (roomType && roomType.hours > 0) {
        console.log(`🕐 RoomModal: Using database hours ${roomType.hours} for booking type ${bookingType} (${roomTypeCode})`);
        return roomType.hours;
      }
    }
    
    // Fallback to hardcoded hours if no database data available
    const fallbackHours = (() => {
      switch (bookingType) {
        case 'pushim': return 3; // 3 hours for pushim
        case '24h': return 24; // 24 hours for 24h
        case 'fjetje': return 12; // 12 hours for fjetje (overnight)
        case 'tjeter': return 4; // 4 hours for tjeter
        default: return 0;
      }
    })();
    
    console.log(`🕐 RoomModal: Using fallback hours ${fallbackHours} for booking type ${bookingType}`);
    return fallbackHours;
  };

  const timer = useRealTimeTimer({
    startTime: room.startTime || room.entryOn || '',
    durationHours: getDurationHours(room.bookingType),
    isActive: room.status === 'occupied' && !!room.bookingType,
    updateInterval: 1000 // Update every 1 second for real-time display
  });
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load room prices and types when component mounts
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        setIsLoadingPrices(true);
        
        // Load room prices
        const pricesResponse = await roomPriceService.getAllRoomPrices();
        if (pricesResponse.isSuccessfull && pricesResponse.data) {
          setRoomPrices(pricesResponse.data);
        }
        
        // Load room types
        const typesResponse = await roomTypeService.getAllRoomTypes();
        if (typesResponse.isSuccessfull && typesResponse.data) {
          setRoomTypes(typesResponse.data);
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    loadRoomData();
  }, []);

  // Auto-set price based on booking type and room model
  useEffect(() => {
    if (!isEditMode && room.roomModel && roomPrices.length > 0) {
      const getRoomTypeCode = (bookingType: string): string => {
        switch (bookingType) {
          case 'pushim': return 'P';
          case '24h': return '24h';
          case 'fjetje': return 'F';
          case 'tjeter': return 'T';
          default: return 'P';
        }
      };

      const roomTypeCode = getRoomTypeCode(bookingType);
      const roomPrice = roomPrices.find(p => 
        p.roomType === roomTypeCode && p.roomModel === room.roomModel
      );

      if (roomPrice) {
        setPrice(roomPrice.price.toString());
        console.log(`💰 Auto-set price: ${roomPrice.price} for ${bookingType} (${roomTypeCode}) in ${room.roomModel}`);
      } else {
        // Fallback to default prices if not found in database
        switch (bookingType) {
          case 'pushim':
            setPrice('15');
            break;
          case '24h':
            setPrice('50');
            break;
          case 'fjetje':
            setPrice('35');
            break;
          case 'tjeter':
            setPrice('');
            setHours(''); // Allow user to enter custom hours
            break;
        }
      }
    }
  }, [bookingType, room.roomModel, roomPrices, isEditMode]);

  // Load saved drinks info when modal opens (only for edit mode)
  useEffect(() => {
    if (isEditMode) {
      const savedDrinks = localStorage.getItem(`drinks_${room.id}`);
      if (savedDrinks) {
        try {
          const drinksInfo = JSON.parse(savedDrinks);
          // Check if the saved data is recent (within last hour)
          const isRecent = (Date.now() - drinksInfo.timestamp) < 3600000; // 1 hour
          if (isRecent) {
            setInvoiceItems(drinksInfo.items || []);
            setInvoiceTotal(drinksInfo.total || 0);
            
            // Calculate total price using the current price state
            const roomPrice = parseFloat(price || '0');
            const drinksTotal = drinksInfo.total || 0;
            const newTotalPrice = roomPrice + drinksTotal;
            setTotalPrice(newTotalPrice);
            
            console.log('🍹 Loaded saved drinks info for edit mode:', drinksInfo);
          } else {
            // Clear old data
            localStorage.removeItem(`drinks_${room.id}`);
          }
        } catch (error) {
          console.error('Error loading saved drinks for edit mode:', error);
          localStorage.removeItem(`drinks_${room.id}`);
        }
      }
    } else {
      // For new bookings, clear any existing drinks data
      setInvoiceItems([]);
      setInvoiceTotal(0);
      setTotalPrice(0);
      localStorage.removeItem(`drinks_${room.id}`);
      console.log('🍹 Cleared drinks data for new booking');
    }
  }, [room.id, isEditMode]); // Added isEditMode to dependencies


  // Update price field when totalPrice changes
  useEffect(() => {
    if (totalPrice > 0 && invoiceItems.length > 0) {
      setPrice(totalPrice.toString());
    }
  }, [totalPrice, invoiceItems.length]);

  // Update paid state when room changes
  useEffect(() => {
    setPaid(room.paid || false);
  }, [room.paid]);

  // Reset processing state and clear error when room changes
  useEffect(() => {
    setIsProcessing(false);
    setError('');
    console.log('🔄 Room changed, resetting state...', {
      roomId: room.id,
      roomMovementId: room.roomMovementId,
      amountDebt: room.amountDebt,
      status: room.status
    });
  }, [room.id, room.roomMovementId]);

  // Also update when the room object itself changes (for real-time updates from parent)
  useEffect(() => {
    if (room.paid !== undefined && room.paid !== paid) {
      setPaid(room.paid);
    }
  }, [room]);

  // Update timer when room hours change (for extra hours)
  useEffect(() => {
    console.log(`🕐 RoomModal: Room hours updated to ${room.hours}, timer will recalculate`);
  }, [room.hours]);

  // Log when room prop changes
  useEffect(() => {
    console.log(`🏠 RoomModal: Room prop updated`, {
      name: room.name,
      hours: room.hours,
      isExtraRoomType: room.isExtraRoomType,
      entryOn: room.entryOn,
      roomModel: room.roomModel,
      status: room.status,
      roomMovementId: room.roomMovementId,
      amountDebt: room.amountDebt,
      isEditMode,
      paid: room.paid,
      price: room.price
    });
    
    // Debug info for Konfirmo button visibility
    const buttonConditions = {
      'isEditMode': isEditMode,
      'room.status': room.status,
      'room.roomMovementId': room.roomMovementId,
      'room.amountDebt': room.amountDebt,
      'typeof amountDebt': typeof room.amountDebt,
      'isProcessing': isProcessing
    };
    
    const buttonWillShow = isEditMode && 
                          room.status === 'occupied' && 
                          room.roomMovementId && 
                          typeof room.amountDebt === 'number' && 
                          room.amountDebt < 0;
    
    console.log('🔍 Konfirmo Button Debug:', {
      ...buttonConditions,
      'Button will show': buttonWillShow,
      'All conditions check': {
        'isEditMode': isEditMode,
        'status === occupied': room.status === 'occupied',
        'has roomMovementId': !!room.roomMovementId,
        'amountDebt is number': typeof room.amountDebt === 'number',
        'amountDebt < 0': typeof room.amountDebt === 'number' ? room.amountDebt < 0 : false
      }
    });
  }, [room, isEditMode, isProcessing]);

  // Check if this is a Vetura room and load suggestion car names
  useEffect(() => {
    const checkVeturaRoom = () => {
      // Check if room model is "Vetura" (case insensitive)
      const isVetura = room.roomModel?.toLowerCase() === 'vetura';
      setIsVeturaRoom(isVetura);
      
      if (isVetura) {
        // Load suggestion car names from API for Vetura rooms
        loadSuggestionCarNames();
      } else {
        // Clear suggestion car names for non-Vetura rooms
        setSuggestionCarNames([]);
      }
    };

    checkVeturaRoom();
  }, [room.roomModel]);

  // Load suggestion car names from API
  const loadSuggestionCarNames = async () => {
    try {
      const response = await suggestionCarNameService.getAllCarNames();
      if (response.isSuccessfull && response.data) {
        setSuggestionCarNames(response.data.map(item => item.carName));
        console.log('🚗 Loaded suggestion car names:', response.data);
      }
    } catch (error) {
      console.error('Error loading suggestion car names:', error);
      // Fallback to empty array if API fails
      setSuggestionCarNames([]);
    }
  };

  // Car autocomplete functions
  const handleVehicleInputChange = (value: string) => {
    setVehicle(value);
    setSelectedCarIndex(-1);
    
    if (value.length > 0) {
      // Use suggestion car names for Vetura rooms, fallback car names for others
      const carNamesToUse = isVeturaRoom ? suggestionCarNames : fallbackCarNames;
      
      const filteredCars = carNamesToUse.filter(car => 
        car.toLowerCase().includes(value.toLowerCase())
      );
      setCarSuggestions(filteredCars.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(true);
    } else {
      setCarSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleCarSuggestionClick = (carName: string) => {
    setVehicle(carName);
    setShowSuggestions(false);
    setSelectedCarIndex(-1);
  };

  const handleVehicleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCarIndex(prev => 
          prev < carSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCarIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedCarIndex >= 0 && carSuggestions[selectedCarIndex]) {
          handleCarSuggestionClick(carSuggestions[selectedCarIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedCarIndex(-1);
        break;
    }
  };

  const handleVehicleInputBlur = () => {
    // Delay hiding suggestions to allow clicks on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedCarIndex(-1);
    }, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Only validate required fields for new bookings, not for editing
    if (!isEditMode) {
      if (!tables.trim()) {
        setError('Ju lutem shkruani numrin ose emrin e tabelave');
        return;
      }

      if (!price.trim()) {
        setError('Ju lutem shkruani çmimin');
        return;
      }

      // Validate hours for "Tjeter" booking type - mandatory for custom bookings
      if (bookingType === 'tjeter' && !hours.trim()) {
        setError('Ju lutem shkruani numrin e orëve për llojin "Tjeter"');
        return;
      }

      // Validate hours for "Tjeter" booking type - must be greater than 0
      if (bookingType === 'tjeter' && hours.trim() && parseFloat(hours) <= 0) {
        setError('Orët duhet të jenë më të mëdha se 0');
        return;
      }
     
    }

    // Save drinks info locally before submitting
    if (invoiceItems.length > 0) {
      const drinksInfo = {
        roomId: room.id,
        items: invoiceItems,
        total: invoiceTotal,
        timestamp: Date.now(),
        isFree: drinksIsFree
      } as any;
      localStorage.setItem(`drinks_${room.id}`, JSON.stringify(drinksInfo));
      console.log('🍹 Saved drinks info before booking:', drinksInfo);
    }

    // Preserve existing start time or set new one for new bookings
    const startTime = isEditMode && room.entryOn ? room.entryOn : new Date().toISOString();
    
    // Persist drinks to backend (decrement stock) only when user saves
    try {
      if (invoiceItems.length > 0) {
        const items = invoiceItems.map((item: any) => ({
          productCode: item.drink.id,
          quantity: item.quantity,
          price: drinksIsFree ? 0 : item.drink.price
        }));
        const billData = {
          dateAndTime: new Date().toISOString(),
          isSupply: false,
          isFree: drinksIsFree,
          roomNo: room.name,
          isDebt: false,
          isMistake: false,
          discount: 0,
          items
        } as any;
        setIsProcessing(true);
        const response = await supplyAndSellService.addBill(billData);
        if (!response.isSuccessfull) {
          throw new Error(response.errorMessage || 'Gabim në ruajtjen e pijeve');
        }
        console.log('✅ Drinks persisted on save');
      }
    } catch (err: any) {
      console.error('❌ Error persisting drinks on save:', err);
      setIsProcessing(false);
      setError(err?.message || 'Gabim në ruajtjen e pijeve');
      return;
    } finally {
      setIsProcessing(false);
    }

    onSave({
      bookingType,
      tables: tables.trim(),
      vehicle: vehicle.trim(),
      price: price.trim(),
      paid,
      startTime,
      hours: bookingType === 'tjeter' ? hours : undefined // Pass custom hours only for "Tjeter" booking type
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  const handleGenerateInvoice = (items: any[], total: number) => {
    setInvoiceItems(items);
    setInvoiceTotal(total);
    setShowDrinksModal(false);
    
    // Calculate total price (room price + drinks total)
    const roomPrice = parseFloat(price || '0');
    const drinksTotal = total;
    const newTotalPrice = roomPrice + drinksTotal;
    setTotalPrice(newTotalPrice);
    
    // Update the price field to show the total price
    setPrice(newTotalPrice.toString());
    
    // Save drinks info to localStorage for persistence
    const drinksInfo = {
      roomId: room.id,
      items: items,
      total: total,
      timestamp: Date.now()
    };
    localStorage.setItem(`drinks_${room.id}`, JSON.stringify(drinksInfo));
    
    console.log('🍹 Drinks added:', { 
      items, 
      drinksTotal, 
      roomPrice, 
      newTotalPrice 
    });
  };

  const handleOrder = () => {
    // Here you would typically send the order to the backend
    alert('Porosia u dërgua me sukses!');
    setShowInvoiceModal(false);
  };

  const handleCloseInvoice = () => {
    setShowInvoiceModal(false);
    onClose();
  };


  // Handle Mistake functionality
  const handleMistake = async () => {
    if (!room.roomMovementId) {
      setError('Nuk u gjet ID-ja e lëvizjes së dhomës. Ju lutemi mbyllni dhe hapni modalin përsëri.');
      setShowMistakeConfirmation(false);
      
      // Try to refresh room data
      if (onRoomDataRefresh) {
        console.log('🔄 Refreshing room data because roomMovementId is missing...');
        onRoomDataRefresh();
      }
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      
      const response = await roomService.mistake(room.roomMovementId);
      
      if (response.isSuccessfull) {
        console.log('✅ Room marked as mistake successfully');
        setShowMistakeConfirmation(false);
        
        // Refresh room data
        if (onRoomDataRefresh) {
          console.log('🔄 Refreshing room data after marking as mistake...');
          onRoomDataRefresh();
        }
        
        // Close the modal after a short delay to allow refresh
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        setError('Dështoi shënimi si gabim');
      }
    } catch (error: any) {
      console.error('❌ Mistake operation failed:', error);
      
      // Handle time limit error (MyException 26)
      if (error?.response?.data?.message?.includes('26') || 
          error?.message?.includes('time limit') ||
          error?.message?.includes('MinuteLimitForMistake')) {
        setError('Koha e lejuar për të shënuar si gabim ka kaluar!');
      } else {
        setError(error?.response?.data?.message || error?.message || 'Gabim në shënimin si gabim');
      }
      setShowMistakeConfirmation(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Confirm Debt functionality
  const handleConfirmDebt = async () => {
    if (!room.roomMovementId) {
      setError('Nuk u gjet ID-ja e lëvizjes së dhomës. Ju lutemi mbyllni dhe hapni modalin përsëri.');
      setShowConfirmDebtModal(false);
      
      // Try to refresh room data
      if (onRoomDataRefresh) {
        console.log('🔄 Refreshing room data because roomMovementId is missing...');
        onRoomDataRefresh();
      }
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      
      const response = await roomService.confirmAllTheDebt(room.roomMovementId);
      
      if (response.isSuccessfull) {
        console.log('✅ All debt confirmed successfully');
        setShowConfirmDebtModal(false);
        
        // Update payment status to paid
        if (onPaymentStatusChange) {
          onPaymentStatusChange(room.id, true); // Set to paid
        }
        
        // Refresh room data to update UI
        if (onRoomDataRefresh) {
          console.log('🔄 Refreshing room data after debt confirmation...');
          onRoomDataRefresh();
        }
        
        // Close the modal after a short delay to allow refresh
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        setError('Dështoi konfirmimi i borxhit');
      }
    } catch (error: any) {
      console.error('❌ Confirm debt operation failed:', error);
      setError(error?.response?.data?.message || error?.message || 'Gabim në konfirmimin e borxhit');
      setShowConfirmDebtModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get confirm message for debt confirmation
  const getConfirmMessage = async () => {
    console.log('🔍 getConfirmMessage called with roomMovementId:', room.roomMovementId);
    
    if (!room.roomMovementId) {
      console.log('❌ getConfirmMessage: roomMovementId is missing');
      return;
    }

    try {
      console.log('🔄 Calling roomService.getConfirmMessage...');
      const response = await roomService.getConfirmMessage(room.roomMovementId);
      console.log('📨 getConfirmMessage response:', response);
      
      if (response.isSuccessfull) {
        const message = response.data || 'A jeni i sigurt që doni të konfirmoni të gjithë borxhin?';
        console.log('✅ Setting confirm message:', message);
        setConfirmMessage(message);
      } else {
        console.log('❌ getConfirmMessage failed, using default message');
        setConfirmMessage('A jeni i sigurt që doni të konfirmoni të gjithë borxhin?');
      }
    } catch (error) {
      console.error('❌ Failed to get confirm message:', error);
      setConfirmMessage('A jeni i sigurt që doni të konfirmoni të gjithë borxhin?');
    }
  };

  // Handle Close Room functionality
  const handleCloseRoom = async () => {
    if (typeof onCloseRoom === 'function') {
      await onCloseRoom();
      return;
    }
    if (!room.roomMovementId) return;
    try {
      setIsProcessing(true);
      const response = await roomService.closeRoom(room.roomMovementId);
      if (response.isSuccessfull) {
        onClose(); // Close the main modal to refresh data
      } else {
        setError('Gabim në mbylljen e dhomës');
      }
    } catch (error) {
      console.error('Error closing room:', error);
      setError('Gabim në mbylljen e dhomës');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditMode ? `Ndrysho Rezervimin e ${room.title || room.name}` : `Rezervimi i ${room.title || room.name}`}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Room Details Display */}
          <div className="room-info-display">
            <h3>Informacioni i Dhomës</h3>
            <div className="room-info-grid">
              {room.roomTypeDescription && (
                <div className="info-item">
                  <span className="info-label">Lloji:</span>
                  <span className="info-value">{room.roomTypeDescription}</span>
                </div>
              )}
              {room.status === 'occupied' && room.bookingType && (
                <div className="info-item">
                  <span className="info-label">Koha e Mbetur:</span>
                  <span className={`info-value ${timer.isExpired ? 'time-expired' : 'time-remaining'}`}>
                    {timer.isExpired ? 'Koha Skadoi' : timer.timeLeft}
                  </span>
                </div>
              )}
              {/* Show these details only for occupied rooms */}
              {isEditMode && room.status === 'occupied' && room.hours && room.hours > 0 && (
                <div className="info-item">
                  <span className="info-label">Orët Totale:</span>
                  <span className="info-value hours-total">
                    {room.hours}h {room.isExtraRoomType ? '(me shtesë)' : ''}
                  </span>
                </div>
              )}
              {isEditMode && room.status === 'occupied' && (
                <div className="info-item">
                  <span className="info-label">Statusi i Pagesës:</span>
                  <span className={`info-value ${paid ? 'payment-paid' : 'payment-unpaid'}`}>
                    {paid ? `💰 E Paguar: €${parseFloat(price || '0').toFixed(2)}` : `⚠️ Borxh: €${parseFloat(price || '0').toFixed(2)}`}
                  </span>
                </div>
              )}
              {/* Removed separate Borxhi card as requested; status i pagesës already shows debt */}
              {isEditMode && room.status === 'occupied' && room.isExtraRoomType && (
                <div className="info-item extra-room-notice">
                  <span className="info-label">⚠️ Dhoma e Shtuar</span>
                </div>
              )}
            </div>
          </div>

          {/* Hide booking type when room is occupied */}
          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="bookingType">Lloji i Rezervimit:</label>
              <select
                id="bookingType"
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as any)}
                className="form-select"
              >
                <option value="pushim">Pushim</option>
                <option value="24h">24h</option>
                <option value="fjetje">Fjetje</option>
                <option value="tjeter">Tjetër</option>
              </select>
              
            </div>
          )}

          {/* Hide tables when room is occupied */}
          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="tables">Tabelat e Veturës: *</label>
              <input
                type="text"
                id="tables"
                value={tables}
                onChange={(e) => setTables(e.target.value)}
                placeholder="Shkruani numrin ose emrin e tabelave"
                className="form-input"
              />
            </div>
          )}

          {/* Hide vehicle when room is occupied */}
          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="vehicle">Vetura: (Opsionale)</label>
              <div className="car-autocomplete-container">
                <input
                  type="text"
                  id="vehicle"
                  value={vehicle}
                  onChange={(e) => handleVehicleInputChange(e.target.value)}
                  onKeyDown={handleVehicleInputKeyDown}
                  onBlur={handleVehicleInputBlur}
                  onFocus={() => vehicle.length > 0 && setShowSuggestions(true)}
                  placeholder={isVeturaRoom ? "Shkruani emrin e veturës (sugjerimet e ruajtura)... (opsionale)" : "Shkruani emrin e veturës... (opsionale)"}
                  className="form-input"
                />
                {showSuggestions && carSuggestions.length > 0 && (
                  <div className="car-suggestions">
                    {isVeturaRoom && (
                      <div className="suggestion-header">
                        🚗 Sugjerimet e ruajtura për dhoma Vetura
                      </div>
                    )}
                    {carSuggestions.map((car, index) => (
                      <div
                        key={car}
                        className={`suggestion-item ${index === selectedCarIndex ? 'selected' : ''}`}
                        onClick={() => handleCarSuggestionClick(car)}
                      >
                        {car}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hide price when room is occupied */}
          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="price">Çmimi (€): *</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={bookingType === 'pushim' ? '15 (automatik)' : 'Shkruani çmimin'}
                className={`form-input ${(bookingType === 'pushim' || bookingType === '24h' || bookingType === 'fjetje' || invoiceItems.length > 0) ? 'readonly' : ''}`}
                min="0"
                step="0.01"
                readOnly={bookingType === 'pushim' || bookingType === '24h' || bookingType === 'fjetje' || invoiceItems.length > 0}
              />
              {!isLoadingPrices && (
                <small className="price-note">
                  {bookingType === 'tjeter' 
                    ? "Mund të vendosni çmimin sipas nevojës" 
                    : ""
                  }
                </small>
              )}
              {invoiceItems.length > 0 && (
                <small className="price-note">Çmimi është automatikisht kalkuluar (dhoma + pijet)</small>
              )}
            </div>
          )}

          {/* Hide hours when room is occupied */}
          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="hours">Oret: {bookingType === 'tjeter' ? '*' : ''}</label>
              <input
                type="number"
                id="hours"
                value={bookingType === 'tjeter' ? hours : (isLoadingPrices ? '' : getDurationHours(bookingType))}
                onChange={bookingType === 'tjeter' ? (e) => setHours(e.target.value) : undefined}
                readOnly={bookingType !== 'tjeter'}
                className={`form-input ${bookingType !== 'tjeter' ? 'readonly' : ''}`}
                placeholder={isLoadingPrices ? "Duke ngarkuar..." : (bookingType === 'tjeter' ? "Shkruani oret" : "")}
                style={bookingType !== 'tjeter' ? { backgroundColor: '#f8fafc', cursor: 'not-allowed' } : {}}
                min="0"
                step="0.5"
              />
              {!isLoadingPrices && (
                <small className="price-note">
                  {bookingType === 'tjeter' 
                    ? "Mund të vendosni kohëzgjatjen sipas nevojës" 
                    : ""
                  }
                </small>
              )}
            </div>
          )}

          {/* Total Price Display */}
          {invoiceItems.length > 0 && (
            <div className="form-group total-price-group">
              <div className="total-price-header">
                <label className="form-label">Çmimi Total:</label>
              </div>
              <div className="total-price-breakdown">
                <div className="price-item">
                  <span>Çmimi i Dhomës ({bookingType}):</span>
                  <span>€{(parseFloat(price || '0') - invoiceTotal).toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Pijet ({invoiceItems.length} artikuj):</span>
                  <span>€{invoiceTotal.toFixed(2)}</span>
                </div>
                <div className="price-item total">
                  <span><strong>Totali i Përgjithshëm:</strong></span>
                  <span><strong>€{totalPrice.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Hide payment status checkbox when room is occupied */}
          {!isEditMode && (
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="paymentStatus"
                  checked={!paid}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const newPaidStatus = !isChecked; // If checked = unpaid, if unchecked = paid
                    
                    setPaid(newPaidStatus);
                    
                    // Immediately update parent component state
                    if (onPaymentStatusChange) {
                      onPaymentStatusChange(room.id, newPaidStatus);
                    }
                  }}
                  className="payment-checkbox"
                />
                <label htmlFor="paymentStatus" className="checkbox-label">
                  Pa paguar
                </label>
              </div>
            </div>
          )}

          {/* Vazhdim Button - shown only for occupied rooms */}
          {room.status === 'occupied' && (
            <div className="form-group">
              <button 
                type="button" 
                onClick={() => setShowAddExtraModal(true)}
                className="vazhdim-button"
              >
                Vazhdim
              </button>
            </div>
          )}

          {/* Gabim Button - shown only for occupied rooms */}
          {room.status === 'occupied' && room.roomMovementId && (
            <div className="form-group">
              <button 
                type="button" 
                onClick={() => setShowMistakeConfirmation(true)}
                className="mistake-button"
                disabled={isProcessing}
              >
                Gabim
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}


          <div className="modal-actions">
            {(() => {
              const shouldShowButton = room.status === 'occupied' && room.roomMovementId;
              const isButtonDisabled = isProcessing || !hasDebt;
              
              console.log('🔍 Konfirmo Button Render Check:', {
                'userRole': userRole,
                'room.status': room.status,
                'room.roomMovementId': room.roomMovementId,
                'shouldShowButton': shouldShowButton,
                'hasDebt': hasDebt,
                'isProcessing': isProcessing,
                'isButtonDisabled': isButtonDisabled,
                'room.amountDebt': room.amountDebt,
                'paid': paid
              });
              
              return shouldShowButton ? (
                <button 
                  type="button" 
                  onClick={async () => {
                    console.log('🔍 Konfirmo button clicked - Debug info:', {
                      roomMovementId: room.roomMovementId,
                      amountDebt: room.amountDebt,
                      isProcessing,
                      status: room.status,
                      isEditMode,
                      hasDebt
                    });
                    
                    await getConfirmMessage();
                    setShowConfirmDebtModal(true);
                  }}
                  className="confirm-button"
                  disabled={isButtonDisabled}
                >
                  Konfirmo
                </button>
              ) : null;
            })()}
            {/* Ndrysho (submit) after Konfirmo */}
            <button type="submit" className="save-button" disabled={isProcessing}>
              {isProcessing ? 'Duke Përpunuar...' : (isEditMode ? 'Ndrysho' : 'Ruaj')}
            </button>
            {room.status === 'occupied' && (
              <button 
                type="button" 
                onClick={() => { setDrinksIsFree(false); setShowDrinksModal(true); }}
                className="drinks-button"
              >
                Pijet
              </button>
            )}
            {room.status === 'occupied' && (
              <button 
                type="button" 
                onClick={() => { setDrinksIsFree(true); setShowDrinksModal(true); }}
                className="drinks-button"
                data-free="true"
              >
                Pije Gratis
              </button>
            )}
            {room.status === 'occupied' && room.roomMovementId && (
              <button 
                type="button" 
                onClick={() => setShowRoomDetailsModal(true)}
                className="details-button"
              >
                Detajet
              </button>
            )}
            {room.status === 'occupied' && room.roomMovementId && (
              <button 
                type="button" 
                onClick={handleCloseRoom}
                className="close-room-button"
                disabled={isProcessing}
              >
                Mbyll Dhomen
              </button>
            )}
          </div>
        </form>
      </div>



      {showAddExtraModal && room.roomMovementId && (
        <AddExtraModal
          room={{
            id: room.id,
            name: room.name,
            title: room.title || '',
            roomMovementId: room.roomMovementId,
            roomModel: room.roomModel || ''
          }}
          onClose={() => setShowAddExtraModal(false)}
          onSuccess={() => {
            console.log('AddExtraModal success - refreshing room data');
            setShowAddExtraModal(false);
            // Refresh room data to show updated time and price
            if (onRoomDataRefresh) {
              console.log('Calling onRoomDataRefresh...');
              onRoomDataRefresh();
            } else {
              console.log('onRoomDataRefresh is not defined');
            }
          }}
        />
      )}

      {showDrinksModal && (
        <DrinksModalNew
          roomName={room.name}
          roomMovementId={room.roomMovementId}
          onClose={() => setShowDrinksModal(false)}
          onGenerateInvoice={handleGenerateInvoice}
          isFree={drinksIsFree}
        />
      )}

      {false && showInvoiceModal && (
        <InvoiceModal
          roomName={room.name}
          items={invoiceItems}
          total={invoiceTotal}
          onClose={() => setShowInvoiceModal(false)}
          onOrder={handleOrder}
          onCloseInvoice={handleCloseInvoice}
        />
      )}




      {showRoomDetailsModal && room.roomMovementId && (
        <RoomDetailsModal
          roomMovementId={room.roomMovementId}
          onClose={() => setShowRoomDetailsModal(false)}
        />
      )}

      {showMistakeConfirmation && (
        <ConfirmationModal
          title="Konfirmo Gabimin"
          message="A jeni i sigurt që doni të shënoni këtë dhomë si të hapur gabimisht? Ky veprim nuk mund të kthehet pas."
          confirmText="Po, Shëno si Gabim"
          cancelText="Jo, Anulo"
          onConfirm={handleMistake}
          onCancel={() => setShowMistakeConfirmation(false)}
          isLoading={isProcessing}
          isDestructive={true}
        />
      )}

      {showConfirmDebtModal && (
        <ConfirmationModal
          title="Konfirmo Borxhin"
          message={confirmMessage}
          confirmText="Po, Konfirmo"
          cancelText="Jo, Anulo"
          onConfirm={handleConfirmDebt}
          onCancel={() => setShowConfirmDebtModal(false)}
          isLoading={isProcessing}
          isDestructive={false}
        />
      )}
    </div>
  );
};

export default RoomModal;
