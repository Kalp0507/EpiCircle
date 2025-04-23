import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  name: string;
  description: string;
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
    images: [],
    vendorIds: [],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArr: File[] = Array.from(files);
    const uploadPromises = fileArr.map(async (file) => {
      const uniqueFilename = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('product_images')
        .upload(`${currentUser?.id}/${uniqueFilename}`, file);

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      return data?.path || null;
    });

    const paths = await Promise.all(uploadPromises);
    const validPaths = paths.filter((path): path is string => path !== null);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validPaths].slice(0, 6),
    }));
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = formData.images[index];
    
    try {
      const { error } = await supabase.storage
        .from('product_images')
        .remove([imageToRemove]);

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!currentUser) throw new Error('User not authenticated');

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          customer_id: currentUser.id
        })
        .select()
        .single();

      if (productError) throw productError;

      if (formData.images.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(
            formData.images.map(path => ({
              product_id: product.id,
              image_path: path
            }))
          );

        if (imagesError) throw imagesError;
      }

      if (formData.vendorIds.length > 0) {
        const { error: vendorsError } = await supabase
          .from('product_vendors')
          .insert(
            formData.vendorIds.map(vendorId => ({
              product_id: product.id,
              vendor_id: vendorId
            }))
          );

        if (vendorsError) throw vendorsError;
      }

      navigate("/dashboard", { 
        state: { 
          success: true, 
          message: "Product submitted successfully!" 
        } 
      });
    } catch (error: any) {
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

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-2 sm:px-4 lg:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Add New Product
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
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

        <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            {currentStep === 'details' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Product Details</h2>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-purple focus:border-purple text-base sm:text-sm dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., Vintage Silver Coffee Set"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleDetailsChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-purple focus:border-purple text-base sm:text-sm dark:bg-gray-800 dark:text-white"
                    placeholder="Provide details about the product, condition, history, etc."
                  ></textarea>
                </div>
              </div>
            )}

            {currentStep === 'images' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Product Images</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Upload images from your device. Choose at least one (max 6).</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  {formData.images.map((img, idx) => (
                    <div className="relative group" key={idx}>
                      <img
                        src={img}
                        alt={`Product ${idx + 1}`}
                        className="w-28 h-28 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
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
                  {formData.images.length < 6 && (
                    <label className="flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 dark:border-gray-700 hover:border-purple transition text-gray-400 dark:text-gray-500">
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
                <div className="flex items-center justify-center mt-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.images.length} of 6 uploaded
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'vendors' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Select Vendors</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Choose vendors to request quotes from. Select at least one.</p>
                <div className="space-y-4 mt-4">
                  {mockVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between ${
                        formData.vendorIds.includes(vendor.id) ? 'border-purple bg-purple-light dark:bg-purple/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => handleVendorSelect(vendor.id)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{vendor.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{vendor.specialty}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Phone: <span className="font-medium">{vendor.phone}</span></p>
                      </div>
                      <div className={`mt-2 sm:mt-0 w-5 h-5 rounded-full border ${
                        formData.vendorIds.includes(vendor.id) ? 'border-purple bg-purple' : 'border-gray-300 dark:border-gray-700'
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.vendorIds.length} of {mockVendors.length} selected
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Review & Submit</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Review your product details before submitting</p>
                <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Product Name</h3>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">{formData.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Description</h3>
                      <p className="mt-1 text-base text-gray-900 dark:text-white">{formData.description}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Images</h3>
                      <div className="mt-2 flex space-x-2 overflow-x-auto py-2">
                        {formData.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Selected Vendors</h3>
                      <ul className="mt-2 list-disc list-inside text-base text-gray-900 dark:text-white">
                        {mockVendors
                          .filter(vendor => formData.vendorIds.includes(vendor.id))
                          .map(vendor => (
                            <li key={vendor.id}>
                              <span className="font-medium">{vendor.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Phone: {vendor.phone}</span>
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

          <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-2">
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
