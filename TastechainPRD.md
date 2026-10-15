# Product Requirements Document (PRD): TasteChain BKK
**Project Name:** TasteChain BKK — The AI-Powered & Trustless Gastronomy Protocol  
**Document Version:** 3.0.0 (AI Voice, In-Store QR & Dynamic Tokenomics Edition)  
**Last Updated:** 2026-10-15  
**Status:** Active PoC / Web3 Hackathon Specification  
**Platform Form Factor:** Standalone Responsive Web Application (Next.js App Router, Tailwind CSS, DaisyUI) + Web Audio API  
**Blockchain Network:** Avalanche C-Chain — Fuji Testnet (Chain ID: 43113)  
**Primary Token:** $TASTE (ERC-20 Protocol Utility & Reward Token) + Fuji AVAX (Escrow Gas/Native Bounties)  
**Primary Database:** PostgreSQL 17 (Docker `uhack-postgres`, port 5432, DB: `tastechain`)  
**Geographic Scope:** กรุงเทพมหานคร (Bangkok Only)  

---

## 1. Executive Summary & Vision

**TasteChain BKK** คือแพลตฟอร์ม Web3 Gastronomy Protocol บนเครือข่าย **Avalanche (AVAX)** ที่เชื่อมโยงฐานข้อมูลร้านอาหาร ร้านกาแฟ และบาร์จริงกว่า **36,000+ สถานที่ F&B ในกรุงเทพมหานคร** เข้ากับระบบตรวจสอบการไปกินจริง (**Dual Proof-of-Visit Oracle**), ระบบเสียงทักทายขอบคุณลูกค้าอัจฉริยะจากเจ้าของร้านด้วย **ElevenLabs AI Voice**, และระบบเศรษฐกิจหมุนเวียน **$TASTE Tokenomics** ที่มีทั้งการแจกรางวัลเหรียญรายวันแบบ Dynamic Pool (**10,000 $TASTE/วัน**), แคมเปญ Bounty โปรโมทร้าน, และสิทธิประโยชน์คูปองส่วนลด/อาหารฟรีจากร้านค้าจริง

### Core Design Decisions (v3.0):

| # | การตัดสินใจ | รายละเอียด |
| :--- | :--- | :--- |
| 1 | **3 Dedicated User Roles** | **(1) Customer:** ค้นหาร้าน, ให้ Review พร้อมทำ Proof of Review (2 Options), สะสมแต้มรับ $TASTE, แลก Voucher<br/>**(2) Owner:** ส่งเอกสารยืนยันสิทธิ์ความเป็นเจ้าของ (KYC/DBD), แก้ไขข้อมูลร้าน, สร้าง Shop QR Code รับรีวิว, ซื้อ Token $TASTE, ตั้งแคมเปญ Bounty<br/>**(3) Admin:** ตรวจสอบสถิติการใช้งาน (Monitor Usage), ดู Audit Logs, อนุมัติสิทธิ์ความเป็นเจ้าของร้าน (Owner Approve), สั่งแจกจ่ายเหรียญ (Manual Token Distribute สำหรับ Demo PoC ในงาน Hackathon) |
| 2 | **Bangkok Only Scope** | Scope เฉพาะ `city = 'กรุงเทพมหานคร'` (41,581 OPERATIONAL venues, 36,369 F&B) |
| 3 | **Proof of Review (2 Options)** | **Option 1 (Slip Proof):** GPS + รูปอาหารที่ทาน + ใบเสร็จการทานในมื้อนั้น (PromptPay Slip OCR ตรวจสอบความถูกต้องและป้องกันสลิปซ้ำ) + คะแนนรีวิวและข้อความ<br/>**Option 2 (Shop QR Proof):** GPS + รูปอาหารที่ทาน + สแกน Shop QR Code หน้าร้าน + คะแนนรีวิวและข้อความ (พร้อมเสียงทักทาย AI ขอบคุณจากร้านค้า) |
| 4 | **ElevenLabs AI Shop Voices** | ร้านค้าสร้างเสียงทักทาย/ขอบคุณลูกค้าได้สูงสุด 3 รูปแบบ (อบอุ่น, เป็นกันเอง, แนะนำเมนู) ระบบสุ่ม 1 ใน 3 ส่งให้ลูกค้าฟังทันทีเมื่อสแกน Shop QR |
| 5 | **Dedicated Role Dashboards & Home** | แยกหน้าจอสำหรับแต่ละ User Role ชัดเจน (`/explore` สำหรับ Customer, `/owner` สำหรับ Owner, `/admin` สำหรับ Admin) พร้อมหน้า **Home Page (`/`)** อธิบายความสามารถของแพลตฟอร์ม, User Flows, สถิติสด, และแนะนำ **Sponsors: ElevenLabs, Avalanche Chain, U-Topia, U-Bot, Tokenomist** |
| 6 | **Pioneer 2x Multiplier** | ผู้ที่ได้เป็น Pioneer ของร้าน (3 คนแรกที่รีวิวผ่าน) ได้รับแต้มความพยายาม **เป็น 2 เท่า (2x Points Multiplier)** ในการรีวิวครั้งนั้นทันที (จบการคำนวณในรอบวัน โปร่งใส) |
| 7 | **$TASTE Daily Mining Emission** | ระบบปล่อยเหรียญ Reward กลางวันละ **10,000 $TASTE** แบ่งตามสัดส่วน (Pro-rata) ของคะแนนรีวิวในแต่ละวัน รองรับทั้ง Auto Settlement และ Admin Manual Distribution สำหรับ Demo PoC |
| 8 | **Merchant $TASTE Bounty & Token Shop** | ร้านค้าสามารถซื้อ $TASTE ด้วย AVAX และนำมาฝากตั้งแคมเปญกระตุ้นยอดขาย (เช่น 100,000 $TASTE) เพื่อจ่ายตรงให้ผู้รีวิว |
| 9 | **Circular Spend Sinks (Promotions)** | ร้านค้าตั้งสิทธิพิเศษรับแลก $TASTE (199 $TASTE แลกเมนูฟรี, 500 $TASTE รับส่วนลด 15%) เหรียญหมุนกลับเข้าร้าน 80%, Burn ทิ้ง 20% เพื่อคุมเงินเฟ้อ |
| 10 | **1-Click Judge Demo Mode** | Faucet แจกทั้ง **0.1 Fuji AVAX** (ค่าแก๊ส) และ **10,000 $TASTE** (Platform Token) อัตโนมัติ พร้อม Burner Wallet ให้กรรมการทดสอบได้ทันทีใน 2 วินาที ทั้งส่งรีวิว, แลก Voucher, และทดลองสร้างแคมเปญ Bounty / Promotion Event ด้วยตนเอง |

---

## 2. Data Landscape (ข้อมูลจริงในฐานข้อมูล)

ฐานข้อมูล PostgreSQL (`tastechain.places`) มีข้อมูลจริงที่พร้อมใช้งาน:

| Metric | จำนวน |
| :--- | :--- |
| ร้านทั้งหมดในฐานข้อมูล (ทั่วประเทศ) | 91,530 |
| กรุงเทพฯ ทั้งหมด | 43,649 |
| กรุงเทพฯ OPERATIONAL (เปิดบริการอยู่) | **41,581** |
| กรุงเทพฯ F&B เท่านั้น (restaurant, cafe, bar, bakery, coffee_shop, ฯลฯ) | **36,369** |
| มี GPS Coordinates (lat/lng) ครบถ้วน | 41,550 (99.9%) |
| มี Rating Score | ~27,732 (ทั่วประเทศ) |

### Service Type Breakdown (กรุงเทพฯ):
* `restaurant`: 21,529
* `cafe`: 8,414
* `bakery`: 2,566
* `bar`: 1,856
* `coffee_shop`: 1,399
* `thai_restaurant`: 937
* `noodle_shop`: 516
* `japanese_restaurant`: 438
* `fast_food_restaurant`: 330
* `chinese_restaurant`: 274

---

## 3. Key Problems, 3 User Roles & Proof Options

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Web2 Food Review Issues     │       │   TasteChain BKK Web3 Solutions │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ ❌ หน้าม้า รีวิวปลอม ไม่ได้ไปจริง │  ───> │ ✅ Dual Proof (Slip & Shop QR)  │
│ ❌ รีวิวไปไม่ได้อะไร เจ้าของรวย   │  ───> │ ✅ Daily 10K $TASTE + Pioneer 2x│
│ ❌ ร้านค้าจ่ายแอดแพง ไร้ engagement│  ───> │ ✅ 100K Token Bounties + Promo  │
│ ❌ ลูกค้ากับร้านค้าห่างเหินไร้ฟีล   │  ───> │ ✅ ElevenLabs AI Shop Greeting  │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

### 3.1 Three Dedicated User Roles Architecture

แพลตฟอร์ม TasteChain BKK แบ่งบทบาทผู้ใช้งานออกเป็น **3 User Roles** พร้อมหน้าจอ (View/Dashboard) แยกกันโดยเด็ดขาด:

