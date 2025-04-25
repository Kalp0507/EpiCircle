import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Phone, Lock, MapPin, User } from "lucide-react";
import OTPVerification from "@/components/auth/OTPVerification";
import { sendOTP, verifyOTP } from "@/utils/otpService";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<UserRole>("vendor");
  const [step, setStep] = useState(1); // 1: Select Role, 2: Fill Details
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  const handleRoleSelection = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
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
      const isValid = verifyOTP(phone, otp);
      
      if (isValid) {
        await signUp({
          name,
          phone,
          password,
          role,
          location: role === 'admin' ? undefined : location
        });
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
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

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Select Your Role</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div 
          onClick={() => handleRoleSelection("vendor")}
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center space-y-3 hover:border-purple-500 cursor-pointer"
        >
          <span className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="h-6 w-6 text-purple-600" />
          </span>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Vendor</p>
            <p className="text-xs text-gray-500 mt-1">Quote on products</p>
          </div>
        </div>
        <div 
          onClick={() => handleRoleSelection("intern")}
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center space-y-3 hover:border-purple-500 cursor-pointer"
        >
          <span className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </span>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Intern</p>
            <p className="text-xs text-gray-500 mt-1">Upload products</p>
          </div>
        </div>
        <div 
          onClick={() => handleRoleSelection("admin")}
          className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center space-y-3 hover:border-purple-500 cursor-pointer"
        >
          <span className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <User className="h-6 w-6 text-green-600" />
          </span>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500 mt-1">Manage everything</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSignupForm = () => (
    <>
      {!showOTP ? (
        <form className="space-y-6" onSubmit={handleInitialSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
              />
            </div>
          </div>
          
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
          </div>
          
          {(role === 'vendor' || role === 'intern') && (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
                  placeholder="City, State"
                />
              </div>
            </div>
          )}
          
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple focus:border-purple sm:text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="purple"
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
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            <span className="bg-gradient-to-r from-purple to-purple-dark bg-clip-text text-transparent">BidBoost</span>
          </h1>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/signin" className="font-medium text-purple hover:text-purple-dark">
              sign in to existing account
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          {step === 1 ? renderRoleSelection() : renderSignupForm()}
        </div>
      </div>
    </div>
  );
}
