<template>
  <div class="article-page">
    <!-- View Mode -->
    <div v-if="mode === 'view'" class="article-view">
      <div class="article-view__header">
        <el-button @click="goBack" type="default">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('common.back') }}
        </el-button>
        <el-button type="primary" @click="switchToEdit">{{ $t('common.edit') }}</el-button>
      </div>
      <div class="article-view__content">
        <h1 class="article-view__title">{{ article.title }}</h1>
        <div class="article-view__meta">
          <span>{{ article.createTime }}</span>
          <span><el-icon><View /></el-icon> {{ article.viewCount || 0 }}</span>
          <span><el-icon><Star /></el-icon> {{ article.likeCount || 0 }}</span>
          <el-tag v-if="article.status === 0" type="info" size="small">{{ $t('kb.draft') }}</el-tag>
          <el-tag v-else-if="article.status === 1" type="success" size="small">{{ $t('kb.published') }}</el-tag>
          <el-tag v-else-if="article.status === 2" type="warning" size="small">{{ $t('kb.archived') }}</el-tag>
        </div>
        <div v-if="article.tags" class="article-view__tags">
          <el-tag v-for="tag in article.tags.split(',')" :key="tag" size="small">{{ tag }}</el-tag>
        </div>
        <div class="article-view__body markdown-body" v-html="sanitizeHtml(renderedContent)" @click="handleDownloadClick"></div>
        <div class="article-view__actions">
          <el-button @click="handleLike" :type="liked ? 'primary' : 'default'" round>
            <el-icon><Star /></el-icon>
            {{ $t('kb.like') }} ({{ article.likeCount || 0 }})
          </el-button>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else class="article-edit">
      <div class="article-edit__header">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('common.back') }}
        </el-button>
        <div class="header-actions">
          <el-button @click="handleSaveDraft" :loading="saving">{{ $t('kb.saveDraft') }}</el-button>
          <el-button type="primary" @click="handlePublish" :loading="saving">{{ $t('kb.publish') }}</el-button>
        </div>
      </div>
      <div class="article-edit__form">
        <el-input
          v-model="form.title"
          :placeholder="$t('kb.enterTitle')"
          class="title-input"
        />
        <div class="form-row">
          <el-tree-select
            v-model="form.categoryId"
            :data="categoryTree"
            :props="{ label: 'label', children: 'children', value: 'id' }"
            :placeholder="$t('kb.selectCategory')"
            clearable
            style="width: 200px"
          />
          <div class="tag-input-wrapper">
            <el-tag
              v-for="tag in tagList"
              :key="tag"
              closable
              @close="removeTag(tag)"
              style="margin-right: 4px"
            >{{ tag }}</el-tag>
            <el-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model="tagInputValue"
              size="small"
              style="width: 100px"
              @keyup.enter="confirmTag"
              @blur="confirmTag"
            />
            <el-button v-else size="small" @click="showTagInput">+ {{ $t('kb.addTag') }}</el-button>
          </div>
        </div>
        <!-- Editor -->
        <div class="editor-container">
          <div class="editor-tabs">
            <el-radio-group v-model="editorMode" size="small">
              <el-radio-button value="write">{{ $t('kb.write') }}</el-radio-button>
              <el-radio-button value="preview">{{ $t('kb.preview') }}</el-radio-button>
            </el-radio-group>
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              accept="image/*"
              :on-change="handleImageSelect"
              class="image-upload"
            >
              <el-button size="small" :loading="imageUploading">
                <el-icon><PictureFilled /></el-icon>
                插入图片
              </el-button>
            </el-upload>
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              accept=".doc,.docx,.ppt,.pptx,.xls,.xlsx,.pdf,.txt,.md,.csv,.zip,.rar,.7z,.png,.jpg,.jpeg,.gif,.bmp,.webp"
              :on-change="handleAttachSelect"
              class="attach-upload"
            >
              <el-button size="small" :loading="attachUploading">
                <el-icon><Paperclip /></el-icon>
                上传附件
              </el-button>
            </el-upload>
          </div>
          <div v-show="editorMode === 'write'" class="editor-write">
            <el-input
              ref="contentInputRef"
              v-model="form.content"
              type="textarea"
              :rows="20"
              :placeholder="$t('kb.enterContent')"
              resize="none"
              @paste="handleContentPaste"
            />
          </div>
          <div v-show="editorMode === 'preview'" class="editor-preview markdown-body" v-html="sanitizeHtml(previewContent)" @click="handleDownloadClick"></div>
          <div class="editor-hint">
            支持 Markdown + 图片粘贴/上传;可直接『上传附件』(Word/PPT/Excel/PDF/图片等),上传后自动在正文插入下载链接。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, View, Star, PictureFilled, Paperclip } from '@element-plus/icons-vue'
