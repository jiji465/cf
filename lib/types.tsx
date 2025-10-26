export type Client = {
  id: string
  name: string
  cnpj: string
  email: string
  phone: string
  status: "active" | "inactive"
  createdAt: string
}

export type Tax = {
  id: string
  name: string
  description?: string
  federalTaxCode?: string
  clientId?: string
  dueDate?: string // Data de vencimento no formato dd/mm/aaaa
  dueDay?: number // Dia do vencimento do imposto (1-31) - deprecated, use dueDate
  status: "pending" | "in_progress" | "completed" | "overdue"
  priority: Priority
  assignedTo?: string
  protocol?: string
  realizationDate?: string
  notes?: string
  completedAt?: string
  completedBy?: string
  history?: ObligationHistory[]
  tags?: string[]
  recurrence?: RecurrenceType
  recurrenceInterval?: number
  recurrenceEndDate?: string
  autoGenerate?: boolean
  weekendRule?: WeekendRule
  createdAt: string
}

export type WeekendRule = "postpone" | "anticipate" | "keep"

export type RecurrenceType = "monthly" | "bimonthly" | "quarterly" | "semiannual" | "annual" | "custom"

export type Priority = "low" | "medium" | "high" | "urgent"

export type CertificateType = "federal" | "state" | "municipal" | "fgts" | "labor"

export type Certificate = {
  id: string
  clientId: string
  type: CertificateType
  name: string
  issueDate?: string
  expiryDate: string
  status: "valid" | "expired" | "pending"
  documentNumber?: string
  notes?: string
  createdAt: string
}

export type ObligationCategory = "sped" | "tax_guide" | "certificate" | "declaration" | "other"

export type Obligation = {
  id: string
  name: string
  description?: string
  category: ObligationCategory // Nova categoria para organização
  clientId: string
  taxId?: string
  dueDay: number
  dueMonth?: number
  frequency: "monthly" | "quarterly" | "annual" | "custom"
  recurrence: RecurrenceType
  recurrenceInterval?: number
  recurrenceEndDate?: string
  autoGenerate: boolean
  weekendRule: WeekendRule
  status: "pending" | "in_progress" | "completed" | "overdue" // Adicionado status "in_progress"
  priority: Priority
  assignedTo?: string
  protocol?: string
  realizationDate?: string
  notes?: string
  createdAt: string
  completedAt?: string // Data de quando foi concluída
  completedBy?: string // Quem concluiu (usuário/contador)
  attachments?: string[] // URLs de anexos/documentos
  history?: ObligationHistory[]
  parentObligationId?: string // ID da obrigação original que gerou esta
  generatedFor?: string // Período para qual foi gerada (ex: "2025-01")
  tags?: string[]
}

export type Installment = {
  id: string
  name: string
  description?: string
  clientId: string
  taxId?: string
  installmentCount: number
  currentInstallment: number
  dueDay: number
  firstDueDate: string
  weekendRule: WeekendRule
  status: "pending" | "in_progress" | "completed" | "overdue"
  priority: Priority
  assignedTo?: string
  protocol?: string
  realizationDate?: string
  notes?: string
  createdAt: string
  completedAt?: string
  completedBy?: string
  history?: ObligationHistory[]
  tags?: string[]
  paymentMethod?: string
  referenceNumber?: string
  autoGenerate: boolean
  recurrence: RecurrenceType
  recurrenceInterval?: number
}

export type ObligationHistory = {
  id: string
  action: "created" | "updated" | "completed" | "status_changed" | "comment_added"
  description: string
  timestamp: string
  user?: string
}

export type ObligationWithDetails = Obligation & {
  client: Client
  tax?: Tax
  calculatedDueDate: string
}

export type InstallmentWithDetails = Installment & {
  client: Client
  tax?: Tax
  calculatedDueDate: string
}

export type DashboardStats = {
  totalClients: number
  activeClients: number
  totalObligations: number
  pendingObligations: number
  completedThisMonth: number
  overdueObligations: number
  upcomingThisWeek: number
}

export type SavedFilter = {
  id: string
  name: string
  filters: {
    status?: string[]
    priority?: string[]
    clientId?: string
    search?: string
    dateRange?: { start: string; end: string }
  }
  createdAt: string
}

export type ExportFormat = "excel" | "pdf" | "csv"

export type ExportOptions = {
  format: ExportFormat
  includeCompleted: boolean
  dateRange?: { start: string; end: string }
  clientIds?: string[]
}

export type ProductivityMetrics = {
  totalCompleted: number
  averageCompletionTime: number // em dias
  onTimeRate: number // percentual
  byResponsible: { name: string; completed: number; onTime: number }[]
  byMonth: { month: string; completed: number; overdue: number }[]
  byPriority: { priority: Priority; count: number }[]
}
