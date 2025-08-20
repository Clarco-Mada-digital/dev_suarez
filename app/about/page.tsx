import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: 'À Propos - Notre Histoire et Valeurs',
  description: 'Découvrez notre entreprise, notre équipe et notre engagement envers l\'excellence. Une filiale du groupe MADA-Digital.',
};

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">À Propos de Notre Entreprise</h1>
          <p className="text-xl text-gray-600">Innovation, Excellence et Engagement</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Notre Histoire</h2>
            <p className="text-gray-700 mb-4">
              Fondée avec une vision claire d'excellence et d'innovation, notre entreprise s'est rapidement imposée comme un acteur majeur dans son domaine. Notre parcours est marqué par notre engagement envers la qualité et la satisfaction client.
            </p>
            <p className="text-gray-700 mb-6">
              En tant que filiale du groupe <a href="https://mada-digital.net" target="_blank" rel="noopener noreferrer">MADA-Digital</a>, nous bénéficions d'un réseau d'expertise et de ressources qui nous permet de proposer des solutions technologiques de pointe à nos clients.
            </p>
            <Link href="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Contactez-nous
              </Button>
            </Link>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/man.png"
              alt="Notre équipe"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Notre Partenariat avec MADA-Digital</h2>
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="bg-white p-2 rounded-full shadow-md mr-4">
                <Image
                  src="/mada-digital-logo.png"
                  alt="MADA-Digital Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold"><a href="https://mada-digital.net" target="_blank" rel="noopener noreferrer">MADA-Digital</a> </h3>
            </div>
            <p className="text-gray-700 mb-4">
              En tant que partenaire principal, MADA-Digital nous apporte son expertise dans le développement de solutions numériques innovantes. Ce partenariat stratégique nous permet de :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Bénéficier des dernières avancées technologiques</li>
              <li>Accéder à un réseau d'experts qualifiés</li>
              <li>Proposer des solutions évolutives et sécurisées</li>
              <li>Maintenir une veille technologique constante</li>
            </ul>
            <p className="text-gray-700">
              Ce partenariat renforce notre capacité à fournir des services de haute qualité tout en maintenant des normes d'excellence élevées.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">Notre Mission</h3>
            <p className="text-gray-600">Fournir des solutions innovantes qui transforment les défis en opportunités pour nos clients.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">Notre Vision</h3>
            <p className="text-gray-600">Être reconnu comme un leader dans notre domaine grâce à l'innovation et l'excellence opérationnelle.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">Nos Valeurs</h3>
            <p className="text-gray-600">Intégrité, Innovation, Excellence et Engagement envers nos clients et partenaires.</p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Rejoignez Notre Aventure</h2>
          <p className="text-gray-700 mb-6">
            Découvrez comment nous pouvons vous aider à atteindre vos objectifs grâce à des solutions sur mesure et innovantes.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Nous contacter
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline">
                Nos services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}