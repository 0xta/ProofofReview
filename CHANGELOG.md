# Changelog — TasteChain BKK

All notable changes to the TasteChain BKK project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Repository:** [https://github.com/0xta/ProofofReview](https://github.com/0xta/ProofofReview)  
> **Network:** Avalanche C-Chain — Fuji Testnet (Chain ID: 43113)  
> **Database:** PostgreSQL 17 (`tastechain` @ port 5432)

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
  - Detailed side-by-side explanation of 2-Option Proof-of-Review (Slip OCR vs Shop QR + Voice AI).
  - Interactive 3 User Role flow switcher (`Customer`, `Restaurant Owner`, `Admin Governance`).
  - Live Bangkok Venue Explorer with instant search and category filters.
- Dedicated `/judge` Evaluation Hub (`src/app/judge/page.tsx`) with 1-click dual burner faucet interface (0.1 AVAX + 10,000 $TASTE), 4-stage guided testing checklist, and smart contract specifications.
- Official 5 Platform Sponsors Showcase in `src/components/Footer.tsx`:
  - **U-Topia**: Web3 Entertainment, Gamification & Real-world Asset (RWA) Ecosystem
  - **ElevenLabs**: Generative AI Voice Synthesizer (3 Thai voices per store)
  - **Avalanche C-Chain**: High-throughput blockchain for Smart Contracts, Escrow & Micro-rewards
  - **U-Bot**: Automated Web3 Trading & Social Community Intelligence Bot
  - **Tokenomist**: Dynamic Tokenomics Architecture, 80/20 Burn Mechanism & Mining Emission
- Preview shells for Customer Hub (`/customer`), Merchant Hub (`/owner`), and Admin Console (`/admin`).
- Automated test suite `tests/phase1-places.test.ts` (13 tests passed: database connectivity, schema tables, places query, search filter, place by ID, platform stats).

---


## [v0.0.1-init] - 2026-10-16

### Added
- Initialized Git repository targeting `https://github.com/0xta/ProofofReview`.
- Created Product Requirements Document [`TastechainPRD.md`](./TastechainPRD.md) v3.2.
- Created Phased Implementation & Verification Plan [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) v3.2.
- Established Changelog tracking [`CHANGELOG.md`](./CHANGELOG.md).
