import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  QrCode, 
  Save, 
  Lock, 
  ShieldCheck, 
  User, 
  Tag, 
  RotateCcw,
  DollarSign,
  Scale,
  Layers,
  Truck,
  Bike,
  Store,
  Sparkles,
  Flame,
  Minus,
  CheckCircle2,
  Package,
  FileText,
  Waves,
  Shield,
  Scissors,
  Heart,
  Smile,
  Home,
  Building,
  Leaf,
  Footprints,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Edit3,
  ClipboardList
} from 'lucide-react';
import { 
  GarmentMaster, 
  ServiceCode, 
  SubServiceItem, 
  OrderGarmentItem, 
  OrderType, 
  Customer,
  GarmentCategory,
  PressingMethod,
  DEFAULT_PRESSING_METHOD,
  PRESSING_METHOD_OPTIONS
} from '../../types';
import { garmentCatalog, serviceDefinitions } from '../../data/initialData';
import { ReadyDateCalendar } from './ReadyDateCalendar';
import { GarmentIcon } from './GarmentIcon';

// Helper function to convert numeric amount to Indian currency words format
function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 === 0 ? '' : ' ' + inWords(n % 100));
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 === 0 ? '' : ' ' + inWords(n % 1000));
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 === 0 ? '' : ' ' + inWords(n % 100000));
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 === 0 ? '' : ' ' + inWords(n % 10000000));
  };

  const whole = Math.floor(Math.abs(num));
  const fraction = Math.round((Math.abs(num) - whole) * 100);

  let result = inWords(whole) + ' Rupees';
  if (fraction > 0) {
    result += ' and ' + inWords(fraction) + ' Paise';
  }
  return result + ' Only';
}

// 3 Weight-based options (WSI, WF, WL)
const WEIGHT_SERVICES = [
  {
    code: 'WSI' as const,
    name: 'Wash & Steam Iron (WSI)',
    shortName: 'Wash & Steam Iron',
    ratePerKg: 75,
    description: 'Hygienic wash + professional steam ironing (₹75 × Weight)',
    defaultPressing: 'Steam Press',
    colorClass: 'text-amber-700',
    bgLightClass: 'bg-amber-50/70 border-amber-200',
    badgeBg: 'bg-amber-600 text-white'
  },
  {
    code: 'WF' as const,
    name: 'Wash & Fold (WF)',
    shortName: 'Wash & Fold',
    ratePerKg: 125,
    description: 'Daily wear wash, tumble dry & crisp folding (₹125 × Weight)',
    defaultPressing: 'Fold Only',
    colorClass: 'text-emerald-700',
    bgLightClass: 'bg-emerald-50/70 border-emerald-200',
    badgeBg: 'bg-emerald-600 text-white'
  },
  {
    code: 'WL' as const,
    name: 'Woolen Laundry (WL)',
    shortName: 'Woolen Laundry',
    ratePerKg: 110,
    description: 'Delicate woolens, winter wear & gentle tumble (₹110 × Weight)',
    defaultPressing: 'Steam Press',
    colorClass: 'text-indigo-700',
    bgLightClass: 'bg-indigo-50/70 border-indigo-200',
    badgeBg: 'bg-indigo-600 text-white'
  }
];

// Service Tabs (Screenshot 2: Dry Cleaning, Laundry, Steam Press Only, Leather Care, Mending Only)
const SERVICE_TABS: { code: ServiceCode; name: string; icon: React.ComponentType<{ className?: string }>; description: string; multiplier: number }[] = [
  { code: 'DC', name: 'Dry Cleaning', icon: Sparkles, description: 'Solvent wash & deluxe pressing', multiplier: 1.0 },
  { code: 'LD', name: 'Laundry', icon: Waves, description: 'Machine wash & tumble dry', multiplier: 0.7 },
  { code: 'SP', name: 'Steam Press Only', icon: Flame, description: 'High pressure steam finish', multiplier: 0.4 },
  { code: 'LC', name: 'Leather Care', icon: Shield, description: 'Conditioning & restoration', multiplier: 2.2 },
  { code: 'MD', name: 'Mending Only', icon: Scissors, description: 'Button, zipper & minor repairs', multiplier: 0.35 },
];

// Category Tabs (Men, Women, Kids, Household, Shoes, Institutional, Common, Others, Eco Wash)
const CATEGORY_TABS: { id: GarmentCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'MEN', label: 'Men', icon: User },
  { id: 'WOMEN', label: 'Women', icon: Heart },
  { id: 'KIDS', label: 'Kids', icon: Smile },
  { id: 'HOUSEHOLD', label: 'Household', icon: Home },
  { id: 'SHOES', label: 'Shoes', icon: Footprints },
  { id: 'INSTITUTIONAL', label: 'Institutional', icon: Building },
  { id: 'COMMON', label: 'Common', icon: Sparkles },
  { id: 'OTHERS', label: 'Others', icon: Package },
  { id: 'ECO_WASH', label: 'Eco Wash', icon: Leaf },
];

