import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const res = await fetch(`https://coords.zone/api/v1/zone?lat=${lat}&lng=${lng}`);

  if (!res.ok) {
    return NextResponse.json({ error: 'Upstream error' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}