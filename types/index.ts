// Types de base
export type Availability = 'available' | 'unavailable' | 'soon';

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: string;
}

export interface Review {
  id: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  jobTitle: string;
  company?: string;
  hourlyRate?: number;
  availability: Availability;
  skills: Skill[];
  experience: {
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
  }[];
  reviews: Review[];
  averageRating: number;
  ratingCount?: number;
  completedProjects: number;
  memberSince: Date;
  languages: {
    name: string;
    level: 'basic' | 'conversational' | 'fluent' | 'native';
  }[];
  links?: {
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// Types pour les props des composants
export interface CardUserProps {
  id: string;
  name: string;
  jobTitle: string;
  skills: string[];
  avatarUrl: string;
  availability: boolean;
  rating?: number;
  ratingCount?: number;
  hourlyRate?: number;
  location?: string;
  completedProjects?: number;
}

// Types pour les filtres
export interface UserFilters {
  searchQuery?: string;
  categories?: string[];
  skills?: string[];
  minRating?: number;
  maxHourlyRate?: number;
  availability?: boolean;
  location?: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
