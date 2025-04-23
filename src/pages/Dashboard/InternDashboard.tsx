
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Product, Quote, User } from "@/types";

// Mock data
const mockProducts: Product[] = [
  {
    id: "prod1",
    name: "Antique Wooden Chair",
    description: "19th century oak chair with intricate carvings",
    images: ["https://placehold.co/400x300/E5DEFF/7E69AB?text=Chair+Image"],
    customer_id: "cust1",
    customerId: "cust1", // For backwards compatibility
    customerName: "Customer Demo",
    vendorIds: ["vend1", "vend2"],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // For backwards compatibility
  },
  {
    id: "prod2",
    name: "Vintage Gold Watch",
    description: "1950s Swiss made gold-plated wristwatch",
    images: ["https://placehold.co/400x300/E5DEFF/7E69AB?text=Watch+Image"],
    customer_id: "cust1",
    customerId: "cust1", // For backwards compatibility
    customerName: "Customer Demo",
    vendorIds: ["vend1"],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // For backwards compatibility
  },
];

const mockQuotes: Quote[] = [
  {
    id: "quote1",
    productId: "prod1",
    vendorId: "vend1",
    vendorName: "Vendor Demo",
    price: 450,
    notes: "Can restore minor damage if needed. Delivery in 3-5 days.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const mockUsers: User[] = [
  { id: "cust1", name: "Customer Demo", email: "customer@example.com", role: "customer" },
  { id: "vend1", name: "Vendor Demo", email: "vendor@example.com", role: "vendor" },
  { id: "vend2", name: "Vendor 2", email: "vendor2@example.com", role: "vendor" },
  { id: "int1", name: "Intern Demo", email: "intern@example.com", role: "intern" },
];

export default function InternDashboard() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(mockProducts);
        setQuotes(mockQuotes);
        setUsers(mockUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const usersByRole = {
    customer: users.filter(user => user.role === "customer").length,
    vendor: users.filter(user => user.role === "vendor").length,
    intern: users.filter(user => user.role === "intern").length,
  };

  const quoteStats = {
    total: quotes.length,
    averagePrice: quotes.length ? quotes.reduce((acc, quote) => acc + quote.price, 0) / quotes.length : 0,
    highestPrice: quotes.length ? Math.max(...quotes.map(quote => quote.price)) : 0,
    lowestPrice: quotes.length ? Math.min(...quotes.map(quote => quote.price)) : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-pulse text-purple">Loading data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {currentUser?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Platform overview and reporting dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-light text-purple">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Total Users</h2>
              <p className="text-2xl font-semibold text-gray-700">{users.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex text-xs text-gray-500 justify-between mt-1">
              <span>Customers: {usersByRole.customer}</span>
              <span>Vendors: {usersByRole.vendor}</span>
              <span>Interns: {usersByRole.intern}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-light text-purple">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Total Products</h2>
              <p className="text-2xl font-semibold text-gray-700">{products.length}</p>
            </div>
          </div>
          <div className="mt-4 flex text-xs text-gray-500 justify-between">
            <span>With quotes: {products.filter(p => quotes.some(q => q.productId === p.id)).length}</span>
            <span>Pending quotes: {products.filter(p => !quotes.some(q => q.productId === p.id)).length}</span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-light text-purple">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Quotes Submitted</h2>
              <p className="text-2xl font-semibold text-gray-700">{quoteStats.total}</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Average: ${quoteStats.averagePrice.toFixed(2)}</span>
              <span>Highest: ${quoteStats.highestPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-light text-purple">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Vendor Response Rate</h2>
              <p className="text-2xl font-semibold text-gray-700">
                {products.length > 0 ? 
                  Math.round((products.filter(p => quotes.some(q => q.productId === p.id)).length / products.length) * 100) + 
                  "%" : 
                  "0%"}
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <span>
              {quotes.length} quotes for {products.length} products
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Products</h3>
            <p className="mt-1 text-sm text-gray-500">Latest products submitted for quotes</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendors</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quotes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={product.images[0]} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(product.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.vendorIds.length}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {quotes.filter(q => q.productId === product.id).length}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Quotes</h3>
            <p className="mt-1 text-sm text-gray-500">Latest vendor quotes submitted</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No quotes submitted yet
                    </td>
                  </tr>
                ) : (
                  quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((quote) => {
                    const product = products.find(p => p.id === quote.productId);
                    
                    return (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={product?.images[0]} 
                                alt="" 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product?.name || "Unknown Product"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{quote.vendorName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${quote.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
