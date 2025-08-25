'use client'

import { useCallback, useState } from 'react'
import { Input } from '@/components/ui/input'

type Props = {
  onFiles: (files: File[]) => void
  maxFiles?: number
}

export function ImageDropzone({ onFiles, maxFiles = 8 }: Props) {
  const [previews, setPreviews] = useState<string[]>([])

  const handle = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      const arr = Array.from(files).slice(0, maxFiles)
      setPreviews(arr.map((f) => URL.createObjectURL(f)))
      onFiles(arr)
    },
    [onFiles, maxFiles]
  )

  return (
    <div className='rounded-lg border p-4'>
      <h3 className='mb-2 text-sm font-medium'>Photos</h3>
      <Input
        type='file'
        accept='image/*'
        multiple
        onChange={(e) => handle(e.target.files)}
      />
      {previews.length > 0 && (
        <div className='mt-3 grid grid-cols-3 gap-2 md:grid-cols-4'>
          {previews.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=''
              className='aspect-square w-full rounded-md object-cover'
            />
          ))}
        </div>
      )}
      <p className='text-muted-foreground mt-2 text-xs'>
        JPG/PNG, up to {maxFiles} images.
      </p>
    </div>
  )
}
