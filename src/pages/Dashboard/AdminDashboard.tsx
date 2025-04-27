
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Eye, Users, Package, User, Plus, CheckCircle, Clock } from "lucide-react";
import { UserRole, Product, Customer, Vendor, Intern, Quote, Order, VendorQuotation } from "@/types";
import { useNavigate, Link } from "react-router-dom";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/supabaseClient";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [vendors, setVendors] = useState([])
  const [interns, setInterns] = useState([])
  const [admins, setAdmins] = useState([])
  const [products, setProducts] = useState([])
  const [vendorForProduct, setVendorForProduct] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock pagination state (not functional)
  const [page, setPage] = useState(1);

  // State for vendor quotations
  const [vendorQuotations, setVendorQuotations] = useState<VendorQuotation[]>([]);
  const [vendorQuotationsLoading, setVendorQuotationsLoading] = useState(false);


  // for detail views

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase.from('orders').select('*')

      if (error) throw error;

      setOrders(data);
      console.log(data)
    }

    const fetchCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*')

      if (error) throw error;

      setCustomers(data);
      console.log(data)
    }

    const fetchVendors = async () => {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'vendor')

      if (error) throw error;

      setVendors(data);
      console.log(data)
    }

    const fetchInterns = async () => {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'intern')

      if (error) throw error;

      setInterns(data);
      console.log(data)
    }

    const fetchAdmins = async () => {
      const { data, error } = await supabase.from('users').select('*').eq('role', 'admin')

      if (error) throw error;

      setAdmins(data);
      console.log(data)
    }

    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*')

      if (error) throw error;

      setProducts(data);
      console.log(data)
    }
  
    const fetchVendorForProduct = async () => {
      const { data, error } = await supabase.from('product_vendors').select('*')

      if (error) throw error;

      setVendorForProduct(data);
      console.log(data)
    }

    setLoading(true);
    fetchOrder();
    fetchCustomers();
    fetchVendors();
    fetchInterns();
    fetchAdmins();
    fetchProducts();
    fetchVendorForProduct();
    setLoading(false)
  }, [])

  useEffect(() => {
    const fetchVendorQuotations = async () => {
      if (activeTab === "vendors" && currentView === "detail" && selectedItemId) {
        setVendorQuotationsLoading(true);
        const vendor = vendors.find(v => v.id === selectedItemId);
        if (!vendor) {
          setVendorQuotations([]);
          setVendorQuotationsLoading(false);
          return;
        }
        const { data, error } = await supabase.from('product_vendors').select('*').eq('vendor_id', vendor.id);
        if (!error) {
          setVendorQuotations(data || []);
        } else {
          setVendorQuotations([]);
        }
        setVendorQuotationsLoading(false);
      }
    };
    fetchVendorQuotations();

  }, [activeTab, currentView, selectedItemId, vendors]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetail = (id: string) => {
    setSelectedItemId(id);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedItemId(null);
  };

  const renderOrdersDetail = () => {
    const selectedOrder: Order = orders.find(o => o.id === selectedItemId);
    if (!selectedOrder) return <div>Order not found</div>;

    const relatedProducts = selectedOrder.product_ids.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
    console.log("rela",relatedProducts)
    const customer = customers.find(c => c.id === selectedOrder.customer_id);
    const intern = interns.find(i => i.id === selectedOrder.intern_id) || admins.find(a => a.id === selectedOrder.intern_id);

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleBackToList} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-2xl font-semibold truncate">{selectedOrder.id}</h2>
        </div>

        <div className="">
          <Card>
            <CardHeader>
              <CardTitle>Related Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 pb-3 border-b">
                <h3 className="font-medium text-gray-700">Customer</h3>
                {customer && (
                  <div>
                    <div><span className="font-semibold">Name:</span> {customer.name}</div>
                    <div><span className="font-semibold">Phone:</span> {customer.phone}</div>
                    <div><span className="font-semibold">Location:</span> {customer.location}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2 pb-3 border-b">
                <h3 className="font-medium text-gray-700">Uploaded By</h3>
                {intern && (
                  <div>
                    <div><span className="font-semibold">Name:</span> {intern.name}</div>
                    <div><span className="font-semibold">Phone:</span> {intern.phone}</div>
                    <div><span className="font-semibold">Location:</span> {intern.location || 'ADMIN'}</div>
                  </div>
                )}
              </div>
              {/* <div className="mt-4 p-4 border rounded-md bg-gray-50 text-center">
                <p className="text-gray-500 mb-2">You can submit a quote for this product</p>
                <Link to={`/product/${product.id}/quote`}>
                  <Button variant="purple" size="sm">Submit Quote</Button>
                </Link>
              </div> */}
              {/* <div className="pt-2">
                      <Link to={`/product/${product.id}/quote/edit`}>
                        <Button variant="outline" size="sm">Edit Quote</Button>
                      </Link>
                    </div> */}

              {/* Admin can submit quotes like a vendor */}
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
                          <TableHead>Name</TableHead>
                          <TableHead>Quoted Price</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>
                              {vendorForProduct.find(data=>data.product_id === product.id).quoted_price !== null ? `₹${vendorForProduct.find(data=>data.product_id === product.id).quoted_price}` : "Not Quoted"}
                            </TableCell>
                            {/* <TableCell>
                              {product.is_selected ? (
                                <span className="text-green-600 font-medium">Selected</span>
                              ) : product.quoted_price !== null ? (
                                <span className="text-yellow-600 font-medium">Quoted</span>
                              ) : (
                                <span className="text-gray-500">Pending</span>
                              )}
                            </TableCell> */}
                            <TableCell>
                              <Link to={`/product/${product.product_id}/quote/edit`}>
                                <Button size="sm" variant="outline">Edit</Button>
                              </Link>
                              {product.quoted_price !== null && (
                                <Link to={`/product/${product.product_id}/quote`}>
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
            </CardContent>
          </Card>
        </div >

      </div >
    );
  };

  const renderCustomerDetail = () => {
    const customer = customers.find(c => c.id === selectedItemId);
    if (!customer) return <div>Customer not found</div>;

    const customerOrders = orders.filter(o => o.customer_id === customer.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleBackToList} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-2xl font-bold">Customer Details: {customer.name}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Name:</span> {customer.name}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {customer.phone}
              </div>
              <div>
                <span className="font-semibold">Location:</span> {customer.location}
              </div>
              <div>
                <span className="font-semibold">Joined:</span> {new Date(customer.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {customerOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Intern</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{interns.find(c => c.id === o.intern_id)?.name || (admins.find(a => a.id === o.intern_id)?.name + ' (admin)')}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab('orders')
                            handleViewDetail(o.id)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No products found for this customer
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderVendorDetail = () => {
    const vendor = vendors.find(v => v.id === selectedItemId);
    if (!vendor) return <div>Vendor not found</div>;

    const quotedProducts = vendorQuotations.filter(q => q.quoted_price !== null);
    // const unQuotedProducts = vendorQuotations.filter(q => q.quoted_price === null);

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleBackToList} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-2xl font-bold">Vendor Details: {vendor.name}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Name:</span> {vendor.name}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {vendor.phone}
              </div>
              <div>
                <span className="font-semibold">Location:</span> {vendor.location}
              </div>
              <div>
                <span className="font-semibold">Joined:</span> {new Date(vendor.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quoted Products</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorQuotationsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading quotes...</div>
            ) : quotedProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Quote Price</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Selected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotedProducts.map(p => {
                    const product = products.find(prod => prod.id === p.product_id);
                    return (
                      <TableRow key={p.id} className={p.isSelected ? "bg-green-50" : ""}>
                        <TableCell className="font-medium">{product ? product.name : "Unknown"}</TableCell>
                        <TableCell>₹{p.quoted_price?.toFixed(2)}</TableCell>
                        <TableCell>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}</TableCell>
                        <TableCell>
                          {p.isSelected ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              NO
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No quotes available for this vendor
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInternDetail = () => {
    const intern = interns.find(i => i.id === selectedItemId);
    if (!intern) return <div>Intern not found</div>;

    const internProducts = orders
      .filter(o => o.intern_id === intern.id)
      .flatMap(o =>
        o.product_ids
          .map(pid => products.find(prod => prod.id === pid))
          .filter(Boolean)
      );

    console.log(internProducts)
    const getCustomerName = async (pid: string) => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('customer_id')
          .contains('product_ids', [pid])  // key point: use `.contains`
          .maybeSingle(); // because there could be 0 or 1 matching orders

        if (error) {
          console.error("Error fetching customer_id:", error.message);
          return null;
        }

        if (!data) {
          console.warn("No matching order found for product_id:", pid);
          return null;
        }

        const customer_name = customers.find(c => c.id === data.customer_id).name
        return customer_name;
      } catch (err) {
        console.error("Unexpected error:", err);
        return null;
      }
    }

    const CustomerNameRow = ({ product }) => {
      const [customerName, setCustomerName] = useState<string | null>(null);

      useEffect(() => {
        const fetchCustomerName = async () => {
          const name = await getCustomerName(product.id);
          setCustomerName(name);
        };

        fetchCustomerName();
      }, [product.id]);

      return <TableCell>{customerName || "Loading..."}</TableCell>;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleBackToList} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="text-2xl font-bold">Intern Details: {intern.name}</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Intern Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Name:</span> {intern.name}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {intern.phone}
              </div>
              <div>
                <span className="font-semibold">Location:</span> {intern.location}
              </div>
              <div>
                <span className="font-semibold">Joined:</span> {new Date(intern.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Products</CardTitle>
          </CardHeader>
          <CardContent>
            {internProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <CustomerNameRow product={product} />
                      <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {product.selected_vendor_id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Vendor Selected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Awaiting Selection
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
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No products uploaded by this intern
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    if (currentView === 'detail') {
      switch (activeTab) {
        case 'orders':
          return renderOrdersDetail();
        case 'customers':
          return renderCustomerDetail();
        case 'vendors':
          return renderVendorDetail();
        case 'interns':
          return renderInternDetail();
        default:
          return null;
      }
    }

    // List views
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9 w-full sm:w-[300px]"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {activeTab === "orders" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <p className="text-sm text-gray-500">Overview of all orders in the system</p>
            </CardHeader>
            <CardContent>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order-id</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Intern</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <p>Loading orders...</p>
                  ) : orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{customers.find(c => c.id === o.customer_id)?.name}</TableCell>
                      {/* <TableCell>{o.intern_id}</TableCell> */}
                      <TableCell>{interns.find(c => c.id === o.intern_id)?.name || (admins.find(a => a.id === o.intern_id)?.name + ' (admin)')}</TableCell>
                      <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
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
            </CardContent>
          </Card>
        )}

        {activeTab === "customers" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <p>Loading customers</p>
              ) : customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.location}</TableCell>
                  <TableCell>
                    {orders
                      .filter(o => o.customer_id === customer.id)
                      .reduce((total, o) => total + (o.product_ids?.length || 0), 0)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(customer.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {activeTab === "vendors" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quotes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{vendor.location}</TableCell>
                  <TableCell>
                    {[].filter(q => q.vendorId === vendor.id).length}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(vendor.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {activeTab === "interns" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Products Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interns.map((intern) => (
                <TableRow key={intern.id}>
                  <TableCell className="font-medium">{intern.name}</TableCell>
                  <TableCell>{intern.phone}</TableCell>
                  <TableCell>{intern.location}</TableCell>
                  <TableCell>
                    {orders
                      .filter(o => o.intern_id === intern.id)
                      .reduce((total, o) => total + (o.product_ids?.length || 0), 0)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(intern.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => page > 1 && setPage(page - 1)} />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 py-2">{page}</span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => setPage(page + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {currentView === 'list' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button variant="purple" onClick={() => navigate('/new-product')}>
              <Plus className="h-4 w-4 mr-2" /> Place Order
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Orders</p>
                      <h3 className="text-2xl font-bold">{orders.length}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customers</p>
                      <h3 className="text-2xl font-bold">{customers.length}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <User className="h-6 w-6 text-purple" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Vendors</p>
                      <h3 className="text-2xl font-bold">{vendors.length}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <CheckCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quotes</p>
                      <h3 className="text-2xl font-bold">{[].length}</h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex space-x-2">
            <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="interns">Interns</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {renderContent()}
        </>
      ) : (
        renderDetailView()
      )}
    </div>
  );

  function renderDetailView() {
    switch (activeTab) {
      case "orders":
        return renderOrdersDetail();
      case "customers":
        return renderCustomerDetail();
      case "vendors":
        return renderVendorDetail();
      case "interns":
        return renderInternDetail();
      default:
        return renderOrdersDetail();
    }
  }
}
