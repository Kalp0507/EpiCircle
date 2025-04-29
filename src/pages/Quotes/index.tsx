
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Order, Product } from "@/types";

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

  const checkOrderStatus = async (pid: string) => {
    try {
      const { data: orders, error: err } = await supabase
        .from("orders")
        .select('*')
        .contains('product_ids', [pid]);
  
      if (err || !orders || orders.length === 0) {
        console.error('Order not found or error:', err);
        return { id: null, status: 'Order Not Found' };
      }
  
      const { data: quotations, error: quoteErr } = await supabase
        .from("product_vendors")
        .select('*');
  
      if (quoteErr) {
        console.error('Error fetching quotations:', quoteErr);
        return { id: orders[0]?.id || null, status: 'Error' };
      }
  
      const order = orders[0]; // assuming one order
      const productIDs = order.product_ids;
  
      let quotedCount = 0;
      let selectedTrueCount = 0;
      let selectedFalseCount = 0;
  
      productIDs.forEach(pid => {
        const matchingQuotations = quotations.filter(q => q.product_id === pid);
  
        const hasQuoted = matchingQuotations.some(q => q.quoted_price);
        const allSelectedTrue = matchingQuotations.every(q => q.is_selected === true);
        const allSelectedFalse = matchingQuotations.every(q => q.is_selected === false);
  
        if (hasQuoted) quotedCount++;
  
        if (allSelectedTrue) selectedTrueCount++;
        else if (allSelectedFalse) selectedFalseCount++;
      });
  
      let status = 'Quoted';
  
      if (quotedCount === 0) {
        status = 'Order Placed';
      } else if (quotedCount < productIDs.length) {
        status = 'Not Quoted';
      } else {
        if (selectedTrueCount === productIDs.length) {
          status = 'Order Confirmed';
        } else if (selectedFalseCount === productIDs.length) {
          status = 'Order Cancelled';
        }
      }
  
      return { id: order.id, status };
  
    } catch (error) {
      console.log('Error checking order status:', error);
      return { id: null, status: 'Error' };
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!product?.id) {
      console.error("Product ID is missing.");
      alert("Invalid product. Please try again.");
      return;
    }
  
    // Step 1: Update quote
    const { error: quoteError } = await supabase
      .from("product_vendors")
      .update({
        quoted_price: parseFloat(price),
        // quote_notes: notes, // Uncomment if you're storing notes
      })
      .eq("product_id", product.id);
  
    if (quoteError) {
      console.error("Failed to submit quote:", quoteError.message);
      alert("Failed to submit quote. Please try again.");
      return;
    }
  
    // Step 2: Check order status
    const { id: orderId, status: orderStatus } = await checkOrderStatus(product.id);
  
    if (!orderId) {
      console.error("Order ID not found for product:", product.id);
      alert("Failed to update order status. Please try again.");
      return;
    }
  
    // Step 3: Update order status
    const { error: statusError } = await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("id", orderId);
  
    if (statusError) {
      console.error("Failed to update order status:", statusError.message);
      alert("Failed to update order status. Please try again.");
      return;
    }
  
    // Step 4: Cleanup and redirect
    console.log("Quote submitted and order status updated successfully!");
    setPrice("");
    setNotes("");
    navigate("/dashboard");
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
