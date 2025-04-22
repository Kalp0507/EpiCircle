import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

interface FormData {
  name: string;
  description: string;
  customerPhone: string;
  images: string[];
  vendorIds: string[];
}

type Step = 'details' | 'images' | 'vendors' | 'review';

const mockVendors = [
  { id: "vend1", name: "Vintage Valuers Ltd.", specialty: "Antique furniture and artwork", phone: "+1 234-456-1011" },
  { id: "vend2", name: "Heritage Appraisals", specialty: "Jewelry and timepieces", phone: "+1 234-456-1022" },
  { id: "vend3", name: "Collectibles Corner", specialty: "Coins, stamps, and memorabilia", phone: "+1 234-456-1033" },
  { id: "vend4", name: "Retro Electronics", specialty: "Vintage electronics and gadgets", phone: "+1 234-456-1044" },
];

export default function NewProduct() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    customerPhone: "",
    images: [],
    vendorIds: [],
  });

  const handleImageSelect = (imageUrl: string) => {
    if (formData.images.includes(imageUrl)) {
      setFormData({
        ...formData,
        images: formData.images.filter(img => img !== imageUrl)
      });
    } else {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl]
      });
    }
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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Submitted product:", {
        ...formData,
        customerId: currentUser?.id,
        customerName: currentUser?.name,
        createdAt: new Date().toISOString(),
      });
      
      navigate("/dashboard", { state: { success: true, message: "Product submitted successfully!" } });
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 'details') setCurrentStep('images');
    else if (currentStep === 'images') setCurrentStep('vendors');
    else if (currentStep === 'vendors') setCurrentStep('review');
  };

  const prevStep = () => {
    if (currentStep === 'images') setCurrentStep('details');
    else if (currentStep === 'vendors') setCurrentStep('images');
    else if (currentStep === 'review') setCurrentStep('vendors');
  };

  const isCurrentStepValid = () => {
    if (currentStep === 'details') {
      return formData.name.trim() !== '' && formData.description.trim() !== '';
    } else if (currentStep === 'images') {
      return formData.images.length > 0;
    } else if (currentStep === 'vendors') {
      return formData.vendorIds.length > 0;
    }
    return true;
  };

  const placeholderImages = [
    "https://placehold.co/400x300/E5DEFF/7E69AB?text=Product+Image+1",
    "https://placehold.co/400x300/E5DEFF/7E69AB?text=Product+Image+2",
    "https://placehold.co/400x300/E5DEFF/7E69AB?text=Product+Image+3",
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Add New Product
          </h1>
          <p className="text-gray-600">
            Provide details about your product for vendor quotes
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="w-full flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'details' || currentStep === 'images' || currentStep === 'vendors' || currentStep === 'review' ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`h-1 flex-1 mx-1 sm:mx-2 ${currentStep === 'images' || currentStep === 'vendors' || currentStep === 'review' ? 'bg-purple' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'images' || currentStep === 'vendors' || currentStep === 'review' ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`h-1 flex-1 mx-1 sm:mx-2 ${currentStep === 'vendors' || currentStep === 'review' ? 'bg-purple' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'vendors' || currentStep === 'review' ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <div className={`h-1 flex-1 mx-1 sm:mx-2 ${currentStep === 'review' ? 'bg-purple' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'review' ? 'bg-purple text-white' : 'bg-gray-200 text-gray-600'}`}>
                4
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between mt-2 text-sm text-gray-600 space-x-0">
            <span className={currentStep === 'details' ? 'text-purple font-medium' : ''}>Details</span>
            <span className={currentStep === 'images' ? 'text-purple font-medium' : ''}>Images</span>
            <span className={currentStep === 'vendors' ? 'text-purple font-medium' : ''}>Vendors</span>
            <span className={currentStep === 'review' ? 'text-purple font-medium' : ''}>Review</span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            {currentStep === 'details' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Product Details</h2>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
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
                    value={formData.description}
                    onChange={handleDetailsChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple focus:border-purple text-base sm:text-sm"
                    placeholder="Provide details about the product, condition, history, etc."
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple focus:border-purple text-base sm:text-sm"
                    placeholder="e.g., +1 234-567-8910"
                    pattern="^(?:\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$"
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 'images' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Product Images</h2>
                <p className="text-gray-600 text-sm">Select images to help vendors provide accurate quotes. Choose at least one.</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                  {placeholderImages.map((image, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        formData.images.includes(image) ? 'border-purple' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleImageSelect(image)}
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      {formData.images.includes(image) && (
                        <div className="absolute top-2 right-2 bg-purple text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center mt-6">
                  <div className="text-sm text-gray-500">
                    {formData.images.length} of {placeholderImages.length} selected
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'vendors' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Select Vendors</h2>
                <p className="text-gray-600 text-sm">Choose vendors to request quotes from. Select at least one.</p>
                <div className="space-y-4 mt-4">
                  {mockVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between ${
                        formData.vendorIds.includes(vendor.id) ? 'border-purple bg-purple-light' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleVendorSelect(vendor.id)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{vendor.specialty}</p>
                        <p className="text-xs text-gray-500 mt-1">Phone: <span className="font-medium">{vendor.phone}</span></p>
                      </div>
                      <div className={`mt-2 sm:mt-0 w-5 h-5 rounded-full border ${
                        formData.vendorIds.includes(vendor.id) ? 'border-purple bg-purple' : 'border-gray-300'
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
                    {formData.vendorIds.length} of {mockVendors.length} selected
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Review & Submit</h2>
                <p className="text-gray-600 text-sm">Review your product details before submitting</p>
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Product Name</h3>
                      <p className="mt-1 text-base text-gray-900">{formData.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-base text-gray-900">{formData.description}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Customer Phone</h3>
                      <p className="mt-1 text-base text-gray-900">{formData.customerPhone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Images</h3>
                      <div className="mt-2 flex space-x-2 overflow-x-auto py-2">
                        {formData.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-md border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Selected Vendors</h3>
                      <ul className="mt-2 list-disc list-inside text-base text-gray-900">
                        {mockVendors
                          .filter(vendor => formData.vendorIds.includes(vendor.id))
                          .map(vendor => (
                            <li key={vendor.id}>
                              <span className="font-medium">{vendor.name}</span>
                              <span className="text-xs text-gray-500 ml-2">Phone: {vendor.phone}</span>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-2">
            {currentStep !== 'details' ? (
              <Button variant="outline" onClick={prevStep} className="w-full sm:w-auto">
                Back
              </Button>
            ) : (
              <div aria-hidden className="hidden sm:block"></div>
            )}

            {currentStep !== 'review' ? (
              <Button
                variant="purple"
                onClick={nextStep}
                disabled={!isCurrentStepValid()}
                className="w-full sm:w-auto"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="purple"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Product"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
