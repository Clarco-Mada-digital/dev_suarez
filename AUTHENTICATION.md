# Authentification avec Clerk

Ce document explique comment l'authentification est mise en place dans ce projet en utilisant Clerk et comment interagir avec elle.

## Configuration requise

1. Créez un compte sur [Clerk](https://clerk.com/)
2. Créez une nouvelle application dans le tableau de bord Clerk
3. Copiez les clés d'API et ajoutez-les à votre fichier `.env.local`

## Variables d'environnement

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Base de données
DATABASE_URL="file:./dev.db"
```

## Fonctionnalités implémentées

### 1. Authentification

- Inscription et connexion des utilisateurs
- Réinitialisation de mot de passe
- Mise à jour du profil utilisateur
- Gestion des sessions

### 2. Rôles et autorisations

- Système de rôles intégré (USER, ADMIN)
- Protection des routes basée sur les rôles
- Composants d'autorisation conditionnelle

### 3. Webhooks

- Synchronisation automatique des utilisateurs Clerk avec la base de données locale
- Mise à jour des profils en temps réel

## Utilisation

### Protection des routes

```tsx
import { AuthRequired } from '@/components/auth/auth-required';

export default function ProtectedPage() {
  return (
    <AuthRequired>
      <div>Contenu protégé</div>
    </AuthRequired>
  );
}
```

### Vérification des rôles

```tsx
import { RoleBased } from '@/components/auth/role-based';

export default function AdminPage() {
  return (
    <RoleBased allowedRoles={['ADMIN']}>
      <div>Panneau d'administration</div>
    </RoleBased>
  );
}
```

### Accès aux informations de l'utilisateur

```tsx
'use client';

import { useUser } from '@/hooks/use-user';

export default function UserProfile() {
  const { user, loading, error } = useUser();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  if (!user) return <div>Non connecté</div>;

  return (
    <div>
      <h1>Bonjour, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Rôle: {user.role}</p>
    </div>
  );
}
```

## Configuration des webhooks

1. Allez dans le tableau de bord Clerk
2. Accédez à la section "Webhooks"
3. Créez un nouveau webhook avec l'URL : `https://votredomaine.com/api/webhooks/clerk`
4. Sélectionnez les événements :
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Ajoutez le secret webhook à votre fichier `.env.local`

## Développement

### Migrations de base de données

Après avoir modifié le schéma Prisma, exécutez :

```bash
npx prisma migrate dev --name update_user_model
```

### Redémarrage du serveur

Après avoir modifié les variables d'environnement, redémarrez le serveur de développement :

```bash
npm run dev
```

## Sécurité

- Ne partagez jamais les clés secrètes
- Utilisez toujours HTTPS en production
- Mettez à jour régulièrement les dépendances
- Vérifiez les autorisations des utilisateurs côté serveur

## Dépannage

### Problèmes de connexion

1. Vérifiez que les clés d'API sont correctement configurées
2. Assurez-vous que les URL de redirection sont correctement configurées dans le tableau de bord Clerk
3. Vérifiez les journaux du serveur pour les erreurs

### Problèmes de base de données

1. Exécutez `npx prisma generate` pour régénérer le client Prisma
2. Vérifiez que la base de données est accessible
3. Vérifiez les migrations en attente avec `npx prisma migrate status`
