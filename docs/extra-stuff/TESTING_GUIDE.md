# LILERP Mobile App - Testing Guide

This guide will help you test all the new features and bug fixes.

---

## 🚀 Quick Start

### 1. Install the Fixes

```bash
cd lilerp-system-main-2
chmod +x INSTALL_FIXES.sh
./INSTALL_FIXES.sh
```

### 2. Start the Backend (Required)

```bash
cd backend
npm install
node server.js
```

Backend should start on <http://localhost:3001>

### 3. Start the Mobile App

```bash
cd lilerp-mobile
npm install
npm run dev
```

App should start on <http://localhost:5173>

---

## ✅ Testing Checklist

### Feature 1: Splash Screen & Persistent Login

#### Test 1.1: Splash Screen on First Load

- [ ] Open <http://localhost:5173/>
- [ ] **Expected**: Green gradient splash screen with LILERP logo appears
- [ ] **Expected**: Animated shield icon with pulse effect
- [ ] **Expected**: "LILERP" title and "Liberia Integrated Land Registry & Emergency Response Platform" subtitle
- [ ] **Expected**: Loading spinner at bottom
- [ ] **Expected**: Screen displays for at least 2 seconds
- [ ] **Expected**: Transitions to login screen

#### Test 1.2: New User Registration

- [ ] Click "Don't have an account? Register"
- [ ] Fill in all fields:
  - Full Name: "Test User"
  - Email: "<testuser@example.com>"
  - Phone: "+231-123-456-789"
  - Community: "Monrovia"
  - Password: "password123"
  - Confirm Password: "password123"
- [ ] Click "Register"
- [ ] **Expected**: "Registration successful!" alert
- [ ] **Expected**: Redirected to home screen
- [ ] **Expected**: Dashboard shows "Welcome, Test User!"

#### Test 1.3: Persistent Login (Critical Test)

- [ ] After registration, note that you're logged in
- [ ] **Refresh the page** (F5 or Cmd+R)
- [ ] **Expected**: Splash screen appears briefly
- [ ] **Expected**: Automatically logged in (no login screen)
- [ ] **Expected**: Home screen appears with your name
- [ ] **Expected**: Dashboard shows your reports (if any)
- [ ] ✅ **PASS**: Login persists across page refresh

#### Test 1.4: Close and Reopen Browser

- [ ] Close the browser tab completely
- [ ] Close the browser application
- [ ] Reopen browser
- [ ] Navigate to <http://localhost:5173/>
- [ ] **Expected**: Splash screen appears
- [ ] **Expected**: Automatically logged in
- [ ] **Expected**: Home screen appears
- [ ] ✅ **PASS**: Login persists across browser sessions

#### Test 1.5: Logout and Login

- [ ] Click on your profile/menu
- [ ] Click "Logout"
- [ ] **Expected**: Redirected to login screen
- [ ] Login with:
  - Email: "<testuser@example.com>"
  - Password: "password123"
- [ ] Click "Login"
- [ ] **Expected**: "Login successful!" alert
- [ ] **Expected**: Home screen appears
- [ ] **Expected**: Still logged in after page refresh

---

### Feature 2: Speech-to-Text Transcription

#### Test 2.1: Voice Recording with Transcription

- [ ] Go to "Report" screen (click "Report Emergency")
- [ ] Fill in:
  - Emergency Type: "Land Boundary Dispute"
  - Urgency Level: "High - Urgent"
  - Location: "Monrovia, Liberia"
  - Description: "Test description"
- [ ] Click "Start Recording" button
- [ ] **Expected**: Button changes to red "Stop Recording" with timer
- [ ] **Expected**: Timer starts counting (0:00, 0:01, 0:02...)
- [ ] **Speak clearly into microphone**: "This is a test of the voice recording and transcription feature. I am reporting a land boundary dispute."
- [ ] **Expected**: As you speak, text appears in a blue box below the recording controls
- [ ] **Expected**: Text updates in real-time as you speak
- [ ] Wait 5-10 seconds
- [ ] Click "Stop Recording"
- [ ] **Expected**: Timer stops
- [ ] **Expected**: Audio player appears with playback controls
- [ ] **Expected**: Transcription box shows the full text you spoke
- [ ] ✅ **PASS**: Speech-to-text transcription works

