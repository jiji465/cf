import type { WeekendRule, Obligation } from "./types"

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6
}

export const adjustForWeekend = (date: Date, rule: WeekendRule): Date => {
  if (!isWeekend(date)) return date

  const adjusted = new Date(date)

  if (rule === "anticipate") {
    // Move to previous business day
    while (isWeekend(adjusted)) {
      adjusted.setDate(adjusted.getDate() - 1)
    }
  } else if (rule === "postpone") {
    // Move to next business day
    while (isWeekend(adjusted)) {
      adjusted.setDate(adjusted.getDate() + 1)
    }
  }
  // 'keep' doesn't change the date

  return adjusted
}

// Função auxiliar para o cálculo a partir de dados primitivos
const calculateDueDateFromPrimitives = (
  dueDay: number,
  dueMonth: number | undefined,
  frequency: string,
  weekendRule: WeekendRule,
  referenceDate: Date = new Date(),
): Date => {
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


// Assinaturas sobrecarregadas para clareza
export function calculateDueDate(obligation: Obligation, referenceDate?: Date): Date
export function calculateDueDate(
  dueDay: number,
  dueMonth: number | undefined,
  frequency: string,
  weekendRule: WeekendRule,
  referenceDate?: Date,
): Date

// Implementação da função
export function calculateDueDate(
  param1: number | Obligation,
  param2?: number | Date,
  param3?: string,
  param4?: WeekendRule,
  param5?: Date,
): Date {
  if (typeof param1 === "object" && param1 !== null && "dueDay" in param1) {
    // Lógica para a primeira assinatura (com objeto Obligation)
    const obl = param1
    const refDate = param2 instanceof Date ? param2 : undefined
    return calculateDueDateFromPrimitives(obl.dueDay, obl.dueMonth, obl.frequency, obl.weekendRule, refDate)
  }

  // Lógica para a segunda assinatura (com primitivos)
  return calculateDueDateFromPrimitives(
    param1 as number,
    param2 as number | undefined,
    param3 as string,
    param4 as WeekendRule,
    param5,
  )
}

export const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("pt-BR")
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export const isOverdue = (dueDate: string): boolean => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return due < now
}

export const isUpcomingThisWeek = (dueDate: string): boolean => {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekFromNow = new Date()
  weekFromNow.setDate(today.getDate() + 7)
  return due >= today && due <= weekFromNow
}
