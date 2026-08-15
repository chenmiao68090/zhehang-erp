import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, gt as nextTick, it as createTextVNode, kn as normalizeClass, kt as resolveComponent, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, Dr as withModifiers, Er as withKeys, F as ElEmpty, Q as ElRadioGroup, S as ElSkeleton, W as ElDatePicker, Z as ElRadioButton, _t as ElFormItem, a as ElMessageBox, gt as ElForm, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as useFieldOptions } from "./useFieldOptions-Ck3wetP1.js";
import { t as memoApi } from "./memo-EpvqH3OW.js";
//#region src/views/dashboard/memo.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "memo-page" };
var _hoisted_2 = { class: "memo-hero" };
var _hoisted_3 = { class: "hero-main" };
var _hoisted_4 = {
	class: "hero-icon",
	"aria-hidden": "true"
};
var _hoisted_5 = { class: "hero-actions" };
var _hoisted_6 = { class: "privacy-pill" };
var _hoisted_7 = {
	class: "summary-grid",
	"aria-label": "备忘统计"
};
var _hoisted_8 = { class: "summary-icon" };
var _hoisted_9 = { class: "summary-copy" };
var _hoisted_10 = { class: "summary-hint" };
var _hoisted_11 = { class: "summary-icon" };
var _hoisted_12 = { class: "summary-copy" };
var _hoisted_13 = { class: "summary-hint" };
var _hoisted_14 = { class: "summary-icon" };
var _hoisted_15 = { class: "summary-copy" };
var _hoisted_16 = { class: "summary-hint" };
var _hoisted_17 = { class: "summary-icon" };
var _hoisted_18 = { class: "summary-copy" };
var _hoisted_19 = { class: "summary-hint" };
var _hoisted_20 = { class: "section-heading editor-heading" };
var _hoisted_21 = { class: "heading-eyebrow" };
var _hoisted_22 = { class: "editor-grid" };
var _hoisted_23 = { class: "writing-column" };
var _hoisted_24 = { class: "setting-column" };
var _hoisted_25 = { class: "quick-times" };
var _hoisted_26 = { class: "priority-picker" };
var _hoisted_27 = ["onClick"];
var _hoisted_28 = {
	key: 0,
	class: "status-setting"
};
var _hoisted_29 = { class: "form-actions" };
var _hoisted_30 = { class: "save-shortcut" };
var _hoisted_31 = { class: "list-card" };
var _hoisted_32 = { class: "section-heading list-heading" };
var _hoisted_33 = { class: "filter-toolbar" };
var _hoisted_34 = { class: "filter-controls" };
var _hoisted_35 = { class: "result-bar" };
var _hoisted_36 = {
	key: 2,
	class: "memo-groups"
};
var _hoisted_37 = { class: "group-heading" };
var _hoisted_38 = { class: "check-cell" };
var _hoisted_39 = ["onClick", "onKeyup"];
var _hoisted_40 = { class: "item-labels" };
var _hoisted_41 = { class: "category-label" };
var _hoisted_42 = {
	key: 0,
	class: "completed-label"
};
var _hoisted_43 = { class: "item-content" };
var _hoisted_44 = {
	key: 0,
	class: "item-remark"
};
var _hoisted_45 = { class: "item-updated" };
var _hoisted_46 = { class: "time-cell" };
var _hoisted_47 = { class: "item-actions" };
//#endregion
//#region src/views/dashboard/memo.vue
var memo_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "memo",
	setup(__props) {
		const route = useRoute();
		const pageLoading = ref(true);
		const listLoading = ref(false);
		const saving = ref(false);
		const togglingId = ref(null);
		const memos = ref([]);
		const activeFilter = ref("pending");
		const keyword = ref("");
		const filterCategory = ref("");
		const filterPriority = ref("");
		const editingId = ref(null);
		const editorRef = ref(null);
		const summary = reactive({
			pending: 0,
			today: 0,
			doneToday: 0,
			overdue: 0
		});
		const form = reactive({
			content: "",
			remindTime: "",
			priority: 2,
			category: "",
			completed: false,
			remark: ""
		});
		const { loading: categoryOptionsLoading, resolved: categoryOptionsResolved, defaultValue: categoryDefaultValue, withHistoricalValues: withCategoryHistory, isSelectable: isCategorySelectable } = useFieldOptions("memo_category", [
			{
				label: "客户跟进",
				value: "客户跟进",
				defaultValue: true
			},
			{
				label: "财务协同",
				value: "财务协同",
				defaultValue: false
			},
			{
				label: "团队管理",
				value: "团队管理",
				defaultValue: false
			},
			{
				label: "系统优化",
				value: "系统优化",
				defaultValue: false
			},
			{
				label: "学习成长",
				value: "学习成长",
				defaultValue: false
			},
			{
				label: "个人事项",
				value: "个人事项",
				defaultValue: false
			}
		]);
		const priorityOptions = [
			{
				value: 3,
				label: "重要",
				description: "优先处理",
				className: "high"
			},
			{
				value: 2,
				label: "普通",
				description: "正常跟进",
				className: "normal"
			},
			{
				value: 1,
				label: "低",
				description: "可稍后处理",
				className: "low"
			}
		];
		const shortcutLabel = computed(() => /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl");
		const categoryEditOptions = computed(() => withCategoryHistory(form.category));
		const categoryFilterOptions = computed(() => {
			return withCategoryHistory([...memos.value.map((item) => {
				var _item$category;
				return ((_item$category = item.category) === null || _item$category === void 0 ? void 0 : _item$category.trim()) || "";
			}).filter(Boolean), filterCategory.value]).map((item) => _objectSpread2(_objectSpread2({}, item), {}, { disabled: false }));
		});
		const hasExtraFilters = computed(() => !!keyword.value.trim() || !!filterCategory.value || filterPriority.value !== "");
		const filteredMemos = computed(() => {
			const now = /* @__PURE__ */ new Date();
			const query = keyword.value.trim().toLocaleLowerCase();
			return memos.value.filter((item) => {
				if (activeFilter.value === "pending" && item.completed) return false;
				if (activeFilter.value === "done" && !item.completed) return false;
				if (activeFilter.value === "overdue" && !isOverdue(item)) return false;
				if (activeFilter.value === "today" && !isSameDay(toDate(item.remindTime), now)) return false;
				if (activeFilter.value === "week" && !isInCurrentWeek(toDate(item.remindTime), now)) return false;
				if (filterCategory.value && item.category !== filterCategory.value) return false;
				if (filterPriority.value !== "" && Number(item.priority || 2) !== Number(filterPriority.value)) return false;
				if (query) {
					if (![
						item.content,
						item.category,
						item.remark
					].filter(Boolean).join(" ").toLocaleLowerCase().includes(query)) return false;
				}
				return true;
			});
		});
		const groupedMemos = computed(() => {
			const buckets = {
				overdue: [],
				today: [],
				upcoming: [],
				unscheduled: [],
				done: []
			};
			const now = /* @__PURE__ */ new Date();
			filteredMemos.value.forEach((item) => {
				if (item.completed) {
					buckets.done.push(item);
					return;
				}
				const plan = toDate(item.remindTime);
				if (!plan) buckets.unscheduled.push(item);
				else if (plan.getTime() < now.getTime()) buckets.overdue.push(item);
				else if (isSameDay(plan, now)) buckets.today.push(item);
				else buckets.upcoming.push(item);
			});
			return [
				{
					key: "overdue",
					title: "已逾期",
					description: "需要优先处理",
					tone: "danger",
					items: buckets.overdue
				},
				{
					key: "today",
					title: "今天",
					description: "今日计划",
					tone: "primary",
					items: buckets.today
				},
				{
					key: "upcoming",
					title: "接下来",
					description: "已安排时间",
					tone: "success",
					items: buckets.upcoming
				},
				{
					key: "unscheduled",
					title: "未安排",
					description: "暂无计划时间",
					tone: "muted",
					items: buckets.unscheduled
				},
				{
					key: "done",
					title: "已完成",
					description: "可恢复为未完成",
					tone: "done",
					items: buckets.done
				}
			].filter((group) => group.items.length > 0);
		});
		const emptyDescription = computed(() => {
			if (hasExtraFilters.value) return "没有找到匹配的备忘，可以重置筛选后再试";
			return {
				pending: "暂无未完成备忘",
				today: "今天没有安排备忘",
				week: "本周没有安排备忘",
				overdue: "很好，当前没有逾期备忘",
				done: "暂无已完成备忘",
				all: "还没有备忘，先记下第一件事"
			}[activeFilter.value];
		});
		function pad2(value) {
			return String(value).padStart(2, "0");
		}
		function toDate(value) {
			if (!value) return null;
			const result = new Date(value.replace(" ", "T"));
			return Number.isNaN(result.getTime()) ? null : result;
		}
		function isSameDay(value, compare) {
			return !!value && value.getFullYear() === compare.getFullYear() && value.getMonth() === compare.getMonth() && value.getDate() === compare.getDate();
		}
		function isInCurrentWeek(value, compare) {
			if (!value) return false;
			const monday = new Date(compare);
			const offset = (compare.getDay() + 6) % 7;
			monday.setDate(compare.getDate() - offset);
			monday.setHours(0, 0, 0, 0);
			const nextMonday = new Date(monday);
			nextMonday.setDate(monday.getDate() + 7);
			return value >= monday && value < nextMonday;
		}
		function dateTimeText(date) {
			return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:00`;
		}
		function defaultPlanTime() {
			const date = /* @__PURE__ */ new Date();
			date.setMinutes(0, 0, 0);
			date.setHours(date.getHours() + 2);
			return dateTimeText(date);
		}
		function setQuickTime(key) {
			const date = /* @__PURE__ */ new Date();
			if (key === "later") {
				date.setMinutes(0, 0, 0);
				date.setHours(date.getHours() + 2);
			} else if (key === "tomorrow") {
				date.setDate(date.getDate() + 1);
				date.setHours(9, 0, 0, 0);
			} else {
				const daysUntilNextMonday = (8 - date.getDay()) % 7 || 7;
				date.setDate(date.getDate() + daysUntilNextMonday);
				date.setHours(9, 0, 0, 0);
			}
			form.remindTime = dateTimeText(date);
		}
		function priorityMeta(priority) {
			if (Number(priority) === 3) return {
				label: "重要",
				className: "high"
			};
			if (Number(priority) === 1) return {
				label: "低",
				className: "low"
			};
			return {
				label: "普通",
				className: "normal"
			};
		}
		function isOverdue(item) {
			const plan = toDate(item.remindTime);
			return !item.completed && !!plan && plan.getTime() < Date.now();
		}
		function timeMeta(item) {
			if (item.completed) return {
				label: "已完成",
				className: "done"
			};
			const plan = toDate(item.remindTime);
			if (!plan) return {
				label: "未安排",
				className: "muted"
			};
			if (plan.getTime() < Date.now()) return {
				label: "已逾期",
				className: "danger"
			};
			if (isSameDay(plan, /* @__PURE__ */ new Date())) return {
				label: "今天",
				className: "primary"
			};
			return {
				label: "已安排",
				className: "success"
			};
		}
		function formatPlanTime(value) {
			const date = toDate(value);
			if (!date) return "暂无计划时间";
			return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${[
				"周日",
				"周一",
				"周二",
				"周三",
				"周四",
				"周五",
				"周六"
			][date.getDay()]} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
		}
		function formatUpdated(value) {
			const date = toDate(value);
			if (!date) return "暂无更新时间";
			return `更新于 ${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
		}
		function resetForm() {
			editingId.value = null;
			form.content = "";
			form.remindTime = defaultPlanTime();
			form.priority = 2;
			form.category = "";
			form.completed = false;
			form.completedTime = void 0;
			form.remark = "";
			applyCategoryDefault();
		}
		function applyCategoryDefault() {
			if (editingId.value || !categoryOptionsResolved.value || form.category) return;
			form.category = categoryDefaultValue.value || "";
		}
		watch([categoryOptionsResolved, categoryDefaultValue], applyCategoryDefault);
		function scrollToEditor() {
			nextTick(() => {
				var _editorRef$value;
				return (_editorRef$value = editorRef.value) === null || _editorRef$value === void 0 ? void 0 : _editorRef$value.scrollIntoView({
					behavior: "smooth",
					block: "start"
				});
			});
		}
		function startCreate() {
			resetForm();
			scrollToEditor();
		}
		function editMemo(item) {
			editingId.value = item.id || null;
			form.content = item.content || "";
			form.remindTime = item.remindTime || "";
			form.priority = Number(item.priority || 2);
			form.category = item.category || "";
			form.completed = !!item.completed;
			form.completedTime = item.completedTime;
			form.remark = item.remark || "";
			scrollToEditor();
		}
		function resetFilters() {
			keyword.value = "";
			filterCategory.value = "";
			filterPriority.value = "";
		}
		function loadMemos() {
			return _loadMemos.apply(this, arguments);
		}
		function _loadMemos() {
			_loadMemos = _asyncToGenerator(function* () {
				listLoading.value = true;
				try {
					const response = yield memoApi.list({
						scope: "all",
						limit: 100
					});
					memos.value = (response === null || response === void 0 ? void 0 : response.data) || response || [];
				} catch (_unused) {
					memos.value = [];
				} finally {
					listLoading.value = false;
				}
			});
			return _loadMemos.apply(this, arguments);
		}
		function loadSummary() {
			return _loadSummary.apply(this, arguments);
		}
		function _loadSummary() {
			_loadSummary = _asyncToGenerator(function* () {
				try {
					const response = yield memoApi.summary();
					const data = (response === null || response === void 0 ? void 0 : response.data) || response || {};
					summary.pending = Number(data.pending || 0);
					summary.today = Number(data.today || 0);
					summary.doneToday = Number(data.doneToday || 0);
					summary.overdue = Number(data.overdue || 0);
				} catch (_unused2) {
					summary.pending = 0;
					summary.today = 0;
					summary.doneToday = 0;
					summary.overdue = 0;
				}
			});
			return _loadSummary.apply(this, arguments);
		}
		function refreshData() {
			return _refreshData.apply(this, arguments);
		}
		function _refreshData() {
			_refreshData = _asyncToGenerator(function* () {
				yield Promise.all([loadMemos(), loadSummary()]);
			});
			return _refreshData.apply(this, arguments);
		}
		function submitMemo() {
			return _submitMemo.apply(this, arguments);
		}
		function _submitMemo() {
			_submitMemo = _asyncToGenerator(function* () {
				var _form$category, _form$remark;
				const content = form.content.trim();
				const category = ((_form$category = form.category) === null || _form$category === void 0 ? void 0 : _form$category.trim()) || "";
				const remark = ((_form$remark = form.remark) === null || _form$remark === void 0 ? void 0 : _form$remark.trim()) || "";
				if (!categoryOptionsResolved.value) {
					ElMessage.warning("备忘分类正在加载，请稍后保存");
					return;
				}
				if (!content) {
					ElMessage.warning("请先填写备忘内容");
					return;
				}
				if (content.length > 500 || remark.length > 500) {
					ElMessage.warning("事项内容和备注均不能超过500字");
					return;
				}
				if (category.length > 30) {
					ElMessage.warning("分类名称不能超过30个字");
					return;
				}
				if (!editingId.value && category && !isCategorySelectable(category)) {
					ElMessage.warning("所选备忘分类已停用，请重新选择");
					return;
				}
				saving.value = true;
				try {
					const data = {
						id: editingId.value || void 0,
						content,
						remindTime: form.remindTime || void 0,
						priority: Number(form.priority || 2),
						category,
						completed: !!form.completed,
						completedTime: form.completedTime,
						remark
					};
					if (editingId.value) {
						yield memoApi.update(data);
						ElMessage.success("备忘已更新");
					} else {
						yield memoApi.create(data);
						ElMessage.success("备忘已新增");
					}
					resetForm();
					yield refreshData();
				} catch (_unused3) {
					ElMessage.error("保存失败，请稍后重试");
				} finally {
					saving.value = false;
				}
			});
			return _submitMemo.apply(this, arguments);
		}
		function toggleMemo(_x, _x2) {
			return _toggleMemo.apply(this, arguments);
		}
		function _toggleMemo() {
			_toggleMemo = _asyncToGenerator(function* (item, completed) {
				if (!item.id) return;
				togglingId.value = item.id;
				try {
					yield memoApi.complete(item.id, completed);
					item.completed = completed;
					item.completedTime = completed ? dateTimeText(/* @__PURE__ */ new Date()) : void 0;
					if (editingId.value === item.id) {
						form.completed = completed;
						form.completedTime = item.completedTime;
					}
					yield loadSummary();
					ElMessage.success(completed ? "已标记完成" : "已恢复为未完成");
				} catch (_unused4) {
					ElMessage.error("状态更新失败，请重试");
				} finally {
					togglingId.value = null;
				}
			});
			return _toggleMemo.apply(this, arguments);
		}
		function removeMemo(_x3) {
			return _removeMemo.apply(this, arguments);
		}
		function _removeMemo() {
			_removeMemo = _asyncToGenerator(function* (item) {
				if (!item.id) return;
				try {
					yield ElMessageBox.confirm(`确定删除「${item.content.slice(0, 32)}${item.content.length > 32 ? "…" : ""}」吗？`, "删除备忘", {
						type: "warning",
						confirmButtonText: "确定删除",
						cancelButtonText: "取消"
					});
				} catch (_unused5) {
					return;
				}
				try {
					yield memoApi.remove(item.id);
					if (editingId.value === item.id) resetForm();
					yield refreshData();
					ElMessage.success("备忘已删除");
				} catch (_unused6) {
					ElMessage.error("删除失败，请重试");
				}
			});
			return _removeMemo.apply(this, arguments);
		}
		onMounted(_asyncToGenerator(function* () {
			resetForm();
			yield refreshData();
			const rawEditId = Array.isArray(route.query.edit) ? route.query.edit[0] : route.query.edit;
			const editId = Number(rawEditId);
			if (Number.isFinite(editId) && editId > 0) {
				const target = memos.value.find((item) => Number(item.id) === editId);
				if (target) editMemo(target);
			}
			pageLoading.value = false;
		}));
		return (_ctx, _cache) => {
			const _component_Memo = resolveComponent("Memo", true);
			const _component_el_icon = ElIcon;
			const _component_Lock = resolveComponent("Lock");
			const _component_Plus = resolveComponent("Plus");
			const _component_el_button = ElButton;
			const _component_List = resolveComponent("List");
			const _component_ArrowRight = resolveComponent("ArrowRight");
			const _component_Calendar = resolveComponent("Calendar");
			const _component_WarningFilled = resolveComponent("WarningFilled");
			const _component_CircleCheckFilled = resolveComponent("CircleCheckFilled");
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_switch = ElSwitch;
			const _component_el_form = ElForm;
			const _component_RefreshRight = resolveComponent("RefreshRight");
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_Search = resolveComponent("Search");
			const _component_el_skeleton = ElSkeleton;
			const _component_el_empty = ElEmpty;
			const _component_el_checkbox = ElCheckbox;
			const _component_Clock = resolveComponent("Clock");
			const _directive_loading = vLoading;
			return withDirectives((openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("section", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("div", _hoisted_4, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(_component_Memo)]),
					_: 1
				})]), _cache[17] || (_cache[17] = createBaseVNode("div", null, [
					createBaseVNode("div", { class: "hero-kicker" }, "PERSONAL WORKSPACE"),
					createBaseVNode("h1", null, "我的备忘录"),
					createBaseVNode("p", null, "把临时想法、客户跟进和管理提醒放在一处，完成后随手勾选，不让事情遗漏。")
				], -1))]), createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(_component_Lock)]),
					_: 1
				}), _cache[18] || (_cache[18] = createTextVNode("仅自己可见", -1))]), createVNode(_component_el_button, {
					type: "primary",
					size: "large",
					onClick: startCreate
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(_component_Plus)]),
						_: 1
					}), _cache[19] || (_cache[19] = createTextVNode(" 新建备忘 ", -1))]),
					_: 1
				})])]),
				createBaseVNode("section", _hoisted_7, [
					createBaseVNode("button", {
						type: "button",
						class: normalizeClass(["summary-card pending", { active: activeFilter.value === "pending" }]),
						onClick: _cache[0] || (_cache[0] = ($event) => activeFilter.value = "pending")
					}, [
						createBaseVNode("span", _hoisted_8, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_List)]),
							_: 1
						})]),
						createBaseVNode("span", _hoisted_9, [createBaseVNode("b", null, toDisplayString(summary.pending), 1), _cache[20] || (_cache[20] = createBaseVNode("small", null, "全部待完成", -1))]),
						createBaseVNode("span", _hoisted_10, [_cache[21] || (_cache[21] = createTextVNode("查看", -1)), createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_ArrowRight)]),
							_: 1
						})])
					], 2),
					createBaseVNode("button", {
						type: "button",
						class: normalizeClass(["summary-card today", { active: activeFilter.value === "today" }]),
						onClick: _cache[1] || (_cache[1] = ($event) => activeFilter.value = "today")
					}, [
						createBaseVNode("span", _hoisted_11, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_Calendar)]),
							_: 1
						})]),
						createBaseVNode("span", _hoisted_12, [createBaseVNode("b", null, toDisplayString(summary.today), 1), _cache[22] || (_cache[22] = createBaseVNode("small", null, "今日计划", -1))]),
						createBaseVNode("span", _hoisted_13, [_cache[23] || (_cache[23] = createTextVNode("查看", -1)), createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_ArrowRight)]),
							_: 1
						})])
					], 2),
					createBaseVNode("button", {
						type: "button",
						class: normalizeClass(["summary-card overdue", { active: activeFilter.value === "overdue" }]),
						onClick: _cache[2] || (_cache[2] = ($event) => activeFilter.value = "overdue")
					}, [
						createBaseVNode("span", _hoisted_14, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_WarningFilled)]),
							_: 1
						})]),
						createBaseVNode("span", _hoisted_15, [createBaseVNode("b", null, toDisplayString(summary.overdue), 1), _cache[24] || (_cache[24] = createBaseVNode("small", null, "已逾期", -1))]),
						createBaseVNode("span", _hoisted_16, [_cache[25] || (_cache[25] = createTextVNode("优先处理", -1)), createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_ArrowRight)]),
							_: 1
						})])
					], 2),
					createBaseVNode("button", {
						type: "button",
						class: normalizeClass(["summary-card done", { active: activeFilter.value === "done" }]),
						onClick: _cache[3] || (_cache[3] = ($event) => activeFilter.value = "done")
					}, [
						createBaseVNode("span", _hoisted_17, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_CircleCheckFilled)]),
							_: 1
						})]),
						createBaseVNode("span", _hoisted_18, [createBaseVNode("b", null, toDisplayString(summary.doneToday), 1), _cache[26] || (_cache[26] = createBaseVNode("small", null, "今日已完成", -1))]),
						createBaseVNode("span", _hoisted_19, [_cache[27] || (_cache[27] = createTextVNode("查看", -1)), createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_ArrowRight)]),
							_: 1
						})])
					], 2)
				]),
				createBaseVNode("section", {
					ref_key: "editorRef",
					ref: editorRef,
					class: "editor-card"
				}, [createBaseVNode("div", _hoisted_20, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_21, toDisplayString(editingId.value ? "正在编辑" : "快速记录"), 1), createBaseVNode("h2", null, toDisplayString(editingId.value ? "修改这条备忘" : "写下一件不能忘的事"), 1)]), editingId.value ? (openBlock(), createBlock(_component_el_button, {
					key: 0,
					plain: "",
					onClick: startCreate
				}, {
					default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("退出编辑", -1)])]),
					_: 1
				})) : createCommentVNode("", true)]), createVNode(_component_el_form, {
					"label-position": "top",
					class: "memo-form",
					onSubmit: _cache[12] || (_cache[12] = withModifiers(() => {}, ["prevent"]))
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_22, [createBaseVNode("div", _hoisted_23, [createVNode(_component_el_form_item, {
						label: "事项内容",
						required: ""
					}, {
						default: withCtx(() => [createVNode(_component_el_input, {
							modelValue: form.content,
							"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.content = $event),
							type: "textarea",
							rows: 7,
							resize: "vertical",
							maxlength: "500",
							"show-word-limit": "",
							placeholder: "例如：周三前确认重点客户的续费方案、负责人和下一步。支持换行和编号。",
							onKeydown: [withKeys(withModifiers(submitMemo, ["meta", "prevent"]), ["enter"]), withKeys(withModifiers(submitMemo, ["ctrl", "prevent"]), ["enter"])]
						}, null, 8, ["modelValue", "onKeydown"])]),
						_: 1
					}), createVNode(_component_el_form_item, { label: "补充备注" }, {
						default: withCtx(() => [createVNode(_component_el_input, {
							modelValue: form.remark,
							"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.remark = $event),
							type: "textarea",
							rows: 3,
							resize: "vertical",
							maxlength: "500",
							"show-word-limit": "",
							placeholder: "可记录背景、需要准备的资料或完成标准",
							onKeydown: [withKeys(withModifiers(submitMemo, ["meta", "prevent"]), ["enter"]), withKeys(withModifiers(submitMemo, ["ctrl", "prevent"]), ["enter"])]
						}, null, 8, ["modelValue", "onKeydown"])]),
						_: 1
					})]), createBaseVNode("div", _hoisted_24, [
						createVNode(_component_el_form_item, { label: "计划时间" }, {
							default: withCtx(() => [createVNode(_component_el_date_picker, {
								modelValue: form.remindTime,
								"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.remindTime = $event),
								type: "datetime",
								"value-format": "YYYY-MM-DD HH:mm:ss",
								placeholder: "选择计划时间",
								clearable: false,
								style: { "width": "100%" }
							}, null, 8, ["modelValue"]), createBaseVNode("div", _hoisted_25, [
								createBaseVNode("button", {
									type: "button",
									onClick: _cache[7] || (_cache[7] = ($event) => setQuickTime("later"))
								}, "2小时后"),
								createBaseVNode("button", {
									type: "button",
									onClick: _cache[8] || (_cache[8] = ($event) => setQuickTime("tomorrow"))
								}, "明天 09:00"),
								createBaseVNode("button", {
									type: "button",
									onClick: _cache[9] || (_cache[9] = ($event) => setQuickTime("monday"))
								}, "下周一 09:00")
							])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "分类" }, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: form.category,
								"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.category = $event),
								filterable: "",
								clearable: "",
								"default-first-option": "",
								loading: unref(categoryOptionsLoading),
								disabled: !unref(categoryOptionsResolved),
								placeholder: "选择分类",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(categoryEditOptions.value, (category) => {
									return openBlock(), createBlock(_component_el_option, {
										key: category.value,
										label: category.label,
										value: category.value,
										disabled: category.disabled
									}, null, 8, [
										"label",
										"value",
										"disabled"
									]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"loading",
								"disabled"
							])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "优先级" }, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_26, [(openBlock(), createElementBlock(Fragment, null, renderList(priorityOptions, (option) => {
								return createBaseVNode("button", {
									key: option.value,
									type: "button",
									class: normalizeClass([
										"priority-choice",
										option.className,
										{ selected: form.priority === option.value }
									]),
									onClick: ($event) => form.priority = option.value
								}, [_cache[29] || (_cache[29] = createBaseVNode("span", { class: "priority-dot" }, null, -1)), createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(option.label), 1), createBaseVNode("small", null, toDisplayString(option.description), 1)])], 10, _hoisted_27);
							}), 64))])]),
							_: 1
						}),
						editingId.value ? (openBlock(), createElementBlock("div", _hoisted_28, [_cache[30] || (_cache[30] = createBaseVNode("div", null, [createBaseVNode("b", null, "完成状态"), createBaseVNode("span", null, "修改后会同步到首页速览")], -1)), createVNode(_component_el_switch, {
							modelValue: form.completed,
							"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.completed = $event),
							"active-text": "已完成",
							"inactive-text": "未完成"
						}, null, 8, ["modelValue"])])) : createCommentVNode("", true),
						createBaseVNode("div", _hoisted_29, [createBaseVNode("span", _hoisted_30, toDisplayString(shortcutLabel.value) + " + Enter 保存", 1), createBaseVNode("div", null, [createVNode(_component_el_button, { onClick: resetForm }, {
							default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("清空", -1)])]),
							_: 1
						}), createVNode(_component_el_button, {
							type: "primary",
							loading: saving.value,
							disabled: !unref(categoryOptionsResolved),
							onClick: submitMemo
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(editingId.value ? "保存修改" : "新增备忘"), 1)]),
							_: 1
						}, 8, ["loading", "disabled"])])])
					])])]),
					_: 1
				})], 512),
				createBaseVNode("section", _hoisted_31, [
					createBaseVNode("div", _hoisted_32, [_cache[33] || (_cache[33] = createBaseVNode("div", null, [createBaseVNode("div", { class: "heading-eyebrow" }, "MEMO LIST"), createBaseVNode("h2", null, "备忘清单")], -1)), createVNode(_component_el_button, {
						loading: listLoading.value,
						onClick: refreshData
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_RefreshRight)]),
							_: 1
						}), _cache[32] || (_cache[32] = createTextVNode(" 刷新 ", -1))]),
						_: 1
					}, 8, ["loading"])]),
					createBaseVNode("div", _hoisted_33, [createVNode(_component_el_radio_group, {
						modelValue: activeFilter.value,
						"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => activeFilter.value = $event),
						class: "filter-tabs"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_radio_button, { value: "pending" }, {
								default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("未完成", -1)])]),
								_: 1
							}),
							createVNode(_component_el_radio_button, { value: "today" }, {
								default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("今天", -1)])]),
								_: 1
							}),
							createVNode(_component_el_radio_button, { value: "week" }, {
								default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("本周", -1)])]),
								_: 1
							}),
							createVNode(_component_el_radio_button, { value: "overdue" }, {
								default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("已逾期", -1)])]),
								_: 1
							}),
							createVNode(_component_el_radio_button, { value: "done" }, {
								default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("已完成", -1)])]),
								_: 1
							}),
							createVNode(_component_el_radio_button, { value: "all" }, {
								default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("全部", -1)])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["modelValue"]), createBaseVNode("div", _hoisted_34, [
						createVNode(_component_el_input, {
							modelValue: keyword.value,
							"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => keyword.value = $event),
							clearable: "",
							placeholder: "搜索内容、分类或备注",
							class: "search-input"
						}, {
							prefix: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(_component_Search)]),
								_: 1
							})]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: filterCategory.value,
							"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => filterCategory.value = $event),
							clearable: "",
							loading: unref(categoryOptionsLoading),
							disabled: !unref(categoryOptionsResolved),
							placeholder: "全部分类",
							class: "category-filter"
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(categoryFilterOptions.value, (category) => {
								return openBlock(), createBlock(_component_el_option, {
									key: category.value,
									label: category.label,
									value: category.value
								}, null, 8, ["label", "value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"loading",
							"disabled"
						]),
						createVNode(_component_el_select, {
							modelValue: filterPriority.value,
							"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => filterPriority.value = $event),
							clearable: "",
							placeholder: "全部优先级",
							class: "priority-filter"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_option, {
									label: "重要",
									value: 3
								}),
								createVNode(_component_el_option, {
									label: "普通",
									value: 2
								}),
								createVNode(_component_el_option, {
									label: "低",
									value: 1
								})
							]),
							_: 1
						}, 8, ["modelValue"]),
						hasExtraFilters.value ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							link: "",
							type: "primary",
							onClick: resetFilters
						}, {
							default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("重置筛选", -1)])]),
							_: 1
						})) : createCommentVNode("", true)
					])]),
					createBaseVNode("div", _hoisted_35, [createBaseVNode("span", null, [
						_cache[41] || (_cache[41] = createTextVNode("共 ", -1)),
						createBaseVNode("b", null, toDisplayString(filteredMemos.value.length), 1),
						_cache[42] || (_cache[42] = createTextVNode(" 条", -1))
					]), _cache[43] || (_cache[43] = createBaseVNode("span", null, "当前页最多读取最近 100 条个人备忘", -1))]),
					listLoading.value && !memos.value.length ? (openBlock(), createBlock(_component_el_skeleton, {
						key: 0,
						rows: 6,
						animated: ""
					})) : filteredMemos.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: emptyDescription.value,
						"image-size": 112
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: startCreate
						}, {
							default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("写一条备忘", -1)])]),
							_: 1
						})]),
						_: 1
					}, 8, ["description"])) : (openBlock(), createElementBlock("div", _hoisted_36, [(openBlock(true), createElementBlock(Fragment, null, renderList(groupedMemos.value, (group) => {
						return openBlock(), createElementBlock("section", {
							key: group.key,
							class: "memo-group"
						}, [createBaseVNode("div", _hoisted_37, [
							createBaseVNode("span", { class: normalizeClass(["group-dot", group.tone]) }, null, 2),
							createBaseVNode("h3", null, toDisplayString(group.title), 1),
							createBaseVNode("span", null, toDisplayString(group.description), 1),
							createBaseVNode("b", null, toDisplayString(group.items.length), 1)
						]), (openBlock(true), createElementBlock(Fragment, null, renderList(group.items, (item) => {
							return openBlock(), createElementBlock("article", {
								key: item.id,
								class: normalizeClass(["memo-item", {
									completed: item.completed,
									overdue: isOverdue(item),
									editing: editingId.value === item.id
								}])
							}, [
								createBaseVNode("div", _hoisted_38, [createVNode(_component_el_checkbox, {
									"model-value": !!item.completed,
									disabled: togglingId.value === item.id,
									"aria-label": item.completed ? "恢复为未完成" : "标记为已完成",
									onChange: (value) => toggleMemo(item, !!value)
								}, null, 8, [
									"model-value",
									"disabled",
									"aria-label",
									"onChange"
								])]),
								createBaseVNode("div", {
									class: "item-main",
									role: "button",
									tabindex: "0",
									onClick: ($event) => editMemo(item),
									onKeyup: withKeys(($event) => editMemo(item), ["enter"])
								}, [
									createBaseVNode("div", _hoisted_40, [
										createBaseVNode("span", { class: normalizeClass(["priority-label", priorityMeta(item.priority).className]) }, toDisplayString(priorityMeta(item.priority).label), 3),
										createBaseVNode("span", _hoisted_41, toDisplayString(item.category || "未分类"), 1),
										item.completed ? (openBlock(), createElementBlock("span", _hoisted_42, "已完成")) : createCommentVNode("", true)
									]),
									createBaseVNode("div", _hoisted_43, toDisplayString(item.content), 1),
									item.remark ? (openBlock(), createElementBlock("div", _hoisted_44, [_cache[45] || (_cache[45] = createBaseVNode("b", null, "备注", -1)), createBaseVNode("span", null, toDisplayString(item.remark), 1)])) : createCommentVNode("", true),
									createBaseVNode("div", _hoisted_45, toDisplayString(formatUpdated(item.updateTime || item.createTime)), 1)
								], 40, _hoisted_39),
								createBaseVNode("div", _hoisted_46, [createBaseVNode("span", { class: normalizeClass(["time-badge", timeMeta(item).className]) }, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(_component_Clock)]),
									_: 1
								}), createTextVNode(" " + toDisplayString(timeMeta(item).label), 1)], 2), createBaseVNode("small", null, toDisplayString(formatPlanTime(item.remindTime)), 1)]),
								createBaseVNode("div", _hoisted_47, [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => editMemo(item)
								}, {
									default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]), createVNode(_component_el_button, {
									link: "",
									type: "danger",
									onClick: ($event) => removeMemo(item)
								}, {
									default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])])
							], 2);
						}), 128))]);
					}), 128))]))
				])
			])), [[_directive_loading, pageLoading.value]]);
		};
	}
}), [["__scopeId", "data-v-11369602"]]);
//#endregion
export { memo_default as default };
