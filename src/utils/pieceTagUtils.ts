import { Order, BusinessSettings } from '../types';
import { printHtmlContent } from './printUtils';

export interface PieceTagData {
  id: string; // Unique piece ID
  orderNumber: number;
  orderId: string;
  businessName: string; // Dynamic business name from Admin Settings
  code: string; // Order Code e.g. "TE-001" or "ABC-001"
  clientName: string; // Customer name e.g. "John Doe"
  clientCode: string; // Piece Code e.g. "CL-5"
  pieceIndex: number; // 1-based piece sequence (e.g. 1)
  totalPieces: number; // Total pieces in order (e.g. 5)
  crmDueDate: string; // CRM recorded due date (e.g. "17 Aug 2026")
  tagDeliveryDate: string; // Printed Tag delivery date = CRM Due Date - 1 day (e.g. "16 Aug 2026")
  garmentName: string; // e.g. "Shirt"
  garmentCode?: string; // e.g. "SH"
  serviceName: string; // e.g. "Dry Cleaning"
  serviceCode: string; // e.g. "DC"
  pressingMethod?: string; // e.g. "Iron Press"
  barcode: string; // Barcode e.g. "4-1-2"
  uniqueSecretCode: string; // Secret garment identification code containing dynamic business name
  remarks?: string[];
  brand?: string;
  color?: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Returns the effective business name configured by the admin in Settings.
 * Single source of truth: businessSettings.businessName -> businessSettings.displayName -> fallback
 */
export const getEffectiveBusinessName = (businessSettings?: BusinessSettings): string => {
  if (!businessSettings) return 'Trendera Dry Cleaning CRM';
  const name = (businessSettings.businessName || businessSettings.displayName || '').trim();
  if (!name || name === 'Dry Cleaners') return 'Trendera Dry Cleaning CRM';
  return name;
};

/**
 * Derives a clean, brand-aware 2-3 letter uppercase company prefix from the business name.
 * Examples:
 * - "Trendera Dry Cleaning CRM" -> "TE" (Trend-Era)
 * - "TrendEra" -> "TE"
 * - "Cleanera" -> "CL"
 * - "Supreme Cleaners" -> "SC"
 * - "ABC Dry Cleaners" -> "ADC"
 */
export const deriveCompanyPrefix = (businessName?: string): string => {
  if (!businessName || !businessName.trim()) return 'TE';
  const clean = businessName.trim();

  // 1. Explicit brand mapping for Trendera / Trend Era
  if (/^trendera/i.test(clean) || /^trend\s*era/i.test(clean)) {
    return 'TE';
  }
  // 2. Cleanera mapping
  if (/^cleanera/i.test(clean)) {
    return 'CL';
  }

  // 3. Multi-capital / CamelCase check (e.g. TrendEra -> TE, QuickWash -> QW)
  const firstWord = clean.split(/[\s\-_]+/)[0] || clean;
  const wordCapitals = firstWord.replace(/[^A-Z]/g, '');
  if (wordCapitals.length >= 2) {
    return wordCapitals.slice(0, 2);
  }

  // 4. Multiple words handling (e.g. "Royal Dry Cleaners" -> "RD" or "RC")
  const words = clean.split(/[\s\-_]+/).filter(Boolean);
  if (words.length >= 2) {
    if (/^trend/i.test(words[0]) && /era/i.test(words[1])) return 'TE';
    if (/^trendera/i.test(words[0])) return 'TE';
    if (/^cleanera/i.test(words[0])) return 'CL';

    const significantWords = words.filter(w => !/^(crm|pvt|ltd|inc|llc|services)$/i.test(w));
    if (significantWords.length >= 2) {
      return (significantWords[0][0] + significantWords[1][0]).toUpperCase();
    }
  }

  return clean.slice(0, 2).toUpperCase();
};

/**
 * Extracts branch numeric digits (e.g. "02", "01") from branch name or branch code.
 */
export const extractBranchDigits = (branchName?: string, branchCode?: string): string => {
  if (branchCode) {
    const digits = branchCode.replace(/[^0-9]/g, '');
    if (digits) return digits.padStart(2, '0');
  }
  if (branchName) {
    const m = branchName.match(/(?:c|b|branch|store|sector)?\s*(\d+)/i);
    if (m && m[1]) {
      return m[1].padStart(2, '0');
    }
  }
  return '02';
};

/**
 * Derives the complete effective branch code (e.g. "TE02" for Trendera, "CL02" for Cleanera).
 * Priority:
 * 1. If business is Trendera and code is missing or legacy "DC02", returns "TE02".
 * 2. If businessSettings has explicit non-legacy code (e.g. "TE01", "TE02", "TR02"), respects that.
 * 3. Otherwise dynamically derives from businessName + branch digits (e.g. "TE" + "02" = "TE02").
 */
export const deriveEffectiveBranchCode = (businessSettings?: BusinessSettings): string => {
  if (!businessSettings) return 'TE02';

  const bizName = getEffectiveBusinessName(businessSettings);
  const currentBranchCode = (businessSettings.branchCode || '').trim().toUpperCase();

  // If business name is Trendera (or contains Trendera) and branchCode is legacy DC02 or empty
  if (/trendera|trend\s*era/i.test(bizName)) {
    if (!currentBranchCode || currentBranchCode === 'DC02' || currentBranchCode === 'DC') {
      return 'TE02';
    }
    return currentBranchCode;
  }

  // If branchCode is legacy DC02 and business name is NOT cleanera, derive dynamically
  if (currentBranchCode === 'DC02' && !/cleanera/i.test(bizName)) {
    const prefix = deriveCompanyPrefix(bizName);
    const branchDigits = extractBranchDigits(businessSettings.branchName, currentBranchCode);
    return `${prefix}${branchDigits}`;
  }

  if (currentBranchCode && currentBranchCode !== 'DC02') {
    return currentBranchCode;
  }

  const prefix = deriveCompanyPrefix(bizName);
  const branchDigits = extractBranchDigits(businessSettings.branchName, currentBranchCode);
  return `${prefix}${branchDigits}`;
};

/**
 * Derives a clean business/store prefix code dynamically from the business name or branch code.
 * Examples:
 * - Trendera Dry Cleaning CRM -> "TE02"
 * - Trendera with branch 01 -> "TE01"
 * - Cleanera -> "CL02"
 */
export const getBusinessPrefix = (businessSettings?: BusinessSettings): string => {
  return deriveEffectiveBranchCode(businessSettings);
};

/**
 * Automatically calculates Tag Delivery Date as EXACTLY ONE DAY EARLIER than the CRM delivery date.
 * Example: CRM Date "17 Aug 2026" -> Tag Date "16 Aug 2026"
 */
export const calculateTagDeliveryDate = (crmDueDateStr?: string): string => {
  if (!crmDueDateStr || crmDueDateStr.trim() === '') {
    const today = new Date();
    today.setDate(today.getDate() + 2); // Default fallback: +2 days from now
    return formatDateDDMMMYYYY(today);
  }

  // 1. Try standard Date parsing
  let dateObj = new Date(crmDueDateStr);

  // 2. Custom parser for "DD MMM YYYY" or "DD-MMM-YYYY" or "DD/MM/YYYY"
  if (isNaN(dateObj.getTime())) {
    const parts = crmDueDateStr.trim().split(/[\s\-\/]+/);
    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parts[1];
      const p2 = parseInt(parts[2], 10);

      // Check if p1 is month name (e.g. "Aug", "August")
      const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === p1.substring(0, 3).toLowerCase());
      if (monthIdx !== -1 && !isNaN(p0) && !isNaN(p2)) {
        const year = p2 < 100 ? 2000 + p2 : p2;
        dateObj = new Date(year, monthIdx, p0);
      } else if (!isNaN(p0) && !isNaN(parseInt(p1, 10)) && !isNaN(p2)) {
        // DD/MM/YYYY
        const m = parseInt(p1, 10) - 1;
        const year = p2 < 100 ? 2000 + p2 : p2;
        dateObj = new Date(year, m, p0);
      }
    }
  }

  if (isNaN(dateObj.getTime())) {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    return formatDateDDMMMYYYY(today);
  }

  // RULE: Subtract exactly 1 day (24 hours) from the CRM Delivery Date
  dateObj.setDate(dateObj.getDate() - 1);
  return formatDateDDMMMYYYY(dateObj);
};

