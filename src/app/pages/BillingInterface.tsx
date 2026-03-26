import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, Search, Camera, Sparkles, Grid3x3, User, 
  CreditCard, FileText, Gift
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { OnlineIndicator } from '../components/OnlineIndicator';
import { Cart } from '../components/Cart';
import { CameraScanner } from '../components/CameraScanner';
import { PaymentModal } from '../components/PaymentModal';
import { LoyaltyPointsModal } from '../components/LoyaltyPointsModal';
import { useApp } from '../context/AppContext';
import { SoundManager } from '../utils/soundUtils';
import { notify } from '../components/NotificationSystem';
import { formatIndianCurrency } from '../utils/currencyUtils';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { Transaction } from '../utils/storageUtils';

type ScannerMode = 'barcode' | 'ai-vision' | 'multi-scan' | null;

export function BillingInterface() {
  const navigate = useNavigate();
  const { 
    products, 
    cart, 
    currentCustomer, 
    addToCart, 
    clearCart,
    updateCustomer,
    addTransaction,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [scannerMode, setScannerMode] = useState<ScannerMode>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal - loyaltyDiscount;

  // Auto-open scanner on mount
  useEffect(() => {
    if (!currentCustomer) {
      navigate('/customer-details');
      return;
    }
    // Auto-open multi-scan
    setTimeout(() => {
      setScannerMode('multi-scan');
    }, 500);
  }, [currentCustomer, navigate]);

  const handleProductScanned = (product: any) => {
    addToCart(product);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      notify.error('Please enter a search query');
      return;
    }

    const found = products.find(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
    );

    if (found) {
      SoundManager.play('success');
      addToCart(found);
      notify.success(`Added ${found.name} to cart`);
      setSearchQuery('');
    } else {
      SoundManager.play('error');
      notify.error('Product not found');
    }
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      SoundManager.play('error');
      notify.error('Cart is empty');
      return;
    }

    SoundManager.play('click');
    setShowLoyalty(true);
  };

  const handleLoyaltyApplied = (discount: number, points: number) => {
    setLoyaltyDiscount(discount);
    setPointsUsed(points);
    setShowPayment(true);
  };

  const handlePaymentComplete = (method: string) => {
    SoundManager.play('payment');
    
    // Create transaction with unique IDs
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    const transaction: Transaction = {
      id: `TXN${timestamp}${randomSuffix}`,
      customerId: currentCustomer!.id,
      customerName: currentCustomer!.name,
      items: cart,
      subtotal,
      loyaltyDiscount,
      total,
      paymentMethod: method,
      timestamp: new Date().toISOString(),
      invoiceNumber: `INV${timestamp}-${randomSuffix}`,
    };

    addTransaction(transaction);

    // Update customer loyalty points
    const pointsEarned = Math.floor(subtotal / 100);
    const newPoints = (currentCustomer!.loyaltyPoints - pointsUsed) + pointsEarned;
    updateCustomer({
      ...currentCustomer!,
      loyaltyPoints: newPoints,
      totalPurchases: currentCustomer!.totalPurchases + 1,
    });

    setLastTransaction(transaction);
    setShowPayment(false);
    setShowInvoice(true);
    
    notify.success('Payment successful! 🎉');
  };

  const handleDownloadInvoice = () => {
    if (lastTransaction) {
      SoundManager.play('click');
      generateInvoicePDF(lastTransaction, currentCustomer!.phone);
      notify.success('Invoice downloaded!');
    }
  };

  const handleNewBill = () => {
    SoundManager.play('click');
    clearCart();
    setLoyaltyDiscount(0);
    setPointsUsed(0);
    setShowInvoice(false);
    setLastTransaction(null);
    navigate('/customer-details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 dark:from-black dark:via-indigo-950 dark:to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => {
                SoundManager.play('click');
                navigate('/');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div>
              <h1 className="text-2xl text-white">Smart AI Checkout</h1>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-400">{currentCustomer?.name}</p>
                <span className="text-gray-600">•</span>
                <p className="text-sm text-gray-400">{currentCustomer?.phone}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <OnlineIndicator />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-[calc(100vh-5rem)]">
        {/* Left side - Controls */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-white text-lg mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Product
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or barcode..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50"
              />
              <motion.button
                onClick={handleSearch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                Search
              </motion.button>
            </div>
          </motion.div>

          {/* Scanner buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.button
              onClick={() => {
                SoundManager.play('click');
                setScannerMode('barcode');
              }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/50 hover:border-blue-400 transition-all"
            >
              <Camera className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h4 className="text-white text-lg mb-1">Scan Item</h4>
              <p className="text-sm text-gray-400">Barcode scanner</p>
            </motion.button>

            <motion.button
              onClick={() => {
                SoundManager.play('click');
                setScannerMode('ai-vision');
              }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 hover:border-purple-400 transition-all"
            >
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h4 className="text-white text-lg mb-1">AI Vision</h4>
              <p className="text-sm text-gray-400">Smart detection</p>
            </motion.button>

            <motion.button
              onClick={() => {
                SoundManager.play('click');
                setScannerMode('multi-scan');
              }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 hover:border-green-400 transition-all"
            >
              <Grid3x3 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-white text-lg mb-1">Multi Scan</h4>
              <p className="text-sm text-gray-400">Continuous mode</p>
            </motion.button>
          </motion.div>

          {/* Bill summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-white text-lg mb-4">Bill Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white text-lg tabular-nums">{formatIndianCurrency(subtotal)}</span>
              </div>
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Loyalty Discount
                  </span>
                  <span className="text-green-400 text-lg tabular-nums">-{formatIndianCurrency(loyaltyDiscount)}</span>
                </div>
              )}
              <div className="h-px bg-white/20" />
              <div className="flex justify-between items-center">
                <span className="text-white">Total Amount</span>
                <span className="text-2xl text-white tabular-nums">{formatIndianCurrency(total)}</span>
              </div>
            </div>

            <motion.button
              onClick={handleProceedToPayment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={cart.length === 0}
              className={`w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-2 ${
                cart.length > 0
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Proceed to Payment
            </motion.button>
          </motion.div>
        </div>

        {/* Right side - Cart */}
        <div className="w-[400px] border-l border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl text-white flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Shopping Cart
            </h2>
          </div>
          <Cart />
        </div>
      </div>

      {/* Camera Scanner Modal */}
      <AnimatePresence>
        {scannerMode && (
          <CameraScanner
            mode={scannerMode}
            onClose={() => setScannerMode(null)}
            onProductScanned={handleProductScanned}
          />
        )}
      </AnimatePresence>

      {/* Loyalty Points Modal */}
      <AnimatePresence>
        {showLoyalty && (
          <LoyaltyPointsModal
            subtotal={subtotal}
            onClose={() => setShowLoyalty(false)}
            onApplyDiscount={handleLoyaltyApplied}
          />
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <PaymentModal
            total={total}
            onClose={() => setShowPayment(false)}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </AnimatePresence>

      {/* Invoice Success Modal */}
      <AnimatePresence>
        {showInvoice && lastTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md bg-gradient-to-br from-green-900/95 to-emerald-900/95 backdrop-blur-xl rounded-3xl border border-green-500/30 overflow-hidden p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  ✓
                </motion.div>
              </motion.div>

              <h2 className="text-3xl text-white mb-2">Payment Successful!</h2>
              <p className="text-green-200 mb-6">Invoice #{lastTransaction.invoiceNumber}</p>

              <div className="space-y-3">
                <motion.button
                  onClick={handleDownloadInvoice}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-colors"
                >
                  Download Invoice PDF
                </motion.button>

                <motion.button
                  onClick={handleNewBill}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                >
                  New Bill
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
