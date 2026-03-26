import { motion } from 'motion/react';
import { ShoppingCart, UserCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ThemeToggle } from '../components/ThemeToggle';
import { SoundManager } from '../utils/soundUtils';

export function IntroScreen() {
  const navigate = useNavigate();

  const handleNewBilling = () => {
    SoundManager.play('click');
    navigate('/customer-details');
  };

  const handleSellerLogin = () => {
    SoundManager.play('click');
    navigate('/seller-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-purple-950 dark:to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Theme toggle */}
      <div className="absolute top-8 right-8 z-10">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <motion.div
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                    '0 0 40px rgba(168, 85, 247, 0.5)',
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <ShoppingCart className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-7xl mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Smart AI Checkout
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 dark:text-gray-400 mb-12"
          >
            Futuristic Retail Solutions Powered by AI
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            {/* New Billing Button */}
            <motion.button
              onClick={handleNewBilling}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative w-64 h-16 rounded-2xl overflow-hidden"
            >
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-xl" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
              
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-50 blur-xl transition-opacity"
                animate={{
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center justify-center gap-3 h-full">
                <ShoppingCart className="w-6 h-6 text-white" />
                <span className="text-white text-lg">New Billing</span>
              </div>
            </motion.button>

            {/* Seller Login Button */}
            <motion.button
              onClick={handleSellerLogin}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group relative w-64 h-16 rounded-2xl overflow-hidden"
            >
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/80 to-pink-500/80 backdrop-blur-xl" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20" />
              
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 blur-xl transition-opacity"
                animate={{
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center justify-center gap-3 h-full">
                <UserCircle className="w-6 h-6 text-white" />
                <span className="text-white text-lg">Seller Login</span>
              </div>
            </motion.button>
          </motion.div>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-sm text-gray-400 dark:text-gray-500"
          >
            Experience the future of retail with AI-powered checkout
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
