
import { supabase } from "@/supabaseClient";

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in session storage with expiration time (5 minutes)
export const storeOTP = (phoneNumber: string, otp: string): void => {
  const expiration = Date.now() + 5 * 60 * 1000; // 5 minutes
  sessionStorage.setItem(
    `otp_${phoneNumber}`,
    JSON.stringify({ otp, expiration })
  );
};

// Verify OTP against stored value
export const verifyOTP = (phoneNumber: string, inputOTP: string): boolean => {
  const storedData = sessionStorage.getItem(`otp_${phoneNumber}`);
  if (!storedData) return false;

  const { otp, expiration } = JSON.parse(storedData);
  const isValid = otp === inputOTP && Date.now() < expiration;

  // Clear OTP if valid or expired
  if (isValid || Date.now() >= expiration) {
    sessionStorage.removeItem(`otp_${phoneNumber}`);
  }

  return isValid;
};

// Send OTP via Twilio using our Supabase Edge Function
export const sendOTP = async (phoneNumber: string): Promise<void> => {
  const otp = generateOTP();
  
  // Store OTP first
  storeOTP(phoneNumber, otp);

  // Send via Edge Function
  const { data, error } = await supabase.functions.invoke("send-sms-otp", {
    body: { phoneNumber, otp }
  });

  if (error || (data && data.error)) {
    throw new Error(error?.message || data?.error || "Failed to send verification code");
  }
};
