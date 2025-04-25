
export type UserRole = 'vendor' | 'intern' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  location?: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageURLs: string[];
  customer_id: string;
  customerName: string;
  intern_id: string;
  internName: string;
  vendor_ids: string[];
  vendorNames: string[];
  created_at: string;
  selected_vendor_id?: string;
}

export interface Quote {
  id: string;
  productId: string;
  vendorId: string;
  vendorName: string;
  price: number;
  notes: string;
  createdAt: string;
  isSelected: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  location: string;
  created_at: string;
}

export interface Intern {
  id: string;
  name: string;
  phone: string;
  location: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  intern_id: string;
  product_ids: string[];
  vendor_ids: string[];
  created_at: string;
}