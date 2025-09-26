const twilio = require('twilio');
const nodemailer = require('nodemailer');
const { User, Response } = require('../models');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send SMS notification
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.log(`📱 SMS (Demo): ${phoneNumber} - ${message}`);
      return { success: true, demo: true };
    }
    
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log(`✅ SMS sent to ${phoneNumber}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS failed to ${phoneNumber}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send email notification
const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log(`📧 Email (Demo): ${to} - ${subject}`);
      return { success: true, demo: true };
    }
    
    const result = await emailTransporter.sendMail({
      from: `"LILERP Emergency System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    });
    
    console.log(`✅ Email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Find appropriate responders based on location and incident type
const findResponders = async (incident, user) => {
  try {
    // Find traditional chiefs in the same area
    const chiefs = await User.findAll({
      where: {
        user_type: 'traditional_chief',
        county: user.county || 'Nimba',
        is_active: true
      }
    });
    
    // Find other responders (NGO workers, police, etc.)
    const responders = await User.findAll({
      where: {
        user_type: 'responder',
        county: user.county || 'Nimba',
        is_active: true
      }
    });
    
    return [...chiefs, ...responders];
  } catch (error) {
    console.error('Error finding responders:', error);
    return [];
  }
};

// Create response records for notified responders
const createResponseRecords = async (incident, responders) => {
  try {
    const responses = await Promise.all(
      responders.map(responder => 
        Response.create({
          incident_id: incident.id,
          responder_id: responder.id,
          response_type: responder.user_type === 'traditional_chief' 
            ? 'traditional_mediation' 
            : 'community_watch',
          status: 'notified'
        })
      )
    );
    
    return responses;
  } catch (error) {
    console.error('Error creating response records:', error);
    return [];
  }
};

// Format incident details for notifications
const formatIncidentMessage = (incident, user, isUrgent = false) => {
  const urgencyPrefix = isUrgent ? '🚨 URGENT EMERGENCY 🚨\n' : '';
  const incidentTypeText = incident.incident_type.replace('_', ' ').toUpperCase();
  const urgencyText = incident.urgency_level.toUpperCase();
  
  return `${urgencyPrefix}LILERP ALERT: ${incidentTypeText}
  
Location: ${incident.village_name || 'Unknown'}, ${incident.district || 'Unknown'}
Urgency: ${urgencyText}
Reporter: ${user.phone_number}
Time: ${new Date(incident.createdAt).toLocaleString()}
Reference: ${incident.id.substring(0, 8)}

${isUrgent ? 'IMMEDIATE RESPONSE REQUIRED' : 'Please respond according to urgency level'}

Reply RESPOND to acknowledge or call ${user.phone_number} directly.`;
};

// Format email content
const formatIncidentEmail = (incident, user, isUrgent = false) => {
  const subject = isUrgent 
    ? `🚨 URGENT: Land Dispute Emergency in ${incident.village_name || 'Nimba County'}`
    : `LILERP Alert: ${incident.incident_type.replace('_', ' ')} reported in ${incident.village_name || 'Nimba County'}`;
    
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${isUrgent ? '#dc2626' : '#059669'}; color: white; padding: 20px; text-align: center;">
        <h1>${isUrgent ? '🚨 URGENT EMERGENCY' : '📢 LILERP ALERT'}</h1>
        <h2>${incident.incident_type.replace('_', ' ').toUpperCase()}</h2>
      </div>
      
      <div style="padding: 20px; background: #f9fafb;">
        <h3>Incident Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Type:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${incident.incident_type.replace('_', ' ')}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Urgency:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${incident.urgency_level}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Location:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${incident.village_name || 'Unknown'}, ${incident.district || 'Unknown'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Reporter:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.phone_number}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(incident.createdAt).toLocaleString()}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${incident.id.substring(0, 8)}</td></tr>
        </table>
        
        ${incident.description ? `<p><strong>Description:</strong> ${incident.description}</p>` : ''}
        
        <div style="margin-top: 20px; padding: 15px; background: ${isUrgent ? '#fef2f2' : '#f0fdf4'}; border-left: 4px solid ${isUrgent ? '#dc2626' : '#059669'};">
          <p style="margin: 0; font-weight: bold;">
            ${isUrgent ? 'IMMEDIATE RESPONSE REQUIRED' : 'Please respond according to urgency level'}
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <p>Contact reporter directly: <a href="tel:${user.phone_number}" style="color: #059669; text-decoration: none; font-weight: bold;">${user.phone_number}</a></p>
        </div>
      </div>
      
      <div style="padding: 15px; background: #374151; color: white; text-align: center; font-size: 12px;">
        <p>LILERP Emergency Response System for Rural Liberia</p>
        <p>Automated notification - do not reply to this email</p>
      </div>
    </div>
  `;
  
  return { subject, html };
};

// Main notification function
const sendNotifications = async (incident, user, isUrgent = false) => {
  try {
    console.log(`📢 Sending notifications for incident ${incident.id.substring(0, 8)}`);
    
    // Find appropriate responders
    const responders = await findResponders(incident, user);
    
    if (responders.length === 0) {
      console.log('⚠️ No responders found, using default emergency contacts');
      
      // Send to default emergency contacts
      const smsMessage = formatIncidentMessage(incident, user, isUrgent);
      
      if (process.env.EMERGENCY_CHIEF_PHONE) {
        await sendSMS(process.env.EMERGENCY_CHIEF_PHONE, smsMessage);
      }
      
      if (process.env.EMERGENCY_NGO_EMAIL) {
        const { subject, html } = formatIncidentEmail(incident, user, isUrgent);
        await sendEmail(process.env.EMERGENCY_NGO_EMAIL, subject, smsMessage, html);
      }
      
      return;
    }
    
    // Create response records
    await createResponseRecords(incident, responders);
    
    // Send notifications to all responders
    const smsMessage = formatIncidentMessage(incident, user, isUrgent);
    const { subject, html } = formatIncidentEmail(incident, user, isUrgent);
    
    const notificationPromises = responders.map(async (responder) => {
      // Send SMS
      await sendSMS(responder.phone_number, smsMessage);
      
      // Send email if available (for NGO workers and formal responders)
      if (responder.user_type === 'responder' && responder.email) {
        await sendEmail(responder.email, subject, smsMessage, html);
      }
    });
    
    await Promise.all(notificationPromises);
    
    console.log(`✅ Notifications sent to ${responders.length} responders`);
    
    // Send confirmation SMS to reporter
    const confirmationMessage = `Your ${incident.incident_type.replace('_', ' ')} report has been submitted. Reference: ${incident.id.substring(0, 8)}. ${isUrgent ? 'Emergency responders have been notified immediately.' : 'You will be contacted within 24 hours.'}`;
    
    await sendSMS(user.phone_number, confirmationMessage);
    
  } catch (error) {
    console.error('Error sending notifications:', error);
    
    // Fallback: send to default emergency contact
    try {
      const fallbackMessage = `LILERP SYSTEM ERROR: Failed to send notifications for incident ${incident.id.substring(0, 8)}. Manual intervention required. Reporter: ${user.phone_number}`;
      
      if (process.env.EMERGENCY_CHIEF_PHONE) {
        await sendSMS(process.env.EMERGENCY_CHIEF_PHONE, fallbackMessage);
      }
    } catch (fallbackError) {
      console.error('Fallback notification also failed:', fallbackError);
    }
  }
};

module.exports = {
  sendSMS,
  sendEmail,
  sendNotifications,
  formatIncidentMessage,
  formatIncidentEmail
};
