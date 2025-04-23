
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Product, Quote } from "@/types";
import { supabase } from "@/supabaseClient";

export default function VendorDashboard() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .contains("vendor_ids", [currentUser?.id])
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
  

  const getQuoteForProduct = (productId: string) => {
    return quotes.find(quote => quote.productId === productId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-pulse text-purple">Loading products...</div>
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
          View assigned products and submit your quotes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Products needing quotes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Products Needing Quotes</h3>
            <p className="mt-1 text-sm text-gray-500">Products assigned to you waiting for pricing</p>
          </div>

          {products.filter(p => !getQuoteForProduct(p.id)).length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No products currently need quoting. Check back later!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {products
                .filter(product => !getQuoteForProduct(product.id))
                .map((product) => (
                  <li key={product.id} className="p-4 sm:p-6 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:flex-shrink-0 mb-4 sm:mb-0">
                        <img 
                          src={product.imageURLs[0]} 
                          alt={product.name}
                          className="h-32 w-32 object-cover rounded-md border border-gray-200" 
                        />
                      </div>
                      <div className="sm:ml-6 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(product.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                        <p className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Customer:</span> {product.customerName}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <Link to={`/product/${product.id}/quote`}>
                            <Button variant="purple">Submit Quote</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Submitted quotes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Your Submitted Quotes</h3>
            <p className="mt-1 text-sm text-gray-500">Quotes you've already provided</p>
          </div>

          {quotes.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">You haven't submitted any quotes yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {quotes.map((quote) => {
                const product = products.find(p => p.id === quote.productId);
                if (!product) return null;
                
                return (
                  <li key={quote.id} className="p-4 sm:p-6 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:flex-shrink-0 mb-4 sm:mb-0">
                        <img 
                          src={product.imageURLs[0]} 
                          alt={product.name}
                          className="h-32 w-32 object-cover rounded-md border border-gray-200" 
                        />
                      </div>
                      <div className="sm:ml-6 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Quoted
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(quote.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Your Quote:</span>
                            <span className="ml-2 text-sm text-gray-900">${quote.price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Customer:</span>
                            <span className="ml-2 text-sm text-gray-900">{product.customerName}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Your Notes:</span> {quote.notes}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <Link to={`/product/${product.id}/quote/edit`}>
                            <Button variant="outline" size="sm">Edit Quote</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
