import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  UserPlus, 
  BarChart3, 
  Truck, 
  ShoppingBag, 
  QrCode, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X, 
  ArrowRight, 
  Phone, 
  MapPin, 
  FileText, 
  Printer, 
  ExternalLink, 
  MessageSquare,
  Sparkles,
  RotateCcw,
  Check,
  User,
  ShieldCheck,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Customer, Order, OrderGarmentItem } from '../../types';
import { normalizeIndianPhoneNumber, formatIndianPhoneNumberDisplay } from '../../utils/phoneUtils';

type SearchMode = 'ALL' | 'CUSTOMER' | 'ORDER' | 'INVOICE' | 'QR_BARCODE';

export const HomeScreen: React.FC = () => {
  const { 
    orders, 
    customers, 
    addCustomer,
    setActiveView, 
    setActiveOrderId,
    setActiveCustomerId,
    openQRPickupModal,
    setThermalReceiptModalOpen,
    setQRTagPreviewModalOpen,
    setCustomerPortalOpen,
    setWhatsAppSimulatorOpen,
    businessSettings, 
    currentUser,
    currentRole,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('ALL');
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [showPickupBanner, setShowPickupBanner] = useState(true);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustArea, setNewCustArea] = useState('Sector 1');
  const [newCustGst, setNewCustGst] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search field on screen load for rapid counter operation
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Pending pickup orders calculation
  const pendingPickupOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'DELIVERED');
  }, [orders]);

  const readyForPickupOrders = useMemo(() => {
    return orders.filter(o => o.status === 'READY');
  }, [orders]);

  // Real-time Unified Search Filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedCustomers: Customer[] = [];
    const matchedOrders: Order[] = [];
    const matchedGarments: { order: Order; garment: OrderGarmentItem }[] = [];

    const qClean = q.trim();
    const qDigits = qClean.replace(/\D/g, '');
    const isDigitsOnly = /^\d+$/.test(qClean);
    const isPhonePattern = /^[+\d\s()-]+$/.test(qClean) && qDigits.length >= 2;
    const isCustomerCodeQuery = qClean.startsWith('cust') || (qClean.startsWith('c') && qDigits.length > 0);

    // Customer matching
    if (searchMode === 'ALL' || searchMode === 'CUSTOMER') {
      customers.forEach(c => {
        let isMatch = false;

        if (isDigitsOnly || isPhonePattern) {
          // Phone / Mobile search: keep existing phone/mobile search behavior unchanged
          const matchesMobile = (qDigits.length > 0 && c.mobile.replace(/\D/g, '').includes(qDigits)) || c.mobile.toLowerCase().includes(qClean);
          const matchesName = c.name.toLowerCase().includes(qClean);
          if (matchesMobile || matchesName) {
            isMatch = true;
          }
        } else if (isCustomerCodeQuery) {
          // Customer code search (e.g. Cust100, Cust98)
          const custCodeLower = (c.custCode || '').toLowerCase();
          const matchesCode = custCodeLower.includes(qClean) || (qDigits.length > 0 && custCodeLower.replace(/\D/g, '') === qDigits);
          const matchesName = (c.name || '').toLowerCase().includes(qClean);
          if (matchesCode || matchesName) {
            isMatch = true;
          }
        } else {
          // Name search (e.g. "prit", "dev", "gurpreet"): check customer name field only (case-insensitive)
          const matchesName = (c.name || '').toLowerCase().includes(qClean);
          if (matchesName) {
            isMatch = true;
          }
        }

        if (isMatch) {
          matchedCustomers.push(c);
        }
      });
    }

    // Order matching
    if (searchMode === 'ALL' || searchMode === 'ORDER' || searchMode === 'INVOICE') {
      orders.forEach(o => {
        const matchesOrderNum = o.orderNumber.toString() === q || (qDigits.length > 0 && o.orderNumber.toString() === qDigits) || o.id.toLowerCase().includes(q);
        const matchesBranchOrder = `${o.branchCode.toLowerCase()}-${o.orderNumber}` === q;
        const matchesCustName = o.customerName.toLowerCase().includes(q);
        const matchesCustMobile = (qDigits.length > 0 && o.customerMobile.replace(/\D/g, '').includes(qDigits)) || o.customerMobile.includes(q);
        const matchesInvoiceUrl = o.receiptUrl ? o.receiptUrl.toLowerCase().includes(q) : false;

        if (matchesOrderNum || matchesBranchOrder || matchesCustName || matchesCustMobile || matchesInvoiceUrl) {
          matchedOrders.push(o);
        }
      });
    }

    // Garment QR/Barcode matching
    if (searchMode === 'ALL' || searchMode === 'QR_BARCODE') {
      orders.forEach(o => {
        o.items.forEach(item => {
          const barcodeClean = item.barcode.toLowerCase().replace(/[^a-z0-9]/g, '');
          const qClean = q.replace(/[^a-z0-9]/g, '');
          const matchesBarcode = item.barcode.toLowerCase().includes(q) || (qClean.length > 0 && barcodeClean.includes(qClean));
          const matchesGarmentName = item.garmentName.toLowerCase().includes(q);

          if (matchesBarcode || matchesGarmentName) {
            matchedGarments.push({ order: o, garment: item });
          }
        });
      });
    }

    return {
      customers: matchedCustomers,
      orders: matchedOrders,
      garments: matchedGarments,
      totalCount: matchedCustomers.length + matchedOrders.length + matchedGarments.length
    };
  }, [searchQuery, searchMode, customers, orders]);

  // Handle Customer Creation
  const handleCreateCustomer = (e: React.FormEvent, andStartOrder: boolean = false) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustMobile.trim()) {
      showToast('Customer Name and Mobile Number are required.', 'warning');
      return;
    }

    const normalizedPhone = normalizeIndianPhoneNumber(newCustMobile.trim());

    const created = addCustomer({
      name: newCustName.trim(),
      mobile: normalizedPhone,
      email: newCustEmail.trim(),
      address: newCustAddress.trim() || `${newCustArea.trim()}, Noida`,
      area: newCustArea.trim(),
      placeOfSupply: businessSettings.branchName || 'Uttar Pradesh',
      gstNumber: newCustGst.trim(),
      notes: newCustNotes.trim()
    });

    setIsNewCustModalOpen(false);
    showToast(`Customer ${created.name} (${normalizedPhone}) created successfully.`, 'success');

    // Reset Form
    setNewCustName('');
    setNewCustMobile('');
    setNewCustEmail('');
    setNewCustAddress('');
    setNewCustGst('');
    setNewCustNotes('');

    if (andStartOrder) {
      setActiveCustomerId(created.id);
      setActiveView('DROP');
      showToast(`Starting new POS booking for customer ${created.name}`, 'info');
    }
  };

  const handleOpenOrder = (order: Order) => {
    setActiveOrderId(order.id);
    setActiveView('PICKUP');
    showToast(`Opened Order #${order.orderNumber} for ${order.customerName}`, 'info');
  };

  const handleStartBookingForCust = (cust: Customer) => {
    setActiveCustomerId(cust.id);
    setActiveView('DROP');
    showToast(`Starting new POS booking for ${cust.name} (${cust.mobile})`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-y-auto select-none pb-12">
      {/* 1. Pending Pickup Requests Alert Banner */}
      {showPickupBanner && (
        <div className="bg-sky-50 border-b border-sky-200 px-4 py-2.5 sm:py-3 text-sky-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs">
          <div 
            onClick={() => {
              if (pendingPickupOrders.length > 0) {
                const targetOrder = pendingPickupOrders[0];
                setActiveOrderId(targetOrder.id);
                setActiveView('PICKUP');
                showToast(`Opening PickUp & Delivery Screen. ${pendingPickupOrders.length} pending pickup request(s).`, 'info');
              } else {
                setActiveView('PICKUP');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group flex-1"
          >
            {pendingPickupOrders.length > 0 ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-600"></span>
                </span>
                <span className="text-slate-700">
                  You have{' '}
                  <strong className="text-sky-950 font-bold underline group-hover:text-sky-700 transition">
                    {pendingPickupOrders.length} pending pick up request{pendingPickupOrders.length !== 1 ? 's' : ''}.
                  </strong>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-xs text-sky-700 font-semibold bg-sky-100/80 px-2 py-0.5 rounded border border-sky-200 group-hover:bg-sky-200 transition">
                  <span>Open Pickup Workflow</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-800 font-medium">
                  All pickup requests are cleared — no pending customer pickups right now.
                </span>
              </>
            )}
          </div>
          <button 
            onClick={() => setShowPickupBanner(false)}
            className="text-sky-400 hover:text-sky-800 p-1 rounded-md transition"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Counter Container */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        
        {/* Main Search & Operational Box */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
          
          {/* Header Bar within Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {businessSettings.businessName?.replace(/\s*CRM\s*$/i, '') || 'Trendera Dry Cleaning'}
                </h1>
                <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded">
                  Front Counter POS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Branch: <span className="font-semibold text-slate-700">
                  {(() => {
                    const addr = (businessSettings.address || '').trim();
                    const branch = (businessSettings.branchName || '').trim();
                    if (addr === 'Goyal Colony' || branch === 'Banur') {
                      return 'Goyal Colony, Banur';
                    }
                    if (addr && branch) {
                      return addr.toLowerCase().includes(branch.toLowerCase()) ? addr : `${addr}, ${branch}`;
                    }
                    return branch || addr || 'Goyal Colony, Banur';
                  })()}
                </span> ({businessSettings.branchCode || 'TE02'})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Logged in:</span>
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 font-normal">({currentUser.role})</span>
              </div>
            </div>
          </div>

          {/* Search Mode Radios / Filter Selector */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="searchModeRadio"
                checked={searchMode === 'ALL' || searchMode === 'CUSTOMER'}
                onChange={() => setSearchMode('CUSTOMER')}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span className={searchMode === 'CUSTOMER' ? 'text-sky-700 font-bold' : 'text-slate-700'}>
                Search Customer <span className="text-slate-400 font-normal">(Name, Mobile, Address, Code)</span>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="searchModeRadio"
                checked={searchMode === 'ORDER' || searchMode === 'INVOICE'}
                onChange={() => setSearchMode('ORDER')}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span className={searchMode === 'ORDER' || searchMode === 'INVOICE' ? 'text-sky-700 font-bold' : 'text-slate-700'}>
                Search Invoice / Order #
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="searchModeRadio"
                checked={searchMode === 'QR_BARCODE'}
                onChange={() => setSearchMode('QR_BARCODE')}
                className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span className={searchMode === 'QR_BARCODE' ? 'text-sky-700 font-bold' : 'text-slate-700'}>
                Garment QR / Barcode <span className="text-slate-400 font-normal">(e.g. 4-1-2)</span>
              </span>
            </label>
          </div>

          {/* Universal Search Input Box with Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            {/* Filter Dropdown */}
            <div className="relative sm:w-44 shrink-0">
              <select
                id="search-mode-select"
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value as SearchMode)}
                className="w-full h-12 pl-3 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
              >
                <option value="ALL">Search All</option>
                <option value="CUSTOMER">Customer Only</option>
                <option value="ORDER">Order # / Invoice</option>
                <option value="QR_BARCODE">Garment QR / Barcode</option>
              </select>
            </div>

            {/* Input Field with Icons */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={searchInputRef}
                id="counter-universal-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  searchMode === 'CUSTOMER' 
                    ? "Enter customer name, mobile (+91), address or Cust ID..." 
                    : searchMode === 'QR_BARCODE'
                    ? "Scan or enter garment barcode (e.g. 4-1-2, 4-2-2)..."
                    : searchMode === 'ORDER' || searchMode === 'INVOICE'
                    ? `Enter Order #, Invoice # (e.g. 4, ord-4, ${businessSettings.branchCode || 'TE02'}-4)...`
                    : "Search customer name, mobile, order #, invoice or scan garment barcode..."
                }
                className="w-full h-12 pl-11 pr-24 bg-white border-2 border-sky-400/80 rounded-lg text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100 outline-none shadow-2xs transition"
              />
              
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-10 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Instant Scan QR action button inside search bar */}
              <button
                onClick={() => openQRPickupModal(searchQuery || '4-1-2')}
                className="absolute inset-y-1.5 right-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold flex items-center gap-1 border border-slate-200 transition"
                title="Open QR Scanner Modal"
              >
                <Scan className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>

          {/* Two Prominent Action Buttons (Matching Requirements 5 & 6) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* 1. ADD NEW CUSTOMER BUTTON */}
            <button
              id="home-btn-add-customer"
              onClick={() => setIsNewCustModalOpen(true)}
              className="h-13 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition active:scale-[0.99]"
            >
              <UserPlus className="w-5 h-5 text-sky-400" />
              <span>ADD NEW CUSTOMER</span>
            </button>

            {/* 2. DAILY DASHBOARD BUTTON */}
            <button
              id="home-btn-daily-dashboard"
              onClick={() => {
                setActiveView('REPORTS');
                showToast('Switched to Business Reports & Daily Operations Dashboard.', 'info');
              }}
              className="h-13 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition active:scale-[0.99]"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>DAILY DASHBOARD</span>
            </button>
          </div>

          {/* Quick Search Results Dropdown/Display */}
          {searchResults && (
            <div className="mt-2 pt-4 border-t border-slate-200 flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>
                  Found <strong className="text-slate-900">{searchResults.totalCount}</strong> matching result{searchResults.totalCount !== 1 ? 's' : ''} for "{searchQuery}"
                </span>
                {searchResults.totalCount > 0 && (
                  <span className="text-sky-600 font-medium">Click any record below to open or manage</span>
                )}
              </div>

              {searchResults.totalCount === 0 ? (
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                  <div className="text-sm font-bold text-slate-700">No matching records found</div>
                  <p className="text-xs text-slate-500 max-w-sm">
                    No customer, order, or garment matches "{searchQuery}". You can quickly add this customer or check your spelling.
                  </p>
                  <button
                    onClick={() => {
                      setNewCustMobile(searchQuery.replace(/\D/g, ''));
                      setIsNewCustModalOpen(true);
                    }}
                    className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-md flex items-center gap-1.5 shadow-xs transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create New Customer for "{searchQuery}"</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {/* Customer Results */}
                  {searchResults.customers.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        <span>Matching Customers ({searchResults.customers.length})</span>
                      </div>
                      {searchResults.customers.map(c => (
                        <div
                          key={c.id}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-sky-400 hover:shadow-xs transition flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <span>{c.name}</span>
                                <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                  {c.custCode}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {formatIndianPhoneNumberDisplay(c.mobile)}
                                </span>
                                <span className="flex items-center gap-1 text-slate-500">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {c.address || c.area}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {c.outstandingAmount > 0 && (
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                Due: ₹{c.outstandingAmount}
                              </span>
                            )}
                            <button
                              onClick={() => handleStartBookingForCust(c)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>New Order (Drop)</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveCustomerId(c.id);
                                setActiveView('CUSTOMER');
                                showToast(`Selected customer ${c.name} in Customer Directory`, 'info');
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border border-slate-200 transition"
                            >
                              Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order Results */}
                  {searchResults.orders.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Matching Orders / Invoices ({searchResults.orders.length})</span>
                      </div>
                      {searchResults.orders.map(o => (
                        <div
                          key={o.id}
                          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-sky-400 hover:shadow-xs transition flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <span>Order #{o.orderNumber}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                o.status === 'READY' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : o.status === 'DELIVERED'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {o.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              <span>Customer: <strong>{o.customerName}</strong> ({o.customerMobile}) • {o.totalPieces} Pcs</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-right mr-2">
                              <div className="text-xs font-bold text-slate-900">₹{o.netAmount}</div>
                              {o.balanceDue > 0 ? (
                                <div className="text-[10px] text-amber-700 font-bold">Due: ₹{o.balanceDue}</div>
                              ) : (
                                <div className="text-[10px] text-emerald-700 font-bold">Paid</div>
                              )}
                            </div>
                            <button
                              onClick={() => handleOpenOrder(o)}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>View & Pickup</span>
                            </button>
                            <button
                              onClick={() => openQRPickupModal(o.items[0]?.barcode || o.orderNumber.toString())}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Scan className="w-3 h-3" />
                              <span>QR Handover</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Garment Barcode Results */}
                  {searchResults.garments.length > 0 && (
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-purple-600" />
                        <span>Matching Garment Barcodes ({searchResults.garments.length})</span>
                      </div>
                      {searchResults.garments.map(({ order, garment }, gIdx) => (
                        <div
                          key={`${order.id}-${garment.id}-${gIdx}`}
                          className="bg-purple-50/50 p-3.5 rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-xs transition flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-sm font-bold text-purple-950 flex items-center gap-2">
                              <span className="font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-300">
                                {garment.barcode}
                              </span>
                              <span>{garment.garmentName} ({garment.serviceName})</span>
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5">
                              Belongs to <strong>Order #{order.orderNumber}</strong> ({order.customerName}) • Pressing: <strong>{garment.pressingMethod || 'Iron Press'}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openQRPickupModal(garment.barcode)}
                              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition"
                            >
                              <Scan className="w-3.5 h-3.5" />
                              <span>Instant QR Pickup</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Support & Quick Counter Information Strip */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-center flex flex-col items-center gap-2">
          <div className="text-xs sm:text-sm text-slate-700 font-medium">
            Explore {businessSettings.businessName || 'Dry Cleaning CRM'} operations guide and tutorials to learn how to effectively use POS, 2R piece tagging, and customer notifications.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            <button 
              onClick={() => {
                setActiveView('MASTER_DATA');
                showToast('Opened Master Configuration & Pricing Services.', 'info');
              }}
              className="text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1"
            >
              <span>Service Pricing & Add-ons</span>
            </button>
            <span className="text-slate-300">•</span>
            <button 
              onClick={() => {
                setQRTagPreviewModalOpen(true);
              }}
              className="text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
            >
              <span>HP LaserJet / Windows Print Bridge</span>
            </button>
            <span className="text-slate-300">•</span>
            <button 
              onClick={() => {
                setWhatsAppSimulatorOpen(true);
              }}
              className="text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>WhatsApp & Email Logs</span>
            </button>
          </div>
        </div>

        {/* Operational Quick Access Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div 
            onClick={() => setActiveView('DROP')}
            className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition cursor-pointer flex flex-col gap-1"
          >
            <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">POS Intake (Drop)</div>
            <div className="text-[11px] text-slate-500">Create new garment booking</div>
          </div>

          <div 
            onClick={() => openQRPickupModal('4-1-2')}
            className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-purple-400 hover:shadow-xs transition cursor-pointer flex flex-col gap-1"
          >
            <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">Scan QR Handover</div>
            <div className="text-[11px] text-slate-500">Fast barcode delivery</div>
          </div>

          <div 
            onClick={() => setActiveView('PROCESS')}
            className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-sky-400 hover:shadow-xs transition cursor-pointer flex flex-col gap-1"
          >
            <div className="w-7 h-7 rounded bg-sky-100 text-sky-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">Workshop & Tags</div>
            <div className="text-[11px] text-slate-500">Print QR tags & finishing</div>
          </div>

          <div 
            onClick={() => setActiveView('PICKUP')}
            className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:shadow-xs transition cursor-pointer flex flex-col gap-1"
          >
            <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">Pickup & Delivery</div>
            <div className="text-[11px] text-slate-500">{readyForPickupOrders.length} ready orders</div>
          </div>
        </div>

      </div>

      {/* New Customer Modal */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">Add New Customer</h3>
              </div>
              <button 
                onClick={() => setIsNewCustModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateCustomer(e, false)} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9780195915"
                    value={newCustMobile}
                    onChange={(e) => setNewCustMobile(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                  />
                  <div className="text-[10px] text-slate-500">
                    Normalizes automatically to +91
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Sector / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 1, Noida"
                    value={newCustArea}
                    onChange={(e) => setNewCustArea(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Delivery Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="House / Flat No, Street, Landmark, Locality..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">GSTIN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="07AAAAA0000A1Z5"
                    value={newCustGst}
                    onChange={(e) => setNewCustGst(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">Preferences / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Prefers hanger packing"
                    value={newCustNotes}
                    onChange={(e) => setNewCustNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCreateCustomer(e, true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-xs transition"
                  >
                    Save & Create Order
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow-xs transition"
                  >
                    Save Customer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
