"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { CalendarView } from "@/components/calendar-view"
import { getTaxes, getInstallments, getClients, getObligations } from "@/lib/supabase/database"
import type { Tax, InstallmentWithDetails, ObligationWithDetails } from "@/lib/types"
import { adjustForWeekend, calculateDueDate } from "@/lib/date-utils"

export default function CalendarioPage() {
  const [obligations, setObligations] = useState<ObligationWithDetails[]>([])
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [installments, setInstallments] = useState<InstallmentWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [obligationsData, taxesData, installmentsData, clientsData] = await Promise.all([
        getObligations(),
        getTaxes(),
        getInstallments(),
        getClients(),
      ])

      // Processar obrigações com detalhes
      const obligationsWithDetails: ObligationWithDetails[] = obligationsData.map((obl) => {
        const client = clientsData.find((c) => c.id === obl.clientId)!
        const tax = obl.taxId ? taxesData.find((t) => t.id === obl.taxId) : undefined
        const calculatedDueDate = calculateDueDate(obl)

        return {
          ...obl,
          client,
          tax,
          calculatedDueDate,
        }
      })

      // Processar parcelamentos com detalhes
      const installmentsWithDetails: InstallmentWithDetails[] = installmentsData.map((inst) => {
        const client = clientsData.find((c) => c.id === inst.clientId)!
        const tax = inst.taxId ? taxesData.find((t) => t.id === inst.taxId) : undefined

        const firstDue = new Date(inst.firstDueDate)
        const monthsToAdd = inst.currentInstallment - 1
        const dueDate = new Date(firstDue.getFullYear(), firstDue.getMonth() + monthsToAdd, inst.dueDay)
        const adjustedDueDate = adjustForWeekend(dueDate, inst.weekendRule)

        return {
          ...inst,
          client,
          tax,
          calculatedDueDate: adjustedDueDate.toISOString(),
        }
      })

      setObligations(obligationsWithDetails)
      setTaxes(taxesData)
      setInstallments(installmentsWithDetails)
    } catch (error) {
      console.error("[v0] Error loading calendar data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendário de Vencimentos</h1>
            <p className="text-muted-foreground mt-2">
              Visualize todos os prazos de obrigações, impostos e parcelamentos
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando calendário...</div>
          ) : (
            <CalendarView obligations={obligations} taxes={taxes} installments={installments} />
          )}
        </div>
      </main>
    </div>
  )
}
