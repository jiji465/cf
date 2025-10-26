// jiji465/cf/cf-869bdbfddd735f8515395102173e0456ead0bd24/app/page.tsx
// ... imports
// Importando getObligationsWithDetails
import { calculateDashboardStats, getObligationsWithDetails } from "@/lib/dashboard-utils" 
import type { Client, Tax, Installment, Obligation } from "@/lib/types"

// ... (dentro da função DashboardPage)

  const updateData = async () => {
    setLoading(true)
    try {
      const [clientsData, taxesData, installmentsData, obligationsData] = await Promise.all([
        getClients(),
        getTaxes(),
        getInstallments(),
        getObligations(),
      ])

      // 1. Calcula a lista de obrigações com detalhes (Duty Cycle)
      const obligationsWithDetails = getObligationsWithDetails(obligationsData, clientsData, taxesData) 

      setClients(clientsData)
      setTaxes(taxesData)
      setInstallments(installmentsData)
      setObligations(obligationsData)
      
      // 2. Calcula os stats passando as duas listas necessárias
      setStats(calculateDashboardStats(clientsData, obligationsWithDetails))
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

// ... restante do código
