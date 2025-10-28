import React, { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import { roomTypeService } from '../services/roomTypeService';
import './AddExtraInRoomModal.css';

interface RoomType {
  code: string;
  description: string;
  hours: number;
  price: number;
  isCustom: boolean;
}

interface AddExtraInRoomModalProps {
  roomMovementId: number;
  roomNo: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddExtraInRoomModal: React.FC<AddExtraInRoomModalProps> = ({
  roomMovementId,
  roomNo,
  onClose,
  onSuccess
}) => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [isDebt, setIsDebt] = useState<boolean>(false);
  const [hours, setHours] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Car autocomplete states
  const [carInput, setCarInput] = useState<string>('');
  const [carSuggestions, setCarSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(-1);

  // Lista e gjerë e veturave për autocomplete
  const carNames = [
    // Volkswagen
    'Golf', 'Golf GTI', 'Golf R', 'Golf Plus', 'Golf Alltrack', 'Golf Sportsvan',
    'Passat', 'Passat CC', 'Passat Variant', 'Passat Alltrack',
    'Polo', 'Polo GTI', 'Polo Cross', 'Polo Beats',
    'Tiguan', 'Tiguan Allspace', 'Tiguan R-Line',
    'Touareg', 'Touareg R-Line', 'Touareg V6', 'Touareg V8',
    'Arteon', 'Arteon R-Line', 'Arteon Shooting Brake',
    'T-Cross', 'T-Roc', 'T-Roc Cabriolet', 'T-Roc R',
    'Touran', 'Sharan', 'Caddy', 'Caddy Maxi',
    'ID.3', 'ID.4', 'ID.5', 'ID.6', 'ID.Buzz',
    'Amarok', 'Crafter', 'Transporter',

    // BMW
    'BMW X1', 'BMW X2', 'BMW X3', 'BMW X4', 'BMW X5', 'BMW X6', 'BMW X7', 'BMW XM',
    'BMW 1 Series', 'BMW 2 Series', 'BMW 2 Series Gran Tourer', 'BMW 2 Series Active Tourer',
    'BMW 3 Series', 'BMW 3 Series GT', 'BMW 3 Series Touring',
    'BMW 4 Series', 'BMW 4 Series Gran Coupe', 'BMW 4 Series Convertible',
    'BMW 5 Series', 'BMW 5 Series GT', 'BMW 5 Series Touring',
    'BMW 6 Series', 'BMW 6 Series GT', 'BMW 6 Series Gran Turismo',
    'BMW 7 Series', 'BMW 8 Series', 'BMW 8 Series Gran Coupe', 'BMW 8 Series Convertible',
    'BMW Z4', 'BMW i3', 'BMW i4', 'BMW iX', 'BMW iX3', 'BMW i7', 'BMW iX1',
    'BMW M2', 'BMW M3', 'BMW M4', 'BMW M5', 'BMW M8', 'BMW X5 M', 'BMW X6 M',

    // Mercedes-Benz
    'Mercedes A-Class', 'Mercedes A-Class Sedan', 'Mercedes A-Class Hatchback',
    'Mercedes B-Class', 'Mercedes C-Class', 'Mercedes C-Class Estate', 'Mercedes C-Class Coupe', 'Mercedes C-Class Cabriolet',
    'Mercedes CLA', 'Mercedes CLA Shooting Brake', 'Mercedes CLS', 'Mercedes CLS Shooting Brake',
    'Mercedes E-Class', 'Mercedes E-Class Estate', 'Mercedes E-Class Coupe', 'Mercedes E-Class Cabriolet',
    'Mercedes S-Class', 'Mercedes S-Class Maybach', 'Mercedes S-Class Coupe', 'Mercedes S-Class Cabriolet',
    'Mercedes GLA', 'Mercedes GLB', 'Mercedes GLC', 'Mercedes GLC Coupe', 'Mercedes GLE', 'Mercedes GLE Coupe',
    'Mercedes GLS', 'Mercedes G-Class', 'Mercedes G-Class AMG',
    'Mercedes SL', 'Mercedes SLC', 'Mercedes AMG GT', 'Mercedes AMG GT 4-Door',
    'Mercedes EQE', 'Mercedes EQS', 'Mercedes EQA', 'Mercedes EQB', 'Mercedes EQC',

    // Audi
    'Audi A1', 'Audi A1 Sportback', 'Audi A3', 'Audi A3 Sportback', 'Audi A3 Sedan', 'Audi A3 Cabriolet',
    'Audi A4', 'Audi A4 Avant', 'Audi A4 Allroad', 'Audi A5', 'Audi A5 Sportback', 'Audi A5 Coupe', 'Audi A5 Cabriolet',
    'Audi A6', 'Audi A6 Avant', 'Audi A6 Allroad', 'Audi A7', 'Audi A7 Sportback', 'Audi A8', 'Audi A8 L',
    'Audi Q2', 'Audi Q3', 'Audi Q3 Sportback', 'Audi Q4 e-tron', 'Audi Q5', 'Audi Q5 Sportback', 'Audi Q7', 'Audi Q8',
    'Audi TT', 'Audi TT Roadster', 'Audi R8', 'Audi R8 Spyder',
    'Audi e-tron', 'Audi e-tron GT', 'Audi e-tron Sportback',
    'Audi RS3', 'Audi RS4', 'Audi RS5', 'Audi RS6', 'Audi RS7', 'Audi RS Q8',

    // Toyota
    'Toyota Aygo', 'Toyota Aygo X', 'Toyota Yaris', 'Toyota Yaris Cross', 'Toyota Yaris GR',
    'Toyota Corolla', 'Toyota Corolla Touring Sports', 'Toyota Corolla Cross',
    'Toyota C-HR', 'Toyota RAV4', 'Toyota RAV4 Plug-in Hybrid',
    'Toyota Camry', 'Toyota Camry Hybrid', 'Toyota Prius', 'Toyota Prius Plug-in Hybrid',
    'Toyota Highlander', 'Toyota Land Cruiser', 'Toyota Land Cruiser Prado',
    'Toyota Hilux', 'Toyota Proace', 'Toyota Proace City', 'Toyota Proace Verso',
    'Toyota Mirai', 'Toyota bZ4X', 'Toyota GR86', 'Toyota GR Supra',

    // Honda
    'Honda Jazz', 'Honda Civic', 'Honda Civic Type R', 'Honda Civic Hatchback', 'Honda Civic Sedan',
    'Honda Accord', 'Honda Accord Hybrid', 'Honda CR-V', 'Honda CR-V Hybrid',
    'Honda HR-V', 'Honda Pilot', 'Honda Passport',
    'Honda Insight', 'Honda Clarity', 'Honda e', 'Honda NSX',

    // Ford
    'Ford Ka', 'Ford Fiesta', 'Ford Fiesta ST', 'Ford Fiesta Active',
    'Ford Focus', 'Ford Focus ST', 'Ford Focus RS', 'Ford Focus Active',
    'Ford Mondeo', 'Ford Mondeo Hybrid', 'Ford Mondeo Wagon',
    'Ford Kuga', 'Ford Kuga Plug-in Hybrid', 'Ford Edge', 'Ford Explorer', 'Ford Bronco',
    'Ford Mustang', 'Ford Mustang Mach-E', 'Ford Ranger', 'Ford Transit', 'Ford Transit Custom',
    'Ford EcoSport', 'Ford Puma', 'Ford Tourneo', 'Ford Tourneo Connect',

    // Opel
    'Opel Adam', 'Opel Corsa', 'Opel Corsa-e', 'Opel Corsa GSi',
    'Opel Astra', 'Opel Astra Sports Tourer', 'Opel Astra GSi',
    'Opel Insignia', 'Opel Insignia Grand Sport', 'Opel Insignia Country Tourer',
    'Opel Crossland', 'Opel Crossland X', 'Opel Grandland', 'Opel Grandland X',
    'Opel Mokka', 'Opel Mokka X', 'Opel Combo', 'Opel Combo Life', 'Opel Vivaro', 'Opel Movano',

    // Peugeot
    'Peugeot 108', 'Peugeot 208', 'Peugeot 208 GTi', 'Peugeot 208 e-208',
    'Peugeot 308', 'Peugeot 308 SW', 'Peugeot 308 GTi',
    'Peugeot 508', 'Peugeot 508 SW', 'Peugeot 508 PSE',
    'Peugeot 2008', 'Peugeot 2008 GT', 'Peugeot 2008 e-2008',
    'Peugeot 3008', 'Peugeot 3008 GT', 'Peugeot 3008 Hybrid', 'Peugeot 3008 PHEV',
    'Peugeot 5008', 'Peugeot 5008 GT', 'Peugeot 5008 Hybrid', 'Peugeot 5008 PHEV',
    'Peugeot Rifter', 'Peugeot Traveller', 'Peugeot Expert', 'Peugeot Boxer',

    // Renault
    'Renault Twingo', 'Renault Clio', 'Renault Clio RS', 'Renault Clio E-Tech',
    'Renault Captur', 'Renault Captur E-Tech', 'Renault Megane', 'Renault Megane RS',
    'Renault Megane Estate', 'Renault Talisman', 'Renault Talisman Estate',
    'Renault Kadjar', 'Renault Koleos', 'Renault Arkana',
    'Renault Kangoo', 'Renault Kangoo Z.E.', 'Renault Trafic', 'Renault Master',
    'Renault Zoe', 'Renault Twizy', 'Renault Fluence',

    // Nissan
    'Nissan Micra', 'Nissan Micra Active', 'Nissan Juke', 'Nissan Juke Hybrid',
    'Nissan Qashqai', 'Nissan Qashqai e-Power', 'Nissan X-Trail', 'Nissan X-Trail Hybrid',
    'Nissan Pathfinder', 'Nissan Murano', 'Nissan Armada',
    'Nissan Navara', 'Renault Alaskan', 'Nissan Patrol', 'Nissan Patrol Y62',
    'Nissan 370Z', 'Nissan GT-R', 'Nissan Leaf', 'Nissan Ariya',

    // Hyundai
    'Hyundai i10', 'Hyundai i20', 'Hyundai i20 Active', 'Hyundai i20 N',
    'Hyundai i30', 'Hyundai i30 N', 'Hyundai i30 Fastback', 'Hyundai i30 Wagon',
    'Hyundai i40', 'Hyundai i40 Wagon', 'Hyundai Elantra', 'Hyundai Sonata',
    'Hyundai Tucson', 'Hyundai Tucson Hybrid', 'Hyundai Tucson Plug-in Hybrid',
    'Hyundai Santa Fe', 'Hyundai Santa Fe Hybrid', 'Hyundai Santa Fe Plug-in Hybrid',
    'Hyundai Kona', 'Hyundai Kona Electric', 'Hyundai Ioniq', 'Hyundai Ioniq 5', 'Hyundai Ioniq 6',

    // Kia
    'Kia Picanto', 'Kia Rio', 'Kia Ceed', 'Kia Ceed GT', 'Kia Ceed Sportswagon',
    'Kia Cerato', 'Kia Optima', 'Kia Stinger', 'Kia Stinger GT',
    'Kia Stonic', 'Kia XCeed', 'Kia Sportage', 'Kia Sportage Plug-in Hybrid',
    'Kia Sorento', 'Kia Sorento Plug-in Hybrid', 'Kia Telluride',
    'Kia Soul', 'Kia Soul EV', 'Kia Niro', 'Kia Niro EV', 'Kia Niro Plug-in Hybrid',
    'Kia EV6', 'Kia EV9',

    // Skoda
    'Skoda Citigo', 'Skoda Fabia', 'Skoda Scala', 'Skoda Octavia', 'Skoda Octavia RS',
    'Skoda Octavia Scout', 'Skoda Superb', 'Skoda Superb iV', 'Skoda Superb Scout',
    'Skoda Kamiq', 'Skoda Karoq', 'Skoda Kodiaq', 'Skoda Kodiaq RS', 'Skoda Kodiaq Scout',
    'Skoda Enyaq', 'Skoda Enyaq Coupe', 'Skoda Kushaq', 'Skoda Slavia',

    // Mazda
    'Mazda 2', 'Mazda 3', 'Mazda 3 Hatchback', 'Mazda 3 Sedan', 'Mazda 3 Wagon',
    'Mazda 6', 'Mazda 6 Wagon', 'Mazda CX-3', 'Mazda CX-30', 'Mazda CX-5', 'Mazda CX-9',
    'Mazda MX-5', 'Mazda MX-5 RF', 'Mazda MX-30',

    // Subaru
    'Subaru Impreza', 'Subaru Legacy', 'Subaru Outback', 'Subaru Forester',
    'Subaru XV', 'Subaru WRX', 'Subaru WRX STI', 'Subaru BRZ',

    // Mitsubishi
    'Mitsubishi Mirage', 'Mitsubishi Lancer', 'Mitsubishi Outlander', 'Mitsubishi Outlander PHEV',
    'Mitsubishi Eclipse Cross', 'Mitsubishi ASX', 'Mitsubishi L200', 'Mitsubishi Shogun',

    // Volvo
    'Volvo XC40', 'Volvo XC40 Recharge', 'Volvo XC60', 'Volvo XC60 Recharge',
    'Volvo XC90', 'Volvo XC90 Recharge', 'Volvo S60', 'Volvo S90', 'Volvo V60', 'Volvo V90',

    // Lexus
    'Lexus IS', 'Lexus IS F', 'Lexus ES', 'Lexus GS', 'Lexus LS', 'Lexus LC',
    'Lexus NX', 'Lexus NX F Sport', 'Lexus RX', 'Lexus RX F Sport', 'Lexus GX', 'Lexus LX',

    // Infiniti
    'Infiniti Q30', 'Infiniti Q50', 'Infiniti Q60', 'Infiniti Q70',
    'Infiniti QX30', 'Infiniti QX50', 'Infiniti QX60', 'Infiniti QX70', 'Infiniti QX80',

    // Jaguar
    'Jaguar XE', 'Jaguar XF', 'Jaguar XJ', 'Jaguar F-Type', 'Jaguar F-Pace', 'Jaguar E-Pace', 'Jaguar I-Pace',

    // Land Rover
    'Land Rover Discovery Sport', 'Land Rover Discovery', 'Land Rover Range Rover Evoque',
    'Land Rover Range Rover Velar', 'Land Rover Range Rover Sport', 'Land Rover Range Rover',
    'Land Rover Defender',

    // Porsche
    'Porsche 911', 'Porsche 911 Carrera', 'Porsche 911 Turbo', 'Porsche 911 GT3',
    'Porsche Cayenne', 'Porsche Cayenne Coupe', 'Porsche Macan', 'Porsche Panamera',
    'Porsche Taycan', 'Porsche Taycan Cross Turismo', 'Porsche Boxster', 'Porsche Cayman',

    // Alfa Romeo
    'Alfa Romeo Giulietta', 'Alfa Romeo Giulia', 'Alfa Romeo Stelvio', 'Alfa Romeo Tonale',

    // Fiat
    'Fiat 500', 'Fiat 500L', 'Fiat 500X', 'Fiat Panda', 'Fiat Tipo', 'Fiat Doblo', 'Fiat Ducato',

    // Lancia
    'Lancia Ypsilon', 'Lancia Delta', 'Lancia Musa', 'Lancia Phedra',

    // Mini
    'Mini Cooper', 'Mini Cooper S', 'Mini Cooper JCW', 'Mini Countryman', 'Mini Clubman', 'Mini Convertible',

    // Smart
    'Smart ForTwo', 'Smart ForFour', 'Smart ForTwo Cabrio', 'Smart EQ ForTwo', 'Smart EQ ForFour',

    // Dacia
    'Dacia Sandero', 'Dacia Logan', 'Dacia Duster', 'Dacia Lodgy', 'Dacia Dokker', 'Dacia Spring',

    // Seat
    'Seat Ibiza', 'Seat Leon', 'Seat Leon ST', 'Seat Toledo', 'Seat Arona', 'Seat Ateca', 'Seat Tarraco',

    // Cupra
    'Cupra Born', 'Cupra Formentor', 'Cupra Leon', 'Cupra Ateca'
  ];

  useEffect(() => {
    loadRoomTypes();
  }, []);


  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get room model from room number (assuming VIP rooms have different model)
      const roomModel = roomNo.toLowerCase().includes('vip') ? 'VIP' : 'STANDARD';
      
      const response = await roomTypeService.getExtraRoomTypes(roomModel);
      
      if (response.isSuccessfull && response.data) {
        setRoomTypes(response.data);
        if (response.data.length > 0) {
          const firstType = response.data[0];
          setSelectedRoomType(firstType.code);
          setHours(firstType.hours);
          setPrice(firstType.price);
        }
      } else {
        throw new Error('Failed to load room types');
      }
    } catch (error) {
      console.error('Error loading room types:', error);
      setError('Gabim në ngarkimin e llojeve të dhomave');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomTypeChange = (roomTypeCode: string) => {
    const roomType = roomTypes.find(rt => rt.code === roomTypeCode);
    if (roomType) {
      setSelectedRoomType(roomTypeCode);
      setHours(roomType.hours);
      setPrice(roomType.price);
    }
  };

  // Car autocomplete functions
  const handleCarInputChange = (value: string) => {
    setCarInput(value);
    setSelectedCarIndex(-1);
    
    if (value.length > 0) {
      const filteredCars = carNames.filter(car => 
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
    setCarInput(carName);
    setShowSuggestions(false);
    setSelectedCarIndex(-1);
  };

  const handleCarInputKeyDown = (e: React.KeyboardEvent) => {
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

  const handleCarInputBlur = () => {
    // Delay hiding suggestions to allow clicks on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedCarIndex(-1);
    }, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomType) {
      setError('Ju lutemi zgjidhni një lloj dhome');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const extraData = {
        roomMovementId,
        roomType: selectedRoomType,
        isDebt,
        hours,
        price
      };

      const response = await roomService.addExtraInRoom(extraData);
      
      if (response.isSuccessfull) {
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to add extra to room');
      }
    } catch (error) {
      console.error('Error adding extra to room:', error);
      setError('Gabim në shtimin e shtesës në dhomë');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content add-extra-modal">
        <div className="modal-header">
          <h2>Shto Shtesë në Dhomën {roomNo}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="roomType">Lloji i Dhomës:</label>
            <select
              id="roomType"
              value={selectedRoomType}
              onChange={(e) => handleRoomTypeChange(e.target.value)}
              className="form-select"
              disabled={loading}
            >
              <option value="">Zgjidhni llojin e dhomës</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.code} value={roomType.code}>
                  {roomType.description} - {roomType.hours}h - €{roomType.price}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hours">Orët:</label>
            <input
              type="number"
              id="hours"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="form-input"
              min="0"
              step="0.5"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Çmimi (€):</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="form-input"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="car">Vetura:</label>
            <div className="car-autocomplete-container">
              <input
                type="text"
                id="car"
                value={carInput}
                onChange={(e) => handleCarInputChange(e.target.value)}
                onKeyDown={handleCarInputKeyDown}
                onBlur={handleCarInputBlur}
                onFocus={() => carInput.length > 0 && setShowSuggestions(true)}
                className="form-input"
                placeholder="Shkruani emrin e veturës..."
                disabled={loading}
              />
              {showSuggestions && carSuggestions.length > 0 && (
                <div className="car-suggestions">
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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isDebt}
                onChange={(e) => setIsDebt(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-text">Është Borxh</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              disabled={loading}
            >
              Anulo
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading || !selectedRoomType}
            >
              {loading ? 'Duke Ruajtur...' : 'Ruaj Shtesën'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExtraInRoomModal;
