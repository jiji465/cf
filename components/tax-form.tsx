"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, AlertCircle, AlertTriangle, Flag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Tax, Client } from "@/lib/types"
import { DateInput } from "@/components/date-input"
import { getClients } from "@/lib/supabase/database"

type TaxFormProps = {
  tax?: Tax
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (tax: Tax) => void
}

export function TaxForm({ tax, open, onOpenChange, onSave }: TaxFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState<Partial<Tax>>(
    tax || {
      name: "",
      description: "",
      federalTaxCode: "",
      clientId: "",
      dueDate: "",
      status: "pending",
      priority: "medium",
      recurrence: "monthly",
      recurrenceInterval: 1,
      autoGenerate: false,
      weekendRule: "postpone",
      assignedTo: "",
      protocol: "",
      notes: "",
      tags: [],
    },
  )

  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    const loadClients = async () => {
      const clientsData = await getClients()
      setClients(clientsData)
    }
    loadClients()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const taxData: Tax = {
      id: tax?.id || crypto.randomUUID(),
      name: formData.name!,
      description: formData.description,
      federalTaxCode: formData.federalTaxCode,
      clientId: formData.clientId || undefined,
      dueDate: formData.dueDate,
      dueDay: formData.dueDay ? Number(formData.dueDay) : undefined,
      status: formData.status || "pending",
      priority: formData.priority || "medium",
      recurrence: formData.recurrence,
      recurrenceInterval: formData.recurrenceInterval,
      recurrenceEndDate: formData.recurrenceEndDate,
      autoGenerate: formData.autoGenerate || false,
      weekendRule: formData.weekendRule || "postpone",
      assignedTo: formData.assignedTo,
      protocol: formData.protocol,
      notes: formData.notes,
      tags: formData.tags || [],
      completedAt: formData.completedAt,
      completedBy: formData.completedBy,
      createdAt: tax?.createdAt || new Date().toISOString(),
    }
    onSave(taxData)
    onOpenChange(false)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), newTag.trim()] })
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter((t) => t !== tag) })
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="size-4 text-red-600" />
      case "high":
        return <AlertTriangle className="size-4 text-orange-600" />
      case "medium":
        return <Flag className="size-4 text-yellow-600" />
      default:
        return <Flag className="size-4 text-blue-600" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tax ? "Editar Imposto" : "Novo Imposto"}</DialogTitle>
          <DialogDescription>Configure o imposto com todas as regras e vencimentos.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Informações Básicas
              </h3>

              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Imposto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: ICMS, ISS, IRPJ"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o imposto..."
                  rows={2}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="federalTaxCode">Código Federal (Opcional)</Label>
                  <Input
                    id="federalTaxCode"
                    value={formData.federalTaxCode}
                    onChange={(e) => setFormData({ ...formData, federalTaxCode: e.target.value })}
                    placeholder="Ex: 1234"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="clientId">Cliente (Opcional)</Label>
                  <Select
                    value={formData.clientId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="Imposto global (todos os clientes)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Imposto global (todos os clientes)</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Deixe como global ou selecione um cliente específico</p>
                </div>
              </div>
            </div>

            {/* Gestão e Controle */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Gestão e Controle</h3>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority" className="flex items-center gap-2">
                    Prioridade *{getPriorityIcon(formData.priority || "medium")}
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="overdue">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="assignedTo">Responsável</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo || ""}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="protocol">Protocolo/Processo</Label>
                <Input
                  id="protocol"
                  value={formData.protocol || ""}
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                  placeholder="Número do protocolo"
                />
              </div>
            </div>

            {/* Configuração de Recorrência */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h3 className="text-sm font-semibold">Configuração de Recorrência</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="recurrence">Tipo de Recorrência *</Label>
                  <Select
                    value={formData.recurrence}
                    onValueChange={(value) => setFormData({ ...formData, recurrence: value as any })}
                  >
                    <SelectTrigger id="recurrence">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="bimonthly">Bimestral</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semiannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrence === "custom" && (
                  <div className="grid gap-2">
                    <Label htmlFor="recurrenceInterval">Intervalo (meses)</Label>
                    <Input
                      id="recurrenceInterval"
                      type="number"
                      min="1"
                      value={formData.recurrenceInterval || 1}
                      onChange={(e) => setFormData({ ...formData, recurrenceInterval: Number(e.target.value) })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoGenerate">Gerar Automaticamente</Label>
                  <p className="text-xs text-muted-foreground">Criar próximas ocorrências automaticamente</p>
                </div>
                <Switch
                  id="autoGenerate"
                  checked={formData.autoGenerate}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoGenerate: checked })}
                />
              </div>

              {formData.autoGenerate && (
                <div className="grid gap-2">
                  <Label htmlFor="recurrenceEndDate">Data Final (Opcional)</Label>
                  <DateInput
                    id="recurrenceEndDate"
                    value={formData.recurrenceEndDate || ""}
                    onChange={(value) => setFormData({ ...formData, recurrenceEndDate: value })}
                  />
                  <p className="text-xs text-muted-foreground">Deixe em branco para recorrência indefinida</p>
                </div>
              )}
            </div>

            {/* Vencimentos */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Vencimentos</h3>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <DateInput
                  id="dueDate"
                  value={formData.dueDate || ""}
                  onChange={(value) => setFormData({ ...formData, dueDate: value })}
                  placeholder="dd/mm/aaaa"
                />
                <p className="text-xs text-muted-foreground">Data de vencimento do imposto (aparecerá no calendário)</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weekendRule">Regra de Final de Semana *</Label>
                <Select
                  value={formData.weekendRule}
                  onValueChange={(value) => setFormData({ ...formData, weekendRule: value as any })}
                >
                  <SelectTrigger id="weekendRule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postpone">Postergar</SelectItem>
                    <SelectItem value="anticipate">Antecipar</SelectItem>
                    <SelectItem value="keep">Manter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Informações Adicionais
              </h3>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais, comentários internos..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="Adicionar tag..."
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Adicionar
                  </Button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Imposto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
