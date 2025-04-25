
import React from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";

interface OTPVerificationProps {
  onVerify: (otp: string) => void;
  onResend: () => void;
  isLoading: boolean;
  phoneNumber: string;
}

const OTPVerification = ({ onVerify, onResend, isLoading, phoneNumber }: OTPVerificationProps) => {
  const [otp, setOtp] = React.useState("");
  const [isResending, setIsResending] = React.useState(false);
  
  const handleComplete = (value: string) => {
    setOtp(value);
    onVerify(value);
  };
  
  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your phone.",
      });
    } catch (error) {
      toast({
        title: "Failed to resend code",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const maskedPhone = phoneNumber ? phoneNumber.replace(/(\d)(?=\d{4})/g, "*") : "";

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-medium">Enter verification code</h3>
        <p className="text-sm text-gray-500">
          We've sent a 6-digit code to {maskedPhone}
        </p>
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
          disabled={isLoading || isResending}
          className="text-sm text-purple hover:text-purple-dark"
        >
          {isResending ? "Sending..." : "Resend code"}
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;
