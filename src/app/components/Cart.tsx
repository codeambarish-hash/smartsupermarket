import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIndianCurrency } from '../utils/currencyUtils';
import { SoundManager } from '../utils/soundUtils';
import { notify } from './NotificationSystem';

export function Cart() {
  const { cart, updateCartQuantity, removeFromCart } = useApp();

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleIncrement = (productId: string, currentQty: number) => {
    SoundManager.play('click');
    updateCartQuantity(productId, currentQty + 1);
  };

  const handleDecrement = (productId: string, currentQty: number) => {
    SoundManager.play('click');
    if (currentQty > 1) {
      updateCartQuantity(productId, currentQty - 1);
    }
  };

  const handleRemove = (productId: string, productName: string) => {
    SoundManager.play('delete');
    removeFromCart(productId);
    notify.info(`Removed ${productName} from cart`);
  };

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
        <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">Cart is empty</p>
        <p className="text-sm">Scan items to add them</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {cart.map((item) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
              layout
              className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-start gap-3">
                {/* Product image placeholder */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                </div>

                {/* Product details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white truncate">{item.product.name}</h4>
                  <p className="text-sm text-gray-400">{formatIndianCurrency(item.product.price)}</p>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <motion.button
                      onClick={() => handleDecrement(item.product.id, item.quantity)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    
                    <span className="w-12 text-center text-white tabular-nums">{item.quantity}</span>
                    
                    <motion.button
                      onClick={() => handleIncrement(item.product.id, item.quantity)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Item total and delete */}
                <div className="flex flex-col items-end gap-2">
                  <p className="text-white tabular-nums">
                    {formatIndianCurrency(item.product.price * item.quantity)}
                  </p>
                  <motion.button
                    onClick={() => handleRemove(item.product.id, item.product.name)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cart summary */}
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Items:</span>
          <span className="text-white tabular-nums">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white">Subtotal:</span>
          <span className="text-xl text-white tabular-nums">{formatIndianCurrency(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
