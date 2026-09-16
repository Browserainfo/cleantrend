import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderGarmentItem } from '../../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Printer, 
  Tag, 
  X, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  ShoppingBag, 
  MessageSquare,
  ClipboardList,
  Save,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Ban
} from 'lucide-react';
import { normalizeIndianPhoneNumber } from '../../utils/phoneUtils';

export const OrderManagementScreen: React.FC = () => {
  const { 
    orders, 
    customers, 
    catalog, 
    businessSettings, 
    currentRole,
    setActiveView, 
    setActiveOrderId,
    setThermalReceiptModalOpen,
    setGarmentTagPrintModalOpen,
    setWhatsAppSimulatorOpen,
    updateOrder,
    cancelOrder,
    deleteOrder,
    showToast 
  } = useApp();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  // Selected Order for Edit Modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Editable Form State for Order
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerMobile, setEditCustomerMobile] = useState('');
  const [editCustomerAddress, setEditCustomerAddress] = useState('');
  const [editOrderStatus, setEditOrderStatus] = useState<Order['status']>('RECEIVED');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPickAndDropType, setEditPickAndDropType] = useState<string>('COUNTER_WALKIN');
  const [editDeliveryCharge, setEditDeliveryCharge] = useState<number>(0);
  const [editDiscountPercent, setEditDiscountPercent] = useState<number>(0);
  const [editSurchargeType, setEditSurchargeType] = useState<string>('NONE');
  const [editSurchargeAmount, setEditSurchargeAmount] = useState<number>(0);
  const [editWorkshopNotes, setEditWorkshopNotes] = useState('');
  const [editDeliveryNotes, setEditDeliveryNotes] = useState('');
  
  // Editable Items
  const [editItems, setEditItems] = useState<OrderGarmentItem[]>([]);

  // Add Item to Order State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemGarmentName, setNewItemGarmentName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('MEN');
  const [newItemService, setNewItemService] = useState('Dry Clean');
  const [newItemPressing, setNewItemPressing] = useState('Iron Press');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  // New Payment Transaction State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Confirmation Modals State
  const [confirmCancelModalOpen, setConfirmCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Duplicate or test order removal');

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = String(order.orderNumber).includes(q) || `#${order.orderNumber}`.includes(q);
        const matchesCust = (order.customerName || '').toLowerCase().includes(q);
        const matchesMobile = (order.customerMobile || '').includes(q);
        const matchesBarcode = (order.barcode || '').toLowerCase().includes(q);
        const matchesSeries = (order.orderSeries || '').toLowerCase().includes(q);
        const matchesItem = Array.isArray(order.items) && order.items.some(i => (i.garmentName || '').toLowerCase().includes(q));

        if (!matchesNumber && !matchesCust && !matchesMobile && !matchesBarcode && !matchesSeries && !matchesItem) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE') {
          if (['DELIVERED', 'CANCELLED'].includes(order.status)) return false;
        } else if (order.status !== statusFilter) {
          return false;
        }
      }

      // 3. Payment Filter
      if (paymentFilter !== 'ALL') {
        if (paymentFilter === 'PAID' && order.balanceDue > 0) return false;
        if (paymentFilter === 'DUE' && order.balanceDue <= 0) return false;
        if (paymentFilter === 'PARTIAL' && (order.advancePaid <= 0 || order.balanceDue <= 0)) return false;
      }

      // 4. Date Filter
      if (dateFilter !== 'ALL') {
        const orderDateObj = new Date(order.createdAt || order.orderDate);
        const now = new Date();
        if (dateFilter === 'TODAY') {
          if (orderDateObj.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'WEEK') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
          if (orderDateObj < sevenDaysAgo) return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, dateFilter]);

  // Handle Opening Order for Editing
  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setEditCustomerName(order.customerName || '');
    setEditCustomerMobile(order.customerMobile || '');
    setEditCustomerAddress(order.customerAddress || '');
    setEditOrderStatus(order.status || 'RECEIVED');
    setEditDueDate(order.dueDate || '');
    setEditPickAndDropType(order.pickAndDropType || 'COUNTER_WALKIN');
    setEditDeliveryCharge(order.deliveryCharge || 0);
    setEditDiscountPercent(order.discountPercent || 0);
    setEditSurchargeType(order.surchargeType || 'NONE');
    setEditSurchargeAmount(order.surchargeAmount || 0);
    setEditWorkshopNotes(order.workshopNotes || '');
    setEditDeliveryNotes(order.deliveryNotes || '');
    setEditItems(order.items ? JSON.parse(JSON.stringify(order.items)) : []);
    setIsAddingItem(false);
    setIsAddingPayment(false);
    setPaymentAmount(order.balanceDue > 0 ? order.balanceDue : 0);
  };

  // Live Recalculations for Editing Order
  const recalculatedTotals = useMemo(() => {
    const gross = editItems.reduce((sum, item) => sum + (Number(item.totalItemPrice) || 0), 0);
    const discountAmt = Number(((gross * (editDiscountPercent || 0)) / 100).toFixed(2));
    const delivery = Number(editDeliveryCharge || 0);
    const surcharge = Number(editSurchargeAmount || 0);
    const subtotal = gross + delivery + surcharge - discountAmt;
    const roundedNet = Math.round(subtotal);
    const roundOff = Number((roundedNet - subtotal).toFixed(2));
    const advance = Number(editingOrder?.advancePaid || 0);
    const balance = Math.max(0, roundedNet - advance);
    const totalPcs = editItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

    return {
      gross,
      discountAmt,
      delivery,
      surcharge,
      roundOff,
      roundedNet,
      advance,
      balance,
      totalPcs
    };
  }, [editItems, editDiscountPercent, editDeliveryCharge, editSurchargeAmount, editingOrder?.advancePaid]);

  // Handle Item Quantity & Price Changes
  const handleItemQtyChange = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setEditItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.quantity = newQty;
      const unitPrice = item.basePrice || (item.totalItemPrice / (item.quantity || 1));
      item.totalItemPrice = Number((unitPrice * newQty).toFixed(2));
      updated[index] = item;
      return updated;
    });
  };

  const handleItemPriceChange = (index: number, newUnitPrice: number) => {
    if (newUnitPrice < 0) return;
    setEditItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.basePrice = newUnitPrice;
      item.totalItemPrice = Number((newUnitPrice * (item.quantity || 1)).toFixed(2));
      updated[index] = item;
      return updated;
    });
  };

  const handleItemServiceChange = (index: number, newService: string) => {
    setEditItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], serviceName: newService };
      return updated;
    });
  };

  const handleItemPressingChange = (index: number, newPressing: string) => {
    setEditItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], pressingMethod: newPressing };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (editItems.length <= 1) {
      showToast('An order must contain at least one item.', 'warning');
      return;
    }
    setEditItems(prev => prev.filter((_, i) => i !== index));
    showToast('Garment item removed from order list.', 'info');
  };

  // Add Item to Order
  const handleConfirmAddItem = () => {
    if (!newItemGarmentName.trim()) {
      showToast('Please enter or select a garment name.', 'warning');
      return;
    }
    if (newItemPrice <= 0) {
      showToast('Please enter a valid price amount.', 'warning');
      return;
    }

    const nextSeq = editItems.length + 1;
    const barcode = `${editingOrder?.orderSeries || 'TE02-ORD'}-${nextSeq}`;

    const newItem: OrderGarmentItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      garmentSequence: nextSeq,
      garmentName: newItemGarmentName.trim(),
      category: newItemCategory as any,
      serviceCode: 'DC',
      serviceName: newItemService,
      pressingMethod: newItemPressing,
      quantity: newItemQty,
      basePrice: newItemPrice,
      subServices: [],
      totalItemPrice: Number((newItemPrice * newItemQty).toFixed(2)),
      remarks: [],
      barcode,
      status: 'RECEIVED'
    };

    setEditItems(prev => [...prev, newItem]);
    setIsAddingItem(false);
    setNewItemGarmentName('');
    setNewItemPrice(0);
    setNewItemQty(1);
    showToast(`Added ${newItem.garmentName} to order.`, 'success');
  };

  // Add Payment Transaction
  const handleRecordPayment = () => {
    if (!editingOrder) return;
    if (paymentAmount <= 0) {
      showToast('Please enter a valid payment amount.', 'warning');
      return;
    }

    const newAdvance = (editingOrder.advancePaid || 0) + paymentAmount;
    const newBalance = Math.max(0, recalculatedTotals.roundedNet - newAdvance);

    const newPaymentRecord = {
      id: `tx-${Date.now()}`,
      orderId: editingOrder.id,
      amount: paymentAmount,
      paymentMethod,
      channel: 'COUNTER' as const,
      timestamp: new Date().toISOString(),
      collectedBy: 'Staff Counter',
      notes: paymentNotes || 'Staff counter payment'
    };

    const updatedPayments = [...(editingOrder.payments || []), newPaymentRecord];

    // Update in edit state
    setEditingOrder(prev => prev ? {
      ...prev,
      advancePaid: newAdvance,
      balanceDue: newBalance,
      payments: updatedPayments
    } : null);

    setIsAddingPayment(false);
    setPaymentNotes('');
    showToast(`Recorded payment of ₹${paymentAmount} via ${paymentMethod}.`, 'success');
  };

  // Save All Order Edits
  const handleSaveOrderChanges = () => {
    if (!editingOrder) return;

    if (!editCustomerName.trim() || !editCustomerMobile.trim()) {
      showToast('Customer name and mobile number cannot be empty.', 'warning');
      return;
    }

    if (editItems.length === 0) {
      showToast('Order must contain at least one item.', 'warning');
      return;
    }

    const normalizedPhone = normalizeIndianPhoneNumber(editCustomerMobile.trim());

    const updatedData: Partial<Order> = {
      customerName: editCustomerName.trim(),
      customerMobile: normalizedPhone,
      customerAddress: editCustomerAddress.trim(),
      status: editOrderStatus,
      dueDate: editDueDate || editingOrder.dueDate,
      pickAndDropType: editPickAndDropType as any,
      deliveryCharge: recalculatedTotals.delivery,
      hasDeliveryCharge: recalculatedTotals.delivery > 0,
      isPickAndDrop: editPickAndDropType === 'DOORSTEP_PICK_DROP',
      discountPercent: editDiscountPercent,
      discountAmount: recalculatedTotals.discountAmt,
      surchargeType: editSurchargeType as any,
      surchargeAmount: recalculatedTotals.surcharge,
      grossAmount: recalculatedTotals.gross,
      netAmount: recalculatedTotals.roundedNet,
      advancePaid: recalculatedTotals.advance,
      roundOff: recalculatedTotals.roundOff,
      balanceDue: recalculatedTotals.balance,
      workshopNotes: editWorkshopNotes,
      deliveryNotes: editDeliveryNotes,
      items: editItems,
      totalPieces: recalculatedTotals.totalPcs,
      payments: editingOrder.payments || []
    };

    const res = updateOrder(editingOrder.id, updatedData);
    if (res.success) {
      showToast(`Order #${editingOrder.orderNumber} changes saved successfully!`, 'success');
      setEditingOrder(null);
    } else {
      showToast(res.error || 'Failed to update order.', 'error');
    }
  };

  // Handle Cancel Order
  const handleConfirmCancel = () => {
    if (!editingOrder) return;
    const res = cancelOrder(editingOrder.id, cancelReason);
    if (res.success) {
      setConfirmCancelModalOpen(false);
      setEditingOrder(null);
    }
  };

  // Handle Delete Order
  const handleConfirmDelete = () => {
    if (!editingOrder) return;
    const res = deleteOrder(editingOrder.id, deleteReason);
    if (res.success) {
      setConfirmDeleteModalOpen(false);
      setEditingOrder(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between shadow-xs gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Orders Management</h1>
              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
                {orders.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Find, view, update garment items, modify delivery, adjust prices, or settle orders.
            </p>
          </div>
        </div>

        {/* Right Action: Create New Order Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('DROP')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Order (Drop)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          {/* Universal Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Order #, Customer Name, Mobile, Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
            {['ALL', 'ACTIVE', 'RECEIVED', 'READY', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  statusFilter === st 
                    ? 'bg-white text-sky-700 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Pending' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center gap-2">
          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partial Payment</option>
            <option value="DUE">Balance Due</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 outline-none"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today's Orders</option>
            <option value="WEEK">Last 7 Days</option>
          </select>

          <span className="text-[11px] font-semibold text-slate-500 pl-2">
            Showing {filteredOrders.length} of {orders.length}
          </span>
        </div>
      </div>

      {/* Primary Orders List Table */}
      <div className="flex-1 overflow-auto p-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto mt-8">
            <ClipboardList className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-sm text-slate-800">No matching orders found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try adjusting your search query or status filter to find existing orders.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPaymentFilter('ALL');
                setDateFilter('ALL');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold border-b border-slate-800 text-[11px]">
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Booked / Due Date</th>
                  <th className="py-2.5 px-3">Items / Pieces</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Paid / Balance</th>
                  <th className="py-2.5 px-3">Order Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredOrders.map((order) => {
                  const isCancelled = order.status === 'CANCELLED';
                  const isDelivered = order.status === 'DELIVERED';
                  const isReady = order.status === 'READY';
                  const isPaid = order.balanceDue <= 0;

                  return (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-sky-50/50 transition cursor-pointer ${
                        isCancelled ? 'bg-rose-50/30 opacity-75' : ''
                      }`}
                      onClick={() => handleOpenEditModal(order)}
                    >
                      {/* Order # */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 text-sm">#{order.orderNumber}</span>
                          {order.branchCode && (
                            <span className="text-[10px] font-mono px-1 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {order.branchCode}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{order.barcode}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <span>{order.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customerMobile}</span>
                        </div>
                      </td>

                      {/* Booked / Due Date */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700 font-medium">Booked: {order.orderDate?.split(' ')[0] || 'Today'}</div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-600" />
                          <span>Due: {order.dueDate}</span>
                        </div>
                      </td>

                      {/* Items / Pieces */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">
                          {order.totalPieces || (order.items?.reduce((s, i) => s + (i.quantity || 1), 0)) || 1} Pcs
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px]" title={order.items?.map(i => `${i.quantity}x ${i.garmentName}`).join(', ')}>
                          {order.items?.map(i => `${i.quantity}x ${i.garmentName}`).join(', ') || 'Dry cleaning items'}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900 text-xs">
                          ₹{Number(order.netAmount || 0).toFixed(2)}
                        </div>
                        {order.deliveryCharge && order.deliveryCharge > 0 ? (
                          <div className="text-[10px] text-indigo-600 font-semibold">
                            Incl. Deliv: ₹{order.deliveryCharge}
                          </div>
                        ) : null}
                      </td>

                      {/* Paid / Balance */}
                      <td className="py-3 px-3">
                        <div className="text-slate-600 text-[11px]">Paid: ₹{Number(order.advancePaid || 0).toFixed(2)}</div>
                        {order.balanceDue > 0 ? (
                          <div className="text-rose-700 font-black text-xs flex items-center gap-0.5">
                            <span>Due: ₹{Number(order.balanceDue).toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid in Full</span>
                          </div>
                        )}
                      </td>

                      {/* Order Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isDelivered
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isReady
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {isCancelled ? <Ban className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                          <span>{order.status.replace('_', ' ')}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open / Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(order)}
                            className="p-1.5 bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-700 rounded border border-slate-200 transition"
                            title="Open / Edit Order"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Thermal Receipt */}
                          <button
                            onClick={() => {
                              setActiveOrderId(order.id);
                              setThermalReceiptModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition"
                            title="Print 80mm Thermal Receipt"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {/* Print 2R Tags */}
                          <button
                            onClick={() => {
                              setActiveOrderId(order.id);
                              setGarmentTagPrintModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition"
                            title="Print Garment 2R Piece Tags"
                          >
                            <Tag className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {/* WhatsApp */}
                          <button
                            onClick={() => {
                              setActiveOrderId(order.id);
                              setWhatsAppSimulatorOpen(true);
                            }}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition"
                            title="Send WhatsApp Confirmation"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* Comprehensive Order Edit Modal                               */}
      {/* ============================================================ */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                  #{editingOrder.orderNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      Edit Order #{editingOrder.orderNumber}
                    </h2>
                    <span className="text-[11px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {editingOrder.barcode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Booked on {editingOrder.orderDate} • Branch: {editingOrder.branchCode || 'TE02'}
                  </p>
                </div>
              </div>

              {/* Status and Close */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-300 font-semibold">Status:</span>
                  <select
                    value={editOrderStatus}
                    onChange={(e) => setEditOrderStatus(e.target.value as Order['status'])}
                    className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-white rounded text-xs font-bold outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="RECEIVED">RECEIVED</option>
                    <option value="IN_PROCESS">IN PROCESS</option>
                    <option value="PENDING_FINISHING">PENDING FINISHING</option>
                    <option value="READY">READY FOR PICKUP</option>
                    <option value="PARTIALLY_DELIVERED">PARTIALLY DELIVERED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Top Row: Customer Info & Delivery Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details Card */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      Customer Details
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {editingOrder.customerId}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Customer Name *</label>
                      <input
                        type="text"
                        value={editCustomerName}
                        onChange={(e) => setEditCustomerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500 font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Mobile Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        value={editCustomerMobile}
                        onChange={(e) => setEditCustomerMobile(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500 font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Delivery Address</label>
                    <input
                      type="text"
                      value={editCustomerAddress}
                      onChange={(e) => setEditCustomerAddress(e.target.value)}
                      placeholder="Customer full street address..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Delivery & Due Date Card */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      Delivery & Target Date
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Delivery Mode</label>
                      <select
                        value={editPickAndDropType}
                        onChange={(e) => setEditPickAndDropType(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="COUNTER_WALKIN">Store Counter (No Delivery)</option>
                        <option value="STORE_HOME_DELIVERY">Store to Home Delivery</option>
                        <option value="DOORSTEP_PICK_DROP">Doorstep Pick & Drop</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Delivery / Pick Charge (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={editDeliveryCharge}
                        onChange={(e) => setEditDeliveryCharge(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Target Ready / Due Date</label>
                      <input
                        type="text"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        placeholder="e.g. 20 Mar 2026 or 2026-03-20"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Delivery Instructions / Notes</label>
                      <input
                        type="text"
                        value={editDeliveryNotes}
                        onChange={(e) => setEditDeliveryNotes(e.target.value)}
                        placeholder="e.g. Call before delivery, Gate 2"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Garments and Items Section */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-slate-900 text-xs">
                      Order Garments ({editItems.length} items • {recalculatedTotals.totalPcs} Pcs)
                    </span>
                  </div>

                  <button
                    onClick={() => setIsAddingItem(true)}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Add Item Form (Collapsible) */}
                {isAddingItem && (
                  <div className="p-3.5 bg-sky-50/70 border-b border-sky-200 space-y-3">
                    <div className="font-bold text-xs text-sky-900 flex items-center justify-between">
                      <span>Add Garment to this Order</span>
                      <button onClick={() => setIsAddingItem(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-600">Garment Item Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Kurta Pajama, Silk Saree, Blazer..."
                          value={newItemGarmentName}
                          onChange={(e) => setNewItemGarmentName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600">Category</label>
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none"
                        >
                          <option value="MEN">MEN</option>
                          <option value="WOMEN">WOMEN</option>
                          <option value="KIDS">KIDS</option>
                          <option value="HOUSEHOLD">HOUSEHOLD</option>
                          <option value="SPECIAL">SPECIAL</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600">Service</label>
                        <select
                          value={newItemService}
                          onChange={(e) => setNewItemService(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none"
                        >
                          <option value="Dry Clean">Dry Clean</option>
                          <option value="Steam Press">Steam Press</option>
                          <option value="Laundry & Iron">Laundry & Iron</option>
                          <option value="Starching">Starching</option>
                          <option value="Wash & Fold">Wash & Fold</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <div className="w-16">
                          <label className="text-[10px] font-bold text-slate-600">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={newItemQty}
                            onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-600">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Price"
                            value={newItemPrice || ''}
                            onChange={(e) => setNewItemPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingItem(false)}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmAddItem}
                        className="px-4 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold"
                      >
                        Add to Items
                      </button>
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="py-2 px-3 w-8">#</th>
                        <th className="py-2 px-3">Garment Item</th>
                        <th className="py-2 px-3">Service</th>
                        <th className="py-2 px-3">Pressing</th>
                        <th className="py-2 px-3 w-20 text-center">Qty</th>
                        <th className="py-2 px-3 w-24 text-right">Unit Price</th>
                        <th className="py-2 px-3 w-24 text-right">Total</th>
                        <th className="py-2 px-3 w-12 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editItems.map((item, idx) => {
                        const unitPrice = item.unitPrice || (item.totalItemPrice / (item.quantity || 1));

                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                            
                            {/* Garment Name & Barcode */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.garmentName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditItems(prev => {
                                    const updated = [...prev];
                                    updated[idx] = { ...updated[idx], garmentName: val };
                                    return updated;
                                  });
                                }}
                                className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800"
                              />
                              <div className="text-[10px] text-slate-400 font-mono">{item.barcode}</div>
                            </td>

                            {/* Service */}
                            <td className="py-2.5 px-3">
                              <select
                                value={item.serviceName}
                                onChange={(e) => handleItemServiceChange(idx, e.target.value)}
                                className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs"
                              >
                                <option value="Dry Clean">Dry Clean</option>
                                <option value="Steam Press">Steam Press</option>
                                <option value="Laundry & Iron">Laundry & Iron</option>
                                <option value="Starching">Starching</option>
                                <option value="Wash & Fold">Wash & Fold</option>
                              </select>
                            </td>

                            {/* Pressing Method */}
                            <td className="py-2.5 px-3">
                              <select
                                value={item.pressingMethod || 'Iron Press'}
                                onChange={(e) => handleItemPressingChange(idx, e.target.value)}
                                className="px-1.5 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-indigo-900"
                              >
                                <option value="Iron Press">Iron Press</option>
                                <option value="Steam Press">Steam Press</option>
                                <option value="Hanger Pack">Hanger Pack</option>
                                <option value="Fold Only">Fold Only</option>
                              </select>
                            </td>

                            {/* Quantity */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyChange(idx, (item.quantity || 1) - 1)}
                                  className="w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity || 1}
                                  onChange={(e) => handleItemQtyChange(idx, parseInt(e.target.value) || 1)}
                                  className="w-10 text-center font-bold px-1 py-0.5 border border-slate-300 rounded text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleItemQtyChange(idx, (item.quantity || 1) + 1)}
                                  className="w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Unit Price */}
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={unitPrice}
                                onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                                className="w-20 text-right font-bold px-1.5 py-1 border border-slate-300 rounded text-xs"
                              />
                            </td>

                            {/* Total Price */}
                            <td className="py-2.5 px-3 text-right font-black text-slate-900">
                              ₹{(Number(item.totalItemPrice) || 0).toFixed(2)}
                            </td>

                            {/* Delete Item */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Row: Pricing, Surcharge, Discount & Payments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Surcharges & Discounts */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    Discount & Surcharge Adjustments
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Discount Percentage (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editDiscountPercent}
                        onChange={(e) => setEditDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold"
                      />
                      <div className="text-[10px] text-rose-600 font-semibold pt-0.5">
                        -₹{recalculatedTotals.discountAmt.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Surcharge (Express / Urgency)</label>
                      <select
                        value={editSurchargeType}
                        onChange={(e) => {
                          const type = e.target.value;
                          setEditSurchargeType(type);
                          if (type === 'EXPRESS_NEXT_DAY') {
                            setEditSurchargeAmount(Number((recalculatedTotals.gross * 0.25).toFixed(2)));
                          } else if (type === 'SAME_DAY_URGENT') {
                            setEditSurchargeAmount(Number((recalculatedTotals.gross * 0.50).toFixed(2)));
                          } else if (type === 'NONE') {
                            setEditSurchargeAmount(0);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      >
                        <option value="NONE">None (Standard)</option>
                        <option value="EXPRESS_NEXT_DAY">Express Next Day (+25%)</option>
                        <option value="SAME_DAY_URGENT">Same Day Urgent (+50%)</option>
                        <option value="CUSTOM">Custom Surcharge</option>
                      </select>
                      {editSurchargeAmount > 0 && (
                        <div className="text-[10px] text-amber-700 font-semibold pt-0.5">
                          +₹{recalculatedTotals.surcharge.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Workshop Instructions / Defect Notes</label>
                    <textarea
                      rows={2}
                      value={editWorkshopNotes}
                      onChange={(e) => setEditWorkshopNotes(e.target.value)}
                      placeholder="Special instructions for workshop stain removal, pressing style..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Financial Summary & Payment Settlement */}
                <div className="bg-slate-900 text-white p-4 rounded-lg flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5 border-b border-slate-800 pb-2.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Items Gross Subtotal:</span>
                      <span>₹{recalculatedTotals.gross.toFixed(2)}</span>
                    </div>

                    {recalculatedTotals.delivery > 0 && (
                      <div className="flex justify-between text-indigo-400">
                        <span>Delivery Charge:</span>
                        <span>+₹{recalculatedTotals.delivery.toFixed(2)}</span>
                      </div>
                    )}

                    {recalculatedTotals.surcharge > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>Surcharge ({editSurchargeType}):</span>
                        <span>+₹{recalculatedTotals.surcharge.toFixed(2)}</span>
                      </div>
                    )}

                    {recalculatedTotals.discountAmt > 0 && (
                      <div className="flex justify-between text-rose-400">
                        <span>Discount ({editDiscountPercent}%):</span>
                        <span>-₹{recalculatedTotals.discountAmt.toFixed(2)}</span>
                      </div>
                    )}

                    {recalculatedTotals.roundOff !== 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Round Off:</span>
                        <span>₹{recalculatedTotals.roundOff.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-1">
                      <span>Net Order Amount:</span>
                      <span className="text-base text-sky-400 font-black">₹{recalculatedTotals.roundedNet.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Total Paid So Far:</span>
                      <span className="font-bold text-emerald-400">₹{recalculatedTotals.advance.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm font-black border-t border-slate-800 pt-1">
                      <span>Balance Outstanding:</span>
                      <span className={recalculatedTotals.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        ₹{recalculatedTotals.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Settlement Action */}
                  {recalculatedTotals.balance > 0 ? (
                    <div className="bg-slate-800 p-2.5 rounded border border-slate-700 space-y-2">
                      {!isAddingPayment ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-amber-300 font-semibold">
                            Pending Due: ₹{recalculatedTotals.balance.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAddingPayment(true)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Record Payment</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <div className="font-bold text-emerald-400 flex items-center justify-between">
                            <span>Record Customer Payment</span>
                            <button onClick={() => setIsAddingPayment(false)} className="text-slate-400 hover:text-white">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-400">Amount (₹)</label>
                              <input
                                type="number"
                                min="1"
                                max={recalculatedTotals.balance}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-emerald-400"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400">Method</label>
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white"
                              >
                                <option value="CASH">Cash</option>
                                <option value="UPI">UPI / QR</option>
                                <option value="CARD">Card POS</option>
                              </select>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRecordPayment}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs"
                          >
                            Confirm Payment of ₹{paymentAmount}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-950/40 p-2 rounded border border-emerald-800">
                      ✓ Order is fully settled and paid in full.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Left Destructive / Cancel Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancelModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-xs font-bold flex items-center gap-1 border border-amber-300 transition"
                  title="Cancel order"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDeleteModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-xs font-bold flex items-center gap-1 border border-rose-300 transition"
                  title="Delete order permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Right Save and Print Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOrderId(editingOrder.id);
                    setThermalReceiptModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-bold flex items-center gap-1 border border-slate-300 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveOrderId(editingOrder.id);
                    setGarmentTagPrintModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-bold flex items-center gap-1 border border-slate-300 transition"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Tags</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSaveOrderChanges}
                  className="px-5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Order Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Cancel Order */}
      {confirmCancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-300 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Order Cancellation</h3>
                <p className="text-xs text-slate-500">Order #{editingOrder?.orderNumber} will be marked as CANCELLED.</p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Reason for Cancellation</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setConfirmCancelModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Order */}
      {confirmDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-rose-300 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Permanent Deletion</h3>
                <p className="text-xs text-rose-600 font-semibold">
                  This will permanently delete Order #{editingOrder?.orderNumber}. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700">Reason for Deletion</label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setConfirmDeleteModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold"
              >
                Permanently Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
