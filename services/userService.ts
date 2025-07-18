import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Interface pour le profil utilisateur
interface UserProfileData {
  id?: string;
  clerkId: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  jobTitle?: string;
  skills: string[];
  availability?: boolean;
  rating?: number;
  hourlyRate?: number;
  location?: string;
  bio?: string;
  website?: string;
  phoneNumber?: string;
  company?: string;
  emailVerified?: Date | null;
  lastSignInAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les données de mise à jour du profil
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  skills?: string[] | null;
  availability?: boolean | null;
  rating?: number | null;
  hourlyRate?: number | null;
}

// Interface pour les données brutes de la base de données
interface RawUserProfile {
  id: string;
  clerkId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  emailVerified: Date | null;
  lastSignInAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  profileId?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  phoneNumber?: string | null;
  skills?: string | null;
  availability?: boolean | null;
  rating?: number | null;
  hourlyRate?: number | null;
}

/**
 * Récupère un utilisateur par son ID Clerk
 */
export async function getUserByClerkId(clerkId: string): Promise<UserProfileData | null> {
  try {
    console.log('Recherche de l\'utilisateur avec clerkId:', clerkId);
    
    // 1. Récupérer d'abord l'utilisateur
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        lastSignInAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      console.log('Aucun utilisateur trouvé avec clerkId:', clerkId);
      return null;
    }
    
    console.log('Utilisateur trouvé:', user);
    
    // 2. Récupérer le profil associé
    const profile = await prisma.$queryRaw`
      SELECT 
        id as "profileId", 
        bio, 
        location, 
        website, 
        job_title as "jobTitle", 
        company, 
        phone_number as "phoneNumber",
        skills, 
        availability, 
        rating, 
        hourly_rate as "hourlyRate"
      FROM user_profiles 
      WHERE "userId" = ${user.id}
      LIMIT 1
    ` as any[];
    
    const profileData = profile && profile.length > 0 ? profile[0] : null;
    console.log('Données du profil:', profileData);
    
    // Convertir les compétences si elles existent
    let skills: string[] = [];
    if (profileData?.skills) {
      try {
        skills = typeof profileData.skills === 'string' ? JSON.parse(profileData.skills) : [];
      } catch (e) {
        console.error('Erreur lors du parsing des compétences:', e);
        skills = [];
      }
    }

    // Créer un objet de résultat avec les champs obligatoires
    const result: UserProfileData = {
      id: user.id,
      clerkId: user.clerkId,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
      skills: Array.isArray(skills) ? skills : [],
      availability: profileData?.availability === true,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    };

    // Ajouter les champs optionnels s'ils existent
    if (user.image) result.image = user.image;
    if (profileData?.jobTitle) result.jobTitle = profileData.jobTitle;
    if (profileData?.rating !== undefined && profileData.rating !== null) {
      result.rating = Number(profileData.rating);
    }
    if (profileData?.hourlyRate !== undefined && profileData.hourlyRate !== null) {
      result.hourlyRate = Number(profileData.hourlyRate);
    }
    if (profileData?.location) result.location = profileData.location;
    if (profileData?.bio) result.bio = profileData.bio;
    if (profileData?.website) result.website = profileData.website;
    if (profileData?.phoneNumber) result.phoneNumber = profileData.phoneNumber;
    if (profileData?.company) result.company = profileData.company;
    if (user.emailVerified) result.emailVerified = user.emailVerified;
    if (user.lastSignInAt) result.lastSignInAt = user.lastSignInAt;

    console.log('Données du profil formatées:', result);
    return result;
  } catch (error) {
    console.error('Error fetching user by clerk ID:', error);
    throw error;
  }
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateUserProfile(
  clerkId: string, 
  data: UpdateProfileData
): Promise<UserProfileData> {
  try {
    console.log('Mise à jour du profil pour clerkId:', clerkId, 'avec les données:', data);
    
    // 1. Mettre à jour les informations de base de l'utilisateur
    const name = data.firstName && data.lastName 
      ? `${data.firstName} ${data.lastName}` 
      : data.firstName || data.lastName || null;
    
    if (name || data.email) {
      // Construire la requête SQL dynamiquement
      const updates: string[] = [];
      const params: any[] = [];
      
      if (name) {
        updates.push(`name = ?`);
        params.push(name);
      }
      
      if (data.email) {
        updates.push(`email = ?`);
        params.push(data.email);
      }
      
      updates.push(`updated_at = NOW()`);
      
      // Ajouter le clerkId aux paramètres pour la clause WHERE
      params.push(clerkId);
      
      // Construire la requête SQL finale
      const query = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE clerk_id = ?
      `;
      
      console.log('Requête de mise à jour utilisateur:', query);
      console.log('Paramètres:', params);
      
      // Exécuter la requête avec les paramètres
      await prisma.$executeRawUnsafe(query, ...params);
    }

    // 2. Récupérer l'utilisateur pour obtenir son ID
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { clerkId },
        select: { 
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          emailVerified: true,
          lastSignInAt: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        console.error('Utilisateur non trouvé avec le clerkId:', clerkId);
        throw new Error('Utilisateur non trouvé');
      }
      
      console.log('Utilisateur trouvé pour la mise à jour:', user.id);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw new Error(`Échec de la récupération de l'utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    // 3. Vérifier si un profil existe déjà pour cet utilisateur
    let existingProfile;
    try {
      console.log('Vérification de l\'existence du profil pour l\'utilisateur:', user.id);
      existingProfile = await prisma.$queryRaw`
        SELECT id FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
      ` as any[];
      
      console.log('Résultat de la vérification du profil:', existingProfile);
    } catch (error) {
      console.error('Erreur lors de la vérification du profil existant:', error);
      throw new Error(`Échec de la vérification du profil: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    // 4. Préparer les données du profil
    const profileData: any = {};
    
    // Ajouter uniquement les champs qui sont définis dans data
    if (data.phoneNumber !== undefined) profileData.phoneNumber = data.phoneNumber;
    if (data.bio !== undefined) profileData.bio = data.bio;
    if (data.location !== undefined) profileData.location = data.location;
    if (data.website !== undefined) profileData.website = data.website;
    if (data.jobTitle !== undefined) profileData.jobTitle = data.jobTitle;
    if (data.company !== undefined) profileData.company = data.company;
    if (data.skills !== undefined) profileData.skills = JSON.stringify(data.skills);
    if (data.availability !== undefined) profileData.availability = data.availability;
    if (data.rating !== undefined) profileData.rating = data.rating;
    if (data.hourlyRate !== undefined) profileData.hourlyRate = data.hourlyRate;
    
    // 4. Mettre à jour ou créer le profil
    if (Object.keys(profileData).length > 0) {
      try {
        console.log('Préparation de la mise à jour/création du profil avec les données:', profileData);
        
        if (existingProfile && existingProfile.length > 0) {
          console.log('Mise à jour du profil existant pour l\'utilisateur:', user.id);
          
          // Construire la requête de mise à jour dynamiquement
          const updates: string[] = [];
          const updateParams: Record<string, any> = {};
          let paramIndex = 1;
          
          const addParam = (value: any, column: string) => {
            const paramName = `p${paramIndex++}`;
            updateParams[paramName] = value;
            return `$${paramName}`;
          };
          
          if ('phoneNumber' in profileData) {
            updates.push(`phone_number = ${addParam(profileData.phoneNumber, 'phoneNumber')}`);
          }
          if ('bio' in profileData) {
            updates.push(`bio = ${addParam(profileData.bio, 'bio')}`);
          }
          if ('location' in profileData) {
            updates.push(`location = ${addParam(profileData.location, 'location')}`);
          }
          if ('website' in profileData) {
            updates.push(`website = ${addParam(profileData.website, 'website')}`);
          }
          if ('jobTitle' in profileData) {
            updates.push(`job_title = ${addParam(profileData.jobTitle, 'jobTitle')}`);
          }
          if ('company' in profileData) {
            updates.push(`company = ${addParam(profileData.company, 'company')}`);
          }
          if ('skills' in profileData) {
            updates.push(`skills = ${addParam(JSON.stringify(profileData.skills || []), 'skills')}`);
          }
          if ('availability' in profileData) {
            updates.push(`availability = ${addParam(profileData.availability || false, 'availability')}`);
          }
          if ('rating' in profileData) {
            updates.push(`rating = ${addParam(profileData.rating, 'rating')}`);
          }
          if ('hourlyRate' in profileData) {
            updates.push(`hourly_rate = ${addParam(profileData.hourlyRate, 'hourlyRate')}`);
          }
          
          // Ajouter la date de mise à jour (utiliser CURRENT_TIMESTAMP pour SQLite)
          updates.push('updated_at = CURRENT_TIMESTAMP');
          
          // Ajouter l'ID utilisateur pour la clause WHERE
          const userIdParam = `p${paramIndex++}`;
          updateParams[userIdParam] = user.id;
          
          // Construire et exécuter la requête
          const query = `
            UPDATE user_profiles
            SET ${updates.join(', ')}
            WHERE user_id = $${userIdParam}
          `;
          
          console.log('Requête de mise à jour du profil:', query);
          console.log('Paramètres:', JSON.stringify(updateParams, null, 2));
          
          await prisma.$executeRawUnsafe(query, ...Object.values(updateParams));
          console.log('Profil mis à jour avec succès');
          
        } else {
          console.log('Création d\'un nouveau profil pour l\'utilisateur:', user.id);
          
          // Créer la liste des colonnes
          const columns = [
            'id', 'user_id', 'phone_number', 'bio', 'location', 'website',
            'job_title', 'company', 'skills', 'availability', 'rating', 'hourly_rate',
            'created_at', 'updated_at'
          ];
          
          // Ajouter chaque champ avec un paramètre nommé
          const id = uuidv4();
          
          // Construire la requête avec des valeurs directes pour les dates
          const query = `
            INSERT INTO user_profiles (
              id, user_id, phone_number, bio, location, website,
              job_title, company, skills, availability, rating, hourly_rate,
              created_at, updated_at
            )
            VALUES (
              $p1, $p2, $p3, $p4, $p5, $p6, $p7, $p8, $p9, $p10, $p11, $p12,
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `;
          
          // Paramètres pour la requête
          const params: Record<string, any> = {
            p1: id,
            p2: user.id,
            p3: profileData.phoneNumber ?? null,
            p4: profileData.bio ?? null,
            p5: profileData.location ?? null,
            p6: profileData.website ?? null,
            p7: profileData.jobTitle ?? null,
            p8: profileData.company ?? null,
            p9: profileData.skills ? JSON.stringify(profileData.skills) : '[]',
            p10: profileData.availability ?? false,
            p11: profileData.rating ?? null,
            p12: profileData.hourlyRate ?? null
          };
          
          console.log('Requête de création de profil:', query);
          console.log('Paramètres:', JSON.stringify(params, null, 2));
          
          await prisma.$executeRawUnsafe(query, ...Object.values(params));
          console.log('Nouveau profil créé avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour/création du profil:', error);
        throw new Error(`Échec de la mise à jour du profil: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
    
    // 5. Récupérer les données mises à jour pour les retourner
    const updatedUser = await prisma.$queryRaw<RawUserProfile[]>`
      SELECT 
        u.id, u.clerk_id as "clerkId", u.name, u.email, u.image, u.role,
        u.email_verified as "emailVerified", u.last_sign_in_at as "lastSignInAt",
        u.created_at as "createdAt", u.updated_at as "updatedAt",
        p.id as "profileId", p.bio, p.location, p.website, 
        p.job_title as "jobTitle", p.company, p.phone_number as "phoneNumber",
        p.skills, p.availability, p.rating, p.hourly_rate as "hourlyRate"
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.clerk_id = ${clerkId}
    `;

    if (!updatedUser || updatedUser.length === 0) {
      throw new Error('Échec de la récupération des données mises à jour');
    }

    const updatedUserData = updatedUser[0];
    
    // Convertir les compétences si elles existent
    let skills: string[] = [];
    if (updatedUserData.skills) {
      try {
        skills = typeof updatedUserData.skills === 'string' 
          ? JSON.parse(updatedUserData.skills) 
          : [];
      } catch (e) {
        console.error('Erreur lors du parsing des compétences:', e);
        skills = [];
      }
    }

    // Créer un objet de résultat avec les champs obligatoires
    const result: UserProfileData = {
      id: updatedUserData.id,
      clerkId: updatedUserData.clerkId,
      name: updatedUserData.name || '',
      email: updatedUserData.email || '',
      role: updatedUserData.role || 'USER',
      skills,
      availability: updatedUserData.availability === true,
      createdAt: updatedUserData.createdAt ? new Date(updatedUserData.createdAt) : new Date(),
      updatedAt: updatedUserData.updatedAt ? new Date(updatedUserData.updatedAt) : new Date()
    };

    // Ajouter les champs optionnels s'ils existent
    if (updatedUserData.image) result.image = updatedUserData.image;
    if (updatedUserData.jobTitle) result.jobTitle = updatedUserData.jobTitle;
    if (updatedUserData.rating !== undefined && updatedUserData.rating !== null) {
      result.rating = Number(updatedUserData.rating);
    }
    if (updatedUserData.hourlyRate !== undefined && updatedUserData.hourlyRate !== null) {
      result.hourlyRate = Number(updatedUserData.hourlyRate);
    }
    if (updatedUserData.location) result.location = updatedUserData.location;
    if (updatedUserData.bio) result.bio = updatedUserData.bio;
    if (updatedUserData.website) result.website = updatedUserData.website;
    if (updatedUserData.phoneNumber) result.phoneNumber = updatedUserData.phoneNumber;
    if (updatedUserData.company) result.company = updatedUserData.company;
    if (updatedUserData.emailVerified) {
      result.emailVerified = new Date(updatedUserData.emailVerified);
    }
    if (updatedUserData.lastSignInAt) {
      result.lastSignInAt = new Date(updatedUserData.lastSignInAt);
    }

    console.log('Profil mis à jour avec succès:', result);
    return result;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Récupère les meilleurs freelancers
 */
export async function getTopFreelancers(limit: number = 6): Promise<UserProfileData[]> {
  try {
    // Utiliser une requête SQL brute pour éviter les problèmes de typage
    const users = await prisma.$queryRaw<RawUserProfile[]>`
      SELECT 
        u.id, u.clerk_id as "clerkId", u.name, u.email, u.image, u.role,
        u.email_verified as "emailVerified", u.last_sign_in_at as "lastSignInAt",
        u.created_at as "createdAt", u.updated_at as "updatedAt",
        p.id as "profileId", p.bio, p.location, p.website, 
        p.job_title as "jobTitle", p.company, p.phone_number as "phoneNumber",
        p.skills, p.availability, p.rating, p.hourly_rate as "hourlyRate"
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.role = 'FREELANCER'
      ORDER BY u.created_at DESC
      LIMIT ${limit}
    `;

    // Transformer les données pour correspondre à l'interface attendue
    return users.map(user => ({
      id: user.id,
      clerkId: user.clerkId,
      name: user.name || '',
      email: user.email || '',
      image: user.image || undefined,
      role: user.role,
      jobTitle: user.jobTitle || undefined,
      skills: user.skills ? JSON.parse(user.skills) : [],
      availability: user.availability || false,
      rating: user.rating || undefined,
      hourlyRate: user.hourlyRate || undefined,
      location: user.location || '',
      bio: user.bio || '',
      website: user.website || '',
      phoneNumber: user.phoneNumber || '',
      company: user.company || '',
      emailVerified: user.emailVerified || undefined,
      lastSignInAt: user.lastSignInAt || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching top freelancers:', error);
    return [];
  }
}
