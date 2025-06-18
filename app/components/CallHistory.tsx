'use client';

import { useState, useEffect } from 'react';

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

export default function CallHistory() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const response = await fetch('/api/calls');
      if (!response.ok) {
        throw new Error('Failed to fetch call history');
      }
      const data = await response.json();
      setCalls(data.calls);
      setError(null);
    } catch (err) {
      console.error('Error fetching calls:', err);
      setError('通話履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'completed': '完了',
      'busy': '話し中',
      'no-answer': '応答なし',
      'failed': '失敗',
      'canceled': 'キャンセル',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'busy': return 'text-yellow-600';
      case 'no-answer': return 'text-gray-600';
      case 'failed': return 'text-red-600';
      case 'canceled': return 'text-gray-500';
      default: return 'text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">通話履歴</h2>
        <div className="text-center py-4 text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">通話履歴</h2>
        <div className="text-center py-4 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">通話履歴</h2>
        <button
          onClick={fetchCallHistory}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          更新
        </button>
      </div>

      {calls.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          通話履歴がありません
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {calls.map((call) => (
            <div
              key={call.sid}
              className="border-b border-gray-200 pb-3 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{call.to}</span>
                    <span className={`text-sm ${getStatusColor(call.status)}`}>
                      {getStatusText(call.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDateTime(call.startTime)}
                    {call.duration > 0 && (
                      <span className="ml-2">
                        • {formatDuration(call.duration)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {call.price && (
                    <div className="text-sm text-gray-600">
                      {call.priceUnit}{call.price}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}