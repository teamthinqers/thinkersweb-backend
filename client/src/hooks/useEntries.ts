import { useQuery } from "@tanstack/react-query";

interface EntriesOptions {
  limit?: number;
  offset?: number;
  categoryId?: number;
  tagIds?: number[];
  searchQuery?: string;
  favorite?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useEntries(options: EntriesOptions = {}) {
  const {
    limit = 10,
    offset = 0,
    categoryId,
    tagIds,
    searchQuery,
    favorite,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = options;

  const queryParams: Record<string, any> = {
    limit,
    offset,
    sortBy,
    sortOrder
  };

  if (categoryId) queryParams.categoryId = categoryId;
  if (tagIds && tagIds.length > 0) queryParams.tagIds = tagIds.join(',');
  if (searchQuery) queryParams.search = searchQuery;
  if (favorite !== undefined) queryParams.favorite = favorite;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/entries', queryParams]
  });

  return {
    entries: data?.entries || [],
    total: data?.total || 0,
    isLoading,
    error
  };
}

export function useEntry(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: id ? [`/api/entries/${id}`] : null,
    enabled: !!id
  });

  return {
    entry: data,
    isLoading,
    error
  };
}
