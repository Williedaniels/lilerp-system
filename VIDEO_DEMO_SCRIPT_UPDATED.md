# LILERP Video Demo Script (Updated)

## 🎬 Demo Overview

**Duration:** 7-8 minutes  
**Focus:** Functionality demonstration with minimal introduction  
**Target:** Technical evaluation of full-stack implementation  
**Note:** No admin dashboard - website is project-focused

---

## 📝 Detailed Script

### Opening (30 seconds)

**[Screen: System Architecture Diagram]**

"This is LILERP - a voice-based emergency response system for rural Liberia. The system addresses land disputes through three integrated components: a Node.js backend with PostgreSQL database, a React project website, and a mobile Progressive Web App, all connected through Twilio's IVR system for voice-based emergency reporting."

**[Transition to live demo]**

---

### Backend API Demonstration (2 minutes)

**[Screen: Terminal/Postman]**

"Let me start by demonstrating the backend API functionality."

**[Show server startup]**

```bash
cd backend && npm start
```

"The server starts on port 3001 with PostgreSQL database connection."

**[Switch to Postman]**

"First, I'll register a new user through our authentication system."

**[POST /api/auth/register]**

```json
{
  "username": "demo_responder",
  "password": "password123",
  "role": "responder"
}
```

"The system returns a JWT token for authenticated requests."

**[Show login endpoint]**

```json
{
  "username": "demo_responder",
  "password": "password123"
}
```

"Now I'll create an incident report using the authenticated token."

**[POST /api/incidents with Bearer token]**

```json
{
  "caller_number": "+231123456789",
  "location": "Ganta Village, Nimba County",
  "incident_type": "Land Boundary Dispute",
  "description": "Neighbor dispute over ancestral land boundaries"
}
```

"The incident is created with a unique ID and stored in PostgreSQL with proper relationships."

**[GET /api/incidents to show retrieval]**

"I can retrieve all incidents with full details including reporter information and timestamps."

---

### Database Schema Demonstration (45 seconds)

**[Screen: Database client or terminal with psql]**

"The database schema includes three main tables with proper relationships."

**[Show Users table]**

```sql
SELECT * FROM users LIMIT 3;
```

"Users table stores authentication and role information."

**[Show Incidents table]**

```sql
SELECT * FROM incidents LIMIT 3;
```

"Incidents table contains emergency reports with foreign key to the reporter."

**[Show Responses table]**

```sql
SELECT * FROM responses LIMIT 3;
```

"Responses table tracks responder actions linked to specific incidents."

**[Show a JOIN query]**

```sql
SELECT i.*, u.username FROM incidents i JOIN users u ON i.reporter_id = u.id;
```

"The relationships allow complex queries joining incident data with user information."

---

### Project Website Demonstration (1.5 minutes)

**[Screen: Browser at localhost:5173]**

"The React-based website serves as a project showcase and information portal."

**[Navigate through homepage]**

"The landing page explains LILERP's purpose - addressing emergency response gaps for land disputes in rural Liberia. This is designed as a project presentation and partnership outreach tool."

**[Scroll through features section]**

"The features section highlights our key innovations: voice-first design for illiterate users, multi-platform accessibility, and integration with traditional governance structures."

**[Show statistics section]**

"This section presents the research context - showing the scale of land disputes in Nimba County and why emergency response is needed."

**[Demonstrate contact form]**

"The contact form allows NGOs, government agencies, and potential partners to inquire about implementation or collaboration."

**[Show mobile responsiveness]**

"The entire site is fully responsive, working seamlessly across desktop, tablet, and mobile devices."

---

### Mobile App Demonstration (1.5 minutes)

**[Screen: Browser at localhost:5174]**

"The mobile Progressive Web App provides emergency reporting capabilities for smartphone users."

**[Show emergency reporting form]**

"Users can report land dispute emergencies through this intuitive form interface."

**[Demonstrate form fields]**

"The form captures essential information: location, incident type, and detailed description with clear validation and user feedback."

**[Show voice recording simulation]**

"In production, this integrates with device microphone for voice recordings - crucial for illiterate users who can't type descriptions."

**[Show GPS location feature]**

"GPS integration automatically captures precise coordinates, essential for rural areas where addresses may not exist."

