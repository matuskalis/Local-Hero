# Local Hero - Community Help Platform

A modern React Native app that connects neighbors to help each other with daily tasks and community needs.

## 🌟 Features

### Core Functionality
- **Request System**: Create and manage help requests
- **Offer System**: Offer help to neighbors with accept/decline workflow
- **Real-time Chat**: Communicate with helpers/requesters
- **Karma Points**: Gamified system rewarding helpful community members
- **User Profiles**: Manage personal information and contact details

### Community Features
- **City Announcements**: Stay updated with local events and news
- **Leaderboard**: See top community helpers
- **Moderation Tools**: Report and block inappropriate users/requests
- **Offline Support**: Cache data for offline usage

### UX/UX Excellence
- **Apple-style Design**: Clean, modern interface optimized for seniors
- **Loading States**: Skeleton screens and error handling
- **Preset Options**: Quick selection for common help types
- **Responsive Design**: Works on all screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/matuskalis/Local-Hero.git
   cd Local-Hero
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## 📱 App Structure

### Screens
- **HomeScreen**: Main feed with announcements and requests
- **RequestDetailScreen**: View and manage individual requests
- **PostScreen**: Create new help requests
- **ChatScreen**: Real-time messaging with offers
- **ProfileScreen**: User profile and settings
- **UserProfileScreen**: View other users' profiles
- **MyRequestsScreen**: Manage your own requests
- **LeaderboardScreen**: Community rankings
- **InboxScreen**: Message center

### Key Components
- **Avatar**: User profile pictures
- **Card**: Reusable content containers
- **PrimaryButton/SecondaryButton**: Action buttons
- **Badge**: Status indicators
- **InputField**: Form inputs
- **ActionSheet**: Modal interactions
- **NotificationProvider**: In-app notifications

## 🏗️ Architecture

### State Management
- **Shared State**: Global request data
- **AsyncStorage**: Persistent user data and cache
- **React Hooks**: Local component state

### Data Flow
1. **Requests**: Created → Stored → Displayed → Offers → Accepted/Declined
2. **Karma System**: Actions → Points → Leaderboard → Rankings
3. **Chat**: Offers → Messages → Real-time communication

### Key Libraries
- **React Native**: Core framework
- **Expo**: Development platform
- **React Navigation**: Screen navigation
- **AsyncStorage**: Data persistence
- **Ionicons**: Icon library

## 📊 Analytics & Telemetry

### Tracked Events
- **User Actions**: OpenRequest, SubmitOffer, AcceptOffer, DeclineOffer
- **Navigation**: ScreenView, TabSwitch
- **Engagement**: RefreshFeed, AnnouncementAttend
- **Moderation**: ReportUser, BlockUser, ReportRequest

### Success Metrics
- **User Engagement**: Daily active users, session duration
- **Community Growth**: New requests, successful help exchanges
- **Feature Adoption**: Chat usage, profile completion
- **Retention**: User return rate, repeat requests

## 🎨 Design System

### Colors
- **Primary Green**: #2BB673 (main actions)
- **Secondary Gray**: #6B7280 (text, borders)
- **Success Green**: #27ae60 (confirmations)
- **Error Red**: #E53E3E (errors, warnings)
- **Background**: #f8f9fa (light gray)

### Typography
- **Headers**: 24px, bold, #000000
- **Body**: 18px, regular, #000000
- **Meta**: 14px, regular, #6B7280
- **Buttons**: 16px, semibold

### Spacing
- **Card Padding**: 20px
- **Section Margin**: 24px
- **Element Gap**: 8-16px

## 🔧 Development

### Code Structure
```
src/
├── screens/          # App screens
├── ui/              # Reusable components
│   ├── components/  # UI components
│   └── notifications/ # Notification system
├── lib/             # Utilities
│   ├── points.ts    # Karma system
│   └── telemetry.ts # Analytics
└── App.tsx          # Main app component
```

### Key Features Implementation

#### Karma System
- Points awarded for helping others (+10 points)
- Leaderboard rankings
- User statistics tracking
- Persistent storage with AsyncStorage

#### Offer Workflow
1. User creates request
2. Others submit offers
3. Requester reviews offers
4. Accept/decline with chat integration
5. Karma points awarded on acceptance

#### Moderation
- Report users/requests
- Block inappropriate users
- Community safety features
- Admin review system

## 🚀 Deployment

### Production Build
```bash
# Build for production
expo build:android
expo build:ios

# Or use EAS Build
eas build --platform all
```

### App Store Submission
1. Configure app.json with production settings
2. Build production version
3. Submit to App Store/Google Play
4. Monitor analytics and user feedback

## 📈 Success Metrics

### Key Performance Indicators
- **User Acquisition**: New user registrations
- **Engagement**: Requests created, offers submitted
- **Community Health**: Successful help exchanges
- **Retention**: Monthly active users
- **Growth**: Community size, geographic expansion

### Analytics Dashboard
- Real-time user activity
- Feature usage statistics
- Community engagement metrics
- Error tracking and performance

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request
5. Code review and merge

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component documentation
- Test coverage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React Native community
- Expo team for excellent tooling
- Design inspiration from Apple's Human Interface Guidelines
- Community feedback and testing

---

**Built with ❤️ for stronger communities**