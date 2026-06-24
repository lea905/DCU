import WatchOrderApp from './components/WatchOrderApp';
import { PrismaClient } from '@prisma/client';

export const revalidate = 3600; // Cache de 1 heure

export default async function Page() {
  const prisma = new PrismaClient();
  const media = await prisma.media.findMany({
    orderBy: { releaseOrder: 'asc' }
  });
  await prisma.$disconnect();

  return (
    <main className="app-container">
      <WatchOrderApp initialMedia={media} />
    </main>
  );
}
