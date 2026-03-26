import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

let notificationCounter = 0;
const listeners: ((notification: Notification) => void)[] = [];

export const notify = {
  success: (message: string, duration = 3000) => {
    const notification: Notification = {
      id: `notif-${++notificationCounter}`,
      type: 'success',
      message,
      duration,
    };
    listeners.forEach(listener => listener(notification));
  },
  error: (message: string, duration = 4000) => {
    const notification: Notification = {
      id: `notif-${++notificationCounter}`,
      type: 'error',
      message,
      duration,
    };
    listeners.forEach(listener => listener(notification));
  },
  warning: (message: string, duration = 3500) => {
    const notification: Notification = {
      id: `notif-${++notificationCounter}`,
      type: 'warning',
      message,
      duration,
    };
    listeners.forEach(listener => listener(notification));
  },
  info: (message: string, duration = 3000) => {
    const notification: Notification = {
      id: `notif-${++notificationCounter}`,
      type: 'info',
      message,
      duration,
    };
    listeners.forEach(listener => listener(notification));
  },
};

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const listener = (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);

      if (notification.duration) {
        const timeoutId = setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
          timeoutsRef.current.delete(notification.id);
        }, notification.duration);
        timeoutsRef.current.set(notification.id, timeoutId);
      }
    };

    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);

      // Clear all pending timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    // Clear timeout if exists
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'from-green-500/90 to-emerald-500/90 text-white border-green-400/30';
      case 'error':
        return 'from-red-500/90 to-rose-500/90 text-white border-red-400/30';
      case 'warning':
        return 'from-yellow-500/90 to-orange-500/90 text-white border-yellow-400/30';
      case 'info':
        return 'from-blue-500/90 to-cyan-500/90 text-white border-blue-400/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`
              min-w-[320px] max-w-md p-4 rounded-2xl
              bg-gradient-to-r ${getColors(notification.type)}
              backdrop-blur-xl border
              shadow-2xl pointer-events-auto
              flex items-start gap-3
            `}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <p className="flex-1 text-sm">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
