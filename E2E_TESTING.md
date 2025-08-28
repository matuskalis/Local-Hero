# Local Hero App - E2E Testing Guide

## 🎯 What We've Built

We've implemented the minimal E2E flow for the Local Hero app with the following components:

### ✅ Completed Features

1. **RequestsFeed (HomeScreen)** - Shows nearby/public requests in a basic list
2. **RequestDetail Screen** - View one request and "Offer to help"
3. **MyRequests Screen** - Requester sees offers, can Accept exactly one
4. **Request Status Management** - Status updates: open → matched → completed
5. **Offers System** - Create and manage offers with notes
6. **Basic Karma System** - Framework for awarding karma points (+10 on completion)

### 🔄 E2E Flow

The complete flow works as follows:

1. **User A** creates a request (Post Screen)
2. **User B** sees the request in the feed (Home Screen)
3. **User B** taps the request to view details (RequestDetail Screen)
4. **User B** submits an offer to help
5. **User A** sees offers in MyRequests screen
6. **User A** accepts one offer (status changes to 'matched')
7. **User A** marks request as complete (status changes to 'completed')
8. **User B** gets karma points (+10) for helping

## 🧪 How to Test

### Prerequisites
- Expo app running (`npm start`)
- Access to the app on device/simulator

### Test Steps

#### 1. Create a Request
1. Open the app and enter your name
2. Go to "Post Request" tab
3. Fill out the form:
   - Description: "Need help with yard work"
   - When: "This weekend"
   - Visibility: "Public"
   - Community: "Melstone, MT"
4. Tap "Post Request"
5. Verify success message and return to Home

#### 2. View Request in Feed
1. On Home tab, verify your request appears
2. Tap on the request to open RequestDetail screen
3. Verify all details are displayed correctly
4. Check that "Offer to Help" section is visible (since it's not your request)

#### 3. Submit an Offer (Simulate Different User)
1. In RequestDetail screen, fill out the offer form:
   - Note: "I can help with yard work! I have experience and tools."
2. Tap "Submit Offer"
3. Verify success message and return to Home

#### 4. Manage Your Request
1. Tap "My Requests" button in header
2. Verify your request appears in the list
3. Tap on the request to expand it
4. Verify offers are visible
5. Tap "Accept Offer" on one of the offers
6. Verify status changes to "Matched"

#### 5. Complete the Request
1. In the expanded request view, tap "Mark as Complete"
2. Verify status changes to "Completed"
3. Verify success message about karma points

### Expected Results

- ✅ Requests display correctly in feed
- ✅ RequestDetail screen shows full request info
- ✅ Offers can be submitted and viewed
- ✅ Request status updates properly (open → matched → completed)
- ✅ Only one offer can be accepted per request
- ✅ Completed requests show final status
- ✅ No crashes during the flow
- ✅ State updates visible after refresh

## 🐛 Known Issues & Limitations

### Current Implementation
- Uses localStorage/mock data instead of real database
- Offers are hardcoded for demo purposes
- Karma system is simulated (no real database updates)
- No real user authentication

### Future Improvements
- Integrate with Supabase backend
- Add real-time updates
- Implement push notifications
- Add geolocation features
- Real user authentication

## 🚀 Running the App

```bash
cd local-hero-app
npm start
```

Then scan the QR code with Expo Go app or run on simulator.

## 📱 Navigation Structure

```
NameInput → MainTabs
├── Home (RequestsFeed)
│   ├── RequestDetail
│   └── MyRequests
├── Post (Create Request)
└── Inbox (Messages)
```

## 🔧 Technical Details

### Key Components
- `HomeScreen.tsx` - Main feed of requests
- `RequestDetailScreen.tsx` - View request and submit offers
- `MyRequestsScreen.tsx` - Manage own requests and offers
- `PostScreen.tsx` - Create new requests
- `App.tsx` - Navigation setup

### Data Flow
- Shared state in `HomeScreen.tsx` for requests
- Mock offers data in individual screens
- Status updates propagate through shared state
- Navigation between screens with proper params

### State Management
- Local state for UI interactions
- Shared state for requests data
- Mock data for offers and profiles
- Status tracking: open → matched → completed