**[Navigate to report tracking]**

"Users can track their submitted reports and receive status updates from responders and traditional chiefs."

**[Show direct calling interface]**

"Emergency calling features provide immediate access to local chiefs and emergency services when situations escalate."

---

### IVR System Integration (1.5 minutes)

**[Screen: Code editor showing IVR routes]**

"The core innovation is our IVR system - making emergency reporting accessible to illiterate users through voice calls."

**[Show /api/ivr/incoming-call endpoint]**

"When someone calls the emergency number, this endpoint generates TwiML responses with culturally appropriate voice prompts."

**[Show voice menu structure in code]**

"The system uses a simple 3-level menu structure: Welcome message, incident type selection, and voice recording for details."

**[Show recording handlers]**

"Each step captures voice recordings for location, incident type, and description - then processes them into structured incident reports."

**[Show database integration]**

"Voice calls create the same incident records as web and mobile reports, ensuring all channels feed into the same response system."

**[Simulate call flow with Postman]**

```bash
curl -X POST http://localhost:3001/api/ivr/incoming-call \
  -d "From=+231123456789&To=+231987654321"
```

"This simulates an incoming call and returns the TwiML response that Twilio uses to guide the caller through the voice menu."

---

### System Integration Demonstration (45 seconds)

**[Screen: Split view showing multiple components]**

"All components work together seamlessly. Whether someone reports through voice call, website form, or mobile app, everything feeds into the same PostgreSQL database."

**[Show data consistency]**

"An incident created through the API immediately appears accessible through all interfaces, ensuring responders get complete information regardless of how it was reported."

**[Demonstrate authentication flow]**

"The JWT authentication system provides secure access for responders and administrators across all platforms."

**[Show error handling]**

"The system includes comprehensive error handling, input validation, and graceful degradation for poor connectivity scenarios common in rural areas."

---

### Technical Highlights (30 seconds)

**[Screen: Code overview/file structure]**

"Key technical achievements demonstrated:"

- "RESTful API design with proper HTTP status codes and error handling"
- "JWT-based authentication with role-based access control"
- "PostgreSQL database with normalized schema and foreign key relationships"
- "Responsive React frontend with TailwindCSS for mobile-first design"
- "Progressive Web App with offline capabilities for poor connectivity"
- "Twilio integration enabling voice-based emergency reporting for illiterate users"

---

### Closing (15 seconds)

**[Screen: Voice interface designs/system architecture]**

"LILERP demonstrates a complete full-stack solution addressing real-world challenges in rural emergency response. By prioritizing voice-based accessibility and cultural integration, the system bridges traditional governance with modern technology, providing emergency services for historically underserved communities."

---

## 🎥 Recording Guidelines

### What to Actually Show

**Backend Demo:**

- Terminal with server startup
- Postman collection with all API endpoints
- Database queries showing relationships
- Authentication flow with JWT tokens

**Website Demo:**

- Project overview and research context
- Features and innovation highlights
- Statistics showing problem scope
- Contact form for partnerships
- Mobile responsiveness

**Mobile App Demo:**

- Emergency reporting form
- Voice recording interface (simulated)
- GPS location picker
- Report tracking dashboard
- Direct calling features

**IVR System Demo:**

- Code walkthrough of voice endpoints
- TwiML response generation
- Simulated call flow with curl/Postman
- Database integration from voice calls

### Technical Setup

- **Screen Resolution:** 1920x1080 minimum
- **Frame Rate:** 30fps
- **Audio Quality:** Clear narration with noise cancellation
- **Recording Software:** OBS Studio or similar

### Key Points to Emphasize

1. **Voice-first design** for accessibility
2. **Full-stack integration** across all components
3. **Real-world problem solving** for rural communities
4. **Technical sophistication** with proper architecture
5. **Cultural sensitivity** in design choices

### Demo Data Preparation

- [ ] Clean database with realistic sample data
- [ ] Postman collection with all endpoints tested
- [ ] Test user accounts for different roles
- [ ] Ensure all services start without errors
- [ ] Prepare backup screenshots for technical issues

This updated script accurately reflects your actual system - a project-focused website rather than an admin dashboard, which is exactly appropriate for a capstone demonstration.
