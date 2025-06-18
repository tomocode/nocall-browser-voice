'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { CallState } from '../components/CallStatus';

export interface TwilioDevice {
  device: Device | null;
  callState: CallState;
  currentCall: Call | null;
  isMuted: boolean;
  error: string | null;
  retryCount: number;
  makeCall: (phoneNumber: string) => Promise<void>;
  hangUp: () => void;
  mute: () => void;
  unmute: () => void;
  retry: () => void;
}

export function useTwilioDevice(): TwilioDevice {
  const [device, setDevice] = useState<Device | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastPhoneNumber = useRef<string>('');

  const initializeDevice = useCallback(async () => {
    try {
      const response = await fetch('/api/token');
      if (!response.ok) {
        throw new Error('Failed to get access token');
      }
      
      const { token } = await response.json();
      
      const newDevice = new Device(token, {
        logLevel: 1,
        codecPreferences: ['opus', 'pcmu'],
      });

      newDevice.on('registered', () => {
        console.log('Twilio Device registered');
        setCallState('idle');
        setError(null);
      });

      newDevice.on('error', (error) => {
        console.error('Twilio Device error:', error);
        setError(error.message || 'Device error occurred');
        setCallState('ended');
      });

      newDevice.on('incoming', (call) => {
        console.log('Incoming call received');
        setCurrentCall(call);
        setCallState('ringing');
      });

      await newDevice.register();
      setDevice(newDevice);
    } catch (err) {
      console.error('Failed to initialize device:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    initializeDevice();

    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, [initializeDevice]);

  const makeCall = useCallback(async (phoneNumber: string) => {
    if (!device || !phoneNumber) {
      setError('Device not ready or phone number is empty');
      return;
    }

    try {
      setError(null);
      setCallState('dialing');
      
      // 日本の電話番号フォーマットに対応
      let formattedNumber = phoneNumber.trim();
      
      // 090, 080, 070などで始まる場合は+81を付ける
      if (formattedNumber.match(/^0[789]0/)) {
        formattedNumber = '+81' + formattedNumber.substring(1);
      }
      // 03, 06などの固定電話番号の場合
      else if (formattedNumber.match(/^0[1-9]/)) {
        formattedNumber = '+81' + formattedNumber.substring(1);
      }
      // すでに+81で始まっている場合はそのまま
      else if (!formattedNumber.startsWith('+')) {
        // +がない場合は日本の番号として+81を付ける
        if (formattedNumber.startsWith('0')) {
          formattedNumber = '+81' + formattedNumber.substring(1);
        }
      }
      
      lastPhoneNumber.current = formattedNumber;

      const call = await device.connect({ 
        params: { To: formattedNumber }
      });

      setCurrentCall(call);

      call.on('accept', () => {
        console.log('Call accepted');
        setCallState('in-call');
      });

      call.on('disconnect', () => {
        console.log('Call disconnected');
        setCallState('ended');
        setCurrentCall(null);
        setIsMuted(false);
      });

      call.on('reject', () => {
        console.log('Call rejected');
        setCallState('ended');
        setCurrentCall(null);
      });

      call.on('cancel', () => {
        console.log('Call cancelled');
        setCallState('ended');
        setCurrentCall(null);
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        setError(error.message || 'Call error occurred');
        setCallState('ended');
        setCurrentCall(null);
      });

    } catch (err) {
      console.error('Failed to make call:', err);
      setError(err instanceof Error ? err.message : 'Failed to make call');
      setCallState('ended');
    }
  }, [device]);

  const hangUp = useCallback(() => {
    if (currentCall) {
      currentCall.disconnect();
    }
  }, [currentCall]);

  const mute = useCallback(() => {
    if (currentCall) {
      currentCall.mute(true);
      setIsMuted(true);
    }
  }, [currentCall]);

  const unmute = useCallback(() => {
    if (currentCall) {
      currentCall.mute(false);
      setIsMuted(false);
    }
  }, [currentCall]);

  const retry = useCallback(() => {
    if (retryCount < 3 && lastPhoneNumber.current) {
      setRetryCount(prev => prev + 1);
      makeCall(lastPhoneNumber.current);
    } else {
      setError('Maximum retry attempts reached');
    }
  }, [retryCount, makeCall]);

  return {
    device,
    callState,
    currentCall,
    isMuted,
    error,
    retryCount,
    makeCall,
    hangUp,
    mute,
    unmute,
    retry,
  };
}