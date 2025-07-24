import { useState, useEffect } from 'react';

export function useMobileDetection() {
  // Simple mobile detection - check immediately
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  console.log('Simple Mobile Detection:', { isMobile, isPWA, userAgent: navigator.userAgent });

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