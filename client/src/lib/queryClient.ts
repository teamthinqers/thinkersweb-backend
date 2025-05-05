import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Simplified network status monitoring to prevent issues
export const networkStatus = {
  isOnline: navigator.onLine,
  serverAvailable: true,
  
  // Simplified listener system
  listeners: [] as Array<() => void>,
  
  addListener(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  },
  
  notifyListeners() {
    try {
      this.listeners.forEach(callback => {
        try {
          callback();
        } catch (err) {
          console.error("Error in network status listener:", err);
        }
      });
    } catch (err) {
      console.error("Error notifying listeners:", err);
    }
  },
  
  setServerStatus(available: boolean) {
    this.serverAvailable = available;
    this.notifyListeners();
  },
  
  // Simple retry logic
  canRetry() {
    return true; // Always allow retry
  }
};

// Listen for online/offline browser events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    networkStatus.isOnline = true;
    networkStatus.notifyListeners();
  });
  
  window.addEventListener('offline', () => {
    networkStatus.isOnline = false;
    networkStatus.setServerStatus(false);
    networkStatus.notifyListeners();
  });
}

// Custom error class for server connection issues
export class ServerConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerConnectionError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    if (res.status >= 500) {
      networkStatus.setServerStatus(false);
      throw new ServerConnectionError(`Server error: ${res.status}`);
    }
    throw new Error(`${res.status}: ${text}`);
  }
}

// Wrapper for fetch with better error handling
async function fetchWithErrorHandling(url: string, options: RequestInit): Promise<Response> {
  if (!networkStatus.isOnline) {
    throw new ServerConnectionError("You appear to be offline. Please check your internet connection.");
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Check for server errors (5xx) that require special handling
    if (response.status >= 500 && response.status < 600) {
      networkStatus.setServerStatus(false);
      throw new ServerConnectionError(`Server error: ${response.status}`);
    }
    
    // If we successfully connect, reset status
    networkStatus.setServerStatus(true);
    
    return response;
  } catch (error: any) {
    // Handle network errors or timeouts
    if (error.name === 'AbortError') {
      networkStatus.setServerStatus(false);
      throw new ServerConnectionError("Connection timed out. Server may be unavailable.");
    }
    
    if (error.message?.includes('fetch')) {
      networkStatus.setServerStatus(false);
      throw new ServerConnectionError("Cannot connect to server. Please try again later.");
    }
    
    // For any other network or connection-related error
    if (error instanceof TypeError && error.message.includes('network')) {
      networkStatus.setServerStatus(false);
      throw new ServerConnectionError("Network error. Please check your connection.");
    }
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  retryCount: number = 0
): Promise<Response> {
  try {
    const res = await fetchWithErrorHandling(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // We're not automatically throwing an error or parsing JSON
    // Instead we return the raw response so the caller can handle it
    return res;
  } catch (error) {
    // Check if we should retry connection errors
    if (
      error instanceof ServerConnectionError &&
      networkStatus.canRetry() &&
      retryCount < networkStatus.maxRetries
    ) {
      networkStatus.incrementAttempt();
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      
      console.log(`Connection error, retrying in ${delay}ms...`, error.message);
      
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiRequest(method, url, data, retryCount + 1);
    }
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetchWithErrorHandling(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Similar retry logic as apiRequest
      if (error instanceof ServerConnectionError && networkStatus.canRetry()) {
        networkStatus.incrementAttempt();
        throw error; // Let React Query handle the retry with its built-in mechanism
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Only retry for server connection errors with proper backoff
        if (error instanceof ServerConnectionError && failureCount < networkStatus.maxRetries) {
          return true;
        }
        return false;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry for server connection errors with proper backoff
        if (error instanceof ServerConnectionError && failureCount < networkStatus.maxRetries) {
          return true;
        }
        return false;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
