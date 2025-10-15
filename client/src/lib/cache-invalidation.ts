import { queryClient } from './queryClient';

/**
 * Centralized cache invalidation for thoughts/dots
 * 
 * This ensures all related caches are properly invalidated when thoughts/dots are created, updated, or deleted.
 * 
 * CRITICAL: Always use these helpers instead of manual invalidation to prevent invisible saves.
 */

export type InvalidationScope = 
  | 'all'           // Invalidate everything (use for major operations)
  | 'social'        // Social feed only
  | 'myneura'       // Personal My Neura only
  | 'circle'        // Specific ThinQ Circle
  | 'thought'       // Specific thought details
  | 'stats';        // Stats and metrics only

interface InvalidateOptions {
  scopes: InvalidationScope[];
  circleId?: number;
  thoughtId?: number;
}

/**
 * Invalidate thought/dot caches based on the operation performed.
 * 
 * @example
 * // After creating a thought to Social Neura:
 * await invalidateThoughtCaches({ scopes: ['social', 'myneura', 'stats'] });
 * 
 * @example
 * // After deleting a thought:
 * await invalidateThoughtCaches({ scopes: ['all'] });
 * 
 * @example
 * // After sharing to a circle:
 * await invalidateThoughtCaches({ scopes: ['circle'], circleId: 123 });
 */
export async function invalidateThoughtCaches(options: InvalidateOptions): Promise<void> {
  const { scopes, circleId, thoughtId } = options;
  
  const promises: Promise<void>[] = [];

  // Handle 'all' scope - invalidate everything
  if (scopes.includes('all')) {
    promises.push(
      queryClient.invalidateQueries({ queryKey: ['/api/social/dots'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/dots'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/stats'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/neural-strength'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/user/sparks-count'] })
    );
    await Promise.all(promises);
    return;
  }

  // Social Neura feed
  if (scopes.includes('social')) {
    promises.push(
      queryClient.invalidateQueries({ queryKey: ['/api/social/dots'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/dots'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] })
    );
  }

  // My Neura (personal thoughts)
  if (scopes.includes('myneura')) {
    promises.push(
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/dots'] })
    );
  }

  // ThinQ Circle
  if (scopes.includes('circle') && circleId) {
    promises.push(
      queryClient.invalidateQueries({ queryKey: [`/api/thinq-circles/${circleId}/thoughts`] }),
      queryClient.invalidateQueries({ queryKey: [`/api/thinq-circles/${circleId}`] })
    );
  }

  // Specific thought details
  if (scopes.includes('thought') && thoughtId) {
    promises.push(
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${thoughtId}`] })
    );
  }

  // Stats and metrics
  if (scopes.includes('stats')) {
    promises.push(
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/stats'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/neural-strength'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/user/sparks-count'] })
    );
  }

  await Promise.all(promises);
}

/**
 * Standard invalidation patterns for common operations
 */
export const INVALIDATION_PATTERNS = {
  // Creating a thought
  CREATE_SOCIAL: { scopes: ['social' as const, 'myneura' as const, 'stats' as const] },
  CREATE_PERSONAL: { scopes: ['myneura' as const, 'stats' as const] },
  
  // Updating a thought
  UPDATE: { scopes: ['social' as const, 'myneura' as const, 'thought' as const] },
  
  // Deleting a thought
  DELETE: { scopes: ['all' as const] },
  
  // Sharing to circle
  SHARE_TO_CIRCLE: (circleId: number) => ({ scopes: ['circle' as const], circleId }),
  
  // Changing visibility
  CHANGE_VISIBILITY: { scopes: ['all' as const] },
};

/**
 * Verify that a thought appears in the expected location after save.
 * This helps catch cache invalidation bugs before users notice.
 * 
 * @param thoughtId - The ID of the thought to verify
 * @param location - Where the thought should appear ('social' | 'myneura' | 'circle')
 * @returns Promise<boolean> - true if found, false if missing
 */
export async function verifyThoughtVisibility(
  thoughtId: number, 
  location: 'social' | 'myneura' | 'circle',
  circleId?: number
): Promise<boolean> {
  // Give caches a moment to update
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    if (location === 'social') {
      const data = queryClient.getQueryData(['/api/social/dots']) as any;
      return data?.dots?.some((d: any) => d.id === thoughtId) || false;
    }
    
    if (location === 'myneura') {
      const data = queryClient.getQueryData(['/api/thoughts/myneura']) as any;
      return data?.thoughts?.some((t: any) => t.id === thoughtId) || false;
    }
    
    if (location === 'circle' && circleId) {
      const data = queryClient.getQueryData([`/api/thinq-circles/${circleId}/thoughts`]) as any;
      return data?.thoughts?.some((t: any) => t.id === thoughtId) || false;
    }
    
    return false;
  } catch {
    return false;
  }
}
