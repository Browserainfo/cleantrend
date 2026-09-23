import { Order, Customer, BusinessSettings, WhatsAppMessage, EmailMessage, WhatsAppTriggerType } from '../types';
import { normalizeIndianPhoneNumber } from '../utils/phoneUtils';
import { buildPublicReceiptUrl, formatWhatsAppDueDate } from '../utils/portalUrlUtils';
import { generateOrderUpiQr } from '../utils/upiQrUtils';

export interface NotificationDispatchResult {
  whatsAppResult: {
    success: boolean;
    message?: WhatsAppMessage;
    error?: string;
  };
  emailResult: {
    success: boolean;
    message?: EmailMessage;
    error?: string;
    skipped?: boolean;
  };
}

/**
 * Resolves the full accessible URL to the payment QR scanner image.
 * Handles relative paths (e.g. /payment-qr.jpg), full URLs, and data URIs,
 * ensuring it is accessible across web origins and WhatsApp links.
 */
export function resolveAbsoluteQrUrl(qrUrl?: string, settings?: BusinessSettings): string {
  if (!qrUrl || !qrUrl.trim()) return '';
  const cleanUrl = qrUrl.trim();

  // Return directly if already fully qualified or data-URI
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }

  // Client-side execution (browser environment)
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    return `${origin}${path}`;
  }

  // Server-side execution or fallback to configured onlinePortalDomain / APP_URL
  const configuredDomain = (
    (typeof process !== 'undefined' && process.env?.APP_URL) ||
    settings?.onlinePortalDomain ||
    'https://cleanera.app'
  ).replace(/\/+$/, '');
  const path = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  return `${configuredDomain}${path}`;
}

/**
 * Resolves the dynamic Store Name from Admin Settings for WhatsApp messages and customer communications.
 * Strictly guarantees that "Cleanera" is never present, and uses the exact Store Name configured in Admin Settings.
 */
export function getEffectiveStoreName(settings?: BusinessSettings): string {
  if (!settings) return 'Trendera';

  const rawCandidate = (
    settings.storeName?.trim() ||
    settings.businessName?.trim() ||
    settings.displayName?.trim() ||
    'Trendera'
  );

  // Remove "Cleanera" completely from the store name
  let cleaned = rawCandidate.replace(/Cleanera/gi, '').trim();

  // If starts with or equals Trendera (case-insensitive), normalize to 'Trendera'
  if (/^trendera\b/i.test(cleaned)) {
    return 'Trendera';
  }

  // If candidate had generic CRM or legal suffixes appended (e.g. "Acme Dry Cleaning CRM"), clean it up
  cleaned = cleaned.replace(/\s*(?:Dry\s+Cleaning|CRM|Services|Pvt|Ltd|Private|Limited).*$/i, '').trim();

  return cleaned || 'Trendera';
}

/**
 * Builds the exact dynamic WhatsApp order confirmation message.
 * Adheres strictly to the user-specified format:
 *
 * <StoreName>
 *
 * Hi <Customer>, Your order #<Number> is registered.
 * Amt: Rs. <Amount>
 * Qty: <Quantity> Pcs
 * Due Date: <DD Mon YYYY>
 * Receipt: <ReceiptURL>
 *
 * We will inform you in case the order is updated after in-store inspection.
 *
 * Thanks,
 * Team <StoreName>
 *
 * Note: Please save our number to activate the Receipt link.
 */
