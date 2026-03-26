import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import StorageManager, { Product, Customer, Transaction, CartItem, Agent, SystemLog } from '../utils/storageUtils';

interface AppContextType {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  agents: Agent[];
  logs: SystemLog[];
  cart: CartItem[];
  currentCustomer: Customer | null;
  currentUser: { id: string; name: string; role: string } | null;
  isOnline: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  addTransaction: (transaction: Transaction) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCurrentCustomer: (customer: Customer | null) => void;
  setCurrentUser: (user: { id: string; name: string; role: string } | null) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (agent: Agent) => void;
  deleteAgent: (agentId: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => StorageManager.get<CartItem[]>('cart', []));
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    StorageManager.set('cart', cart);
  }, [cart]);

  // Initialize data
  useEffect(() => {
    StorageManager.initializeDefaultData();
    refreshData();

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = () => {
    setProducts(StorageManager.get<Product[]>('products', []));
    setCustomers(StorageManager.get<Customer[]>('customers', []));
    setTransactions(StorageManager.get<Transaction[]>('transactions', []));
    setAgents(StorageManager.get<Agent[]>('agents', []));
    setLogs(StorageManager.get<SystemLog[]>('logs', []));
  };

  const addProduct = (product: Product) => {
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    StorageManager.set('products', updatedProducts);
    StorageManager.addLog('Product', currentUser?.name || 'System', `Added product: ${product.name}`);
  };

  const updateProduct = (product: Product) => {
    const updatedProducts = products.map(p => p.id === product.id ? product : p);
    setProducts(updatedProducts);
    StorageManager.set('products', updatedProducts);
    StorageManager.addLog('Product', currentUser?.name || 'System', `Updated product: ${product.name}`);
  };

  const deleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    StorageManager.set('products', updatedProducts);
    StorageManager.addLog('Product', currentUser?.name || 'System', `Deleted product: ${product?.name}`);
  };

  const addCustomer = (customer: Customer) => {
    const updatedCustomers = [...customers, customer];
    setCustomers(updatedCustomers);
    StorageManager.set('customers', updatedCustomers);
    StorageManager.addLog('Customer', currentUser?.name || 'System', `Added customer: ${customer.name}`);
  };

  const updateCustomer = (customer: Customer) => {
    const updatedCustomers = customers.map(c => c.id === customer.id ? customer : c);
    setCustomers(updatedCustomers);
    StorageManager.set('customers', updatedCustomers);
    StorageManager.addLog('Customer', currentUser?.name || 'System', `Updated customer: ${customer.name}`);
  };

  const addTransaction = (transaction: Transaction) => {
    const updatedTransactions = [transaction, ...transactions];
    setTransactions(updatedTransactions);
    StorageManager.set('transactions', updatedTransactions);
    StorageManager.addLog('Transaction', currentUser?.name || 'System', `Completed transaction: ${transaction.invoiceNumber}`);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity }]);
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addAgent = (agent: Agent) => {
    const updatedAgents = [...agents, agent];
    setAgents(updatedAgents);
    StorageManager.set('agents', updatedAgents);
    StorageManager.addLog('Agent', currentUser?.name || 'System', `Added agent: ${agent.name}`);
  };

  const updateAgent = (agent: Agent) => {
    const updatedAgents = agents.map(a => a.id === agent.id ? agent : a);
    setAgents(updatedAgents);
    StorageManager.set('agents', updatedAgents);
    StorageManager.addLog('Agent', currentUser?.name || 'System', `Updated agent: ${agent.name}`);
  };

  const deleteAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    const updatedAgents = agents.filter(a => a.id !== agentId);
    setAgents(updatedAgents);
    StorageManager.set('agents', updatedAgents);
    StorageManager.addLog('Agent', currentUser?.name || 'System', `Deleted agent: ${agent?.name}`);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        transactions,
        agents,
        logs,
        cart,
        currentCustomer,
        currentUser,
        isOnline,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        addTransaction,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        setCurrentCustomer,
        setCurrentUser,
        addAgent,
        updateAgent,
        deleteAgent,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
