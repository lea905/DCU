import WatchOrderApp from './components/WatchOrderApp';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const revalidate = 3600; // Cache de 1 heure

export default async function Page() {
  const session = await auth();
  
  const media = await prisma.media.findMany({
    orderBy: { releaseOrder: 'asc' }
  });

  let userProgress: string[] = [];
  
  if (session?.user?.id) {
    const progress = await prisma.userMediaProgress.findMany({
      where: { userId: session.user.id },
      select: { mediaId: true }
    });
    userProgress = progress.map(p => p.mediaId);
  }

  return (
    <main className="app-container">
      <WatchOrderApp 
        initialMedia={media} 
        serverProgress={userProgress} 
        isLoggedIn={!!session?.user} 
      />
    </main>
  );
}
