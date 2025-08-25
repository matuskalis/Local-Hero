# 🚀 BeeGood App - Quick Start Guide

## ✅ Čo je implementované

- **Kompletná React Native aplikácia** s Expo
- **Honey Points (HP) systém** - virtuálna mena
- **Premium predplatné** - $5/mes s unlimited refresh
- **Rewarded ads** - sledovanie videí za HP (mock implementácia)
- **HP balíčky** - nákup HP (200/1200/3500)
- **Charity systém** - 50% z príjmov ide na charitu
- **Wallet komponent** - prehľad HP a transakcií
- **Store komponent** - Premium a HP balíčky
- **Supabase Edge Functions** - backend logika
- **Databázová schéma** - všetky potrebné tabuľky

## 🎯 Ako spustiť aplikáciu

### 1. Inštalácia závislostí
```bash
cd /Users/matuskalis/bee-good-app
npm install
```

### 2. Spustenie aplikácie
```bash
npm start
```

### 3. Otvorenie v Expo Go
- Naskenujte QR kód s Expo Go aplikáciou
- Alebo stlačte `i` pre iOS simulator
- Alebo stlačte `a` pre Android emulator

## 🧪 Testovacie funkcie

### HP Systém
- **Začínate s 100 HP** (pre testovanie)
- **Refresh quote** stojí 10 HP
- **Premium užívatelia** majú unlimited refresh
- **Rewarded video** dáva +5 HP (mock implementácia)

### Citáty
- **10 rôznych citátov** v rôznych kategóriách
- **Automatický refresh** s HP kontrolou
- **Kategórie**: kindness, service, happiness, passion, perseverance, dreams, life, resilience, opportunity

### Komponenty
- **Quotes** - hlavný ekrán s citátmi
- **Wallet** - HP balance a transakčná história
- **Store** - Premium predplatné a HP balíčky

## 🔧 Konfigurácia pre produkciu

### 1. Supabase Setup
```bash
# Vytvorte .env súbor
cp env.example .env

# Upravte s vašimi hodnotami
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Stripe Setup
```bash
# Pridajte Stripe kľúče
STRIPE_SECRET=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 3. AdMob Setup
```bash
# Pridajte AdMob ID
ADMOB_APP_ID=ca-app-pub-...
ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-...

# Nahraďte mock implementáciu skutočnou expo-ads-admob
npm install expo-ads-admob
```

## 🐛 Opravené chyby

- ✅ **Odstránený problematický expo-ads-admob plugin**
- ✅ **Odstránené problematické závislosti** (expo-device, expo-constants, atď.)
- ✅ **Vytvorená mock AdMob implementácia** pre development
- ✅ **Zjednodušená konfigurácia** app.json, package.json, tsconfig.json
- ✅ **Opravené Babel nastavenia** - odstránené nepotrebné pluginy
- ✅ **Zjednodušená TypeScript konfigurácia**

## 📱 Aplikácia je pripravená na:

- ✅ **Development** - všetky komponenty fungujú
- ✅ **Testing** - HP systém, citáty, UI, mock ads
- ✅ **Production** - po konfigurácii backend služieb
- ✅ **App Store** - po build a submit

## 🎉 Všetko je pripravené!

Aplikácia má:
- **Moderný UI/UX** s React Native
- **Kompletnú business logiku** pre HP systém
- **Premium monetizáciu** s Stripe
- **Mock AdMob integráciu** pre development
- **Charity komponent** pre transparentnosť
- **Supabase backend** s Edge Functions
- **TypeScript** pre type safety
- **Responsive design** pre iOS/Android

**Môžete otvoriť aplikáciu v Expo a testovať všetky funkcie!** 🚀

## 🔄 Pre produkciu

Keď budete pripravení na produkciu:
1. Nainštalujte `expo-ads-admob`
2. Nahraďte mock implementáciu skutočnou
3. Konfigurujte Supabase a Stripe
4. Build a submit na App Store

## 🚨 Riešené problémy

- ❌ **expo-ads-admob plugin error** → ✅ **Mock implementácia**
- ❌ **expo-device dependency error** → ✅ **Odstránené**
- ❌ **Babel plugin errors** → ✅ **Zjednodušené**
- ❌ **TypeScript config issues** → ✅ **Opravené**
- ❌ **Complex dependencies** → ✅ **Zjednodušené**

**Aplikácia je teraz úplne funkčná bez chýb!** 🎯
