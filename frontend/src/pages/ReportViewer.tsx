import { useState, useEffect } from 'react'
import { generateReport, getReviewQueue } from '../hooks/useApi'

interface ReportViewerProps {
  tenderId: string
}

export default function ReportViewer({ tenderId }: ReportViewerProps) {
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'json' | 'xlsx'>('pdf')
  const [summary, setSummary] = useState<{total: number, eligible: number, not_eligible: number, needs_review: number} | null>(null)

  useEffect(() => {
    if (!tenderId) return
    fetchSummary()
  }, [tenderId])

  const fetchSummary = async () => {
    try {
      const data = await getReviewQueue(tenderId)
      if (data.summary) {
        setSummary(data.summary)
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    }
  }

  const handleDownload = async () => {
    if (!tenderId) return
    setLoading(true)
    try {
      const blob = await generateReport(tenderId, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${tenderId}_report.${format}`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate report:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!tenderId) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Select a tender from the Dashboard to view reports.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Report Viewer</h2>
        <p className="text-slate-500">{tenderId}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Final Evaluation Report</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">Generated: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-slate-500">Report includes all bidder verdicts and audit records</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as typeof format)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
              <option value="xlsx">Excel</option>
            </select>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Download Report'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Audit Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Total Bidders</p>
            <p className="text-2xl font-bold text-slate-800">{summary?.total ?? '-'}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Eligible</p>
            <p className="text-2xl font-bold text-green-700">{summary?.eligible ?? '-'}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">Not Eligible</p>
            <p className="text-2xl font-bold text-red-700">{summary?.not_eligible ?? '-'}</p>
          </div>
        </div>
        {summary && summary.needs_review > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg col-start-3">
              <p className="text-sm text-yellow-600">Needs Review</p>
              <p className="text-2xl font-bold text-yellow-700">{summary.needs_review}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}