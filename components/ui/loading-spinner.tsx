import { Loader2 } from "lucide-react"

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="sr-only">Chargement...</span>
    </div>
  )
}

export function ButtonLoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      <span>Chargement...</span>
    </div>
  )
}
