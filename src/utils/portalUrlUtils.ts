import { Order, BusinessSettings } from '../types';
import { getBusinessPrefix } from './pieceTagUtils';

export const DEFAULT_PRODUCTION_DOMAIN = 'https://crm.trenderacleaners.com';

/**
 * Returns the effective portal origin, prioritizing https://crm.trenderacleaners.com
 * and replacing any legacy run.app or cleanera.app URLs.
 */
export function getEffectivePortalOrigin(businessSettings?: BusinessSettings): string {
  if (
    businessSettings?.onlinePortalDomain &&
    !businessSettings.onlinePortalDomain.includes('run.app') &&
    !businessSettings.onlinePortalDomain.includes('cleanera.app') &&
    !businessSettings.onlinePortalDomain.includes('localhost')
  ) {
    return businessSettings.onlinePortalDomain.replace(/\/+$/, '');
  }
  return DEFAULT_PRODUCTION_DOMAIN;
}

/**
 * Normalizes any receipt URL to ensure it uses https://crm.trenderacleaners.com
 * instead of the old AI Studio run.app or cleanera.app domains.
 */
export function normalizePublicReceiptUrl(url: string | undefined, order?: Order, businessSettings?: BusinessSettings): string {
  if (!url) {
    return order && businessSettings ? buildPublicReceiptUrl(order, businessSettings) : '';
  }
  let updated = url.trim();
  if (
    updated.includes('.run.app') || 
    updated.includes('cleanera.app') || 
    updated.includes('localhost:3000') ||
    updated.includes('localhost:5173')
  ) {
    try {
      const parsed = new URL(updated);
      const origin = getEffectivePortalOrigin(businessSettings);
      return `${origin}${parsed.pathname}${parsed.search}`;
    } catch {
      return updated.replace(/https?:\/\/[^/]+/i, getEffectivePortalOrigin(businessSettings));
    }
  }
  return updated;
}

/**
 * Builds the exact production public invoice / receipt link for WhatsApp and notifications.
 * Uses the official domain: https://crm.trenderacleaners.com
 */
export function buildPublicReceiptUrl(order: Order, businessSettings: BusinessSettings): string {
  const origin = getEffectivePortalOrigin(businessSettings);

  const effectivePrefix = getBusinessPrefix(businessSettings);
  const branchCode = (order.branchCode && order.branchCode !== 'DC02') 
    ? order.branchCode 
    : (effectivePrefix || businessSettings?.branchCode || 'TE02');
  const roundedTotal = Math.round(order.netAmount || 0);
  const custCode = (order.customerId || 'Cust').replace(/[^a-zA-Z0-9]/g, '');
  const checksum = ((order.orderNumber * 37 + 101) % 900 + 100).toString();

  return `${origin}/portal/invoice?Reciept=${branchCode}-${order.orderNumber}-${roundedTotal}-${custCode}-${checksum}`;
}

/**
 * Formats a due date into the clean Indian standard format: 'DD MMM YYYY' (e.g. '26 Aug 2026')
 */
export function formatWhatsAppDueDate(dateStr?: string): string {
  if (!dateStr) return '26 Aug 2026';
  
  const ddmonyyyyMatch = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (ddmonyyyyMatch) {
    return `${parseInt(ddmonyyyyMatch[1], 10)} ${ddmonyyyyMatch[2]} ${ddmonyyyyMatch[3]}`;
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  return dateStr;
}

/**
 * Detects if the current browser URL is a Customer Invoice / Portal link.
 */
export function detectPortalRequest(): { isPortalRequest: boolean; queryParam: string | null } {
  if (typeof window === 'undefined') {
    return { isPortalRequest: false, queryParam: null };
  }

  const pathname = window.location.pathname.toLowerCase();
  const search = window.location.search;
  const hash = window.location.hash;

  const searchParams = new URLSearchParams(search);
  
  // 1. Explicit priority check for Reciept / Receipt / invoice parameter
  const directParam = 
    searchParams.get('Reciept') || 
    searchParams.get('receipt') || 
    searchParams.get('Receipt') || 
    searchParams.get('reciept') ||
    searchParams.get('invoice') ||
    searchParams.get('Invoice') ||
    searchParams.get('order') ||
    searchParams.get('id') ||
    searchParams.get('ref');

  if (directParam && directParam.trim()) {
    return { isPortalRequest: true, queryParam: directParam.trim() };
  }

  const paramKeys = ['reciept', 'receipt', 'invoice', 'order', 'ordernumber', 'orderid', 'ord', 'id', 'bill', 'ref'];

  for (const key of paramKeys) {
    for (const [k, v] of searchParams.entries()) {
      if (k.toLowerCase() === key && v && v.trim()) {
        return { isPortalRequest: true, queryParam: v.trim() };
      }
    }
  }

  // Check URL pathname
  if (
    pathname.includes('/portal/invoice') || 
    pathname.includes('/paymentlinktesting') || 
    pathname.includes('/portal') || 
    pathname.includes('/invoice') ||
    pathname.includes('/receipt')
  ) {
    // If any search parameter exists
    for (const [, v] of searchParams.entries()) {
      if (v && v.trim()) return { isPortalRequest: true, queryParam: v.trim() };
    }

    // Check if there's a trailing path segment e.g. /portal/invoice/TE02-4 or /invoice/4
    const segments = pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && !['portal', 'invoice', 'invoicedetails.aspx', 'receipt'].includes(lastSeg)) {
      return { isPortalRequest: true, queryParam: lastSeg };
    }

    return { isPortalRequest: true, queryParam: '' };
  }

  // Check Hash e.g. #/portal/invoice?Reciept=...
  if (hash) {
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(qIndex));
      const directHash = 
        hashParams.get('Reciept') || 
        hashParams.get('receipt') || 
        hashParams.get('Receipt') || 
        hashParams.get('reciept') ||
        hashParams.get('invoice') ||
        hashParams.get('order');

      if (directHash && directHash.trim()) {
        return { isPortalRequest: true, queryParam: directHash.trim() };
      }

      for (const key of paramKeys) {
        for (const [k, v] of hashParams.entries()) {
          if (k.toLowerCase() === key && v && v.trim()) {
            return { isPortalRequest: true, queryParam: v.trim() };
          }
        }
      }
    }

    const hashLower = hash.toLowerCase();
    if (hashLower.includes('/portal') || hashLower.includes('/invoice') || hashLower.includes('reciept') || hashLower.includes('receipt')) {
      return { isPortalRequest: true, queryParam: '' };
    }
  }

  return { isPortalRequest: false, queryParam: null };
}

