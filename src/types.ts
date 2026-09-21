export type UserRole = 'ADMIN' | 'MANAGER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  username: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
  active: boolean;
  isActive?: boolean;
  status: UserStatus;
  storeOrWorkshop?: string;
  assignedStore?: string;
  discountAllowed?: boolean;
  maxDiscountPercent?: number;
  discountLimitPercent?: number;
  avatarInitial?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export type OrderType = 'PER_PIECES' | 'PER_WEIGHT';

export type ServiceCode = 'DC' | 'LD' | 'SP' | 'ST' | 'ALT' | 'LC' | 'MD' | 'HN' | 'STDC' | 'SC';

export interface ServiceDefinition {
  id: string;
  code: ServiceCode;
  name: string;
  colorHex: string;
  iconBgColor: string;
  description: string;
  baseMultiplier: number;
}

export type GarmentCategory = 'MEN' | 'WOMEN' | 'KIDS' | 'HOUSEHOLD' | 'INSTITUTIONAL' | 'OTHERS' | 'ECO_WASH' | 'SPECIAL' | 'SHOES' | 'COMMON';

export interface GarmentMaster {
  id: string;
  code?: string; // Short code e.g. "B", "SN", "SH", "TK", "LEH"
  itemCode?: string; // Price list Item Code e.g. "SH-01", "DC-KT"
  name: string;
  service?: string; // Service name e.g. "Dry Cleaning", "Laundry", "Steam Press"
  serviceCode?: ServiceCode | string;
  category: GarmentCategory;
  defaultPrice: number;
  price?: number; // Numeric ₹ price
  icon: string; // garment icon identifier
  weightKg?: number;
}

export type PressingMethod = 'Iron Press' | 'Steam Press' | 'Hand Press' | 'No Press' | 'Fold Only' | string;
export const DEFAULT_PRESSING_METHOD: PressingMethod = 'Iron Press';
export const PRESSING_METHOD_OPTIONS: string[] = ['Iron Press', 'Steam Press', 'Hand Press', 'No Press', 'Fold Only'];

export interface SubServiceItem {
  code: ServiceCode;
  name: string;
  price: number;
}

export interface OrderGarmentItem {
  id: string;
  garmentSequence: number; // 1, 2, 3, 4
  barcode: string; // e.g. 4-1-2 (*4-1-2*)
  garmentCode?: string; // e.g. "B", "SN", "SH", "TK", "LEH", "WSI"
  garmentName: string;
  category: GarmentCategory;
  serviceCode: ServiceCode;
  serviceName: string;
  serviceType?: string;
  quantity: number;
  basePrice: number;
  unitPrice?: number;
  subServices: SubServiceItem[]; // ST (50), SP (50), ALT (40)
  totalItemPrice: number; // basePrice + subServices sum
  remarks: string[]; // e.g. ["On Hanger", "Stain on collar"]
  pressingMethod?: PressingMethod; // Garment-level pressing method (e.g. Iron Press, Steam Press)
  weightKg?: number; // For weight-based items
  ratePerKg?: number; // e.g. 75, 125, 110
  weightServiceCode?: 'WSI' | 'WF' | 'WL'; // WSI = Wash & Steam Iron, WF = Wash & Fold, WL = Woolen Laundry
  brand?: string; // e.g. "Bernshaw", "Zara"
  color?: string; // e.g. "Navy Blue", "Maroon"
  status: 'RECEIVED' | 'PROCESSING' | 'PENDING_FINISHING' | 'FINISHED' | 'PACKED' | 'READY' | 'DELIVERED' | 'RETURNED';
  readyOn?: string;
  readyBy?: string;
  deliveredOn?: string;
  deliveredBy?: string;
  returnedOn?: string;
  returnReason?: string;
}

export type OrderStatus = 'DRAFT' | 'RECEIVED' | 'IN_PROCESS' | 'PENDING_FINISHING' | 'READY' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET';
  channel: 'COUNTER' | 'ONLINE_PORTAL';
  referenceId?: string;
  timestamp: string;
  collectedBy: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number; // e.g. 4
  branchCode: string; // e.g. "TE02" (dynamic from businessSettings.branchCode)
  orderSeries: string; // e.g. "*4-2*"
  barcode?: string; // Master order barcode if generated
  orderType: OrderType;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerPlaceOfSupply: string;
  items: OrderGarmentItem[];
  totalPieces: number;
  totalWeightKg?: number; // Total weight for weight-based orders
  deliveryCharge?: number; // Delivery charge amount (e.g. ₹50)
  hasDeliveryCharge?: boolean; // Whether delivery charge is applied
  isPickAndDrop?: boolean; // Whether pick & drop service is chosen
  pickAndDropType?: 'COUNTER_WALKIN' | 'HOME_DELIVERY' | 'DOORSTEP_PICK_DROP'; // Delivery/Pickup mode
  grossAmount: number; // e.g. 910.00
  discountAmount: number; // 0.00
  discountPercent: number; // 0
  discountReason?: string;
  surchargeAmount: number; // e.g. Same Day / Next day
  surchargeType?: 'NONE' | 'SAME_DAY' | 'NEXT_DAY';
  taxRatePercent: number; // 18% GST
  taxAmount: number; // 163.80
  roundOff: number; // 0.20
  netAmount: number; // 1074.00
  advancePaid: number; // 0.00
  balanceDue: number; // 1074.00 (Net - Advance - Total Payments)
  previousOrderPending?: number; // Balance due from customer's previous/last order at time of booking
  previousOrderNumber?: number; // Previous order number reference
  adjustmentApplied?: number; // Previous customer adjustment balance applied to this bill (e.g. ₹5)
  differenceAction?: 'WAIVE' | 'CARRY_FORWARD'; // Payment difference resolution choice
  differenceAmount?: number; // e.g. ₹5
  payments: PaymentTransaction[];
  status: OrderStatus;
  orderDate: string; // e.g. "27 Nov 2025 2:57:00 PM"
  dueDate: string; // e.g. "01 Dec 2025"
  pickupDate?: string;
  pickupTimeSlot?: string; // e.g. "4:30 PM - 6:00 PM"
  pickedUpAt?: string; // e.g. "07-Aug-26 05:40 AM"
  pickedUpBy?: string; // e.g. "Rajesh Sharma (Store Manager)"
  workshopNotes?: string;
  deliveryNotes?: string;
  customerSignature?: string; // base64 data url
  receiptUrl: string; // e.g. "https://cleanera.app/portal/invoice?Reciept=TE02-4-1074-Cust62-183"
  submittedUpiRef?: string; // Customer submitted UPI UTR / Transaction reference
  upiRefSubmittedAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Customer {
  id: string;
  custCode: string; // e.g. "Cust62"
  name: string;
  mobile: string;
  email?: string;
  address: string;
  area: string;
  placeOfSupply: string;
  gstNumber?: string;
  outstandingAmount: number;
  adjustmentBalance?: number; // Carried forward payment difference balance (e.g. ₹5)
  pendingOrdersCount: number;
  totalOrdersCount: number;
  lastVisit: string; // e.g. "0 Day ago"
  notes?: string;
  createdAt: string;
}

