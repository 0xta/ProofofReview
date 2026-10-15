import { NextResponse } from 'next/server';
import { getPlatformStats } from '@/lib/services/places';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('API /api/stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch platform stats' },
      { status: 500 }
    );
  }
}
