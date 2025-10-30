'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock, BarChart3, Pause, Play } from 'lucide-react'

interface WebsiteData {
  name: string
  provider: string
  color: string
  totalScraped: number
  totalUploaded: number
  recentScraped: number
  lastScrape: string | null
  status: 'healthy' | 'inactive'
}

interface HourlyData {
  hour: string
  websites: Record<string, {
    name: string
    color: string
    scraped: number
    uploaded: number
  }>
}

interface MonitoringData {
  hourlyData: HourlyData[]
  websiteStats: WebsiteData[]
  overallStats: {
    totalListings: number
    activeListings: number
    recentListings: number
    lastUpdated: string
  }
  websites: Array<{ name: string; provider: string; color: string }>
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch monitoring data')
  return res.json()
}

// Individual website chart component
function WebsiteChart({ website, hourlyData }: { website: WebsiteData; hourlyData: HourlyData[] }) {
  const chartData = hourlyData.map(hour => ({
    hour: new Date(hour.hour).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    scraped: hour.websites[website.provider]?.scraped || 0,
    uploaded: hour.websites[website.provider]?.uploaded || 0
  }))

  const maxValue = Math.max(...chartData.map(d => Math.max(d.scraped, d.uploaded)), 1)

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: website.color }}
            />
            {website.name}
          </CardTitle>
          <Badge variant={website.status === 'healthy' ? 'default' : 'secondary'}>
            {website.status === 'healthy' ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            {website.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Scraped</div>
              <div className="font-semibold">{website.totalScraped.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Uploaded</div>
              <div className="font-semibold">{website.totalUploaded.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Last 24h</div>
              <div className="font-semibold">{website.recentScraped}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Last Scrape</div>
              <div className="font-semibold text-xs">
                {website.lastScrape 
                  ? new Date(website.lastScrape).toLocaleString()
                  : 'Never'
                }
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="h-20 w-full">
            <div className="flex items-end justify-between h-full gap-1">
              {chartData.slice(-12).map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col items-center w-full">
                    <div 
                      className="w-full bg-blue-200 rounded-t-sm mb-1"
                      style={{ 
                        height: `${(data.scraped / maxValue) * 60}px`,
                        minHeight: data.scraped > 0 ? '2px' : '0px'
                      }}
                      title={`Scraped: ${data.scraped}`}
                    />
                    <div 
                      className="w-full rounded-b-sm"
                      style={{ 
                        backgroundColor: website.color,
                        height: `${(data.uploaded / maxValue) * 60}px`,
                        minHeight: data.uploaded > 0 ? '2px' : '0px'
                      }}
                      title={`Uploaded: ${data.uploaded}`}
                    />
                  </div>
                  {index % 3 === 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {data.hour}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-200 rounded-sm" />
              <span>Scraped</span>
            </div>
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-sm" 
                style={{ backgroundColor: website.color }}
              />
              <span>Uploaded</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Overall statistics component
function OverallStats({ data }: { data: MonitoringData }) {
  const { overallStats } = data
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
              <p className="text-2xl font-bold">{overallStats.totalListings.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold">{overallStats.activeListings.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Last 24h</p>
              <p className="text-2xl font-bold">{overallStats.recentListings.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm font-bold">
                {new Date(overallStats.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const { data, error, isLoading, mutate } = useSWR<MonitoringData>(
    '/api/monitoring/scraping-data',
    fetcher,
    {
      refreshInterval: autoRefresh ? 10000 : 0, // 10s polling only for data
      revalidateOnFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 animate-spin" />
            <span>Loading monitoring data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <button 
              onClick={() => mutate()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scraping Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of scraping activity across all websites
          </p>
        </div>
        <button
          onClick={() => setAutoRefresh(v => !v)}
          className={`px-3 py-2 rounded text-white flex items-center gap-2 ${autoRefresh ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          title={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
        >
          {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {autoRefresh ? 'Pause' : 'Auto-refresh'}
        </button>
      </div>

      {/* Overall Statistics */}
      <OverallStats data={data} />

      {/* Website Charts Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Website Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {data.websiteStats.map((website) => (
            <WebsiteChart 
              key={website.provider} 
              website={website} 
              hourlyData={data.hourlyData}
            />
          ))}
        </div>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Website Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Website</th>
                  <th className="text-right p-2">Total Scraped</th>
                  <th className="text-right p-2">Total Uploaded</th>
                  <th className="text-right p-2">Last 24h</th>
                  <th className="text-right p-2">Last Scrape</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.websiteStats.map((website) => (
                  <tr key={website.provider} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: website.color }}
                        />
                        {website.name}
                      </div>
                    </td>
                    <td className="text-right p-2 font-mono">
                      {website.totalScraped.toLocaleString()}
                    </td>
                    <td className="text-right p-2 font-mono">
                      {website.totalUploaded.toLocaleString()}
                    </td>
                    <td className="text-right p-2 font-mono">
                      {website.recentScraped}
                    </td>
                    <td className="text-right p-2 text-xs">
                      {website.lastScrape 
                        ? new Date(website.lastScrape).toLocaleString()
                        : 'Never'
                      }
                    </td>
                    <td className="text-center p-2">
                      <Badge variant={website.status === 'healthy' ? 'default' : 'secondary'}>
                        {website.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}