'use client';

import { useState, useEffect } from 'react';
import DialPad from './components/DialPad';
import CallStatus from './components/CallStatus';
import ErrorToast from './components/ErrorToast';
import { useTwilioDevice } from './hooks/useTwilioDevice';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  
  const {
    callState,
    isMuted,
    error,
    makeCall,
    hangUp,
    mute,
    unmute,
  } = useTwilioDevice();

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

  const formatPhoneNumberForDisplay = (phoneNumber: string) => {
    // +81から始まる場合は0に変換
    if (phoneNumber.startsWith('+81')) {
      return '0' + phoneNumber.substring(3);
    }
    return phoneNumber;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
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
            phoneNumber={phoneNumber}
            duration={callDuration}
            isMuted={isMuted}
            onMute={mute}
            onUnmute={unmute}
            onHangup={hangUp}
          />

          <DialPad
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            onDial={handleDial}
          />
          
          <div className="text-center">
            <button
              onClick={handleCall}
              disabled={!phoneNumber.trim() || (callState === 'dialing' || callState === 'ringing' || callState === 'in-call')}
              className="w-full max-w-xs px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors"
            >
              {(callState === 'dialing' || callState === 'ringing' || callState === 'in-call') ? '通話中' : '発信'}
            </button>
          </div>
        </div>
      </div>

      <ErrorToast error={error} onClose={clearError} />
    </div>
  );
}