```mermaid
flowchart LR
    subgraph Roles["3 Dedicated Platform Roles"]
        Customer["🍜 Customer Role<br/>(นักชิม / ผู้รีวิว)"]
        Owner["🏪 Owner Role<br/>(เจ้าของร้านอาหาร)"]
        Admin["🛡️ Admin Role<br/>(ผู้ดูแลระบบ & กรรมการ)"]
    end

    subgraph CustomerActions["Customer Features"]
        C1["🔍 ค้นหาร้าน (36K+ F&B กทม.)"]
        C2["✍️ ให้รีวิวพร้อม Proof of Review<br/>(Option 1 Slip / Option 2 QR)"]
        C3["🪙 Claim Platform Tokens<br/>(ระบบเก็บรางวัลใน DB มากดรับเมื่อสะดวก)"]
        C4["🎟️ Use Platform Tokens Redeem Promotion<br/>(แลกอาหารฟรี / ส่วนลดจากร้านค้า)"]
    end

    subgraph OwnerActions["Owner Features"]
        O1["📑 ส่งเอกสารยืนยันความเป็นเจ้าของ (KYC)"]
        O2["✏️ แก้ไขข้อมูลร้าน / เมนู / เวลาเปิด"]
        O3["🪧 สร้าง Proof of Review Shop QR Code"]
        O4["💳 ซื้อ Platform Token ($TASTE) ด้วย AVAX"]
        O5["💰 ตั้งแคมเปญ Bounty ดึงคนรีวิว"]
        O6["🎁 สร้าง Promotion Event (รับแลก $TASTE)"]
        O7["🔊 สร้างเสียง ElevenLabs AI (Greeting & Thank-you)"]
    end

    subgraph AdminActions["Admin Features"]
        A1["📊 Monitor Platform Usage & Stats"]
        A2["📜 ตรวจสอบ System & Audit Logs"]
        A3["✅ พิจารณาอนุมัติความเป็นเจ้าของ (Approve Owner)"]
        A4["⚡ สั่งแจกจ่ายเหรียญ (Manual Token Distribute PoC)"]
    end

    Customer --> CustomerActions
    Owner --> OwnerActions
    Admin --> AdminActions
```

#### 1. Customer Role (นักชิม / ผู้ใช้งานทั่วไป)
* **หน้าจอหลัก:** `/explore`, `/place/[placeId]`, `/place/[placeId]/review`, `/mining`, `/profile`
* **ฟีเจอร์หลัก:**
  1. **ค้นหาร้าน (Search & Filter):** ค้นหาร้านอาหาร, คาเฟ่, บาร์ ใน กทม. กว่า 36,000+ แห่ง พร้อมฟิลเตอร์ ย่าน, หมวดหมู่, เรตติ้ง, ร้านที่มี Bounty
  2. **ให้ Review พร้อม Proof of Review:** ส่งรีวิวความประทับใจ คะแนน (1-5 ดาว) พร้อมหลักฐานการไปทานจริง (เลือกได้ 2 Options: แนบสลิป หรือสแกน QR)
  3. **Claim Platform Tokens (ระบบเก็บรางวัลไว้ใน Database มากดรับได้เมื่อสะดวก):**
     * รางวัลเหรียญ $TASTE ทั้งหมด (จาก Daily Mining Pool, Merchant Bounty, และ Pioneer 2x Bonus) จะถูกบันทึกและสะสมไว้ในระบบฐานข้อมูล (`user_epoch_shares` และ `customer_rewards`)
     * ระบบไม่บังคับให้ต้องกดรับทันที ลูกค้าสามารถสะสมยอดเหรียญไว้ได้ต่อเนื่อง และเข้ามาที่หน้า `/profile` หรือ `/mining` เพื่อกดปุ่ม **"⚡ เคลมรางวัลทั้งหมด (Claim My $TASTE)"** เข้ากระเป๋า Web3 เมื่อสะดวก
  4. **Use Platform Token Redeem Promotion from Shop (แลกโปรโมชั่นอาหาร/ส่วนลด):** นำเหรียญ $TASTE ที่ได้รับไปแลกรับสิทธิประโยชน์จากร้านค้า เช่น 199 $TASTE แลกเมนูจานเด็ดฟรี หรือ 500 $TASTE รับส่วนลด 15% (เหรียญหมุนเวียนกลับเข้าร้าน 80%, Burn ทิ้ง 20%)

#### 2. Owner Role (เจ้าของร้านอาหาร)
* **หน้าจอหลัก:** `/owner`, `/owner/verify`, `/owner/venues`, `/owner/qrcode`, `/owner/token-shop`, `/owner/bounty`, `/owner/promotions`, `/owner/voices`
* **ฟีเจอร์หลัก:**
  1. **ส่งเอกสารยืนยันความเป็นเจ้าของร้าน (Owner Verification):** อัปโหลดหลักฐานทางธุรกิจ เช่น หนังสือรับรองนิติบุคคล (DBD), บัตรประชาชนผู้มีอำนาจ, รูปถ่ายหน้าร้านคู่กับป้ายร้าน, หรือบิลค่าน้ำค่าไฟ เพื่อขอสิทธิ์จัดการร้าน
  2. **แก้ไขรายละเอียดร้าน (Edit Venue Details):** ปรับปรุงเวลาเปิด-ปิด, เมนูแนะนำ, ข้อมูลติดต่อ (เบอร์โทร, LINE, Facebook, IG), คำอธิบายร้าน, และรูปภาพบรรยากาศ
  3. **สร้าง Proof of Review Shop QR Code:** สร้างป้าย QR Code ประจำร้านสำหรับตั้งที่เคาน์เตอร์/โต๊ะอาหาร (มี Dynamic Nonce & Signature ป้องกันการคัดลอก) พร้อมผูกระบบเล่นเสียงขอบคุณ **ElevenLabs AI Shop Voice**
  4. **ซื้อ Platform Token ($TASTE):** แลกซื้อเหรียญ $TASTE ด้วย Fuji AVAX ผ่านระบบ Token Shop เพื่อนำไปใช้เป็นงบประมาณสำหรับ Bounty และแคมเปญการตลาด
  5. **ตั้งแคมเปญ Bounty (Fund Bounty Events):** ฝากเหรียญ $TASTE เข้า Escrow สัญญาอัจฉริยะ (เช่น 100,000 $TASTE ระยะเวลา 30 วัน) เพื่อแจกรางวัลพิเศษตรงให้ลูกค้าที่มารีวิวร้าน
  6. **สร้าง Promotion Event (Use Platform Token):** สร้างโปรโมชั่นสำหรับดึงดูดลูกค้า เช่น แลกอาหารฟรี (Free Dish) หรือส่วนลดบิลอาหาร (Bill Discount) โดยรับชำระด้วยเหรียญ $TASTE ซึ่งร้านค้าจะได้รับเหรียญกลับคืน 80% เพื่อนำไปหมุนเวียนใช้ต่อ
  7. **สร้างเสียง ElevenLabs AI Voices สำหรับ Greeting และ Thank-you Customer Reviews:** สร้างเสียงต้อนรับ (Greeting) และเสียงขอบคุณลูกค้าที่มารีวิว (Thank-you) ภาษาไทยอย่างเป็นธรรมชาติได้ 3 สไตล์ต่อร้าน ระบบจะสุ่ม 1 ใน 3 มาเล่นให้ลูกค้าฟังทันทีที่ยืนยันการเยือนสำเร็จ

#### 3. Admin Role (ผู้ดูแลระบบ & กรรมการ Hackathon)
* **หน้าจอหลัก:** `/admin`, `/admin/monitoring`, `/admin/logs`, `/admin/owner-approvals`, `/admin/distribute-token`
* **ฟีเจอร์หลัก:**
  1. **Monitor Usage & Live Statistics:** ดูสถิติรวมของระบบแบบ Real-time: จำนวนร้าน F&B, จำนวนรีวิวที่ผ่านการตรวจสอบ, จำนวนการสแกน QR หน้าร้าน, จำนวนเหรียญ $TASTE ที่แจกจ่ายแล้ว, จำนวน Bounty ที่กำลังเปิดใช้งาน
  2. **System & Security Logs:** ตรวจสอบประวัติการทำงานของระบบ เช่น บันทึกการตรวจสลิปด้วย AI OCR, การตรวจสอบ Geofencing, ธุรกรรมบน Smart Contract, และกิจกรรมที่น่าสงสัย (Fraud Detection)
  3. **Owner Verification Approval:** คิวตรวจเอกสารหลักฐานความเป็นเจ้าของร้านที่ส่งเข้ามา ตรวจดูรูปถ่าย/เอกสาร และกด **"อนุมัติ (Approve)"** หรือ **"ปฏิเสธ (Reject พร้อมระบุเหตุผล)"**
  4. **Manual Token Distribute (สำหรับ Demo PoC ที่ Hackathon):** ปุ่มกดสั่งคำนวณและกระจายเหรียญ $TASTE ประจำวันแบบ Manual ในคลิกเดียว เพื่อให้กรรมการและผู้ทดสอบเห็นผลลัพธ์การ Mint/Transfer เหรียญเข้ากระเป๋าทันทีโดยไม่ต้องรอให้ถึงเที่ยงคืน

---

### 3.2 Proof of Review: 2 Options Specification

