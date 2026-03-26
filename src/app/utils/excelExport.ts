import * as XLSX from 'xlsx';
import StorageManager, { Transaction, Customer, Product, Agent, SystemLog } from './storageUtils';

export function exportToExcel(password: string): boolean {
  // Verify password
  const correctPassword = 'backup2026'; // Default backup password
  const savedPassword = StorageManager.get<string>('backupPassword', correctPassword);
  
  if (password !== savedPassword) {
    return false;
  }

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Export Products
  const products = StorageManager.get<Product[]>('products', []);
  const productsWS = XLSX.utils.json_to_sheet(products);
  XLSX.utils.book_append_sheet(wb, productsWS, 'Products');

  // Export Customers
  const customers = StorageManager.get<Customer[]>('customers', []);
  const customersWS = XLSX.utils.json_to_sheet(customers);
  XLSX.utils.book_append_sheet(wb, customersWS, 'Customers');

  // Export Transactions
  const transactions = StorageManager.get<Transaction[]>('transactions', []);
  const transactionsFlat = transactions.map(t => ({
    'Invoice Number': t.invoiceNumber,
    'Customer ID': t.customerId,
    'Customer Name': t.customerName,
    'Subtotal': t.subtotal,
    'Loyalty Discount': t.loyaltyDiscount,
    'Total': t.total,
    'Payment Method': t.paymentMethod,
    'Date': new Date(t.timestamp).toLocaleDateString('en-IN'),
    'Time': new Date(t.timestamp).toLocaleTimeString('en-IN'),
  }));
  const transactionsWS = XLSX.utils.json_to_sheet(transactionsFlat);
  XLSX.utils.book_append_sheet(wb, transactionsWS, 'Transactions');

  // Export Agents (excluding passwords for security)
  const agents = StorageManager.get<Agent[]>('agents', []);
  const agentsSafe = agents.map(a => ({
    ID: a.id,
    Name: a.name,
    Role: a.role,
    'Created At': a.createdAt
  }));
  const agentsWS = XLSX.utils.json_to_sheet(agentsSafe);
  XLSX.utils.book_append_sheet(wb, agentsWS, 'Agents');

  // Export System Logs
  const logs = StorageManager.get<SystemLog[]>('logs', []);
  const logsWS = XLSX.utils.json_to_sheet(logs);
  XLSX.utils.book_append_sheet(wb, logsWS, 'System Logs');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `SmartAI_Backup_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);

  // Log the backup
  StorageManager.addLog('Backup', 'Admin', 'Data exported to Excel');

  return true;
}

export function setBackupPassword(newPassword: string): void {
  StorageManager.set('backupPassword', newPassword);
  StorageManager.addLog('Settings', 'Admin', 'Backup password changed');
}
