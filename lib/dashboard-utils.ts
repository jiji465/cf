import type { DashboardStats, ObligationWithDetails, Client, Obligation, Tax } from "./types"
import { calculateDueDate, isOverdue, isUpcomingThisWeek } from "./date-utils"

// Função agora recebe os dados brutos e os combina
export const getObligationsWithDetails = (
  obligations: Obligation[], 
  clients: Client[], 
  taxes: Tax[]
): ObligationWithDetails[] => {
  // Usando 'reduce' para filtrar e mapear em uma única passagem, de forma segura.
  return obligations.reduce<ObligationWithDetails[]>((acc, obligation) => {
    const client = clients.find((c) => c.id === obligation.clientId)
    // Se o cliente não for encontrado, a obrigação é ignorada.
    if (!client) {
      return acc
    }

    const tax = obligation.taxId ? taxes.find((t) => t.id === obligation.taxId) : undefined
    const calculatedDueDate = calculateDueDate(obligation).toISOString()

    // Adiciona a obrigação detalhada ao acumulador.
    acc.push({
      ...obligation,
      client,
      tax,
      calculatedDueDate,
    })

    return acc
  }, [])
}

// Função agora recebe a lista detalhada e a lista de clientes para calcular as métricas
export const calculateDashboardStats = (
  clients: Client[], 
  obligationsWithDetails: ObligationWithDetails[]
): DashboardStats => {
  
  const activeClients = clients.filter((c) => c.status === "active").length
  const pendingObligations = obligationsWithDetails.filter((o) => o.status === "pending")
  const overdueObligations = pendingObligations.filter((o) => isOverdue(o.calculatedDueDate))
  const upcomingThisWeek = pendingObligations.filter((o) => isUpcomingThisWeek(o.calculatedDueDate))

  const today = new Date()
  const completedThisMonth = obligationsWithDetails.filter((o) => {
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
    totalObligations: obligationsWithDetails.length,
    pendingObligations: pendingObligations.length,
    completedThisMonth,
    overdueObligations: overdueObligations.length,
    upcomingThisWeek: upcomingThisWeek.length,
  }
}
