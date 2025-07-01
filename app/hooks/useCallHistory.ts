import { useTypedSWR, swrConfig } from '../lib/swr';
import { CallHistoryResponseSchema } from '../lib/schemas';

export function useCallHistory() {
  const { data, error, isLoading, mutate } = useTypedSWR(
    '/api/calls',
    CallHistoryResponseSchema,
    swrConfig
  );

  return {
    calls: data?.calls || [],
    isLoading,
    error,
    refreshHistory: mutate,
  };
}
