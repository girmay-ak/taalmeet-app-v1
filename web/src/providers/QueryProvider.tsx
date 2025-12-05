/**
 * React Query Provider for Web
 * Wraps the app with React Query context
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools can be added later if needed */}
      {/* Install: npm install @tanstack/react-query-devtools */}
      {/* {IS_DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
}