#### Test 2.2: Audio Playback

- [ ] After stopping recording, find the "Recording Preview" section
- [ ] Click the play button on the audio player
- [ ] **Expected**: Your voice plays back
- [ ] **Expected**: Audio is clear and understandable
- [ ] ✅ **PASS**: Audio recording works

#### Test 2.3: Submit Report with Voice

- [ ] After recording, scroll down
- [ ] Click "Submit Report" button
- [ ] **Expected**: "Report submitted successfully!" alert
- [ ] **Expected**: Redirected to "My Reports" screen
- [ ] **Expected**: New report appears at the top of the list
- [ ] ✅ **PASS**: Report with voice submitted

---

### Feature 3: Data Persistence for Reports

#### Test 3.1: Reports Display on Dashboard

- [ ] Go to "Home" screen
- [ ] Look at the statistics cards
- [ ] **Expected**: "Total Reports" shows 1 (or more if you submitted multiple)
- [ ] **Expected**: "Pending" shows 1
- [ ] **Expected**: Numbers match actual reports
- [ ] ✅ **PASS**: Dashboard numbers are correct

#### Test 3.2: Reports Persist After Refresh

- [ ] Note the number of reports on dashboard
- [ ] **Refresh the page** (F5 or Cmd+R)
- [ ] **Expected**: Splash screen appears briefly
- [ ] **Expected**: Automatically logged in
- [ ] **Expected**: Dashboard shows same number of reports
- [ ] Go to "My Reports"
- [ ] **Expected**: All your reports are still there
- [ ] **Expected**: Report details are intact (audio, transcription, location)
- [ ] ✅ **PASS**: Reports persist across page refresh

#### Test 3.3: Reports Persist After Browser Close

- [ ] Note the number of reports
- [ ] Close browser completely
- [ ] Reopen browser and go to <http://localhost:5173/>
- [ ] **Expected**: Automatically logged in
- [ ] **Expected**: All reports still present
- [ ] ✅ **PASS**: Reports persist across browser sessions

---

### Feature 4: Responder Dashboard Routing

#### Test 4.1: Become a Responder

- [ ] Go to "Profile" screen
- [ ] Look for "Go to Responder Dashboard" button
- [ ] If button is NOT visible:
  - [ ] You need to become a responder first
  - [ ] Make API call or use backend to set `isResponder: true` for your user
  - [ ] Or register a new account that's already a responder
- [ ] If button IS visible, proceed to next test

#### Test 4.2: Navigate to Responder Dashboard

- [ ] On Profile screen, click "Go to Responder Dashboard" button
- [ ] **Expected**: URL changes to <http://localhost:5173/responder>
- [ ] **Expected**: Blue splash screen appears (different from green user splash)
- [ ] **Expected**: "LILERP Responder Dashboard" text
- [ ] **Expected**: After 2 seconds, redirected to responder login
- [ ] ✅ **PASS**: Responder dashboard route works

#### Test 4.3: Responder Login

- [ ] On responder login screen, enter:
  - Email: (your email)
  - Password: (your password)
- [ ] Click "Login"
- [ ] **Expected**: "Login successful!" alert
- [ ] **Expected**: Responder dashboard appears
- [ ] **Expected**: Blue header (not green)
- [ ] **Expected**: Statistics cards show report numbers
- [ ] ✅ **PASS**: Responder login works

#### Test 4.4: Responder Login Persistence

- [ ] After logging in as responder
- [ ] **Refresh the page**
- [ ] **Expected**: Splash screen appears
- [ ] **Expected**: Automatically logged in as responder
- [ ] **Expected**: Dashboard appears without login screen
- [ ] ✅ **PASS**: Responder login persists

---

