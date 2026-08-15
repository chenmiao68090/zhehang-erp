import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, gt as nextTick, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, F as ElEmpty, I as ElDropdown, L as ElDropdownItem, M as ElInputNumber, R as ElDropdownMenu, T as ElProgress, Tn as more_filled_default, V as ElDialog, W as ElDatePicker, _t as ElFormItem, a as ElMessageBox, bt as aim_default, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, u as ElTreeSelect, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as feigeTaskLocalDemo, t as feigeTaskData } from "./data-source.production-DbokqIsz.js";
/* empty css                */
//#region src/views/task-workbench/components/GoalFormDialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "form-grid" };
var _hoisted_2$1 = { class: "plan-section" };
var _hoisted_3$1 = { class: "section-heading" };
var _hoisted_4$1 = { class: "plan-heading" };
var _hoisted_5$1 = { class: "plan-summary" };
var _hoisted_6$1 = { class: "plan-fields" };
var _hoisted_7$1 = { class: "wide-field" };
var _hoisted_8$1 = { class: "full-field" };
var _hoisted_9$1 = { class: "owner-heading" };
var _hoisted_10$1 = {
	key: 1,
	class: "owner-table"
};
//#endregion
//#region src/views/task-workbench/components/GoalFormDialog.vue
var GoalFormDialog_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "GoalFormDialog",
	props: {
		roles: {},
		staff: {}
	},
	emits: ["save"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = ref(false);
		const saving = ref(false);
		const formRef = ref();
		const treeProps = {
			label: "name",
			children: "children",
			value: "id"
		};
		const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
		let draftSequence = 0;
		const form = reactive({
			id: void 0,
			title: "",
			roleId: void 0,
			year: currentYear,
			cycleType: "month",
			periodKey: `${currentYear}-01`,
			metricName: "",
			targetValue: 0,
			actualValue: 0,
			unit: "",
			status: "draft",
			description: "",
			plans: []
		});
		const rules = {
			title: [{
				required: true,
				message: "请输入目标名称"
			}],
			roleId: [{
				required: true,
				message: "请选择适用角色"
			}],
			year: [{ required: true }],
			cycleType: [{ required: true }],
			periodKey: [{ required: true }],
			metricName: [{
				required: true,
				message: "请输入指标名称"
			}],
			targetValue: [{
				required: true,
				message: "请输入目标值"
			}]
		};
		const periodOptions = computed(() => {
			if (form.cycleType === "month") return Array.from({ length: 12 }, (_, index) => ({
				label: `${index + 1}月`,
				value: `${form.year}-${String(index + 1).padStart(2, "0")}`
			}));
			if (form.cycleType === "quarter") return Array.from({ length: 4 }, (_, index) => ({
				label: `第${index + 1}季度`,
				value: `${form.year}-Q${index + 1}`
			}));
			if (form.cycleType === "half_year") return [{
				label: "上半年",
				value: `${form.year}-H1`
			}, {
				label: "下半年",
				value: `${form.year}-H2`
			}];
			return [{
				label: `${form.year}年度`,
				value: String(form.year)
			}];
		});
		function draftKey(prefix) {
			draftSequence += 1;
			return `${prefix}-${draftSequence}`;
		}
		function clonePlans(plans = []) {
			return plans.map((plan) => ({
				id: plan.id,
				title: plan.title || "",
				description: plan.description || "",
				startDate: plan.startDate,
				endDate: plan.endDate,
				_key: draftKey("plan"),
				users: (plan.users || []).map((owner) => ({
					id: owner.id,
					userId: owner.userId,
					userName: owner.userName,
					targetValue: owner.targetValue,
					actualValue: owner.actualValue,
					_key: draftKey("owner")
				}))
			}));
		}
		function resetPeriod() {
			var _periodOptions$value$;
			form.periodKey = ((_periodOptions$value$ = periodOptions.value[0]) === null || _periodOptions$value$ === void 0 ? void 0 : _periodOptions$value$.value) || String(form.year);
		}
		function open(row) {
			var _row$year, _row$targetValue, _row$actualValue;
			Object.assign(form, {
				id: row === null || row === void 0 ? void 0 : row.id,
				title: (row === null || row === void 0 ? void 0 : row.title) || "",
				roleId: row === null || row === void 0 ? void 0 : row.roleId,
				year: (_row$year = row === null || row === void 0 ? void 0 : row.year) !== null && _row$year !== void 0 ? _row$year : currentYear,
				cycleType: (row === null || row === void 0 ? void 0 : row.cycleType) || "month",
				periodKey: (row === null || row === void 0 ? void 0 : row.periodKey) || `${currentYear}-01`,
				metricName: (row === null || row === void 0 ? void 0 : row.metricName) || "",
				targetValue: (_row$targetValue = row === null || row === void 0 ? void 0 : row.targetValue) !== null && _row$targetValue !== void 0 ? _row$targetValue : 0,
				actualValue: (_row$actualValue = row === null || row === void 0 ? void 0 : row.actualValue) !== null && _row$actualValue !== void 0 ? _row$actualValue : 0,
				unit: (row === null || row === void 0 ? void 0 : row.unit) || "",
				status: (row === null || row === void 0 ? void 0 : row.status) || "draft",
				description: (row === null || row === void 0 ? void 0 : row.description) || "",
				plans: clonePlans((row === null || row === void 0 ? void 0 : row.plans) || [])
			});
			visible.value = true;
			nextTick(() => {
				var _formRef$value;
				return (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.clearValidate();
			});
		}
		function addPlan() {
			form.plans.push({
				_key: draftKey("plan"),
				title: "",
				description: "",
				startDate: void 0,
				endDate: void 0,
				users: []
			});
		}
		function removePlan(index) {
			form.plans.splice(index, 1);
		}
		function addOwner(plan) {
			const firstAvailable = props.staff.find((person) => !plan.users.some((owner) => owner.userId === person.id));
			plan.users.push({
				_key: draftKey("owner"),
				userId: firstAvailable === null || firstAvailable === void 0 ? void 0 : firstAvailable.id,
				userName: firstAvailable === null || firstAvailable === void 0 ? void 0 : firstAvailable.name,
				targetValue: 0,
				actualValue: 0
			});
		}
		function syncOwnerName(owner) {
			var _props$staff$find;
			owner.userName = ((_props$staff$find = props.staff.find((person) => person.id === owner.userId)) === null || _props$staff$find === void 0 ? void 0 : _props$staff$find.name) || owner.userName;
		}
		function ownerSelected(plan, staffId, ownerKey) {
			return plan.users.some((owner) => owner._key !== ownerKey && owner.userId === staffId);
		}
		function selectedOwnerCount(plan) {
			return new Set(plan.users.map((owner) => owner.userId).filter((id) => typeof id === "number")).size;
		}
		function planTotal(plan, field) {
			return plan.users.reduce((sum, owner) => sum + Number(owner[field] || 0), 0);
		}
		function formatNumber(value) {
			return Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
		}
		function validatePlans() {
			for (let planIndex = 0; planIndex < form.plans.length; planIndex += 1) {
				const plan = form.plans[planIndex];
				if (!plan.title.trim()) {
					ElMessage.warning(`请填写计划 ${planIndex + 1} 的名称`);
					return false;
				}
				if (plan.startDate && plan.endDate && plan.startDate > plan.endDate) {
					ElMessage.warning(`计划 ${planIndex + 1} 的结束日期不能早于开始日期`);
					return false;
				}
				const selected = /* @__PURE__ */ new Set();
				for (const owner of plan.users) {
					if (!owner.userId) {
						ElMessage.warning(`请为计划 ${planIndex + 1} 选择责任人`);
						return false;
					}
					if (selected.has(owner.userId)) {
						ElMessage.warning(`计划 ${planIndex + 1} 中存在重复责任人`);
						return false;
					}
					selected.add(owner.userId);
				}
			}
			return true;
		}
		function findRole(nodes, id) {
			for (const node of nodes) {
				if (node.id === id) return node;
				const found = findRole(node.children || [], id);
				if (found) return found;
			}
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				var _formRef$value2;
				if (!(yield (_formRef$value2 = formRef.value) === null || _formRef$value2 === void 0 ? void 0 : _formRef$value2.validate()) || !validatePlans()) return;
				const role = findRole(props.roles, Number(form.roleId));
				const plans = form.plans.map((plan) => {
					var _plan$description;
					return {
						id: plan.id,
						title: plan.title.trim(),
						description: ((_plan$description = plan.description) === null || _plan$description === void 0 ? void 0 : _plan$description.trim()) || void 0,
						startDate: plan.startDate || void 0,
						endDate: plan.endDate || void 0,
						users: plan.users.map((owner) => {
							var _props$staff$find2;
							return {
								id: owner.id,
								userId: Number(owner.userId),
								userName: ((_props$staff$find2 = props.staff.find((person) => person.id === owner.userId)) === null || _props$staff$find2 === void 0 ? void 0 : _props$staff$find2.name) || owner.userName,
								targetValue: Number(owner.targetValue || 0),
								actualValue: Number(owner.actualValue || 0)
							};
						})
					};
				});
				emit("save", {
					roleId: form.roleId,
					roleName: role === null || role === void 0 ? void 0 : role.name,
					year: form.year,
					cycleType: form.cycleType,
					periodKey: form.periodKey,
					title: form.title.trim(),
					metricName: form.metricName.trim(),
					targetValue: Number(form.targetValue || 0),
					actualValue: Number(form.actualValue || 0),
					unit: form.unit.trim(),
					status: form.status,
					description: form.description.trim(),
					plans
				}, form.id);
			});
			return _submit.apply(this, arguments);
		}
		function setSaving(value, close = false) {
			saving.value = value;
			if (close) visible.value = false;
		}
		__expose({
			open,
			setSaving
		});
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_input_number = ElInputNumber;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_button = ElButton;
			const _component_el_empty = ElEmpty;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_alert = ElAlert;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			return openBlock(), createBlock(_component_el_dialog, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => visible.value = $event),
				title: form.id ? "编辑目标" : "新增目标",
				width: "min(980px, 94vw)",
				top: "5vh",
				"destroy-on-close": ""
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[10] || (_cache[10] = ($event) => visible.value = false) }, {
					default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("取消", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					loading: saving.value,
					onClick: submit
				}, {
					default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("保存目标", -1)])]),
					_: 1
				}, 8, ["loading"])]),
				default: withCtx(() => [createVNode(_component_el_form, {
					ref_key: "formRef",
					ref: formRef,
					model: form,
					rules,
					"label-width": "96px"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_form_item, {
							label: "目标名称",
							prop: "title"
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.title,
								"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.title = $event),
								maxlength: "100"
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createBaseVNode("div", _hoisted_1$1, [
							createVNode(_component_el_form_item, {
								label: "适用角色",
								prop: "roleId"
							}, {
								default: withCtx(() => [createVNode(_component_el_tree_select, {
									modelValue: form.roleId,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.roleId = $event),
									data: __props.roles,
									"node-key": "id",
									props: treeProps,
									"check-strictly": ""
								}, null, 8, ["modelValue", "data"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "目标年度",
								prop: "year"
							}, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.year,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.year = $event),
									min: 2020,
									max: 2100,
									onChange: resetPeriod
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "目标周期",
								prop: "cycleType"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.cycleType,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.cycleType = $event),
									onChange: resetPeriod
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "每月",
											value: "month"
										}),
										createVNode(_component_el_option, {
											label: "季度",
											value: "quarter"
										}),
										createVNode(_component_el_option, {
											label: "半年",
											value: "half_year"
										}),
										createVNode(_component_el_option, {
											label: "年度",
											value: "year"
										})
									]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "周期序号",
								prop: "periodKey"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.periodKey,
									"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.periodKey = $event)
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(periodOptions.value, (item) => {
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
							createVNode(_component_el_form_item, {
								label: "指标名称",
								prop: "metricName"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.metricName,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.metricName = $event),
									placeholder: "如：新签合同额"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "指标单位" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.unit,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.unit = $event),
									placeholder: "元、单、%、户"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "目标值",
								prop: "targetValue"
							}, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.targetValue,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.targetValue = $event),
									min: 0,
									precision: 2
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "当前实际" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.actualValue,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.actualValue = $event),
									min: 0,
									precision: 2
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						createVNode(_component_el_form_item, { label: "目标说明" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.description,
								"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.description = $event),
								type: "textarea",
								rows: 3,
								maxlength: "500",
								"show-word-limit": ""
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createBaseVNode("section", _hoisted_2$1, [
							createBaseVNode("div", _hoisted_3$1, [_cache[13] || (_cache[13] = createBaseVNode("div", null, [createBaseVNode("h3", null, "目标计划与责任人分解"), createBaseVNode("p", null, "先拆分执行计划，再为每个计划分配责任人及个人目标值。")], -1)), createVNode(_component_el_button, {
								type: "primary",
								plain: "",
								onClick: addPlan
							}, {
								default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("新增计划", -1)])]),
								_: 1
							})]),
							form.plans.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "暂未拆分执行计划",
								"image-size": 64
							})) : createCommentVNode("", true),
							(openBlock(true), createElementBlock(Fragment, null, renderList(form.plans, (plan, planIndex) => {
								return openBlock(), createElementBlock("article", {
									key: plan._key,
									class: "plan-card"
								}, [
									createBaseVNode("div", _hoisted_4$1, [createBaseVNode("strong", null, "计划 " + toDisplayString(planIndex + 1), 1), createBaseVNode("div", _hoisted_5$1, [
										createBaseVNode("span", null, toDisplayString(plan.users.length) + " 人负责", 1),
										createBaseVNode("span", null, "目标合计 " + toDisplayString(formatNumber(planTotal(plan, "targetValue"))) + toDisplayString(form.unit), 1),
										createBaseVNode("span", null, "实际合计 " + toDisplayString(formatNumber(planTotal(plan, "actualValue"))) + toDisplayString(form.unit), 1),
										createVNode(_component_el_button, {
											link: "",
											type: "danger",
											onClick: ($event) => removePlan(planIndex)
										}, {
											default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("删除计划", -1)])]),
											_: 1
										}, 8, ["onClick"])
									])]),
									createBaseVNode("div", _hoisted_6$1, [
										createBaseVNode("label", _hoisted_7$1, [_cache[15] || (_cache[15] = createBaseVNode("span", null, [createTextVNode("计划名称 "), createBaseVNode("b", null, "*")], -1)), createVNode(_component_el_input, {
											modelValue: plan.title,
											"onUpdate:modelValue": ($event) => plan.title = $event,
											maxlength: "100",
											placeholder: "如：高意向客户集中转化"
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										createBaseVNode("label", null, [_cache[16] || (_cache[16] = createBaseVNode("span", null, "开始日期", -1)), createVNode(_component_el_date_picker, {
											modelValue: plan.startDate,
											"onUpdate:modelValue": ($event) => plan.startDate = $event,
											type: "date",
											"value-format": "YYYY-MM-DD",
											clearable: ""
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										createBaseVNode("label", null, [_cache[17] || (_cache[17] = createBaseVNode("span", null, "结束日期", -1)), createVNode(_component_el_date_picker, {
											modelValue: plan.endDate,
											"onUpdate:modelValue": ($event) => plan.endDate = $event,
											type: "date",
											"value-format": "YYYY-MM-DD",
											clearable: ""
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										createBaseVNode("label", _hoisted_8$1, [_cache[18] || (_cache[18] = createBaseVNode("span", null, "计划说明", -1)), createVNode(_component_el_input, {
											modelValue: plan.description,
											"onUpdate:modelValue": ($event) => plan.description = $event,
											type: "textarea",
											rows: 2,
											maxlength: "300",
											"show-word-limit": ""
										}, null, 8, ["modelValue", "onUpdate:modelValue"])])
									]),
									createBaseVNode("div", _hoisted_9$1, [_cache[20] || (_cache[20] = createBaseVNode("div", null, [createBaseVNode("strong", null, "责任人分解"), createBaseVNode("small", null, "同一计划中不能重复选择员工")], -1)), createVNode(_component_el_button, {
										disabled: __props.staff.length === 0 || selectedOwnerCount(plan) >= __props.staff.length,
										onClick: ($event) => addOwner(plan)
									}, {
										default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("添加责任人", -1)])]),
										_: 1
									}, 8, ["disabled", "onClick"])]),
									__props.staff.length === 0 ? (openBlock(), createBlock(_component_el_alert, {
										key: 0,
										title: "暂未加载到可选员工，已有责任人仍会原样保留。",
										type: "warning",
										closable: false
									})) : createCommentVNode("", true),
									plan.users.length ? (openBlock(), createElementBlock("div", _hoisted_10$1, [_cache[22] || (_cache[22] = createBaseVNode("div", { class: "owner-table-head" }, [
										createBaseVNode("span", null, "责任人"),
										createBaseVNode("span", null, "个人目标值"),
										createBaseVNode("span", null, "个人实际值"),
										createBaseVNode("span", null, "操作")
									], -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(plan.users, (owner, ownerIndex) => {
										return openBlock(), createElementBlock("div", {
											key: owner._key,
											class: "owner-row"
										}, [
											createVNode(_component_el_select, {
												modelValue: owner.userId,
												"onUpdate:modelValue": ($event) => owner.userId = $event,
												filterable: "",
												placeholder: "选择系统员工",
												onChange: ($event) => syncOwnerName(owner)
											}, {
												default: withCtx(() => [owner.userId && !__props.staff.some((person) => person.id === owner.userId) ? (openBlock(), createBlock(_component_el_option, {
													key: 0,
													value: owner.userId,
													label: `${owner.userName || `员工${owner.userId}`} · 历史责任人`
												}, null, 8, ["value", "label"])) : createCommentVNode("", true), (openBlock(true), createElementBlock(Fragment, null, renderList(__props.staff, (person) => {
													return openBlock(), createBlock(_component_el_option, {
														key: person.id,
														value: person.id,
														label: `${person.name}${person.deptName ? ` · ${person.deptName}` : ""}`,
														disabled: ownerSelected(plan, person.id, owner._key)
													}, null, 8, [
														"value",
														"label",
														"disabled"
													]);
												}), 128))]),
												_: 2
											}, 1032, [
												"modelValue",
												"onUpdate:modelValue",
												"onChange"
											]),
											createVNode(_component_el_input_number, {
												modelValue: owner.targetValue,
												"onUpdate:modelValue": ($event) => owner.targetValue = $event,
												min: 0,
												precision: 2,
												"controls-position": "right"
											}, null, 8, ["modelValue", "onUpdate:modelValue"]),
											createVNode(_component_el_input_number, {
												modelValue: owner.actualValue,
												"onUpdate:modelValue": ($event) => owner.actualValue = $event,
												min: 0,
												precision: 2,
												"controls-position": "right"
											}, null, 8, ["modelValue", "onUpdate:modelValue"]),
											createVNode(_component_el_button, {
												link: "",
												type: "danger",
												onClick: ($event) => plan.users.splice(ownerIndex, 1)
											}, {
												default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("删除", -1)])]),
												_: 1
											}, 8, ["onClick"])
										]);
									}), 128))])) : createCommentVNode("", true)
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
}), [["__scopeId", "data-v-eb2249ee"]]);
//#endregion
//#region src/views/task-workbench/goal-setting.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "task-workbench task-workbench-page goal-page" };
var _hoisted_2 = { class: "page-head page-heading" };
var _hoisted_3 = { class: "page-title" };
var _hoisted_4 = { class: "eyebrow" };
var _hoisted_5 = { class: "heading-actions" };
var _hoisted_6 = { class: "toolbar-card" };
var _hoisted_7 = { class: "goal-grid" };
var _hoisted_8 = { class: "goal-head" };
var _hoisted_9 = { class: "goal-period" };
var _hoisted_10 = { class: "goal-numbers" };
var _hoisted_11 = {
	key: 0,
	class: "plan-list"
};
var _hoisted_12 = { key: 0 };
var _hoisted_13 = {
	key: 1,
	class: "completion-note"
};
var _hoisted_14 = {
	key: 3,
	class: "pagination-bar"
};
//#endregion
//#region src/views/task-workbench/goal-setting.vue
var goal_setting_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "goal-setting",
	setup(__props) {
		const currentYear = (/* @__PURE__ */ new Date()).getFullYear(), years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
		const query = reactive({
			year: currentYear,
			roleId: void 0,
			status: "",
			cycleType: "",
			pageNum: 1,
			pageSize: 12
		});
		const roles = ref([]), staff = ref([]), goals = ref([]), total = ref(0), loading = ref(false), errorText = ref(""), formRef = ref();
		const capabilities = ref({ manager: false }), capabilityLoaded = ref(false);
		const treeProps = {
			label: "name",
			children: "children",
			value: "id"
		};
		const statusOptions = [
			{
				label: "草稿",
				value: "draft"
			},
			{
				label: "进行中",
				value: "active"
			},
			{
				label: "已完成",
				value: "completed"
			},
			{
				label: "已归档",
				value: "archived"
			}
		];
		function unwrap(v) {
			var _ref, _v$data$data, _v$data;
			return (_ref = (_v$data$data = v === null || v === void 0 || (_v$data = v.data) === null || _v$data === void 0 ? void 0 : _v$data.data) !== null && _v$data$data !== void 0 ? _v$data$data : v === null || v === void 0 ? void 0 : v.data) !== null && _ref !== void 0 ? _ref : v;
		}
		function loadGoals() {
			return _loadGoals.apply(this, arguments);
		}
		function _loadGoals() {
			_loadGoals = _asyncToGenerator(function* () {
				loading.value = true;
				errorText.value = "";
				try {
					const result = unwrap(yield feigeTaskData.goals(_objectSpread2({}, query)));
					goals.value = (result === null || result === void 0 ? void 0 : result.records) || [];
					total.value = Number((result === null || result === void 0 ? void 0 : result.total) || 0);
				} catch (_unused) {
					goals.value = [];
					total.value = 0;
					errorText.value = "目标加载失败，生产环境不会使用LOCAL-DEMO数据兜底。";
				} finally {
					loading.value = false;
				}
			});
			return _loadGoals.apply(this, arguments);
		}
		function searchGoals() {
			query.pageNum = 1;
			loadGoals();
		}
		function loadRoles() {
			return _loadRoles.apply(this, arguments);
		}
		function _loadRoles() {
			_loadRoles = _asyncToGenerator(function* () {
				try {
					roles.value = unwrap(yield feigeTaskData.roleTree()) || [];
				} catch (_unused2) {
					roles.value = [];
				}
			});
			return _loadRoles.apply(this, arguments);
		}
		function loadStaff() {
			return _loadStaff.apply(this, arguments);
		}
		function _loadStaff() {
			_loadStaff = _asyncToGenerator(function* () {
				try {
					staff.value = unwrap(yield feigeTaskData.staffOptions()) || [];
				} catch (_unused3) {
					staff.value = [];
					ElMessage.error("责任人选项加载失败");
				}
			});
			return _loadStaff.apply(this, arguments);
		}
		function loadCapabilities() {
			return _loadCapabilities.apply(this, arguments);
		}
		function _loadCapabilities() {
			_loadCapabilities = _asyncToGenerator(function* () {
				try {
					capabilities.value = unwrap(yield feigeTaskData.capabilities()) || { manager: false };
					if (capabilities.value.manager) yield loadStaff();
				} catch (_unused4) {
					capabilities.value = { manager: false };
					ElMessage.warning("权限信息加载失败，目标页已切换为只读");
				} finally {
					capabilityLoaded.value = true;
				}
			});
			return _loadCapabilities.apply(this, arguments);
		}
		function saveGoal(_x, _x2) {
			return _saveGoal.apply(this, arguments);
		}
		function _saveGoal() {
			_saveGoal = _asyncToGenerator(function* (payload, id) {
				var _formRef$value;
				if (!capabilities.value.manager) return ElMessage.warning("当前账号仅可查看目标");
				(_formRef$value = formRef.value) === null || _formRef$value === void 0 || _formRef$value.setSaving(true);
				try {
					var _formRef$value2;
					id ? yield feigeTaskData.updateGoal(id, payload) : yield feigeTaskData.createGoal(payload);
					(_formRef$value2 = formRef.value) === null || _formRef$value2 === void 0 || _formRef$value2.setSaving(false, true);
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：预览目标已更新" : "目标已保存");
					yield loadGoals();
				} catch (_unused5) {
					var _formRef$value3;
					(_formRef$value3 = formRef.value) === null || _formRef$value3 === void 0 || _formRef$value3.setSaving(false);
					ElMessage.error("目标保存失败");
				}
			});
			return _saveGoal.apply(this, arguments);
		}
		function changeStatus(_x3, _x4) {
			return _changeStatus.apply(this, arguments);
		}
		function _changeStatus() {
			_changeStatus = _asyncToGenerator(function* (goal, status, payload = {}) {
				if (!capabilities.value.manager) return ElMessage.warning("当前账号仅可查看目标");
				try {
					yield feigeTaskData.changeGoalStatus(goal.id, status, payload);
					ElMessage.success("状态已更新");
					yield loadGoals();
				} catch (_unused6) {
					ElMessage.error("状态更新失败");
				}
			});
			return _changeStatus.apply(this, arguments);
		}
		function complete(_x5) {
			return _complete.apply(this, arguments);
		}
		function _complete() {
			_complete = _asyncToGenerator(function* (goal) {
				try {
					const { value } = yield ElMessageBox.prompt("填写目标完成说明", "完成目标", {
						inputType: "textarea",
						inputValidator: (v) => !!String(v || "").trim() || "完成说明不能为空"
					});
					yield changeStatus(goal, "completed", { completionNote: String(value).trim() });
				} catch (_unused7) {}
			});
			return _complete.apply(this, arguments);
		}
		function remove(_x6) {
			return _remove.apply(this, arguments);
		}
		function _remove() {
			_remove = _asyncToGenerator(function* (goal) {
				if (!capabilities.value.manager) return ElMessage.warning("当前账号仅可查看目标");
				if (!["draft", "archived"].includes(goal.status)) return ElMessage.warning("只有草稿或已归档目标可以删除");
				try {
					yield ElMessageBox.confirm(`确认删除此${goal.status === "draft" ? "草稿" : "已归档"}目标？`, "删除目标", { type: "warning" });
					yield feigeTaskData.deleteGoal(goal.id);
					ElMessage.success("已删除");
					yield loadGoals();
				} catch (_unused8) {}
			});
			return _remove.apply(this, arguments);
		}
		function progress(g) {
			return g.targetValue > 0 ? Math.min(100, Math.round((g.actualValue || 0) / g.targetValue * 100)) : 0;
		}
		function number(v) {
			return Number(v || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
		}
		function statusText(v) {
			var _statusOptions$find;
			return ((_statusOptions$find = statusOptions.find((x) => x.value === v)) === null || _statusOptions$find === void 0 ? void 0 : _statusOptions$find.label) || v;
		}
		function statusTag(v) {
			return v === "active" ? "primary" : v === "completed" ? "success" : v === "archived" ? "info" : "warning";
		}
		function cycleText(v) {
			return {
				month: "每月",
				quarter: "季度",
				half_year: "半年",
				year: "年度"
			}[v] || v;
		}
		function cycleTag(v) {
			return v === "month" ? "primary" : v === "quarter" ? "success" : v === "half_year" ? "warning" : "danger";
		}
		onMounted(() => {
			loadRoles();
			loadCapabilities();
			loadGoals();
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_empty = ElEmpty;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_progress = ElProgress;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(aim_default))]),
						_: 1
					}), _cache[7] || (_cache[7] = createTextVNode(" 任务工单 · 目标管理", -1))]),
					_cache[8] || (_cache[8] = createBaseVNode("h2", null, "目标设置", -1)),
					_cache[9] || (_cache[9] = createBaseVNode("p", null, "目标必须有口径、周期、责任角色和实际值来源，禁止用演示数字替代生产事实。", -1))
				]), createBaseVNode("div", _hoisted_5, [
					unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						type: "warning",
						size: "large",
						effect: "dark"
					}, {
						default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("LOCAL-DEMO 演示数据", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					capabilityLoaded.value && !capabilities.value.manager ? (openBlock(), createBlock(_component_el_tag, {
						key: 1,
						type: "info",
						size: "large"
					}, {
						default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("只读查看", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					capabilities.value.manager ? (openBlock(), createBlock(_component_el_button, {
						key: 2,
						type: "primary",
						disabled: !roles.value.length,
						onClick: _cache[0] || (_cache[0] = ($event) => {
							var _formRef$value4;
							return (_formRef$value4 = formRef.value) === null || _formRef$value4 === void 0 ? void 0 : _formRef$value4.open();
						})
					}, {
						default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("新增目标", -1)])]),
						_: 1
					}, 8, ["disabled"])) : createCommentVNode("", true)
				])]),
				errorText.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					title: errorText.value,
					type: "error",
					"show-icon": "",
					closable: false
				}, null, 8, ["title"])) : createCommentVNode("", true),
				capabilities.value.manager && !roles.value.length ? (openBlock(), createBlock(_component_el_alert, {
					key: 1,
					title: "系统暂无可用角色，暂不能新增目标",
					description: "请先在系统角色管理中配置并启用角色；目标直接复用系统角色。",
					type: "warning",
					"show-icon": "",
					closable: false
				})) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_6, [
					createVNode(_component_el_select, {
						modelValue: query.year,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => query.year = $event),
						onChange: searchGoals
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(years), (year) => {
							return openBlock(), createBlock(_component_el_option, {
								key: year,
								value: year,
								label: `${year}年`
							}, null, 8, ["value", "label"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_tree_select, {
						modelValue: query.roleId,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => query.roleId = $event),
						data: roles.value,
						"node-key": "id",
						props: treeProps,
						"check-strictly": "",
						clearable: "",
						placeholder: "全部角色",
						onChange: searchGoals
					}, null, 8, ["modelValue", "data"]),
					createVNode(_component_el_select, {
						modelValue: query.status,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => query.status = $event),
						clearable: "",
						placeholder: "全部状态",
						onChange: searchGoals
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(statusOptions, (item) => {
							return createVNode(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						loading: loading.value,
						onClick: loadGoals
					}, {
						default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["loading"])
				]),
				createVNode(_component_el_tabs, {
					modelValue: query.cycleType,
					"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => query.cycleType = $event),
					onTabChange: searchGoals
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							label: "全部",
							name: ""
						}),
						createVNode(_component_el_tab_pane, {
							label: "每月",
							name: "month"
						}),
						createVNode(_component_el_tab_pane, {
							label: "季度",
							name: "quarter"
						}),
						createVNode(_component_el_tab_pane, {
							label: "半年",
							name: "half_year"
						}),
						createVNode(_component_el_tab_pane, {
							label: "年度",
							name: "year"
						})
					]),
					_: 1
				}, 8, ["modelValue"]),
				!loading.value && goals.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
					key: 2,
					description: capabilities.value.manager && roles.value.length ? "暂无目标，可点击右上角新增" : "暂无目标"
				}, null, 8, ["description"])) : createCommentVNode("", true),
				withDirectives((openBlock(), createElementBlock("section", _hoisted_7, [(openBlock(true), createElementBlock(Fragment, null, renderList(goals.value, (goal) => {
					var _goal$plans;
					return openBlock(), createElementBlock("article", {
						key: goal.id,
						class: "goal-card"
					}, [
						createBaseVNode("div", _hoisted_8, [createBaseVNode("div", null, [createVNode(_component_el_tag, { type: cycleTag(goal.cycleType) }, {
							default: withCtx(() => [createTextVNode(toDisplayString(cycleText(goal.cycleType)), 1)]),
							_: 2
						}, 1032, ["type"]), createVNode(_component_el_tag, {
							type: statusTag(goal.status),
							effect: "plain"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(statusText(goal.status)), 1)]),
							_: 2
						}, 1032, ["type"])]), capabilities.value.manager ? (openBlock(), createBlock(_component_el_dropdown, {
							key: 0,
							trigger: "click"
						}, {
							dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
								default: withCtx(() => [
									createVNode(_component_el_dropdown_item, {
										disabled: !["draft", "active"].includes(goal.status),
										onClick: ($event) => {
											var _formRef$value5;
											return (_formRef$value5 = formRef.value) === null || _formRef$value5 === void 0 ? void 0 : _formRef$value5.open(goal);
										}
									}, {
										default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("编辑", -1)])]),
										_: 1
									}, 8, ["disabled", "onClick"]),
									goal.status === "draft" ? (openBlock(), createBlock(_component_el_dropdown_item, {
										key: 0,
										onClick: ($event) => changeStatus(goal, "active")
									}, {
										default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("启用", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									goal.status === "active" ? (openBlock(), createBlock(_component_el_dropdown_item, {
										key: 1,
										onClick: ($event) => complete(goal)
									}, {
										default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("完成", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									["active", "completed"].includes(goal.status) ? (openBlock(), createBlock(_component_el_dropdown_item, {
										key: 2,
										onClick: ($event) => changeStatus(goal, "archived")
									}, {
										default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("归档", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									createVNode(_component_el_dropdown_item, {
										divided: "",
										disabled: !["draft", "archived"].includes(goal.status),
										onClick: ($event) => remove(goal)
									}, {
										default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("删除", -1)])]),
										_: 1
									}, 8, ["disabled", "onClick"])
								]),
								_: 2
							}, 1024)]),
							default: withCtx(() => [createVNode(_component_el_button, {
								text: "",
								icon: unref(more_filled_default)
							}, null, 8, ["icon"])]),
							_: 2
						}, 1024)) : createCommentVNode("", true)]),
						createBaseVNode("h3", null, toDisplayString(goal.title), 1),
						createBaseVNode("p", null, toDisplayString(goal.description || "暂无说明"), 1),
						createBaseVNode("div", _hoisted_9, [createBaseVNode("span", null, toDisplayString(goal.roleName || "未设置角色"), 1), createBaseVNode("strong", null, toDisplayString(goal.periodKey), 1)]),
						createBaseVNode("div", _hoisted_10, [createBaseVNode("div", null, [_cache[19] || (_cache[19] = createBaseVNode("span", null, "目标", -1)), createBaseVNode("strong", null, toDisplayString(number(goal.targetValue)) + toDisplayString(goal.unit), 1)]), createBaseVNode("div", null, [_cache[20] || (_cache[20] = createBaseVNode("span", null, "实际", -1)), createBaseVNode("strong", null, toDisplayString(number(goal.actualValue || 0)) + toDisplayString(goal.unit), 1)])]),
						createVNode(_component_el_progress, {
							percentage: progress(goal),
							status: progress(goal) >= 100 ? "success" : void 0
						}, null, 8, ["percentage", "status"]),
						((_goal$plans = goal.plans) === null || _goal$plans === void 0 ? void 0 : _goal$plans.length) ? (openBlock(), createElementBlock("div", _hoisted_11, [_cache[21] || (_cache[21] = createBaseVNode("strong", null, "执行计划", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(goal.plans, (plan) => {
							var _plan$users, _plan$users2;
							return openBlock(), createElementBlock("div", {
								key: plan.id || plan.title,
								class: "plan-item"
							}, [
								createBaseVNode("span", null, toDisplayString(plan.title), 1),
								createBaseVNode("em", null, toDisplayString(((_plan$users = plan.users) === null || _plan$users === void 0 ? void 0 : _plan$users.length) || 0) + " 人负责", 1),
								((_plan$users2 = plan.users) === null || _plan$users2 === void 0 ? void 0 : _plan$users2.length) ? (openBlock(), createElementBlock("small", _hoisted_12, toDisplayString(plan.users.map((user) => `${user.userName || "未命名"} ${number(user.targetValue || 0)}${goal.unit || ""}`).join(" · ")), 1)) : createCommentVNode("", true)
							]);
						}), 128))])) : createCommentVNode("", true),
						goal.completionNote ? (openBlock(), createElementBlock("div", _hoisted_13, "完成说明：" + toDisplayString(goal.completionNote), 1)) : createCommentVNode("", true)
					]);
				}), 128))])), [[_directive_loading, loading.value]]),
				total.value > query.pageSize ? (openBlock(), createElementBlock("div", _hoisted_14, [createVNode(_component_el_pagination, {
					"current-page": query.pageNum,
					"onUpdate:currentPage": _cache[5] || (_cache[5] = ($event) => query.pageNum = $event),
					"page-size": query.pageSize,
					"onUpdate:pageSize": _cache[6] || (_cache[6] = ($event) => query.pageSize = $event),
					total: total.value,
					"page-sizes": [
						12,
						24,
						48
					],
					layout: "total, sizes, prev, pager, next",
					onCurrentChange: loadGoals,
					onSizeChange: searchGoals
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])) : createCommentVNode("", true),
				capabilities.value.manager ? (openBlock(), createBlock(GoalFormDialog_default, {
					key: 4,
					ref_key: "formRef",
					ref: formRef,
					roles: roles.value,
					staff: staff.value,
					onSave: saveGoal
				}, null, 8, ["roles", "staff"])) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-2e3f0899"]]);
//#endregion
export { goal_setting_default as default };
