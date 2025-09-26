const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Incident, Response } = require('../models');
const router = express.Router();

// Get all responders
router.get('/', async (req, res) => {
  try {
    const { county = 'Nimba', user_type, is_active = true } = req.query;
    
    const where = { county, is_active };
    if (user_type) {
      where.user_type = user_type;
    } else {
      where.user_type = ['traditional_chief', 'responder'];
    }
    
    const responders = await User.findAll({
      where,
      attributes: [
        'id', 'phone_number', 'village_name', 'district', 
        'county', 'user_type', 'is_active', 'last_call_at', 'createdAt'
      ],
      include: [{
        model: Response,
        as: 'responses',
        attributes: ['id', 'status', 'response_type', 'createdAt'],
        limit: 5,
        order: [['createdAt', 'DESC']]
      }],
      order: [['user_type', 'ASC'], ['village_name', 'ASC']]
    });
    
    res.json(responders);
    
  } catch (error) {
    console.error('Error fetching responders:', error);
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

// Register new responder
router.post('/register', [
  body('phone_number').isMobilePhone().withMessage('Valid phone number required'),
  body('user_type').isIn(['traditional_chief', 'responder']).withMessage('Valid user type required'),
  body('village_name').notEmpty().withMessage('Village name required'),
  body('district').optional().isLength({ min: 1 }).withMessage('District cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      phone_number,
      user_type,
      village_name,
      district,
      county = 'Nimba'
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { phone_number } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }
    
    // Create responder
    const responder = await User.create({
      phone_number,
      user_type,
      village_name,
      district,
      county,
      is_active: true
    });
    
    res.status(201).json({
      message: 'Responder registered successfully',
      responder: {
        id: responder.id,
        phone_number: responder.phone_number,
        user_type: responder.user_type,
        village_name: responder.village_name,
        district: responder.district,
        county: responder.county
      }
    });
    
  } catch (error) {
    console.error('Error registering responder:', error);
    res.status(500).json({ error: 'Failed to register responder' });
  }
});

// Get responder by phone number
router.get('/phone/:phone_number', async (req, res) => {
  try {
    const { phone_number } = req.params;
    
    const responder = await User.findOne({
      where: { 
        phone_number,
        user_type: ['traditional_chief', 'responder']
      },
      include: [{
        model: Response,
        as: 'responses',
        include: [{
          model: Incident,
          as: 'incident',
          attributes: ['id', 'incident_type', 'urgency_level', 'status', 'village_name', 'createdAt']
        }],
        order: [['createdAt', 'DESC']],
        limit: 10
      }]
    });
    
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }
    
    res.json(responder);
    
  } catch (error) {
    console.error('Error fetching responder:', error);
    res.status(500).json({ error: 'Failed to fetch responder' });
  }
});

// Update responder status
router.patch('/:id/status', [
  body('is_active').isBoolean().withMessage('Active status must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { is_active } = req.body;
    
    const responder = await User.findOne({
      where: { 
        id: req.params.id,
        user_type: ['traditional_chief', 'responder']
      }
    });
    
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }
    
    await responder.update({ is_active });
    
    res.json({
      message: 'Responder status updated successfully',
      responder: {
        id: responder.id,
        phone_number: responder.phone_number,
        user_type: responder.user_type,
        is_active: responder.is_active
      }
    });
    
  } catch (error) {
    console.error('Error updating responder status:', error);
    res.status(500).json({ error: 'Failed to update responder status' });
  }
});

