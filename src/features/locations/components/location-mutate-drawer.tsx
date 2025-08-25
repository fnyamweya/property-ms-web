import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Location } from './types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Location
}

// Form schema describing expected fields when creating or updating a location.
const formSchema = z.object({
  localAreaName: z.string().min(2, 'Area name is required'),
  county: z.string().min(2, 'County is required'),
  town: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  coverageDetails: z.string().optional().nullable(),
})
type LocationForm = z.infer<typeof formSchema>

/**
 * Drawer component used for both creating and updating locations. The
 * form uses react-hook-form together with zod for validation. On
 * submission, the data is currently logged to a toast; integrate with
 * your API or store here to persist the location.
 */
export function LocationMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const form = useForm<LocationForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          localAreaName: currentRow.localAreaName,
          county: currentRow.county,
          town: currentRow.town ?? undefined,
          street: currentRow.street ?? undefined,
          coverageDetails: currentRow.coverageDetails ?? undefined,
        }
      : {
          localAreaName: '',
          county: '',
          town: undefined,
          street: undefined,
          coverageDetails: undefined,
        },
  })

  const onSubmit = (data: LocationForm) => {
    // TODO: wire up create/update calls here. At the moment we just
    // display the submitted values in a toast.
    onOpenChange(false)
    form.reset()
    showSubmittedData(data, isUpdate ? 'Updated location:' : 'New location:')
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        // Reset the form each time the drawer closes to avoid stale data
        if (!v) {
          form.reset()
        }
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Location</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the location by providing the new details.'
              : 'Add a new location by providing the required details.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='location-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 px-4'
          >
            <FormField
              control={form.control}
              name='localAreaName'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Area Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. Westlands' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='county'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>County</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. Nairobi' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='town'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Town</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. Nairobi' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='street'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. Parklands Rd' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='coverageDetails'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Coverage Details</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Describe the coverage area…'
                      className='min-h-20'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Cancel</Button>
          </SheetClose>
          <Button type='submit' form='location-form'>
            {isUpdate ? 'Save changes' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}