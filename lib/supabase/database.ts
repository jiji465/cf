import { createClient } from "./client"
import type { Client, Tax, Obligation, Installment } from "../types"

// Mapeamento de tipos TypeScript para formato do banco
function mapClientToDb(client: Client) {
  return {
    id: client.id,
    name: client.name,
    cnpj: client.cnpj,
    email: client.email || null,
    phone: client.phone || null,
    status: client.status,
    created_at: client.createdAt,
  }
}

function mapDbToClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    cnpj: row.cnpj,
    email: row.email || "",
    phone: row.phone || "",
    status: row.status,
    createdAt: row.created_at,
  }
}

function mapTaxToDb(tax: Tax) {
  return {
    id: tax.id,
    name: tax.name,
    description: tax.description || null,
    federal_tax_code: tax.federalTaxCode || null,
    client_id: tax.clientId || null,
    due_date: tax.dueDate || null,
    due_day: tax.dueDay || null,
    status: tax.status,
    priority: tax.priority,
    assigned_to: tax.assignedTo || null,
    protocol: tax.protocol || null,
    realization_date: tax.realizationDate || null,
    notes: tax.notes || null,
    completed_at: tax.completedAt || null,
    completed_by: tax.completedBy || null,
    tags: tax.tags || [],
    created_at: tax.createdAt,
  }
}

function mapDbToTax(row: any): Tax {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    federalTaxCode: row.federal_tax_code,
    clientId: row.client_id,
    dueDate: row.due_date,
    dueDay: row.due_day,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    protocol: row.protocol,
    realizationDate: row.realization_date,
    notes: row.notes,
    completedAt: row.completed_at,
    completedBy: row.completed_by,
    tags: row.tags || [],
    createdAt: row.created_at,
    history: [], // Histórico será carregado separadamente se necessário
  }
}

function mapObligationToDb(obligation: Obligation) {
  return {
    id: obligation.id,
    name: obligation.name,
    description: obligation.description || null,
    category: obligation.category,
    client_id: obligation.clientId,
    tax_id: obligation.taxId || null,
    due_date: obligation.dueDate || null,
    due_day: obligation.dueDay,
    due_month: obligation.dueMonth || null,
    frequency: obligation.frequency,
    recurrence: obligation.recurrence,
    recurrence_interval: obligation.recurrenceInterval || null,
    recurrence_end_date: obligation.recurrenceEndDate || null,
    auto_generate: obligation.autoGenerate,
    weekend_rule: obligation.weekendRule,
    status: obligation.status,
    priority: obligation.priority,
    assigned_to: obligation.assignedTo || null,
    protocol: obligation.protocol || null,
    realization_date: obligation.realizationDate || null,
    notes: obligation.notes || null,
    completed_at: obligation.completedAt || null,
    completed_by: obligation.completedBy || null,
    attachments: obligation.attachments || [],
    parent_obligation_id: obligation.parentObligationId || null,
    generated_for: obligation.generatedFor || null,
    tags: obligation.tags || [],
    created_at: obligation.createdAt,
  }
}

function mapDbToObligation(row: any): Obligation {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    clientId: row.client_id,
    taxId: row.tax_id,
    dueDate: row.due_date,
    dueDay: row.due_day,
    dueMonth: row.due_month,
    frequency: row.frequency,
    recurrence: row.recurrence,
    recurrenceInterval: row.recurrence_interval,
    recurrenceEndDate: row.recurrence_end_date,
    autoGenerate: row.auto_generate,
    weekendRule: row.weekend_rule,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    protocol: row.protocol,
    realizationDate: row.realization_date,
    notes: row.notes,
    completedAt: row.completed_at,
    completedBy: row.completed_by,
    attachments: row.attachments || [],
    parentObligationId: row.parent_obligation_id,
    generatedFor: row.generated_for,
    tags: row.tags || [],
    createdAt: row.created_at,
    history: [],
  }
}

