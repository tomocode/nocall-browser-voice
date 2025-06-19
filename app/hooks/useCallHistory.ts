import useSWR from 'swr';
import { fetcher, swrConfig } from '../lib/swr';
import { CallHistoryResponse } from '../types/call';

export function useCallHistory() {
  const { data, error, isLoading, mutate } = useSWR<CallHistoryResponse>(
    '/api/calls',
    fetcher,
    swrConfig
  );

  return {
    calls: data?.calls || [],
    isLoading,
    error,
    refreshHistory: mutate,
  };
}
