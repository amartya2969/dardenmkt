'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { teamSchema, type TeamFormValues } from '@/lib/validations'
import { TEAM_TYPES, SKILLS_OPTIONS } from '@/lib/constants'
import { Loader2, X } from 'lucide-react'
import type { Team } from '@/types'

interface TeamFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<Team>
  onSubmit: (values: TeamFormValues) => Promise<void>
}

export function TeamForm({ mode, defaultValues, onSubmit }: TeamFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      type: (defaultValues?.type as TeamFormValues['type']) ?? undefined,
      skills_needed: defaultValues?.skills_needed ?? [],
      spots_available: defaultValues?.spots_available ?? 1,
      deadline: defaultValues?.deadline ? defaultValues.deadline.split('T')[0] : '',
      contact_email: defaultValues?.contact_email ?? '',
    },
  })

  const selectedSkills = watch('skills_needed') ?? []

  function toggleSkill(skill: string) {
    if (selectedSkills.includes(skill)) {
      setValue('skills_needed', selectedSkills.filter((s) => s !== skill))
    } else if (selectedSkills.length < 10) {
      setValue('skills_needed', [...selectedSkills, skill])
    }
  }

  const labelClass = "block text-sm font-semibold mb-1.5"
  const inputClass = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white outline-none focus:border-[#232D4B] focus:ring-1 focus:ring-[#232D4B] transition-all"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

      {/* Title */}
      <div>
        <label className={labelClass} style={{ color: '#232D4B' }}>Team / Opportunity Title *</label>
        <input
          className={inputClass}
          placeholder="e.g. Looking for Finance & Strategy co-founder for fintech startup"
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
      </div>

      {/* Type */}
      <div>
        <label className={labelClass} style={{ color: '#232D4B' }}>Opportunity Type *</label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEAM_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => field.onChange(t.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    field.value === t.value
                      ? 'border-2'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                  }`}
                  style={field.value === t.value ? {
                    borderColor: t.color,
                    backgroundColor: t.bg,
                    color: t.color,
                  } : {}}
                >
                  <span>{t.emoji}</span>
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          )}
        />
        {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass} style={{ color: '#232D4B' }}>Description *</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={5}
          placeholder="Describe the opportunity, your background, what you're building or working on, and what kind of teammates you're looking for..."
          {...register('description')}
        />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
      </div>

      {/* Skills needed */}
      <div>
        <label className={labelClass} style={{ color: '#232D4B' }}>
          Skills / Backgrounds Needed
          <span className="font-normal text-gray-400 ml-1">(select up to 10)</span>
        </label>

        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium text-white"
                style={{ backgroundColor: '#232D4B' }}
              >
                {skill}
                <button type="button" onClick={() => toggleSkill(skill)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {SKILLS_OPTIONS.filter((s) => !selectedSkills.includes(s)).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-[#232D4B] hover:text-[#232D4B] transition-colors bg-white"
            >
              + {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Spots + Deadline */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ color: '#232D4B' }}>Spots Available *</label>
          <input
            type="number"
            min={1}
            max={20}
            className={inputClass}
            {...register('spots_available')}
          />
          {errors.spots_available && <p className="text-xs text-red-600 mt-1">{errors.spots_available.message}</p>}
        </div>
        <div>
          <label className={labelClass} style={{ color: '#232D4B' }}>
            Application Deadline
            <span className="font-normal text-gray-400 ml-1">(optional)</span>
          </label>
          <input
            type="date"
            className={inputClass}
            {...register('deadline')}
          />
        </div>
      </div>

      {/* Contact email */}
      <div>
        <label className={labelClass} style={{ color: '#232D4B' }}>Contact Email *</label>
        <input
          type="email"
          placeholder="abc1@virginia.edu"
          className={inputClass}
          {...register('contact_email')}
        />
        {errors.contact_email && <p className="text-xs text-red-600 mt-1">{errors.contact_email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#232D4B' }}
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> {mode === 'create' ? 'Posting…' : 'Saving…'}</>
        ) : (
          mode === 'create' ? 'Post Team Opportunity' : 'Save Changes'
        )}
      </button>
    </form>
  )
}
