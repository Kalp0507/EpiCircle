
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
  images: string[];
  customerId: string;
  customerName: string;
  vendorIds: string[];
  createdAt: string;
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
