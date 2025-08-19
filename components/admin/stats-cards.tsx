'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, Equal } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  description?: string
}

export function StatCard({ title, value, change, changeType, icon, description }: StatCardProps) {
  const ChangeIcon = 
    changeType === 'increase' ? ArrowUp :
    changeType === 'decrease' ? ArrowDown : Equal
  
  const changeColor = 
    changeType === 'increase' ? 'text-green-600 dark:text-green-400' :
    changeType === 'decrease' ? 'text-red-600 dark:text-red-400' :
    'text-amber-600 dark:text-amber-400'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <ChangeIcon className={`h-3 w-3 mr-1 ${changeColor}`} />
          <span className={changeColor}>
            {change} {description || 'par rapport au mois dernier'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
    </Card>
  )
}
