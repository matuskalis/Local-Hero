# BeeGood App Deployment Guide

This guide will walk you through deploying the BeeGood app to production, including Supabase, Edge Functions, and app store deployment.

## 🚀 Prerequisites

- Supabase account with a production project
- Stripe account with production keys
- AdMob account with production ad units
- Apple Developer account (for iOS)
- Google Play Console account (for Android)
- Expo account

## 📋 Step 1: Supabase Production Setup

### 1.1 Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 1.2 Link Local Project

```bash
# Link to production project
supabase link --project-ref YOUR_PROJECT_REF

# Verify connection
supabase status
```

### 1.3 Apply Database Schema

```bash
# Push the initial schema
supabase db push

# Verify tables were created
supabase db diff
```

### 1.4 Set Production Secrets

```bash
# Set all environment variables
supabase secrets set \
  STRIPE_SECRET=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  IAP_APPLE_SHARED_SECRET=your_apple_secret \
  IAP_GOOGLE_SERVICE_ACCOUNT=your_google_account \
  CHARITY_SHARE=0.5 \
  STORE_FEE_RATE=0.15 \
  CRON_SECRET=your_cron_secret
```

## 🔧 Step 2: Deploy Edge Functions

### 2.1 Deploy All Functions

```bash
# Deploy each function
supabase functions deploy hp-refresh
supabase functions deploy ads-reward-callback
supabase functions deploy iap-points-verify
supabase functions deploy stripe-webhook
supabase functions deploy charity-close-month
```

### 2.2 Verify Function Deployment

```bash
# List deployed functions
supabase functions list

# Test a function
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/hp-refresh \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"idempotency_key":"test","device_id":"test"}'
```

## 💳 Step 3: Stripe Production Setup

### 3.1 Create Production Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live** mode
3. Create a $5/month subscription price
4. Note down the `price_id`

### 3.2 Configure Webhooks

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Note down the webhook secret

### 3.3 Update Environment Variables

```bash
supabase secrets set \
  STRIPE_SECRET=sk_live_... \
  STRIPE_PRICE_ID_MONTHLY=price_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📱 Step 4: AdMob Production Setup

### 4.1 Create Production App

1. Go to [AdMob Console](https://admob.google.com)
2. Create a new app
3. Add iOS and Android platforms
4. Note down the App ID

### 4.2 Create Rewarded Ad Unit

1. Go to **Apps > Your App > Ad Units**
2. Create a new Rewarded ad unit
3. Note down the Ad Unit ID
4. Configure targeting and frequency caps

### 4.3 Update Environment Variables

```bash
supabase secrets set \
  ADMOB_APP_ID=ca-app-pub-... \
  ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-...
```

## ⏰ Step 5: Setup Cron Jobs

### 5.1 Create Monthly Cron Job

```bash
# Create a cron job that runs monthly
# This can be done through Supabase Dashboard or CLI

# Example: Run on the 1st of every month at 00:00 UTC
0 0 1 * * curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/charity-close-month \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

### 5.2 Alternative: Use Supabase Scheduled Functions

```sql
-- Create a scheduled function in Supabase
SELECT cron.schedule(
  'charity-monthly-close',
  '0 0 1 * *',
  'SELECT net.http_post(
    url := ''https://YOUR_PROJECT_REF.supabase.co/functions/v1/charity-close-month'',
    headers := ''{"x-cron-secret": "YOUR_CRON_SECRET", "Content-Type": "application/json"}''::jsonb
  );'
);
```

## 📱 Step 6: App Store Deployment

### 6.1 iOS App Store

1. **Update app.json**
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.beegood",
         "buildNumber": "1.0.0"
       }
     }
   }
   ```

2. **Build Production App**
   ```bash
   expo build:ios --release-channel production
   ```

3. **Submit to App Store**
   ```bash
   expo submit:ios
   ```

### 6.2 Google Play Store

1. **Update app.json**
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.beegood",
         "versionCode": 1
       }
     }
   }
   ```

