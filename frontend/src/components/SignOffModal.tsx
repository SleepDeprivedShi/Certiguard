import { useState } from 'react'
import { signOffTender } from '../hooks/useApi'

interface SignOffModalProps {
  tenderId: string
  onClose: () => void
  onSuccess: () => void
}

export default function SignOffModal({ tenderId, onClose, onSuccess }: SignOffModalProps) {
  const [officerId, setOfficerId] = useState('')
  const [officerName, setOfficerName] = useState('')
  const [signature, setSignature] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignOff = async () => {
    if (!officerId || !officerName || !signature) {
      setError('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await signOffTender(tenderId, officerId, officerName, signature, notes)
      onSuccess()
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to sign off')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Sign Off Tender Evaluation</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          By signing off, you approve the final evaluation and take responsibility for the decision.
        </p>
        
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Officer ID *</label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="e.g. OFF-001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Officer Name *</label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Digital Signature *</label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Your digital signature"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={handleSignOff}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Signing...' : 'Sign Off'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}