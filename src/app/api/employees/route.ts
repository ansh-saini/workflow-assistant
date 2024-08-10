import { NextResponse } from 'next/server';

export async function GET() {
  const employees = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' },
  ];
  return NextResponse.json(employees);
}

export async function POST() {
  return NextResponse.json({ hello: 'Next.js' });
}
