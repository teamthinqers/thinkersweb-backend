import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function MobileRedirect() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is on mobile and not on about page
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    console.log('MobileRedirect check:', { isMobile, isPWA, location });
    
    // If mobile (not PWA) and on home page, redirect to about page
    if (isMobile && !isPWA && location === '/') {
      console.log('Redirecting mobile user to about page');
      setLocation('/about');
    }
  }, [location, setLocation]);

  return null; // This component doesn't render anything
}