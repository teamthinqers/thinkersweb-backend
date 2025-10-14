/**
 * Utility to detect if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  // Check if window is available (SSR safety)
  if (typeof window === 'undefined') {
    return false;
  }

  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile device patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
  
  // Check user agent
  const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
  
  // Check screen size (max-width: 768px is typically mobile)
  const isMobileScreen = window.innerWidth <= 768;
  
  // Check touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Return true if any mobile indicator is present
  return isMobileUA || (isMobileScreen && isTouchDevice);
}

/**
 * Check if user is on mobile browser (not in WhatsApp)
 */
export function isMobileBrowser(): boolean {
  if (!isMobileDevice()) {
    return false;
  }
  
  // Check if user is in WhatsApp in-app browser
  const userAgent = navigator.userAgent || '';
  const isWhatsAppBrowser = /whatsapp/i.test(userAgent);
  
  return !isWhatsAppBrowser;
}
