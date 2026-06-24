import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

// Liste de base (Fallback) au cas où le scraping échoue ou pour initialiser
const seedData = [
  {
    id: 'superman-2025',
    title: 'Superman',
    releaseDate: '2025-07-11',
    duration: 135,
    universe: 'DCU',
    canon: true,
    type: 'Movie',
    releaseOrder: 25,
    chronologicalOrder: 41,
    posterUrl: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Superman',
    summary: 'Le premier film du Chapitre 1 : Gods and Monsters du DCU de James Gunn.'
  },
  {
    id: 'creature-commandos',
    title: 'Creature Commandos',
    releaseDate: '2024-12-05',
    duration: 220,
    universe: 'DCU',
    canon: true,
    type: 'Series',
    releaseOrder: 24,
    chronologicalOrder: 40,
    posterUrl: 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Creature+Commandos',
    summary: 'Série animée inaugurant le DCU, suivant une équipe de monstres recrutés par Amanda Waller.'
  }
  // (Le reste de la base exhaustive sera initialisé manuellement ou via un seed complet)
];

async function scrapeWikipedia() {
  console.log('Démarrage du script de scraping...');
  try {
    // Exemple de scraping Wikipedia pour récupérer d'éventuelles dates de sortie
    // Note: L'URL exacte et les sélecteurs dépendent fortement de la structure de Wikipédia
    const url = 'https://en.wikipedia.org/wiki/DC_Universe_(franchise)';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extraction hypothétique : on cherche les tableaux de la section "Films"
    const movies: { title: string; releaseDate: string; }[] = [];
    $('.wikitable tbody tr').each((i, row) => {
      if (i === 0) return; // Skip header
      const title = $(row).find('th i a, th i').first().text().trim();
      const releaseDate = $(row).find('td').first().text().trim();
      
      if (title && releaseDate) {
        movies.push({ title, releaseDate });
      }
    });

    console.log(`Données scrapées trouvées : ${movies.length} films potentiels.`);
    return movies;

  } catch (error) {
    console.error('Erreur lors du scraping de Wikipédia :', error);
    return [];
  }
}

async function main() {
  try {
    // 1. Initialiser la base de données avec le seed s'il n'y a pas de données
    const count = await prisma.media.count();
    if (count === 0) {
      console.log('Base de données vide. Initialisation avec les données de base...');
      for (const item of seedData) {
        await prisma.media.create({ data: item });
      }
      console.log('Initialisation terminée.');
    }

    // 2. Tenter de scraper les mises à jour (ex: nouvelles dates)
    const scrapedData = await scrapeWikipedia();
    
    // 3. Mettre à jour la base de données avec précaution
    for (const scrapedItem of scrapedData) {
      // Nettoyage sommaire de la date (ex: "July 11, 2025[12]")
      const cleanDateMatch = scrapedItem.releaseDate.match(/[A-Z][a-z]+ \d{1,2}, \d{4}/);
      
      if (cleanDateMatch) {
        const cleanDate = new Date(cleanDateMatch[0]).toISOString().split('T')[0];
        
        // Mettre à jour si le film existe déjà (par titre partiel ou exact)
        const existingMedia = await prisma.media.findFirst({
          where: { title: { contains: scrapedItem.title } }
        });

        if (existingMedia && existingMedia.releaseDate !== cleanDate) {
          console.log(`Mise à jour de la date de sortie pour ${existingMedia.title}: ${existingMedia.releaseDate} -> ${cleanDate}`);
          await prisma.media.update({
            where: { id: existingMedia.id },
            data: { releaseDate: cleanDate, updatedAt: new Date() }
          });
        }
      }
    }

    console.log('Script exécuté avec succès.');
  } catch (error) {
    console.error('Erreur critique dans le processus principal :', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Lancement automatique du script
main();
