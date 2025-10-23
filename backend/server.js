const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes, Op } = require('sequelize');
const twilio = require('twilio');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Database setup with SQLite
const dbDir = path.join(__dirname, 'database');
const dbPath = path.join(dbDir, 'lilerp.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

// Check if database directory exists
if (!fs.existsSync(dbDir)) {
  console.log('📁 Creating database directory...');
  fs.mkdirSync(dbDir, { recursive: true, mode: 0o777 });
}

// Ensure database directory has write permissions
fs.chmodSync(dbDir, 0o777);

// Create empty database file with proper permissions if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
  fs.chmodSync(dbPath, 0o666);
  console.log('💾 Database file created with write permissions');
} else {
  // Ensure existing database file has write permissions
  fs.chmodSync(dbPath, 0o666);
  console.log('🔓 Database file permissions updated');
}

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    console.log(`📍 Database location: ${dbPath}`);
    
    const stats = fs.statSync(dbPath);
    console.log(`📊 Database size: ${(stats.size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1);
  }
};

testConnection();

// Enhanced Models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'responder', 'admin'),
    defaultValue: 'user'
  },
  isResponder: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  community: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

const Responder = sequelize.define('Responder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'busy', 'offline'),
    defaultValue: 'offline'
  },
  shift: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specialization: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  coordinates: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalResponses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  averageResponseTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // in minutes
  },
  communityRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
});

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporterId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  responderId: {
    type: DataTypes.INTEGER,
    references: {
      model: Responder,
      key: 'id'
    },
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM(
      'Land Boundary Dispute',
      'Property Conflict',
      'Inheritance Dispute',
      'Mining Conflict',
      'Agricultural Land Dispute',
      'Other'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low'
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'pending'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  voiceRecording: {
    type: DataTypes.STRING,
    allowNull: true
  },
  voiceTranscription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  callSid: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reportedVia: {
    type: DataTypes.ENUM('mobile_app', 'ivr_call', 'web', 'manual'),
    defaultValue: 'mobile_app'
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true // in minutes
  }
});

const CallLog = sequelize.define('CallLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  callSid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fromNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  toNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  incidentId: {
    type: DataTypes.INTEGER,
    references: {
      model: Incident,
      key: 'id'
    },
    allowNull: true
  },
  responderId: {
    type: DataTypes.INTEGER,
    references: {
      model: Responder,
      key: 'id'
    },
    allowNull: true
  },
  recordingUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transcription: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Associations
User.hasOne(Responder, { foreignKey: 'userId' });
Responder.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Incident, { foreignKey: 'reporterId' });
Incident.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

Responder.hasMany(Incident, { foreignKey: 'responderId' });
Incident.belongsTo(Responder, { foreignKey: 'responderId', as: 'responder' });

Incident.hasMany(CallLog, { foreignKey: 'incidentId' });
CallLog.belongsTo(Incident, { foreignKey: 'incidentId' });

Responder.hasMany(CallLog, { foreignKey: 'responderId' });
CallLog.belongsTo(Responder, { foreignKey: 'responderId' });

// Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role, isResponder: user.isResponder },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' } // 7 days for better UX
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

// Responder assignment algorithm
const assignResponder = async (incident) => {
  try {
    const availableResponders = await Responder.findAll({
      where: {
        status: 'active'
      },
      include: [{
        model: User,
        attributes: ['name', 'phone', 'email']
      }],
      order: [
        ['totalResponses', 'ASC'],
        ['averageResponseTime', 'ASC'],
        ['communityRating', 'DESC']
      ]
    });

    if (availableResponders.length === 0) {
      return null;
    }

    return availableResponders[0];
  } catch (error) {
    console.error('Error assigning responder:', error);
    return null;
  }
};

// Call routing system
const routeEmergencyCall = async (callSid, fromNumber) => {
  try {
    let caller = await User.findOne({ where: { phone: fromNumber } });
    if (!caller) {
      caller = await User.create({
        name: `Caller ${fromNumber}`,
        email: `${fromNumber.replace(/[^0-9]/g, '')}@temp.lilerp.org`,
        phone: fromNumber,
        password: await bcrypt.hash('temp123', 10),
        role: 'user'
      });
    }

    const callLog = await CallLog.create({
      callSid,
      fromNumber,
      toNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      status: 'in-progress'
    });

    const responder = await assignResponder();
    
    if (responder) {
      await callLog.update({ responderId: responder.id });
      await responder.update({ status: 'busy' });
      
      return {
        success: true,
        responder,
        callLog,
        caller
      };
    } else {
      return {
        success: false,
        message: 'No available responders',
        callLog,
        caller
      };
    }
  } catch (error) {
    console.error('Error routing call:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Enhanced Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'user', community, isResponder = false } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: isResponder ? 'responder' : role,
      isResponder,
      community
    });

    // If user wants to be a responder, create responder profile
    if (isResponder) {
      await Responder.create({
        userId: user.id,
        badge: `RESP-${String(user.id).padStart(4, '0')}`,
        department: 'Land Dispute Response Unit',
        location: community || 'Nimba County',
        status: 'offline'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refreshToken });

    res.status(201).json({
      message: 'User created successfully',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isResponder: user.isResponder,
        community: user.community
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await user.update({ lastLogin: new Date() });

    // If user is a responder, update status to active
    if (user.isResponder || user.role === 'responder') {
      let responder = await Responder.findOne({ where: { userId: user.id } });
      if (responder) {
        await responder.update({ status: 'active' });
      } else {
        // If responder profile is missing, create it. This makes the system more robust.
        console.warn(`Responder profile missing for user ID ${user.id} (${user.email}). Creating one now.`);
        responder = await Responder.create({
          userId: user.id,
          badge: `RESP-${String(user.id).padStart(4, '0')}`,
          department: 'Land Dispute Response Unit',
          location: user.community || 'Nimba County',
          status: 'active' // Set to active on login
        });
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await user.update({ refreshToken });

    res.json({
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isResponder: user.isResponder,
        community: user.community
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Refresh token endpoint
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const user = await User.findByPk(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      await user.update({ refreshToken: newRefreshToken });

      res.json({
        token: accessToken,
        refreshToken: newRefreshToken
      });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (user) {
      await user.update({ refreshToken: null });
      
      // If responder, set status to offline
      if (user.isResponder || user.role === 'responder') {
        const responder = await Responder.findOne({ where: { userId: user.id } });
        if (responder) {
          await responder.update({ status: 'offline' });
        }
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Upgrade to responder endpoint
app.post('/api/user/become-responder', authenticateToken, async (req, res) => {
  try {
    const { department, location, specialization } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isResponder) {
      return res.status(400).json({ error: 'User is already a responder' });
    }

    // Check if responder profile already exists
    let responder = await Responder.findOne({ where: { userId: user.id } });
    
    if (!responder) {
      responder = await Responder.create({
        userId: user.id,
        badge: `RESP-${String(user.id).padStart(4, '0')}`,
        department: department || 'Land Dispute Response Unit',
        location: location || user.community || 'Nimba County',
        status: 'offline',
        specialization: specialization || []
      });
    }

    await user.update({ 
      isResponder: true,
      role: 'responder'
    });

    res.json({
      message: 'Successfully upgraded to responder',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isResponder: user.isResponder
      },
      responder: {
        id: responder.id,
        badge: responder.badge,
        department: responder.department,
        location: responder.location
      }
    });
  } catch (error) {
    console.error('Become responder error:', error);
    res.status(500).json({ error: 'Failed to upgrade to responder', details: error.message });
  }
});

// User profile routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password', 'refreshToken'] },
      include: [{
        model: Responder,
        required: false
      }]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, community } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ name, phone, community });
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isResponder: user.isResponder,
        community: user.community
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/incidents', authenticateToken, upload.any(), async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('Files:', req.files);
    
    const { type, priority, title, description, location, voiceTranscription } = req.body;
    
    // Parse location JSON string
    let locationData = {};
    try {
      locationData = JSON.parse(location || '{}');
    } catch (e) {
      console.error('Location parse error:', e);
    }
    
    // Validate required fields
    if (!type || !description) {
      return res.status(400).json({ error: 'Missing required fields: type and description' });
    }
    
    // Handle voice recording file
    const voiceRecordingPath = req.files?.find(f => f.fieldname === 'voiceRecording')?.path || null;
    
    const incident = await Incident.create({
      type: type,
      title: title || type,
      description: voiceTranscription || description,
      priority: priority || 'medium',
      location: locationData.address || 'Unknown',
      latitude: locationData.coordinates?.latitude || null,
      longitude: locationData.coordinates?.longitude || null,
      voiceRecordingPath,
      userId: req.user.userId,
      status: 'pending'
    });
    
    res.status(201).json({ 
      message: 'Incident reported successfully',
      incident 
    });
    
  } catch (error) {
    console.error('Incident creation error:', error);
    res.status(500).json({ error: 'Failed to create incident', details: error.message });
  }
});

app.get('/api/incidents', authenticateToken, async (req, res) => {
  try {
    const { status, type, priority } = req.query;
    const where = {};
    
    if (req.user.role === 'user' && !req.user.isResponder) {
      where.reporterId = req.user.userId;
    }
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const incidents = await Incident.findAll({
      where,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['name', 'phone', 'community']
        },
        {
          model: Responder,
          as: 'responder',
          include: [{
            model: User,
            attributes: ['name', 'phone']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(incidents);
  } catch (error) {
    console.error('Incidents fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

app.get('/api/incidents/:id', authenticateToken, async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['name', 'phone', 'community', 'email']
        },
        {
          model: Responder,
          as: 'responder',
          include: [{
            model: User,
            attributes: ['name', 'phone', 'email']
          }]
        }
      ]
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    console.error('Incident fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

app.put('/api/incidents/:id', authenticateToken, async (req, res) => {
  try {
    const { status, resolution, priority } = req.body;
    
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (resolution) updateData.resolution = resolution;
    if (priority) updateData.priority = priority;
    
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
      const responseTime = Math.floor((new Date() - incident.createdAt) / 60000);
      updateData.responseTime = responseTime;
    }

    await incident.update(updateData);

    res.json({
      message: 'Incident updated successfully',
      incident
    });
  } catch (error) {
    console.error('Incident update error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Assign incident to responder
app.put('/api/incidents/:id/assign', authenticateToken, async (req, res) => {
  try {
    // Check if user is a responder or admin
    if (!req.user.isResponder && req.user.role !== 'responder' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only responders can assign incidents.' });
    }

    const incident = await Incident.findByPk(req.params.id);
    if (!incident) {
      console.error(`Assign Error: Incident with ID ${req.params.id} not found.`);
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Find the responder profile for the logged-in user
    const responder = await Responder.findOne({ where: { userId: req.user.userId } });
    if (!responder) {
      console.error(`Assign Error: Responder profile not found for user ID ${req.user.userId} (${req.user.email}).`);
      return res.status(404).json({ error: 'Responder profile not found for this user.' });
    }

    // Assign the incident to the responder and update status
    await incident.update({
      responderId: responder.id,
      status: 'assigned'
    });

    res.json({
      message: 'Incident assigned successfully',
      incident
    });
  } catch (error) {
    console.error('Incident assignment error:', error);
    res.status(500).json({ error: 'Failed to assign incident', details: error.message });
  }
});

// Responder dashboard routes
app.get('/api/responders/dashboard', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isResponder && req.user.role !== 'responder') {
      return res.status(403).json({ error: 'Unauthorized - Responder access only' });
    }

    const responder = await Responder.findOne({ 
      where: { userId: req.user.userId },
      include: [{
        model: User,
        attributes: ['name', 'phone', 'email']
      }]
    });

    if (!responder) {
      return res.status(404).json({ error: 'Responder profile not found' });
    }

    // Get dashboard stats
    const activeIncidents = await Incident.count({
      where: {
        responderId: responder.id,
        status: {
          [Op.in]: ['assigned', 'in_progress']
        }
      }
    });

    const resolvedToday = await Incident.count({
      where: {
        responderId: responder.id,
        status: 'resolved',
        resolvedAt: {
          [Op.gte]: new Date().setHours(0, 0, 0, 0)
        }
      }
    });

    const totalIncidents = await Incident.count({
      where: {
        responderId: responder.id
      }
    });

    const recentIncidents = await Incident.findAll({
      where: {
        status: {
          [Op.in]: ['pending', 'assigned', 'in_progress']
        }
      },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['name', 'phone', 'community']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      responder: {
        ...responder.toJSON(),
        activeIncidents,
        resolvedToday,
        totalIncidents
      },
      recentIncidents
    });
  } catch (error) {
    console.error('Responder dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
  }
});

app.put('/api/responders/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'busy', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const responder = await Responder.findOne({ where: { userId: req.user.userId } });
    if (!responder) {
      return res.status(404).json({ error: 'Responder profile not found' });
    }

    await responder.update({ status });

    res.json({
      message: 'Status updated successfully',
      status: responder.status
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// IVR routes with comprehensive menu system
app.post('/api/ivr/incoming-call', async (req, res) => {
  try {
    const { CallSid, From } = req.body;
    
    console.log(`Incoming call: ${CallSid} from ${From}`);
    
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Welcome message
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Welcome to LILERP, the Liberia Integrated Land Registry and Emergency Response Platform.');
    
    // Main menu
    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/ivr/handle-menu',
      method: 'POST',
      timeout: 10
    });
    
    gather.say({
      voice: 'alice',
      language: 'en-US'
    }, 'For land dispute emergencies, press 1. For mining conflicts, press 2. For inheritance disputes, press 3. For other land issues, press 4. To speak with an operator, press 0.');
    
    // If no input, repeat
    twiml.redirect('/api/ivr/incoming-call');
    
    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('IVR incoming call error:', error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('We are experiencing technical difficulties. Please try again later.');
    
    res.type('text/xml').send(twiml.toString());
  }
});

app.post('/api/ivr/handle-menu', async (req, res) => {
  try {
    const { Digits, CallSid, From } = req.body;
    
    const twiml = new twilio.twiml.VoiceResponse();
    
    let incidentType = 'other';
    let message = '';
    
    switch (Digits) {
      case '1':
        incidentType = 'boundary_dispute';
        message = 'You have selected land dispute emergencies.';
        break;
      case '2':
        incidentType = 'mining_conflict';
        message = 'You have selected mining conflicts.';
        break;
      case '3':
        incidentType = 'inheritance_dispute';
        message = 'You have selected inheritance disputes.';
        break;
      case '4':
        incidentType = 'other';
        message = 'You have selected other land issues.';
        break;
      case '0':
        // Connect to operator
        twiml.say('Connecting you to an operator. Please wait.');
        const routingResult = await routeEmergencyCall(CallSid, From);
        
        if (routingResult.success && routingResult.responder) {
          const dial = twiml.dial({
            callerId: From,
            timeout: 30
          });
          dial.number(routingResult.responder.User.phone);
        } else {
          twiml.say('All operators are currently busy. Please leave a message after the tone.');
          twiml.record({
            maxLength: 120,
            action: `/api/ivr/handle-recording?callSid=${CallSid}&type=operator`,
            method: 'POST'
          });
        }
        
        res.type('text/xml').send(twiml.toString());
        return;
      default:
        twiml.say('Invalid selection. Please try again.');
        twiml.redirect('/api/ivr/incoming-call');
        res.type('text/xml').send(twiml.toString());
        return;
    }
    
    // Store incident type in call log
    await CallLog.create({
      callSid: CallSid,
      fromNumber: From,
      toNumber: process.env.TWILIO_PHONE_NUMBER,
      status: 'in-progress'
    });
    
    twiml.say(message);
    twiml.say('Please describe your emergency in detail after the tone. You will have up to 2 minutes to record your message.');
    
    twiml.record({
      maxLength: 120,
      action: `/api/ivr/handle-recording?callSid=${CallSid}&type=${incidentType}`,
      method: 'POST',
      transcribe: true,
      transcribeCallback: `/api/ivr/handle-transcription?callSid=${CallSid}`
    });
    
    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('IVR menu handling error:', error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('An error occurred. Please try again later.');
    
    res.type('text/xml').send(twiml.toString());
  }
});

app.post('/api/ivr/handle-recording', async (req, res) => {
  try {
    const { RecordingUrl, CallSid } = req.body;
    const type = req.query.type;

    console.log(`Recording received: ${RecordingUrl} for call ${CallSid}`);
    
    const callLog = await CallLog.findOne({ where: { callSid: CallSid } });
    if (callLog) {
      await callLog.update({ recordingUrl: RecordingUrl });
    }
    
    // Create incident from IVR call
    const callerPhone = req.body.From;
    const caller = await User.findOne({ where: { phone: callerPhone } });
    
    // Create incident even if caller not found in system
    await Incident.create({
      reporterId: caller ? caller.id : null,
      type: type || 'other',
      title: `IVR Report - ${type || 'other'}`,
      description: `Emergency reported via IVR system from ${callerPhone}. Voice recording available.`,
      location: { address: 'Location to be determined', coordinates: null },
      priority: 'high',
      voiceRecording: RecordingUrl,
      callSid: CallSid,
      reportedVia: 'ivr_call'
    });
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for your report. Your emergency has been recorded and a responder will be assigned shortly. You will receive an SMS confirmation. Goodbye.');
    
    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('Recording handling error:', error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for calling. Goodbye.');
    
    res.type('text/xml').send(twiml.toString());
  }
});

app.post('/api/ivr/handle-transcription', async (req, res) => {
  try {
    const { TranscriptionText, CallSid } = req.body;
    
    console.log(`Transcription received for call ${CallSid}: ${TranscriptionText}`);
    
    // Update call log with transcription
    const callLog = await CallLog.findOne({ where: { callSid: CallSid } });
    if (callLog) {
      await callLog.update({ transcription: TranscriptionText });
    }
    
    // Update incident with transcription
    const incident = await Incident.findOne({ where: { callSid: CallSid } });
    if (incident) {
      await incident.update({ voiceTranscription: TranscriptionText });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Transcription handling error:', error);
    res.status(500).send('Error');
  }
});

// Update the initiate-call endpoint (around line 1252)

app.post('/api/ivr/initiate-call', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    console.log('📞 Received call request for:', phoneNumber);
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Clean phone number but preserve the + if it exists
    let formattedPhone = phoneNumber.trim();
    
    // If it already starts with +, use it as-is
    if (formattedPhone.startsWith('+')) {
      console.log('✅ Phone already formatted with country code:', formattedPhone);
    } 
    // If it starts with a digit, add + to the beginning
    else {
      const cleanPhone = formattedPhone.replace(/\D/g, '');
      
      // Check if it's a US number (10 digits) or international
      if (cleanPhone.length === 10) {
        formattedPhone = `+1${cleanPhone}`;  // US number
      } else if (cleanPhone.length > 10) {
        formattedPhone = `+${cleanPhone}`;    // International with country code
      } else {
        return res.status(400).json({ 
          error: 'Invalid phone number format. Must include country code or be 10 digits.',
          received: phoneNumber
        });
      }
    }

    console.log('📱 Formatted phone for Twilio:', formattedPhone);

    // Make call using Twilio
    const call = await twilioClient.calls.create({
      url: `${process.env.BASE_URL || 'https://lilerp-backend.onrender.com'}/api/ivr/voice`,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BASE_URL || 'https://lilerp-backend.onrender.com'}/api/ivr/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    console.log(`✅ Call initiated to ${formattedPhone}, SID: ${call.sid}`);

    res.json({
      success: true,
      message: 'Call initiated successfully',
      callSid: call.sid,
      to: formattedPhone
    });

  } catch (error) {
    console.error('❌ Call initiation error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate call',
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LILERP Emergency Response System API - Fixed & Enhanced',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    twilio: twilioClient ? 'Configured' : 'Not configured',
    version: '2.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');
    
    // Create default responder if none exists
    const responderCount = await Responder.count();
    if (responderCount === 0) {
      const adminUser = await User.create({
        name: 'Emergency Response Admin',
        email: 'admin@lilerp.org',
        phone: '+231-777-888-999',
        password: await bcrypt.hash('admin123', 10),
        role: 'responder',
        isResponder: true,
        community: 'Nimba County HQ'
      });
      
      await Responder.create({
        userId: adminUser.id,
        badge: 'RESP-0001',
        department: 'Land Dispute Response Unit',
        location: 'Nimba County HQ',
        status: 'active',
        shift: 'Day Shift (8AM - 8PM)',
        specialization: JSON.stringify(['boundary_dispute', 'mining_conflict', 'inheritance_dispute'])
      });
      
      console.log('✅ Default responder created successfully.');
      console.log('📧 Admin Email: admin@lilerp.org');
      console.log('🔑 Admin Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    console.log('⚠️  Continuing without database connection...');
  }
};

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 LILERP API Server (Fixed & Enhanced) running on port ${PORT}`);
    console.log(`📱 Emergency Response System for Rural Liberia`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Features: Authentication, Responder Dashboard, IVR System`);
    console.log(`📞 Twilio: ${twilioClient ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`🔐 JWT Tokens: 7-day access, 30-day refresh`);
    console.log(`${'='.repeat(60)}\n`);
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, sequelize };
