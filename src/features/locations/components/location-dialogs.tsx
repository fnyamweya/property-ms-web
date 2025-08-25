import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLocations } from '../context/locations-context'
import { LocationMutateDrawer } from './location-mutate-drawer'

/**
 * Container for all dialogs and drawers associated with the locations
 * feature. Renders drawers for creating and updating and a confirm
 * dialog for deletion. The dialog type is controlled via
 * `useLocations`. When a delete action is confirmed, the selected
 * location is passed to `showSubmittedData` for demonstration; in a
 * real app this would trigger an API call followed by a refresh.
 */
export function LocationDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useLocations()
  return (
    <>
      {/* Create drawer */}
      <LocationMutateDrawer
        key='location-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {/* Update drawer */}
      {currentRow && (
        <LocationMutateDrawer
          key={`location-update-${currentRow.id}`}
          currentRow={currentRow}
          open={open === 'update'}
          onOpenChange={() => {
            setOpen('update')
            // Clear currentRow after closing the drawer to prevent stale data
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
        />
      )}

      {/* Delete confirmation */}
      {currentRow && (
        <ConfirmDialog
          key='location-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          handleConfirm={() => {
            // In a real scenario you would call your delete API here.
            // For now we simply show the submitted location in the toast.
            setOpen(null)
            const toDelete = currentRow
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
            showSubmittedData(toDelete, 'The following location has been deleted:')
          }}
          className='max-w-md'
          title={`Delete this location: ${currentRow.localAreaName}?`}
          desc={
            <>
              You are about to delete the location <strong>{currentRow.localAreaName}</strong>.
              <br /> This action cannot be undone.
            </>
          }
          confirmText='Delete'
        />
      )}
    </>
  )
}