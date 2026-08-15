import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, D as ElPagination, F as ElEmpty, M as ElInputNumber, Q as ElRadioGroup, V as ElDialog, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, et as ElCheckboxGroup, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as feigeTaskLocalDemo, t as feigeTaskData } from "./data-source-DRu8uYHw.js";
//#region src/views/task-workbench/request-key.ts
function createTaskRequestKey() {
	var _bytes$, _bytes$2;
	const browserCrypto = globalThis.crypto;
	if (typeof (browserCrypto === null || browserCrypto === void 0 ? void 0 : browserCrypto.randomUUID) === "function") return browserCrypto.randomUUID();
	const bytes = new Uint8Array(16);
	if (typeof (browserCrypto === null || browserCrypto === void 0 ? void 0 : browserCrypto.getRandomValues) === "function") browserCrypto.getRandomValues(bytes);
	else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
	bytes[6] = ((_bytes$ = bytes[6]) !== null && _bytes$ !== void 0 ? _bytes$ : 0) & 15 | 64;
	bytes[8] = ((_bytes$2 = bytes[8]) !== null && _bytes$2 !== void 0 ? _bytes$2 : 0) & 63 | 128;
	const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
//#endregion
//#region src/views/task-workbench/components/TaskConfigDialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "section-head" };
var _hoisted_2 = { key: 0 };
var _hoisted_3 = { key: 1 };
var _hoisted_4 = { class: "section-head" };
var _hoisted_5 = { class: "section-head" };
var _hoisted_6 = { class: "run-filter" };
var _hoisted_7 = {
	key: 1,
	class: "muted"
};
var _hoisted_8 = {
	key: 0,
	class: "pagination-bar"
};
var _hoisted_9 = { class: "process-form-body" };
var _hoisted_10 = { class: "step-head" };
var _hoisted_11 = { class: "step-title" };
var _hoisted_12 = { class: "step-grid" };
var _hoisted_13 = { class: "sub-config" };
var _hoisted_14 = { class: "sub-head" };
var _hoisted_15 = { class: "sub-config" };
var _hoisted_16 = {
	key: 0,
	class: "capability-note"
};
var _hoisted_17 = {
	key: 1,
	class: "capability-note"
};
var _hoisted_18 = {
	key: 0,
	class: "field-help"
};
var _hoisted_19 = {
	key: 0,
	class: "field-help"
};
//#endregion
//#region src/views/task-workbench/components/TaskConfigDialog.vue
var TaskConfigDialog_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "TaskConfigDialog",
	props: {
		taskType: {},
		roles: {},
		staff: {},
		capabilities: {}
	},
	emits: ["changed"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = ref(false);
		const activeTab = ref("process");
		const processes = ref([]);
		const rules = ref([]);
		const runs = ref([]);
		const processLoading = ref(false), ruleLoading = ref(false), runLoading = ref(false);
		const processFormVisible = ref(false), processDetailLoading = ref(false), processSaving = ref(false);
		const ruleFormVisible = ref(false), ruleSaving = ref(false);
		const runTotal = ref(0);
		const runQuery = reactive({
			status: "",
			orderId: void 0,
			pageNum: 1,
			pageSize: 10
		});
		let localSequence = 1;
		const taskTypeLabel = computed(() => targetLabel(props.taskType));
		const flatRoles = computed(() => flattenRoles(props.roles));
		const enabledProcesses = computed(() => processes.value.filter((item) => Number(item.enabled) === 1));
		const processForm = reactive({
			id: void 0,
			processCode: "",
			processName: "",
			businessTypeCode: "",
			description: "",
			enabled: 1,
			steps: []
		});
		const ruleForm = reactive({
			id: void 0,
			ruleCode: "",
			ruleName: "",
			triggerEvent: "finance_approved",
			processId: void 0,
			businessTypeCode: "",
			scopeType: "personal",
			finalConfirm: 0,
			enabled: 1
		});
		function open(_x) {
			return _open.apply(this, arguments);
		}
		function _open() {
			_open = _asyncToGenerator(function* (tab) {
				if (!props.capabilities.bridgeManage) {
					ElMessage.warning("当前账号没有任务配置管理权限");
					return;
				}
				if ((tab === "rule" || tab === "run") && !props.capabilities.bridgeTriggerSupported) {
					ElMessage.warning("自动生成能力当前未开放");
					return;
				}
				activeTab.value = tab || (props.taskType === "business" ? "rule" : "process");
				visible.value = true;
				if (props.taskType !== "business") yield loadProcesses();
				if (activeTab.value === "rule") yield loadRules();
				if (activeTab.value === "run") yield loadRuns();
			});
			return _open.apply(this, arguments);
		}
		function handleTabChange(_x2) {
			return _handleTabChange.apply(this, arguments);
		}
		function _handleTabChange() {
			_handleTabChange = _asyncToGenerator(function* (name) {
				if ((name === "rule" || name === "run") && (!props.capabilities.bridgeManage || !props.capabilities.bridgeTriggerSupported)) return;
				if (name === "process") yield loadProcesses();
				if (name === "rule") {
					if (props.taskType !== "business" && !processes.value.length) yield loadProcesses();
					yield loadRules();
				}
				if (name === "run") yield loadRuns();
			});
			return _handleTabChange.apply(this, arguments);
		}
		function loadProcesses() {
			return _loadProcesses.apply(this, arguments);
		}
		function _loadProcesses() {
			_loadProcesses = _asyncToGenerator(function* () {
				processLoading.value = true;
				try {
					processes.value = (yield feigeTaskData.auditProcesses({ taskType: props.taskType })) || [];
				} catch (error) {
					processes.value = [];
					ElMessage.error(`审批流程加载失败：${errorText(error)}`);
				} finally {
					processLoading.value = false;
				}
			});
			return _loadProcesses.apply(this, arguments);
		}
		function openProcessForm(_x3) {
			return _openProcessForm.apply(this, arguments);
		}
		function _openProcessForm() {
			_openProcessForm = _asyncToGenerator(function* (row) {
				resetProcessForm();
				processFormVisible.value = true;
				if (!row) return;
				processDetailLoading.value = true;
				try {
					const detail = yield feigeTaskData.auditProcess(row.id);
					const process = detail.process || row;
					Object.assign(processForm, {
						id: process.id,
						processCode: process.processCode || "",
						processName: process.processName || "",
						businessTypeCode: process.businessTypeCode || "",
						description: process.description || "",
						enabled: Number(process.enabled) === 0 ? 0 : 1,
						steps: (detail.steps || []).map(normalizeStep)
					});
					if (!processForm.steps.length) processForm.steps.push(newStep());
				} catch (error) {
					ElMessage.error(`流程详情加载失败：${errorText(error)}`);
					processFormVisible.value = false;
				} finally {
					processDetailLoading.value = false;
				}
			});
			return _openProcessForm.apply(this, arguments);
		}
		function resetProcessForm() {
			Object.assign(processForm, {
				id: void 0,
				processCode: "",
				processName: "",
				businessTypeCode: "",
				description: "",
				enabled: 1,
				steps: [newStep()]
			});
		}
		function newStep() {
			return {
				localKey: localSequence++,
				stepOrder: 1,
				stepName: "",
				assigneeMode: "role",
				requiredRoleKey: void 0,
				requiredUserId: void 0,
				allowBatch: 0,
				finalStep: 1,
				fields: [],
				indicatorTypes: []
			};
		}
		function normalizeStep(step) {
			const fields = parseJsonList(step.formSchemaJson).map((field) => _objectSpread2(_objectSpread2({}, field), {}, {
				localKey: localSequence++,
				optionsText: Array.isArray(field.options) ? field.options.map((option) => `${option.value}|${option.label}`).join(",") : ""
			}));
			const indicatorTypes = parseJsonList(step.indicatorSchemaJson).map((item) => item.indicatorType).filter(Boolean);
			return _objectSpread2(_objectSpread2({}, step), {}, {
				localKey: localSequence++,
				fields,
				indicatorTypes
			});
		}
		function addStep() {
			processForm.steps.push(newStep());
		}
		function removeStep(index) {
			processForm.steps.splice(index, 1);
		}
		function moveStep(index, offset) {
			const next = index + offset;
			if (next < 0 || next >= processForm.steps.length) return;
			const [step] = processForm.steps.splice(index, 1);
			processForm.steps.splice(next, 0, step);
		}
		function addField(step) {
			step.fields.push({
				localKey: localSequence++,
				code: "",
				label: "",
				fieldType: "text",
				required: false,
				unit: "",
				optionsText: ""
			});
		}
		function saveProcess() {
			return _saveProcess.apply(this, arguments);
		}
		function _saveProcess() {
			_saveProcess = _asyncToGenerator(function* () {
				const payload = buildProcessPayload();
				if (!payload) return;
				processSaving.value = true;
				try {
					if (processForm.id) yield feigeTaskData.updateAuditProcess(processForm.id, payload);
					else yield feigeTaskData.createAuditProcess(payload);
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：预览流程已保存" : "审批流程已保存");
					processFormVisible.value = false;
					yield loadProcesses();
					emit("changed");
				} catch (error) {
					ElMessage.error(`流程保存失败：${errorText(error)}`);
				} finally {
					processSaving.value = false;
				}
			});
			return _saveProcess.apply(this, arguments);
		}
		function buildProcessPayload() {
			const processCode = String(processForm.processCode || "").trim();
			const processName = String(processForm.processName || "").trim();
			const businessTypeCode = String(processForm.businessTypeCode || "").trim();
			if (!processName) {
				ElMessage.warning("请输入流程名称");
				return;
			}
			if (!processCode) {
				ElMessage.warning("请输入流程编码");
				return;
			}
			if (props.taskType === "special" && !businessTypeCode) {
				ElMessage.warning("专项流程必须填写专项类型编码");
				return;
			}
			if (props.taskType === "special" && processes.value.some((item) => item.id !== processForm.id && item.businessTypeCode === businessTypeCode)) {
				ElMessage.warning("专项类型编码已存在，请使用唯一编码");
				return;
			}
			if (!processForm.steps.length) {
				ElMessage.warning("至少配置一个审批步骤");
				return;
			}
			const fieldCodes = /* @__PURE__ */ new Set();
			const steps = [];
			for (let index = 0; index < processForm.steps.length; index++) {
				const step = processForm.steps[index];
				if (!String(step.stepName || "").trim()) {
					ElMessage.warning(`请填写第 ${index + 1} 步名称`);
					return;
				}
				if (step.assigneeMode === "role" && !step.requiredRoleKey) {
					ElMessage.warning(`请选择第 ${index + 1} 步审批角色`);
					return;
				}
				if (step.assigneeMode === "specific" && !step.requiredUserId) {
					ElMessage.warning(`请选择第 ${index + 1} 步审批人`);
					return;
				}
				const fields = [];
				for (const field of step.fields) {
					field.code = String(field.code || "").trim();
					field.label = String(field.label || "").trim();
					if (!field.label || !field.code) {
						ElMessage.warning(`请补全第 ${index + 1} 步表单字段`);
						return;
					}
					if (!/^[a-z][a-z0-9_]{0,39}$/.test(field.code)) {
						ElMessage.warning(`字段编码 ${field.code} 格式不正确`);
						return;
					}
					const scopedCode = `${index}:${field.code}`;
					if (fieldCodes.has(scopedCode)) {
						ElMessage.warning(`第 ${index + 1} 步字段编码 ${field.code} 重复`);
						return;
					}
					fieldCodes.add(scopedCode);
					const normalized = {
						code: field.code,
						label: field.label,
						fieldType: field.fieldType,
						required: Boolean(field.required)
					};
					if (field.unit) normalized.unit = String(field.unit).trim();
					if (field.min != null) normalized.min = Number(field.min);
					if (field.precision != null) normalized.precision = Number(field.precision);
					if (field.fieldType === "select") {
						normalized.options = parseOptions(field.optionsText || "");
						if (!normalized.options.length) {
							ElMessage.warning(`下拉字段 ${field.label} 至少配置一个选项`);
							return;
						}
					}
					fields.push(normalized);
				}
				steps.push({
					stepOrder: index + 1,
					stepName: String(step.stepName).trim(),
					assigneeMode: step.assigneeMode,
					requiredRoleKey: step.assigneeMode === "role" ? step.requiredRoleKey : void 0,
					requiredUserId: step.assigneeMode === "specific" ? step.requiredUserId : void 0,
					allowBatch: Number(step.allowBatch || 0),
					finalStep: index === processForm.steps.length - 1 ? 1 : 0,
					formSchemaJson: JSON.stringify(fields),
					indicatorSchemaJson: JSON.stringify(step.indicatorTypes.map((indicatorType) => ({ indicatorType })))
				});
			}
			return {
				processCode,
				processName,
				taskType: props.taskType,
				businessTypeCode: businessTypeCode || void 0,
				description: String(processForm.description || "").trim() || void 0,
				enabled: Number(processForm.enabled || 0),
				steps
			};
		}
		function toggleProcess(_x4) {
			return _toggleProcess.apply(this, arguments);
		}
		function _toggleProcess() {
			_toggleProcess = _asyncToGenerator(function* (row) {
				try {
					const payload = detailToPayload(yield feigeTaskData.auditProcess(row.id));
					payload.enabled = Number(row.enabled) === 1 ? 0 : 1;
					yield feigeTaskData.updateAuditProcess(row.id, payload);
					ElMessage.success(payload.enabled ? "流程已启用" : "流程已停用");
					yield loadProcesses();
					emit("changed");
				} catch (error) {
					ElMessage.error(`流程状态更新失败：${errorText(error)}`);
				}
			});
			return _toggleProcess.apply(this, arguments);
		}
		function detailToPayload(detail) {
			const process = detail.process;
			return {
				processCode: process.processCode,
				processName: process.processName,
				taskType: process.taskType,
				businessTypeCode: process.businessTypeCode,
				description: process.description,
				enabled: Number(process.enabled),
				steps: (detail.steps || []).map((step, index, all) => ({
					stepOrder: index + 1,
					stepName: step.stepName,
					requiredRoleKey: step.requiredRoleKey,
					assigneeMode: step.assigneeMode,
					requiredUserId: step.requiredUserId,
					allowBatch: Number(step.allowBatch || 0),
					finalStep: index === all.length - 1 ? 1 : 0,
					formSchemaJson: step.formSchemaJson || "[]",
					indicatorSchemaJson: step.indicatorSchemaJson || "[]"
				}))
			};
		}
		function loadRules() {
			return _loadRules.apply(this, arguments);
		}
		function _loadRules() {
			_loadRules = _asyncToGenerator(function* () {
				ruleLoading.value = true;
				try {
					rules.value = (yield feigeTaskData.bridgeRules({ targetTaskType: props.taskType })) || [];
				} catch (error) {
					rules.value = [];
					ElMessage.error(`自动规则加载失败：${errorText(error)}`);
				} finally {
					ruleLoading.value = false;
				}
			});
			return _loadRules.apply(this, arguments);
		}
		function openRuleForm(row) {
			Object.assign(ruleForm, {
				id: row === null || row === void 0 ? void 0 : row.id,
				ruleCode: (row === null || row === void 0 ? void 0 : row.ruleCode) || "",
				ruleName: (row === null || row === void 0 ? void 0 : row.ruleName) || "",
				triggerEvent: (row === null || row === void 0 ? void 0 : row.triggerEvent) || "finance_approved",
				processId: row === null || row === void 0 ? void 0 : row.processId,
				businessTypeCode: (row === null || row === void 0 ? void 0 : row.businessTypeCode) || "",
				scopeType: (row === null || row === void 0 ? void 0 : row.scopeType) || "personal",
				finalConfirm: Number((row === null || row === void 0 ? void 0 : row.finalConfirm) || 0),
				enabled: row ? Number(row.enabled) : 1
			});
			ruleFormVisible.value = true;
		}
		function handleRuleProcessChange() {
			var _processes$value$find;
			if (props.taskType !== "special") return;
			ruleForm.businessTypeCode = ((_processes$value$find = processes.value.find((item) => item.id === Number(ruleForm.processId))) === null || _processes$value$find === void 0 ? void 0 : _processes$value$find.businessTypeCode) || "";
		}
		function buildRulePayload() {
			const ruleCode = String(ruleForm.ruleCode || "").trim(), ruleName = String(ruleForm.ruleName || "").trim();
			if (!ruleName) {
				ElMessage.warning("请输入规则名称");
				return;
			}
			if (!ruleCode) {
				ElMessage.warning("请输入规则编码");
				return;
			}
			if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(ruleCode)) {
				ElMessage.warning("规则编码必须以字母开头，且只能包含字母、数字、下划线和中划线");
				return;
			}
			if (props.taskType !== "business" && !ruleForm.processId) {
				ElMessage.warning("请选择目标审批流程");
				return;
			}
			const selected = processes.value.find((item) => item.id === Number(ruleForm.processId));
			if (props.taskType !== "business" && Number(ruleForm.enabled) === 1 && Number(selected === null || selected === void 0 ? void 0 : selected.enabled) !== 1) {
				ElMessage.warning("启用规则前必须选择已启用流程");
				return;
			}
			if (props.taskType === "special" && !(selected === null || selected === void 0 ? void 0 : selected.businessTypeCode)) {
				ElMessage.warning("所选专项流程没有专项类型编码");
				return;
			}
			return {
				ruleCode,
				ruleName,
				triggerEvent: ruleForm.triggerEvent,
				targetTaskType: props.taskType,
				processId: props.taskType === "business" ? void 0 : Number(ruleForm.processId),
				businessTypeCode: props.taskType === "special" ? selected === null || selected === void 0 ? void 0 : selected.businessTypeCode : String(ruleForm.businessTypeCode || "").trim() || void 0,
				scopeType: props.taskType === "business" ? void 0 : ruleForm.scopeType,
				finalConfirm: props.taskType === "business" ? 0 : Number(ruleForm.finalConfirm || 0),
				enabled: Number(ruleForm.enabled || 0)
			};
		}
		function saveRule() {
			return _saveRule.apply(this, arguments);
		}
		function _saveRule() {
			_saveRule = _asyncToGenerator(function* () {
				const payload = buildRulePayload();
				if (!payload) return;
				ruleSaving.value = true;
				try {
					if (ruleForm.id) yield feigeTaskData.updateBridgeRule(ruleForm.id, payload);
					else yield feigeTaskData.createBridgeRule(payload);
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：预览规则已保存" : "自动生成规则已保存");
					ruleFormVisible.value = false;
					yield loadRules();
					emit("changed");
				} catch (error) {
					ElMessage.error(`规则保存失败：${errorText(error)}`);
				} finally {
					ruleSaving.value = false;
				}
			});
			return _saveRule.apply(this, arguments);
		}
		function toggleRule(_x5) {
			return _toggleRule.apply(this, arguments);
		}
		function _toggleRule() {
			_toggleRule = _asyncToGenerator(function* (row) {
				var _processes$value$find2;
				const payload = {
					ruleCode: row.ruleCode,
					ruleName: row.ruleName,
					triggerEvent: row.triggerEvent,
					targetTaskType: row.targetTaskType,
					processId: row.processId,
					businessTypeCode: row.businessTypeCode,
					scopeType: row.scopeType,
					finalConfirm: Number(row.finalConfirm || 0),
					enabled: Number(row.enabled) === 1 ? 0 : 1
				};
				if (payload.enabled === 1 && props.taskType !== "business" && Number((_processes$value$find2 = processes.value.find((item) => item.id === Number(row.processId))) === null || _processes$value$find2 === void 0 ? void 0 : _processes$value$find2.enabled) !== 1) return ElMessage.warning("请先启用规则绑定的审批流程");
				try {
					yield feigeTaskData.updateBridgeRule(row.id, payload);
					ElMessage.success(payload.enabled ? "规则已启用" : "规则已停用");
					yield loadRules();
					emit("changed");
				} catch (error) {
					ElMessage.error(`规则状态更新失败：${errorText(error)}`);
				}
			});
			return _toggleRule.apply(this, arguments);
		}
		function loadRuns() {
			return _loadRuns.apply(this, arguments);
		}
		function _loadRuns() {
			_loadRuns = _asyncToGenerator(function* () {
				runLoading.value = true;
				try {
					const result = yield feigeTaskData.bridgeRuns(_objectSpread2(_objectSpread2({}, runQuery), {}, {
						status: runQuery.status || void 0,
						orderId: runQuery.orderId || void 0
					}));
					runs.value = (result === null || result === void 0 ? void 0 : result.records) || [];
					runTotal.value = Number((result === null || result === void 0 ? void 0 : result.total) || 0);
				} catch (error) {
					runs.value = [];
					runTotal.value = 0;
					ElMessage.error(`生成记录加载失败：${errorText(error)}`);
				} finally {
					runLoading.value = false;
				}
			});
			return _loadRuns.apply(this, arguments);
		}
		function searchRuns() {
			runQuery.pageNum = 1;
			loadRuns();
		}
		function retryRun(_x6) {
			return _retryRun.apply(this, arguments);
		}
		function _retryRun() {
			_retryRun = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm("确认重试本次任务生成？系统会执行幂等校验，已成功的目标不会重复创建。", "重试生成", { type: "warning" });
					yield feigeTaskData.retryBridgeRun(row.id);
					ElMessage.success("已提交重试");
					yield loadRuns();
				} catch (error) {
					if (error !== "cancel" && error !== "close") ElMessage.error(`重试失败：${errorText(error)}`);
				}
			});
			return _retryRun.apply(this, arguments);
		}
		function parseJsonList(value) {
			if (!value) return [];
			try {
				const parsed = JSON.parse(value);
				return Array.isArray(parsed) ? parsed : [];
			} catch (_unused) {
				return [];
			}
		}
		function parseOptions(value) {
			return value.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean).map((item) => {
				const [rawValue, ...labelParts] = item.split("|");
				const label = labelParts.join("|").trim() || rawValue.trim();
				return {
					value: rawValue.trim(),
					label
				};
			});
		}
		function flattenRoles(nodes) {
			return nodes.flatMap((node) => [node, ...flattenRoles(node.children || [])]);
		}
		function staffLabel(item) {
			return `${item.name}${item.deptName ? ` · ${item.deptName}` : ""}`;
		}
		function processLabel(item) {
			return `${item.processName}${props.taskType === "special" && item.businessTypeCode ? ` · ${item.businessTypeCode}` : ""}`;
		}
		function processName(id) {
			var _processes$value$find3;
			return ((_processes$value$find3 = processes.value.find((item) => item.id === Number(id))) === null || _processes$value$find3 === void 0 ? void 0 : _processes$value$find3.processName) || (id ? `流程 #${id}` : "-");
		}
		function triggerLabel(value) {
			return {
				order_created: "订单创建",
				finance_approved: "财务审核通过"
			}[value] || value;
		}
		function targetLabel(value) {
			return {
				business: "业务任务",
				once: "一次性任务",
				recurring: "周期任务",
				project_dept: "项目部门任务",
				special: "专项任务"
			}[value || ""] || value || "-";
		}
		function runStatusLabel(value) {
			return {
				pending: "待处理",
				processing: "处理中",
				success: "成功",
				failed: "失败",
				dead: "已终止",
				skipped: "已跳过"
			}[value] || value;
		}
		function runStatusType(value) {
			return value === "success" ? "success" : ["failed", "dead"].includes(value) ? "danger" : value === "skipped" ? "info" : "warning";
		}
		function retryable(value) {
			return [
				"failed",
				"dead",
				"skipped"
			].includes(value);
		}
		function errorText(error) {
			var _error$response;
			return (error === null || error === void 0 || (_error$response = error.response) === null || _error$response === void 0 || (_error$response = _error$response.data) === null || _error$response === void 0 ? void 0 : _error$response.message) || (error === null || error === void 0 ? void 0 : error.message) || "未知错误";
		}
		__expose({ open });
		return (_ctx, _cache) => {
			const _component_el_alert = ElAlert;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input_number = ElInputNumber;
			const _component_el_pagination = ElPagination;
			const _component_el_tabs = ElTabs;
			const _component_el_dialog = ElDialog;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_switch = ElSwitch;
			const _component_el_form = ElForm;
			const _component_el_empty = ElEmpty;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_checkbox_group = ElCheckboxGroup;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock(Fragment, null, [
				createVNode(_component_el_dialog, {
					modelValue: visible.value,
					"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => visible.value = $event),
					title: `${taskTypeLabel.value}配置`,
					width: "min(1120px, 97vw)",
					top: "3vh",
					"append-to-body": "",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[7] || (_cache[7] = ($event) => visible.value = false) }, {
						default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("关闭", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_alert, {
						type: "info",
						"show-icon": "",
						closable: false,
						title: "配置只作用于任务工作台",
						description: "角色和员工来自系统现有组织架构；这里不新建角色，也不会改订单、服务工单或其他业务表。"
					}), createVNode(_component_el_tabs, {
						modelValue: activeTab.value,
						"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => activeTab.value = $event),
						class: "config-tabs",
						onTabChange: handleTabChange
					}, {
						default: withCtx(() => [
							__props.taskType !== "business" ? (openBlock(), createBlock(_component_el_tab_pane, {
								key: 0,
								label: "审批流程",
								name: "process"
							}, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_1, [createBaseVNode("div", null, [createBaseVNode("h3", null, "审批流程与" + toDisplayString(__props.taskType === "special" ? "专项类型" : "步骤角色"), 1), __props.taskType === "special" ? (openBlock(), createElementBlock("p", _hoisted_2, "每个专项流程必须填写唯一专项类型编码；流程名称作为专项类型展示名。")) : (openBlock(), createElementBlock("p", _hoisted_3, "按顺序配置审批步骤，并明确按角色、指定人员或业务负责人审批。"))]), createVNode(_component_el_button, {
									type: "primary",
									onClick: _cache[0] || (_cache[0] = ($event) => openProcessForm())
								}, {
									default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("新增流程", -1)])]),
									_: 1
								})]), withDirectives((openBlock(), createBlock(_component_el_table, {
									data: processes.value,
									border: "",
									"row-key": "id",
									"empty-text": "暂无审批流程，请先新增并启用流程"
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											prop: "processName",
											label: "流程名称",
											"min-width": "180"
										}),
										createVNode(_component_el_table_column, {
											prop: "processCode",
											label: "流程编码",
											"min-width": "150"
										}),
										__props.taskType === "special" ? (openBlock(), createBlock(_component_el_table_column, {
											key: 0,
											prop: "businessTypeCode",
											label: "专项类型编码",
											"min-width": "150"
										})) : createCommentVNode("", true),
										createVNode(_component_el_table_column, {
											prop: "description",
											label: "说明",
											"min-width": "220",
											"show-overflow-tooltip": ""
										}),
										createVNode(_component_el_table_column, {
											label: "状态",
											width: "90",
											align: "center"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: Number(row.enabled) === 1 ? "success" : "info" }, {
												default: withCtx(() => [createTextVNode(toDisplayString(Number(row.enabled) === 1 ? "启用" : "停用"), 1)]),
												_: 2
											}, 1032, ["type"])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "操作",
											width: "170",
											fixed: "right"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_button, {
												link: "",
												type: "primary",
												onClick: ($event) => openProcessForm(row)
											}, {
												default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("编辑", -1)])]),
												_: 1
											}, 8, ["onClick"]), createVNode(_component_el_button, {
												link: "",
												type: Number(row.enabled) === 1 ? "warning" : "success",
												onClick: ($event) => toggleProcess(row)
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(Number(row.enabled) === 1 ? "停用" : "启用"), 1)]),
												_: 2
											}, 1032, ["type", "onClick"])]),
											_: 1
										})
									]),
									_: 1
								}, 8, ["data"])), [[_directive_loading, processLoading.value]])]),
								_: 1
							})) : createCommentVNode("", true),
							__props.capabilities.bridgeManage && __props.capabilities.bridgeTriggerSupported ? (openBlock(), createBlock(_component_el_tab_pane, {
								key: 1,
								label: "自动生成规则",
								name: "rule"
							}, {
								default: withCtx(() => [
									createBaseVNode("div", _hoisted_4, [_cache[29] || (_cache[29] = createBaseVNode("div", null, [createBaseVNode("h3", null, "订单触发规则"), createBaseVNode("p", null, "将订单创建或财务审核事件映射到当前任务类型；未覆盖时仍可在列表页手工补发。")], -1)), createVNode(_component_el_button, {
										type: "primary",
										onClick: _cache[1] || (_cache[1] = ($event) => openRuleForm())
									}, {
										default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("新增规则", -1)])]),
										_: 1
									})]),
									__props.taskType !== "business" && !enabledProcesses.value.length ? (openBlock(), createBlock(_component_el_alert, {
										key: 0,
										class: "inline-alert",
										type: "warning",
										"show-icon": "",
										closable: false,
										title: "暂无已启用流程，自动规则暂不能启用"
									})) : createCommentVNode("", true),
									withDirectives((openBlock(), createBlock(_component_el_table, {
										data: rules.value,
										border: "",
										"row-key": "id",
										"empty-text": "暂无自动生成规则，请新增并启用规则"
									}, {
										default: withCtx(() => [
											createVNode(_component_el_table_column, {
												prop: "ruleName",
												label: "规则名称",
												"min-width": "180"
											}),
											createVNode(_component_el_table_column, {
												prop: "ruleCode",
												label: "规则编码",
												"min-width": "150"
											}),
											createVNode(_component_el_table_column, {
												label: "触发事件",
												width: "130"
											}, {
												default: withCtx(({ row }) => [createTextVNode(toDisplayString(triggerLabel(row.triggerEvent)), 1)]),
												_: 1
											}),
											__props.taskType !== "business" ? (openBlock(), createBlock(_component_el_table_column, {
												key: 0,
												label: "审批流程",
												"min-width": "180"
											}, {
												default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.processName || processName(row.processId)), 1)]),
												_: 1
											})) : createCommentVNode("", true),
											createVNode(_component_el_table_column, {
												prop: "businessTypeCode",
												label: "订单业务类型条件",
												"min-width": "155"
											}, {
												default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.businessTypeCode || "全部业务类型"), 1)]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "状态",
												width: "90",
												align: "center"
											}, {
												default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: Number(row.enabled) === 1 ? "success" : "info" }, {
													default: withCtx(() => [createTextVNode(toDisplayString(Number(row.enabled) === 1 ? "启用" : "停用"), 1)]),
													_: 2
												}, 1032, ["type"])]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "操作",
												width: "170",
												fixed: "right"
											}, {
												default: withCtx(({ row }) => [createVNode(_component_el_button, {
													link: "",
													type: "primary",
													onClick: ($event) => openRuleForm(row)
												}, {
													default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("编辑", -1)])]),
													_: 1
												}, 8, ["onClick"]), createVNode(_component_el_button, {
													link: "",
													type: Number(row.enabled) === 1 ? "warning" : "success",
													onClick: ($event) => toggleRule(row)
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(Number(row.enabled) === 1 ? "停用" : "启用"), 1)]),
													_: 2
												}, 1032, ["type", "onClick"])]),
												_: 1
											})
										]),
										_: 1
									}, 8, ["data"])), [[_directive_loading, ruleLoading.value]])
								]),
								_: 1
							})) : createCommentVNode("", true),
							__props.capabilities.bridgeManage && __props.capabilities.bridgeTriggerSupported ? (openBlock(), createBlock(_component_el_tab_pane, {
								key: 2,
								label: "生成记录",
								name: "run"
							}, {
								default: withCtx(() => [
									createBaseVNode("div", _hoisted_5, [_cache[32] || (_cache[32] = createBaseVNode("div", null, [createBaseVNode("h3", null, "自动生成记录"), createBaseVNode("p", null, "失败记录可在修复配置或订单资料后重试；这里只重试任务生成，不重复修改订单。")], -1)), createVNode(_component_el_button, {
										loading: runLoading.value,
										onClick: loadRuns
									}, {
										default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("刷新", -1)])]),
										_: 1
									}, 8, ["loading"])]),
									createBaseVNode("div", _hoisted_6, [
										createVNode(_component_el_select, {
											modelValue: runQuery.status,
											"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => runQuery.status = $event),
											clearable: "",
											placeholder: "全部状态",
											onChange: searchRuns
										}, {
											default: withCtx(() => [
												createVNode(_component_el_option, {
													label: "待处理",
													value: "pending"
												}),
												createVNode(_component_el_option, {
													label: "处理中",
													value: "processing"
												}),
												createVNode(_component_el_option, {
													label: "成功",
													value: "success"
												}),
												createVNode(_component_el_option, {
													label: "失败",
													value: "failed"
												}),
												createVNode(_component_el_option, {
													label: "已终止",
													value: "dead"
												}),
												createVNode(_component_el_option, {
													label: "已跳过",
													value: "skipped"
												})
											]),
											_: 1
										}, 8, ["modelValue"]),
										createVNode(_component_el_input_number, {
											modelValue: runQuery.orderId,
											"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => runQuery.orderId = $event),
											min: 1,
											precision: 0,
											"controls-position": "right",
											placeholder: "订单ID"
										}, null, 8, ["modelValue"]),
										createVNode(_component_el_button, {
											type: "primary",
											onClick: searchRuns
										}, {
											default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("查询", -1)])]),
											_: 1
										})
									]),
									withDirectives((openBlock(), createBlock(_component_el_table, {
										data: runs.value,
										border: "",
										"row-key": "id",
										"empty-text": "暂无自动生成记录"
									}, {
										default: withCtx(() => [
											createVNode(_component_el_table_column, {
												prop: "orderNo",
												label: "订单编号",
												"min-width": "150"
											}, {
												default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.orderNo || row.orderId || "-"), 1)]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												prop: "ruleName",
												label: "规则",
												"min-width": "170"
											}),
											createVNode(_component_el_table_column, {
												label: "目标任务",
												width: "130"
											}, {
												default: withCtx(({ row }) => [createTextVNode(toDisplayString(targetLabel(row.targetTaskType)), 1)]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "状态",
												width: "90"
											}, {
												default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: runStatusType(row.status) }, {
													default: withCtx(() => [createTextVNode(toDisplayString(runStatusLabel(row.status)), 1)]),
													_: 2
												}, 1032, ["type"])]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												prop: "errorMessage",
												label: "失败原因",
												"min-width": "250",
												"show-overflow-tooltip": ""
											}),
											createVNode(_component_el_table_column, {
												prop: "retryCount",
												label: "重试次数",
												width: "90",
												align: "center"
											}),
											createVNode(_component_el_table_column, {
												prop: "createTime",
												label: "触发时间",
												width: "175"
											}),
											createVNode(_component_el_table_column, {
												label: "操作",
												width: "90",
												fixed: "right"
											}, {
												default: withCtx(({ row }) => [retryable(row.status) ? (openBlock(), createBlock(_component_el_button, {
													key: 0,
													link: "",
													type: "primary",
													onClick: ($event) => retryRun(row)
												}, {
													default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("重试", -1)])]),
													_: 1
												}, 8, ["onClick"])) : (openBlock(), createElementBlock("span", _hoisted_7, "-"))]),
												_: 1
											})
										]),
										_: 1
									}, 8, ["data"])), [[_directive_loading, runLoading.value]]),
									runTotal.value > runQuery.pageSize ? (openBlock(), createElementBlock("div", _hoisted_8, [createVNode(_component_el_pagination, {
										"current-page": runQuery.pageNum,
										"onUpdate:currentPage": _cache[4] || (_cache[4] = ($event) => runQuery.pageNum = $event),
										"page-size": runQuery.pageSize,
										"onUpdate:pageSize": _cache[5] || (_cache[5] = ($event) => runQuery.pageSize = $event),
										total: runTotal.value,
										"page-sizes": [
											10,
											20,
											50
										],
										layout: "total, sizes, prev, pager, next",
										onCurrentChange: loadRuns,
										onSizeChange: searchRuns
									}, null, 8, [
										"current-page",
										"page-size",
										"total"
									])])) : createCommentVNode("", true)
								]),
								_: 1
							})) : createCommentVNode("", true)
						]),
						_: 1
					}, 8, ["modelValue"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: processFormVisible.value,
					"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => processFormVisible.value = $event),
					title: processForm.id ? "编辑审批流程" : "新增审批流程",
					width: "min(980px, 96vw)",
					top: "2vh",
					"append-to-body": "",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[14] || (_cache[14] = ($event) => processFormVisible.value = false) }, {
						default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: processSaving.value,
						onClick: saveProcess
					}, {
						default: withCtx(() => [..._cache[52] || (_cache[52] = [createTextVNode("保存流程", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [withDirectives((openBlock(), createElementBlock("div", _hoisted_9, [
						createVNode(_component_el_alert, {
							type: "warning",
							"show-icon": "",
							closable: false,
							title: "修改步骤前请先处理完进行中任务",
							description: "后端会阻止对存在待审核实例的流程改动步骤；流程名称、说明和启停等安全信息仍可调整。"
						}),
						createVNode(_component_el_form, {
							"label-position": "top",
							class: "base-form-grid"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_form_item, {
									label: "流程名称",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: processForm.processName,
										"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => processForm.processName = $event),
										maxlength: "150",
										placeholder: "例如：工商交付审核"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "流程编码",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: processForm.processCode,
										"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => processForm.processCode = $event),
										maxlength: "64",
										placeholder: "例如：gs_delivery"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								__props.taskType === "special" ? (openBlock(), createBlock(_component_el_form_item, {
									key: 0,
									label: "专项类型编码",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: processForm.businessTypeCode,
										"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => processForm.businessTypeCode = $event),
										maxlength: "64",
										placeholder: "例如：complex_cancel"
									}, null, 8, ["modelValue"]), _cache[36] || (_cache[36] = createBaseVNode("div", { class: "field-help" }, "流程名称即专项类型展示名；编码用于订单过滤和自动规则匹配。", -1))]),
									_: 1
								})) : createCommentVNode("", true),
								createVNode(_component_el_form_item, { label: "状态" }, {
									default: withCtx(() => [createVNode(_component_el_switch, {
										modelValue: processForm.enabled,
										"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => processForm.enabled = $event),
										"active-value": 1,
										"inactive-value": 0,
										"active-text": "启用",
										"inactive-text": "停用"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									class: "full-row",
									label: "流程说明"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: processForm.description,
										"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => processForm.description = $event),
										type: "textarea",
										rows: 2,
										maxlength: "1000",
										"show-word-limit": ""
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							_: 1
						}),
						createBaseVNode("div", _hoisted_10, [_cache[38] || (_cache[38] = createBaseVNode("div", null, [createBaseVNode("h3", null, "审批步骤"), createBaseVNode("p", null, "最后一步由系统自动标记；按角色审批时保存角色 key，而不是写死角色 ID。")], -1)), createVNode(_component_el_button, {
							type: "primary",
							plain: "",
							onClick: addStep
						}, {
							default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("新增步骤", -1)])]),
							_: 1
						})]),
						!flatRoles.value.length || !__props.staff.length ? (openBlock(), createBlock(_component_el_alert, {
							key: 0,
							class: "inline-alert",
							type: "info",
							"show-icon": "",
							closable: false,
							title: !flatRoles.value.length ? "系统暂无可用角色，按角色审批无法配置" : "当前数据范围没有可选员工，指定人员审批无法配置",
							description: "请先在系统角色/员工管理中完成组织配置，再返回此处选择；本模块不会另建一套角色。"
						}, null, 8, ["title"])) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(processForm.steps, (step, index) => {
							return openBlock(), createElementBlock("article", {
								key: step.localKey,
								class: "step-card"
							}, [
								createBaseVNode("div", _hoisted_11, [createBaseVNode("strong", null, "第 " + toDisplayString(index + 1) + " 步", 1), createBaseVNode("div", null, [
									index === processForm.steps.length - 1 ? (openBlock(), createBlock(_component_el_tag, {
										key: 0,
										type: "success"
									}, {
										default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("最终步骤", -1)])]),
										_: 1
									})) : createCommentVNode("", true),
									createVNode(_component_el_button, {
										link: "",
										disabled: index === 0,
										onClick: ($event) => moveStep(index, -1)
									}, {
										default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("上移", -1)])]),
										_: 1
									}, 8, ["disabled", "onClick"]),
									createVNode(_component_el_button, {
										link: "",
										disabled: index === processForm.steps.length - 1,
										onClick: ($event) => moveStep(index, 1)
									}, {
										default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("下移", -1)])]),
										_: 1
									}, 8, ["disabled", "onClick"]),
									createVNode(_component_el_button, {
										link: "",
										type: "danger",
										disabled: processForm.steps.length === 1,
										onClick: ($event) => removeStep(index)
									}, {
										default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("删除", -1)])]),
										_: 1
									}, 8, ["disabled", "onClick"])
								])]),
								createBaseVNode("div", _hoisted_12, [
									createVNode(_component_el_form_item, {
										label: "步骤名称",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: step.stepName,
											"onUpdate:modelValue": ($event) => step.stepName = $event,
											maxlength: "150",
											placeholder: "例如：主管初审"
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 2
									}, 1024),
									createVNode(_component_el_form_item, {
										label: "审批人来源",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: step.assigneeMode,
											"onUpdate:modelValue": ($event) => step.assigneeMode = $event,
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [
												createVNode(_component_el_option, {
													label: "按系统角色",
													value: "role"
												}),
												createVNode(_component_el_option, {
													label: "指定员工",
													value: "specific"
												}),
												createVNode(_component_el_option, {
													label: "业务负责人本人",
													value: "owner"
												})
											]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 2
									}, 1024),
									step.assigneeMode === "role" ? (openBlock(), createBlock(_component_el_form_item, {
										key: 0,
										label: "审批角色",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: step.requiredRoleKey,
											"onUpdate:modelValue": ($event) => step.requiredRoleKey = $event,
											filterable: "",
											style: { "width": "100%" },
											placeholder: "请选择角色"
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(flatRoles.value, (role) => {
												return openBlock(), createBlock(_component_el_option, {
													key: role.id,
													label: `${role.name} · ${role.key || "无角色key"}`,
													value: role.key,
													disabled: !role.key
												}, null, 8, [
													"label",
													"value",
													"disabled"
												]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 2
									}, 1024)) : createCommentVNode("", true),
									step.assigneeMode === "specific" ? (openBlock(), createBlock(_component_el_form_item, {
										key: 1,
										label: "指定审批人",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: step.requiredUserId,
											"onUpdate:modelValue": ($event) => step.requiredUserId = $event,
											filterable: "",
											style: { "width": "100%" },
											placeholder: "请选择员工"
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.staff, (person) => {
												return openBlock(), createBlock(_component_el_option, {
													key: person.id,
													label: staffLabel(person),
													value: person.id
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 2
									}, 1024)) : createCommentVNode("", true),
									createVNode(_component_el_form_item, { label: "允许批量审核" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: step.allowBatch,
											"onUpdate:modelValue": ($event) => step.allowBatch = $event,
											"active-value": 1,
											"inactive-value": 0
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 2
									}, 1024)
								]),
								createBaseVNode("div", _hoisted_13, [
									createBaseVNode("div", _hoisted_14, [_cache[44] || (_cache[44] = createBaseVNode("div", null, [createBaseVNode("b", null, "审核表单字段"), createBaseVNode("small", null, "仅配置本步骤确实需要留痕的字段。")], -1)), createVNode(_component_el_button, {
										size: "small",
										plain: "",
										onClick: ($event) => addField(step)
									}, {
										default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("添加字段", -1)])]),
										_: 1
									}, 8, ["onClick"])]),
									(openBlock(true), createElementBlock(Fragment, null, renderList(step.fields, (field, fieldIndex) => {
										return openBlock(), createElementBlock("div", {
											key: field.localKey,
											class: "field-row"
										}, [
											createVNode(_component_el_input, {
												modelValue: field.label,
												"onUpdate:modelValue": ($event) => field.label = $event,
												placeholder: "字段名称"
											}, null, 8, ["modelValue", "onUpdate:modelValue"]),
											createVNode(_component_el_input, {
												modelValue: field.code,
												"onUpdate:modelValue": ($event) => field.code = $event,
												placeholder: "字段编码"
											}, null, 8, ["modelValue", "onUpdate:modelValue"]),
											createVNode(_component_el_select, {
												modelValue: field.fieldType,
												"onUpdate:modelValue": ($event) => field.fieldType = $event,
												placeholder: "类型"
											}, {
												default: withCtx(() => [
													createVNode(_component_el_option, {
														label: "单行文本",
														value: "text"
													}),
													createVNode(_component_el_option, {
														label: "多行文本",
														value: "textarea"
													}),
													createVNode(_component_el_option, {
														label: "数字",
														value: "number"
													}),
													createVNode(_component_el_option, {
														label: "下拉选择",
														value: "select"
													}),
													createVNode(_component_el_option, {
														label: "日期",
														value: "date"
													}),
													createVNode(_component_el_option, {
														label: "日期时间",
														value: "datetime"
													}),
													createVNode(_component_el_option, {
														label: "开关",
														value: "switch"
													})
												]),
												_: 1
											}, 8, ["modelValue", "onUpdate:modelValue"]),
											field.fieldType === "select" ? (openBlock(), createBlock(_component_el_input, {
												key: 0,
												modelValue: field.optionsText,
												"onUpdate:modelValue": ($event) => field.optionsText = $event,
												placeholder: "选项：值|名称，逗号分隔"
											}, null, 8, ["modelValue", "onUpdate:modelValue"])) : (openBlock(), createBlock(_component_el_input, {
												key: 1,
												modelValue: field.unit,
												"onUpdate:modelValue": ($event) => field.unit = $event,
												placeholder: "单位（选填）"
											}, null, 8, ["modelValue", "onUpdate:modelValue"])),
											createVNode(_component_el_switch, {
												modelValue: field.required,
												"onUpdate:modelValue": ($event) => field.required = $event,
												"inline-prompt": "",
												"active-text": "必填",
												"inactive-text": "选填"
											}, null, 8, ["modelValue", "onUpdate:modelValue"]),
											createVNode(_component_el_button, {
												link: "",
												type: "danger",
												onClick: ($event) => step.fields.splice(fieldIndex, 1)
											}, {
												default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("删除", -1)])]),
												_: 1
											}, 8, ["onClick"])
										]);
									}), 128)),
									!step.fields.length ? (openBlock(), createBlock(_component_el_empty, {
										key: 0,
										"image-size": 42,
										description: "无需附加表单"
									})) : createCommentVNode("", true)
								]),
								createBaseVNode("div", _hoisted_15, [
									_cache[50] || (_cache[50] = createBaseVNode("div", { class: "sub-head" }, [createBaseVNode("div", null, [createBaseVNode("b", null, "审批动作"), createBaseVNode("small", null, "转换动作仅按后端已开放能力显示。")])], -1)),
									createVNode(_component_el_checkbox_group, {
										modelValue: step.indicatorTypes,
										"onUpdate:modelValue": ($event) => step.indicatorTypes = $event
									}, {
										default: withCtx(() => [
											createVNode(_component_el_checkbox, { value: "next_auditor" }, {
												default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("通过时选择下一审批人", -1)])]),
												_: 1
											}),
											createVNode(_component_el_checkbox, { value: "cost_input" }, {
												default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("必须填写成本项", -1)])]),
												_: 1
											}),
											__props.capabilities.contractConversionSupported ? (openBlock(), createBlock(_component_el_checkbox, {
												key: 0,
												value: "convert_contract"
											}, {
												default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("完成后转合同", -1)])]),
												_: 1
											})) : createCommentVNode("", true),
											__props.capabilities.addressConversionSupported ? (openBlock(), createBlock(_component_el_checkbox, {
												key: 1,
												value: "convert_address"
											}, {
												default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("完成后转地址", -1)])]),
												_: 1
											})) : createCommentVNode("", true)
										]),
										_: 1
									}, 8, ["modelValue", "onUpdate:modelValue"]),
									!__props.capabilities.contractConversionSupported ? (openBlock(), createElementBlock("p", _hoisted_16, "合同转换尚未开放，不会出现在流程配置或审核操作中。")) : createCommentVNode("", true),
									!__props.capabilities.addressConversionSupported ? (openBlock(), createElementBlock("p", _hoisted_17, "地址转换暂未开放，不会显示可执行入口。")) : createCommentVNode("", true)
								])
							]);
						}), 128))
					])), [[_directive_loading, processDetailLoading.value]])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: ruleFormVisible.value,
					"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => ruleFormVisible.value = $event),
					title: ruleForm.id ? "编辑自动生成规则" : "新增自动生成规则",
					width: "min(680px, 94vw)",
					"append-to-body": "",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[24] || (_cache[24] = ($event) => ruleFormVisible.value = false) }, {
						default: withCtx(() => [..._cache[56] || (_cache[56] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: ruleSaving.value,
						onClick: saveRule
					}, {
						default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("保存规则", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						"label-position": "top",
						class: "rule-form-grid"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "规则名称",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: ruleForm.ruleName,
									"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => ruleForm.ruleName = $event),
									maxlength: "150",
									placeholder: "例如：财务审核后生成工商交付任务"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "规则编码",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: ruleForm.ruleCode,
									"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => ruleForm.ruleCode = $event),
									disabled: Boolean(ruleForm.id),
									maxlength: "64",
									placeholder: "例如：finance_to_gs_task"
								}, null, 8, ["modelValue", "disabled"]), ruleForm.id ? (openBlock(), createElementBlock("div", _hoisted_18, "规则产生运行记录后编码不可修改。")) : createCommentVNode("", true)]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "触发事件",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: ruleForm.triggerEvent,
									"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => ruleForm.triggerEvent = $event),
									disabled: Boolean(ruleForm.id),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [createVNode(_component_el_option, {
										label: "订单创建",
										value: "order_created"
									}), createVNode(_component_el_option, {
										label: "财务审核通过",
										value: "finance_approved"
									})]),
									_: 1
								}, 8, ["modelValue", "disabled"])]),
								_: 1
							}),
							__props.taskType !== "business" ? (openBlock(), createBlock(_component_el_form_item, {
								key: 0,
								label: "目标审批流程",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: ruleForm.processId,
									"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => ruleForm.processId = $event),
									filterable: "",
									style: { "width": "100%" },
									placeholder: "请选择已启用流程",
									onChange: handleRuleProcessChange
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(processes.value, (item) => {
										return openBlock(), createBlock(_component_el_option, {
											key: item.id,
											label: `${processLabel(item)}${Number(item.enabled) === 1 ? "" : "（已停用）"}`,
											value: item.id,
											disabled: Number(item.enabled) !== 1 && item.id !== ruleForm.processId
										}, null, 8, [
											"label",
											"value",
											"disabled"
										]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_form_item, { label: "订单业务类型条件" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: ruleForm.businessTypeCode,
									"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => ruleForm.businessTypeCode = $event),
									disabled: __props.taskType === "special",
									maxlength: "64",
									placeholder: "留空代表全部业务类型"
								}, null, 8, ["modelValue", "disabled"]), __props.taskType === "special" ? (openBlock(), createElementBlock("div", _hoisted_19, "专项规则随所选流程使用专项类型编码。")) : createCommentVNode("", true)]),
								_: 1
							}),
							__props.taskType !== "business" ? (openBlock(), createBlock(_component_el_form_item, {
								key: 1,
								label: "任务范围"
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: ruleForm.scopeType,
									"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => ruleForm.scopeType = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio_button, { value: "personal" }, {
										default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("个人", -1)])]),
										_: 1
									}), createVNode(_component_el_radio_button, { value: "team" }, {
										default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("团队", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true),
							__props.taskType !== "business" ? (openBlock(), createBlock(_component_el_form_item, {
								key: 2,
								label: "最终确认"
							}, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: ruleForm.finalConfirm,
									"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => ruleForm.finalConfirm = $event),
									"active-value": 1,
									"inactive-value": 0
								}, null, 8, ["modelValue"]), _cache[55] || (_cache[55] = createBaseVNode("span", { class: "switch-help" }, "最后一步由订单业务负责人本人确认", -1))]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_form_item, { label: "规则状态" }, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: ruleForm.enabled,
									"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => ruleForm.enabled = $event),
									"active-value": 1,
									"inactive-value": 0,
									"active-text": "启用",
									"inactive-text": "停用"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue", "title"])
			], 64);
		};
	}
}), [["__scopeId", "data-v-8f2a37f3"]]);
//#endregion
export { createTaskRequestKey as n, TaskConfigDialog_default as t };
