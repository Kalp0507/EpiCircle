
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign } from "lucide-react";

const QuotesPage = () => {
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  // Mock product data (normally this would come from the database)
  const mockProduct = {
    id: "1",
    name: "Industrial Generator",
    description: "High-capacity industrial generator for commercial use",
    customerName: "ABC Industries",
    imageURLs: ["https://placehold.co/400x300"],
    specifications: "Power Output: 5000W, Voltage: 230V",
    created_at: new Date().toISOString(),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Quote submitted:", { price, notes });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit Quote</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img 
                  src={mockProduct.imageURLs[0]} 
                  alt={mockProduct.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{mockProduct.name}</h3>
                  <p className="text-gray-600 mt-1">{mockProduct.description}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Customer: </span>
                    {mockProduct.customerName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Specifications: </span>
                    {mockProduct.specifications}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <Textarea
                    placeholder="Add any notes or comments about your quote..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

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
