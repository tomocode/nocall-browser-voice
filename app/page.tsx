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
    retry,
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

  const handleRetry = () => {
    retry();
  };

  const clearError = () => {
    console.log('Clearing error');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browser Voice Call
          </h1>
          <p className="text-gray-600">
            Make calls directly from your browser
          </p>
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
            onRetry={handleRetry}
          />

          {callState === 'idle' && (
            <>
              <DialPad
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                onDial={handleDial}
              />
              
              <div className="text-center">
                <button
                  onClick={handleCall}
                  disabled={!phoneNumber.trim()}
                  className="w-full max-w-xs px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors"
                >
                  Call
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ErrorToast error={error} onClose={clearError} />
    </div>
  );
}