function mapInstallmentToDb(installment: Installment) {
  return {
    id: installment.id,
    name: installment.name,
    description: installment.description || null,
    client_id: installment.clientId,
    tax_id: installment.taxId || null,
    installment_count: installment.installmentCount,
    current_installment: installment.currentInstallment,
    due_date: installment.dueDate || null,
    due_day: installment.dueDay,
    first_due_date: installment.firstDueDate,
    weekend_rule: installment.weekendRule,
    status: installment.status,
    priority: installment.priority,
    assigned_to: installment.assignedTo || null,
    protocol: installment.protocol || null,
    realization_date: installment.realizationDate || null,
    notes: installment.notes || null,
    completed_at: installment.completedAt || null,
    completed_by: installment.completedBy || null,
    tags: installment.tags || [],
    payment_method: installment.paymentMethod || null,
    reference_number: installment.referenceNumber || null,
    auto_generate: installment.autoGenerate,
    recurrence: installment.recurrence,
    recurrence_interval: installment.recurrenceInterval || null,
    created_at: installment.createdAt,
  }
}

function mapDbToInstallment(row: any): Installment {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    clientId: row.client_id,
    taxId: row.tax_id,
    installmentCount: row.installment_count,
    currentInstallment: row.current_installment,
    dueDate: row.due_date,
    dueDay: row.due_day,
    firstDueDate: row.first_due_date,
    weekendRule: row.weekend_rule,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    protocol: row.protocol,
    realizationDate: row.realization_date,
    notes: row.notes,
    completedAt: row.completed_at,
    completedBy: row.completed_by,
    tags: row.tags || [],
    paymentMethod: row.payment_method,
    referenceNumber: row.reference_number,
    autoGenerate: row.auto_generate,
    recurrence: row.recurrence,
    recurrenceInterval: row.recurrence_interval,
    createdAt: row.created_at,
    history: [],
  }
}

// Client Operations
export async function getClients(): Promise<Client[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("clients").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching clients:", error)
    return []
  }

  return data.map(mapDbToClient)
}

export async function saveClient(client: Client): Promise<void> {
  const supabase = createClient()
  const dbClient = mapClientToDb(client)

  const { error } = await supabase.from("clients").upsert(dbClient)

  if (error) {
    console.error("[v0] Error saving client:", error)
    throw error
  }
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting client:", error)
    throw error
  }
}

// Tax Operations
export async function getTaxes(): Promise<Tax[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("taxes").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching taxes:", error)
    return []
  }

  return data.map(mapDbToTax)
}

export async function saveTax(tax: Tax): Promise<void> {
  const supabase = createClient()
  const dbTax = mapTaxToDb(tax)

  const { error } = await supabase.from("taxes").upsert(dbTax)

  if (error) {
    console.error("[v0] Error saving tax:", error)
    throw error
  }
}

export async function deleteTax(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("taxes").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting tax:", error)
    throw error
  }
}

// Obligation Operations
export async function getObligations(): Promise<Obligation[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("obligations").select("*").order("due_day")

  if (error) {
    console.error("[v0] Error fetching obligations:", error)
    return []
  }

  return data.map(mapDbToObligation)
}

export async function saveObligation(obligation: Obligation): Promise<void> {
  const supabase = createClient()
  const dbObligation = mapObligationToDb(obligation)

  const { error } = await supabase.from("obligations").upsert(dbObligation)

  if (error) {
    console.error("[v0] Error saving obligation:", error)
    throw error
  }
}

export async function deleteObligation(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("obligations").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting obligation:", error)
    throw error
  }
}

// Installment Operations
export async function getInstallments(): Promise<Installment[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("installments").select("*").order("due_day")

  if (error) {
    console.error("[v0] Error fetching installments:", error)
    return []
  }

  return data.map(mapDbToInstallment)
}

export async function saveInstallment(installment: Installment): Promise<void> {
  const supabase = createClient()
  const dbInstallment = mapInstallmentToDb(installment)

  const { error } = await supabase.from("installments").upsert(dbInstallment)

  if (error) {
    console.error("[v0] Error saving installment:", error)
    throw error
  }
}

export async function deleteInstallment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("installments").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting installment:", error)
    throw error
  }
}
