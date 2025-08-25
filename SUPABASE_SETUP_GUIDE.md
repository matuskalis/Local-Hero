# 🚀 Local Hero - Supabase Setup Guide

## What You Need to Do (5 minutes max!)

### 1. Go to Your Supabase Dashboard
- Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Click on your project: `jyxkwqlkazswhrdljxjv`

### 2. Enable Email Authentication
- Go to **Authentication** → **Providers**
- Make sure **Email** is enabled ✅
- Under **Email Auth**, ensure these are checked:
  - ✅ **Enable email confirmations**
  - ✅ **Enable secure email change**
  - ✅ **Enable email confirmations on sign up**

### 3. Run the Complete Setup Script
- Go to **SQL Editor** in the left sidebar
- Click **New Query**
- Copy the entire contents of `supabase_setup_complete.sql`
- Paste it into the query editor
- Click **Run** to execute

### 4. Verify Setup
- Go to **Table Editor** → You should see all 7 tables created
- Go to **SQL Editor** → Try this test query:
  ```sql
  SELECT * FROM profiles;
  ```

## What Gets Created
✅ **7 Tables**: profiles, friends, requests, offers, messages, notifications, push_tokens  
✅ **Security**: Row Level Security (RLS) policies for data privacy  
✅ **Functions**: 8 helper functions for app operations  
✅ **Performance**: Indexes for fast queries  
✅ **Automation**: Timestamp updates  

## That's It! 🎉
Your database is now ready. The app will work immediately after this setup.

## Next Steps
1. Test the app: `npm start`
2. Create your first profile
3. Post a test request
4. Give it to people in Melstone!

## If Something Goes Wrong
- Check the **Logs** section in Supabase for errors
- Make sure you copied the entire SQL script
- Verify email authentication is enabled
