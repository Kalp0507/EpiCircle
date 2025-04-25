
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

interface SMSRequestPayload {
  phoneNumber: string;
  otp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otp }: SMSRequestPayload = await req.json();

    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone number and OTP are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if Twilio credentials are available
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({
          error: "SMS service configuration is incomplete",
          details: "Twilio credentials are missing",
          development: true,
          otp
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Convert phone number to E.164 format if needed
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith("+")) {
      formattedPhone = `+${phoneNumber}`;
    }
    
    console.log(`Attempting to send OTP to: ${formattedPhone} from ${twilioPhoneNumber}`);

    // Send SMS via Twilio
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: formattedPhone,
          Body: `Your verification code is: ${otp}`,
        }),
      }
    );

    const twilioData = await twilioResponse.json();
    
    // Log the Twilio response for debugging
    console.log("Twilio API response:", JSON.stringify(twilioData));

    if (!twilioResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to send SMS", 
          details: twilioData,
          twilioStatus: twilioResponse.status,
          phoneFormat: formattedPhone,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "SMS sent successfully", sid: twilioData.sid }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
