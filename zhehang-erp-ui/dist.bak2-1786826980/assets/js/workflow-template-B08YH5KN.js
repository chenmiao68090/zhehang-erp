import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, h as _objectWithoutProperties, it as createTextVNode, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, D as ElPagination, F as ElEmpty, I as ElDropdown, L as ElDropdownItem, M as ElInputNumber, R as ElDropdownMenu, Tn as more_filled_default, V as ElDialog, Xt as delete_default, _t as ElFormItem, a as ElMessageBox, c as ElSegmented, d as ElTree, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rn as files_default, rt as ElSelect, s as vLoading, u as ElTreeSelect, v as ElSwitch, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as feigeTaskLocalDemo, t as feigeTaskData } from "./data-source-DRu8uYHw.js";
/* empty css                */
//#region src/views/task-workbench/components/WorkflowTemplateFormDialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "two-cols" };
var _hoisted_2$1 = { class: "metric-editor" };
var _hoisted_3$1 = { class: "metric-head" };
//#endregion
//#region src/views/task-workbench/components/WorkflowTemplateFormDialog.vue
var WorkflowTemplateFormDialog_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "WorkflowTemplateFormDialog",
	props: { roles: {} },
	emits: ["save"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props, emit = __emit;
		const visible = ref(false), saving = ref(false), formRef = ref(), treeProps = {
			label: "name",
			children: "children",
			value: "id"
		};
		const form = reactive({
			id: void 0,
			roleId: void 0,
			cycleType: "day",
			taskName: "",
			completionStandard: "",
			workContent: "",
			sortNo: 0,
			enabled: true,
			metrics: []
		});
		const rules = {
			roleId: [{
				required: true,
				message: "请选择角色"
			}],
			cycleType: [{ required: true }],
			taskName: [{
				required: true,
				message: "请输入任务名称"
			}],
			completionStandard: [{
				required: true,
				message: "请输入完成标准"
			}]
		};
		function open(row) {
			var _row$enabled;
			Object.assign(form, {
				id: row === null || row === void 0 ? void 0 : row.id,
				roleId: row === null || row === void 0 ? void 0 : row.roleId,
				cycleType: (row === null || row === void 0 ? void 0 : row.cycleType) || "day",
				taskName: (row === null || row === void 0 ? void 0 : row.taskName) || "",
				completionStandard: (row === null || row === void 0 ? void 0 : row.completionStandard) || "",
				workContent: (row === null || row === void 0 ? void 0 : row.workContent) || "",
				sortNo: (row === null || row === void 0 ? void 0 : row.sortNo) || 0,
				enabled: (_row$enabled = row === null || row === void 0 ? void 0 : row.enabled) !== null && _row$enabled !== void 0 ? _row$enabled : true,
				metrics: ((row === null || row === void 0 ? void 0 : row.metrics) || []).map((m) => _objectSpread2({}, m))
			});
			visible.value = true;
		}
		function addMetric() {
			form.metrics.push({
				code: "",
				label: "",
				fieldType: "number",
				unit: "",
				required: true
			});
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				var _formRef$value;
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate())) return;
				const codes = /* @__PURE__ */ new Set();
				for (const m of form.metrics) {
					m.code = String(m.code || "").trim();
					m.label = String(m.label || "").trim();
					if (!m.code || !m.label) return ElMessage.warning("请补全量化字段的名称和编码");
					if (!/^[a-z][a-z0-9_]{0,39}$/.test(m.code)) return ElMessage.warning("字段编码必须以小写字母开头，且只能包含小写字母、数字和下划线");
					if (codes.has(m.code)) return ElMessage.warning(`字段编码 ${m.code} 重复`);
					codes.add(m.code);
				}
				const role = findRole(props.roles, form.roleId);
				const payload = _objectSpread2(_objectSpread2({}, form), {}, {
					roleName: role === null || role === void 0 ? void 0 : role.name,
					metrics: form.metrics.map((m) => _objectSpread2(_objectSpread2({}, m), {}, { fieldType: "number" }))
				});
				delete payload.id;
				emit("save", payload, form.id);
			});
			return _submit.apply(this, arguments);
		}
		function findRole(nodes, id) {
			for (const n of nodes) {
				if (n.id === id) return n;
				const f = findRole(n.children || [], id);
				if (f) return f;
			}
		}
		function setSaving(v, close = false) {
			saving.value = v;
			if (close) visible.value = false;
		}
		__expose({
			open,
			setSaving
		});
		return (_ctx, _cache) => {
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input = ElInput;
			const _component_el_input_number = ElInputNumber;
			const _component_el_switch = ElSwitch;
			const _component_el_button = ElButton;
			const _component_el_empty = ElEmpty;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			return openBlock(), createBlock(_component_el_dialog, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => visible.value = $event),
				title: form.id ? "编辑计划模板" : "新增计划模板",
				width: "720px",
				"destroy-on-close": ""
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[7] || (_cache[7] = ($event) => visible.value = false) }, {
					default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("取消", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					loading: saving.value,
					onClick: submit
				}, {
					default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("保存模板", -1)])]),
					_: 1
				}, 8, ["loading"])]),
				default: withCtx(() => [createVNode(_component_el_form, {
					ref_key: "formRef",
					ref: formRef,
					model: form,
					rules,
					"label-width": "100px"
				}, {
					default: withCtx(() => [
						createBaseVNode("div", _hoisted_1$1, [
							createVNode(_component_el_form_item, {
								label: "适用角色",
								prop: "roleId"
							}, {
								default: withCtx(() => [createVNode(_component_el_tree_select, {
									modelValue: form.roleId,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.roleId = $event),
									data: __props.roles,
									"node-key": "id",
									props: treeProps,
									"check-strictly": ""
								}, null, 8, ["modelValue", "data"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "任务周期",
								prop: "cycleType"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.cycleType,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.cycleType = $event)
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "每日",
											value: "day"
										}),
										createVNode(_component_el_option, {
											label: "每周",
											value: "week"
										}),
										createVNode(_component_el_option, {
											label: "每月",
											value: "month"
										})
									]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "任务名称",
								prop: "taskName"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.taskName,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.taskName = $event),
									maxlength: "100"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "排序" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.sortNo,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.sortNo = $event),
									min: 0,
									max: 999
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						createVNode(_component_el_form_item, { label: "工作内容" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.workContent,
								"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.workContent = $event),
								type: "textarea",
								rows: 2,
								maxlength: "500",
								"show-word-limit": ""
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, {
							label: "完成标准",
							prop: "completionStandard"
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.completionStandard,
								"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.completionStandard = $event),
								type: "textarea",
								rows: 2,
								maxlength: "500",
								"show-word-limit": ""
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "是否启用" }, {
							default: withCtx(() => [createVNode(_component_el_switch, {
								modelValue: form.enabled,
								"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.enabled = $event)
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createBaseVNode("section", _hoisted_2$1, [
							createBaseVNode("div", _hoisted_3$1, [_cache[10] || (_cache[10] = createBaseVNode("div", null, [createBaseVNode("h3", null, "动态量化字段"), createBaseVNode("p", null, "只用于可量化结果，不承载任意脚本或动态表单。")], -1)), createVNode(_component_el_button, {
								type: "primary",
								plain: "",
								onClick: addMetric
							}, {
								default: withCtx(() => [..._cache[9] || (_cache[9] = [createTextVNode("添加指标", -1)])]),
								_: 1
							})]),
							form.metrics.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "暂无量化字段",
								"image-size": 60
							})) : createCommentVNode("", true),
							(openBlock(true), createElementBlock(Fragment, null, renderList(form.metrics, (metric, index) => {
								return openBlock(), createElementBlock("div", {
									key: index,
									class: "metric-row"
								}, [
									createVNode(_component_el_input, {
										modelValue: metric.label,
										"onUpdate:modelValue": ($event) => metric.label = $event,
										placeholder: "指标名称，如有效跟进"
									}, null, 8, ["modelValue", "onUpdate:modelValue"]),
									createVNode(_component_el_input, {
										modelValue: metric.code,
										"onUpdate:modelValue": ($event) => metric.code = $event,
										placeholder: "字段编码，如 follow_count"
									}, null, 8, ["modelValue", "onUpdate:modelValue"]),
									createVNode(_component_el_input, {
										modelValue: metric.unit,
										"onUpdate:modelValue": ($event) => metric.unit = $event,
										placeholder: "单位"
									}, null, 8, ["modelValue", "onUpdate:modelValue"]),
									createVNode(_component_el_checkbox, {
										modelValue: metric.required,
										"onUpdate:modelValue": ($event) => metric.required = $event
									}, {
										default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("必填", -1)])]),
										_: 1
									}, 8, ["modelValue", "onUpdate:modelValue"]),
									createVNode(_component_el_button, {
										text: "",
										type: "danger",
										icon: unref(delete_default),
										onClick: ($event) => form.metrics.splice(index, 1)
									}, null, 8, ["icon", "onClick"])
								]);
							}), 128))
						])
					]),
					_: 1
				}, 8, ["model"])]),
				_: 1
			}, 8, ["modelValue", "title"]);
		};
	}
}), [["__scopeId", "data-v-5aa9ef12"]]);
//#endregion
//#region src/views/task-workbench/workflow-template.vue?vue&type=script&setup=true&lang.ts
var _excluded = ["id"];
var _hoisted_1 = { class: "task-workbench task-workbench-page template-page" };
var _hoisted_2 = { class: "page-head page-heading" };
var _hoisted_3 = { class: "page-title" };
var _hoisted_4 = { class: "eyebrow" };
var _hoisted_5 = { class: "heading-actions" };
var _hoisted_6 = { class: "template-layout" };
var _hoisted_7 = { class: "role-panel" };
var _hoisted_8 = { class: "template-main" };
var _hoisted_9 = { class: "toolbar-card" };
var _hoisted_10 = { class: "template-grid" };
var _hoisted_11 = { class: "card-head" };
var _hoisted_12 = { class: "standard" };
var _hoisted_13 = { class: "role-line" };
var _hoisted_14 = {
	key: 0,
	class: "metric-tags"
};
var _hoisted_15 = {
	key: 1,
	class: "pagination-bar"
};
//#endregion
//#region src/views/task-workbench/workflow-template.vue
var workflow_template_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "workflow-template",
	setup(__props) {
		const roles = ref([]), templates = ref([]), total = ref(0), loading = ref(false), errorText = ref(""), manager = ref(false), roleKeyword = ref(""), roleTreeRef = ref(), formRef = ref();
		const query = reactive({
			roleId: void 0,
			cycleType: "",
			enabled: void 0,
			pageNum: 1,
			pageSize: 12
		}), treeProps = {
			label: "name",
			children: "children"
		}, cycleOptions = [
			{
				label: "全部",
				value: ""
			},
			{
				label: "每日",
				value: "day"
			},
			{
				label: "每周",
				value: "week"
			},
			{
				label: "每月",
				value: "month"
			}
		];
		function unwrap(v) {
			var _ref, _v$data$data, _v$data;
			return (_ref = (_v$data$data = v === null || v === void 0 || (_v$data = v.data) === null || _v$data === void 0 ? void 0 : _v$data.data) !== null && _v$data$data !== void 0 ? _v$data$data : v === null || v === void 0 ? void 0 : v.data) !== null && _ref !== void 0 ? _ref : v;
		}
		watch(roleKeyword, (v) => {
			var _roleTreeRef$value;
			return (_roleTreeRef$value = roleTreeRef.value) === null || _roleTreeRef$value === void 0 ? void 0 : _roleTreeRef$value.filter(v);
		});
		function loadRoles() {
			return _loadRoles.apply(this, arguments);
		}
		function _loadRoles() {
			_loadRoles = _asyncToGenerator(function* () {
				try {
					roles.value = unwrap(yield feigeTaskData.roleTree()) || [];
				} catch (_unused) {
					roles.value = [];
				}
			});
			return _loadRoles.apply(this, arguments);
		}
		function loadCapabilities() {
			return _loadCapabilities.apply(this, arguments);
		}
		function _loadCapabilities() {
			_loadCapabilities = _asyncToGenerator(function* () {
				try {
					var _await$feigeTaskData$;
					manager.value = Boolean((_await$feigeTaskData$ = yield feigeTaskData.capabilities()) === null || _await$feigeTaskData$ === void 0 ? void 0 : _await$feigeTaskData$.manager);
				} catch (_unused2) {
					manager.value = false;
				}
			});
			return _loadCapabilities.apply(this, arguments);
		}
		function loadTemplates() {
			return _loadTemplates.apply(this, arguments);
		}
		function _loadTemplates() {
			_loadTemplates = _asyncToGenerator(function* () {
				loading.value = true;
				errorText.value = "";
				try {
					const r = unwrap(yield feigeTaskData.templates(_objectSpread2({}, query)));
					templates.value = (r === null || r === void 0 ? void 0 : r.records) || [];
					total.value = Number((r === null || r === void 0 ? void 0 : r.total) || 0);
				} catch (_unused3) {
					templates.value = [];
					total.value = 0;
					errorText.value = "模板加载失败，生产环境不会回退到本地演示内容。";
				} finally {
					loading.value = false;
				}
			});
			return _loadTemplates.apply(this, arguments);
		}
		function searchTemplates() {
			query.pageNum = 1;
			loadTemplates();
		}
		function selectRole(node) {
			query.roleId = node.id;
			searchTemplates();
		}
		function clearRole() {
			var _roleTreeRef$value2;
			query.roleId = void 0;
			(_roleTreeRef$value2 = roleTreeRef.value) === null || _roleTreeRef$value2 === void 0 || _roleTreeRef$value2.setCurrentKey(null);
			searchTemplates();
		}
		function filterRole(v, d) {
			return !v || d.name.includes(v);
		}
		function saveTemplate(_x, _x2) {
			return _saveTemplate.apply(this, arguments);
		}
		function _saveTemplate() {
			_saveTemplate = _asyncToGenerator(function* (p, id) {
				var _formRef$value;
				(_formRef$value = formRef.value) === null || _formRef$value === void 0 || _formRef$value.setSaving(true);
				try {
					var _formRef$value2;
					id ? yield feigeTaskData.updateTemplate(id, p) : yield feigeTaskData.createTemplate(p);
					(_formRef$value2 = formRef.value) === null || _formRef$value2 === void 0 || _formRef$value2.setSaving(false, true);
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：预览模板已更新" : "模板已保存");
					yield loadTemplates();
				} catch (_unused4) {
					var _formRef$value3;
					(_formRef$value3 = formRef.value) === null || _formRef$value3 === void 0 || _formRef$value3.setSaving(false);
					ElMessage.error("模板保存失败");
				}
			});
			return _saveTemplate.apply(this, arguments);
		}
		function toggle(_x3) {
			return _toggle.apply(this, arguments);
		}
		function _toggle() {
			_toggle = _asyncToGenerator(function* (t) {
				const { id } = t, payload = _objectWithoutProperties(t, _excluded);
				try {
					yield feigeTaskData.updateTemplate(id, _objectSpread2(_objectSpread2({}, payload), {}, { enabled: !t.enabled }));
					ElMessage.success(feigeTaskLocalDemo() ? `LOCAL-DEMO：模板已${t.enabled ? "停用" : "启用"}` : `模板已${t.enabled ? "停用" : "启用"}`);
					yield loadTemplates();
				} catch (_unused5) {
					ElMessage.error("模板状态更新失败");
				}
			});
			return _toggle.apply(this, arguments);
		}
		function remove(_x4) {
			return _remove.apply(this, arguments);
		}
		function _remove() {
			_remove = _asyncToGenerator(function* (t) {
				try {
					yield ElMessageBox.confirm("删除后不影响已生成的历史任务，确认继续？", "删除模板", { type: "warning" });
				} catch (_unused6) {
					return;
				}
				try {
					yield feigeTaskData.deleteTemplate(t.id);
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：预览模板已删除" : "已删除");
					yield loadTemplates();
				} catch (_unused7) {
					ElMessage.error("删除失败");
				}
			});
			return _remove.apply(this, arguments);
		}
		function cycleText(v) {
			return {
				day: "每日",
				week: "每周",
				month: "每月"
			}[v] || v;
		}
		function cycleTag(v) {
			return v === "day" ? "primary" : v === "week" ? "success" : "warning";
		}
		onMounted(() => {
			loadCapabilities();
			loadRoles();
			loadTemplates();
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_tree = ElTree;
			const _component_el_segmented = ElSegmented;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_empty = ElEmpty;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(files_default))]),
						_: 1
					}), _cache[6] || (_cache[6] = createTextVNode(" 任务工单 · 标准化", -1))]),
					_cache[7] || (_cache[7] = createBaseVNode("h2", null, "计划模板", -1)),
					_cache[8] || (_cache[8] = createBaseVNode("p", null, "主管按角色配置日、周、月固定任务；量化字段必须有明确名称、编码和单位。", -1))
				]), createBaseVNode("div", _hoisted_5, [unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_tag, {
					key: 0,
					type: "warning",
					size: "large",
					effect: "dark"
				}, {
					default: withCtx(() => [..._cache[9] || (_cache[9] = [createTextVNode("LOCAL-DEMO 演示数据", -1)])]),
					_: 1
				})) : createCommentVNode("", true), manager.value ? (openBlock(), createBlock(_component_el_button, {
					key: 1,
					type: "primary",
					disabled: !roles.value.length,
					onClick: _cache[0] || (_cache[0] = ($event) => {
						var _formRef$value4;
						return (_formRef$value4 = formRef.value) === null || _formRef$value4 === void 0 ? void 0 : _formRef$value4.open();
					})
				}, {
					default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("新增模板", -1)])]),
					_: 1
				}, 8, ["disabled"])) : createCommentVNode("", true)])]),
				!manager.value && !unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					title: "当前账号为只读视图，只有主管、老板或管理员可以维护计划模板。",
					type: "info",
					"show-icon": "",
					closable: false
				})) : createCommentVNode("", true),
				manager.value && !roles.value.length ? (openBlock(), createBlock(_component_el_alert, {
					key: 1,
					title: "系统暂无可用角色，暂不能新增计划模板",
					description: "请先在系统角色管理中配置并启用角色；模板直接复用系统角色，不在本页另建。",
					type: "warning",
					"show-icon": "",
					closable: false
				})) : createCommentVNode("", true),
				errorText.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 2,
					title: errorText.value,
					type: "error",
					"show-icon": "",
					closable: false
				}, null, 8, ["title"])) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_6, [createBaseVNode("aside", _hoisted_7, [
					_cache[12] || (_cache[12] = createBaseVNode("h3", null, "适用角色", -1)),
					createVNode(_component_el_input, {
						modelValue: roleKeyword.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => roleKeyword.value = $event),
						clearable: "",
						placeholder: "搜索角色"
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_tree, {
						ref_key: "roleTreeRef",
						ref: roleTreeRef,
						data: roles.value,
						"node-key": "id",
						props: treeProps,
						"filter-node-method": filterRole,
						"default-expand-all": "",
						"highlight-current": "",
						onNodeClick: selectRole
					}, null, 8, ["data"]),
					createVNode(_component_el_button, {
						text: "",
						onClick: clearRole
					}, {
						default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("查看全部模板", -1)])]),
						_: 1
					})
				]), createBaseVNode("main", _hoisted_8, [
					createBaseVNode("section", _hoisted_9, [
						createVNode(_component_el_segmented, {
							modelValue: query.cycleType,
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => query.cycleType = $event),
							options: cycleOptions,
							onChange: searchTemplates
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: query.enabled,
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => query.enabled = $event),
							clearable: "",
							placeholder: "全部状态",
							onChange: searchTemplates
						}, {
							default: withCtx(() => [createVNode(_component_el_option, {
								label: "启用",
								value: true
							}), createVNode(_component_el_option, {
								label: "停用",
								value: false
							})]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_button, {
							loading: loading.value,
							onClick: loadTemplates
						}, {
							default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("刷新", -1)])]),
							_: 1
						}, 8, ["loading"])
					]),
					!loading.value && templates.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
						key: 0,
						description: manager.value && roles.value.length ? "当前范围没有计划模板，可点击右上角新增" : "当前范围没有计划模板"
					}, null, 8, ["description"])) : createCommentVNode("", true),
					withDirectives((openBlock(), createElementBlock("section", _hoisted_10, [(openBlock(true), createElementBlock(Fragment, null, renderList(templates.value, (tpl) => {
						var _tpl$metrics;
						return openBlock(), createElementBlock("article", {
							key: tpl.id,
							class: "template-card"
						}, [
							createBaseVNode("div", _hoisted_11, [createBaseVNode("div", null, [createVNode(_component_el_tag, { type: cycleTag(tpl.cycleType) }, {
								default: withCtx(() => [createTextVNode(toDisplayString(cycleText(tpl.cycleType)), 1)]),
								_: 2
							}, 1032, ["type"]), createVNode(_component_el_tag, {
								type: tpl.enabled ? "success" : "info",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(tpl.enabled ? "启用" : "停用"), 1)]),
								_: 2
							}, 1032, ["type"])]), manager.value ? (openBlock(), createBlock(_component_el_dropdown, { key: 0 }, {
								dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
									default: withCtx(() => [
										createVNode(_component_el_dropdown_item, { onClick: ($event) => {
											var _formRef$value5;
											return (_formRef$value5 = formRef.value) === null || _formRef$value5 === void 0 ? void 0 : _formRef$value5.open(tpl);
										} }, {
											default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("编辑", -1)])]),
											_: 1
										}, 8, ["onClick"]),
										createVNode(_component_el_dropdown_item, { onClick: ($event) => toggle(tpl) }, {
											default: withCtx(() => [createTextVNode(toDisplayString(tpl.enabled ? "停用" : "启用"), 1)]),
											_: 2
										}, 1032, ["onClick"]),
										createVNode(_component_el_dropdown_item, {
											divided: "",
											onClick: ($event) => remove(tpl)
										}, {
											default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("删除", -1)])]),
											_: 1
										}, 8, ["onClick"])
									]),
									_: 2
								}, 1024)]),
								default: withCtx(() => [createVNode(_component_el_button, {
									text: "",
									icon: unref(more_filled_default)
								}, null, 8, ["icon"])]),
								_: 2
							}, 1024)) : createCommentVNode("", true)]),
							createBaseVNode("h3", null, toDisplayString(tpl.taskName), 1),
							createBaseVNode("p", null, toDisplayString(tpl.workContent || "未填写工作内容"), 1),
							createBaseVNode("div", _hoisted_12, [_cache[16] || (_cache[16] = createBaseVNode("b", null, "完成标准", -1)), createTextVNode(toDisplayString(tpl.completionStandard || "-"), 1)]),
							createBaseVNode("div", _hoisted_13, [createBaseVNode("span", null, toDisplayString(tpl.roleName || "未设置角色"), 1), createBaseVNode("em", null, "排序 " + toDisplayString(tpl.sortNo || 0), 1)]),
							((_tpl$metrics = tpl.metrics) === null || _tpl$metrics === void 0 ? void 0 : _tpl$metrics.length) ? (openBlock(), createElementBlock("div", _hoisted_14, [_cache[17] || (_cache[17] = createBaseVNode("span", null, "量化字段", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(tpl.metrics, (m) => {
								return openBlock(), createBlock(_component_el_tag, {
									key: m.code,
									size: "small",
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(m.label) + toDisplayString(m.unit ? `（${m.unit}）` : "") + toDisplayString(m.required ? " *" : ""), 1)]),
									_: 2
								}, 1024);
							}), 128))])) : createCommentVNode("", true)
						]);
					}), 128))])), [[_directive_loading, loading.value]]),
					total.value > query.pageSize ? (openBlock(), createElementBlock("div", _hoisted_15, [createVNode(_component_el_pagination, {
						"current-page": query.pageNum,
						"onUpdate:currentPage": _cache[4] || (_cache[4] = ($event) => query.pageNum = $event),
						"page-size": query.pageSize,
						"onUpdate:pageSize": _cache[5] || (_cache[5] = ($event) => query.pageSize = $event),
						total: total.value,
						"page-sizes": [
							12,
							24,
							48
						],
						layout: "total, sizes, prev, pager, next",
						onCurrentChange: loadTemplates,
						onSizeChange: searchTemplates
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])) : createCommentVNode("", true)
				])]),
				createVNode(WorkflowTemplateFormDialog_default, {
					ref_key: "formRef",
					ref: formRef,
					roles: roles.value,
					onSave: saveTemplate
				}, null, 8, ["roles"])
			]);
		};
	}
}), [["__scopeId", "data-v-2c12414e"]]);
//#endregion
export { workflow_template_default as default };
