import useSWR from "swr";

interface CallRecord {
  sid: string;
  from: string;
  to: string;
  direction: string;
  status: string;
  duration: number;
  startTime: string;
  endTime: string | null;
  price: string | null;
  priceUnit: string | null;
}

interface CallHistoryResponse {
  calls: CallRecord[];
}

const fetcher = async (url: string): Promise<CallHistoryResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch call history");
  }
  return response.json();
};

export function useCallHistory() {
  const { data, error, isLoading, mutate } = useSWR<CallHistoryResponse>(
    "/api/calls",
    fetcher,
    {
      refreshInterval: 0, // 自動更新無効
      revalidateOnFocus: false, // フォーカス時の再検証無効
      revalidateOnReconnect: false, // 再接続時の再検証無効
      dedupingInterval: 10000, // 10秒以内の重複リクエストを防止
      errorRetryCount: 2, // エラー時の再試行回数
    }
  );

  return {
    calls: data?.calls || [],
    isLoading,
    error,
    refreshHistory: mutate,
  };
}
