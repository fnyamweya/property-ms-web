import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useProperties } from '../context/properties-context'
import { PropertyMutateDrawer } from './property-mutate-drawer'

/**
 * Container for all dialogs and drawers associated with the properties
 * feature. Renders drawers for creating and updating as well as a
 * confirmation dialog for deletion. Dialog visibility and the
 * currently selected property are controlled via the `useProperties`
 * context. When a delete action is confirmed the selected property
 * is passed to `showSubmittedData` for demonstration purposes;
 * replace this with your API call in a real application.
 */
export function PropertyDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProperties()
  return (
    <>
      {/* Create drawer */}
      <PropertyMutateDrawer
        key='property-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {/* Update drawer */}
      {currentRow && (
        <PropertyMutateDrawer
          key={`property-update-${currentRow.id}`}
          open={open === 'update'}
          currentRow={currentRow}
          onOpenChange={() => {
            setOpen('update')
            // clear the selection after closing the drawer
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
        />
      )}

      {/* Delete confirmation */}
      {currentRow && (
        <ConfirmDialog
          key='property-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          handleConfirm={() => {
            // In a real app you would call your delete API here. For
            // demonstration we show the submitted property details in
            // a toast. After deletion we close and reset state.
            setOpen(null)
            const toDelete = currentRow
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
            showSubmittedData(
              toDelete,
              'The following property has been deleted:',
            )
          }}
          className='max-w-md'
          title={`Delete this property: ${currentRow.name}?`}
          desc={
            <>
              You are about to delete the property{' '}
              <strong>{currentRow.name}</strong>. <br /> This action
              cannot be undone.
            </>
          }
          confirmText='Delete'
        />
      )}
    </>
  )
}