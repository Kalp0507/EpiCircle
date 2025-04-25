
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Phone, Lock } from "lucide-react";
import OTPVerification from "@/components/auth/OTPVerification";
import { sendOTP, verifyOTP } from "@/utils/otpService";

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Send real OTP via Twilio
      await sendOTP(phone);
      
      setShowOTP(true);
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setIsLoading(true);
    try {
      // Verify OTP against stored value
      const isValid = verifyOTP(phone, otp);
      
      if (isValid) {
        await signIn(phone, password);
        toast({
          title: "Sign in successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify code. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOTP(phone);
      return true;
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      throw error;
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
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!showOTP ? (
            <form className="space-y-6" onSubmit={handleInitialSubmit}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
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
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Demo: Try +1234567890 (vendor), +1987654321 (intern), or +1122334455 (admin)
                </p>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Use "password" for all demo accounts
                </p>
              </div>
              
              <div>
                <Button
                  type="submit"
                  variant="purple"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending code..." : "Continue"}
                </Button>
              </div>
            </form>
          ) : (
            <OTPVerification
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
              isLoading={isLoading}
              phoneNumber={phone}
            />
          )}
        </div>
      </div>
    </div>
  );
};
