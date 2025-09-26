
const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const { Incident, User } = require("../models");
const router = express.Router();

// Get all incidents
router.get("/", auth, async (req, res) => {
  try {
    const incidents = await Incident.findAll({ include: [{ model: User, as: 'reporter' }] });
    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

// Create new incident
router.post("/", [
  auth,
  body("caller_number").notEmpty().withMessage("Caller number is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("incident_type").notEmpty().withMessage("Incident type is required")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { caller_number, location, incident_type, description } = req.body;

    const incident = await Incident.create({
      caller_number,
      location,
      incident_type,
      description,
      reporter_id: req.user.id
    });

    res.status(201).json(incident);

  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ error: "Failed to create incident" });
  }
});

// Get incident by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id, { include: [{ model: User, as: 'reporter' }] });
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json(incident);
  } catch (error) {
    console.error("Error fetching incident:", error);
    res.status(500).json({ error: "Failed to fetch incident" });
  }
});

// Update incident
router.put("/:id", auth, async (req, res) => {
  try {
    let incident = await Incident.findByPk(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    // For now, only allow updating the status
    const { status } = req.body;
    if (status) {
      incident.status = status;
      await incident.save();
    }

    res.json(incident);

  } catch (error) {
    console.error("Error updating incident:", error);
    res.status(500).json({ error: "Failed to update incident" });
  }
});

// Delete incident
router.delete("/:id", auth, async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    await incident.destroy();

    res.json({ msg: "Incident removed" });

  } catch (error) {
    console.error("Error deleting incident:", error);
    res.status(500).json({ error: "Failed to delete incident" });
  }
});

module.exports = router;

