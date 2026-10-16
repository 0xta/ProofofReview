# 🍲 TasteChain BKK — Official Pitch Deck Outline (3–4 Minutes)
### U-Hackathon @ Flow Summit Bangkok 2026

> **Project:** TasteChain BKK — The AI-Powered & Trustless Gastronomy Protocol on Avalanche C-Chain  
> **Pitch Duration:** 3:30 Minutes (Recommended: 8–9 Slides)  
> **Target Audience:** Hackathon Judges, Web3 Investors, Sponsor Representatives (Avalanche, ElevenLabs, U-Topia, u.bot, Tokenomist)

---

## ⏱️ Pitch Timeline & Slide Architecture

| Slide # | Slide Title | Core Message | Timing |
|:---:|---|---|:---:|
| **1** | Title & Hook | Bangkok Gastronomy Meets Trustless DePIN | 0:00 – 0:25 (25s) |
| **2** | The Problem | 30% Web2 Platform Extraction & Fake Reviews | 0:25 – 0:50 (25s) |
| **3** | The Solution | TasteChain BKK: 2-Option Proof-of-Review | 0:50 – 1:20 (30s) |
| **4** | 5 Sponsor Integrations | Full-Stack Synergy: Avalanche, ElevenLabs, U-Topia, u.bot, Tokenomist | 1:20 – 1:55 (35s) |
| **5** | Sustainable Tokenomics | Tokenomist 80/20 Deflationary Burn & Pioneer 2x Multiplier | 1:55 – 2:25 (30s) |
| **6** | Live Architecture & Proof | 43,649 Real Eateries, 5 Smart Contracts, 121 Passing Tests | 2:25 – 2:55 (30s) |
| **7** | Roadmap: U-Topia Payments | From Review Rewards to In-Store Spending Super-App | 2:55 – 3:20 (25s) |
| **8** | Team & Call to Action | Decentralizing Bangkok's Gastronomy Economy | 3:20 – 3:30 (10s) |

---

