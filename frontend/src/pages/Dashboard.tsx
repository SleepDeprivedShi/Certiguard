import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTenders } from '../hooks/useApi'
import type { TenderSummary } from '../hooks/useApi'

interface DashboardProps {
  onSelectTender: (tenderId: string) => void
}

export default function Dashboard({ onSelectTender }: DashboardProps) {
  const navigate = useNavigate()
  const [recentTenders, setRecentTenders] = useState<TenderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTenders()
      .then(setRecentTenders)
      .catch(err => console.error('Failed to fetch tenders:', err))
      .finally(() => setLoading(false))
  }, [])

  const completedCount = recentTenders.filter(t => t.status === 'completed').length
  const activeCount = recentTenders.filter(t => t.status === 'active').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Overview of recent tender evaluations</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500">Total Tenders</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{recentTenders.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500">Active</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{activeCount}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Recent Tenders</h3>
            </div>
            {recentTenders.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No tenders found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Tender ID</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Bidders</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTenders.map((tender) => (
                    <tr key={tender.tender_id} className="border-t border-slate-100">
                      <td className="p-4 text-sm">{tender.tender_id}</td>
                      <td className="p-4 text-sm">{tender.tender_name}</td>
                      <td className="p-4 text-sm">{tender.bidder_count}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            tender.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : tender.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {tender.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => { onSelectTender(tender.tender_id); navigate('/queue'); }}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}