เพื่อรองรับพฤติกรรมลูกค้าที่หลากหลาย ทั้งผู้ที่จ่ายเงินผ่าน PromptPay สแกนโอน และผู้ที่ทานในร้านแต่วางเงินสดหรือต้องการความรวดเร็ว ระบบจึงออกแบบ **Proof of Review** ออกเป็น **2 รูปแบบ (Options)** ที่เชื่อถือได้:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PROOF OF REVIEW (เลือกได้ 2 รูปแบบ)                   │
├───────────────────────────────────┬────────────────────────────────────┤
│   Option 1: Slip OCR Proof        │   Option 2: Shop QR Proof          │
│   (สำหรับผู้ที่จ่ายผ่าน PromptPay) │   (สำหรับผู้ที่นั่งทานในร้านจริง)   │
├───────────────────────────────────┼────────────────────────────────────┤
│ 1. 📍 พิกัด GPS (< 100 เมตร)      │ 1. 📍 พิกัด GPS (< 100 เมตร)       │
│ 2. 🍲 รูปถ่ายอาหารมื้อนั้น (pHash)  │ 2. 🍲 รูปถ่ายอาหารมื้อนั้น (pHash)   │
│ 3. 🧾 สลิป/ใบเสร็จ PromptPay จริง │ 3. 🪧 สแกน Shop QR Code หน้าร้าน    │
│    (ตรวจผ่าน OpenAI Vision OCR)   │    (มี HMAC Nonce ป้องกัน Replay)   │
│ 4. ⭐ คะแนนรีวิว (1-5) + ข้อความ   │ 4. ⭐ คะแนนรีวิว (1-5) + ข้อความ    │
├───────────────────────────────────┼────────────────────────────────────┤
│ 🎁 ผลตอบแทน:                      │ 🎁 ผลตอบแทน:                       │
│ • 1 แต้ม (บิล < 150 บ.)           │ • 3 แต้มกิจกรรมพูลรายวัน           │
│ • 3 แต้ม (บิล >= 150 บ.)          │ • 🔊 เล่นเสียง ElevenLabs AI ขอบคุณ│
│ • สิทธิ์เป็น Pioneer 3 คนแรก (2x)  │ • สิทธิ์เป็น Pioneer 3 คนแรก (2x)   │
│ • รับ Merchant Bounty ทันที       │ • รับ Merchant Bounty ทันที        │
└───────────────────────────────────┴────────────────────────────────────┘
```

* **Option 1 (Slip OCR Proof):**
  * **องค์ประกอบที่ต้องส่ง:**
    1. พิกัด GPS ขณะส่งรีวิว (ต้องอยู่ห่างจากร้าน $\le 100$ เมตร)
    2. รูปถ่ายอาหารที่ทานจริงในมื้อนั้น (คำนวณ Perceptual Hash ป้องกันรูปซ้ำจากเน็ต)
    3. รูปถ่ายใบเสร็จ / สลิปโอนเงิน PromptPay ในมื้อนั้น (ระบบส่งให้ OpenAI Vision API สกัด `amount_thb`, `date_time`, `transaction_ref_id` และตรวจว่าไม่เคยถูกใช้มาก่อน)
    4. คะแนนประเมินร้าน (1 ถึง 5 ดาว) พร้อมข้อความรีวิว
  * **จุดเด่น:** มีหลักฐานการชำระเงินจริง สามารถตรวจสอบยอดเงินเพื่อคำนวณแต้มความพยายามได้แม่นยำ

* **Option 2 (Shop QR Proof):**
  * **องค์ประกอบที่ต้องส่ง:**
    1. พิกัด GPS ขณะส่งรีวิว (ต้องอยู่ห่างจากร้าน $\le 100$ เมตร)
    2. รูปถ่ายอาหารที่ทานจริงในมื้อนั้น (คำนวณ Perceptual Hash)
    3. สแกน QR Code ประจำร้าน (Shop QR Code ที่ทางเจ้าของร้านสร้างและตั้งไว้ที่ร้าน ซึ่งมี Nonce ประจำร้าน)
    4. คะแนนประเมินร้าน (1 ถึง 5 ดาว) พร้อมข้อความรีวิว
  * **จุดเด่น:** สะดวก รวดเร็ว แม้จ่ายด้วยเงินสดหรือบัตรเครดิต ก็สามารถยืนยันว่านั่งทานที่ร้านจริงได้ทันที พร้อมเปิดเสียงสังเคราะห์ ElevenLabs AI ของทางร้านให้ฟังทันที

---

### 3.3 Platform Home Page (`/`) & Sponsor Ecosystem

หน้าแรกของแพลตฟอร์ม (**Home Page**) ได้รับการออกแบบให้เป็นศูนย์รวมความรู้และการนำเสนอของโปรเจกต์:
1. **Platform Capabilities & Value Proposition:** อธิบายแนวคิด Trustless Gastronomy Protocol, Dual Proof of Review, Dynamic Token Mining และ Circular Economy
2. **Interactive User Flows Walkthrough:** แนะนำขั้นตอนการใช้งานทีละ Step สำหรับทั้ง 3 Roles (Customer, Owner, Admin)
3. **Live Usage Statistics Dashboard:** แสดงตัวเลขสดจากฐานข้อมูล:
   * **36,369+** ร้านอาหาร F&B ในกรุงเทพฯ
   * จำนวนรีวิว Verified Reviews ที่เกิดขึ้นจริง
   * ยอดแจกเหรียญ $TASTE สะสมในระบบ
   * แคมเปญ Bounty ที่กำลัง Active
4. **5 Platform Sponsors & Partners:**
   * **U-Topia:** Web3 Entertainment, Gamification & Real-world Asset (RWA) Ecosystem
   * **ElevenLabs:** Generative Voice AI สังเคราะห์เสียงต้อนรับและขอบคุณภาษาไทย 3 สไตล์ต่อร้าน
   * **Avalanche C-Chain:** บล็อกเชนความเร็วสูง สำหรับ Smart Contracts, Escrow และ Micro-rewards
   * **U-Bot:** Automated Web3 Trading & Social Community Intelligence Bot
   * **Tokenomist:** ผู้ออกแบบกลไก Dynamic Tokenomics, 80/20 Burn และ Mining Emission

---

## 4. System Architecture & Tech Stack

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 14 App Router + Tailwind + DaisyUI)"]
        UI["Explore & Place Detail UI"]
        QRScanner["Front-Shop QR Scanner<br/>(html5-qrcode / Camera)"]
        AudioPlayer["Web Audio Greeting Player<br/>(ElevenLabs MP3 Stream)"]
        PushUI["Instant Push Toast / Alert"]
        Wallet["Wagmi v2 / Viem / RainbowKit"]
        JudgeBtn["⚡ 1-Click Judge Burner Wallet"]
    end

    subgraph Backend["Backend & Oracle Services (Next.js API Routes)"]
        ElevenLabsAPI["ElevenLabs TTS Service<br/>(Generate & Cache 3 Voices/Shop)"]
        QRVerifier["Front-Shop QR Oracle<br/>(GPS Distance + Nonce Auth)"]
        VisionOCR["Slip OCR Oracle<br/>(OpenAI Vision gpt-4o-mini)"]
        DailyEpochCron["Daily 10K $TASTE Epoch Engine<br/>(Pro-Rata Settlement)"]
        Relayer["Fuji Tx Relayer & Faucet"]
    end

    subgraph Blockchain["Avalanche C-Chain (Fuji Testnet 43113)"]
        TasteToken["TasteToken.sol ($TASTE)<br/>ERC-20 Token with Burn/Mint"]
        DailyDistributor["TasteDailyDistributor.sol<br/>(10,000 Daily Pool Vault)"]
        Registry["TasteChainRegistry.sol<br/>(Pioneer Slots 1-3 & Proof Hashes)"]
        BountyContract["TasteChainBounty.sol<br/>(Merchant $TASTE/AVAX Escrow)"]
        PromoEscrow["TastePromotionEscrow.sol<br/>(Voucher Redemption & 80/20 Burn)"]
    end

    subgraph Database["PostgreSQL 17 (uhack-postgres:5432)"]
        Places["places (Master 36K+ BKK F&B)"]
        Voices["shop_voices (3 ElevenLabs Audios/Shop)"]
        QRVisits["in_store_qr_checkins"]
        Reviews["verified_reviews"]
        Pioneers["pioneer_claims"]
        Epochs["daily_token_epochs"]
        Promotions["merchant_promotions & redemptions"]
    end

    %% Client Interactions
    UI --> Wallet
    UI --> JudgeBtn
    QRScanner -->|Scan Cashier QR| QRVerifier
    QRVerifier -->|Trigger Audio & Toast| AudioPlayer
    QRVerifier --> PushUI
    AudioPlayer -->|Fetch MP3 URL| ElevenLabsAPI

    %% Backend to Database
    QRVerifier --> QRVisits
    VisionOCR --> Reviews
    ElevenLabsAPI --> Voices
    DailyEpochCron --> Epochs

    %% Smart Contract Triggers
    DailyEpochCron -->|Distribute Daily 10K Pool| DailyDistributor
    Wallet -->|Claim Daily Rewards| DailyDistributor
    DailyDistributor -->|Transfer $TASTE| TasteToken
    Wallet -->|fundBounty $TASTE| BountyContract
    Wallet -->|redeemPromotion $TASTE| PromoEscrow
    PromoEscrow -->|Burn 20% & Transfer 80%| TasteToken
    Relayer -->|claimReward onlyOracle| BountyContract
```

