
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
export const sendOTP = async (phoneNumber: string): Promise<string> => {
  try {
    const otp = generateOTP();
    
    // Store OTP in sessionStorage for verification
    storeOTP(phoneNumber, otp);

    // Try to send via Edge Function
    try {
      const { data, error } = await supabase.functions.invoke("send-sms-otp", {
        body: { phoneNumber, otp },
      });

      if (error) {
        console.error("Error sending OTP:", error);
        throw new Error(error.message || "Failed to send verification code");
      }

      // Log response for debugging
      console.log("OTP send response:", data);
      
      // If the response contains an error but also includes 'development' flag
      // This means the edge function is in development mode or has issues with Twilio
      if (data && data.error && data.development) {
        console.warn("Using development mode for OTP");
        // We already stored the OTP in sessionStorage, so verification will still work
      }
      
    } catch (functionError: any) {
      // Log the error but don't throw - the OTP is already stored in session storage
      console.error("Edge function error:", functionError);
      console.log("Development mode: OTP generation continuing despite edge function error");
    }
    
    // Return the OTP for development purposes
    return otp;
  } catch (error: any) {
    console.error("Error in sendOTP:", error);
    throw new Error(error.message || "Failed to send verification code");
  }
};
