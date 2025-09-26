# LILERP - Liberia Integrated Land Registry & Emergency Response Platform

## Project Overview

LILERP is a voice-based emergency response system designed specifically for land disputes in rural Liberia (Nimba County). The system prioritizes accessibility for illiterate users while providing modern web and mobile interfaces for tech-savvy users.

**Developer:** Willie B. Daniels  
**Institution:** African Leadership University, Rwanda  
**Project Type:** Capstone Research Project  
**Timeline:** September 2025 - November 2025  

## Problem Statement

Rural communities in Liberia face significant challenges in accessing emergency response services for land disputes. Existing systems like My Watchman are expensive ($20-50/month) and urban-focused, while the national 911 system has poor rural coverage. LILERP addresses this gap by providing a culturally appropriate, voice-first emergency response system.

## System Components

### 1. Backend API (`/backend`)

- **Technology:** Node.js, Express, SQLite
- **Features:** IVR integration, incident management, notification system
- **API Endpoints:** Emergency reporting, responder management, authentication

### 2. Landing Page Website (`/frontend/lilerp-website`)

- **Technology:** React, Vite, TailwindCSS
- **Features:** Project overview, system demo, contact form
- **Responsive:** Mobile-first design

### 3. Mobile App (`/lilerp-mobile`)

- **Technology:** React (Progressive Web App)
- **Features:** Emergency reporting, voice recording, GPS location, report tracking
- **Target:** Tech-savvy users with smartphones

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Git

### Backend Setup

```bash
cd backend
npm install
npm run db:sync  # Initialize database
npm start        # Start on port 3001
```

### Website Setup

```bash
cd frontend/lilerp-website
pnpm install
pnpm run dev     # Start on port 5173
```

### Mobile App Setup

```bash
cd lilerp-mobile
pnpm install
pnpm run dev     # Start on port 5173
```

## System Features

### Core IVR System

- **Simple 3-level menu** for illiterate users
- **Voice prompts** in English (Mano/Gio planned for future)
- **Emergency types:** Land disputes, violence, property conflicts
- **Automatic notifications** to chiefs, police, NGOs

### Mobile App Features

- **Emergency reporting** with voice recording
- **GPS location detection** for precise incident mapping
- **Report tracking** with status updates
- **Direct calling** to emergency line and traditional chiefs
- **Offline capability** for areas with poor connectivity

### Website Features

- **Project overview** and impact statistics
- **Interactive demo** of IVR call flow
- **Mobile app mockup** and download links
- **Contact form** for NGO partnerships

## System Architecture

```sh
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voice Calls   │    │   Mobile App    │    │    Website      │
│   (IVR/Twilio)  │    │   (React PWA)   │    │   (React SPA)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │     Backend API         │
                    │   (Node.js/Express)     │
                    └─────────────┬───────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │      Database           │
                    │      (SQLite)           │
                    └─────────────────────────┘
```

## Target Users

### Primary Users

- **Rural community members** experiencing land disputes
- **Traditional chiefs** and local authorities
- **Emergency responders** (police, NGOs)

### User Personas

1. **Illiterate Farmer** - Uses voice calls to IVR system
2. **Tech-Savvy Youth** - Uses mobile app for reporting
3. **Traditional Chief** - Receives notifications and coordinates response
4. **NGO Worker** - Monitors incidents through web dashboard

## Expected Impact

- **Response Time:** Reduce from hours/days to <2 minutes
- **Coverage:** Extend emergency services to rural areas
- **Accessibility:** Support illiterate users through voice interface
- **Cultural Integration:** Respect traditional governance structures
- **Conflict Prevention:** Early intervention in land disputes

## Security & Privacy

- **Anonymous reporting** options available
- **Encrypted data storage** for sensitive information
- **Role-based access** control for responders
- **GDPR compliance** for data protection
- **Audit trails** for all system interactions

## Innovation Highlights

1. **First integrated system** combining land registry with emergency response
2. **Voice-first design** for illiterate user accessibility
3. **Cultural sensitivity** respecting traditional governance
4. **Offline capability** for rural connectivity challenges
5. **Multi-platform approach** (voice, web, mobile)

## Future Enhancements

### Phase 2 (Post-Capstone)

- **Blockchain integration** for immutable land records
- **AI-powered** fraud detection and dispute prediction
- **Local language support** (Mano, Gio, Kpelle)
- **Comprehensive land registry** features
- **SMS backup system** for areas without voice coverage

### Phase 3 (Scale-Up)

- **Nationwide deployment** across all 15 counties
- **Integration with government systems** (Liberia Land Authority)
- **Advanced analytics** and reporting dashboards
- **Mobile money integration** for service payments
- **Satellite connectivity** for remote areas

## Partnerships

### Potential Partners

- **Liberia Land Authority** - Government integration
- **Traditional councils** - Community engagement
- **NGOs** (Landesa, Namati) - Implementation support
- **Telecom providers** - Infrastructure and connectivity
- **International donors** - Funding and sustainability

## Emergency Contacts

- **LILERP Hotline:** +231-123-HELP (simulated)
- **Developer:** Willie B. Daniels
- **Institution:** African Leadership University
- **Email:** <w.daniels@alustudent.com> (example)

## License

This project is developed as part of academic research at African Leadership University.

## Acknowledgments

- **African Leadership University** - Academic support
- **Nimba County Communities** - Research insights
- **Traditional authorities** - Cultural guidance
- **Technology partners** - Infrastructure support

---

**Note:** This is a capstone research project prototype. For production deployment, additional security, scalability, and regulatory compliance measures would be required.
