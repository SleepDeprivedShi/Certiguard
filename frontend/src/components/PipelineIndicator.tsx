import { useState, useEffect } from 'react'

export type PipelinePhase = 
  | 'idle'
  | 'uploading'
  | 'ocr'
  | 'extracting'
  | 'verifying'
  | 'verdict'
  | 'complete'
  | 'error'

interface PipelineStatus {
  phase: PipelinePhase
  progress: number
  message: string
  details?: string[]
}

interface PipelineIndicatorProps {
  tenderId?: string
}

const PHASES: { id: PipelinePhase; label: string; icon: string }[] = [
  { id: 'uploading', label: 'Upload', icon: '📤' },
  { id: 'ocr', label: 'OCR', icon: '📄' },
  { id: 'extracting', label: 'Extract', icon: '🔍' },
  { id: 'verifying', label: 'Verify', icon: '✅' },
  { id: 'verdict', label: 'Verdict', icon: '⚖️' },
  { id: 'complete', label: 'Done', icon: '✓' }
]

export default function PipelineIndicator({ tenderId }: PipelineIndicatorProps) {
  const [status, setStatus] = useState<PipelineStatus>({
    phase: 'idle',
    progress: 0,
    message: 'Ready to process'
  })

  const currentPhaseIndex = PHASES.findIndex(p => p.id === status.phase)
  const progressPercent = status.phase === 'complete' ? 100 : 
    status.phase === 'idle' ? 0 : 
    ((currentPhaseIndex + (status.progress / 100)) / PHASES.length) * 100

  useEffect(() => {
    if (!tenderId) {
      setStatus({ phase: 'idle', progress: 0, message: 'Ready to process' })
    }
  }, [tenderId])

  const getPhaseStatus = (phase: PipelinePhase) => {
    const idx = PHASES.findIndex(p => p.id === phase)
    const currentIdx = PHASES.findIndex(p => p.id === status.phase)
    
    if (status.phase === 'error') return 'error'
    if (idx < currentIdx) return 'complete'
    if (idx === currentIdx) return 'active'
    return 'pending'
  }

  const getPhaseColor = (phaseStatus: string) => {
    switch (phaseStatus) {
      case 'complete': return 'bg-green-500 border-green-500 text-white'
      case 'active': return 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-200'
      case 'error': return 'bg-red-500 border-red-500 text-white'
      default: return 'bg-slate-200 border-slate-300 text-slate-400'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Processing Pipeline</h3>
          <p className="text-sm text-slate-500">{status.message}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{Math.round(progressPercent)}%</span>
          <p className="text-xs text-slate-400">Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            status.phase === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-green-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Phase Steps */}
      <div className="flex justify-between">
        {PHASES.map((phase, idx) => {
          const phaseStatus = getPhaseStatus(phase.id)
          const colorClass = getPhaseColor(phaseStatus)
          
          return (
            <div key={phase.id} className="flex flex-col items-center relative">
              {/* Connector Line */}
              {idx < PHASES.length - 1 && (
                <div className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 ${
                  phaseStatus === 'complete' ? 'bg-green-500' : 'bg-slate-200'
                }`} style={{ width: 'calc(100% - 0px)' }} />
              )}
              
              {/* Icon Circle */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                border-2 transition-all duration-300 ${colorClass}
              `}>
                {phaseStatus === 'complete' ? '✓' : phase.icon}
              </div>
              
              {/* Label */}
              <span className={`
                mt-2 text-xs font-medium
                ${phaseStatus === 'active' ? 'text-blue-600' : 
                  phaseStatus === 'complete' ? 'text-green-600' :
                  phaseStatus === 'error' ? 'text-red-600' : 'text-slate-400'}
              `}>
                {phase.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Details Panel */}
      {status.details && status.details.length > 0 && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Processing Details</h4>
          <ul className="space-y-1">
            {status.details.map((detail, idx) => (
              <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function usePipelineStatus() {
  const [status, setStatus] = useState<PipelineStatus>({
    phase: 'idle',
    progress: 0,
    message: 'Ready to process'
  })

  const setPhase = (phase: PipelinePhase, message?: string, details?: string[]) => {
    setStatus({
      phase,
      progress: 0,
      message: message || getDefaultMessage(phase),
      details
    })
  }

  const setProgress = (progress: number) => {
    setStatus(prev => ({ ...prev, progress }))
  }

  const setError = (message: string) => {
    setStatus({ phase: 'error', progress: 0, message })
  }

  const reset = () => {
    setStatus({ phase: 'idle', progress: 0, message: 'Ready to process' })
  }

  return { status, setPhase, setProgress, setError, reset }
}

function getDefaultMessage(phase: PipelinePhase): string {
  switch (phase) {
    case 'idle': return 'Ready to process'
    case 'uploading': return 'Uploading documents...'
    case 'ocr': return 'Extracting text from PDFs...'
    case 'extracting': return 'Identifying entities (GSTIN, PAN, Turnover)...'
    case 'verifying': return 'Verifying against tender criteria...'
    case 'verdict': return 'Generating eligibility verdicts...'
    case 'complete': return 'Processing complete!'
    case 'error': return 'An error occurred'
  }
}
