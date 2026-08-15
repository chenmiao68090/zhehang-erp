import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, st as defineComponent, yt as onBeforeUnmount } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Dr as withModifiers, Er as withKeys, F as ElEmpty, I as ElDropdown, L as ElDropdownItem, Nn as plus_default, Qt as document_default, R as ElDropdownMenu, Tr as vShow, V as ElDialog, _ as ElTableColumn, a as ElMessageBox, cn as folder_default, d as ElTree, g as ElTable, l as ElUpload, ln as grid_default, lt as ElBreadcrumb, mt as ElInput, o as ElMessage, ot as ElButton, pn as list_default, sn as folder_add_default, st as ElButtonGroup, ur as upload_default, ut as ElBreadcrumbItem, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { l as resolveApiUrl } from "./request-CZ5tKmxn.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi, t as fileFolderApi } from "./file-BNSD7Sq1.js";
import { n as downloadFileById } from "./download-DmWzpvAG.js";
//#region src/views/file/manager.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "file-manager" };
var _hoisted_2 = { class: "file-manager__sidebar" };
var _hoisted_3 = { class: "sidebar-header" };
var _hoisted_4 = { class: "sidebar-title" };
var _hoisted_5 = { class: "tree-node" };
var _hoisted_6 = { class: "file-manager__content" };
var _hoisted_7 = { class: "content-toolbar" };
var _hoisted_8 = { class: "toolbar-left" };
var _hoisted_9 = { class: "toolbar-right" };
var _hoisted_10 = {
	key: 0,
	class: "file-list"
};
var _hoisted_11 = { class: "file-name-cell" };
var _hoisted_12 = { style: { "color": "#f56c6c" } };
var _hoisted_13 = {
	key: 1,
	class: "file-grid"
};
var _hoisted_14 = ["onDblclick", "onContextmenu"];
var _hoisted_15 = { class: "file-card__icon" };
var _hoisted_16 = ["title"];
var _hoisted_17 = { class: "file-card__info" };
var _hoisted_18 = { class: "el-upload__text" };
var _hoisted_19 = { class: "file-preview" };
var _hoisted_20 = ["src"];
var _hoisted_21 = ["src"];
var _hoisted_22 = {
	key: 2,
	class: "preview-info"
};
//#endregion
//#region src/views/file/manager.vue
var manager_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "manager",
	setup(__props) {
		const { t } = useI18n();
		const folderTree = ref([]);
		const fileList = ref([]);
		const currentFolder = ref(null);
		const currentFolderId = ref(null);
		const searchKeyword = ref("");
		const viewMode = ref("list");
		const treeRef = ref();
		const pagination = reactive({
			pageNum: 1,
			pageSize: 20,
			total: 0
		});
		const uploadVisible = ref(false);
		const uploadRef = ref();
		const uploadFileList = ref([]);
		const uploading = ref(false);
		const versionVisible = ref(false);
		const versionList = ref([]);
		const currentVersionFile = ref(null);
		const previewVisible = ref(false);
		const previewFile = ref(null);
		const previewUrl = ref("");
		const folderMenuVisible = ref(false);
		const contextFolder = ref(null);
		const menuPosition = reactive({
			x: 0,
			y: 0
		});
		onMounted(() => {
			loadFolderTree();
			loadFiles();
			document.addEventListener("click", closeContextMenu);
		});
		onBeforeUnmount(() => {
			document.removeEventListener("click", closeContextMenu);
		});
		function closeContextMenu() {
			folderMenuVisible.value = false;
		}
		function loadFolderTree() {
			return _loadFolderTree.apply(this, arguments);
		}
		function _loadFolderTree() {
			_loadFolderTree = _asyncToGenerator(function* () {
				try {
					folderTree.value = (yield fileFolderApi.tree()).data || [];
				} catch (e) {}
			});
			return _loadFolderTree.apply(this, arguments);
		}
		function loadFiles() {
			return _loadFiles.apply(this, arguments);
		}
		function _loadFiles() {
			_loadFiles = _asyncToGenerator(function* () {
				try {
					var _res$data, _res$data2;
					const res = yield fileInfoApi.list({
						pageNum: pagination.pageNum,
						pageSize: pagination.pageSize,
						folderId: currentFolderId.value || void 0,
						keyword: searchKeyword.value || void 0
					});
					fileList.value = ((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.records) || [];
					pagination.total = ((_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.total) || 0;
				} catch (e) {}
			});
			return _loadFiles.apply(this, arguments);
		}
		function handleSearch() {
			pagination.pageNum = 1;
			loadFiles();
		}
		function handleFolderClick(data) {
			currentFolder.value = data.id ? data : null;
			currentFolderId.value = data.id || null;
			pagination.pageNum = 1;
			loadFiles();
		}
		function handleFolderContextMenu(event, data) {
			event.preventDefault();
			contextFolder.value = data;
			menuPosition.x = event.clientX;
			menuPosition.y = event.clientY;
			folderMenuVisible.value = true;
		}
		function handleFileContextMenu(event, row) {
			event.preventDefault();
		}
		function handleCreateFolder(_x) {
			return _handleCreateFolder.apply(this, arguments);
		}
		function _handleCreateFolder() {
			_handleCreateFolder = _asyncToGenerator(function* (parentId) {
				const { value } = yield ElMessageBox.prompt(t("file.enterFolderName"), t("file.newFolder"), {
					confirmButtonText: t("common.confirm"),
					cancelButtonText: t("common.cancel")
				});
				if (value) {
					yield fileFolderApi.create({
						name: value,
						parentId: parentId || 0
					});
					ElMessage.success(t("common.success"));
					loadFolderTree();
				}
			});
			return _handleCreateFolder.apply(this, arguments);
		}
		function handleRenameFolderCtx() {
			return _handleRenameFolderCtx.apply(this, arguments);
		}
		function _handleRenameFolderCtx() {
			_handleRenameFolderCtx = _asyncToGenerator(function* () {
				folderMenuVisible.value = false;
				if (!contextFolder.value) return;
				const { value } = yield ElMessageBox.prompt(t("file.enterFolderName"), t("file.rename"), {
					confirmButtonText: t("common.confirm"),
					cancelButtonText: t("common.cancel"),
					inputValue: contextFolder.value.label
				});
				if (value) {
					yield fileFolderApi.rename({
						id: contextFolder.value.id,
						name: value
					});
					ElMessage.success(t("common.success"));
					loadFolderTree();
				}
			});
			return _handleRenameFolderCtx.apply(this, arguments);
		}
		function handleDeleteFolderCtx() {
			return _handleDeleteFolderCtx.apply(this, arguments);
		}
		function _handleDeleteFolderCtx() {
			_handleDeleteFolderCtx = _asyncToGenerator(function* () {
				folderMenuVisible.value = false;
				if (!contextFolder.value) return;
				yield ElMessageBox.confirm(t("file.confirmDeleteFolder"), t("common.confirm"));
				yield fileFolderApi.remove(contextFolder.value.id);
				ElMessage.success(t("common.success"));
				loadFolderTree();
			});
			return _handleDeleteFolderCtx.apply(this, arguments);
		}
		function handleUpload() {
			uploadFileList.value = [];
			uploadVisible.value = true;
		}
		function handleUploadChange(file) {
			uploadFileList.value.push(file);
		}
		function submitUpload() {
			return _submitUpload.apply(this, arguments);
		}
		function _submitUpload() {
			_submitUpload = _asyncToGenerator(function* () {
				if (uploadFileList.value.length === 0) return;
				uploading.value = true;
				try {
					for (const item of uploadFileList.value) yield fileInfoApi.upload(item.raw, currentFolderId.value || void 0);
					ElMessage.success(t("common.success"));
					uploadVisible.value = false;
					loadFiles();
				} finally {
					uploading.value = false;
				}
			});
			return _submitUpload.apply(this, arguments);
		}
		function handleDownload(row) {
			downloadFileById(row.id, row.name);
		}
		function handlePreview(_x2) {
			return _handlePreview.apply(this, arguments);
		}
		function _handlePreview() {
			_handlePreview = _asyncToGenerator(function* (row) {
				try {
					const res = yield fileInfoApi.preview(row.id);
					previewFile.value = res.data;
					previewUrl.value = resolveApiUrl(res.data.previewUrl, "/api");
					previewVisible.value = true;
				} catch (e) {}
			});
			return _handlePreview.apply(this, arguments);
		}
		function handleRenameFile(_x3) {
			return _handleRenameFile.apply(this, arguments);
		}
		function _handleRenameFile() {
			_handleRenameFile = _asyncToGenerator(function* (row) {
				const { value } = yield ElMessageBox.prompt(t("file.enterFileName"), t("file.rename"), {
					confirmButtonText: t("common.confirm"),
					cancelButtonText: t("common.cancel"),
					inputValue: row.name
				});
				if (value) {
					yield fileInfoApi.rename(row.id, value);
					ElMessage.success(t("common.success"));
					loadFiles();
				}
			});
			return _handleRenameFile.apply(this, arguments);
		}
		function handleMoveFile(_x4) {
			return _handleMoveFile.apply(this, arguments);
		}
		function _handleMoveFile() {
			_handleMoveFile = _asyncToGenerator(function* (row) {
				const { value } = yield ElMessageBox.prompt(t("file.enterTargetFolder"), t("file.move"), {
					confirmButtonText: t("common.confirm"),
					cancelButtonText: t("common.cancel")
				});
				if (value) {
					yield fileInfoApi.move(row.id, Number(value));
					ElMessage.success(t("common.success"));
					loadFiles();
				}
			});
			return _handleMoveFile.apply(this, arguments);
		}
		function handleDeleteFile(_x5) {
			return _handleDeleteFile.apply(this, arguments);
		}
		function _handleDeleteFile() {
			_handleDeleteFile = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(t("file.confirmDeleteFile"), t("common.confirm"));
				yield fileInfoApi.remove(row.id);
				ElMessage.success(t("common.success"));
				loadFiles();
			});
			return _handleDeleteFile.apply(this, arguments);
		}
		function handleVersionHistory(_x6) {
			return _handleVersionHistory.apply(this, arguments);
		}
		function _handleVersionHistory() {
			_handleVersionHistory = _asyncToGenerator(function* (row) {
				currentVersionFile.value = row;
				versionList.value = (yield fileInfoApi.versions(row.id)).data || [];
				versionVisible.value = true;
			});
			return _handleVersionHistory.apply(this, arguments);
		}
		function handleUploadNewVersion() {
			const input = document.createElement("input");
			input.type = "file";
			input.onchange = function() {
				var _ref = _asyncToGenerator(function* (e) {
					const file = e.target.files[0];
					if (!file) return;
					const changeLog = prompt(t("file.enterChangeLog")) || "";
					yield fileInfoApi.uploadVersion(currentVersionFile.value.id, file, changeLog);
					ElMessage.success(t("common.success"));
					handleVersionHistory(currentVersionFile.value);
					loadFiles();
				});
				return function(_x7) {
					return _ref.apply(this, arguments);
				};
			}();
			input.click();
		}
		function formatFileSize(bytes) {
			if (!bytes) return "0 B";
			const units = [
				"B",
				"KB",
				"MB",
				"GB",
				"TB"
			];
			let i = 0;
			let size = bytes;
			while (size >= 1024 && i < units.length - 1) {
				size /= 1024;
				i++;
			}
			return size.toFixed(i > 0 ? 1 : 0) + " " + units[i];
		}
		function getFileIcon(fileType) {
			return {
				pdf: "Document",
				doc: "Document",
				docx: "Document",
				xls: "Document",
				xlsx: "Document",
				ppt: "Document",
				pptx: "Document",
				jpg: "Picture",
				jpeg: "Picture",
				png: "Picture",
				gif: "Picture",
				svg: "Picture",
				zip: "Files",
				rar: "Files",
				"7z": "Files",
				mp4: "VideoCamera",
				avi: "VideoCamera",
				mov: "VideoCamera",
				mp3: "Headset",
				wav: "Headset"
			}[fileType === null || fileType === void 0 ? void 0 : fileType.toLowerCase()] || "Document";
		}
		function getFileIconColor(fileType) {
			return {
				pdf: "#f56c6c",
				doc: "#409eff",
				docx: "#409eff",
				xls: "#67c23a",
				xlsx: "#67c23a",
				ppt: "#e6a23c",
				pptx: "#e6a23c",
				jpg: "#3370ff",
				jpeg: "#3370ff",
				png: "#3370ff",
				gif: "#3370ff",
				zip: "#909399",
				rar: "#909399"
			}[fileType === null || fileType === void 0 ? void 0 : fileType.toLowerCase()] || "#909399";
		}
		function isImage(mimeType) {
			return !!(mimeType === null || mimeType === void 0 ? void 0 : mimeType.startsWith("image/"));
		}
		function isPdf(mimeType) {
			return mimeType === "application/pdf";
		}
		return (_ctx, _cache) => {
			var _previewFile$value;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_tree = ElTree;
			const _component_el_breadcrumb_item = ElBreadcrumbItem;
			const _component_el_breadcrumb = ElBreadcrumb;
			const _component_el_input = ElInput;
			const _component_el_button_group = ElButtonGroup;
			const _component_el_table_column = ElTableColumn;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_empty = ElEmpty;
			const _component_el_upload = ElUpload;
			const _component_el_dialog = ElDialog;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("span", _hoisted_4, toDisplayString(_ctx.$t("file.folders")), 1), createVNode(_component_el_button, {
					type: "primary",
					link: "",
					onClick: _cache[0] || (_cache[0] = ($event) => handleCreateFolder(0))
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					})]),
					_: 1
				})]), createVNode(_component_el_tree, {
					ref_key: "treeRef",
					ref: treeRef,
					data: folderTree.value,
					"node-key": "id",
					props: {
						label: "label",
						children: "children"
					},
					"highlight-current": "",
					"default-expand-all": "",
					onNodeClick: handleFolderClick,
					onNodeContextmenu: handleFolderContextMenu
				}, {
					default: withCtx(({ data }) => [createBaseVNode("span", _hoisted_5, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(folder_default))]),
						_: 1
					}), createBaseVNode("span", null, toDisplayString(data.label), 1)])]),
					_: 1
				}, 8, ["data"])]),
				createBaseVNode("div", _hoisted_6, [createBaseVNode("div", _hoisted_7, [createBaseVNode("div", _hoisted_8, [createVNode(_component_el_breadcrumb, { separator: "/" }, {
					default: withCtx(() => [createVNode(_component_el_breadcrumb_item, { onClick: _cache[1] || (_cache[1] = ($event) => handleFolderClick({ id: null })) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.allFiles")), 1)]),
						_: 1
					}), currentFolder.value ? (openBlock(), createBlock(_component_el_breadcrumb_item, { key: 0 }, {
						default: withCtx(() => [createTextVNode(toDisplayString(currentFolder.value.label), 1)]),
						_: 1
					})) : createCommentVNode("", true)]),
					_: 1
				})]), createBaseVNode("div", _hoisted_9, [
					createVNode(_component_el_input, {
						modelValue: searchKeyword.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => searchKeyword.value = $event),
						placeholder: _ctx.$t("file.searchFile"),
						"prefix-icon": "Search",
						clearable: "",
						style: { "width": "200px" },
						onKeyup: withKeys(handleSearch, ["enter"]),
						onClear: loadFiles
					}, null, 8, ["modelValue", "placeholder"]),
					createVNode(_component_el_button_group, null, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: viewMode.value === "list" ? "primary" : "",
							onClick: _cache[3] || (_cache[3] = ($event) => viewMode.value = "list")
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(list_default))]),
								_: 1
							})]),
							_: 1
						}, 8, ["type"]), createVNode(_component_el_button, {
							type: viewMode.value === "grid" ? "primary" : "",
							onClick: _cache[4] || (_cache[4] = ($event) => viewMode.value = "grid")
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(grid_default))]),
								_: 1
							})]),
							_: 1
						}, 8, ["type"])]),
						_: 1
					}),
					createVNode(_component_el_button, {
						type: "primary",
						onClick: handleUpload
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(upload_default))]),
							_: 1
						}), createTextVNode(" " + toDisplayString(_ctx.$t("file.upload")), 1)]),
						_: 1
					}),
					createVNode(_component_el_button, { onClick: _cache[5] || (_cache[5] = ($event) => handleCreateFolder(currentFolderId.value)) }, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(folder_add_default))]),
							_: 1
						}), createTextVNode(" " + toDisplayString(_ctx.$t("file.newFolder")), 1)]),
						_: 1
					})
				])]), viewMode.value === "list" ? (openBlock(), createElementBlock("div", _hoisted_10, [createVNode(_component_el_table, {
					data: fileList.value,
					style: { "width": "100%" },
					onRowContextmenu: handleFileContextMenu
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "name",
							label: _ctx.$t("file.fileName"),
							"min-width": "250"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_11, [createVNode(_component_el_icon, {
								size: 20,
								color: getFileIconColor(row.fileType)
							}, {
								default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(getFileIcon(row.fileType))))]),
								_: 2
							}, 1032, ["color"]), createBaseVNode("span", null, toDisplayString(row.name), 1)])]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "fileSize",
							label: _ctx.$t("file.fileSize"),
							width: "120"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatFileSize(row.fileSize)), 1)]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "fileType",
							label: _ctx.$t("file.fileType"),
							width: "100"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "updateTime",
							label: _ctx.$t("file.modifiedTime"),
							width: "180"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							label: _ctx.$t("common.edit"),
							width: "200",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [
								createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => handleDownload(row)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.download")), 1)]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => handlePreview(row)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.preview")), 1)]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_dropdown, { trigger: "click" }, {
									dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
										default: withCtx(() => [
											createVNode(_component_el_dropdown_item, { onClick: ($event) => handleRenameFile(row) }, {
												default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.rename")), 1)]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_dropdown_item, { onClick: ($event) => handleMoveFile(row) }, {
												default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.move")), 1)]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_dropdown_item, { onClick: ($event) => handleVersionHistory(row) }, {
												default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.versionHistory")), 1)]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_dropdown_item, {
												divided: "",
												onClick: ($event) => handleDeleteFile(row)
											}, {
												default: withCtx(() => [createBaseVNode("span", _hoisted_12, toDisplayString(_ctx.$t("common.delete")), 1)]),
												_: 1
											}, 8, ["onClick"])
										]),
										_: 2
									}, 1024)]),
									default: withCtx(() => [createVNode(_component_el_button, {
										link: "",
										type: "primary"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.more")), 1)]),
										_: 1
									})]),
									_: 2
								}, 1024)
							]),
							_: 1
						}, 8, ["label"])
					]),
					_: 1
				}, 8, ["data"]), createVNode(_component_el_pagination, {
					"current-page": pagination.pageNum,
					"onUpdate:currentPage": _cache[6] || (_cache[6] = ($event) => pagination.pageNum = $event),
					"page-size": pagination.pageSize,
					"onUpdate:pageSize": _cache[7] || (_cache[7] = ($event) => pagination.pageSize = $event),
					total: pagination.total,
					"page-sizes": [
						10,
						20,
						50
					],
					layout: "total, sizes, prev, pager, next",
					onChange: loadFiles,
					style: {
						"margin-top": "16px",
						"justify-content": "flex-end"
					}
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])) : (openBlock(), createElementBlock("div", _hoisted_13, [(openBlock(true), createElementBlock(Fragment, null, renderList(fileList.value, (file) => {
					return openBlock(), createElementBlock("div", {
						key: file.id,
						class: "file-card",
						onDblclick: ($event) => handlePreview(file),
						onContextmenu: withModifiers(($event) => handleFileContextMenu($event, file), ["prevent"])
					}, [
						createBaseVNode("div", _hoisted_15, [createVNode(_component_el_icon, {
							size: 48,
							color: getFileIconColor(file.fileType)
						}, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(getFileIcon(file.fileType))))]),
							_: 2
						}, 1032, ["color"])]),
						createBaseVNode("div", {
							class: "file-card__name",
							title: file.name
						}, toDisplayString(file.name), 9, _hoisted_16),
						createBaseVNode("div", _hoisted_17, toDisplayString(formatFileSize(file.fileSize)), 1)
					], 40, _hoisted_14);
				}), 128)), fileList.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
					key: 0,
					description: _ctx.$t("common.noData")
				}, null, 8, ["description"])) : createCommentVNode("", true)]))]),
				createVNode(_component_el_dialog, {
					modelValue: uploadVisible.value,
					"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => uploadVisible.value = $event),
					title: _ctx.$t("file.uploadFile"),
					width: "500px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[8] || (_cache[8] = ($event) => uploadVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: uploading.value,
						onClick: submitUpload
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.upload")), 1)]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_upload, {
						ref_key: "uploadRef",
						ref: uploadRef,
						drag: "",
						multiple: "",
						"auto-upload": false,
						"file-list": uploadFileList.value,
						"on-change": handleUploadChange
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, { class: "el-icon--upload" }, {
							default: withCtx(() => [createVNode(unref(upload_default))]),
							_: 1
						}), createBaseVNode("div", _hoisted_18, toDisplayString(_ctx.$t("file.dragUpload")), 1)]),
						_: 1
					}, 8, ["file-list"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: versionVisible.value,
					"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => versionVisible.value = $event),
					title: _ctx.$t("file.versionHistory"),
					width: "700px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: handleUploadNewVersion }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.uploadNewVersion")), 1)]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_table, { data: versionList.value }, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "version",
								label: _ctx.$t("file.version"),
								width: "80"
							}, {
								default: withCtx(({ row }) => [createTextVNode("v" + toDisplayString(row.version), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								prop: "fileSize",
								label: _ctx.$t("file.fileSize"),
								width: "100"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatFileSize(row.fileSize)), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								prop: "changeLog",
								label: _ctx.$t("file.changeLog")
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								prop: "createTime",
								label: _ctx.$t("file.uploadTime"),
								width: "180"
							}, null, 8, ["label"])
						]),
						_: 1
					}, 8, ["data"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: previewVisible.value,
					"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => previewVisible.value = $event),
					title: (_previewFile$value = previewFile.value) === null || _previewFile$value === void 0 ? void 0 : _previewFile$value.name,
					width: "80%",
					top: "5vh"
				}, {
					default: withCtx(() => {
						var _previewFile$value2, _previewFile$value3, _previewFile$value4, _previewFile$value5, _previewFile$value6;
						return [createBaseVNode("div", _hoisted_19, [isImage((_previewFile$value2 = previewFile.value) === null || _previewFile$value2 === void 0 ? void 0 : _previewFile$value2.mimeType) ? (openBlock(), createElementBlock("img", {
							key: 0,
							src: previewUrl.value,
							style: {
								"max-width": "100%",
								"max-height": "70vh"
							}
						}, null, 8, _hoisted_20)) : isPdf((_previewFile$value3 = previewFile.value) === null || _previewFile$value3 === void 0 ? void 0 : _previewFile$value3.mimeType) ? (openBlock(), createElementBlock("iframe", {
							key: 1,
							src: previewUrl.value,
							style: {
								"width": "100%",
								"height": "70vh",
								"border": "none"
							}
						}, null, 8, _hoisted_21)) : (openBlock(), createElementBlock("div", _hoisted_22, [
							createVNode(_component_el_icon, {
								size: 64,
								color: "#909399"
							}, {
								default: withCtx(() => [createVNode(unref(document_default))]),
								_: 1
							}),
							createBaseVNode("p", null, toDisplayString((_previewFile$value4 = previewFile.value) === null || _previewFile$value4 === void 0 ? void 0 : _previewFile$value4.name), 1),
							createBaseVNode("p", null, toDisplayString(_ctx.$t("file.fileType")) + ": " + toDisplayString((_previewFile$value5 = previewFile.value) === null || _previewFile$value5 === void 0 ? void 0 : _previewFile$value5.fileType), 1),
							createBaseVNode("p", null, toDisplayString(_ctx.$t("file.fileSize")) + ": " + toDisplayString(formatFileSize((_previewFile$value6 = previewFile.value) === null || _previewFile$value6 === void 0 ? void 0 : _previewFile$value6.fileSize)), 1),
							createVNode(_component_el_button, {
								type: "primary",
								onClick: _cache[11] || (_cache[11] = ($event) => handleDownload(previewFile.value))
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("file.download")), 1)]),
								_: 1
							})
						]))])];
					}),
					_: 1
				}, 8, ["modelValue", "title"]),
				withDirectives(createBaseVNode("div", {
					class: "context-menu",
					style: normalizeStyle({
						left: menuPosition.x + "px",
						top: menuPosition.y + "px"
					})
				}, [
					createBaseVNode("div", {
						class: "context-menu-item",
						onClick: _cache[13] || (_cache[13] = ($event) => {
							var _contextFolder$value;
							return handleCreateFolder((_contextFolder$value = contextFolder.value) === null || _contextFolder$value === void 0 ? void 0 : _contextFolder$value.id);
						})
					}, toDisplayString(_ctx.$t("file.newFolder")), 1),
					createBaseVNode("div", {
						class: "context-menu-item",
						onClick: handleRenameFolderCtx
					}, toDisplayString(_ctx.$t("file.rename")), 1),
					createBaseVNode("div", {
						class: "context-menu-item danger",
						onClick: handleDeleteFolderCtx
					}, toDisplayString(_ctx.$t("common.delete")), 1)
				], 4), [[vShow, folderMenuVisible.value]])
			]);
		};
	}
}), [["__scopeId", "data-v-7a95d74e"]]);
//#endregion
export { manager_default as default };
