import axios from 'axios'

// Base axios instance that targets the Vite dev server proxy (`/api` -> backend).
// Use concise comments above logical blocks to explain intent.
export const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// Log outgoing requests so we can quickly debug proxy/URL issues.
api.interceptors.request.use((config) => {
  try {
    const fullUrl = (config.baseURL || '') + (config.url || '')
    // eslint-disable-next-line no-console
    console.debug('[api] request ->', config.method?.toUpperCase(), fullUrl)
  } catch (e) {
    // ignore logging errors
  }
  return config
})

// Log responses and errors to the console for easier debugging during dev.
api.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line no-console
    console.debug('[api] response <-', response.status, response.config.url)
    return response
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.error('[api] response error', error)
    return Promise.reject(error)
  }
)

export default api

// Lightweight helpers for job endpoints. Keeps calling code small and testable.
export const updateJob = (id: number, payload: any) => {
  return api.put(`/jobs/${id}`, payload)
}

export const getJobs = () => api.get('/jobs')
