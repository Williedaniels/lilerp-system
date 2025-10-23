# LILERP Twilio IVR Setup Guide

## Complete Step-by-Step Instructions for Setting Up the IVR System

This guide will walk you through setting up the complete Twilio IVR (Interactive Voice Response) system for LILERP, including the voice menu, call routing, and recording features.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Twilio Account Setup](#twilio-account-setup)
3. [Getting Your Twilio Credentials](#getting-your-twilio-credentials)
4. [Configuring Your Backend](#configuring-your-backend)
5. [Setting Up the Phone Number](#setting-up-the-phone-number)
6. [Configuring Webhooks](#configuring-webhooks)
7. [IVR Call Flow Explanation](#ivr-call-flow-explanation)
8. [Testing the IVR System](#testing-the-ivr-system)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- ✅ A Twilio account (free trial or paid)
- ✅ Your LILERP backend server running and accessible via a public URL
- ✅ A tool to expose your local server (ngrok, localtunnel, or deployed server)
- ✅ Access to your `.env` file in the backend directory

---

## Twilio Account Setup

### Step 1: Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Click **"Sign up"** or **"Start for free"**
3. Fill in your details:
   - Email address
   - Password
   - First and Last name
4. Verify your email address
5. Verify your phone number (Twilio will send you a verification code)

### Step 2: Complete the Setup Wizard

1. After verification, you'll see a welcome screen
2. Select your use case: **"Voice & Video"** or **"IVR & Bots"**
3. Choose your programming language: **"Node.js"**
4. Skip the tutorial if you want (we'll configure everything manually)

---

## Getting Your Twilio Credentials

### Step 1: Find Your Account SID and Auth Token

1. Log in to your Twilio Console: [https://console.twilio.com/](https://console.twilio.com/)
2. On the dashboard, you'll see:
   - **Account SID**: A string starting with `AC...`
   - **Auth Token**: Click **"Show"** to reveal it (starts with a random string)
3. **Copy both values** - you'll need them for your `.env` file

### Step 2: Get a Phone Number

1. In the Twilio Console, click **"Phone Numbers"** in the left sidebar
2. Click **"Buy a number"** or **"Get a number"**
3. Select your country (Liberia if available, or use a US number for testing)
4. Choose a number with **"Voice"** capability
5. Click **"Buy"** (free trial accounts get $15 credit)
6. **Copy your new phone number** (format: +1234567890)

---

## Configuring Your Backend

### Step 1: Update Your `.env` File

Open `/home/ubuntu/lilerp-system-main/backend/.env` and update these values:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

Replace:

- `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual Account SID
- `your_auth_token_here` with your actual Auth Token
- `+1234567890` with your Twilio phone number

### Step 2: Expose Your Backend to the Internet

Your backend needs to be accessible via a public URL for Twilio to send webhooks.

#### Option A: Using ngrok (Recommended for Testing)

1. Download ngrok: [https://ngrok.com/download](https://ngrok.com/download)
2. Install and authenticate ngrok
3. Start your backend server:

   ```bash
   cd /home/ubuntu/lilerp-system-main/backend
   node server.js
   ```

4. In a new terminal, run:

   ```bash
   ngrok http 3001
   ```

5. Copy the **Forwarding URL** (e.g., `https://abc123.ngrok.io`)

#### Option B: Deploy to a Cloud Service

Deploy your backend to:

- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2

Make sure your server is running on a public URL with HTTPS.

---

## Setting Up the Phone Number

### Step 1: Configure Voice Webhooks

1. Go to Twilio Console → **Phone Numbers** → **Manage** → **Active numbers**
2. Click on your phone number
3. Scroll down to the **"Voice & Fax"** section
4. Under **"A CALL COMES IN"**:
   - Select **"Webhook"**
   - Enter your webhook URL: `https://your-domain.com/api/ivr/incoming-call`
     - Replace `your-domain.com` with your ngrok URL or deployed server URL
     - Example: `https://abc123.ngrok.io/api/ivr/incoming-call`
   - Select **"HTTP POST"**
5. Click **"Save"** at the bottom of the page

### Step 2: Configure Recording Webhooks (Optional)

If you want to receive recording notifications:

1. Under **"Recording"** section:
   - Select **"Record calls"** if desired
2. You can configure additional webhooks for:
   - Call status callbacks
   - Recording status callbacks

---

## Configuring Webhooks

The LILERP IVR system uses multiple webhook endpoints:

### Main Webhooks

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/ivr/incoming-call` | Initial call handler | POST |
| `/api/ivr/handle-menu` | Menu selection handler | POST |
| `/api/ivr/handle-recording` | Recording completion handler | POST |
| `/api/ivr/handle-transcription` | Transcription callback | POST |

### Webhook Configuration in Twilio

1. **Incoming Call Webhook**:
   - URL: `https://your-domain.com/api/ivr/incoming-call`
   - Method: POST
   - This is the main entry point

2. **Menu Handling** (automatic):
   - The system automatically routes to `/api/ivr/handle-menu`
   - No manual configuration needed

3. **Recording Callback** (automatic):
   - The system automatically routes to `/api/ivr/handle-recording`
   - No manual configuration needed

4. **Transcription Callback** (automatic):
   - The system automatically routes to `/api/ivr/handle-transcription`
   - No manual configuration needed

---

## IVR Call Flow Explanation

Here's what happens when someone calls your LILERP number:

### Step 1: Welcome Message

```sh
"Welcome to LILERP, the Liberia Integrated Land Registry 
and Emergency Response Platform."
```

### Step 2: Main Menu

```sh
"For land dispute emergencies, press 1.
For mining conflicts, press 2.
For inheritance disputes, press 3.
For other land issues, press 4.
To speak with an operator, press 0."
```

### Step 3: User Selects an Option

#### Option 1: Land Dispute Emergencies

- Type: `boundary_dispute`
- Message: "You have selected land dispute emergencies."
- Action: Prompt for voice recording

#### Option 2: Mining Conflicts

- Type: `mining_conflict`
- Message: "You have selected mining conflicts."
- Action: Prompt for voice recording

#### Option 3: Inheritance Disputes

- Type: `inheritance_dispute`
- Message: "You have selected inheritance disputes."
- Action: Prompt for voice recording

#### Option 4: Other Land Issues

- Type: `other`
- Message: "You have selected other land issues."
- Action: Prompt for voice recording

#### Option 0: Speak with Operator

- Action: Route call to available responder
- If no responder available: Prompt for voice message

### Step 4: Voice Recording

```sh
"Please describe your emergency in detail after the tone. 
You will have up to 2 minutes to record your message."
```

- Maximum recording length: 120 seconds (2 minutes)
- Automatic transcription enabled
- Recording saved to database

### Step 5: Confirmation

```sh
"Thank you for your report. Your emergency has been recorded 
and a responder will be assigned shortly. You will receive 
an SMS confirmation. Goodbye."
```

### Step 6: Backend Processing

1. **Create User** (if caller is new):
   - Phone number stored
   - Temporary account created

2. **Create Incident**:
   - Type based on menu selection
   - Priority set to "high"
   - Voice recording URL saved
   - Transcription saved when available

3. **Assign Responder**:
   - Find available responders
   - Assign based on:
     - Availability (status: active)
     - Workload (least busy first)
     - Response time (fastest first)
     - Rating (highest rated first)

4. **Notify Responder**:
   - SMS notification (if configured)
   - Dashboard update
   - Email notification (if configured)

---

## Testing the IVR System

### Step 1: Test the Welcome Message

1. Call your Twilio phone number from any phone
2. You should hear: "Welcome to LILERP..."
3. Listen for the menu options

### Step 2: Test Menu Options

**Test Option 1 (Land Dispute)**:

1. Press **1** when prompted
2. You should hear: "You have selected land dispute emergencies."
3. Wait for the recording prompt

**Test Option 0 (Operator)**:

1. Press **0** when prompted
2. You should hear: "Connecting you to an operator..."
3. If responders are available, you'll be connected
4. If not, you'll be prompted to leave a message

### Step 3: Test Voice Recording

1. Select any option (1-4)
2. Wait for the beep
3. Speak your message (up to 2 minutes)
4. Hang up or wait for the recording to end
5. You should hear the confirmation message

### Step 4: Verify in Database

1. Check your backend logs:

   ```bash
   # In your backend terminal
   # You should see logs like:
   # "Incoming call: CAxxxx from +1234567890"
   # "Recording received: https://..."
   ```

2. Check the database:

   ```bash
   # Connect to PostgreSQL
   psql -U postgres -d lilerp_development
   
   # Check incidents
   SELECT * FROM "Incidents" ORDER BY "createdAt" DESC LIMIT 5;
   
   # Check call logs
   SELECT * FROM "CallLogs" ORDER BY "createdAt" DESC LIMIT 5;
   ```

3. Check the responder dashboard:
   - Log in as a responder
   - Navigate to the dashboard
   - You should see the new incident

### Step 5: Test Transcription

1. Make a test call
2. Record a clear message
3. Wait 1-2 minutes for transcription
4. Check the incident in the database:

   ```sql
   SELECT "voiceTranscription" FROM "Incidents" 
   WHERE "callSid" = 'CAxxxx';
   ```

---

## Troubleshooting

### Issue: "We are experiencing technical difficulties"

**Possible Causes**:

- Backend server is not running
- Webhook URL is incorrect
- Backend is not accessible from the internet

**Solutions**:

1. Check if your backend is running:

   ```bash
   curl http://localhost:3001/health
   ```

2. Verify ngrok is running and forwarding correctly
3. Check Twilio webhook configuration
4. Check backend logs for errors

### Issue: No responders available

**Possible Causes**:

- No responders in database
- All responders are offline or busy

**Solutions**:

1. Create a test responder:

   ```bash
   # The system creates a default responder on first run
   # Email: admin@lilerp.org
   # Password: admin123
   ```

2. Log in as responder and set status to "active"
3. Check responder status in database:

   ```sql
   SELECT * FROM "Responders" WHERE status = 'active';
   ```

### Issue: Recording not saved

**Possible Causes**:

- Recording webhook URL is incorrect
- Backend is not receiving webhook

**Solutions**:

1. Check Twilio webhook logs:
   - Go to Twilio Console → Monitor → Logs → Errors
2. Verify recording callback URL in backend logs
3. Check if recording URL is accessible:

   ```bash
   curl "https://api.twilio.com/2010-04-01/Accounts/ACxxxx/Recordings/RExxxx"
   ```

### Issue: Transcription not working

**Possible Causes**:

- Transcription not enabled in recording settings
- Audio quality too poor
- Language not supported

**Solutions**:

1. Verify transcription is enabled in code:

   ```javascript
   twiml.record({
     transcribe: true,  // Make sure this is true
     transcribeCallback: '/api/ivr/handle-transcription'
   });
   ```

2. Speak clearly and slowly during test calls
3. Check Twilio transcription limits (free tier has limits)

### Issue: Database connection errors

**Possible Causes**:

- PostgreSQL not running
- Incorrect database credentials
- Database not created

**Solutions**:

1. Start PostgreSQL:

   ```bash
   sudo service postgresql start
   ```

2. Verify database exists:

   ```bash
   sudo -u postgres psql -l | grep lilerp
   ```

3. Check `.env` file credentials
4. Check backend logs for specific error messages

### Issue: Calls immediately disconnect

**Possible Causes**:

- TwiML response is invalid
- Backend returning error
- Timeout in webhook response

**Solutions**:

1. Check backend logs for errors
2. Test webhook URL directly:

   ```bash
   curl -X POST https://your-domain.com/api/ivr/incoming-call \
     -d "CallSid=CAtest123" \
     -d "From=+1234567890"
   ```

3. Verify TwiML response is valid XML
4. Check Twilio debugger for specific error

---

## Advanced Configuration

### Custom Voice and Language

You can customize the voice and language in the IVR:

```javascript
twiml.say({
  voice: 'alice',  // Options: alice, man, woman
  language: 'en-US'  // Options: en-US, en-GB, etc.
}, 'Your message here');
```

### Adding More Menu Options

To add more menu options, edit `server.js`:

```javascript
case '5':
  incidentType = 'your_new_type';
  message = 'You have selected your new option.';
  break;
```

### Configuring SMS Notifications

Add SMS notifications when incidents are created:

```javascript
if (twilioClient) {
  await twilioClient.messages.create({
    body: 'Your emergency report has been received. Reference: ' + incident.id,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: caller.phone
  });
}
```

### Setting Up Call Recording Storage

Configure where recordings are stored:

1. **Twilio Storage** (default):
   - Recordings stored on Twilio servers
   - Accessible via URL
   - Limited retention (based on plan)

2. **Custom Storage**:
   - Download recordings to your server
   - Store in AWS S3 or similar
   - Implement in `/api/ivr/handle-recording`

---

## Production Checklist

Before deploying to production:

- [ ] Use a production Twilio account (not trial)
- [ ] Purchase a local Liberian phone number (if available)
- [ ] Deploy backend to a reliable hosting service
- [ ] Set up HTTPS with valid SSL certificate
- [ ] Configure environment variables securely
- [ ] Set up database backups
- [ ] Implement logging and monitoring
- [ ] Test all IVR flows thoroughly
- [ ] Set up SMS notifications
- [ ] Configure email alerts for responders
- [ ] Test with multiple concurrent calls
- [ ] Set up call recording retention policy
- [ ] Implement data privacy measures
- [ ] Train responders on the system
- [ ] Create user documentation
- [ ] Set up support contact information

---

## Support and Resources

### Twilio Resources

- **Twilio Console**: [https://console.twilio.com/](https://console.twilio.com/)
- **Twilio Docs**: [https://www.twilio.com/docs/voice](https://www.twilio.com/docs/voice)
- **TwiML Reference**: [https://www.twilio.com/docs/voice/twiml](https://www.twilio.com/docs/voice/twiml)
- **Twilio Support**: [https://support.twilio.com/](https://support.twilio.com/)

### LILERP Resources

- **Backend API Docs**: See `API_DOCUMENTATION.md`
- **System Architecture**: See `SUPERVISOR_FEEDBACK_IMPLEMENTATION.md`
- **Database Schema**: See `backend/models/`

### Getting Help

If you encounter issues not covered in this guide:

1. Check Twilio Console → Monitor → Logs
2. Check backend server logs
3. Review database for error patterns
4. Test webhooks with Postman or curl
5. Contact Twilio support for platform issues

---

## Summary

You now have a complete IVR system that:

✅ Welcomes callers with a professional greeting
✅ Provides a menu of emergency types
✅ Records detailed voice messages
✅ Transcribes messages automatically
✅ Creates incidents in the database
✅ Assigns responders automatically
✅ Provides confirmation to callers
✅ Stores all call data for analysis

The system is ready for testing and deployment!

---

**Document Version**: 1.0
**Last Updated**: October 21, 2025
**Author**: LILERP Development Team
