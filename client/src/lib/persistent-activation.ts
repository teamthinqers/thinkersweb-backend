// Persistent Activation System for Frontend
// Remembers activated users across sessions without authentication friction

interface ActivatedUser {
  id: number;
  email: string;
  name: string;
  activatedAt: string;
  lastUsed: string;
}

const STORAGE_KEY = 'dotspark-activated-users';

export class PersistentActivationManager {
  // Get currently activated user from localStorage
  static getCurrentUser(): ActivatedUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const users: ActivatedUser[] = JSON.parse(stored);
      const currentUser = users.find(u => u.lastUsed === this.getMostRecentLastUsed(users));
      
      console.log('🔍 Retrieved activated user from storage:', currentUser?.email || 'none');
      return currentUser || null;
    } catch (error) {
      console.error('Error retrieving activated user:', error);
      return null;
    }
  }

  // Get the most recent lastUsed timestamp
  private static getMostRecentLastUsed(users: ActivatedUser[]): string {
    return users.reduce((latest, user) => 
      new Date(user.lastUsed) > new Date(latest) ? user.lastUsed : latest, 
      users[0]?.lastUsed || ''
    );
  }

  // Save user as permanently activated
  static activateUser(userId: number, email?: string, name?: string): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let users: ActivatedUser[] = stored ? JSON.parse(stored) : [];
      
      // Remove existing user if present
      users = users.filter(u => u.id !== userId);
      
      // Add/update user
      const activatedUser: ActivatedUser = {
        id: userId,
        email: email || `user${userId}@dotspark.app`,
        name: name || `User ${userId}`,
        activatedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
      
      users.unshift(activatedUser); // Add to beginning
      
      // Keep only last 5 activated users
      if (users.length > 5) {
        users = users.slice(0, 5);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      console.log('✅ User permanently activated and saved:', activatedUser.email);
    } catch (error) {
      console.error('Error saving activated user:', error);
    }
  }

  // Update last used timestamp for existing user
  static updateLastUsed(userId: number): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      
      const users: ActivatedUser[] = JSON.parse(stored);
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].lastUsed = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        console.log('🔄 Updated last used timestamp for user:', users[userIndex].email);
      }
    } catch (error) {
      console.error('Error updating last used:', error);
    }
  }

  // Get user by ID from activated users
  static getActivatedUser(userId: number): ActivatedUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const users: ActivatedUser[] = JSON.parse(stored);
      return users.find(u => u.id === userId) || null;
    } catch (error) {
      console.error('Error getting activated user:', error);
      return null;
    }
  }

  // Check if user is already activated
  static isUserActivated(userId: number): boolean {
    const user = this.getActivatedUser(userId);
    return !!user;
  }

  // No default user - requires proper authentication
  static getDefaultUser(): ActivatedUser | null {
    return null; // Force proper authentication, no hardcoded fallback
  }

  // Auto-activate user on first dot creation - requires valid user ID
  static handleFirstDotCreation(userId?: number, email?: string, name?: string): ActivatedUser | null {
    if (!userId) {
      console.warn('Cannot activate user without valid user ID');
      return null; // Force proper authentication, no hardcoded fallback
    }
    
    if (!this.isUserActivated(userId)) {
      this.activateUser(userId, email, name);
      console.log('🎉 First dot created - user permanently activated!');
    } else {
      this.updateLastUsed(userId);
      console.log('🔄 Existing user - updated last used timestamp');
    }
    
    return this.getActivatedUser(userId);
  }

  // Get all activated users (for switching between accounts)
  static getAllActivatedUsers(): ActivatedUser[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting all activated users:', error);
      return [];
    }
  }

  // Clear all activation data (for debugging/reset)
  static clearAllActivations(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 All user activations cleared');
  }
}