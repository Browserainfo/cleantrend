/**
 * Cleanera Dry Cleaning CRM - Phone Number Normalization Utility
 * 
 * Normalizes Indian mobile numbers for messaging backends (WhatsApp, SMS):
 * - "9780195915" -> "+919780195915"
 * - "+919780195915" -> "+919780195915" (no duplication of +91)
 * - "+91 97801 95915" -> "+919780195915"
 * - "09780195915" -> "+919780195915"
 * - "919780195915" -> "+919780195915"
 */

export function normalizeIndianPhoneNumber(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Extract all digits and any leading +
  const digitsOnly = trimmed.replace(/\D/g, '');
  
  if (!digitsOnly) return trimmed;

  // If already starts with +91
  if (trimmed.startsWith('+91')) {
    const withoutPrefix = trimmed.slice(3).replace(/\D/g, '');
    return `+91${withoutPrefix}`;
  }

  // If starts with 91 and has 12 digits (e.g. 919780195915)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }

  // If starts with 0 and has 11 digits (e.g. 09780195915)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `+91${digitsOnly.slice(1)}`;
  }

  // Standard 10-digit Indian mobile number (e.g. 9780195915)
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  // If already starts with +, keep as is without adding another +91
  if (trimmed.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  // Fallback: prepend +91
  return `+91${digitsOnly}`;
}

export function formatIndianPhoneNumberDisplay(input: string): string {
  const normalized = normalizeIndianPhoneNumber(input);
  if (!normalized) return input;

  if (normalized.startsWith('+91') && normalized.length === 13) {
    const part1 = normalized.slice(3, 8);
    const part2 = normalized.slice(8);
    return `+91 ${part1} ${part2}`;
  }
  return normalized;
}
