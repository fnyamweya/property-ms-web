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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Property } from '@/types/property'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Property
}

// Define a minimal schema for property creation/updating. Only includes
// the most critical fields; extend as needed. Units count is coerced
// to a number and must be zero or positive.
const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  propertyType: z.enum(['Residential', 'Commercial', 'MixedUse', 'Land']),
  unitsCount: z.coerce.number().min(0, 'Units must be zero or greater'),
  isActive: z.boolean(),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(1, 'City is required'),
})
type PropertyForm = z.infer<typeof formSchema>

export function PropertyMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const form = useForm<PropertyForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          name: currentRow.name,
          propertyType: currentRow.propertyType,
          unitsCount: currentRow.unitsCount,
          isActive: currentRow.isActive,
          country: currentRow.country,
          city: currentRow.city,
        }
      : {
          name: '',
          propertyType: 'Residential',
          unitsCount: 0,
          isActive: true,
          country: '',
          city: '',
        },
  })

  const onSubmit = (data: PropertyForm) => {
    onOpenChange(false)
    form.reset()
    showSubmittedData(data, isUpdate ? 'Updated property:' : 'New property:')
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset()
        }
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Property</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the property by providing new details.'
              : 'Add a new property by providing the required details.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='property-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 px-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. Savannah Residences' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='propertyType'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Residential'>Residential</SelectItem>
                      <SelectItem value='Commercial'>Commercial</SelectItem>
                      <SelectItem value='MixedUse'>Mixed Use</SelectItem>
                      <SelectItem value='Land'>Land</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='unitsCount'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Units</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      inputMode='numeric'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-md border p-3'>
                  <div>
                    <FormLabel>Active</FormLabel>
                    <p className='text-muted-foreground text-xs'>Toggle to hide/show in listings.</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. Kenya' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='e.g. Nairobi' />
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
          <Button type='submit' form='property-form'>
            {isUpdate ? 'Save changes' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}