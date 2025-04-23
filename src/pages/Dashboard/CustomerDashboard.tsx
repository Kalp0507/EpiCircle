
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { supabase } from "@/supabaseClient";

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("customer_id", currentUser?.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchProducts();
    }
  }, [currentUser?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-pulse text-purple">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your products and review vendor quotes
          </p>
        </div>
        <Link to="/new-product">
          <Button variant="purple">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Your Products</h3>
          <p className="mt-1 text-sm text-gray-500">Products you've submitted for vendor quotes</p>
        </div>

        {products.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No products yet. Create your first one!</p>
            <Link to="/new-product" className="mt-4 inline-block">
              <Button variant="purple-outline" size="sm">Add Product</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:flex-shrink-0 mb-4 sm:mb-0">
                    <img 
                      src={product.imageURLs?.[0] || ""} 
                      alt={product.name}
                      className="h-32 w-32 object-cover rounded-md border border-gray-200" 
                    />
                  </div>
                  <div className="sm:ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-light text-purple-darker">
                          {product.vendor_ids.length} {product.vendor_ids.length === 1 ? 'vendor' : 'vendors'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                    <div className="mt-4 flex justify-end">
                      <Link to={`/product/${product.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