export interface BusinessSettings {
  storeName?: string; // Admin Settings -> Store Name dynamically used for WhatsApp & notifications (e.g. "Trendera")
  businessName: string; // e.g. "Trendera Dry Cleaning CRM"
  displayName: string;
  legalName: string;
  branchName: string; // e.g. "C2 Sector 1 Noida"
  branchCode: string; // e.g. "TE02" (dynamic company prefix + branch digits)
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string; // GST/VAT
  gstin?: string; // e.g. 07AAECR5512L1ZS
  allowManagerEditBooking?: boolean;
  logoUrl: string;
  faviconUrl: string;
  marketingMessage: string; // "Your space for marketing or any other message."
  receiptFooterMessage: string;
  customerPortalMessage: string;
  termsAndConditions: string;
  thankYouMessage: string;
  currencySymbol: string; // "Rs." or "₹" or "€" or "$"
  currencyCode: string; // "INR", "EUR", "USD"
  taxRatePercent: number; // 18
  maskPhoneOnThermalReceipt: boolean; // true
  enableOnlinePayment: boolean; // true
  onlinePortalDomain: string; // "https://cleanera.app"
  defaultDueDays: number; // 4 days
  paymentQrUrl?: string; // e.g. "/payment-qr.jpg" or full URL or data URI
  upiId?: string; // e.g. "9041590866@hdfc"
  upiPayeeName?: string; // e.g. "PRITPAL SINGH"
  includeQrInWhatsApp?: boolean; // whether to automatically append payment QR scanner
}

export const INDIAN_STATES_AND_UTS = [
  'Chandigarh',
  'Punjab',
  'Haryana',
  'Delhi',
  'Uttar Pradesh',
  'Himachal Pradesh',
  'Rajasthan',
  'Jammu and Kashmir',
  'Ladakh',
  'Uttarakhand',
  'Maharashtra',
  'Gujarat',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Telangana',
  'Andhra Pradesh',
  'West Bengal',
  'Madhya Pradesh',
  'Bihar',
  'Odisha',
  'Assam',
  'Goa',
  'Jharkhand',
  'Chhattisgarh',
  'Puducherry',
  'Andaman and Nicobar Islands',
  'Arunachal Pradesh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura'
] as const;

export type IndianStateOrUT = typeof INDIAN_STATES_AND_UTS[number] | string;

export type WhatsAppTriggerType = 
  | 'ORDER_CREATED' 
  | 'PICKUP_SCHEDULED' 
  | 'ORDER_READY' 
  | 'PAYMENT_RECEIVED' 
  | 'ORDER_DELIVERED_FEEDBACK' 
  | 'ORDER_UPDATED';

export interface WhatsAppMessage {
  id: string;
  toName: string;
  toPhone: string;
  triggerType: WhatsAppTriggerType;
  messageText: string;
  receiptUrl?: string;
  mediaUrl?: string; // payment QR / scanner image URL or data URI
  mediaType?: 'IMAGE' | 'DOCUMENT';
  qrImageUrl?: string;
  orderNumber?: number;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  isOutbound: boolean;
  errorReason?: string;
}

export interface EmailMessage {
  id: string;
  toName: string;
  toEmail: string;
  orderNumber: number;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  timestamp: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  isOutbound: boolean;
  errorReason?: string;
}

export interface AuditLogEntry {
  id: string;
  orderId?: string;
  orderNumber?: number;
  action: string;
  actionType?: string;
  changedBy: string;
  performedByName?: string;
  performedByRole?: string;
  userRole: UserRole;
  fieldName?: string;
  previousValue?: string | number;
  newValue?: string | number;
  details?: string;
  reason?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface PriceCorrectionRequest {
  id: string;
  orderId: string;
  orderNumber: number;
  customerName: string;
  garmentBarcode?: string;
  garmentName: string;
  requestedBy: string; // Manager
  requestedByName?: string;
  requestedAt: string;
  currentPrice: number;
  originalPrice?: number;
  proposedPrice: number;
  discountPercent?: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
}
