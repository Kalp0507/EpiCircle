
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const roleOptions = [
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
  { value: "intern", label: "Intern" },
];

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // default to customer
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Pass selected role as an optional mock override (for demo purposes)
      await signIn(email, password, phone, role); 
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-r from-purple to-purple-dark bg-clip-text text-transparent">BidBoost</span>
          </h1>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/signup" className="font-medium text-purple hover:text-purple-dark">
              create a new account
            </Link>
          </p>
        </div>
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Try: customer@example.com, vendor@example.com, or intern@example.com
              </p>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="[0-9+\s-]{7,15}"
                  placeholder="e.g. +1234567890"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter your phone number. Demo: any valid number.
              </p>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Any password will work for this demo
              </p>
            </div>
            {/* Add Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select profile
              </label>
              <RadioGroup
                defaultValue={role}
                value={role}
                onValueChange={setRole}
                className="flex gap-4"
                aria-label="Select profile"
              >
                {roleOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`role-${opt.value}`} />
                    <label htmlFor={`role-${opt.value}`} className="text-sm">{opt.label}</label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Button
                type="submit"
                variant="purple"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
