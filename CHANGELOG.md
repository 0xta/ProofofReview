# Changelog — TasteChain BKK

All notable changes to the TasteChain BKK project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Repository:** [https://github.com/0xta/ProofofReview](https://github.com/0xta/ProofofReview)  
> **Network:** Avalanche C-Chain — Fuji Testnet (Chain ID: 43113)  
> **Database:** PostgreSQL 17 (`tastechain` @ port 5432)

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
