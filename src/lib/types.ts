
export type UserRole = 'admin' | 'commercial' | 'warehouseManager';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  entryDate: string;
  image?: string;
  barcode?: string;
}

export interface Delivery {
  id: string;
  commercialManager: string;
  logisticsManager: string;
  customerName?: string;
  date: string;
  products: {
    productId: string;
    quantity: number;
    productName?: string; // Adding product name to display in delivery details
  }[];
  status: 'pending' | 'completed' | 'cancelled';
}

export type PagePermission = {
  [key in 'dashboard' | 'products' | 'delivery' | 'stock' | 'settings']: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
};

export const ROLE_PERMISSIONS: Record<UserRole, PagePermission> = {
  admin: {
    dashboard: { view: true, add: true, edit: true, delete: true },
    products: { view: true, add: true, edit: true, delete: true },
    delivery: { view: true, add: true, edit: true, delete: true },
    stock: { view: true, add: true, edit: true, delete: true },
    settings: { view: true, add: true, edit: true, delete: true },
  },
  warehouseManager: {
    dashboard: { view: true, add: false, edit: false, delete: false },
    products: { view: true, add: true, edit: true, delete: false },
    delivery: { view: true, add: true, edit: true, delete: false },
    stock: { view: true, add: true, edit: true, delete: true },
    settings: { view: false, add: false, edit: false, delete: false },
  },
  commercial: {
    dashboard: { view: true, add: false, edit: false, delete: false },
    products: { view: false, add: false, edit: false, delete: false },
    delivery: { view: true, add: false, edit: false, delete: false },
    stock: { view: true, add: false, edit: false, delete: false },
    settings: { view: false, add: false, edit: false, delete: false },
  },
};
