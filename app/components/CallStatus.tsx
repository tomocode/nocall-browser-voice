'use client';

export type CallState = 'idle' | 'dialing' | 'ringing' | 'in-call' | 'ended';

interface CallStatusProps {
  callState: CallState;
  phoneNumber: string;
  duration: number;
  isMuted: boolean;
  onMute: () => void;
  onUnmute: () => void;
  onHangup: () => void;
}

export default function CallStatus({ 
  callState, 
  phoneNumber, 
  duration, 
  isMuted, 
  onMute, 
  onUnmute, 
  onHangup
}: CallStatusProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumberForDisplay = (phoneNumber: string) => {
    // +81から始まる場合は0に変換
    if (phoneNumber.startsWith('+81')) {
      return '0' + phoneNumber.substring(3);
    }
    return phoneNumber;
  };

  const getStatusColor = () => {
    switch (callState) {
      case 'idle': return 'text-gray-500';
      case 'dialing': return 'text-yellow-500';
      case 'ringing': return 'text-blue-500';
      case 'in-call': return 'text-green-500';
      case 'ended': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (callState) {
      case 'idle': return '発信準備完了';
      case 'dialing': return '接続中...';
      case 'ringing': return '呼び出し中...';
      case 'in-call': return '通話中';
      case 'ended': return '通話終了';
      default: return '不明';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-4">
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          {phoneNumber && (
            <div className="text-lg text-gray-700 mt-2">
              {formatPhoneNumberForDisplay(phoneNumber)}
            </div>
          )}
          {callState === 'in-call' && (
            <div className="text-xl font-mono text-gray-600 mt-2">
              {formatDuration(duration)}
            </div>
          )}
        </div>

        {(callState === 'dialing' || callState === 'ringing' || callState === 'in-call') && (
          <div className="flex justify-center gap-4 mt-6">
            {callState === 'in-call' && (
              <button
                onClick={isMuted ? onUnmute : onMute}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {isMuted ? 'ミュート解除' : 'ミュート'}
              </button>
            )}
            <button
              onClick={onHangup}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-colors"
            >
              通話終了
            </button>
          </div>
        )}

      </div>
    </div>
  );
}