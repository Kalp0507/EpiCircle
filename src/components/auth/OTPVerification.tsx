
import React from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPVerificationProps {
  onVerify: (otp: string) => void;
  onResend: () => void;
  isLoading: boolean;
}

const OTPVerification = ({ onVerify, onResend, isLoading }: OTPVerificationProps) => {
  const [otp, setOtp] = React.useState("");

  const handleComplete = (value: string) => {
    setOtp(value);
    onVerify(value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-medium">Enter verification code</h3>
        <p className="text-sm text-gray-500">
          We've sent a 6-digit code to your phone number
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
          onClick={onResend}
          disabled={isLoading}
          className="text-sm text-purple hover:text-purple-dark"
        >
          Resend code
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;
