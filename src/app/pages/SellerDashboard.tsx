import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, Users, Activity, Settings, LogOut,
  TrendingUp, DollarSign, ShoppingBag, UserPlus, Download,
  Plus, Edit, Trash2, Upload, CreditCard, FileText, Shield
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { OnlineIndicator } from '../components/OnlineIndicator';
import { useApp } from '../context/AppContext';
import { formatIndianCurrency } from '../utils/currencyUtils';
import { SoundManager } from '../utils/soundUtils';
import { notify } from '../components/NotificationSystem';
import { exportToExcel } from '../utils/excelExport';
import StorageManager, { Product, Agent } from '../utils/storageUtils';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type TabType = 'dashboard' | 'products' | 'customers' | 'analytics' | 'agents' | 'settings';

export function SellerDashboard() {
  const navigate = useNavigate();
  const { transactions, products, customers, agents, currentUser, addProduct, updateProduct, deleteProduct, addAgent, deleteAgent, refreshData, setCurrentUser } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newUpiId, setNewUpiId] = useState(StorageManager.get<string>('upiId', 'smartai@paytm'));

  // Calculate analytics - Memoized for performance
  const { totalRevenue, totalItemsSold, avgBillValue } = useMemo(() => {
    const revenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const itemsSold = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);
    const count = transactions.length;
    return {
      totalRevenue: revenue,
      totalItemsSold: itemsSold,
      avgBillValue: count > 0 ? revenue / count : 0
    };
  }, [transactions]);

  const totalCustomers = customers.length;
  const totalTransactions = transactions.length;

  // Recent transactions
  const recentTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  // Sales by day (last 7 days) - Memoized
  const salesByDay = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayStr = date.toISOString().split('T')[0];
      const daySales = transactions.filter(t => t.timestamp.startsWith(dayStr));
      return {
        name: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        sales: daySales.reduce((sum, t) => sum + t.total, 0),
        transactions: daySales.length
      };
    });
  }, [transactions]);

  // Top selling products - Memoized
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { product: Product; quantity: number }>();
    transactions.forEach(t => {
      t.items.forEach(item => {
        const existing = productSales.get(item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productSales.set(item.product.id, { product: item.product, quantity: item.quantity });
        }
      });
    });
    return Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [transactions]);

  // Category distribution - Memoized
  const categoryChart = useMemo(() => {
    const categoryData = new Map<string, number>();
    products.forEach(p => {
      categoryData.set(p.category, (categoryData.get(p.category) || 0) + 1);
    });
    return Array.from(categoryData.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

  const handleBackup = () => {
    const success = exportToExcel(backupPassword);
    if (success) {
      SoundManager.play('success');
      notify.success('Data backed up successfully!');
      setShowBackupModal(false);
      setBackupPassword('');
    } else {
      SoundManager.play('error');
      notify.error('Incorrect backup password');
    }
  };

  const handleLogout = () => {
    SoundManager.play('click');
    setCurrentUser(null); // Clear current user
    notify.info('Logged out successfully');
    navigate('/');
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct(product);
      notify.success('Product updated!');
    } else {
      addProduct(product);
      notify.success('Product added!');
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleUpdateUPI = () => {
    StorageManager.set('upiId', newUpiId);
    SoundManager.play('success');
    notify.success('UPI ID updated!');
    refreshData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 dark:from-black dark:via-indigo-950 dark:to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-white">Seller Dashboard</h1>
              <p className="text-sm text-gray-400">{currentUser?.name} • {currentUser?.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <OnlineIndicator />
            <ThemeToggle />
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-white hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 flex gap-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: Activity },
            { id: 'agents', label: 'Agents', icon: Shield },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  SoundManager.play('click');
                  setActiveTab(tab.id as TabType);
                }}
                whileHover={{ y: -2 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-xl transition-colors relative ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl text-white tabular-nums">{formatIndianCurrency(totalRevenue)}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Customers</p>
                <p className="text-3xl text-white tabular-nums">{totalCustomers}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Transactions</p>
                <p className="text-3xl text-white tabular-nums">{totalTransactions}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-orange-400" />
                  </div>
                  <Package className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Items Sold</p>
                <p className="text-3xl text-white tabular-nums">{totalItemsSold}</p>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-white text-lg mb-4">Sales Trend (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={salesByDay} id="sales-trend-chart">
                    <defs>
                      <linearGradient id="colorSales-trend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales-trend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-white text-lg mb-4">Product Categories</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart id="category-pie-chart">
                    <Pie
                      data={categoryChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChart.map((entry, index) => (
                        <Cell key={`category-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white text-lg mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                      <th className="pb-3">Invoice</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((t) => (
                      <tr key={t.id} className="text-white border-b border-white/5">
                        <td className="py-3">{t.invoiceNumber}</td>
                        <td className="py-3">{t.customerName}</td>
                        <td className="py-3 tabular-nums">{t.items.reduce((s, i) => s + i.quantity, 0)}</td>
                        <td className="py-3 tabular-nums">{formatIndianCurrency(t.total)}</td>
                        <td className="py-3">{t.paymentMethod}</td>
                        <td className="py-3 text-sm text-gray-400">
                          {new Date(t.timestamp).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-white">Product Management</h2>
              <motion.button
                onClick={() => {
                  SoundManager.play('click');
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Package className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => {
                          SoundManager.play('click');
                          setEditingProduct(product);
                          setShowProductModal(true);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          SoundManager.play('delete');
                          if (confirm(`Delete ${product.name}?`)) {
                            deleteProduct(product.id);
                            notify.success('Product deleted');
                          }
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <h3 className="text-white text-lg mb-2">{product.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white tabular-nums">{formatIndianCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stock:</span>
                      <span className="text-white tabular-nums">{product.stock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Barcode:</span>
                      <span className="text-white tabular-nums text-xs">{product.barcode}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl text-white">Advanced Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-white mb-2">Average Bill Value</h3>
                <p className="text-3xl text-green-400 tabular-nums">{formatIndianCurrency(avgBillValue)}</p>
              </div>
            </div>

            {/* Top 10 Products */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white text-lg mb-4">Top 10 Selling Products</h3>
              <div className="space-y-3">
                {topProducts.map((item, index) => (
                  <div key={item.product.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{item.product.name}</p>
                      <p className="text-sm text-gray-400">{item.quantity} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white tabular-nums">{formatIndianCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily transactions chart */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white text-lg mb-4">Transaction Count (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByDay} id="transaction-bar-chart">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="transactions" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl text-white">Settings</h2>

            {/* UPI Settings */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                UPI Payment Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">UPI ID</label>
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <motion.button
                  onClick={handleUpdateUPI}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                >
                  Update UPI ID
                </motion.button>
              </div>
            </div>

            {/* Backup System */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white text-lg mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Backup
              </h3>
              <p className="text-gray-400 mb-4">Export all data to Excel file (password protected)</p>
              <motion.button
                onClick={() => {
                  SoundManager.play('click');
                  setShowBackupModal(true);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                <Download className="w-5 h-5 inline mr-2" />
                Backup to Excel
              </motion.button>
            </div>

            {/* System Logs */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-white text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                System Logs
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {StorageManager.get('logs', []).slice(0, 20).map((log: any) => (
                  <div key={log.id} className="bg-white/5 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white">{log.action}: {log.details}</p>
                        <p className="text-gray-400 text-xs">{log.user}</p>
                      </div>
                      <p className="text-gray-500 text-xs whitespace-nowrap ml-4">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be similar... */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-2xl text-white">Customer Management</h2>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                      <th className="pb-3">ID</th>
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Phone</th>
                      <th className="pb-3">Loyalty Points</th>
                      <th className="pb-3">Total Purchases</th>
                      <th className="pb-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="text-white border-b border-white/5">
                        <td className="py-3">{customer.id}</td>
                        <td className="py-3">{customer.name}</td>
                        <td className="py-3">{customer.phone}</td>
                        <td className="py-3 tabular-nums">{customer.loyaltyPoints}</td>
                        <td className="py-3 tabular-nums">{customer.totalPurchases}</td>
                        <td className="py-3 text-sm text-gray-400">
                          {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-white">Agent Management</h2>
              <motion.button
                onClick={() => {
                  SoundManager.play('click');
                  setShowAgentModal(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white"
              >
                <Plus className="w-5 h-5" />
                Add Agent
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    {agent.role !== 'admin' && (
                      <motion.button
                        onClick={() => {
                          SoundManager.play('delete');
                          if (confirm(`Delete agent ${agent.name}?`)) {
                            deleteAgent(agent.id);
                            notify.success('Agent deleted');
                          }
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                  <h3 className="text-white text-lg mb-2">{agent.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-white">{agent.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Role:</span>
                      <span className="text-white capitalize">{agent.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{agent.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backup Modal */}
      {showBackupModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="w-full max-w-md bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-xl rounded-3xl border border-white/20 p-8"
          >
            <h3 className="text-2xl text-white mb-4">Backup Data</h3>
            <p className="text-gray-400 mb-6">Enter backup password to export data</p>
            <input
              type="password"
              value={backupPassword}
              onChange={(e) => setBackupPassword(e.target.value)}
              placeholder="Default: backup2026"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white mb-6 focus:outline-none focus:border-blue-500/50"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowBackupModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleBackup}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                Export
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
