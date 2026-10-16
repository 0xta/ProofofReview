import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/services/admin';

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin telemetry' },
      { status: 500 }
    );
  }
}
