import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Receipt, 
  Clock, 
  ArrowRight, 
  Edit, 
  MessageSquare, 
  DollarSign, 
  ShoppingBag, 
  X, 
  Check, 
  Plus 
} from 'lucide-react';
import { Customer } from '../../types';
import { normalizeIndianPhoneNumber, formatIndianPhoneNumberDisplay } from '../../utils/phoneUtils';

export const CustomerScreen: React.FC = () => {
  const { 
    customers, 
    addCustomer, 
    updateCustomer,
    orders, 
    setActiveOrderId, 
    setActiveView, 
    setActiveCustomerId,
    setWhatsAppSimulatorOpen, 
    showToast,
    businessSettings 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [isEditCustModalOpen, setIsEditCustModalOpen] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustArea, setNewCustArea] = useState('Sector 1');
  const [newCustGst, setNewCustGst] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // Edit Customer Form State
  const [editCustId, setEditCustId] = useState('');
  const [editCustName, setEditCustName] = useState('');
  const [editCustMobile, setEditCustMobile] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustAddress, setEditCustAddress] = useState('');
  const [editCustArea, setEditCustArea] = useState('');
  const [editCustGst, setEditCustGst] = useState('');
  const [editCustNotes, setEditCustNotes] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    c.custCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const customerOrders = orders.filter(o => o.customerId === selectedCustomer?.id);

  const handleCreateCustomer = (e: React.FormEvent) => {
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

    setSelectedCustomerId(created.id);
    setIsNewCustModalOpen(false);
    showToast(`Customer ${created.name} (${normalizedPhone}) created successfully.`, 'success');

    // Reset Form
    setNewCustName('');
    setNewCustMobile('');
    setNewCustEmail('');
    setNewCustAddress('');
    setNewCustGst('');
    setNewCustNotes('');
  };

  const handleOpenEditCustomer = (cust: Customer) => {
    setEditCustId(cust.id);
    setEditCustName(cust.name);
    setEditCustMobile(cust.mobile);
    setEditCustEmail(cust.email || '');
    setEditCustAddress(cust.address || '');
    setEditCustArea(cust.area || '');
    setEditCustGst(cust.gstNumber || '');
    setEditCustNotes(cust.notes || '');
    setIsEditCustModalOpen(true);
  };

  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustName.trim() || !editCustMobile.trim()) {
      showToast('Customer Name and Mobile Number are required.', 'warning');
      return;
    }

    const normalizedPhone = normalizeIndianPhoneNumber(editCustMobile.trim());
    const res = updateCustomer(editCustId, {
      name: editCustName.trim(),
      mobile: normalizedPhone,
      email: editCustEmail.trim(),
      address: editCustAddress.trim(),
      area: editCustArea.trim(),
      gstNumber: editCustGst.trim(),
      notes: editCustNotes.trim()
    });

    if (res) {
      setIsEditCustModalOpen(false);
    }
  };

  const handleStartBookingForCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.id);
    setActiveCustomerId(cust.id);
    setActiveView('DROP');
    showToast(`Starting new POS booking for customer ${cust.name} (${cust.mobile})`, 'info');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
      {/* Module Title Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Customer Management & Directory</h1>
            <p className="text-xs text-slate-500">Quick search, profile insights, order history, and account balances.</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewCustModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Column: Search & Customer List */}
        <div className="w-96 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Name, Mobile, Code (e.g. Cust62)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>{filteredCustomers.length} Customers Found</span>
              <span className="font-semibold text-slate-700">Total: {customers.length}</span>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredCustomers.map(cust => {
              const isSelected = cust.id === selectedCustomerId;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-3.5 cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected ? 'bg-sky-50 border-l-4 border-sky-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>{cust.name}</span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                        {cust.custCode}
                      </span>
                    </div>
                    {cust.outstandingAmount > 0 ? (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Due: ₹{cust.outstandingAmount.toFixed(0)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Settled
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{cust.mobile}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.address || 'Address not provided'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 mt-0.5">
                    <span>{cust.totalOrdersCount} Total Orders</span>
                    <span>Last visit: {cust.lastVisit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Customer Details & Order History */}
        {selectedCustomer ? (
          <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {/* Customer Header Details */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                  <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded font-mono border border-sky-300">
                    {selectedCustomer.custCode}
                  </span>
                  {selectedCustomer.outstandingAmount > 0 && (
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded border border-rose-300">
                      Balance Due: ₹{selectedCustomer.outstandingAmount.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-semibold">{selectedCustomer.mobile}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {selectedCustomer.address || 'No street address'} 
                      {selectedCustomer.placeOfSupply ? ` (${selectedCustomer.placeOfSupply})` : ''}
                    </span>
                  </div>
                </div>

                {selectedCustomer.notes && (
                  <div className="mt-2 text-xs bg-amber-50 text-amber-900 p-2 rounded border border-amber-200 flex items-start gap-1.5">
                    <span className="font-bold shrink-0">Special Note:</span>
                    <span>{selectedCustomer.notes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditCustomer(selectedCustomer)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition"
                  title="Edit customer profile information"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setWhatsAppSimulatorOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  title="Open WhatsApp notifications for this customer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleStartBookingForCustomer(selectedCustomer)}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>New Drop Order</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 border-b border-slate-200 divide-x divide-slate-200 bg-white text-center py-3">
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Orders</div>
                <div className="text-base font-bold text-slate-900">{selectedCustomer.totalOrdersCount}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Pending Orders</div>
                <div className="text-base font-bold text-amber-600">{selectedCustomer.pendingOrdersCount}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Outstanding Balance</div>
                <div className={`text-base font-bold ${selectedCustomer.outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{selectedCustomer.outstandingAmount.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Last Visit</div>
                <div className="text-base font-bold text-slate-700">{selectedCustomer.lastVisit}</div>
              </div>
            </div>

            {/* Customer Orders Table */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-sky-600" />
                  <span>Customer Order & Garment History ({customerOrders.length})</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">Order #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Garments</th>
                      <th className="p-2.5">Due Date</th>
                      <th className="p-2.5">Net Amount</th>
                      <th className="p-2.5">Balance Due</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 font-bold font-mono text-sky-700">
                          #{order.orderNumber}
                        </td>
                        <td className="p-2.5 text-slate-600 whitespace-nowrap">
                          {order.orderDate}
                        </td>
                        <td className="p-2.5 text-slate-800 font-medium">
                          {order.totalPieces} Pcs ({order.items.map(i => i.garmentName).slice(0, 2).join(', ')}{order.items.length > 2 ? '...' : ''})
                        </td>
                        <td className="p-2.5 text-slate-600 font-mono">
                          {order.dueDate}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          ₹{order.netAmount.toFixed(2)}
                        </td>
                        <td className="p-2.5 font-bold">
                          {order.balanceDue > 0 ? (
                            <span className="text-rose-600">₹{order.balanceDue.toFixed(2)}</span>
                          ) : (
                            <span className="text-emerald-700">₹0.00 (Paid)</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'READY' ? 'bg-sky-100 text-sky-800' :
                            order.status === 'PARTIALLY_DELIVERED' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => {
                              setActiveOrderId(order.id);
                              setActiveView('PICKUP');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-sky-700 border border-slate-300 rounded font-semibold text-[11px] transition"
                          >
                            Open Handover
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customerOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No orders on record for this customer yet. Click "New Drop Order" above to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-lg border border-slate-200 p-8 flex items-center justify-center text-slate-400 text-sm">
            Select a customer from the left to view profile and order history.
          </div>
        )}
      </div>

      {/* Add New Customer Modal */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-sm">Add New Customer</h3>
              </div>
              <button onClick={() => setIsNewCustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newCustMobile}
                    onChange={(e) => setNewCustMobile(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Area / Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 1, Noida"
                    value={newCustArea}
                    onChange={(e) => setNewCustArea(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Delivery Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="House / Flat No, Street, Landmark, Sector / Locality..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">GSTIN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 09AAACQ1234F1Z5"
                    value={newCustGst}
                    onChange={(e) => setNewCustGst(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none text-xs sm:text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">Customer Preferences / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Prefers hanger packing, delicate woolens"
                    value={newCustNotes}
                    onChange={(e) => setNewCustNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditCustModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">Edit Customer Information</h3>
              </div>
              <button 
                onClick={() => setIsEditCustModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={editCustName}
                    onChange={(e) => setEditCustName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mobile Number (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={editCustMobile}
                    onChange={(e) => setEditCustMobile(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={editCustEmail}
                    onChange={(e) => setEditCustEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Locality / Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 50"
                    value={editCustArea}
                    onChange={(e) => setEditCustArea(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Delivery Address</label>
                <textarea
                  rows={2}
                  placeholder="House / Flat No, Street, Landmark..."
                  value={editCustAddress}
                  onChange={(e) => setEditCustAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">GSTIN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 09AAACQ1234F1Z5"
                    value={editCustGst}
                    onChange={(e) => setEditCustGst(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none text-xs sm:text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs">Customer Preferences / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Starch shirts, soft rinse"
                    value={editCustNotes}
                    onChange={(e) => setEditCustNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500 outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditCustModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
