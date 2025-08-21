import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('Début de la récupération des données de vue d\'ensemble...');
  
  try {
    // Calculer la date d'il y a 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    console.log('Période analysée: du', thirtyDaysAgo.toISOString(), 'à maintenant');

    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('Connexion à la base de données établie');

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

    // Récupérer les données agrégées par jour
    console.log('Exécution de la requête SQL...');
    // Utilisation de la syntaxe SQL directe avec les noms de colonnes corrects
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(DISTINCT "sessionId") as visitors,
        COUNT(CASE WHEN "eventType" = 'page_view' THEN 1 END) as pageViews,
        COUNT(DISTINCT CASE WHEN "userId" IS NOT NULL THEN "userId" END) as users
      FROM "analytics_events"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    console.log('Données récupérées avec succès. Nombre d\'enregistrements:', 
      Array.isArray(dailyStats) ? dailyStats.length : 0);

    // Convertir les BigInt en nombre avant de renvoyer la réponse
    const safeDailyStats = Array.isArray(dailyStats) 
      ? dailyStats.map(day => ({
          ...day,
          visitors: Number(day.visitors),
          pageViews: Number(day.pageViews),
          users: Number(day.users)
        }))
      : [];

    return NextResponse.json({ 
      data: safeDailyStats,
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
        error: `Échec de la récupération des données: ${errorMessage}`,
        success: false 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
