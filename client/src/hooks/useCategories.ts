import { useQuery } from "@tanstack/react-query";

export function useCategories(withCount: boolean = false) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/categories', { withCount }],
    queryFn: async ({ queryKey }) => {
      const url = `/api/categories${withCount ? '?withCount=true' : ''}`;
      const res = await fetch(url, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      
      return res.json();
    }
  });

  return {
    categories: data || [],
    isLoading,
    error
  };
}
