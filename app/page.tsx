"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { DashboardStatsCards } from "@/components/dashboard-stats"
import { ProductivityStats } from "@/components/productivity-stats"
import { UpcomingObligations } from "@/components/upcoming-obligations"
import { ClientOverview } from "@/components/client-overview"
import { TaxCalendar } from "@/components/tax-calendar"
import { getClients, getTaxes, getInstallments, getObligations } from "@/lib/supabase/database"
import { calculateDashboardStats, getObligationsWithDetails } from "@/lib/dashboard-utils" 
import { TrendingUp, AlertCircle, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adjustForWeekend } from "@/lib/date-utils"
import type { Client, Tax, Installment, ObligationWithDetails } from "@/lib/types" // Adicionado ObligationWithDetails

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalObligations: 0,
    pendingObligations: 0,
    completedThisMonth: 0,
    overdueObligations: 0,
    upcomingThisWeek: 0,
  })
  // A lista que será usada pelos componentes do Dashboard com os detalhes
  const [obligationsWithDetails, setObligationsWithDetails] = useState<ObligationWithDetails[]>([]) 
  const [clients, setClients] = useState<Client[]>([])
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)

  const updateData = async () => {
    setLoading(true)
    try {
      const [clientsData, taxesData, installmentsData, obligationsData] = await Promise.all([
        getClients(),
        getTaxes(),
        getInstallments(),
        getObligations(),
      ])

      // 1. Cria a lista de obrigações com detalhes de cliente/imposto anexados
      const detailedObligations = getObligationsWithDetails(obligationsData, clientsData, taxesData)

      setClients(clientsData)
      setTaxes(taxesData)
      setInstallments(installmentsData)
      setObligationsWithDetails(detailedObligations) // Salva a lista detalhada

      // 2. Calcula os stats usando a lista de clientes e a lista detalhada
      setStats(calculateDashboardStats(clientsData, detailedObligations))
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    updateData()
  }, [])

  // Filtros agora usam a lista detalhada (obligationsWithDetails)
  const criticalAlerts = obligationsWithDetails.filter( 
    (o) => o.status === "overdue" || (o.status === "pending" && new Date(o.calculatedDueDate) <= new Date()),
  )

  const criticalInstallments = installments.filter((inst) => {
    if (inst.status === "completed") return false
    const firstDue = new Date(inst.firstDueDate)
    const monthsToAdd = inst.currentInstallment - 1
    const dueDate = new Date(firstDue.getFullYear(), firstDue.getMonth() + monthsToAdd, inst.dueDay)
    const adjustedDueDate = adjustForWeekend(dueDate, inst.weekendRule)
    return adjustedDueDate <= new Date()
  })

  const thisWeekObligations = obligationsWithDetails.filter((o) => {
    const dueDate = new Date(o.calculatedDueDate)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return dueDate >= today && dueDate <= nextWeek && o.status !== "completed"
  })

  const thisWeekInstallments = installments.filter((inst) => {
    if (inst.status === "completed") return false
    const firstDue = new Date(inst.firstDueDate)
    const monthsToAdd = inst.currentInstallment - 1
    const dueDate = new Date(firstDue.getFullYear(), firstDue.getMonth() + monthsToAdd, inst.dueDay)
    const adjustedDueDate = adjustForWeekend(dueDate, inst.weekendRule)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return adjustedDueDate >= today && adjustedDueDate <= nextWeek
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-balance">Dashboard Fiscal</h1>
            <p className="text-lg text-muted-foreground">Controle completo de prazos e vencimentos</p>
          </div>

          {loading ? (
            <Card className="p-8">
              <p className="text-center text-muted-foreground">Carregando dados...</p>
            </Card>
          ) : (
            <>
              {(criticalAlerts.length > 0 || criticalInstallments.length > 0) && (
                <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertCircle className="size-5" />
                      Alertas Críticos
                    </CardTitle>
                    <CardDescription>Itens que requerem atenção imediata</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {criticalAlerts.slice(0, 3).map((obl) => {
                        const client = clients.find((c) => c.id === obl.clientId)
                        return (
                          <div key={obl.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                            <div>
                              <p className="font-medium">{obl.name}</p>
                              <p className="text-sm text-muted-foreground">{client?.name}</p>
                            </div>
                            <Badge className="bg-red-600">{obl.status === "overdue" ? "Atrasada" : "Vence hoje"}</Badge>
                          </div>
                        )
                      })}
                      {criticalInstallments.slice(0, 2).map((inst) => {
                        const client = clients.find((c) => c.id === inst.clientId)
                        return (
                          <div key={inst.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                            <div className="flex items-center gap-2">
                              <CreditCard className="size-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{inst.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {client?.name} - Parcela {inst.currentInstallment}/{inst.installmentCount}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-red-600">Vencida</Badge>
                          </div>
                        )
                      })}
                      {criticalAlerts.length + criticalInstallments.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          +{criticalAlerts.length + criticalInstallments.length - 5} alertas adicionais
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="animate-in">
                <DashboardStatsCards stats={stats} />
              </div>

              <TaxCalendar taxes={taxes} />

              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="size-6" />
                  Indicadores de Produtividade
                </h2>
                {/* Usando a lista detalhada */}
                <ProductivityStats obligations={obligationsWithDetails} /> 
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Usando a lista detalhada */}
                <UpcomingObligations obligations={obligationsWithDetails} clients={clients} /> 
                {/* Usando a lista detalhada */}
                <ClientOverview clients={clients} obligations={obligationsWithDetails} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
