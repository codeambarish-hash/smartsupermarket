import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, Banknote, CreditCard, Split, Check } from 'lucide-react';
import { SoundManager } from '../utils/soundUtils';
import { formatIndianCurrency } from '../utils/currencyUtils';
import { notify } from './NotificationSystem';
import StorageManager from '../utils/storageUtils';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onPaymentComplete: (method: string) => void;
}

export function PaymentModal({ total, onClose, onPaymentComplete }: PaymentModalProps) {
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'split' | null>(null);
  
  // Cash payment states
  const [denominations, setDenominations] = useState({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    coins: 0,
  });

  // Split payment states
  const [cashAmount, setCashAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);

  const cashTotal = Object.entries(denominations).reduce((sum, [denom, count]) => {
    if (denom === 'coins') return sum + count;
    return sum + parseInt(denom) * count;
  }, 0);

  const cashChange = cashTotal - total;

  const handleDenominationChange = (denom: keyof typeof denominations, value: number) => {
    SoundManager.play('click');
    setDenominations({ ...denominations, [denom]: Math.max(0, value) });
  };

  const handleCashPayment = () => {
    if (cashTotal < total) {
      SoundManager.play('error');
      notify.error('Insufficient cash amount');
      return;
    }
    SoundManager.play('payment');
    notify.success(`Payment successful! Change: ${formatIndianCurrency(cashChange)}`);
    onPaymentComplete('Cash');
  };

  const handleUPIPayment = () => {
    const upiId = StorageManager.get<string>('upiId', 'smartai@paytm');
    SoundManager.play('payment');
    notify.success(`UPI payment of ${formatIndianCurrency(total)} to ${upiId} successful!`);
    onPaymentComplete('UPI');
  };

  const handleSplitPayment = () => {
    if (cashAmount + upiAmount < total) {
      SoundManager.play('error');
      notify.error('Total amount is less than bill amount');
      return;
    }
    if (cashAmount + upiAmount > total) {
      SoundManager.play('error');
      notify.error('Total amount exceeds bill amount');
      return;
    }
    SoundManager.play('payment');
    notify.success('Split payment successful!');
    onPaymentComplete(`Split (Cash: ${formatIndianCurrency(cashAmount)} + UPI: ${formatIndianCurrency(upiAmount)})`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl text-white">Payment</h3>
            <p className="text-gray-400">Total Amount: <span className="text-white tabular-nums">{formatIndianCurrency(total)}</span></p>
          </div>
          <motion.button
            onClick={() => {
              SoundManager.play('click');
              onClose();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-white"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="p-6">
          {!paymentMode ? (
            // Payment mode selection
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                onClick={() => {
                  SoundManager.play('click');
                  setPaymentMode('cash');
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 hover:border-green-400 transition-colors"
              >
                <Banknote className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h4 className="text-white text-lg mb-1">Cash</h4>
                <p className="text-sm text-gray-400">Pay with cash</p>
              </motion.button>

              <motion.button
                onClick={() => {
                  SoundManager.play('click');
                  setPaymentMode('upi');
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/50 hover:border-blue-400 transition-colors"
              >
                <CreditCard className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h4 className="text-white text-lg mb-1">UPI</h4>
                <p className="text-sm text-gray-400">Pay with UPI</p>
              </motion.button>

              <motion.button
                onClick={() => {
                  SoundManager.play('click');
                  setPaymentMode('split');
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 hover:border-purple-400 transition-colors"
              >
                <Split className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h4 className="text-white text-lg mb-1">Split</h4>
                <p className="text-sm text-gray-400">Cash + UPI</p>
              </motion.button>
            </div>
          ) : paymentMode === 'cash' ? (
            // Cash payment UI
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMode(null)}
                className="text-blue-400 hover:text-blue-300 text-sm mb-2"
              >
                ← Back to payment methods
              </button>

              <h4 className="text-white text-lg mb-4">Enter Cash Denominations</h4>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(denominations).map(([denom, count]) => (
                  <div key={denom} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                    <label className="text-gray-400 text-sm mb-2 block">
                      {denom === 'coins' ? 'Coins (₹1/₹2/₹5)' : `₹${denom} Notes`}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDenominationChange(denom as any, count - 1)}
                        className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={count}
                        onChange={(e) => handleDenominationChange(denom as any, parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center tabular-nums focus:outline-none focus:border-blue-500/50"
                      />
                      <button
                        onClick={() => handleDenominationChange(denom as any, count + 1)}
                        className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Cash Received:</span>
                  <span className="text-white text-lg tabular-nums">{formatIndianCurrency(cashTotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Bill Total:</span>
                  <span className="text-white text-lg tabular-nums">{formatIndianCurrency(total)}</span>
                </div>
                <div className="h-px bg-white/20 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-white">Change:</span>
                  <span className={`text-xl tabular-nums ${cashChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatIndianCurrency(Math.max(0, cashChange))}
                  </span>
                </div>
              </div>

              <motion.button
                onClick={handleCashPayment}
                disabled={cashTotal < total}
                whileHover={{ scale: cashTotal >= total ? 1.02 : 1 }}
                whileTap={{ scale: cashTotal >= total ? 0.98 : 1 }}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 ${
                  cashTotal >= total
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                Complete Payment
              </motion.button>
            </div>
          ) : paymentMode === 'upi' ? (
            // UPI payment UI
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMode(null)}
                className="text-blue-400 hover:text-blue-300 text-sm mb-2"
              >
                ← Back to payment methods
              </button>

              <div className="text-center py-8">
                <div className="w-48 h-48 mx-auto mb-6 rounded-2xl bg-white p-4 flex items-center justify-center">
                  {/* QR Code placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-16 h-16 text-blue-500" />
                  </div>
                </div>
                <p className="text-white text-lg mb-2">Scan QR Code to Pay</p>
                <p className="text-gray-400 mb-4">UPI ID: {StorageManager.get<string>('upiId', 'smartai@paytm')}</p>
                <p className="text-2xl text-white tabular-nums mb-6">{formatIndianCurrency(total)}</p>
              </div>

              <motion.button
                onClick={handleUPIPayment}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirm UPI Payment
              </motion.button>
            </div>
          ) : (
            // Split payment UI
            <div className="space-y-4">
              <button
                onClick={() => setPaymentMode(null)}
                className="text-blue-400 hover:text-blue-300 text-sm mb-2"
              >
                ← Back to payment methods
              </button>

              <h4 className="text-white text-lg mb-4">Split Payment</h4>

              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                  <label className="text-gray-400 text-sm mb-2 block">Cash Amount</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCashAmount(val);
                      setUpiAmount(total - val);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white tabular-nums focus:outline-none focus:border-green-500/50"
                  />
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                  <label className="text-gray-400 text-sm mb-2 block">UPI Amount</label>
                  <input
                    type="number"
                    value={upiAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setUpiAmount(val);
                      setCashAmount(total - val);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white tabular-nums focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Total Split:</span>
                    <span className="text-white text-lg tabular-nums">{formatIndianCurrency(cashAmount + upiAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bill Total:</span>
                    <span className="text-white text-lg tabular-nums">{formatIndianCurrency(total)}</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleSplitPayment}
                  disabled={cashAmount + upiAmount !== total}
                  whileHover={{ scale: cashAmount + upiAmount === total ? 1.02 : 1 }}
                  whileTap={{ scale: cashAmount + upiAmount === total ? 0.98 : 1 }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 ${
                    cashAmount + upiAmount === total
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  Complete Split Payment
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
