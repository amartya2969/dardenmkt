import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { JoinRequestsAdmin } from './client'

// Server component: gate access to admins, then hand off to client UI.
export default async function JoinRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/admin/join-requests')
  if (!isAdminEmail(user.email)) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Join Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Approve or reject access requests. Approving creates the auth account
            and shows a temp password to share with the user out-of-band.
          </p>
        </div>
        <JoinRequestsAdmin />
      </div>
    </div>
  )
}
