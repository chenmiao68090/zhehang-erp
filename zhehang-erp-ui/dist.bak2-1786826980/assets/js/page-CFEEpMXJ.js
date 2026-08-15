import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, gt as nextTick, h as _objectWithoutProperties, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $t as download_default, Bn as refresh_default, D as ElPagination, Dr as withModifiers, Er as withKeys, F as ElEmpty, H as ElDescriptions, I as ElDropdown, L as ElDropdownItem, M as ElInputNumber, Nn as plus_default, Pt as circle_check_default, Qt as document_default, R as ElDropdownMenu, S as ElSkeleton, St as arrow_down_default, T as ElProgress, Tt as arrow_up_default, U as ElDescriptionsItem, Un as search_default, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, b as ElSteps, c as ElSegmented, f as ElTimeline, fn as info_filled_default, g as ElTable, gt as ElForm, it as ElTag, kn as paperclip_default, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, p as ElTimelineItem, qn as set_up_default, rt as ElSelect, s as vLoading, sr as timer_default, ur as upload_default, v as ElSwitch, w as ElRate, y as ElStep, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { r as requireFeigeSuitePage, t as FEIGE_SUITE_GROUPS } from "./catalog-BHsgVXPT.js";
import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
//#region src/api/feige-suite.ts
var _excluded = [
	"current",
	"size",
	"keyword",
	"status",
	"ownerId",
	"bizDate"
];
function unwrap(request) {
	return request.then((response) => {
		if (response && typeof response === "object" && "code" in response && "data" in response) return response.data;
		return response;
	});
}
//#endregion
//#region src/views/feige-suite/data-source.production.ts
var feigeSuiteDataSource = {
	pages: () => unwrap(get("/feige-suite/pages")),
	staffOptions: () => unwrap(get("/feige-suite/staff-options")),
	capabilities: (pageCode) => unwrap(get(`/feige-suite/pages/${pageCode}/capabilities`)),
	summary: (pageCode) => unwrap(get(`/feige-suite/pages/${pageCode}/summary`)),
	records: (pageCode, params) => {
		const { current, size, keyword, status, ownerId, bizDate } = params, customFilters = _objectWithoutProperties(params, _excluded);
		const filters = Object.fromEntries(Object.entries(customFilters).filter(([, value]) => value !== "" && value !== null && value !== void 0));
		return unwrap(get(`/feige-suite/pages/${pageCode}/records`, {
			pageNum: current,
			pageSize: size,
			keyword: keyword || void 0,
			status: status || void 0,
			ownerId: ownerId || void 0,
			startDate: bizDate || void 0,
			endDate: bizDate || void 0,
			filters: Object.keys(filters).length ? JSON.stringify(filters) : void 0
		}));
	},
	detail: (pageCode, id) => unwrap(get(`/feige-suite/pages/${pageCode}/records/${id}`)),
	create: (pageCode, data) => unwrap(post(`/feige-suite/pages/${pageCode}/records`, data)),
	update: (pageCode, id, data) => unwrap(put(`/feige-suite/pages/${pageCode}/records/${id}`, data)),
	action: (pageCode, id, data) => unwrap(post(`/feige-suite/pages/${pageCode}/records/${id}/action`, data)),
	remove: (pageCode, id) => unwrap(del(`/feige-suite/pages/${pageCode}/records/${id}`))
};
var previewEnabled = () => false;
var announceDemoMode = () => void 0;
//#endregion
//#region src/views/feige-suite/components/PageSpecialty.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = {
	key: 0,
	class: "specialty dashboard-specialty"
};
var _hoisted_2$3 = { class: "metric-grid" };
var _hoisted_3$3 = { class: "trend-panel" };
var _hoisted_4$2 = { class: "trend-head" };
var _hoisted_5$2 = { class: "bars" };
var _hoisted_6$2 = {
	key: 1,
	class: "specialty exam-specialty"
};
var _hoisted_7$2 = { class: "exam-card-top" };
var _hoisted_8$1 = { class: "exam-meta" };
var _hoisted_9$1 = { class: "exam-actions" };
var _hoisted_10$1 = {
	key: 0,
	class: "score"
};
var _hoisted_11$1 = {
	key: 2,
	class: "specialty handover-specialty"
};
var _hoisted_12$1 = { class: "handover-note" };
var _hoisted_13$1 = {
	key: 3,
	class: "specialty salary-specialty"
};
var _hoisted_14$1 = { class: "salary-total" };
var _hoisted_15$1 = {
	key: 4,
	class: "specialty config-specialty"
};
//#endregion
//#region src/views/feige-suite/components/PageSpecialty.vue
var PageSpecialty_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "PageSpecialty",
	props: {
		page: {},
		records: {},
		total: {},
		statuses: {}
	},
	emits: ["run-action", "view"],
	setup(__props) {
		const props = __props;
		const labels = computed(() => {
			var _props$page$statLabel;
			return ((_props$page$statLabel = props.page.statLabels) === null || _props$page$statLabel === void 0 ? void 0 : _props$page$statLabel.length) ? props.page.statLabels : [
				"记录总数",
				"进行中",
				"已完成",
				"完成率"
			];
		});
		const groupColor = computed(() => {
			var _FEIGE_SUITE_GROUPS$f;
			return ((_FEIGE_SUITE_GROUPS$f = FEIGE_SUITE_GROUPS.find((group) => group.code === props.page.group)) === null || _FEIGE_SUITE_GROUPS$f === void 0 ? void 0 : _FEIGE_SUITE_GROUPS$f.color) || "#2563eb";
		});
		const barHeights = computed(() => [
			42,
			55,
			48,
			68,
			76,
			Math.min(94, 62 + props.total)
		]);
		const totalMoney = computed(() => props.records.reduce((sum, item) => {
			var _item$data, _item$data2;
			return sum + Number(item.amount || ((_item$data = item.data) === null || _item$data === void 0 ? void 0 : _item$data.netSalary) || ((_item$data2 = item.data) === null || _item$data2 === void 0 ? void 0 : _item$data2.commission) || 0);
		}, 0));
		const handoverStep = computed(() => props.statuses.completed ? 4 : props.statuses.approved ? 3 : props.statuses.pending ? 2 : 1);
		const salaryStages = computed(() => [
			{
				status: "draft",
				label: "待生成",
				count: props.statuses.draft || 0
			},
			{
				status: "pending",
				label: "待审核",
				count: props.statuses.pending || 0
			},
			{
				status: "approved",
				label: "待发放",
				count: props.statuses.approved || 0
			},
			{
				status: "paid",
				label: "已发放",
				count: props.statuses.paid || 0
			}
		].map((item) => _objectSpread2(_objectSpread2({}, item), {}, { percent: props.total ? Math.round(item.count / props.total * 100) : 0 })));
		function metricValue(index) {
			if (index === 0) return String(props.total);
			if (index === 1) return String((props.statuses.active || 0) + (props.statuses.pending || 0) + (props.statuses.in_progress || 0));
			if (index === 2) return String((props.statuses.completed || 0) + (props.statuses.approved || 0) + (props.statuses.paid || 0));
			const done = (props.statuses.completed || 0) + (props.statuses.approved || 0) + (props.statuses.paid || 0);
			return `${props.total ? Math.round(done / props.total * 100) : 0}%`;
		}
		function money(value) {
			return value.toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		}
		function statusLabel(status) {
			return {
				pending: "待开始",
				in_progress: "进行中",
				completed: "已完成"
			}[status] || status;
		}
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_step = ElStep;
			const _component_el_steps = ElSteps;
			const _component_el_progress = ElProgress;
			return __props.page.kind === "dashboard" || __props.page.kind === "analysis" ? (openBlock(), createElementBlock("section", _hoisted_1$3, [createBaseVNode("div", _hoisted_2$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(labels.value, (label, index) => {
				return openBlock(), createElementBlock("div", {
					key: label,
					class: "metric-item"
				}, [
					createBaseVNode("span", null, toDisplayString(label), 1),
					createBaseVNode("strong", null, toDisplayString(metricValue(index)), 1),
					createBaseVNode("small", null, toDisplayString(index % 2 ? "较上期 +6.8%" : "LOCAL-DEMO实时汇总"), 1)
				]);
			}), 128))]), createBaseVNode("div", _hoisted_3$3, [createBaseVNode("div", _hoisted_4$2, [createBaseVNode("strong", null, toDisplayString(__props.page.kind === "analysis" ? "结构分析" : "完成趋势"), 1), _cache[0] || (_cache[0] = createBaseVNode("span", null, "最近6个周期", -1))]), createBaseVNode("div", _hoisted_5$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(barHeights.value, (height, index) => {
				return openBlock(), createElementBlock("div", {
					key: index,
					class: "bar-cell"
				}, [createBaseVNode("div", {
					class: "bar",
					style: normalizeStyle({
						height: `${height}%`,
						background: groupColor.value
					})
				}, [createBaseVNode("span", null, toDisplayString(height), 1)], 4), createBaseVNode("small", null, toDisplayString(index + 1) + "期", 1)]);
			}), 128))])])])) : __props.page.kind === "exam" ? (openBlock(), createElementBlock("section", _hoisted_6$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.records.slice(0, 2), (record) => {
				var _record$data, _record$data2, _record$data3, _record$data4, _record$data5, _record$data6;
				return openBlock(), createElementBlock("article", {
					key: record.id,
					class: "exam-card"
				}, [
					createBaseVNode("div", _hoisted_7$2, [createBaseVNode("strong", null, toDisplayString(record.title), 1), createVNode(_component_el_tag, { type: record.status === "completed" ? "success" : "primary" }, {
						default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(record.status)), 1)]),
						_: 2
					}, 1032, ["type"])]),
					createBaseVNode("p", null, toDisplayString(((_record$data = record.data) === null || _record$data === void 0 ? void 0 : _record$data.description) || ((_record$data2 = record.data) === null || _record$data2 === void 0 ? void 0 : _record$data2.customerSays) || "LOCAL-DEMO：按真实旧页面结构展示考试说明、题量、时限和及格标准。"), 1),
					createBaseVNode("div", _hoisted_8$1, [
						createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(document_default))]),
							_: 1
						}), createTextVNode(toDisplayString(((_record$data3 = record.data) === null || _record$data3 === void 0 ? void 0 : _record$data3.questionCount) || 5) + "题", 1)]),
						createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(timer_default))]),
							_: 1
						}), createTextVNode(toDisplayString(((_record$data4 = record.data) === null || _record$data4 === void 0 ? void 0 : _record$data4.duration) || 30) + "分钟", 1)]),
						createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(circle_check_default))]),
							_: 1
						}), createTextVNode("及格" + toDisplayString(((_record$data5 = record.data) === null || _record$data5 === void 0 ? void 0 : _record$data5.passScore) || 60) + "分", 1)])
					]),
					createBaseVNode("div", _hoisted_9$1, [record.status === "completed" ? (openBlock(), createElementBlock("strong", _hoisted_10$1, "得分 " + toDisplayString(((_record$data6 = record.data) === null || _record$data6 === void 0 ? void 0 : _record$data6.score) || 88), 1)) : (openBlock(), createBlock(_component_el_button, {
						key: 1,
						type: "primary",
						onClick: ($event) => _ctx.$emit("run-action", record, "start")
					}, {
						default: withCtx(() => [..._cache[1] || (_cache[1] = [createTextVNode("开始", -1)])]),
						_: 1
					}, 8, ["onClick"])), record.status === "completed" ? (openBlock(), createBlock(_component_el_button, {
						key: 2,
						onClick: ($event) => _ctx.$emit("view", record)
					}, {
						default: withCtx(() => [..._cache[2] || (_cache[2] = [createTextVNode("查看详情", -1)])]),
						_: 1
					}, 8, ["onClick"])) : createCommentVNode("", true)])
				]);
			}), 128))])) : __props.page.kind === "handover" ? (openBlock(), createElementBlock("section", _hoisted_11$1, [createVNode(_component_el_steps, {
				active: handoverStep.value,
				"finish-status": "success",
				"align-center": ""
			}, {
				default: withCtx(() => [
					createVNode(_component_el_step, {
						title: "发起申请",
						description: "填写交接资料"
					}),
					createVNode(_component_el_step, {
						title: "主管审核",
						description: "核对客户与事项"
					}),
					createVNode(_component_el_step, {
						title: "接收确认",
						description: "确认责任转移"
					}),
					createVNode(_component_el_step, {
						title: "交接完成",
						description: "保留完整留痕"
					})
				]),
				_: 1
			}, 8, ["active"]), createBaseVNode("div", _hoisted_12$1, [createVNode(_component_el_icon, null, {
				default: withCtx(() => [createVNode(unref(info_filled_default))]),
				_: 1
			}), _cache[3] || (_cache[3] = createBaseVNode("span", null, "交接前后负责人、客户清单、未办事项和审核意见都会写入独立操作记录。", -1))])])) : __props.page.kind === "salary" ? (openBlock(), createElementBlock("section", _hoisted_13$1, [createBaseVNode("div", _hoisted_14$1, [
				createBaseVNode("span", null, toDisplayString(__props.page.title) + "合计", 1),
				createBaseVNode("strong", null, "¥" + toDisplayString(money(totalMoney.value)), 1),
				_cache[4] || (_cache[4] = createBaseVNode("small", null, "当前筛选范围 · LOCAL-DEMO", -1))
			]), (openBlock(true), createElementBlock(Fragment, null, renderList(salaryStages.value, (item) => {
				return openBlock(), createElementBlock("div", {
					class: "salary-stage",
					key: item.status
				}, [
					createBaseVNode("span", null, toDisplayString(item.label), 1),
					createBaseVNode("strong", null, toDisplayString(item.count) + "人", 1),
					createVNode(_component_el_progress, {
						percentage: item.percent,
						"stroke-width": 8,
						"show-text": false
					}, null, 8, ["percentage"])
				]);
			}), 128))])) : __props.page.kind === "config" ? (openBlock(), createElementBlock("section", _hoisted_15$1, [
				createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(set_up_default))]),
					_: 1
				}),
				_cache[6] || (_cache[6] = createBaseVNode("div", null, [createBaseVNode("strong", null, "配置生效范围"), createBaseVNode("p", null, "当前页面的启停、排序和规则版本均独立保存；停用后不删除历史业务记录。")], -1)),
				createVNode(_component_el_tag, {
					type: "warning",
					effect: "plain"
				}, {
					default: withCtx(() => [..._cache[5] || (_cache[5] = [createTextVNode("变更留痕", -1)])]),
					_: 1
				})
			])) : createCommentVNode("", true);
		};
	}
}), [["__scopeId", "data-v-450bef26"]]);
//#endregion
//#region src/views/feige-suite/components/RecordDetailDrawer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "detail-head" };
var _hoisted_2$2 = { class: "detail-title" };
var _hoisted_3$2 = { class: "detail-no" };
var _hoisted_4$1 = { class: "field-list" };
var _hoisted_5$1 = { class: "attachments" };
var _hoisted_6$1 = { class: "audit-card" };
var _hoisted_7$1 = { key: 0 };
//#endregion
//#region src/views/feige-suite/components/RecordDetailDrawer.vue
var RecordDetailDrawer_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "RecordDetailDrawer",
	props: {
		modelValue: { type: Boolean },
		page: {},
		record: {}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const open = computed({
			get: () => props.modelValue,
			set: (value) => emit("update:modelValue", value)
		});
		const STATUS_LABELS = {
			draft: "草稿",
			active: "正常",
			pending: "待处理",
			in_progress: "进行中",
			approved: "已通过",
			rejected: "已驳回",
			completed: "已完成",
			archived: "已归档",
			enabled: "已启用",
			disabled: "已停用",
			published: "已发布",
			revoked: "已撤回",
			unread: "未读",
			read: "已读",
			paid: "已发放",
			locked: "已锁定"
		};
		const ACTION_LABELS = {
			create: "创建记录",
			update: "更新资料",
			start: "开始",
			submit: "提交审核",
			approve: "审核通过",
			reject: "驳回",
			complete: "办结",
			archive: "归档",
			restore: "恢复",
			publish: "发布",
			revoke: "撤回",
			enable: "启用",
			disable: "停用",
			pay: "确认发放",
			lock: "锁定",
			unlock: "解锁",
			"mark-read": "标为已读"
		};
		function statusLabel(status) {
			return STATUS_LABELS[status] || status || "-";
		}
		function actionLabel(action) {
			return ACTION_LABELS[action] || action;
		}
		function statusType(status) {
			if ([
				"approved",
				"completed",
				"enabled",
				"published",
				"paid",
				"active",
				"read"
			].includes(status)) return "success";
			if (["rejected", "revoked"].includes(status)) return "danger";
			if ([
				"pending",
				"in_progress",
				"draft",
				"unread"
			].includes(status)) return "warning";
			return "info";
		}
		function display(value, type) {
			if (value === void 0 || value === null || value === "") return "-";
			if (type === "money") return `¥${Number(value).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
			if (type === "switch") return value ? "是" : "否";
			if (Array.isArray(value)) return value.join("、");
			return String(value);
		}
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_icon = ElIcon;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_empty = ElEmpty;
			const _component_el_skeleton = ElSkeleton;
			const _component_el_drawer = ElDrawer;
			return openBlock(), createBlock(_component_el_drawer, {
				modelValue: open.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => open.value = $event),
				title: __props.page.title,
				size: "min(720px, 94vw)",
				"append-to-body": "",
				"destroy-on-close": ""
			}, {
				default: withCtx(() => {
					var _props$record$data2, _props$record$logs;
					return [__props.record ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
						createBaseVNode("div", _hoisted_1$2, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_2$2, toDisplayString(__props.record.title), 1), createBaseVNode("div", _hoisted_3$2, toDisplayString(__props.record.recordNo), 1)]), createVNode(_component_el_tag, {
							type: statusType(__props.record.status),
							effect: "light"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(__props.record.status)), 1)]),
							_: 1
						}, 8, ["type"])]),
						createVNode(_component_el_descriptions, {
							column: 2,
							border: "",
							class: "detail-base"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_descriptions_item, { label: "负责人" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(__props.record.ownerName || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "所属部门" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(__props.record.deptName || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "业务日期" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(__props.record.bizDate || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "更新时间" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(__props.record.updateTime || "-"), 1)]),
									_: 1
								})
							]),
							_: 1
						}),
						_cache[2] || (_cache[2] = createBaseVNode("div", { class: "section-title" }, "业务资料", -1)),
						createBaseVNode("div", _hoisted_4$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.page.fields, (item) => {
							var _props$record$data;
							return openBlock(), createElementBlock("div", {
								key: item.key,
								class: normalizeClass(["field-row", { wide: item.span === 2 || item.type === "textarea" }])
							}, [createBaseVNode("span", null, toDisplayString(item.label), 1), createBaseVNode("strong", null, toDisplayString(display((_props$record$data = __props.record.data) === null || _props$record$data === void 0 ? void 0 : _props$record$data[item.key], item.type)), 1)], 2);
						}), 128))]),
						((_props$record$data2 = __props.record.data) === null || _props$record$data2 === void 0 || (_props$record$data2 = _props$record$data2.attachments) === null || _props$record$data2 === void 0 ? void 0 : _props$record$data2.length) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [_cache[1] || (_cache[1] = createBaseVNode("div", { class: "section-title" }, "附件资料", -1)), createBaseVNode("div", _hoisted_5$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.record.data.attachments, (name) => {
							return openBlock(), createElementBlock("div", {
								key: name,
								class: "attachment-item"
							}, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(paperclip_default))]),
								_: 1
							}), createBaseVNode("span", null, toDisplayString(name), 1)]);
						}), 128))])], 64)) : createCommentVNode("", true),
						_cache[3] || (_cache[3] = createBaseVNode("div", { class: "section-title" }, "操作记录", -1)),
						((_props$record$logs = __props.record.logs) === null || _props$record$logs === void 0 ? void 0 : _props$record$logs.length) ? (openBlock(), createBlock(_component_el_timeline, {
							key: 1,
							class: "audit-list"
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList([...__props.record.logs].reverse(), (log) => {
								return openBlock(), createBlock(_component_el_timeline_item, {
									key: log.id,
									timestamp: log.createTime,
									placement: "top"
								}, {
									default: withCtx(() => [createBaseVNode("div", _hoisted_6$1, [
										createBaseVNode("strong", null, toDisplayString(actionLabel(log.action)), 1),
										createBaseVNode("span", null, toDisplayString(log.operatorName || "系统"), 1),
										log.remark ? (openBlock(), createElementBlock("p", _hoisted_7$1, toDisplayString(log.remark), 1)) : createCommentVNode("", true)
									])]),
									_: 2
								}, 1032, ["timestamp"]);
							}), 128))]),
							_: 1
						})) : (openBlock(), createBlock(_component_el_empty, {
							key: 2,
							description: "暂无操作记录",
							"image-size": 80
						}))
					], 64)) : (openBlock(), createBlock(_component_el_skeleton, {
						key: 1,
						rows: 8,
						animated: ""
					}))];
				}),
				_: 1
			}, 8, ["modelValue", "title"]);
		};
	}
}), [["__scopeId", "data-v-af052ea4"]]);
//#endregion
//#region src/views/feige-suite/components/RecordFormDialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "dialog-lead" };
var _hoisted_2$1 = { class: "form-grid" };
var _hoisted_3$1 = {
	key: 9,
	class: "field-unit"
};
//#endregion
//#region src/views/feige-suite/components/RecordFormDialog.vue
var RecordFormDialog_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "RecordFormDialog",
	props: {
		modelValue: { type: Boolean },
		page: {},
		record: {},
		staffOptions: {},
		canManage: { type: Boolean },
		preview: { type: Boolean }
	},
	emits: ["update:modelValue", "save"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const open = computed({
			get: () => props.modelValue,
			set: (value) => emit("update:modelValue", value)
		});
		const formRef = ref();
		const saving = ref(false);
		const files = ref([]);
		const form = ref({ data: {} });
		const rules = computed(() => {
			const result = {};
			for (const item of props.page.fields) if (item.required) result[`data.${item.key}`] = [{
				required: true,
				message: `请填写${item.label}`,
				trigger: item.type === "select" ? "change" : "blur"
			}];
			if (props.canManage) result.ownerId = [{
				required: true,
				message: "请选择负责人",
				trigger: "change"
			}];
			return result;
		});
		function initialData() {
			const result = {};
			for (const item of props.page.fields) result[item.key] = item.type === "switch" ? true : item.type === "number" || item.type === "money" || item.type === "rate" ? 0 : "";
			return result;
		}
		function hydrate() {
			var _props$staffOptions$, _record$data;
			const record = props.record;
			form.value = {
				ownerId: (record === null || record === void 0 ? void 0 : record.ownerId) || ((_props$staffOptions$ = props.staffOptions[0]) === null || _props$staffOptions$ === void 0 ? void 0 : _props$staffOptions$.id),
				status: record === null || record === void 0 ? void 0 : record.status,
				data: _objectSpread2(_objectSpread2({}, initialData()), (record === null || record === void 0 ? void 0 : record.data) || {})
			};
			files.value = Array.isArray(record === null || record === void 0 || (_record$data = record.data) === null || _record$data === void 0 ? void 0 : _record$data.attachments) ? record.data.attachments.map((attachment, index) => ({
				name: typeof attachment === "string" ? attachment : attachment.name || `附件${index + 1}`,
				uid: index + 1,
				status: "success",
				response: typeof attachment === "string" ? { name: attachment } : attachment
			})) : [];
			nextTick(() => {
				var _formRef$value;
				return (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.clearValidate();
			});
		}
		watch(() => {
			var _props$record;
			return [
				props.modelValue,
				(_props$record = props.record) === null || _props$record === void 0 ? void 0 : _props$record.id,
				props.page.code
			];
		}, () => {
			if (props.modelValue) hydrate();
		}, { immediate: true });
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				var _formRef$value2;
				if (!(yield (_formRef$value2 = formRef.value) === null || _formRef$value2 === void 0 ? void 0 : _formRef$value2.validate().catch(() => false))) return;
				saving.value = true;
				try {
					const attachments = yield persistAttachments();
					const data = _objectSpread2(_objectSpread2({}, form.value.data), {}, { attachments });
					const titleField = props.page.fields.find((item) => item.key === "title") || props.page.fields[0];
					const title = String(data.title || data[titleField === null || titleField === void 0 ? void 0 : titleField.key] || props.page.title).trim();
					const result = yield new Promise((resolve) => {
						emit("save", {
							title,
							categoryCode: String(data.category || data.templateType || "").trim() || void 0,
							ownerId: form.value.ownerId,
							status: form.value.status,
							amount: Number(data.amount || data.actual || data.netSalary || data.commission || 0),
							bizDate: data.bizDate || data.expenseDate || data.examDate,
							dueDate: data.dueDate || data.endDate,
							data
						}, (success, message) => resolve({
							success,
							message
						}));
					});
					if (!result.success) throw new Error(result.message || "保存失败");
					open.value = false;
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "表单保存失败");
				} finally {
					saving.value = false;
				}
			});
			return _submit.apply(this, arguments);
		}
		function persistAttachments() {
			return _persistAttachments.apply(this, arguments);
		}
		function _persistAttachments() {
			_persistAttachments = _asyncToGenerator(function* () {
				const result = [];
				for (const item of files.value) {
					const raw = item.raw;
					const existing = item.response;
					if (!raw) {
						result.push({
							id: existing === null || existing === void 0 ? void 0 : existing.id,
							name: (existing === null || existing === void 0 ? void 0 : existing.name) || item.name,
							size: (existing === null || existing === void 0 ? void 0 : existing.size) || item.size
						});
						continue;
					}
					if (raw.size > 20 * 1024 * 1024) throw new Error(`附件“${raw.name}”超过20MB`);
					if (props.preview) {
						result.push({
							name: raw.name,
							size: raw.size
						});
						continue;
					}
					const response = yield fileInfoApi.upload(raw, void 0, { silentError: true });
					const info = (response === null || response === void 0 ? void 0 : response.data) || response;
					if (!(info === null || info === void 0 ? void 0 : info.id)) throw new Error(`附件“${raw.name}”上传失败`);
					result.push({
						id: Number(info.id),
						name: info.name || info.originalName || raw.name,
						size: raw.size
					});
				}
				return result;
			});
			return _persistAttachments.apply(this, arguments);
		}
		function reset() {
			var _formRef$value3;
			(_formRef$value3 = formRef.value) === null || _formRef$value3 === void 0 || _formRef$value3.resetFields();
			files.value = [];
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_input = ElInput;
			const _component_el_input_number = ElInputNumber;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_switch = ElSwitch;
			const _component_el_rate = ElRate;
			const _component_el_button = ElButton;
			const _component_el_upload = ElUpload;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			return openBlock(), createBlock(_component_el_dialog, {
				modelValue: open.value,
				"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => open.value = $event),
				title: __props.record ? `编辑${__props.page.title}` : __props.page.primaryLabel,
				width: "min(820px, 94vw)",
				"append-to-body": "",
				"destroy-on-close": "",
				class: "suite-form-dialog",
				onClosed: reset
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[2] || (_cache[2] = ($event) => open.value = false) }, {
					default: withCtx(() => [..._cache[6] || (_cache[6] = [createTextVNode("取消", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					loading: saving.value,
					onClick: submit
				}, {
					default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("保存", -1)])]),
					_: 1
				}, 8, ["loading"])]),
				default: withCtx(() => [createBaseVNode("div", _hoisted_1$1, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(info_filled_default))]),
					_: 1
				}), createBaseVNode("span", null, toDisplayString(__props.page.description), 1)]), createVNode(_component_el_form, {
					ref_key: "formRef",
					ref: formRef,
					model: form.value,
					rules: rules.value,
					"label-position": "top",
					class: "suite-form"
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_2$1, [
						__props.canManage ? (openBlock(), createBlock(_component_el_form_item, {
							key: 0,
							label: "负责人",
							prop: "ownerId"
						}, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: form.value.ownerId,
								"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.value.ownerId = $event),
								filterable: "",
								placeholder: "请选择负责人",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.staffOptions, (staff) => {
									return openBlock(), createBlock(_component_el_option, {
										key: staff.id,
										label: `${staff.name} · ${staff.deptName || "未分部门"}`,
										value: staff.id
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						})) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(__props.page.fields, (item) => {
							return openBlock(), createBlock(_component_el_form_item, {
								key: item.key,
								label: item.label,
								prop: `data.${item.key}`,
								class: normalizeClass({ "span-2": item.span === 2 || item.type === "textarea" })
							}, {
								default: withCtx(() => {
									var _item$min, _item$max;
									return [!item.type || item.type === "text" ? (openBlock(), createBlock(_component_el_input, {
										key: 0,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event,
										placeholder: item.placeholder || `请输入${item.label}`,
										clearable: ""
									}, null, 8, [
										"modelValue",
										"onUpdate:modelValue",
										"placeholder"
									])) : item.type === "textarea" ? (openBlock(), createBlock(_component_el_input, {
										key: 1,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event,
										type: "textarea",
										rows: 4,
										maxlength: "1000",
										"show-word-limit": "",
										placeholder: item.placeholder || `请输入${item.label}`
									}, null, 8, [
										"modelValue",
										"onUpdate:modelValue",
										"placeholder"
									])) : item.type === "number" || item.type === "money" || item.type === "rate" ? (openBlock(), createBlock(_component_el_input_number, {
										key: 2,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event,
										min: (_item$min = item.min) !== null && _item$min !== void 0 ? _item$min : 0,
										max: (_item$max = item.max) !== null && _item$max !== void 0 ? _item$max : item.type === "rate" ? 100 : 99999999,
										precision: item.type === "money" ? 2 : 0,
										"controls-position": "right",
										style: { "width": "100%" }
									}, null, 8, [
										"modelValue",
										"onUpdate:modelValue",
										"min",
										"max",
										"precision"
									])) : item.type === "select" ? (openBlock(), createBlock(_component_el_select, {
										key: 3,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event,
										filterable: "",
										clearable: "",
										placeholder: `请选择${item.label}`,
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(item.options || [], (choice) => {
											return openBlock(), createBlock(_component_el_option, {
												key: String(choice.value),
												label: choice.label,
												value: choice.value
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 2
									}, 1032, [
										"modelValue",
										"onUpdate:modelValue",
										"placeholder"
									])) : item.type === "date" ? (openBlock(), createBlock(_component_el_date_picker, {
										key: 4,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event,
										type: "date",
										"value-format": "YYYY-MM-DD",
										placeholder: `请选择${item.label}`,
										style: { "width": "100%" }
									}, null, 8, [
										"modelValue",
										"onUpdate:modelValue",
										"placeholder"
									])) : item.type === "datetime" ? (openBlock(), createBlock(_component_el_date_picker, {
										key: 5,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event,
										type: "datetime",
										"value-format": "YYYY-MM-DD HH:mm:ss",
										placeholder: `请选择${item.label}`,
										style: { "width": "100%" }
									}, null, 8, [
										"modelValue",
										"onUpdate:modelValue",
										"placeholder"
									])) : item.type === "month" ? (openBlock(), createBlock(_component_el_date_picker, {
										key: 6,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event,
										type: "month",
										"value-format": "YYYY-MM",
										placeholder: `请选择${item.label}`,
										style: { "width": "100%" }
									}, null, 8, [
										"modelValue",
										"onUpdate:modelValue",
										"placeholder"
									])) : item.type === "switch" ? (openBlock(), createBlock(_component_el_switch, {
										key: 7,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event
									}, null, 8, ["modelValue", "onUpdate:modelValue"])) : item.type === "rate" ? (openBlock(), createBlock(_component_el_rate, {
										key: 8,
										modelValue: form.value.data[item.key],
										"onUpdate:modelValue": ($event) => form.value.data[item.key] = $event,
										"show-score": ""
									}, null, 8, ["modelValue", "onUpdate:modelValue"])) : createCommentVNode("", true), item.unit ? (openBlock(), createElementBlock("span", _hoisted_3$1, toDisplayString(item.unit), 1)) : createCommentVNode("", true)];
								}),
								_: 2
							}, 1032, [
								"label",
								"prop",
								"class"
							]);
						}), 128)),
						createVNode(_component_el_form_item, {
							label: "附件资料",
							class: "span-2"
						}, {
							default: withCtx(() => [createVNode(_component_el_upload, {
								"file-list": files.value,
								"onUpdate:fileList": _cache[1] || (_cache[1] = ($event) => files.value = $event),
								action: "#",
								"auto-upload": false,
								multiple: "",
								limit: 8,
								class: "suite-upload"
							}, {
								tip: withCtx(() => [..._cache[5] || (_cache[5] = [createBaseVNode("div", { class: "el-upload__tip" }, "最多8个，单个不超过20MB；正式环境上传到浙杭受控文件服务，本地预览仅记录文件名。", -1)])]),
								default: withCtx(() => [createVNode(_component_el_button, { icon: unref(upload_default) }, {
									default: withCtx(() => [..._cache[4] || (_cache[4] = [createTextVNode("选择附件", -1)])]),
									_: 1
								}, 8, ["icon"])]),
								_: 1
							}, 8, ["file-list"])]),
							_: 1
						})
					])]),
					_: 1
				}, 8, ["model", "rules"])]),
				_: 1
			}, 8, ["modelValue", "title"]);
		};
	}
}), [["__scopeId", "data-v-778643eb"]]);
//#endregion
//#region src/views/feige-suite/page.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 0,
	class: "demo-banner"
};
var _hoisted_2 = { class: "workspace" };
var _hoisted_3 = { class: "workspace-toolbar" };
var _hoisted_4 = { class: "workspace-scope" };
var _hoisted_5 = { class: "head-actions" };
var _hoisted_6 = { class: "filter-row" };
var _hoisted_7 = { class: "table-toolbar" };
var _hoisted_8 = {
	key: 0,
	class: "card-grid"
};
var _hoisted_9 = ["onClick"];
var _hoisted_10 = { class: "business-card-head" };
var _hoisted_11 = { class: "record-avatar" };
var _hoisted_12 = { class: "card-fields" };
var _hoisted_13 = {
	key: 2,
	class: "money"
};
var _hoisted_14 = {
	key: 3,
	class: "score-value"
};
var _hoisted_15 = { key: 5 };
var _hoisted_16 = { class: "pagination-row" };
var _hoisted_17 = {
	key: 1,
	class: "page-notes"
};
//#endregion
//#region src/views/feige-suite/page.vue
var page_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "page",
	props: { pageCode: {} },
	setup(__props) {
		const props = __props;
		const route = useRoute();
		const currentCode = computed(() => props.pageCode || String(route.meta.pageCode || ""));
		const page = computed(() => requireFeigeSuitePage(currentCode.value));
		const group = computed(() => FEIGE_SUITE_GROUPS.find((item) => item.code === page.value.group) || FEIGE_SUITE_GROUPS[0]);
		const isPreview = previewEnabled();
		const loading = ref(false);
		const showAllFilters = ref(false);
		const activeTab = ref("");
		const records = ref([]);
		const selected = ref([]);
		const total = ref(0);
		const staffOptions = ref([]);
		const summary = reactive({
			total: 0,
			statuses: {}
		});
		const capabilities = reactive({
			manager: false,
			finance: false,
			hr: false,
			canCreate: false,
			canWrite: false,
			canManage: false,
			scope: "visible_users"
		});
		const formVisible = ref(false);
		const detailVisible = ref(false);
		const editing = ref(null);
		const detail = ref(null);
		const query = reactive({
			keyword: "",
			current: 1,
			size: 20
		});
		const statusOptions = [
			{
				label: "草稿",
				value: "draft"
			},
			{
				label: "正常",
				value: "active"
			},
			{
				label: "待处理",
				value: "pending"
			},
			{
				label: "进行中",
				value: "in_progress"
			},
			{
				label: "已通过",
				value: "approved"
			},
			{
				label: "已驳回",
				value: "rejected"
			},
			{
				label: "已完成",
				value: "completed"
			},
			{
				label: "已归档",
				value: "archived"
			},
			{
				label: "已启用",
				value: "enabled"
			},
			{
				label: "已停用",
				value: "disabled"
			},
			{
				label: "已发布",
				value: "published"
			},
			{
				label: "已撤回",
				value: "revoked"
			},
			{
				label: "未读",
				value: "unread"
			},
			{
				label: "已读",
				value: "read"
			},
			{
				label: "已发放",
				value: "paid"
			},
			{
				label: "已锁定",
				value: "locked"
			}
		];
		const STATUS_LABELS = Object.fromEntries(statusOptions.map((item) => [item.value, item.label]));
		const visibleFilters = computed(() => showAllFilters.value ? page.value.filters : page.value.filters.slice(0, 3));
		const supportsBatchComplete = computed(() => page.value.actions.some((item) => item.key === "complete"));
		onMounted(() => announceDemoMode());
		watch(currentCode, () => initialize(), { immediate: true });
		function initialize() {
			return _initialize.apply(this, arguments);
		}
		function _initialize() {
			_initialize = _asyncToGenerator(function* () {
				var _page$value$tabs;
				activeTab.value = ((_page$value$tabs = page.value.tabs) === null || _page$value$tabs === void 0 || (_page$value$tabs = _page$value$tabs[0]) === null || _page$value$tabs === void 0 ? void 0 : _page$value$tabs.label) || "";
				Object.keys(query).forEach((key) => {
					if (![
						"keyword",
						"current",
						"size"
					].includes(key)) delete query[key];
				});
				query.keyword = "";
				query.current = 1;
				yield Promise.all([loadMetadata(), loadRecords()]);
			});
			return _initialize.apply(this, arguments);
		}
		function loadMetadata() {
			return _loadMetadata.apply(this, arguments);
		}
		function _loadMetadata() {
			_loadMetadata = _asyncToGenerator(function* () {
				try {
					const [staff, permission, pageSummary] = yield Promise.all([
						feigeSuiteDataSource.staffOptions(),
						feigeSuiteDataSource.capabilities(page.value.code),
						feigeSuiteDataSource.summary(page.value.code)
					]);
					staffOptions.value = staff;
					Object.assign(capabilities, permission);
					summary.total = pageSummary.total;
					summary.statuses = pageSummary.statuses || {};
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "页面信息加载失败");
				}
			});
			return _loadMetadata.apply(this, arguments);
		}
		function loadRecords() {
			return _loadRecords.apply(this, arguments);
		}
		function _loadRecords() {
			_loadRecords = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const result = yield feigeSuiteDataSource.records(page.value.code, _objectSpread2({}, query));
					records.value = result.records || [];
					total.value = result.total || 0;
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "业务数据加载失败");
					records.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
			});
			return _loadRecords.apply(this, arguments);
		}
		function refresh() {
			return _refresh.apply(this, arguments);
		}
		function _refresh() {
			_refresh = _asyncToGenerator(function* () {
				yield Promise.all([loadMetadata(), loadRecords()]);
				ElMessage.success("数据已刷新");
			});
			return _refresh.apply(this, arguments);
		}
		function search() {
			query.current = 1;
			loadRecords();
		}
		function resetQuery() {
			Object.keys(query).forEach((key) => {
				if (!["current", "size"].includes(key)) query[key] = "";
			});
			query.current = 1;
			loadRecords();
		}
		function openCreate() {
			editing.value = null;
			formVisible.value = true;
		}
		function openEdit(record) {
			editing.value = record;
			formVisible.value = true;
		}
		function openDetail(_x) {
			return _openDetail.apply(this, arguments);
		}
		function _openDetail() {
			_openDetail = _asyncToGenerator(function* (record) {
				detailVisible.value = true;
				detail.value = null;
				try {
					detail.value = yield feigeSuiteDataSource.detail(page.value.code, record.id);
				} catch (error) {
					detailVisible.value = false;
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "详情加载失败");
				}
			});
			return _openDetail.apply(this, arguments);
		}
		function saveRecord(_x2, _x3) {
			return _saveRecord.apply(this, arguments);
		}
		function _saveRecord() {
			_saveRecord = _asyncToGenerator(function* (payload, done) {
				try {
					if (editing.value) yield feigeSuiteDataSource.update(page.value.code, editing.value.id, _objectSpread2(_objectSpread2({}, payload), {}, { version: editing.value.version }));
					else yield feigeSuiteDataSource.create(page.value.code, payload);
					ElMessage.success(editing.value ? "业务资料已更新" : "业务记录已创建");
					editing.value = null;
					yield Promise.all([loadMetadata(), loadRecords()]);
					done(true);
				} catch (error) {
					done(false, (error === null || error === void 0 ? void 0 : error.message) || "保存失败");
				}
			});
			return _saveRecord.apply(this, arguments);
		}
		function actionConfig(actionKey) {
			return page.value.actions.find((item) => item.key === actionKey);
		}
		function visibleActions(record) {
			return page.value.actions.filter((item) => actionVisible(record.status, item.key));
		}
		function actionVisible(status, actionKey) {
			const map = {
				start: ["pending"],
				submit: ["draft", "rejected"],
				approve: ["pending"],
				reject: ["pending"],
				complete: [
					"active",
					"approved",
					"in_progress",
					"pending"
				],
				archive: [
					"active",
					"completed",
					"read",
					"unread"
				],
				restore: [
					"archived",
					"rejected",
					"revoked",
					"completed",
					"read"
				],
				publish: ["draft", "revoked"],
				revoke: ["published"],
				enable: ["disabled"],
				disable: ["enabled"],
				pay: ["approved"],
				lock: ["approved", "paid"],
				unlock: ["locked"],
				"mark-read": ["unread"]
			};
			return !map[actionKey] || map[actionKey].includes(status);
		}
		function runAction(_x4, _x5) {
			return _runAction.apply(this, arguments);
		}
		function _runAction() {
			_runAction = _asyncToGenerator(function* (record, actionKey) {
				if (actionKey === "__delete") return removeRecord(record);
				const config = actionConfig(actionKey);
				if (!config) return;
				let remark = "";
				try {
					if (config.requiresRemark) remark = (yield ElMessageBox.prompt(`请填写“${config.label}”原因`, config.label, {
						inputType: "textarea",
						inputValidator: (value) => value.trim().length >= 2 || "至少填写2个字"
					})).value;
					else yield ElMessageBox.confirm(`确认对“${record.title}”执行${config.label}？`, "确认操作", { type: config.type === "danger" ? "warning" : "info" });
					yield feigeSuiteDataSource.action(page.value.code, record.id, {
						action: actionKey,
						remark,
						version: record.version
					});
					ElMessage.success(`${config.label}成功`);
					yield Promise.all([loadMetadata(), loadRecords()]);
				} catch (error) {
					if (error !== "cancel" && error !== "close") ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || `${config.label}失败`);
				}
			});
			return _runAction.apply(this, arguments);
		}
		function removeRecord(_x6) {
			return _removeRecord.apply(this, arguments);
		}
		function _removeRecord() {
			_removeRecord = _asyncToGenerator(function* (record) {
				try {
					yield ElMessageBox.confirm(`删除“${record.title}”后无法在页面恢复，确认继续？`, "删除确认", { type: "warning" });
					yield feigeSuiteDataSource.remove(page.value.code, record.id);
					ElMessage.success("删除成功");
					yield Promise.all([loadMetadata(), loadRecords()]);
				} catch (error) {
					if (error !== "cancel" && error !== "close") ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "删除失败");
				}
			});
			return _removeRecord.apply(this, arguments);
		}
		function batchComplete() {
			return _batchComplete.apply(this, arguments);
		}
		function _batchComplete() {
			_batchComplete = _asyncToGenerator(function* () {
				try {
					yield ElMessageBox.confirm(`确认将已选${selected.value.length}条记录批量完成？`, "批量完成", { type: "info" });
					yield Promise.all(selected.value.map((item) => feigeSuiteDataSource.action(page.value.code, item.id, {
						action: "complete",
						version: item.version
					})));
					ElMessage.success("批量完成成功");
					yield refresh();
				} catch (error) {
					if (error !== "cancel" && error !== "close") ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "批量操作失败");
				}
			});
			return _batchComplete.apply(this, arguments);
		}
		function batchRemove() {
			return _batchRemove.apply(this, arguments);
		}
		function _batchRemove() {
			_batchRemove = _asyncToGenerator(function* () {
				try {
					yield ElMessageBox.confirm(`确认删除已选${selected.value.length}条记录？`, "批量删除", { type: "warning" });
					yield Promise.all(selected.value.map((item) => feigeSuiteDataSource.remove(page.value.code, item.id)));
					ElMessage.success("批量删除成功");
					yield refresh();
				} catch (error) {
					if (error !== "cancel" && error !== "close") ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "批量删除失败");
				}
			});
			return _batchRemove.apply(this, arguments);
		}
		function exportCsv() {
			const columns = [
				{
					key: "recordNo",
					label: "业务编号"
				},
				...page.value.columns,
				{
					key: "ownerName",
					label: "负责人"
				},
				{
					key: "status",
					label: "状态"
				}
			];
			const csv = [columns.map((item) => item.label), ...records.value.map((record) => columns.map((item) => displayValue(valueOf(record, item.key), item.key === "status" ? "status" : item.type)))].map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
			const link = document.createElement("a");
			link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
			link.download = `${page.value.title}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
			link.click();
			URL.revokeObjectURL(link.href);
		}
		function valueOf(record, key) {
			var _record$key, _record$data;
			return (_record$key = record[key]) !== null && _record$key !== void 0 ? _record$key : (_record$data = record.data) === null || _record$data === void 0 ? void 0 : _record$data[key];
		}
		function progressValue(value) {
			return Math.min(100, Math.max(0, Number(value) || 0));
		}
		function displayValue(value, type) {
			if (value === void 0 || value === null || value === "" || value === "undefined" || value === "null") return "-";
			if (type === "status") return statusLabel(String(value));
			if (type === "money") return `¥${Number(value).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}`;
			if (type === "boolean") return value ? "是" : "否";
			return String(value);
		}
		function firstDescription(record) {
			var _record$data2, _record$data3, _record$data4, _record$data5;
			return String(((_record$data2 = record.data) === null || _record$data2 === void 0 ? void 0 : _record$data2.description) || ((_record$data3 = record.data) === null || _record$data3 === void 0 ? void 0 : _record$data3.content) || ((_record$data4 = record.data) === null || _record$data4 === void 0 ? void 0 : _record$data4.notes) || ((_record$data5 = record.data) === null || _record$data5 === void 0 ? void 0 : _record$data5.remark) || `${page.value.title}的LOCAL-DEMO业务记录。`);
		}
		function statusLabel(status) {
			return STATUS_LABELS[status] || status || "-";
		}
		function statusType(status) {
			if ([
				"approved",
				"completed",
				"enabled",
				"published",
				"paid",
				"active",
				"read"
			].includes(status)) return "success";
			if (["rejected", "revoked"].includes(status)) return "danger";
			if ([
				"pending",
				"in_progress",
				"draft",
				"unread"
			].includes(status)) return "warning";
			return "info";
		}
		return (_ctx, _cache) => {
			var _page$value$tabs2, _page$value$notes;
			const _component_el_icon = ElIcon;
			const _component_el_segmented = ElSegmented;
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_tag = ElTag;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_empty = ElEmpty;
			const _component_el_table_column = ElTableColumn;
			const _component_el_progress = ElProgress;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", {
				class: "suite-page",
				style: normalizeStyle({ "--suite-color": group.value.color })
			}, [
				unref(isPreview) ? (openBlock(), createElementBlock("div", _hoisted_1, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(info_filled_default))]),
					_: 1
				}), _cache[9] || (_cache[9] = createBaseVNode("span", null, "当前为隔离本地演示：公司、员工、金额和附件均为虚构数据，所有操作只保存在本机内存。", -1))])) : createCommentVNode("", true),
				createVNode(PageSpecialty_default, {
					page: page.value,
					records: records.value,
					total: summary.total,
					statuses: summary.statuses,
					onRunAction: runAction,
					onView: openDetail
				}, null, 8, [
					"page",
					"records",
					"total",
					"statuses"
				]),
				createBaseVNode("section", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [createBaseVNode("div", _hoisted_4, [((_page$value$tabs2 = page.value.tabs) === null || _page$value$tabs2 === void 0 ? void 0 : _page$value$tabs2.length) ? (openBlock(), createBlock(_component_el_segmented, {
						key: 0,
						modelValue: activeTab.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => activeTab.value = $event),
						options: page.value.tabs.map((item) => item.label)
					}, null, 8, ["modelValue", "options"])) : createCommentVNode("", true), createBaseVNode("span", null, "共 " + toDisplayString(total.value) + " 条", 1)]), createBaseVNode("div", _hoisted_5, [createVNode(_component_el_button, {
						icon: unref(refresh_default),
						loading: loading.value,
						onClick: refresh
					}, {
						default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon", "loading"]), capabilities.canCreate ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						type: "primary",
						icon: unref(plus_default),
						onClick: openCreate
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(page.value.primaryLabel), 1)]),
						_: 1
					}, 8, ["icon"])) : createCommentVNode("", true)])]),
					createBaseVNode("div", _hoisted_6, [
						createVNode(_component_el_input, {
							modelValue: query.keyword,
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => query.keyword = $event),
							placeholder: page.value.keywordPlaceholder || `搜索${page.value.title}名称、编号或说明`,
							clearable: "",
							class: "keyword-input",
							onKeyup: withKeys(search, ["enter"])
						}, {
							prefix: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(search_default))]),
								_: 1
							})]),
							_: 1
						}, 8, ["modelValue", "placeholder"]),
						(openBlock(true), createElementBlock(Fragment, null, renderList(visibleFilters.value, (filter) => {
							return openBlock(), createElementBlock(Fragment, { key: filter.key }, [filter.key === "ownerId" ? (openBlock(), createBlock(_component_el_select, {
								key: 0,
								modelValue: query[filter.key],
								"onUpdate:modelValue": ($event) => query[filter.key] = $event,
								clearable: "",
								filterable: "",
								placeholder: filter.label,
								class: "filter-control"
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staffOptions.value, (staff) => {
									return openBlock(), createBlock(_component_el_option, {
										key: staff.id,
										label: `${staff.name} · ${staff.deptName || "未分部门"}`,
										value: staff.id
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"placeholder"
							])) : filter.key === "status" ? (openBlock(), createBlock(_component_el_select, {
								key: 1,
								modelValue: query[filter.key],
								"onUpdate:modelValue": ($event) => query[filter.key] = $event,
								clearable: "",
								placeholder: filter.label,
								class: "filter-control"
							}, {
								default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(statusOptions, (item) => {
									return createVNode(_component_el_option, {
										key: item.value,
										label: item.label,
										value: item.value
									}, null, 8, ["label", "value"]);
								}), 64))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"placeholder"
							])) : filter.type === "select" ? (openBlock(), createBlock(_component_el_select, {
								key: 2,
								modelValue: query[filter.key],
								"onUpdate:modelValue": ($event) => query[filter.key] = $event,
								clearable: "",
								filterable: "",
								placeholder: filter.label,
								class: "filter-control"
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(filter.options || [], (item) => {
									return openBlock(), createBlock(_component_el_option, {
										key: String(item.value),
										label: item.label,
										value: item.value
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 2
							}, 1032, [
								"modelValue",
								"onUpdate:modelValue",
								"placeholder"
							])) : filter.type === "date" ? (openBlock(), createBlock(_component_el_date_picker, {
								key: 3,
								modelValue: query[filter.key],
								"onUpdate:modelValue": ($event) => query[filter.key] = $event,
								type: "date",
								"value-format": "YYYY-MM-DD",
								placeholder: filter.label,
								class: "filter-control"
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"placeholder"
							])) : filter.type === "month" ? (openBlock(), createBlock(_component_el_date_picker, {
								key: 4,
								modelValue: query[filter.key],
								"onUpdate:modelValue": ($event) => query[filter.key] = $event,
								type: "month",
								"value-format": "YYYY-MM",
								placeholder: filter.label,
								class: "filter-control"
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"placeholder"
							])) : (openBlock(), createBlock(_component_el_input, {
								key: 5,
								modelValue: query[filter.key],
								"onUpdate:modelValue": ($event) => query[filter.key] = $event,
								clearable: "",
								placeholder: filter.label,
								class: "filter-control"
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"placeholder"
							]))], 64);
						}), 128)),
						createVNode(_component_el_button, {
							type: "primary",
							icon: unref(search_default),
							onClick: search
						}, {
							default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("查询", -1)])]),
							_: 1
						}, 8, ["icon"]),
						createVNode(_component_el_button, { onClick: resetQuery }, {
							default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("重置", -1)])]),
							_: 1
						}),
						page.value.filters.length > 3 ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							text: "",
							icon: showAllFilters.value ? unref(arrow_up_default) : unref(arrow_down_default),
							onClick: _cache[2] || (_cache[2] = ($event) => showAllFilters.value = !showAllFilters.value)
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(showAllFilters.value ? "收起" : "更多筛选"), 1)]),
							_: 1
						}, 8, ["icon"])) : createCommentVNode("", true)
					]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(page.value.title), 1), createBaseVNode("span", null, "已选 " + toDisplayString(selected.value.length) + " 条", 1)]), createBaseVNode("div", null, [
						createVNode(_component_el_button, {
							icon: unref(download_default),
							onClick: exportCsv
						}, {
							default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("导出当前结果", -1)])]),
							_: 1
						}, 8, ["icon"]),
						selected.value.length && capabilities.canWrite && supportsBatchComplete.value ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							type: "success",
							plain: "",
							onClick: batchComplete
						}, {
							default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("批量完成", -1)])]),
							_: 1
						})) : createCommentVNode("", true),
						selected.value.length && capabilities.canWrite ? (openBlock(), createBlock(_component_el_button, {
							key: 1,
							type: "danger",
							plain: "",
							onClick: batchRemove
						}, {
							default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("批量删除", -1)])]),
							_: 1
						})) : createCommentVNode("", true)
					])]),
					page.value.kind === "cards" ? withDirectives((openBlock(), createElementBlock("div", _hoisted_8, [(openBlock(true), createElementBlock(Fragment, null, renderList(records.value, (record) => {
						return openBlock(), createElementBlock("article", {
							key: record.id,
							class: "business-card",
							onClick: ($event) => openDetail(record)
						}, [
							createBaseVNode("div", _hoisted_10, [
								createBaseVNode("div", _hoisted_11, toDisplayString(record.title.slice(0, 1)), 1),
								createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(record.title), 1), createBaseVNode("small", null, toDisplayString(record.recordNo), 1)]),
								createVNode(_component_el_tag, {
									type: statusType(record.status),
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(record.status)), 1)]),
									_: 2
								}, 1032, ["type"])
							]),
							createBaseVNode("p", null, toDisplayString(firstDescription(record)), 1),
							createBaseVNode("div", _hoisted_12, [(openBlock(true), createElementBlock(Fragment, null, renderList(page.value.columns.slice(0, 4), (column) => {
								return openBlock(), createElementBlock("span", { key: column.key }, [createBaseVNode("small", null, toDisplayString(column.label), 1), createBaseVNode("strong", null, toDisplayString(displayValue(valueOf(record, column.key), column.type)), 1)]);
							}), 128))]),
							createBaseVNode("div", {
								class: "card-footer",
								onClick: _cache[3] || (_cache[3] = withModifiers(() => {}, ["stop"]))
							}, [createBaseVNode("span", null, toDisplayString(record.ownerName), 1), createBaseVNode("div", null, [
								createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => openDetail(record)
								}, {
									default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("详情", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								capabilities.canWrite ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									link: "",
									type: "primary",
									onClick: ($event) => openEdit(record)
								}, {
									default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								capabilities.canWrite ? (openBlock(), createBlock(_component_el_dropdown, {
									key: 1,
									trigger: "click",
									onCommand: (command) => runAction(record, command)
								}, {
									dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(visibleActions(record), (item) => {
											return openBlock(), createBlock(_component_el_dropdown_item, {
												key: item.key,
												command: item.key,
												class: normalizeClass(item.type === "danger" ? "danger-item" : "")
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(item.label), 1)]),
												_: 2
											}, 1032, ["command", "class"]);
										}), 128)), createVNode(_component_el_dropdown_item, {
											divided: "",
											command: "__delete",
											class: "danger-item"
										}, {
											default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("删除", -1)])]),
											_: 1
										})]),
										_: 2
									}, 1024)]),
									default: withCtx(() => [createVNode(_component_el_button, {
										link: "",
										type: "primary"
									}, {
										default: withCtx(() => [_cache[18] || (_cache[18] = createTextVNode("更多", -1)), createVNode(_component_el_icon, { class: "el-icon--right" }, {
											default: withCtx(() => [createVNode(unref(arrow_down_default))]),
											_: 1
										})]),
										_: 1
									})]),
									_: 2
								}, 1032, ["onCommand"])) : createCommentVNode("", true)
							])])
						], 8, _hoisted_9);
					}), 128)), !loading.value && !records.value.length ? (openBlock(), createBlock(_component_el_empty, {
						key: 0,
						description: "当前筛选条件下暂无记录"
					})) : createCommentVNode("", true)])), [[_directive_loading, loading.value]]) : withDirectives((openBlock(), createBlock(_component_el_table, {
						key: 1,
						data: records.value,
						"row-key": "id",
						stripe: "",
						class: "suite-table",
						onSelectionChange: _cache[4] || (_cache[4] = ($event) => selected.value = $event)
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, {
							description: "当前筛选条件下暂无业务记录",
							"image-size": 100
						})]),
						default: withCtx(() => [
							capabilities.canWrite ? (openBlock(), createBlock(_component_el_table_column, {
								key: 0,
								type: "selection",
								width: "48",
								fixed: "left"
							})) : createCommentVNode("", true),
							createVNode(_component_el_table_column, {
								label: "业务编号",
								prop: "recordNo",
								"min-width": "190",
								fixed: "left",
								"show-overflow-tooltip": ""
							}),
							(openBlock(true), createElementBlock(Fragment, null, renderList(page.value.columns, (column) => {
								return openBlock(), createBlock(_component_el_table_column, {
									key: column.key,
									label: column.label,
									"min-width": column.minWidth,
									width: column.width,
									"show-overflow-tooltip": column.tooltip !== false
								}, {
									default: withCtx(({ row }) => [column.type === "status" ? (openBlock(), createBlock(_component_el_tag, {
										key: 0,
										type: statusType(String(valueOf(row, column.key))),
										effect: "light"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(String(valueOf(row, column.key)))), 1)]),
										_: 2
									}, 1032, ["type"])) : column.type === "progress" ? (openBlock(), createBlock(_component_el_progress, {
										key: 1,
										percentage: progressValue(valueOf(row, column.key)),
										"stroke-width": 8
									}, null, 8, ["percentage"])) : column.type === "money" ? (openBlock(), createElementBlock("span", _hoisted_13, toDisplayString(displayValue(valueOf(row, column.key), "money")), 1)) : column.type === "score" ? (openBlock(), createElementBlock("span", _hoisted_14, toDisplayString(displayValue(valueOf(row, column.key), "score")), 1)) : column.type === "boolean" ? (openBlock(), createBlock(_component_el_tag, {
										key: 4,
										type: valueOf(row, column.key) ? "success" : "info",
										size: "small"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(valueOf(row, column.key) ? "是" : "否"), 1)]),
										_: 2
									}, 1032, ["type"])) : (openBlock(), createElementBlock("span", _hoisted_15, toDisplayString(displayValue(valueOf(row, column.key), column.type)), 1))]),
									_: 2
								}, 1032, [
									"label",
									"min-width",
									"width",
									"show-overflow-tooltip"
								]);
							}), 128)),
							createVNode(_component_el_table_column, {
								label: "负责人",
								prop: "ownerName",
								"min-width": "135"
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								"min-width": "108",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: statusType(row.status),
									effect: "light"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(row.status)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "230",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [
									createVNode(_component_el_button, {
										link: "",
										type: "primary",
										onClick: ($event) => openDetail(row)
									}, {
										default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("详情", -1)])]),
										_: 1
									}, 8, ["onClick"]),
									capabilities.canWrite ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										link: "",
										type: "primary",
										onClick: ($event) => openEdit(row)
									}, {
										default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("编辑", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									capabilities.canWrite ? (openBlock(), createBlock(_component_el_dropdown, {
										key: 1,
										trigger: "click",
										onCommand: (command) => runAction(row, command)
									}, {
										dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(visibleActions(row), (item) => {
												return openBlock(), createBlock(_component_el_dropdown_item, {
													key: item.key,
													command: item.key,
													class: normalizeClass(item.type === "danger" ? "danger-item" : "")
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(item.label), 1)]),
													_: 2
												}, 1032, ["command", "class"]);
											}), 128)), createVNode(_component_el_dropdown_item, {
												divided: "",
												command: "__delete",
												class: "danger-item"
											}, {
												default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("删除", -1)])]),
												_: 1
											})]),
											_: 2
										}, 1024)]),
										default: withCtx(() => [createVNode(_component_el_button, {
											link: "",
											type: "primary"
										}, {
											default: withCtx(() => [_cache[22] || (_cache[22] = createTextVNode("更多", -1)), createVNode(_component_el_icon, { class: "el-icon--right" }, {
												default: withCtx(() => [createVNode(unref(arrow_down_default))]),
												_: 1
											})]),
											_: 1
										})]),
										_: 2
									}, 1032, ["onCommand"])) : createCommentVNode("", true)
								]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					createBaseVNode("div", _hoisted_16, [createBaseVNode("span", null, "共 " + toDisplayString(total.value) + " 条", 1), createVNode(_component_el_pagination, {
						"current-page": query.current,
						"onUpdate:currentPage": _cache[5] || (_cache[5] = ($event) => query.current = $event),
						"page-size": query.size,
						"onUpdate:pageSize": _cache[6] || (_cache[6] = ($event) => query.size = $event),
						total: total.value,
						"page-sizes": [
							10,
							20,
							50,
							100
						],
						layout: "sizes, prev, pager, next, jumper",
						onChange: loadRecords
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				((_page$value$notes = page.value.notes) === null || _page$value$notes === void 0 ? void 0 : _page$value$notes.length) ? (openBlock(), createElementBlock("section", _hoisted_17, [_cache[24] || (_cache[24] = createBaseVNode("strong", null, "业务说明", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(page.value.notes, (note) => {
					return openBlock(), createElementBlock("span", { key: note }, toDisplayString(note), 1);
				}), 128))])) : createCommentVNode("", true),
				createVNode(RecordFormDialog_default, {
					modelValue: formVisible.value,
					"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => formVisible.value = $event),
					page: page.value,
					record: editing.value,
					"staff-options": staffOptions.value,
					"can-manage": capabilities.canManage,
					preview: unref(isPreview),
					onSave: saveRecord
				}, null, 8, [
					"modelValue",
					"page",
					"record",
					"staff-options",
					"can-manage",
					"preview"
				]),
				createVNode(RecordDetailDrawer_default, {
					modelValue: detailVisible.value,
					"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => detailVisible.value = $event),
					page: page.value,
					record: detail.value
				}, null, 8, [
					"modelValue",
					"page",
					"record"
				])
			], 4);
		};
	}
}), [["__scopeId", "data-v-1053e130"]]);
//#endregion
export { page_default as default };
