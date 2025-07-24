import { useState, useEffect } from 'react';

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth < 768;
      
      console.log('Mobile Detection Debug:', {
        userAgent,
        mobileRegex: mobileRegex.test(userAgent),
        windowWidth: window.innerWidth,
        isMobileDevice,
        isIOS: /iPad|iPhone|iPod/.test(userAgent)
      });
      
      setIsMobile(isMobileDevice);
    };

    const checkPWA = () => {
      const isPWAMode = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true ||
                       document.referrer.includes('android-app://');
      
      console.log('PWA Detection Debug:', {
        displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
        navigatorStandalone: (window.navigator as any).standalone,
        referrer: document.referrer,
        isPWAMode
      });
      
      setIsPWA(isPWAMode);
    };

    checkMobile();
    checkPWA();

    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const switchToDesktopMode = () => {
    // Add desktop mode viewport meta tag
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=1024, initial-scale=0.5, user-scalable=yes');
    }
    
    // Force desktop-like behavior
    document.body.classList.add('desktop-mode');
    localStorage.setItem('preferredMode', 'desktop');
    
    // Reload to apply changes
    window.location.reload();
  };

  const triggerPWAInstall = () => {
    // Try to trigger PWA install prompt
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        (window as any).deferredPrompt = null;
      });
    } else {
      // Show manual install instructions
      showInstallInstructions();
    }
  };

  const showInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    if (isIOS) {
      instructions = 'To install: Tap the Share button in Safari and select "Add to Home Screen"';
    } else if (isAndroid) {
      instructions = 'To install: Look for the three dots menu (⋮) in your browser and select "Add to Home Screen" or "Install App"';
    } else {
      instructions = 'To install: Look for the install option in your browser menu';
    }
    
    alert(instructions);
  };

  return {
    isMobile,
    isPWA,
    switchToDesktopMode,
    triggerPWAInstall
  };
}