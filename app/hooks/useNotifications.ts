import { useEffect, useState } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const showNotification = (title: string, options?: NotificationOptions): Notification | null => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true, // 手動で閉じるまで表示
      ...options,
    });

    return notification;
  };

  const showIncomingCallNotification = (
    phoneNumber: string,
    onAccept?: () => void
  ): Notification | null => {
    const notification = showNotification('着信通話', {
      body: `${phoneNumber}から着信があります。クリックして応答してください。`,
      tag: 'incoming-call', // 同じタグの通知は置き換えられる
    });

    if (notification) {
      notification.onclick = () => {
        window.focus();
        onAccept?.();
        notification.close();
      };
    }

    return notification;
  };

  return {
    permission,
    requestPermission,
    showNotification,
    showIncomingCallNotification,
  };
}