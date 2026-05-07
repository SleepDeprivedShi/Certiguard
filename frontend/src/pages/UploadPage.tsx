import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadTender, uploadBidders, processUploaded } from '../hooks/useApi'
import PipelineIndicator, { usePipelineStatus } from '../components/PipelineIndicator'

interface UploadPageProps {
  onComplete?: () => void
}

export default function UploadPage({ onComplete }: UploadPageProps) {
  const navigate = useNavigate()
  const [tenderId, setTenderId] = useState('T001')
  const [tenderName, setTenderName] = useState('CRPF Uniform Supply 2026')
  
  const [tenderFile, setTenderFile] = useState<File | null>(null)
  const [bidderFiles, setBidderFiles] = useState<File[]>([])
  
  const [step, setStep] = useState(1) // 1: tender, 2: bidders, 3: process
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { status: pipelineStatus, setPhase, setProgress, setError: setPipelineError, reset } = usePipelineStatus()

  const handleTenderUpload = async () => {
    if (!tenderFile) {
      setError('Please select a tender document')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')
    setPhase('uploading', 'Uploading tender document...')
    
    try {
      await uploadTender(tenderFile, tenderId, tenderName)
      setMessage('Tender uploaded successfully!')
      setStep(2)
      setPhase('complete', 'Tender uploaded!')
      setTimeout(reset, 1500)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to upload tender')
      setPipelineError('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBidderUpload = async () => {
    if (bidderFiles.length === 0) {
      setError('Please select at least one bidder document')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')
    setPhase('uploading', `Uploading ${bidderFiles.length} bidder documents...`)
    
    try {
      await uploadBidders(bidderFiles, tenderId)
      setMessage(`Uploaded ${bidderFiles.length} bidder documents!`)
      setStep(3)
      setPhase('complete', 'All documents uploaded!')
      setTimeout(reset, 1500)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to upload bidders')
      setPipelineError('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    
    const phases = [
      { phase: 'ocr' as const, message: 'Running OCR on documents...', details: ['Extracting text from PDFs', 'Detecting document format'] },
      { phase: 'extracting' as const, message: 'Extracting entities using AI...', details: ['Identifying GSTIN numbers', 'Extracting turnover values', 'Parsing experience data'] },
      { phase: 'verifying' as const, message: 'Verifying against criteria...', details: ['Validating GSTIN format', 'Checking certificate expiry', 'Cross-referencing identities'] },
      { phase: 'verdict' as const, message: 'Generating verdicts...', details: ['Computing eligibility scores', 'Generating yellow flags', 'Building audit records'] }
    ]
    
    const runPhases = async () => {
      for (let i = 0; i < phases.length; i++) {
        const { phase, message, details } = phases[i]
        setPhase(phase, message, details)
        setProgress(0)
        
        for (let p = 0; p <= 100; p += 10) {
          await new Promise(r => setTimeout(r, 100))
          setProgress(p)
        }
        
        await new Promise(r => setTimeout(r, 300))
      }
    }
    
    try {
      setPhase('ocr', 'Starting document processing...', ['Initializing pipeline'])
      await runPhases()
      
      const result = await processUploaded(tenderId, tenderName)
      
      setPhase('complete', 'Processing complete!', [`Processed ${bidderFiles.length} bidder documents`])
      
      setMessage(`Processed ${result.total_bidders || bidderFiles.length} bidders successfully!`)
      
      setTimeout(() => {
        navigate('/')
        onComplete?.()
      }, 2000)
    } catch (e: any) {
      setPipelineError(e.response?.data?.detail || 'Failed to process tender')
      setError('Processing failed. Using demo data instead.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload Tender & Bidders</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Tender Info */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tender ID
          </label>
          <input
            type="text"
            value={tenderId}
            onChange={(e) => setTenderId(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="T001"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tender Name
          </label>
          <input
            type="text"
            value={tenderName}
            onChange={(e) => setTenderName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="CRPF Uniform Supply 2026"
          />
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>1</div>
            <span className="ml-2 font-medium">Tender</span>
          </div>
          <div className="flex-1 h-1 bg-slate-200 mx-4">
            <div className={`h-full bg-blue-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>2</div>
            <span className="ml-2 font-medium">Bidders</span>
          </div>
          <div className="flex-1 h-1 bg-slate-200 mx-4">
            <div className={`h-full bg-blue-600 transition-all ${step >= 3 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>3</div>
            <span className="ml-2 font-medium">Process</span>
          </div>
        </div>
        
        {/* Step 1: Tender Upload */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 1: Upload Tender Document</h3>
            <p className="text-slate-600 mb-4">Select the tender PDF document containing eligibility criteria.</p>
            
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setTenderFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            
            {tenderFile && (
              <p className="mt-2 text-sm text-green-600">Selected: {tenderFile.name}</p>
            )}
          </div>
        )}
        
        {/* Step 2: Bidder Upload */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 2: Upload Bidder Documents</h3>
            <p className="text-slate-600 mb-4">Select all bidder submission PDFs (one file per bidder or multiple per bidder).</p>
            
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => setBidderFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            
            {bidderFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Selected files:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {bidderFiles.map((f, i) => (
                    <li key={i}>• {f.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Step 3: Process */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 3: Process Tender</h3>
            <p className="text-slate-600 mb-4">Ready to process! Click the button below to analyze all documents.</p>
            
            <div className="bg-blue-50 rounded-lg p-4 text-blue-800">
              <p><strong>Tender:</strong> {tenderName} ({tenderId})</p>
              <p><strong>Bidders:</strong> {bidderFiles.length} documents</p>
            </div>
            
            {loading && pipelineStatus.phase !== 'idle' && (
              <div className="mt-4">
                <PipelineIndicator tenderId={tenderId} />
              </div>
            )}
          </div>
        )}
        
        {/* Messages */}
        {message && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {step === 1 && (
            <button
              onClick={handleTenderUpload}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
              {loading ? 'Uploading...' : 'Upload Tender'}
            </button>
          )}
          
          {step === 2 && (
            <button
              onClick={handleBidderUpload}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
              {loading ? 'Uploading...' : 'Upload Bidders'}
            </button>
          )}
          
          {step === 3 && (
            <button
              onClick={handleProcess}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
              {loading ? 'Processing with AI...' : 'Process Tender'}
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}