import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, dt as h, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kt as resolveComponent, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, Ct as arrow_left_default, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, T as ElProgress, V as ElDialog, X as ElRadio, _ as ElTableColumn, _t as ElFormItem, b as ElSteps, g as ElTable, gr as view_default, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tn as edit_pen_default, v as ElSwitch, vt as ElAlert, y as ElStep } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { a as poolRuleApi, i as poolConfigApi } from "./crm-DKTvHmZR.js";
//#region src/views/leads/pool-admin.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "rule-page" };
var _hoisted_2 = { class: "page-head" };
var _hoisted_3 = { class: "head-actions" };
var _hoisted_4 = {
	key: 0,
	class: "status-bar"
};
var _hoisted_5 = { class: "status-main" };
var _hoisted_6 = {
	key: 0,
	class: "summary-grid"
};
var _hoisted_7 = { class: "summary-card blue" };
var _hoisted_8 = { class: "card-lines" };
var _hoisted_9 = { class: "summary-card green" };
var _hoisted_10 = { class: "card-lines" };
var _hoisted_11 = { class: "summary-card amber" };
var _hoisted_12 = { class: "card-lines" };
var _hoisted_13 = { class: "summary-card red" };
var _hoisted_14 = { class: "usage-panel" };
var _hoisted_15 = { class: "usage-grid" };
var _hoisted_16 = { class: "usage-item" };
var _hoisted_17 = { class: "usage-item" };
var _hoisted_18 = { class: "usage-item" };
var _hoisted_19 = { class: "wizard-panel" };
var _hoisted_20 = { class: "wizard-content" };
var _hoisted_21 = {
	key: 0,
	class: "form-stage"
};
var _hoisted_22 = { class: "field-grid" };
var _hoisted_23 = {
	key: 1,
	class: "form-stage"
};
var _hoisted_24 = { class: "field-grid" };
var _hoisted_25 = {
	key: 2,
	class: "form-stage"
};
var _hoisted_26 = { class: "field-grid" };
var _hoisted_27 = { class: "switch-row" };
var _hoisted_28 = {
	key: 3,
	class: "form-stage review-stage"
};
var _hoisted_29 = { class: "review-grid" };
var _hoisted_30 = { class: "wizard-actions" };
var _hoisted_31 = { class: "plain-panel" };
var _hoisted_32 = { class: "section-title" };
var _hoisted_33 = { class: "plain-panel" };
var _hoisted_34 = {
	key: 0,
	class: "simulation-result"
};
var MAX_SINGLE_CLAIM_LIMIT = 1e4;
var MAX_SINGLE_IMPORT_LIMIT = 1e5;
//#endregion
//#region src/views/leads/pool-admin.vue
var pool_admin_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "pool-admin",
	setup(__props) {
		const RuleNumber = defineComponent({
			name: "RuleNumber",
			props: {
				modelValue: Number,
				label: String,
				unit: String,
				min: Number,
				max: Number
			},
			emits: ["update:modelValue"],
			setup(props, { emit }) {
				return () => h("label", { class: "rule-field" }, [h("span", props.label), h("div", { class: "number-wrap" }, [h(resolveComponent("el-input-number"), {
					modelValue: props.modelValue,
					min: props.min,
					max: props.max,
					controlsPosition: "right",
					"onUpdate:modelValue": (value) => emit("update:modelValue", value)
				}), h("em", props.unit)])]);
			}
		});
		const router = useRouter();
		const activeTab = ref("overview");
		const loading = ref(false);
		const loadingPools = ref(false);
		const overview = reactive({
			active: null,
			canManage: false,
			todayClaimed: 0,
			todayManualEntered: 0,
			todayImported: 0,
			versions: []
		});
		const activeRule = computed(() => overview.active);
		const pools = ref([]);
		const step = ref(0);
		const saving = ref(false);
		const simulating = ref(false);
		const publishing = ref(false);
		const simulationVisible = ref(false);
		const publishVisible = ref(false);
		const publishMode = ref("NEXT_DAY");
		const simulation = ref(null);
		const draftId = ref();
		const defaults = () => ({
			versionNo: 1,
			status: "DRAFT",
			dailyClaimLimit: 1e3,
			singleClaimLimit: 1e3,
			dailyManualEntryLimit: 1e3,
			singleImportLimit: 1e3,
			dailyImportLimit: 1e4,
			privateHoldingLimit: 1e3,
			privateWarningPercent: 90,
			protectionDays: 15,
			recycleNoFollowDays: 15,
			recycleWarningDays: 3,
			releaseCooldownDays: 15,
			duplicateBlockEnabled: true,
			changeSummary: ""
		});
		const form = reactive(defaults());
		const loadAll = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const data = yield poolRuleApi.overview();
					Object.assign(overview, data);
					yield loadPools();
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "规则读取失败");
				} finally {
					loading.value = false;
				}
			});
			return function loadAll() {
				return _ref.apply(this, arguments);
			};
		}();
		const loadPools = function() {
			var _ref2 = _asyncToGenerator(function* () {
				loadingPools.value = true;
				try {
					pools.value = yield poolConfigApi.list();
				} finally {
					loadingPools.value = false;
				}
			});
			return function loadPools() {
				return _ref2.apply(this, arguments);
			};
		}();
		const startEdit = () => {
			var _activeRule$value;
			Object.assign(form, defaults(), activeRule.value || {});
			form.id = void 0;
			form.status = "DRAFT";
			form.duplicateBlockEnabled = enabled((_activeRule$value = activeRule.value) === null || _activeRule$value === void 0 ? void 0 : _activeRule$value.duplicateBlockEnabled);
			form.changeSummary = "";
			draftId.value = void 0;
			step.value = 0;
			activeTab.value = "wizard";
		};
		const runSimulation = function() {
			var _ref3 = _asyncToGenerator(function* () {
				simulating.value = true;
				try {
					simulation.value = yield poolRuleApi.simulate(form);
					simulationVisible.value = true;
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "影响模拟失败");
				} finally {
					simulating.value = false;
				}
			});
			return function runSimulation() {
				return _ref3.apply(this, arguments);
			};
		}();
		const saveDraft = function() {
			var _ref4 = _asyncToGenerator(function* () {
				var _form$changeSummary;
				if (!((_form$changeSummary = form.changeSummary) === null || _form$changeSummary === void 0 ? void 0 : _form$changeSummary.trim())) {
					ElMessage.warning("请填写变更说明");
					return;
				}
				saving.value = true;
				try {
					draftId.value = (yield poolRuleApi.saveDraft(_objectSpread2(_objectSpread2({}, form), {}, { id: draftId.value }))).id;
					ElMessage.success("草稿已保存，发布后才会生效");
					publishVisible.value = true;
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "草稿保存失败");
				} finally {
					saving.value = false;
				}
			});
			return function saveDraft() {
				return _ref4.apply(this, arguments);
			};
		}();
		const publishDraft = function() {
			var _ref5 = _asyncToGenerator(function* () {
				if (!draftId.value) return;
				publishing.value = true;
				try {
					yield poolRuleApi.publish(draftId.value, publishMode.value);
					ElMessage.success(publishMode.value === "NEXT_DAY" ? "规则已安排次日生效" : "规则已立即生效");
					publishVisible.value = false;
					activeTab.value = "overview";
					yield loadAll();
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "规则发布失败");
				} finally {
					publishing.value = false;
				}
			});
			return function publishDraft() {
				return _ref5.apply(this, arguments);
			};
		}();
		const poolTypes = [
			{
				value: "collaboration",
				label: "协作公海"
			},
			{
				value: "telemarketing",
				label: "电销公海"
			},
			{
				value: "online",
				label: "线上公海"
			},
			{
				value: "new_leads",
				label: "新线索池"
			},
			{
				value: "recycle",
				label: "回收池"
			},
			{
				value: "treasure",
				label: "宝藏池"
			},
			{
				value: "frozen",
				label: "冷冻 / 私池"
			}
		];
		const poolTypeText = (value) => {
			var _poolTypes$find;
			return ((_poolTypes$find = poolTypes.find((item) => item.value === value)) === null || _poolTypes$find === void 0 ? void 0 : _poolTypes$find.label) || value;
		};
		const poolDialog = reactive({
			visible: false,
			editing: false
		});
		const savingPool = ref(false);
		const poolForm = reactive({});
		const openPoolDialog = (row) => {
			Object.assign(poolForm, {
				id: void 0,
				poolName: "",
				poolType: "collaboration",
				sortOrder: pools.value.length + 1,
				description: "",
				status: 0
			}, row || {});
			poolDialog.editing = Boolean(row);
			poolDialog.visible = true;
		};
		const savePool = function() {
			var _ref6 = _asyncToGenerator(function* () {
				var _poolForm$poolName;
				if (!((_poolForm$poolName = poolForm.poolName) === null || _poolForm$poolName === void 0 ? void 0 : _poolForm$poolName.trim())) {
					ElMessage.warning("请填写池名称");
					return;
				}
				savingPool.value = true;
				try {
					if (poolDialog.editing) yield poolConfigApi.update(poolForm);
					else yield poolConfigApi.create(poolForm);
					ElMessage.success("公海池已保存");
					poolDialog.visible = false;
					yield loadPools();
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "公海池保存失败");
				} finally {
					savingPool.value = false;
				}
			});
			return function savePool() {
				return _ref6.apply(this, arguments);
			};
		}();
		const enabled = (value) => value === true || value === 1;
		const enabledText = (value) => enabled(value) ? "已开启" : "已关闭";
		const usageRate = (used, limit) => !limit ? 0 : Math.min(100, Math.round(used * 100 / limit));
		const formatTime = (value) => value ? value.replace("T", " ").slice(0, 16) : "未设置";
		const statusText = (value) => ({
			ACTIVE: "生效中",
			SCHEDULED: "待生效",
			DRAFT: "草稿",
			ARCHIVED: "历史版本"
		})[value] || value;
		const statusType = (value) => ({
			ACTIVE: "success",
			SCHEDULED: "warning",
			DRAFT: "primary",
			ARCHIVED: "info"
		})[value] || "info";
		const goBack = () => router.push("/customer/workbench");
		onMounted(loadAll);
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_tag = ElTag;
			const _component_el_progress = ElProgress;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_alert = ElAlert;
			const _component_el_step = ElStep;
			const _component_el_steps = ElSteps;
			const _component_el_switch = ElSwitch;
			const _component_el_input = ElInput;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_tabs = ElTabs;
			const _component_el_dialog = ElDialog;
			const _component_el_radio = ElRadio;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input_number = ElInputNumber;
			const _component_el_form = ElForm;
			const _directive_loading = vLoading;
			return withDirectives((openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[33] || (_cache[33] = createBaseVNode("div", null, [
					createBaseVNode("div", { class: "eyebrow" }, "销售体系 / 业务规则"),
					createBaseVNode("h1", null, "公海私海规则"),
					createBaseVNode("p", null, "统一管理客户领取、录入、私海容量、保护期和自动回收。")
				], -1)), createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_button, {
						icon: unref(arrow_left_default),
						onClick: goBack
					}, {
						default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("返回工作台", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(refresh_default),
						onClick: loadAll
					}, {
						default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon"]),
					overview.canManage ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						type: "primary",
						icon: unref(edit_pen_default),
						onClick: startEdit
					}, {
						default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode(" 修改规则 ", -1)])]),
						_: 1
					}, 8, ["icon"])) : createCommentVNode("", true)
				])]),
				activeRule.value ? (openBlock(), createElementBlock("section", _hoisted_4, [createBaseVNode("div", _hoisted_5, [
					_cache[35] || (_cache[35] = createBaseVNode("span", { class: "status-dot" }, null, -1)),
					createBaseVNode("strong", null, "当前生效 V" + toDisplayString(activeRule.value.versionNo), 1),
					createVNode(_component_el_tag, {
						type: "success",
						effect: "light"
					}, {
						default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("运行中", -1)])]),
						_: 1
					}),
					createBaseVNode("span", null, toDisplayString(formatTime(activeRule.value.effectiveTime)) + " 起执行", 1)
				]), _cache[36] || (_cache[36] = createBaseVNode("div", { class: "status-note" }, " 规则变更只影响后续操作，不会批量改动现有客户归属。 ", -1))])) : createCommentVNode("", true),
				createVNode(_component_el_tabs, {
					modelValue: activeTab.value,
					"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => activeTab.value = $event),
					class: "main-tabs"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							label: "规则总览",
							name: "overview"
						}, {
							default: withCtx(() => {
								var _activeRule$value2, _activeRule$value3, _activeRule$value4, _activeRule$value5, _activeRule$value6, _activeRule$value7;
								return [
									activeRule.value ? (openBlock(), createElementBlock("div", _hoisted_6, [
										createBaseVNode("article", _hoisted_7, [
											_cache[37] || (_cache[37] = createBaseVNode("div", { class: "card-label" }, "领取与录入", -1)),
											createBaseVNode("strong", null, toDisplayString(activeRule.value.dailyClaimLimit), 1),
											_cache[38] || (_cache[38] = createBaseVNode("span", null, "条 / 人 / 日领取", -1)),
											createBaseVNode("div", _hoisted_8, [
												createBaseVNode("span", null, "单次领取 " + toDisplayString(activeRule.value.singleClaimLimit) + " 条", 1),
												createBaseVNode("span", null, "每日手工录入 " + toDisplayString(activeRule.value.dailyManualEntryLimit) + " 条", 1),
												createBaseVNode("span", null, "单次导入 " + toDisplayString(activeRule.value.singleImportLimit) + " 条", 1),
												createBaseVNode("span", null, "每日导入 " + toDisplayString(activeRule.value.dailyImportLimit) + " 条", 1)
											])
										]),
										createBaseVNode("article", _hoisted_9, [
											_cache[41] || (_cache[41] = createBaseVNode("div", { class: "card-label" }, "私海容量", -1)),
											createBaseVNode("strong", null, toDisplayString(activeRule.value.privateHoldingLimit), 1),
											_cache[42] || (_cache[42] = createBaseVNode("span", null, "条 / 人", -1)),
											createBaseVNode("div", _hoisted_10, [
												createBaseVNode("span", null, "达到 " + toDisplayString(activeRule.value.privateWarningPercent) + "% 开始预警", 1),
												_cache[39] || (_cache[39] = createBaseVNode("span", null, "领取和分配均检查容量", -1)),
												_cache[40] || (_cache[40] = createBaseVNode("span", null, "超限由后端直接拒绝", -1))
											])
										]),
										createBaseVNode("article", _hoisted_11, [
											_cache[43] || (_cache[43] = createBaseVNode("div", { class: "card-label" }, "保护与回收", -1)),
											createBaseVNode("strong", null, toDisplayString(activeRule.value.protectionDays), 1),
											_cache[44] || (_cache[44] = createBaseVNode("span", null, "天保护期", -1)),
											createBaseVNode("div", _hoisted_12, [
												createBaseVNode("span", null, toDisplayString(activeRule.value.recycleNoFollowDays) + " 天未跟进自动回收", 1),
												createBaseVNode("span", null, "提前 " + toDisplayString(activeRule.value.recycleWarningDays) + " 天提醒", 1),
												createBaseVNode("span", null, "释放后冷却 " + toDisplayString(activeRule.value.releaseCooldownDays) + " 天", 1)
											])
										]),
										createBaseVNode("article", _hoisted_13, [
											_cache[45] || (_cache[45] = createBaseVNode("div", { class: "card-label" }, "风险控制", -1)),
											createBaseVNode("strong", null, toDisplayString(enabledText(activeRule.value.duplicateBlockEnabled)), 1),
											_cache[46] || (_cache[46] = createBaseVNode("span", null, "重复客户拦截", -1)),
											_cache[47] || (_cache[47] = createBaseVNode("div", { class: "card-lines" }, [
												createBaseVNode("span", null, "按公司名、信用代码、电话查重"),
												createBaseVNode("span", null, "正式客户不重复进入线索池"),
												createBaseVNode("span", null, "所有版本保留发布记录")
											], -1))
										])
									])) : createCommentVNode("", true),
									createBaseVNode("section", _hoisted_14, [_cache[51] || (_cache[51] = createBaseVNode("div", { class: "section-title" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "今日个人用量"), createBaseVNode("p", null, "销售只看自己的额度，老板可在规则页查看全局规则。")])], -1)), createBaseVNode("div", _hoisted_15, [
										createBaseVNode("div", _hoisted_16, [
											_cache[48] || (_cache[48] = createBaseVNode("span", null, "已领取", -1)),
											createBaseVNode("strong", null, toDisplayString(overview.todayClaimed), 1),
											createVNode(_component_el_progress, {
												percentage: usageRate(overview.todayClaimed, (_activeRule$value2 = activeRule.value) === null || _activeRule$value2 === void 0 ? void 0 : _activeRule$value2.dailyClaimLimit),
												"show-text": false
											}, null, 8, ["percentage"]),
											createBaseVNode("small", null, "上限 " + toDisplayString(((_activeRule$value3 = activeRule.value) === null || _activeRule$value3 === void 0 ? void 0 : _activeRule$value3.dailyClaimLimit) || 0), 1)
										]),
										createBaseVNode("div", _hoisted_17, [
											_cache[49] || (_cache[49] = createBaseVNode("span", null, "已手工录入", -1)),
											createBaseVNode("strong", null, toDisplayString(overview.todayManualEntered), 1),
											createVNode(_component_el_progress, {
												percentage: usageRate(overview.todayManualEntered, (_activeRule$value4 = activeRule.value) === null || _activeRule$value4 === void 0 ? void 0 : _activeRule$value4.dailyManualEntryLimit),
												"show-text": false
											}, null, 8, ["percentage"]),
											createBaseVNode("small", null, "上限 " + toDisplayString(((_activeRule$value5 = activeRule.value) === null || _activeRule$value5 === void 0 ? void 0 : _activeRule$value5.dailyManualEntryLimit) || 0), 1)
										]),
										createBaseVNode("div", _hoisted_18, [
											_cache[50] || (_cache[50] = createBaseVNode("span", null, "已批量导入", -1)),
											createBaseVNode("strong", null, toDisplayString(overview.todayImported), 1),
											createVNode(_component_el_progress, {
												percentage: usageRate(overview.todayImported, (_activeRule$value6 = activeRule.value) === null || _activeRule$value6 === void 0 ? void 0 : _activeRule$value6.dailyImportLimit),
												"show-text": false
											}, null, 8, ["percentage"]),
											createBaseVNode("small", null, "上限 " + toDisplayString(((_activeRule$value7 = activeRule.value) === null || _activeRule$value7 === void 0 ? void 0 : _activeRule$value7.dailyImportLimit) || 0), 1)
										])
									])]),
									_cache[52] || (_cache[52] = createBaseVNode("section", { class: "plain-panel" }, [createBaseVNode("div", { class: "section-title" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "新人怎么理解"), createBaseVNode("p", null, "把公海私海看成一条客户流转线。")])]), createBaseVNode("div", { class: "simple-flow" }, [
										createBaseVNode("div", null, [
											createBaseVNode("b", null, "1"),
											createBaseVNode("strong", null, "进入公海"),
											createBaseVNode("span", null, "录入、导入、释放或回收")
										]),
										createBaseVNode("i", null, "→"),
										createBaseVNode("div", null, [
											createBaseVNode("b", null, "2"),
											createBaseVNode("strong", null, "领取到私海"),
											createBaseVNode("span", null, "检查每日额度和个人容量")
										]),
										createBaseVNode("i", null, "→"),
										createBaseVNode("div", null, [
											createBaseVNode("b", null, "3"),
											createBaseVNode("strong", null, "持续跟进"),
											createBaseVNode("span", null, "每次有效跟进会顺延保护期")
										]),
										createBaseVNode("i", null, "→"),
										createBaseVNode("div", null, [
											createBaseVNode("b", null, "4"),
											createBaseVNode("strong", null, "成交或回收"),
											createBaseVNode("span", null, "成交转客户，长期不跟进回公海")
										])
									])], -1))
								];
							}),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "配置向导",
							name: "wizard"
						}, {
							default: withCtx(() => [createBaseVNode("section", _hoisted_19, [
								!overview.canManage ? (openBlock(), createBlock(_component_el_alert, {
									key: 0,
									type: "info",
									closable: false,
									title: "当前账号可查看规则，但只有老板或超级管理员可以修改和发布。"
								})) : createCommentVNode("", true),
								createVNode(_component_el_steps, {
									active: step.value,
									"finish-status": "success",
									"align-center": ""
								}, {
									default: withCtx(() => [
										createVNode(_component_el_step, { title: "领取与录入" }),
										createVNode(_component_el_step, { title: "私海容量" }),
										createVNode(_component_el_step, { title: "保护与回收" }),
										createVNode(_component_el_step, { title: "确认发布" })
									]),
									_: 1
								}, 8, ["active"]),
								createBaseVNode("div", _hoisted_20, [step.value === 0 ? (openBlock(), createElementBlock("div", _hoisted_21, [
									_cache[53] || (_cache[53] = createBaseVNode("h2", null, "领取与录入数量", -1)),
									_cache[54] || (_cache[54] = createBaseVNode("p", null, "限制单个销售一天能拿多少、录多少，避免抢占过多资源。", -1)),
									_cache[55] || (_cache[55] = createBaseVNode("p", { class: "limit-hint" }, "单次上限可直接输入；如高于对应每日上限，保存时会提示先同步提高每日上限。", -1)),
									createBaseVNode("div", _hoisted_22, [
										createVNode(unref(RuleNumber), {
											modelValue: form.dailyClaimLimit,
											"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.dailyClaimLimit = $event),
											label: "每日领取上限",
											unit: "条 / 人 / 日",
											min: 1,
											max: 1e4
										}, null, 8, ["modelValue"]),
										createVNode(unref(RuleNumber), {
											modelValue: form.singleClaimLimit,
											"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.singleClaimLimit = $event),
											label: "单次领取上限",
											unit: "条 / 次",
											min: 1,
											max: MAX_SINGLE_CLAIM_LIMIT
										}, null, 8, ["modelValue"]),
										createVNode(unref(RuleNumber), {
											modelValue: form.dailyManualEntryLimit,
											"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.dailyManualEntryLimit = $event),
											label: "每日手工录入上限",
											unit: "条 / 人 / 日",
											min: 1,
											max: 1e4
										}, null, 8, ["modelValue"]),
										createVNode(unref(RuleNumber), {
											modelValue: form.singleImportLimit,
											"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.singleImportLimit = $event),
											label: "单次批量导入上限",
											unit: "条 / 次",
											min: 1,
											max: MAX_SINGLE_IMPORT_LIMIT
										}, null, 8, ["modelValue"]),
										createVNode(unref(RuleNumber), {
											modelValue: form.dailyImportLimit,
											"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.dailyImportLimit = $event),
											label: "每日批量导入上限",
											unit: "条 / 人 / 日",
											min: 1,
											max: 1e5
										}, null, 8, ["modelValue"])
									])
								])) : step.value === 1 ? (openBlock(), createElementBlock("div", _hoisted_23, [
									_cache[56] || (_cache[56] = createBaseVNode("h2", null, "私海容量", -1)),
									_cache[57] || (_cache[57] = createBaseVNode("p", null, "客户被领取或分配后进入个人私海，满额后必须先跟进、成交或释放。", -1)),
									createBaseVNode("div", _hoisted_24, [createVNode(unref(RuleNumber), {
										modelValue: form.privateHoldingLimit,
										"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.privateHoldingLimit = $event),
										label: "个人私海容量",
										unit: "条 / 人",
										min: 1,
										max: 1e4
									}, null, 8, ["modelValue"]), createVNode(unref(RuleNumber), {
										modelValue: form.privateWarningPercent,
										"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.privateWarningPercent = $event),
										label: "容量预警线",
										unit: "%",
										min: 50,
										max: 100
									}, null, 8, ["modelValue"])]),
									createVNode(_component_el_alert, {
										type: "warning",
										closable: false,
										title: "降低容量前请先运行影响模拟，超量员工不会被自动删客户，但将无法继续领取或被分配。"
									})
								])) : step.value === 2 ? (openBlock(), createElementBlock("div", _hoisted_25, [
									_cache[59] || (_cache[59] = createBaseVNode("h2", null, "保护与自动回收", -1)),
									_cache[60] || (_cache[60] = createBaseVNode("p", null, "跟进中的客户有保护期，长期不跟进才会回公海，防止客户被长期占住。", -1)),
									createBaseVNode("div", _hoisted_26, [
										createVNode(unref(RuleNumber), {
											modelValue: form.protectionDays,
											"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.protectionDays = $event),
											label: "客户保护期",
											unit: "天",
											min: 1,
											max: 365
										}, null, 8, ["modelValue"]),
										createVNode(unref(RuleNumber), {
											modelValue: form.recycleNoFollowDays,
											"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.recycleNoFollowDays = $event),
											label: "未跟进回收",
											unit: "天",
											min: 1,
											max: 365
										}, null, 8, ["modelValue"]),
										createVNode(unref(RuleNumber), {
											modelValue: form.recycleWarningDays,
											"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.recycleWarningDays = $event),
											label: "回收前预警",
											unit: "天",
											min: 1,
											max: 30
										}, null, 8, ["modelValue"]),
										createVNode(unref(RuleNumber), {
											modelValue: form.releaseCooldownDays,
											"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.releaseCooldownDays = $event),
											label: "释放后冷却",
											unit: "天",
											min: 0,
											max: 365
										}, null, 8, ["modelValue"])
									]),
									createBaseVNode("div", _hoisted_27, [_cache[58] || (_cache[58] = createBaseVNode("div", null, [createBaseVNode("strong", null, "重复客户拦截"), createBaseVNode("span", null, "新建线索时检查公司名、信用代码和联系电话。")], -1)), createVNode(_component_el_switch, {
										modelValue: form.duplicateBlockEnabled,
										"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.duplicateBlockEnabled = $event)
									}, null, 8, ["modelValue"])])
								])) : (openBlock(), createElementBlock("div", _hoisted_28, [
									_cache[61] || (_cache[61] = createBaseVNode("h2", null, "确认并发布", -1)),
									_cache[62] || (_cache[62] = createBaseVNode("p", null, "建议先模拟，再保存草稿，默认次日 00:00 生效，避免工作中途改变口径。", -1)),
									createVNode(_component_el_input, {
										modelValue: form.changeSummary,
										"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.changeSummary = $event),
										maxlength: "255",
										"show-word-limit": "",
										placeholder: "请简要说明为什么调整，例如：新人入职，统一每日领取与录入规则"
									}, null, 8, ["modelValue"]),
									createBaseVNode("div", _hoisted_29, [
										createBaseVNode("span", null, "领取 " + toDisplayString(form.dailyClaimLimit) + "/日", 1),
										createBaseVNode("span", null, "录入 " + toDisplayString(form.dailyManualEntryLimit) + "/日", 1),
										createBaseVNode("span", null, "私海 " + toDisplayString(form.privateHoldingLimit) + "/人", 1),
										createBaseVNode("span", null, "保护 " + toDisplayString(form.protectionDays) + " 天", 1),
										createBaseVNode("span", null, "未跟进 " + toDisplayString(form.recycleNoFollowDays) + " 天回收", 1),
										createBaseVNode("span", null, "查重 " + toDisplayString(form.duplicateBlockEnabled ? "开启" : "关闭"), 1)
									])
								]))]),
								createBaseVNode("footer", _hoisted_30, [createVNode(_component_el_button, {
									disabled: step.value === 0,
									onClick: _cache[13] || (_cache[13] = ($event) => step.value--)
								}, {
									default: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("上一步", -1)])]),
									_: 1
								}, 8, ["disabled"]), step.value < 3 ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									type: "primary",
									onClick: _cache[14] || (_cache[14] = ($event) => step.value++)
								}, {
									default: withCtx(() => [..._cache[64] || (_cache[64] = [createTextVNode("下一步", -1)])]),
									_: 1
								})) : overview.canManage ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(_component_el_button, {
									icon: unref(view_default),
									loading: simulating.value,
									onClick: runSimulation
								}, {
									default: withCtx(() => [..._cache[65] || (_cache[65] = [createTextVNode("影响模拟", -1)])]),
									_: 1
								}, 8, ["icon", "loading"]), createVNode(_component_el_button, {
									type: "primary",
									loading: saving.value,
									onClick: saveDraft
								}, {
									default: withCtx(() => [..._cache[66] || (_cache[66] = [createTextVNode("保存草稿", -1)])]),
									_: 1
								}, 8, ["loading"])], 64)) : createCommentVNode("", true)])
							])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "客户流转",
							name: "flow"
						}, {
							default: withCtx(() => [..._cache[67] || (_cache[67] = [createBaseVNode("section", { class: "flow-panel" }, [createBaseVNode("div", { class: "flow-row" }, [
								createBaseVNode("div", { class: "flow-node source" }, [
									createBaseVNode("span", null, "01"),
									createBaseVNode("strong", null, "客户进入"),
									createBaseVNode("p", null, "手工录入、批量导入、公司公海")
								]),
								createBaseVNode("div", { class: "flow-arrow" }, [createTextVNode("→"), createBaseVNode("small", null, "数量与查重校验")]),
								createBaseVNode("div", { class: "flow-node pool" }, [
									createBaseVNode("span", null, "02"),
									createBaseVNode("strong", null, "公司公海"),
									createBaseVNode("p", null, "待领取、待分配、可重新流转")
								]),
								createBaseVNode("div", { class: "flow-arrow" }, [createTextVNode("→"), createBaseVNode("small", null, "领取与容量校验")]),
								createBaseVNode("div", { class: "flow-node private" }, [
									createBaseVNode("span", null, "03"),
									createBaseVNode("strong", null, "销售私海"),
									createBaseVNode("p", null, "负责人持续跟进，保护期内锁定")
								]),
								createBaseVNode("div", { class: "flow-arrow" }, [createTextVNode("→"), createBaseVNode("small", null, "跟进结果")]),
								createBaseVNode("div", { class: "flow-node finish" }, [
									createBaseVNode("span", null, "04"),
									createBaseVNode("strong", null, "成交 / 回收"),
									createBaseVNode("p", null, "成交进入客户库，超期返回公海")
								])
							]), createBaseVNode("div", { class: "flow-rules" }, [
								createBaseVNode("article", null, [createBaseVNode("strong", null, "领取时"), createBaseVNode("p", null, "先检查今日领取量，再检查个人私海是否有空位，两项都通过才成功。")]),
								createBaseVNode("article", null, [createBaseVNode("strong", null, "跟进时"), createBaseVNode("p", null, "写入有效跟进后，客户保护期从当天重新计算，不会误回收活跃客户。")]),
								createBaseVNode("article", null, [createBaseVNode("strong", null, "回收时"), createBaseVNode("p", null, "必须同时满足保护期已过且连续未跟进；任务按租户分别读取规则。")]),
								createBaseVNode("article", null, [createBaseVNode("strong", null, "释放后"), createBaseVNode("p", null, "原负责人进入冷却期，避免刚释放又立即抢回同一客户。")])
							])], -1)])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "公海池",
							name: "pools"
						}, {
							default: withCtx(() => [createBaseVNode("section", _hoisted_31, [createBaseVNode("div", _hoisted_32, [_cache[69] || (_cache[69] = createBaseVNode("div", null, [createBaseVNode("h2", null, "公海池"), createBaseVNode("p", null, "池决定客户放在哪里，规则决定客户怎么流转。")], -1)), overview.canManage ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								type: "primary",
								icon: unref(plus_default),
								onClick: _cache[15] || (_cache[15] = ($event) => openPoolDialog())
							}, {
								default: withCtx(() => [..._cache[68] || (_cache[68] = [createTextVNode("新增池", -1)])]),
								_: 1
							}, 8, ["icon"])) : createCommentVNode("", true)]), withDirectives((openBlock(), createBlock(_component_el_table, {
								data: pools.value,
								class: "data-table"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										prop: "poolName",
										label: "池名称",
										"min-width": "180"
									}),
									createVNode(_component_el_table_column, {
										label: "类型",
										width: "140"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_tag, { effect: "plain" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(poolTypeText(row.poolType)), 1)]),
											_: 2
										}, 1024)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										prop: "description",
										label: "用途说明",
										"min-width": "260",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										prop: "sortOrder",
										label: "排序",
										width: "80",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										label: "状态",
										width: "100"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: row.status === 0 ? "success" : "info" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(row.status === 0 ? "启用" : "停用"), 1)]),
											_: 2
										}, 1032, ["type"])]),
										_: 1
									}),
									overview.canManage ? (openBlock(), createBlock(_component_el_table_column, {
										key: 0,
										label: "操作",
										width: "100",
										fixed: "right"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_button, {
											link: "",
											type: "primary",
											onClick: ($event) => openPoolDialog(row)
										}, {
											default: withCtx(() => [..._cache[70] || (_cache[70] = [createTextVNode("编辑", -1)])]),
											_: 1
										}, 8, ["onClick"])]),
										_: 1
									})) : createCommentVNode("", true)
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, loadingPools.value]])])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "版本记录",
							name: "versions"
						}, {
							default: withCtx(() => [createBaseVNode("section", _hoisted_33, [_cache[71] || (_cache[71] = createBaseVNode("div", { class: "section-title" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "版本记录"), createBaseVNode("p", null, "每次发布都保留口径、说明、发布时间和生效时间。")])], -1)), createVNode(_component_el_table, {
								data: overview.versions,
								class: "data-table"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										label: "版本",
										width: "90"
									}, {
										default: withCtx(({ row }) => [createBaseVNode("strong", null, "V" + toDisplayString(row.versionNo), 1)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "状态",
										width: "110"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: statusType(row.status) }, {
											default: withCtx(() => [createTextVNode(toDisplayString(statusText(row.status)), 1)]),
											_: 2
										}, 1032, ["type"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										prop: "changeSummary",
										label: "变更说明",
										"min-width": "240",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										label: "领取 / 私海",
										width: "180"
									}, {
										default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.dailyClaimLimit) + " / " + toDisplayString(row.privateHoldingLimit), 1)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "保护 / 回收",
										width: "180"
									}, {
										default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.protectionDays) + "天 / " + toDisplayString(row.recycleNoFollowDays) + "天", 1)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "生效时间",
										width: "190"
									}, {
										default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatTime(row.effectiveTime)), 1)]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: simulationVisible.value,
					"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => simulationVisible.value = $event),
					title: "规则影响模拟",
					width: "min(680px, 92vw)"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[17] || (_cache[17] = ($event) => simulationVisible.value = false) }, {
						default: withCtx(() => [..._cache[74] || (_cache[74] = [createTextVNode("关闭", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[18] || (_cache[18] = ($event) => simulationVisible.value = false)
					}, {
						default: withCtx(() => [..._cache[75] || (_cache[75] = [createTextVNode("我已了解", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [simulation.value ? (openBlock(), createElementBlock("div", _hoisted_34, [
						createVNode(_component_el_alert, {
							type: "info",
							closable: false,
							title: "本次只是读取和计算，不会修改任何客户或员工数据。"
						}),
						createBaseVNode("div", null, [_cache[72] || (_cache[72] = createBaseVNode("span", null, "超过新私海容量的员工", -1)), createBaseVNode("strong", null, toDisplayString(simulation.value.ownersOverHolding) + " 人", 1)]),
						createBaseVNode("div", null, [_cache[73] || (_cache[73] = createBaseVNode("span", null, "按新回收规则预计进入回收范围", -1)), createBaseVNode("strong", null, toDisplayString(simulation.value.recycleCandidates) + " 条", 1)]),
						createBaseVNode("p", null, "建议生效时间：" + toDisplayString(formatTime(simulation.value.effectiveTime)), 1)
					])) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: publishVisible.value,
					"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => publishVisible.value = $event),
					title: "发布规则",
					width: "min(520px, 92vw)"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[21] || (_cache[21] = ($event) => publishVisible.value = false) }, {
						default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: publishing.value,
						onClick: publishDraft
					}, {
						default: withCtx(() => [..._cache[79] || (_cache[79] = [createTextVNode("确认发布", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_radio_group, {
						modelValue: publishMode.value,
						"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => publishMode.value = $event),
						class: "publish-options"
					}, {
						default: withCtx(() => [createVNode(_component_el_radio, {
							value: "NEXT_DAY",
							border: ""
						}, {
							default: withCtx(() => [..._cache[76] || (_cache[76] = [createTextVNode("次日 00:00 生效（推荐）", -1)])]),
							_: 1
						}), createVNode(_component_el_radio, {
							value: "IMMEDIATE",
							border: ""
						}, {
							default: withCtx(() => [..._cache[77] || (_cache[77] = [createTextVNode("立即生效", -1)])]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"]), createVNode(_component_el_alert, {
						type: "warning",
						closable: false,
						title: "立即生效会影响正在领取、录入和分配的销售，请避开高峰时段。"
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: poolDialog.visible,
					"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => poolDialog.visible = $event),
					title: poolDialog.editing ? "编辑公海池" : "新增公海池",
					width: "min(560px, 92vw)"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[28] || (_cache[28] = ($event) => poolDialog.visible = false) }, {
						default: withCtx(() => [..._cache[80] || (_cache[80] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: savingPool.value,
						onClick: savePool
					}, {
						default: withCtx(() => [..._cache[81] || (_cache[81] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: poolForm,
						"label-width": "100px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "池名称" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: poolForm.poolName,
									"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => poolForm.poolName = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "池类型" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: poolForm.poolType,
									"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => poolForm.poolType = $event),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(poolTypes, (item) => {
										return createVNode(_component_el_option, {
											key: item.value,
											label: item.label,
											value: item.value
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "排序" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: poolForm.sortOrder,
									"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => poolForm.sortOrder = $event),
									min: 1,
									max: 99
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "用途说明" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: poolForm.description,
									"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => poolForm.description = $event),
									type: "textarea",
									rows: 3,
									maxlength: "255",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							poolDialog.editing ? (openBlock(), createBlock(_component_el_form_item, {
								key: 0,
								label: "状态"
							}, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: poolForm.status,
									"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => poolForm.status = $event),
									"active-value": 0,
									"inactive-value": 1,
									"active-text": "启用",
									"inactive-text": "停用"
								}, null, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true)
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			])), [[_directive_loading, loading.value]]);
		};
	}
}), [["__scopeId", "data-v-034ce45e"]]);
//#endregion
export { pool_admin_default as default };