### Tech Stack Details:

| Layer | Technology | รายละเอียดการใช้งาน |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router), TypeScript | Full-stack web application & backend API routes |
| **Styling & UI** | Tailwind CSS v3.4+, DaisyUI v4+ | Theme `dark` (default) & `coffee` food theme, Responsive Web |
| **Voice AI** | **ElevenLabs API** (Multilingual v2) | สร้างเสียงทักทายภาษาไทยที่เป็นธรรมชาติ 3 แบบต่อร้าน |
| **Audio Playback** | Web Audio API / HTML5 Audio | สตรีมเสียงทักทายเมื่อลูกค้าสแกน QR ผ่านทันที |
| **QR Code Engine** | `html5-qrcode` & `qrcode.react` | สแกน QR หน้าร้าน และสร้าง Dynamic QR สำหรับร้านค้า / คูปอง |
| **Slip OCR** | **OpenAI Vision API** (`gpt-4o-mini`) | ตรวจสลิป PromptPay ดึงยอดเงิน, เวลา, และเลขอ้างอิงแบบ Structured JSON |
| **Smart Contracts** | Solidity 0.8.24, Hardhat / Viem | สัญญา 5 ฉบับ: Token, Daily Pool, Registry, Bounty, Promotion |
| **Blockchain** | Avalanche Fuji Testnet (43113) | Sub-second finality, ค่าแก๊สต่ำ เหมาะกับ Micro-rewards |
| **Web3 Client** | Wagmi v2, Viem v2, RainbowKit | เชื่อมต่อกระเป๋า Web3 และ Burner Wallet |
| **Database** | PostgreSQL 17 (`uhack-postgres:5432`) | เก็บข้อมูลร้าน 36K+ แห่ง และตาราง Companion ทั้งหมด |

---

## 5. Database Schema & Data Models

### 5.1 ตาราง Master Data ที่มีอยู่เดิม:
* `places`: ข้อมูลร้านอาหาร 41,581 แห่งใน กทม. (`place_id`, `name`, `address`, `latitude`, `longitude`, `service_type`, `rating`, ฯลฯ)
* `verified_reviews`: ข้อมูลรีวิวสลิปและ On-chain Tx Hash
* `pioneer_claims`: ข้อมูลสิทธิ์ผู้บุกเบิก 3 คนแรกของแต่ละร้าน
* `merchant_bounties`: แคมเปญ Bounty เดิม

### 5.2 ตาราง Companion ใหม่สำหรับ v3.0:

```sql
-- ========================================================
-- 1. shop_voices: เสียงทักทาย ElevenLabs สูงสุด 3 เสียงต่อร้าน
-- ========================================================
CREATE TABLE IF NOT EXISTS shop_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
    slot_number SMALLINT NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
    title VARCHAR(100) NOT NULL,            -- เช่น "เสียงยินดีต้อนรับ", "เสียงขอบคุณอบอุ่น", "เสียงเชฟแนะนำ"
    script_text TEXT NOT NULL,              -- ข้อความภาษาไทยที่ให้ ElevenLabs สังเคราะห์เสียง
    voice_id VARCHAR(100) NOT NULL,         -- ElevenLabs Voice ID (เช่น Prem, Sarah, หรือ Custom Voice)
    audio_url TEXT NOT NULL,                -- URL หรือ Data URI ของไฟล์เสียง MP3
    duration_seconds NUMERIC(4, 2),
    is_active BOOLEAN DEFAULT TRUE,
    play_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_place_voice_slot UNIQUE (place_id, slot_number)
);

CREATE INDEX IF NOT EXISTS idx_sv_place_id ON shop_voices(place_id);

-- ========================================================
-- 2. in_store_qr_checkins: บันทึกการสแกน QR หน้าร้านแบบ Instant Proof
-- ========================================================
CREATE TABLE IF NOT EXISTS in_store_qr_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
    place_hash VARCHAR(66) NOT NULL,
    customer_address VARCHAR(42) NOT NULL,
    gps_latitude NUMERIC(10, 7),
    gps_longitude NUMERIC(10, 7),
    gps_distance_meters NUMERIC(8, 2),      -- ระยะห่างจากร้าน (ต้อง < 100 เมตร)
    dispatched_voice_id UUID REFERENCES shop_voices(id),
    epoch_points_awarded INT DEFAULT 3,     -- แต้มสำหรับหารสัดส่วน 10K $TASTE ประจำวัน (สแกน QR หน้าร้าน: 3 แต้ม)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_place_id ON in_store_qr_checkins(place_id);
CREATE INDEX IF NOT EXISTS idx_qr_customer ON in_store_qr_checkins(customer_address);
CREATE INDEX IF NOT EXISTS idx_qr_created ON in_store_qr_checkins(created_at DESC);

-- ========================================================
-- 3. daily_token_epochs: รอบแจกเหรียญ 10,000 $TASTE ประจำวัน
-- ========================================================
CREATE TABLE IF NOT EXISTS daily_token_epochs (
    epoch_date DATE PRIMARY KEY,            -- วันที่ของรอบ (YYYY-MM-DD)
    total_emission_tokens NUMERIC(18, 8) DEFAULT 10000.0, -- 10,000 $TASTE ต่อวัน
    total_platform_points INT DEFAULT 0,    -- ผลรวมคะแนนรีวิว/สแกนทั้งหมดของทุกคนในวันนี้
    total_participants INT DEFAULT 0,       -- จำนวนผู้ใช้ที่ร่วมกิจกรรมในวันนี้
    token_per_point NUMERIC(18, 8) DEFAULT 0, -- 10,000 / total_platform_points
    merkle_root VARCHAR(66),                -- On-chain Merkle Root สำหรับเคลม
    status VARCHAR(20) DEFAULT 'ACTIVE'     -- ACTIVE (กำลังนับคะแนน), SETTLED (คำนวณแล้ว), DISTRIBUTED
);

-- ========================================================
-- 4. user_epoch_shares: ส่วนแบ่งเหรียญประจำวันของผู้ใช้แต่ละคน
-- ========================================================
CREATE TABLE IF NOT EXISTS user_epoch_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    epoch_date DATE NOT NULL REFERENCES daily_token_epochs(epoch_date),
    user_address VARCHAR(42) NOT NULL,
    user_points INT DEFAULT 0,              -- แต้มที่ผู้ใช้ทำได้ในวันนี้
    calculated_reward_taste NUMERIC(18, 8) DEFAULT 0,
    claimed BOOLEAN DEFAULT FALSE,
    claim_tx_hash VARCHAR(66),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_epoch UNIQUE (epoch_date, user_address)
);

CREATE INDEX IF NOT EXISTS idx_ues_user ON user_epoch_shares(user_address);

-- ========================================================
-- 5. merchant_token_bounties: แคมเปญ Bounty ด้วยเหรียญ $TASTE
-- ========================================================
CREATE TABLE IF NOT EXISTS merchant_token_bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
    place_hash VARCHAR(66) NOT NULL,
    merchant_address VARCHAR(42) NOT NULL,
    total_budget_taste NUMERIC(18, 8) NOT NULL,     -- เช่น 100,000 $TASTE
    remaining_budget_taste NUMERIC(18, 8) NOT NULL,
    reward_per_visit_taste NUMERIC(18, 8) NOT NULL, -- เช่น 50 $TASTE ต่อคน
    campaign_duration_days INT NOT NULL DEFAULT 30,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    total_claims INT DEFAULT 0,
    onchain_tx_hash VARCHAR(66) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'             -- ACTIVE, DEPLETED, EXPIRED
);

CREATE INDEX IF NOT EXISTS idx_mtb_place ON merchant_token_bounties(place_id);

-- ========================================================
-- 6. merchant_promotions: สิทธิประโยชน์/คูปองแลกอาหารและส่วนลด
-- ========================================================
CREATE TABLE IF NOT EXISTS merchant_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
    place_hash VARCHAR(66) NOT NULL,
    merchant_address VARCHAR(42) NOT NULL,
    promo_type VARCHAR(20) NOT NULL,        -- 'FREE_ITEM' หรือ 'DISCOUNT_PERCENT'
    title VARCHAR(150) NOT NULL,            -- เช่น "ฟรี เกี๊ยวซ่าหมูทอด 1 จาน", "ส่วนลด 15%"
    description TEXT,
    cost_in_taste NUMERIC(18, 8) NOT NULL,  -- เช่น 199.00 หรือ 500.00
    discount_percent SMALLINT DEFAULT 0,    -- 15 สำหรับ 15%
    min_spend_thb NUMERIC(10, 2) DEFAULT 0, -- ขั้นต่ำยอดบิล เช่น 1000.00 บาท
    max_redemptions INT DEFAULT 100,        -- โควต้าสิทธิ์
    total_redeemed INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mp_place ON merchant_promotions(place_id);

-- ========================================================
-- 7. promotion_redemptions: ประวัติการนำ $TASTE มาแลกสิทธิ์
-- ========================================================
CREATE TABLE IF NOT EXISTS promotion_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES merchant_promotions(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL REFERENCES places(place_id),
    customer_address VARCHAR(42) NOT NULL,
    cost_in_taste NUMERIC(18, 8) NOT NULL,
    merchant_received_taste NUMERIC(18, 8) NOT NULL, -- 80% ของ cost
    burned_taste NUMERIC(18, 8) NOT NULL,            -- 20% ของ cost
    redemption_code VARCHAR(20) UNIQUE NOT NULL,     -- OTP / Code ที่ร้านค้าสแกนตรวจ
    onchain_tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'COMPLETED',          -- PENDING, COMPLETED, CANCELLED
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pr_customer ON promotion_redemptions(customer_address);
CREATE INDEX IF NOT EXISTS idx_pr_place ON promotion_redemptions(place_id);

-- ========================================================
-- 8. owner_verifications: คำร้องและเอกสารยืนยันสิทธิ์ความเป็นเจ้าของร้าน (Owner KYC)
-- ========================================================
CREATE TABLE IF NOT EXISTS owner_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
    owner_address VARCHAR(42) NOT NULL,          -- กระเป๋า Web3 ของเจ้าของร้าน
    contact_name VARCHAR(150) NOT NULL,          -- ชื่อผู้ติดต่อ / เจ้าของ
    contact_phone VARCHAR(50) NOT NULL,          -- เบอร์โทรศัพท์สำหรับตรวจสอบ
    contact_email VARCHAR(150),                  -- อีเมลร้าน
    business_tax_id VARCHAR(50),                 -- เลขทะเบียนนิติบุคคล / เลขประจำตัวผู้เสียภาษี
    document_type VARCHAR(50) NOT NULL,          -- 'DBD_REGISTRATION', 'ID_CARD', 'STOREFRONT_PHOTO', 'UTILITY_BILL'
    document_url TEXT NOT NULL,                  -- ลิงก์ไฟล์เอกสาร / รูปถ่ายยืนยัน
    additional_notes TEXT,                       -- ข้อมูลเพิ่มเติมจากเจ้าของร้าน
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by VARCHAR(42),                     -- กระเป๋า Admin หรือ ID ผู้ตรวจ
    rejection_reason TEXT,                       -- เหตุผลกรณีปฏิเสธ
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ov_place ON owner_verifications(place_id);
CREATE INDEX IF NOT EXISTS idx_ov_owner ON owner_verifications(owner_address);
CREATE INDEX IF NOT EXISTS idx_ov_status ON owner_verifications(status);

-- ========================================================
-- 9. place_owners: สิทธิ์เจ้าของร้านที่ได้รับการอนุมัติแล้ว
-- ========================================================
CREATE TABLE IF NOT EXISTS place_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
    owner_address VARCHAR(42) NOT NULL,
    verification_id UUID REFERENCES owner_verifications(id),
    can_edit_details BOOLEAN DEFAULT TRUE,
    can_manage_bounty BOOLEAN DEFAULT TRUE,
    can_generate_qr BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_place_owner UNIQUE (place_id, owner_address)
);

CREATE INDEX IF NOT EXISTS idx_po_place ON place_owners(place_id);
CREATE INDEX IF NOT EXISTS idx_po_owner ON place_owners(owner_address);

-- ========================================================
-- 10. admin_activity_logs: บันทึกการปฏิบัติงานและ Audit Trail ของ Admin
-- ========================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_address VARCHAR(42) NOT NULL,          -- กระเป๋า Admin
    action_type VARCHAR(50) NOT NULL,            -- 'APPROVE_OWNER', 'REJECT_OWNER', 'MANUAL_TOKEN_DISTRIBUTE', 'CONFIG_UPDATE'
    target_id TEXT,                              -- ID ของ Place, Verification หรือ Epoch ที่กระทำ
    details JSONB,                               -- ข้อมูลรายละเอียด เช่น จำนวนเหรียญ, เหตุผล, สถานะเดิม
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aal_admin ON admin_activity_logs(admin_address);
CREATE INDEX IF NOT EXISTS idx_aal_action ON admin_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_aal_created ON admin_activity_logs(created_at DESC);

-- ========================================================
-- 11. customer_claimable_rewards: บันทึกและสะสมรางวัลเหรียญ $TASTE ของลูกค้า รอให้มากดรับเมื่อสะดวก
-- ========================================================
CREATE TABLE IF NOT EXISTS customer_claimable_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_address VARCHAR(42) NOT NULL,
    reward_type VARCHAR(30) NOT NULL,          -- 'DAILY_POOL', 'MERCHANT_BOUNTY', 'PIONEER_BONUS'
    source_id TEXT,                            -- อ้างอิง place_id หรือ epoch_date หรือ review_id
    amount_taste NUMERIC(18, 8) NOT NULL,
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    claim_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ccr_customer ON customer_claimable_rewards(customer_address);
CREATE INDEX IF NOT EXISTS idx_ccr_claimed ON customer_claimable_rewards(is_claimed);
```

