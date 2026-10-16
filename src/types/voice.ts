export interface ShopVoice {
  id: string;
  place_id: string;
  slot_number: number;
  title: string;
  script_text: string;
  voice_id: string;
  audio_url: string;
  duration_seconds: number | null;
  is_active: boolean;
  play_count: number;
  created_at: string;
}

export interface VoicePersona {
  slot: number;
  id: string;
  name: string;
  style: string;
  elevenLabsVoiceId: string;
  defaultTitle: string;
  defaultScript: (shopName: string) => string;
}

export const THAI_VOICE_PERSONAS: Record<number, VoicePersona> = {
  1: {
    slot: 1,
    id: 'warm',
    name: 'Warm & Welcoming (อบอุ่น ต้อนรับ)',
    style: 'อบอุ่น สุภาพ เหมาะสำหรับร้านอาหารครอบครัวและคาเฟ่',
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    defaultTitle: 'ยินดีต้อนรับสู่ร้าน',
    defaultScript: (shopName: string) =>
      `ยินดีต้อนรับสู่ร้าน ${shopName} ครับ ขอขอบคุณที่แวะมาลิ้มรสความอร่อยและสัมผัสบรรยากาศดีๆ กับเราในวันนี้ เชิญรับประทานให้อร่อยนะครับ!`,
  },
  2: {
    slot: 2,
    id: 'energetic',
    name: 'Energetic & Casual (เป็นกันเอง สตรีทฟู้ด)',
    style: 'กระฉับกระเฉง สดใส เหมาะสำหรับร้านสตรีทฟู้ดและร้านอาหารจานด่วน',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    defaultTitle: 'เมนูแนะนำประจำร้าน',
    defaultScript: (shopName: string) =>
      `สวัสดีครับผม! ขอบคุณที่แวะมาร้าน ${shopName} ขอแนะนำเมนูเด็ดปรุงสดใหม่ทุกจาน ทานให้อร่อยและมีความสุขกับมื้อนี้นะครับ!`,
  },
  3: {
    slot: 3,
    id: 'luxury',
    name: 'Chef & Signature (เชฟแนะนำ หรูหรา)',
    style: 'สุขุม พรีเมียม เหมาะสำหรับบาร์ บิสโทร และร้าน Fine Dining',
    elevenLabsVoiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi
    defaultTitle: 'ขอบคุณผู้มีอุปการคุณ',
    defaultScript: (shopName: string) =>
      `ขอขอบคุณทุกท่านที่ร่วมสนับสนุนร้าน ${shopName} และเครือข่าย TasteChain BKK วันนี้ท่านได้รับแต้มความพยายามพิเศษสะสม $TASTE เรียบร้อยแล้วครับ`,
  },
};
