import fs from 'fs';
import path from 'path';
import { query } from '../db';
import { ShopVoice, VoicePersona, THAI_VOICE_PERSONAS } from '@/types/voice';

export type { ShopVoice, VoicePersona };
export { THAI_VOICE_PERSONAS };


/**
 * Generate a standard PCM WAV header with silent/sine sound for fallback audio
 */
function createMockWavBuffer(durationSec: number = 3): Buffer {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = sampleRate * durationSec;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat PCM = 1
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Sine wave tone (440Hz A4)
  const frequency = 440;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 * 32767;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }

  return buffer;
}

/**
 * Synthesize voice using ElevenLabs Multilingual V2 or fallback mock generator
 */
export async function synthesizeThaiVoice(params: {
  placeId: string;
  slotNumber: number;
  scriptText: string;
  voiceId?: string;
}): Promise<{ audioUrl: string; durationSeconds: number; isMock: boolean }> {
  const { placeId, slotNumber, scriptText } = params;
  const persona = THAI_VOICE_PERSONAS[slotNumber] || THAI_VOICE_PERSONAS[1];
  const voiceId = params.voiceId || persona.elevenLabsVoiceId;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const publicDir = path.resolve(process.cwd(), 'public/audio/voices');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filename = `${placeId}_slot${slotNumber}.wav`;
  const filePath = path.join(publicDir, filename);
  const audioUrl = `/audio/voices/${filename}`;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: scriptText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
        return {
          audioUrl,
          durationSeconds: 4.5,
          isMock: false,
        };
      } else {
        console.warn(`ElevenLabs API returned ${response.status}. Using high-quality mock audio.`);
      }
    } catch (err) {
      console.error('ElevenLabs API fetch error:', err);
    }
  }

  // Fallback: Generate mock WAV
  const mockBuffer = createMockWavBuffer(3.5);
  fs.writeFileSync(filePath, mockBuffer);

  return {
    audioUrl,
    durationSeconds: 3.5,
    isMock: true,
  };
}

/**
 * Upsert a shop voice into PostgreSQL
 */
export async function saveShopVoice(params: {
  placeId: string;
  slotNumber: number;
  title: string;
  scriptText: string;
  voiceId?: string;
  audioUrl: string;
  durationSeconds?: number;
}): Promise<ShopVoice> {
  const { placeId, slotNumber, title, scriptText, audioUrl, durationSeconds = 3.5 } = params;
  const persona = THAI_VOICE_PERSONAS[slotNumber] || THAI_VOICE_PERSONAS[1];
  const voiceId = params.voiceId || persona.elevenLabsVoiceId;

  const sql = `
    INSERT INTO shop_voices (
      place_id, slot_number, title, script_text, voice_id, audio_url, duration_seconds, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    ON CONFLICT (place_id, slot_number)
    DO UPDATE SET 
      title = EXCLUDED.title,
      script_text = EXCLUDED.script_text,
      voice_id = EXCLUDED.voice_id,
      audio_url = EXCLUDED.audio_url,
      duration_seconds = EXCLUDED.duration_seconds,
      is_active = true
    RETURNING *;
  `;

  const rows = await query<ShopVoice>(sql, [
    placeId,
    slotNumber,
    title,
    scriptText,
    voiceId,
    audioUrl,
    durationSeconds,
  ]);

  return rows[0];
}

/**
 * Fetch all voice slots for a given venue (defaults to 3 personas if not yet saved)
 */
export async function getShopVoices(placeId: string, venueName: string = 'TasteChain Venue'): Promise<ShopVoice[]> {
  const sql = `
    SELECT * FROM shop_voices 
    WHERE place_id = $1 
    ORDER BY slot_number ASC;
  `;
  const existingVoices = await query<ShopVoice>(sql, [placeId]);

  // If 3 slots exist, return them
  if (existingVoices.length >= 3) {
    return existingVoices;
  }

  // Otherwise, populate missing default slots
  const result: ShopVoice[] = [...existingVoices];
  const existingSlots = new Set(existingVoices.map((v) => v.slot_number));

  for (let slot = 1; slot <= 3; slot++) {
    if (!existingSlots.has(slot)) {
      const persona = THAI_VOICE_PERSONAS[slot];
      const defaultVoice = await saveShopVoice({
        placeId,
        slotNumber: slot,
        title: persona.defaultTitle,
        scriptText: persona.defaultScript(venueName),
        voiceId: persona.elevenLabsVoiceId,
        audioUrl: `/audio/voices/${placeId}_slot${slot}.wav`,
        durationSeconds: 3.5,
      });
      result.push(defaultVoice);
    }
  }

  return result.sort((a, b) => a.slot_number - b.slot_number);
}