import { kbArticleApi, kbCategoryApi, fileInfoApi } from '@/api/file'
import { getApiBaseUrl } from '@/api/base-url'
import { downloadFileById } from '@/utils/download'
import { sanitizeHtml } from '@/utils/sanitize-html'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const mode = ref<'view' | 'edit'>('edit')
const article = ref<any>({})
const form = ref<any>({ title: '', content: '', categoryId: null, tags: '', contentType: 'markdown' })
const categoryTree = ref<any[]>([])
const saving = ref(false)
const liked = ref(false)

// Tags
const tagList = ref<string[]>([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref()

// Editor
const editorMode = ref<'write' | 'preview'>('write')
const contentInputRef = ref()
const imageUploading = ref(false)
const attachUploading = ref(false)

// 图片读成 base64 dataURL 内嵌到 markdown(content 为 LONGTEXT 放得下),
// 避免走 /file/info/download 需鉴权导致 <img> 加载失败(浏览器GET不带token)。
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read fail'))
    reader.readAsDataURL(file)
  })
}

// Insert a markdown snippet at the textarea cursor position (fallback: append at end).
function insertMarkdownAtCursor(snippet: string) {
  const textarea: HTMLTextAreaElement | undefined = contentInputRef.value?.textarea
  const current = form.value.content || ''
  if (textarea && typeof textarea.selectionStart === 'number') {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    form.value.content = current.slice(0, start) + snippet + current.slice(end)
    nextTick(() => {
      const pos = start + snippet.length
      textarea.focus()
      textarea.setSelectionRange(pos, pos)
    })
  } else {
    form.value.content = current + (current ? '\n' : '') + snippet
  }
}

// Insert markdown image syntax at the textarea cursor position.
function insertImageMarkdown(url: string, alt: string) {
  insertMarkdownAtCursor(`![${alt}](${url})`)
}

// "插入图片" button: select an image -> upload -> insert markdown at cursor.
async function handleImageSelect(uploadFile: any) {
  const file: File = uploadFile?.raw
  if (!file) return
  if (!file.type?.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  imageUploading.value = true
  try {
    const url = await readAsDataUrl(file)
    insertImageMarkdown(url, '图片')
    ElMessage.success('图片已插入')
  } catch (e) {
    ElMessage.error('图片读取失败')
  } finally {
    imageUploading.value = false
  }
}

// "上传附件" button: upload a Word/PPT/Excel/PDF/image etc. via fileInfoApi,
// then insert a markdown download link (to /file/info/download/{id}) at the cursor.
async function handleAttachSelect(uploadFile: any) {
  const file: File = uploadFile?.raw
  if (!file) return
  // 20MB 上限,避免超大文件卡住上传;后端黑名单会另行拦截危险类型。
  const maxSize = 20 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.warning('附件不能超过 20MB')
    return
  }
  attachUploading.value = true
  try {
    const res: any = await fileInfoApi.upload(file)
    const info = res?.data || res
    const fileId = info?.id
    const fileName = info?.name || info?.originalName || file.name
    if (!fileId) {
      ElMessage.error('附件上传失败')
      return
    }
    const url = `${getApiBaseUrl()}/file/info/download/${fileId}`
    insertMarkdownAtCursor(`[📎 ${fileName}](${url})`)
    ElMessage.success('附件已上传并插入链接')
  } catch (e: any) {
    ElMessage.error(e?.message || '附件上传失败')
  } finally {
    attachUploading.value = false
  }
}

// Paste handler: when clipboard contains an image, upload it and insert markdown.
async function handleContentPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  let imageFile: File | null = null
  for (let i = 0; i < items.length; i++) {
    if (items[i].type && items[i].type.indexOf('image') !== -1) {
      imageFile = items[i].getAsFile()
      break
    }
  }
  if (!imageFile) return
  e.preventDefault()
  imageUploading.value = true
  try {
    const url = await readAsDataUrl(imageFile)
    form.value.content = (form.value.content || '') + (form.value.content ? '\n' : '') + `![粘贴图片](${url})`
    ElMessage.success('图片已插入')
  } catch (err) {
    ElMessage.error('图片读取失败')
  } finally {
    imageUploading.value = false
  }
}

onMounted(async () => {
  await loadCategoryTree()
  const id = route.query.id as string
  const isEdit = route.query.edit === 'true'
  if (id) {
    await loadArticle(Number(id))
    mode.value = isEdit ? 'edit' : 'view'
  } else {
    mode.value = 'edit'
  }
})

async function loadCategoryTree() {
  try {
    const res: any = await kbCategoryApi.tree()
    categoryTree.value = res.data || []
  } catch (e) { /* ignore */ }
}

async function loadArticle(id: number) {
  try {
    const res: any = await kbArticleApi.detail(id)
    article.value = res.data || {}
    form.value = {
      id: article.value.id,
      title: article.value.title || '',
      content: article.value.content || '',
      categoryId: article.value.categoryId,
      tags: article.value.tags || '',
      contentType: article.value.contentType || 'markdown',
      status: article.value.status
    }
    tagList.value = article.value.tags ? article.value.tags.split(',').filter(Boolean) : []
  } catch (e) { /* ignore */ }
}

