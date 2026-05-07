import { useState, useEffect } from 'react'

interface ExtractorMetrics {
  name: string
  type: string
  precision: number
  recall: number
  f1: number
  avgConfidence: number
  extractionTime: number
}

const mockMetrics: ExtractorMetrics[] = [
  {
    name: 'AI Extractor (Gemma)',
    type: 'LLM',
    precision: 0.94,
    recall: 0.91,
    f1: 0.92,
    avgConfidence: 0.92,
    extractionTime: 2.3
  },
  {
    name: 'ML Extractor (spaCy)',
    type: 'ML',
    precision: 0.82,
    recall: 0.78,
    f1: 0.80,
    avgConfidence: 0.81,
    extractionTime: 0.8
  },
  {
    name: 'Regex Extractor',
    type: 'Rule-based',
    precision: 0.65,
    recall: 0.72,
    f1: 0.68,
    avgConfidence: 0.70,
    extractionTime: 0.1
  }
]

const entityMetrics = [
  { entity: 'GST Numbers', ai: 96, ml: 85, regex: 70 },
  { entity: 'Turnover Values', ai: 94, ml: 82, regex: 65 },
  { entity: 'Experience Years', ai: 91, ml: 79, regex: 75 },
  { entity: 'Company Names', ai: 89, ml: 88, regex: 60 },
  { entity: 'Dates', ai: 95, ml: 72, regex: 85 }
]

export default function MLMetricsPage() {
  const [metrics, setMetrics] = useState<ExtractorMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview')

  useEffect(() => {
    // Simulate loading metrics
    setTimeout(() => {
      setMetrics(mockMetrics)
      setLoading(false)
    }, 500)
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50'
    if (score >= 0.8) return 'text-blue-600 bg-blue-50'
    if (score >= 0.7) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  const getBarWidth = (value: number) => `${value}%`

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">ML Metrics & Extractor Comparison</h1>
        <p className="text-slate-500">Performance comparison of AI, ML, and Regex extractors</p>
      </div>

      {/* AI Status Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">AI Extractor Active</p>
              <p className="text-sm text-purple-200">Using Gemma 4 for entity extraction</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-white/20 rounded-lg">
            <p className="text-sm text-purple-200">Best Performer</p>
            <p className="font-bold">F1: 0.92</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'overview' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'detailed' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Detailed Analysis
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading metrics...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Extractor Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((ext, idx) => (
                  <div 
                    key={ext.name}
                    className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                      idx === 0 ? 'border-purple-500 ring-2 ring-purple-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-800">{ext.name}</h3>
                      {idx === 0 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                          Best
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mb-4">{ext.type}</div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Precision</span>
                          <span className="font-medium text-slate-800">{Math.round(ext.precision * 100)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: getBarWidth(ext.precision * 100) }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Recall</span>
                          <span className="font-medium text-slate-800">{Math.round(ext.recall * 100)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: getBarWidth(ext.recall * 100) }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">F1 Score</span>
                          <span className="font-medium text-slate-800">{Math.round(ext.f1 * 100)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: getBarWidth(ext.f1 * 100) }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Avg Confidence</span>
                        <span className="font-medium text-slate-700">{Math.round(ext.avgConfidence * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-slate-500">Extraction Time</span>
                        <span className="font-medium text-slate-700">{ext.extractionTime}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Entity-wise Comparison */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Entity Extraction Accuracy</h3>
                <div className="space-y-4">
                  {entityMetrics.map((entity) => (
                    <div key={entity.entity}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700">{entity.entity}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">AI</div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${entity.ai}%` }}
                            />
                          </div>
                          <div className="text-xs text-right mt-1 text-slate-600">{entity.ai}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">ML</div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${entity.ml}%` }}
                            />
                          </div>
                          <div className="text-xs text-right mt-1 text-slate-600">{entity.ml}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Regex</div>
                          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${entity.regex}%` }}
                            />
                          </div>
                          <div className="text-xs text-right mt-1 text-slate-600">{entity.regex}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Extractor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Precision</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Recall</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">F1 Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Confidence</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Speed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.map((ext, idx) => (
                      <tr key={ext.name} className={idx === 0 ? 'bg-purple-50' : ''}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {idx === 0 && <span className="text-purple-500">★</span>}
                            <span className="font-medium text-slate-800">{ext.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{ext.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(ext.precision)}`}>
                            {Math.round(ext.precision * 100)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(ext.recall)}`}>
                            {Math.round(ext.recall * 100)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getScoreColor(ext.f1)}`}>
                            {Math.round(ext.f1 * 100)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{Math.round(ext.avgConfidence * 100)}%</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{ext.extractionTime}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Key Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">AI Extractor Performance</h4>
                    <p className="text-sm text-green-700">
                      AI (Gemma) outperforms ML and Regex by 12-27% across all entity types. 
                      Best at extracting complex entities like turnover values and company names.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">ML Extractor Balance</h4>
                    <p className="text-sm text-blue-700">
                      ML (spaCy) offers a good balance between accuracy and speed. 
                      Suitable for real-time processing when API costs are a concern.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">Regex Use Cases</h4>
                    <p className="text-sm text-amber-700">
                      Regex is fastest but least accurate. Best used as fallback 
                      for simple patterns like dates and basic numbers.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Recommendation</h4>
                    <p className="text-sm text-purple-700">
                      Use AI as primary extractor for tender evaluation. 
                      Fall back to ML if API unavailable, Regex only for edge cases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}