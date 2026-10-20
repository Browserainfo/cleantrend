import { OrderGarmentItem } from '../types';

/**
 * Determines whether a garment name, code, or icon represents a curtain requiring panel counting.
 * Identifies items like "Curtain", "Curtains (per panel)", "Curtain Door", "Curtain Window",
 * "Curtain Door With Lining", etc.
 * Excludes accessories like "Curtain Belt" or "Curtain Tie" which do not have panels.
 */
export const isCurtainGarment = (name?: string, code?: string, icon?: string): boolean => {
  if (!name && !code && !icon) return false;
  const n = (name || '').toLowerCase().trim();
  const c = (code || '').toUpperCase().trim();
  
  if (c === 'CRT') return true;
  if (icon === 'curtains') return true;
  
  // Name checks
  if (n.includes('curtain')) {
    // Exclude accessories that don't have panels
    if (n.includes('belt') || n.includes('tie') || n.includes('hook') || n.includes('rod') || n.includes('ring')) {
      return false;
    }
    return true;
  }
  
  return false;
};

/**
 * Calculates the total line price for a curtain item using the total-panel method:
 * Total Panels across all curtains × Price per Panel (+ any sub-services * quantity)
 * Example: 13 curtains, 20 total panels, ₹50/panel = 20 × 50 = ₹1,000.
 */
export const calculateCurtainPrice = (
  quantity: number,
  totalPanels: number,
  pricePerPanel: number,
  subServicesTotalPerUnit: number = 0
): { quantity: number; totalPanels: number; totalPrice: number } => {
  const qty = Math.max(1, quantity || 1);
  const panels = Math.max(1, totalPanels || qty);
  const rate = Math.max(0, pricePerPanel || 0);
  const totalPrice = (panels * rate) + (subServicesTotalPerUnit * qty);
  return { quantity: qty, totalPanels: panels, totalPrice };
};

/**
 * Formats curtain description displaying Piece and Panel counts clearly.
 * E.g. "Piece: 13 • Panel: 20"
 */
export const formatCurtainPiecePanelText = (item: Partial<OrderGarmentItem>): string => {
  const piece = item.quantity || 1;
  const panel = item.panelCount !== undefined ? item.panelCount : piece;
  return `Piece: ${piece} • Panel: ${panel}`;
};

/**
 * Formats full curtain billing description displaying Piece Quantity, Panel Quantity, and Rate per Panel.
 * E.g. "Piece: 13 • Panel: 20 (@ ₹50/panel)"
 */
export const formatCurtainBillingText = (item: Partial<OrderGarmentItem>): string => {
  const piece = item.quantity || 1;
  const panel = item.panelCount !== undefined ? item.panelCount : piece;
  const rate = item.pricePerPanel || item.basePrice || 50;
  return `Piece: ${piece} • Panel: ${panel} (@ ₹${rate}/panel)`;
};
