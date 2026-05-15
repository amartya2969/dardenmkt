import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { BugReportsAdmin } from './client'

export const metadata = { title: 'Bug Reports · Admin' }

export default async function BugReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin/bug-reports')
  if (!isAdminEmail(user.email)) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Bug Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reported issues, newest first. Click a status pill to advance the lifecycle.
          </p>
        </div>
        <BugReportsAdmin />
      </div>
    </div>
  )
}
