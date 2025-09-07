export async function downloadCsv(url: string, filename: string) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`CSV export failed: ${res.status} ${res.statusText}`)
  const blob = await res.blob()
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}