## 📑 Slide-by-Slide Detailed Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 1: Title & The Hook                                              │
├────────────────────────────────────────────────────────────────────────┤
│ Visual Layout:                                                         │
│ - High-impact banner of Bangkok night street food (Ban That Thong)     │
│ - TasteChain BKK logo with Avalanche C-Chain badge                     │
│ - Subtitle: "The AI-Powered & Trustless Gastronomy Protocol"           │
│                                                                        │
│ Bullet Points:                                                         │
│ • 43,000+ Bangkok eateries indexed                                     │
│ • Proof-of-Dining via AI Vision & Dynamic Shop QR                      │
│ • Built for U-Hackathon @ Flow Summit Bangkok 2026                     │
│                                                                        │
│ 🎙️ Speaker Script (บทพูดภาษาไทย - 25 วินาที):                         │
│ "สวัสดีครับกรรมการทุกท่าน กรุงเทพฯ คือเมืองหลวงแห่งสตรีทฟู้ดของโลก     │
│ มีร้านอาหารกว่า 43,000 ร้าน แต่ทุกคนที่เคยเปิดหาร้านกินคงเคยเจอปัญหา   │
│ เดียวกัน คือ 'รีวิวปลอม' ดารารับจ้างอวย และร้านค้าโดนแพลตฟอร์ม Web2     │
│ หักค่า GP โหดถึง 30% วันนี้เราขอเสนอ TasteChain BKK โปรโตคอล           │
│ การกินดื่มแบบ Trustless บน Avalanche C-Chain ที่เปลี่ยนทุกมื้ออาหาร     │
│ ให้กลายเป็นสินทรัพย์ดิจิทัลที่ตรวจสอบได้จริงครับ"                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 2: The Two Broken Truths of Web2 Dining                          │
├────────────────────────────────────────────────────────────────────────┤
│ Visual Layout:                                                         │
│ - Side-by-side comparison: [Diners vs Merchants]                       │
│ - Graphic of 30% commission scissors cutting vendor profits            │
│ - Bot farm / fake review illustration with zero trust score            │
│                                                                        │
│ Bullet Points:                                                         │
│ 1. Zero Trust: 40%+ of online reviews are sponsored, biased, or bots.  │
│ 2. Platform Extraction: Web2 platforms take 25–35% GP from small shops │
│ 3. Zero Diner Ownership: Diners create value but receive 0% upside.    │
│                                                                        │
│ 🎙️ Speaker Script (บทพูดภาษาไทย - 25 วินาที):                         │
│ "ระบบปัจจุบันล้มเหลวทั้งสองฝั่งครับ ฝั่งลูกค้าเสียความรู้สึกกับรีวิว    │
│ ปลอมที่สร้างขึ้นโดยบอทหรือหน้าม้า ขณะที่ฝั่งร้านค้าริมทางถูกแพลตฟอร์ม  │
│ ตัวกลางขูดรีดค่าคอมมิชชั่น 30% และผู้บริโภคที่คอยรีวิวสร้างคอนเทนต์    │
│ กลับไม่ได้อะไรตอบแทนเลย ไม่มี Ownership ไม่มีสิทธิประโยชน์ใดๆ ครับ"     │
└────────────────────────────────────────────────────────────────────────┘
```

---

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 3: The Solution — 2-Option Proof-of-Review                       │
├────────────────────────────────────────────────────────────────────────┤
│ Visual Layout:                                                         │
│ - Two interactive path cards:                                          │
│   [Option 1: Receipt Slip OCR] vs [Option 2: Shop QR Stand]            │
│ - Flow diagram showing Anti-Replay SHA-256 hash & Haversine GPS <= 100m│
│                                                                        │
│ Bullet Points:                                                         │
│ • Option 1 (Slip Proof): AI Receipt OCR + SHA-256 Anti-Replay + pHash  │
│   Awards 10 base $TASTE + Native AVAX merchant visit bounties.         │
│ • Option 2 (Shop QR Proof): Physical counter stand with daily nonce    │
│   + Geofenced GPS (<=100m) + Instant ElevenLabs Thai voice greeting.   │
│ • Pioneer 2x Multiplier: First 3 reviewers per venue get 2x rewards.   │
│                                                                        │
│ 🎙️ Speaker Script (บทพูดภาษาไทย - 30 วินาที):                         │
│ "TasteChain BKK แก้ปัญหานี้ด้วยระบบ 'Proof-of-Review' 2 รูปแบบ:        │
│ แบบที่ 1: สแกนใบเสร็จรับเงิน (Receipt Slip) ระบบ AI Vision จะสกัดยอด    │
│ เงินและสร้าง SHA-256 Hash บนเชน ป้องกันการนำสลิปเดิมมาใช้ซ้ำ 100%      │
│ แบบที่ 2: สแกนป้าย QR หน้าร้านที่เปลี่ยน Nonce ทุกวัน พร้อมตรวจสอบ GPS │
│ ในระยะ 100 เมตร และเปิดเสียงต้อนรับ AI ภาษาไทยจาก ElevenLabs ทันที    │
│ ยิ่งไปกว่านั้น 3 คนแรกที่รีวิวร้านใดๆ จะได้สิทธิ์ 'Pioneer 2x' รับ     │
│ เหรียญคูณสองทันทีครับ"                                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 4: Powered by 5 Official Hackathon Sponsors                      │
├────────────────────────────────────────────────────────────────────────┤
│ Visual Layout:                                                         │
│ - 5 Sponsor Logo Cards arranged in a clean pentagon or grid:          │
│   [Avalanche] [ElevenLabs] [U-Topia] [u.bot] [Tokenomist]              │
│ - Specific bullet points showing deep technical implementation         │
│                                                                        │
│ Bullet Points:                                                         │
│ • Avalanche C-Chain: 5 Solidity smart contracts on Fuji (43113) with   │
│   sub-second finality and micro-gas fees for diner rewards.            │
│ • ElevenLabs: 3 bespoke Thai vocal personas (Warm, Casual, Luxury)     │
│   greeting diners dynamically at in-store checkout.                    │
│ • U-Topia: All-in-one wallet and cross-chain payment rails.            │
│ • u.bot: Autonomous AI agent for receipt OCR and fraud detection.      │
│ • Tokenomist: Deflationary tokenomics advisory powering 80/20 burns.   │
│                                                                        │
│ 🎙️ Speaker Script (บทพูดภาษาไทย - 35 วินาที):                         │
│ "เราดึงจุดแข็งของ 5 สปอนเซอร์หลักมาใช้งานอย่างลึกซึ้ง:                │
│ เราใช้ Avalanche C-Chain รัน 5 Smart Contracts ค่าแก๊สถูก จบธุรกรรมไว  │
│ เราใช้ ElevenLabs สังเคราะห์เสียงต้อนรับภาษาไทย 3 บุคลิกเฉพาะร้าน      │
│ เราใช้ u.bot ช่วยสกัดข้อมูลใบเสร็จและตรวจสอบรูปอาหาร                   │
│ เราใช้โมเดลเศรษฐศาสตร์โทเค็นของ Tokenomist ในการเบิร์นเหรียญ           │
│ และเชื่อมต่อกับ U-Topia เพื่อรองรับกระเป๋าเงินและการใช้จ่ายในอนาคตครับ"│
└────────────────────────────────────────────────────────────────────────┘
```

