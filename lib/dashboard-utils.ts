import type { DashboardStats, ObligationWithDetails } from "./types"
import { getClients, getTaxes, getObligations } from "./storage"
import { calculateDueDate, isOverdue, isUpcomingThisWeek } from "./date-utils"

export const getObligationsWithDetails = (): ObligationWithDetails[] => {
  const obligations = getObligations()
  const clients = getClients()
  const taxes = getTaxes()

  return obligations.map((obligation) => {
    const client = clients.find((c) => c.id === obligation.clientId)!
    const tax = obligation.taxId ? taxes.find((t) => t.id === obligation.taxId) : undefined

    const calculatedDueDate = calculateDueDate(
      obligation.dueDay,
      obligation.dueMonth,
      obligation.frequency,
      obligation.weekendRule,
    ).toISOString()

    return {
      ...obligation,
      client,
      tax,
      calculatedDueDate,
    }
  })
}

export const calculateDashboardStats = (): DashboardStats => {
  const clients = getClients()
  const obligations = getObligationsWithDetails()

  const activeClients = clients.filter((c) => c.status === "active").length
  const pendingObligations = obligations.filter((o) => o.status === "pending")
  const overdueObligations = pendingObligations.filter((o) => isOverdue(o.calculatedDueDate))
  const upcomingThisWeek = pendingObligations.filter((o) => isUpcomingThisWeek(o.calculatedDueDate))

  const today = new Date()
  const completedThisMonth = obligations.filter((o) => {
    if (!o.completedAt) return false
    const completed = new Date(o.completedAt)
    return (
      completed.getMonth() === today.getMonth() &&
      completed.getFullYear() === today.getFullYear() &&
      o.status === "completed"
    )
  }).length

  return {
    totalClients: clients.length,
    activeClients,
    totalObligations: obligations.length,
    pendingObligations: pendingObligations.length,
    completedThisMonth,
    overdueObligations: overdueObligations.length,
    upcomingThisWeek: upcomingThisWeek.length,
  }
}
