export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  purchasePrice: number;
  salePrice: number;
  stock: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assessment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: AssessmentItem[];
  totalEstimatedValue: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  estimatedValue: number;
  actualPurchasePrice?: number;
  notes?: string;
}

export interface Purchase {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  assessmentId?: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check';
  createdAt: Date;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  condition: string;
  purchasePrice: number;
  barcode: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'electronic';
  createdAt: Date;
}

export interface SaleItem {
  id: string;
  productId: string;
  barcode: string;
  name: string;
  category: string;
  salePrice: number;
  quantity: number;
}

export interface DashboardStats {
  todaySales: number;
  todayPurchases: number;
  totalStock: number;
  lowStockItems: number;
  pendingAssessments: number;
}