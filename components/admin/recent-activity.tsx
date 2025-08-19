'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, Clock, User, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

type ActivityType = 'user' | 'project' | 'payment' | 'system'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: Date
  user: {
    name: string
    avatar?: string
  }
  status?: 'success' | 'error' | 'warning' | 'info'
}

const activityIcons = {
  user: <User className="h-4 w-4" />,
  project: <FileText className="h-4 w-4" />,
  payment: <CheckCircle className="h-4 w-4" />,
  system: <Activity className="h-4 w-4" />,
}

const statusColors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
}

const statusIcons = {
  success: <CheckCircle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  warning: <AlertCircle className="h-4 w-4" />,
  info: <AlertCircle className="h-4 w-4" />,
}

interface RecentActivityProps {
  activities: ActivityItem[]
  maxItems?: number
}

export function RecentActivity({ activities, maxItems = 5 }: RecentActivityProps) {
  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Activité récente
        </CardTitle>
        <CardDescription>
          Les dernières activités sur la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayedActivities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                {activityIcons[activity.type]}
              </div>
            </div>
            <div className="ml-4 flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <div className="ml-2 flex-shrink-0 flex">
                  {activity.status && (
                    <span className={`${statusColors[activity.status]} mr-2`}>
                      {statusIcons[activity.status]}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(activity.timestamp), { 
                      addSuffix: true,
                      locale: fr 
                    })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>
              {activity.user && (
                <div className="mt-2 flex items-center">
                  <span className="text-xs text-muted-foreground">
                    Par {activity.user.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Aucune activité récente
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="ml-4 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
