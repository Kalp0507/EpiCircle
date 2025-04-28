
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Eye, Plus, Package, Users, FileText } from "lucide-react";
import { Product, Customer, Order } from "@/types";
import { supabase } from "@/supabaseClient";


export default function InternDashboard() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const currentIntern = localStorage.getItem('user');
  const currentInternObj = currentIntern ? JSON.parse(currentIntern) : null;
  // New state for customer selection/creation
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customersCount, setCustomersCount] = useState(0);
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState([])

  // Filter products for this intern
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const getCustomerCountByIntern = async (internId: string) => {
      const { count, error } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("added_by", internId);

      if (error) {
        console.error("Error fetching customer count:", error);
        return 0;
      }

      return count || 0;
    }

    const getOrderByIntern = async (internId: string) => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("intern_id", internId);

      if (error) {
        console.error("Error fetching customer count:", error);
        return 0;
      }

      return data || 0;
    }

    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*')

      if (error) throw error;

      setCustomers(data);
      console.log(data)
    }

    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*')

      if (error) throw error;

      setProducts(data);
      console.log(data)
    }

    const fetchVendors = async () => {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'vendor')

      if (error) throw error;

      setVendors(data);
      console.log(data)
    }


    setLoading(true);
    fetchCustomers();
    fetchProducts();
    fetchVendors();

    getCustomerCountByIntern(currentInternObj.id).then((count: number) => {
      setCustomersCount(count);
    });

    getOrderByIntern(currentInternObj.id).then((data: Order[]) => {
      setOrders(data);
      setLoading(false)
    });
  }, [])

  const handleViewDetail = (productId: string) => {
    setSelectedOrderId(productId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedOrderId(null);
  };

  const renderOrderDetail = () => {
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return <div>Product not found</div>;

    const customer = customers.find(c => c.id === order.customer_id);
    const selectedVendors = vendors.filter(v => order.vendor_ids.includes(v.id));

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleBackToList} className="mr-2">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <h2 className="text-2xl font-bold">Order Details: {order.id}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            {customer && (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Name:</span> {customer.name}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {customer.phone}
                </div>
                <div>
                  <span className="font-semibold">Location:</span> {customer.location}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <div className="grid md:grid-cols-2 gap-6 divide-x-2 pb-2">
            {order.product_ids.map((pid: string) => (
              <CardContent className="space-y-4" key={pid}>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Name:</span> {products.find(p => p.id === pid).name}
                  </div>
                  <div>
                    <span className="font-semibold">Description:</span> {products.find(p => p.id === pid).description}
                  </div>
                  <div>
                    <span className="font-semibold">Created:</span> {new Date(products.find(p => p.id === pid).created_at).toLocaleDateString()}
                  </div>
                <div className="flex justify-center mb-4">
                  {products.find(p => p.id === pid).image_urls.map((url: string, index: number) => (
                    <img
                      key={index}
                      src={url}
                      alt={pid}
                      className="h-48 w-auto object-cover rounded-md border"
                    />
                  ))
                  }
                </div>
                </div>
              </CardContent>
            ))}
          </div>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle>Selected Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedVendors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedVendors.map((vendor, index) => (
                    <TableRow key={index} className={"bg-green-50"}>
                      <TableCell>{vendor.name}</TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>{vendor.location}</TableCell>
                      {/* <TableCell>
                        {product.vendor_ids[index] === product.selected_vendor_id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Selected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No vendors assigned to this product
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Customer Selection Modal */}

      {/* Add button to open customer selection modal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage customer products
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/new-product">
            <Button variant="purple" className="bg-purple-600 text-white px-4 py-2 rounded flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Place Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Optionally, show selected customer */}
      {selectedCustomer && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
          <span className="font-semibold">Selected Customer:</span> {selectedCustomer.name} ({selectedCustomer.phone}) - {selectedCustomer.location}
        </div>
      )}

      {currentView === 'list' ? (
        <>
          {/* Removed duplicate welcome section here */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-row items-center pt-6">
                <div className="bg-blue-100 p-2 rounded-md">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Your Orders</p>
                  <h3 className="text-2xl font-bold">{orders.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-row items-center pt-6">
                <div className="bg-green-100 p-2 rounded-md">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Customers</p>
                  <h3 className="text-2xl font-bold">{customersCount}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Your Orders</h3>
              <p className="mt-1 text-sm text-gray-500">Orders you've placed for customers</p>
            </div>

            {orders.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No order yet. Add your first one!</p>
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
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{customers.find(c => c.id === o.customer_id)?.name}</TableCell>
                      <TableCell>
                        {new Date(o.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                          hour12: true,
                        })}
                      </TableCell>
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
                  ))}
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