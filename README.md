# Plateforme Freelance Suarez

Bienvenue sur la plateforme Freelance Suarez, une application web moderne développée avec Next.js 14, conçue pour mettre en relation des clients avec des freelances qualifiés.

## 🚀 Fonctionnalités

- **Pour les clients**
  - Publication de projets avec description détaillée
  - Gestion des offres reçues
  - Suivi des projets en cours
  - Notation des freelances

- **Pour les freelances**
  - Consultation des projets disponibles
  - Soumission d'offres
  - Gestion des propositions
  - Profil personnalisable

- **Général**
  - Recherche avancée de projets et freelances
  - Catégorisation des compétences
  - Système de messagerie intégré
  - Interface utilisateur moderne et réactive

## 🛠️ Technologies utilisées

- **Frontend**
  - Next.js 14 (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - Shadcn/UI
  - React Hook Form
  - Zod (validation)

- **Backend**
  - Next.js API Routes
  - Prisma (ORM)
  - SQLite (développement)
  - NextAuth.js (authentification)

## 🚀 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Clarco-Mada-digital/dev_suarez.git
   cd dev_suarez
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurer l'environnement**
   Créez un fichier `.env` à la racine du projet avec les variables suivantes :
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="votre_secret_ici"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialiser la base de données**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Lancer l'application en mode développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

   L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
.
├── app/                    # Dossiers de l'application Next.js
│   ├── api/               # Routes API
│   ├── categories/        # Pages des catégories
│   ├── dashboard/         # Tableau de bord utilisateur
│   ├── projects/          # Gestion des projets
│   └── ...
├── components/            # Composants réutilisables
├── lib/                   # Utilitaires et configurations
├── prisma/                # Schéma et migrations Prisma
└── public/                # Fichiers statiques
```

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙋‍♂️ Auteur

- **Bryan Suarez** - [@votre_pseudo](https://github.com/votrepseudo)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
