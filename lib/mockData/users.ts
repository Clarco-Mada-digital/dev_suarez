import { CardUserProps } from '@/types';

export const MOCK_USERS: Record<string, CardUserProps[]> = {
  dev: [
    {
      id: '1',
      name: 'Jean Dupont',
      jobTitle: 'Développeur Full Stack',
      skills: ['React', 'Node.js', 'TypeScript', 'Next.js', 'PostgreSQL'],
      avatarUrl: '/profile.png',
      availability: true,
      rating: 4.7,
      hourlyRate: 75,
      location: 'Paris, France'
    },
    {
      id: '2',
      name: 'Marie Martin',
      jobTitle: 'Développeuse Frontend',
      skills: ['Vue.js', 'JavaScript', 'CSS/SCSS', 'Jest'],
      avatarUrl: '/user.png',
      availability: true,
      rating: 4.9,
      hourlyRate: 85,
      location: 'Lyon, France'
    },
    {
      id: '3',
      name: 'Thomas Leroy',
      jobTitle: 'Développeur Backend',
      skills: ['Python', 'Django', 'Docker', 'AWS'],
      avatarUrl: '/profile.png',
      availability: false,
      rating: 4.5,
      hourlyRate: 90,
      location: 'Bordeaux, France'
    },
  ],
  design: [
    {
      id: '4',
      name: 'Sophie Bernard',
      jobTitle: 'UX/UI Designer',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototypage'],
      avatarUrl: '/user.png',
      availability: true,
      rating: 4.8,
      hourlyRate: 65,
      location: 'Marseille, France'
    },
    {
      id: '5',
      name: 'Lucas Petit',
      jobTitle: 'Graphiste',
      skills: ['Photoshop', 'Illustrator', 'InDesign'],
      avatarUrl: '/profile.png',
      availability: true,
      rating: 4.6,
      hourlyRate: 55,
      location: 'Toulouse, France'
    },
  ],
  marketing: [
    {
      id: '6',
      name: 'Emma Robert',
      jobTitle: 'Spécialiste SEO',
      skills: ['SEO', 'Analytics', 'Content Marketing'],
      avatarUrl: '/user.png',
      availability: true,
      rating: 4.7,
      hourlyRate: 60,
      location: 'Nantes, France'
    },
  ]
};

export const getAllUsers = (): CardUserProps[] => {
  return Object.values(MOCK_USERS).flat();
};

export const getUsersByCategory = (category: string): CardUserProps[] => {
  return MOCK_USERS[category] || [];
};
