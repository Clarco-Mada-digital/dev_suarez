'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

type ProjectStatus = 'en_cours' | 'termine' | 'en_attente' | 'annule'

interface ProjectStatsProps {
  stats: {
    status: ProjectStatus
    count: number
    percentage: number
    color: string
  }[]
  total: number
}

const statusLabels = {
  en_cours: 'En cours',
  termine: 'Terminé',
  en_attente: 'En attente',
  annule: 'Annulé'
}

export function ProjectStats({ stats, total }: ProjectStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut des projets</CardTitle>
        <CardDescription>
          Répartition des projets par statut
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold">{total} projets</div>
        
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.status} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <span 
                    className="h-2 w-2 rounded-full mr-2" 
                    style={{ backgroundColor: stat.color }}
                  />
                  <span>{statusLabels[stat.status]}</span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-medium">{stat.count}</span>
                  <span className="text-muted-foreground">
                    ({stat.percentage}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={stat.percentage} 
                className="h-2" 
                indicatorClassName={stat.color}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectStatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