---

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 5: Tokenomics & The Tokenomist 80/20 Deflationary Engine         │
├────────────────────────────────────────────────────────────────────────┤
│ Visual Layout:                                                         │
│ - Circular Token Flow Diagram:                                         │
│   Daily Mining Pool (10,000 $TASTE) -> Diners -> Redeem Vouchers       │
│   -> [ 80% BURNED FOREVER 🔥 ] + [ 20% to Merchant 🏪 ]               │
│                                                                        │
│ Bullet Points:                                                         │
│ • Fixed Daily Emission: 10,000 $TASTE distributed pro-rata to diners.  │
│ • Zero-Middleman Merchant Discounts: Diners redeem vouchers for food.  │
│ • Deflationary Flywheel: 80% of tokens used for vouchers are burned,   │
│   reducing circulating supply as protocol usage expands.               │
│                                                                        │
│ 🎙️ Speaker Script (บทพูดภาษาไทย - 30 วินาที):                         │
│ "เรื่องโทเค็นโนมิกส์ เราออกแบบร่วมกับแนวคิดของ Tokenomist:              │
│ เหรียญ $TASTE มีการแจกจ่ายแบบคงที่วันละ 10,000 โทเค็นตามส่วนแบ่งรีวิว  │
│ เมื่อลูกค้านำเหรียญไปแลกเวาเชอร์ส่วนลดอาหารจากร้านค้า เช่น เกี๊ยวซ่าฟรี│
│ เหรียญ 80% จะถูก Burn ทิ้งออกจากระบบถาวรทันที และอีก 20% โอนเข้าร้าน  │
│ ยิ่งคนกินเยอะ ยิ่งแลกเวาเชอร์เยอะ เหรียญในระบบยิ่งลดลง เกิดภาวะ        │
│ เงินฝืดที่สร้างมูลค่าอย่างยั่งยืนครับ"                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 6: Production Scale & 121 Passing Tests                          │
├────────────────────────────────────────────────────────────────────────┤
│ Visual Layout:                                                         │
│ - Big Metric Callouts: [43,649 Places] [5 Smart Contracts] [121 Tests] │
│ - Screenshots: /customer (Diner), /owner (Merchant), /admin (KYC)      │
│ - Live Snowtrace Fuji Testnet Block Explorer link                      │
│                                                                        │
│ Bullet Points:                                                         │
│ • Database: 43,649 real Bangkok eateries in PostgreSQL 17 (<300ms query)│
│ • Smart Contracts: Verified on Avalanche Fuji (TasteToken, Registry,   │
│   MerchantEscrow, MerchantPromotions, DailyEpochRewards).              │
│ • Test Rigor: 121 / 121 passing automated unit, integration & E2E tests│
│ • 1-Click Judge Demo: Dual faucet dispensing 0.1 AVAX + 10k $TASTE.    │
│                                                                        │
│ 🎙️ Speaker Script (บทพูดภาษาไทย - 30 วินาที):                         │
│ "นี่ไม่ใช่แค่งาน Mockup แต่คือโปรโตคอลที่ทำงานได้จริงในระดับ Production │
│ เราใส่ข้อมูลร้านอาหารจริงในกรุงเทพฯ กว่า 43,649 ร้าน พร้อมระบบค้นหา     │
│ รวดเร็วในระดับมิลลิวินาที สัญญา Smart Contracts ทั้ง 5 ตัวถูกเขียนขึ้น │
│ และ Deploy บน Avalanche Fuji พร้อมเทสท์ครอบคลุมทุกจุด 121 ข้อผ่าน 100%  │
│ และกรรมการสามารถกดปุ่ม '1-Click Judge Demo' เพื่อรับเหรียญเทสท์สดได้   │
│ ทันทีใน 2 วินาทีครับ"                                                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 7: Future Roadmap — Direct Spending via U-Topia App              │
├────────────────────────────────────────────────────────────────────────┤
│ Visual Layout:                                                         │
│ - Mockup of U-Topia Super-App mobile screen scanning merchant QR       │
│ - Diagram of Cross-Chain Tourist Spending:                             │
│   [Foreign Tourist: ETH/SOL/BTC] -> [U-Topia Rail] -> [Bangkok Street] │
│                                                                        │
│ Bullet Points:                                                         │
│ 1. U-Topia App Integration: Direct in-store spending of $TASTE tokens  │
│    across 43k+ Bangkok merchants via U-Topia payment rails.            │
│ 2. Cross-Chain Gastronomy Tourism: Foreign tourists spend any crypto    │
│    at local street stalls with automated settlement & 80% burns.       │
│ 3. Avalanche Subnet: Gas-free dedicated gastronomy app-chain.          │
│ 4. LINE Mini-App: Frictionless onboarding for 54M Thai mobile users.   │
│                                                                        │
│ 🎙️ Speaker Script (บทพูดภาษาไทย - 25 วินาที):                         │
│ "ก้าวต่อไปของ TasteChain BKK คือการเชื่อมต่อกับแอป **U-Topia** โดยตรง  │
│ เพื่อเปลี่ยนเหรียญรางวัลรีวิวให้กลายเป็น 'กระเป๋าเงินกินดื่มในชีวิตจริง'│
│ นักท่องเที่ยวต่างชาติที่มาไทยสามารถถือแอป U-Topia สแกนจ่ายค่าสตรีทฟู้ด  │
│ ด้วยเหรียญอะไรก็ได้ ไม่ว่าจะเป็น BTC, SOL หรือ ETH โดยระบบจะเคลียร์    │
│ เป็น $TASTE พร้อมเบิร์นเหรียญ 80% ให้ร้านค้าทันทีครับ"                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

