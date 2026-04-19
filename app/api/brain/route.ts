import { NextRequest, NextResponse } from 'next/server';
import { getBrain, saveBrain, saveSoul } from '@/lib/brain';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const brain = await getBrain();
    return NextResponse.json({ brain });
  } catch (error) {
    console.error('Get brain error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json({ error: 'Type and content are required' }, { status: 400 });
    }

    if (type === 'brain') {
      await saveBrain(content);
    } else if (type === 'soul') {
      await saveSoul(content);
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "brain" or "soul"' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save brain error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
