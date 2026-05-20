# ENTERPRISE DATABASE SCHEMA & ARCHITECTURE
*Standard: Supabase (PostgreSQL) for Relational Master, Firebase (Firestore) for Real-Time Queues*

## I. CORE ENGINEERING PRINCIPLES (THE HARVARD/AWS STANDARD)

1. **Strict 3NF Normalization:** Zero data duplication. User data is separated from Auth data. AI metadata is separated from the core Setoran submission. Mosque details are centralized in one table. If a mosque changes its name, it updates universally.
2. **UUIDv4 as Primary Keys:** Auto-incrementing integers (`1, 2, 3`) are **BANNED** for business logic tables to prevent ID-guessing (Insecure Direct Object Reference) and to allow conflict-free Global Multi-Region Data Synchronization.
3. **UTC Timezone Awareness:** All datetime columns use `TIMESTAMP WITH TIME ZONE (TIMESTAMPTZ)` strictly stored in **UTC**. The Frontend (Next.js) will convert this UTC time to the user's local time dynamically. A user in London posting at 13:00 UTC will show as 20:00 WIB in Jakarta automatically.
4. **ACID Transaction Enforcement:** Database operations for `transactions` (Sedekah), `wallets`, and `matchmaking` use strict DB locks (`SELECT FOR UPDATE`). If an error occurs mid-transaction, the entire operation is Rolled Back (Atomicity).

---

## II. RELATIONAL SCHEMA (Supabase / PostgreSQL)

### A. AUTHENTICATION & PROFILES (Normalized)
**Table: users (Auth Core)**
- `id`: UUID (PK)
- `email`: String (Unique)
- `password_hash`: String
- `account_role`: Enum (USER, USTADZ, DKM)
- `created_at`: TIMESTAMPTZ (UTC)

**Table: user_profiles (Separated to reduce JOIN weight on Auth)**
- `user_id`: UUID (PK, FK -> users.id)
- `display_name`: String
- `locale`: String (e.g., 'id-ID', 'ar-SA')
- `timezone`: String (e.g., 'Asia/Jakarta')
- `tajwid_score`: Float
- `streak_days`: Int
- `updated_at`: TIMESTAMPTZ (UTC)

### B. QURANIC ARCHITECTURE (Static Truth - Uses Integer IDs)
*Note: We use Integers here because the Quran is static and universal (6,236 Ayahs). UUIDs are unnecessary overhead for static reference data.*
**Table: quran_ayahs**
- `id`: Int (PK, 1-6236)
- `surah_id`: Int
- `ayah_number_in_surah`: Int
- `juz_number`: Int
- `hizb_number`: Int
- `rubu_el_hizb_number` (Maqra'): Int
- `ruku_number`: Int
- `page_number`: Int
- `manzil_number`: Int

### C. HYBRID SETORAN ENGINE
**Table: setoran_submissions**
- `id`: UUID (PK)
- `murid_id`: UUID (FK -> users.id)
- `ustadz_id`: UUID (FK -> users.id)
- `start_ayah_id`: Int (FK -> quran_ayahs.id)
- `end_ayah_id`: Int (FK -> quran_ayahs.id)
- `audio_url`: String (CDN Path)
- `status`: Enum (PENDING_AI, PENDING_USTADZ, REVISION, ACCEPTED)
- `created_at`: TIMESTAMPTZ (UTC)

**Table: setoran_ai_analysis (Normalized to keep submissions lightweight)**
- `submission_id`: UUID (PK, FK -> setoran_submissions.id)
- `waveform_metadata`: JSONB (Stores milliseconds timestamps of detected errors)
- `ai_confidence_score`: Float
- `processed_at`: TIMESTAMPTZ (UTC)

### D. SOCIAL & MOSQUE ECOSYSTEM
**Table: mosques**
- `id`: UUID (PK)
- `dkm_user_id`: UUID (FK -> users.id)
- `name`: String
- `location`: Geometry (Point, SRID=4326)
- `created_at`: TIMESTAMPTZ (UTC)

**Table: worship_activities (The "Strava" Feed)**
- `id`: UUID (PK)
- `user_id`: UUID (FK -> users.id)
- `activity_type`: Enum (TILAWAH, JAMA'AH)
- `metric_value`: Int (e.g., duration in seconds or pages read)
- `created_at`: TIMESTAMPTZ (UTC)

### E. FINANCIAL (ACID COMPLIANCE SHOWCASE)
**Table: wallets**
- `id`: UUID (PK)
- `owner_id`: UUID (FK -> users.id or mosques.id)
- `balance`: Decimal(15,2)
- `updated_at`: TIMESTAMPTZ (UTC)

**Table: transactions (Sedekah/Infaq)**
- `id`: UUID (PK)
- `sender_wallet_id`: UUID (FK -> wallets.id)
- `receiver_wallet_id`: UUID (FK -> wallets.id)
- `amount`: Decimal(15,2)
- `status`: Enum (PENDING, SUCCESS, FAILED)
- `created_at`: TIMESTAMPTZ (UTC)

---

## III. NoSQL / REAL-TIME (Firebase Firestore)
*For ephemeral, extremely high-speed data where relational strictness is not needed.*

**Collection: matchmaking_pool (Global Sparing)**
- `user_id`: String (UUID)
- `target_type`: Enum (JUZ, HIZB)
- `target_value`: Int
- `expires_at`: Timestamp (UTC, Firestore TTL deletes document automatically after 2 minutes to clear dead queues).