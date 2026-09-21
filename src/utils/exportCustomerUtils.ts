import * as XLSX from 'xlsx';
import { Customer, Order, BusinessSettings } from '../types';

/**
 * Generates and downloads a clean, beautifully formatted .xlsx file containing
 * all customer records with the latest CRM data, order summaries, payments, and balances.
 */
export function exportCustomersToExcel(
  customers: Customer[],
  orders: Order[],
  businessSettings?: BusinessSettings
): { success: boolean; count: number; filename: string } {
  if (!customers || customers.length === 0) {
    throw new Error('No customer records available to export.');
  }

  // Map each customer to a comprehensive data row
  const rows = customers.map((cust, index) => {
    // Find all matching orders for this customer to calculate live totals
    const customerOrders = orders.filter(
      o => o.customerId === cust.id || (cust.mobile && o.customerMobile === cust.mobile)
    );

    const totalOrdersCount = Math.max(customerOrders.length, cust.totalOrdersCount || 0);
    const pendingOrdersCount = customerOrders.filter(
      o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
    ).length;
    const deliveredOrdersCount = customerOrders.filter(o => o.status === 'DELIVERED').length;

    const totalBilled = customerOrders.reduce(
      (sum, o) => sum + (Number(o.netAmount) || 0),
      0
    );

    const totalPaid = customerOrders.reduce((sum, o) => {
      const net = Number(o.netAmount) || 0;
      const bal = Number(o.balanceDue) || 0;
      const paid = Math.max(0, net - bal);
      return sum + paid;
    }, 0);

    const balanceDue = Number(cust.outstandingAmount ?? 0);
    const adjustmentBalance = Number(cust.adjustmentBalance ?? 0);

    // Formatted created date
    let formattedCreatedDate = cust.createdAt || '';
    if (cust.createdAt) {
      const d = new Date(cust.createdAt);
      if (!isNaN(d.getTime())) {
        formattedCreatedDate = d.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }

    return {
      'S.No': index + 1,
      'Customer ID': cust.custCode || `Cust-${index + 1}`,
      'Customer Name': cust.name || '',
      'Phone / Mobile': cust.mobile || '',
      'Email': cust.email || '',
      'Address': cust.address || '',
      'Area / Sector': cust.area || '',
      'Place of Supply': cust.placeOfSupply || '',
      'GSTIN': cust.gstNumber || '',
      'Total Orders': totalOrdersCount,
      'Pending Orders': pendingOrdersCount,
      'Delivered Orders': deliveredOrdersCount,
      'Total Billed (₹)': Math.round(totalBilled * 100) / 100,
      'Total Paid (₹)': Math.round(totalPaid * 100) / 100,
      'Balance Due (₹)': Math.round(balanceDue * 100) / 100,
      'Adjustment Balance (₹)': Math.round(adjustmentBalance * 100) / 100,
      'Last Visit': cust.lastVisit || '',
      'Customer Notes': cust.notes || '',
      'Registration Date': formattedCreatedDate
    };
  });

  // Create worksheet from json data
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Define sensible column widths for high readability
  worksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 14 }, // Customer ID
    { wch: 24 }, // Customer Name
    { wch: 16 }, // Phone / Mobile
    { wch: 28 }, // Email
    { wch: 36 }, // Address
    { wch: 18 }, // Area / Sector
    { wch: 18 }, // Place of Supply
    { wch: 18 }, // GSTIN
    { wch: 14 }, // Total Orders
    { wch: 15 }, // Pending Orders
    { wch: 16 }, // Delivered Orders
    { wch: 16 }, // Total Billed (₹)
    { wch: 16 }, // Total Paid (₹)
    { wch: 16 }, // Balance Due (₹)
    { wch: 20 }, // Adjustment Balance (₹)
    { wch: 16 }, // Last Visit
    { wch: 35 }, // Customer Notes
    { wch: 18 }  // Registration Date
  ];

  // Create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

  // Generate safe dynamic filename with current timestamp
  const dateStr = new Date().toISOString().slice(0, 10);
  const rawStoreName = businessSettings?.displayName || businessSettings?.businessName || 'Trendera';
  const cleanStoreName = rawStoreName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${cleanStoreName}_Customers_${dateStr}.xlsx`;

  // Write file to binary buffer and trigger browser download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return {
    success: true,
    count: customers.length,
    filename
  };
}
