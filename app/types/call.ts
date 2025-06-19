// 通話履歴の型定義
export interface CallRecord {
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

export interface CallHistoryResponse {
  calls: CallRecord[];
}