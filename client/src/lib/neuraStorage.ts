// Utility for Neura activation storage
const NEURA_ACTIVATION_KEY = 'neuraActivated';
const NEURA_NAME_KEY = 'neuraName';

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
   * Activate Neura
   */
  activate(): void {
    try {
      localStorage.setItem(NEURA_ACTIVATION_KEY, 'true');
    } catch (error) {
      console.error('Error activating Neura:', error);
    }
  },

  /**
   * Deactivate Neura
   */
  deactivate(): void {
    try {
      localStorage.setItem(NEURA_ACTIVATION_KEY, 'false');
    } catch (error) {
      console.error('Error deactivating Neura:', error);
    }
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