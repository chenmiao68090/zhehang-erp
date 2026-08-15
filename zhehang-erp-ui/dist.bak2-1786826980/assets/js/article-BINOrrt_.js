import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, gt as nextTick, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $n as star_default, Ct as arrow_left_default, Er as withKeys, Mn as picture_filled_default, Q as ElRadioGroup, Tr as vShow, Z as ElRadioButton, gr as view_default, it as ElTag, kn as paperclip_default, l as ElUpload, mt as ElInput, o as ElMessage, ot as ElButton, u as ElTreeSelect, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { c as getApiBaseUrl } from "./request-CZ5tKmxn.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { i as kbCategoryApi, n as fileInfoApi, r as kbArticleApi } from "./file-BNSD7Sq1.js";
import { n as downloadFileById } from "./download-DmWzpvAG.js";
import { t as sanitizeHtml } from "./sanitize-html-BVsHt3EZ.js";
//#region src/views/file/article.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "article-page" };
var _hoisted_2 = {
	key: 0,
	class: "article-view"
};
var _hoisted_3 = { class: "article-view__header" };
var _hoisted_4 = { class: "article-view__content" };
var _hoisted_5 = { class: "article-view__title" };
var _hoisted_6 = { class: "article-view__meta" };
var _hoisted_7 = {
	key: 0,
	class: "article-view__tags"
};
var _hoisted_8 = ["innerHTML"];
var _hoisted_9 = { class: "article-view__actions" };
var _hoisted_10 = {
	key: 1,
	class: "article-edit"
};
var _hoisted_11 = { class: "article-edit__header" };
var _hoisted_12 = { class: "header-actions" };
var _hoisted_13 = { class: "article-edit__form" };
var _hoisted_14 = { class: "form-row" };
var _hoisted_15 = { class: "tag-input-wrapper" };
var _hoisted_16 = { class: "editor-container" };
var _hoisted_17 = { class: "editor-tabs" };
var _hoisted_18 = { class: "editor-write" };
var _hoisted_19 = ["innerHTML"];
//#endregion
//#region src/views/file/article.vue
var article_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "article",
	setup(__props) {
		const { t } = useI18n();
		const route = useRoute();
		const router = useRouter();
		const mode = ref("edit");
		const article = ref({});
		const form = ref({
			title: "",
			content: "",
			categoryId: null,
			tags: "",
			contentType: "markdown"
		});
		const categoryTree = ref([]);
		const saving = ref(false);
		const liked = ref(false);
		const tagList = ref([]);
		const tagInputVisible = ref(false);
		const tagInputValue = ref("");
		const tagInputRef = ref();
		const editorMode = ref("write");
		const contentInputRef = ref();
		const imageUploading = ref(false);
		const attachUploading = ref(false);
		function readAsDataUrl(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result);
				reader.onerror = () => reject(/* @__PURE__ */ new Error("read fail"));
				reader.readAsDataURL(file);
			});
		}
		function insertMarkdownAtCursor(snippet) {
			var _contentInputRef$valu;
			const textarea = (_contentInputRef$valu = contentInputRef.value) === null || _contentInputRef$valu === void 0 ? void 0 : _contentInputRef$valu.textarea;
			const current = form.value.content || "";
			if (textarea && typeof textarea.selectionStart === "number") {
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;
				form.value.content = current.slice(0, start) + snippet + current.slice(end);
				nextTick(() => {
					const pos = start + snippet.length;
					textarea.focus();
					textarea.setSelectionRange(pos, pos);
				});
			} else form.value.content = current + (current ? "\n" : "") + snippet;
		}
		function insertImageMarkdown(url, alt) {
			insertMarkdownAtCursor(`![${alt}](${url})`);
		}
		function handleImageSelect(_x) {
			return _handleImageSelect.apply(this, arguments);
		}
		function _handleImageSelect() {
			_handleImageSelect = _asyncToGenerator(function* (uploadFile) {
				var _file$type;
				const file = uploadFile === null || uploadFile === void 0 ? void 0 : uploadFile.raw;
				if (!file) return;
				if (!((_file$type = file.type) === null || _file$type === void 0 ? void 0 : _file$type.startsWith("image/"))) {
					ElMessage.warning("请选择图片文件");
					return;
				}
				imageUploading.value = true;
				try {
					insertImageMarkdown(yield readAsDataUrl(file), "图片");
					ElMessage.success("图片已插入");
				} catch (e) {
					ElMessage.error("图片读取失败");
				} finally {
					imageUploading.value = false;
				}
			});
			return _handleImageSelect.apply(this, arguments);
		}
		function handleAttachSelect(_x2) {
			return _handleAttachSelect.apply(this, arguments);
		}
		function _handleAttachSelect() {
			_handleAttachSelect = _asyncToGenerator(function* (uploadFile) {
				const file = uploadFile === null || uploadFile === void 0 ? void 0 : uploadFile.raw;
				if (!file) return;
				if (file.size > 20 * 1024 * 1024) {
					ElMessage.warning("附件不能超过 20MB");
					return;
				}
				attachUploading.value = true;
				try {
					const res = yield fileInfoApi.upload(file);
					const info = (res === null || res === void 0 ? void 0 : res.data) || res;
					const fileId = info === null || info === void 0 ? void 0 : info.id;
					const fileName = (info === null || info === void 0 ? void 0 : info.name) || (info === null || info === void 0 ? void 0 : info.originalName) || file.name;
					if (!fileId) {
						ElMessage.error("附件上传失败");
						return;
					}
					insertMarkdownAtCursor(`[📎 ${fileName}](${`${getApiBaseUrl()}/file/info/download/${fileId}`})`);
					ElMessage.success("附件已上传并插入链接");
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "附件上传失败");
				} finally {
					attachUploading.value = false;
				}
			});
			return _handleAttachSelect.apply(this, arguments);
		}
		function handleContentPaste(_x3) {
			return _handleContentPaste.apply(this, arguments);
		}
		function _handleContentPaste() {
			_handleContentPaste = _asyncToGenerator(function* (e) {
				var _e$clipboardData;
				const items = (_e$clipboardData = e.clipboardData) === null || _e$clipboardData === void 0 ? void 0 : _e$clipboardData.items;
				if (!items) return;
				let imageFile = null;
				for (let i = 0; i < items.length; i++) if (items[i].type && items[i].type.indexOf("image") !== -1) {
					imageFile = items[i].getAsFile();
					break;
				}
				if (!imageFile) return;
				e.preventDefault();
				imageUploading.value = true;
				try {
					const url = yield readAsDataUrl(imageFile);
					form.value.content = (form.value.content || "") + (form.value.content ? "\n" : "") + `![粘贴图片](${url})`;
					ElMessage.success("图片已插入");
				} catch (err) {
					ElMessage.error("图片读取失败");
				} finally {
					imageUploading.value = false;
				}
			});
			return _handleContentPaste.apply(this, arguments);
		}
		onMounted(_asyncToGenerator(function* () {
			yield loadCategoryTree();
			const id = route.query.id;
			const isEdit = route.query.edit === "true";
			if (id) {
				yield loadArticle(Number(id));
				mode.value = isEdit ? "edit" : "view";
			} else mode.value = "edit";
		}));
		function loadCategoryTree() {
			return _loadCategoryTree.apply(this, arguments);
		}
		function _loadCategoryTree() {
			_loadCategoryTree = _asyncToGenerator(function* () {
				try {
					categoryTree.value = (yield kbCategoryApi.tree()).data || [];
				} catch (e) {}
			});
			return _loadCategoryTree.apply(this, arguments);
		}
		function loadArticle(_x4) {
			return _loadArticle.apply(this, arguments);
		}
		function _loadArticle() {
			_loadArticle = _asyncToGenerator(function* (id) {
				try {
					article.value = (yield kbArticleApi.detail(id)).data || {};
					form.value = {
						id: article.value.id,
						title: article.value.title || "",
						content: article.value.content || "",
						categoryId: article.value.categoryId,
						tags: article.value.tags || "",
						contentType: article.value.contentType || "markdown",
						status: article.value.status
					};
					tagList.value = article.value.tags ? article.value.tags.split(",").filter(Boolean) : [];
				} catch (e) {}
			});
			return _loadArticle.apply(this, arguments);
		}
		const renderedContent = computed(() => {
			return renderMarkdown(article.value.content || "");
		});
		const previewContent = computed(() => {
			return renderMarkdown(form.value.content || "");
		});
		function renderMarkdown(text) {
			return sanitizeHtml("<p>" + text.replace(/!\[(.*?)\]\((.+?)\)/g, "<img src=\"$2\" alt=\"$1\" class=\"md-img\" />").replace(/\[(.*?)\]\((.+?)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>").replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/^\- (.+)$/gm, "<li>$1</li>").replace(/^\d+\. (.+)$/gm, "<li>$1</li>").replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") + "</p>");
		}
		function handleDownloadClick(e) {
			var _target$closest;
			const target = e.target;
			const link = target === null || target === void 0 || (_target$closest = target.closest) === null || _target$closest === void 0 ? void 0 : _target$closest.call(target, "a[href*=\"/file/info/download/\"]");
			if (!link) return;
			e.preventDefault();
			const m = (link.getAttribute("href") || "").match(/\/file\/info\/download\/(\d+)/);
			if (!m) return;
			const filename = (link.textContent || "").replace(/^\s*📎\s*/, "").trim() || void 0;
			downloadFileById(m[1], filename);
		}
		function goBack() {
			router.push("/file/kb");
		}
		function switchToEdit() {
			form.value = {
				id: article.value.id,
				title: article.value.title || "",
				content: article.value.content || "",
				categoryId: article.value.categoryId,
				tags: article.value.tags || "",
				contentType: article.value.contentType || "markdown",
				status: article.value.status
			};
			tagList.value = article.value.tags ? article.value.tags.split(",").filter(Boolean) : [];
			mode.value = "edit";
		}
		function handleSaveDraft() {
			return _handleSaveDraft.apply(this, arguments);
		}
		function _handleSaveDraft() {
			_handleSaveDraft = _asyncToGenerator(function* () {
				if (!form.value.title) {
					ElMessage.warning(t("kb.titleRequired"));
					return;
				}
				saving.value = true;
				try {
					form.value.tags = tagList.value.join(",");
					form.value.status = 0;
					if (form.value.id) yield kbArticleApi.update(form.value);
					else yield kbArticleApi.create(form.value);
					ElMessage.success(t("common.success"));
				} finally {
					saving.value = false;
				}
			});
			return _handleSaveDraft.apply(this, arguments);
		}
		function handlePublish() {
			return _handlePublish.apply(this, arguments);
		}
		function _handlePublish() {
			_handlePublish = _asyncToGenerator(function* () {
				if (!form.value.title) {
					ElMessage.warning(t("kb.titleRequired"));
					return;
				}
				saving.value = true;
				try {
					form.value.tags = tagList.value.join(",");
					form.value.status = 1;
					if (form.value.id) {
						yield kbArticleApi.update(form.value);
						yield kbArticleApi.publish(form.value.id);
					} else yield kbArticleApi.create(form.value);
					ElMessage.success(t("common.success"));
					router.push("/file/kb");
				} finally {
					saving.value = false;
				}
			});
			return _handlePublish.apply(this, arguments);
		}
		function handleLike() {
			return _handleLike.apply(this, arguments);
		}
		function _handleLike() {
			_handleLike = _asyncToGenerator(function* () {
				if (article.value.id) {
					yield kbArticleApi.like(article.value.id);
					article.value.likeCount = (article.value.likeCount || 0) + 1;
					liked.value = true;
				}
			});
			return _handleLike.apply(this, arguments);
		}
		function removeTag(tag) {
			tagList.value = tagList.value.filter((t) => t !== tag);
		}
		function showTagInput() {
			tagInputVisible.value = true;
			nextTick(() => {
				var _tagInputRef$value;
				(_tagInputRef$value = tagInputRef.value) === null || _tagInputRef$value === void 0 || _tagInputRef$value.focus();
			});
		}
		function confirmTag() {
			if (tagInputValue.value && !tagList.value.includes(tagInputValue.value)) tagList.value.push(tagInputValue.value);
			tagInputVisible.value = false;
			tagInputValue.value = "";
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_tag = ElTag;
			const _component_el_input = ElInput;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_upload = ElUpload;
			return openBlock(), createElementBlock("div", _hoisted_1, [mode.value === "view" ? (openBlock(), createElementBlock("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createVNode(_component_el_button, {
				onClick: goBack,
				type: "default"
			}, {
				default: withCtx(() => [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(arrow_left_default))]),
					_: 1
				}), createTextVNode(" " + toDisplayString(_ctx.$t("common.back")), 1)]),
				_: 1
			}), createVNode(_component_el_button, {
				type: "primary",
				onClick: switchToEdit
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.edit")), 1)]),
				_: 1
			})]), createBaseVNode("div", _hoisted_4, [
				createBaseVNode("h1", _hoisted_5, toDisplayString(article.value.title), 1),
				createBaseVNode("div", _hoisted_6, [
					createBaseVNode("span", null, toDisplayString(article.value.createTime), 1),
					createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(view_default))]),
						_: 1
					}), createTextVNode(" " + toDisplayString(article.value.viewCount || 0), 1)]),
					createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(star_default))]),
						_: 1
					}), createTextVNode(" " + toDisplayString(article.value.likeCount || 0), 1)]),
					article.value.status === 0 ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						type: "info",
						size: "small"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.draft")), 1)]),
						_: 1
					})) : article.value.status === 1 ? (openBlock(), createBlock(_component_el_tag, {
						key: 1,
						type: "success",
						size: "small"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.published")), 1)]),
						_: 1
					})) : article.value.status === 2 ? (openBlock(), createBlock(_component_el_tag, {
						key: 2,
						type: "warning",
						size: "small"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.archived")), 1)]),
						_: 1
					})) : createCommentVNode("", true)
				]),
				article.value.tags ? (openBlock(), createElementBlock("div", _hoisted_7, [(openBlock(true), createElementBlock(Fragment, null, renderList(article.value.tags.split(","), (tag) => {
					return openBlock(), createBlock(_component_el_tag, {
						key: tag,
						size: "small"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(tag), 1)]),
						_: 2
					}, 1024);
				}), 128))])) : createCommentVNode("", true),
				createBaseVNode("div", {
					class: "article-view__body markdown-body",
					innerHTML: unref(sanitizeHtml)(renderedContent.value),
					onClick: handleDownloadClick
				}, null, 8, _hoisted_8),
				createBaseVNode("div", _hoisted_9, [createVNode(_component_el_button, {
					onClick: handleLike,
					type: liked.value ? "primary" : "default",
					round: ""
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(star_default))]),
						_: 1
					}), createTextVNode(" " + toDisplayString(_ctx.$t("kb.like")) + " (" + toDisplayString(article.value.likeCount || 0) + ") ", 1)]),
					_: 1
				}, 8, ["type"])])
			])])) : (openBlock(), createElementBlock("div", _hoisted_10, [createBaseVNode("div", _hoisted_11, [createVNode(_component_el_button, { onClick: goBack }, {
				default: withCtx(() => [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(arrow_left_default))]),
					_: 1
				}), createTextVNode(" " + toDisplayString(_ctx.$t("common.back")), 1)]),
				_: 1
			}), createBaseVNode("div", _hoisted_12, [createVNode(_component_el_button, {
				onClick: handleSaveDraft,
				loading: saving.value
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.saveDraft")), 1)]),
				_: 1
			}, 8, ["loading"]), createVNode(_component_el_button, {
				type: "primary",
				onClick: handlePublish,
				loading: saving.value
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.publish")), 1)]),
				_: 1
			}, 8, ["loading"])])]), createBaseVNode("div", _hoisted_13, [
				createVNode(_component_el_input, {
					modelValue: form.value.title,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.value.title = $event),
					placeholder: _ctx.$t("kb.enterTitle"),
					class: "title-input"
				}, null, 8, ["modelValue", "placeholder"]),
				createBaseVNode("div", _hoisted_14, [createVNode(_component_el_tree_select, {
					modelValue: form.value.categoryId,
					"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.value.categoryId = $event),
					data: categoryTree.value,
					props: {
						label: "label",
						children: "children",
						value: "id"
					},
					placeholder: _ctx.$t("kb.selectCategory"),
					clearable: "",
					style: { "width": "200px" }
				}, null, 8, [
					"modelValue",
					"data",
					"placeholder"
				]), createBaseVNode("div", _hoisted_15, [(openBlock(true), createElementBlock(Fragment, null, renderList(tagList.value, (tag) => {
					return openBlock(), createBlock(_component_el_tag, {
						key: tag,
						closable: "",
						onClose: ($event) => removeTag(tag),
						style: { "margin-right": "4px" }
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(tag), 1)]),
						_: 2
					}, 1032, ["onClose"]);
				}), 128)), tagInputVisible.value ? (openBlock(), createBlock(_component_el_input, {
					key: 0,
					ref_key: "tagInputRef",
					ref: tagInputRef,
					modelValue: tagInputValue.value,
					"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => tagInputValue.value = $event),
					size: "small",
					style: { "width": "100px" },
					onKeyup: withKeys(confirmTag, ["enter"]),
					onBlur: confirmTag
				}, null, 8, ["modelValue"])) : (openBlock(), createBlock(_component_el_button, {
					key: 1,
					size: "small",
					onClick: showTagInput
				}, {
					default: withCtx(() => [createTextVNode("+ " + toDisplayString(_ctx.$t("kb.addTag")), 1)]),
					_: 1
				}))])]),
				createBaseVNode("div", _hoisted_16, [
					createBaseVNode("div", _hoisted_17, [
						createVNode(_component_el_radio_group, {
							modelValue: editorMode.value,
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => editorMode.value = $event),
							size: "small"
						}, {
							default: withCtx(() => [createVNode(_component_el_radio_button, { value: "write" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.write")), 1)]),
								_: 1
							}), createVNode(_component_el_radio_button, { value: "preview" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.preview")), 1)]),
								_: 1
							})]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_upload, {
							"show-file-list": false,
							"auto-upload": false,
							accept: "image/*",
							"on-change": handleImageSelect,
							class: "image-upload"
						}, {
							default: withCtx(() => [createVNode(_component_el_button, {
								size: "small",
								loading: imageUploading.value
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(picture_filled_default))]),
									_: 1
								}), _cache[5] || (_cache[5] = createTextVNode(" 插入图片 ", -1))]),
								_: 1
							}, 8, ["loading"])]),
							_: 1
						}),
						createVNode(_component_el_upload, {
							"show-file-list": false,
							"auto-upload": false,
							accept: ".doc,.docx,.ppt,.pptx,.xls,.xlsx,.pdf,.txt,.md,.csv,.zip,.rar,.7z,.png,.jpg,.jpeg,.gif,.bmp,.webp",
							"on-change": handleAttachSelect,
							class: "attach-upload"
						}, {
							default: withCtx(() => [createVNode(_component_el_button, {
								size: "small",
								loading: attachUploading.value
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(paperclip_default))]),
									_: 1
								}), _cache[6] || (_cache[6] = createTextVNode(" 上传附件 ", -1))]),
								_: 1
							}, 8, ["loading"])]),
							_: 1
						})
					]),
					withDirectives(createBaseVNode("div", _hoisted_18, [createVNode(_component_el_input, {
						ref_key: "contentInputRef",
						ref: contentInputRef,
						modelValue: form.value.content,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.value.content = $event),
						type: "textarea",
						rows: 20,
						placeholder: _ctx.$t("kb.enterContent"),
						resize: "none",
						onPaste: handleContentPaste
					}, null, 8, ["modelValue", "placeholder"])], 512), [[vShow, editorMode.value === "write"]]),
					withDirectives(createBaseVNode("div", {
						class: "editor-preview markdown-body",
						innerHTML: unref(sanitizeHtml)(previewContent.value),
						onClick: handleDownloadClick
					}, null, 8, _hoisted_19), [[vShow, editorMode.value === "preview"]]),
					_cache[7] || (_cache[7] = createBaseVNode("div", { class: "editor-hint" }, " 支持 Markdown + 图片粘贴/上传;可直接『上传附件』(Word/PPT/Excel/PDF/图片等),上传后自动在正文插入下载链接。 ", -1))
				])
			])]))]);
		};
	}
}), [["__scopeId", "data-v-27d8c1ae"]]);
//#endregion
export { article_default as default };