export function buildOrderWhatsAppMessage(
  order: Order,
  customer: Customer,
  businessSettings: BusinessSettings,
  _customQrUrl?: string
): string {
  const custName = (customer?.name || order.customerName || '').trim();
  const orderNumber = order.orderNumber;
  const garmentsCount = order.totalPieces || (order.items ? order.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1);
  const totalAmount = Math.round(order.netAmount || 0);
  const formattedDueDate = formatWhatsAppDueDate(order.dueDate);
  const receiptUrl = order.receiptUrl || buildPublicReceiptUrl(order, businessSettings);

  const storeName = getEffectiveStoreName(businessSettings);

  const greeting = custName && custName !== 'Customer' && custName !== 'Walk-in'
    ? `Hi ${custName}, Your order #${orderNumber} is registered.`
    : `Hi, Your order #${orderNumber} is registered.`;

  const lines = [
    storeName,
    '',
    greeting,
    `Amt: Rs. ${totalAmount}`,
    `Qty: ${garmentsCount} Pcs`,
    `Due Date: ${formattedDueDate}`,
    `Receipt: ${receiptUrl}`,
    '',
    `We will inform you in case the order is updated after in-store inspection.`,
    '',
    `Thanks,`,
    `Team ${storeName}`,
    '',
    `Note: Please save our number to activate the Receipt link.`
  ];

  return lines.join('\n');
}

/**
 * Builds the WhatsApp message specifically for resending the Payment Link.
 * Includes Order number, amount, balance due, and the online invoice/payment URL.
 */
export function buildPaymentLinkWhatsAppMessage(
  order: Order,
  customer: Customer,
  businessSettings: BusinessSettings
): string {
  const custName = (customer?.name || order.customerName || '').trim();
  const orderNumber = order.orderNumber;
  const garmentsCount = order.totalPieces || (order.items ? order.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1);
  const totalAmount = Math.round(order.netAmount || 0);
  const balanceDue = Math.round(order.balanceDue || 0);
  const formattedDueDate = formatWhatsAppDueDate(order.dueDate);
  const receiptUrl = order.receiptUrl || buildPublicReceiptUrl(order, businessSettings);
  const storeName = getEffectiveStoreName(businessSettings);

  const greeting = custName && custName !== 'Customer' && custName !== 'Walk-in'
    ? `Hi ${custName}, here is your payment link for Order #${orderNumber}.`
    : `Hi, here is your payment link for Order #${orderNumber}.`;

  const lines = [
    storeName,
    '',
    greeting,
    `Amt: Rs. ${totalAmount}`,
    balanceDue > 0 ? `Balance Due: Rs. ${balanceDue}` : `Payment: Fully Paid`,
    `Qty: ${garmentsCount} Pcs`,
    `Due Date: ${formattedDueDate}`,
    `Pay Online / View Receipt: ${receiptUrl}`,
    '',
    balanceDue > 0
      ? `Please use the link above to pay securely via UPI, QR Scanner, or Net Banking.`
      : `Thank you for your business! You can view and download your invoice using the link above.`,
    '',
    `Thanks,`,
    `Team ${storeName}`,
    '',
    `Note: Please save our number to activate the link.`
  ];

  return lines.join('\n');
}

/**
 * Builds the dynamic Email Order Confirmation (Subject, HTML, and Text).
 */
