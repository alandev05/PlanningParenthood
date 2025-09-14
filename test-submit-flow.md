# Submit Flow Testing Guide

## Overview
This guide helps you test the complete submit button flow from IntakeScreen to RoadmapScreen.

## Prerequisites
1. Backend server running on port 8001
2. Frontend app running (React Native or web)
3. Network connectivity between frontend and backend

## Test Scenarios

### Scenario 1: Successful Flow with Backend Running

**Steps:**
1. Start the backend server:
   ```bash
   cd PlanningParenthood/backend
   python server.py
   ```

2. Start the frontend app

3. Navigate to IntakeScreen and complete all 4 steps:
   - Step 1: Set budget, select support options, choose transport
   - Step 2: Set hours per week, spouse status, parenting style
   - Step 3: Set number of kids, child age, area type
   - Step 4: Arrange priorities, then press Submit

4. **Expected Results:**
   - Loading indicator appears on submit button
   - Success alert shows number of recommendations found
   - Navigation to RoadmapScreen occurs
   - RoadmapScreen displays personalized recommendations
   - "View All Recommendations" button works

**Verification Points:**
- [ ] Submit button shows "Getting Recommendations..." with spinner
- [ ] Console logs show successful API calls
- [ ] Success alert appears with recommendation count
- [ ] RoadmapScreen loads with recommendations
- [ ] Recommendations have proper data (title, description, match score, etc.)
- [ ] Navigation to Results screen works

### Scenario 2: Backend Unavailable (Fallback Flow)

**Steps:**
1. Ensure backend server is NOT running
2. Complete IntakeScreen as in Scenario 1
3. Press Submit

**Expected Results:**
- Loading indicator appears
- Console shows attempts to connect to multiple backend URLs
- Demo alert appears: "We couldn't connect to our recommendation service..."
- Navigation to RoadmapScreen with demo data
- RoadmapScreen shows 3 demo recommendations

**Verification Points:**
- [ ] Multiple backend URLs are attempted
- [ ] Demo alert appears with appropriate message
- [ ] Demo recommendations are stored and displayed
- [ ] App continues to function normally
- [ ] User can still navigate to Results screen

### Scenario 3: Network Timeout

**Steps:**
1. Start backend but simulate slow network (or use network throttling)
2. Complete IntakeScreen and submit
3. Observe timeout behavior

**Expected Results:**
- Exponential backoff retries are attempted
- Eventually falls back to demo data
- User-friendly timeout message

### Scenario 4: Invalid Data Handling

**Steps:**
1. Try to submit without completing required fields
2. Verify validation works

**Expected Results:**
- Validation alert appears
- Submit is prevented
- User is guided to complete missing fields

## Console Log Verification

Look for these log patterns:

### Successful Flow:
```
🚀 handleSubmit called
✅ Validation passed, starting submission...
👨‍👩‍👧‍👦 Creating family profile: {...}
✅ Family created with ID: [family_id]
🎯 Saving family priorities: {...}
🔍 Getting personalized recommendations...
🌐 API call: http://localhost:8001/api/recommend (attempt 1)
✅ API call successful: http://localhost:8001/api/recommend
✅ Successfully received recommendations: {...}
📱 Stored X recommendations in AsyncStorage
🧭 Navigating to Roadmap screen...
```

### Fallback Flow:
```
🚀 handleSubmit called
✅ Validation passed, starting submission...
🔍 Getting personalized recommendations...
❌ Failed to connect to http://localhost:8001: [error]
❌ Failed to connect to http://127.0.0.1:8001: [error]
⚠️ API call failed, providing demo data: [error]
📱 Stored 3 recommendations in AsyncStorage
🧭 Navigating to Roadmap screen...
```

## RoadmapScreen Verification

### With Recommendations:
- [ ] Success card shows correct count
- [ ] Top 3 recommendations displayed with:
  - [ ] Title and description
  - [ ] Match score percentage
  - [ ] Price information
  - [ ] Category
  - [ ] AI explanation
- [ ] "View All Recommendations" button present
- [ ] "Modify My Preferences" button works

### Without Recommendations:
- [ ] Empty state section appears
- [ ] "No Recommendations Yet" message
- [ ] "Try Again" button works
- [ ] "Retake Quiz" button appears instead of "View All"

## Troubleshooting

### Common Issues:

1. **Network Connection Failed**
   - Check if backend is running on correct port
   - Verify IP addresses in BACKEND_URLS array
   - Check firewall settings

2. **Invalid Response Format**
   - Check backend logs for errors
   - Verify /api/recommend endpoint returns proper JSON

3. **AsyncStorage Issues**
   - Clear app data/cache
   - Check device storage permissions

4. **Navigation Issues**
   - Verify RootStackParamList includes Roadmap screen
   - Check navigation prop types

## Success Criteria

The submit flow is working correctly when:
- ✅ All validation works properly
- ✅ Loading states provide good UX
- ✅ API calls succeed with backend running
- ✅ Fallback to demo data works when backend unavailable
- ✅ Error messages are user-friendly
- ✅ Navigation flow works smoothly
- ✅ Data persistence works correctly
- ✅ RoadmapScreen displays recommendations properly
- ✅ Empty states are handled gracefully