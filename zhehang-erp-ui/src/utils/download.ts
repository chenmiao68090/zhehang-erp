import { ElMessage } from 'element-plus'
import { fileInfoApi } from '@/api/file'

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

/**
 * 统一的"按文件ID下载"助手。
 * 后端 /file/info/download/{id} 需要 Bearer token,裸链接/window.open 会 401。
 * 这里走 axios(自动带 token)拿到 Blob,再用 <a download> 触发保存。
 * @param id       文件ID
 * @param filename 建议的保存文件名(附件记录一般都有 fileName;缺省用 file_{id})
 */
export async function downloadFileById(id: number | string, filename?: string) {
  if (id === undefined || id === null || id === '') return
  try {
    const blob = await fileInfoApi.download(Number(id))
    downloadBlob(blob as Blob, filename || `file_${id}`)
  } catch (e: any) {
    ElMessage.error(e?.message || '文件下载失败')
  }
}

/**
 * 取某文件的临时 object URL,供 <img> 预览用。
 * 注意:调用方在不再使用时应 URL.revokeObjectURL(url) 释放,避免内存泄漏。
 * @returns object URL 字符串;失败返回空串。
 */
export async function objectUrlForFile(id: number | string): Promise<string> {
  if (id === undefined || id === null || id === '') return ''
  try {
    const blob = await fileInfoApi.download(Number(id))
    return URL.createObjectURL(blob as Blob)
  } catch {
    return ''
  }
}
