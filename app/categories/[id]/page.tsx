import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CategoryDetail } from "@/components/CategoryDetail"
import { LoadingSkeleton } from "@/components/Loading"
import { CategoryBanner } from "@/components/CategoryBanner"
import { Breadcrumb } from "@/components/Breadcrumb"

// Données temporaires - À remplacer par des appels API
const categories = {
  "1": {
    id: "1",
    name: "Site & Développement",
    description: "Développeurs web et applications pour tous vos besoins techniques",
    icon: "/dev-icon.png",
    popularSkills: [
      { id: "react", name: "React" },
      { id: "node", name: "Node.js" },
      { id: "typescript", name: "TypeScript" },
      { id: "nextjs", name: "Next.js" },
      { id: "php", name: "PHP" },
      { id: "laravel", name: "Laravel" },
    ],
    freelancers: Array(15).fill(null).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Développeur ${i + 1}`,
      title: ["Full Stack", "Front-end", "Back-end", "Mobile", "DevOps"][i % 5],
      skills: [
        ["React", "Node.js", "TypeScript", "MongoDB"],
        ["Vue.js", "JavaScript", "CSS", "HTML"],
        ["Python", "Django", "PostgreSQL", "Docker"],
        ["React Native", "Flutter", "iOS", "Android"],
        ["AWS", "Kubernetes", "Terraform", "CI/CD"]
      ][i % 5],
      rating: 4 + Math.random(),
      location: ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga", "Fianarantsoa"][i % 5],
      available: Math.random() > 0.3,
      image: `https://i.pravatar.cc/150?img=${i % 70 + 1}`,
      hourlyRate: 30 + Math.floor(Math.random() * 50)
    }))
  },
  "2": {
    id: "2",
    name: "Community",
    description: "Des experts en gestion de communauté et réseaux sociaux",
    icon: "/man.png",
    popularSkills: [
      { id: "community", name: "Gestion de communauté" },
      { id: "social", name: "Réseaux sociaux" },
      { id: "moderation", name: "Modération" },
      { id: "animation", name: "Animation" },
    ],
    freelancers: Array(10).fill(null).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Community Manager ${i + 1}`,
      title: ["Community Manager", "Animateur", "Modérateur", "Stratège"][i % 4],
      skills: [
        ["Facebook", "Instagram", "Twitter", "LinkedIn"],
        ["Animation", "Engagement", "Création de contenu"],
        ["Modération", "Relation client", "Support"],
        ["Stratégie", "Analyse", "Reporting"]
      ][i % 4],
      rating: 4.2 + Math.random() * 0.8,
      location: ["Antananarivo", "Toamasina", "Antsirabe"][i % 3],
      available: Math.random() > 0.4,
      image: `https://i.pravatar.cc/150?img=${(i % 70) + 10}`,
      hourlyRate: 20 + Math.floor(Math.random() * 40)
    }))
  },
  "3": {
    id: "3",
    name: "Design & Graphisme",
    description: "Des designers créatifs pour tous vos besoins graphiques",
    icon: "/designe.png",
    popularSkills: [
      { id: "uiux", name: "UI/UX Design" },
      { id: "graphism", name: "Graphisme" },
      { id: "motion", name: "Motion Design" },
      { id: "branding", name: "Identité visuelle" },
    ],
    freelancers: Array(12).fill(null).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Designer ${i + 1}`,
      title: ["UI/UX Designer", "Graphiste", "Motion Designer", "Directeur Artistique"][i % 4],
      skills: [
        ["Figma", "Sketch", "Adobe XD", "UI/UX"],
        ["Photoshop", "Illustrator", "InDesign", "Print"],
        ["After Effects", "Motion Design", "Animation"],
        ["Branding", "Identité visuelle", "Charte graphique"]
      ][i % 4],
      rating: 4.3 + Math.random() * 0.7,
      location: ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga"][i % 4],
      available: Math.random() > 0.3,
      image: `https://i.pravatar.cc/150?img=${(i % 70) + 20}`,
      hourlyRate: 25 + Math.floor(Math.random() * 45)
    }))
  },
  "4": {
    id: "4",
    name: "SEO & Communication",
    description: "Des experts en référencement et stratégie de communication",
    icon: "/seo.png",
    popularSkills: [
      { id: "seo", name: "Référencement" },
      { id: "content", name: "Content Marketing" },
      { id: "com", name: "Communication" },
      { id: "analytics", name: "Analytics" },
    ],
    freelancers: Array(10).fill(null).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Expert ${i + 1}`,
      title: ["Consultant SEO", "Content Manager", "Responsable Com", "Analyste"][i % 4],
      skills: [
        ["SEO", "Référencement", "Backlinks", "Netlinking"],
        ["Rédaction", "Stratégie de contenu", "Blogging"],
        ["Relations presse", "RP", "Communication d'entreprise"],
        ["Google Analytics", "Google Search Console", "Data Studio"]
      ][i % 4],
      rating: 4.4 + Math.random() * 0.6,
      location: ["Antananarivo", "Toamasina", "Antsirabe"][i % 3],
      available: Math.random() > 0.35,
      image: `https://i.pravatar.cc/150?img=${(i % 70) + 30}`,
      hourlyRate: 30 + Math.floor(Math.random() * 50)
    }))
  },
  "5": {
    id: "5",
    name: "Réseaux sociaux",
    description: "Gestion complète de vos réseaux sociaux",
    icon: "/reseau.png",
    popularSkills: [
      { id: "instagram", name: "Instagram" },
      { id: "facebook", name: "Facebook" },
      { id: "tiktok", name: "TikTok" },
      { id: "youtube", name: "YouTube" },
    ],
    freelancers: Array(12).fill(null).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Social Media ${i + 1}`,
      title: ["Social Media Manager", "Influenceur", "Créateur de contenu", "Stratège"][i % 4],
      skills: [
        ["Instagram", "Stories", "Reels", "IGTV"],
        ["Facebook", "Groupes", "Pages", "Publicités"],
        ["TikTok", "Shorts", "Vidéo", "Trends"],
        ["YouTube", "Vlogging", "SEO Vidéo", "Monétisation"]
      ][i % 4],
      rating: 4.3 + Math.random() * 0.7,
      location: ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga"][i % 4],
      available: Math.random() > 0.4,
      image: `https://i.pravatar.cc/150?img=${(i % 70) + 40}`,
      hourlyRate: 35 + Math.floor(Math.random() * 45)
    }))
  },
  "6": {
    id: "6",
    name: "Rédaction",
    description: "Des rédacteurs professionnels pour tous vos contenus",
    icon: "/redacteur.png",
    popularSkills: [
      { id: "web", name: "Rédaction web" },
      { id: "seo", name: "Rédaction SEO" },
      { id: "tech", name: "Rédaction technique" },
      { id: "correction", name: "Correction" },
    ],
    freelancers: Array(10).fill(null).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Rédacteur ${i + 1}`,
      title: ["Rédacteur Web", "Rédacteur SEO", "Rédacteur Technique", "Correcteur"][i % 4],
      skills: [
        ["Articles", "Blog", "Fiches produits", "Newsletters"],
        ["Mots-clés", "Balises", "Netlinking", "SEO"],
        ["Documentation", "Manuels", "Tutoriaux", "Articles techniques"],
        ["Correction", "Relecture", "Réécriture", "Mise en forme"]
      ][i % 4],
      rating: 4.5 + Math.random() * 0.5,
      location: ["Antananarivo", "Toamasina", "Antsirabe"][i % 3],
      available: Math.random() > 0.3,
      image: `https://i.pravatar.cc/150?img=${(i % 70) + 50}`,
      hourlyRate: 20 + Math.floor(Math.random() * 40)
    }))
  },
  "7": {
    id: "7",
    name: "AudioVisuel",
    description: "Professionnels de l'image et du son pour vos projets créatifs",
    icon: "/audioVisuel.png",
    popularSkills: [
      { id: "video", name: "Vidéo" },
      { id: "photo", name: "Photographie" },
      { id: "son", name: "Son" },
      { id: "montage", name: "Montage" },
    ],
    freelancers: Array(8).fill(null).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Pro AV ${i + 1}`,
      title: ["Vidéaste", "Photographe", "Preneur de son", "Monteur"][i % 4],
      skills: [
        ["Tournage", "Caméra", "Cadrage", "Éclairage"],
        ["Photo", "Retouche", "Studio", "Extérieur"],
        ["Prise de son", "Mixage", "Podcast", "Voix off"],
        ["Montage", "Étalonnage", "Effets spéciaux", "Motion"]
      ][i % 4],
      rating: 4.4 + Math.random() * 0.6,
      location: ["Antananarivo", "Toamasina", "Antsirabe", "Mahajanga"][i % 4],
      available: Math.random() > 0.4,
      image: `https://i.pravatar.cc/150?img=${(i % 70) + 60}`,
      hourlyRate: 40 + Math.floor(Math.random() * 60)
    }))
  },
  "8": {
    id: "8",
    name: "Formation & Coaching",
    description: "Experts en formation et accompagnement professionnel",
    icon: "/formation.png",
    popularSkills: [
      { id: "formation", name: "Formation" },
      { id: "coaching", name: "Coaching" },
      { id: "mentorat", name: "Mentorat" },
      { id: "consulting", name: "Consulting" },
    ],
    freelancers: Array(10).fill(null).map((_, i) => ({
      id: (i + 1).toString(),
      name: `Formateur ${i + 1}`,
      title: ["Formateur", "Coach", "Mentor", "Consultant"][i % 4],
      skills: [
        ["Formation présentielle", "E-learning", "Ateliers", "Webinaires"],
        ["Coaching individuel", "Développement personnel", "Leadership"],
        ["Mentorat", "Accompagnement", "Conseil d'orientation"],
        ["Analyse des besoins", "Stratégie", "Optimisation"]
      ][i % 4],
      rating: 4.6 + Math.random() * 0.4,
      location: ["Antananarivo", "Toamasina", "Antsirabe"][i % 3],
      available: Math.random() > 0.5,
      image: `https://i.pravatar.cc/150?img=${(i % 70) + 70}`,
      hourlyRate: 50 + Math.floor(Math.random() * 70)
    }))
  }
}

