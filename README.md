# 🏠 Local Hero

A super-simple app that connects elders who need help with nearby people who want to help — focused on small rural communities.

## 🌟 Features

- **Radical Simplicity**: Big buttons, minimal steps, plain language
- **Local-First**: See requests near you in your community
- **Flexible Visibility**: Public or Friends-only requests
- **Low-Friction Contact**: In-app messaging and optional phone calls
- **Karma System**: Earn points for helping others

## 🎯 Core Functionality

### For Elders (Requesters)
- Post help requests with free text description
- Set optional deadlines in plain language (e.g., "tonight", "before winter")
- Choose who can see your request (Public or Friends only)
- Receive offers and coordinate with helpers

### For Helpers
- Browse nearby help requests
- Offer to help with optional messages
- Coordinate via in-app messaging
- Earn karma points for completed help

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd local-hero-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Add your Supabase URL and anon key
```

4. Set up Supabase database:
```bash
# Run the migration files in supabase/migrations/
# Start with 001_initial_schema.sql, then 002_local_hero_schema.sql
```

5. Start the development server:
```bash
npm start
```

## 🏗️ Architecture

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for tab-based navigation
- **Supabase JS Client** for backend communication

### Backend
- **Supabase** (PostgreSQL + Auth + RLS)
- **Row Level Security** for data privacy
- **Real-time subscriptions** for live updates
- **Stored procedures** for complex operations

### Database Schema
- `profiles`: User information and karma points
- `requests`: Help requests with visibility rules
- `offers`: Helper offers on requests
- `messages`: In-app communication
- `friends`: Friendship relationships
- `notifications`: Push notification data

## 📱 App Structure

- **Home**: Feed of nearby requests, big "I need help" button
- **Post**: 6-step wizard for creating help requests
- **Inbox**: Manage your requests, offers, and messages
- **Profile**: Edit profile, manage friends, view karma

## 🔒 Security Features

- **Row Level Security (RLS)** on all tables
- **Visibility rules**: Public vs Friends-only requests
- **Authentication**: Email magic link sign-in
- **Data isolation**: Users only see authorized content

## 🎨 Design Principles

- **Senior-friendly**: Large touch targets (min 56px)
- **High contrast**: Clear typography and colors
- **One action per screen**: Simple, focused interfaces
- **Plain English**: No jargon or technical terms

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for web
expo build:web
```

### Supabase Deployment
1. Push migrations to production
2. Update environment variables
3. Test authentication and RLS policies

## 📊 Success Metrics

- T1 retention of requesters (post again within 7 days)
- % of requests receiving at least 1 offer within 24h
- Median time to first offer
- Completion rate from offer → matched

## 🔮 Future Features

- Multiple communities and geofencing
- Media uploads (photos of tasks)
- Availability windows and scheduling
- Reputation and thanks badges
- Safety features (ID verification, admin tools)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for small rural communities like Melstone, Montana
- Designed with seniors in mind
- Inspired by the spirit of neighbor helping neighbor 