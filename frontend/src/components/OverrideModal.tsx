import { useState } from 'react'
import type { CriterionResult, HumanOverrideInput } from '../types/api'
import { applyOverride } from '../hooks/useApi'

interface OverrideModalProps {
  criterion: CriterionResult
  bidderId: string
  onClose: () => void
  onSubmit: () => void
}

export default function OverrideModal({ criterion, bidderId, onClose, onSubmit }: OverrideModalProps) {
  const [verdict, setVerdict] = useState<'ELIGIBLE' | 'NOT_ELIGIBLE'>('ELIGIBLE')
  const [rationale, setRationale] = useState('')
  const [officerId, setOfficerId] = useState('')
  const [officerName, setOfficerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!rationale.trim()) {
      setError('Rationale is required')
      return
    }
    if (!officerId.trim() || !officerName.trim()) {
      setError('Officer ID and Name are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const input: HumanOverrideInput = {
        criterion_id: criterion.criterion_id,
        bidder_id: bidderId,
        override_verdict: verdict,
        officer_id: officerId,
        officer_name: officerName,
        rationale,
        signature: `SIGNATURE:${officerId}`
      }
      await applyOverride(input)
      onSubmit()
    } catch {
      setError('Failed to submit override')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Override Verdict</h3>
        <p className="text-slate-600 mb-4">
          Criterion: <span className="font-medium">{criterion.criterion_label}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Override Verdict</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setVerdict('ELIGIBLE')}
                className={`flex-1 py-2 rounded-lg border ${
                  verdict === 'ELIGIBLE' ? 'bg-green-100 border-green-500 text-green-700' : 'border-slate-300'
                }`}
              >
                Eligible
              </button>
              <button
                type="button"
                onClick={() => setVerdict('NOT_ELIGIBLE')}
                className={`flex-1 py-2 rounded-lg border ${
                  verdict === 'NOT_ELIGIBLE' ? 'bg-red-100 border-red-500 text-red-700' : 'border-slate-300'
                }`}
              >
                Not Eligible
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Officer ID</label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Officer Name</label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rationale (Required)</label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Override'}
          </button>
        </div>
      </div>
    </div>
  )
}