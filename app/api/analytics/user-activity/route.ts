import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Vérifier si la table analytics_events existe
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_events';
    `;
    
    if (!tableExists || (Array.isArray(tableExists) && tableExists.length === 0)) {
      console.error("La table analytics_events n'existe pas");
      return NextResponse.json(
        { error: 'Table analytics_events non trouvée', success: false },
        { status: 404 }
      );
    }

    // Récupérer les 10 dernières activités utilisateur
    const recentActivities = await prisma.$queryRaw`
      SELECT 
        id,
        eventType,
        path,
        sessionId,
        userId,
        referrer,
        userAgent,
        createdAt
      FROM analytics_events
      ORDER BY createdAt DESC
      LIMIT 20
    `;

    // Formater les données pour l'affichage
    const formattedActivities = Array.isArray(recentActivities)
      ? recentActivities.map(activity => ({
          id: activity.id,
          type: activity.eventType,
          path: activity.path,
          sessionId: activity.sessionId,
          userId: activity.userId,
          referrer: activity.referrer,
          userAgent: activity.userAgent,
          timestamp: new Date(activity.createdAt).toLocaleString(),
          device: detectDeviceType(activity.userAgent || '')
        }))
      : [];

    return NextResponse.json({
      data: formattedActivities,
      success: true
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des activités utilisateur:', error);
    return NextResponse.json(
      { 
        error: 'Échec de la récupération des activités utilisateur',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour détecter le type d'appareil
function detectDeviceType(userAgent: string): string {
  if (!userAgent) return 'Inconnu';
  
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'Tablette';
  }
  if (/mobile|android|iphone|ipod|blackberry|iemobile|kindle|silk-accelerated|(android.*mobile)/i.test(ua)) {
    return 'Mobile';
  }
  
  return 'Ordinateur';
}
