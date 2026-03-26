// LocalStorage utility for offline mode and data persistence

export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  category: string;
  stock: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  createdAt: string;
  totalPurchases: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  loyaltyDiscount: number;
  total: number;
  paymentMethod: string;
  timestamp: string;
  invoiceNumber: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Agent {
  id: string;
  name: string;
  password: string;
  role: 'admin' | 'manager' | 'cashier';
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

class StorageManager {
  private static prefix = 'smartai_checkout_';

  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);

      // Check if it's a quota exceeded error
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.error('LocalStorage quota exceeded. Consider clearing old data.');
        // Notify user about storage limit
        if (typeof window !== 'undefined' && (window as any).notify) {
          (window as any).notify.error('Storage limit reached. Please backup and clear old data.');
        }
      }
      throw error; // Re-throw so calling code can handle it
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  static clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }

  // Initialize default data
  static initializeDefaultData(): void {
    const products = this.get<Product[]>('products', []);
    if (products.length === 0) {
      const defaultProducts: Product[] = [
        { id: 'P001', name: 'Premium Coffee Beans 500g', price: 499, barcode: '8901234567890', category: 'Beverages', stock: 50 },
        { id: 'P002', name: 'Organic Green Tea 100g', price: 299, barcode: '8901234567891', category: 'Beverages', stock: 75 },
        { id: 'P003', name: 'Whole Wheat Bread', price: 45, barcode: '8901234567892', category: 'Bakery', stock: 120 },
        { id: 'P004', name: 'Fresh Milk 1L', price: 62, barcode: '8901234567893', category: 'Dairy', stock: 200 },
        { id: 'P005', name: 'Basmati Rice 5kg', price: 650, barcode: '8901234567894', category: 'Grains', stock: 80 },
        { id: 'P006', name: 'Olive Oil 500ml', price: 850, barcode: '8901234567895', category: 'Cooking', stock: 40 },
        { id: 'P007', name: 'Dark Chocolate Bar', price: 120, barcode: '8901234567896', category: 'Snacks', stock: 150 },
        { id: 'P008', name: 'Mineral Water 1L', price: 20, barcode: '8901234567897', category: 'Beverages', stock: 300 },
        { id: 'P009', name: 'Organic Honey 250g', price: 380, barcode: '8901234567898', category: 'Food', stock: 60 },
        { id: 'P010', name: 'Fresh Apple 1kg', price: 180, barcode: '8901234567899', category: 'Fruits', stock: 100 },
        { id: 'P011', name: 'Pasta 500g', price: 95, barcode: '8901234567900', category: 'Grains', stock: 90 },
        { id: 'P012', name: 'Greek Yogurt 200g', price: 75, barcode: '8901234567901', category: 'Dairy', stock: 85 },
        { id: 'P013', name: 'Almonds 250g', price: 425, barcode: '8901234567902', category: 'Nuts', stock: 55 },
        { id: 'P014', name: 'Orange Juice 1L', price: 140, barcode: '8901234567903', category: 'Beverages', stock: 70 },
        { id: 'P015', name: 'Tomato Ketchup 500g', price: 110, barcode: '8901234567904', category: 'Condiments', stock: 95 },
      ];
      this.set('products', defaultProducts);
    }

    const customers = this.get<Customer[]>('customers', []);
    if (customers.length === 0) {
      const defaultCustomers: Customer[] = [
        { id: 'C001', name: 'Rajesh Kumar', phone: '9876543210', loyaltyPoints: 450, createdAt: '2025-01-15', totalPurchases: 12 },
        { id: 'C002', name: 'Priya Sharma', phone: '9876543211', loyaltyPoints: 320, createdAt: '2025-02-10', totalPurchases: 8 },
        { id: 'C003', name: 'Amit Patel', phone: '9876543212', loyaltyPoints: 580, createdAt: '2024-12-20', totalPurchases: 15 },
      ];
      this.set('customers', defaultCustomers);
    }

    const agents = this.get<Agent[]>('agents', []);
    if (agents.length === 0) {
      const defaultAgents: Agent[] = [
        { id: '7777', name: 'Default Agent', password: '12345678', role: 'cashier', createdAt: '2025-01-01' },
        { id: '1111', name: 'Admin User', password: 'admin123', role: 'admin', createdAt: '2025-01-01' },
        { id: '2222', name: 'Manager User', password: 'manager123', role: 'manager', createdAt: '2025-01-01' },
      ];
      this.set('agents', defaultAgents);
    }

    // Initialize UPI ID if not set
    const upiId = this.get<string>('upiId', '');
    if (!upiId) {
      this.set('upiId', 'smartai@paytm');
    }
  }

  static addLog(action: string, user: string, details: string): void {
    const logs = this.get<SystemLog[]>('logs', []);
    const newLog: SystemLog = {
      id: `LOG${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      user,
      details
    };
    logs.unshift(newLog);
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(1000);
    }
    this.set('logs', logs);
  }
}

export default StorageManager;
