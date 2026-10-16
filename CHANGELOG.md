# Changelog — TasteChain BKK

All notable changes to the TasteChain BKK project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Repository:** [https://github.com/0xta/ProofofReview](https://github.com/0xta/ProofofReview)  
> **Network:** Avalanche C-Chain — Fuji Testnet (Chain ID: 43113)  
> **Database:** PostgreSQL 17 (`tastechain` @ port 5432)

## [v1.0.0-phase6] - 2026-10-16

### Added
- **1-Click Judge Dual Faucet Engine (`POST /api/judge/faucet`)**:
  - Ephemeral burner wallet airdrop providing **0.10 Fuji AVAX** (gas fees) and **10,000 $TASTE** (platform tokens) in $< 3$ seconds without requiring external faucet imports.
  - Generates verifiable Avalanche Fuji transaction hashes with direct Snowtrace block explorer links (`https://testnet.snowtrace.io/tx/...`).
  - Records faucet disbursement in database accumulator (`customer_claimable_rewards`) with status `CLAIMED` and logs governance audit trail in `admin_activity_logs`.
- **Curated Bangkok Gastronomy Destinations (`src/data/seed-venues.ts`)**:
  - Pre-seeded landmark Bangkok eateries tailored for instant evaluation:
    1. **Jeh O Chula (เจ๊โอว ข้าวต้มเป็ด บรรทัดทอง)**: Option 1 Receipt Slip OCR ($850$ THB bill) and Pioneer 2x Multiplier.
    2. **Pad Thai Fai Ta Lu (ผัดไทยไฟทะลุ ถนนดินสอ)**: Option 2 Shop QR Stand and ElevenLabs Thai Voice AI playback (Slot 2 Energetic Casual).
    3. **Thong Smith (ทองสมิทธ์ ก๋วยเตี๋ยวเรือ สยามพารากอน)**: Tokenomist 80/20 Deflationary Voucher Model (80% burned, 20% to merchant).
- **Interactive Role Quick-Switcher (`src/components/RoleSwitcher.tsx`)**:
  - Top navigation bar component providing instantaneous 1-click toggling between **Diner Customer**, **Merchant Hub**, **Protocol Admin**, and **1-Click Judge** views.
- **1-Click Live Protocol Simulator (`src/app/judge/page.tsx`)**:
  - In-browser interactive 5-stage simulation demonstrating end-to-end state transitions (Receipt OCR $\rightarrow$ Pioneer 2x Bonus $\rightarrow$ Admin Daily Epoch Settle $\rightarrow$ Web3 Batch Claim $\rightarrow$ 80/20 Voucher Burn) with live progress steps and toast feedback.
- **Phase 6 Automated Verification Suite (`tests/phase6-e2e-demo.test.ts`)**:
  - Comprehensive end-to-end journey test passing all 25 automated verification checks.
  - Overall protocol test suite now reaches **118 passing tests** (12 Contracts + 13 Phase 1 + 19 Phase 3 + 26 Phase 4 + 23 Phase 5 + 25 Phase 6) with 0 failures.

---

## [v0.5.0-phase5] - 2026-10-16

### Added
- **Admin Governance & Protocol Telemetry Portal (`/admin`)**:
  - Live protocol metrics dashboard tracking 43,649 Bangkok gastronomic venues, verified reviews, AVAX merchant bounties, active promotions, and daily epoch emission status.
  - Direct navigation link added to global Navigation Bar.
- **Merchant Legal DBD KYC Verification Queue**:
  - Administrative review interface (`src/app/admin/page.tsx` & `src/lib/services/admin.ts`) processing merchant claims on Bangkok venues.
  - Validates Department of Business Development (DBD) corporate registration numbers, owner legal names, contact numbers, and attached KYC verification assets.
  - Integrated Document Preview Modal providing high-resolution inspection of Thai National ID cards, storefront banners, and business certificates.
  - 1-Click **Approve** workflow: Atomically updates verification status to `APPROVED`, maps owner wallet to `place_owners`, and logs admin governance record.
  - 1-Click **Reject** workflow: Records formal rejection reasons and updates status to `REJECTED`.
  - Automatic demo seeding (`seedDemoKycApplications`) providing realistic Bangkok restaurant KYC submissions for hackathon evaluation.
- **1-Click Manual Daily Token Epoch Distribution (Hackathon PoC)**:
  - Protocol emission engine allocating the daily 10,000 $TASTE mining pool among active gastronomy contributors.
  - Interacts with `DailyEpochRewards.sol` contract and PostgreSQL ledger (`daily_token_epochs`, `user_epoch_shares`).
  - Asynchronously credits calculated mining shares to contributor balances in `customer_claimable_rewards`.
  - Enforces strict anti-double distribution per calendar date with status transitioned to `SETTLED`.
  - Generates verifiable Avalanche Fuji transaction hashes with direct Snowtrace block explorer links.
- **Immutable Governance Audit Logs**:
  - Tamper-evident administrative audit trail (`admin_activity_logs`) tracking all governance actions (`KYC_APPROVED`, `KYC_REJECTED`, `EPOCH_DISTRIBUTED`) with timestamp, admin wallet, target entity, and detailed execution metadata.
- **Phase 5 Automated Verification Suite**:
  - `tests/phase5-admin-governance.test.ts` passing all 23 automated verification tests.
  - Total protocol test suite now reaches **93 passing tests** (12 Contracts + 13 Phase 1 + 19 Phase 3 + 26 Phase 4 + 23 Phase 5).

---

## [v0.4.0-phase4] - 2026-10-16

### Added
- **2-Option Proof-of-Review Engine**:
  - **Option 1 (Dining Receipt Slip OCR & Anti-Replay)**:
    - AI-assisted receipt OCR parser (`src/lib/services/receipt-ocr.ts`) with OpenAI Vision integration and intelligent deterministic fallback.
    - Computes standardized SHA-256 slip hash `0x` + `sha256(place_id:slip_reference:amount_thb)`.
    - Strict anti-replay verification rejecting duplicate slip hashes already registered in `verified_reviews`.
    - Perceptual hash (`pHash`) food photo fingerprinting preventing duplicate image reuse.
    - Awards 10.0 base $TASTE (20.0 if Pioneer) + active AVAX visit bounties.
  - **Option 2 (Shop Counter QR & Voice AI)**:
    - Cryptographic daily nonce validation (`verifyDailyNonce`).
    - Haversine physical GPS proximity check (&le; 100m).
    - In-browser playback of venue's customized ElevenLabs Thai voice greeting upon submission.
    - Awards 5.0 base $TASTE (10.0 if Pioneer).
- **Pioneer 2x Multiplier & Royalty Rights**:
  - Automatically identifies whether a Bangkok venue has &lt; 3 reviews.
  - Grants Pioneer Slot 1, 2, or 3 with a **2x Token Multiplier** and logs claim in `pioneer_claims`.
- **Asynchronous Reward Accumulation & 1-Click Web3 Claim**:
  - Customer rewards service (`src/lib/services/rewards.ts`) accumulating review and check-in rewards in PostgreSQL `customer_claimable_rewards`.
  - 1-Click batch claim payout engine (`POST /api/rewards/claim`):
    - Settles pending $TASTE and AVAX balances to the customer's Web3 Burner Wallet.
    - Atomic status update to `CLAIMED` with transaction hash and Avalanche Fuji Snowtrace explorer link.
- **Tokenomist 80/20 Deflationary Voucher Redemption**:
  - Voucher service (`src/lib/services/promotions.ts`) allowing diners to redeem active merchant discount vouchers.
  - Enforces Tokenomist's deflationary economic model: **80% of $TASTE tokens are burned**, while **20% is transferred to the merchant**.
  - Generates unique customer redemption codes (e.g. `TC-XXXX-XXXX`) stored in `promotion_redemptions`.
- **Interactive Diner Customer Portal (`/customer`)**:
  - Complete multi-tab user interface (`src/app/customer/page.tsx`):
    - **Tab 1: Submit Proof-of-Review**: 43,649 venue search, Option 1 vs 2 switcher, GPS simulator, 1-click sample dish/receipt buttons, and reward celebration with audio playback.
    - **Tab 2: My Rewards & Claim**: Live pending $TASTE and AVAX balances, 1-click Web3 claim button, and itemized reward history ledger.
    - **Tab 3: Redeem Vouchers**: Active merchant discounts with real-time 80% burn calculations and redemption codes.
- **Phase 4 Automated Verification Suite**:
  - `tests/phase4-reviews-claim.test.ts` passing all 26 verification tests.

---

## [v0.3.0-phase3] - 2026-10-16

### Added
- **ElevenLabs Thai Voice AI Studio**:
  - Implemented 3 customizable vocal personas tailored for Bangkok eateries:
    - **Slot 1 (Warm & Welcoming - อบอุ่น ต้อนรับ)**: Gentle tone ideal for family restaurants and cozy cafes (`Rachel` voice persona).
    - **Slot 2 (Energetic & Casual - เป็นกันเอง สตรีทฟู้ด)**: Upbeat, friendly tone ideal for Bangkok street food stalls and quick bites (`Bella` voice persona).
    - **Slot 3 (Chef & Signature Luxury - เชฟแนะนำ หรูหรา)**: Refined, prestigious tone for bistros, cocktail bars, and fine dining (`Domi` voice persona).
  - Voice synthesis engine in `src/lib/services/elevenlabs.ts` supporting ElevenLabs Multilingual V2 API with automatic fallback mock generator creating valid WAV audio files.
  - Interactive Voice Studio UI in `src/components/VoiceStudio.tsx` allowing restaurant owners to test audio playback, customize promotional greetings with dynamic venue interpolation, and track play counters.
- **Dynamic Shop Counter QR Stand & Anti-Replay Nonce Engine**:
  - Daily rotating cryptographic nonce generator in `src/lib/services/shop-qr.ts` (`generateDailyNonce` / `verifyDailyNonce`) preventing QR capture replay attacks across days.
  - High-resolution SVG/PNG counter stand generator in `src/components/ShopQRStand.tsx` with printable layout, acrylic stand guide, live check-in simulator, and direct PNG download.
  - Haversine GPS proximity validator in `src/lib/utils/gps.ts` enforcing physical presence within $\le 100\text{m}$ radius of the Bangkok eatery.
- **In-Store Check-in Oracle & Reward Pipeline**:
  - API endpoint `POST /api/checkin/qr` handling diner scan payloads: verifies GPS coordinates ($\le 100\text{m}$), validates rotating daily nonce, records check-in record in DB, selects active voice greeting, increments play count, and credits $3.00$ claimable reward points in `customer_claimable_rewards`.
  - In-Store Diner Check-in Modal (`src/components/QRCheckinModal.tsx`) with HTML5 Audio synthesizer playback, reward notification, and GPS simulation controls.
  - Full-featured Merchant Portal in `src/app/owner/page.tsx` with instant Bangkok venue search/switcher, Voice AI Studio tab, QR Stand generator tab, and Owner KYC verification status.
- **Automated Verification Suite**:
  - Automated test suite `tests/phase3-voice-qr.test.ts` verifying all 19 Phase 3 functional requirements (Thai voice personas, DB persistence, ElevenLabs audio synthesis, cryptographic nonce, QR code generation, Haversine GPS calculations, check-in persistence).

---

## [v0.2.0-phase2] - 2026-10-16

### Added
- Hardhat development and deployment architecture configured for Avalanche Fuji C-Chain (Chain ID: 43113) and in-memory local testing.
- 5 Core Solidity smart contracts in `contracts/`:
  - `TasteToken.sol`: ERC-20 utility & reward token ($TASTE) with authorized minter role and burnable functionality.
  - `ProofOfReview.sol`: On-chain gastronomy review registry recording verification tiers (Option 1 Receipt Slip OCR vs Option 2 Shop QR), Pioneer 2x multiplier for first 3 reviewers per venue, and SHA-256 receipt slip anti-replay protection.
  - `MerchantEscrow.sol`: AVAX bounty escrow allowing restaurant owners to fund review incentives in native AVAX with relayer claim execution and merchant refund capabilities.
  - `MerchantPromotions.sol`: Token voucher redemption engine enforcing Tokenomist's 80/20 economic model (80% $TASTE burned deflationarily, 20% transferred to merchant).
  - `DailyEpochRewards.sol`: Daily 10,000 $TASTE mining emission contract featuring `manualDistributeEpoch` for Admin 1-Click Hackathon PoC distribution and asynchronous customer claim settlement (`distributeClaim`).
- Comprehensive Hardhat integration test suite in `test/contracts.test.js` covering 12 critical test scenarios (12 passed, 0 failed).
- Automated deployment and permission wiring script `scripts/deploy.js` deploying all 5 contracts, setting DailyEpochRewards as minter on TasteToken, deployer as recorder/relayer, and writing outputs to `src/data/contracts.json`.
- Frontend contract abstraction in `src/lib/contracts.ts` exporting addresses and ABIs for ethers v6 integration.
- Updated Judge testing hub (`/judge`) architecture reference table displaying all 5 deployed contracts.

---

## [v0.1.0-phase1] - 2026-10-16

### Added
- Scaffolding for Next.js 14 App Router project with TypeScript, Tailwind CSS, and DaisyUI (`dark` and `coffee` themes).
- PostgreSQL connection pool singleton in `src/lib/db.ts` connecting to `tastechain` database.
- Executed migration `scripts/migrations/001_phase1_tables.sql` creating 4 companion tables:
  - `owner_verifications`: KYC documents (DBD business registration, ID card, storefront photo, utility bills) with admin approval workflow.
  - `place_owners`: Mapping between Bangkok venues and verified merchant wallet addresses.
  - `admin_activity_logs`: Immutable audit trails for governance and KYC decisions.
  - `customer_claimable_rewards`: Asynchronous reward accumulation engine for daily epoch mining, pioneer bonuses, and visit bounties.
- Venue service layer `src/lib/services/places.ts` querying 43,649 Bangkok eateries with pagination, text search, category filtering, and real-time metric aggregations.
- Next.js API route handlers:
  - `GET /api/places`: Paginated venue directory with filters and search.
  - `GET /api/stats`: Real-time metrics counters for platform venues, reviews, escrow budgets, and emission.
- Responsive, English-First Home Page (`src/app/page.tsx`) featuring:
  - Hero banner with quick links to 1-Click Judge Demo, Venue Explorer, and Merchant Hub.
  - Live telemetry counters (43,649 Bangkok venues, 10,000 $TASTE daily mining emission).
  - Detailed side-by-side explanation of 2-Option Proof-of-Review (Dining Receipt Slip OCR vs Shop QR + Voice AI).
  - Interactive 3 User Role flow switcher (`Customer`, `Restaurant Owner`, `Admin Governance`).
  - Live Bangkok Venue Explorer with instant search and category filters.
- Dedicated `/judge` Evaluation Hub (`src/app/judge/page.tsx`) with 1-click dual burner faucet interface (0.1 AVAX + 10,000 $TASTE), 4-stage guided testing checklist, and smart contract specifications for **U-Hackathon @ Flow Summit Bangkok 2026**.
- Official 5 Platform Sponsors Showcase in `src/components/Footer.tsx`:
  - **U-Topia**: U-Topia is built around you, bringing together digital assets, payments, and cross-chain access into one seamless, all-in-one wallet.
  - **ElevenLabs**: Powers dynamic multilingual AI audio greetings and automated thank-you messages across 3 customizable merchant vocal personas.
  - **Avalanche C-Chain**: Sub-second finality blockchain infrastructure on Avalanche Fuji (43113) for Proof-of-Review contracts.
  - **u.bot**: AI assistant that can read your photos, draw images, build apps and write documents you can download.
  - **Tokenomist**: Tokenomist Free gives you access to the essential tools for exploring token unlocks and supply schedules, tracking upcoming unlock events, project pages, and tokenomics fundamentals.
- Preview shells for Customer Hub (`/customer`), Merchant Hub (`/owner`), and Admin Console (`/admin`).
- Automated test suite `tests/phase1-places.test.ts` (13 tests passed: database connectivity, schema tables, places query, search filter, place by ID, platform stats).

---


## [v0.0.1-init] - 2026-10-16

### Added
- Initialized Git repository targeting `https://github.com/0xta/ProofofReview`.
- Created Product Requirements Document [`TastechainPRD.md`](./TastechainPRD.md) v3.2.
- Created Phased Implementation & Verification Plan [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) v3.2.
- Established Changelog tracking [`CHANGELOG.md`](./CHANGELOG.md).
