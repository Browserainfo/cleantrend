import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Tag, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { printHtmlContent } from '../../utils/printUtils';

export const ReportsScreen: React.FC = () => {
  const { orders, customers, businessSettings, showToast } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<string>('DAILY_COLLECTION');
  const [dateRange, setDateRange] = useState<string>('THIS_MONTH');

  // Compute key totals
  const totalSales = orders.reduce((sum, o) => sum + o.netAmount, 0);
  const totalGross = orders.reduce((sum, o) => sum + o.grossAmount, 0);
  const totalTax = orders.reduce((sum, o) => sum + o.taxAmount, 0);
  const totalDiscount = orders.reduce((sum, o) => sum + o.discountAmount, 0);
  const totalOutstanding = orders.reduce((sum, o) => sum + o.balanceDue, 0);
  const totalGarments = orders.reduce((sum, o) => sum + o.totalPieces, 0);

  // Garment stats calculation
  const garmentStatsMap: { [name: string]: { count: number; revenue: number } } = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!garmentStatsMap[item.garmentName]) {
        garmentStatsMap[item.garmentName] = { count: 0, revenue: 0 };
      }
      garmentStatsMap[item.garmentName].count += item.quantity;
      garmentStatsMap[item.garmentName].revenue += item.totalItemPrice * item.quantity;
    });
  });

  const garmentStats = Object.entries(garmentStatsMap).map(([name, data]) => ({
    name,
    count: data.count,
    revenue: data.revenue
  })).sort((a, b) => b.count - a.count);

  const handleExportCSV = () => {
    showToast(`Exported ${activeReportTab.replace(/_/g, ' ')} report as CSV spreadsheet.`, 'success');
  };

  const handlePrintReport = () => {
    const reportHtml = `
      <div style="font-family: Arial, sans-serif; color: #000; padding: 15px;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">${businessSettings.businessName}</h2>
          <div style="font-size: 12px; color: #555;">${businessSettings.branchName} • ${businessSettings.address}</div>
          <h3 style="margin: 8px 0 0 0; font-size: 14px;">${activeReportTab.replace(/_/g, ' ')} REPORT (${dateRange})</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; background: #f4f4f4; padding: 10px; border: 1px solid #ddd;">
          <div><small>Total Sales:</small><br/><strong>Rs. ${totalSales.toFixed(2)}</strong></div>
          <div><small>Gross Amount:</small><br/><strong>Rs. ${totalGross.toFixed(2)}</strong></div>
          <div><small>Total Orders:</small><br/><strong>${orders.length}</strong></div>
          <div><small>Outstanding Due:</small><br/><strong>Rs. ${totalOutstanding.toFixed(2)}</strong></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #eee; border-bottom: 2px solid #333;">
              <th style="padding: 6px; text-align: left;">Order #</th>
              <th style="padding: 6px; text-align: left;">Customer</th>
              <th style="padding: 6px; text-align: left;">Pieces</th>
              <th style="padding: 6px; text-align: right;">Net (Rs.)</th>
              <th style="padding: 6px; text-align: right;">Due (Rs.)</th>
              <th style="padding: 6px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 6px;">#${o.orderNumber}</td>
                <td style="padding: 6px;">${o.customerName} (${o.customerMobile})</td>
                <td style="padding: 6px;">${o.totalPieces} Pcs</td>
                <td style="padding: 6px; text-align: right;">${o.netAmount.toFixed(2)}</td>
                <td style="padding: 6px; text-align: right; font-weight: bold;">${o.balanceDue.toFixed(2)}</td>
                <td style="padding: 6px; text-align: center;">${o.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #777;">
          Report generated on ${new Date().toLocaleString()} by ${businessSettings.businessName || 'POS & CRM'}.
        </div>
      </div>
    `;

    printHtmlContent(reportHtml, {
      title: `${activeReportTab}_Report_${dateRange}`
    });
    showToast('Sent report to real browser/system print dialog.', 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden select-none">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between shadow-xs gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Business Reports & Operational Analytics</h1>
            <p className="text-xs text-slate-500">
              Audited reports: Daily collections, Sales & GST, Outstanding balances, and Garment volumes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Metric Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Gross Billing</div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">₹{totalGross.toFixed(2)}</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Orders</div>
            <div className="text-base font-bold text-slate-800 mt-1 font-mono">{orders.length} Orders</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 shadow-xs">
            <div className="text-[11px] font-bold text-rose-700 uppercase">Discounts</div>
            <div className="text-base font-bold text-rose-700 mt-1 font-mono">₹{totalDiscount.toFixed(2)}</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-900 uppercase">Net Revenue</div>
            <div className="text-base font-extrabold text-sky-950 mt-1 font-mono">₹{totalSales.toFixed(2)}</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-amber-200 bg-amber-50/30 shadow-xs">
            <div className="text-[11px] font-bold text-amber-800 uppercase">Outstanding Dues</div>
            <div className="text-base font-bold text-amber-800 mt-1 font-mono">₹{totalOutstanding.toFixed(2)}</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Garments Handled</div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">{totalGarments} Pcs</div>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 font-bold">
            <button
              onClick={() => setActiveReportTab('DAILY_COLLECTION')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeReportTab === 'DAILY_COLLECTION'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily Collections
            </button>

            <button
              onClick={() => setActiveReportTab('SALES_REGISTER')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeReportTab === 'SALES_REGISTER'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sales Register
            </button>

            <button
              onClick={() => setActiveReportTab('OUTSTANDING_BALANCES')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeReportTab === 'OUTSTANDING_BALANCES'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Outstanding Aging
            </button>

            <button
              onClick={() => setActiveReportTab('DISCOUNT_AUDIT')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeReportTab === 'DISCOUNT_AUDIT'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Discount & Price Exceptions
            </button>

            <button
              onClick={() => setActiveReportTab('GARMENT_VOLUME')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeReportTab === 'GARMENT_VOLUME'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Garment & Service Volumes
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="p-1 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 font-medium"
            >
              <option value="TODAY">Today (27 Nov 2025)</option>
              <option value="THIS_WEEK">This Week (13 Nov - 27 Nov)</option>
              <option value="THIS_MONTH">This Month (Nov 2025)</option>
              <option value="ALL_TIME">All Financial Records</option>
            </select>
          </div>
        </div>

        {/* Report Content Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {activeReportTab === 'DAILY_COLLECTION' && (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Receipt Time</th>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Collected By</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.flatMap(o => o.payments.map(p => ({ ...p, oNum: o.orderNumber, cName: o.customerName }))).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-600">{new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-3 font-bold font-mono text-sky-700">#{p.oNum}</td>
                      <td className="p-3 font-bold text-slate-900">{p.cName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.channel}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-800">{p.paymentMethod}</td>
                      <td className="p-3 text-slate-600">{p.collectedBy}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 text-right">₹{p.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportTab === 'SALES_REGISTER' && (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Gross</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3">Net Total</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold font-mono text-sky-700">#{o.orderNumber}</td>
                      <td className="p-3 font-mono text-slate-600">{o.orderDate}</td>
                      <td className="p-3 font-bold text-slate-900">{o.customerName}</td>
                      <td className="p-3 font-mono">₹{o.grossAmount.toFixed(2)}</td>
                      <td className="p-3 font-mono text-rose-600">₹{o.discountAmount.toFixed(2)}</td>
                      <td className="p-3 font-mono font-bold text-sky-950">₹{o.netAmount.toFixed(2)}</td>
                      <td className="p-3 font-mono font-bold text-rose-700">₹{o.balanceDue.toFixed(2)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportTab === 'OUTSTANDING_BALANCES' && (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Mobile Number</th>
                    <th className="p-3">Area</th>
                    <th className="p-3">Pending Orders</th>
                    <th className="p-3 font-bold text-rose-700 text-right">Balance Due (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.filter(c => c.outstandingAmount > 0).map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 font-mono text-slate-600">{c.mobile}</td>
                      <td className="p-3 text-slate-600">{c.area}</td>
                      <td className="p-3 font-bold text-slate-800">{c.pendingOrdersCount} orders</td>
                      <td className="p-3 font-mono font-bold text-rose-700 text-right text-sm">
                        ₹{c.outstandingAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportTab === 'GARMENT_VOLUME' && (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Garment Item Name</th>
                    <th className="p-3">Quantity Cleaned</th>
                    <th className="p-3 text-right">Generated Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {garmentStats.map((stat, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{stat.name}</td>
                      <td className="p-3 font-bold font-mono text-sky-700">{stat.count} Pcs</td>
                      <td className="p-3 font-mono font-bold text-slate-900 text-right">₹{stat.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReportTab === 'DISCOUNT_AUDIT' && (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Discount Granted</th>
                    <th className="p-3">Reason Provided</th>
                    <th className="p-3">Audited Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.filter(o => o.discountAmount > 0).map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold font-mono text-sky-700">#{o.orderNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{o.customerName}</td>
                      <td className="p-3 font-mono font-bold text-rose-700">
                        {o.discountPercent}% (₹{o.discountAmount.toFixed(2)})
                      </td>
                      <td className="p-3 text-slate-700 italic">"{o.discountReason || 'Promotional waiver'}"</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Admin Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
