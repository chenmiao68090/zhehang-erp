export function downloadBlob(data: BlobPart, filename: string, type = 'text/csv;charset=utf-8;') {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
