export interface SeedVenue {
  id: string;
  name: string;
  nameEn: string;
  area: string;
  category: string;
  rating: number;
  reviewsCount: number;
  highlightDish: string;
  recommendedOption: 'option1' | 'option2' | 'voucher';
  sampleReceipt: {
    amount: number;
    refNumber: string;
    date: string;
    slipUrl: string;
    foodPhotoUrl: string;
  };
  sampleQr: {
    lat: number;
    lng: number;
    activeVoiceSlot: number;
    voiceName: string;
  };
  activePromo: {
    title: string;
    tasteCost: number;
    burnAmount: number;
    merchantAmount: number;
  };
  evaluatorNote: string;
}

export const CURATED_JUDGE_VENUES: SeedVenue[] = [
  {
    id: 'ChIJnfmYKIqd4jAR4qqq2_hixcg',
    name: 'เจ๊โอว ข้าวต้มเป็ด บรรทัดทอง',
    nameEn: 'Jeh O Chula (Ban That Thong)',
    area: 'บรรทัดทอง / ปทุมวัน (Ban That Thong)',
    category: 'Bangkok Street Food & Late Night',
    rating: 4.8,
    reviewsCount: 1, // < 3 so Pioneer 2x Bonus triggers!
    highlightDish: 'มาม่าต้มยำทะเลรวมมิตรหมูกรอบ (Famous Tom Yum Mama)',
    recommendedOption: 'option1',
    sampleReceipt: {
      amount: 850,
      refNumber: 'BKK-JEHO-88492',
      date: '2026-10-16 21:30',
      slipUrl: 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=600&auto=format&fit=crop&q=80',
      foodPhotoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    },
    sampleQr: {
      lat: 13.7428,
      lng: 100.5281,
      activeVoiceSlot: 1,
      voiceName: 'Warm & Welcoming (อบอุ่น ต้อนรับ)',
    },
    activePromo: {
      title: 'หมูกรอบจานเล็กฟรี (Free Crispy Pork)',
      tasteCost: 150,
      burnAmount: 120, // 80%
      merchantAmount: 30, // 20%
    },
    evaluatorNote: 'Best for testing Option 1 (Dining Receipt Slip OCR & SHA-256 Anti-Replay). Awards 20 $TASTE (2x Pioneer Multiplier) + AVAX bounty.',
  },
  {
    id: 'ChIJgz60UgCf4jARR26CSkBTLqU',
    name: 'ผัดไทยไฟทะลุ ถนนดินสอ',
    nameEn: 'Pad Thai Fai Ta Lu (Dinsor Rd)',
    area: 'ถนนดินสอ / พระนคร (Old Town Phra Nakhon)',
    category: 'Michelin Bib Gourmand Street Wok',
    rating: 4.7,
    reviewsCount: 2, // Pioneer slot 3!
    highlightDish: 'ผัดไทยไฟทะลุหมูกรอบย่างถ่าน (Flamed Pad Thai with Crispy Pork)',
    recommendedOption: 'option2',
    sampleReceipt: {
      amount: 320,
      refNumber: 'BKK-FAITALU-10294',
      date: '2026-10-16 19:15',
      slipUrl: 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=600&auto=format&fit=crop&q=80',
      foodPhotoUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
    },
    sampleQr: {
      lat: 13.7548,
      lng: 100.5015,
      activeVoiceSlot: 2,
      voiceName: 'Energetic Casual (เป็นกันเอง สตรีทฟู้ด)',
    },
    activePromo: {
      title: 'ฟรีน้ำลำไยสดดับกระหาย (Free Longan Juice)',
      tasteCost: 80,
      burnAmount: 64, // 80%
      merchantAmount: 16, // 20%
    },
    evaluatorNote: 'Best for testing Option 2 (Shop Counter QR Stand & ElevenLabs Thai Voice Greeting). Triggers instant audio playback.',
  },
  {
    id: 'ChIJEcVgHsif4jARvyo1f1YxDmo',
    name: 'ทองสมิทธ์ ก๋วยเตี๋ยวเรือ สยามพารากอน',
    nameEn: 'Thong Smith Siamese Boat Noodles (Siam)',
    area: 'สยาม / ปทุมวัน (Siam Paragon G Fl.)',
    category: 'Premium Thai Gastronomy',
    rating: 4.9,
    reviewsCount: 5,
    highlightDish: 'ก๋วยเตี๋ยวเรือเนื้อวากิวริบอายทองสุมิตร (Wagyu Ribeye Boat Noodles)',
    recommendedOption: 'voucher',
    sampleReceipt: {
      amount: 1250,
      refNumber: 'BKK-THONGS-73819',
      date: '2026-10-16 13:45',
      slipUrl: 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=600&auto=format&fit=crop&q=80',
      foodPhotoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    },
    sampleQr: {
      lat: 13.7462,
      lng: 100.5348,
      activeVoiceSlot: 3,
      voiceName: 'Chef & Luxury (เชฟแนะนำ หรูหรา)',
    },
    activePromo: {
      title: 'เกี๊ยวทอดทองสมิทธ์ลด 50% (50% Off Crispy Wontons)',
      tasteCost: 199,
      burnAmount: 159.2, // 80%
      merchantAmount: 39.8, // 20%
    },
    evaluatorNote: 'Best for testing Tokenomist 80/20 Deflationary Voucher Model. Burns 80% of $TASTE tokens permanently on Avalanche.',
  },
];
