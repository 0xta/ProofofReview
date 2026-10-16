# 🍲 TasteChain BKK — Hackathon Submission Draft
### U-Hackathon @ Flow Summit Bangkok 2026 (24-Hour Hackathon)

> **Repository:** [https://github.com/0xta/ProofofReview](https://github.com/0xta/ProofofReview)  
> **Network:** Avalanche C-Chain — Fuji Testnet (Chain ID: `43113`)  
> **Target Track:** Web3 Consumer Apps / AI Agents / DePIN Gastronomy

---

## 📌 Project Title & Tagline
- **Project Name:** TasteChain BKK
- **Tagline:** The AI-Powered & Trustless Gastronomy Protocol on Avalanche C-Chain — Turning Bangkok's 43,000+ Eateries into a Decentralized Dining Economy.

---

## 💡 Inspiration (แรงบันดาลใจ)
Bangkok is undeniably the street food and culinary capital of the world, home to over **43,000 vibrant eateries**—from Michelin Bib Gourmand street woks on Ban That Thong to hidden alleyway noodle carts. Yet, the current Web2 gastronomy ecosystem is deeply broken for both diners and vendors:

1. **Rampant Fake & Sybil Reviews:** Unverified online reviews, paid influencers, and bot farms mislead food lovers and severely harm honest mom-and-pop eateries.
2. **Predatory Web2 Platform Extraction:** Centralized food delivery and discovery aggregators extract **25% to 35% gross commission (GP) margins** from small merchants, while contributing zero ownership, token rewards, or governance rights back to the diners who generate the content.

We asked ourselves: **What if dining at your favorite Bangkok restaurant could generate cryptographic, trustless proof of real consumption—rewarding genuine diners with deflationary tokens while giving local vendors an AI-powered customer engagement tool with zero middlemen?**

That vision is **TasteChain BKK**.

---

## ⚙️ What it does (ฟังก์ชันการทำงานหลัก)

TasteChain BKK transforms Bangkok's dining experience into a verifiable, rewarding, and gamified protocol:

### 1. 2-Option Proof-of-Review Engine
Diners can verify their in-restaurant dining experience via two frictionless options:
- **Option 1 (Dining Receipt Slip OCR & SHA-256 Anti-Replay):**
  - Diners upload their dining receipt slip and a food photo.
  - **u.bot AI Vision** extracts the venue name, bill amount in THB, and receipt reference.
  - Generates a deterministic hash `0x` + `sha256(place_id:slip_ref:amount_thb)` permanently stored on-chain.
  - **Strict Anti-Replay Protection:** Re-submitting the same receipt slip is cryptographically rejected.
  - Awards **10.0 base $TASTE tokens** + merchant-funded native AVAX visit bounties.
- **Option 2 (Dynamic Shop QR Stand & Thai Voice AI):**
  - Diners scan the merchant's physical counter QR stand with a **cryptographic daily rotating nonce**.
  - **Haversine GPS Verification:** Enforces that the diner is physically present within $\le 100\text{m}$ of the venue.
  - Triggers an instant in-browser playback of the venue's personalized **ElevenLabs Thai Voice Greeting**.
  - Awards **5.0 base $TASTE tokens**.

### 2. Pioneer 2x Multiplier & Gastronomy Royalties
To bootstrap discovery across Bangkok's 43,649 venues, the first 3 verified reviewers of any venue automatically receive **Pioneer Status (Slots 1, 2, or 3)**, granting a **2x Token Multiplier** (20 $TASTE) and perpetual on-chain bragging rights.

### 3. Asynchronous Reward Accumulator & 1-Click Web3 Claim
Review points and bounties accumulate gas-efficiently in an off-chain PostgreSQL ledger. Diners can batch-claim their accumulated $TASTE and AVAX to their Web3 burner wallet or MetaMask in a **single 1-Click transaction**.

### 4. Tokenomist 80/20 Deflationary Voucher Marketplace
Merchants create dining discount vouchers (e.g. Free Crispy Pork, 50% Off Wontons) redeemable with $TASTE tokens:
- **80% of tokens are permanently burned from circulating supply**, creating sustainable deflationary tokenomics.
- **20% of tokens are remitted to the merchant**, aligning financial incentives without fiat gateway fees.

### 5. Merchant Hub & Legal DBD KYC Verification
- Restaurant owners claim their venues by submitting **Department of Business Development (DBD)** corporate registration, national ID cards, and storefront photos.
- Admins review and approve claims in the **Admin Governance Console (`/admin`)** with a document inspection modal and immutable audit trails (`admin_activity_logs`).
- Approved merchants customize **3 Thai voice personas** via ElevenLabs and print high-resolution acrylic counter QR stands.

### 6. 1-Click Judge Demo Mode & Dual Faucet
Hackathon judges can click **"1-Click Judge Demo"** in the navigation bar to immediately instantiate an in-memory burner wallet pre-funded with **0.10 Fuji AVAX** and **10,000 $TASTE** via `/api/judge/faucet`, enabling full protocol evaluation in seconds.

---

## 🛠️ How we built it (สถาปัตยกรรมและเทคโนโลยี)

### 🤝 5 Official Hackathon Sponsor Integrations
| Sponsor | Role & Technical Implementation |
|---|---|
| **U-Topia** | Powers seamless Web3 wallet accessibility, digital asset management, and cross-chain ready burner wallet integration for non-crypto diners. |
| **ElevenLabs** | Multilingual Voice AI synthesis engine (`eleven_multilingual_v2`) creating 3 specialized Thai vocal personas (Warm & Welcoming, Energetic Casual, Luxury Chef) dynamically greeting diners at checkout. |
| **Avalanche C-Chain** | Sub-second finality execution layer on **Fuji Testnet (Chain ID: 43113)** hosting 5 custom Solidity smart contracts (`TasteToken`, `ProofOfReview`, `MerchantEscrow`, `MerchantPromotions`, `DailyEpochRewards`). |
| **u.bot** | Autonomous AI assistant used for generating TasteChain BKK branding/logos, conceptual slide graphics, and synthesizing the 10-minute hackathon pitch script and presentation content. |
| **Tokenomist** | Sustainable tokenomics advisory powering our **80/20 Deflationary Voucher Model**: 80% of $TASTE tokens redeemed for merchant vouchers are permanently burned from supply. |

### 💻 Tech Stack
- **Frontend & Routing:** Next.js 14 App Router, TypeScript, Tailwind CSS, DaisyUI (3 visual themes: White ☀️, Warm 🥐, Dark 🌙).
- **Web3 & Blockchain:** Hardhat, ethers.js v6, Avalanche Fuji C-Chain (43113).
- **Backend & Database:** Node.js, Next.js Route Handlers, PostgreSQL 17 (indexing **43,649 Bangkok eateries** with coordinates, ratings, and categories).
- **Voice & Media:** ElevenLabs API with dual caching and HTML5 Web Audio synthesizer.
- **Computer Vision & Math:** Multi-modal OCR heuristics, Haversine GPS distance formula, Blockhash & cryptographic HMAC nonces.

---

## 🧗 Challenges we ran into (อุปสรรคและความท้าทาย)

1. **Receipt OCR Accuracy & Fraud Prevention:** Thai restaurant receipt slips vary widely—from handwritten thermal slips to formal tax invoices. We solved this by creating a robust normalization pipeline combining multi-modal computer vision heuristics with deterministic `sha256(place:ref:amount)` hashing and perceptual image fingerprinting (`pHash`) to prevent diners from reusing the same slip or photo.
2. **PostgreSQL Concurrency with Row-Level Locking:** During high-concurrency voucher redemptions and batch claims, applying `FOR UPDATE` on tables with outer joins caused query lock conflicts. We resolved this by explicitly targeting `FOR UPDATE OF <alias>` on the primary mutable tables.
3. **Fuji C-Chain Testnet Onboarding Friction:** Hackathon judges typically have limited time and lack Fuji AVAX testnet gas tokens. We engineered an in-memory burner wallet system with a server-side dual faucet (`/api/judge/faucet`) dispensing 0.1 AVAX and 10,000 $TASTE in $< 2$ seconds directly from the top navigation bar.

---

## 🏆 Accomplishments that we're proud of (ความสำเร็จที่ภาคภูมิใจ)

- **121 / 121 Passing Automated Tests (100% Pass Rate):** Complete unit, integration, and end-to-end test coverage across 5 smart contracts and 6 full protocol phases.
- **Production-Scale Dataset:** Real-time search, filtering, and geofencing across **43,649 Bangkok gastronomic venues** with sub-300ms query latency.
- **Zero-Middleman 80/20 Deflation:** Implemented Tokenomist's sustainable tokenomic burn model where redeeming merchant food discounts permanently burns 80% of tokens from supply.
- **Localized Cultural Audio Experience:** Integrated ElevenLabs Thai Voice AI that dynamically addresses Bangkok diners with natural Thai intonations and venue names upon check-in.
- **True Pair-Programming Velocity:** Completed 6 full phases—from Solidity smart contracts to admin governance and multi-theme frontend—in under 24 hours.

---

## 📚 What we learned (บทเรียนที่ได้รับ)

- **DePIN for Gastronomy is Real:** Physical restaurant check-ins combined with cryptographic nonces and Haversine GPS proximity create an unforgeable link between the physical dining world and on-chain decentralized incentives.
- **Frictionless Web3 UX is Paramount:** Mainstream diners won't wait for blockchain confirmations while paying for food. Asynchronous reward accumulation in a verified database ledger, paired with 1-click batch on-chain settlement, provides the ideal balance between Web2 speed and Web3 decentralization.

---

## 🚀 What's next for TasteChain BKK (แผนงานในอนาคต)

1. **U-Topia Super-App Direct Payment Integration (เชื่อมต่อแอป U-Topia เพื่อใช้จ่ายกับร้านค้าจริง):**
   - Deeply integrate with **U-Topia's all-in-one wallet and payment rails**, enabling diners to directly spend their accumulated $TASTE tokens, stablecoins, and digital assets at the counters of all 43,649 Bangkok partner eateries.
   - Leverage U-Topia's cross-chain liquidity and payment infrastructure so international food tourists visiting Bangkok can pay for street food and fine dining using any crypto asset (ETH, SOL, BTC, AVAX) with instant settlement and automated Tokenomist 80/20 token burns.
2. **Avalanche Subnet / L1 Migration:** Launch a dedicated **TasteChain Subnet** on Avalanche with custom gas tokens sponsored by merchant advertising pools.
3. **LINE Mini-App Integration:** Embed the diner experience directly into LINE (Thailand's primary messaging app with 54M users) for frictionless adoption among local Bangkokians.
4. **POS Terminal & PromptPay Integration:** Partner with Thai POS terminal providers (Wongnai POS, Ocha) for automatic cryptographic slip generation directly from cash registers.
5. **City Expansion:** Expand beyond Bangkok to major gastronomic tourism hubs across Southeast Asia (Chiang Mai, Phuket, Singapore, Tokyo).
