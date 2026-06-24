import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { mediaId, watched } = body;

    if (watched) {
      await prisma.userMediaProgress.upsert({
        where: {
          userId_mediaId: { userId: session.user.id, mediaId }
        },
        update: {},
        create: {
          userId: session.user.id,
          mediaId
        }
      });
    } else {
      await prisma.userMediaProgress.delete({
        where: {
          userId_mediaId: { userId: session.user.id, mediaId }
        }
      }).catch(() => {}); // ignore if doesn't exist
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
