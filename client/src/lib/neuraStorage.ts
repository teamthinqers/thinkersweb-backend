// Utility for Neura activation storage
const NEURA_ACTIVATION_KEY = 'neuraActivated';
const NEURA_NAME_KEY = 'neuraName';
const NEURA_EVENT = 'neura-state-changed';

// Custom event for Neura state changes
export interface NeuraStateEvent extends CustomEvent {
  detail: {
    activated: boolean;
  };
}

export const neuraStorage = {
  /**
   * Check if Neura is activated
   */
  isActivated(): boolean {
    try {
      return localStorage.getItem(NEURA_ACTIVATION_KEY) === 'true';
    } catch (error) {
      console.error('Error checking Neura activation:', error);
      return false;
    }
  },

  /**
   * Activate Neura and dispatch event
   */
  activate(): void {
    try {
      localStorage.setItem(NEURA_ACTIVATION_KEY, 'true');
      
      // Dispatch event for components to listen to
      const event = new CustomEvent(NEURA_EVENT, { 
        detail: { activated: true }
      });
      window.dispatchEvent(event);
      
      console.log('Neura activated, event dispatched');
    } catch (error) {
      console.error('Error activating Neura:', error);
    }
  },

  /**
   * Deactivate Neura and dispatch event
   */
  deactivate(): void {
    try {
      localStorage.setItem(NEURA_ACTIVATION_KEY, 'false');
      
      // Dispatch event for components to listen to
      const event = new CustomEvent(NEURA_EVENT, { 
        detail: { activated: false }
      });
      window.dispatchEvent(event);
      
      console.log('Neura deactivated, event dispatched');
    } catch (error) {
      console.error('Error deactivating Neura:', error);
    }
  },
  
  /**
   * Add event listener for Neura state changes
   * @returns A function to remove the event listener
   */
  addActivationListener(callback: (activated: boolean) => void): () => void {
    const listener = (event: Event) => {
      const neuraEvent = event as NeuraStateEvent;
      callback(neuraEvent.detail.activated);
    };
    
    window.addEventListener(NEURA_EVENT, listener);
    return () => window.removeEventListener(NEURA_EVENT, listener);
  },

  /**
   * Get Neura name
   */
  getName(): string {
    try {
      return localStorage.getItem(NEURA_NAME_KEY) || 'My Neural Extension';
    } catch (error) {
      console.error('Error getting Neura name:', error);
      return 'My Neural Extension';
    }
  },

  /**
   * Set Neura name
   */
  setName(name: string): void {
    try {
      localStorage.setItem(NEURA_NAME_KEY, name);
    } catch (error) {
      console.error('Error setting Neura name:', error);
    }
  }
};