import {
  getObligations,
  getTaxes,
  getInstallments,
  saveObligation,
  saveTax,
  saveInstallment,
  getLastRecurrenceCheck,
  setLastRecurrenceCheck,
} from "./storage"
import {
  shouldGenerateRecurrence,
  getCurrentPeriod,
  generateObligationForPeriod,
  generateTaxForPeriod,
  generateInstallmentForPeriod,
} from "./recurrence-engine"

export function checkAndGenerateRecurrences(): void {
  const now = new Date()
  const currentPeriod = getCurrentPeriod()
  const lastCheck = getLastRecurrenceCheck()

  // Verifica se já rodou hoje
  const today = now.toISOString().split("T")[0]
  if (lastCheck === today) {
    return
  }

  // Verifica se é o primeiro dia do mês
  if (!shouldGenerateRecurrence(now)) {
    return
  }

  console.log("[v0] Iniciando geração automática de recorrências para", currentPeriod)

  // Gerar obrigações recorrentes
  const obligations = getObligations()
  const obligationsToGenerate = obligations.filter(
    (o) => o.autoGenerate && !o.parentObligationId, // Apenas obrigações originais
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

  // Gerar impostos recorrentes
  const taxes = getTaxes()
  const taxesToGenerate = taxes.filter((t) => t.dueDay !== undefined)

  taxesToGenerate.forEach((tax) => {
    // Verifica se já existe um imposto gerado para este período
    const alreadyGenerated = taxes.some((t) => t.name === tax.name && t.createdAt.startsWith(currentPeriod))

    if (!alreadyGenerated) {
      const newTax = generateTaxForPeriod(tax, currentPeriod)
      saveTax(newTax)
      console.log("[v0] Imposto gerado:", newTax.name, "para", currentPeriod)
    }
  })

  // Gerar parcelas recorrentes
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

  // Atualiza a data da última verificação
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
