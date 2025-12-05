/**
 * React Query Client Configuration for Web
 * Optimized defaults for web application
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests up to 2 times
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      // Data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Cache data for 10 minutes after it becomes unused
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      // Refetch on window focus (good for web apps)
      refetchOnWindowFocus: true,
      // Refetch when reconnecting to network
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

/**
 * Helper to handle query errors globally
 */
export function handleQueryError(error: unknown) {
  // You can add global error handling here
  // For example, log to error tracking service
  console.error('Query error:', error);
}

/**
 * Helper to handle mutation errors globally
 */
export function handleMutationError(error: unknown) {
  // You can add global error handling here
  console.error('Mutation error:', error);
}

