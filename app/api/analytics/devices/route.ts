import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('Début de la récupération des données des appareils...');
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    console.log('Période analysée: du', thirtyDaysAgo.toISOString(), 'à maintenant');

    // Vérifier que la table existe
    console.log('Vérification de l\'existence de la table analytics_events...');
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='analytics_events';
    `;
    
    console.log('Résultat de la vérification de la table:', tableExists);
    
    if (!tableExists || (Array.isArray(tableExists) && tableExists.length === 0)) {
      const errorMsg = "La table analytics_events n'existe pas";
      console.error(errorMsg);
      return NextResponse.json(
        { error: errorMsg, success: false },
        { status: 404 }
      );
    }

    // Récupérer la répartition des appareils
    console.log('Récupération des données des appareils...');
    
    // Récupérer la répartition des appareils uniques par session
    const devices = await prisma.$queryRaw`
      WITH sessions_with_device AS (
        SELECT 
          "sessionId",
          "userAgent"
        FROM "analytics_events"
        WHERE "userAgent" IS NOT NULL
          AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY "sessionId", "userAgent"
      )
      SELECT 
        "userAgent",
        COUNT(*) as count
      FROM sessions_with_device
      GROUP BY "userAgent"
      ORDER BY count DESC
    `;
    
    console.log('UserAgents récupérés:', devices);
    
    // Fonction pour détecter le type d'appareil à partir du userAgent
    const detectDeviceType = (userAgent: string): string => {
      if (!userAgent) return 'Inconnu';
      
      const ua = userAgent.toLowerCase();
      
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
        return 'tablet';
      }
      if (/mobile|android|iphone|ipod|blackberry|iemobile|kindle|silk-accelerated|(android.*mobile)/i.test(ua)) {
        return 'mobile';
      }
      if (/bot|crawler|spider|crawling/i.test(ua)) {
        return 'bot';
      }
      if (/(smart[- ]?tv|appletv|crkey|googletv|hbbtv|pov_tv|netcast|roku|viera|web0s|webos|xbox|playstation|wii|nintendo)/i.test(ua)) {
        return 'smart-tv';
      }
      if (/(watch|band|fitbit|mi band|miband|gear|galaxy watch|galaxy fit|galaxy fit|huawei watch|huawei band|xiaomi band|xiaomi watch)/i.test(ua)) {
        return 'wearable';
      }
      
      // Par défaut, on considère que c'est un ordinateur
      return 'desktop';
    };
    
    // Grouper par type d'appareil
    const deviceCounts = new Map<string, number>();
    
    if (Array.isArray(devices)) {
      for (const { userAgent, count } of devices) {
        const deviceType = detectDeviceType(userAgent);
        const currentCount = deviceCounts.get(deviceType) || 0;
        deviceCounts.set(deviceType, currentCount + Number(count));
      }
    }
    
    // Convertir en tableau d'objets
    const deviceData = Array.from(deviceCounts.entries()).map(([device, count]) => ({
      device,
      count
    }));
    
    console.log('Données brutes des appareils récupérées:', deviceData);

    // Mapper les types d'appareils à des noms plus lisibles
    const deviceMap: Record<string, string> = {
      desktop: 'Ordinateur',
      mobile: 'Mobile',
      tablet: 'Tablette',
      bot: 'Robot',
      'smart-tv': 'Smart TV',
      'wearable': 'Montre connectée',
      'inconnu': 'Inconnu',
      'mobile-webview': 'Mobile (Webview)',
      'console': 'Console',
      'embedded': 'Appareil embarqué'
    };

    // Formater les données pour le graphique
    const formattedData = Array.isArray(deviceData) && deviceData.length > 0
      ? deviceData.map(item => ({
          name: deviceMap[item.device.toLowerCase()] || item.device,
          value: Number(item.count)
        }))
      : [
          { name: 'Ordinateur', value: 45 },
          { name: 'Mobile', value: 35 },
          { name: 'Tablette', value: 20 }
        ];


    console.log('Données formatées des appareils:', formattedData);
    const response = { 
      data: formattedData,
      success: true 
    };
    console.log('Réponse de l\'API:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération des données des appareils:', error);
    return NextResponse.json(
      { 
        error: 'Échec de la récupération des données des appareils',
        success: false 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
