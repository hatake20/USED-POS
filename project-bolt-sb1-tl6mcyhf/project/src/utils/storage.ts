import { Customer, Product, Assessment, Purchase, Sale } from '../types';
import { exportToGoogleSheets } from './notifications';

const STORAGE_KEYS = {
  CUSTOMERS: 'pos_customers',
  PRODUCTS: 'pos_products',
  ASSESSMENTS: 'pos_assessments',
  PURCHASES: 'pos_purchases',
  SALES: 'pos_sales',
};

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Customer functions
export const getCustomers = (): Customer[] => getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
export const saveCustomers = (customers: Customer[]): void => saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);

export const findCustomerByPhone = (phone: string): Customer | undefined => {
  const customers = getCustomers();
  return customers.find(c => c.phone === phone);
};

export const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  
  // Google Sheetsに自動記録
  exportToGoogleSheets(newCustomer, 'customer');
  
  return newCustomer;
};

// Product functions
export const getProducts = (): Product[] => getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
export const saveProducts = (products: Product[]): void => saveToStorage(STORAGE_KEYS.PRODUCTS, products);

export const findProductByBarcode = (barcode: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.barcode === barcode);
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProductStock = (productId: string, newStock: number): void => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex !== -1) {
    products[productIndex].stock = newStock;
    products[productIndex].updatedAt = new Date();
    saveProducts(products);
  }
};

// Assessment functions
export const getAssessments = (): Assessment[] => getFromStorage<Assessment>(STORAGE_KEYS.ASSESSMENTS);
export const saveAssessments = (assessments: Assessment[]): void => saveToStorage(STORAGE_KEYS.ASSESSMENTS, assessments);

export const addAssessment = (assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Assessment => {
  const assessments = getAssessments();
  const newAssessment: Assessment = {
    ...assessment,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  assessments.push(newAssessment);
  saveAssessments(assessments);
  return newAssessment;
};

// Purchase functions
export const getPurchases = (): Purchase[] => getFromStorage<Purchase>(STORAGE_KEYS.PURCHASES);
export const savePurchases = (purchases: Purchase[]): void => saveToStorage(STORAGE_KEYS.PURCHASES, purchases);

export const addPurchase = (purchase: Omit<Purchase, 'id' | 'createdAt'>): Purchase => {
  const purchases = getPurchases();
  const newPurchase: Purchase = {
    ...purchase,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  purchases.push(newPurchase);
  savePurchases(purchases);
  
  // Add products to inventory
  purchase.items.forEach(item => {
    const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      barcode: item.barcode,
      name: item.name,
      category: item.category,
      condition: item.condition as any,
      purchasePrice: item.purchasePrice,
      salePrice: item.purchasePrice * 1.5, // 50% markup
      stock: 1,
    };
    addProduct(product);
  });
  
  return newPurchase;
};

// Sale functions
export const getSales = (): Sale[] => getFromStorage<Sale>(STORAGE_KEYS.SALES);
export const saveSales = (sales: Sale[]): void => saveToStorage(STORAGE_KEYS.SALES, sales);

export const addSale = (sale: Omit<Sale, 'id' | 'createdAt'>): Sale => {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  sales.push(newSale);
  saveSales(sales);
  
  // Update product stock
  sale.items.forEach(item => {
    const products = getProducts();
    const product = products.find(p => p.id === item.productId);
    if (product) {
      updateProductStock(item.productId, product.stock - item.quantity);
    }
  });
  
  return newSale;
};

// Generate barcode
export const generateBarcode = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 4);
};