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


// Função refatorada para ser assíncrona e usar 'await'
export async function checkAndGenerateRecurrences(): Promise<void> {
  const now = new Date()
  const currentPeriod = getCurrentPeriod()
  const lastCheck = getLastRecurrenceCheck()

  const today = now.toISOString().split("T")[0]
  if (lastCheck === today) {
    return
  }

  if (!shouldGenerateRecurrence(now)) {
    return
  }

  console.log("[v0] Iniciando geração automática de recorrências para", currentPeriod)

  // Busca os dados do Supabase de forma assíncrona
  const [obligations, taxes, installments] = await Promise.all([
    getObligations(),
    getTaxes(),
    getInstallments(),
  ])

  // Gerar obrigações
  const obligationsToGenerate = obligations.filter((o) => o.autoGenerate && !o.parentObligationId)
  for (const obligation of obligationsToGenerate) {
    const alreadyGenerated = obligations.some(
      (o) => o.parentObligationId === obligation.id && o.generatedFor === currentPeriod,
    )
    if (!alreadyGenerated) {
      const newObligation = generateObligationForPeriod(obligation, currentPeriod)
      await saveObligation(newObligation)
      console.log("[v0] Obrigação gerada:", newObligation.name, "para", currentPeriod)
    }
  }

  // Gerar impostos
  const taxesToGenerate = taxes.filter((t) => t.dueDay !== undefined)
  for (const tax of taxesToGenerate) {
    const alreadyGenerated = taxes.some((t) => t.name === tax.name && t.createdAt?.startsWith(currentPeriod))
    if (!alreadyGenerated) {
      const newTax = generateTaxForPeriod(tax, currentPeriod)
      await saveTax(newTax)
      console.log("[v0] Imposto gerado:", newTax.name, "para", currentPeriod)
    }
  }

  // Gerar parcelas
  const installmentsToGenerate = installments.filter((i) => i.autoGenerate && i.currentInstallment < i.installmentCount)
  for (const installment of installmentsToGenerate) {
    const newInstallment = generateInstallmentForPeriod(installment, currentPeriod)
    await saveInstallment(newInstallment)
    console.log(
      "[v0] Parcela gerada:",
      newInstallment.name,
      `${newInstallment.currentInstallment}/${newInstallment.installmentCount}`,
      "para",
      currentPeriod,
    )
  }

  setLastRecurrenceCheck(today)
  console.log("[v0] Geração automática de recorrências concluída")
}

// Hook atualizado para lidar com a função assíncrona
export function initializeAutoRecurrence(): void {
  if (typeof window !== "undefined") {
    // Executa a verificação assíncrona imediatamente
    checkAndGenerateRecurrences().catch((err) =>
      console.error("[v0] Erro na geração automática inicial:", err),
    )

    // Configura verificação diária
    setInterval(() => {
      checkAndGenerateRecurrences().catch((err) =>
        console.error("[v0] Erro na geração automática diária:", err),
      )
    }, 24 * 60 * 60 * 1000)
  }
}
