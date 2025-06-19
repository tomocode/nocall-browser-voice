// 電話番号フォーマット関数
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  // +81から始まる場合は0に変換
  if (phoneNumber.startsWith('+81')) {
    return '0' + phoneNumber.substring(3);
  }
  return phoneNumber;
}

// 通話時間フォーマット関数
export function formatDuration(seconds: number): string {
  if (seconds === 0) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
}

// 日時フォーマット関数
export function formatDateTime(dateStr: string): string {
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
}

// 通話ステータステキスト
export function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'completed': '完了',
    'busy': '話し中',
    'no-answer': '応答なし',
    'failed': '失敗',
    'canceled': 'キャンセル',
  };
  return statusMap[status] || status;
}

// 通話ステータス色
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-green-600';
    case 'busy': return 'text-yellow-600';
    case 'no-answer': return 'text-gray-600';
    case 'failed': return 'text-red-600';
    case 'canceled': return 'text-gray-500';
    default: return 'text-gray-700';
  }
}