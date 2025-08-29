import axios from 'axios'
export const API = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000' })
