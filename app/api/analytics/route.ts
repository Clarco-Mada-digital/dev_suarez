import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Enregistrer l'événement dans la base de données
    await prisma.analyticsEvent.create({
      data: {
        eventType: data.name,
        path: data.path,
        sessionId: data.sessionId,
        referrer: data.referrer,
        userAgent: data.userAgent,
        screenWidth: data.screenWidth,
        screenHeight: data.screenHeight,
        language: data.language,
        timestamp: new Date(data.timestamp),
        additionalData: data,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to save analytics event' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Récupérer les statistiques de base
    const [totalVisitors, totalPageViews, topPages] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { eventType: 'page_view' },
        distinct: ['sessionId'],
      }),
      prisma.analyticsEvent.count({
        where: { eventType: 'page_view' },
      }),
      prisma.$queryRaw`
        SELECT path, COUNT(*) as count
        FROM "AnalyticsEvent"
        WHERE "eventType" = 'page_view'
        GROUP BY path
        ORDER BY count DESC
        LIMIT 10
      `,
    ]);

    return NextResponse.json({
      totalVisitors,
      totalPageViews,
      topPages,
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
