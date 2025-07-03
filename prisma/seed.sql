-- Nettoyer les données existantes
DELETE FROM "ProjectBid";
DELETE FROM "ProjectSkill";
DELETE FROM "Project";
DELETE FROM "ProjectCategory";
DELETE FROM "User";

-- Réinitialiser les séquences
DELETE FROM sqlite_sequence WHERE name IN ('ProjectBid', 'ProjectSkill', 'Project', 'ProjectCategory', 'User');

-- Insérer des catégories
INSERT INTO "ProjectCategory" ("id", "name", "description") VALUES 
(1, 'Développement Web', 'Sites web, applications web et services en ligne'),
(2, 'Design Graphique', 'Logos, identité visuelle, illustrations'),
(3, 'Rédaction', 'Articles, traductions, réécriture'),
(4, 'Marketing Digital', 'SEO, publicité en ligne, réseaux sociaux');

-- Insérer des utilisateurs test
-- Note: Les mots de passe sont 'password123' hashés avec bcrypt
INSERT INTO "User" ("id", "name", "email", "emailVerified", "image") VALUES
(1, 'Client Entreprise', 'client1@example.com', CURRENT_TIMESTAMP, 'https://randomuser.me/api/portraits/men/1.jpg'),
(2, 'Startup Innovante', 'client2@example.com', CURRENT_TIMESTAMP, 'https://randomuser.me/api/portraits/women/2.jpg'),
(3, 'Développeur Full Stack', 'dev@example.com', CURRENT_TIMESTAMP, 'https://randomuser.me/api/portraits/men/3.jpg'),
(4, 'Designer UI/UX', 'designer@example.com', CURRENT_TIMESTAMP, 'https://randomuser.me/api/portraits/women/4.jpg');

-- Insérer des projets
INSERT INTO "Project" ("id", "title", "description", "budget", "deadline", "status", "categoryId", "clientId", "createdAt", "updatedAt") VALUES
(1, 'Site vitrine pour restaurant', 'Je cherche un développeur pour créer un site vitrine moderne pour mon restaurant. Le site doit inclure :
- Page d''accueil avec diaporama de plats
- Menu en ligne avec catégories
- Formulaire de réservation
- Page de contact avec carte Google Maps
- Design responsive

Le site doit être optimisé pour le référencement et rapide à charger.', 1500, datetime('now', '+30 days'), 'OPEN', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Refonte de logo et identité visuelle', 'Je lance ma marque de vêtements éco-responsables et j''ai besoin d''une identité visuelle complète :
- Création d''un logo moderne et mémorable
- Charte graphique (couleurs, typographie)
- Supports de communication (cartes de visite, en-têtes réseaux sociaux)

Je recherche un design épuré, moderne avec une touche naturelle.', 800, datetime('now', '+14 days'), 'OPEN', 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Application de gestion de tâches', 'Développement d''une application web de gestion de tâches avec les fonctionnalités suivantes :
- Création et gestion de projets
- Tableau Kanban
- Calendrier intégré
- Notifications en temps réel
- Authentification utilisateur

Stack technique : MERN (MongoDB, Express, React, Node.js)', 3500, datetime('now', '+60 days'), 'OPEN', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insérer des compétences pour les projets
INSERT INTO "ProjectSkill" ("id", "name", "projectId") VALUES
(1, 'React', 1),
(2, 'Next.js', 1),
(3, 'Tailwind CSS', 1),
(4, 'Responsive Design', 1),
(5, 'Logo Design', 2),
(6, 'Brand Identity', 2),
(7, 'Adobe Illustrator', 2),
(8, 'MongoDB', 3),
(9, 'Express', 3),
(10, 'React', 3),
(11, 'Node.js', 3),
(12, 'WebSocket', 3);

-- Insérer des offres
INSERT INTO "ProjectBid" ("id", "amount", "proposal", "status", "projectId", "freelancerId", "createdAt", "updatedAt") VALUES
(1, 1200, 'Bonjour,

Je suis un développeur Full Stack avec 5 ans d''expérience dans la création de sites web pour des restaurants. J''ai déjà réalisé plusieurs projets similaires que je peux vous montrer.

Pour votre projet, je propose :
- Développement avec Next.js pour des performances optimales
- Design responsive et moderne
- Intégration avec un système de réservation
- Optimisation SEO
- Formation à l''utilisation du back-office

Je suis disponible pour commencer dès la semaine prochaine.

Cordialement,', 'PENDING', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Mettre à jour les séquences
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM "ProjectBid") WHERE name = 'ProjectBid';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM "ProjectSkill") WHERE name = 'ProjectSkill';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM "Project") WHERE name = 'Project';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM "ProjectCategory") WHERE name = 'ProjectCategory';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM "User") WHERE name = 'User';
