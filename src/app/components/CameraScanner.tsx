import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { X, Camera, Scan, Zap, Hand, Info } from 'lucide-react';
import { SoundManager } from '../utils/soundUtils';
import { notify } from './NotificationSystem';
import { useApp } from '../context/AppContext';
import { Product } from '../utils/storageUtils';

interface CameraScannerProps {
  mode: 'barcode' | 'ai-vision' | 'multi-scan';
  onClose: () => void;
  onProductScanned: (product: Product) => void;
}

export function CameraScanner({ mode, onClose, onProductScanned }: CameraScannerProps) {
  const { products } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedItems, setDetectedItems] = useState<Array<{ product: Product; confidence: number }>>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [showGestureInfo, setShowGestureInfo] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      // Clear any pending timeouts
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsScanning(true);
      simulateScanning();
    } catch (error) {
      notify.error('Camera access denied. Using demo mode.');
      // Use demo mode - simulate with random products
      setIsScanning(true);
      simulateScanning();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const simulateScanning = () => {
    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Simulate AI detection after 2 seconds
    scanTimeoutRef.current = setTimeout(() => {
      if (mode === 'barcode') {
        // Simulate barcode scan
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        if (randomProduct) {
          SoundManager.play('scan');
          notify.success(`Scanned: ${randomProduct.name}`);
          onProductScanned(randomProduct);
          if (mode !== 'multi-scan') {
            scanTimeoutRef.current = setTimeout(() => onClose(), 500);
          }
        }
      } else if (mode === 'ai-vision') {
        // Simulate AI vision detection with confidence
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const confidence = 0.75 + Math.random() * 0.2; // 75-95%
        if (randomProduct) {
          setDetectedItems([{ product: randomProduct, confidence }]);
        }
      } else if (mode === 'multi-scan') {
        // Simulate multiple detections with unique products
        const count = Math.min(3, products.length);
        const detected = [];
        const usedIds = new Set<string>();
        for (let i = 0; i < count && usedIds.size < count; i++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          if (!usedIds.has(randomProduct.id)) {
            const confidence = 0.7 + Math.random() * 0.25;
            detected.push({ product: randomProduct, confidence });
            usedIds.add(randomProduct.id);
          }
        }
        setDetectedItems(detected);
      }
    }, 2000);
  };

  const handleConfirmDetection = (product: Product) => {
    SoundManager.play('success');
    notify.success(`Added: ${product.name}`);
    onProductScanned(product);

    if (mode === 'multi-scan') {
      setDetectedItems(prev => prev.filter(item => item.product.id !== product.id));
      // Continue scanning
      scanTimeoutRef.current = setTimeout(() => simulateScanning(), 1000);
    } else {
      scanTimeoutRef.current = setTimeout(() => onClose(), 500);
    }
  };

  const handleReject = () => {
    SoundManager.play('click');
    setDetectedItems([]);
    simulateScanning();
  };

  const toggleGesture = () => {
    SoundManager.play('click');
    setGestureEnabled(!gestureEnabled);
    if (!gestureEnabled) {
      setShowGestureInfo(true);
      setTimeout(() => setShowGestureInfo(false), 5000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {mode === 'barcode' ? <Scan className="w-6 h-6 text-white" /> : <Camera className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h3 className="text-xl text-white">
                {mode === 'barcode' && 'Barcode Scanner'}
                {mode === 'ai-vision' && 'AI Vision Scanner'}
                {mode === 'multi-scan' && 'Multi-Scan Mode'}
              </h3>
              <p className="text-sm text-gray-400">
                {mode === 'barcode' && 'Scan product barcode'}
                {mode === 'ai-vision' && 'AI will detect and identify products'}
                {mode === 'multi-scan' && 'Scan multiple items continuously'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleGesture}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl ${gestureEnabled ? 'bg-green-500/20 border-green-500/50' : 'bg-white/10'} border border-white/20 text-white`}
            >
              <Hand className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => {
                SoundManager.play('click');
                stopCamera();
                onClose();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-white"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Scanning overlay */}
          {isScanning && (
            <div className="absolute inset-0">
              {/* Scan line animation */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                animate={{
                  top: ['0%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Corner markers */}
              <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-blue-500" />
              <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-blue-500" />
              <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-blue-500" />

              {/* Detection boxes (for AI mode) */}
              <AnimatePresence>
                {detectedItems.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute"
                    style={{
                      top: `${20 + index * 15}%`,
                      left: `${20 + index * 10}%`,
                      width: '200px',
                      height: '150px',
                    }}
                  >
                    <div className="w-full h-full border-2 border-green-500 rounded-lg relative">
                      <div className="absolute -top-8 left-0 right-0 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded text-sm">
                        {item.product.name} ({(item.confidence * 100).toFixed(0)}%)
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Gesture info overlay */}
          <AnimatePresence>
            {showGestureInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl flex items-center gap-3 border border-blue-400/50"
              >
                <Info className="w-5 h-5" />
                <div className="text-sm">
                  <p className="font-medium">Gesture Control Enabled (Demo)</p>
                  <p className="text-blue-100">Wave hand to scan • Point to select • Swipe to dismiss</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detection confirmation (for AI vision mode) */}
        <AnimatePresence>
          {mode === 'ai-vision' && detectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 border-t border-white/10"
            >
              <p className="text-white mb-4">Confirm detected product:</p>
              {detectedItems.map(item => (
                <div key={item.product.id} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-lg">{item.product.name}</h4>
                      <p className="text-gray-400 text-sm">Confidence: {(item.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={handleReject}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-white"
                      >
                        Reject
                      </motion.button>
                      <motion.button
                        onClick={() => handleConfirmDetection(item.product)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 rounded-xl bg-green-500/20 border border-green-500/50 text-white"
                      >
                        Confirm
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {mode === 'multi-scan' && detectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border-t border-white/10"
            >
              <p className="text-white mb-4">Tap to add items:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {detectedItems.map(item => (
                  <motion.button
                    key={item.product.id}
                    onClick={() => handleConfirmDetection(item.product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 text-left hover:bg-white/10 transition-colors"
                  >
                    <h4 className="text-white">{item.product.name}</h4>
                    <p className="text-gray-400 text-sm">{(item.confidence * 100).toFixed(0)}% confidence</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
