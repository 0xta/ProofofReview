import { NextRequest, NextResponse } from 'next/server';
import { getOwnerVerifications, seedDemoKycApplications } from '@/lib/services/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    // Seed if table is empty
    await seedDemoKycApplications();

    const verifications = await getOwnerVerifications(status);
    return NextResponse.json({
      success: true,
      count: verifications.length,
      data: verifications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}
