import Image from "next/image"

interface CategoryBannerProps {
  name: string
  description: string
  imageUrl: string
}

export function CategoryBanner({ name, description, imageUrl }: CategoryBannerProps) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover opacity-20 dark:opacity-10"
          priority
        />
      </div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">{name}</h1>
          <p className="text-xl text-blue-100 dark:text-blue-200">{description}</p>
          
          {/* Statistiques de la catégorie */}
          <div className="mt-8 flex flex-wrap gap-4 sm:gap-6">
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10 dark:border-white/5">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm sm:text-base">Freelances</div>
            </div>
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10 dark:border-white/5">
              <div className="text-2xl font-bold">4.8/5</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm sm:text-base">Note moyenne</div>
            </div>
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10 dark:border-white/5">
              <div className="text-2xl font-bold">98%</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm sm:text-base">Satisfaction client</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
