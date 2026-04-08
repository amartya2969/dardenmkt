import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamForm } from '@/components/teams/TeamForm'
import type { TeamFormValues } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'Post a Team Opportunity' }

export default async function NewTeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  async function createTeam(values: TeamFormValues) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase.from('teams').insert({
      user_id: user.id,
      title: values.title,
      description: values.description,
      type: values.type,
      skills_needed: values.skills_needed ?? [],
      spots_available: values.spots_available,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      contact_email: values.contact_email,
    }).select('id').single()

    if (error) throw new Error(error.message)
    revalidatePath('/teams')
    redirect(`/teams/${data.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Post a Team Opportunity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find co-founders, teammates, or study partners from across UVA and Darden.
        </p>
      </div>
      <TeamForm mode="create" onSubmit={createTeam} />
    </div>
  )
}