export const DropScreen: React.FC = () => {
  const { 
    customers, 
    currentUser, 
    currentRole, 
    createOrder, 
    businessSettings, 
    setThermalReceiptModalOpen,
    setQRTagPreviewModalOpen,
    setPriceCorrectionModalOpen,
    showToast,
    setActiveView,
    activeCustomerId,
    setActiveCustomerId
  } = useApp();

  // 1. Customer Selection State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(activeCustomerId || customers[0]?.id || '');
  
  useEffect(() => {
    if (activeCustomerId) {
      setSelectedCustomerId(activeCustomerId);
    }
  }, [activeCustomerId]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // 2. Main Order Type (PER PIECE vs BY WEIGHT)
  const [orderType, setOrderType] = useState<OrderType>('PER_PIECES');

  // 3. Per Piece Catalog Tabs & Search (Screenshot 2)
  const [selectedServiceTab, setSelectedServiceTab] = useState<ServiceCode>('DC');
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>('MEN');
  const [garmentSearch, setGarmentSearch] = useState('');

  // 4. Weight-Based State
  const [selectedWeightService, setSelectedWeightService] = useState<'WSI' | 'WF' | 'WL'>('WSI');
  const [weightInput, setWeightInput] = useState<string>('3.0');
  const [piecesInput, setPiecesInput] = useState<string>('6');

  // 5. Cart items (Order Items)
  const [items, setItems] = useState<OrderGarmentItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // 6. Delivery & Pickup Options (Inactive by default until manager selects)
  const [hasDeliveryCharge, setHasDeliveryCharge] = useState<boolean>(false);
  const [deliveryChargeAmount, setDeliveryChargeAmount] = useState<number>(50);
  const [pickAndDropType, setPickAndDropType] = useState<'COUNTER_WALKIN' | 'HOME_DELIVERY' | 'DOORSTEP_PICK_DROP' | null>(null);

  // 7. Surcharges, Discounts, Advance, Notes
  const [surchargeType, setSurchargeType] = useState<'NONE' | 'SAME_DAY' | 'NEXT_DAY'>('NONE');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'NET_BANKING'>('CASH');
  const [workshopNotes, setWorkshopNotes] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  
  // 8. Payment Difference & Customer Adjustment Balance
  const [applyAdjustment, setApplyAdjustment] = useState<boolean>(true);
  const [advanceDiffOption, setAdvanceDiffOption] = useState<'WAIVE' | 'CARRY_FORWARD' | null>(null);
  
  // Ready target date initialized to defaultDueDays, skipping Thursday if needed
  const [selectedDueDate, setSelectedDueDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + (businessSettings.defaultDueDays || 4));
    if (d.getDay() === 4) { // Thursday is weekly holiday
      d.setDate(d.getDate() + 1);
    }
    return d;
  });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 = Search Customer
      if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.getElementById('pos-customer-search');
        if (searchInput) searchInput.focus();
        showToast('F2 pressed: Customer Search focused', 'info');
      }

      // F4 = Price Check / Correction
      if (e.key === 'F4') {
        e.preventDefault();
        if (currentRole === 'MANAGER') {
          showToast('F4 pressed: Anti-fraud protection active. Price correction opened.', 'warning');
          setPriceCorrectionModalOpen(true);
        } else {
          showToast('F4 pressed: Admin pricing controls active.', 'info');
        }
      }

      // F12 or Ctrl+S = Create / Save Order
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        if (!pickAndDropType) {
          showToast('Please select a Delivery Option (Store Counter, Home Delivery, or Pick & Drop) before creating the order.', 'warning');
          return;
        }
        handleSaveOrder();
      }

      // Escape = Cancel / Clear cart
      if (e.key === 'Escape') {
        if (items.length > 0) {
          if (window.confirm('Cancel and clear current order draft?')) {
            setItems([]);
            showToast('Order draft cancelled and cleared.', 'info');
          }
        }
      }

      // Ctrl + H = Customers
      if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setActiveView('CUSTOMER');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedCustomerId, discountPercent, advancePaid, currentRole, hasDeliveryCharge, deliveryChargeAmount, pickAndDropType, selectedDueDate]);

  const selectedCustomer: Customer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Active weight service config
  const currentWeightConfig = WEIGHT_SERVICES.find(w => w.code === selectedWeightService) || WEIGHT_SERVICES[0];
  const parsedWeight = Math.max(0, parseFloat(weightInput) || 0);
  const parsedPieces = Math.max(1, parseInt(piecesInput, 10) || 1);
  const calculatedWeightCost = Math.round(parsedWeight * currentWeightConfig.ratePerKg * 100) / 100;

  // Active master catalog (synchronized with Master Data screen & localStorage)
  const [activeCatalog, setActiveCatalog] = useState<GarmentMaster[]>(() => {
    try {
      const saved = localStorage.getItem('cleanera_master_garments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedIds = new Set(parsed.map((p: GarmentMaster) => p.id));
          const savedKeys = new Set(
            parsed.map((p: GarmentMaster) => `${(p.service || '').toLowerCase()}::${p.category.toLowerCase()}::${p.name.toLowerCase()}::${(p.itemCode || p.code || '').toLowerCase()}`)
          );
          const missing = garmentCatalog.filter(c => {
            const key = `${(c.service || '').toLowerCase()}::${c.category.toLowerCase()}::${c.name.toLowerCase()}::${(c.itemCode || c.code || '').toLowerCase()}`;
            return !savedIds.has(c.id) && !savedKeys.has(key);
          });
          return [...parsed, ...missing];
        }
      }
    } catch (e) {
      console.error('Failed to load saved master catalog in DropScreen:', e);
    }
    return garmentCatalog;
  });

  // Calculate dynamic price of a garment based on service code
  const getGarmentPrice = (garment: GarmentMaster, serviceCode: ServiceCode): number => {
    // If this garment record matches the requested service code, use its price directly
    if (garment.serviceCode === serviceCode && (garment.price !== undefined || garment.defaultPrice !== undefined)) {
      return garment.price ?? garment.defaultPrice;
    }
    // Check if there is another entry in activeCatalog for the exact same garment under the requested service
    const serviceSpecificItem = activeCatalog.find(
      g => g.name.toLowerCase() === garment.name.toLowerCase() &&
           g.category.toLowerCase() === garment.category.toLowerCase() &&
           g.serviceCode === serviceCode
    );
    if (serviceSpecificItem) {
      return serviceSpecificItem.price ?? serviceSpecificItem.defaultPrice;
    }

    if (garment.price !== undefined && (!garment.serviceCode || garment.serviceCode === serviceCode)) {
      return garment.price;
    }

    const serviceDef = serviceDefinitions.find(s => s.code === serviceCode) || serviceDefinitions[0];
    if (serviceCode === 'DC') {
      return garment.defaultPrice;
    }
    return Math.round(garment.defaultPrice * (serviceDef.baseMultiplier || 1.0));
  };

  // Get total pieces of this garment currently in cart
  const getGarmentCartCount = (garmentName: string): number => {
    return items
      .filter(i => i.garmentName.toLowerCase() === garmentName.toLowerCase())
      .reduce((sum, i) => sum + (i.quantity || 1), 0);
  };

  // Filter garments for Per-Piece catalog view
  const hasServiceSpecificItems = activeCatalog.some(
    g => g.category.toUpperCase() === selectedCategory.toUpperCase() && g.serviceCode === selectedServiceTab
  );

  const filteredGarments = activeCatalog.filter(g => {
    const q = garmentSearch.trim().toLowerCase();
    const itemCode = (g.itemCode || g.code || '').toLowerCase();
    const matchesSearch = q === '' || 
      g.name.toLowerCase().includes(q) || 
      itemCode.includes(q) ||
      (g.service && g.service.toLowerCase().includes(q));
    
    if (q !== '') {
      return matchesSearch;
    }

    const matchesCategory = g.category.toUpperCase() === selectedCategory.toUpperCase();
    if (!matchesCategory) return false;

    if (hasServiceSpecificItems) {
      return g.serviceCode === selectedServiceTab;
    }
    return true;
  });

  // Add Per-Piece Garment to Cart
  const handleAddGarment = (
    garment: GarmentMaster, 
    serviceCode: ServiceCode = selectedServiceTab, 
    pressingMethod: PressingMethod = selectedServiceTab === 'SP' ? 'Steam Press' : selectedServiceTab === 'LD' ? 'Fold Only' : 'Iron Press'
  ) => {
    const serviceDef = serviceDefinitions.find(s => s.code === serviceCode) || serviceDefinitions[0];
    const unitPrice = getGarmentPrice(garment, serviceCode);
    
    // Check if identical item already exists in cart
    const existingIndex = items.findIndex(
      i => i.garmentName.toLowerCase() === garment.name.toLowerCase() &&
           i.serviceCode === serviceCode &&
           i.pressingMethod === pressingMethod &&
           i.subServices.length === 0 &&
           i.remarks.length === 0 &&
           !i.weightKg
    );

    if (existingIndex !== -1) {
      const updated = [...items];
      const existing = updated[existingIndex];
      const newQty = (existing.quantity || 1) + 1;
      const subSum = existing.subServices.reduce((a, b) => a + b.price, 0);
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalItemPrice: (existing.basePrice * newQty) + (subSum * newQty)
      };
      setItems(updated);
      setExpandedItemId(existing.id);
      showToast(`Increased ${garment.name} (${serviceDef.name}) quantity to ${newQty}.`, 'info');
      return;
    }

    const seq = items.length + 1;
    const newItemId = `item-${Date.now()}-${seq}`;
    const newItem: OrderGarmentItem = {
      id: newItemId,
      garmentSequence: seq,
      barcode: `4-${seq}-2`,
      garmentCode: garment.code || garment.name.slice(0, 3).toUpperCase(),
      garmentName: garment.name,
      category: garment.category,
      serviceCode: serviceCode,
      serviceName: serviceDef.name,
      quantity: 1,
      basePrice: unitPrice,
      subServices: [],
      totalItemPrice: unitPrice,
      remarks: [],
      pressingMethod: pressingMethod || DEFAULT_PRESSING_METHOD,
      status: 'RECEIVED'
    };

    setItems([...items, newItem]);
    setExpandedItemId(newItemId);
    showToast(`Added ${garment.name} (${serviceDef.name}) - ₹${unitPrice} to order.`, 'success');
  };

  // Add Weight Package to Cart
  const handleAddWeightPackage = () => {
    if (parsedWeight <= 0) {
      showToast('Please enter a valid weight in kg (greater than 0).', 'warning');
      return;
    }

    const seq = items.length + 1;
    const newItemId = `weight-item-${Date.now()}-${seq}`;
    const newItem: OrderGarmentItem = {
      id: newItemId,
      garmentSequence: seq,
      barcode: `4-${seq}-2`,
      garmentCode: currentWeightConfig.code,
      garmentName: `${currentWeightConfig.name} (${currentWeightConfig.code})`,
      category: 'HOUSEHOLD',
      serviceCode: 'LD',
      serviceName: `${currentWeightConfig.name} @ ₹${currentWeightConfig.ratePerKg}/kg`,
      quantity: parsedPieces,
      weightKg: parsedWeight,
      ratePerKg: currentWeightConfig.ratePerKg,
      weightServiceCode: currentWeightConfig.code,
      basePrice: calculatedWeightCost,
      subServices: [],
      totalItemPrice: calculatedWeightCost,
      remarks: [`Weight: ${parsedWeight} kg`, `Est. Pieces: ${parsedPieces}`, `Rate: ₹${currentWeightConfig.ratePerKg}/kg`],
      pressingMethod: currentWeightConfig.defaultPressing,
      status: 'RECEIVED'
    };

    setItems([...items, newItem]);
    setExpandedItemId(newItemId);
    showToast(`Added ${currentWeightConfig.shortName} (${parsedWeight} kg @ ₹${currentWeightConfig.ratePerKg}/kg = ₹${calculatedWeightCost.toFixed(2)}) to order.`, 'success');
  };

  // Quantity Change Handler (Directly editable)
  const handleQuantityChange = (index: number, newQty: number) => {
    const qty = Math.max(1, newQty || 1);
    const updated = [...items];
    const item = updated[index];
    const subSum = item.subServices.reduce((a, b) => a + b.price, 0);
    updated[index] = {
      ...item,
      quantity: qty,
      totalItemPrice: (item.basePrice * qty) + (subSum * qty)
    };
    setItems(updated);
  };

  const handleIncrementQuantity = (index: number) => {
    const current = items[index].quantity || 1;
    handleQuantityChange(index, current + 1);
  };

  const handleDecrementQuantity = (index: number) => {
    const current = items[index].quantity || 1;
    if (current > 1) {
      handleQuantityChange(index, current - 1);
    } else {
      handleRemoveItem(index);
    }
  };

  // Unit Price Change Handler (Directly editable - applies to current order only without changing master catalog)
  const handlePriceChange = (index: number, newPrice: number) => {
    const price = Math.max(0, isNaN(newPrice) ? 0 : newPrice);
    const updated = [...items];
    const item = updated[index];
    const qty = item.quantity || 1;
    const subSum = item.subServices.reduce((a, b) => a + b.price, 0);
    updated[index] = {
      ...item,
      basePrice: price,
      totalItemPrice: (price * qty) + (subSum * qty)
    };
    setItems(updated);
  };

  // Change Pressing Method for item
  const handleChangePressingMethod = (index: number, method: PressingMethod) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      pressingMethod: method
    };
    setItems(updated);
    showToast(`Item #${index + 1} pressing set to ${method}.`, 'info');
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    const itemToRemove = items[index];
    const updated = items.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      garmentSequence: idx + 1,
      barcode: `4-${idx + 1}-2`
    }));
    setItems(updated);
    if (itemToRemove && expandedItemId === itemToRemove.id) {
      setExpandedItemId(null);
    }
    showToast(`Removed ${itemToRemove?.garmentName || 'item'} from order.`, 'info');
  };

  // Change Service for item
  const handleChangeService = (index: number, newServiceCode: ServiceCode) => {
    const serviceDef = serviceDefinitions.find(s => s.code === newServiceCode) || serviceDefinitions[0];
    const updated = [...items];
    const currentItem = updated[index];
    const garmentRef = activeCatalog.find(
      g => g.name.toLowerCase() === currentItem.garmentName.toLowerCase() &&
           (!g.serviceCode || g.serviceCode === newServiceCode)
    ) || activeCatalog.find(g => g.name.toLowerCase() === currentItem.garmentName.toLowerCase());
    const newUnitPrice = currentItem.weightKg 
      ? currentItem.basePrice 
      : (garmentRef ? getGarmentPrice(garmentRef, newServiceCode) : 100);
    const qty = currentItem.quantity || 1;
    const subSum = currentItem.subServices.reduce((a, b) => a + b.price, 0);

    updated[index] = {
      ...currentItem,
      serviceCode: newServiceCode,
      serviceName: serviceDef.name,
      basePrice: newUnitPrice,
      totalItemPrice: (newUnitPrice * qty) + (subSum * qty)
    };
    setItems(updated);
    showToast(`Updated service to ${serviceDef.name} (₹${newUnitPrice}/unit).`, 'info');
  };

  // Toggle Sub-service (Add-on)
  const handleToggleSubService = (index: number, subCode: ServiceCode, name: string, price: number) => {
    const updated = [...items];
    const currentItem = updated[index];
    const exists = currentItem.subServices.some(s => s.code === subCode);

    let newSubServices: SubServiceItem[];
    if (exists) {
      newSubServices = currentItem.subServices.filter(s => s.code !== subCode);
    } else {
      newSubServices = [...currentItem.subServices, { code: subCode, name, price }];
    }

    const subSum = newSubServices.reduce((a, b) => a + b.price, 0);
    const qty = currentItem.quantity || 1;
    updated[index] = {
      ...currentItem,
      subServices: newSubServices,
      totalItemPrice: (currentItem.basePrice * qty) + (subSum * qty)
    };
    setItems(updated);
  };

  // Toggle Remark / Defect
  const handleToggleRemark = (index: number, remark: string) => {
    const updated = [...items];
    const currentItem = updated[index];
    const exists = currentItem.remarks.includes(remark);

    let newRemarks: string[];
    if (exists) {
      newRemarks = currentItem.remarks.filter(r => r !== remark);
    } else {
      newRemarks = [...currentItem.remarks, remark];
    }

    updated[index] = {
      ...currentItem,
      remarks: newRemarks
    };
    setItems(updated);
  };

  // Financial Calculations (Live recalculation upon Qty/Price edit)
  const itemsGrossAmount = items.reduce((sum, item) => sum + item.totalItemPrice, 0);

  // Delivery charge calculation
  const isDeliveryApplied = hasDeliveryCharge || pickAndDropType === 'HOME_DELIVERY' || pickAndDropType === 'DOORSTEP_PICK_DROP';
  const effectiveDeliveryCharge = isDeliveryApplied ? (deliveryChargeAmount || 50) : 0;

  // Gross before surcharges and discounts
  const grossAmount = itemsGrossAmount + effectiveDeliveryCharge;
  
  // Surcharges
  let calculatedSurcharge = 0;
  if (surchargeType === 'SAME_DAY') calculatedSurcharge = Math.round((itemsGrossAmount * 50) / 100);
  if (surchargeType === 'NEXT_DAY') calculatedSurcharge = Math.round((itemsGrossAmount * 25) / 100);

  const subTotalWithSurcharge = grossAmount + calculatedSurcharge;
  const calculatedDiscount = Number(((subTotalWithSurcharge * discountPercent) / 100).toFixed(2));
  
  // Available customer adjustment balance (e.g. ₹5 carried forward from prior order)
  const availableAdjustment = selectedCustomer?.adjustmentBalance || 0;
  const effectiveAdjustment = (applyAdjustment && availableAdjustment > 0) ? availableAdjustment : 0;

  const netBeforeAdjustment = Math.max(0, subTotalWithSurcharge - calculatedDiscount);
  const netBeforeRound = Math.max(0, netBeforeAdjustment + effectiveAdjustment);
  const roundedTotal = Math.round(netBeforeRound);
  const roundOff = Number((roundedTotal - netBeforeRound).toFixed(2));

  // Advance payment difference calculation
  const advanceDiff = Math.max(0, Number((roundedTotal - advancePaid).toFixed(2)));
  const balanceDue = (advancePaid > 0 && advanceDiff > 0 && (advanceDiffOption === 'WAIVE' || advanceDiffOption === 'CARRY_FORWARD'))
    ? 0
    : Math.max(0, roundedTotal - advancePaid);

  const totalPiecesCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalWeightKg = items.reduce((sum, i) => sum + (i.weightKg || 0), 0);

  const dueDateFormatted = selectedDueDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Save Order
  const handleSaveOrder = () => {
    try {
      const targetCustomer = selectedCustomer || (selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : undefined) || customers[0];
      if (!targetCustomer) {
        showToast('Please select or create a customer before saving the order.', 'warning');
        return;
      }

      if (!pickAndDropType) {
        showToast('Please select a Delivery Option (Store Counter, Home Delivery, or Pick & Drop) first.', 'warning');
        return;
      }

      if (items.length === 0) {
        showToast('Please add at least one garment or weight package to the order before saving.', 'warning');
        return;
      }

      let formattedDueDate = new Date().toISOString().split('T')[0];
      try {
        if (selectedDueDate instanceof Date && !isNaN(selectedDueDate.getTime())) {
          formattedDueDate = selectedDueDate.toISOString().split('T')[0];
        }
      } catch {
        formattedDueDate = new Date().toISOString().split('T')[0];
      }

      const effectiveDiffAction = (advancePaid > 0 && advanceDiff > 0 && advanceDiffOption) ? advanceDiffOption : undefined;
      const effectiveDiffAmount = effectiveDiffAction ? advanceDiff : undefined;

      const res = createOrder({
        customerId: targetCustomer.id,
        orderType,
        items,
        totalPieces: totalPiecesCount,
        totalWeightKg: totalWeightKg,
        deliveryCharge: effectiveDeliveryCharge,
        hasDeliveryCharge: isDeliveryApplied,
        isPickAndDrop: pickAndDropType === 'DOORSTEP_PICK_DROP',
        pickAndDropType: pickAndDropType || 'COUNTER_WALKIN',
        surchargeType,
        surchargeAmount: calculatedSurcharge,
        discountPercent,
        discountAmount: calculatedDiscount,
        discountReason: discountReason || undefined,
        taxAmount: 0,
        grossAmount,
        netAmount: roundedTotal,
        advancePaid: advancePaid,
        paidAmount: advancePaid,
        balanceAmount: balanceDue,
        adjustmentApplied: effectiveAdjustment > 0 ? effectiveAdjustment : undefined,
        differenceAction: effectiveDiffAction,
        differenceAmount: effectiveDiffAmount,
        paymentStatus: (advancePaid >= roundedTotal || (advancePaid > 0 && effectiveDiffAction)) ? 'PAID' : advancePaid > 0 ? 'PARTIAL' : 'PENDING',
        advancePaymentMethod,
        workshopNotes,
        deliveryNotes,
        dueDate: formattedDueDate,
        deliveryDate: formattedDueDate
      } as any);

      if (res && res.success) {
        const orderNo = res.order?.orderNumber || 'New';
        showToast(`Order #${orderNo} successfully created for ${targetCustomer.name}!`, 'success');
        // Reset cart and draft inputs
        setItems([]);
        setAdvancePaid(0);
        setDiscountPercent(0);
        setDiscountReason('');
        setWorkshopNotes('');
        setDeliveryNotes('');
        setSurchargeType('NONE');
        setHasDeliveryCharge(false);
        setPickAndDropType(null); // Reset delivery option for next order
        setAdvanceDiffOption(null);
        setApplyAdjustment(true);
        
        // Open thermal receipt modal automatically for immediate printing
        setThermalReceiptModalOpen(true);
      } else {
        showToast(res?.error || res?.message || 'Failed to create order. Please check inputs.', 'error');
      }
    } catch (saveError: any) {
      console.error('Error during order creation:', saveError);
      showToast(saveError?.message || 'Unexpected error occurred while creating order.', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between shadow-xs gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Order / Drop Booking (POS)</span>
            </h1>
            <p className="text-[11px] text-slate-500">
              Interactive garment catalog, weight laundry, service add-ons & piece tagging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Keyboard Shortcuts Hint Bar */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">F2</span> Search Cust
            <span className="text-slate-300">|</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">F4</span> Orders
            <span className="text-slate-300">|</span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">F12</span> Create Order
          </div>

          <button
            type="button"
            onClick={() => setActiveView('ORDERS')}
            className="px-3 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition"
            title="View & manage all existing orders"
          >
            <ClipboardList className="w-3.5 h-3.5 text-slate-600" />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column POS Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 gap-3">
        
        {/* Left Column: Customer & Mode Selection */}
        <div className="w-full lg:w-[300px] xl:w-[320px] flex flex-col gap-3 shrink-0 overflow-y-auto">
          
          {/* STEP 1: Customer Selector Card */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600" />
                1. Customer (F2)
              </span>
              <button
                type="button"
                onClick={() => setActiveView('CUSTOMER')}
                className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold transition"
              >
                + New Customer
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                id="pos-customer-search"
                type="text"
                placeholder="Search Customer by Name / Mobile..."
                value={customerSearchQuery}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                onChange={(e) => {
                  setCustomerSearchQuery(e.target.value);
                  setIsCustomerDropdownOpen(true);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-sky-500 outline-none"
              />

              {isCustomerDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-30 divide-y divide-slate-100 text-xs">
                  {customers
                    .filter(c => c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || c.mobile.includes(customerSearchQuery))
                    .map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setIsCustomerDropdownOpen(false);
                          setCustomerSearchQuery('');
                        }}
                        className="p-2 hover:bg-sky-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.mobile} • {c.area}</div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {c.custCode}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Selected Customer Mini-Badge */}
            <div className="bg-sky-50/80 p-2 rounded border border-sky-200 text-xs flex justify-between items-center">
              <div>
                <div className="font-bold text-sky-950 flex items-center gap-1.5">
                  <span>{selectedCustomer.name}</span>
                  <span className="text-[10px] font-mono px-1 bg-sky-200 text-sky-800 rounded">
                    {selectedCustomer.custCode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono">{selectedCustomer.mobile}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {selectedCustomer.outstandingAmount > 0 && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                    Due: ₹{selectedCustomer.outstandingAmount.toFixed(0)}
                  </span>
                )}
                {availableAdjustment > 0 && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Adj: ₹{availableAdjustment.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Available Adjustment Balance on Customer's Next Order */}
            {availableAdjustment > 0 && (
              <div className="p-2 bg-blue-50/90 border border-blue-200 rounded-md text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Available Adjustment
                  </span>
                  <span className="font-mono font-extrabold text-blue-800 text-xs">
                    ₹{availableAdjustment.toFixed(2)}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-blue-950 font-medium select-none">
                  <input
                    type="checkbox"
                    id="chk-apply-adjustment-customer"
                    checked={applyAdjustment}
                    onChange={(e) => setApplyAdjustment(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-blue-300"
                  />
                  <span>
                    {applyAdjustment 
                      ? `Apply ₹${availableAdjustment.toFixed(2)} to this order` 
                      : 'Do not apply (keep for future orders)'}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* STEP 2: Main Order Type Selector (Per Piece vs By Weight) */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                2. Select Order Type
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                {orderType === 'PER_PIECES' ? 'Per Piece' : 'By Weight'}
              </span>
            </div>

            {/* Dual Main Order Type Segmented Control */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-order-type-piece"
                onClick={() => setOrderType('PER_PIECES')}
                className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2 ${
                  orderType === 'PER_PIECES'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs ring-2 ring-sky-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  orderType === 'PER_PIECES' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                }`}>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[11px] uppercase tracking-tight">PER PIECE</div>
                  <div className={`text-[10px] ${orderType === 'PER_PIECES' ? 'text-sky-100' : 'text-slate-500'}`}>
                    Catalog Grid
                  </div>
                </div>
              </button>

              <button
                type="button"
                id="btn-order-type-weight"
                onClick={() => setOrderType('PER_WEIGHT')}
                className={`p-2.5 rounded-lg border text-left transition flex items-center gap-2 ${
                  orderType === 'PER_WEIGHT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  orderType === 'PER_WEIGHT' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[11px] uppercase tracking-tight">BY WEIGHT</div>
                  <div className={`text-[10px] ${orderType === 'PER_WEIGHT' ? 'text-indigo-100' : 'text-slate-500'}`}>
                    WSI, WF, WL
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* If Weight Mode is Selected: Left column shows active mode status banner */}
          {orderType === 'PER_WEIGHT' && (
            <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-200 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  By Weight Active
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-indigo-200 text-indigo-800 rounded">
                  {currentWeightConfig.code}
                </span>
              </div>
              <p className="text-[11px] text-indigo-800">
                Configure weight, services, pieces and calculations in the center workspace.
              </p>
            </div>
          )}

          {/* POS Tips / Order Assistance */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-col gap-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-slate-700">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                POS Quick Guide
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              1. Add items from Catalog or By Weight.<br />
              2. Review Order Items & Price on the right.<br />
              3. <strong>Select Delivery Option</strong> at the bottom right to enable order creation & thermal printing.
            </p>
          </div>
        </div>

        {/* Center Column: Visual Garment Catalog (Full Height Workspace) */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          
          {/* ============================================================ */}
          {/* 1. ORDER PER PIECE CATALOG (Screenshots 1 & 2)              */}
          {/* ============================================================ */}
          {orderType === 'PER_PIECES' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              
              {/* TOP SERVICE TABS (Dry Cleaning, Laundry, Steam Press Only, Leather Care, Mending Only) */}
              <div className="bg-white px-3 pt-2.5 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {SERVICE_TABS.map(tab => {
                    const isSelected = selectedServiceTab === tab.code;
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.code}
                        type="button"
                        onClick={() => setSelectedServiceTab(tab.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition border ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs ring-2 ring-sky-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-sky-600'}`} />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CATEGORY SUB-TABS & SEARCH BAR (Screenshots 1 & 2) */}
              <div className="p-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
                
                {/* Category Sub-Tabs (Men, Women, Kids, Household, Institutional, Others, Eco Wash) */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {CATEGORY_TABS.map(cat => {
                    const isSelected = selectedCategory === cat.id && garmentSearch.trim() === '';
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setGarmentSearch('');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap transition ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-200/80'
                        }`}
                      >
                        <IconComp className="w-3 h-3" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Garment Search Input */}
                <div className="relative shrink-0 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search garment to add..."
                    value={garmentSearch}
                    onChange={(e) => setGarmentSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
                  />
                  {garmentSearch && (
                    <button
                      type="button"
                      onClick={() => setGarmentSearch('')}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* VISUAL GARMENT CARDS GRID (Takes full flexible space) */}
              <div className="flex-1 p-3 overflow-y-auto bg-slate-50/60">
                {filteredGarments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
                    {filteredGarments.map(garment => {
                      const price = getGarmentPrice(garment, selectedServiceTab);
                      const cartCount = getGarmentCartCount(garment.name);

                      return (
                        <div
                          key={garment.id}
                          onClick={() => handleAddGarment(garment, selectedServiceTab)}
                          className={`bg-white rounded-lg p-2.5 border transition cursor-pointer flex flex-col justify-between relative group hover:shadow-md hover:border-sky-400 select-none ${
                            cartCount > 0 
                              ? 'border-sky-500 ring-1 ring-sky-400/40 bg-sky-50/20' 
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Top-Right Quantity Badge */}
                          <div className="flex justify-end items-center mb-1">
                            <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full transition ${
                              cartCount > 0
                                ? 'bg-sky-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {cartCount}
                            </span>
                          </div>

                          {/* Garment Visual Illustration */}
                          <div className="flex items-center justify-center my-1.5">
                            <GarmentIcon icon={garment.icon} className="w-12 h-12 transition-transform group-hover:scale-110 drop-shadow-2xs" />
                          </div>

                          {/* Garment Name & Price */}
                          <div className="pt-1.5 border-t border-slate-100 mt-1">
                            <div className="flex items-center justify-between gap-1">
                              <div className="text-[11.5px] font-bold text-slate-800 truncate leading-tight group-hover:text-sky-950" title={garment.name}>
                                {garment.name}
                              </div>
                              {garment.itemCode && (
                                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1 rounded shrink-0">
                                  {garment.itemCode}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs font-extrabold font-mono text-slate-900">
                                ₹{price.toFixed(2)}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddGarment(garment, selectedServiceTab);
                                }}
                                title={`Add ${garment.name}`}
                                className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center font-bold text-xs transition"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <span>No garments found matching "{garmentSearch}".</span>
                    <button
                      type="button"
                      onClick={() => setGarmentSearch('')}
                      className="text-sky-600 hover:text-sky-800 font-semibold text-xs mt-1"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Instructions / Notes Bar */}
              <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 text-xs shrink-0">
                <span className="font-bold text-slate-700 shrink-0 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  Order / Workshop Notes:
                </span>
                <input
                  type="text"
                  placeholder="Special instructions to be printed on job ticket..."
                  value={workshopNotes}
                  onChange={(e) => setWorkshopNotes(e.target.value)}
                  className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs outline-none focus:bg-white focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* 2. ORDER BY WEIGHT WORKSPACE (Center Box Full Layout)        */
            /* ============================================================ */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
              
              {/* TOP WEIGHT SERVICE TABS (WSI, WF, WL) */}
              <div className="bg-white px-3 pt-2.5 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {WEIGHT_SERVICES.map(srv => {
                    const isSelected = selectedWeightService === srv.code;
                    return (
                      <button
                        key={srv.code}
                        type="button"
                        onClick={() => setSelectedWeightService(srv.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between gap-2.5 whitespace-nowrap transition border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Scale className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                          <span>{srv.shortName} ({srv.code})</span>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-extrabold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          ₹{srv.ratePerKg}/kg
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Header Banner */}
              <div className="p-2.5 bg-indigo-50/70 border-b border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentWeightConfig.code}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-indigo-950">
                      {currentWeightConfig.name}
                    </div>
                    <div className="text-[10.5px] text-indigo-700">
                      {currentWeightConfig.description} • Pressing: <span className="font-semibold">{currentWeightConfig.defaultPressing}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-indigo-900 bg-white px-2.5 py-1 rounded border border-indigo-200 shadow-2xs">
                    Base Rate: <span className="font-mono text-indigo-700 font-extrabold">₹{currentWeightConfig.ratePerKg}</span> / kg
                  </span>
                </div>
              </div>

              {/* MAIN BY WEIGHT CONFIGURATOR WORKSPACE */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                
                {/* 1. THREE VISUAL SERVICE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {WEIGHT_SERVICES.map(srv => {
                    const isSelected = selectedWeightService === srv.code;
                    return (
                      <div
                        key={srv.code}
                        onClick={() => setSelectedWeightService(srv.code)}
                        className={`bg-white rounded-lg p-3 border transition cursor-pointer flex flex-col justify-between relative group hover:shadow-md ${
                          isSelected 
                            ? 'border-indigo-500 ring-2 ring-indigo-400/40 bg-indigo-50/20' 
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {srv.code === 'WSI' ? <Flame className="w-4 h-4" /> : srv.code === 'WF' ? <Waves className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight">{srv.shortName}</div>
                              <span className="text-[10px] font-mono text-slate-500">{srv.code}</span>
                            </div>
                          </div>

                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${srv.badgeBg}`}>
                            ₹{srv.ratePerKg}/kg
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {srv.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[10.5px]">
                          <span className="text-slate-500">
                            Finish: <span className="font-semibold text-slate-700">{srv.defaultPressing}</span>
                          </span>
                          <span className={`font-bold flex items-center gap-1 ${
                            isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                          }`}>
                            {isSelected ? '✓ Selected' : 'Click to Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. WEIGHT & PIECES CONFIGURATOR CARD */}
                <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-indigo-600" />
                      Configure Weight & Estimated Items
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Live auto-calculation for <strong className="text-indigo-900">{currentWeightConfig.name}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Weight (kg) Section */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Total Weight (kg)*</span>
                        </label>
                        <span className="text-[10.5px] font-bold text-indigo-700 font-mono">
                          {parsedWeight} kg × ₹{currentWeightConfig.ratePerKg}
                        </span>
                      </div>

                      {/* Stepper + Input */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseFloat(weightInput) || 0;
                            setWeightInput(Math.max(0.5, current - 0.5).toFixed(1));
                          }}
                          className="w-8 h-8 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm transition shrink-0"
                          title="Minus 0.5 kg"
                        >
                          -
                        </button>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={weightInput}
                            onChange={(e) => setWeightInput(e.target.value)}
                            className="w-full text-center py-1.5 bg-white border border-slate-300 rounded text-sm font-bold font-mono text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                          />
                          <span className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-400 font-mono">kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseFloat(weightInput) || 0;
                            setWeightInput((current + 0.5).toFixed(1));
                          }}
                          className="w-8 h-8 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm transition shrink-0"
                          title="Plus 0.5 kg"
                        >
                          +
                        </button>
                      </div>

                      {/* Quick Weight Presets */}
                      <div className="pt-1 flex flex-wrap gap-1">
                        <span className="text-[10px] text-slate-500 self-center mr-1">Presets:</span>
                        {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map(wt => (
                          <button
                            key={wt}
                            type="button"
                            onClick={() => setWeightInput(wt.toFixed(1))}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-bold border transition ${
                              parseFloat(weightInput) === wt
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {wt}kg
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Estimated Pieces Section */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Estimated Pieces (Pcs)*</span>
                        </label>
                        <span className="text-[10.5px] text-slate-500 font-mono">
                          For piece tags & count
                        </span>
                      </div>

                      {/* Stepper + Input */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(piecesInput, 10) || 1;
                            setPiecesInput(Math.max(1, current - 1).toString());
                          }}
                          className="w-8 h-8 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm transition shrink-0"
                          title="Minus 1 piece"
                        >
                          -
                        </button>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={piecesInput}
                            onChange={(e) => setPiecesInput(e.target.value)}
                            className="w-full text-center py-1.5 bg-white border border-slate-300 rounded text-sm font-bold font-mono text-slate-900 outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                          />
                          <span className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-400 font-mono">pcs</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(piecesInput, 10) || 1;
                            setPiecesInput((current + 1).toString());
                          }}
                          className="w-8 h-8 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm transition shrink-0"
                          title="Plus 1 piece"
                        >
                          +
                        </button>
                      </div>

                      {/* Quick Pieces Presets */}
                      <div className="pt-1 flex flex-wrap gap-1">
                        <span className="text-[10px] text-slate-500 self-center mr-1">Presets:</span>
                        {[3, 5, 8, 10, 15, 20, 25, 30].map(pc => (
                          <button
                            key={pc}
                            type="button"
                            onClick={() => setPiecesInput(pc.toString())}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-bold border transition ${
                              parseInt(piecesInput, 10) === pc
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pc} pcs
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. CALCULATION BREAKDOWN & PRIMARY ACTION BUTTON */}
                  <div className="bg-indigo-950 text-white rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-800 text-amber-300 flex items-center justify-center shrink-0">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] text-indigo-200">
                          {parsedWeight} kg @ ₹{currentWeightConfig.ratePerKg}/kg • {parsedPieces} Estimated Pieces
                        </div>
                        <div className="text-base font-black text-amber-300 font-mono">
                          Total Amount: ₹{calculatedWeightCost.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddWeightPackage}
                      className="w-full sm:w-auto px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition transform active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add {currentWeightConfig.shortName} (₹{calculatedWeightCost.toFixed(2)}) to Order</span>
                    </button>
                  </div>
                </div>

                {/* 4. COMMON LAUNDRY ITEMS HELPER (For Piece Tagging & Sorting) */}
                <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      Quick Laundry Items Breakdown (Optional Tagging Helper)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Click to append to estimated pieces & notes
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Shirt', count: 1 },
                      { name: 'T-Shirt', count: 1 },
                      { name: 'Jeans / Trouser', count: 1 },
                      { name: 'Kurta / Kurti', count: 1 },
                      { name: 'Bed Sheet', count: 1 },
                      { name: 'Towel', count: 1 },
                      { name: 'Pillow Cover', count: 1 },
                      { name: 'Shorts / Lower', count: 1 },
                      { name: 'Undergarments', count: 1 },
                      { name: 'Woolen Sweater', count: 1 }
                    ].map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          const current = parseInt(piecesInput, 10) || 0;
                          setPiecesInput((current + item.count).toString());
                          setWorkshopNotes(prev => {
                            if (!prev) return `Items: ${item.name}`;
                            if (prev.includes(item.name)) return prev;
                            return `${prev}, ${item.name}`;
                          });
                          showToast(`Added ${item.name} (+1 piece) to weight order.`, 'info');
                        }}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 transition flex items-center gap-1"
                      >
                        <span>+ {item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Instructions / Notes Bar */}
              <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 text-xs shrink-0">
                <span className="font-bold text-slate-700 shrink-0 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Weight Order / Workshop Notes:
                </span>
                <input
                  type="text"
                  placeholder="Special instructions for weight laundry, folding style or delicate care..."
                  value={workshopNotes}
                  onChange={(e) => setWorkshopNotes(e.target.value)}
                  className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* Right Column: ORDER ITEMS PANEL + Price & Settle Summary     */}
        {/* ============================================================ */}
        <div className="w-full lg:w-[380px] xl:w-[420px] bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden shrink-0">
          
          {/* Header with Live Counter and Clear All */}
          <div className="p-2.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-xs">
                Order Items ({totalPiecesCount} Pcs {totalWeightKg > 0 ? `• ${totalWeightKg.toFixed(1)} kg` : ''})
              </span>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all items from current order draft?')) {
                    setItems([]);
                    showToast('All items cleared from cart.', 'info');
                  }
                }}
                className="text-[10.5px] text-rose-300 hover:text-rose-100 font-bold flex items-center gap-1 transition px-2 py-0.5 rounded hover:bg-rose-900/40"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Scrollable Container containing: 1. Order Items List, 2. Financial Breakdown */}
          <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-slate-200">
            
            {/* 1. ORDER ITEMS LIST (Immediately shows any added garment with Editable Qty & Unit Price) */}
            <div className="p-2.5 space-y-2 bg-slate-50/70">
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const isExpanded = expandedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-lg border p-2.5 transition shadow-2xs space-y-2 ${
                          isExpanded ? 'border-sky-400 ring-1 ring-sky-300/50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Row Header: Sequence, Name, Service Dropdown, Delete */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <div className="font-bold text-slate-900 text-xs truncate" title={item.garmentName}>
                                {item.garmentName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                                <span>Barcode: {item.barcode}</span>
                                {item.weightKg && (
                                  <span className="text-emerald-700 font-bold">({item.weightKg} kg)</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Service dropdown for Per-Piece items */}
                            {!item.weightKg ? (
                              <select
                                value={item.serviceCode}
                                onChange={(e) => handleChangeService(idx, e.target.value as ServiceCode)}
                                className="text-[10.5px] font-bold py-1 px-1.5 bg-slate-50 border border-slate-300 rounded text-slate-700 outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                              >
                                {serviceDefinitions.map(s => (
                                  <option key={s.code} value={s.code}>{s.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {item.weightServiceCode}
                              </span>
                            )}

                            {/* Remove Item Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* KEY CONTROLS ROW: Editable Qty [2] | Editable Unit Price [₹240] | Total ₹480 */}
                        <div className="bg-slate-50 p-2 rounded-md border border-slate-200 flex items-center justify-between gap-2 text-xs">
                          {/* Editable Qty */}
                          <div className="flex flex-col">
                            <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Qty</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <button
                                type="button"
                                onClick={() => handleDecrementQuantity(idx)}
                                className="w-5 h-5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs"
                                title="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity || 1}
                                onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                                className="w-10 text-center py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-xs text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleIncrementQuantity(idx)}
                                className="w-5 h-5 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs"
                                title="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Editable Unit Price (Current order override without modifying Master Catalog) */}
                          <div className="flex flex-col">
                            <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Unit Price</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-slate-500 font-bold text-xs">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={item.basePrice}
                                onChange={(e) => handlePriceChange(idx, parseFloat(e.target.value))}
                                className="w-18 px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-xs text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                              />
                            </div>
                          </div>

                          {/* Auto-calculated line total */}
                          <div className="flex flex-col items-end">
                            <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
                            <span className="text-xs font-black font-mono text-sky-950 mt-0.5">
                              ₹{item.totalItemPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Expandable Add-ons, Pressing Method & Defect Remarks */}
                        <div>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className="text-[10.5px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{isExpanded ? 'Hide Options' : 'Add-ons, Pressing & Remarks'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {/* Active badges summary when collapsed */}
                            {!isExpanded && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                {item.pressingMethod && (
                                  <span className="bg-slate-100 px-1 py-0.5 rounded font-medium">
                                    {item.pressingMethod}
                                  </span>
                                )}
                                {item.subServices.length > 0 && (
                                  <span className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-bold">
                                    +{item.subServices.length} Add-on
                                  </span>
                                )}
                                {item.remarks.length > 0 && (
                                  <span className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold">
                                    {item.remarks.length} Note
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Expanded detail toggles */}
                          {isExpanded && (
                            <div className="pt-2 mt-1.5 border-t border-slate-100 space-y-2 text-xs">
                              {/* Pressing Method Selector */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10.5px] font-bold text-slate-600">Pressing:</span>
                                <select
                                  value={item.pressingMethod || DEFAULT_PRESSING_METHOD}
                                  onChange={(e) => handleChangePressingMethod(idx, e.target.value as PressingMethod)}
                                  className="p-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-sky-500"
                                >
                                  {PRESSING_METHOD_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Sub-Services / Add-ons Pills */}
                              <div className="space-y-1">
                                <span className="text-[10.5px] font-bold text-slate-600 block">Sub-Services / Top-Up:</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSubService(idx, 'ST', 'Starch', 50)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                                      item.subServices.some(s => s.code === 'ST')
                                        ? 'bg-purple-600 text-white border-purple-600 font-bold'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    + Starch (₹50)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSubService(idx, 'SP', 'Steam Press', 50)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                                      item.subServices.some(s => s.code === 'SP')
                                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    + Steam (₹50)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSubService(idx, 'ALT', 'Alteration', 40)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                                      item.subServices.some(s => s.code === 'ALT')
                                        ? 'bg-rose-600 text-white border-rose-600 font-bold'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    + Alteration (₹40)
                                  </button>
                                </div>
                              </div>

                              {/* Defect / Risk Tags */}
                              <div className="space-y-1">
                                <span className="text-[10.5px] font-bold text-slate-600 block">Defect / Risk Notes:</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {['Stain on Collar', 'Customer Risk', 'Color Bleed Risk', 'Missing Button', 'Torn / Hole'].map(rem => (
                                    <button
                                      key={rem}
                                      type="button"
                                      onClick={() => handleToggleRemark(idx, rem)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition ${
                                        item.remarks.includes(rem)
                                          ? 'bg-rose-600 text-white border-rose-600 font-bold'
                                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                      }`}
                                    >
                                      {rem}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
                  <ShoppingBag className="w-7 h-7 text-slate-300" />
                  <p className="font-bold text-slate-600">No Items Added</p>
                  <p className="text-[11px]">Click any garment in the catalog to add it here immediately with editable Qty & Price.</p>
                </div>
              )}
            </div>

            {/* 2. PRICE & SETTLEMENT SUMMARY (Live calculation of Items Total, GST 18%, Discount, Surcharges, Net Total, Balance) */}
            <div className="p-3 space-y-3 bg-white text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-sky-600" />
                  Price & Settlement Summary
                </span>
              </div>

              {/* Express Delivery Surcharge */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between text-[11px]">
                  <span>Speed / Surcharge</span>
                  {calculatedSurcharge > 0 && (
                    <span className="text-amber-600 font-bold">+₹{calculatedSurcharge}</span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setSurchargeType('NONE')}
                    className={`py-1 rounded text-[11px] font-bold border transition ${
                      surchargeType === 'NONE' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurchargeType('NEXT_DAY')}
                    className={`py-1 rounded text-[11px] font-bold border transition ${
                      surchargeType === 'NEXT_DAY' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Next Day (+25%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurchargeType('SAME_DAY')}
                    className={`py-1 rounded text-[11px] font-bold border transition ${
                      surchargeType === 'SAME_DAY' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Same Day (+50%)
                  </button>
                </div>
              </div>

              {/* Discount Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
                  <span>Discount (%)</span>
                  {discountPercent > 0 && (
                    <span className="text-[10px] text-emerald-700 font-bold">
                      -₹{calculatedDiscount.toFixed(2)} applied
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="w-16 p-1.5 border border-slate-300 rounded font-mono font-bold text-slate-900 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Reason for discount (optional)..."
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="flex-1 p-1.5 border border-slate-300 rounded text-[11px] outline-none"
                  />
                </div>
              </div>

              {/* Complete Order Summary Table */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center pb-1 border-b border-slate-200 font-bold text-slate-800">
                  <span>Order Summary</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded">
                    {orderType === 'PER_WEIGHT' ? 'BY WEIGHT' : 'PER PIECE'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Items Total ({totalPiecesCount} Pcs {totalWeightKg > 0 ? `• ${totalWeightKg.toFixed(1)} kg` : ''}):</span>
                  <span className="font-mono font-bold text-slate-900">₹{itemsGrossAmount.toFixed(2)}</span>
                </div>

                {isDeliveryApplied && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Delivery ({pickAndDropType === 'DOORSTEP_PICK_DROP' ? 'Pick & Drop' : 'Home Delivery'}):</span>
                    <span className="font-mono font-bold">+₹{effectiveDeliveryCharge.toFixed(2)}</span>
                  </div>
                )}

                {calculatedSurcharge > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Surcharge ({surchargeType.replace(/_/g, ' ')}):</span>
                    <span className="font-mono font-bold">+₹{calculatedSurcharge.toFixed(2)}</span>
                  </div>
                )}

                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Discount ({discountPercent}%):</span>
                    <span className="font-mono font-bold">-₹{calculatedDiscount.toFixed(2)}</span>
                  </div>
                )}

                {effectiveAdjustment > 0 && (
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      Previous Adjustment Balance:
                    </span>
                    <span className="font-mono font-bold">+₹{effectiveAdjustment.toFixed(2)}</span>
                  </div>
                )}

                {roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Round Off:</span>
                    <span className="font-mono">₹{roundOff.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-slate-300 pt-1.5 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Net Total:</span>
                  <span className="font-mono text-base text-sky-950 font-extrabold">₹{roundedTotal.toFixed(2)}</span>
                </div>

                {/* Amount in Words */}
                <div className="pt-1 border-t border-slate-200/80">
                  <div className="text-[9.5px] text-slate-500 font-semibold uppercase tracking-wider">Amount in Words</div>
                  <div className="text-[10.5px] font-medium text-slate-700 leading-snug">{numberToIndianWords(roundedTotal)}</div>
                </div>
              </div>

              {/* Advance Payment Input & Balance */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex justify-between text-[11px]">
                  <span>Advance Payment Received</span>
                  <span className={balanceDue > 0 ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                    {balanceDue > 0 ? `Balance Due: ₹${balanceDue.toFixed(2)}` : 'Fully Paid (₹0 Due)'}
                  </span>
                </label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2 text-xs font-bold text-emerald-700">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={roundedTotal}
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded font-mono font-bold text-emerald-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/40"
                    />
                  </div>
                  {/* Quick Fill Buttons */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAdvancePaid(roundedTotal)}
                      className={`px-2 py-1 text-[10px] font-bold rounded border transition ${
                        advancePaid === roundedTotal && roundedTotal > 0
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      title="Mark full payment upfront"
                    >
                      Full
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdvancePaid(0)}
                      className={`px-2 py-1 text-[10px] font-bold rounded border transition ${
                        advancePaid === 0
                          ? 'bg-slate-700 text-white border-slate-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      title="No advance (pay on delivery)"
                    >
                      ₹0
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector for Advance */}
                {advancePaid > 0 && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mode:</span>
                    {(['CASH', 'UPI', 'CARD', 'NET_BANKING'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAdvancePaymentMethod(mode)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                          advancePaymentMethod === mode
                            ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mode === 'NET_BANKING' ? 'Bank' : mode}
                      </button>
                    ))}
                  </div>
                )}

                {/* Advance Difference Options: Adjust/Waive vs Carry Forward */}
                {advancePaid > 0 && advanceDiff > 0 && (
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 space-y-1.5 mt-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 font-bold text-amber-900">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Difference: ₹{advanceDiff.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] text-amber-800 font-medium">
                        Bill ₹{roundedTotal} • Adv ₹{advancePaid}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        id="btn-pos-waive-advance"
                        onClick={() => setAdvanceDiffOption(advanceDiffOption === 'WAIVE' ? null : 'WAIVE')}
                        className={`p-1.5 rounded border text-left transition flex flex-col justify-between cursor-pointer ${
                          advanceDiffOption === 'WAIVE'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[10.5px]">
                          <span>Adjust/Waive ₹{advanceDiff.toFixed(2)}</span>
                          {advanceDiffOption === 'WAIVE' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-[9px] mt-0.5 ${advanceDiffOption === 'WAIVE' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Mark settled (₹0 Due)
                        </span>
                      </button>

                      <button
                        type="button"
                        id="btn-pos-carry-forward-advance"
                        onClick={() => setAdvanceDiffOption(advanceDiffOption === 'CARRY_FORWARD' ? null : 'CARRY_FORWARD')}
                        className={`p-1.5 rounded border text-left transition flex flex-col justify-between cursor-pointer ${
                          advanceDiffOption === 'CARRY_FORWARD'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[10.5px]">
                          <span>Carry Forward ₹{advanceDiff.toFixed(2)}</span>
                          {advanceDiffOption === 'CARRY_FORWARD' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-[9px] mt-0.5 ${advanceDiffOption === 'CARRY_FORWARD' ? 'text-blue-100' : 'text-slate-500'}`}>
                          Save to customer account
                        </span>
                      </button>
                    </div>

                    {advanceDiffOption === 'WAIVE' && (
                      <div className="text-[10px] text-emerald-800 bg-emerald-100/70 p-1.5 rounded border border-emerald-300 font-medium">
                        ✓ ₹{advanceDiff.toFixed(2)} will be adjusted/waived. Order will be marked fully settled.
                      </div>
                    )}
                    {advanceDiffOption === 'CARRY_FORWARD' && (
                      <div className="text-[10px] text-blue-800 bg-blue-100/70 p-1.5 rounded border border-blue-300 font-medium">
                        ✓ ₹{advanceDiff.toFixed(2)} will be saved to {selectedCustomer.name}'s adjustment balance for their next order.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ready Target Due Date with Interactive Calendar */}
              <div className="space-y-1 pt-0.5">
                <ReadyDateCalendar
                  selectedDate={selectedDueDate}
                  onSelectDate={(newDate) => setSelectedDueDate(newDate)}
                  holidayDayOfWeek={4}
                />
              </div>

              {/* Delivery Options Section (Inactive until Manager selects it; below buttons inactive until delivery options selected) */}
              <div className={`pt-2 border-t border-slate-200 space-y-2 transition-colors rounded-lg p-2 ${
                pickAndDropType ? 'bg-sky-50/40 border border-sky-200' : 'bg-slate-50/70 border border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Truck className="w-3.5 h-3.5 text-sky-600" />
                    <span>Delivery Options</span>
                  </div>
                  {pickAndDropType ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Active: {
                        pickAndDropType === 'COUNTER_WALKIN' 
                          ? 'Store Counter' 
                          : pickAndDropType === 'HOME_DELIVERY' 
                          ? 'Home Delivery' 
                          : 'Pick & Drop'
                      }
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Inactive • Manager Select Required
                    </span>
                  )}
                </div>

                {/* 3 Delivery Options Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {/* 1. Store Counter (Walk-in) */}
                  <button
                    type="button"
                    id="btn-delivery-counter"
                    onClick={() => {
                      if (pickAndDropType === 'COUNTER_WALKIN') {
                        setPickAndDropType(null);
                        setHasDeliveryCharge(false);
                      } else {
                        setPickAndDropType('COUNTER_WALKIN');
                        setHasDeliveryCharge(false);
                      }
                    }}
                    className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                      pickAndDropType === 'COUNTER_WALKIN'
                        ? 'bg-sky-100/80 border-sky-500 ring-2 ring-sky-300 text-sky-950 shadow-2xs font-semibold'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px] leading-tight flex items-center justify-between">
                        <span>Store Counter</span>
                        {pickAndDropType === 'COUNTER_WALKIN' && <Check className="w-3 h-3 text-sky-700" />}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Self Drop & Pick</div>
                    </div>
                    <span className={`text-[9.5px] font-bold mt-1.5 px-1.5 py-0.5 rounded inline-block w-fit ${
                      pickAndDropType === 'COUNTER_WALKIN' ? 'bg-sky-200 text-sky-900 font-mono' : 'bg-slate-100 text-slate-600 font-mono border border-slate-200'
                    }`}>
                      Free (₹0)
                    </span>
                  </button>

                  {/* 2. Doorstep Delivery */}
                  <button
                    type="button"
                    id="btn-delivery-home"
                    onClick={() => {
                      if (pickAndDropType === 'HOME_DELIVERY') {
                        setPickAndDropType(null);
                        setHasDeliveryCharge(false);
                      } else {
                        setPickAndDropType('HOME_DELIVERY');
                        setHasDeliveryCharge(true);
                      }
                    }}
                    className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                      pickAndDropType === 'HOME_DELIVERY'
                        ? 'bg-emerald-100/80 border-emerald-500 ring-2 ring-emerald-300 text-emerald-950 shadow-2xs font-semibold'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px] leading-tight flex items-center justify-between">
                        <span>Home Delivery</span>
                        {pickAndDropType === 'HOME_DELIVERY' && <Check className="w-3 h-3 text-emerald-700" />}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Drop at Address</div>
                    </div>
                    <span className={`text-[9.5px] font-bold mt-1.5 px-1.5 py-0.5 rounded inline-block w-fit ${
                      pickAndDropType === 'HOME_DELIVERY' ? 'bg-emerald-200 text-emerald-900 font-mono' : 'bg-slate-100 text-slate-600 font-mono border border-slate-200'
                    }`}>
                      +₹{deliveryChargeAmount}
                    </span>
                  </button>

                  {/* 3. Rider Pick & Drop */}
                  <button
                    type="button"
                    id="btn-delivery-pick-drop"
                    onClick={() => {
                      if (pickAndDropType === 'DOORSTEP_PICK_DROP') {
                        setPickAndDropType(null);
                        setHasDeliveryCharge(false);
                      } else {
                        setPickAndDropType('DOORSTEP_PICK_DROP');
                        setHasDeliveryCharge(true);
                      }
                    }}
                    className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                      pickAndDropType === 'DOORSTEP_PICK_DROP'
                        ? 'bg-purple-100/80 border-purple-500 ring-2 ring-purple-300 text-purple-950 shadow-2xs font-semibold'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px] leading-tight flex items-center justify-between">
                        <span>Pick & Drop</span>
                        {pickAndDropType === 'DOORSTEP_PICK_DROP' && <Check className="w-3 h-3 text-purple-700" />}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">2-Way Rider</div>
                    </div>
                    <span className={`text-[9.5px] font-bold mt-1.5 px-1.5 py-0.5 rounded inline-block w-fit ${
                      pickAndDropType === 'DOORSTEP_PICK_DROP' ? 'bg-purple-200 text-purple-900 font-mono' : 'bg-slate-100 text-slate-600 font-mono border border-slate-200'
                    }`}>
                      +₹{deliveryChargeAmount}
                    </span>
                  </button>
                </div>

                {/* If Home Delivery or Pick & Drop is active: Customizable Charge & Note */}
                {isDeliveryApplied && (
                  <div className="bg-white p-2 rounded-md border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold text-slate-700">Delivery Charge:</span>
                      <div className="flex items-center gap-1">
                        {[40, 50, 80, 100].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDeliveryChargeAmount(amt)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                              deliveryChargeAmount === amt
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Delivery address / landmark notes (optional)..."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                )}

                {/* Prompt alert indicating active / inactive status for below buttons */}
                {!pickAndDropType ? (
                  <div className="p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10.5px] flex items-center gap-1.5">
                    <span className="font-bold text-amber-700 shrink-0">⚠️ Inactive:</span>
                    <span>Delivery option not selected. Buttons below will remain inactive until an option is selected.</span>
                  </div>
                ) : (
                  <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10.5px] flex items-center gap-1.5">
                    <span className="font-bold text-emerald-700 shrink-0">✓ Active:</span>
                    <span>Delivery option confirmed. Action buttons below are now active.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Order Action Buttons (Active only when delivery option is selected) */}
          <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex flex-col gap-1.5 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (items.length === 0 || window.confirm('Cancel and clear current order draft?')) {
                    setItems([]);
                    setPickAndDropType(null);
                    setActiveView('HOME');
                  }
                }}
                className="py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-md text-xs flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer"
              >
                <span>Cancel (Esc)</span>
              </button>

              <button
                id="btn-save-order"
                onClick={handleSaveOrder}
                disabled={!pickAndDropType || items.length === 0}
                title={
                  !pickAndDropType
                    ? 'Please select a Delivery Option above to activate'
                    : items.length === 0
                    ? 'Add garments or weight laundry items to create order'
                    : 'Create Order (F12)'
                }
                className={`py-2 text-white font-bold rounded-md text-xs flex items-center justify-center gap-1.5 shadow-xs transition ${
                  !pickAndDropType || items.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-sky-600 hover:bg-sky-700 cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Order (F12)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={() => setThermalReceiptModalOpen(true)}
                disabled={!pickAndDropType || items.length === 0}
                title={
                  !pickAndDropType
                    ? 'Please select a Delivery Option above to activate'
                    : items.length === 0
                    ? 'Add items to print receipt'
                    : 'Print Thermal Receipt'
                }
                className={`py-1.5 font-semibold rounded text-[11px] flex items-center justify-center gap-1 transition ${
                  !pickAndDropType || items.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 border border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-900 text-white cursor-pointer'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>Thermal Receipt</span>
              </button>

              <button
                onClick={() => setQRTagPreviewModalOpen(true)}
                disabled={!pickAndDropType || items.length === 0}
                title={
                  !pickAndDropType
                    ? 'Please select a Delivery Option above to activate'
                    : items.length === 0
                    ? 'Add items to preview piece tags'
                    : 'Preview 2R Piece Tags'
                }
                className={`py-1.5 font-semibold rounded text-[11px] flex items-center justify-center gap-1 transition ${
                  !pickAndDropType || items.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 border border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-900 text-white cursor-pointer'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-sky-400" />
                <span>2R Piece Tags</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
