import axios from 'axios'
import type { VerdictOutput, HumanOverrideInput, AuditRecordEntry, CriterionResult } from '../types/api'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

export interface TenderSummary {
  tender_id: string
  tender_name: string
  bidder_count: number
  status: string
  submission_deadline?: string
}

export interface TenderCriteria {
  id: string
  label: string
  type: string
  nature: string
  threshold?: number | string
  unit?: string
}

export interface TenderDetail {
  tender_id: string
  tender_name: string
  submission_deadline: string
  status: string
  bidder_count: number
  criteria: TenderCriteria[]
  criteria_extracted: boolean
}

interface TendersResponse {
  tenders: TenderSummary[]
}

export async function getTenders(): Promise<TenderSummary[]> {
  const { data } = await api.get<TendersResponse>('/tenders')
  return data.tenders
}

export async function getTenderDetail(tenderId: string): Promise<TenderDetail> {
  const { data } = await api.get<TenderDetail>(`/tenders/${tenderId}`)
  return data
}

export async function getReviewQueue(tenderId: string): Promise<VerdictOutput> {
  const { data } = await api.get<VerdictOutput>('/review/queue', { params: { tender_id: tenderId } })
  return data
}

export async function getCriterionDetail(criterionId: string): Promise<CriterionResult> {
  const { data } = await api.get<CriterionResult>(`/review/criterion/${criterionId}`)
  return data
}

export async function applyOverride(input: HumanOverrideInput): Promise<AuditRecordEntry> {
  const { data } = await api.post<AuditRecordEntry>('/override/apply', input)
  return data
}

export async function generateReport(tenderId: string, format: 'pdf' | 'json' | 'xlsx' = 'pdf'): Promise<Blob> {
  const { data } = await api.get(`/report/generate`, {
    params: { tender_id: tenderId, format },
    responseType: 'blob'
  })
  return data
}

export async function downloadReport(tenderId: string, format: string): Promise<Blob> {
  const { data } = await api.get(`/report/download/${format}`, {
    params: { tender_id: tenderId },
    responseType: 'blob'
  })
  return data
}

export interface UploadStatus {
  tender_id: string
  tender_uploaded: boolean
  tender_files: string[]
  bidders_uploaded: number
  bidder_files: string[]
}

export async function uploadTender(file: File, tenderId: string, tenderName: string): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('tender_id', tenderId)
  formData.append('tender_name', tenderName)
  
  const { data } = await api.post('/upload/tender', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function uploadBidders(files: File[], tenderId: string): Promise<any> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }
  formData.append('tender_id', tenderId)
  
  const { data } = await api.post('/upload/bidders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function processUploaded(tenderId: string, tenderName: string): Promise<any> {
  const formData = new FormData()
  formData.append('tender_id', tenderId)
  formData.append('tender_name', tenderName)
  
  const { data } = await api.post('/upload/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

export async function getUploadStatus(tenderId: string): Promise<UploadStatus> {
  const { data } = await api.get<UploadStatus>(`/upload/status/${tenderId}`)
  return data
}

export interface CriteriaInfo {
  tender_id: string
  criteria: any[]
  criteria_approved: boolean
  sign_off: any | null
}

export async function getCriteria(tenderId: string): Promise<CriteriaInfo> {
  const { data } = await api.get<CriteriaInfo>(`/criteria/${tenderId}`)
  return data
}

export async function approveCriteria(tenderId: string, officerId: string, officerName: string, signature: string): Promise<any> {
  const { data } = await api.post(`/criteria/${tenderId}/approve`, null, {
    params: { officer_id: officerId, officer_name: officerName, signature }
  })
  return data
}

export async function updateCriteria(tenderId: string, criteria: any[]): Promise<any> {
  const { data } = await api.post(`/criteria/${tenderId}/update`, { criteria })
  return data
}

export async function signOffTender(tenderId: string, officerId: string, officerName: string, signature: string, notes: string = ""): Promise<any> {
  const { data } = await api.post(`/signoff/${tenderId}`, null, {
    params: { officer_id: officerId, officer_name: officerName, signature, notes }
  })
  return data
}