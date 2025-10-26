"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ClientList } from "@/components/client-list"
import { getClients } from "@/lib/supabase/database"
import type { Client } from "@/lib/types"

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const clientsData = await getClients()
      setClients(clientsData)
    } catch (error) {
      console.error("[v0] Error loading clients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleUpdate()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground mt-2">Gerencie os clientes e suas informações</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando clientes...</div>
          ) : (
            <ClientList clients={clients} onUpdate={handleUpdate} />
          )}
        </div>
      </main>
    </div>
  )
}
