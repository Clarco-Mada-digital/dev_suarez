import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Calculer la date d'il y a 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Récupérer les statistiques de base
    const [
      totalVisitors,
      totalPageViews,
      sessions,
      singlePageSessions,
      sessionDurations
    ] = await Promise.all([
      // Nombre de visiteurs uniques (sessions uniques)
      prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: {
          eventType: 'page_view',
          createdAt: { gte: thirtyDaysAgo }
        },
        _count: true
      }),

      // Nombre total de pages vues
      prisma.analyticsEvent.count({
        where: {
          eventType: 'page_view',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),

      // Toutes les sessions avec leurs événements
      prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: {
          eventType: 'page_view',
          createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: {
          _min: {
            createdAt: 'asc'
          }
        },
        _min: {
          createdAt: true
        },
        _max: {
          createdAt: true
        },
        _count: {
          _all: true
        }
      }),

      // Sessions avec une seule page vue
      prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: {
          eventType: 'page_view',
          createdAt: { gte: thirtyDaysAgo }
        },
        having: {
          sessionId: {
            _count: {
              equals: 1
            }
          }
        }
      })
    ]);

    // Calculer la durée moyenne des sessions
    let totalDuration = 0;
    sessions.forEach(session => {
      if (session._min.createdAt && session._max.createdAt) {
        const duration = (new Date(session._max.createdAt).getTime() - 
                         new Date(session._min.createdAt).getTime()) / 1000; // en secondes
        totalDuration += duration;
      }
    });

    const avgSessionDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;
    
    // Calculer le taux de rebond (sessions avec une seule page vue)
    const bounceRate = sessions.length > 0 ? singlePageSessions.length / sessions.length : 0;

    // Calculer les valeurs par défaut si nécessaire
    const result = {
      totalVisitors: totalVisitors?.length || 0,
      totalPageViews: totalPageViews || 0,
      avgSessionDuration: avgSessionDuration || 0,
      bounceRate: bounceRate || 0,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics stats' },
      { status: 500 }
    );
  }
}
