// 共通のfetcher関数
export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// 共通のSWR設定
export const swrConfig = {
  refreshInterval: 0, // 自動更新無効
  revalidateOnFocus: false, // フォーカス時の再検証無効
  revalidateOnReconnect: false, // 再接続時の再検証無効
  dedupingInterval: 5000, // 5秒以内の重複リクエストを防止
  errorRetryCount: 2, // エラー時の再試行回数
  errorRetryInterval: 1000, // リトライ間隔
};