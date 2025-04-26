
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Eye, Package, CheckCircle, Clock } from "lucide-react";
import { Order, Product, Quote } from "@/types";
import { supabase } from "@/supabaseClient";

export default function VendorDashboard() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [unquotedOrders, setUnquotedOrders] = useState([]);
  const [quotedOrders, setQuotedOrders] = useState([]);

  useEffect(()=>{
    async function getOrdersByVendor(vendorId: string) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .contains("vendor_ids", [vendorId]);
    
      if (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    
      return data;
    }

    async function getProductVendorsByVendor(vendorId: string) {
      const { data, error } = await supabase
        .from("product_vendors")
        .select("*")
        .eq("vendor_id", vendorId);
    
      if (error) {
        console.error("Error fetching product_vendors:", error);
        return [];
      }
    
      return data;
    }

    getOrdersByVendor(currentUser.id).then((data) => {
      setOrders(data);
      console.log(data)
    });

    getProductVendorsByVendor(currentUser.id).then((data) => {
      setProducts(data);
      console.log(data)
    });
  },[])

  useEffect(()=>{
    async function getOrdersWithUnquotedProducts() {
      const filteredOrders = [];
    
      for (const order of orders) {
        let quoted = false;
        let product = [];
        for (const productId of order.product_ids) {
          product = products.filter((p)=>p.product_id === productId && p.quoted_price === null)
        }
        quoted = product.length === order.product_ids.length ? true : false; 

        if(quoted){
          filteredOrders.push(order)
        }
      }
    
      return filteredOrders;
    }

    async function getOrdersWithQuotedProducts() {
      const filteredOrders = [];
    
      for (const order of orders) {
        let quoted = false;
        let product = [];
        for (const productId of order.product_ids) {
          product = products.filter((p)=>p.product_id === productId && p.quoted_price !== null)
        }
        quoted = product.length === order.product_ids.length ? true : false; 

        if(quoted){
          filteredOrders.push(order)
        }
      }
    
      return filteredOrders;
    }

    getOrdersWithUnquotedProducts().then((filteredOrders)=>{
      setUnquotedOrders(filteredOrders)
    });

    getOrdersWithQuotedProducts().then((filteredOrders)=>{
      setQuotedOrders(filteredOrders)
    });
  },[orders, products])

  const handleViewDetail = (clickedOrder: Order) => {
    setSelectedOrderId(clickedOrder);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedOrderId(null);
  };

const renderOrderDetail = () => {
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  if (!selectedOrder) return <div>Order not found</div>;

  const relatedProducts = selectedOrder.product_ids
  .map(id => products.find(prod => prod.product_id === id))
  .filter(Boolean); // removes any undefined if not found

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={handleBackToList} className="mr-2">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <h2 className="text-2xl font-bold">Order Details: {selectedOrder.id}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-semibold">Order ID:</span> {selectedOrder.id}
          </div>
          <div>
            <span className="font-semibold">Customer ID:</span> {selectedOrder.customer_id}
          </div>
          <div>
            <span className="font-semibold">Created:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold">Total Products:</span> {selectedOrder.product_ids.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Associated Products</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedProducts.length === 0 ? (
            <p className="text-gray-500">No associated product details found for this vendor.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Quoted Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      {product.quoted_price !== null ? `₹${product.quoted_price}` : "Not Quoted"}
                    </TableCell>
                    <TableCell>
                      {product.is_selected ? (
                        <span className="text-green-600 font-medium">Selected</span>
                      ) : product.quoted_price !== null ? (
                        <span className="text-yellow-600 font-medium">Pending</span>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.quoted_price !== null ? (
                        <Link to={`/product/${product.id}/quote/edit`}>
                          <Button size="sm" variant="outline">Edit</Button>
                        </Link>
                      ) : (
                        <Link to={`/product/${product.id}/quote`}>
                          <Button variant="purple" size="sm">
                            Quote
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

console.log(quotedOrders,unquotedOrders)

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
                  <h3 className="text-2xl font-bold">{products.filter((i)=>i.quoted_price === null).length}</h3>
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
                  <h3 className="text-2xl font-bold">{products.filter((i)=>i.quoted_price !== null).length}</h3>
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
                    {products.filter((i)=>i.is_selected === true).length}
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
            {unquotedOrders.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No products currently need quoting. Check back later!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unquotedOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{o.customer_id}</TableCell>
                      <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetail(o.id)}
                          className="mr-2"
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
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

            {quotedOrders.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">You haven't submitted any quotes yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotedOrders.map((o) => {
                    return (
                      <TableRow key={o.id} >
                        <TableCell className="font-medium">{o.id}</TableCell>
                        <TableCell>{o.customer_id}</TableCell>
                        {/* <TableCell>
                          {quote?.isSelected ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Selected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </TableCell> */}
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetail(o.id)}
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
        renderOrderDetail()
      )}
    </div>
  );
}