/**
 * Extracts a query param from any URL string.
 */
export function extractReceiptQueryFromUrlString(urlString: string): string | null {
  if (!urlString) return null;
  try {
    const parsed = new URL(urlString, 'http://localhost');
    const paramKeys = ['reciept', 'receipt', 'invoice', 'order', 'ordernumber', 'orderid', 'ord', 'id', 'bill', 'ref'];
    for (const key of paramKeys) {
      for (const [k, v] of parsed.searchParams.entries()) {
        if (k.toLowerCase() === key && v) return v;
      }
    }
    const segments = parsed.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (last && !['portal', 'invoice', 'invoicedetails.aspx', 'receipt'].includes(last.toLowerCase())) {
      return last;
    }
  } catch (e) {
    // Fallback regex parsing
    const match = urlString.match(/[?&](?:Reciept|reciept|receipt|invoice|order|orderId)=([^&]+)/i);
    if (match && match[1]) return decodeURIComponent(match[1]);
  }
  return null;
}

/**
 * Robustly matches an order from query or receipt reference string in client memory.
 */
export function findOrderFromReceiptQuery(query: string | null, orders: Order[]): Order | undefined {
  if (!query || !query.trim()) return undefined;
  const clean = query.trim();
  const lower = clean.toLowerCase();

  // 1. Direct ID match (e.g. "ord-4", "ord-31")
  const byId = orders.find(o => o.id && o.id.toLowerCase() === lower);
  if (byId) return byId;

  // 2. Structured string like "TE02-31-555-cust1787392254014-448" or "TE02-31" (or "DC02-31")
  const parts = clean.split('-');
  if (parts.length >= 2) {
    const candidateOrderNum = parseInt(parts[1], 10);
    if (!isNaN(candidateOrderNum)) {
      const byBranchAndNum = orders.find(o => 
        (o.branchCode && o.branchCode.toLowerCase() === parts[0].toLowerCase() && o.orderNumber === candidateOrderNum) ||
        o.orderNumber === candidateOrderNum
      );
      if (byBranchAndNum) return byBranchAndNum;
    }
  }

  // 3. Exact OrderNumber match (e.g. "31", "#31", "ORD-31")
  if (/^(?:ord[-_#]?)?(\d+)$/i.test(clean)) {
    const match = clean.match(/^(?:ord[-_#]?)?(\d+)$/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      const byNum = orders.find(o => o.orderNumber === num);
      if (byNum) return byNum;
    }
  }

  // 4. Match in receiptUrl property
  const byReceiptUrl = orders.find(o => 
    o.receiptUrl && (o.receiptUrl.toLowerCase().includes(lower) || lower.includes(o.receiptUrl.toLowerCase()))
  );
  if (byReceiptUrl) return byReceiptUrl;

  // 5. Match barcode or series (e.g. "4-1-2", "*4-2*")
  const byBarcode = orders.find(o => 
    (o.orderSeries && o.orderSeries.toLowerCase() === lower) ||
    (Array.isArray(o.items) && o.items.some(i => i.barcode && i.barcode.toLowerCase() === lower))
  );
  if (byBarcode) return byBarcode;

  // 6. If no hyphen exists, loose numeric fallback
  if (!clean.includes('-')) {
    const numOnly = clean.replace(/[^0-9]/g, '');
    if (numOnly && numOnly.length <= 6) {
      const num = parseInt(numOnly, 10);
      const byNum = orders.find(o => o.orderNumber === num);
      if (byNum) return byNum;
    }
  }

  return undefined;
}

/**
 * Fetch the invoice data directly from backend server database API.
 */
export async function fetchInvoiceFromServer(receiptQuery: string): Promise<{ order?: Order; settings?: Partial<BusinessSettings> } | null> {
  if (!receiptQuery || !receiptQuery.trim()) return null;
  try {
    const encoded = encodeURIComponent(receiptQuery.trim());
    const res = await fetch(`/api/invoice/${encoded}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        return { order: data.order, settings: data.settings };
      }
    }

    // Try secondary endpoint with query param (supporting Reciept and Receipt)
    const res2 = await fetch(`/api/invoice?Reciept=${encoded}`);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.success && data2.order) {
        return { order: data2.order, settings: data2.settings };
      }
    }

    const res3 = await fetch(`/api/invoice?Receipt=${encoded}`);
    if (res3.ok) {
      const data3 = await res3.json();
      if (data3.success && data3.order) {
        return { order: data3.order, settings: data3.settings };
      }
    }
  } catch (err) {
    console.error('Failed to fetch invoice from server:', err);
  }
  return null;
}
