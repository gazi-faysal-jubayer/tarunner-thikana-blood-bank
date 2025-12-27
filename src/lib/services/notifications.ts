/**
 * Notification Service - Email Only (Free Implementation)
 * This module handles Email notifications using Resend (free tier: 3,000 emails/month).
 * SMS removed to maintain 100% free service with no credit card required.
 */

import type { NotificationType, NotificationChannel } from "@/lib/supabase/types";

interface NotificationPayload {
  email: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const isMockMode = process.env.NEXT_PUBLIC_MOCK_SERVICES === "true";

// Mock Email sender (Resend ready)
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (isMockMode || !process.env.RESEND_API_KEY) {
    console.log("[MOCK EMAIL]", {
      to: payload.to,
      subject: payload.subject,
    });
    return true;
  }

  try {
    // Real Resend implementation
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "তারুণ্যের ঠিকানা <noreply@tarunner-thikana.org>",
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const result = await response.json();
    return !result.error;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

// Email notification templates
const templates = {
  request_submitted: (data: { trackingId: string; patientName: string }) => ({
      subject: `রক্তের অনুরোধ জমা হয়েছে - ${data.trackingId}`,
      html: `
        <div style="font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">তারুণ্যের ঠিকানা Blood Bank</h1>
          </div>
          <div style="padding: 20px; background: #fff;">
            <h2>রক্তের অনুরোধ জমা হয়েছে</h2>
            <p>প্রিয় ব্যবহারকারী,</p>
            <p><strong>${data.patientName}</strong> এর জন্য আপনার রক্তের অনুরোধ সফলভাবে জমা হয়েছে।</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>ট্র্যাকিং আইডি:</strong> ${data.trackingId}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/track/${data.trackingId}" 
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              অনুরোধ ট্র্যাক করুন
            </a>
          </div>
          <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© ${new Date().getFullYear()} তারুণ্যের ঠিকানা Blood Bank</p>
          </div>
        </div>
      `,
  }),
  request_approved: (data: { trackingId: string; patientName: string }) => ({
      subject: `অনুরোধ অনুমোদিত - ${data.trackingId}`,
      html: `
        <div style="font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">✓ অনুরোধ অনুমোদিত</h1>
          </div>
          <div style="padding: 20px; background: #fff;">
            <p>${data.patientName} এর জন্য আপনার রক্তের অনুরোধ অনুমোদিত হয়েছে।</p>
            <p>আমাদের স্বেচ্ছাসেবকরা রক্তদাতা খুঁজে বের করছেন।</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/track/${data.trackingId}" 
               style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              স্ট্যাটাস দেখুন
            </a>
          </div>
        </div>
      `,
  }),
  donor_assigned: (data: { hospitalName: string; bloodGroup: string; patientName: string; trackingId: string }) => ({
      subject: `জরুরি রক্তের প্রয়োজন - ${data.bloodGroup}`,
      html: `
        <div style="font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🩸 জরুরি রক্তের প্রয়োজন</h1>
          </div>
          <div style="padding: 20px; background: #fff;">
            <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0;">${data.bloodGroup} রক্তের প্রয়োজন</h2>
              <p style="margin: 0;"><strong>রোগী:</strong> ${data.patientName}</p>
              <p style="margin: 0;"><strong>হাসপাতাল:</strong> ${data.hospitalName}</p>
            </div>
            <p>আপনাকে এই অনুরোধের জন্য নির্বাচন করা হয়েছে। অনুগ্রহ করে যত তাড়াতাড়ি সম্ভব যোগাযোগ করুন।</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/donor" 
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              বিস্তারিত দেখুন
            </a>
          </div>
        </div>
      `,
  }),
  emergency_alert: (data: { bloodGroup: string; hospitalName: string; patientName: string }) => ({
      subject: `🚨 জরুরি রক্তের আবেদন - ${data.bloodGroup}`,
      html: `
        <div style="font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🚨 জরুরি রক্তের আবেদন</h1>
          </div>
          <div style="padding: 20px; background: #fff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 48px; background: #dc2626; color: white; padding: 10px 20px; border-radius: 8px;">
                ${data.bloodGroup}
              </span>
            </div>
            <p><strong>হাসপাতাল:</strong> ${data.hospitalName}</p>
            <p><strong>রোগী:</strong> ${data.patientName}</p>
            <p>এটি একটি জরুরি অনুরোধ। যদি আপনি সাহায্য করতে পারেন, অনুগ্রহ করে এখনই যোগাযোগ করুন।</p>
          </div>
        </div>
      `,
  }),
};

// Main notification sender (Email only)
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  const template = templates[payload.type as keyof typeof templates];

  if (!template) {
    console.warn(`No template found for notification type: ${payload.type}`);
    return false;
  }

  // Send Email
  const emailContent = template(payload.data as never);
  const result = await sendEmail({
    to: payload.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  // Log notification (would be saved to database in production)
  console.log("[Notification]", {
    type: payload.type,
    email: payload.email,
    success: result,
  });

  return result;
}

// Bulk email notification for emergency alerts
export async function sendEmergencyAlerts(
  donors: Array<{
    email: string;
    bloodGroup: string;
    distance: number;
  }>,
  requestData: {
    hospitalName: string;
    patientName: string;
    bloodGroup: string;
  }
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const donor of donors) {
    const result = await sendNotification({
      email: donor.email,
      type: "emergency_alert",
      title: "জরুরি রক্তের আবেদন",
      message: `${requestData.bloodGroup} রক্ত দরকার`,
      data: {
        ...requestData,
        distance: donor.distance,
      },
    });

    if (result) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

