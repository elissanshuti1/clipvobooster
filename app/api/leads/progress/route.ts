import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getProgress } from '@/lib/progress-store';

// GET - Get current generation progress for user
export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = String(payload.sub);
    const progress = getProgress(userId);

    if (!progress) {
      return NextResponse.json({
        stage: 'idle',
        postsFound: 0,
        batchesAnalyzed: 0,
        totalBatches: 0,
        matchesFound: 0
      });
    }

    return NextResponse.json(progress);

  } catch (err: any) {
    console.error('Get progress error:', err.message);
    return NextResponse.json(
      { error: 'Failed to get progress', details: err.message },
      { status: 500 }
    );
  }
}
