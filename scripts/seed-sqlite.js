const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../prisma/dev.db');

// Créer une connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
    return;
  }
  console.log('✅ Connecté à la base de données SQLite');
  
  // Désactiver temporairement les contraintes de clé étrangère
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = OFF;');
    
    // Supprimer les tables existantes (dans le bon ordre pour éviter les erreurs de clé étrangère)
    db.serialize(() => {
      // Supprimer les données existantes
      db.run('DELETE FROM ProjectBid;');
      db.run('DELETE FROM ProjectSkill;');
      db.run('DELETE FROM Project;');
      db.run('DELETE FROM ProjectCategory;');
      db.run('DELETE FROM users;');
      
      console.log('🧹 Données existantes supprimées');
      
      // Insérer des catégories
      db.run(`
        INSERT INTO ProjectCategory (id, name, description) 
        VALUES 
          ('cat1', 'Développement Web', 'Sites web, applications web et services en ligne'),
          ('cat2', 'Design Graphique', 'Logos, identité visuelle, illustrations'),
          ('cat3', 'Rédaction', 'Articles, traductions, réécriture'),
          ('cat4', 'Marketing Digital', 'SEO, publicité en ligne, réseaux sociaux');
      `, function(err) {
        if (err) {
          console.error('Erreur lors de l\'insertion des catégories:', err);
          return;
        }
        console.log(`📝 ${this.changes} catégories insérées`);
        
        // Insérer des utilisateurs
        const now = new Date().toISOString();
        db.run(`
          INSERT INTO users (id, name, email, email_verified, image, created_at, updated_at)
          VALUES 
            ('user1', 'Client Entreprise', 'client1@example.com', '${now}', 'https://randomuser.me/api/portraits/men/1.jpg', '${now}', '${now}'),
            ('user2', 'Développeur Full Stack', 'dev@example.com', '${now}', 'https://randomuser.me/api/portraits/men/3.jpg', '${now}', '${now}');
        `, function(err) {
          if (err) {
            console.error('Erreur lors de l\'insertion des utilisateurs:', err);
            return;
          }
          console.log(`👥 ${this.changes} utilisateurs insérés`);
          
          // Insérer un projet
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 30);
          
          db.run(`
            INSERT INTO Project (id, title, description, budget, deadline, status, clientId, categoryId, createdAt, updatedAt)
            VALUES (
              'proj1',
              'Site vitrine pour restaurant',
              'Création d\\''un site vitrine moderne pour un restaurant avec menu en ligne et formulaire de réservation.',
              1500,
              '${deadline.toISOString()}',
              'OPEN',
              'user1',
              'cat1',
              '${now}',
              '${now}'
            );
          `, function(err) {
            if (err) {
              console.error('Erreur lors de l\'insertion du projet:', err);
              return;
            }
            console.log(`🚀 Projet inséré avec succès`);
            
            // Insérer des compétences pour le projet
            db.run(`
              INSERT INTO ProjectSkill (id, name, projectId)
              VALUES 
                ('skill1', 'React', 'proj1'),
                ('skill2', 'Next.js', 'proj1'),
                ('skill3', 'Tailwind CSS', 'proj1');
            `, function(err) {
              if (err) {
                console.error('Erreur lors de l\'insertion des compétences:', err);
                return;
              }
              console.log(`🎯 Compétences ajoutées au projet`);
              
              // Insérer une offre pour le projet
              db.run(`
                INSERT INTO ProjectBid (id, amount, proposal, status, projectId, freelancerId, createdAt, updatedAt)
                VALUES (
                  'bid1',
                  1200,
                  'Je suis intéressé par votre projet et je propose de le réaliser pour 1200€.',
                  'PENDING',
                  'proj1',
                  'user2',
                  '${now}',
                  '${now}'
                );
              `, function(err) {
                if (err) {
                  console.error('Erreur lors de l\'insertion de l\'offre:', err);
                  return;
                }
                console.log('💼 Offre ajoutée avec succès');
                console.log('\n✅ Base de données peuplée avec succès !');
                
                // Réactiver les contraintes de clé étrangère
                db.run('PRAGMA foreign_keys = ON;');
                
                // Fermer la connexion
                db.close();
              });
            });
          });
        });
      });
    });
  });
});
