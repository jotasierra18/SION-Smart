'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OperationsDashboard } from './operations-dashboard'
import { AdminDashboard } from './admin-dashboard'
import { ClientsDashboard } from './clients-dashboard'
import { Activity, Users, ChartBar as BarChart3 } from 'lucide-react'

interface DashboardTabsProps {
  stats: {
    totalRequests: number
    pendingRequests: number
    completedRequests: number
    inProgressRequests: number
    cancelledRequests: number
    totalClients: number
    totalDrones: number
    totalOperators: number
    availableDrones: number
    inServiceDrones: number
    maintenanceDrones: number
  }
  clients: Array<{
    id: number
    nombreCompleto: string | null
    companyName: string | null
    email: string
    phone: string | null
    city: string | null
    totalRequests: number
    completedRequests: number
    pendingRequests: number
  }>
  monthlyData: Array<{
    month: string
    solicitudes: number
    completadas: number
    ingresos: number
  }>
  operatorPerformance: Array<{
    name: string
    completedTasks: number
    efficiency: number
  }>
  clientStats: {
    totalClients: number
    activeClients: number
    newClientsThisMonth: number
    topCity: string
  }
  activeRequest: {
    id: number
    location: string | null
    areaTotalM2: number | null
    horaInicio: string | null
    clients: { nombreCompleto: string | null; companyName: string | null } | null
    service_types: { name: string } | null
    drones: { nombre: string | null; serialNumber: string; codigoInterno: string | null } | null
    user: { name: string } | null
  } | null
}

export function DashboardTabs({ stats, clients, monthlyData, operatorPerformance, clientStats, activeRequest }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState('operaciones')

  const revenueThisMonth = monthlyData.length > 0
    ? monthlyData[monthlyData.length - 1].ingresos
    : 0
  const prevMonthRevenue = monthlyData.length > 1
    ? monthlyData[monthlyData.length - 2].ingresos
    : 0
  const revenueGrowth = prevMonthRevenue > 0
    ? Math.round(((revenueThisMonth - prevMonthRevenue) / prevMonthRevenue) * 100)
    : 0

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Panel de control SION S-MART</p>
          </div>
          <TabsList className="bg-slate-100">
            <TabsTrigger
              value="operaciones"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 gap-2"
            >
              <Activity className="w-4 h-4" />
              Operacion en Tiempo Real
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Administrador
            </TabsTrigger>
            <TabsTrigger
              value="clientes"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 gap-2"
            >
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="operaciones" className="mt-0">
          <OperationsDashboard stats={stats} activeRequest={activeRequest} />
        </TabsContent>

        <TabsContent value="admin" className="mt-0">
          <AdminDashboard
            stats={{
              ...stats,
              revenueThisMonth,
              revenueGrowth,
            }}
            monthlyData={monthlyData}
            operatorPerformance={operatorPerformance}
          />
        </TabsContent>

        <TabsContent value="clientes" className="mt-0">
          <ClientsDashboard
            clients={clients}
            stats={clientStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
