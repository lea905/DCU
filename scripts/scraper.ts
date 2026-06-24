import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const seedData = [
  {
    id: 'superman-2025',
    title: 'Superman',
    releaseDate: '2025-07-11',
    duration: 135,
    universe: 'DCU',
    canon: true,
    type: 'Movie',
    status: 'In Production',
    releaseOrder: 25,
    chronologicalOrder: 41,
    summary: 'Le premier film du Chapitre 1 : Gods and Monsters du DCU.'
  },
  {
    id: 'supergirl-woman-of-tomorrow',
    title: 'Supergirl: Woman of Tomorrow',
    releaseDate: '2026-06-26',
    duration: 120,
    universe: 'DCU',
    canon: true,
    type: 'Movie',
    status: 'In Development',
    releaseOrder: 26,
    chronologicalOrder: 42,
    summary: 'Basé sur le comic de Tom King.'
  },
  {
    id: 'the-batman-2',
    title: 'The Batman Part II',
    releaseDate: '2026-10-02',
    duration: 160,
    universe: 'Elseworlds',
    canon: false,
    type: 'Movie',
    status: 'In Development',
    releaseOrder: 30,
    chronologicalOrder: 99,
    summary: 'Suite du film The Batman de Matt Reeves.'
  }
];

async function scrapeSources() {
  console.log('--- Scraping multi-sources en cours ---');
  const results = new Map();

  try {
    const headers = { 'User-Agent': 'DCUWatchOrderApp/1.0 (contact@example.com)' };

    // Source 1: Wikipedia EN (Excellent for Release Dates)
    console.log('Fetching Wikipedia EN...');
    const wikiRes = await axios.get('https://en.wikipedia.org/wiki/List_of_DC_Universe_projects', { headers });
    const $wiki = cheerio.load(wikiRes.data);
    
    $wiki('.wikitable tbody tr').each((i, row) => {
      if (i === 0) return;
      const title = $wiki(row).find('th i a, th i').first().text().trim();
      let releaseDate = $wiki(row).find('td').first().text().trim();
      
      // Clean Wiki citations [1][2]
      releaseDate = releaseDate.replace(/\[\d+\]/g, '').trim();

      if (title) {
        results.set(title, { 
          title, 
          releaseDate: releaseDate.length > 4 ? releaseDate : null,
          status: releaseDate.includes('TBA') ? 'In Development' : 'Released'
        });
      }
    });

    // Source 2: Fandom DC Database (Excellent for Summaries/Lore)
    console.log('Fetching DC Fandom...');
    const headers = { 'User-Agent': 'DCUWatchOrderApp/1.0 (contact@example.com)' };
    const fandomRes = await axios.get('https://dc.fandom.com/wiki/DC_Universe_(Film_Franchise)', { headers });
    const $fandom = cheerio.load(fandomRes.data);
    
    $fandom('.wikitable tbody tr').each((i, row) => {
      const title = $fandom(row).find('td i a').first().text().trim();
      const status = $fandom(row).find('td:nth-child(4)').text().trim(); // Example status column
      
      if (title && results.has(title)) {
        const existing = results.get(title);
        // Fandom usually has more accurate "status" for upcoming movies
        if (status.toLowerCase().includes('filming')) existing.status = 'In Production';
        else if (status.toLowerCase().includes('development')) existing.status = 'In Development';
      }
    });

  } catch (err) {
    console.error('Erreur durant le scraping:', err);
  }

  return Array.from(results.values());
}

async function main() {
  try {
    const count = await prisma.media.count();
    if (count === 0) {
      console.log('Injection du Seed initial...');
      for (const item of seedData) {
        await prisma.media.create({ data: item });
      }
    }

    const scrapedData = await scrapeSources();

    for (const scraped of scrapedData) {
      const cleanDateMatch = scraped.releaseDate ? scraped.releaseDate.match(/[A-Z][a-z]+ \d{1,2}, \d{4}/) : null;
      let isoDate = null;
      if (cleanDateMatch) {
        isoDate = new Date(cleanDateMatch[0]).toISOString().split('T')[0];
      }

      const existingMedia = await prisma.media.findFirst({
        where: { title: { contains: scraped.title } }
      });

      if (existingMedia) {
        const updateData: any = {};
        let needsUpdate = false;

        if (isoDate && existingMedia.releaseDate !== isoDate) {
          updateData.releaseDate = isoDate;
          needsUpdate = true;
        }
        if (existingMedia.status !== scraped.status && scraped.status) {
          updateData.status = scraped.status;
          needsUpdate = true;
        }

        if (needsUpdate) {
          console.log(`Mise à jour: ${existingMedia.title}`);
          await prisma.media.update({
            where: { id: existingMedia.id },
            data: updateData
          });
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
