import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, dt as h, et as createElementBlock, g as _objectSpread2, gt as nextTick, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { Dn as office_building_default, Dr as withModifiers, F as ElEmpty, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, V as ElDialog, X as ElRadio, Xt as delete_default, Z as ElRadioButton, _t as ElFormItem, a as ElMessageBox, d as ElTree, en as edit_default, ft as ElAvatar, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, pr as user_filled_default, rt as ElSelect, u as ElTreeSelect, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi, t as deptApi } from "./org-DaVetSL-.js";
//#region src/views/org/dept.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container dept-page" };
var _hoisted_2 = { class: "dept-topbar" };
var _hoisted_3 = { class: "dept-topbar-title" };
var _hoisted_4 = { class: "dt-pill" };
var _hoisted_5 = {
	key: 0,
	class: "dt-pill warn"
};
var _hoisted_6 = { class: "dept-topbar-actions" };
var _hoisted_7 = {
	key: 0,
	class: "chart-overview"
};
var _hoisted_8 = {
	key: 0,
	class: "org-chart-scroll overview-scroll"
};
var _hoisted_9 = {
	key: 1,
	class: "dept-layout"
};
var _hoisted_10 = { class: "dept-tree-panel" };
var _hoisted_11 = { class: "panel-header tree-head" };
var _hoisted_12 = { class: "tree-head-sub" };
var _hoisted_13 = { class: "tree-node" };
var _hoisted_14 = { class: "tree-name" };
var _hoisted_15 = {
	key: 0,
	class: "tree-warn-dot",
	title: "未设负责人"
};
var _hoisted_16 = { class: "tree-actions" };
var _hoisted_17 = { class: "tree-cnt" };
var _hoisted_18 = { class: "dept-detail-panel" };
var _hoisted_19 = { class: "dm-hero" };
var _hoisted_20 = { class: "dm-hero-avatar" };
var _hoisted_21 = { class: "dm-hero-main" };
var _hoisted_22 = { class: "dm-hero-title" };
var _hoisted_23 = { class: "dm-hero-pills" };
var _hoisted_24 = {
	key: 0,
	class: "dt-pill"
};
var _hoisted_25 = { class: "dt-pill" };
var _hoisted_26 = { class: "dt-pill" };
var _hoisted_27 = {
	key: 2,
	class: "dt-pill warn"
};
var _hoisted_28 = { class: "detail-actions" };
var _hoisted_29 = { class: "dm-roster-bar" };
var _hoisted_30 = { class: "dm-roster" };
var _hoisted_31 = { class: "dm-gh" };
var _hoisted_32 = { class: "dm-gh-cnt" };
var _hoisted_33 = { class: "dm-gh-ops" };
var _hoisted_34 = { class: "dm-mr-main" };
var _hoisted_35 = {
	key: 0,
	class: "dm-star"
};
var _hoisted_36 = { class: "dm-mr-tail" };
var _hoisted_37 = {
	key: 1,
	class: "dm-empty"
};
var _hoisted_38 = ["onClick"];
var _hoisted_39 = { class: "dm-gh-name" };
var _hoisted_40 = { class: "dm-gh-cnt" };
var _hoisted_41 = ["onClick"];
var _hoisted_42 = ["onClick"];
var _hoisted_43 = ["onClick"];
var _hoisted_44 = { class: "dm-mr-main" };
var _hoisted_45 = {
	key: 0,
	class: "dm-star"
};
var _hoisted_46 = { class: "dm-mr-tail" };
var _hoisted_47 = {
	key: 0,
	class: "dm-empty"
};
var _hoisted_48 = {
	key: 3,
	class: "dm-foot"
};
var _hoisted_49 = { key: 0 };
var _hoisted_50 = { key: 1 };
//#endregion
//#region src/views/org/dept.vue
var dept_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "dept",
	setup(__props) {
		const { t } = useI18n();
		const treeRef = ref();
		const formRef = ref();
		const deptTree = ref([]);
		const currentDept = ref(null);
		const allEmployees = ref([]);
		const treeFilter = ref("");
		const dialogVisible = ref(false);
		const dialogTitle = ref("");
		const isEdit = ref(false);
		const memberDialog = ref({
			visible: false,
			employeeIds: [],
			saving: false
		});
		const formData = ref({
			id: void 0,
			parentId: 0,
			deptName: "",
			orderNum: 0,
			leader: "",
			phone: "",
			email: "",
			status: 0
		});
		const rules = {
			deptName: [{
				required: true,
				message: t("org.inputDeptName"),
				trigger: "blur"
			}],
			orderNum: [{
				required: true,
				message: t("org.inputSort"),
				trigger: "blur"
			}]
		};
		watch(treeFilter, (val) => {
			var _treeRef$value;
			(_treeRef$value = treeRef.value) === null || _treeRef$value === void 0 || _treeRef$value.filter(val);
		});
		const flattenDeptTree = (nodes = []) => nodes.reduce((list, item) => {
			list.push(item);
			if (Array.isArray(item.children) && item.children.length) list.push(...flattenDeptTree(item.children));
			return list;
		}, []);
		const findDeptById = (id) => flattenDeptTree(deptTree.value).find((item) => item.id === id);
		const membersByDept = computed(() => {
			const map = {};
			allEmployees.value.forEach((employee) => {
				const deptId = Number(employee.deptId);
				if (!deptId) return;
				if (!map[deptId]) map[deptId] = [];
				map[deptId].push(employee);
			});
			return map;
		});
		const currentDeptMembers = computed(() => {
			var _currentDept$value;
			if (!((_currentDept$value = currentDept.value) === null || _currentDept$value === void 0 ? void 0 : _currentDept$value.id)) return [];
			return membersByDept.value[currentDept.value.id] || [];
		});
		const availableEmployees = computed(() => {
			var _currentDept$value2;
			if (!((_currentDept$value2 = currentDept.value) === null || _currentDept$value2 === void 0 ? void 0 : _currentDept$value2.id)) return [];
			return allEmployees.value.filter((item) => item.id && Number(item.deptId) !== Number(currentDept.value.id));
		});
		const deptMemberCount = (deptId) => {
			var _membersByDept$value$;
			return ((_membersByDept$value$ = membersByDept.value[deptId]) === null || _membersByDept$value$ === void 0 ? void 0 : _membersByDept$value$.length) || 0;
		};
		const employeeInitial = (employee) => String((employee === null || employee === void 0 ? void 0 : employee.name) || (employee === null || employee === void 0 ? void 0 : employee.username) || "?").slice(0, 1);
		const employeeStatusText = (status) => {
			return {
				0: "待入职",
				1: "在职",
				2: "试用",
				3: "离职"
			}[status] || "未设置";
		};
		const employeeOptionLabel = (employee) => {
			const dept = employee.deptName || "未分部门";
			const phone = employee.phone || employee.username || "无联系方式";
			return `${employee.name || employee.username || "未命名"} · ${dept} · ${phone}`;
		};
		const filterNode = (value, data) => {
			if (!value) return true;
			return data.deptName.includes(value);
		};
		const loadTree = function() {
			var _ref = _asyncToGenerator(function* () {
				try {
					var _currentDept$value3;
					deptTree.value = (yield deptApi.tree()).data || [];
					if ((_currentDept$value3 = currentDept.value) === null || _currentDept$value3 === void 0 ? void 0 : _currentDept$value3.id) currentDept.value = findDeptById(currentDept.value.id) || currentDept.value;
					else if (deptTree.value.length) currentDept.value = deptTree.value[0];
				} catch (e) {}
			});
			return function loadTree() {
				return _ref.apply(this, arguments);
			};
		}();
		const loadEmployees = function() {
			var _ref2 = _asyncToGenerator(function* () {
				try {
					var _res$data, _res$data2;
					const res = yield employeeApi.list({
						pageNum: 1,
						pageSize: 5e3
					});
					allEmployees.value = ((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.records) || ((_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.list) || [];
				} catch (_unused) {
					allEmployees.value = [];
				}
			});
			return function loadEmployees() {
				return _ref2.apply(this, arguments);
			};
		}();
		const leaderOptions = computed(() => allEmployees.value.filter((e) => e && e.name));
		const onLeaderChange = (name) => {
			const emp = allEmployees.value.find((e) => e.name === name);
			formData.value.phone = (emp === null || emp === void 0 ? void 0 : emp.phone) || "";
			formData.value.email = (emp === null || emp === void 0 ? void 0 : emp.email) || "";
		};
		const handleNodeClick = (data) => {
			if (chartJustDragged) {
				chartJustDragged = false;
				return;
			}
			currentDept.value = data;
		};
		const deptView = ref("chart");
		const flattenDepts = (nodes) => nodes.flatMap((n) => [n, ...flattenDepts(n.children || [])]);
		const deptCountTotal = computed(() => flattenDepts(deptTree.value).length);
		const noLeaderCount = computed(() => flattenDepts(deptTree.value).filter((d) => !d.leader).length);
		/** 总览图上点部门 = 进入该部门的管理页(拖拽后的点击照旧吞掉) */
		const handleChartOpen = (data) => {
			if (chartJustDragged) {
				chartJustDragged = false;
				return;
			}
			currentDept.value = data;
			deptView.value = "manage";
		};
		const router = useRouter();
		const rosterMode = ref("all");
		const groupExpanded = ref({});
		const currentChildren = computed(() => {
			var _currentDept$value4;
			return ((_currentDept$value4 = currentDept.value) === null || _currentDept$value4 === void 0 ? void 0 : _currentDept$value4.children) || [];
		});
		/** 子树(含自身)总人数 */
		const subtreeMemberCount = (dept) => flattenDepts([dept]).reduce((sum, d) => sum + deptMemberCount(d.id), 0);
		/** 当前部门全部下级里未设负责人的个数(不含自身) */
		const descNoLeaderCount = computed(() => {
			var _currentDept$value5;
			return flattenDepts(((_currentDept$value5 = currentDept.value) === null || _currentDept$value5 === void 0 ? void 0 : _currentDept$value5.children) || []).filter((d) => !d.leader).length;
		});
		const collapsedGroupCount = computed(() => currentChildren.value.filter((c) => !groupExpanded.value[c.id]).length);
		const toggleGroup = (id) => {
			groupExpanded.value[id] = !groupExpanded.value[id];
		};
		const expandAllGroups = (open) => {
			const map = {};
			currentChildren.value.forEach((c) => {
				map[c.id] = open;
			});
			groupExpanded.value = map;
		};
		watch(currentDept, (dept) => {
			const map = {};
			((dept === null || dept === void 0 ? void 0 : dept.children) || []).forEach((c, i) => {
				map[c.id] = i < 3;
			});
			groupExpanded.value = map;
			rosterMode.value = "all";
		});
		/** 成员行「调整」= 去员工与账号页(那里是改人的地方) */
		const goEmployeePage = () => router.push("/sys-org/employee");
		const DEPT_CHIP_COLORS = [
			"chip-blue",
			"chip-green",
			"chip-coral",
			"chip-purple",
			"chip-pink"
		];
		const deptColorMap = computed(() => {
			const map = {};
			deptTree.value.forEach((root) => {
				map[root.id] = "chip-gray";
				(root.children || []).forEach((branch, i) => {
					const cls = DEPT_CHIP_COLORS[i % DEPT_CHIP_COLORS.length];
					flattenDepts([branch]).forEach((d) => {
						map[d.id] = cls;
					});
				});
			});
			return map;
		});
		const deptColorClass = (d) => deptColorMap.value[d.id] || "chip-blue";
		const isRootDept = (d) => deptTree.value.some((r) => r.id === d.id);
		/** 底部黄卡:定位到第一个未设负责人的部门 */
		const goFirstNoLeader = () => {
			const target = flattenDepts(deptTree.value).find((d) => !d.leader);
			if (!target) return;
			currentDept.value = target;
			deptView.value = "manage";
			nextTick(() => {
				var _treeRef$value2, _treeRef$value2$setCu;
				return (_treeRef$value2 = treeRef.value) === null || _treeRef$value2 === void 0 || (_treeRef$value2$setCu = _treeRef$value2.setCurrentKey) === null || _treeRef$value2$setCu === void 0 ? void 0 : _treeRef$value2$setCu.call(_treeRef$value2, target.id);
			});
		};
		const chartDragNode = ref(null);
		const chartDragOverId = ref(null);
		const chartGhost = reactive({
			visible: false,
			x: 0,
			y: 0,
			label: ""
		});
		let chartPressNode = null;
		let chartPressX = 0;
		let chartPressY = 0;
		let chartMoved = false;
		let chartJustDragged = false;
		const collectDeptIds = (node) => {
			const ids = [node.id];
			(node.children || []).forEach((c) => ids.push(...collectDeptIds(c)));
			return ids;
		};
		const canDropDept = (targetId) => {
			const d = chartDragNode.value;
			if (!d) return false;
			if (String(d.id) === String(targetId)) return false;
			return !collectDeptIds(d).map(String).includes(String(targetId));
		};
		const onChartCardDown = (node, e) => {
			if (e.button !== 0) return;
			chartPressNode = node;
			chartPressX = e.clientX;
			chartPressY = e.clientY;
			chartMoved = false;
			document.addEventListener("mousemove", onChartCardMove);
			document.addEventListener("mouseup", onChartCardUp);
		};
		const onChartCardMove = (e) => {
			if (!chartPressNode) return;
			if (!chartMoved) {
				if (Math.abs(e.clientX - chartPressX) < 5 && Math.abs(e.clientY - chartPressY) < 5) return;
				chartMoved = true;
				chartDragNode.value = chartPressNode;
				chartGhost.label = chartPressNode.deptName || chartPressNode.label || "部门";
				chartGhost.visible = true;
				document.body.style.userSelect = "none";
				document.body.style.cursor = "grabbing";
			}
			chartGhost.x = e.clientX + 14;
			chartGhost.y = e.clientY + 14;
			const el = document.elementFromPoint(e.clientX, e.clientY);
			const card = el && el.closest ? el.closest("[data-dept-id]") : null;
			const targetId = card ? card.getAttribute("data-dept-id") : null;
			chartDragOverId.value = targetId && canDropDept(targetId) ? Number(targetId) : null;
		};
		const onChartCardUp = function() {
			var _ref3 = _asyncToGenerator(function* () {
				document.removeEventListener("mousemove", onChartCardMove);
				document.removeEventListener("mouseup", onChartCardUp);
				document.body.style.userSelect = "";
				document.body.style.cursor = "";
				const wasDrag = chartMoved;
				const source = chartDragNode.value;
				const targetId = chartDragOverId.value;
				chartPressNode = null;
				chartMoved = false;
				chartDragNode.value = null;
				chartDragOverId.value = null;
				chartGhost.visible = false;
				if (!wasDrag) return;
				chartJustDragged = true;
				if (!source || !targetId) return;
				let targetLabel = "目标部门";
				const tc = document.querySelector(`[data-dept-id="${targetId}"]`);
				if (tc) targetLabel = tc.getAttribute("data-dept-label") || targetLabel;
				try {
					yield deptApi.update({
						id: source.id,
						parentId: targetId
					});
					ElMessage.success(`已把「${source.deptName || source.label}」移到「${targetLabel}」下`);
				} catch (_unused2) {
					ElMessage.error("移动失败,已恢复");
				}
				yield loadTree();
			});
			return function onChartCardUp() {
				return _ref3.apply(this, arguments);
			};
		}();
		const resetForm = () => {
			formData.value = {
				id: void 0,
				parentId: 0,
				deptName: "",
				orderNum: 0,
				leader: "",
				phone: "",
				email: "",
				status: 0
			};
		};
		const handleAddRoot = () => {
			isEdit.value = false;
			dialogTitle.value = t("org.addDept");
			resetForm();
			dialogVisible.value = true;
		};
		const handleAdd = (data) => {
			isEdit.value = false;
			dialogTitle.value = t("org.addDept");
			resetForm();
			formData.value.parentId = data.id;
			dialogVisible.value = true;
		};
		const handleEdit = (data) => {
			isEdit.value = true;
			dialogTitle.value = t("org.editDept");
			formData.value = _objectSpread2({}, data);
			dialogVisible.value = true;
		};
		const handleDelete = (data) => {
			ElMessageBox.confirm(t("org.confirmDeleteDept"), t("common.confirm"), { type: "warning" }).then(_asyncToGenerator(function* () {
				var _currentDept$value6;
				yield deptApi.remove(data.id);
				ElMessage.success(t("common.success"));
				loadTree();
				loadEmployees();
				if (((_currentDept$value6 = currentDept.value) === null || _currentDept$value6 === void 0 ? void 0 : _currentDept$value6.id) === data.id) currentDept.value = null;
			})).catch(() => {});
		};
		const submitForm = function() {
			var _ref4 = _asyncToGenerator(function* () {
				var _formRef$value;
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate().catch(() => false))) return;
				try {
					if (isEdit.value) yield deptApi.update(formData.value);
					else yield deptApi.create(formData.value);
					ElMessage.success(t("common.success"));
					dialogVisible.value = false;
					loadTree();
				} catch (e) {}
			});
			return function submitForm() {
				return _ref4.apply(this, arguments);
			};
		}();
		/** 加人目标部门:默认当前部门;从分组组头点「+ 加人」时是对应下级部门 */
		const memberTargetDept = ref(null);
		const openMemberDialog = function() {
			var _ref5 = _asyncToGenerator(function* (dept) {
				const target = dept || currentDept.value;
				if (!(target === null || target === void 0 ? void 0 : target.id)) {
					ElMessage.warning(t("org.selectDeptTip"));
					return;
				}
				memberTargetDept.value = target;
				if (!allEmployees.value.length) yield loadEmployees();
				memberDialog.value.employeeIds = [];
				memberDialog.value.visible = true;
			});
			return function openMemberDialog(_x) {
				return _ref5.apply(this, arguments);
			};
		}();
		const submitMembers = function() {
			var _ref6 = _asyncToGenerator(function* () {
				var _memberTargetDept$val;
				if (!((_memberTargetDept$val = memberTargetDept.value) === null || _memberTargetDept$val === void 0 ? void 0 : _memberTargetDept$val.id) || !memberDialog.value.employeeIds.length) {
					ElMessage.warning("请选择要添加的员工");
					return;
				}
				memberDialog.value.saving = true;
				try {
					for (const employeeId of memberDialog.value.employeeIds) {
						const detail = yield employeeApi.detail(employeeId);
						yield employeeApi.update(_objectSpread2(_objectSpread2({}, detail.data), {}, { deptId: memberTargetDept.value.id }));
					}
					ElMessage.success(`成员已添加到「${memberTargetDept.value.deptName || "当前部门"}」`);
					memberDialog.value.visible = false;
					yield loadEmployees();
				} catch (_unused3) {
					ElMessage.error("添加成员失败,请稍后再试");
				} finally {
					memberDialog.value.saving = false;
				}
			});
			return function submitMembers() {
				return _ref6.apply(this, arguments);
			};
		}();
		const OrgChartNode = defineComponent({
			name: "OrgChartNode",
			props: {
				node: {
					type: Object,
					required: true
				},
				membersMap: {
					type: Object,
					default: () => ({})
				},
				activeId: {
					type: Number,
					default: void 0
				}
			},
			emits: ["node-click"],
			setup(props, { emit }) {
				const renderMembers = (members) => {
					if (!members.length) return h("div", { class: "chart-member-empty" }, "暂无成员");
					return h("div", { class: "chart-members" }, [...members.slice(0, 4).map((member) => h("span", {
						class: "chart-member-pill",
						title: member.name || member.username
					}, employeeInitial(member))), members.length > 4 ? h("span", { class: "chart-member-more" }, `+${members.length - 4}`) : null]);
				};
				return () => {
					const members = props.membersMap[props.node.id] || [];
					const children = Array.isArray(props.node.children) ? props.node.children : [];
					return h("div", { class: "org-chart-node" }, [h("button", {
						type: "button",
						class: [
							"org-chart-card",
							props.node.id === props.activeId ? "is-active" : "",
							!props.node.leader ? "is-no-leader" : "",
							chartDragOverId.value === props.node.id ? "is-drop-over" : "",
							chartDragNode.value && chartDragNode.value.id === props.node.id ? "is-dragging" : ""
						],
						"data-dept-id": props.node.id,
						"data-dept-label": props.node.deptName || props.node.label,
						onMousedown: (e) => onChartCardDown(props.node, e),
						onClick: () => emit("node-click", props.node)
					}, [
						h("strong", props.node.deptName || props.node.label || "未命名部门"),
						h("span", { class: ["chart-card-meta", !props.node.leader ? "meta-warn" : ""] }, props.node.leader ? `${members.length}人 · ${props.node.leader}` : `${members.length}人 · ⚠ 未设负责人`),
						renderMembers(members)
					]), children.length ? h("div", { class: "org-chart-children" }, children.map((child) => h(OrgChartNode, {
						key: child.id,
						node: child,
						membersMap: props.membersMap,
						activeId: props.activeId,
						"onNode-click": (node) => emit("node-click", node)
					}))) : null]);
				};
			}
		});
		loadTree();
		loadEmployees();
		return (_ctx, _cache) => {
			var _memberTargetDept$val2;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_empty = ElEmpty;
			const _component_el_input = ElInput;
			const _component_el_tree = ElTree;
			const _component_el_tag = ElTag;
			const _component_el_avatar = ElAvatar;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_radio = ElRadio;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_alert = ElAlert;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					_cache[24] || (_cache[24] = createBaseVNode("h3", null, "部门管理", -1)),
					createBaseVNode("span", _hoisted_4, toDisplayString(deptCountTotal.value) + " 个部门 · " + toDisplayString(allEmployees.value.length) + " 人", 1),
					noLeaderCount.value ? (openBlock(), createElementBlock("span", _hoisted_5, "⚠ " + toDisplayString(noLeaderCount.value) + " 个部门未设负责人", 1)) : createCommentVNode("", true)
				]), createBaseVNode("div", _hoisted_6, [createVNode(_component_el_radio_group, {
					modelValue: deptView.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => deptView.value = $event),
					size: "small"
				}, {
					default: withCtx(() => [createVNode(_component_el_radio_button, { value: "chart" }, {
						default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("组织架构", -1)])]),
						_: 1
					}), createVNode(_component_el_radio_button, { value: "manage" }, {
						default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("部门管理", -1)])]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]), createVNode(_component_el_button, {
					type: "primary",
					size: "small",
					onClick: handleAddRoot
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), _cache[27] || (_cache[27] = createTextVNode("新建部门", -1))]),
					_: 1
				})])]),
				deptView.value === "chart" ? (openBlock(), createElementBlock("div", _hoisted_7, [_cache[28] || (_cache[28] = createBaseVNode("div", { class: "chart-overview-tip" }, "点击部门进入管理 · 按住卡片拖到另一部门上 = 调整其上级", -1)), deptTree.value.length ? (openBlock(), createElementBlock("div", _hoisted_8, [(openBlock(true), createElementBlock(Fragment, null, renderList(deptTree.value, (root) => {
					var _currentDept$value7;
					return openBlock(), createBlock(unref(OrgChartNode), {
						key: root.id,
						node: root,
						"members-map": membersByDept.value,
						"active-id": (_currentDept$value7 = currentDept.value) === null || _currentDept$value7 === void 0 ? void 0 : _currentDept$value7.id,
						onNodeClick: handleChartOpen
					}, null, 8, [
						"node",
						"members-map",
						"active-id"
					]);
				}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
					key: 1,
					description: "暂无部门,点右上「新建部门」开始"
				}))])) : (openBlock(), createElementBlock("div", _hoisted_9, [createBaseVNode("div", _hoisted_10, [
					createBaseVNode("div", _hoisted_11, [
						_cache[29] || (_cache[29] = createBaseVNode("span", { class: "tree-head-title" }, "部门", -1)),
						createBaseVNode("span", _hoisted_12, toDisplayString(deptCountTotal.value) + " 个 · " + toDisplayString(allEmployees.value.length) + " 人", 1),
						createVNode(_component_el_button, {
							type: "primary",
							size: "small",
							class: "tree-head-add",
							onClick: handleAddRoot
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(plus_default))]),
								_: 1
							})]),
							_: 1
						})
					]),
					createVNode(_component_el_input, {
						modelValue: treeFilter.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => treeFilter.value = $event),
						placeholder: _ctx.$t("org.searchDept"),
						clearable: "",
						class: "tree-filter"
					}, null, 8, ["modelValue", "placeholder"]),
					createVNode(_component_el_tree, {
						ref_key: "treeRef",
						ref: treeRef,
						data: deptTree.value,
						props: {
							label: "deptName",
							children: "children"
						},
						"node-key": "id",
						"default-expand-all": "",
						"highlight-current": "",
						"filter-node-method": filterNode,
						onNodeClick: handleNodeClick
					}, {
						default: withCtx(({ data }) => [createBaseVNode("span", _hoisted_13, [
							createBaseVNode("span", { class: normalizeClass(["tree-chip", deptColorClass(data)]) }, [isRootDept(data) ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
								default: withCtx(() => [createVNode(unref(office_building_default))]),
								_: 1
							})) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString((data.deptName || "部").slice(0, 1)), 1)], 64))], 2),
							createBaseVNode("span", _hoisted_14, toDisplayString(data.deptName), 1),
							!data.leader ? (openBlock(), createElementBlock("i", _hoisted_15)) : createCommentVNode("", true),
							createBaseVNode("span", _hoisted_16, [
								createVNode(_component_el_icon, {
									class: "action-icon",
									onClick: withModifiers(($event) => handleAdd(data), ["stop"])
								}, {
									default: withCtx(() => [createVNode(unref(plus_default))]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_icon, {
									class: "action-icon",
									onClick: withModifiers(($event) => handleEdit(data), ["stop"])
								}, {
									default: withCtx(() => [createVNode(unref(edit_default))]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_icon, {
									class: "action-icon danger",
									onClick: withModifiers(($event) => handleDelete(data), ["stop"])
								}, {
									default: withCtx(() => [createVNode(unref(delete_default))]),
									_: 1
								}, 8, ["onClick"])
							]),
							createBaseVNode("em", _hoisted_17, toDisplayString(deptMemberCount(data.id)), 1)
						])]),
						_: 1
					}, 8, ["data"]),
					noLeaderCount.value ? (openBlock(), createElementBlock("button", {
						key: 0,
						type: "button",
						class: "tree-warn-card",
						onClick: goFirstNoLeader
					}, [createBaseVNode("span", null, "⚠ " + toDisplayString(noLeaderCount.value) + " 个部门未设负责人", 1), _cache[30] || (_cache[30] = createBaseVNode("b", null, "逐个处理 ›", -1))])) : createCommentVNode("", true)
				]), createBaseVNode("div", _hoisted_18, [currentDept.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					createBaseVNode("div", _hoisted_19, [
						createBaseVNode("span", _hoisted_20, toDisplayString((currentDept.value.deptName || "部").slice(0, 1)), 1),
						createBaseVNode("div", _hoisted_21, [createBaseVNode("div", _hoisted_22, [createBaseVNode("h3", null, toDisplayString(currentDept.value.deptName), 1), createVNode(_component_el_tag, {
							type: currentDept.value.status === 0 ? "success" : "danger",
							size: "small",
							effect: "light",
							round: ""
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(currentDept.value.status === 0 ? _ctx.$t("org.statusNormal") : _ctx.$t("org.statusDisabled")), 1)]),
							_: 1
						}, 8, ["type"])]), createBaseVNode("div", _hoisted_23, [
							currentDept.value.leader ? (openBlock(), createElementBlock("span", _hoisted_24, "负责人 " + toDisplayString(currentDept.value.leader), 1)) : (openBlock(), createElementBlock("span", {
								key: 1,
								class: "dt-pill warn dm-clickable",
								onClick: _cache[2] || (_cache[2] = ($event) => handleEdit(currentDept.value))
							}, "⚠ 未设负责人,点此设置")),
							createBaseVNode("span", _hoisted_25, "直属 " + toDisplayString(currentDeptMembers.value.length) + " 人", 1),
							createBaseVNode("span", _hoisted_26, "含下级 " + toDisplayString(subtreeMemberCount(currentDept.value)) + " 人", 1),
							descNoLeaderCount.value ? (openBlock(), createElementBlock("span", _hoisted_27, "⚠ " + toDisplayString(descNoLeaderCount.value) + " 个下级未设负责人", 1)) : createCommentVNode("", true)
						])]),
						createBaseVNode("div", _hoisted_28, [createVNode(_component_el_button, {
							size: "small",
							onClick: _cache[3] || (_cache[3] = ($event) => handleEdit(currentDept.value))
						}, {
							default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("编辑", -1)])]),
							_: 1
						}), createVNode(_component_el_button, {
							type: "primary",
							size: "small",
							onClick: _cache[4] || (_cache[4] = ($event) => openMemberDialog())
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(user_filled_default))]),
								_: 1
							}), _cache[32] || (_cache[32] = createTextVNode(" 添加成员 ", -1))]),
							_: 1
						})])
					]),
					createBaseVNode("div", _hoisted_29, [
						_cache[33] || (_cache[33] = createBaseVNode("strong", null, "成员花名册", -1)),
						createVNode(_component_el_radio_group, {
							modelValue: rosterMode.value,
							"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => rosterMode.value = $event),
							size: "small"
						}, {
							default: withCtx(() => [createVNode(_component_el_radio_button, { value: "all" }, {
								default: withCtx(() => [createTextVNode("全部 " + toDisplayString(subtreeMemberCount(currentDept.value)), 1)]),
								_: 1
							}), createVNode(_component_el_radio_button, { value: "direct" }, {
								default: withCtx(() => [createTextVNode("仅直属 " + toDisplayString(currentDeptMembers.value.length), 1)]),
								_: 1
							})]),
							_: 1
						}, 8, ["modelValue"]),
						_cache[34] || (_cache[34] = createBaseVNode("small", null, "按部门分组 · 点组头可收起", -1))
					]),
					createBaseVNode("div", _hoisted_30, [
						createBaseVNode("div", _hoisted_31, [
							_cache[35] || (_cache[35] = createBaseVNode("span", { class: "dm-gh-name" }, "本级直属", -1)),
							createBaseVNode("span", _hoisted_32, toDisplayString(currentDeptMembers.value.length) + " 人", 1),
							createBaseVNode("span", _hoisted_33, [createBaseVNode("a", { onClick: _cache[6] || (_cache[6] = ($event) => openMemberDialog()) }, "+ 加人")])
						]),
						currentDeptMembers.value.length ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(currentDeptMembers.value, (member) => {
							return openBlock(), createElementBlock("div", {
								key: member.id,
								class: "dm-mr"
							}, [
								createVNode(_component_el_avatar, {
									size: 30,
									src: member.avatar || ""
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(employeeInitial(member)), 1)]),
									_: 2
								}, 1032, ["src"]),
								createBaseVNode("div", _hoisted_34, [createBaseVNode("strong", null, [createTextVNode(toDisplayString(member.name || member.username || "未命名"), 1), member.name && member.name === currentDept.value.leader ? (openBlock(), createElementBlock("em", _hoisted_35, "★ 负责人")) : createCommentVNode("", true)]), createBaseVNode("span", null, toDisplayString(member.phone || "无手机号"), 1)]),
								createBaseVNode("div", _hoisted_36, [createVNode(_component_el_tag, {
									size: "small",
									effect: "plain",
									type: member.status === 1 ? "success" : "info"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(employeeStatusText(member.status)), 1)]),
									_: 2
								}, 1032, ["type"]), createBaseVNode("a", {
									class: "dm-op",
									onClick: _cache[7] || (_cache[7] = ($event) => goEmployeePage())
								}, "调整")])
							]);
						}), 128)) : (openBlock(), createElementBlock("div", _hoisted_37, "本级暂无直属成员,点上方「+ 加人」调人进来")),
						rosterMode.value === "all" ? (openBlock(true), createElementBlock(Fragment, { key: 2 }, renderList(currentChildren.value, (child) => {
							var _child$children;
							return openBlock(), createElementBlock(Fragment, { key: child.id }, [createBaseVNode("div", {
								class: normalizeClass(["dm-gh dm-gh-child", { warn: !child.leader }]),
								onClick: ($event) => toggleGroup(child.id)
							}, [
								createBaseVNode("span", _hoisted_39, toDisplayString(groupExpanded.value[child.id] ? "▾" : "▸") + " " + toDisplayString(child.deptName), 1),
								createBaseVNode("span", _hoisted_40, [child.leader ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode("负责人 " + toDisplayString(child.leader) + " · " + toDisplayString(deptMemberCount(child.id)) + " 人", 1)], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode("⚠ 未设负责人 · " + toDisplayString(deptMemberCount(child.id)) + " 人", 1)], 64)), ((_child$children = child.children) === null || _child$children === void 0 ? void 0 : _child$children.length) ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [createTextVNode(" · 下级 " + toDisplayString(child.children.length), 1)], 64)) : createCommentVNode("", true)]),
								createBaseVNode("span", {
									class: "dm-gh-ops",
									onClick: _cache[8] || (_cache[8] = withModifiers(() => {}, ["stop"]))
								}, [
									!child.leader ? (openBlock(), createElementBlock("a", {
										key: 0,
										class: "dm-warn-op",
										onClick: ($event) => handleEdit(child)
									}, "设负责人", 8, _hoisted_41)) : createCommentVNode("", true),
									createBaseVNode("a", { onClick: ($event) => openMemberDialog(child) }, "+ 加人", 8, _hoisted_42),
									createBaseVNode("a", { onClick: ($event) => handleNodeClick(child) }, "进入 ›", 8, _hoisted_43)
								])
							], 10, _hoisted_38), groupExpanded.value[child.id] ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [(openBlock(true), createElementBlock(Fragment, null, renderList(membersByDept.value[child.id] || [], (member) => {
								return openBlock(), createElementBlock("div", {
									key: member.id,
									class: "dm-mr"
								}, [
									createVNode(_component_el_avatar, {
										size: 30,
										src: member.avatar || ""
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(employeeInitial(member)), 1)]),
										_: 2
									}, 1032, ["src"]),
									createBaseVNode("div", _hoisted_44, [createBaseVNode("strong", null, [createTextVNode(toDisplayString(member.name || member.username || "未命名"), 1), member.name && member.name === child.leader ? (openBlock(), createElementBlock("em", _hoisted_45, "★ 负责人")) : createCommentVNode("", true)]), createBaseVNode("span", null, toDisplayString(member.phone || "无手机号"), 1)]),
									createBaseVNode("div", _hoisted_46, [createVNode(_component_el_tag, {
										size: "small",
										effect: "plain",
										type: member.status === 1 ? "success" : "info"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(employeeStatusText(member.status)), 1)]),
										_: 2
									}, 1032, ["type"]), createBaseVNode("a", {
										class: "dm-op",
										onClick: _cache[9] || (_cache[9] = ($event) => goEmployeePage())
									}, "调整")])
								]);
							}), 128)), !(membersByDept.value[child.id] || []).length ? (openBlock(), createElementBlock("div", _hoisted_47, "该部门暂无直属成员")) : createCommentVNode("", true)], 64)) : createCommentVNode("", true)], 64);
						}), 128)) : createCommentVNode("", true),
						rosterMode.value === "all" && currentChildren.value.length ? (openBlock(), createElementBlock("div", _hoisted_48, [collapsedGroupCount.value ? (openBlock(), createElementBlock("span", _hoisted_49, [createTextVNode("已收起 " + toDisplayString(collapsedGroupCount.value) + " 个部门 · ", 1), createBaseVNode("a", { onClick: _cache[10] || (_cache[10] = ($event) => expandAllGroups(true)) }, "全部展开")])) : (openBlock(), createElementBlock("span", _hoisted_50, [createBaseVNode("a", { onClick: _cache[11] || (_cache[11] = ($event) => expandAllGroups(false)) }, "全部收起")])), _cache[36] || (_cache[36] = createBaseVNode("span", { class: "dm-foot-hint" }, "在「组织架构」视图拖动卡片可调整部门上级", -1))])) : createCommentVNode("", true)
					])
				], 64)) : (openBlock(), createBlock(_component_el_empty, {
					key: 1,
					description: _ctx.$t("org.selectDeptTip")
				}, null, 8, ["description"]))])])),
				createVNode(_component_el_dialog, {
					modelValue: dialogVisible.value,
					"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => dialogVisible.value = $event),
					title: dialogTitle.value,
					width: "500px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[19] || (_cache[19] = ($event) => dialogVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitForm
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.confirm")), 1)]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: formData.value,
						rules,
						"label-width": "100px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: _ctx.$t("org.parentDept"),
								prop: "parentId"
							}, {
								default: withCtx(() => [createVNode(_component_el_tree_select, {
									modelValue: formData.value.parentId,
									"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => formData.value.parentId = $event),
									data: deptTree.value,
									props: {
										label: "deptName",
										value: "id",
										children: "children"
									},
									placeholder: _ctx.$t("org.selectParentDept"),
									"check-strictly": "",
									clearable: "",
									style: { "width": "100%" }
								}, null, 8, [
									"modelValue",
									"data",
									"placeholder"
								])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("org.deptName"),
								prop: "deptName"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: formData.value.deptName,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => formData.value.deptName = $event),
									placeholder: _ctx.$t("org.inputDeptName")
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("org.sort"),
								prop: "orderNum"
							}, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: formData.value.orderNum,
									"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => formData.value.orderNum = $event),
									min: 0,
									"controls-position": "right"
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.leader") }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: formData.value.leader,
									"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => formData.value.leader = $event),
									filterable: "",
									clearable: "",
									placeholder: _ctx.$t("org.inputLeader"),
									style: { "width": "100%" },
									onChange: onLeaderChange
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(leaderOptions.value, (emp) => {
										return openBlock(), createBlock(_component_el_option, {
											key: emp.id,
											label: emp.name,
											value: emp.name
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.phone") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: formData.value.phone,
									"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => formData.value.phone = $event),
									readonly: "",
									placeholder: "选择负责人后自动带出"
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.email") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: formData.value.email,
									"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => formData.value.email = $event),
									readonly: "",
									placeholder: "选择负责人后自动带出"
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.status") }, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: formData.value.status,
									"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => formData.value.status = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio, { value: 0 }, {
										default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("org.statusNormal")), 1)]),
										_: 1
									}), createVNode(_component_el_radio, { value: 1 }, {
										default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("org.statusDisabled")), 1)]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"])
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: memberDialog.value.visible,
					"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => memberDialog.value.visible = $event),
					title: `添加成员到「${((_memberTargetDept$val2 = memberTargetDept.value) === null || _memberTargetDept$val2 === void 0 ? void 0 : _memberTargetDept$val2.deptName) || "当前部门"}」`,
					width: "680px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[22] || (_cache[22] = ($event) => memberDialog.value.visible = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: memberDialog.value.saving,
						onClick: submitMembers
					}, {
						default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [
						currentDept.value ? (openBlock(), createBlock(_component_el_alert, {
							key: 0,
							title: `将所选员工归入「${currentDept.value.deptName}」,保存后员工档案中的所属部门会同步更新。`,
							type: "info",
							"show-icon": "",
							closable: false,
							class: "member-alert"
						}, null, 8, ["title"])) : createCommentVNode("", true),
						createVNode(_component_el_select, {
							modelValue: memberDialog.value.employeeIds,
							"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => memberDialog.value.employeeIds = $event),
							multiple: "",
							filterable: "",
							clearable: "",
							"collapse-tags": "",
							"collapse-tags-tooltip": "",
							placeholder: "请选择要加入当前部门的员工",
							style: { "width": "100%" }
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(availableEmployees.value, (employee) => {
								return openBlock(), createBlock(_component_el_option, {
									key: employee.id,
									label: employeeOptionLabel(employee),
									value: employee.id
								}, null, 8, ["label", "value"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue"]),
						_cache[38] || (_cache[38] = createBaseVNode("div", { class: "member-dialog-tip" }, " 已在当前部门的员工不会重复显示；如员工原来在其他部门,确认后会移动到当前部门。 ", -1))
					]),
					_: 1
				}, 8, ["modelValue", "title"]),
				chartGhost.visible ? (openBlock(), createElementBlock("div", {
					key: 2,
					class: "chart-drag-ghost",
					style: normalizeStyle({
						left: chartGhost.x + "px",
						top: chartGhost.y + "px"
					})
				}, toDisplayString(chartGhost.label), 5)) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-6745860f"]]);
//#endregion
export { dept_default as default };