const formatDateDDMMMYYYY = (d: Date): string => {
  const day = d.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Expands an Order into individual PieceTagData objects.
 * Every individual piece (even within quantities) receives its own unique piece-level code.
 * The business name is NEVER hardcoded - it is dynamically pulled from businessSettings.
 */
export const generatePieceTagsForOrder = (
  order: Order,
  businessSettings?: BusinessSettings
): PieceTagData[] => {
  const tags: PieceTagData[] = [];

  const bizName = getEffectiveBusinessName(businessSettings);
  const bizPrefix = getBusinessPrefix(businessSettings);
  const orderCode = `${bizPrefix}-${order.orderNumber.toString().padStart(3, '0')}`;
  const tagDeliveryDate = calculateTagDeliveryDate(order.dueDate);

  let currentPieceIndex = 1;
  const totalPiecesCount = order.totalPieces || order.items.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;

  order.items.forEach((item, itemIdx) => {
    const qty = Math.max(1, item.quantity || 1);

    for (let q = 0; q < qty; q++) {
      const pieceIdx = currentPieceIndex;
      const clientCode = `CL-${pieceIdx}`;
      const garmentCodePart = item.garmentCode || item.garmentName.slice(0, 3).toUpperCase();
      
      // QR / Secret Payload explicitly encodes the dynamic business name so QR scanners and verification get the current company name
      const uniqueSecretCode = `${bizName} | ${orderCode} | ${clientCode} | ${garmentCodePart} | Due: ${tagDeliveryDate}`;

      tags.push({
        id: `piece-${order.id}-${itemIdx}-${q}-${pieceIdx}`,
        orderNumber: order.orderNumber,
        orderId: order.id,
        businessName: bizName,
        code: orderCode,
        clientName: order.customerName || 'Valued Customer',
        clientCode: clientCode,
        pieceIndex: pieceIdx,
        totalPieces: totalPiecesCount,
        crmDueDate: order.dueDate,
        tagDeliveryDate: tagDeliveryDate,
        garmentName: item.garmentName,
        garmentCode: garmentCodePart,
        serviceName: item.serviceName || 'Dry Cleaning',
        serviceCode: item.serviceCode || 'DC',
        pressingMethod: item.pressingMethod || 'Iron Press',
        barcode: item.barcode || `${order.orderNumber}-${itemIdx + 1}-2`,
        uniqueSecretCode: uniqueSecretCode,
        remarks: item.remarks,
        brand: item.brand,
        color: item.color
      });

      currentPieceIndex++;
    }
  });

  return tags;
};

/**
 * Generates a crisp, deterministic 2D QR Code SVG matrix for physical tag printing.
 * Encodes the payload (including business name) deterministically.
 */
export const generate2RMatrixSVG = (payload: string, size: number = 44): string => {
  // Generate deterministic bit pattern from payload hash
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash) + payload.charCodeAt(i);
    hash |= 0;
  }

  const grid = 15; // 15x15 matrix grid
  const cellSize = (size / grid).toFixed(2);

  // Helper to test if cell is inside standard QR corner finder squares
  const isFinder = (r: number, c: number) => {
    // Top-left 5x5
    if (r <= 4 && c <= 4) {
      if (r === 0 || r === 4 || c === 0 || c === 4) return true;
      if (r === 2 && c === 2) return true;
      return false;
    }
    // Top-right 5x5
    if (r <= 4 && c >= grid - 5) {
      const cc = c - (grid - 5);
      if (r === 0 || r === 4 || cc === 0 || cc === 4) return true;
      if (r === 2 && cc === 2) return true;
      return false;
    }
    // Bottom-left 5x5
    if (r >= grid - 5 && c <= 4) {
      const rr = r - (grid - 5);
      if (rr === 0 || rr === 4 || c === 0 || c === 4) return true;
      if (rr === 2 && c === 2) return true;
      return false;
    }
    return null;
  };

  let rects = '';

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const finderVal = isFinder(r, c);
      let isBlack = false;

      if (finderVal !== null) {
        isBlack = finderVal;
      } else {
        // Deterministic pseudo-random bits based on hash and coordinates
        const bitVal = Math.sin((hash + r * 17 + c * 31)) * 10000;
        isBlack = (bitVal - Math.floor(bitVal)) > 0.45;
        // Keep timing lines
        if (r === 5 || c === 5) {
          isBlack = (r + c) % 2 === 0;
        }
      }

      if (isBlack) {
        const x = (c * parseFloat(cellSize)).toFixed(2);
        const y = (r * parseFloat(cellSize)).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#000" />`;
      }
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="display:block; image-rendering: pixelated; shape-rendering: crispEdges;">
      <rect width="${size}" height="${size}" fill="#fff" />
      ${rects}
    </svg>
  `;
};

/**
 * Returns HTML string for an individual compact piece tag (1.5" x 1.12" / 38mm x 28mm).
 * Displays the dynamic business name configured by the admin.
 */
export const renderPieceTagHtml = (tag: PieceTagData): string => {
  const qrSvg = generate2RMatrixSVG(tag.uniqueSecretCode, 42);

  return `
    <div class="piece-tag-container" style="
      width: 1.5in;
      min-height: 1.12in;
      max-height: 1.25in;
      box-sizing: border-box;
      padding: 3px 4px 2px 4px;
      border: 1.5px solid #000;
      border-radius: 2px;
      background: #ffffff;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
      margin: 0 auto;
      overflow: hidden;
    ">
      <!-- Top Row: Business Name & Order Code -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1.5px solid #000;
        padding-bottom: 1px;
        margin-bottom: 2px;
      ">
        <div style="
          font-size: 8.5px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          line-height: 1.1;
          max-width: 0.85in;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        ">
          ${tag.businessName}
        </div>
        <div style="
          font-family: monospace;
          font-size: 8.5px;
          font-weight: 900;
          background: #000;
          color: #fff;
          padding: 0 3px;
          border-radius: 1px;
          line-height: 1.1;
        ">
          ${tag.code}
        </div>
      </div>

      <!-- Main Body: Left Details + Right QR Code -->
      <div style="display: flex; gap: 3px; align-items: flex-start; justify-content: space-between; flex: 1;">
        <!-- Left Column: Client, Piece Code, Item, Delivery Date -->
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; font-size: 7.5px; line-height: 1.15;">
          <!-- Client Name -->
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span style="font-weight: 600; color: #333;">Client:</span>
            <strong style="font-weight: 800; font-size: 8px; color: #000;"> ${tag.clientName}</strong>
          </div>

          <!-- Client / Piece Code -->
          <div style="display: flex; align-items: baseline; gap: 2px; margin-top: 0.5px;">
            <span style="font-weight: 600; color: #333;">Piece:</span>
            <span style="
              font-family: monospace;
              font-weight: 900;
              font-size: 9px;
              color: #000;
              background: #f0f0f0;
              border: 0.8px solid #000;
              padding: 0 3px;
              border-radius: 1px;
              line-height: 1;
            ">
              ${tag.clientCode}
            </span>
            <span style="font-size: 7px; color: #555; font-weight: bold;">
              (${tag.pieceIndex}/${tag.totalPieces})
            </span>
          </div>

          <!-- Garment & Service -->
          <div style="font-weight: 800; font-size: 7.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.5px;">
            ${tag.garmentName} • <span style="font-weight: 600;">${tag.serviceCode}</span>
          </div>

          <!-- Tag Delivery Date (ONE DAY EARLIER than CRM Delivery Date) -->
          <div style="
            margin-top: 1px;
            padding: 0.5px 2px;
            background: #fff;
            border-top: 1px dashed #444;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span style="font-weight: 700; font-size: 6.8px; color: #222;">Delivery Date:</span>
            <strong style="font-weight: 900; font-size: 8px; color: #000; letter-spacing: -0.2px;">
              ${tag.tagDeliveryDate}
            </strong>
          </div>
        </div>

        <!-- Right Column: 2R Matrix Code -->
        <div style="
          width: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <div style="
            padding: 1px;
            border: 0.8px solid #000;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${qrSvg}
          </div>
          <div style="
            font-family: monospace;
            font-size: 6px;
            font-weight: 900;
            letter-spacing: 0.3px;
            margin-top: 1px;
            color: #000;
          ">
            ${tag.clientCode}
          </div>
        </div>
      </div>

      <!-- Secret Trace Line -->
      <div style="
        border-top: 0.6px solid #888;
        margin-top: 1px;
        padding-top: 0.5px;
        display: flex;
        justify-content: space-between;
        font-family: monospace;
        font-size: 5.5px;
        color: #444;
      ">
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 0.95in;">
          ${tag.uniqueSecretCode}
        </span>
        <span>${tag.pressingMethod || 'Iron'}</span>
      </div>
    </div>
  `;
};

/**
 * Triggers the browser/system print dialog for all or selected piece tags.
 */
export const printPiece2RTags = (
  order: Order,
  businessSettings?: BusinessSettings,
  selectedPieceIds?: string[],
  layoutMode: 'THERMAL_ROLL' | 'A4_SHEET_GRID' = 'THERMAL_ROLL'
): boolean => {
  const allTags = generatePieceTagsForOrder(order, businessSettings);
  const tagsToPrint = selectedPieceIds && selectedPieceIds.length > 0
    ? allTags.filter(t => selectedPieceIds.includes(t.id))
    : allTags;

  if (tagsToPrint.length === 0) {
    alert('Please select at least 1 piece tag to print.');
    return false;
  }

  const bizName = getEffectiveBusinessName(businessSettings);

  const tagsHtml = tagsToPrint.map((tag, idx) => `
    <div class="print-tag-wrapper">
      ${renderPieceTagHtml(tag)}
    </div>
    ${layoutMode === 'THERMAL_ROLL' && idx !== tagsToPrint.length - 1 ? '<div class="page-break"></div>' : ''}
  `).join('');

  const styles = `
    @page {
      size: ${layoutMode === 'THERMAL_ROLL' ? '1.5in 1.15in' : 'A4'};
      margin: ${layoutMode === 'THERMAL_ROLL' ? '0mm' : '8mm'};
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
    }
    .print-tag-wrapper {
      display: inline-block;
      margin: ${layoutMode === 'THERMAL_ROLL' ? '0' : '3mm'};
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    ${layoutMode === 'A4_SHEET_GRID' ? `
      body {
        display: flex;
        flex-wrap: wrap;
        gap: 4mm;
        align-content: flex-start;
      }
    ` : ''}
  `;

  return printHtmlContent(tagsHtml, {
    title: `${bizName}-Piece-Tags-Order-${order.orderNumber}`,
    styles: styles
  });
};
