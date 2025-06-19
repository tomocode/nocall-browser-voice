'use client';

import { useState, useEffect } from 'react';
import DialPad from './components/DialPad';
import CallStatus from './components/CallStatus';
import CallHistory from './components/CallHistory';
import ErrorToast from './components/ErrorToast';
import { useTwilioDevice } from './hooks/useTwilioDevice';
import { useCallHistory } from './hooks/useCallHistory';
import { formatPhoneNumberForDisplay } from './lib/utils';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  
  const {
    callState,
    isMuted,
    error,
    incomingCall,
    makeCall,
    hangUp,
    mute,
    unmute,
    acceptCall,
    rejectCall,
  } = useTwilioDevice();

  const { refreshHistory } = useCallHistory();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'in-call') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callState]);

  // 通話終了時に履歴を更新
  useEffect(() => {
    if (callState === 'ended') {
      // 通話終了から少し遅延して履歴を更新（Twilioでの記録更新を待つ）
      const timer = setTimeout(() => {
        refreshHistory();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [callState, refreshHistory]);

  const handleCall = () => {
    if (phoneNumber.trim()) {
      makeCall(phoneNumber);
    }
  };

  const handleDial = (digit: string) => {
    console.log('Dialing digit:', digit);
  };



  const clearError = () => {
    console.log('Clearing error');
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="max-w-md mx-auto lg:mx-0 w-full">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ブラウザ音声通話
              </h1>
              <p className="text-gray-600">
                ブラウザから直接電話をかけることができます
              </p>
              {process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER && (
                <p className="text-sm text-gray-500 mt-2">
                  発信元番号: {formatPhoneNumberForDisplay(process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER)}
                </p>
              )}
            </header>

            <div className="space-y-6">
              <CallStatus
                callState={callState}
                phoneNumber={callState === 'incoming' && incomingCall ? 
                  formatPhoneNumberForDisplay(incomingCall.parameters.From || '') : 
                  phoneNumber}
                duration={callDuration}
                isMuted={isMuted}
                onMute={mute}
                onUnmute={unmute}
                onHangup={hangUp}
                onAccept={acceptCall}
                onReject={rejectCall}
              />

              <DialPad
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                onDial={handleDial}
              />
              
              <div className="text-center">
                <button
                  onClick={handleCall}
                  disabled={!phoneNumber.trim() || (callState === 'dialing' || callState === 'ringing' || callState === 'in-call' || callState === 'incoming')}
                  className="w-full max-w-xs px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors"
                >
                  {(callState === 'dialing' || callState === 'ringing' || callState === 'in-call') ? '通話中' : 
                   callState === 'incoming' ? '着信中' : '発信'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:mt-14">
            <CallHistory />
          </div>
        </div>
      </div>

      <ErrorToast error={error} onClose={clearError} />
    </div>
  );
}
