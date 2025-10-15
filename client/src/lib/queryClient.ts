import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Ultra-simplified network status without complex tracking
/**
 * A drastically simplified network status to prevent app crashing
 */
export const networkStatus = {
  isOnline: true,
  serverAvailable: true,
  connectionAttempts: 0,
  maxRetries: 3,
  
  // Add minimum required methods to prevent errors
  setServerStatus(available: boolean) {
    this.serverAvailable = available;
  },
  
  // Stub methods that return functions to prevent errors in other components
  addListener() {
    return () => {}; // Return empty cleanup function
  },
  
  // Functions required by retry logic
  canRetry() {
    return true;
  },
  
  incrementAttempt() {
    // Do nothing, just a stub
  }
};

// Custom error class for server connection issues
export class ServerConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerConnectionError';
  }
}

// Extremely simplified fetch without complex error handling
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  try {
    // Simple fetch with minimum options
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Check if the response is OK, if not throw an error
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      const errorMessage = errorText || `Request failed with status ${res.status}`;
      
      // Special handling for authentication errors
      if (res.status === 401) {
        throw new Error('Please sign in to continue');
      }
      
      throw new Error(errorMessage);
    }

    return res;
  } catch (error) {
    console.error("API request error:", error);
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
      // Handle array query keys where the second element contains params
      let url = queryKey[0] as string;
      
      // Add query parameters if they exist in the queryKey
      if (queryKey.length > 1 && typeof queryKey[1] === 'object') {
        const params = new URLSearchParams();
        Object.entries(queryKey[1] as Record<string, any>).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
        
        const queryString = params.toString();
        if (queryString) {
          url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
        }
      }
      
      console.log('Making API request to:', url);
      
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status}: ${errorText || res.statusText}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Query error:", error);
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
      retry: 1, // Simple retry - just once
      retryDelay: 1000, // Wait 1 second before retry
    },
    mutations: {
      retry: 1, // Simple retry - just once
      retryDelay: 1000, // Wait 1 second before retry
    },
  },
});
