import { motion } from 'motion/react';
import { Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function OnlineIndicator() {
  const { isOnline } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border ${
        isOnline
          ? 'bg-green-500/20 border-green-500/50 text-green-400'
          : 'bg-red-500/20 border-red-500/50 text-red-400'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm">Online</span>
          <motion.div
            className="w-2 h-2 rounded-full bg-green-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">Offline</span>
          <motion.div
            className="w-2 h-2 rounded-full bg-red-400"
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        </>
      )}
    </motion.div>
  );
}
