
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log("Edge function invoked: send-sms-otp");
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body parsed:", JSON.stringify(body));
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { phoneNumber, otp }: SMSRequestPayload = body;

    if (!phoneNumber || !otp) {
      console.error("Missing required parameters:", { phoneNumber: !!phoneNumber, otp: !!otp });
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
      console.error("Twilio credentials missing:", {
        hasSid: !!twilioAccountSid,
        hasToken: !!twilioAuthToken,
        hasPhone: !!twilioPhoneNumber
      });
      return new Response(
        JSON.stringify({ error: "SMS service configuration is incomplete" }),
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
    
    console.log(`Sending OTP to: ${formattedPhone} from ${twilioPhoneNumber}`);

    // Send SMS via Twilio
    try {
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
      
      console.log("Twilio API response status:", twilioResponse.status);
      
      if (!twilioResponse.ok) {
        console.error("Twilio API error:", JSON.stringify(twilioData));
        return new Response(
          JSON.stringify({
            error: twilioData.message || "Failed to send SMS",
            details: twilioData
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
    } catch (fetchError) {
      console.error("Error calling Twilio API:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to communicate with SMS provider", details: fetchError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send SMS" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
