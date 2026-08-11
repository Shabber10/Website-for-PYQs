// API service for interacting with the Express + MongoDB backend

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function uploadPdf(formData) {
  const response = await fetch(`${API_BASE}/pdfs/upload`, {
    method: 'POST',
    body: formData
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to upload PDF to server.')
  }
  return data
}

export async function fetchPdfs(params = {}) {
  const query = new URLSearchParams()
  if (params.category) query.append('category', params.category)
  if (params.search) query.append('search', params.search)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  const response = await fetch(`${API_BASE}/pdfs${queryString}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch PDFs from backend.')
  }
  
  return await response.json()
}

export async function deletePdf(id) {
  const response = await fetch(`${API_BASE}/pdfs/${id}`, {
    method: 'DELETE'
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to delete PDF.')
  }
  return data
}