### Feature 5: Enhanced Report Details for Responders

#### Test 5.1: View All Reports

- [ ] On responder dashboard, click "View All Reports" or go to "Reports" tab
- [ ] **Expected**: List of all reports appears
- [ ] **Expected**: Each report shows:
  - Title/Type
  - Description
  - Location
  - Time
  - Status badge
  - Priority badge
- [ ] ✅ **PASS**: Reports list displays

#### Test 5.2: View Report Detail

- [ ] Click on any report in the list
- [ ] **Expected**: Detailed view opens
- [ ] **Expected**: "Reporter Information" section shows:
  - Name
  - Phone (with call button)
  - Community
  - Reported At time
- [ ] **Expected**: "Description" section shows full text
- [ ] **Expected**: "Location" section shows:
  - Address
  - Coordinates (if available)
  - "View on Map" button
- [ ] ✅ **PASS**: Report details display

#### Test 5.3: Audio Playback in Report Detail

- [ ] In report detail, look for "Voice Recording" section
- [ ] If present (from reports you submitted with voice):
  - [ ] **Expected**: HTML5 audio player appears
  - [ ] Click play button
  - [ ] **Expected**: Audio plays
  - [ ] **Expected**: Audio is the recording from the report
- [ ] ✅ **PASS**: Audio playback works

#### Test 5.4: Transcription Display

- [ ] In report detail, look for "Voice Transcription" section
- [ ] If present:
  - [ ] **Expected**: Blue box with transcribed text
  - [ ] **Expected**: Text matches what was spoken
- [ ] ✅ **PASS**: Transcription displays

---

### Feature 6: Call Functionality

#### Test 6.1: Call from Reports List

- [ ] On responder "Reports" screen
- [ ] Find a report with a phone number
- [ ] Click "Call Reporter" button on the report card
- [ ] **Expected**: Phone dialer opens (on mobile) or calling app opens (on desktop)
- [ ] **Expected**: Phone number is pre-filled
- [ ] **Expected**: Format is correct (e.g., +231-123-456-789)
- [ ] ✅ **PASS**: Call from list works

#### Test 6.2: Call from Report Detail

- [ ] Open a report detail view
- [ ] In "Reporter Information" section, click the phone icon button next to phone number
- [ ] **Expected**: Phone dialer opens with number
- [ ] In "Actions" section at bottom, click "Call Reporter" button
- [ ] **Expected**: Phone dialer opens with number
- [ ] ✅ **PASS**: Call from detail works

#### Test 6.3: View on Map

- [ ] In report detail with location coordinates
- [ ] Click "View on Map" button
- [ ] **Expected**: Google Maps opens in new tab
- [ ] **Expected**: Map shows the location
- [ ] **Expected**: Marker at correct coordinates
- [ ] ✅ **PASS**: Map navigation works

---

### Feature 7: Update Report Status

#### Test 7.1: Start Working on Report

- [ ] Open a report with status "pending"
- [ ] In "Actions" section, click "Start Working" button
- [ ] **Expected**: "Status updated successfully!" alert
- [ ] **Expected**: Status badge changes to "in_progress"
- [ ] **Expected**: "Start Working" button changes to "Mark as Resolved"
- [ ] ✅ **PASS**: Status update works

#### Test 7.2: Resolve Report

- [ ] With report in "in_progress" status
- [ ] Click "Mark as Resolved" button
- [ ] **Expected**: "Status updated successfully!" alert
- [ ] **Expected**: Status badge changes to "resolved"
- [ ] **Expected**: Badge color changes to green
- [ ] ✅ **PASS**: Resolve works

#### Test 7.3: Status Reflects on Dashboard

- [ ] After resolving a report
- [ ] Go back to responder dashboard (home)
- [ ] **Expected**: "Resolved Today" number increases
- [ ] **Expected**: "Pending" number decreases
- [ ] ✅ **PASS**: Dashboard stats update

---

## 🔍 Search and Filter Tests

### Test 8.1: Search Reports

