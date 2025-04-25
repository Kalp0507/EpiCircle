
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { toast } from "@/hooks/use-toast";
import OTPVerification from "@/components/auth/OTPVerification";
import { sendOTP, verifyOTP } from "@/utils/otpService";
import RoleSelection from "@/components/auth/RoleSelection";
import SignUpForm from "@/components/auth/SignUpForm";
import { supabase } from "@/supabaseClient";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<UserRole>("vendor");
  const [step, setStep] = useState(1);
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
      // Check if phone number is already registered before sending OTP
      const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone);

      if (fetchError) throw fetchError;
      if (existingUsers && existingUsers.length > 0) {
        throw new Error("Phone number already registered");
      }

      // If phone is not registered, proceed with OTP
      await sendOTP(phone);
      setShowOTP(true);
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification code. Please try again.");
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to verify code. Please try again.");
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
          {step === 1 ? (
            <RoleSelection onRoleSelect={handleRoleSelection} />
          ) : !showOTP ? (
            <SignUpForm
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              password={password}
              setPassword={setPassword}
              location={location}
              setLocation={setLocation}
              role={role}
              isLoading={isLoading}
              error={error}
              onSubmit={handleInitialSubmit}
              onBack={() => setStep(1)}
            />
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