const renderedContent = computed(() => {
  return renderMarkdown(article.value.content || '')
})

const previewContent = computed(() => {
  return renderMarkdown(form.value.content || '')
})

function renderMarkdown(text: string): string {
  // Simple markdown rendering
  let html = text
    .replace(/!\[(.*?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="md-img" />')
    // 普通链接 [文字](链接) -> <a>;附件下载链接靠容器上的 handleDownloadClick 拦截带 token 下载。
    .replace(/\[(.*?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
  return sanitizeHtml('<p>' + html + '</p>')
}

// 事件委托:拦截正文/预览里附件下载链接的点击。
// 裸链 GET 不带 token 会 401,改走 downloadFileById(带 Bearer token 取 blob 再保存),
// 同时覆盖历史文章里已持久化的旧链接。
function handleDownloadClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  const link = target?.closest?.('a[href*="/file/info/download/"]') as HTMLAnchorElement | null
  if (!link) return
  e.preventDefault()
  const href = link.getAttribute('href') || ''
  const m = href.match(/\/file\/info\/download\/(\d+)/)
  if (!m) return
  // 用链接文本作文件名,去掉前缀的 📎 图标和空白;为空则让助手回退到 file_{id}。
  const filename = (link.textContent || '').replace(/^\s*📎\s*/, '').trim() || undefined
  downloadFileById(m[1], filename)
}

function goBack() {
  router.push('/file/kb')
}

function switchToEdit() {
  form.value = {
    id: article.value.id,
    title: article.value.title || '',
    content: article.value.content || '',
    categoryId: article.value.categoryId,
    tags: article.value.tags || '',
    contentType: article.value.contentType || 'markdown',
    status: article.value.status
  }
  tagList.value = article.value.tags ? article.value.tags.split(',').filter(Boolean) : []
  mode.value = 'edit'
}

async function handleSaveDraft() {
  if (!form.value.title) {
    ElMessage.warning(t('kb.titleRequired'))
    return
  }
  saving.value = true
  try {
    form.value.tags = tagList.value.join(',')
    form.value.status = 0
    if (form.value.id) {
      await kbArticleApi.update(form.value)
    } else {
      await kbArticleApi.create(form.value)
    }
    ElMessage.success(t('common.success'))
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  if (!form.value.title) {
    ElMessage.warning(t('kb.titleRequired'))
    return
  }
  saving.value = true
  try {
    form.value.tags = tagList.value.join(',')
    form.value.status = 1
    if (form.value.id) {
      await kbArticleApi.update(form.value)
      await kbArticleApi.publish(form.value.id)
    } else {
      const res: any = await kbArticleApi.create(form.value)
      // If the API returns the created ID, publish it
    }
    ElMessage.success(t('common.success'))
    router.push('/file/kb')
  } finally {
    saving.value = false
  }
}

async function handleLike() {
  if (article.value.id) {
    await kbArticleApi.like(article.value.id)
    article.value.likeCount = (article.value.likeCount || 0) + 1
    liked.value = true
  }
}

// Tag management
function removeTag(tag: string) {
  tagList.value = tagList.value.filter(t => t !== tag)
}

function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

function confirmTag() {
  if (tagInputValue.value && !tagList.value.includes(tagInputValue.value)) {
    tagList.value.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}
</script>

<style scoped>
.article-page {
  height: calc(100vh - 120px);
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow-y: auto;
}

.article-view,
.article-edit {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.article-view__header,
.article-edit__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.article-view__title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.article-view__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.article-view__meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-view__tags {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
}

.article-view__body {
  line-height: 1.8;
  font-size: 15px;
  min-height: 300px;
  padding: 20px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.article-view__actions {
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: center;
}

.article-edit__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-input :deep(.el-input__inner) {
  font-size: 22px;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid var(--el-border-color);
  border-radius: 0;
  padding: 12px 0;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tag-input-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.editor-container {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.image-upload :deep(.el-upload),
.attach-upload :deep(.el-upload) {
  display: inline-flex;
}

.editor-hint {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);
}

.editor-write :deep(.el-textarea__inner) {
  border: none;
  border-radius: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  min-height: 400px;
}

.editor-preview {
  padding: 16px;
  min-height: 400px;
  line-height: 1.8;
  font-size: 15px;
}

.markdown-body h1 { font-size: 24px; margin: 16px 0 8px; }
.markdown-body h2 { font-size: 20px; margin: 14px 0 6px; }
.markdown-body h3 { font-size: 17px; margin: 12px 0 6px; }
.markdown-body code { background: var(--el-fill-color); padding: 2px 6px; border-radius: 3px; font-size: 13px; }
.markdown-body li { margin: 4px 0; }
.markdown-body .md-img { max-width: 100%; height: auto; border-radius: 6px; margin: 8px 0; display: block; }
</style>
