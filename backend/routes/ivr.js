const express = require("express");
const twilio = require("twilio");
const { User, Incident } = require("../models");
const router = express.Router();

// Twilio webhook for incoming calls
router.post("/incoming-call", async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const callerNumber = req.body.From;

  try {
    // Welcome message and language selection
    twiml.say(
      {
        voice: "alice",
        language: "en",
      },
      "Welcome to LILERP Emergency Response System for Nimba County."
    );

    twiml.pause({ length: 1 });

    twiml.say("Press 1 to report a land dispute");
    twiml.say("Press 2 to exit");

    twiml.gather({
      numDigits: 1,
      timeout: 10,
      action: "/api/ivr/main-menu",
    });

    twiml.say("I did not receive your selection. Please try again.");
    twiml.redirect("/api/ivr/incoming-call");
  } catch (error) {
    console.error("Error in incoming call:", error);
    twiml.say("Sorry, there was an error. Please try calling again.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Main menu handler
router.post("/main-menu", async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const digit = req.body.Digits;

  try {
    switch (digit) {
      case "1":
        // Report land dispute
        twiml.redirect("/api/ivr/report-dispute");
        break;
      case "2":
        // Exit
        twiml.say("Thank you for using LILERP Emergency Response. Stay safe.");
        twiml.hangup();
        break;
      default:
        twiml.say("Invalid selection. Please try again.");
        twiml.redirect("/api/ivr/incoming-call");
        break;
    }
  } catch (error) {
    console.error("Error in main menu:", error);
    twiml.say("Sorry, there was an error. Please try calling again.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Report dispute handler
router.post("/report-dispute", async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say("Please state your location after the beep, then press the star key.");

  twiml.record({
    timeout: 10,
    finishOnKey: "*",
    action: "/api/ivr/location-recorded",
    maxLength: 30,
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// Location recorded handler
router.post("/location-recorded", async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const recordingUrl = req.body.RecordingUrl;

  twiml.say("Please state the type of incident after the beep, then press the star key.");

  twiml.record({
    timeout: 10,
    finishOnKey: "*",
    action: `/api/ivr/incident-type-recorded?locationRecording=${recordingUrl}`,
    maxLength: 30,
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// Incident type recorded handler
router.post("/incident-type-recorded", async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const locationRecordingUrl = req.query.locationRecording;
  const incidentTypeRecordingUrl = req.body.RecordingUrl;

  twiml.say("Please describe the incident after the beep, then press the star key.");

  twiml.record({
    timeout: 10,
    finishOnKey: "*",
    action: `/api/ivr/description-recorded?locationRecording=${locationRecordingUrl}&incidentTypeRecording=${incidentTypeRecordingUrl}`,
    maxLength: 120,
  });

  res.type("text/xml");
  res.send(twiml.toString());
});

// Description recorded handler
router.post("/description-recorded", async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const callerNumber = req.body.From;
  const locationRecordingUrl = req.query.locationRecording;
  const incidentTypeRecordingUrl = req.query.incidentTypeRecording;
  const descriptionRecordingUrl = req.body.RecordingUrl;

  try {
    // In a real application, you would use a speech-to-text service to transcribe the recordings.
    // For this demo, we will just store the recording URLs.
    const location = `Recording: ${locationRecordingUrl}`;
    const incident_type = `Recording: ${incidentTypeRecordingUrl}`;
    const description = `Recording: ${descriptionRecordingUrl}`;

    const incident = await Incident.create({
      caller_number: callerNumber,
      location: location,
      incident_type: incident_type,
      description: description,
    });

    twiml.say("Your report has been submitted. Thank you for using LILERP Emergency Response. Stay safe.");
    twiml.hangup();
  } catch (error) {
    console.error("Error creating incident:", error);
    twiml.say("Sorry, there was an error processing your report. Please try calling again.");
    twiml.hangup();
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

module.exports = router;

