require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const toPhone = '+250792401374'; // Your phone number

client.calls
  .create({
    url: 'http://demo.twilio.com/docs/voice.xml', // Twilio demo XML for voice
    to: toPhone,
    from: fromPhone,
  })
  .then(call => console.log(`Call initiated with SID: ${call.sid}`))
  .catch(error => console.error('Error making call:', error));