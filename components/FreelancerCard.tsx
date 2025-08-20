import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, CheckCircle2, Clock } from "lucide-react"

export interface FreelancerCardProps {
  freelancer: {
    id: string
    name: string
    title: string
    skills: string[]
    rating: number
    location: string
    available: boolean
    image: string
    hourlyRate: number | null | undefined
  }
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={freelancer.image || "/default-avatar.png"}
            alt={freelancer.name}
            fill
            className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            sizes="96px"
            onError={(e) => {
              // Fallback si l'image ne se charge pas
              const target = e.target as HTMLImageElement;
              target.src = "/default-avatar.png";
            }}
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {freelancer.name}
              </h3>
              <p className="text-muted-foreground">{freelancer.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {freelancer.rating > 0 && (
                <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {freelancer.rating.toFixed(1)}
                </div>
              )}
              <Badge
                variant={freelancer.available ? "default" : "secondary"}
                className="flex items-center gap-1 text-xs"
              >
                {freelancer.available ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Disponible
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    Occupé
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="mt-3 flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {freelancer.location}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {freelancer.skills.slice(0, 4).map((skill) => (
              <Badge 
                key={skill} 
                variant="secondary"
                className="text-xs font-medium"
              >
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{freelancer.skills.length - 4}
              </Badge>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">À partir de</span>{" "}
              <span className="text-lg font-bold text-primary">
                {freelancer.hourlyRate}€
              </span>
              <span className="text-muted-foreground">/heure</span>
            </div>

            <Button asChild className="w-full sm:w-auto">
              <Link href={`/freelancers/${freelancer.id}`}>
                Voir le profil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
