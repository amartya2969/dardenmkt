import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm'

export const metadata: Metadata = { title: 'Edit Profile — UVMkt' }

const SCHOOLS = [
  'Darden School of Business',
  'College of Arts & Sciences',
  'School of Engineering',
  'School of Law',
  'School of Medicine',
  'Batten School',
  'School of Education',
  'School of Architecture',
  'McIntire School of Commerce',
  'School of Nursing',
  'School of Data Science',
  'Other',
]

const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduate',
  'PhD',
  'Faculty / Staff',
  'Alumni',
  'Other',
]

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-1 focus:ring-[#232D4B] transition-all'

export default async function ProfilePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, school, year, phone, bio')
    .eq('id', user.id)
    .single()

  const params = await searchParams
  const saved = params.saved === '1'

  async function updateProfile(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const full_name = ((formData.get('full_name') as string) ?? '').trim()
    const school = ((formData.get('school') as string) ?? '').trim() || null
    const year = ((formData.get('year') as string) ?? '').trim() || null
    const phone = ((formData.get('phone') as string) ?? '').trim() || null
    const bio = ((formData.get('bio') as string) ?? '').trim() || null

    await supabase
      .from('profiles')
      .update({ full_name, school, year, phone, bio })
      .eq('id', user.id)

    redirect('/profile?saved=1')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">

      {/* Profile details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Edit Profile</h1>
          <p className="text-sm text-gray-400 mt-1">This info appears on your listings and team posts</p>
        </div>

        {saved && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium">
            Profile saved successfully!
          </div>
        )}

        <form action={updateProfile} className="space-y-5">
          {/* Email — read only */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>UVA Email</label>
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
              Display Name *
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
              className={inputCls}
            />
          </div>

          {/* School + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="school" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>School</label>
              <select id="school" name="school" defaultValue={profile?.school ?? ''} className={inputCls}>
                <option value="">—</option>
                {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="year" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Year</label>
              <select id="year" name="year" defaultValue={profile?.year ?? ''} className={inputCls}>
                <option value="">—</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
              Phone <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ''}
              placeholder="(434) 555-0123"
              maxLength={32}
              className={inputCls}
            />
            <p className="text-xs text-gray-400">Only shared with people you message — not public on listings</p>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label htmlFor="bio" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
              About me <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio ?? ''}
              placeholder="A short blurb — interests, what you're looking for, etc."
              rows={3}
              maxLength={300}
              className={`${inputCls} resize-none`}
            />
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

      {/* Password change */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Change Password</h2>
          <p className="text-sm text-gray-400 mt-1">Update your account password</p>
        </div>
        <PasswordChangeForm />
      </div>
    </div>
  )
}
