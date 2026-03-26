import { motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useApp } from '../context/AppContext';
import { SoundManager } from '../utils/soundUtils';
import { notify } from '../components/NotificationSystem';

export function SellerLogin() {
  const navigate = useNavigate();
  const { agents, setCurrentUser } = useApp();
  const [sellerId, setSellerId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Admin login
    const admin = agents.find(a => a.role === 'admin' && a.id === sellerId && a.password === password);
    
    if (admin) {
      SoundManager.play('success');
      setCurrentUser({ id: admin.id, name: admin.name, role: admin.role });
      notify.success(`Welcome, ${admin.name}!`);
      navigate('/seller-dashboard');
    } else {
      SoundManager.play('error');
      notify.error('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-black dark:via-blue-950 dark:to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-40 right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <motion.button
          onClick={() => {
            SoundManager.play('click');
            navigate('/');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Glass card */}
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl" />
            <div className="absolute inset-0 border border-white/20 rounded-3xl" />

            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Title */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center"
                >
                  <Lock className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl text-white mb-2">Seller Login</h2>
                <p className="text-gray-300">Admin access to dashboard</p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Admin ID</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={sellerId}
                      onChange={(e) => setSellerId(e.target.value)}
                      placeholder="Enter admin ID"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="Enter password"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-lg">Login to Dashboard</span>
                </motion.button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-400">Default Admin: 1111 / admin123</p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Go to Agent Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
