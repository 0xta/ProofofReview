import { NextRequest, NextResponse } from 'next/server';
import { getAdminLogs } from '@/lib/services/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    const logs = await getAdminLogs(limit);
    return NextResponse.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch admin audit logs' },
      { status: 500 }
    );
  }
}
