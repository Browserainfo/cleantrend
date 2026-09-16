import { Order, OrderGarmentItem, BusinessSettings } from '../types';
import { printPiece2RTags, generatePieceTagsForOrder } from './pieceTagUtils';

export interface PrintDocumentOptions {
  title?: string;
  styles?: string;
  targetWindow?: Window | null;
}

/**
 * Universal printing helper that triggers the real browser / system printing dialog.
 * Works inside iframes, modals, popups, and full windows.
 */
export const printHtmlContent = (htmlContent: string, options: PrintDocumentOptions = {}): boolean => {
  const title = options.title || 'Print Document';

  try {
    // 1. Create an isolated hidden iframe dedicated to printing
    const iframeId = 'cleanera-print-frame';
    let printIframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    
    if (printIframe && printIframe.parentNode) {
      printIframe.parentNode.removeChild(printIframe);
    }

    printIframe = document.createElement('iframe');
    printIframe.id = iframeId;
    printIframe.name = iframeId;
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = 'none';
    printIframe.style.visibility = 'hidden';
    printIframe.style.zIndex = '-9999';

    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document || printIframe.contentDocument;
    if (!doc) {
      // Fallback: Trigger direct window print if iframe document cannot be accessed
      window.print();
      return true;
    }

    const defaultPrintCss = `
      @page {
        size: auto;
        margin: 5mm;
      }
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: 'Courier New', Courier, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        line-height: 1.3;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      .no-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .barcode-box {
        display: inline-block;
        font-family: monospace;
        font-weight: 900;
        letter-spacing: 2px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 4px;
        text-align: left;
      }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .font-bold { font-weight: bold; }
      .border-b { border-bottom: 1px solid #333; }
      .border-t { border-top: 1px solid #333; }
      .border-dashed { border-style: dashed; }
      ${options.styles || ''}
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title}</title>
          <style>${defaultPrintCss}</style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // Give browser time to parse CSS and render SVGs/fonts before triggering print
    setTimeout(() => {
      try {
        if (printIframe && printIframe.contentWindow) {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
        } else {
          window.print();
        }
      } catch (err) {
        console.warn('Iframe print error, falling back to window.print():', err);
        window.print();
      }

      // Cleanup iframe after printing completes
      setTimeout(() => {
        if (printIframe && printIframe.parentNode) {
          printIframe.parentNode.removeChild(printIframe);
        }
      }, 3000);
    }, 250);

    return true;
  } catch (error) {
    console.error('Print execution failed:', error);
    window.print();
    return true;
  }
};

/**
 * 1. Physical 2R Code / Piece Tag Printing
 * Formatted for compact garment tags (1.5" x 1.12" / 38mm x 28mm) with piece-level unique codes and -1 day delivery date rule
 */
export const printGarmentQRTags = (
  order: Order,
  selectedBarcodes: string[],
  businessSettings: BusinessSettings
): boolean => {
  const allTags = generatePieceTagsForOrder(order, businessSettings);
  const selectedTagIds = allTags
    .filter(t => selectedBarcodes.includes(t.barcode) || selectedBarcodes.includes(t.id))
    .map(t => t.id);

  return printPiece2RTags(
    order,
    businessSettings,
    selectedTagIds.length > 0 ? selectedTagIds : undefined,
    'THERMAL_ROLL'
  );
};

/**
 * 2. 80mm POS Thermal Receipt Printing
 */
export const printThermalBookingReceipt = (
  order: Order,
  businessSettings: BusinessSettings
): boolean => {
  const maskPhone = (phone: string) => {
    if (!businessSettings.maskPhoneOnThermalReceipt) return phone;
    if (phone.length <= 4) return phone;
    return '••••••' + phone.slice(-4);
  };

  const receiptHtml = `
    <div style="
      width: 300px;
      margin: 0 auto;
      padding: 10px;
      font-family: 'Courier New', Courier, monospace;
      color: #000;
      background: #fff;
      font-size: 11px;
      line-height: 1.35;
    ">
      <!-- Store Header -->
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px;">
        <div style="font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
          ${businessSettings.businessName}
        </div>
        <div style="font-size: 11px; font-weight: bold;">${businessSettings.branchName}</div>
        <div style="font-size: 9.5px; color: #444;">${businessSettings.address}</div>
        <div style="font-size: 9.5px; font-weight: bold;">Phone: ${businessSettings.phone}</div>
        <div style="font-size: 9.5px; color: #555; font-style: italic; margin-top: 3px;">${businessSettings.marketingMessage}</div>
      </div>

      <!-- Order & Due Info -->
      <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #666; padding-bottom: 6px; margin-bottom: 6px; font-size: 10.5px;">
        <div>
          <div>Order: <strong style="font-size: 13px;">#${order.orderNumber}</strong></div>
          <div>Date: ${order.orderDate}</div>
        </div>
        <div style="text-align: right;">
          <div>Due: <strong style="font-size: 11px;">${order.dueDate}</strong></div>
          <div>Series: ${order.orderSeries}</div>
        </div>
      </div>

      <!-- Customer Details -->
      <div style="border-bottom: 1px dashed #666; padding-bottom: 6px; margin-bottom: 6px; font-size: 10.5px;">
        <div>Cust: <strong style="text-transform: capitalize;">${order.customerName}</strong></div>
        <div>Mobile: ${maskPhone(order.customerMobile)}</div>
        <div>Address: ${order.customerAddress || 'N/A'}</div>
        <div>POS: ${order.customerPlaceOfSupply || 'State'}</div>
      </div>

      <!-- Garment Items Breakdown -->
      <div style="border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 6px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px;">
          <thead>
            <tr style="border-bottom: 1px solid #333; text-transform: uppercase; font-size: 9.5px;">
              <th style="text-align: left; padding: 2px 0;">Item & Service</th>
              <th style="text-align: right; padding: 2px 0;">Amt (Rs)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, idx) => `
              <tr>
                <td style="padding: 3px 0;">
                  <strong>${idx + 1}. ${item.garmentName}</strong>
                  <div style="font-size: 9px; color: #444; padding-left: 8px;">
                    ${item.serviceName} • ${item.pressingMethod || 'Iron Press'} • Barcode: ${item.barcode}
                  </div>
                  ${item.brand ? `<div style="font-size: 9px; color: #222; padding-left: 8px;">Brand: ${item.brand}</div>` : ''}
                  ${item.remarks?.length ? `<div style="font-size: 9px; color: #555; font-style: italic; padding-left: 8px;">Remarks: ${item.remarks.join(', ')}</div>` : ''}
                </td>
                <td style="text-align: right; vertical-align: top; padding: 3px 0; font-weight: bold;">
                  ${item.totalItemPrice.toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Financial Calculation -->
      <div style="border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px; font-size: 10.5px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Total Pieces / Weight:</span>
          <strong>${order.totalPieces} Pcs ${order.totalWeightKg ? `(${order.totalWeightKg} kg)` : ''}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Items Subtotal:</span>
          <span>Rs. ${order.grossAmount.toFixed(2)}</span>
        </div>
        ${order.deliveryCharge && order.deliveryCharge > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Delivery / Pick&Drop Fee:</span>
            <span>+Rs. ${order.deliveryCharge.toFixed(2)}</span>
          </div>
        ` : ''}
        ${order.surchargeAmount && order.surchargeAmount > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Express Surcharge (${order.surchargeType}):</span>
            <span>+Rs. ${order.surchargeAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${order.discountAmount && order.discountAmount > 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Discount (${order.discountPercent}%):</span>
            <span>-Rs. ${order.discountAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${order.roundOff !== 0 ? `
          <div style="display: flex; justify-content: space-between;">
            <span>Round Off:</span>
            <span>${order.roundOff.toFixed(2)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #888; padding-top: 3px; font-weight: bold;">
          <span>Net Amount:</span>
          <span>Rs. ${order.netAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Advance Paid:</span>
          <span>Rs. ${order.advancePaid.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 2px solid #000; padding-top: 4px; font-size: 13px; font-weight: 900;">
          <span>Balance Due:</span>
          <span>Rs. ${order.balanceDue.toFixed(2)}</span>
        </div>
      </div>

      <!-- QR Code & Barcode Representation -->
      <div style="text-align: center; margin-top: 8px;">
        <div style="display: inline-block; padding: 6px; border: 1px solid #000; margin-bottom: 4px;">
          <!-- SVG QR Code Icon -->
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="5" height="5" x="3" y="3" rx="1"/>
            <rect width="5" height="5" x="16" y="3" rx="1"/>
            <rect width="5" height="5" x="3" y="16" rx="1"/>
            <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
            <path d="M21 21v.01"/>
            <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
            <path d="M3 12h.01"/>
            <path d="M12 3h.01"/>
            <path d="M12 16v.01"/>
            <path d="M16 12h1"/>
            <path d="M21 12v.01"/>
            <path d="M12 21v-1"/>
          </svg>
        </div>
        <div style="font-size: 9px; font-weight: bold; letter-spacing: 2px;">${order.items[0]?.barcode || ('ORD-' + order.orderNumber)}</div>
        <div style="font-size: 8px; color: #333; margin-top: 6px; line-height: 1.35; border-top: 1px solid #ddd; padding-top: 4px;">${businessSettings.receiptFooterMessage || 'Thank You for choosing Cleanera Dry Cleaning CRM. All garments are carefully inspected before processing. We are not responsible for any article left uncollected after 15 days from the due date. We are not responsible for any damage that may occur during the cleaning process.'}</div>
      </div>
    </div>
  `;

  return printHtmlContent(receiptHtml, {
    title: `Receipt-Order-${order.orderNumber}`,
    styles: `
      @page { size: 80mm auto; margin: 3mm; }
    `
  });
};

/**
 * 3. Customer Pickup & Delivery Handover Confirmation Slip
 */
export const printHandoverDeliverySlip = (
  handoverData: {
    orderNumber: number;
    customerName: string;
    customerMobile: string;
    totalPieces: number;
    collectedAmt: number;
    timestamp: string;
    staffName: string;
    barcodes?: string[];
  },
  businessSettings: BusinessSettings
): boolean => {
  const slipHtml = `
    <div style="
      width: 320px;
      margin: 0 auto;
      padding: 12px;
      border: 2px solid #000;
      font-family: 'Courier New', Courier, monospace;
      color: #000;
      background: #fff;
      font-size: 11px;
    ">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px;">
        <div style="font-size: 14px; font-weight: 900; text-transform: uppercase;">
          ${businessSettings.businessName}
        </div>
        <div style="font-size: 11px; font-weight: bold; text-decoration: underline;">
          CUSTOMER PICKUP & DELIVERY SLIP
        </div>
        <div style="font-size: 9px; color: #444;">${businessSettings.branchName} • Phone: ${businessSettings.phone}</div>
      </div>

      <div style="margin-bottom: 8px; font-size: 11px; line-height: 1.4;">
        <div><strong>Order No:</strong> #${handoverData.orderNumber}</div>
        <div><strong>Customer:</strong> ${handoverData.customerName}</div>
        <div><strong>Mobile:</strong> ${handoverData.customerMobile}</div>
        <div><strong>Delivered Pieces:</strong> <strong>${handoverData.totalPieces} Garments</strong></div>
        ${handoverData.collectedAmt > 0 ? `
          <div><strong>Payment Settled:</strong> Rs. ${handoverData.collectedAmt.toFixed(2)}</div>
        ` : '<div><strong>Payment Status:</strong> Fully Paid / Nil Due</div>'}
        <div><strong>Handed Over At:</strong> ${handoverData.timestamp}</div>
        <div><strong>Counter Staff:</strong> ${handoverData.staffName}</div>
      </div>

      ${handoverData.barcodes && handoverData.barcodes.length > 0 ? `
        <div style="border-top: 1px dashed #666; border-bottom: 1px dashed #666; padding: 4px 0; margin-bottom: 8px; font-size: 10px;">
          <strong>Delivered Barcodes:</strong><br/>
          ${handoverData.barcodes.join(', ')}
        </div>
      ` : ''}

      <div style="margin-top: 24px; padding-top: 6px; border-top: 1px solid #000; text-align: center; font-size: 10px;">
        <div style="margin-bottom: 20px;"></div>
        <div>______________________________________</div>
        <strong>Customer Signature / Received in Good Condition</strong>
      </div>
    </div>
  `;

  return printHtmlContent(slipHtml, {
    title: `Pickup-Slip-Order-${handoverData.orderNumber}`,
    styles: `@page { size: 80mm auto; margin: 4mm; }`
  });
};
