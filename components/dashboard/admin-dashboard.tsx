'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  FileText, 
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface AdminDashboardProps {
  stats: {
    totalRequests: number
    pendingRequests: number
    completedRequests: number
    inProgressRequests: number
    totalClients: number
    totalDrones: number
    totalOperators: number
    revenueThisMonth: number
    revenueGrowth: number
  }
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
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export function AdminDashboard({ stats, monthlyData, operatorPerformance }: AdminDashboardProps) {
  const requestsDistribution = [
    { name: 'Completadas', value: stats.completedRequests, color: '#22c55e' },
    { name: 'En Proceso', value: stats.inProgressRequests, color: '#3b82f6' },
    { name: 'Pendientes', value: stats.pendingRequests, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Solicitudes</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRequests}</p>
              <div className="flex items-center gap-1 mt-2 text-blue-100 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12% vs mes anterior</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium">Completadas</p>
              <p className="text-3xl font-bold mt-1">{stats.completedRequests}</p>
              <div className="flex items-center gap-1 mt-2 text-green-100 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>{Math.round((stats.completedRequests / stats.totalRequests) * 100)}% tasa exito</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm font-medium">Pendientes</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingRequests}</p>
              <div className="flex items-center gap-1 mt-2 text-amber-100 text-sm">
                <Clock className="w-4 h-4" />
                <span>Requieren atencion</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium">Ingresos Mes</p>
              <p className="text-3xl font-bold mt-1">${stats.revenueThisMonth.toLocaleString('es-CO')}</p>
              <div className="flex items-center gap-1 mt-2 text-purple-100 text-sm">
                {stats.revenueGrowth >= 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+{stats.revenueGrowth}% crecimiento</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    <span>{stats.revenueGrowth}% decremento</span>
                  </>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clientes</p>
              <p className="text-xl font-bold">{stats.totalClients}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drones Activos</p>
              <p className="text-xl font-bold">{stats.totalDrones}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Operadores</p>
              <p className="text-xl font-bold">{stats.totalOperators}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Actividad Mensual</h3>
              <p className="text-sm text-muted-foreground">Solicitudes y completadas por mes</p>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Este Ano
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="solicitudes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Solicitudes" />
                <Bar dataKey="completadas" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completadas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Requests Distribution */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Distribucion</h3>
            <p className="text-sm text-muted-foreground">Estado de solicitudes</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestsDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {requestsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {requestsDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Operator Performance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg">Rendimiento de Operadores</h3>
            <p className="text-sm text-muted-foreground">Top operadores por tareas completadas</p>
          </div>
          <Button variant="outline" size="sm">Ver todos</Button>
        </div>
        <div className="space-y-4">
          {operatorPerformance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No hay datos de operadores</p>
            </div>
          ) : (
            operatorPerformance.map((operator, index) => (
              <div key={operator.name} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{operator.name}</span>
                    <span className="text-sm text-muted-foreground">{operator.completedTasks} tareas</span>
                  </div>
                  <Progress value={operator.efficiency} className="h-2" />
                </div>
                <Badge variant={operator.efficiency >= 80 ? 'default' : 'secondary'} className={operator.efficiency >= 80 ? 'bg-green-100 text-green-700' : ''}>
                  {operator.efficiency}%
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
