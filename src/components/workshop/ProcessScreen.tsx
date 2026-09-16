import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Workflow, 
  Search, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Package, 
  Truck, 
  AlertTriangle, 
  QrCode, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  Filter,
  Check,
  Flame,
  Wind
} from 'lucide-react';
import { OrderGarmentItem, PressingMethod, PRESSING_METHOD_OPTIONS, DEFAULT_PRESSING_METHOD } from '../../types';

export const ProcessScreen: React.FC = () => {
  const { 
    orders, 
    updateGarmentStatus,
    updateGarmentPressingMethod,
    showToast, 
    setQRTagPreviewModalOpen,
    setActiveOrderId,
    setActiveView 
  } = useApp();

  const [activeQueue, setActiveQueue] = useState<string>('ALL_WORKSHOP');
  const [searchBarcode, setSearchBarcode] = useState<string>('');
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>([]);

  // Collect all garment items across all active orders
  const allWorkshopItems = orders.flatMap(order => 
    order.items.map(item => ({
      ...item,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      dueDate: order.dueDate
    }))
  );

  // Filter based on selected queue tab
  const filteredItems = allWorkshopItems.filter(item => {
    const matchesSearch = 
      item.barcode.toLowerCase().includes(searchBarcode.toLowerCase()) ||
      item.garmentName.toLowerCase().includes(searchBarcode.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchBarcode.toLowerCase()) ||
      item.orderNumber.toString().includes(searchBarcode);

    if (!matchesSearch) return false;

    if (activeQueue === 'ALL_WORKSHOP') return item.status !== 'DELIVERED';
    if (activeQueue === 'RECEIVED') return item.status === 'RECEIVED';
    if (activeQueue === 'PROCESSING') return item.status === 'PROCESSING';
    if (activeQueue === 'PENDING_FINISHING') return item.status === 'PENDING_FINISHING' || item.status === 'FINISHED';
    if (activeQueue === 'PACKED') return item.status === 'PACKED';
    if (activeQueue === 'READY') return item.status === 'READY';

    return true;
  });

  // Handle Quick Stage Advance
  const handleAdvanceStatus = (orderId: string, barcode: string, currentStatus: OrderGarmentItem['status']) => {
    let nextStatus: OrderGarmentItem['status'] = 'PROCESSING';
    if (currentStatus === 'RECEIVED') nextStatus = 'PROCESSING';
    else if (currentStatus === 'PROCESSING') nextStatus = 'PENDING_FINISHING';
    else if (currentStatus === 'PENDING_FINISHING' || currentStatus === 'FINISHED') nextStatus = 'PACKED';
    else if (currentStatus === 'PACKED') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'DELIVERED';

    updateGarmentStatus(orderId, barcode, nextStatus);
    showToast(`Garment ${barcode} advanced to ${nextStatus.replace(/_/g, ' ')}!`, 'success');
  };

  // Toggle Selection
  const toggleSelect = (barcode: string) => {
    if (selectedBarcodes.includes(barcode)) {
      setSelectedBarcodes(selectedBarcodes.filter(b => b !== barcode));
    } else {
      setSelectedBarcodes([...selectedBarcodes, barcode]);
    }
  };

  // Batch Advance
  const handleBatchAdvance = (targetStatus: OrderGarmentItem['status']) => {
    if (selectedBarcodes.length === 0) {
      showToast('Please select at least one garment from the list.', 'warning');
      return;
    }

    selectedBarcodes.forEach(bCode => {
      const found = allWorkshopItems.find(i => i.barcode === bCode);
      if (found) {
        updateGarmentStatus(found.orderId, found.barcode, targetStatus);
      }
    });

    showToast(`Updated ${selectedBarcodes.length} garments to ${targetStatus.replace(/_/g, ' ')}!`, 'success');
    setSelectedBarcodes([]);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Workshop Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between shadow-xs gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Workshop Processing & Stage Queues</h1>
            <p className="text-xs text-slate-500">
              Track garment lifecycle: Received → Processing → Finishing → Packed → Ready for Delivery.
            </p>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2">
          {selectedBarcodes.length > 0 && (
            <div className="flex items-center gap-2 bg-sky-50 px-3 py-1 rounded-md border border-sky-200 text-xs">
              <span className="font-bold text-sky-900">{selectedBarcodes.length} Selected</span>
              <button
                onClick={() => handleBatchAdvance('PACKED')}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-[11px] shadow-2xs"
              >
                Mark Packed
              </button>
              <button
                onClick={() => handleBatchAdvance('READY')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] shadow-2xs"
              >
                Mark Ready
              </button>
            </div>
          )}

          <button
            onClick={() => setQRTagPreviewModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <QrCode className="w-4 h-4 text-sky-400" />
            <span>Print 2R Piece Tags</span>
          </button>
        </div>
      </div>

      {/* Main Workshop Area */}
      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        {/* Queue Navigation Tabs & Barcode Fast Scanner */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 font-bold">
            <button
              onClick={() => setActiveQueue('ALL_WORKSHOP')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeQueue === 'ALL_WORKSHOP'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>All Active ({allWorkshopItems.filter(i => i.status !== 'DELIVERED').length})</span>
            </button>

            <button
              onClick={() => setActiveQueue('RECEIVED')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeQueue === 'RECEIVED'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Received ({allWorkshopItems.filter(i => i.status === 'RECEIVED').length})</span>
            </button>

            <button
              onClick={() => setActiveQueue('PROCESSING')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeQueue === 'PROCESSING'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Processing ({allWorkshopItems.filter(i => i.status === 'PROCESSING').length})</span>
            </button>

            <button
              onClick={() => setActiveQueue('PENDING_FINISHING')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeQueue === 'PENDING_FINISHING'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Pending Finishing ({allWorkshopItems.filter(i => i.status === 'PENDING_FINISHING' || i.status === 'FINISHED').length})</span>
            </button>

            <button
              onClick={() => setActiveQueue('PACKED')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeQueue === 'PACKED'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Packing Queue ({allWorkshopItems.filter(i => i.status === 'PACKED').length})</span>
            </button>

            <button
              onClick={() => setActiveQueue('READY')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                activeQueue === 'READY'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Ready for Delivery ({allWorkshopItems.filter(i => i.status === 'READY').length})</span>
            </button>
          </div>

          {/* Search Scanner Input */}
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Scan Tag (e.g. 4-1-2) or Customer..."
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Garment Workshop Queue Table */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedBarcodes.length === filteredItems.length && filteredItems.length > 0}
                      onChange={() => {
                        if (selectedBarcodes.length === filteredItems.length) {
                          setSelectedBarcodes([]);
                        } else {
                          setSelectedBarcodes(filteredItems.map(i => i.barcode));
                        }
                      }}
                      className="rounded text-sky-600"
                    />
                  </th>
                  <th className="p-3">Garment & Barcode Tag</th>
                  <th className="p-3">Customer & Order</th>
                  <th className="p-3">Service & Add-ons</th>
                  <th className="p-3">Pressing Method</th>
                  <th className="p-3">Defects & Remarks</th>
                  <th className="p-3">Target Due Date</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Workshop Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const isChecked = selectedBarcodes.includes(item.barcode);
                  const currentPressing = item.pressingMethod || 'Iron Press';
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50/80 transition ${isChecked ? 'bg-sky-50/50' : ''}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(item.barcode)}
                          className="rounded text-sky-600"
                        />
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{item.garmentName}</span>
                        </div>
                        <div className="font-mono text-[11px] font-bold text-sky-700 mt-0.5">
                          Tag: {item.barcode}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-800">{item.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Order #{item.orderNumber}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-slate-800">{item.serviceName} ({item.serviceCode})</span>
                        {item.subServices.length > 0 && (
                          <div className="text-[10px] text-purple-700 font-medium">
                            +{item.subServices.map(s => s.name).join(', ')}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={currentPressing}
                            onChange={(e) => updateGarmentPressingMethod(item.orderId, item.barcode, e.target.value as PressingMethod)}
                            className={`text-[11px] font-bold px-2 py-1 rounded border outline-none cursor-pointer transition ${
                              currentPressing === 'Steam Press'
                                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                                : currentPressing === 'Iron Press'
                                  ? 'bg-blue-50 text-blue-900 border-blue-300 font-bold'
                                  : 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold'
                            }`}
                          >
                            {PRESSING_METHOD_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="p-3">
                        {item.remarks.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.remarks.map((r, i) => (
                              <span key={i} className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No defects noted</span>
                        )}
                      </td>

                      <td className="p-3 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                        {item.dueDate}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'PACKED' ? 'bg-purple-100 text-purple-800' :
                          item.status === 'PENDING_FINISHING' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleAdvanceStatus(item.orderId, item.barcode, item.status)}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-[11px] shadow-2xs inline-flex items-center gap-1 transition"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400 text-xs">
                      No garments currently in the selected queue. All garments are moving on schedule.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
