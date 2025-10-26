// jiji465/cf/cf-869bdbfddd735f8515395102173e0456ead0bd24/lib/date-utils.ts
import type { WeekendRule, Obligation } from "./types" // Importando Obligation
// ... isWeekend e adjustForWeekend inalteradas

// Funções utilitárias renomeadas para uso interno (privado)
export const calculateDueDateFromPrimitives = (
  dueDay: number,
  dueMonth: number | undefined,
  frequency: string,
  weekendRule: WeekendRule,
  referenceDate: Date = new Date(),
): Date => {
// ... lógica de cálculo de data
  let dueDate: Date

  if (frequency === "annual" && dueMonth) {
    // Annual obligation with specific month
    dueDate = new Date(referenceDate.getFullYear(), dueMonth - 1, dueDay)
    if (dueDate < referenceDate) {
      dueDate.setFullYear(dueDate.getFullYear() + 1)
    }
  } else if (frequency === "quarterly" && dueMonth) {
    // Quarterly obligation
    dueDate = new Date(referenceDate.getFullYear(), dueMonth - 1, dueDay)
    while (dueDate < referenceDate) {
      dueDate.setMonth(dueDate.getMonth() + 3)
    }
  } else {
    // Monthly or custom
    dueDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), dueDay)
    if (dueDate < referenceDate) {
      dueDate.setMonth(dueDate.getMonth() + 1)
    }
  }

  return adjustForWeekend(dueDate, weekendRule)
}


// Nova função pública com sobrecarga (wrapper) para aceitar objeto Obligation ou argumentos primitivos
export const calculateDueDate = (
  param1: number | Obligation,
  param2?: number,
  param3?: string,
  param4?: WeekendRule,
  param5?: Date,
): Date => {
  if (typeof param1 === 'object' && 'dueDay' in param1) {
    const obl = param1
    return calculateDueDateFromPrimitives(
      obl.dueDay,
      obl.dueMonth,
      obl.frequency,
      obl.weekendRule
    )
  }

  // Fallback para a assinatura original
  return calculateDueDateFromPrimitives(
    param1 as number,
    param2,
    param3 as string,
    param4 as WeekendRule,
    param5
  )
}

// ... restante do código inalterado
