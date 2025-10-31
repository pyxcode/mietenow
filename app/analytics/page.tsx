'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface AnalyticsData {
  totals: {
    totalListings: number
    activeListings: number
    inactiveListings: number
    avgPrice: number
    minPrice: number
    maxPrice: number
  }
  newListings: {
    today: number
    yesterday: number
    last7Days: number
    last30Days: number
    thisMonth: number
    lastMonth: number
  }
  openAICosts: {
    totalCostEUR: string
    thisMonthCost: string
    lastMonthCost: string
    todayCost: string
    last7DaysCost: string
    last30DaysCost: string
    estimatedCalls: number
    costPerCall: number
  }
  breakdown: {
    byType: Array<{ type: string; count: number }>
    byProvider: Array<{ provider: string; count: number }>
  }
  dailyStats: Array<{ date: string; count: number; costEUR: number }>
  recentActivity: Array<{
    title: string
    price: number
    provider: string
    createdAt: string
    url: string
  }>
  lastUpdated: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch analytics')
  return res.json()
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendLabel 
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: number
  trendLabel?: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
            {trendLabel && <span className="text-gray-500 ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

function CostCard({ data }: { data: AnalyticsData }) {
  const { openAICosts, newListings } = data
  
  const monthlyTrend = newListings.lastMonth > 0
    ? ((parseFloat(openAICosts.thisMonthCost) - parseFloat(openAICosts.lastMonthCost)) / parseFloat(openAICosts.lastMonthCost)) * 100
    : 0

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <DollarSign className="w-6 h-6 text-purple-600" />
        </div>
        <span className="text-xs text-gray-600">GPT-4.1-nano</span>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">
        {parseFloat(openAICosts.thisMonthCost).toFixed(2)}€
      </h3>
      <p className="text-sm text-gray-600 mb-4">Coût ce mois-ci</p>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Aujourd'hui:</span>
          <span className="font-semibold">{parseFloat(openAICosts.todayCost).toFixed(4)}€</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">7 derniers jours:</span>
          <span className="font-semibold">{parseFloat(openAICosts.last7DaysCost).toFixed(2)}€</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">30 derniers jours:</span>
          <span className="font-semibold">{parseFloat(openAICosts.last30DaysCost).toFixed(2)}€</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-purple-200">
          <span className="text-gray-600">Total estimé:</span>
          <span className="font-bold text-purple-700">{parseFloat(openAICosts.totalCostEUR).toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Appels estimés:</span>
          <span>{openAICosts.estimatedCalls.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Coût/appel:</span>
          <span>{(openAICosts.costPerCall * 1000).toFixed(2)}€ pour 1000 appels</span>
        </div>
      </div>

      {monthlyTrend !== 0 && (
        <div className={`mt-4 flex items-center gap-1 text-sm ${monthlyTrend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
          {monthlyTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>vs mois dernier: {Math.abs(monthlyTrend).toFixed(1)}%</span>
        </div>
      )}
    </div>
  )
}

function DailyChart({ data }: { data: AnalyticsData }) {
  const maxCount = Math.max(...data.dailyStats.map(d => d.count), 1)
  const maxCost = Math.max(...data.dailyStats.map(d => d.costEUR), 0.01)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        Activité quotidienne (30 derniers jours)
      </h3>
      <div className="flex items-end justify-between gap-1 h-64">
        {data.dailyStats.map((day, index) => (
          <div key={day.date} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col items-center justify-end h-full gap-1">
              {/* Cost bar */}
              <div 
                className="w-full bg-purple-200 rounded-t"
                style={{ 
                  height: `${(day.costEUR / maxCost) * 200}px`,
                  minHeight: day.costEUR > 0 ? '2px' : '0px'
                }}
                title={`${day.date}: ${day.count} listings, ${day.costEUR.toFixed(4)}€`}
              />
              {/* Count bar */}
              <div 
                className="w-full bg-blue-400 rounded-t"
                style={{ 
                  height: `${(day.count / maxCount) * 200}px`,
                  minHeight: day.count > 0 ? '2px' : '0px'
                }}
              />
            </div>
            {index % 7 === 0 && (
              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left whitespace-nowrap">
                {new Date(day.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span>Nouveaux listings</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-200 rounded"></div>
          <span>Coût OpenAI</span>
        </div>
      </div>
    </div>
  )
}

function BreakdownChart({ data, type }: { data: AnalyticsData; type: 'byType' | 'byProvider' }) {
  const items = data.breakdown[type]
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-blue-600" />
        Répartition par {type === 'byType' ? 'type' : 'source'}
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0
          return (
            <div key={item[type === 'byType' ? 'type' : 'provider']}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium capitalize">
                  {item[type === 'byType' ? 'type' : 'provider']}
                </span>
                <span className="text-sm text-gray-600">
                  {item.count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    '/api/analytics/stats',
    fetcher,
    {
      refreshInterval: autoRefresh ? 30000 : 0, // 30s if enabled
      revalidateOnFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg">Chargement des analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erreur</h2>
              <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Erreur inconnue'}</p>
              <button 
                onClick={() => mutate()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const newListingsTrend = data.newListings.yesterday > 0
    ? ((data.newListings.today - data.newListings.yesterday) / data.newListings.yesterday) * 100
    : 0

  const activeRate = data.totals.totalListings > 0
    ? (data.totals.activeListings / data.totals.totalListings) * 100
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Statistiques et coûts OpenAI - Dernière mise à jour: {new Date(data.lastUpdated).toLocaleString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => mutate()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={() => setAutoRefresh(v => !v)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              {autoRefresh ? 'Auto-actualisation ON' : 'Auto-actualisation OFF'}
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Listings totaux"
            value={data.totals.totalListings.toLocaleString()}
            subtitle={`${data.totals.activeListings} actifs`}
            icon={FileText}
          />
          <StatCard
            title="Nouveaux aujourd'hui"
            value={data.newListings.today}
            subtitle={`${data.newListings.yesterday} hier`}
            icon={Activity}
            trend={newListingsTrend}
            trendLabel="vs hier"
          />
          <StatCard
            title="7 derniers jours"
            value={data.newListings.last7Days}
            subtitle={`${data.newListings.last30Days} sur 30 jours`}
            icon={Calendar}
          />
          <StatCard
            title="Taux d'activité"
            value={`${activeRate.toFixed(1)}%`}
            subtitle={`${data.totals.inactiveListings} inactifs`}
            icon={activeRate > 80 ? CheckCircle : activeRate > 50 ? AlertCircle : XCircle}
          />
        </div>

        {/* Cost Card + Price Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <CostCard data={data} />
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Statistiques de prix
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Prix moyen</p>
                <p className="text-2xl font-bold text-gray-900">{data.totals.avgPrice.toLocaleString()}€</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Prix min</p>
                <p className="text-2xl font-bold text-blue-600">{data.totals.minPrice.toLocaleString()}€</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Prix max</p>
                <p className="text-2xl font-bold text-red-600">{data.totals.maxPrice.toLocaleString()}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BreakdownChart data={data} type="byType" />
          <BreakdownChart data={data} type="byProvider" />
        </div>

        {/* Daily Activity */}
        <div className="mb-6">
          <DailyChart data={data} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
          <div className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">
                    {activity.provider} • {new Date(activity.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{activity.price}€</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

