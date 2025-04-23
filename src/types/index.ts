
export type UserRole = 'customer' | 'vendor' | 'intern';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageURLs: string[];
  customer_id: string;
  customerName: string;
  vendor_ids: string[];
  created_at: string;
}

export interface Quote {
  id: string;
  productId: string;
  vendorId: string;
  vendorName: string;
  price: number;
  notes: string;
  createdAt: string;
}
