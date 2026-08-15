import { get, post, put, del } from './request'
import service from './request'

// File Folder API
export const fileFolderApi = {
  tree: () => get('/file/folder/tree'),
  create: (data: { name: string; parentId?: number }) => post('/file/folder', data),
  rename: (data: { id: number; name: string }) => put('/file/folder', data),
  remove: (id: number) => del(`/file/folder/${id}`),
  move: (id: number, targetParentId: number) => put('/file/folder/move', null, { params: { id, targetParentId } })
}

// File Info API
export const fileInfoApi = {
  list: (params: { pageNum?: number; pageSize?: number; folderId?: number; keyword?: string }) =>
    get('/file/info/list', params),
  upload: (file: File, folderId?: number, options?: { silentError?: boolean }) => {
    const formData = new FormData()
    formData.append('file', file)
    if (folderId) {
      formData.append('folderId', String(folderId))
    }
    return service.post('/file/info/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      silentError: !!options?.silentError
    } as any)
  },
  download: (id: number) => get(`/file/info/download/${id}`, null, { responseType: 'blob' }),
  preview: (id: number) => get(`/file/info/preview/${id}`),
  remove: (id: number) => del(`/file/info/${id}`),
  move: (id: number, targetFolderId: number) => put('/file/info/move', null, { params: { id, targetFolderId } }),
  rename: (id: number, newName: string) => put(`/file/info/rename/${id}`, null, { params: { newName } }),
  versions: (id: number) => get(`/file/info/versions/${id}`),
  uploadVersion: (id: number, file: File, changeLog?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (changeLog) {
      formData.append('changeLog', changeLog)
    }
    return service.post(`/file/info/upload-version/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  recycle: (params: { pageNum?: number; pageSize?: number }) => get('/file/info/recycle', params),
  restore: (id: number) => put(`/file/info/restore/${id}`),
  permanentDelete: (id: number) => del(`/file/info/permanent/${id}`),
  search: (params: { pageNum?: number; pageSize?: number; keyword?: string }) => get('/file/info/search', params)
}

// Knowledge Base Category API
export const kbCategoryApi = {
  tree: () => get('/kb/category/tree'),
  create: (data: { name: string; parentId?: number; icon?: string; sort?: number }) => post('/kb/category', data),
  update: (data: { id: number; name: string; icon?: string; sort?: number }) => put('/kb/category', data),
  remove: (id: number) => del(`/kb/category/${id}`)
}

// Knowledge Base Article API
export const kbArticleApi = {
  list: (params: { pageNum?: number; pageSize?: number; categoryId?: number; keyword?: string }) =>
    get('/kb/article/list', params),
  detail: (id: number) => get(`/kb/article/${id}`),
  create: (data: any) => post('/kb/article', data),
  update: (data: any) => put('/kb/article', data),
  remove: (id: number) => del(`/kb/article/${id}`),
  publish: (id: number) => put(`/kb/article/publish/${id}`),
  archive: (id: number) => put(`/kb/article/archive/${id}`),
  recent: (params: { pageNum?: number; pageSize?: number }) => get('/kb/article/recent', params),
  hot: (params: { pageNum?: number; pageSize?: number }) => get('/kb/article/hot', params),
  like: (id: number) => post(`/kb/article/like/${id}`)
}
