"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getClients, getTaxes, saveInstallment } from "@/lib/supabase/database"
import type { Installment, Client, Tax, WeekendRule, Priority } from "@/lib/types"
import { AlertCircle, Flame, TrendingUp, Zap } from "lucide-react"
import { DateInput } from "@/components/date-input"

interface InstallmentFormProps {
  installment?: Installment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function InstallmentForm({ installment, open, onOpenChange, onSave }: InstallmentFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [formData, setFormData] = useState<Partial<Installment>>({
    name: "",
    description: "",
    clientId: "",
    taxId: "",
    installmentCount: 1,
    currentInstallment: 1,
    dueDay: 10,
    firstDueDate: "",
    weekendRule: "postpone",
    status: "pending",
    priority: "medium",
    assignedTo: "",
    protocol: "",
    notes: "",
    tags: [],
    paymentMethod: "",
    referenceNumber: "",
    autoGenerate: true,
    recurrence: "monthly",
    recurrenceInterval: 1,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, taxesData] = await Promise.all([getClients(), getTaxes()])
        setClients(clientsData)
        setTaxes(taxesData)
      } catch (error) {
        console.error("[v0] Error loading form data:", error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (installment) {
      setFormData(installment)
    }
  }, [installment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const installmentData: Installment = {
        id: installment?.id || crypto.randomUUID(),
        name: formData.name!,
        description: formData.description,
        clientId: formData.clientId!,
        taxId: formData.taxId || undefined,
        installmentCount: formData.installmentCount!,
        currentInstallment: formData.currentInstallment!,
        dueDay: formData.dueDay!,
        firstDueDate: formData.firstDueDate!,
        weekendRule: formData.weekendRule!,
        status: formData.status!,
        priority: formData.priority!,
        assignedTo: formData.assignedTo,
        protocol: formData.protocol,
        realizationDate: formData.realizationDate,
        notes: formData.notes,
        createdAt: installment?.createdAt || new Date().toISOString(),
        completedAt: formData.completedAt,
        completedBy: formData.completedBy,
        history: installment?.history || [],
        tags: formData.tags || [],
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        autoGenerate: formData.autoGenerate!,
        recurrence: formData.recurrence!,
        recurrenceInterval: formData.recurrenceInterval,
      }

      await saveInstallment(installmentData)
      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error saving installment:", error)
      alert("Erro ao salvar parcelamento. Tente novamente.")
    }
  }

  const priorityIcons = {
    low: <TrendingUp className="h-4 w-4" />,
    medium: <AlertCircle className="h-4 w-4" />,
    high: <Flame className="h-4 w-4" />,
    urgent: <Zap className="h-4 w-4" />,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{installment ? "Editar Parcelamento" : "Novo Parcelamento"}</DialogTitle>
          <DialogDescription>Controle de prazos de parcelamentos fiscais</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Parcelamento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Parcelamento INSS 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Detalhes sobre o parcelamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">Imposto Relacionado (Opcional)</Label>
              <Select
                value={formData.taxId || "none"}
                onValueChange={(value) => setFormData({ ...formData, taxId: value === "none" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o imposto (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {taxes.map((tax) => (
                    <SelectItem key={tax.id} value={tax.id}>
                      {tax.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Controle de Parcelas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Controle de Parcelas</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="installmentCount">Total de Parcelas *</Label>
                <Input
                  id="installmentCount"
                  type="number"
                  min="1"
                  value={formData.installmentCount}
                  onChange={(e) => setFormData({ ...formData, installmentCount: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentInstallment">Parcela Atual *</Label>
                <Input
                  id="currentInstallment"
                  type="number"
                  min="1"
                  max={formData.installmentCount}
                  value={formData.currentInstallment}
                  onChange={(e) => setFormData({ ...formData, currentInstallment: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                <Input
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  placeholder="Ex: Boleto, Débito"
                />
              </div>
            </div>
          </div>

          {/* Vencimentos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Controle de Prazos</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstDueDate">Data de Vencimento *</Label>
                <DateInput
                  id="firstDueDate"
                  value={formData.firstDueDate || ""}
                  onChange={(value) => setFormData({ ...formData, firstDueDate: value })}
                  placeholder="dd/mm/aaaa"
                  required
                />
                <p className="text-xs text-muted-foreground">Data de vencimento da parcela atual</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekendRule">Regra de Final de Semana *</Label>
                <Select
                  value={formData.weekendRule}
                  onValueChange={(value: WeekendRule) => setFormData({ ...formData, weekendRule: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postpone">Postergar (próximo dia útil)</SelectItem>
                    <SelectItem value="anticipate">Antecipar (dia útil anterior)</SelectItem>
                    <SelectItem value="keep">Manter (mesmo dia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Gestão e Controle */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Gestão e Controle</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Baixa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Média</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4" />
                        <span>Alta</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Urgente</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Responsável</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protocol">Protocolo</Label>
                <Input
                  id="protocol"
                  value={formData.protocol}
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                  placeholder="Número do protocolo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Número de Referência</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="Código de barras, linha digitável, etc."
              />
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Observações</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionais</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Observações sobre prazos, documentação necessária, etc."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Parcelamento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
