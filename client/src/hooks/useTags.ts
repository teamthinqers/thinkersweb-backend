import { useQuery } from "@tanstack/react-query";

export function useTags(withCount: boolean = false) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/tags', { withCount }],
    queryFn: async ({ queryKey }) => {
      const url = `/api/tags${withCount ? '?withCount=true' : ''}`;
      const res = await fetch(url, {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch tags");
      }
      
      return res.json();
    }
  });

  return {
    tags: data || [],
    isLoading,
    error
  };
}

export function useRelatedTags(tagId: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: tagId ? [`/api/tags/${tagId}/related`] : null,
    enabled: !!tagId
  });

  return {
    relatedTags: data || [],
    isLoading,
    error
  };
}
