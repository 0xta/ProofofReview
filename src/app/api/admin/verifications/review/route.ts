import { NextRequest, NextResponse } from 'next/server';
import { reviewOwnerVerification } from '@/lib/services/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { verificationId, adminAddress, decision, adminNotes } = body;

    if (!verificationId || !adminAddress || !decision) {
      return NextResponse.json(
        { success: false, error: 'verificationId, adminAddress, and decision (APPROVE or REJECT) are required.' },
        { status: 400 }
      );
    }

    const result = await reviewOwnerVerification({
      verificationId,
      adminAddress,
      decision,
      adminNotes,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `KYC verification request has been ${result.status.toLowerCase()} successfully.`,
    });
  } catch (error: any) {
    console.error('Error reviewing verification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to review verification' },
      { status: 400 }
    );
  }
}
