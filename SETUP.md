# Bee Good App - Nastavenie

## Krok 1: Supabase Projekt

1. Choď na [supabase.com](https://supabase.com) a prihlás sa
2. Vytvor nový projekt
3. Počkaj, kým sa projekt vytvorí
4. V nastaveniach projektu nájdi:
   - **Project URL** (napr. `https://your-project.supabase.co`)
   - **anon public** key (začína s `eyJ...`)

## Krok 2: Databáza

1. V Supabase dashboard choď do **SQL Editor**
2. Skopíruj obsah súboru `database-setup.sql`
3. Spusti SQL skript - vytvorí všetky potrebné tabuľky a politiky

## Krok 3: Environment Premenné

1. V koreňovom adresári projektu vytvor súbor `.env`:
   ```bash
   touch .env
   ```

2. Pridaj do `.env` súboru:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Nahraď `your-project` a `your_anon_key_here` skutočnými hodnotami z Supabase

## Krok 4: Spustenie Aplikácie

1. Inštaluj závislosti:
   ```bash
   npm install
   ```

2. Spusti aplikáciu:
   ```bash
   npm start
   ```

3. Naskenuj QR kód v Expo Go aplikácii alebo stlač `i` pre iOS simulator / `a` pre Android emulator

## Krok 5: Testovanie

1. Aplikácia by sa mala spustiť s 3 kartami:
   - 🐝 Dobré skutky
   - 🙏 Vďačnosť  
   - ✨ Želania

2. Skús pridať nový záznam pomocou tlačidla `+`

## Riešenie problémov

### Chyba: "Invalid API key"
- Skontroluj, či máš správny anon key v `.env` súbore
- Uisti sa, že súbor `.env` je v koreňovom adresári projektu

### Chyba: "Table does not exist"
- Spusti SQL skripty v Supabase SQL Editor
- Skontroluj, či sú všetky tabuľky vytvorené

### Aplikácia sa nespúšťa
- Skontroluj, či sú všetky závislosti nainštalované: `npm install`
- Skús vymazať cache: `npx expo start --clear`

## Ďalšie kroky

Po úspešnom nastavení môžeš:
- Pridať autentifikáciu používateľov
- Implementovať notifikácie
- Pridať štatistiky a grafy
- Rozšíriť funkcionalitu podľa potreby 