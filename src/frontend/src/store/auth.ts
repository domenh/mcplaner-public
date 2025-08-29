import { create } from 'zustand'

type AuthState = {
  token: string | null
  role: string | null
  username: string | null
  setAuth: (t: string, r: string, u: string) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('mc_token'),
  role: localStorage.getItem('mc_role'),
  username: localStorage.getItem('mc_user'),
  setAuth: (t,r,u) => {
    localStorage.setItem('mc_token', t)
    localStorage.setItem('mc_role', r)
    localStorage.setItem('mc_user', u)
    set({ token: t, role: r, username: u })
  },
  logout: () => {
    localStorage.removeItem('mc_token')
    localStorage.removeItem('mc_role')
    localStorage.removeItem('mc_user')
    set({ token: null, role: null, username: null })
  }
}))