---

## 6. Smart Contract Architecture (Avalanche Fuji)

### Contract 1: `TasteToken.sol` ($TASTE Protocol ERC-20)
เหรียญ Utility ประจำระบบ มีระบบ Minters (สัญญา Daily Distributor และ Owner) และระบบ Deflationary Burn

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract TasteToken is IERC20 {
    string public name = "TasteChain Token";
    string public symbol = "TASTE";
    uint8 public decimals = 18;
    uint256 private _totalSupply;

    address public owner;
    mapping(address => bool) public isMinter;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event MinterUpdated(address indexed minter, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner, "Not authorized to mint");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Mint Initial Treasury / Liquidity Reserve: 1,000,000 $TASTE
        _mint(msg.sender, 1_000_000 * 10**18);
    }

    function setMinter(address minter, bool status) external onlyOwner {
        isMinter[minter] = status;
        emit MinterUpdated(minter, status);
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address _owner, address spender) public view override returns (uint256) {
        return _allowances[_owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");
        unchecked {
            _approve(from, msg.sender, currentAllowance - amount);
        }
        _transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from zero");
        require(to != address(0), "ERC20: transfer to zero");
        require(_balances[from] >= amount, "ERC20: insufficient balance");
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to zero");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from zero");
        require(_balances[account] >= amount, "ERC20: burn amount exceeds balance");
        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    function _approve(address _owner, address spender, uint256 amount) internal {
        _allowances[_owner][spender] = amount;
        emit Approval(_owner, spender, amount);
    }
}
```

---

### Contract 2: `TasteDailyDistributor.sol` (แจก 10,000 $TASTE ประจำวัน)
สัญญาควบคุมการปล่อยเหรียญวันละ 10,000 $TASTE โดย Backend Oracle จะบันทึกแต้มรวมประจำวัน หรือใช้ระบบ Merkle Proof / Direct Oracle Distribution

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITasteToken {
    function mint(address to, uint256 amount) external;
}

contract TasteDailyDistributor {
    address public owner;
    address public oracleAddress;
    ITasteToken public tasteToken;

    uint256 public constant DAILY_EMISSION = 10_000 * 10**18; // 10,000 TASTE

    struct EpochData {
        uint256 totalPoints;
        uint256 emissionAmount;
        bool finalized;
    }

    // Key: epochDate timestamp or day index (block.timestamp / 86400)
    mapping(uint256 => EpochData) public epochs;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event EpochFinalized(uint256 indexed dayIndex, uint256 totalPoints, uint256 totalEmission);
    event RewardClaimed(uint256 indexed dayIndex, address indexed user, uint256 amount);

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _tokenAddress, address _oracle) {
        owner = msg.sender;
        tasteToken = ITasteToken(_tokenAddress);
        oracleAddress = _oracle;
    }

    /// @notice Oracle submits the end-of-day total score to finalize the epoch
    function finalizeEpoch(uint256 dayIndex, uint256 totalPoints) external onlyOracle {
        require(!epochs[dayIndex].finalized, "Epoch already finalized");
        require(totalPoints > 0, "Points must be > 0");

        epochs[dayIndex] = EpochData({
            totalPoints: totalPoints,
            emissionAmount: DAILY_EMISSION,
            finalized: true
        });

        emit EpochFinalized(dayIndex, totalPoints, DAILY_EMISSION);
    }

    /// @notice Mechanism B: User claims their pro-rata reward directly using an Oracle-signed authorization
    function claimReward(
        uint256 dayIndex,
        uint256 userPoints,
        bytes calldata signature
    ) external {
        EpochData storage epoch = epochs[dayIndex];
        require(epoch.finalized, "Epoch not finalized");
        require(!hasClaimed[dayIndex][msg.sender], "Already claimed");
        require(userPoints > 0 && userPoints <= epoch.totalPoints, "Invalid user points");

        // Verify oracle signature: keccak256(dayIndex, userAddress, userPoints, chainId, contractAddress)
        bytes32 messageHash = keccak256(abi.encodePacked(dayIndex, msg.sender, userPoints, block.chainid, address(this)));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        
        address signer = recoverSigner(ethSignedMessageHash, signature);
        require(signer == oracleAddress, "Invalid oracle signature");

        hasClaimed[dayIndex][msg.sender] = true;

        // Pro-Rata Formula: (userPoints * 10,000 TASTE) / totalPoints
        uint256 userReward = (userPoints * epoch.emissionAmount) / epoch.totalPoints;
        tasteToken.mint(msg.sender, userReward);

        emit RewardClaimed(dayIndex, msg.sender, userReward);
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _sig) internal pure returns (address) {
        require(_sig.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function setOracle(address _newOracle) external onlyOwner {
        oracleAddress = _newOracle;
    }
}
```

