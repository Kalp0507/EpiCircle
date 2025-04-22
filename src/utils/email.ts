
import { Resend } from "resend";

/**
 * Sends an email to a vendor.
 * Note: You must set RESEND_API_KEY in your environment variables.
 */
export async function sendVendorEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = (window as any).RESEND_API_KEY || import.meta.env.VITE_RESEND_API_KEY || "";
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  const resend = new Resend(apiKey);

  try {
    const resp = await resend.emails.send({
      from: "noreply@yourdomain.com",
      to,
      subject,
      html,
    });
    return resp;
  } catch (e) {
    console.error("Failed to send vendor email:", e);
    throw e;
  }
}
