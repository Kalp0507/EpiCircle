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
  customer_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_path: string;
  created_at: string;
}

export interface ProductVendor {
  id: string;
  product_id: string;
  vendor_id: string;
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
