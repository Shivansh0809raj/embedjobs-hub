import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { getProfile, updateProfile } from '../lib/db.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)   // Supabase auth user
  const [profile, setProfile] = useState(null)   // our profiles table row
  const [loading, setLoading] = useState(true)

  // Load session on mount and listen for auth changes
  useEffect(() => {
    // Get current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      const p = await getProfile(userId)
      setProfile(p)
    } catch (e) {
      console.warn('Could not load profile:', e.message)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email, password, displayName) => {
    console.log('Attempting signup for:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    console.log('Supabase signUp response:', { data, error })
    if (error) {
      console.error('Signup error from Supabase:', error)
      throw error
    }
    // Supabase sometimes returns a user with identities=[] meaning email already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists. Please sign in instead.')
    }
    console.log('Signup successful, user:', data.user?.id)
    return data.user
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/embedjobs-hub/',
    })
    if (error) throw error
  }

  const saveProfile = async (updates) => {
    if (!user) return
    await updateProfile(user.id, updates)
    setProfile(p => ({ ...p, ...updates }))
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signup, login, logout, resetPassword, saveProfile, isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
