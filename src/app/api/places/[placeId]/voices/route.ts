import { NextRequest, NextResponse } from 'next/server';
import { getPlaceById } from '@/lib/services/places';
import {
  getShopVoices,
  saveShopVoice,
  synthesizeThaiVoice,
  THAI_VOICE_PERSONAS,
} from '@/lib/services/elevenlabs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params;
    const place = await getPlaceById(placeId);
    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    const voices = await getShopVoices(placeId, place.name);
    return NextResponse.json({
      success: true,
      placeId,
      venueName: place.name,
      voices,
    });
  } catch (error: any) {
    console.error('API /api/places/[placeId]/voices GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const { placeId } = params;
    const body = await request.json();
    const { slotNumber, title, scriptText, voiceId } = body;

    if (!slotNumber || slotNumber < 1 || slotNumber > 3) {
      return NextResponse.json(
        { success: false, error: 'slotNumber must be between 1 and 3' },
        { status: 400 }
      );
    }

    if (!scriptText || scriptText.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'scriptText cannot be empty' },
        { status: 400 }
      );
    }

    const persona = THAI_VOICE_PERSONAS[slotNumber];
    const voiceTitle = title || persona.defaultTitle;

    // Synthesize audio
    const synthesisResult = await synthesizeThaiVoice({
      placeId,
      slotNumber,
      scriptText,
      voiceId: voiceId || persona.elevenLabsVoiceId,
    });

    // Save to Database
    const savedVoice = await saveShopVoice({
      placeId,
      slotNumber,
      title: voiceTitle,
      scriptText,
      voiceId: voiceId || persona.elevenLabsVoiceId,
      audioUrl: synthesisResult.audioUrl,
      durationSeconds: synthesisResult.durationSeconds,
    });

    return NextResponse.json({
      success: true,
      voice: savedVoice,
      isMock: synthesisResult.isMock,
    });
  } catch (error: any) {
    console.error('API /api/places/[placeId]/voices POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to synthesize voice' },
      { status: 500 }
    );
  }
}
