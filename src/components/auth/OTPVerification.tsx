
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { generateOTP } from "@/utils/otpService";

interface OTPVerificationProps {
  onVerify: (otp: string) => void;
  onResend: () => Promise<unknown>;
  isLoading: boolean;
  phoneNumber: string;
}

const OTPVerification = ({ onVerify, onResend, isLoading, phoneNumber }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  // For development - get the OTP from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem(`otp_${phoneNumber}`);
    if (storedData) {
      const { otp } = JSON.parse(storedData);
      setDevOtp(otp);
      
      // Show a toast notification with the OTP in development
      toast({
        title: "Development Mode",
        description: `Your OTP is: ${otp}`,
        variant: "default",
      });
    }
    
    // Set up countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [phoneNumber, isResending]);
  
  const handleComplete = (value: string) => {
    setOtp(value);
    onVerify(value);
  };
  
  const handleResend = async () => {
    setIsResending(true);
    setCountdown(60);
    setOtpError(null);
    try {
      const result = await onResend();
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your phone.",
      });
      
      // Try to get the new OTP from sessionStorage
      const storedData = sessionStorage.getItem(`otp_${phoneNumber}`);
      if (storedData) {
        const { otp } = JSON.parse(storedData);
        setDevOtp(otp);
      }
    } catch (error: any) {
      setOtpError(error.message || "Failed to resend code");
      toast({
        title: "Failed to resend code",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Format phone number for display (privacy)
  const maskedPhone = phoneNumber ? phoneNumber.replace(/(\d)(?=\d{4})/g, "*") : "";

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-medium">Enter verification code</h3>
        <p className="text-sm text-gray-500">
          We've sent a 6-digit code to {maskedPhone}
        </p>
        
        {otpError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
            <p className="text-xs text-red-800">{otpError}</p>
          </div>
        )}
        
        {/* For development purposes only - show the OTP */}
        {devOtp && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-md">
            <p className="text-xs text-yellow-800 font-mono">
              Development Mode: Your OTP is <span className="font-bold">{devOtp}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
          onComplete={handleComplete}
          disabled={isLoading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="text-center">
        <Button
          variant="link"
          onClick={handleResend}
          disabled={isLoading || isResending || countdown > 0}
          className="text-sm text-purple hover:text-purple-dark"
        >
          {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;
