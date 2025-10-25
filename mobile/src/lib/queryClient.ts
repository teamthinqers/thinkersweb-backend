import { QueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// Create the query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Default fetcher for queries - works with React Query's queryKey
export const defaultQueryFn = async ({ queryKey }: { queryKey: any[] }) => {
  const url = queryKey[0];
  if (typeof url !== 'string') {
    throw new Error('Query key must start with a URL string');
  }
  
  const response = await api.get(url);
  return response.data;
};

// API request helper for mutations
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any
) {
  const response = await api.request({
    method,
    url,
    data,
  });
  return response.data;
}
