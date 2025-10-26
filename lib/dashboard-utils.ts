// jiji465/cf/cf-869bdbfddd735f8515395102173e0456ead0bd24/lib/dashboard-utils.ts

import type { DashboardStats, ObligationWithDetails } from "./types"
// Importação corrigida
import { getClients, getTaxes, getObligations } from "./supabase/database" 
import { calculateDueDate, isOverdue, isUpcomingThisWeek } from "./date-utils"

// ... restante do código
