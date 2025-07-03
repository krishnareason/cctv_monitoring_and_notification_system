// notificationService.js
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Email transporter setup (Gmail) - only if credentials are available
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('📧 Email service initialized successfully');
  } catch (error) {
    console.warn('📧 Failed to initialize email service:', error.message);
    emailTransporter = null;
  }
} else {
  console.warn('📧 Email service not configured - missing EMAIL_USER or EMAIL_PASS');
}

// Twilio client setup - only if credentials are available
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('📱 SMS service initialized successfully');
  } catch (error) {
    console.warn('📱 Failed to initialize SMS service:', error.message);
    twilioClient = null;
  }
} else {
  console.warn('📱 SMS service not configured - missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
}

// Track sent notifications to avoid spam
const notificationHistory = new Map();
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes cooldown

const shouldSendNotification = (cameraId, type) => {
  const key = `${cameraId}-${type}`;
  const lastSent = notificationHistory.get(key);
  const now = Date.now();
  
  if (!lastSent || (now - lastSent) > NOTIFICATION_COOLDOWN) {
    notificationHistory.set(key, now);
    return true;
  }
  
  return false;
};

export const sendEmailNotification = async (camera, alertType, message) => {
  if (!process.env.NOTIFICATIONS_ENABLED || !process.env.EMAIL_NOTIFICATIONS) {
    return false;
  }

  if (!emailTransporter) {
    console.log(`📧 Email notification skipped for ${camera.name} - service not configured`);
    return false;
  }

  if (!shouldSendNotification(camera.id, `email-${alertType}`)) {
    console.log(`📧 Email notification skipped for ${camera.name} (cooldown active)`);
    return false;
  }

  try {
    const subject = `🚨 CCTV Alert: ${camera.name} ${alertType.toUpperCase()}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🛡️ Smart CCTV Alert</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <div style="background: ${alertType === 'offline' ? '#fef2f2' : '#fef3c7'}; border: 1px solid ${alertType === 'offline' ? '#fecaca' : '#fde68a'}; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
            <h2 style="color: ${alertType === 'offline' ? '#dc2626' : '#d97706'}; margin: 0 0 8px 0; font-size: 18px;">
              ${alertType === 'offline' ? '🔴 Camera Offline' : '⚠️ Camera Issue'}
            </h2>
            <p style="margin: 0; color: #374151; font-size: 16px;">
              <strong>Camera:</strong> ${camera.name}<br>
              <strong>IP Address:</strong> ${camera.ipAddress}<br>
              <strong>Issue:</strong> ${message}<br>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px;">
            <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">📋 Recommended Actions:</h3>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              ${alertType === 'offline' ? `
                <li>Check if the camera device is powered on</li>
                <li>Verify network connection and WiFi signal</li>
                <li>Restart the IP Webcam app on the phone</li>
                <li>Check if the IP address has changed</li>
              ` : `
                <li>Check camera lens for obstructions</li>
                <li>Adjust lighting conditions if needed</li>
                <li>Clean the camera lens</li>
                <li>Restart the camera if issues persist</li>
              `}
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated alert from your Smart CCTV Dashboard<br>
              <a href="http://localhost:5173" style="color: #3b82f6;">View Dashboard</a>
            </p>
          </div>
        </div>
      </div>
    `;

    await emailTransporter.sendMail({
      from: `"Smart CCTV System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: subject,
      html: htmlContent
    });

    console.log(`📧 Email notification sent for ${camera.name} - ${alertType}`);
    return true;
  } catch (error) {
    console.error('📧 Failed to send email notification:', error.message);
    return false;
  }
};

export const sendSMSNotification = async (camera, alertType, message) => {
  if (!process.env.NOTIFICATIONS_ENABLED || !process.env.SMS_NOTIFICATIONS) {
    return false;
  }

  if (!twilioClient) {
    console.log(`📱 SMS notification skipped for ${camera.name} - service not configured`);
    return false;
  }

  if (!shouldSendNotification(camera.id, `sms-${alertType}`)) {
    console.log(`📱 SMS notification skipped for ${camera.name} (cooldown active)`);
    return false;
  }

  try {
    const smsMessage = `🚨 CCTV ALERT: ${camera.name} is ${alertType.toUpperCase()}. ${message}. Time: ${new Date().toLocaleTimeString()}. Check dashboard: http://localhost:5173`;

    await twilioClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_FROM,
      to: process.env.TWILIO_PHONE_TO
    });

    console.log(`📱 SMS notification sent for ${camera.name} - ${alertType}`);
    return true;
  } catch (error) {
    console.error('📱 Failed to send SMS notification:', error.message);
    return false;
  }
};

export const sendNotifications = async (camera, alertType, message) => {
  const results = await Promise.allSettled([
    sendEmailNotification(camera, alertType, message),
    sendSMSNotification(camera, alertType, message)
  ]);

  const emailResult = results[0].status === 'fulfilled' ? results[0].value : false;
  const smsResult = results[1].status === 'fulfilled' ? results[1].value : false;

  return {
    email: emailResult,
    sms: smsResult,
    success: emailResult || smsResult
  };
};
