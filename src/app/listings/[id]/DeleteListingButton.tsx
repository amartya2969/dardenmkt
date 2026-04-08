'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteListingButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('listings')
      .update({ status: 'removed' })
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete listing')
      setLoading(false)
      return
    }
    toast.success('Listing removed')
    router.push('/my-listings')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove listing?</DialogTitle>
          <DialogDescription>
            This will remove the listing from the marketplace. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove Listing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