2. **Build Production App**
   ```bash
   expo build:android --release-channel production
   ```

3. **Submit to Play Store**
   ```bash
   expo submit:android
   ```

## 🔒 Step 7: Security & Monitoring

### 7.1 Enable RLS Policies

Verify all tables have proper RLS policies:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify policies exist
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### 7.2 Set Up Monitoring

1. **Supabase Dashboard**: Monitor database performance
2. **Stripe Dashboard**: Track payment metrics
3. **AdMob Dashboard**: Monitor ad performance
4. **Custom Metrics**: Track HP usage and charity impact

### 7.3 Set Up Alerts

```bash
# Set up alerts for critical functions
# Monitor function execution times
# Alert on payment failures
# Track charity payout amounts
```

## 🧪 Step 8: Testing Production

### 8.1 Test Edge Functions

```bash
# Test HP refresh
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/hp-refresh \
  -H "Authorization: Bearer REAL_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idempotency_key":"prod_test_1","device_id":"prod_device_1"}'

# Test rewarded ad callback
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/ads-reward-callback \
  -H "Authorization: Bearer REAL_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"server_verification_id":"reward_prod_1","device_id":"prod_device_1","ad_network":"admob"}'
```

### 8.2 Test Stripe Integration

1. Use Stripe test cards in production
2. Verify webhook delivery
3. Test subscription lifecycle
4. Verify payment recording

### 8.3 Test AdMob Integration

1. Use test ad unit IDs initially
2. Verify rewarded video completion
3. Test HP awarding
4. Monitor ad revenue logging

## 📊 Step 9: Analytics & Reporting

### 9.1 Set Up Analytics

```bash
# Install analytics packages
npm install @supabase/supabase-js
npm install expo-analytics

# Configure tracking events
# - HP transactions
# - Premium subscriptions
# - Ad views
# - Charity payouts
```

### 9.2 Create Dashboards

1. **User Metrics**: Daily active users, HP usage
2. **Revenue Metrics**: Subscription revenue, IAP revenue
3. **Charity Metrics**: Monthly donations, impact tracking
4. **Performance Metrics**: App performance, function response times

## 🚨 Step 10: Go Live Checklist

- [ ] Supabase production project configured
- [ ] Edge functions deployed and tested
- [ ] Stripe webhooks configured
- [ ] AdMob production ads configured
- [ ] Cron jobs scheduled
- [ ] iOS app submitted to App Store
- [ ] Android app submitted to Play Store
- [ ] Production environment variables set
- [ ] Security policies verified
- [ ] Monitoring and alerts configured
- [ ] Analytics tracking enabled
- [ ] Charity reporting system active

## 🔄 Maintenance

### Monthly Tasks

1. **Charity Payouts**: Verify automatic calculations
2. **Revenue Reports**: Review monthly performance
3. **Security Updates**: Update dependencies
4. **Performance Review**: Monitor app metrics

### Quarterly Tasks

1. **Business Review**: Analyze revenue and user growth
2. **Charity Impact**: Report on donations made
3. **Feature Updates**: Plan new features
4. **Security Audit**: Review access controls

## 🆘 Troubleshooting

### Common Issues

1. **Edge Functions Not Working**
   - Check function deployment status
   - Verify environment variables
   - Check function logs

2. **Stripe Webhooks Failing**
   - Verify webhook endpoint URL
   - Check webhook secret
   - Monitor webhook delivery

3. **AdMob Not Loading**
   - Verify ad unit IDs
   - Check app ID configuration
   - Test with test ad units

4. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Monitor database performance

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [AdMob Documentation](https://developers.google.com/admob)
- [Expo Documentation](https://docs.expo.dev)

---

**Remember**: Always test thoroughly in staging before going to production. Monitor closely after deployment and be ready to rollback if issues arise.