---

### Contract 3: `TastePromotionEscrow.sol` (แลกอาหารฟรี / ส่วนลด + Burn 20%)
ลูกค้านำ $TASTE มาชำระเพื่อรับสิทธิ์ส่วนลดหรืออาหารฟรี: สัญญาจะโอน **80% ไปให้ร้านค้า** และนำ **20% ส่งเข้า address(0) เพื่อ Burn ทิ้งถาวร**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITasteTokenTransfer {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TastePromotionEscrow {
    ITasteTokenTransfer public tasteToken;
    address public protocolAdmin;

    event PromotionRedeemed(
        bytes32 indexed placeHash,
        address indexed customer,
        address indexed merchant,
        uint256 totalAmount,
        uint256 merchantAmount,
        uint256 burnedAmount,
        string promoRef
    );

    constructor(address _tokenAddress) {
        tasteToken = ITasteTokenTransfer(_tokenAddress);
        protocolAdmin = msg.sender;
    }

    /// @notice Customer redeems promotion at merchant venue (e.g. 199 TASTE for dish, 500 TASTE for 15% off)
    /// @dev 80% goes to merchant wallet, 20% is burned to 0x000000000000000000000000000000000000dEaD
    function redeemPromotion(
        bytes32 placeHash,
        address merchant,
        uint256 tasteCost,
        string calldata promoRef
    ) external {
        require(tasteCost > 0, "Cost must be > 0");
        require(merchant != address(0), "Invalid merchant address");

        uint256 merchantShare = (tasteCost * 80) / 100;
        uint256 burnShare = tasteCost - merchantShare; // 20%

        // Transfer 80% to Merchant
        bool s1 = tasteToken.transferFrom(msg.sender, merchant, merchantShare);
        require(s1, "Merchant transfer failed");

        // Burn 20% by sending to Dead Address
        address deadAddress = 0x000000000000000000000000000000000000dEaD;
        bool s2 = tasteToken.transferFrom(msg.sender, deadAddress, burnShare);
        require(s2, "Burn transfer failed");

        emit PromotionRedeemed(placeHash, msg.sender, merchant, tasteCost, merchantShare, burnShare, promoRef);
    }
}
```

---

## 7. Functional Requirements & Core Workflows

### 7.1 Flow 1: ElevenLabs AI Voice Studio สำหรับร้านค้า

*   **FR-1.1 Voice Generation Interface:** ในหน้าจัดการร้าน (`/place/[placeId]/merchant`), ร้านค้าสามารถบันทึกหรือปรับแต่งเสียงทักทายได้สูงสุด 3 Slots:
    *   **Slot 1 (อบอุ่น & ขอบคุณ):** เช่น *"ขอบคุณที่แวะมาทานที่ร้าน [ชื่อร้าน] นะคะ ดีใจมากๆ ที่ได้บริการค่ะ!"*
    *   **Slot 2 (เป็นกันเอง & อร่อย):** เช่น *"หวังว่าอาหารมื้อนี้จะถูกปากนะครับ ฝากรีวิวบอกต่อความอร่อยด้วยนะคร้าบ!"*
    *   **Slot 3 (สิทธิพิเศษ & กวนๆ):** เช่น *"อย่าลืมสะสมโทเค็น TASTE ไว้แลกเมนูเด็ดจานหน้านะครับ รอบหน้าเจอกันใหม่!"*
*   **FR-1.2 ElevenLabs Synthesis API:**
    *   เรียก `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
    *   ใช้โมเดล `eleven_multilingual_v2` รองรับภาษาไทยได้เป็นธรรมชาติและมีอารมณ์ร่วม
    *   บันทึกไฟล์เสียง MP3 ลงใน Storage/Database พร้อมอัปเดตตาราง `shop_voices`
*   **FR-1.3 Random Dispatch Algorithm:** เมื่อมีการตรวจสอบการเยือนสำเร็จ ระบบจะสุ่มเสียง `SELECT * FROM shop_voices WHERE place_id = :id AND is_active = true ORDER BY RANDOM() LIMIT 1` และส่ง URL กลับไปที่ Client

---

### 7.2 Flow 2: Front-Shop QR Check-in & Instant Gratification

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 📱 ลูกค้า (Customer)
    participant App as TasteChain Web App
    participant CashierQR as 🪧 ป้าย QR หน้าร้าน
    participant Oracle as ⚙️ Backend Oracle
    participant DB as 🐘 PostgreSQL
    participant Audio as 🔊 Web Audio API

    Customer->>CashierQR: สแกน QR Code ที่เคาน์เตอร์หน้าร้าน
    App->>Oracle: POST /api/checkin/qr { placeId, coords, timestamp }
    Oracle->>Oracle: ตรวจพิกัด GPS (< 100 เมตรจากร้านจริง)
    Oracle->>DB: บันทึก in_store_qr_checkins + เพิ่ม 1 Epoch Point
    Oracle->>DB: ดึงเสียง ElevenLabs สุ่ม 1 ใน 3 เสียงของร้าน
    Oracle-->>App: Return { success: true, points: 1, voiceUrl: "...", shopName: "..." }
    App->>Customer: 🔔 Push Notification Toast: "🎉 คุณได้เช็คอินที่ร้านแล้ว!"
    App->>Audio: เล่นเสียงทักทาย AI ขอบคุณจากเจ้าของร้านทันที
```

*   **FR-2.1 In-Store QR Verification:**
    *   QR Code วางไว้ที่หน้าร้าน / โต๊ะอาหาร / เคาน์เตอร์
    *   ลูกค้าเปิดเมนู "Scan Store QR" จากมือถือ
    *   เบราว์เซอร์อ่านค่าพิกัด GPS ปัจจุบันของผู้ใช้เปรียบเทียบกับ `places.latitude`, `places.longitude`
    *   หากระยะห่าง $\le 100$ เมตร ถือว่าเช็คอินสำเร็จ
*   **FR-2.2 Instant Feedback & Audio Stream:**
    *   แสดง Push Banner แจ้งเตือน: *"ยินดีด้วย! คุณได้รับ 1 แต้มประจำวันสำหรับหารพูล 10,000 $TASTE"*
    *   เล่นเสียงสังเคราะห์ ElevenLabs จากเจ้าของร้านโดยอัตโนมัติผ่านลำโพงมือถือ
    *   จำกัดสิทธิ์ 1 ครั้ง ต่อ 1 ร้าน ต่อ 1 กระเป๋า ต่อ 24 ชั่วโมง

---

### 7.3 Flow 3: Dynamic Reward Engine (Daily 10,000 $TASTE Emission) — Mechanism B (Daily Claim)

*   **FR-3.1 Emission Concept & Activity Points:**
    *   ในแต่ละวัน (00:00 - 23:59 UTC) ระบบมีโควต้าเหรียญแจกจ่ายคงที่ **10,000 $TASTE**
    *   ผู้ใช้สะสม **"คะแนนความพยายาม" (Daily Activity Points)** ในแต่ละวันได้จาก:
        1. **สแกน QR หน้าร้าน:** **3 แต้ม**
        2. **ถ่ายรูปอาหารสด (pHash):** **1 แต้ม**
        3. **อัปโหลดใบเสร็จ (OCR ผ่าน):**
           * มูลค่า `< 150` บาท: **1 แต้ม**
           * มูลค่า `>= 150` บาท: **3 แต้ม**
*   **FR-3.1b สิทธิประโยชน์ Pioneer (2x Points Multiplier):**
    *   ผู้ที่รีวิวและได้สถานะเป็น **Pioneer ของร้านนั้น (3 คนแรกที่รีวิวผ่าน)** จะได้รับคะแนนความพยายาม **เป็น 2 เท่า (x2 Multiplier)** ในการรีวิวครั้งนั้นทันที!
    *   *ตัวอย่างการคำนวณ:*
        *   User ทั่วไป: สแกน QR (3 แต้ม) + ถ่ายรูป (1 แต้ม) + ใบเสร็จ >= 150 บาท (3 แต้ม) = รวม **7 แต้ม**
        *   **Pioneer ของร้าน:** ได้รับแต้ม $7 \times 2 = \mathbf{14\ \text{แต้ม}}$ ทันที!
    *   *(ยกเลิก 5% Royalty Pool เดิม เพื่อความเรียบง่าย โปร่งใส และคำนวณเหรียญจบในรอบวัน)*
*   **FR-3.2 Dynamic Game Theory (Mining Formula):**
    $$\text{User Token Reward} = 10,000 \times \frac{\text{User Daily Activity Points}}{\sum \text{All Users Activity Points Today}}$$
    *   *กรณีวันธรรมดาคนรีวิวน้อย:* สมมติทั้งวันมีคนรวมกัน 200 แต้ม $\rightarrow$ 1 แต้มมีค่า = $\frac{10,000}{200} = 50\ \text{\$TASTE}$ (จูงใจให้คนตระเวนกินวันธรรมดา)
    *   *กรณีวันหยุดคนรีวิวเยอะ:* สมมติทั้งวันมีคนรวมกัน 2,000 แต้ม $\rightarrow$ 1 แต้มมีค่า = $\frac{10,000}{2,000} = 5\ \text{\$TASTE}$
*   **FR-3.3 Distribution Mechanism: Option B (Daily Claim - ผู้ใช้กดเคลมเอง):**
    *   **ระหว่างวัน (Mining Phase):** แต้มกิจกรรมถูกบันทึกลงฐานข้อมูล (`in_store_qr_checkins`, `verified_reviews`, `user_epoch_shares`) และแสดงแต้มสะสมพร้อมยอดประมาณการเหรียญแบบ Real-time บน Dashboard (`/mining`)
    *   **สิ้นวัน (Finalization Phase):** เมื่อผ่านพ้น 23:59 UTC หรือผู้ดูแล/กรรมการสั่งปิดรอบ ระบบจะบันทึก `finalizeEpoch(dayIndex, totalPoints)` ขึ้น Smart Contract
    *   **การกดเคลม (Claim Phase):** ผู้ใช้เข้ามาที่หน้า Dashboard (`/mining` หรือ `/profile`) กดปุ่ม **"⚡ เคลมรางวัลประจำวัน (Claim My $TASTE)"**
        *   Client ส่งคำขอรับ Signature รับรองคะแนนจาก Oracle
        *   ผู้ใช้เซ็นธุรกรรม `claimReward(dayIndex, userPoints, signature)` บนกระเป๋า (Wagmi / Burner Wallet)
        *   Smart Contract `TasteDailyDistributor.sol` ทำการ Mint / โอนเหรียญ $TASTE ตรงเข้ากระเป๋าของผู้ใช้ทันที!

---

### 7.4 Flow 4: Merchant $TASTE Bounty Campaigns

*   **FR-4.1 Bounty Setup by Merchant:**
    *   ร้านค้าสามารถซื้อ $TASTE หรือนำเหรียญที่มี มาฝากเข้า Smart Contract เพื่อโปรโมทร้าน
    *   **ตัวอย่างแคมเปญ:** ฝาก **100,000 $TASTE** สำหรับระยะเวลา **30 วัน**
    *   ตั้งค่ารางวัลต่อการรีวิว เช่น **100 $TASTE ต่อ 1 Verified Review**
*   **FR-4.2 Stacking Rewards:**
    *   ลูกค้าที่มารีวิวร้านที่มี Active Bounty จะได้รับ:
        1. **ส่วนแบ่งจาก Daily 10K Pool** (หากเป็น Pioneer จะได้แต้มกิจกรรมคูณ 2 เท่า!)
        2. **$TASTE Bounty พิเศษจากร้านนั้น** (จ่ายตรง 100% เข้ากระเป๋าผู้รีวิวทันทีจาก Escrow)

---

### 7.5 Flow 5: Circular Token Utility & Promotions (Discounts / Free Dishes)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 😋 ลูกค้า (Customer)
    actor Cashier as 👨‍🍳 ร้านค้า (Merchant Cashier)
    participant App as TasteChain App
    participant Contract as 📜 TastePromotionEscrow.sol
    participant Token as 🪙 TasteToken ($TASTE)

    Customer->>App: เลือกโปรโมชั่น (เช่น แลกเกี๊ยวซ่า 199 $TASTE หรือ ส่วนลด 15% 500 $TASTE)
    App->>Contract: ทำรายการ redeemPromotion(placeHash, merchant, 199 TASTE)
    Contract->>Token: โอน 80% (159.2 TASTE) ให้ร้านค้า
    Contract->>Token: โอน 20% (39.8 TASTE) ไป Burn Address (0x00...dEaD)
    Contract-->>App: ออกใบเสร็จ Redemption Code / QR สำเร็จ
    Customer->>Cashier: ยื่นหน้าจอให้ร้านค้าดู
    Cashier->>Cashier: เสิร์ฟอาหารฟรี / ลด 15% ในบิล PromptPay
```

*   **FR-5.1 ประเภทโปรโมชั่นที่ร้านค้าตั้งได้:**
    1. **Free Dish Item:** แลกอาหาร/เครื่องดื่มฟรีตามที่กำหนด (เช่น 199 $TASTE แลกชาไทย / เมนูซิกเนเจอร์)
    2. **Bill Discount:** ส่วนลดเปอร์เซ็นต์ (เช่น 500 $TASTE รับส่วนลด 15% เมื่อมียอดบิลตั้งแต่ 1,000 บาทขึ้นไป)
*   **FR-5.2 Deflationary Burn Mechanism (80 / 20 Split):**
    *   **80%** ของโทเค็นที่ใช้แลกจะโอนเข้ากระเป๋าของร้านค้า (ร้านสามารถเก็บสะสม หรือนำไปใช้ตั้งเป็น Bounty ในรอบถัดไป)
    *   **20%** ของโทเค็นจะถูกเผาทำลายทิ้งถาวร (`Burn`) เพื่อลด Circulating Supply ของระบบ สร้างมูลค่าความหายากให้แก่ $TASTE ในระยะยาว

---

## 8. UI/UX Specifications

### 8.1 Color Scheme & Branding:
* **Background:** Deep Gastronomy Dark (`#0D0F12`)
* **Primary Brand:** Avalanche Red (`#E84142`)
* **Token & Royalty Gold:** Gastronomy Gold (`#F59E0B`)
* **Verification & Audio Active:** Waveform Green (`#10B981`)
* **Accent Purple (ElevenLabs Voice):** AI Sonic Violet (`#8B5CF6`)

### 8.2 Dedicated Role UI Layouts & Wireframes:

#### A. Home Page (`/`): Platform Overview, Flows, Stats & Sponsors
```
┌────────────────────────────────────────────────────────────────────────┐
│  🍜 TasteChain BKK        [ 🍜 Customer ] [ 🏪 Owner ] [ 🛡️ Admin ]    │
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ The Trustless AI-Powered Gastronomy Protocol on Avalanche Fuji     │
│  "เปลี่ยนทุกมื้ออาหารในกรุงเทพฯ ให้เป็นสินทรัพย์ดิจิทัลที่พิสูจน์ได้จริง"│
│  [ 🔍 ค้นหาร้านอร่อย ]   [ 🏪 เจ้าของร้านคลิกที่นี่ ]   [ ⚡ Demo Judge ]│
├────────────────────────────────────────────────────────────────────────┤
│  📊 Live Protocol Statistics                                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────────┐  │
│  │ 36,369+      │ │ 1,482        │ │ 10,000 $TASTE│ │ 24 Bounties   │  │
│  │ ร้าน F&B กทม.│ │ รีวิว Verified│ │ แจกทุกเที่ยงคืน│ │ รวม 2.4M เหรียญ│ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│  🔄 Interactive User Flows (เลือกดูตาม Role)                           │
│  [ 🍜 Customer Flow ]     [ 🏪 Owner Flow ]     [ 🛡️ Admin Flow ]      │
│  • Step 1: กินอาหารที่ร้าน F&B ใน กทม. (เลือกร้านที่มีสัญลักษณ์ Bounty)   │
│  • Step 2: เลือก Proof of Review: Option 1 (สลิป) หรือ Option 2 (Shop QR)│
│  • Step 3: ฟังเสียงขอบคุณ AI ElevenLabs + ได้รับแต้มสะสมรายวันทันที    │
│  • Step 4: เคลมเหรียญ $TASTE หรือนำไปแลกคูปองส่วนลด 15% / อาหารฟรี     │
├────────────────────────────────────────────────────────────────────────┤
│  🤝 Official Sponsors & Ecosystem Partners                             │
│  ┌───────────────┬───────────────┬───────────────┬──────────────────┐  │
│  │ 🔊 ElevenLabs │ 🔺 Avalanche  │ 🎮 U-Topia    │ 🤖 U-Bot /       │  │
│  │ AI Voice Engine│ C-Chain Fuji  │ Web3 Lifestyle│ 📈 Tokenomist    │  │
│  │ 3 เสียง/ร้านค้า │ Sub-second Tx │ & Gamification│ Dynamic Tokenomic│  │
│  └───────────────┴───────────────┴───────────────┴──────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### B. Customer: Review Submission Modal (2 Proof Options)
```
┌────────────────────────────────────────────────────────────────────────┐
│  ✍️ เขียนรีวิว & Proof of Review: ข้าวมันไก่ตอนประตูน้ำ                │
├────────────────────────────────────────────────────────────────────────┤
│  ⭐ ให้คะแนน: [ ★ ★ ★ ★ ★ ] (5/5)                                      │
│  💬 ข้อความรีวิว: [ ไก่เนื้อนุ่มชุ่มฉ่ำ น้ำจิ้มเต้าเจี้ยวเด็ดมากครับ! ]│
├────────────────────────────────────────────────────────────────────────┤
│  เลือกรูปแบบการยืนยันการทานจริง (Proof of Review):                      │
│  ┌─────────────────────────────────┬─────────────────────────────────┐  │
│  │ ● Option 1: แนบสลิป PromptPay   │ ○ Option 2: สแกน QR หน้าร้าน    │  │
│  ├─────────────────────────────────┼─────────────────────────────────┤  │
│  │ 📍 GPS: 13.7501, 100.5402 (✓ ห่างร้าน 24m)                        │  │
│  │ 🍲 รูปอาหาร: [ 📷 food_photo.jpg ] (✓ pHash Verified)              │  │
│  │ 🧾 สลิป: [ 🧾 promptpay_slip.jpg ] (✓ OCR ผ่าน: 180 THB)          │  │
│  │                                 │ [ 🪧 เปิดกล้องสแกน Shop QR ]    │  │
│  └─────────────────────────────────┴─────────────────────────────────┘  │
│  [ ⚡ ยืนยันรีวิว & รับส่วนแบ่ง 10,000 $TASTE ]                         │
└────────────────────────────────────────────────────────────────────────┘
```

#### C. Owner Portal (`/owner`): Dashboard, Shop QR, KYC, Tokens & Bounties
```
┌────────────────────────────────────────────────────────────────────────┐
│  🏪 TasteChain Merchant Center (สำหรับเจ้าของร้าน)                     │
├────────────────────────────────────────────────────────────────────────┤
│  ร้านของคุณ: Stand Alone Coffee Roasters (สถานะ: 🟢 ยืนยันแล้ว)        │
│  คงเหลือในกระเป๋า: 45,200 $TASTE | 1.84 AVAX                           │
├────────────────────────────────────────────────────────────────────────┤
│  เมนูการจัดการร้าน:                                                    │
│  ┌─────────────────────────┬─────────────────────────┐                 │
│  │ 📑 ยืนยันสิทธิ์ความเป็นเจ้าของ│ ✏️ แก้ไขข้อมูลร้าน / เมนู │                 │
│  │ (อัปโหลด DBD, บัตร ปชช.) │ (เวลาเปิดปิด, รูปภาพ)    │                 │
│  ├─────────────────────────┼─────────────────────────┤                 │
│  │ 🪧 สร้าง Proof Shop QR  │ 💳 ซื้อ Platform Token   │                 │
│  │ (ดาวน์โหลดป้าย + AI Voice)│ (แลกเปลี่ยน AVAX -> TASTE)│               │
│  ├─────────────────────────┼─────────────────────────┤                 │
│  │ 💰 ตั้งแคมเปญ Bounty    │ 🎁 จัดโปรโมชั่นส่วนลด   │                 │
│  │ (ฝากเหรียญดึงคนรีวิว)    │ (แลกจานฟรี / ลด 15%)     │                 │
│  └─────────────────────────┴─────────────────────────┘                 │
└────────────────────────────────────────────────────────────────────────┘
```

#### D. Admin Portal (`/admin`): Monitoring, Logs, Owner Approvals & Manual Token Distribute
```
┌────────────────────────────────────────────────────────────────────────┐
│  🛡️ TasteChain Admin Command Center (สำหรับผู้ดูแลระบบ & กรรมการ)     │
├────────────────────────────────────────────────────────────────────────┤
│  [ 📊 Monitoring & Stats ] [ 📜 Logs ] [ 📑 Owner Approvals ] [ ⚡ Distribute ]│
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ Hackathon Demo PoC Action:                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🪙 สั่งแจกจ่ายเหรียญประจำวันแบบ Manual (Manual Token Distribute) │  │
│  │ แต้มสะสมวันนี้: 428 แต้ม จาก 32 นักชิม | โควต้า: 10,000 $TASTE   │  │
│  │ [ 🚀 คลิกเพื่อสั่ง Mint/Distribute ทันที (จำลองสิ้นวัน) ]        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  📋 คำร้องขอสิทธิ์เจ้าของร้านรอการอนุมัติ (Pending Owner Approvals):   │
│  • Stand Alone Coffee: ส่งหนังสือรับรอง DBD + รูปหน้าร้าน [ ตรวจดู ]   │
│    -> [ ✅ อนุมัติ (Approve) ]   [ ❌ ปฏิเสธ (Reject) ]                │
│  • ข้าวมันไก่ประตูน้ำ: ส่งบิลค่าน้ำค่าไฟ + รูปป้ายร้าน [ ตรวจดู ]       │
│    -> [ ✅ อนุมัติ (Approve) ]   [ ❌ ปฏิเสธ (Reject) ]                │
│                                                                        │
│  📜 Live Audit Logs:                                                   │
│  • 13:42:01 - Slip OCR verified: 180 THB (Tx: 0x8a...4b, Ref: PP941)   │
│  • 13:41:20 - Shop QR check-in: Distant 18m, Audio Slot 2 dispatched  │
│  • 13:39:10 - Merchant funded 100,000 $TASTE bounty (Tx: 0x3f...1a)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Anti-Fraud & Security Specifications

1. **Anti-Replay on Front-Shop QR:**
   * Dynamic Nonce หรือ Rotating Timestamp: URL ของ QR หน้าร้านสร้างด้วย HMAC Key เฉพาะของร้าน หมดอายุใน 5 นาที หรือใช้พิกัด Geofence บังคับ $\le 100$ เมตร
   * Rate Limit: 1 กระเป๋า ต่อ 1 ร้าน ต่อ 24 ชั่วโมง
2. **Anti-Sybil & Review Rate Limiting:**
   * **โควต้ารีวิว:** ผู้ใช้ 1 กระเป๋า สามารถรีวิวได้ **ไม่เกิน 3 ครั้ง / ร้าน / วัน** และ **รวมทั้งหมดไม่เกิน 10 ครั้ง / วัน** ทั่วทั้งระบบ
   * บังคับใช้ทั้งระดับ Backend / PostgreSQL API และระดับ On-chain Smart Contract (`TasteChainRegistry.sol`: `MAX_REVIEWS_PER_PLACE_PER_DAY = 3`, `MAX_REVIEWS_PER_DAY = 10`)
3. **Anti-Replay on PromptPay Slips:**
   * คำนวณ `SHA-256(transaction_ref_id)` และตรวจซ้ำทั้งในระดับฐานข้อมูล (`UNIQUE CONSTRAINT`) และในระดับ Smart Contract (`usedSlipHashes`)
4. **Owner Verification Governance:**
   * บังคับให้อนุมัติโดย Admin เท่านั้น ร้านค้าจึงจะสามารถแก้ไขข้อมูลร้านหรือเปิดแคมเปญในฐานะเจ้าของตัวจริงได้
5. **Deflationary Math Integrity:**
   * ทุกการแลก Promotion จะต้องผ่าน Smart Contract ที่ทำการ `burn` 20% อย่างโปร่งใส ตรวจสอบได้บน Snowtrace

---

## 10. Hackathon PoC Execution Scope

| Feature / Module | Status | Hackathon Priority |
| :--- | :---: | :--- |
| **Home Page (Flows, Stats, Sponsors)** | 🟢 Core | หน้าแรกอธิบายระบบ, สถิติสด, แนะนำ 5 Sponsors |
| **ค้นหาร้าน 36,000+ F&B กทม.** | 🟢 Core | ค้นหาเรียลไทม์ ฟิลเตอร์ตามย่าน ประเภท ดาว |
| **Proof of Review (Option 1 Slip + Option 2 QR)**| 🟢 Core | GPS + รูปอาหาร + สลิป OCR หรือ สแกน QR หน้าร้าน |
| **ElevenLabs AI Shop Voice (3 เสียง)** | 🟢 Core | สร้างและสุ่มเล่นเสียงทักทายภาษาไทยอัตโนมัติ |
| **Daily 10,000 $TASTE Emission Pool** | 🟢 Core | ปล่อยเหรียญประจำวันตามสัดส่วนแต้มรีวิว (Pioneer 2x) |
| **Owner Portal (KYC, Edit, QR, Tokens, Bounty)**| 🟢 Core | ระบบหลังบ้านร้านค้า ยืนยันสิทธิ์, ซื้อเหรียญ, ตั้งบาวน์ตี้ |
| **Admin Portal (Monitor, Logs, Approve, Distribute)**| 🟢 Core | มอนิเตอร์, ตรวจ Logs, อนุมัติสิทธิ์, ปุ่มกดแจกเหรียญ PoC |
| **Merchant Promotions (199 / 500 TASTE)** | 🟢 Core | แลกอาหารฟรี & ส่วนลด 15% พร้อม Burn 20% |
| **⚡ 1-Click Judge Wallet** | 🟢 Core | Burner Wallet + Faucet 0.1 AVAX + 10,000 $TASTE |

---

## 11. Environment & Configuration

```env
# .env.local

# ── Database ──
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tastechain

# ── Blockchain (Avalanche Fuji Testnet 43113) ──
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_EXPLORER_URL=https://testnet.snowtrace.io

# ── Deployed Contracts ──
NEXT_PUBLIC_TASTE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_DAILY_DISTRIBUTOR_ADDRESS=0x...
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_BOUNTY_ADDRESS=0x...
NEXT_PUBLIC_PROMOTION_ESCROW_ADDRESS=0x...

# ── Relayer & Faucet Wallets ──
ORACLE_PRIVATE_KEY=0x...
FAUCET_PRIVATE_KEY=0x...
FAUCET_DRIP_AVAX_AMOUNT=0.1
FAUCET_DRIP_TASTE_AMOUNT=10000

# ── AI APIs ──
# 1. OpenAI (Slip OCR)
OPENAI_API_KEY=sk-...

# 2. ElevenLabs (Shop Greeting Voices)
ELEVENLABS_API_KEY=eleven_...
ELEVENLABS_DEFAULT_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# ── App URL ──
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
