import { QueryClient } from '@tanstack/react-query';

/**
 * Check if error is a network error
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Network request failed') ||
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.name === 'TypeError' ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

/**
 * Retry function with exponential backoff for network errors
 */
function retryWithBackoff(failureCount: number, error: unknown): boolean {
  // Don't retry if it's not a network error
  if (!isNetworkError(error)) {
    return false;
  }

  // Retry up to 2 times for network errors with exponential backoff
  if (failureCount < 2) {
    return true;
  }

  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryWithBackoff,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Don't throw errors to UI, handle them gracefully
      throwOnError: false,
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry network errors, max 1 time
        if (isNetworkError(error) && failureCount < 1) {
          return true;
        }
        return false;
      },
      throwOnError: false,
    },
  },
});