// Get responder performance statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const responder = await User.findOne({
      where: { 
        id: req.params.id,
        user_type: ['traditional_chief', 'responder']
      }
    });
    
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }
    
    // Total responses
    const totalResponses = await Response.count({
      where: {
        responder_id: responder.id,
        createdAt: { [require('sequelize').Op.gte]: since }
      }
    });
    
    // Completed responses
    const completedResponses = await Response.count({
      where: {
        responder_id: responder.id,
        status: 'completed',
        createdAt: { [require('sequelize').Op.gte]: since }
      }
    });
    
    // Average response time
    const avgResponseTime = await Response.findOne({
      where: {
        responder_id: responder.id,
        response_time_minutes: { [require('sequelize').Op.not]: null },
        createdAt: { [require('sequelize').Op.gte]: since }
      },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('response_time_minutes')), 'avg_response_time']
      ],
      raw: true
    });
    
    // Response by type
    const responsesByType = await Response.findAll({
      where: {
        responder_id: responder.id,
        createdAt: { [require('sequelize').Op.gte]: since }
      },
      attributes: [
        'response_type',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['response_type'],
      raw: true
    });
    
    // Recent responses
    const recentResponses = await Response.findAll({
      where: {
        responder_id: responder.id,
        createdAt: { [require('sequelize').Op.gte]: since }
      },
      include: [{
        model: Incident,
        as: 'incident',
        attributes: ['id', 'incident_type', 'urgency_level', 'village_name', 'status']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json({
      responder: {
        id: responder.id,
        phone_number: responder.phone_number,
        user_type: responder.user_type,
        village_name: responder.village_name
      },
      period: `Last ${days} days`,
      statistics: {
        total_responses: totalResponses,
        completed_responses: completedResponses,
        completion_rate: totalResponses > 0 ? (completedResponses / totalResponses * 100).toFixed(1) : 0,
        avg_response_time_minutes: avgResponseTime?.avg_response_time || null,
        responses_by_type: responsesByType
      },
      recent_responses: recentResponses
    });
    
  } catch (error) {
    console.error('Error fetching responder statistics:', error);
    res.status(500).json({ error: 'Failed to fetch responder statistics' });
  }
});

// Acknowledge incident response
router.post('/acknowledge', [
  body('incident_id').isUUID().withMessage('Valid incident ID required'),
  body('responder_phone').isMobilePhone().withMessage('Valid responder phone required'),
  body('response_type').optional().isIn([
    'traditional_mediation', 'police_intervention', 'ngo_assistance',
    'community_watch', 'formal_legal', 'other'
  ]).withMessage('Valid response type required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { incident_id, responder_phone, response_type, notes } = req.body;
    
    // Find responder
    const responder = await User.findOne({
      where: { 
        phone_number: responder_phone,
        user_type: ['traditional_chief', 'responder']
      }
    });
    
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }
    
    // Find incident
    const incident = await Incident.findByPk(incident_id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    // Create or update response
    const [response, created] = await Response.findOrCreate({
      where: {
        incident_id,
        responder_id: responder.id
      },
      defaults: {
        response_type: response_type || (responder.user_type === 'traditional_chief' 
          ? 'traditional_mediation' 
          : 'community_watch'),
        status: 'acknowledged',
        notes
      }
    });
    
    if (!created) {
      await response.update({
        status: 'acknowledged',
        notes: notes || response.notes
      });
    }
    
    // Update incident status if not already acknowledged
    if (incident.status === 'reported') {
      await incident.update({ 
        status: 'acknowledged',
        assigned_responder_id: responder.id
      });
    }
    
    res.json({
      message: 'Response acknowledged successfully',
      response: await Response.findByPk(response.id, {
        include: [
          { model: Incident, as: 'incident', attributes: ['id', 'incident_type', 'urgency_level'] },
          { model: User, as: 'responder', attributes: ['phone_number', 'user_type'] }
        ]
      })
    });
    
  } catch (error) {
    console.error('Error acknowledging response:', error);
    res.status(500).json({ error: 'Failed to acknowledge response' });
  }
});

// Update response status
router.patch('/response/:id/status', [
  body('status').isIn([
    'notified', 'acknowledged', 'en_route', 'on_scene', 'completed', 'failed'
  ]).withMessage('Valid status required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { status, notes } = req.body;
    
    const response = await Response.findByPk(req.params.id, {
      include: [
        { model: Incident, as: 'incident' },
        { model: User, as: 'responder', attributes: ['phone_number', 'user_type'] }
      ]
    });
    
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    
    // Update response
    const updateData = { status, notes };
    
    if (status === 'en_route' && !response.arrival_time) {
      updateData.arrival_time = new Date();
    }
    
    if (status === 'completed') {
      updateData.completion_time = new Date();
      // Calculate response time if arrival time exists
      if (response.arrival_time) {
        response.calculateResponseTime();
      }
    }
    
    await response.update(updateData);
    
    // Update incident status based on response status
    if (status === 'completed' && response.incident.status !== 'resolved') {
      await response.incident.update({ status: 'in_progress' });
    }
    
    res.json({
      message: 'Response status updated successfully',
      response: await Response.findByPk(response.id, {
        include: [
          { model: Incident, as: 'incident', attributes: ['id', 'incident_type', 'status'] },
          { model: User, as: 'responder', attributes: ['phone_number', 'user_type'] }
        ]
      })
    });
    
  } catch (error) {
    console.error('Error updating response status:', error);
    res.status(500).json({ error: 'Failed to update response status' });
  }
});

module.exports = router;
