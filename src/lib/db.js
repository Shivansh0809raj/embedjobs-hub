import { supabase } from './supabase.js'

// ── Profile ───────────────────────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  if (error) throw error
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
export async function getJobs(userId) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addJob(userId, job) {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...job, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateJob(jobId, updates) {
  const { error } = await supabase
    .from('jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', jobId)
  if (error) throw error
}

export async function deleteJob(jobId) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
  if (error) throw error
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAllJobsForUser(userId) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function setUserRole(userId, role) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw error
}
