import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, F as ElEmpty, Fn as present_default, H as ElDescriptions, Ot as calendar_default, Qt as document_default, U as ElDescriptionsItem, _ as ElTableColumn, _r as wallet_default, f as ElTimeline, fr as user_default, g as ElTable, ir as switch_default, it as ElTag, ln as grid_default, o as ElMessage, ot as ElButton, p as ElTimelineItem, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { a as transferApi, n as employeeApi } from "./org-DaVetSL-.js";
import { c as payslipApi, i as laborContractApi } from "./hrm-x4tssCAy.js";
//#region src/views/hrm/self-service.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "self-service" };
var _hoisted_2 = { class: "ss-head" };
var _hoisted_3 = { class: "ss-grid" };
var _hoisted_4 = { class: "ss-card profile-card" };
var _hoisted_5 = { class: "card-title" };
var _hoisted_6 = { class: "profile-body" };
var _hoisted_7 = { class: "avatar" };
var _hoisted_8 = { class: "profile-info" };
var _hoisted_9 = { class: "pi-name" };
var _hoisted_10 = { class: "pi-tags" };
var _hoisted_11 = { key: 0 };
var _hoisted_12 = { key: 1 };
var _hoisted_13 = { class: "ss-card timeline-card" };
var _hoisted_14 = { class: "card-title" };
var _hoisted_15 = { class: "timeline-body" };
var _hoisted_16 = { class: "tl-item" };
var _hoisted_17 = { class: "tl-head" };
var _hoisted_18 = {
	key: 0,
	class: "tl-line"
};
var _hoisted_19 = {
	key: 1,
	class: "tl-line"
};
var _hoisted_20 = {
	key: 2,
	class: "tl-line tl-reason"
};
var _hoisted_21 = { class: "ss-card entries-card" };
var _hoisted_22 = { class: "card-title" };
var _hoisted_23 = { class: "entries-grid" };
var _hoisted_24 = ["onClick"];
var _hoisted_25 = { class: "entry-text" };
var _hoisted_26 = { class: "entry-title" };
var _hoisted_27 = { class: "entry-desc" };
var _hoisted_28 = { class: "ss-card contract-card" };
var _hoisted_29 = { class: "card-title" };
//#endregion
//#region src/views/hrm/self-service.vue
var self_service_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "self-service",
	setup(__props) {
		const router = useRouter();
		const userStore = useUserStore();
		const TRANSFER_TYPE = {
			1: "入职",
			2: "转正",
			3: "调岗",
			4: "晋升",
			5: "离职"
		};
		const TRANSFER_DOT = {
			1: "success",
			2: "primary",
			3: "warning",
			4: "success",
			5: "danger"
		};
		const STATUS_LABEL = {
			0: "待审批",
			1: "已生效",
			2: "已拒绝"
		};
		const STATUS_TAG = {
			0: "warning",
			1: "success",
			2: "danger"
		};
		const CONTRACT_LABEL = {
			0: "未生效",
			1: "生效中",
			2: "即将到期",
			3: "已到期",
			4: "已解除"
		};
		const CONTRACT_TAG = {
			0: "info",
			1: "success",
			2: "warning",
			3: "danger",
			4: "info"
		};
		const loading = ref(false);
		const profile = reactive({
			name: "",
			empCode: "",
			deptName: "",
			postName: "",
			phone: "",
			hireDate: ""
		});
		const avatarText = computed(() => (profile.name || "U").slice(0, 1).toUpperCase());
		const workedDays = computed(() => {
			if (!profile.hireDate) return null;
			const d = new Date(profile.hireDate);
			if (isNaN(d.getTime())) return null;
			return Math.max(0, Math.floor((Date.now() - d.getTime()) / 864e5));
		});
		const transfers = ref([]);
		const contracts = ref([]);
		function fmtDate(v) {
			if (!v) return "";
			const s = String(v);
			return s.length >= 10 ? s.slice(0, 10) : s;
		}
		const entries = [
			{
				title: "我的薪资",
				desc: "查看工资条并签字确认",
				icon: wallet_default,
				color: "#409eff",
				path: "/culture/my-payslip",
				disabled: false
			},
			{
				title: "我的假勤",
				desc: "请假 / 考勤申请与记录",
				icon: calendar_default,
				color: "#e6a23c",
				path: "/hrm/attendance",
				disabled: false
			},
			{
				title: "我的关怀",
				desc: "生日 / 入职周年提醒",
				icon: present_default,
				color: "#f56c6c",
				path: "",
				disabled: true
			}
		];
		function onEntry(e) {
			if (e.disabled) {
				ElMessage.info("该功能敬请期待");
				return;
			}
			router.push(e.path);
		}
		function fillProfileFromRow(row) {
			if (!row) return;
			if (!profile.name && (row.employeeName || row.name)) profile.name = row.employeeName || row.name;
			if (!profile.deptName && row.deptName) profile.deptName = row.deptName;
			if (!profile.postName && row.postName) profile.postName = row.postName;
			if (!profile.empCode && (row.empCode || row.employeeCode)) profile.empCode = row.empCode || row.employeeCode;
			if (!profile.phone && row.phone) profile.phone = row.phone;
			if (!profile.hireDate && row.hireDate) profile.hireDate = fmtDate(row.hireDate);
		}
		function loadAll() {
			return _loadAll.apply(this, arguments);
		}
		function _loadAll() {
			_loadAll = _asyncToGenerator(function* () {
				loading.value = true;
				const u = userStore.userInfo || {};
				profile.name = u.nickname || u.username || "";
				profile.phone = u.phone || "";
				profile.hireDate = fmtDate(u.hireDate);
				try {
					const me = yield employeeApi.me();
					fillProfileFromRow((me === null || me === void 0 ? void 0 : me.data) || me);
				} catch (_unused) {}
				try {
					const res = yield transferApi.list({
						pageNum: 1,
						pageSize: 100
					});
					const records = (res === null || res === void 0 ? void 0 : res.records) || (res === null || res === void 0 ? void 0 : res.list) || (Array.isArray(res) ? res : []);
					transfers.value = [...records].sort((a, b) => {
						const da = new Date(a.effectiveDate || a.createTime || 0).getTime();
						return new Date(b.effectiveDate || b.createTime || 0).getTime() - da;
					});
					const latest = records.find((r) => r.toDeptName || r.toPostName || r.empCode);
					if (latest) {
						if (!profile.deptName && latest.toDeptName) profile.deptName = latest.toDeptName;
						if (!profile.postName && latest.toPostName) profile.postName = latest.toPostName;
						if (!profile.empCode && latest.empCode) profile.empCode = latest.empCode;
						if (!profile.name && latest.employeeName) profile.name = latest.employeeName;
					}
				} catch (e) {
					transfers.value = [];
				}
				try {
					const list = yield laborContractApi.my();
					contracts.value = Array.isArray(list) ? list : (list === null || list === void 0 ? void 0 : list.records) || [];
					fillProfileFromRow(contracts.value[0]);
				} catch (e) {
					contracts.value = [];
				}
				if (!profile.deptName || !profile.postName || !profile.empCode) try {
					const ps = yield payslipApi.my();
					const rows = Array.isArray(ps) ? ps : (ps === null || ps === void 0 ? void 0 : ps.records) || [];
					if (rows.length) fillProfileFromRow(rows[0]);
				} catch (e) {}
				loading.value = false;
			});
			return _loadAll.apply(this, arguments);
		}
		onMounted(_asyncToGenerator(function* () {
			if (!userStore.userInfo || !userStore.userInfo.username) try {
				yield userStore.getUserInfo();
			} catch (e) {}
			loadAll();
		}));
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_empty = ElEmpty;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("header", _hoisted_2, [_cache[1] || (_cache[1] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "ss-title" }, "员工自助服务"), createBaseVNode("p", { class: "ss-sub" }, "一站式查看个人档案、人事异动记录，并快速进入我的薪资、绩效、合同等自助功能。")], -1)), createVNode(_component_el_button, {
				icon: unref(refresh_default),
				onClick: loadAll,
				loading: unref(loading)
			}, {
				default: withCtx(() => [..._cache[0] || (_cache[0] = [createTextVNode("刷新", -1)])]),
				_: 1
			}, 8, ["icon", "loading"])]), createBaseVNode("div", _hoisted_3, [
				createBaseVNode("section", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(user_default))]),
						_: 1
					}), _cache[2] || (_cache[2] = createBaseVNode("span", null, "个人档案", -1))]),
					createBaseVNode("div", _hoisted_6, [createBaseVNode("div", _hoisted_7, toDisplayString(unref(avatarText)), 1), createBaseVNode("div", _hoisted_8, [createBaseVNode("div", _hoisted_9, toDisplayString(unref(profile).name || "-"), 1), createBaseVNode("div", _hoisted_10, [createVNode(_component_el_tag, {
						size: "small",
						effect: "plain"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(profile).deptName || "部门未登记"), 1)]),
						_: 1
					}), createVNode(_component_el_tag, {
						size: "small",
						effect: "plain",
						type: "success"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(profile).postName || "岗位未登记"), 1)]),
						_: 1
					})])])]),
					createVNode(_component_el_descriptions, {
						column: 1,
						border: "",
						size: "small",
						class: "profile-desc"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: "工号" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(profile).empCode || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "部门" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(profile).deptName || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "岗位" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(profile).postName || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "手机号" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(profile).phone || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "入职日期" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(profile).hireDate || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "在职天数" }, {
								default: withCtx(() => [unref(workedDays) !== null ? (openBlock(), createElementBlock("span", _hoisted_11, "已入职 " + toDisplayString(unref(workedDays)) + " 天", 1)) : (openBlock(), createElementBlock("span", _hoisted_12, "—"))]),
								_: 1
							})
						]),
						_: 1
					}),
					_cache[3] || (_cache[3] = createBaseVNode("p", { class: "card-hint" }, "档案数据来自登录信息及本人已发放工资条/合同，仅供本人查看。如有错漏请联系 HR 更正。", -1))
				]),
				createBaseVNode("section", _hoisted_13, [
					createBaseVNode("div", _hoisted_14, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(switch_default))]),
						_: 1
					}), _cache[4] || (_cache[4] = createBaseVNode("span", null, "人事异动时间线", -1))]),
					withDirectives((openBlock(), createElementBlock("div", _hoisted_15, [unref(transfers).length ? (openBlock(), createBlock(_component_el_timeline, { key: 0 }, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(transfers), (t) => {
							return openBlock(), createBlock(_component_el_timeline_item, {
								key: t.id,
								timestamp: fmtDate(t.effectiveDate) || fmtDate(t.createTime),
								placement: "top",
								type: TRANSFER_DOT[t.transferType] || "primary",
								hollow: t.status === 0
							}, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_16, [
									createBaseVNode("div", _hoisted_17, [createBaseVNode("b", null, toDisplayString(TRANSFER_TYPE[t.transferType] || "异动"), 1), createVNode(_component_el_tag, {
										size: "small",
										type: STATUS_TAG[t.status] || "info",
										effect: "light"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(STATUS_LABEL[t.status] || "—"), 1)]),
										_: 2
									}, 1032, ["type"])]),
									t.fromDeptName || t.toDeptName ? (openBlock(), createElementBlock("div", _hoisted_18, " 部门：" + toDisplayString(t.fromDeptName || "—") + " → " + toDisplayString(t.toDeptName || "—"), 1)) : createCommentVNode("", true),
									t.fromPostName || t.toPostName ? (openBlock(), createElementBlock("div", _hoisted_19, " 岗位：" + toDisplayString(t.fromPostName || "—") + " → " + toDisplayString(t.toPostName || "—"), 1)) : createCommentVNode("", true),
									t.reason ? (openBlock(), createElementBlock("div", _hoisted_20, "原因：" + toDisplayString(t.reason), 1)) : createCommentVNode("", true)
								])]),
								_: 2
							}, 1032, [
								"timestamp",
								"type",
								"hollow"
							]);
						}), 128))]),
						_: 1
					})) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "暂无人事异动记录",
						"image-size": 70
					}))])), [[_directive_loading, unref(loading)]]),
					_cache[5] || (_cache[5] = createBaseVNode("p", { class: "card-hint" }, "异动记录来自「人事异动」，仅显示本人（入职/转正/调岗/晋升/离职）。奖惩记录待接入。", -1))
				]),
				createBaseVNode("section", _hoisted_21, [createBaseVNode("div", _hoisted_22, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(grid_default))]),
					_: 1
				}), _cache[6] || (_cache[6] = createBaseVNode("span", null, "快捷入口", -1))]), createBaseVNode("div", _hoisted_23, [(openBlock(), createElementBlock(Fragment, null, renderList(entries, (e) => {
					return createBaseVNode("div", {
						key: e.title,
						class: normalizeClass(["entry", { "entry-disabled": e.disabled }]),
						onClick: ($event) => onEntry(e)
					}, [
						createVNode(_component_el_icon, {
							class: "entry-icon",
							style: normalizeStyle({ background: e.color })
						}, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(e.icon)))]),
							_: 2
						}, 1032, ["style"]),
						createBaseVNode("div", _hoisted_25, [createBaseVNode("div", _hoisted_26, toDisplayString(e.title), 1), createBaseVNode("div", _hoisted_27, toDisplayString(e.desc), 1)]),
						e.disabled ? (openBlock(), createBlock(_component_el_tag, {
							key: 0,
							size: "small",
							type: "info",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("敬请期待", -1)])]),
							_: 1
						})) : createCommentVNode("", true)
					], 10, _hoisted_24);
				}), 64))])]),
				createBaseVNode("section", _hoisted_28, [createBaseVNode("div", _hoisted_29, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(document_default))]),
					_: 1
				}), _cache[8] || (_cache[8] = createBaseVNode("span", null, "我的合同", -1))]), withDirectives((openBlock(), createElementBlock("div", null, [unref(contracts).length ? (openBlock(), createBlock(_component_el_table, {
					key: 0,
					data: unref(contracts),
					border: "",
					stripe: "",
					size: "small"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "合同编号",
							prop: "contractNo",
							"min-width": "130"
						}),
						createVNode(_component_el_table_column, {
							label: "类型",
							prop: "contractType",
							width: "100",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "开始日期",
							width: "110",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmtDate(row.startDate)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "结束日期",
							width: "110",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmtDate(row.endDate)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "90",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: CONTRACT_TAG[row.status] || "info",
								effect: "light"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(CONTRACT_LABEL[row.status] || "—"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])) : (openBlock(), createBlock(_component_el_empty, {
					key: 1,
					description: "暂无本人劳动合同记录",
					"image-size": 60
				}))])), [[_directive_loading, unref(loading)]])])
			])]);
		};
	}
}), [["__scopeId", "data-v-febd88d0"]]);
//#endregion
export { self_service_default as default };
