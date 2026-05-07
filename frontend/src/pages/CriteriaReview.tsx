import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCriteria, approveCriteria, updateCriteria } from '../hooks/useApi'

interface Criterion {
  id: string
  label: string
  type: string
  nature: string
  threshold?: number | string
  unit?: string
}

export default function CriteriaReviewPage() {
  const navigate = useNavigate()
  const { tenderId } = useParams<{ tenderId: string }>()
  
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [approved, setApproved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [officerId, setOfficerId] = useState('')
  const [officerName, setOfficerName] = useState('')
  const [signature, setSignature] = useState('')

  useEffect(() => {
    loadCriteria()
  }, [tenderId])

  const loadCriteria = async () => {
    try {
      const data = await getCriteria(tenderId!)
      setCriteria(data.criteria || [])
      setApproved(data.criteria_approved || false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCriterion = (index: number, field: string, value: string) => {
    const updated = [...criteria]
    updated[index] = { ...updated[index], [field]: value }
    setCriteria(updated)
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      await updateCriteria(tenderId!, criteria)
      setMessage('Criteria updated successfully! Please review and approve.')
    } catch (e: any) {
      setMessage('Error: ' + (e.response?.data?.detail || e.message))
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (!officerId || !officerName || !signature) {
      setMessage('Please enter officer ID, name, and signature to approve.')
      return
    }
    
    setSaving(true)
    try {
      await approveCriteria(tenderId!, officerId, officerName, signature)
      setApproved(true)
      setMessage('Criteria approved successfully!')
    } catch (e: any) {
      setMessage('Error: ' + (e.response?.data?.detail || e.message))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          Review Extracted Criteria - {tenderId}
        </h1>
      </div>

      {approved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span className="font-semibold text-green-800">Criteria Approved</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            These criteria have been reviewed and approved by the procurement officer.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Label</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nature</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Threshold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {criteria.map((crit, idx) => (
              <tr key={crit.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                    {crit.id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={crit.label}
                    onChange={(e) => handleUpdateCriterion(idx, 'label', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                    disabled={approved}
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={crit.type}
                    onChange={(e) => handleUpdateCriterion(idx, 'type', e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded text-sm"
                    disabled={approved}
                  >
                    <option value="technical">Technical</option>
                    <option value="financial">Financial</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    crit.nature === 'MANDATORY' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {crit.nature}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={crit.threshold || ''}
                    onChange={(e) => handleUpdateCriterion(idx, 'threshold', e.target.value)}
                    placeholder="e.g. 50L, 5 years"
                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                    disabled={approved}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {criteria.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No criteria extracted. Please process the tender first.
          </div>
        )}
      </div>

      {criteria.length > 0 && !approved && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {!approved && criteria.length > 0 && (
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-4">Approve Criteria</h3>
          <p className="text-sm text-blue-600 mb-4">
            Enter your details to approve the extracted criteria. This locks the criteria for final evaluation.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Officer ID</label>
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="e.g. OFF-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Officer Name</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Full name"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Signature</label>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Digital signature"
            />
          </div>
          
          <button
            onClick={handleApprove}
            disabled={saving || !officerId || !officerName || !signature}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Approving...' : 'Approve Criteria'}
          </button>
        </div>
      )}
    </div>
  )
}