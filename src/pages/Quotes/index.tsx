
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types";

const QuotesPage = () => {
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchCustomer = async (product: Product) => {
      if (!product?.id) return;

      const { data: orderData, error } = await supabase
        .from("orders")
        .select("customer_id")
        .contains("product_ids", [product.id])
        .single();

      if (error) {
        console.error("Error fetching customer ID:", error);
        return;
      }

      const { data: custData, error: custError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", orderData.customer_id)
        .single();

      if (custError) {
        console.error("Failed to fetch customer:", custError.message);
      } else {
        console.log('cust', custData)
        setCustomer(custData);
      }
    };

    const fetchProduct = async () => {
      if (!productId) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Failed to fetch product:", error.message);
      } else {
        console.log('product', data)
        setProduct(data);
        fetchCustomer(data);
      }
    };

    fetchProduct();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("product_vendors")
      .update({
        quoted_price: parseFloat(price),
        // quote_notes: notes, // assuming you also want to save notes
      })
      .eq("product_id", product?.id);

    if (error) {
      console.error("Failed to submit quote:", error.message);
      alert("Failed to submit quote. Please try again.");
    } else {
      console.log("Quote submitted successfully!");
      setPrice("");
      setNotes("");
      navigate('/dashboard');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit Quote</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Details Card */}
          {product ? (
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img
                    src={product?.image_urls?.[0] || "https://placehold.co/400x300"}
                    alt={product?.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{product?.name}</h3>
                    <p className="text-gray-600 mt-1">{product?.description}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Customer: </span>
                      {customer?.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Location: </span>
                      {customer?.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="col-span-2 text-center text-gray-600 py-12">
              Loading product details...
            </div>
          )}


          {/* Quote Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <Textarea
                    placeholder="Add any notes or comments about your quote..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div> */}

                <Button type="submit" className="w-full" variant="purple">
                  Submit Quote
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuotesPage;
