
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

  try {
    console.log("Attempting to invoke send-sms-otp function...");
    
    // Send via Edge Function with detailed error logging
    const { data, error } = await supabase.functions.invoke("send-sms-otp", {
      body: { phoneNumber, otp }
    });

    if (error) {
      console.error("Supabase function invocation error:", error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    if (data && data.error) {
      console.error("Edge function returned an error:", data.error);
      throw new Error(data.error);
    }

    console.log("SMS sent successfully:", data);
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    if (error.message?.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to connect to the SMS service. Please check your internet connection and try again.");
    }
    throw new Error(error?.message || "Failed to send verification code");
  }
};
