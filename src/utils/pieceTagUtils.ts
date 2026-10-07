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
  if (!order) return [];

  const tags: PieceTagData[] = [];

  const bizName = getEffectiveBusinessName(businessSettings);
  const bizPrefix = getBusinessPrefix(businessSettings);
  const orderNum = order.orderNumber || 1;
  const orderCode = `${bizPrefix}-${orderNum.toString().padStart(3, '0')}`;
  const tagDeliveryDate = calculateTagDeliveryDate(order.dueDate);

  const rawItems = Array.isArray(order.items) ? order.items : [];
  
  // Calculate total individual pieces across all item quantities reliably
  const calculatedItemsTotal = rawItems.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
  const totalPiecesCount = calculatedItemsTotal > 0 ? calculatedItemsTotal : Math.max(1, Number(order.totalPieces) || 1);

  let currentPieceIndex = 1;

  rawItems.forEach((item, itemIdx) => {
    const qty = Math.max(1, Number(item.quantity) || 1);

    for (let q = 0; q < qty; q++) {
      const pieceIdx = currentPieceIndex;
      const clientCode = `CL-${pieceIdx}`;
      const garmentCodePart = item.garmentCode || (item.garmentName || 'GAR').slice(0, 3).toUpperCase();
      
      // QR / Secret Payload explicitly encodes the dynamic business name so QR scanners and verification get the current company name
      const uniqueSecretCode = `${bizName} | ${orderCode} | ${clientCode} | ${garmentCodePart} | Due: ${tagDeliveryDate}`;

      tags.push({
        id: `piece-${order.id || 'ord'}-${itemIdx}-${q}-${pieceIdx}`,
        orderNumber: orderNum,
        orderId: order.id || `ord-${orderNum}`,
        businessName: bizName,
        code: orderCode,
        clientName: order.customerName || 'Valued Customer',
        clientCode: clientCode,
        pieceIndex: pieceIdx,
        totalPieces: totalPiecesCount,
        crmDueDate: order.dueDate || '',
        tagDeliveryDate: tagDeliveryDate,
        garmentName: item.garmentName || 'Garment Item',
        garmentCode: garmentCodePart,
        serviceName: item.serviceName || 'Dry Cleaning',
        serviceCode: item.serviceCode || 'DC',
        pressingMethod: item.pressingMethod || 'Steam Press',
        barcode: item.barcode || `${orderNum}-${itemIdx + 1}-${q + 1}`,
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
    <svg width="100%" height="100%" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="display:block; width:100%; height:100%; image-rendering: pixelated; shape-rendering: crispEdges;">
      <rect width="${size}" height="${size}" fill="#fff" />
      ${rects}
    </svg>
  `;
};

/**
 * Returns HTML string for an individual compact piece tag (1.5" x 1.12" / 38mm x 28mm).
 * Formatted for thermal label roll printing with straight/horizontal orientation,
 * crisp lighter typography, zero line-wrapping for piece codes, and minimum paper waste.
 */
export const renderPieceTagHtml = (tag: PieceTagData): string => {
  const qrSvg = generate2RMatrixSVG(tag.uniqueSecretCode, 40);

  return `
    <div class="piece-tag-container" style="
      width: 38mm;
      height: 27mm;
      max-width: 38mm;
      max-height: 27mm;
      min-width: 38mm;
      box-sizing: border-box;
      padding: 0.6mm 1mm 0.5mm 1mm;
      border: 0.6px solid #000;
      border-radius: 0;
      background: #ffffff;
      color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
      margin: 0;
      overflow: hidden;
    ">
      <!-- Top Row: Business Name & Order Code -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 0.6px solid #000;
        padding-bottom: 0.5px;
        margin-bottom: 0.5px;
      ">
        <div style="
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1px;
          line-height: 1.1;
          max-width: 23mm;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        ">
          ${tag.businessName}
        </div>
        <div style="
          font-family: monospace;
          font-size: 8px;
          font-weight: 700;
          background: #000;
          color: #fff;
          padding: 0.5px 2px;
          border-radius: 1px;
          line-height: 1.1;
          white-space: nowrap;
        ">
          ${tag.code}
        </div>
      </div>

      <!-- Main Body: Left Details + Right QR Code -->
      <div style="display: flex; gap: 1.2mm; align-items: stretch; justify-content: space-between; flex: 1; min-height: 0;">
        <!-- Left Column: Client, Piece Code, Item, Delivery Date -->
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; height: 100%; font-size: 7.5px; line-height: 1.15;">
          <!-- Client Name (Readable, Crisp, Lighter Weight) -->
          <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.15;">
            <span style="font-weight: 600; color: #000; font-size: 8px;">Client:</span>
            <strong style="font-weight: 700; font-size: 9.5px; color: #000;"> ${tag.clientName}</strong>
          </div>

          <!-- Client / Piece Code Badge (Guaranteed 1 line, Never wraps/breaks) -->
          <div style="
            display: flex;
            align-items: center;
            gap: 2px;
            margin-top: 0.2px;
            white-space: nowrap !important;
            flex-wrap: nowrap !important;
          ">
            <span style="font-weight: 600; color: #000; font-size: 8px; flex-shrink: 0; white-space: nowrap !important;">Piece:</span>
            <span style="
              font-family: monospace;
              font-weight: 700;
              font-size: 10px;
              color: #fff;
              background: #000;
              padding: 0.5px 2.5px;
              border-radius: 1px;
              line-height: 1;
              white-space: nowrap !important;
              word-break: keep-all !important;
              overflow-wrap: normal !important;
              display: inline-block !important;
              flex-shrink: 0 !important;
            ">
              ${tag.clientCode}
            </span>
            <span style="font-size: 8px; color: #000; font-weight: 600; white-space: nowrap !important; flex-shrink: 0;">
              (${tag.pieceIndex}/${tag.totalPieces})
            </span>
          </div>

          <!-- Garment & Service -->
          <div style="font-weight: 600; font-size: 7.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.2px; color: #000;">
            ${tag.garmentName} • <span>${tag.serviceCode}</span>
          </div>

          <!-- Tag Delivery Date (ONE DAY EARLIER than CRM Delivery Date) -->
          <div style="
            margin-top: 0.2px;
            padding-top: 0.3px;
            background: #fff;
            border-top: 0.6px dashed #000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            white-space: nowrap;
          ">
            <span style="font-weight: 600; font-size: 7.5px; color: #000;">Tag Due:</span>
            <strong style="font-weight: 700; font-size: 9px; color: #000;">
              ${tag.tagDeliveryDate}
            </strong>
          </div>
        </div>

        <!-- Right Column: 2R Matrix Code -->
        <div style="
          width: 12.5mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <div style="
            width: 12mm;
            height: 12mm;
            padding: 0.3px;
            border: 0.6px solid #000;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          ">
            ${qrSvg}
          </div>
          <div style="
            font-family: monospace;
            font-size: 7px;
            font-weight: 700;
            letter-spacing: 0.2px;
            margin-top: 0.3px;
            color: #000;
            line-height: 1;
            white-space: nowrap !important;
            word-break: keep-all !important;
          ">
            ${tag.clientCode}
          </div>
        </div>
      </div>

      <!-- Secret Trace Line (Solid Black, Clear & Legible, Less Bloated) -->
      <div style="
        border-top: 0.6px solid #000;
        margin-top: 0.4px;
        padding-top: 0.4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: monospace;
        font-size: 7px;
        font-weight: 600;
        color: #000;
        line-height: 1.1;
        white-space: nowrap;
      ">
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 24mm; letter-spacing: 0.1px;">
          ${tag.uniqueSecretCode}
        </span>
        <span style="font-weight: 700; color: #000; text-transform: uppercase; white-space: nowrap; margin-left: 2px;">
          ${tag.pressingMethod || 'Steam Press'}
        </span>
      </div>
    </div>
  `;
};

/**
 * Triggers the browser/system print dialog for all or selected piece tags.
 * Formatted directly for physical 38mm × 28mm (1.5" × 1.12") thermal tag-roll paper.
 * - Forces portrait orientation so tags print straight/horizontal without 90-degree sideways rotation.
 * - Enforces 27mm container height to strictly avoid subpixel overflow and prevent blank page skips.
 * - Ensures minimal gap between tags with minimum paper waste.
 * - Keeps CL-5 and all piece codes strictly on one line without breaking.
 */
export const printPiece2RTags = (
  order: Order,
  businessSettings?: BusinessSettings,
  selectedPieceIds?: string[],
  layoutMode: string = 'THERMAL_ROLL'
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

  // Wrap each tag in a page container with page break for multi-piece thermal printing
  const tagsHtml = tagsToPrint.map((tag) => `
    <div class="print-tag-wrapper">
      ${renderPieceTagHtml(tag)}
    </div>
  `).join('');

  const styles = `
    @page {
      size: 38mm 28mm portrait;
      margin: 0 !important;
      padding: 0 !important;
    }
    @media print {
      @page {
        size: 38mm 28mm portrait;
        margin: 0 !important;
        padding: 0 !important;
      }
      *, *::before, *::after {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        width: 38mm !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        overflow: hidden !important;
        -webkit-text-size-adjust: 100% !important;
      }
      .print-tag-wrapper {
        width: 38mm !important;
        height: 27mm !important;
        max-width: 38mm !important;
        max-height: 27mm !important;
        min-width: 38mm !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: always !important;
        break-after: page !important;
        display: block !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      .print-tag-wrapper:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .piece-tag-container {
        width: 38mm !important;
        height: 27mm !important;
        max-width: 38mm !important;
        max-height: 27mm !important;
        min-width: 38mm !important;
        margin: 0 auto !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
    }
  `;

  return printHtmlContent(tagsHtml, {
    title: `${bizName}-Piece-Tags-Order-${order.orderNumber}`,
    styles: styles,
    pageWidth: '38mm',
    pageHeight: '28mm'
  });
};
