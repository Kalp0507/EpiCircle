
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Eye, Users, Package, User } from "lucide-react";
import { UserRole, Product, Customer, Vendor, Intern, Quote } from "@/types";
import { useNavigate } from "react-router-dom";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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
];

const mockCustomers: Customer[] = [
  { id: "1", name: "XYZ Corp", phone: "+19876543210", location: "New York", created_at: "2023-01-10T09:00:00Z" },
  { id: "2", name: "ABC Industries", phone: "+18765432109", location: "Chicago", created_at: "2023-02-15T11:00:00Z" },
];

const mockVendors: Vendor[] = [
  { id: "1", name: "John Vendor", phone: "+1234567890", location: "New York", created_at: "2023-01-05T08:00:00Z" },
  { id: "2", name: "Jane Vendor", phone: "+12345678901", location: "Boston", created_at: "2023-03-20T10:00:00Z" },
];

const mockInterns: Intern[] = [
  { id: "1", name: "Alice Intern", phone: "+1987654321", location: "Chicago", created_at: "2023-02-10T09:30:00Z" },
  { id: "2", name: "Bob Intern", phone: "+19876543211", location: "San Francisco", created_at: "2023-04-15T11:30:00Z" },
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
    id: "2", 
    productId: "1", 
    vendorId: "2", 
    vendorName: "Jane Vendor", 
    price: 1650, 
    notes: "Premium quality, 3-year warranty", 
    createdAt: "2023-05-21T09:00:00Z", 
    isSelected: false 
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Mock pagination state (not functional)
  const [page, setPage] = useState(1);
  
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

  const filteredProducts = mockProducts.filter(
    product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = mockCustomers.filter(
    customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = mockVendors.filter(
    vendor => 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInterns = mockInterns.filter(
    intern => 
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderProductDetail = () => {
    const product = mockProducts.find(p => p.id === selectedItemId);
    if (!product) return <div>Product not found</div>;

    const productQuotes = mockQuotes.filter(q => q.productId === product.id);
    const selectedQuote = productQuotes.find(q => q.isSelected);
    const customer = mockCustomers.find(c => c.id === product.customer_id);
    const intern = mockInterns.find(i => i.id === product.intern_id);

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={handleBackToList} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
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
                  <span className="font-semibold">Description:</span> {product.description}
                </div>
                <div>
                  <span className="font-semibold">Created:</span> {new Date(product.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <div><span className="font-semibold">Location:</span> {intern.location}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            {productQuotes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productQuotes.map(quote => (
                    <TableRow key={quote.id} className={quote.isSelected ? "bg-green-50" : ""}>
                      <TableCell>{quote.vendorName}</TableCell>
                      <TableCell>${quote.price.toFixed(2)}</TableCell>
                      <TableCell>{quote.notes}</TableCell>
                      <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {quote.isSelected ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Selected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No quotes available for this product
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCustomerDetail = () => {
    const customer = mockCustomers.find(c => c.id === selectedItemId);
    if (!customer) return <div>Customer not found</div>;
    
    const customerProducts = mockProducts.filter(p => p.customer_id === customer.id);

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
            <CardTitle>Customer's Products</CardTitle>
          </CardHeader>
          <CardContent>
            {customerProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.description.substring(0, 50)}...</TableCell>
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
                No products found for this customer
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderVendorDetail = () => {
    const vendor = mockVendors.find(v => v.id === selectedItemId);
    if (!vendor) return <div>Vendor not found</div>;
    
    const vendorQuotes = mockQuotes.filter(q => q.vendorId === vendor.id);
    const quotedProductIds = vendorQuotes.map(q => q.productId);
    const quotedProducts = mockProducts.filter(p => quotedProductIds.includes(p.id));

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
            {vendorQuotes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quote Price</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorQuotes.map(quote => {
                    const product = mockProducts.find(p => p.id === quote.productId);
                    return (
                      <TableRow key={quote.id} className={quote.isSelected ? "bg-green-50" : ""}>
                        <TableCell className="font-medium">{product?.name || "Unknown"}</TableCell>
                        <TableCell>${quote.price.toFixed(2)}</TableCell>
                        <TableCell>{quote.notes}</TableCell>
                        <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {quote.isSelected ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Selected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Pending
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
    const intern = mockInterns.find(i => i.id === selectedItemId);
    if (!intern) return <div>Intern not found</div>;
    
    const internProducts = mockProducts.filter(p => p.intern_id === intern.id);

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
                      <TableCell>{product.customerName}</TableCell>
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
        case 'products':
          return renderProductDetail();
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

        {activeTab === "products" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.customerName}</TableCell>
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
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.location}</TableCell>
                  <TableCell>
                    {mockProducts.filter(p => p.customer_id === customer.id).length}
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
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{vendor.location}</TableCell>
                  <TableCell>
                    {mockQuotes.filter(q => q.vendorId === vendor.id).length}
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
              {filteredInterns.map((intern) => (
                <TableRow key={intern.id}>
                  <TableCell className="font-medium">{intern.name}</TableCell>
                  <TableCell>{intern.phone}</TableCell>
                  <TableCell>{intern.location}</TableCell>
                  <TableCell>
                    {mockProducts.filter(p => p.intern_id === intern.id).length}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-row items-center pt-6">
            <div className="bg-blue-100 p-2 rounded-md">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Products</p>
              <h3 className="text-2xl font-bold">{mockProducts.length}</h3>
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
              <h3 className="text-2xl font-bold">{mockCustomers.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center pt-6">
            <div className="bg-purple-100 p-2 rounded-md">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Vendors</p>
              <h3 className="text-2xl font-bold">{mockVendors.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-row items-center pt-6">
            <div className="bg-orange-100 p-2 rounded-md">
              <User className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Interns</p>
              <h3 className="text-2xl font-bold">{mockInterns.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="interns">Interns</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
