import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, h as _objectWithoutProperties, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, rt as createStaticVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, $t as download_default, An as phone_default, At as chat_dot_round_default, Dn as office_building_default, Dr as withModifiers, F as ElEmpty, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, Un as search_default, V as ElDialog, W as ElDatePicker, Xt as delete_default, Z as ElRadioButton, _ as ElTableColumn, _n as medal_default, _t as ElFormItem, a as ElMessageBox, bn as message_default, c as ElSegmented, d as ElTree, dr as upload_filled_default, et as ElCheckboxGroup, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, jn as picture_default, kt as camera_default, l as ElUpload, ln as grid_default, m as ElTabPane, mn as loading_default, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tn as edit_pen_default, tt as ElCard, yn as menu_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { i as structureApi, n as employeeApi, t as deptApi } from "./org-DaVetSL-.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { t as IconPicker_default } from "./IconPicker-EsVze-xY.js";
//#region src/api/culture.ts
var contentApi = {
	list: (type) => get("/culture/content/list", type ? { type } : {}),
	detail: (id) => get(`/culture/content/${id}`),
	save: (data) => post("/culture/content", data),
	remove: (id) => del(`/culture/content/${id}`)
};
//#endregion
//#region src/views/collaboration/contacts.vue?vue&type=script&setup=true&lang.ts
var _excluded = [
	"deptName",
	"postName",
	"createTime"
];
var _hoisted_1$1 = {
	key: 0,
	class: "page-header"
};
var _hoisted_2$1 = { class: "header-meta" };
var _hoisted_3$1 = { class: "meta-time" };
var _hoisted_4$1 = {
	key: 1,
	class: "metric-strip"
};
var _hoisted_5$1 = { class: "metric-index" };
var _hoisted_6$1 = { class: "metric-value" };
var _hoisted_7$1 = { class: "metric-label" };
var _hoisted_8$1 = { class: "search-bar" };
var _hoisted_9$1 = { class: "content-section" };
var _hoisted_10$1 = { class: "section-head" };
var _hoisted_11$1 = { class: "view-switch" };
var _hoisted_12$1 = { class: "contact-workspace" };
var _hoisted_13$1 = { class: "org-tree" };
var _hoisted_14$1 = { class: "tree-head" };
var _hoisted_15$1 = { class: "tree-sub" };
var _hoisted_16$1 = { class: "tree-node" };
var _hoisted_17$1 = { class: "node-label" };
var _hoisted_18$1 = { class: "node-count" };
var _hoisted_19$1 = { class: "member-pane" };
var _hoisted_20$1 = { class: "member-pane-head" };
var _hoisted_21$1 = { class: "dept-info" };
var _hoisted_22$1 = { class: "dept-name" };
var _hoisted_23$1 = { class: "dept-meta" };
var _hoisted_24$1 = {
	key: 0,
	class: "showcase-grid"
};
var _hoisted_25$1 = {
	key: 0,
	class: "sc-badge"
};
var _hoisted_26$1 = ["onClick", "title"];
var _hoisted_27$1 = ["src"];
var _hoisted_28$1 = { class: "sc-upload-mask" };
var _hoisted_29$1 = { class: "sc-name" };
var _hoisted_30$1 = { class: "sc-post" };
var _hoisted_31$1 = { class: "sc-dept" };
var _hoisted_32$1 = { class: "sc-contact" };
var _hoisted_33$1 = ["href", "title"];
var _hoisted_34$1 = ["href", "title"];
var _hoisted_35$1 = { class: "cell-name" };
var _hoisted_36$1 = ["onClick", "title"];
var _hoisted_37$1 = ["src"];
var _hoisted_38$1 = { class: "tbl-cam" };
var _hoisted_39$1 = { class: "m-name" };
var _hoisted_40$1 = { class: "m-sub" };
//#endregion
//#region src/views/collaboration/contacts.vue
var contacts_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "contacts",
	props: { embedded: { type: Boolean } },
	setup(__props) {
		const currentDate = (() => {
			const d = /* @__PURE__ */ new Date();
			return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
		})();
		const search = ref("");
		const view = ref("card");
		const sortKey = ref("name");
		const activeDept = ref("全公司");
		const loading = ref(false);
		const COLORS = [
			"linear-gradient(135deg,#5B7CFA,#324BB3)",
			"linear-gradient(135deg,#3370ff,#A8401A)",
			"linear-gradient(135deg,#9C5FB6,#5E3779)",
			"linear-gradient(135deg,#3CB371,#1F6B45)",
			"linear-gradient(135deg,#3370ff,#1f54e6)",
			"linear-gradient(135deg,#C44569,#7B2A45)",
			"linear-gradient(135deg,#1F6BA8,#0F4675)"
		];
		const STATUS_DOT = {
			1: "on",
			2: "busy",
			3: "off"
		};
		const STATUS_TEXT = {
			1: "在职",
			2: "试用",
			3: "离职"
		};
		const statusText = (c) => STATUS_TEXT[c] || "未知";
		const statusTag = (c) => c === 1 ? "success" : c === 2 ? "warning" : "info";
		const members = ref([]);
		const treeData = ref([]);
		const deptCount = computed(() => {
			var _treeData$value$;
			return ((_treeData$value$ = treeData.value[0]) === null || _treeData$value$ === void 0 || (_treeData$value$ = _treeData$value$.children) === null || _treeData$value$ === void 0 ? void 0 : _treeData$value$.length) || 0;
		});
		const metrics = computed(() => {
			const total = members.value.length;
			const onJob = members.value.filter((m) => m.statusCode === 1).length;
			members.value.filter((m) => m.statusCode === 2).length;
			const withPhoto = members.value.filter((m) => m.photo).length;
			return [
				{
					label: "员工总数",
					value: String(total)
				},
				{
					label: "一级部门",
					value: String(deptCount.value)
				},
				{
					label: "在职",
					value: String(onJob)
				},
				{
					label: "已传照片",
					value: `${withPhoto}/${total || 0}`
				}
			];
		});
		function toTreeNode(dept) {
			const directCount = members.value.filter((m) => m.dept === dept.deptName).length;
			const children = (dept.children || []).map(toTreeNode);
			const childSum = children.reduce((s, c) => s + (c.count || 0), 0);
			return {
				id: dept.id,
				label: dept.deptName,
				count: directCount + childSum,
				children: children.length ? children : void 0
			};
		}
		function loadData() {
			return _loadData.apply(this, arguments);
		}
		function _loadData() {
			_loadData = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const empRes = yield employeeApi.options();
					members.value = (Array.isArray(empRes === null || empRes === void 0 ? void 0 : empRes.data) ? empRes.data : Array.isArray(empRes) ? empRes : []).map((e, i) => {
						var _e$id;
						return {
							id: String((_e$id = e.id) !== null && _e$id !== void 0 ? _e$id : i),
							name: e.name || "-",
							empCode: e.empCode || "",
							initial: (e.name || "?").charAt(0),
							photo: e.avatar || "",
							color: COLORS[i % COLORS.length],
							post: e.postName || "-",
							dept: e.deptName || "未分配",
							phone: e.phone || "-",
							email: e.email || "-",
							rawEmp: e,
							statusCode: e.status,
							status: STATUS_DOT[e.status] || "off"
						};
					});
					const deptRes = yield deptApi.tree();
					const depts = (deptRes === null || deptRes === void 0 ? void 0 : deptRes.data) || [];
					treeData.value = [{
						id: "root",
						label: "浙杭集团",
						count: members.value.length,
						children: depts.map(toTreeNode)
					}];
				} finally {
					loading.value = false;
				}
			});
			return _loadData.apply(this, arguments);
		}
		function handleNodeClick(data) {
			activeDept.value = data.label === "浙杭集团" ? "全公司" : data.label;
		}
		const filteredMembers = computed(() => {
			let list = members.value;
			if (activeDept.value && activeDept.value !== "全公司") list = list.filter((m) => m.dept === activeDept.value);
			if (search.value) {
				const kw = search.value;
				list = list.filter((m) => m.name.includes(kw) || m.post.includes(kw) || m.phone.includes(kw) || m.email.includes(kw) || m.empCode.includes(kw));
			}
			return [...list].sort((a, b) => {
				if (sortKey.value === "post") return a.post.localeCompare(b.post);
				if (sortKey.value === "entry") return a.empCode.localeCompare(b.empCode);
				return a.name.localeCompare(b.name);
			});
		});
		const fileInputRef = ref();
		const pickingId = ref("");
		const savingId = ref("");
		function pickPhoto(m) {
			var _fileInputRef$value;
			if (savingId.value) return;
			pickingId.value = m.id;
			(_fileInputRef$value = fileInputRef.value) === null || _fileInputRef$value === void 0 || _fileInputRef$value.click();
		}
		function onFileChange(_x) {
			return _onFileChange.apply(this, arguments);
		}
		function _onFileChange() {
			_onFileChange = _asyncToGenerator(function* (e) {
				var _input$files;
				const input = e.target;
				const file = (_input$files = input.files) === null || _input$files === void 0 ? void 0 : _input$files[0];
				input.value = "";
				if (!file) return;
				const m = members.value.find((x) => x.id === pickingId.value);
				if (!m) return;
				if (!file.type.startsWith("image/")) {
					ElMessage.warning("请选择图片文件");
					return;
				}
				if (file.size > 8 * 1024 * 1024) {
					ElMessage.warning("图片请小于 8MB");
					return;
				}
				savingId.value = m.id;
				try {
					var _m$rawEmp$id, _m$rawEmp;
					const base64 = yield compressToBase64(file, 256);
					const _ref = m.rawEmp || {}, { deptName, postName, createTime } = _ref, dto = _objectWithoutProperties(_ref, _excluded);
					yield employeeApi.update(_objectSpread2(_objectSpread2({}, dto), {}, {
						id: (_m$rawEmp$id = (_m$rawEmp = m.rawEmp) === null || _m$rawEmp === void 0 ? void 0 : _m$rawEmp.id) !== null && _m$rawEmp$id !== void 0 ? _m$rawEmp$id : m.id,
						avatar: base64
					}));
					m.photo = base64;
					m.rawEmp = _objectSpread2(_objectSpread2({}, m.rawEmp), {}, { avatar: base64 });
					ElMessage.success(`${m.name} 的照片已更新`);
				} catch (err) {
					console.error(err);
					ElMessage.error("照片上传失败,请重试");
				} finally {
					savingId.value = "";
				}
			});
			return _onFileChange.apply(this, arguments);
		}
		function compressToBase64(file, size) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onerror = () => reject(/* @__PURE__ */ new Error("read fail"));
				reader.onload = () => {
					const img = new Image();
					img.onerror = () => reject(/* @__PURE__ */ new Error("decode fail"));
					img.onload = () => {
						const canvas = document.createElement("canvas");
						canvas.width = size;
						canvas.height = size;
						const ctx = canvas.getContext("2d");
						if (!ctx) {
							reject(/* @__PURE__ */ new Error("no ctx"));
							return;
						}
						const min = Math.min(img.width, img.height);
						const sx = (img.width - min) / 2;
						const sy = (img.height - min) / 2;
						ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
						resolve(canvas.toDataURL("image/jpeg", .85));
					};
					img.src = reader.result;
				};
				reader.readAsDataURL(file);
			});
		}
		onMounted(loadData);
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_icon = ElIcon;
			const _component_el_tree = ElTree;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", { class: normalizeClass(["collab-page collab-contacts", { "is-embedded": __props.embedded }]) }, [
				!__props.embedded ? (openBlock(), createElementBlock("header", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [
					_cache[6] || (_cache[6] = createBaseVNode("span", { class: "meta-tag" }, "COLLAB · 02 / SHOWCASE", -1)),
					_cache[7] || (_cache[7] = createBaseVNode("span", { class: "meta-divider" }, null, -1)),
					createBaseVNode("span", _hoisted_3$1, toDisplayString(unref(currentDate)), 1)
				]), _cache[8] || (_cache[8] = createStaticVNode("<div class=\"header-main\" data-v-759f70a6><h1 class=\"page-title\" data-v-759f70a6><span class=\"title-cn\" data-v-759f70a6>员工风采</span><span class=\"title-en\" data-v-759f70a6>Staff Showcase</span></h1><p class=\"page-desc\" data-v-759f70a6>展示全员风采,点击头像可上传真实照片 · 浏览组织架构与同事联系方式</p></div><div class=\"header-decor\" data-v-759f70a6><div class=\"decor-line\" data-v-759f70a6></div><div class=\"decor-dot\" data-v-759f70a6></div><div class=\"decor-line short\" data-v-759f70a6></div></div>", 2))])) : createCommentVNode("", true),
				!__props.embedded ? (openBlock(), createElementBlock("section", _hoisted_4$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(metrics.value, (m, idx) => {
					return openBlock(), createElementBlock("div", {
						class: "metric-item",
						key: idx
					}, [
						createBaseVNode("div", _hoisted_5$1, "0" + toDisplayString(idx + 1), 1),
						createBaseVNode("div", _hoisted_6$1, toDisplayString(m.value), 1),
						createBaseVNode("div", _hoisted_7$1, toDisplayString(m.label), 1)
					]);
				}), 128))])) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_8$1, [createVNode(_component_el_input, {
					modelValue: search.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => search.value = $event),
					placeholder: "搜索姓名、岗位、手机号、邮箱或工号",
					"prefix-icon": unref(search_default),
					clearable: "",
					size: "large"
				}, null, 8, ["modelValue", "prefix-icon"])]),
				createBaseVNode("section", _hoisted_9$1, [createBaseVNode("div", _hoisted_10$1, [
					_cache[11] || (_cache[11] = createBaseVNode("h2", { class: "section-title" }, "组织 & 风采", -1)),
					_cache[12] || (_cache[12] = createBaseVNode("span", { class: "section-sub" }, "SHOWCASE / TREE + WALL", -1)),
					createBaseVNode("div", _hoisted_11$1, [createBaseVNode("span", {
						class: normalizeClass({ active: view.value === "card" }),
						onClick: _cache[1] || (_cache[1] = ($event) => view.value = "card")
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(grid_default))]),
						_: 1
					}), _cache[9] || (_cache[9] = createTextVNode(" 风采墙 ", -1))], 2), createBaseVNode("span", {
						class: normalizeClass({ active: view.value === "table" }),
						onClick: _cache[2] || (_cache[2] = ($event) => view.value = "table")
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(menu_default))]),
						_: 1
					}), _cache[10] || (_cache[10] = createTextVNode(" 列表 ", -1))], 2)])
				]), withDirectives((openBlock(), createElementBlock("div", _hoisted_12$1, [createBaseVNode("aside", _hoisted_13$1, [createBaseVNode("div", _hoisted_14$1, [_cache[13] || (_cache[13] = createBaseVNode("span", { class: "tree-title" }, "浙杭集团", -1)), createBaseVNode("span", _hoisted_15$1, toDisplayString(deptCount.value) + " 部门 · " + toDisplayString(members.value.length) + " 人", 1)]), createVNode(_component_el_tree, {
					data: treeData.value,
					"default-expanded-keys": ["root"],
					"highlight-current": true,
					"node-key": "id",
					onNodeClick: handleNodeClick
				}, {
					default: withCtx(({ node, data }) => [createBaseVNode("span", _hoisted_16$1, [createBaseVNode("span", _hoisted_17$1, toDisplayString(node.label), 1), createBaseVNode("span", _hoisted_18$1, toDisplayString(data.count), 1)])]),
					_: 1
				}, 8, ["data"])]), createBaseVNode("main", _hoisted_19$1, [createBaseVNode("div", _hoisted_20$1, [createBaseVNode("div", _hoisted_21$1, [createBaseVNode("span", _hoisted_22$1, toDisplayString(activeDept.value), 1), createBaseVNode("span", _hoisted_23$1, "共 " + toDisplayString(filteredMembers.value.length) + " 位成员", 1)]), createVNode(_component_el_radio_group, {
					modelValue: sortKey.value,
					"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => sortKey.value = $event),
					size: "small"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_radio_button, { label: "name" }, {
							default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("姓名排序", -1)])]),
							_: 1
						}),
						createVNode(_component_el_radio_button, { label: "post" }, {
							default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("岗位排序", -1)])]),
							_: 1
						}),
						createVNode(_component_el_radio_button, { label: "entry" }, {
							default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("工号排序", -1)])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue"])]), view.value === "card" ? (openBlock(), createElementBlock("div", _hoisted_24$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(filteredMembers.value, (m) => {
					return openBlock(), createElementBlock("div", {
						key: m.id,
						class: "showcase-card"
					}, [
						m.empCode ? (openBlock(), createElementBlock("span", _hoisted_25$1, toDisplayString(m.empCode), 1)) : createCommentVNode("", true),
						createBaseVNode("div", {
							class: normalizeClass(["showcase-avatar", { uploading: savingId.value === m.id }]),
							onClick: ($event) => pickPhoto(m),
							title: `点击为 ${m.name} 上传照片`
						}, [
							m.photo ? (openBlock(), createElementBlock("img", {
								key: 0,
								src: m.photo,
								class: "sc-photo",
								alt: ""
							}, null, 8, _hoisted_27$1)) : (openBlock(), createElementBlock("span", {
								key: 1,
								class: "sc-letter",
								style: normalizeStyle({ background: m.color })
							}, toDisplayString(m.initial), 5)),
							createBaseVNode("div", _hoisted_28$1, [savingId.value === m.id ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
								default: withCtx(() => [createVNode(unref(loading_default))]),
								_: 1
							})) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(camera_default))]),
								_: 1
							}), createBaseVNode("span", null, toDisplayString(m.photo ? "更换照片" : "上传照片"), 1)], 64))]),
							createBaseVNode("i", { class: normalizeClass(["sc-status", m.status]) }, null, 2)
						], 10, _hoisted_26$1),
						createBaseVNode("div", _hoisted_29$1, toDisplayString(m.name), 1),
						createBaseVNode("div", _hoisted_30$1, toDisplayString(m.post), 1),
						createBaseVNode("div", _hoisted_31$1, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(office_building_default))]),
							_: 1
						}), createTextVNode(" " + toDisplayString(m.dept), 1)]),
						createBaseVNode("div", _hoisted_32$1, [
							m.phone && m.phone !== "-" ? (openBlock(), createElementBlock("a", {
								key: 0,
								href: `tel:${m.phone}`,
								class: "sc-chip",
								title: m.phone,
								onClick: _cache[4] || (_cache[4] = withModifiers(() => {}, ["stop"]))
							}, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(phone_default))]),
								_: 1
							})], 8, _hoisted_33$1)) : createCommentVNode("", true),
							m.email && m.email !== "-" ? (openBlock(), createElementBlock("a", {
								key: 1,
								href: `mailto:${m.email}`,
								class: "sc-chip",
								title: m.email,
								onClick: _cache[5] || (_cache[5] = withModifiers(() => {}, ["stop"]))
							}, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(message_default))]),
								_: 1
							})], 8, _hoisted_34$1)) : createCommentVNode("", true),
							createVNode(_component_el_tag, {
								size: "small",
								type: statusTag(m.statusCode),
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(statusText(m.statusCode)), 1)]),
								_: 2
							}, 1032, ["type"])
						])
					]);
				}), 128)), !filteredMembers.value.length ? (openBlock(), createBlock(_component_el_empty, {
					key: 0,
					description: "该部门暂无成员"
				})) : createCommentVNode("", true)])) : (openBlock(), createBlock(_component_el_table, {
					key: 1,
					data: filteredMembers.value,
					stripe: "",
					class: "member-table"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "姓名",
							width: "200"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_35$1, [createBaseVNode("div", {
								class: "tbl-avatar",
								onClick: ($event) => pickPhoto(row),
								title: `点击为 ${row.name} 上传照片`
							}, [row.photo ? (openBlock(), createElementBlock("img", {
								key: 0,
								src: row.photo,
								alt: ""
							}, null, 8, _hoisted_37$1)) : (openBlock(), createElementBlock("span", {
								key: 1,
								class: "tbl-letter",
								style: normalizeStyle({ background: row.color })
							}, toDisplayString(row.initial), 5)), createBaseVNode("div", _hoisted_38$1, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(camera_default))]),
								_: 1
							})])], 8, _hoisted_36$1), createBaseVNode("div", null, [createBaseVNode("div", _hoisted_39$1, toDisplayString(row.name), 1), createBaseVNode("div", _hoisted_40$1, toDisplayString(row.empCode), 1)])])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "post",
							label: "岗位",
							width: "160"
						}),
						createVNode(_component_el_table_column, {
							prop: "dept",
							label: "所属部门",
							width: "180"
						}),
						createVNode(_component_el_table_column, {
							prop: "phone",
							label: "联系电话",
							width: "160"
						}),
						createVNode(_component_el_table_column, {
							prop: "email",
							label: "电子邮箱"
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "120"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: statusTag(row.statusCode),
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(statusText(row.statusCode)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"]))])])), [[_directive_loading, loading.value]])]),
				createBaseVNode("input", {
					ref_key: "fileInputRef",
					ref: fileInputRef,
					type: "file",
					accept: "image/*",
					style: { "display": "none" },
					onChange: onFileChange
				}, null, 544)
			], 2);
		};
	}
}), [["__scopeId", "data-v-759f70a6"]]);
//#endregion
//#region src/views/culture/index.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container culture-page" };
var _hoisted_2 = { class: "culture-hero" };
var _hoisted_3 = { class: "culture-hero-stats" };
var _hoisted_4 = { class: "culture-section-head" };
var _hoisted_5 = { class: "care-stat-grid" };
var _hoisted_6 = { class: "care-toolbar" };
var _hoisted_7 = { class: "care-person" };
var _hoisted_8 = { class: "care-avatar" };
var _hoisted_9 = { class: "culture-section-head" };
var _hoisted_10 = { class: "feedback-layout" };
var _hoisted_11 = { class: "feedback-form-card" };
var _hoisted_12 = { class: "feedback-actions" };
var _hoisted_13 = { class: "feedback-list-card" };
var _hoisted_14 = { class: "panel-title" };
var _hoisted_15 = { class: "feedback-list" };
var _hoisted_16 = { class: "feedback-item-head" };
var _hoisted_17 = { class: "feedback-meta" };
var _hoisted_18 = { key: 0 };
var _hoisted_19 = {
	key: 0,
	class: "feedback-reply"
};
var _hoisted_20 = {
	key: 1,
	class: "feedback-manage"
};
var _hoisted_21 = { class: "culture-section-head" };
var _hoisted_22 = { class: "culture-mvv-grid" };
var _hoisted_23 = { class: "culture-mvv-label" };
var _hoisted_24 = { class: "culture-mvv-body" };
var _hoisted_25 = {
	key: 0,
	class: "culture-mvv-ops"
};
var _hoisted_26 = { class: "culture-value-grid" };
var _hoisted_27 = { class: "culture-value-icon" };
var _hoisted_28 = {
	key: 0,
	class: "culture-card-ops culture-card-ops-center"
};
var _hoisted_29 = { class: "culture-feed-section" };
var _hoisted_30 = { class: "culture-sub-head" };
var _hoisted_31 = { class: "culture-sub-actions" };
var _hoisted_32 = { class: "culture-news-grid" };
var _hoisted_33 = ["src", "alt"];
var _hoisted_34 = { class: "culture-news-body" };
var _hoisted_35 = {
	key: 0,
	class: "culture-card-ops"
};
var _hoisted_36 = { class: "culture-feed-section honor-wall-section" };
var _hoisted_37 = { class: "culture-sub-head" };
var _hoisted_38 = { class: "honor-wall-grid" };
var _hoisted_39 = ["src", "alt"];
var _hoisted_40 = { key: 1 };
var _hoisted_41 = { class: "honor-info" };
var _hoisted_42 = { key: 0 };
var _hoisted_43 = { key: 0 };
var _hoisted_44 = {
	key: 1,
	class: "culture-card-ops culture-card-ops-center"
};
var _hoisted_45 = { class: "culture-section-head" };
var _hoisted_46 = { class: "culture-policy-grid" };
var _hoisted_47 = { class: "culture-policy-head" };
var _hoisted_48 = {
	key: 0,
	class: "culture-card-ops"
};
var _hoisted_49 = {
	key: 1,
	class: "culture-policy-files"
};
var _hoisted_50 = ["onClick"];
var _hoisted_51 = { class: "culture-inline-fields" };
var _hoisted_52 = { class: "culture-upload-field" };
var _hoisted_53 = { class: "culture-policy-upload" };
var _hoisted_54 = {
	key: 0,
	class: "culture-policy-upload-list"
};
var dayMs = 1440 * 60 * 1e3;
//#endregion
//#region src/views/culture/index.vue
var culture_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "index",
	setup(__props) {
		const userStore = useUserStore();
		useRouter();
		const canManage = computed(() => {
			const roles = userStore.roles || [];
			return roles.includes("admin") || roles.includes("boss") || roles.includes("manager");
		});
		const activeTab = ref("staff");
		const rawTree = ref([]);
		const allEmployees = ref([]);
		const employeeLoading = ref(false);
		function countDepts(nodes) {
			let n = 0;
			for (const node of nodes || []) {
				n += 1;
				if (Array.isArray(node.children) && node.children.length) n += countDepts(node.children);
			}
			return n;
		}
		const heroStats = computed(() => ({
			deptCount: countDepts(rawTree.value),
			memberCount: allEmployees.value.length,
			activeCount: allEmployees.value.filter((e) => e.status !== 3).length
		}));
		const loadStructure = function() {
			var _ref = _asyncToGenerator(function* () {
				try {
					rawTree.value = (yield structureApi.tree()).data || [];
				} catch (e) {
					rawTree.value = [];
				}
			});
			return function loadStructure() {
				return _ref.apply(this, arguments);
			};
		}();
		const loadEmployees = function() {
			var _ref2 = _asyncToGenerator(function* () {
				employeeLoading.value = true;
				try {
					const data = (yield employeeApi.list({
						pageNum: 1,
						pageSize: 500
					})).data || {};
					allEmployees.value = data.records || data.list || [];
				} catch (e) {
					allEmployees.value = [];
				} finally {
					employeeLoading.value = false;
				}
			});
			return function loadEmployees() {
				return _ref2.apply(this, arguments);
			};
		}();
		const careType = ref("birthday");
		const careKeyword = ref("");
		const careTypeOptions = [{
			label: "生日",
			value: "birthday"
		}, {
			label: "入职周年",
			value: "anniversary"
		}];
		const startOfToday = () => {
			const d = /* @__PURE__ */ new Date();
			d.setHours(0, 0, 0, 0);
			return d;
		};
		const parseDate = (value) => {
			if (!value) return null;
			const parts = String(value).slice(0, 10).split("-").map(Number);
			if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
			const d = new Date(parts[0], parts[1] - 1, parts[2]);
			return Number.isNaN(d.getTime()) ? null : d;
		};
		const pad2 = (n) => String(n).padStart(2, "0");
		const formatDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
		const formatMonthDay = (d) => `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
		const nextOccurrence = (source) => {
			const today = startOfToday();
			let next = new Date(today.getFullYear(), source.getMonth(), source.getDate());
			if (next.getTime() < today.getTime()) next = new Date(today.getFullYear() + 1, source.getMonth(), source.getDate());
			return next;
		};
		const describeDays = (days) => {
			if (days === 0) return "今天";
			if (days === 1) return "明天";
			return `${days} 天后`;
		};
		const activeEmployees = computed(() => allEmployees.value.filter((e) => {
			var _e$status;
			return Number((_e$status = e.status) !== null && _e$status !== void 0 ? _e$status : 1) !== 3;
		}));
		const careItems = computed(() => {
			const today = startOfToday();
			return activeEmployees.value.map((e) => {
				const source = parseDate(careType.value === "birthday" ? e.birthDate : e.hireDate);
				if (!source) return null;
				const next = nextOccurrence(source);
				const daysUntil = Math.max(0, Math.round((next.getTime() - today.getTime()) / dayMs));
				const anniversaryYears = Math.max(0, next.getFullYear() - source.getFullYear());
				const action = careType.value === "birthday" ? daysUntil === 0 ? "当天祝福 + 小礼物确认" : "提前准备祝福、蛋糕或红包" : anniversaryYears > 0 ? `准备第 ${anniversaryYears} 周年关怀` : "新人入职关怀";
				return {
					id: e.id || e.employeeId || `${e.name}-${source.toISOString()}`,
					name: e.name || e.realName || "未命名",
					postName: e.postName || e.position || "",
					deptName: e.deptName || "",
					sourceDate: formatDate(source),
					monthText: `${source.getMonth() + 1} 月`,
					nextDateText: formatMonthDay(next),
					daysUntil,
					daysText: describeDays(daysUntil),
					yearsText: anniversaryYears > 0 ? `${anniversaryYears} 周年` : "未满 1 年",
					action,
					searchText: `${e.name || ""} ${e.realName || ""} ${e.postName || ""} ${e.position || ""} ${e.deptName || ""}`.toLowerCase(),
					nextDate: next
				};
			}).filter(Boolean).sort((a, b) => a.daysUntil - b.daysUntil);
		});
		const filteredCareItems = computed(() => {
			const kw = careKeyword.value.trim().toLowerCase();
			if (!kw) return careItems.value;
			return careItems.value.filter((item) => item.searchText.includes(kw));
		});
		const careStats = computed(() => {
			const today = startOfToday();
			const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
			return [
				{
					label: "今天",
					value: careItems.value.filter((item) => item.daysUntil === 0).length
				},
				{
					label: "本周",
					value: careItems.value.filter((item) => item.daysUntil <= 7).length
				},
				{
					label: "本月",
					value: careItems.value.filter((item) => item.nextDate.getFullYear() === today.getFullYear() && item.nextDate.getMonth() === today.getMonth()).length
				},
				{
					label: "下月",
					value: careItems.value.filter((item) => item.nextDate.getFullYear() === nextMonth.getFullYear() && item.nextDate.getMonth() === nextMonth.getMonth()).length
				},
				{
					label: careType.value === "birthday" ? "有生日档案" : "有入职档案",
					value: careItems.value.length
				}
			];
		});
		const exportCareList = () => {
			const csv = `\uFEFF${[[
				"姓名",
				"部门",
				"岗位",
				careType.value === "birthday" ? "出生日期" : "入职日期",
				"最近日期",
				"提醒",
				"建议动作"
			], ...filteredCareItems.value.map((item) => [
				item.name,
				item.deptName,
				item.postName,
				item.sourceDate,
				item.nextDateText,
				item.daysText,
				item.action
			])].map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, "\"\"")}"`).join(",")).join("\n")}`;
			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `员工关怀-${careType.value === "birthday" ? "生日" : "入职周年"}-${formatDate(startOfToday())}.csv`;
			a.click();
			URL.revokeObjectURL(url);
		};
		const feedbackLoading = ref(false);
		const feedbackSaving = ref(false);
		const feedbackRaw = ref([]);
		const feedbackFormRef = ref();
		const feedbackCcOptions = [
			{
				label: "部门直属上级",
				value: "direct_manager"
			},
			{
				label: "HRBP(人事)",
				value: "hrbp"
			},
			{
				label: "总经办助理",
				value: "gm_assistant"
			}
		];
		const feedbackCcLabelMap = feedbackCcOptions.reduce((map, item) => {
			map[item.value] = item.label;
			return map;
		}, {});
		const feedbackForm = reactive({
			category: "建议",
			title: "",
			content: "",
			ccTargets: ["direct_manager", "hrbp"],
			anonymous: true
		});
		const feedbackRules = {
			category: [{
				required: true,
				message: "请选择类型",
				trigger: "change"
			}],
			title: [{
				required: true,
				message: "请输入标题",
				trigger: "blur"
			}],
			content: [{
				required: true,
				message: "请输入内容",
				trigger: "blur"
			}]
		};
		const parseFeedbackPayload = (raw) => {
			try {
				const parsed = JSON.parse((raw === null || raw === void 0 ? void 0 : raw.content) || "{}");
				return {
					category: parsed.category || (raw === null || raw === void 0 ? void 0 : raw.icon) || "建议",
					anonymous: parsed.anonymous !== false,
					ccTargets: Array.isArray(parsed.ccTargets) ? parsed.ccTargets : [],
					content: parsed.content || "",
					reply: parsed.reply || "",
					replyTime: parsed.replyTime || ""
				};
			} catch (_unused) {
				return {
					category: (raw === null || raw === void 0 ? void 0 : raw.icon) || "建议",
					anonymous: true,
					ccTargets: [],
					content: (raw === null || raw === void 0 ? void 0 : raw.content) || "",
					reply: "",
					replyTime: ""
				};
			}
		};
		const feedbackItems = computed(() => feedbackRaw.value.map((raw) => {
			const payload = parseFeedbackPayload(raw);
			return _objectSpread2({
				id: raw.id,
				title: raw.title,
				createTime: raw.createTime,
				raw,
				payload,
				ccLabels: payload.ccTargets.map((item) => feedbackCcLabelMap[item] || item).filter(Boolean)
			}, payload);
		}).sort((a, b) => Number(b.id || 0) - Number(a.id || 0)));
		const pendingFeedbackCount = computed(() => feedbackItems.value.filter((item) => !item.reply).length);
		const loadFeedback = function() {
			var _ref3 = _asyncToGenerator(function* () {
				feedbackLoading.value = true;
				try {
					const res = yield contentApi.list("feedback");
					feedbackRaw.value = (res === null || res === void 0 ? void 0 : res.data) || [];
				} catch (_unused2) {
					feedbackRaw.value = [];
				} finally {
					feedbackLoading.value = false;
				}
			});
			return function loadFeedback() {
				return _ref3.apply(this, arguments);
			};
		}();
		const submitFeedback = function() {
			var _ref5 = _asyncToGenerator(function* () {
				var _feedbackFormRef$valu;
				yield (_feedbackFormRef$valu = feedbackFormRef.value) === null || _feedbackFormRef$valu === void 0 ? void 0 : _feedbackFormRef$valu.validate(function() {
					var _ref4 = _asyncToGenerator(function* (valid) {
						if (!valid) return;
						feedbackSaving.value = true;
						try {
							const payload = {
								category: feedbackForm.category,
								anonymous: feedbackForm.anonymous,
								ccTargets: [...feedbackForm.ccTargets],
								content: feedbackForm.content,
								reply: "",
								replyTime: ""
							};
							yield contentApi.save({
								type: "feedback",
								title: feedbackForm.title,
								icon: feedbackForm.category,
								content: JSON.stringify(payload),
								sortOrder: -Math.floor(Date.now() / 1e3),
								status: 1
							});
							ElMessage.success("已提交，管理层会在意见箱中闭环回复");
							Object.assign(feedbackForm, {
								category: "建议",
								title: "",
								content: "",
								ccTargets: ["direct_manager", "hrbp"],
								anonymous: true
							});
							yield loadFeedback();
						} finally {
							feedbackSaving.value = false;
						}
					});
					return function(_x) {
						return _ref4.apply(this, arguments);
					};
				}());
			});
			return function submitFeedback() {
				return _ref5.apply(this, arguments);
			};
		}();
		const replyFeedback = function() {
			var _ref6 = _asyncToGenerator(function* (item) {
				try {
					var _item$raw$sortOrder, _item$raw;
					const result = yield ElMessageBox.prompt("请输入管理回复，员工可在闭环记录中查看。", "登记回复", {
						confirmButtonText: "保存回复",
						cancelButtonText: "取消",
						inputType: "textarea",
						inputValue: item.reply || "",
						inputValidator: (value) => Boolean(value && value.trim()),
						inputErrorMessage: "请填写回复内容"
					});
					const payload = _objectSpread2(_objectSpread2({}, item.payload), {}, {
						reply: result.value.trim(),
						replyTime: formatDate(startOfToday())
					});
					yield contentApi.save({
						id: item.id,
						type: "feedback",
						title: item.title,
						icon: item.category,
						content: JSON.stringify(payload),
						sortOrder: (_item$raw$sortOrder = (_item$raw = item.raw) === null || _item$raw === void 0 ? void 0 : _item$raw.sortOrder) !== null && _item$raw$sortOrder !== void 0 ? _item$raw$sortOrder : 0,
						status: 1
					});
					ElMessage.success("回复已保存");
					yield loadFeedback();
				} catch (_unused3) {}
			});
			return function replyFeedback(_x2) {
				return _ref6.apply(this, arguments);
			};
		}();
		const avatarText = (name) => String(name || "员").slice(0, 1);
		const policyRaw = ref([]);
		const cultureRaw = ref([]);
		const cultureNewsRaw = ref([]);
		const honorRaw = ref([]);
		const policyLoading = ref(false);
		const cultureLoading = ref(false);
		const cultureNewsLoading = ref(false);
		const honorLoading = ref(false);
		const cultureNewsFilter = ref("全部");
		const cultureNewsFilterOptions = [
			"全部",
			"公司动态",
			"团建活动",
			"节日福利",
			"员工表彰"
		];
		const cultureNewsCategories = cultureNewsFilterOptions.filter((item) => item !== "全部");
		const honorCategories = [
			"月度销冠",
			"优秀会计",
			"服务之星",
			"优秀团队",
			"活动照片",
			"员工照片"
		];
		const cultureIconOptions = [
			"🎯",
			"💎",
			"🚀",
			"🤝",
			"📈",
			"❤️",
			"⭐",
			"🏆",
			"🌱",
			"🔥",
			"🌟",
			"💡",
			"🧭",
			"🛡️",
			"⚡",
			"🌈",
			"📌",
			"📣",
			"📚",
			"📝",
			"📋",
			"🗂️",
			"📅",
			"⏰",
			"💼",
			"💰",
			"🧾",
			"🧮",
			"🏢",
			"🏠",
			"☎️",
			"💬",
			"👥",
			"🙌",
			"👏",
			"😊",
			"🎁",
			"🎉",
			"🎂",
			"🥇",
			"🏅",
			"🎖️",
			"🪪",
			"🧑‍💼",
			"👩‍💼",
			"🧑‍🏫",
			"📞",
			"🔔",
			"✅",
			"🔒",
			"🔑",
			"🧩",
			"🧠",
			"🛠️",
			"🧰",
			"📊"
		];
		const POLICY_COLORS = [
			"#e6f0ff",
			"#fff3e0",
			"#e8f5e9",
			"#f3e8ff",
			"#e0f7fa",
			"#fde8e8"
		];
		const splitLines = (content) => String(content || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
		const hasMojibake = (value) => /�|Ã|Â|ðŸ|ä|å|æ|ç|è|é|娴|欐|澀|绠|悊|荤|粺|鍚|庣|锟/.test(String(value || ""));
		const isReadableContent = (item) => ![
			item.title,
			item.content,
			item.icon
		].some(hasMojibake);
		const cleanPolicyRaw = computed(() => policyRaw.value.filter(isReadableContent));
		const cleanCultureRaw = computed(() => cultureRaw.value.filter(isReadableContent));
		const cleanCultureNewsRaw = computed(() => cultureNewsRaw.value.filter(isReadableContent));
		const cleanHonorRaw = computed(() => honorRaw.value.filter(isReadableContent));
		const fileImageUrls = ref({});
		const parseRichContent = (raw) => {
			const fallbackLines = splitLines((raw === null || raw === void 0 ? void 0 : raw.content) || "");
			const fallback = {
				category: (raw === null || raw === void 0 ? void 0 : raw.icon) || "公司动态",
				summary: fallbackLines[0] || "",
				detail: fallbackLines.slice(1).join("\n") || (raw === null || raw === void 0 ? void 0 : raw.content) || "",
				imageUrl: "",
				fileId: null,
				eventDate: "",
				personName: "",
				roleName: ""
			};
			try {
				const parsed = JSON.parse((raw === null || raw === void 0 ? void 0 : raw.content) || "{}");
				if (!parsed || typeof parsed !== "object") return fallback;
				return {
					category: parsed.category || (raw === null || raw === void 0 ? void 0 : raw.icon) || fallback.category,
					summary: parsed.summary || fallback.summary,
					detail: parsed.detail || fallback.detail,
					imageUrl: parsed.imageUrl || "",
					fileId: parsed.fileId ? Number(parsed.fileId) : null,
					eventDate: parsed.eventDate || "",
					personName: parsed.personName || "",
					roleName: parsed.roleName || ""
				};
			} catch (_unused4) {
				return fallback;
			}
		};
		const parsePolicyContent = (raw) => {
			try {
				const parsed = JSON.parse((raw === null || raw === void 0 ? void 0 : raw.content) || "{}");
				if (parsed && typeof parsed === "object" && (Array.isArray(parsed.points) || Array.isArray(parsed.attachments))) return {
					points: Array.isArray(parsed.points) ? parsed.points.map((s) => String(s || "").trim()).filter(Boolean) : splitLines(parsed.content || ""),
					attachments: Array.isArray(parsed.attachments) ? parsed.attachments : []
				};
			} catch (_unused5) {}
			return {
				points: splitLines((raw === null || raw === void 0 ? void 0 : raw.content) || ""),
				attachments: []
			};
		};
		const richCardOf = (raw, defaultCategory) => {
			const payload = parseRichContent(raw);
			const fileId = payload.fileId || null;
			return {
				id: raw.id,
				title: raw.title || "未命名内容",
				category: payload.category || defaultCategory,
				summary: payload.summary,
				detail: payload.detail,
				imageUrl: fileId ? fileImageUrls.value[fileId] || payload.imageUrl : payload.imageUrl,
				fileId,
				eventDate: payload.eventDate,
				personName: payload.personName,
				roleName: payload.roleName,
				raw,
				payload
			};
		};
		const policyList = computed(() => cleanPolicyRaw.value.map((item, idx) => {
			const payload = parsePolicyContent(item);
			return {
				id: item.id,
				title: item.title,
				icon: item.icon || "📋",
				color: POLICY_COLORS[idx % POLICY_COLORS.length],
				points: payload.points,
				attachments: payload.attachments,
				raw: item
			};
		}));
		const mvvList = computed(() => cleanCultureRaw.value.slice(0, 3).map((item) => {
			const lines = splitLines(item.content);
			return {
				id: item.id,
				title: item.title,
				body: lines.join("\n"),
				raw: item
			};
		}));
		const coreValues = computed(() => cleanCultureRaw.value.slice(3).map((item) => {
			const lines = splitLines(item.content);
			return {
				id: item.id,
				title: item.title,
				icon: item.icon || "✨",
				desc: lines.join("\n"),
				raw: item
			};
		}));
		const mvvClass = (idx) => [
			"mission",
			"vision",
			"values"
		][idx] || "mission";
		const cultureNewsList = computed(() => cleanCultureNewsRaw.value.map((item) => richCardOf(item, "公司动态")));
		const filteredCultureNews = computed(() => {
			if (cultureNewsFilter.value === "全部") return cultureNewsList.value;
			return cultureNewsList.value.filter((item) => item.category === cultureNewsFilter.value);
		});
		const honorWallList = computed(() => cleanHonorRaw.value.map((item) => richCardOf(item, "荣誉公示")));
		const hydrateFileImages = function() {
			var _ref8 = _asyncToGenerator(function* (items) {
				const ids = items.map((item) => parseRichContent(item).fileId).filter((id) => Boolean(id && !fileImageUrls.value[id]));
				if (!ids.length) return;
				const next = _objectSpread2({}, fileImageUrls.value);
				yield Promise.all(ids.map(function() {
					var _ref7 = _asyncToGenerator(function* (id) {
						try {
							const blob = yield fileInfoApi.download(id);
							next[id] = URL.createObjectURL(blob);
						} catch (_unused6) {}
					});
					return function(_x3) {
						return _ref7.apply(this, arguments);
					};
				}()));
				fileImageUrls.value = next;
			});
			return function hydrateFileImages(_x4) {
				return _ref8.apply(this, arguments);
			};
		}();
		const loadPolicy = function() {
			var _ref9 = _asyncToGenerator(function* () {
				policyLoading.value = true;
				try {
					const res = yield contentApi.list("policy");
					policyRaw.value = (res === null || res === void 0 ? void 0 : res.data) || [];
				} catch (e) {
					policyRaw.value = [];
				} finally {
					policyLoading.value = false;
				}
			});
			return function loadPolicy() {
				return _ref9.apply(this, arguments);
			};
		}();
		const loadCulture = function() {
			var _ref10 = _asyncToGenerator(function* () {
				cultureLoading.value = true;
				try {
					const res = yield contentApi.list("culture");
					cultureRaw.value = (res === null || res === void 0 ? void 0 : res.data) || [];
				} catch (e) {
					cultureRaw.value = [];
				} finally {
					cultureLoading.value = false;
				}
			});
			return function loadCulture() {
				return _ref10.apply(this, arguments);
			};
		}();
		const loadCultureNews = function() {
			var _ref11 = _asyncToGenerator(function* () {
				cultureNewsLoading.value = true;
				try {
					const res = yield contentApi.list("culture_news");
					cultureNewsRaw.value = (res === null || res === void 0 ? void 0 : res.data) || [];
					yield hydrateFileImages(cultureNewsRaw.value);
				} catch (e) {
					cultureNewsRaw.value = [];
				} finally {
					cultureNewsLoading.value = false;
				}
			});
			return function loadCultureNews() {
				return _ref11.apply(this, arguments);
			};
		}();
		const loadHonor = function() {
			var _ref12 = _asyncToGenerator(function* () {
				honorLoading.value = true;
				try {
					const res = yield contentApi.list("honor");
					honorRaw.value = (res === null || res === void 0 ? void 0 : res.data) || [];
					yield hydrateFileImages(honorRaw.value);
				} catch (e) {
					honorRaw.value = [];
				} finally {
					honorLoading.value = false;
				}
			});
			return function loadHonor() {
				return _ref12.apply(this, arguments);
			};
		}();
		const editVisible = ref(false);
		const editSaving = ref(false);
		const editFormRef = ref();
		const editForm = reactive({
			id: null,
			type: "policy",
			title: "",
			content: "",
			icon: "",
			sortOrder: 0,
			status: 1
		});
		const editExtra = reactive({
			category: "公司动态",
			summary: "",
			detail: "",
			imageUrl: "",
			fileId: null,
			eventDate: "",
			personName: "",
			roleName: ""
		});
		const editUploadFiles = ref([]);
		const editImageFile = ref(null);
		const editPolicyFiles = ref([]);
		const policyFileInput = ref();
		const policyFileUploading = ref(false);
		const editRules = {
			title: [{
				required: true,
				message: "请输入标题",
				trigger: "blur"
			}],
			content: [{
				required: true,
				message: "请输入内容",
				trigger: "blur"
			}]
		};
		const isRichCultureType = computed(() => ["culture_news", "honor"].includes(editForm.type));
		const isHonorType = computed(() => editForm.type === "honor");
		const activeCategoryOptions = computed(() => (isHonorType.value ? honorCategories : cultureNewsCategories).map((item) => ({
			label: item,
			value: item
		})));
		const editTitlePlaceholder = computed(() => {
			if (editForm.type === "culture_news") return "如：端午节福利发放 / 六月团建活动";
			if (editForm.type === "honor") return "如：6月月度销冠 / 优秀会计 / 服务之星";
			return "如：考勤与休假 / 使命 Mission";
		});
		const editContentPlaceholder = computed(() => isRichCultureType.value ? "填写正文说明、活动内容、表彰原因或后续安排" : "每行一条要点；换行分段");
		const editTitle = computed(() => {
			const label = {
				policy: "行政制度",
				culture: "企业文化",
				culture_news: "文化动态",
				honor: "荣誉墙",
				feedback: "意见记录"
			}[editForm.type] || "人文内容";
			return (editForm.id ? "编辑" : "新增") + label;
		});
		const resetEditExtra = (type) => {
			Object.assign(editExtra, {
				category: type === "honor" ? "月度销冠" : "公司动态",
				summary: "",
				detail: "",
				imageUrl: "",
				fileId: null,
				eventDate: "",
				personName: "",
				roleName: ""
			});
			editUploadFiles.value = [];
			editImageFile.value = null;
		};
		const openEdit = (type, row) => {
			var _raw$id, _raw$sortOrder, _raw$status;
			const raw = (row === null || row === void 0 ? void 0 : row.raw) || row;
			resetEditExtra(type);
			editForm.id = (_raw$id = raw === null || raw === void 0 ? void 0 : raw.id) !== null && _raw$id !== void 0 ? _raw$id : null;
			editForm.type = type;
			editForm.title = (raw === null || raw === void 0 ? void 0 : raw.title) || "";
			editForm.content = (raw === null || raw === void 0 ? void 0 : raw.content) || "";
			editForm.icon = (raw === null || raw === void 0 ? void 0 : raw.icon) || "";
			editForm.sortOrder = Number((_raw$sortOrder = raw === null || raw === void 0 ? void 0 : raw.sortOrder) !== null && _raw$sortOrder !== void 0 ? _raw$sortOrder : 0);
			editForm.status = Number((_raw$status = raw === null || raw === void 0 ? void 0 : raw.status) !== null && _raw$status !== void 0 ? _raw$status : 1);
			editPolicyFiles.value = [];
			if (type === "policy") {
				const payload = parsePolicyContent(raw || { content: "" });
				editForm.content = payload.points.join("\n");
				editPolicyFiles.value = [...payload.attachments];
			}
			if (["culture_news", "honor"].includes(type)) {
				const payload = parseRichContent(raw || {
					icon: type === "honor" ? "月度销冠" : "公司动态",
					content: ""
				});
				Object.assign(editExtra, payload);
				editForm.icon = payload.category;
				editForm.content = payload.detail;
				const imageUrl = payload.fileId ? fileImageUrls.value[payload.fileId] || payload.imageUrl : payload.imageUrl;
				if (imageUrl) editUploadFiles.value = [{
					name: (raw === null || raw === void 0 ? void 0 : raw.title) || "封面照片",
					url: imageUrl
				}];
			}
			editVisible.value = true;
		};
		const policyFileKey = (file) => `${file.id || file.url || file.name}`;
		const handlePolicyFilePick = function() {
			var _ref13 = _asyncToGenerator(function* (e) {
				const input = e.target;
				const files = input.files ? Array.from(input.files) : [];
				if (!files.length) return;
				policyFileUploading.value = true;
				try {
					for (const file of files) {
						const res = yield fileInfoApi.upload(file);
						const payload = (res === null || res === void 0 ? void 0 : res.data) || res || {};
						editPolicyFiles.value.push({
							id: Number(payload.id || 0) || void 0,
							name: payload.originalName || payload.fileName || file.name,
							url: payload.url
						});
					}
					ElMessage.success("附件已上传");
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "附件上传失败");
				} finally {
					policyFileUploading.value = false;
					input.value = "";
				}
			});
			return function handlePolicyFilePick(_x5) {
				return _ref13.apply(this, arguments);
			};
		}();
		const downloadPolicyFile = function() {
			var _ref14 = _asyncToGenerator(function* (file) {
				if (file.id) {
					const blob = yield fileInfoApi.download(file.id);
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = file.name || "制度附件";
					a.click();
					URL.revokeObjectURL(url);
				} else if (file.url) window.open(file.url, "_blank");
			});
			return function downloadPolicyFile(_x6) {
				return _ref14.apply(this, arguments);
			};
		}();
		const policyExpanded = ref(/* @__PURE__ */ new Set());
		const isPolicyCollapsed = (item) => item.points.length > 5 && !policyExpanded.value.has(item.id);
		const togglePolicy = (id) => {
			const next = new Set(policyExpanded.value);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			policyExpanded.value = next;
		};
		const handleEditImageChange = (file, fileList) => {
			editUploadFiles.value = fileList.slice(-1);
			editImageFile.value = file.raw || null;
			if (file.raw) editExtra.imageUrl = URL.createObjectURL(file.raw);
			else if (file.url) editExtra.imageUrl = file.url;
		};
		const handleEditImageRemove = () => {
			editUploadFiles.value = [];
			editImageFile.value = null;
			editExtra.imageUrl = "";
			editExtra.fileId = null;
		};
		const handleEditImageExceed = () => {
			ElMessage.warning("每条内容最多上传 1 张封面照片");
		};
		const buildEditPayload = function() {
			var _ref15 = _asyncToGenerator(function* () {
				if (editForm.type === "policy") {
					const payload = {
						points: splitLines(editForm.content),
						attachments: editPolicyFiles.value
					};
					return _objectSpread2(_objectSpread2({}, editForm), {}, { content: JSON.stringify(payload) });
				}
				if (!isRichCultureType.value) return _objectSpread2({}, editForm);
				let fileId = editExtra.fileId;
				let imageUrl = editExtra.imageUrl;
				if (editImageFile.value) {
					var _uploadRes$data;
					const uploadRes = yield fileInfoApi.upload(editImageFile.value);
					fileId = Number((uploadRes === null || uploadRes === void 0 || (_uploadRes$data = uploadRes.data) === null || _uploadRes$data === void 0 ? void 0 : _uploadRes$data.id) || 0) || null;
					imageUrl = fileId ? `/api/file/info/download/${fileId}` : imageUrl;
				}
				const payload = {
					category: editExtra.category || (isHonorType.value ? "月度销冠" : "公司动态"),
					summary: editExtra.summary,
					detail: editForm.content,
					imageUrl,
					fileId,
					eventDate: editExtra.eventDate,
					personName: editExtra.personName,
					roleName: editExtra.roleName
				};
				return _objectSpread2(_objectSpread2({}, editForm), {}, {
					icon: payload.category,
					content: JSON.stringify(payload)
				});
			});
			return function buildEditPayload() {
				return _ref15.apply(this, arguments);
			};
		}();
		const reloadContentByType = function() {
			var _ref16 = _asyncToGenerator(function* (type) {
				if (type === "policy") return loadPolicy();
				if (type === "culture") return loadCulture();
				if (type === "culture_news") return loadCultureNews();
				if (type === "honor") return loadHonor();
				if (type === "feedback") return loadFeedback();
			});
			return function reloadContentByType(_x7) {
				return _ref16.apply(this, arguments);
			};
		}();
		const submitEdit = function() {
			var _ref18 = _asyncToGenerator(function* () {
				var _editFormRef$value;
				yield (_editFormRef$value = editFormRef.value) === null || _editFormRef$value === void 0 ? void 0 : _editFormRef$value.validate(function() {
					var _ref17 = _asyncToGenerator(function* (valid) {
						if (!valid) return;
						editSaving.value = true;
						try {
							const payload = yield buildEditPayload();
							yield contentApi.save(payload);
							ElMessage.success(editForm.id ? "已更新" : "已新增");
							editVisible.value = false;
							yield reloadContentByType(editForm.type);
						} catch (e) {} finally {
							editSaving.value = false;
						}
					});
					return function(_x8) {
						return _ref17.apply(this, arguments);
					};
				}());
			});
			return function submitEdit() {
				return _ref18.apply(this, arguments);
			};
		}();
		const removeContent = function() {
			var _ref19 = _asyncToGenerator(function* (row, type) {
				const raw = (row === null || row === void 0 ? void 0 : row.raw) || row;
				if (!(raw === null || raw === void 0 ? void 0 : raw.id)) return;
				try {
					yield ElMessageBox.confirm(`确定删除「${raw.title}」吗？`, "删除确认", {
						type: "warning",
						confirmButtonText: "删除",
						cancelButtonText: "取消"
					});
				} catch (_unused7) {
					return;
				}
				try {
					yield contentApi.remove(raw.id);
					ElMessage.success("已删除");
					yield reloadContentByType(type);
				} catch (e) {}
			});
			return function removeContent(_x9, _x10) {
				return _ref19.apply(this, arguments);
			};
		}();
		onMounted(() => {
			loadStructure();
			loadEmployees();
			loadPolicy();
			loadCulture();
			loadCultureNews();
			loadHonor();
			loadFeedback();
		});
		return (_ctx, _cache) => {
			const _component_el_tab_pane = ElTabPane;
			const _component_el_segmented = ElSegmented;
			const _component_el_input = ElInput;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_form_item = ElFormItem;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_checkbox_group = ElCheckboxGroup;
			const _component_el_form = ElForm;
			const _component_el_empty = ElEmpty;
			const _component_el_card = ElCard;
			const _component_el_tabs = ElTabs;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_upload = ElUpload;
			const _component_el_input_number = ElInputNumber;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("section", _hoisted_2, [_cache[30] || (_cache[30] = createBaseVNode("div", { class: "culture-hero-text" }, [
					createBaseVNode("span", { class: "culture-hero-eyebrow" }, "ZHEHANG · 浙杭人文"),
					createBaseVNode("h1", null, "浙杭人文 携手并肩"),
					createBaseVNode("p", null, "以人为本，凝聚同心。员工风采、企业文化、行政制度，构建有温度、有效率、能打硬仗的浙杭团队。")
				], -1)), createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", null, [createBaseVNode("b", null, toDisplayString(heroStats.value.deptCount), 1), _cache[27] || (_cache[27] = createBaseVNode("span", null, "部门数", -1))]),
					createBaseVNode("div", null, [createBaseVNode("b", null, toDisplayString(heroStats.value.memberCount), 1), _cache[28] || (_cache[28] = createBaseVNode("span", null, "在册人数", -1))]),
					createBaseVNode("div", null, [createBaseVNode("b", null, toDisplayString(heroStats.value.activeCount), 1), _cache[29] || (_cache[29] = createBaseVNode("span", null, "在职人数", -1))])
				])]),
				createVNode(_component_el_tabs, {
					modelValue: activeTab.value,
					"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => activeTab.value = $event),
					class: "culture-tabs"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							name: "staff",
							lazy: ""
						}, {
							label: withCtx(() => [..._cache[31] || (_cache[31] = [createBaseVNode("span", { class: "culture-tab-label" }, "员工风采", -1)])]),
							default: withCtx(() => [createVNode(contacts_default, { embedded: true })]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, { name: "care" }, {
							label: withCtx(() => [..._cache[32] || (_cache[32] = [createBaseVNode("span", { class: "culture-tab-label" }, "员工关怀", -1)])]),
							default: withCtx(() => [
								createBaseVNode("div", _hoisted_4, [_cache[33] || (_cache[33] = createBaseVNode("div", null, [createBaseVNode("h2", null, "员工关怀"), createBaseVNode("p", null, "生日提醒、入职周年自动关联员工档案，行政和管理层可以按今天、本周、本月提前准备关怀动作。")], -1)), createVNode(_component_el_segmented, {
									modelValue: careType.value,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => careType.value = $event),
									options: careTypeOptions
								}, null, 8, ["modelValue"])]),
								createBaseVNode("div", _hoisted_5, [(openBlock(true), createElementBlock(Fragment, null, renderList(careStats.value, (item) => {
									return openBlock(), createElementBlock("article", {
										key: item.label,
										class: "care-stat-card"
									}, [createBaseVNode("span", null, toDisplayString(item.label), 1), createBaseVNode("strong", null, toDisplayString(item.value), 1)]);
								}), 128))]),
								createBaseVNode("div", _hoisted_6, [createVNode(_component_el_input, {
									modelValue: careKeyword.value,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => careKeyword.value = $event),
									clearable: "",
									"prefix-icon": unref(search_default),
									placeholder: "搜索姓名、部门、岗位"
								}, null, 8, ["modelValue", "prefix-icon"]), createVNode(_component_el_button, {
									plain: "",
									onClick: exportCareList
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(download_default))]),
										_: 1
									}), _cache[34] || (_cache[34] = createTextVNode("导出名单 ", -1))]),
									_: 1
								})]),
								withDirectives((openBlock(), createBlock(_component_el_table, {
									data: filteredCareItems.value,
									class: "care-table",
									"empty-text": "暂无符合条件的员工"
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											prop: "name",
											label: "姓名",
											"min-width": "150"
										}, {
											default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_7, [createBaseVNode("span", _hoisted_8, toDisplayString(avatarText(row.name)), 1), createBaseVNode("div", null, [createBaseVNode("b", null, toDisplayString(row.name), 1), createBaseVNode("small", null, toDisplayString(row.postName || "未设岗位"), 1)])])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											prop: "deptName",
											label: "部门",
											"min-width": "150"
										}),
										createVNode(_component_el_table_column, {
											prop: "sourceDate",
											label: careType.value === "birthday" ? "出生日期" : "入职日期",
											width: "130"
										}, null, 8, ["label"]),
										createVNode(_component_el_table_column, {
											prop: "monthText",
											label: careType.value === "birthday" ? "生日月份" : "周年月份",
											width: "110"
										}, null, 8, ["label"]),
										createVNode(_component_el_table_column, {
											prop: "nextDateText",
											label: "最近日期",
											width: "130"
										}),
										createVNode(_component_el_table_column, {
											prop: "daysText",
											label: "提醒",
											"min-width": "150"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_tag, {
												type: row.daysUntil === 0 ? "danger" : row.daysUntil <= 7 ? "warning" : "info",
												effect: "plain"
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(row.daysText), 1)]),
												_: 2
											}, 1032, ["type"])]),
											_: 1
										}),
										careType.value === "anniversary" ? (openBlock(), createBlock(_component_el_table_column, {
											key: 0,
											prop: "yearsText",
											label: "入职周年",
											width: "120"
										})) : createCommentVNode("", true),
										createVNode(_component_el_table_column, {
											label: "建议动作",
											"min-width": "180"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.action), 1)]),
											_: 1
										})
									]),
									_: 1
								}, 8, ["data"])), [[_directive_loading, employeeLoading.value]])
							]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, { name: "feedback" }, {
							label: withCtx(() => [..._cache[35] || (_cache[35] = [createBaseVNode("span", { class: "culture-tab-label" }, "员工意见箱", -1)])]),
							default: withCtx(() => [createBaseVNode("div", _hoisted_9, [_cache[36] || (_cache[36] = createBaseVNode("div", null, [createBaseVNode("h2", null, "员工意见箱"), createBaseVNode("p", null, "支持匿名建议、投诉与管理建议。员工侧只负责提交，管理侧负责回复和闭环。")], -1)), createVNode(_component_el_tag, {
								type: pendingFeedbackCount.value ? "warning" : "success",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(" 待回复 " + toDisplayString(pendingFeedbackCount.value), 1)]),
								_: 1
							}, 8, ["type"])]), createBaseVNode("div", _hoisted_10, [createBaseVNode("section", _hoisted_11, [_cache[40] || (_cache[40] = createBaseVNode("h3", null, "提交建议", -1)), createVNode(_component_el_form, {
								ref_key: "feedbackFormRef",
								ref: feedbackFormRef,
								model: feedbackForm,
								rules: feedbackRules,
								"label-position": "top"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_form_item, {
										label: "类型",
										prop: "category"
									}, {
										default: withCtx(() => [createVNode(_component_el_radio_group, {
											modelValue: feedbackForm.category,
											"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => feedbackForm.category = $event)
										}, {
											default: withCtx(() => [
												createVNode(_component_el_radio_button, { label: "建议" }),
												createVNode(_component_el_radio_button, { label: "投诉" }),
												createVNode(_component_el_radio_button, { label: "制度优化" })
											]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, {
										label: "标题",
										prop: "title"
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: feedbackForm.title,
											"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => feedbackForm.title = $event),
											maxlength: "60",
											"show-word-limit": "",
											placeholder: "一句话说明问题"
										}, null, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, {
										label: "内容",
										prop: "content"
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: feedbackForm.content,
											"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => feedbackForm.content = $event),
											type: "textarea",
											rows: 5,
											maxlength: "800",
											"show-word-limit": "",
											placeholder: "请说明具体场景、影响和建议方案"
										}, null, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "抄送人员选择" }, {
										default: withCtx(() => [createVNode(_component_el_checkbox_group, {
											modelValue: feedbackForm.ccTargets,
											"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => feedbackForm.ccTargets = $event),
											class: "feedback-cc-group"
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(feedbackCcOptions, (item) => {
												return createVNode(_component_el_checkbox, {
													key: item.value,
													label: item.value
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(item.label), 1)]),
													_: 2
												}, 1032, ["label"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"]), _cache[37] || (_cache[37] = createBaseVNode("div", { class: "feedback-field-tip" }, "选择后会随意见一起记录，方便管理层按角色跟进。", -1))]),
										_: 1
									}),
									createVNode(_component_el_checkbox, {
										modelValue: feedbackForm.anonymous,
										"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => feedbackForm.anonymous = $event)
									}, {
										default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("匿名展示给管理层", -1)])]),
										_: 1
									}, 8, ["modelValue"]),
									createBaseVNode("div", _hoisted_12, [createVNode(_component_el_button, {
										type: "primary",
										loading: feedbackSaving.value,
										onClick: submitFeedback
									}, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(chat_dot_round_default))]),
											_: 1
										}), _cache[39] || (_cache[39] = createTextVNode("提交意见 ", -1))]),
										_: 1
									}, 8, ["loading"])])
								]),
								_: 1
							}, 8, ["model"])]), createBaseVNode("section", _hoisted_13, [createBaseVNode("div", _hoisted_14, [_cache[42] || (_cache[42] = createBaseVNode("h3", null, "闭环记录", -1)), createVNode(_component_el_tag, {
								type: "info",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("管理层可见详情", -1)])]),
								_: 1
							})]), withDirectives((openBlock(), createElementBlock("div", _hoisted_15, [(openBlock(true), createElementBlock(Fragment, null, renderList(feedbackItems.value, (item) => {
								return openBlock(), createElementBlock("article", {
									key: item.id,
									class: "feedback-item"
								}, [
									createBaseVNode("div", _hoisted_16, [createBaseVNode("div", null, [createVNode(_component_el_tag, {
										size: "small",
										type: item.category === "投诉" ? "danger" : item.category === "制度优化" ? "warning" : "primary",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(item.category), 1)]),
										_: 2
									}, 1032, ["type"]), createBaseVNode("strong", null, toDisplayString(item.title), 1)]), createVNode(_component_el_tag, {
										size: "small",
										type: item.reply ? "success" : "warning",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(item.reply ? "已回复" : "待回复"), 1)]),
										_: 2
									}, 1032, ["type"])]),
									createBaseVNode("p", null, toDisplayString(canManage.value ? item.content : "已提交，管理层会在此闭环回复。"), 1),
									createBaseVNode("div", _hoisted_17, [
										createBaseVNode("span", null, toDisplayString(item.anonymous ? "匿名" : "实名"), 1),
										createBaseVNode("span", null, toDisplayString(item.createTime || "刚刚"), 1),
										canManage.value && item.ccLabels.length ? (openBlock(), createElementBlock("span", _hoisted_18, "抄送：" + toDisplayString(item.ccLabels.join("、")), 1)) : createCommentVNode("", true)
									]),
									item.reply ? (openBlock(), createElementBlock("div", _hoisted_19, [_cache[43] || (_cache[43] = createBaseVNode("b", null, "管理回复：", -1)), createTextVNode(toDisplayString(item.reply), 1)])) : createCommentVNode("", true),
									canManage.value ? (openBlock(), createElementBlock("div", _hoisted_20, [createVNode(_component_el_button, {
										link: "",
										type: "primary",
										onClick: ($event) => replyFeedback(item)
									}, {
										default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("登记回复", -1)])]),
										_: 1
									}, 8, ["onClick"]), createVNode(_component_el_button, {
										link: "",
										type: "danger",
										onClick: ($event) => removeContent(item.raw, "feedback")
									}, {
										default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("删除", -1)])]),
										_: 1
									}, 8, ["onClick"])])) : createCommentVNode("", true)
								]);
							}), 128)), !feedbackLoading.value && !feedbackItems.value.length ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "暂无意见记录",
								"image-size": 72
							})) : createCommentVNode("", true)])), [[_directive_loading, feedbackLoading.value]])])])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, { name: "value" }, {
							label: withCtx(() => [..._cache[46] || (_cache[46] = [createBaseVNode("span", { class: "culture-tab-label" }, "企业文化", -1)])]),
							default: withCtx(() => [createBaseVNode("div", _hoisted_21, [_cache[49] || (_cache[49] = createBaseVNode("div", null, [createBaseVNode("h2", null, "企业文化"), createBaseVNode("p", null, "使命、愿景、价值观，是浙杭人共同的语言与行动准则。")], -1)), canManage.value ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								type: "primary",
								plain: "",
								onClick: _cache[7] || (_cache[7] = ($event) => openEdit("culture"))
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(plus_default))]),
									_: 1
								}), _cache[47] || (_cache[47] = createTextVNode("新增文化内容 ", -1))]),
								_: 1
							})) : (openBlock(), createBlock(_component_el_tag, {
								key: 1,
								type: "info",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("如需调整请联系管理员", -1)])]),
								_: 1
							}))]), withDirectives((openBlock(), createElementBlock("div", null, [
								createBaseVNode("div", _hoisted_22, [(openBlock(true), createElementBlock(Fragment, null, renderList(mvvList.value, (item, idx) => {
									return openBlock(), createElementBlock("div", {
										key: item.id,
										class: normalizeClass(["culture-mvv-card", mvvClass(idx)])
									}, [
										createBaseVNode("span", _hoisted_23, toDisplayString(item.title), 1),
										createBaseVNode("p", _hoisted_24, toDisplayString(item.body), 1),
										canManage.value ? (openBlock(), createElementBlock("div", _hoisted_25, [createVNode(_component_el_button, {
											link: "",
											size: "small",
											onClick: ($event) => openEdit("culture", item)
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(edit_pen_default))]),
												_: 1
											}), _cache[50] || (_cache[50] = createTextVNode("编辑 ", -1))]),
											_: 1
										}, 8, ["onClick"]), createVNode(_component_el_button, {
											link: "",
											size: "small",
											onClick: ($event) => removeContent(item, "culture")
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(delete_default))]),
												_: 1
											}), _cache[51] || (_cache[51] = createTextVNode("删除 ", -1))]),
											_: 1
										}, 8, ["onClick"])])) : createCommentVNode("", true)
									], 2);
								}), 128))]),
								createBaseVNode("div", _hoisted_26, [(openBlock(true), createElementBlock(Fragment, null, renderList(coreValues.value, (value) => {
									return openBlock(), createElementBlock("div", {
										key: value.id,
										class: "culture-value-card"
									}, [
										createBaseVNode("span", _hoisted_27, toDisplayString(value.icon), 1),
										createBaseVNode("strong", null, toDisplayString(value.title), 1),
										createBaseVNode("p", null, toDisplayString(value.desc), 1),
										canManage.value ? (openBlock(), createElementBlock("div", _hoisted_28, [createVNode(_component_el_button, {
											link: "",
											type: "primary",
											size: "small",
											onClick: ($event) => openEdit("culture", value)
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(edit_pen_default))]),
												_: 1
											}), _cache[52] || (_cache[52] = createTextVNode("编辑 ", -1))]),
											_: 1
										}, 8, ["onClick"]), createVNode(_component_el_button, {
											link: "",
											type: "danger",
											size: "small",
											onClick: ($event) => removeContent(value, "culture")
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(delete_default))]),
												_: 1
											}), _cache[53] || (_cache[53] = createTextVNode("删除 ", -1))]),
											_: 1
										}, 8, ["onClick"])])) : createCommentVNode("", true)
									]);
								}), 128))]),
								createBaseVNode("section", _hoisted_29, [createBaseVNode("div", _hoisted_30, [createBaseVNode("div", null, [createBaseVNode("h3", null, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(picture_default))]),
									_: 1
								}), _cache[54] || (_cache[54] = createTextVNode("文化动态", -1))]), _cache[55] || (_cache[55] = createBaseVNode("p", null, "公司动态、团建活动、节日福利、员工表彰公告统一发布，员工进来就能看到公司最近发生了什么。", -1))]), createBaseVNode("div", _hoisted_31, [createVNode(_component_el_segmented, {
									modelValue: cultureNewsFilter.value,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => cultureNewsFilter.value = $event),
									options: cultureNewsFilterOptions
								}, null, 8, ["modelValue"]), canManage.value ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									type: "primary",
									plain: "",
									onClick: _cache[9] || (_cache[9] = ($event) => openEdit("culture_news"))
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(plus_default))]),
										_: 1
									}), _cache[56] || (_cache[56] = createTextVNode("新增动态 ", -1))]),
									_: 1
								})) : createCommentVNode("", true)])]), withDirectives((openBlock(), createElementBlock("div", _hoisted_32, [(openBlock(true), createElementBlock(Fragment, null, renderList(filteredCultureNews.value, (item) => {
									return openBlock(), createElementBlock("article", {
										key: item.id,
										class: "culture-news-card"
									}, [createBaseVNode("div", { class: normalizeClass(["culture-news-cover", { empty: !item.imageUrl }]) }, [item.imageUrl ? (openBlock(), createElementBlock("img", {
										key: 0,
										src: item.imageUrl,
										alt: item.title
									}, null, 8, _hoisted_33)) : (openBlock(), createBlock(_component_el_icon, { key: 1 }, {
										default: withCtx(() => [createVNode(unref(picture_default))]),
										_: 1
									})), createVNode(_component_el_tag, {
										class: "culture-news-tag",
										effect: "dark",
										size: "small"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(item.category), 1)]),
										_: 2
									}, 1024)], 2), createBaseVNode("div", _hoisted_34, [
										createBaseVNode("span", null, toDisplayString(item.eventDate || "近期"), 1),
										createBaseVNode("strong", null, toDisplayString(item.title), 1),
										createBaseVNode("p", null, toDisplayString(item.summary || item.detail), 1),
										canManage.value ? (openBlock(), createElementBlock("div", _hoisted_35, [createVNode(_component_el_button, {
											link: "",
											type: "primary",
											size: "small",
											onClick: ($event) => openEdit("culture_news", item)
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(edit_pen_default))]),
												_: 1
											}), _cache[57] || (_cache[57] = createTextVNode("编辑 ", -1))]),
											_: 1
										}, 8, ["onClick"]), createVNode(_component_el_button, {
											link: "",
											type: "danger",
											size: "small",
											onClick: ($event) => removeContent(item, "culture_news")
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(delete_default))]),
												_: 1
											}), _cache[58] || (_cache[58] = createTextVNode("删除 ", -1))]),
											_: 1
										}, 8, ["onClick"])])) : createCommentVNode("", true)
									])]);
								}), 128)), !cultureNewsLoading.value && !filteredCultureNews.value.length ? (openBlock(), createBlock(_component_el_empty, {
									key: 0,
									description: "暂无文化动态，管理员可点击右上角新增",
									"image-size": 72
								})) : createCommentVNode("", true)])), [[_directive_loading, cultureNewsLoading.value]])]),
								createBaseVNode("section", _hoisted_36, [createBaseVNode("div", _hoisted_37, [createBaseVNode("div", null, [createBaseVNode("h3", null, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(medal_default))]),
									_: 1
								}), _cache[59] || (_cache[59] = createTextVNode("荣誉墙", -1))]), _cache[60] || (_cache[60] = createBaseVNode("p", null, "员工照片、活动照片、月度销冠、优秀会计、服务之星在这里公示，让好表现被看见。", -1))]), canManage.value ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									type: "primary",
									plain: "",
									onClick: _cache[10] || (_cache[10] = ($event) => openEdit("honor"))
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(plus_default))]),
										_: 1
									}), _cache[61] || (_cache[61] = createTextVNode("上传荣誉 ", -1))]),
									_: 1
								})) : createCommentVNode("", true)]), withDirectives((openBlock(), createElementBlock("div", _hoisted_38, [(openBlock(true), createElementBlock(Fragment, null, renderList(honorWallList.value, (item) => {
									return openBlock(), createElementBlock("article", {
										key: item.id,
										class: "honor-wall-card"
									}, [createBaseVNode("div", { class: normalizeClass(["honor-photo", { empty: !item.imageUrl }]) }, [item.imageUrl ? (openBlock(), createElementBlock("img", {
										key: 0,
										src: item.imageUrl,
										alt: item.title
									}, null, 8, _hoisted_39)) : (openBlock(), createElementBlock("span", _hoisted_40, toDisplayString(item.personName ? item.personName.slice(0, 1) : item.title.slice(0, 1)), 1))], 2), createBaseVNode("div", _hoisted_41, [
										createVNode(_component_el_tag, {
											size: "small",
											type: "warning",
											effect: "plain"
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(item.category), 1)]),
											_: 2
										}, 1024),
										createBaseVNode("strong", null, toDisplayString(item.title), 1),
										item.personName ? (openBlock(), createElementBlock("p", _hoisted_42, [createTextVNode(toDisplayString(item.personName), 1), item.roleName ? (openBlock(), createElementBlock("span", _hoisted_43, " · " + toDisplayString(item.roleName), 1)) : createCommentVNode("", true)])) : createCommentVNode("", true),
										createBaseVNode("p", null, toDisplayString(item.summary || item.detail), 1),
										createBaseVNode("small", null, toDisplayString(item.eventDate || "持续公示"), 1),
										canManage.value ? (openBlock(), createElementBlock("div", _hoisted_44, [createVNode(_component_el_button, {
											link: "",
											type: "primary",
											size: "small",
											onClick: ($event) => openEdit("honor", item)
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(edit_pen_default))]),
												_: 1
											}), _cache[62] || (_cache[62] = createTextVNode("编辑 ", -1))]),
											_: 1
										}, 8, ["onClick"]), createVNode(_component_el_button, {
											link: "",
											type: "danger",
											size: "small",
											onClick: ($event) => removeContent(item, "honor")
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(delete_default))]),
												_: 1
											}), _cache[63] || (_cache[63] = createTextVNode("删除 ", -1))]),
											_: 1
										}, 8, ["onClick"])])) : createCommentVNode("", true)
									])]);
								}), 128)), !honorLoading.value && !honorWallList.value.length ? (openBlock(), createBlock(_component_el_empty, {
									key: 0,
									description: "暂无荣誉内容，管理员可上传员工/活动照片",
									"image-size": 72
								})) : createCommentVNode("", true)])), [[_directive_loading, honorLoading.value]])]),
								!cultureLoading.value && !mvvList.value.length && !coreValues.value.length ? (openBlock(), createBlock(_component_el_empty, {
									key: 0,
									description: "暂无企业文化内容，请点击右上角新增",
									"image-size": 80
								})) : createCommentVNode("", true)
							])), [[_directive_loading, cultureLoading.value]])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, { name: "policy" }, {
							label: withCtx(() => [..._cache[64] || (_cache[64] = [createBaseVNode("span", { class: "culture-tab-label" }, "行政制度", -1)])]),
							default: withCtx(() => [createBaseVNode("div", _hoisted_45, [_cache[67] || (_cache[67] = createBaseVNode("div", null, [createBaseVNode("h2", null, "行政制度"), createBaseVNode("p", null, "制度即承诺，规范即效率。以下为公司核心管理制度纲要，详细条款以正式发布的制度文件为准。")], -1)), canManage.value ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								type: "primary",
								plain: "",
								onClick: _cache[11] || (_cache[11] = ($event) => openEdit("policy"))
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(plus_default))]),
									_: 1
								}), _cache[65] || (_cache[65] = createTextVNode("新增制度 ", -1))]),
								_: 1
							})) : (openBlock(), createBlock(_component_el_tag, {
								key: 1,
								type: "info",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[66] || (_cache[66] = [createTextVNode("如需调整请联系管理员", -1)])]),
								_: 1
							}))]), withDirectives((openBlock(), createElementBlock("div", _hoisted_46, [(openBlock(true), createElementBlock(Fragment, null, renderList(policyList.value, (item) => {
								return openBlock(), createBlock(_component_el_card, {
									key: item.id,
									shadow: "hover",
									class: "culture-policy-card"
								}, {
									default: withCtx(() => [
										createBaseVNode("div", _hoisted_47, [
											createBaseVNode("span", {
												class: "culture-policy-icon",
												style: normalizeStyle({ background: item.color })
											}, toDisplayString(item.icon), 5),
											createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(item.title), 1)]),
											canManage.value ? (openBlock(), createElementBlock("div", _hoisted_48, [createVNode(_component_el_button, {
												link: "",
												type: "primary",
												size: "small",
												onClick: ($event) => openEdit("policy", item)
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(edit_pen_default))]),
													_: 1
												}), _cache[68] || (_cache[68] = createTextVNode("编辑 ", -1))]),
												_: 1
											}, 8, ["onClick"]), createVNode(_component_el_button, {
												link: "",
												type: "danger",
												size: "small",
												onClick: ($event) => removeContent(item, "policy")
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(delete_default))]),
													_: 1
												}), _cache[69] || (_cache[69] = createTextVNode("删除 ", -1))]),
												_: 1
											}, 8, ["onClick"])])) : createCommentVNode("", true)
										]),
										createBaseVNode("ul", { class: normalizeClass(["culture-policy-points", { collapsed: isPolicyCollapsed(item) }]) }, [(openBlock(true), createElementBlock(Fragment, null, renderList(item.points, (point, idx) => {
											return openBlock(), createElementBlock("li", { key: idx }, toDisplayString(point), 1);
										}), 128))], 2),
										item.points.length > 5 ? (openBlock(), createBlock(_component_el_button, {
											key: 0,
											class: "culture-policy-toggle",
											link: "",
											type: "primary",
											onClick: ($event) => togglePolicy(item.id)
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(policyExpanded.value.has(item.id) ? "收起内容" : "展开全部"), 1)]),
											_: 2
										}, 1032, ["onClick"])) : createCommentVNode("", true),
										item.attachments.length ? (openBlock(), createElementBlock("div", _hoisted_49, [(openBlock(true), createElementBlock(Fragment, null, renderList(item.attachments, (file) => {
											return openBlock(), createElementBlock("button", {
												key: policyFileKey(file),
												type: "button",
												onClick: ($event) => downloadPolicyFile(file)
											}, [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(download_default))]),
												_: 1
											}), createBaseVNode("span", null, toDisplayString(file.name), 1)], 8, _hoisted_50);
										}), 128))])) : createCommentVNode("", true)
									]),
									_: 2
								}, 1024);
							}), 128)), !policyLoading.value && !policyList.value.length ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "暂无行政制度，请点击右上角新增",
								"image-size": 80
							})) : createCommentVNode("", true)])), [[_directive_loading, policyLoading.value]])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: editVisible.value,
					"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => editVisible.value = $event),
					title: editTitle.value,
					width: "680px",
					"close-on-click-modal": false,
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[25] || (_cache[25] = ($event) => editVisible.value = false) }, {
						default: withCtx(() => [..._cache[74] || (_cache[74] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: editSaving.value,
						onClick: submitEdit
					}, {
						default: withCtx(() => [..._cache[75] || (_cache[75] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "editFormRef",
						ref: editFormRef,
						model: editForm,
						rules: editRules,
						"label-width": "84px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "标题",
								prop: "title"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: editForm.title,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => editForm.title = $event),
									maxlength: "128",
									"show-word-limit": "",
									placeholder: editTitlePlaceholder.value
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}),
							!isRichCultureType.value ? (openBlock(), createBlock(_component_el_form_item, {
								key: 0,
								label: "图标"
							}, {
								default: withCtx(() => [createVNode(IconPicker_default, {
									modelValue: editForm.icon,
									"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => editForm.icon = $event),
									options: cultureIconOptions,
									maxlength: 16
								}, null, 8, ["modelValue"])]),
								_: 1
							})) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
								createVNode(_component_el_form_item, { label: "分类" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: editExtra.category,
										"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => editExtra.category = $event),
										placeholder: "请选择分类",
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(activeCategoryOptions.value, (item) => {
											return openBlock(), createBlock(_component_el_option, {
												key: item.value,
												label: item.label,
												value: item.value
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								isHonorType.value ? (openBlock(), createBlock(_component_el_form_item, {
									key: 0,
									label: "对象"
								}, {
									default: withCtx(() => [createBaseVNode("div", _hoisted_51, [createVNode(_component_el_input, {
										modelValue: editExtra.personName,
										"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => editExtra.personName = $event),
										maxlength: "40",
										placeholder: "员工姓名 / 团队名称"
									}, null, 8, ["modelValue"]), createVNode(_component_el_input, {
										modelValue: editExtra.roleName,
										"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => editExtra.roleName = $event),
										maxlength: "40",
										placeholder: "岗位 / 荣誉身份"
									}, null, 8, ["modelValue"])])]),
									_: 1
								})) : createCommentVNode("", true),
								createVNode(_component_el_form_item, { label: "日期" }, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: editExtra.eventDate,
										"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => editExtra.eventDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										placeholder: "选择发布日期/获奖月份",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "封面照片" }, {
									default: withCtx(() => [createBaseVNode("div", _hoisted_52, [
										createVNode(_component_el_upload, {
											"file-list": editUploadFiles.value,
											"onUpdate:fileList": _cache[19] || (_cache[19] = ($event) => editUploadFiles.value = $event),
											action: "#",
											"list-type": "picture-card",
											"auto-upload": false,
											accept: "image/*",
											limit: 1,
											"on-change": handleEditImageChange,
											"on-remove": handleEditImageRemove,
											"on-exceed": handleEditImageExceed
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(upload_filled_default))]),
												_: 1
											})]),
											_: 1
										}, 8, ["file-list"]),
										createVNode(_component_el_input, {
											modelValue: editExtra.imageUrl,
											"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => editExtra.imageUrl = $event),
											placeholder: "也可以粘贴图片链接，如 https://..."
										}, null, 8, ["modelValue"]),
										_cache[70] || (_cache[70] = createBaseVNode("span", { class: "culture-form-hint" }, "选择图片会先上传到文件管理；粘贴外部链接也可以。", -1))
									])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "摘要" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: editExtra.summary,
										"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => editExtra.summary = $event),
										maxlength: "160",
										"show-word-limit": "",
										placeholder: "一句话概括，展示在卡片上"
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							], 64)),
							createVNode(_component_el_form_item, {
								label: "内容",
								prop: "content"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: editForm.content,
									"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => editForm.content = $event),
									type: "textarea",
									rows: isRichCultureType.value ? 4 : 6,
									maxlength: isRichCultureType.value ? 800 : 2e3,
									"show-word-limit": "",
									placeholder: editContentPlaceholder.value
								}, null, 8, [
									"modelValue",
									"rows",
									"maxlength",
									"placeholder"
								])]),
								_: 1
							}),
							editForm.type === "policy" ? (openBlock(), createBlock(_component_el_form_item, {
								key: 2,
								label: "附件"
							}, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_53, [
									createVNode(_component_el_button, {
										icon: unref(upload_filled_default),
										loading: policyFileUploading.value,
										onClick: _cache[23] || (_cache[23] = ($event) => {
											var _policyFileInput$valu;
											return (_policyFileInput$valu = policyFileInput.value) === null || _policyFileInput$valu === void 0 ? void 0 : _policyFileInput$valu.click();
										})
									}, {
										default: withCtx(() => [..._cache[71] || (_cache[71] = [createTextVNode("上传图片/附件", -1)])]),
										_: 1
									}, 8, ["icon", "loading"]),
									_cache[72] || (_cache[72] = createBaseVNode("span", { class: "culture-form-hint" }, "支持图片、PDF、Office 等制度附件", -1)),
									createBaseVNode("input", {
										ref_key: "policyFileInput",
										ref: policyFileInput,
										type: "file",
										multiple: "",
										style: { "display": "none" },
										onChange: handlePolicyFilePick
									}, null, 544),
									editPolicyFiles.value.length ? (openBlock(), createElementBlock("div", _hoisted_54, [(openBlock(true), createElementBlock(Fragment, null, renderList(editPolicyFiles.value, (file, idx) => {
										return openBlock(), createBlock(_component_el_tag, {
											key: policyFileKey(file),
											closable: "",
											onClose: ($event) => editPolicyFiles.value.splice(idx, 1)
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(file.name), 1)]),
											_: 2
										}, 1032, ["onClose"]);
									}), 128))])) : createCommentVNode("", true)
								])]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_form_item, { label: "排序" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: editForm.sortOrder,
									"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => editForm.sortOrder = $event),
									min: 0,
									max: 9999,
									"controls-position": "right"
								}, null, 8, ["modelValue"]), _cache[73] || (_cache[73] = createBaseVNode("span", { class: "culture-form-hint" }, "数字越小越靠前", -1))]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-e78a5ba6"]]);
//#endregion
export { culture_default as default };
