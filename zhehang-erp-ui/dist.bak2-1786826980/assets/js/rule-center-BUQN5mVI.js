import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, F as ElEmpty, Un as search_default, _ as ElTableColumn, br as warning_filled_default, g as ElTable, it as ElTag, mt as ElInput, nt as ElOption, ot as ElButton, rt as ElSelect, s as vLoading, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as unwrapGovernanceData, t as settingsGovernanceApi } from "./settings-governance-qdMEMNS_.js";
//#region src/views/system/rule-center.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "governance-page" };
var _hoisted_2 = { class: "page-heading" };
var _hoisted_3 = { class: "summary-grid" };
var _hoisted_4 = { class: "summary-card" };
var _hoisted_5 = { class: "summary-card" };
var _hoisted_6 = { class: "summary-card warning" };
var _hoisted_7 = { class: "summary-card muted" };
var _hoisted_8 = { class: "catalog-panel" };
var _hoisted_9 = { class: "toolbar" };
var _hoisted_10 = { class: "primary-cell" };
var _hoisted_11 = { class: "primary-title" };
var _hoisted_12 = { class: "secondary-text" };
var _hoisted_13 = { class: "secondary-text" };
var _hoisted_14 = { class: "source-name" };
var _hoisted_15 = { class: "secondary-text" };
var _hoisted_16 = { key: 0 };
var _hoisted_17 = {
	key: 0,
	class: "warning-text"
};
var _hoisted_18 = { class: "capability-line" };
var _hoisted_19 = {
	key: 1,
	class: "secondary-text"
};
//#endregion
//#region src/views/system/rule-center.vue
var rule_center_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "rule-center",
	setup(__props) {
		const router = useRouter();
		const loading = ref(false);
		const loadError = ref("");
		const rules = ref([]);
		const keyword = ref("");
		const domain = ref("");
		const risk = ref("");
		const integration = ref("");
		const riskOptions = [
			{
				value: "LOW",
				label: "低"
			},
			{
				value: "MEDIUM",
				label: "中"
			},
			{
				value: "HIGH",
				label: "高"
			},
			{
				value: "CRITICAL",
				label: "极高"
			}
		];
		const integrationOptions = [
			{
				value: "CONNECTED",
				label: "已接入"
			},
			{
				value: "PARTIAL",
				label: "部分接入"
			},
			{
				value: "PLANNED",
				label: "规划中"
			},
			{
				value: "READ_ONLY",
				label: "只读守卫"
			}
		];
		const domainOptions = computed(() => {
			const map = /* @__PURE__ */ new Map();
			rules.value.forEach((item) => map.set(item.domainCode, item.domainName));
			return [...map.entries()].map(([value, label]) => ({
				value,
				label
			}));
		});
		const filteredRules = computed(() => {
			const query = keyword.value.trim().toLowerCase();
			return rules.value.filter((item) => {
				if (domain.value && item.domainCode !== domain.value) return false;
				if (risk.value && item.riskLevel !== risk.value) return false;
				if (integration.value && item.integrationState !== integration.value) return false;
				if (!query) return true;
				return [
					item.name,
					item.code,
					item.summary,
					item.sourceName,
					item.sourceTable,
					item.impactScope
				].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
			});
		});
		const connectedCount = computed(() => rules.value.filter((item) => item.integrationState === "CONNECTED").length);
		const highRiskCount = computed(() => rules.value.filter((item) => ["HIGH", "CRITICAL"].includes(item.riskLevel)).length);
		const pendingCount = computed(() => rules.value.filter((item) => ["PARTIAL", "PLANNED"].includes(item.integrationState)).length);
		function loadRules() {
			return _loadRules.apply(this, arguments);
		}
		function _loadRules() {
			_loadRules = _asyncToGenerator(function* () {
				loading.value = true;
				loadError.value = "";
				try {
					rules.value = [...unwrapGovernanceData(yield settingsGovernanceApi.rules()) || []].sort((a, b) => {
						var _a$sort, _b$sort;
						return ((_a$sort = a.sort) !== null && _a$sort !== void 0 ? _a$sort : 9999) - ((_b$sort = b.sort) !== null && _b$sort !== void 0 ? _b$sort : 9999);
					});
				} catch (error) {
					rules.value = [];
					loadError.value = (error === null || error === void 0 ? void 0 : error.message) || "规则目录加载失败";
				} finally {
					loading.value = false;
				}
			});
			return _loadRules.apply(this, arguments);
		}
		function openManageRoute(route) {
			if (route === null || route === void 0 ? void 0 : route.startsWith("/")) router.push(route);
		}
		function riskLabel(value) {
			return {
				LOW: "低",
				MEDIUM: "中",
				HIGH: "高",
				CRITICAL: "极高"
			}[value] || value;
		}
		function riskTag(value) {
			return {
				LOW: "success",
				MEDIUM: "warning",
				HIGH: "danger",
				CRITICAL: "danger"
			}[value] || "info";
		}
		function integrationLabel(value) {
			return {
				CONNECTED: "已接入",
				PARTIAL: "部分接入",
				PLANNED: "规划中",
				READ_ONLY: "只读守卫"
			}[value] || value;
		}
		function integrationTag(value) {
			return {
				CONNECTED: "success",
				PARTIAL: "warning",
				PLANNED: "info",
				READ_ONLY: "info"
			}[value] || "info";
		}
		function sourceKindLabel(value) {
			return {
				VERSIONED_DOMAIN: "领域版本",
				DOMAIN_CONFIG: "领域配置",
				STATE_MACHINE: "状态机",
				CODE_POLICY: "代码策略",
				DOMAIN_AND_WORKFLOW: "领域 + 审批流程",
				MULTI_DOMAIN: "多领域事件",
				MIXED: "多来源",
				SECURITY_CORE: "安全核心"
			}[value] || value;
		}
		function changeModeLabel(value) {
			return {
				DRAFT_SIMULATE_PUBLISH: "草稿 → 模拟 → 发布",
				DOMAIN_SAVE: "领域页面保存",
				DRAFT_VALIDATE_PUBLISH: "草稿 → 校验 → 发布",
				VALIDATE_SIMULATE_SAVE: "校验 → 模拟 → 保存",
				READ_ONLY_GUARD: "领域守卫（只读）",
				VERSIONED_REQUIRED: "需先建设版本治理",
				GOVERNANCE_REQUIRED: "需先收口治理",
				COURSE_VERSION: "随课程版本",
				VALIDATE_PUBLISH: "校验 → 发布",
				SEPARATE_SECURITY_CENTER: "独立安全中心"
			}[value] || value;
		}
		onMounted(loadRules);
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_icon = ElIcon;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[5] || (_cache[5] = createBaseVNode("div", null, [
					createBaseVNode("div", { class: "eyebrow" }, "系统设置 · 规则治理目录"),
					createBaseVNode("h1", null, "规则设定中心"),
					createBaseVNode("p", null, "集中查找规则的真实来源、影响和风险；具体修改仍进入对应业务页面，不在这里复制第二套规则。")
				], -1)), createVNode(_component_el_button, {
					icon: unref(refresh_default),
					loading: loading.value,
					onClick: loadRules
				}, {
					default: withCtx(() => [..._cache[4] || (_cache[4] = [createTextVNode("刷新目录", -1)])]),
					_: 1
				}, 8, ["icon", "loading"])]),
				createVNode(_component_el_alert, {
					class: "boundary-alert",
					type: "info",
					closable: false,
					"show-icon": "",
					title: "这里是规则目录，不是万能规则编辑器",
					description: "已接入项可进入唯一业务设置入口；规划中、部分接入或只读项只展示现状。权限、财务状态机和认证安全不会在此放开修改。"
				}),
				createBaseVNode("section", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [createBaseVNode("strong", null, toDisplayString(rules.value.length), 1), _cache[6] || (_cache[6] = createBaseVNode("span", null, "已登记规则", -1))]),
					createBaseVNode("div", _hoisted_5, [createBaseVNode("strong", null, toDisplayString(connectedCount.value), 1), _cache[7] || (_cache[7] = createBaseVNode("span", null, "已接入真实入口", -1))]),
					createBaseVNode("div", _hoisted_6, [createBaseVNode("strong", null, toDisplayString(highRiskCount.value), 1), _cache[8] || (_cache[8] = createBaseVNode("span", null, "高/极高风险", -1))]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("strong", null, toDisplayString(pendingCount.value), 1), _cache[9] || (_cache[9] = createBaseVNode("span", null, "待治理或部分接入", -1))])
				]),
				createBaseVNode("section", _hoisted_8, [createBaseVNode("div", _hoisted_9, [
					createVNode(_component_el_input, {
						modelValue: keyword.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
						clearable: "",
						placeholder: "搜索规则、来源、影响范围",
						"prefix-icon": unref(search_default)
					}, null, 8, ["modelValue", "prefix-icon"]),
					createVNode(_component_el_select, {
						modelValue: domain.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => domain.value = $event),
						clearable: "",
						placeholder: "全部领域"
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(domainOptions.value, (item) => {
							return openBlock(), createBlock(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: risk.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => risk.value = $event),
						clearable: "",
						placeholder: "全部风险"
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(riskOptions, (item) => {
							return createVNode(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: integration.value,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => integration.value = $event),
						clearable: "",
						placeholder: "全部接入状态"
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(integrationOptions, (item) => {
							return createVNode(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"])
				]), withDirectives((openBlock(), createBlock(_component_el_table, {
					data: filteredRules.value,
					border: "",
					stripe: "",
					"row-key": "code"
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, { description: loadError.value || "没有符合条件的规则" }, {
						default: withCtx(() => [loadError.value ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							type: "primary",
							onClick: loadRules
						}, {
							default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("重新加载", -1)])]),
							_: 1
						})) : createCommentVNode("", true)]),
						_: 1
					}, 8, ["description"])]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "规则",
							"min-width": "250",
							fixed: "left"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_10, [
								createBaseVNode("div", _hoisted_11, toDisplayString(row.name), 1),
								createBaseVNode("div", _hoisted_12, toDisplayString(row.summary), 1),
								createBaseVNode("code", null, toDisplayString(row.code), 1)
							])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "领域",
							width: "130"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", null, toDisplayString(row.domainName), 1), createBaseVNode("span", _hoisted_13, toDisplayString(row.type), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "风险",
							width: "92",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: riskTag(row.riskLevel),
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(riskLabel(row.riskLevel)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "接入状态",
							width: "118",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: integrationTag(row.integrationState) }, {
								default: withCtx(() => [createTextVNode(toDisplayString(integrationLabel(row.integrationState)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "真实来源",
							"min-width": "220"
						}, {
							default: withCtx(({ row }) => [
								createBaseVNode("div", _hoisted_14, toDisplayString(row.sourceName), 1),
								createBaseVNode("div", _hoisted_15, toDisplayString(sourceKindLabel(row.sourceKind)), 1),
								row.sourceTable ? (openBlock(), createElementBlock("code", _hoisted_16, toDisplayString(row.sourceTable), 1)) : createCommentVNode("", true)
							]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "影响范围",
							"min-width": "240"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", null, toDisplayString(row.impactScope), 1), row.legacyWarning ? (openBlock(), createElementBlock("div", _hoisted_17, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(warning_filled_default))]),
								_: 1
							}), createTextVNode(toDisplayString(row.legacyWarning), 1)])) : createCommentVNode("", true)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "变更方式",
							"min-width": "180"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", null, toDisplayString(changeModeLabel(row.changeMode)), 1), createBaseVNode("div", _hoisted_18, [createBaseVNode("span", { class: normalizeClass({ available: row.supportsSimulation }) }, "模拟" + toDisplayString(row.supportsSimulation ? "支持" : "不支持"), 3), createBaseVNode("span", { class: normalizeClass({ available: row.supportsRollback }) }, "回滚" + toDisplayString(row.supportsRollback ? "支持" : "不支持"), 3)])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "设置入口",
							width: "118",
							align: "center",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [row.manageRoute ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								link: "",
								type: "primary",
								onClick: ($event) => openManageRoute(row.manageRoute)
							}, {
								default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("进入设置", -1)])]),
								_: 1
							}, 8, ["onClick"])) : (openBlock(), createElementBlock("span", _hoisted_19, "暂无安全入口"))]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]])])
			]);
		};
	}
}), [["__scopeId", "data-v-9788bbb3"]]);
//#endregion
export { rule_center_default as default };
