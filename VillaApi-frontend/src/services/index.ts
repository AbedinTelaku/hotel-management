// Export all services
export { default as apiService } from './api';
export { default as authService } from './authService';
export { default as roomService } from './roomService';
export { default as productService } from './productService';
export { default as paymentService } from './paymentService';
export { default as supplyAndSellService } from './supplyAndSellService';
export { default as roomModelService } from './roomModelService';
export { default as roomPriceService } from './roomPriceService';
export { default as roomTypeService } from './roomTypeService';
export { default as suggestionCarNameService } from './suggestionCarNameService';
export { default as privilegeService } from './privilegeService';

// Export types
export type { ApiResponse, ApiError } from './api';
export type { LoginRequest, RegisterRequest, ChangePasswordRequest, User, AuthToken } from './authService';
export type { Room, RoomView, OpenRoomRequest, AddExtraInRoomRequest, RoomDetails } from './roomService';
export type { RoomTypeWithPrice } from './roomTypeService';
export type { Product, ProductCategory, ProductParameters, ProductCategoryParameters } from './productService';
export type { Payment, PaymentSummary } from './paymentService';
export type { SupplyAndSell, SupplyAndSellItem, SupplyAndSellParameters, SupplyAndSellItemsParameters, StockItem } from './supplyAndSellService';
export type { RoomModel, RoomModelDTO } from './roomModelService';
export type { RoomPrice, RoomPriceParameters } from './roomPriceService';
export type { RoomType, RoomTypeDTO } from './roomTypeService';
export type { SuggestionCarName } from './suggestionCarNameService';
export type { Privilege, PrivilegeTreeList } from './privilegeService';
