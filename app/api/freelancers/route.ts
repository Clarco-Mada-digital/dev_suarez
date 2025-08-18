import { NextResponse } from 'next/server';
import { getFreelancers } from '@/services/freelancerService';

export async function GET() {
  try {
    const freelancers = await getFreelancers();
    return NextResponse.json(freelancers);
  } catch (error) {
    console.error('Error in GET /api/freelancers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des freelances' },
      { status: 500 }
    );
  }
}
