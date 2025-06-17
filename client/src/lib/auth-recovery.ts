/**
 * Firebase Authentication Recovery Utilities
 * Handles "missing initial state" and other Firebase auth errors
 */

export interface AuthRecoveryOptions {
  clearStorage?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Detects and cleans up corrupted Firebase authentication state
 */
export function cleanupCorruptedAuthState(): void {
  try {
    console.log("Starting Firebase auth state cleanup...");
    
    // Clear session storage completely
    sessionStorage.clear();
    
    // Clear specific localStorage keys that can cause "missing initial state"
    const authKeys = [
      'firebase:authUser',
      'firebase:previousAuthUser',
      'firebase:host',
      'firebase:heartbeat',
      'dotspark_user',
      'dotspark_session_active',
      'auth_timestamp'
    ];
    
    authKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Continue cleanup even if individual keys fail
      }
    });
    
    // Clear any Firebase-specific keys dynamically
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.includes('firebase') || key.includes('google-auth') || key.includes('auth')) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Continue cleanup
        }
      }
    });
    
    console.log("Firebase auth state cleanup completed");
  } catch (error) {
    console.warn("Auth state cleanup encountered an error, but continuing:", error);
  }
}

/**
 * Checks if the current environment might cause Firebase auth issues
 */
export function detectProblematicEnvironment(): {
  hasIssues: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for storage partitioning
  try {
    const testKey = 'firebase-test-' + Date.now();
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
  } catch (e) {
    issues.push("Session storage is not accessible");
    recommendations.push("Enable session storage in browser settings");
  }
  
  // Check for third-party cookies
  if (document.cookie === '') {
    try {
      document.cookie = 'test=1; SameSite=None; Secure';
      if (!document.cookie.includes('test=1')) {
        issues.push("Third-party cookies may be blocked");
        recommendations.push("Enable third-party cookies for authentication");
      }
      // Clean up test cookie
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (e) {
      issues.push("Cookie functionality limited");
      recommendations.push("Check browser cookie settings");
    }
  }
  
  // Check for incognito/private browsing
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
      if (estimate.quota && estimate.quota < 1024 * 1024 * 100) { // Less than 100MB typically indicates private browsing
        issues.push("Private browsing mode may limit authentication");
        recommendations.push("Try signing in using regular browsing mode");
      }
    }).catch(() => {
      // Storage API not available or limited
    });
  }
  
  return {
    hasIssues: issues.length > 0,
    issues,
    recommendations
  };
}

/**
 * Prepares the environment for Firebase authentication
 */
export async function prepareAuthEnvironment(): Promise<void> {
  console.log("Preparing environment for Firebase authentication...");
  
  // Clean up any existing corrupted state
  cleanupCorruptedAuthState();
  
  // Wait for any cleanup to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Detect and log any environmental issues
  const envCheck = detectProblematicEnvironment();
  if (envCheck.hasIssues) {
    console.warn("Potential authentication environment issues detected:", envCheck.issues);
    console.log("Recommendations:", envCheck.recommendations);
  }
  
  console.log("Auth environment preparation completed");
}

/**
 * Handles the specific "missing initial state" error with recovery
 */
export function handleMissingInitialStateError(error: any): Error {
  console.log("Handling missing initial state error...");
  
  // Perform immediate cleanup
  cleanupCorruptedAuthState();
  
  // Check if this is the specific error we're targeting
  const errorMessage = error.message || error.toString();
  const isMissingStateError = errorMessage.includes("missing initial state") ||
                             errorMessage.includes("sessionStorage is inaccessible") ||
                             errorMessage.includes("storage-partitioned");
  
  if (isMissingStateError) {
    return new Error("Authentication storage error detected. The page will refresh automatically to fix this issue.");
  }
  
  return error;
}

/**
 * Creates a recovery-enhanced Firebase auth function
 */
export function withAuthRecovery<T extends any[], R>(
  authFunction: (...args: T) => Promise<R>,
  options: AuthRecoveryOptions = {}
): (...args: T) => Promise<R> {
  const { clearStorage = true, retryAttempts = 2, retryDelay = 1000 } = options;
  
  return async (...args: T): Promise<R> => {
    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Auth retry attempt ${attempt}/${retryAttempts}`);
          if (clearStorage) {
            cleanupCorruptedAuthState();
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
        
        return await authFunction(...args);
      } catch (error: any) {
        const isLastAttempt = attempt === retryAttempts;
        const isMissingStateError = error.message?.includes("missing initial state");
        
        if (isMissingStateError && !isLastAttempt) {
          console.log("Missing initial state detected, preparing for retry...");
          cleanupCorruptedAuthState();
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        if (isLastAttempt) {
          throw handleMissingInitialStateError(error);
        }
        
        throw error;
      }
    }
    
    throw new Error("Authentication failed after all retry attempts");
  };
}