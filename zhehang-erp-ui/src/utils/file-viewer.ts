import { ElMessage } from 'element-plus'
import { fileInfoApi } from '@/api/file'

export type AttachmentRef = {
  id?: string | number
  fileId?: string | number
  fileName?: string
  name?: string
  originalName?: string
}

export type AttachmentPreview = {
  url: string
  type: 'image' | 'pdf' | 'other'
  title: string
  mimeType: string
  file: AttachmentRef
}

const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif', 'tif', 'tiff']

export const attachmentName = (file?: AttachmentRef) =>
  file?.fileName || file?.originalName || file?.name || '附件'

export const attachmentId = (file?: AttachmentRef) => {
  const raw = file?.fileId ?? file?.id
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : undefined
}

const extOf = (name: string) => {
  const clean = name.split('?')[0].split('#')[0]
  const dot = clean.lastIndexOf('.')
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : ''
}

const typeOf = (name: string, mimeType = ''): AttachmentPreview['type'] => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  const ext = extOf(name)
  if (imageExts.includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  return 'other'
}

const sniffBlob = async (blob: Blob): Promise<{ type: AttachmentPreview['type']; mimeType?: string }> => {
  const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer())
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: 'image', mimeType: 'image/jpeg' }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { type: 'image', mimeType: 'image/png' }
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return { type: 'pdf', mimeType: 'application/pdf' }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return { type: 'image', mimeType: 'image/gif' }
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { type: 'image', mimeType: 'image/webp' }
  }
  return { type: 'other' }
}

export const createAttachmentPreview = async (file: AttachmentRef): Promise<AttachmentPreview | null> => {
  const id = attachmentId(file)
  if (!id) {
    ElMessage.warning('这个附件缺少文件编号，暂时不能预览')
    return null
  }
  const blob = await fileInfoApi.download(id) as Blob
  const title = attachmentName(file)
  const sniffed = await sniffBlob(blob)
  const mimeType = blob.type && blob.type !== 'application/octet-stream' ? blob.type : (sniffed.mimeType || '')
  const previewType = sniffed.type !== 'other' ? sniffed.type : typeOf(title, mimeType)
  const previewBlob = mimeType && mimeType !== blob.type ? new Blob([blob], { type: mimeType }) : blob
  return {
    url: URL.createObjectURL(previewBlob),
    type: previewType,
    title,
    mimeType,
    file
  }
}

export const downloadAttachment = async (file: AttachmentRef) => {
  const id = attachmentId(file)
  if (!id) {
    ElMessage.warning('这个附件缺少文件编号，暂时不能下载')
    return
  }
  const blob = await fileInfoApi.download(id) as Blob
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = attachmentName(file)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 300)
}
