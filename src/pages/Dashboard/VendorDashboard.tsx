
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Eye, Package, CheckCircle, Clock } from "lucide-react";
import { Product, Quote } from "@/types";

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Industrial Generator",
    description: "High-capacity industrial generator for commercial use",
    imageURLs: ["https://placehold.co/400x300"],
    customer_id: "1",
    customerName: "XYZ Corp",
    intern_id: "1",
    internName: "Alice Intern",
    vendor_ids: ["1", "2"],
    vendorNames: ["John Vendor", "Jane Vendor"],
    created_at: "2023-05-15T10:00:00Z",
    selected_vendor_id: "1"
  },
  {
    id: "2",
    name: "Water Filtration System",
    description: "Commercial grade water filtration system",
    imageURLs: ["https://placehold.co/400x300"],
    customer_id: "2",
    customerName: "ABC Industries",
    intern_id: "1",
    internName: "Alice Intern",
    vendor_ids: ["1"],
    vendorNames: ["John Vendor"],
    created_at: "2023-06-20T14:30:00Z"
  },
  {
    id: "3",
    name: "Commercial HVAC System",
    description: "Energy-efficient HVAC solution for commercial spaces",
    imageURLs: ["https://placehold.co/400x300"],
    customer_id: "1",
    customerName: "XYZ Corp",
    intern_id: "1",
    internName: "Alice Intern",
    vendor_ids: ["1"],
    vendorNames: ["John Vendor"],
    created_at: "2023-07-10T11:15:00Z"
  },
];

const mockQuotes: Quote[] = [
  { 
    id: "1", 
    productId: "1", 
    vendorId: "1", 
    vendorName: "John Vendor", 
    price: 1500, 
    notes: "Can deliver within 2 weeks", 
    createdAt: "2023-05-20T11:00:00Z", 
    isSelected: true 
  },
  { 
    id: "3", 
    productId: "3", 
    vendorId: "1", 
    vendorName: "John Vendor", 
    price: 3200, 
    notes: "Premium quality with installation included", 
    createdAt: "2023-07-15T14:30:00Z", 
    isSelected: false 
  },
];

export default function VendorDashboard() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Filter products for this vendor
  const assignedProducts = mockProducts.filter(p => 
    p.vendor_ids.includes(currentUser?.id || "") || 
    p.vendorNames.includes(currentUser?.name || "")
  );

  const quotedProductIds = mockQuotes
    .filter(q => q.vendorId === currentUser?.id || q.vendorName === currentUser?.name)
    .map(q => q.productId);

  const unquotedProducts = assignedProducts.filter(p => !quotedProductIds.includes(p.id));
  const quotedProducts = assignedProducts.filter(p => quotedProductIds.includes(p.id));

  const handleViewDetail = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProductId(null);
  };

  const renderProductDetail = () => {
    const product = mockProducts.find(p => p.id === selectedProductId);
    if (!product) return <div>Product not found</div>;

    const quote = mockQuotes.find(q => 
      q.productId === product.id && 
      (q.vendorId === currentUser?.id || q.vendorName === currentUser?.name)
    );

    const isQuoted = !!quote;

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleBackToList} className="mr-2">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <h2 className="text-2xl font-bold">Product Details: {product.name}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <img 
                  src={product.imageURLs[0]} 
                  alt={product.name}
                  className="h-48 w-auto object-cover rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Name:</span> {product.name}
                </div>
                <div>
                  <span className="font-semibold">Description:</span> {product.description}
                </div>
                <div>
                  <span className="font-semibold">Customer:</span> {product.customerName}
                </div>
                <div>
                  <span className="font-semibold">Created:</span> {new Date(product.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {isQuoted ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold">Price:</span> ${quote.price.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold">Notes:</span> {quote.notes}
                  </div>
                  <div>
                    <span className="font-semibold">Date Quoted:</span> {new Date(quote.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    {quote.isSelected ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Selected by Customer
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Selection
                      </span>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <Link to={`/product/${product.id}/quote/edit`}>
                      <Button variant="outline" size="sm">Edit Quote</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submit Quote</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[250px]">
                <p className="text-center text-gray-500 mb-4">
                  You haven't quoted on this product yet
                </p>
                <Link to={`/product/${product.id}/quote`}>
                  <Button variant="purple">
                    Submit a Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {currentView === 'list' ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {currentUser?.name}
            </h1>
            <p className="text-gray-600 mt-1">
              View assigned products and submit your quotes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-row items-center pt-6">
                <div className="bg-blue-100 p-2 rounded-md">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Unquoted Products</p>
                  <h3 className="text-2xl font-bold">{unquotedProducts.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-row items-center pt-6">
                <div className="bg-green-100 p-2 rounded-md">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Quoted Products</p>
                  <h3 className="text-2xl font-bold">{quotedProducts.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-row items-center pt-6">
                <div className="bg-amber-100 p-2 rounded-md">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Selected Quotes</p>
                  <h3 className="text-2xl font-bold">
                    {mockQuotes.filter(q => 
                      (q.vendorId === currentUser?.id || q.vendorName === currentUser?.name) && 
                      q.isSelected
                    ).length}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products needing quotes */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Products Needing Quotes</h3>
              <p className="mt-1 text-sm text-gray-500">Products assigned to you waiting for pricing</p>
            </div>
            {unquotedProducts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No products currently need quoting. Check back later!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unquotedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.customerName}</TableCell>
                      <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetail(product.id)}
                          className="mr-2"
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Link to={`/product/${product.id}/quote`}>
                          <Button variant="purple" size="sm">
                            Quote
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Quoted products */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Your Submitted Quotes</h3>
              <p className="mt-1 text-sm text-gray-500">Quotes you've already provided</p>
            </div>

            {quotedProducts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">You haven't submitted any quotes yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotedProducts.map((product) => {
                    const quote = mockQuotes.find(q => 
                      q.productId === product.id && 
                      (q.vendorId === currentUser?.id || q.vendorName === currentUser?.name)
                    );
                    
                    return (
                      <TableRow key={product.id} className={quote?.isSelected ? "bg-green-50" : ""}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.customerName}</TableCell>
                        <TableCell>
                          ${quote ? quote.price.toFixed(2) : "N/A"}
                        </TableCell>
                        <TableCell>
                          {quote?.isSelected ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Selected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetail(product.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      ) : (
        renderProductDetail()
      )}
    </div>
  );
}
