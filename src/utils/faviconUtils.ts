/**
 * Favicon Management Utility
 * Handles cross-browser dynamic favicon updates by replacing DOM elements
 * and supporting data URIs, PNGs, SVGs, and ICO files.
 */

export function updateDocumentFavicon(iconUrl?: string) {
  if (!iconUrl || typeof document === 'undefined') return;

  try {
    // 1. Remove all existing icon links to force Chrome/WebKit/Firefox to refresh the tab icon
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    const isSvg = iconUrl.startsWith('data:image/svg') || iconUrl.endsWith('.svg');
    const isPng = iconUrl.startsWith('data:image/png') || iconUrl.endsWith('.png');

    // 2. Standard <link rel="icon">
    const link = document.createElement('link');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    if (isSvg) {
      link.type = 'image/svg+xml';
    } else if (isPng) {
      link.type = 'image/png';
    } else {
      link.type = 'image/x-icon';
    }
    link.href = iconUrl;
    document.head.appendChild(link);

    // 3. Legacy shortcut icon
    const shortcut = document.createElement('link');
    shortcut.id = 'dynamic-shortcut-icon';
    shortcut.rel = 'shortcut icon';
    if (isSvg) {
      shortcut.type = 'image/svg+xml';
    } else if (isPng) {
      shortcut.type = 'image/png';
    }
    shortcut.href = iconUrl;
    document.head.appendChild(shortcut);

    // 4. Apple Touch Icon for iOS Safari
    const apple = document.createElement('link');
    apple.id = 'dynamic-apple-icon';
    apple.rel = 'apple-touch-icon';
    apple.href = iconUrl;
    document.head.appendChild(apple);
  } catch (err) {
    console.warn('Failed to dynamically update tab favicon:', err);
  }
}
