
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types";

const socialProviders = [
  { name: "Google", id: "google", icon: "G" },
  { name: "Twitter", id: "twitter", icon: "T" },
  { name: "GitHub", id: "github", icon: "GH" },
];

export default function AuthPage() {
  const { signIn, signUp, isLoading, currentUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
    // eslint-disable-next-line
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await signUp({ email, password, full_name, phone, role });
      } else {
        await signIn({ email, password });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  // Removed broken social login handler for now

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h2>
        </div>
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm mb-4">
                {error}
              </div>
            )}
            {isSignUp && (
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  required
                  value={full_name}
                  placeholder="Jane Doe"
                  onChange={e => setFullName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            {isSignUp && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. +1234567890"
                />
              </div>
            )}
            {isSignUp && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900"
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <Button type="submit" variant="purple" className="w-full" disabled={isLoading}>
                {isSignUp ? (isLoading ? "Signing up..." : "Sign up") : (isLoading ? "Signing in..." : "Sign in")}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              className="text-purple hover:underline text-sm"
              onClick={() => setIsSignUp((s) => !s)}
              disabled={isLoading}
              type="button"
            >
              {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