```
┌────────────────────────────────────────────────────────────────────────┐
│ SLIDE 8: Team & Call to Action                                         │
├────────────────────────────────────────────────────────────────────────┤
│ Visual Layout:                                                         │
│ - QR code linking to GitHub repo: https://github.com/0xta/ProofofReview │
│ - Live Demo link: http://localhost:3002                                │
│ - Team credentials & Flow Summit Bangkok 2026 branding                 │
│                                                                        │
│ Bullet Points:                                                         │
│ • TasteChain BKK: Making every bite count on Avalanche C-Chain.        │
│ • Open Source, Fully Tested, Ready for Pilot in Ban That Thong.        │
│ • GitHub: github.com/0xta/ProofofReview                                │
│                                                                        │
│ 🎙️ Speaker Script (บทพูดภาษาไทย - 10 วินาที):                         │
│ "เราพร้อมแล้วที่จะคืนอำนาจและผลกำไรให้กับร้านอาหารและคนรักอาหาร         │
│ ทุกคนในกรุงเทพฯ ขอเชิญกรรมการทุกท่านร่วมทดสอบ TasteChain BKK ได้เลย    │
│ ขอบคุณครับ!"                                                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Pitch Rehearsal Checklist (เทคนิคการซ้อมเพื่อชัยชนะ)
1. **รักษาเวลาให้อยู่ใน 3 นาทีครึ่ง:** สไลด์ละประมาณ 25–30 วินาที อย่าพูดลงรายละเอียดโค้ดลึกเกินไป ให้เน้น **Pain Point $\rightarrow$ นวัตกรรม $\rightarrow$ 5 สปอนเซอร์ $\rightarrow$ ความยั่งยืนของเหรียญ**
2. **ชูจุดขาย 5 สปอนเซอร์ชัดเจนในสไลด์ที่ 4:** กรรมการสปอนเซอร์จะให้คะแนนเต็มเมื่อเห็นว่าเราเชื่อมโยงเทคโนโลยีของพวกเขาจริง ไม่ใช่แค่แปะโลโก้
3. **จบด้วยการเชิญกรรมการกดปุ่ม Faucet ในเว็บ:** บอกกรรมการว่า *"ในเว็บของเรามีปุ่ม 1-Click Judge Demo ที่มุมขวาบน กรรมการสามารถกดรับเหรียญและทดลองส่งรีวิวได้สดๆ ตอนนี้ได้เลยครับ"*
