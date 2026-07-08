const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const configured = !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

async function send(toName, toEmail, subject, message) {
  if (!configured) return
  await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:  SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id:     PUBLIC_KEY,
      template_params: { to_name: toName, to_email: toEmail, subject, message },
    }),
  })
}

export async function notifyNewApplication(profile, job) {
  if (!profile?.notifications_enabled) return
  await send(
    profile.display_name, profile.email,
    `✅ Application Logged: ${job.company}`,
    `You've added a new application:\n\n• Company: ${job.company}\n• Role: ${job.role}\n• Status: ${job.status}\n\nGood luck! Stay consistent.\n\n— EmbedJobs Hub`
  )
}

export async function notifyStatusChange(profile, job, oldStatus, newStatus) {
  if (!profile?.notifications_enabled) return
  await send(
    profile.display_name, profile.email,
    `📋 Update: ${job.company} → ${newStatus}`,
    `Your application at ${job.company} for ${job.role} moved from "${oldStatus}" to "${newStatus}".\n\nKeep going! 💪\n\n— EmbedJobs Hub`
  )
}

export async function notifyWeeklySummary(profile, jobs) {
  if (!profile?.notifications_enabled) return
  const counts = {}
  jobs.forEach(j => { counts[j.status] = (counts[j.status] || 0) + 1 })
  const summary = Object.entries(counts).map(([k,v]) => `• ${k}: ${v}`).join('\n')
  await send(
    profile.display_name, profile.email,
    `📊 Weekly Job Search Summary`,
    `Here's your week:\n\n${summary}\n\nTotal: ${jobs.length} applications\n\nKeep pushing!\n\n— EmbedJobs Hub`
  )
}
