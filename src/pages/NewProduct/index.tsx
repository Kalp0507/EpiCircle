import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/supabaseClient";
import { uploadImageAndGetUrl } from "@/lib/uploadImages";
import { Plus } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  images: (string | File)[];
}

interface FormData {
  products: ProductFormData[];
  vendorIds: string[];
}

type Step = 'customer' | 'product-details' | 'vendors' | 'review';

type Vendor = {
  id: string;
  name: string;
  phone: string;
};

type Customers = {
  id: string;
  name: string;
  phone: string;
  location: string;
};

export default function NewProduct() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('customer');
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    name: string;
    phone: string;
    location: string;
    created_at: string;
  } | null>(null);
  const [customers, setCustomers] = useState<{
    id: string;
    name: string;
    phone: string;
    location: string;
  }[]>([]); // Fetch or mock as needed
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", location: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    products: [{
      name: "",
      description: "",
      images: [],
    }],
    vendorIds: [],
  });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const currentIntern = localStorage.getItem('bidboost_user');
  const currentInternObj = currentIntern ? JSON.parse(currentIntern) : null;

  useEffect(() => {

    const fetchCustomers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, location')
        .eq('added_by', currentInternObj?.id);

      if (error) {
        setLoading(false);
        return;
      }

      setCustomers((data as Customers[]) || []);
      setLoading(false);
    }

    const fetchVendors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, name, phone')
        .eq('role', 'vendor');

      if (error) {
        setLoading(false);
        return;
      }

      setVendors((data as Vendor[]) || []);
      setLoading(false);
    };

    fetchCustomers();
    fetchVendors();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Only allow up to 6 images in total
    const filesArray = Array.from(files).slice(0, 6 - formData.products[currentProductIndex].images.length);

    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[currentProductIndex] = {
        ...updatedProducts[currentProductIndex],
        images: [...updatedProducts[currentProductIndex].images, ...filesArray].slice(0, 6),
      };
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[currentProductIndex] = {
        ...updatedProducts[currentProductIndex],
        images: updatedProducts[currentProductIndex].images.filter((img, i) => i !== index)
      };
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  const handleVendorSelect = (vendorId: string) => {
    if (formData.vendorIds.includes(vendorId)) {
      setFormData({
        ...formData,
        vendorIds: formData.vendorIds.filter(id => id !== vendorId)
      });
    } else {
      setFormData({
        ...formData,
        vendorIds: [...formData.vendorIds, vendorId]
      });
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[currentProductIndex] = {
        ...updatedProducts[currentProductIndex],
        [name]: value
      };
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  const handleAddAnotherProduct = () => {
    // Validate current product first
    if (!isCurrentProductValid()) return;

    // Add a new empty product and set it as current
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { name: "", description: "", images: [] }]
    }));
    setCurrentProductIndex(formData.products.length);
  };

  const handleSelectProduct = (index: number) => {
    setCurrentProductIndex(index);
  };

  const handleRemoveProduct = (index: number) => {
    if (formData.products.length <= 1) return; // Don't remove the last product

    setFormData(prev => {
      const updatedProducts = prev.products.filter((_, i) => i !== index);
      return {
        ...prev,
        products: updatedProducts
      };
    });

    // Adjust current index if needed
    if (currentProductIndex >= index && currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {

      const productsIDs = [];

      // Process each product
      for (const product of formData.products) {
        // Upload images and get their URLs
        const imageFiles = product.images as unknown as File[];
        const uploadedImageUrls = await Promise.all(
          imageFiles.map(file => uploadImageAndGetUrl(file, currentUser.id))
        );

        const payload = {
          name: product.name,
          description: product.description,
          image_urls: uploadedImageUrls,
        };

        const { data, error } = await supabase
          .from("products")
          .insert([payload])
          .select(); // Ensures data is typed as an array of inserted rows

        if (error) throw error;

        if (data && Array.isArray(data) && data.length > 0 && data[0].id) {
          productsIDs.push(data[0].id);
        }
      }

      console.log(formData, productsIDs)

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: selectedCustomer.id,
          intern_id: currentInternObj.id,
          product_ids: productsIDs,
          vendor_ids: formData.vendorIds
        })
        .select()

      if (orderError) throw orderError;

      for (const v of formData.vendorIds) {
        for (const p of productsIDs) {
          const { data: prodVendorData, error: prodVendorError } = await supabase
            .from('product_vendors')
            .insert({
              vendor_id: v,
              product_id: p
            })

          if (prodVendorError) throw prodVendorError;
        }
      }

      navigate("/dashboard", {
        state: {
          success: true,
          message: `${formData.products.length} product(s) submitted successfully!`,
        },
      });
    } catch (error) {
      console.error("Error submitting products:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 'customer') setCurrentStep('product-details');
    else if (currentStep === 'product-details') setCurrentStep('vendors');
    else if (currentStep === 'vendors') setCurrentStep('review');
  };

  const prevStep = () => {
    if (currentStep === 'product-details') setCurrentStep('customer');
    else if (currentStep === 'vendors') setCurrentStep('product-details');
    else if (currentStep === 'review') setCurrentStep('vendors');
  };

  const isCurrentProductValid = () => {
    const currentProduct = formData.products[currentProductIndex];
    return (
      currentProduct.name.trim() !== '' &&
      currentProduct.description.trim() !== '' &&
      currentProduct.images.length > 0
    );
  };

  const isCurrentStepValid = () => {
    if (currentStep === 'customer') {
      return selectedCustomer !== null;
    } else if (currentStep === 'product-details') {
      // All products must be valid
      return formData.products.every(product =>
        product.name.trim() !== '' &&
        product.description.trim() !== '' &&
        product.images.length > 0
      );
    } else if (currentStep === 'vendors') {
      return formData.vendorIds.length > 0;
    }
    return true;
  };

  const handleAddNewCustomer = async (e) => {
    e.preventDefault();

    const { name, phone, location } = newCustomer;

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          name,
          phone,
          location,
          added_by: currentInternObj?.id || null, // assume you have `user` from Supabase auth
        },
      ])
      .select()
      .single(); // to get the inserted customer back

    if (error) {
      console.error("Error adding customer:", error);
      return;
    }

    setCustomers([...customers, data]);
    setSelectedCustomer(data);
    setShowAddCustomer(false);
    setNewCustomer({ name: "", phone: "", location: "" });
  };


  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Add New Product{formData.products.length > 1 ? 's' : ''}
          </h1>
          <p className="text-gray-600">
            Provide details about your product{formData.products.length > 1 ? 's' : ''} for vendor quotes
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="w-full flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${['customer', 'product-details', 'vendors', 'review'].indexOf(currentStep) >= 0 ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
              <div className={`h-1 flex-1 mx-1 sm:mx-2 ${['product-details', 'vendors', 'review'].indexOf(currentStep) >= 0 ? 'bg-purple' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${['product-details', 'vendors', 'review'].indexOf(currentStep) >= 0 ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
              <div className={`h-1 flex-1 mx-1 sm:mx-2 ${['vendors', 'review'].indexOf(currentStep) >= 0 ? 'bg-purple' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${['vendors', 'review'].indexOf(currentStep) >= 0 ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
              <div className={`h-1 flex-1 mx-1 sm:mx-2 ${['review'].indexOf(currentStep) >= 0 ? 'bg-purple' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'review' ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>4</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between mt-2 text-sm text-gray-600 space-x-0">
            <span className={currentStep === 'customer' ? 'text-purple font-medium' : ''}>Customer</span>
            <span className={currentStep === 'product-details' ? 'text-purple font-medium' : ''}>Product Details</span>
            <span className={currentStep === 'vendors' ? 'text-purple font-medium' : ''}>Vendors</span>
            <span className={currentStep === 'review' ? 'text-purple font-medium' : ''}>Review</span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            {currentStep === 'customer' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Select or Add Customer</h2>
                {/* Customer selection UI */}
                <div>
                  <select
                    value={selectedCustomer?.id || ""}
                    onChange={e => {
                      const customer = customers.find(c => c.id === e.target.value);
                      setSelectedCustomer(
                        customer
                          ? { ...customer, created_at: "" }
                          : null
                      );
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="mt-2 text-purple underline"
                    onClick={() => setShowAddCustomer(true)}
                  >
                    + Add New Customer
                  </button>
                </div>
                {showAddCustomer && (
                  <form
                    onSubmit={e => handleAddNewCustomer(e)}
                    className="mt-4 space-y-2"
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      value={newCustomer.name}
                      onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={newCustomer.phone}
                      onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={newCustomer.location}
                      onChange={e => setNewCustomer({ ...newCustomer, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    <button type="submit" className="bg-purple text-white px-4 py-2 rounded-md">Add Customer</button>
                  </form>
                )}
              </div>
            )}

            {currentStep === 'product-details' && (
              <div className="space-y-6">
                {formData.products.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.products.map((product, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectProduct(index)}
                        className={`px-3 py-1 text-sm rounded-full ${currentProductIndex === index
                          ? 'bg-purple text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        Product {index + 1}
                        {formData.products.length > 1 && index !== 0 && (
                          <button
                            className="ml-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveProduct(index);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Product Details {formData.products.length > 1 ? `(${currentProductIndex + 1}/${formData.products.length})` : ''}
                </h2>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.products[currentProductIndex].name}
                    onChange={handleDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple focus:border-purple text-base sm:text-sm"
                    placeholder="e.g., Vintage Silver Coffee Set"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.products[currentProductIndex].description}
                    onChange={handleDetailsChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple focus:border-purple text-base sm:text-sm"
                    placeholder="Provide details about the product, condition, history, etc."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Images
                  </label>
                  <p className="text-gray-600 text-sm mb-2">Upload images from your device. Choose at least one (max 6).</p>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {formData.products[currentProductIndex].images.map((img, idx) => (
                      <div className="relative group" key={idx}>
                        <img
                          src={typeof img === "string" ? img : URL.createObjectURL(img)}
                          alt={`Product ${idx + 1}`}
                          className="w-28 h-28 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-gray-900/80 text-white text-xs rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {formData.products[currentProductIndex].images.length < 6 && (
                      <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-purple transition text-gray-400">
                        <span className="text-2xl font-bold">+</span>
                        <span className="text-xs">Add Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="opacity-0 absolute w-0 h-0"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex items-center justify-center mt-4">
                    <div className="text-sm text-gray-500">
                      {formData.products[currentProductIndex].images.length} of 6 uploaded
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'vendors' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Select Vendors</h2>
                <p className="text-gray-600 text-sm">Choose vendors to request quotes from. Select at least one.</p>
                <div className="space-y-4 mt-4">
                  {vendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between ${formData.vendorIds.includes(vendor.id) ? 'border-purple bg-purple-light' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => handleVendorSelect(vendor.id)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Phone: <span className="font-medium">{vendor.phone}</span></p>
                      </div>
                      <div className={`mt-2 sm:mt-0 w-5 h-5 rounded-full border ${formData.vendorIds.includes(vendor.id) ? 'border-purple bg-purple' : 'border-gray-300'
                        } flex items-center justify-center`}>
                        {formData.vendorIds.includes(vendor.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center mt-6">
                  <div className="text-sm text-gray-500">
                    {formData.vendorIds.length} of {vendors.length} selected
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Review & Submit</h2>
                <p className="text-gray-600">Review your product details before submitting</p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-800 mb-2">Selected Customer</h3>
                  <div className="flex gap-2 items-center">
                    <p className="text-sm font-medium text-gray-700">name: </p>
                    <p className="text-gray-900">{selectedCustomer.name}</p>
                  </div>
                </div>
                {formData.products.map((product, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-medium text-gray-800 mb-2">Product {index + 1}</h3>

                    <div className="space-y-4">
                      <div className="flex gap-2 items-center">
                        <p className="text-sm font-medium text-gray-700">Product Name</p>
                        <p className="text-gray-900">{product.name}</p>
                      </div>

                      <div className="flex gap-2 items-center">
                        <p className="text-sm font-medium text-gray-700">Description</p>
                        <p className="text-gray-900">{product.description}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">Images</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {product.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative w-16 h-16 border rounded overflow-hidden">
                              <img
                                src={image instanceof File ? URL.createObjectURL(image) : image}
                                alt={`Product ${index + 1} image ${imgIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Selected Vendors</h3>
                  <div>
                    {formData.vendorIds.length > 0 ? (
                      <ul className="space-y-1">
                        {formData.vendorIds.map(vendorId => {
                          const vendor = vendors.find(v => v.id === vendorId);
                          return (
                            <li key={vendorId}>
                              {vendor ? `${vendor.name} (${vendor.phone})` : vendorId}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No vendors selected</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row-reverse sm:justify-between gap-2">
            {currentStep === 'review' ? (
              <Button
                variant="purple"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Submitting...' : `Submit ${formData.products.length > 1 ? 'Products' : 'Product'}`}
              </Button>
            ) : (
              <Button
                variant="purple"
                onClick={nextStep}
                disabled={!isCurrentStepValid()}
                className="w-full sm:w-auto"
              >
                Continue
              </Button>
            )}

            {currentStep === 'product-details' && (
              <Button
                variant="outline"
                onClick={handleAddAnotherProduct}
                disabled={!isCurrentProductValid()}
                className="w-full sm:w-auto flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Product
              </Button>
            )}

            {currentStep !== 'customer' && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
