import {
  getObligations,
  getTaxes,
  getInstallments,
  saveObligation,
  saveTax,
  saveInstallment,
} from "./supabase/database" 
import {
  shouldGenerateRecurrence,
  getCurrentPeriod,
  generateObligationForPeriod,
  generateTaxForPeriod,
  generateInstallmentForPeriod,
} from "./recurrence-engine"

// === Cache de Status de Execução Diária (usa localStorage para performance) ===
// Mantido localmente para não depender de um módulo 'storage' inexistente
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
// ==============================================================================


export function checkAndGenerateRecurrences(): void {
  const now = new Date()
  const currentPeriod = getCurrentPeriod()
  const lastCheck = getLastRecurrenceCheck()

  // 1. Verifica se já rodou hoje (evita execuções múltiplas)
  const today = now.toISOString().split("T")[0]
  if (lastCheck === today) {
    return
  }

  // 2. A lógica de geração automática deve ocorrer no primeiro dia de cada mês
  if (!shouldGenerateRecurrence(now)) {
    return
  }

  console.log("[v0] Iniciando geração automática de recorrências para", currentPeriod)

  // 3. Gerar obrigações recorrentes
  const obligations = getObligations()
  // Filtra apenas as obrigações MÃE (que não são geradas por outras)
  const obligationsToGenerate = obligations.filter(
    (o) => o.autoGenerate && !o.parentObligationId, 
  )

  obligationsToGenerate.forEach((obligation) => {
    // Verifica se já existe uma obrigação gerada para este período
    const alreadyGenerated = obligations.some(
      (o) => o.parentObligationId === obligation.id && o.generatedFor === currentPeriod,
    )

    if (!alreadyGenerated) {
      const newObligation = generateObligationForPeriod(obligation, currentPeriod)
      saveObligation(newObligation)
      console.log("[v0] Obrigação gerada:", newObligation.name, "para", currentPeriod)
    }
  })

  // 4. Gerar impostos recorrentes
  const taxes = getTaxes()
  const taxesToGenerate = taxes.filter((t) => t.dueDay !== undefined) 

  taxesToGenerate.forEach((tax) => {
    const alreadyGenerated = taxes.some((t) => t.name === tax.name && t.createdAt.startsWith(currentPeriod))

    if (!alreadyGenerated) {
      const newTax = generateTaxForPeriod(tax, currentPeriod)
      saveTax(newTax)
      console.log("[v0] Imposto gerado:", newTax.name, "para", currentPeriod)
    }
  })

  // 5. Gerar parcelas recorrentes
  const installments = getInstallments()
  const installmentsToGenerate = installments.filter((i) => i.autoGenerate && i.currentInstallment < i.installmentCount)

  installmentsToGenerate.forEach((installment) => {
    const newInstallment = generateInstallmentForPeriod(installment, currentPeriod)
    saveInstallment(newInstallment)
    console.log(
      "[v0] Parcela gerada:",
      newInstallment.name,
      `${newInstallment.currentInstallment}/${newInstallment.installmentCount}`,
      "para",
      currentPeriod,
    )
  })

  // 6. Atualiza a data da última verificação (para evitar que rode novamente hoje)
  setLastRecurrenceCheck(today)
  console.log("[v0] Geração automática de recorrências concluída")
}

// Hook para executar a verificação quando o app carrega
export function initializeAutoRecurrence(): void {
  if (typeof window !== "undefined") {
    // Executa imediatamente
    checkAndGenerateRecurrences()

    // Configura verificação diária (a cada 24 horas)
    setInterval(checkAndGenerateRecurrences, 24 * 60 * 60 * 1000)
  }
}
