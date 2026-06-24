import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: {
        releaseOrder: 'asc',
      },
    });
    
    return NextResponse.json(media);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
