import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Profile — DardenMkt' }

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const params = await searchParams
  const saved = params.saved === '1'

  async function updateProfile(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const full_name = (formData.get('full_name') as string).trim()
    await supabase.from('profiles').update({ full_name }).eq('id', user.id)
    redirect('/profile?saved=1')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Edit Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Update your display name shown on listings</p>
        </div>

        {saved && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
            Profile saved successfully!
          </div>
        )}

        <form action={updateProfile} className="space-y-5">
          {/* Email — read only */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
              UVA Email
            </label>
            <input
              type="email"
              value={profile?.email ?? user.email ?? ''}
              disabled
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <label htmlFor="full_name" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
              Display Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ''}
              placeholder="e.g. Alex Carter"
              required
              minLength={2}
              maxLength={60}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-1 focus:ring-[#232D4B] transition-all"
            />
            <p className="text-xs text-gray-400">This name appears on your listings and team posts</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: '#232D4B' }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
