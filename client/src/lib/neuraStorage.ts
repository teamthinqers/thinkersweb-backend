// Utility for Neura activation storage
const NEURA_ACTIVATION_KEY = 'neuraActivated';
const NEURA_NAME_KEY = 'neuraName';
const NEURA_EVENT = 'neura-state-changed';
const SETUP_COMPLETED_KEY = 'setupCompleted';
const INVITE_VALIDATED_KEY = 'inviteValidated';

// Custom event for Neura state changes
export interface NeuraStateEvent extends CustomEvent {
  detail: {
    activated: boolean;
  };
}

// Custom event for setup completion
export interface SetupCompletedEvent extends CustomEvent {
  detail: {
    completed: boolean;
  };
}

export const neuraStorage = {
  /**
   * Check if Neura is activated
   */
  isActivated(): boolean {
    try {
      // Get the value and log it for debugging
      const value = localStorage.getItem(NEURA_ACTIVATION_KEY);
      console.log('Checking neuraStorage activation, raw value:', value);
      
      // More explicit comparison to handle edge cases
      return value === 'true';
    } catch (error) {
      console.error('Error checking Neura activation:', error);
      return false;
    }
  },
  
  /**
   * Check if the setup process is completed
   */
  isSetupCompleted(): boolean {
    try {
      const value = localStorage.getItem(SETUP_COMPLETED_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking setup completion status:', error);
      return false;
    }
  },

  /**
   * Check if invite code has been validated before
   */
  isInviteValidated(): boolean {
    try {
      const value = localStorage.getItem(INVITE_VALIDATED_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking invite validation status:', error);
      return false;
    }
  },

  /**
   * Mark invite code as validated
   */
  markInviteValidated(): void {
    try {
      localStorage.setItem(INVITE_VALIDATED_KEY, 'true');
    } catch (error) {
      console.error('Error marking invite as validated:', error);
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
  },

  /**
   * Mark the setup process as completed
   */
  markSetupCompleted(): void {
    try {
      localStorage.setItem(SETUP_COMPLETED_KEY, 'true');
      
      // Dispatch event for setup completion
      const event = new CustomEvent('setup-completed', { 
        detail: { completed: true }
      });
      window.dispatchEvent(event);
      
      console.log('Setup process marked as completed, event dispatched');
    } catch (error) {
      console.error('Error marking setup as completed:', error);
    }
  },
  
  /**
   * Reset the setup completion status
   */
  resetSetupStatus(): void {
    try {
      localStorage.removeItem(SETUP_COMPLETED_KEY);
      
      // Dispatch event for setup completion reset
      const event = new CustomEvent('setup-completed', { 
        detail: { completed: false }
      });
      window.dispatchEvent(event);
      
      console.log('Setup completion status reset, event dispatched');
    } catch (error) {
      console.error('Error resetting setup status:', error);
    }
  },
  
  /**
   * Add setup completion state change listener
   * @param callback Function to call when setup completion state changes
   * @returns Unsubscribe function
   */
  addSetupCompletionListener(callback: (completed: boolean) => void): () => void {
    const listener = (event: Event) => {
      const setupEvent = event as SetupCompletedEvent;
      callback(setupEvent.detail.completed);
    };
    
    window.addEventListener('setup-completed', listener);
    return () => window.removeEventListener('setup-completed', listener);
  }
};