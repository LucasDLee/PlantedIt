import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const res = await fetch(`https://www.plantsolve.com/api/v1/plants/${slug}.json`);

  if (!res.ok) {
    return NextResponse.json({ error: 'Not found' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}