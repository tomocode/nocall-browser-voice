import useSWR, { SWRConfiguration } from 'swr';
import { z } from 'zod';
import { logger } from './logger';

// 型安全なfetcher関数
export const createTypedFetcher = <T>(schema: z.ZodSchema<T>) => {
  return async (url: string): Promise<T> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ status: response.status, error: errorText }, 'API request failed');
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      const validatedData = schema.parse(data);
      
      logger.debug({ url, data: validatedData }, 'API response validated');
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error({ error: error.errors, url }, 'API response validation failed');
        throw new Error(`API response validation failed: ${error.message}`);
      }
      throw error;
    }
  };
};

// 従来のfetcher関数（後方互換性のため）
export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, error: errorText }, 'Network request failed');
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// 型安全なuseSWRフック
export const useTypedSWR = <T>(
  key: string | null,
  schema: z.ZodSchema<T>,
  config?: SWRConfiguration
) => {
  const typedFetcher = createTypedFetcher(schema);
  return useSWR(key, typedFetcher, { ...swrConfig, ...config });
};

// 共通のSWR設定
export const swrConfig: SWRConfiguration = {
  refreshInterval: 0, // 自動更新無効
  revalidateOnFocus: false, // フォーカス時の再検証無効
  revalidateOnReconnect: false, // 再接続時の再検証無効
  dedupingInterval: 5000, // 5秒以内の重複リクエストを防止
  errorRetryCount: 2, // エラー時の再試行回数
  errorRetryInterval: 1000, // リトライ間隔
  onError: (error) => {
    logger.error({ error }, 'SWR error occurred');
  },
};