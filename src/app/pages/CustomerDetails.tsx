import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, User, Phone, Hash } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useApp } from '../context/AppContext';
import { SoundManager } from '../utils/soundUtils';
import { notify } from '../components/NotificationSystem';
import { Customer } from '../utils/storageUtils';

export function CustomerDetails() {
  const navigate = useNavigate();
  const { customers, addCustomer, setCurrentCustomer } = useApp();
  
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [isExisting, setIsExisting] = useState(false);

  useEffect(() => {
    // Generate random customer ID
    const newId = `C${Date.now().toString().slice(-6)}`;
    setCustomerId(newId);
  }, []);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    
    // Auto-retrieve customer if exists
    if (value.length === 10) {
      const existingCustomer = customers.find(c => c.phone === value);
      if (existingCustomer) {
        setCustomerId(existingCustomer.id);
        setCustomerName(existingCustomer.name);
        setIsExisting(true);
        SoundManager.play('success');
        notify.success('Customer found! Data loaded.');
      } else {
        setIsExisting(false);
      }
    }
  };

  const handleStartBilling = () => {
    if (!customerName.trim()) {
      SoundManager.play('error');
      notify.error('Please enter customer name');
      return;
    }

    if (phone.length !== 10) {
      SoundManager.play('error');
      notify.error('Please enter valid 10-digit phone number');
      return;
    }

    SoundManager.play('success');

    let customer: Customer;
    if (isExisting) {
      customer = customers.find(c => c.phone === phone)!;
    } else {
      customer = {
        id: customerId,
        name: customerName,
        phone,
        loyaltyPoints: 0,
        createdAt: new Date().toISOString(),
        totalPurchases: 0,
      };
      addCustomer(customer);
      notify.success('New customer created!');
    }

    setCurrentCustomer(customer);
    navigate('/billing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-black dark:via-blue-950 dark:to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-40 left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
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
            {/* Card background */}
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
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <User className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl text-white mb-2">Customer Details</h2>
                <p className="text-gray-300">Enter customer information to begin</p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Customer ID */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Customer ID</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Hash className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={customerId}
                      disabled
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                </motion.div>

                {/* Phone Number */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  {isExisting && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-green-400 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Existing customer found
                    </motion.p>
                  )}
                </motion.div>

                {/* Customer Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm text-gray-300 mb-2">Customer Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter full name"
                      disabled={isExisting}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={handleStartBilling}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 text-lg">Start Billing</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