- [ ] On responder "Reports" screen
- [ ] In search box, type part of a report description
- [ ] **Expected**: Reports list filters to show only matching reports
- [ ] Clear search box
- [ ] **Expected**: All reports appear again
- [ ] ✅ **PASS**: Search works

### Test 8.2: Filter by Status

- [ ] On responder "Reports" screen
- [ ] Click status dropdown
- [ ] Select "Pending"
- [ ] **Expected**: Only pending reports show
- [ ] Select "In Progress"
- [ ] **Expected**: Only in-progress reports show
- [ ] Select "Resolved"
- [ ] **Expected**: Only resolved reports show
- [ ] Select "All Status"
- [ ] **Expected**: All reports show
- [ ] ✅ **PASS**: Filter works

---

## 📱 Mobile-Specific Tests

### Test 9.1: Mobile Menu

- [ ] Resize browser to mobile size (< 768px width)
- [ ] **Expected**: Hamburger menu icon appears in header
- [ ] Click hamburger icon
- [ ] **Expected**: Mobile menu slides down
- [ ] **Expected**: All navigation items visible
- [ ] Click a menu item
- [ ] **Expected**: Menu closes and navigates
- [ ] ✅ **PASS**: Mobile menu works

### Test 9.2: Mobile Call Functionality

- [ ] Open app on actual mobile device (or use browser dev tools mobile emulation)
- [ ] Go to responder dashboard
- [ ] Click "Call Reporter" on any report
- [ ] **Expected**: Native phone dialer opens
- [ ] **Expected**: Number is pre-filled
- [ ] **Expected**: Can make call
- [ ] ✅ **PASS**: Mobile calling works

---

## 🐛 Bug Fix Verification

### Bug Fix 1: Login Persistence

- [ ] Login to app
- [ ] Refresh page multiple times
- [ ] **Expected**: Never have to login again
- [ ] Close and reopen browser
- [ ] **Expected**: Still logged in
- [ ] ✅ **FIXED**: Login persistence works

### Bug Fix 2: Report Persistence

- [ ] Submit multiple reports
- [ ] Refresh page
- [ ] **Expected**: All reports still present
- [ ] Close and reopen browser
- [ ] **Expected**: All reports still present
- [ ] ✅ **FIXED**: Reports persist

### Bug Fix 3: Dashboard Numbers

- [ ] Submit new report
- [ ] **Expected**: "Total Reports" increases immediately
- [ ] **Expected**: "Pending" increases immediately
- [ ] Refresh page
- [ ] **Expected**: Numbers remain correct
- [ ] ✅ **FIXED**: Dashboard numbers update

### Bug Fix 4: Responder Access

- [ ] As responder user, go to profile
- [ ] **Expected**: "Go to Responder Dashboard" button visible
- [ ] Click button
- [ ] **Expected**: Responder dashboard opens
- [ ] ✅ **FIXED**: Responder access works

### Bug Fix 5: Report Details

- [ ] As responder, open any report
- [ ] **Expected**: All sections present:
  - Reporter info
  - Description
  - Location
  - Audio (if available)
  - Transcription (if available)
  - Actions
- [ ] ✅ **FIXED**: Full details visible

---

## 🎯 End-to-End Test Scenario

### Complete User Journey

#### Part 1: User Reports Emergency

1. [ ] Open <http://localhost:5173/>
2. [ ] Register new account
3. [ ] Go to "Report" screen
4. [ ] Fill in emergency details
5. [ ] Record voice message (speak for 10 seconds)
6. [ ] Watch transcription appear
7. [ ] Get GPS location
8. [ ] Submit report
9. [ ] Verify report appears in "My Reports"
10. [ ] Refresh page
11. [ ] Verify still logged in
12. [ ] Verify report still present

#### Part 2: Responder Handles Emergency

1. [ ] Go to <http://localhost:5173/responder>
2. [ ] Login as responder
3. [ ] See new report in dashboard
4. [ ] Click "View All Reports"
5. [ ] Find the report you just submitted
6. [ ] Click to open detail view
7. [ ] Verify all information present:
    - Reporter name and phone
    - Description
    - Location
    - Audio recording (play it)
    - Transcription
