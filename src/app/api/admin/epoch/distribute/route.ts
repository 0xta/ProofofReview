import { NextRequest, NextResponse } from 'next/server';
import { distributeDailyEpoch } from '@/lib/services/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminAddress = body.adminAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const epochDate = body.epochDate || undefined;

    const result = await distributeDailyEpoch(adminAddress, epochDate);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Daily Epoch ${result.epochDate} distributed successfully! Distributed ${result.totalEmissionTokens} $TASTE among ${result.totalParticipants} participants.`,
    });
  } catch (error: any) {
    console.error('Error distributing daily epoch:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to distribute daily epoch' },
      { status: 400 }
    );
  }
}
