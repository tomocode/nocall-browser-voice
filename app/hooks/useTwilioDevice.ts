'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { CallState } from '../components/CallStatus';
import { useNotifications } from './useNotifications';
import { logger } from '../lib/logger';

export interface TwilioDevice {
  device: Device | null;
  callState: CallState;
  currentCall: Call | null;
  isMuted: boolean;
  error: string | null;
  retryCount: number;
  incomingCall: Call | null;
  makeCall: (phoneNumber: string) => Promise<void>;
  hangUp: () => void;
  mute: () => void;
  unmute: () => void;
  retry: () => void;
  acceptCall: () => void;
  rejectCall: () => void;
}

export function useTwilioDevice(): TwilioDevice {
  const [device, setDevice] = useState<Device | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastPhoneNumber = useRef<string>('');
  const currentNotification = useRef<Notification | null>(null);
  const acceptCallRef = useRef<(() => void) | null>(null);
  const rejectCallRef = useRef<(() => void) | null>(null);
  const isInitializing = useRef(false);

  const { requestPermission } = useNotifications();

  const initializeDevice = useCallback(async () => {
    // すでにデバイスが初期化されているか、初期化中の場合はスキップ
    if (device || isInitializing.current) {
      logger.debug('Device already initialized or initializing, skipping...');
      return;
    }
    
    isInitializing.current = true;
    
    try {
      const response = await fetch('/api/token');
      if (!response.ok) {
        throw new Error('Failed to get access token');
      }
      
      const { token } = await response.json();
      
      const newDevice = new Device(token, {
        logLevel: 1,
      });

      newDevice.on('registered', () => {
        logger.info('Twilio Device registered');
        setCallState('idle');
        setError(null);
        
        // 通知許可をリクエスト（非同期で実行）
        requestPermission().catch((err) => logger.warn({ error: err }, 'Failed to request notification permission'));
      });

      newDevice.on('error', (error) => {
        logger.error({ error }, 'Twilio Device error');
        setError(error.message || 'Device error occurred');
        setCallState('ended');
      });

      newDevice.on('incoming', (call) => {
        logger.info({ from: call.parameters.From }, 'Incoming call received');
        setIncomingCall(call);
        setCallState('incoming');
        
        // ブラウザ通知を表示
        const fromNumber = call.parameters.From || '不明な番号';
        const formatPhoneNumber = (phone: string) => {
          if (phone.startsWith('+81')) {
            return '0' + phone.substring(3);
          }
          return phone;
        };
        
        // 通知関数を直接使用（依存関係を回避）
        if ('Notification' in window && Notification.permission === 'granted') {
          currentNotification.current = new Notification('着信通話', {
            body: `${formatPhoneNumber(fromNumber)}から着信があります。クリックして応答してください。`,
            tag: 'incoming-call',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            requireInteraction: true,
          });
          
          if (currentNotification.current) {
            currentNotification.current.onclick = () => {
              window.focus();
              acceptCallRef.current?.();
              currentNotification.current?.close();
            };
          }
        }
        
        // 着信イベントリスナーを設定
        call.on('cancel', () => {
          logger.info('Incoming call cancelled');
          if (currentNotification.current) {
            currentNotification.current.close();
            currentNotification.current = null;
          }
          setIncomingCall(null);
          setCallState('idle');
        });

        call.on('disconnect', () => {
          logger.info('Incoming call disconnected');
          if (currentNotification.current) {
            currentNotification.current.close();
            currentNotification.current = null;
          }
          setIncomingCall(null);
          setCurrentCall(null);
          setCallState('ended');
        });
      });

      await newDevice.register();
      setDevice(newDevice);
    } catch (err) {
      logger.error({ error: err }, 'Failed to initialize device');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      isInitializing.current = false;
    }
  }, []);

  useEffect(() => {
    initializeDevice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 一度だけ実行

  useEffect(() => {
    return () => {
      if (device) {
        device.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        logger.info('Call accepted');
        setCallState('in-call');
      });

      call.on('disconnect', () => {
        logger.info('Call disconnected');
        setCallState('ended');
        setCurrentCall(null);
        setIsMuted(false);
      });

      call.on('reject', () => {
        logger.info('Call rejected');
        setCallState('ended');
        setCurrentCall(null);
      });

      call.on('cancel', () => {
        logger.info('Call cancelled');
        setCallState('ended');
        setCurrentCall(null);
      });

      call.on('error', (error) => {
        // ConnectionError 31005 は通話終了時の正常なエラーなので無視
        if (error.code === 31005) {
          logger.debug('Call ended normally');
          setCallState('ended');
          setCurrentCall(null);
          return;
        }
        
        logger.error({ error }, 'Call error');
        setError(error.message || 'Call error occurred');
        setCallState('ended');
        setCurrentCall(null);
      });

    } catch (err) {
      logger.error({ error: err }, 'Failed to make call');
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
      setError(null);
      makeCall(lastPhoneNumber.current);
    } else {
      setError('最大再試行回数に達しました');
    }
  }, [retryCount, makeCall]);

  const acceptCall = useCallback(() => {
    if (incomingCall) {
      logger.info('Accepting incoming call');
      
      // 通知を閉じる
      if (currentNotification.current) {
        currentNotification.current.close();
        currentNotification.current = null;
      }
      
      incomingCall.accept();
      setCurrentCall(incomingCall);
      setIncomingCall(null);
      setCallState('in-call');

      // 通話中のイベントリスナーを設定
      incomingCall.on('disconnect', () => {
        logger.info('Call disconnected');
        setCallState('ended');
        setCurrentCall(null);
        setIsMuted(false);
      });
    }
  }, [incomingCall]);

  const rejectCall = useCallback(() => {
    if (incomingCall) {
      logger.info('Rejecting incoming call');
      
      // 通知を閉じる
      if (currentNotification.current) {
        currentNotification.current.close();
        currentNotification.current = null;
      }
      
      incomingCall.reject();
      setIncomingCall(null);
      setCallState('idle');
    }
  }, [incomingCall]);

  // refに関数を設定
  useEffect(() => {
    acceptCallRef.current = acceptCall;
    rejectCallRef.current = rejectCall;
  }, [acceptCall, rejectCall]);

  return {
    device,
    callState,
    currentCall,
    incomingCall,
    isMuted,
    error,
    retryCount,
    makeCall,
    hangUp,
    mute,
    unmute,
    retry,
    acceptCall,
    rejectCall,
  };
}