8. [ ] Click "Call Reporter"
9. [ ] Verify phone dialer opens
10. [ ] Click "View on Map"
11. [ ] Verify Google Maps opens
12. [ ] Click "Start Working"
13. [ ] Verify status changes to "in_progress"
14. [ ] Click "Mark as Resolved"
15. [ ] Verify status changes to "resolved"
16. [ ] Go back to dashboard
17. [ ] Verify "Resolved Today" increased

#### Part 3: Verify Persistence

1. [ ] Refresh page
2. [ ] Verify responder still logged in
3. [ ] Verify report still shows as resolved
4. [ ] Close browser
5. [ ] Reopen and go to responder dashboard
6. [ ] Verify still logged in
7. [ ] Verify all data intact

✅ **PASS**: Complete end-to-end flow works

---

## 🚨 Known Issues to Test

### Issue 1: Speech Recognition Browser Support

- [ ] Test in Chrome: **Expected to work**
- [ ] Test in Edge: **Expected to work**
- [ ] Test in Safari: **May have limited support**
- [ ] Test in Firefox: **Expected NOT to work**
- [ ] If not working: Audio recording should still work, just no transcription

### Issue 2: Microphone Permissions

- [ ] First time recording, browser asks for microphone permission
- [ ] Click "Allow"
- [ ] **Expected**: Recording starts
- [ ] If "Block" was clicked by mistake:
  - [ ] Go to browser settings
  - [ ] Allow microphone for localhost
  - [ ] Refresh page

### Issue 3: Location Permissions

- [ ] First time using GPS, browser asks for location permission
- [ ] Click "Allow"
- [ ] **Expected**: Location appears in form
- [ ] If "Block" was clicked:
  - [ ] Go to browser settings
  - [ ] Allow location for localhost
  - [ ] Refresh page

---

## ✅ Final Checklist

Before considering testing complete, verify:

- [ ] All 7 main features work
- [ ] All 5 bug fixes verified
- [ ] End-to-end scenario completes successfully
- [ ] Mobile responsive design works
- [ ] No console errors (check browser dev tools)
- [ ] No network errors (check network tab)
- [ ] Splash screens appear on both apps
- [ ] Login persists across sessions
- [ ] Reports persist across sessions
- [ ] Audio recording works
- [ ] Speech transcription works (in supported browsers)
- [ ] Call functionality works
- [ ] Map navigation works
- [ ] Status updates work
- [ ] Search and filter work
- [ ] Dashboard statistics accurate

---

## 📊 Test Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Splash Screen | ⬜ | |
| Persistent Login | ⬜ | |
| Speech-to-Text | ⬜ | |
| Audio Recording | ⬜ | |
| Data Persistence | ⬜ | |
| Responder Routing | ⬜ | |
| Report Details | ⬜ | |
| Call Functionality | ⬜ | |
| Map Navigation | ⬜ | |
| Status Updates | ⬜ | |
| Search & Filter | ⬜ | |
| Mobile Responsive | ⬜ | |

Legend:

- ⬜ Not tested
- ✅ Pass
- ❌ Fail
- ⚠️ Partial/Issues

---

## 🐛 Reporting Issues

If you find any issues during testing:

1. **Check browser console** for errors (F12 → Console tab)
2. **Check network tab** for failed API calls (F12 → Network tab)
3. **Note the exact steps** to reproduce
4. **Note your browser** and version
5. **Take screenshots** if helpful

---

## ✅ Success Criteria

Testing is successful if:

1. ✅ All 7 main features work as described
2. ✅ All 5 bug fixes are verified
3. ✅ End-to-end scenario completes without errors
4. ✅ No critical console errors
5. ✅ Mobile responsive design works
6. ✅ Data persists across sessions

---

**Happy Testing! 🎉**

If all tests pass, the LILERP mobile app is production-ready!
