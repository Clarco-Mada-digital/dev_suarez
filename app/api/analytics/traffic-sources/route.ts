import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Calculer la date d'il y a 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Vérifier si la table existe
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='analytics_events';
    `;
    
    if (!tableExists || (Array.isArray(tableExists) && tableExists.length === 0)) {
      console.error('La table analytics_events n\'existe pas');
      return NextResponse.json(
        { 
          error: 'Table analytics_events non trouvée', 
          success: false 
        },
        { status: 404 }
      );
    }

    // Récupérer les sources de trafic avec les noms de colonnes corrects
    const trafficSources = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN "referrer" IS NULL OR "referrer" = '' THEN 'Direct'
          ELSE "referrer"
        END as source,
        COUNT(DISTINCT "sessionId") as visits
      FROM "analytics_events"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY 
        CASE 
          WHEN "referrer" IS NULL OR "referrer" = '' THEN 'Direct'
          ELSE "referrer"
        END
      ORDER BY visits DESC
      LIMIT 5
    `;

    // Catégoriser les sources
    const categorizedSources = (trafficSources as Array<{source: string, visits: number}>).map(item => {
      let name = item.source;
      
      if (item.source === 'Direct') return { name: 'Direct', value: item.visits };
      if (item.source.includes('google')) return { name: 'Recherche', value: item.visits };
      if (item.source.includes('facebook') || item.source.includes('twitter') || item.source.includes('linkedin')) 
        return { name: 'Réseaux sociaux', value: item.visits };
      if (item.source.includes('mail.') || item.source.includes('email')) 
        return { name: 'Email', value: item.visits };
      
      return { name: 'Autres', value: item.visits };
    });

    // Fusionner les catégories similaires
    const mergedSources = categorizedSources.reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.name);
      if (existing) {
        existing.value += curr.value;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, [] as Array<{name: string, value: number}>);

    // Convertir les BigInt en nombre avant de renvoyer la réponse
    const safeMergedSources = mergedSources.map(item => ({
      ...item,
      value: Number(item.value)
    }));

    return NextResponse.json({ 
      data: safeMergedSources,
      success: true 
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
      if ('code' in error) {
        errorMessage += ` (Code: ${error.code})`;
      }
    }
    
    return NextResponse.json(
      { 
        error: `Échec de la récupération des sources de trafic: ${errorMessage}`,
        success: false 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
