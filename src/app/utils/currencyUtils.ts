// Indian Rupee currency formatting utility

export function formatIndianCurrency(amount: number): string {
  // Convert to Indian number format with ₹ symbol
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = absAmount.toFixed(2).split('.');
  
  // Apply Indian numbering system (lakhs and crores)
  let formattedInteger = '';
  const length = integerPart.length;
  
  if (length <= 3) {
    formattedInteger = integerPart;
  } else {
    // Last 3 digits
    formattedInteger = integerPart.slice(-3);
    let remaining = integerPart.slice(0, -3);
    
    // Add commas every 2 digits for the remaining part
    while (remaining.length > 0) {
      if (remaining.length <= 2) {
        formattedInteger = remaining + ',' + formattedInteger;
        remaining = '';
      } else {
        formattedInteger = remaining.slice(-2) + ',' + formattedInteger;
        remaining = remaining.slice(0, -2);
      }
    }
  }
  
  const formatted = `₹${formattedInteger}.${decimalPart}`;
  return isNegative ? `-${formatted}` : formatted;
}

export function parseIndianCurrency(value: string): number {
  // Remove ₹ symbol and commas, then parse
  const cleaned = value.replace(/₹|,/g, '');
  return parseFloat(cleaned) || 0;
}
