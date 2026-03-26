import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIndianCurrency } from '../utils/currencyUtils';
import { SoundManager } from '../utils/soundUtils';
import { notify } from './NotificationSystem';

interface LoyaltyPointsModalProps {
  subtotal: number;
  onClose: () => void;
  onApplyDiscount: (discount: number, pointsUsed: number) => void;
}

export function LoyaltyPointsModal({ subtotal, onClose, onApplyDiscount }: LoyaltyPointsModalProps) {
  const { currentCustomer } = useApp();
  const isFirstMount = useRef(true);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const availablePoints = currentCustomer?.loyaltyPoints || 0;
  const pointsEarned = Math.floor(subtotal / 100); // 1 point per ₹100
  const maxRedeemable = Math.min(availablePoints, Math.floor(subtotal * 0.1)); // Max 10% discount (1 point = ₹1)
  const discountAmount = pointsToRedeem; // 1 point = ₹1 discount

  useEffect(() => {
    // Auto-set to maximum redeemable only on initial mount
    if (isFirstMount.current) {
      setPointsToRedeem(maxRedeemable);
      isFirstMount.current = false;
    }
  }, [maxRedeemable]);

  const handleApply = () => {
    if (pointsToRedeem > availablePoints) {
      SoundManager.play('error');
      notify.error('Insufficient loyalty points');
      return;
    }

    SoundManager.play('success');
    notify.success(`Applied ${pointsToRedeem} points as discount!`);
    onApplyDiscount(discountAmount, pointsToRedeem);
    onClose();
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
        className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl text-white">Loyalty Points</h3>
              <p className="text-sm text-gray-400">{currentCustomer?.name}</p>
            </div>
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

        <div className="p-6 space-y-6">
          {/* Available points */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
            <p className="text-gray-400 text-sm mb-1">Available Points</p>
            <p className="text-4xl text-white tabular-nums">{availablePoints}</p>
          </div>

          {/* Points to earn */}
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Points to Earn</p>
                <p className="text-2xl text-green-400 tabular-nums">+{pointsEarned}</p>
                <p className="text-xs text-gray-500 mt-1">From this purchase</p>
              </div>
              <ArrowRight className="w-6 h-6 text-green-400" />
            </div>
          </div>

          {/* Redeem points */}
          <div className="space-y-3">
            <label className="block text-white">Redeem Points</label>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <input
                type="range"
                min="0"
                max={maxRedeemable}
                value={pointsToRedeem}
                onChange={(e) => {
                  SoundManager.play('click');
                  setPointsToRedeem(parseInt(e.target.value));
                }}
                className="w-full mb-3"
              />
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(Math.min(maxRedeemable, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-24 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white tabular-nums focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={() => {
                    SoundManager.play('click');
                    setPointsToRedeem(maxRedeemable);
                  }}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Use Maximum
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Maximum redeemable: {maxRedeemable} points</p>
            </div>
          </div>

          {/* Discount preview */}
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Discount Amount:</span>
              <span className="text-2xl text-blue-400 tabular-nums">-{formatIndianCurrency(discountAmount)}</span>
            </div>
          </div>

          {/* Apply button */}
          <motion.button
            onClick={handleApply}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={pointsToRedeem === 0}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 ${
              pointsToRedeem > 0
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
            }`}
          >
            Apply {pointsToRedeem} Points
          </motion.button>

          <button
            onClick={() => {
              SoundManager.play('click');
              onApplyDiscount(0, 0);
              onClose();
            }}
            className="w-full text-center text-gray-400 hover:text-white text-sm"
          >
            Skip and Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