export default function CategoryPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Récupérer la catégorie correspondante ou renvoyer une 404
  const category = categories[params.id as keyof typeof categories]
  
  // Vérifier si la catégorie existe
  if (!category) {
    // Afficher une page 404 personnalisée
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl font-bold text-gray-400 dark:text-gray-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Catégorie introuvable</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Désolé, nous n'avons pas pu trouver la catégorie que vous recherchez.
          </p>
          <a 
            href="/categories/1" 
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Voir les catégories disponibles
          </a>
        </div>
      </div>
    )
  }

  const currentPage = searchParams.page ? parseInt(searchParams.page as string) : 1
  const itemsPerPage = 5

  // Simulation de pagination
  const totalItems = category.freelancers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedFreelancers = category.freelancers.slice(startIndex, startIndex + itemsPerPage)

  // Données de bannière pour chaque catégorie
  const bannerData = {
    "1": {
      name: "Développement Web & Mobile",
      description: "Trouvez les meilleurs développeurs pour votre projet. Des experts en React, Node.js, Python et plus encore.",
      imageUrl: "/banner-dev.jpg"
    },
    "2": {
      name: "Design Graphique",
      description: "Donnez vie à vos idées avec nos designers créatifs. Logos, identité visuelle, supports print et bien plus.",
      imageUrl: "/banner-design.jpg"
    },
    // Ajoutez d'autres catégories ici
  }[params.id] || {
    name: category.name,
    description: category.description,
    imageUrl: "/banner-default.jpg"
  }

  return (
    <div className="min-h-screen">
      <CategoryBanner 
        name={bannerData.name} 
        description={bannerData.description} 
        imageUrl={bannerData.imageUrl} 
      />
      <div className="container mx-auto px-4 py-8">
        {/* Fil d'Ariane */}
        <Breadcrumb 
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Catégories', href: '/categories' },
            { label: category.name, href: `#`, active: true }
          ]} 
          className="mb-8"
        />
        
        <div className="py-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <CategoryDetail
              category={{
                ...category,
                freelancers: paginatedFreelancers,
                pagination: {
                  currentPage,
                  totalPages,
                  totalItems,
                  itemsPerPage
                }
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// Génération des pages statiques
export async function generateStaticParams() {
  return Object.keys(categories).map((id) => ({
    id,
  }))
}
