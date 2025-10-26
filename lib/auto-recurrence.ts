// jiji465/cf/cf-869bdbfddd735f8515395102173e0456ead0bd24/lib/auto-recurrence.ts
import {
  getObligations,
  getTaxes,
  getInstallments,
  saveObligation,
  saveTax,
  saveInstallment,
} from "./supabase/database" // Importação corrigida para o Supabase
import {
  shouldGenerateRecurrence,
  getCurrentPeriod,
  generateObligationForPeriod,
  generateTaxForPeriod,
  generateInstallmentForPeriod,
} from "./recurrence-engine"

// Funções de cache simples no cliente (substituindo o antigo "storage" local para fins de performance)
const LAST_RECURRENCE_CHECK_KEY = "lastRecurrenceCheck"

function getLastRecurrenceCheck(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(LAST_RECURRENCE_CHECK_KEY)
  }
  return null
}

function setLastRecurrenceCheck(date: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_RECURRENCE_CHECK_KEY, date)
  }
}

export function checkAndGenerateRecurrences(): void {
  const now = new Date()
  const currentPeriod = getCurrentPeriod()
  const lastCheck = getLastRecurrenceCheck() // Uso da função local

  // ... restante do código de checkAndGenerateRecurrences
  
  // Atualiza a data da última verificação
  setLastRecurrenceCheck(today) // Uso da função local
  console.log("[v0] Geração automática de recorrências concluída")
}

// ... restante do código