export function buildOrderEmailConfirmation(
  order: Order,
  customer: Customer,
  businessSettings: BusinessSettings
): { subject: string; bodyHtml: string; bodyText: string } {
  const customerName = customer.name || order.customerName || 'Customer';
  const orderNumber = order.orderNumber;
  const bizName = businessSettings.businessName || businessSettings.displayName || 'Dry Cleaners';
  const subject = `${bizName} - Order Confirmation #${orderNumber}`;

  // Build items rows
  const itemsRowsHtml = (order.items || []).map((item, idx) => {
    const subServicesList = item.subServices && item.subServices.length > 0
      ? `<div style="font-size: 11px; color: #6b21a8; margin-top: 2px;">Add-ons: ${item.subServices.map(s => `${s.name} (+₹${s.price})`).join(', ')}</div>`
      : '';
    const remarksList = item.remarks && item.remarks.length > 0
      ? `<div style="font-size: 11px; color: #475569; font-style: italic; margin-top: 2px;">Remarks: ${item.remarks.join(', ')}</div>`
      : '';
    const brandText = item.brand
      ? `<div style="font-size: 11px; color: #2563eb;">Brand: ${item.brand}</div>`
      : '';
    const pressingText = item.pressingMethod
      ? `<span style="display: inline-block; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #0369a1;">${item.pressingMethod}</span>`
      : '<span style="color: #64748b; font-size: 11px;">Standard</span>';

    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; text-align: center; color: #64748b; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 10px 8px;">
          <div style="font-weight: bold; color: #0f172a; font-size: 13px;">${item.garmentName}</div>
          <div style="color: #475569; font-size: 12px;">Service: <strong>${item.serviceName}</strong></div>
          ${brandText}
          ${subServicesList}
          ${remarksList}
        </td>
        <td style="padding: 10px 8px; text-align: center;">
          ${pressingText}
        </td>
        <td style="padding: 10px 8px; text-align: center; font-weight: bold; color: #0f172a;">${item.quantity}</td>
        <td style="padding: 10px 8px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">₹${(item.totalItemPrice * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const itemsTextList = (order.items || []).map((item, idx) => {
    return `${idx + 1}. ${item.garmentName} | Service: ${item.serviceName} | Pressing: ${item.pressingMethod || 'Standard'} | Qty: ${item.quantity} | Amount: ₹${(item.totalItemPrice * item.quantity).toFixed(2)}`;
  }).join('\n');

  const bodyHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; line-height: 1.5;">
        <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <div style="background-color: #0284c7; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${bizName}</h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">${businessSettings.branchName || 'Order Confirmation & Care Notification'}</p>
          </div>

          <!-- Customer Greeting & Order Meta -->
          <div style="padding: 24px;">
            <p style="font-size: 15px; margin-top: 0; color: #0f172a;">Hello <strong>${customerName}</strong>,</p>
            <p style="color: #334155; font-size: 14px;">
              Thank you for trusting <strong>${businessSettings.businessName}</strong> with your garment care! Your dry cleaning / laundry order has been booked successfully at our counter.
            </p>

            <!-- Order Highlight Box -->
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0; display: flex; justify-content: space-between; flex-wrap: wrap;">
              <div style="margin-bottom: 8px; min-width: 140px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #0284c7; font-weight: bold;">Order Number</div>
                <div style="font-size: 18px; font-weight: 800; color: #0c4a6e;">#${orderNumber}</div>
              </div>
              <div style="margin-bottom: 8px; min-width: 140px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #0284c7; font-weight: bold;">Order Date</div>
                <div style="font-size: 14px; font-weight: bold; color: #0c4a6e;">${order.orderDate}</div>
              </div>
              <div style="margin-bottom: 8px; min-width: 140px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #0284c7; font-weight: bold;">Expected Due Date</div>
                <div style="font-size: 14px; font-weight: bold; color: #0369a1;">${order.dueDate}</div>
              </div>
              <div style="margin-bottom: 8px; min-width: 140px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #0284c7; font-weight: bold;">Place of Supply</div>
                <div style="font-size: 14px; font-weight: bold; color: #0c4a6e;">${order.customerPlaceOfSupply || customer.placeOfSupply || 'Punjab / Chandigarh'}</div>
              </div>
            </div>

            <!-- Garments Table -->
            <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 24px 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
              Garments & Service Details (${order.totalPieces} Pieces)
            </h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
              <thead>
                <tr style="background-color: #f8fafc; color: #475569; border-bottom: 2px solid #cbd5e1; font-size: 12px;">
                  <th style="padding: 8px; text-align: center; width: 30px;">#</th>
                  <th style="padding: 8px; text-align: left;">Garment & Services</th>
                  <th style="padding: 8px; text-align: center; width: 110px;">Pressing</th>
                  <th style="padding: 8px; text-align: center; width: 45px;">Qty</th>
                  <th style="padding: 8px; text-align: right; width: 85px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <!-- Financial Breakdown Table -->
            <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; max-width: 320px; margin-left: auto;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: #64748b; padding: 3px 0;">Gross Amount:</td>
                  <td style="text-align: right; font-weight: 600; color: #334155; font-family: monospace;">₹${order.grossAmount.toFixed(2)}</td>
                </tr>
                ${order.discountAmount > 0 ? `
                  <tr>
                    <td style="color: #16a34a; padding: 3px 0;">Discount (${order.discountPercent}%):</td>
                    <td style="text-align: right; font-weight: 600; color: #16a34a; font-family: monospace;">-₹${order.discountAmount.toFixed(2)}</td>
                  </tr>
                ` : ''}
                <tr style="border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                  <td style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #0f172a;">Total Amount:</td>
                  <td style="padding: 8px 0; text-align: right; font-size: 16px; font-weight: 800; color: #0284c7; font-family: monospace;">₹${order.netAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="color: #16a34a; padding: 6px 0 3px 0; font-weight: 600;">Paid Amount:</td>
                  <td style="text-align: right; font-weight: bold; color: #16a34a; font-family: monospace;">₹${order.advancePaid.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="color: #e11d48; padding: 3px 0; font-weight: 700;">Balance Due:</td>
                  <td style="text-align: right; font-weight: 800; color: #e11d48; font-size: 14px; font-family: monospace;">₹${order.balanceDue.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <!-- Customer Portal Button -->
            <div style="text-align: center; margin: 30px 0 20px 0;">
              <a href="${order.receiptUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                View Digital Invoice & Track Order
              </a>
            </div>

            <!-- Store & Cleanera Info -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px; font-size: 12px; color: #64748b;">
              <div style="font-weight: bold; color: #1e293b; font-size: 13px; margin-bottom: 4px;">${businessSettings.businessName} - ${businessSettings.branchName}</div>
              <div><strong>Address:</strong> ${businessSettings.address}</div>
              <div><strong>Phone:</strong> ${businessSettings.phone} | <strong>Email:</strong> ${businessSettings.email}</div>
              ${businessSettings.taxNumber ? `<div><strong>GSTIN:</strong> ${businessSettings.taxNumber}</div>` : ''}
              <div><strong>Website:</strong> <a href="${businessSettings.website}" style="color: #0284c7;">${businessSettings.website}</a></div>
              <div style="margin-top: 10px; font-style: italic; color: #94a3b8;">${businessSettings.receiptFooterMessage}</div>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            This is an automated order confirmation notification from ${bizName}.
          </div>
        </div>
      </body>
    </html>
  `;

  const bodyText = `
${bizName} - Order Confirmation #${orderNumber}

Hello ${customerName},

Thank you for choosing ${businessSettings.businessName}.
Your dry cleaning order has been successfully created.

Order No: #${orderNumber}
Order Date: ${order.orderDate}
Garments: ${order.totalPieces} Pieces
Place of Supply: ${order.customerPlaceOfSupply || customer.placeOfSupply}
Due Date: ${order.dueDate}

Garment Details:
${itemsTextList}

Financial Summary:
Gross Amount: ₹${order.grossAmount.toFixed(2)}
Discount: -₹${order.discountAmount.toFixed(2)}
Total Amount: ₹${order.netAmount.toFixed(2)}
Paid Amount: ₹${order.advancePaid.toFixed(2)}
Balance Due: ₹${order.balanceDue.toFixed(2)}

Receipt & Digital Invoice:
${order.receiptUrl}

Store Info:
${businessSettings.businessName} (${businessSettings.branchName})
Address: ${businessSettings.address}
Phone: ${businessSettings.phone} | Email: ${businessSettings.email}

Thank you,
${businessSettings.displayName || businessSettings.businessName}
  `.trim();

  return { subject, bodyHtml, bodyText };
}

/**
 * Dispatches notifications asynchronously and safely.
 * Notification failure will NEVER throw an unhandled exception or break order creation.
 */
export async function dispatchOrderNotifications(
  order: Order,
  customer: Customer,
  businessSettings: BusinessSettings
): Promise<NotificationDispatchResult> {
  const result: NotificationDispatchResult = {
    whatsAppResult: { success: false },
    emailResult: { success: false }
  };

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // 1. WhatsApp Order Confirmation
  try {
    const rawPhone = (customer.mobile || order.customerMobile || '').trim();
    const normalizedPhone = normalizeIndianPhoneNumber(rawPhone);

    // Validate phone number has digits
    const digitsOnly = normalizedPhone.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < 10) {
      result.whatsAppResult = {
        success: false,
        error: `Invalid customer WhatsApp phone number: "${rawPhone}"`,
        message: {
          id: `wa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          toName: customer.name || order.customerName,
          toPhone: rawPhone,
          triggerType: 'ORDER_CREATED',
          messageText: buildOrderWhatsAppMessage(order, customer, businessSettings),
          receiptUrl: order.receiptUrl,
          orderNumber: order.orderNumber,
          timestamp: timeStr,
          status: 'FAILED',
          isOutbound: true,
          errorReason: 'Invalid customer phone number format'
        }
      };
    } else {
      const messageText = buildOrderWhatsAppMessage(order, customer, businessSettings);
      const waMsg: WhatsAppMessage = {
        id: `wa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        toName: customer.name || order.customerName,
        toPhone: normalizedPhone,
        triggerType: 'ORDER_CREATED',
        messageText,
        receiptUrl: order.receiptUrl,
        orderNumber: order.orderNumber,
        timestamp: timeStr,
        status: 'SENT',
        isOutbound: true
      };

      result.whatsAppResult = {
        success: true,
        message: waMsg
      };
    }
  } catch (err: any) {
    result.whatsAppResult = {
      success: false,
      error: err?.message || 'WhatsApp dispatch encountered an unexpected error'
    };
  }

  // 2. Email Order Confirmation
  try {
    const customerEmail = (customer.email || '').trim();
    if (!customerEmail) {
      // Customer has no email address: simply skip without failing
      result.emailResult = {
        success: true,
        skipped: true,
        message: {
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          toName: customer.name || order.customerName,
          toEmail: '',
          orderNumber: order.orderNumber,
          subject: `${businessSettings.businessName || businessSettings.displayName || 'Dry Cleaners'} - Order Confirmation #${order.orderNumber}`,
          bodyHtml: '',
          bodyText: 'Skipped - customer has no email address provided.',
          timestamp: timeStr,
          status: 'SKIPPED',
          isOutbound: true
        }
      };
    } else {
      // Validate email format
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
      const { subject, bodyHtml, bodyText } = buildOrderEmailConfirmation(order, customer, businessSettings);

      if (!isValidEmail) {
        result.emailResult = {
          success: false,
          error: `Invalid email address format: "${customerEmail}"`,
          message: {
            id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            toName: customer.name || order.customerName,
            toEmail: customerEmail,
            orderNumber: order.orderNumber,
            subject,
            bodyHtml,
            bodyText,
            timestamp: timeStr,
            status: 'FAILED',
            isOutbound: true,
            errorReason: 'Invalid email address syntax'
          }
        };
      } else {
        const emailMsg: EmailMessage = {
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          toName: customer.name || order.customerName,
          toEmail: customerEmail,
          orderNumber: order.orderNumber,
          subject,
          bodyHtml,
          bodyText,
          timestamp: timeStr,
          status: 'SENT',
          isOutbound: true
        };

        result.emailResult = {
          success: true,
          message: emailMsg
        };
      }
    }
  } catch (err: any) {
    result.emailResult = {
      success: false,
      error: err?.message || 'Email dispatch encountered an unexpected error'
    };
  }

  return result;
}
