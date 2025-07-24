// Mobile detection utility for mobile-specific UI changes
export const isMobileBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile devices (Android, iOS)
  return /android|iphone|ipod|ipad|mobile|webos|blackberry|iemobile|opera mini/i.test(userAgent);
};

export const isAndroidBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
};

export const isiOSBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iphone|ipod|ipad/i.test(navigator.userAgent);
};