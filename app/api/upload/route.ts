import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

export async function POST(request: Request) {
  console.log('Upload request received');
  try {
    const session = await auth();
    console.log('Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user?.id) {
      console.error('Unauthorized - No session or user ID');
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    console.log('File received:', file ? `Name: ${file.name}, Size: ${file.size} bytes` : 'No file');

    if (!file) {
      console.error('No file provided in form data');
      return new NextResponse('Aucun fichier fourni', { status: 400 });
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error(`File too large: ${file.size} bytes (max: ${maxSize} bytes)`);
      return new NextResponse('La taille du fichier ne doit pas dépasser 5MB', { status: 400 });
    }

    // Vérifier le type MIME
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    console.log('File type:', file.type);
    
    if (!allowedMimeTypes.includes(file.type)) {
      console.error('Unsupported file type:', file.type);
      return new NextResponse(
        `Type de fichier non pris en charge. Types supportés: ${allowedMimeTypes.join(', ')}`, 
        { status: 400 }
      );
    }

    // Générer un nom de fichier basé sur l'ID utilisateur
    const fileExtension = file.name.split('.').pop();
    const fileName = `user-${session.user.id}.${fileExtension}`;
    
    // Chemin de destination (dans le dossier public)
    const publicFolder = join(process.cwd(), 'public', 'uploads');
    console.log('Saving file to:', publicFolder);
    
    // Supprimer l'ancienne image de profil si elle existe
    try {
      const oldFiles = fs.readdirSync(publicFolder).filter(
        f => f.startsWith(`user-${session.user.id}.`)
      );
      
      for (const oldFile of oldFiles) {
        const oldFilePath = join(publicFolder, oldFile);
        fs.unlinkSync(oldFilePath);
        console.log('Old profile image deleted:', oldFilePath);
      }
    } catch (error) {
      console.log('No old profile image to delete or error deleting:', error);
    }
    
    // Créer le dossier s'il n'existe pas
    try {
      if (!fs.existsSync(publicFolder)) {
        // Créer récursivement les dossiers nécessaires
        fs.mkdirSync(publicFolder, { recursive: true });
        console.log('Upload directory created');
      } else {
        console.log('Upload directory already exists');
      }
    } catch (error) {
      console.error('Error creating upload directory:', error);
      return new NextResponse('Erreur serveur lors de la création du dossier de destination', { status: 500 });
    }
    
    const filePath = join(publicFolder, fileName);
    
    // Lire le contenu du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Écrire le fichier sur le disque
    try {
      await writeFile(filePath, buffer);
      console.log('File saved successfully:', filePath);
    } catch (error) {
      console.error('Error saving file:', error);
      return new NextResponse('Erreur lors de l\'enregistrement du fichier', { status: 500 });
    }
    
    // Chemin d'accès public
    const publicUrl = `/uploads/${fileName}`;
    console.log('Public URL:', publicUrl);

    try {
      // Mettre à jour le profil de l'utilisateur avec la nouvelle image
      console.log('Updating user profile with new image URL:', publicUrl);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { image: publicUrl },
      });
      console.log('User profile updated successfully');
      
      return NextResponse.json({ url: publicUrl });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return new NextResponse('Erreur lors de la mise à jour du profil utilisateur', { status: 500 });
    }
    
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
