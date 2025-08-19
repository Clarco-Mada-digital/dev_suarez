'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Users, Briefcase, DollarSign, FileSpreadsheet } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type ReportType = 'users' | 'projects' | 'financial' | 'custom'

interface Report {
  id: string
  title: string
  description: string
  type: ReportType
  format: 'csv' | 'pdf' | 'xlsx'
  lastGenerated?: Date
  size?: string
}

const reportIcons = {
  users: <Users className="h-5 w-5" />,
  projects: <Briefcase className="h-5 w-5" />,
  financial: <DollarSign className="h-5 w-5" />,
  custom: <FileText className="h-5 w-5" />
}

const formatIcons = {
  csv: <FileText className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
  xlsx: <FileSpreadsheet className="h-4 w-4" />
}

interface ReportsListProps {
  reports: Report[]
  onGenerate?: (reportId: string) => void
  isLoading?: boolean
}

export function ReportsList({ reports, onGenerate, isLoading = false }: ReportsListProps) {
  if (isLoading) {
    return <ReportsListSkeleton />
  }

  const handleDownload = (reportId: string) => {
    if (onGenerate) {
      onGenerate(reportId)
    }
    // Ici, vous pourriez implémenter la logique de téléchargement
    console.log(`Téléchargement du rapport ${reportId}...`)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="flex flex-col">
          <CardHeader className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-md bg-primary/10">
                {reportIcons[report.type]}
              </div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
            </div>
            <CardDescription className="mt-2">
              {report.description}
            </CardDescription>
            {report.lastGenerated && (
              <div className="mt-2 text-xs text-muted-foreground">
                Dernière génération: {new Date(report.lastGenerated).toLocaleDateString('fr-FR')}
                {report.size && ` • ${report.size}`}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleDownload(report.id)}
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger ({report.format.toUpperCase()})
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ReportsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
