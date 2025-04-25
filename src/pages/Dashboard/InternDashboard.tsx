
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Eye, Plus, Package, Users, FileText } from "lucide-react";
import { Product, Customer } from "@/types";

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

export default function InternDashboard() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // New state for customer selection/creation
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", location: "" });
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  // Filter products for this intern
  const internProducts = mockProducts.filter(p => 
    p.intern_id === currentUser?.id || p.internName === currentUser?.name
  );

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

    const customer = mockCustomers.find(c => c.id === product.customer_id);

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
                  <span className="font-semibold">Created:</span> {new Date(product.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selected Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            {product.vendorNames.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.vendorNames.map((vendorName, index) => (
                    <TableRow key={index} className={product.vendor_ids[index] === product.selected_vendor_id ? "bg-green-50" : ""}>
                      <TableCell>{vendorName}</TableCell>
                      <TableCell>
                        {product.vendor_ids[index] === product.selected_vendor_id ? (
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
                No vendors assigned to this product
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Handler for adding a new customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = {
      id: (customers.length + 1).toString(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      location: newCustomer.location,
      created_at: new Date().toISOString()
    };
    setCustomers([...customers, customer]);
    setSelectedCustomer(customer);
    setAddingCustomer(false);
    setShowCustomerModal(false);
    setNewCustomer({ name: "", phone: "", location: "" });
  };

  return (
    <div className="space-y-6">
      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Select Customer</h2>
            {!addingCustomer ? (
              <>
                <input
                  type="text"
                  placeholder="Search customer by name or phone"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="w-full mb-3 px-3 py-2 border rounded"
                />
                <ul className="max-h-40 overflow-y-auto mb-3">
                  {customers
                    .filter(c =>
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.phone.includes(customerSearch)
                    )
                    .map(c => (
                      <li
                        key={c.id}
                        className="py-2 px-2 hover:bg-gray-100 cursor-pointer rounded"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setShowCustomerModal(false);
                        }}
                      >
                        <span className="font-semibold">{c.name}</span> ({c.phone}) - {c.location}
                      </li>
                    ))}
                </ul>
                <button
                  className="text-purple-600 hover:underline"
                  onClick={() => setAddingCustomer(true)}
                >
                  + Add New Customer
                </button>
                <button
                  className="ml-4 text-gray-500 hover:underline"
                  onClick={() => setShowCustomerModal(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <form onSubmit={handleAddCustomer}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                  className="w-full mb-2 px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  required
                  className="w-full mb-2 px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newCustomer.location}
                  onChange={e => setNewCustomer({ ...newCustomer, location: e.target.value })}
                  required
                  className="w-full mb-2 px-3 py-2 border rounded"
                />
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    Add Customer
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 hover:underline"
                    onClick={() => setAddingCustomer(false)}
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded flex items-center"
            onClick={() => setShowCustomerModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Select/Add Customer
          </button>
          <Link to="/new-product">
            <Button variant="purple">
              <Plus className="w-5 h-5 mr-2" />
              Add New Product
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {currentUser?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage customer products
              </p>
            </div>
            <Link to="/new-product">
              <Button variant="purple">
                <Plus className="w-5 h-5 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-row items-center pt-6">
                <div className="bg-blue-100 p-2 rounded-md">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Your Products</p>
                  <h3 className="text-2xl font-bold">{internProducts.length}</h3>
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
                <div className="bg-amber-100 p-2 rounded-md">
                  <FileText className="h-8 w-8 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pending Quotes</p>
                  <h3 className="text-2xl font-bold">{internProducts.filter(p => !p.selected_vendor_id).length}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Your Products</h3>
              <p className="mt-1 text-sm text-gray-500">Products you've added for customers</p>
            </div>

            {internProducts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No products yet. Add your first one!</p>
                <Link to="/new-product" className="mt-4 inline-block">
                  <Button variant="purple-outline" size="sm">Add Product</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internProducts.map((product) => (
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
          </div>
        </>
      ) : (
        renderProductDetail()
      )}
    </div>
  );
}
