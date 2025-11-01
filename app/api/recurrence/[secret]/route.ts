
import { NextRequest, NextResponse } from "next/server"
import {
  getObligations,
  getTaxes,
  getInstallments,
  saveObligation,
  saveTax,
  saveInstallment,
} from "@/lib/supabase/database"
import {
  shouldGenerateRecurrence,
  getCurrentPeriod,
  generateObligationForPeriod,
  generateTaxForPeriod,
  generateInstallmentForPeriod,
} from "@/lib/recurrence-engine"

// This is the server-side equivalent of checkAndGenerateRecurrences
async function generateRecurrences() {
  const now = new Date()
  const currentPeriod = getCurrentPeriod()

  // The check to run only on the first day of the month is still relevant
  if (!shouldGenerateRecurrence(now)) {
    console.log("[API] Recurrence generation skipped. Not the first day of the month.")
    return { message: "Recurrence generation skipped. Not the first day of the month." }
  }

  console.log("[API] Starting automatic recurrence generation for", currentPeriod)

  const [obligations, taxes, installments] = await Promise.all([
    getObligations(),
    getTaxes(),
    getInstallments(),
  ])

  let generatedCount = 0

  // Generate obligations
  const obligationsToGenerate = obligations.filter((o) => o.autoGenerate && !o.parentObligationId)
  for (const obligation of obligationsToGenerate) {
    const alreadyGenerated = obligations.some(
      (o) => o.parentObligationId === obligation.id && o.generatedFor === currentPeriod,
    )
    if (!alreadyGenerated) {
      const newObligation = generateObligationForPeriod(obligation, currentPeriod)
      await saveObligation(newObligation)
      console.log("[API] Obligation generated:", newObligation.name, "for", currentPeriod)
      generatedCount++
    }
  }

  // Generate taxes
  const taxesToGenerate = taxes.filter((t) => t.dueDay !== undefined)
  for (const tax of taxesToGenerate) {
    const alreadyGenerated = taxes.some((t) => t.name === tax.name && t.createdAt?.startsWith(currentPeriod))
    if (!alreadyGenerated) {
      const newTax = generateTaxForPeriod(tax, currentPeriod)
      await saveTax(newTax)
      console.log("[API] Tax generated:", newTax.name, "for", currentPeriod)
      generatedCount++
    }
  }

  // Generate installments
  const installmentsToGenerate = installments.filter((i) => i.autoGenerate && i.currentInstallment < i.installmentCount)
  for (const installment of installmentsToGenerate) {
    const newInstallment = generateInstallmentForPeriod(installment, currentPeriod)
    await saveInstallment(newInstallment)
    console.log(
      "[API] Installment generated:",
      newInstallment.name,
      `${newInstallment.currentInstallment}/${newInstallment.installmentCount}`,
      "for",
      currentPeriod,
    )
    generatedCount++
  }

  console.log(`[API] Automatic recurrence generation complete. Generated ${generatedCount} items.`)
  return { message: `Automatic recurrence generation complete. Generated ${generatedCount} items.` }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { secret: string } }
) {
  if (params.secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await generateRecurrences()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Error during recurrence generation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
