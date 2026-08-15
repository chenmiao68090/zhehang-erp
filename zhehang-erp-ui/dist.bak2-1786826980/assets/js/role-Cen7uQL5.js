import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { C as ElResult, Dr as withModifiers, Er as withKeys, F as ElEmpty, I as ElDropdown, K as ElCollapse, L as ElDropdownItem, Nt as check_default, R as ElDropdownMenu, Un as search_default, V as ElDialog, Vn as refresh_left_default, _t as ElFormItem, a as ElMessageBox, fn as info_filled_default, fr as user_default, gr as view_default, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, pt as ElScrollbar, q as ElCollapseItem, rt as ElSelect, s as vLoading, tt as ElCard, v as ElSwitch, vt as ElAlert, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { _ as MODULE_GROUP, b as constantRoutes, g as LEGACY_VISIBLE_GROUP_BY_ROUTE, h as ALWAYS_VISIBLE_GROUPS, l as useUserStore, v as NAV_GROUPS, y as asyncRoutes } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { i as roleApi, n as menuApi } from "./system-CuP08T_i.js";
//#region src/router/visible-module-config.ts
/**
* 将角色记录中的大类名、旧大类名或精确子路由还原为角色设置页的勾选集合。
* null/空串沿用既有语义：不限制，即全选。
*/
function parseVisibleModuleSubs(value, allSubPaths, configurableGroups, groupSubs, legacyGroupSubs) {
	const raw = String(value || "").trim();
	const checked = /* @__PURE__ */ new Set();
	if (!raw) {
		allSubPaths.forEach((path) => checked.add(path));
		return checked;
	}
	const itemSet = new Set(raw.split(",").map((item) => item.trim()).filter(Boolean));
	for (const [legacyGroup, subs] of Object.entries(legacyGroupSubs)) if (itemSet.has(legacyGroup)) subs.forEach((sub) => checked.add(sub.path));
	for (const group of configurableGroups) {
		const subs = groupSubs[group.name] || [];
		if (itemSet.has(group.name)) subs.forEach((sub) => checked.add(sub.path));
		else subs.forEach((sub) => {
			if (itemSet.has(sub.path)) checked.add(sub.path);
		});
	}
	return checked;
}
/**
* 将角色设置页的勾选集合归一化为后端 visible_modules：
* 全部大类全开保存 null；单个大类全开保存当前大类名；部分开启保存精确子路由。
*/
function serializeVisibleModuleSubs(checked, allSubPaths, configurableGroups, groupSubs) {
	if (checked.size === allSubPaths.length && allSubPaths.every((path) => checked.has(path))) return null;
	const parts = [];
	for (const group of configurableGroups) {
		const subs = groupSubs[group.name] || [];
		const selected = subs.filter((sub) => checked.has(sub.path));
		if (subs.length > 0 && selected.length === subs.length) parts.push(group.name);
		else selected.forEach((sub) => parts.push(sub.path));
	}
	return parts.join(",");
}
//#endregion
//#region src/views/system/role-permission.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "rp-page" };
var _hoisted_2 = { class: "rp-role-list" };
var _hoisted_3 = [
	"draggable",
	"onClick",
	"onDragstart",
	"onDragover"
];
var _hoisted_4 = { class: "rp-role-name" };
var _hoisted_5 = { class: "rp-main-head" };
var _hoisted_6 = { class: "rp-main-title" };
var _hoisted_7 = {
	key: 0,
	class: "rp-actions"
};
var _hoisted_8 = { class: "rp-summary" };
var _hoisted_9 = {
	key: 0,
	class: "rp-members-summary"
};
var _hoisted_10 = { class: "rp-members-summary-main" };
var _hoisted_11 = {
	key: 0,
	class: "rp-members-avatars",
	"aria-label": "角色成员头像"
};
var _hoisted_12 = ["title"];
var _hoisted_13 = {
	key: 0,
	class: "rp-members-avatar rp-members-avatar-more"
};
var _hoisted_14 = {
	key: 1,
	class: "rp-members-empty-avatar"
};
var _hoisted_15 = { class: "rp-members-count" };
var _hoisted_16 = { class: "rp-members-summary-note" };
var _hoisted_17 = {
	key: 3,
	class: "rp-body"
};
var _hoisted_18 = { class: "rp-scope" };
var _hoisted_19 = ["onClick"];
var _hoisted_20 = { class: "rp-radio" };
var _hoisted_21 = {
	key: 0,
	class: "rp-radio-dot"
};
var _hoisted_22 = { class: "rp-scope-text" };
var _hoisted_23 = { class: "rp-scope-title" };
var _hoisted_24 = { class: "rp-scope-sub" };
var _hoisted_25 = { class: "rp-mod2" };
var _hoisted_26 = { class: "rp-cats" };
var _hoisted_27 = ["onClick"];
var _hoisted_28 = { class: "rp-cat-name" };
var _hoisted_29 = { class: "rp-subs" };
var _hoisted_30 = { class: "rp-subs-head" };
var _hoisted_31 = { class: "rp-subs-title" };
var _hoisted_32 = { class: "rp-sub-list" };
var _hoisted_33 = { class: "rp-sub-name" };
var _hoisted_34 = { class: "rp-operation-box" };
var _hoisted_35 = { class: "rp-operation-title" };
var _hoisted_36 = { class: "rp-operation-grid" };
var _hoisted_37 = { class: "rp-operation-text" };
var _hoisted_38 = { class: "rp-tip" };
var _hoisted_39 = { class: "rpm-drawer-head" };
var _hoisted_40 = { class: "rpm-drawer-sub" };
var _hoisted_41 = { class: "mm-wrap" };
var _hoisted_42 = { class: "mm-notice" };
var _hoisted_43 = { class: "mm-block" };
var _hoisted_44 = { class: "mm-add-row" };
var _hoisted_45 = { class: "mm-block mm-current" };
var _hoisted_46 = { class: "mm-label" };
var _hoisted_47 = {
	key: 1,
	class: "mm-list"
};
var _hoisted_48 = { class: "mm-avatar" };
var _hoisted_49 = { class: "mm-info" };
var _hoisted_50 = { class: "mm-name" };
var _hoisted_51 = { class: "mm-sub" };
var _hoisted_52 = { class: "rpp-summary" };
var _hoisted_53 = { class: "rpp-summary-item" };
var _hoisted_54 = { class: "rpp-summary-item" };
var _hoisted_55 = { key: 0 };
var _hoisted_56 = { key: 1 };
var _hoisted_57 = { class: "rpp-summary-item" };
var _hoisted_58 = { key: 0 };
var _hoisted_59 = { key: 1 };
var _hoisted_60 = { key: 2 };
var _hoisted_61 = { class: "rpp-nav" };
var _hoisted_62 = { class: "rpp-group-head" };
var _hoisted_63 = { key: 1 };
var _hoisted_64 = { class: "rpp-group-name" };
var _hoisted_65 = { class: "rpp-group-head" };
var _hoisted_66 = { class: "rpp-group-name" };
var _hoisted_67 = { class: "rpp-group-count" };
var _hoisted_68 = { class: "rpp-pages" };
var _hoisted_69 = { class: "rpp-foot" };
var _hoisted_70 = {
	key: 0,
	class: "rp-create-note"
};
//#endregion
//#region src/views/system/role-permission.vue
var role_permission_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "role-permission",
	setup(__props) {
		var _configurableGroups$;
		const READONLY_ROLE_KEYS = ["super_admin"];
		const PALETTE = [
			"#534AB7",
			"#185FA5",
			"#0F6E56",
			"#D85A30",
			"#BA7517",
			"#A32D2D",
			"#5F5E5A",
			"#993556"
		];
		const userStore = useUserStore();
		const scopeOptions = [
			{
				value: 1,
				title: "全部数据",
				sub: "看到公司所有数据"
			},
			{
				value: 4,
				title: "本部门及以下",
				sub: "只看本部门（含下级部门）的数据"
			},
			{
				value: 5,
				title: "仅本人数据",
				sub: "只看自己经手的数据"
			}
		];
		const groupSubs = {};
		const legacyGroupSubs = {};
		for (const route of [...constantRoutes, ...asyncRoutes]) {
			var _route$meta;
			if ((_route$meta = route.meta) === null || _route$meta === void 0 ? void 0 : _route$meta.hidden) continue;
			if (route.redirect && !(route.children && route.children.length)) continue;
			const group = MODULE_GROUP[route.path];
			if (!group || ALWAYS_VISIBLE_GROUPS.has(group)) continue;
			if (!groupSubs[group]) groupSubs[group] = [];
			const kids = (route.children || []).filter((c) => {
				var _c$meta, _c$meta2;
				return !((_c$meta = c.meta) === null || _c$meta === void 0 ? void 0 : _c$meta.hidden) && ((_c$meta2 = c.meta) === null || _c$meta2 === void 0 ? void 0 : _c$meta2.title);
			});
			if (kids.length) for (const c of kids) {
				const item = {
					path: String(c.path).startsWith("/") ? c.path : (route.path + "/" + c.path).replace(/\/+/g, "/"),
					title: c.meta.title
				};
				groupSubs[group].push(item);
				const legacyValue = LEGACY_VISIBLE_GROUP_BY_ROUTE[route.path];
				(Array.isArray(legacyValue) ? legacyValue : legacyValue ? [legacyValue] : []).forEach((legacyGroup) => {
					if (!legacyGroupSubs[legacyGroup]) legacyGroupSubs[legacyGroup] = [];
					legacyGroupSubs[legacyGroup].push(item);
				});
			}
			else {
				var _route$meta2;
				const item = {
					path: route.path,
					title: ((_route$meta2 = route.meta) === null || _route$meta2 === void 0 ? void 0 : _route$meta2.title) || group
				};
				groupSubs[group].push(item);
				const legacyValue = LEGACY_VISIBLE_GROUP_BY_ROUTE[route.path];
				(Array.isArray(legacyValue) ? legacyValue : legacyValue ? [legacyValue] : []).forEach((legacyGroup) => {
					if (!legacyGroupSubs[legacyGroup]) legacyGroupSubs[legacyGroup] = [];
					legacyGroupSubs[legacyGroup].push(item);
				});
			}
		}
		const configurableGroups = NAV_GROUPS.filter((g) => !ALWAYS_VISIBLE_GROUPS.has(g.name) && (groupSubs[g.name] || []).length > 0);
		const ALL_SUB_PATHS = [...new Set(configurableGroups.flatMap((g) => (groupSubs[g.name] || []).map((s) => s.path)))];
		const roleLoading = ref(false);
		const saving = ref(false);
		const roles = ref([]);
		const keyword = ref("");
		const currentRole = ref(null);
		const dataScope = ref(5);
		const currentGroup = ref(((_configurableGroups$ = configurableGroups[0]) === null || _configurableGroups$ === void 0 ? void 0 : _configurableGroups$.name) || "");
		const checkedSubs = ref(/* @__PURE__ */ new Set());
		let savedScope = 5;
		let savedSubs = /* @__PURE__ */ new Set();
		const operationLoading = ref(false);
		const permissionLoadError = ref("");
		const permissionLoadedRoleId = ref(null);
		const menuCatalog = ref([]);
		const checkedPermissionIds = ref(/* @__PURE__ */ new Set());
		let savedAssignedMenuIds = [];
		let permissionSelectionVersion = 0;
		const PERMISSION_GROUP_LABELS = {
			system: "系统与组织",
			org: "员工与组织",
			crm: "销售与客户",
			sales: "销售业务",
			finance: "财务与收款",
			hrm: "人事行政",
			workflow: "审批流程",
			supply: "渠道与供应链",
			report: "报表",
			log: "日志审计",
			file: "文件知识库",
			message: "内部沟通",
			dashboard: "工作台",
			profile: "个人中心",
			project: "项目任务",
			monitor: "系统监控",
			tool: "系统工具"
		};
		const operationItems = computed(() => menuCatalog.value.filter((item) => item.status === 0 && !!item.perms).sort((a, b) => a.perms.localeCompare(b.perms) || a.id - b.id));
		const operationGroups = computed(() => {
			const groups = /* @__PURE__ */ new Map();
			operationItems.value.forEach((item) => {
				const key = item.perms.split(":")[0] || "other";
				if (!groups.has(key)) groups.set(key, {
					key,
					label: PERMISSION_GROUP_LABELS[key] || key,
					items: []
				});
				groups.get(key).items.push(item);
			});
			return [...groups.values()];
		});
		const selectedOperationCount = computed(() => operationItems.value.filter((item) => checkedPermissionIds.value.has(item.id)).length);
		const readonly = computed(() => isReadonlyRole(currentRole.value));
		const operationReady = computed(() => readonly.value || !!currentRole.value && permissionLoadedRoleId.value === Number(currentRole.value.id) && !permissionLoadError.value);
		function isReadonlyRole(r) {
			return !!r && READONLY_ROLE_KEYS.includes(r.roleKey);
		}
		function roleColor(i) {
			return PALETTE[i % PALETTE.length];
		}
		function hasLimit(r) {
			return !!r && !isReadonlyRole(r) && !!(r.visibleModules && String(r.visibleModules).trim());
		}
		const allOn = computed(() => checkedSubs.value.size === ALL_SUB_PATHS.length);
		const previewVisible = ref(false);
		const baselineGroups = NAV_GROUPS.filter((g) => ALWAYS_VISIBLE_GROUPS.has(g.name));
		const previewScopeText = computed(() => {
			var _scopeOptions$find;
			return ((_scopeOptions$find = scopeOptions.find((o) => o.value === dataScope.value)) === null || _scopeOptions$find === void 0 ? void 0 : _scopeOptions$find.title) || "仅本人数据";
		});
		const previewGroups = computed(() => configurableGroups.map((g) => {
			const subs = groupSubs[g.name] || [];
			const shown = readonly.value ? subs : subs.filter((s) => checkedSubs.value.has(s.path));
			return {
				name: g.name,
				color: g.color,
				icon: g.icon,
				subs: shown
			};
		}).filter((g) => g.subs.length > 0));
		const previewPageCount = computed(() => readonly.value ? ALL_SUB_PATHS.length : checkedSubs.value.size);
		const filteredRoles = computed(() => {
			const kw = keyword.value.trim().toLowerCase();
			if (!kw) return roles.value;
			return roles.value.filter((r) => (r.roleName || "").toLowerCase().includes(kw) || (r.roleKey || "").toLowerCase().includes(kw));
		});
		function groupOnCount(g) {
			return (groupSubs[g] || []).filter((s) => checkedSubs.value.has(s.path)).length;
		}
		function isGroupAllOn(g) {
			const subs = groupSubs[g] || [];
			return subs.length > 0 && subs.every((s) => checkedSubs.value.has(s.path));
		}
		/** 大类状态样式：全开=on / 部分=part / 全关=off */
		function groupState(g) {
			const total = (groupSubs[g] || []).length;
			const on = groupOnCount(g);
			if (on === 0) return "off";
			if (on === total) return "on";
			return "part";
		}
		function toggleSub(path, on) {
			const s = new Set(checkedSubs.value);
			if (on) s.add(path);
			else s.delete(path);
			checkedSubs.value = s;
		}
		function toggleGroupAll(g, on) {
			const s = new Set(checkedSubs.value);
			(groupSubs[g] || []).forEach((x) => {
				if (on) s.add(x.path);
				else s.delete(x.path);
			});
			checkedSubs.value = s;
		}
		/** 解析 role.visibleModules（逗号串）→ 选中的小类路径集合。空=不限制=全选；大类名=该大类全部小类 */
		function parseSubs(vm) {
			return parseVisibleModuleSubs(vm, ALL_SUB_PATHS, configurableGroups, groupSubs, legacyGroupSubs);
		}
		onMounted(() => {
			loadRoles();
			loadTemplates();
		});
		/** 统一按 roleSort 升序(相同按id)排,保证拖拽保存后的顺序刷新不乱 */
		function sortRoles(list) {
			return [...list].sort((a, b) => (Number(a.roleSort) || 0) - (Number(b.roleSort) || 0) || Number(a.id) - Number(b.id));
		}
		function loadRoles() {
			return _loadRoles.apply(this, arguments);
		}
		function _loadRoles() {
			_loadRoles = _asyncToGenerator(function* () {
				roleLoading.value = true;
				try {
					var _res$data, _res$data2;
					const res = yield roleApi.list({
						pageNum: 1,
						pageSize: 200
					});
					roles.value = sortRoles(((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.records) || ((_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.list) || res.data || []);
					const first = roles.value.find((r) => !isReadonlyRole(r)) || roles.value[0];
					if (first) selectRole(first);
				} finally {
					roleLoading.value = false;
				}
			});
			return _loadRoles.apply(this, arguments);
		}
		const roleDragReady = ref(false);
		const roleDragIndex = ref(null);
		function onRoleDragStart(i, e) {
			var _e$dataTransfer;
			if (keyword.value) return;
			roleDragIndex.value = i;
			(_e$dataTransfer = e.dataTransfer) === null || _e$dataTransfer === void 0 || _e$dataTransfer.setData("text/plain", "");
			if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
		}
		function onRoleDragOver(i) {
			if (keyword.value || roleDragIndex.value === null || roleDragIndex.value === i) return;
			const list = [...roles.value];
			const [moved] = list.splice(roleDragIndex.value, 1);
			list.splice(i, 0, moved);
			roles.value = list;
			roleDragIndex.value = i;
		}
		function onRoleDragEnd() {
			return _onRoleDragEnd.apply(this, arguments);
		}
		function _onRoleDragEnd() {
			_onRoleDragEnd = _asyncToGenerator(function* () {
				roleDragReady.value = false;
				if (roleDragIndex.value === null) return;
				roleDragIndex.value = null;
				const updates = [];
				roles.value.forEach((r, idx) => {
					const want = (idx + 1) * 10;
					if (Number(r.roleSort) !== want) {
						r.roleSort = want;
						updates.push({
							id: Number(r.id),
							roleName: r.roleName,
							roleKey: r.roleKey,
							roleSort: want
						});
					}
				});
				if (!updates.length) return;
				try {
					for (const u of updates) yield roleApi.update(u);
					ElMessage.success("角色顺序已保存");
				} catch (_unused) {
					ElMessage.error("顺序保存失败,请刷新后重试");
				}
			});
			return _onRoleDragEnd.apply(this, arguments);
		}
		function selectRole(_x) {
			return _selectRole.apply(this, arguments);
		}
		function _selectRole() {
			_selectRole = _asyncToGenerator(function* (role) {
				var _role$dataScope;
				memberDrawerVisible.value = false;
				currentRole.value = role;
				dataScope.value = Number((_role$dataScope = role.dataScope) !== null && _role$dataScope !== void 0 ? _role$dataScope : 5);
				savedScope = dataScope.value;
				checkedSubs.value = parseSubs(role.visibleModules);
				savedSubs = new Set(checkedSubs.value);
				if (!configurableGroups.some((g) => g.name === currentGroup.value)) {
					var _configurableGroups$2;
					currentGroup.value = ((_configurableGroups$2 = configurableGroups[0]) === null || _configurableGroups$2 === void 0 ? void 0 : _configurableGroups$2.name) || "";
				}
				selectedToAdd.value = [];
				loadMembers();
				searchCandidates("");
				yield loadOperationPermissions(role);
			});
			return _selectRole.apply(this, arguments);
		}
		function togglePermission(menuId, enabled) {
			const next = new Set(checkedPermissionIds.value);
			if (enabled) next.add(menuId);
			else next.delete(menuId);
			checkedPermissionIds.value = next;
		}
		function loadOperationPermissions(_x2) {
			return _loadOperationPermissions.apply(this, arguments);
		}
		function _loadOperationPermissions() {
			_loadOperationPermissions = _asyncToGenerator(function* (role) {
				const roleId = Number(role === null || role === void 0 ? void 0 : role.id);
				const version = ++permissionSelectionVersion;
				permissionLoadError.value = "";
				permissionLoadedRoleId.value = null;
				menuCatalog.value = [];
				checkedPermissionIds.value = /* @__PURE__ */ new Set();
				savedAssignedMenuIds = [];
				if (isReadonlyRole(role)) {
					operationLoading.value = false;
					permissionLoadedRoleId.value = roleId;
					return;
				}
				operationLoading.value = true;
				try {
					var _currentRole$value, _detailRes$data, _detailRes$data2;
					const [detailRes, menuRes] = yield Promise.all([roleApi.detail(roleId), menuApi.list({})]);
					if (version !== permissionSelectionVersion || Number((_currentRole$value = currentRole.value) === null || _currentRole$value === void 0 ? void 0 : _currentRole$value.id) !== roleId) return;
					if (Number((_detailRes$data = detailRes.data) === null || _detailRes$data === void 0 ? void 0 : _detailRes$data.id) !== roleId || !Array.isArray((_detailRes$data2 = detailRes.data) === null || _detailRes$data2 === void 0 ? void 0 : _detailRes$data2.menuIds) || !Array.isArray(menuRes.data)) throw new Error("权限数据不完整");
					const catalog = menuRes.data.map((item) => {
						var _item$status;
						return {
							id: Number(item.id),
							parentId: Number(item.parentId || 0),
							menuName: String(item.menuName || item.perms || item.id),
							perms: String(item.perms || "").trim(),
							status: Number((_item$status = item.status) !== null && _item$status !== void 0 ? _item$status : 0)
						};
					});
					if (catalog.some((item) => !Number.isSafeInteger(item.id) || item.id <= 0)) throw new Error("权限节点格式错误");
					const assigned = [...new Set(detailRes.data.menuIds.map(Number))];
					if (assigned.some((id) => !Number.isSafeInteger(id) || id <= 0)) throw new Error("角色权限ID格式错误");
					menuCatalog.value = catalog;
					savedAssignedMenuIds = assigned;
					checkedPermissionIds.value = new Set(assigned);
					permissionLoadedRoleId.value = roleId;
				} catch (_e) {
					var _currentRole$value2;
					if (version !== permissionSelectionVersion || Number((_currentRole$value2 = currentRole.value) === null || _currentRole$value2 === void 0 ? void 0 : _currentRole$value2.id) !== roleId) return;
					permissionLoadError.value = "按钮/API 权限未完整加载，已禁止保存，请刷新后重试";
				} finally {
					if (version === permissionSelectionVersion) operationLoading.value = false;
				}
			});
			return _loadOperationPermissions.apply(this, arguments);
		}
		function resetOperationPermissions() {
			checkedPermissionIds.value = new Set(savedAssignedMenuIds);
		}
		function buildMenuIdsForSave() {
			const editableIds = new Set(operationItems.value.map((item) => item.id));
			const result = new Set(savedAssignedMenuIds.filter((id) => !editableIds.has(id)));
			const byId = new Map(menuCatalog.value.map((item) => [item.id, item]));
			const addWithAncestors = (id) => {
				let current = byId.get(id);
				let guard = 0;
				result.add(id);
				while (current && current.parentId > 0 && guard++ < 20) {
					result.add(current.parentId);
					current = byId.get(current.parentId);
				}
			};
			operationItems.value.forEach((item) => {
				if (checkedPermissionIds.value.has(item.id)) addWithAncestors(item.id);
			});
			return [...result].sort((a, b) => a - b);
		}
		function reset() {
			checkedSubs.value = new Set(savedSubs);
			dataScope.value = savedScope;
			resetOperationPermissions();
			ElMessage.success("已重置为上次保存的状态");
		}
		const { t } = useI18n();
		function isProtectedRole(roleKey) {
			return READONLY_ROLE_KEYS.includes(String(roleKey || "").trim().toLowerCase());
		}
		function isPrivilegedRoleFamily(roleKey) {
			const normalized = String(roleKey || "").trim().toLowerCase();
			const separator = normalized.indexOf("__");
			const baseKey = separator > 0 ? normalized.slice(0, separator) : normalized;
			return READONLY_ROLE_KEYS.includes(baseKey);
		}
		const templateOptions = ref([]);
		function loadTemplates() {
			return _loadTemplates.apply(this, arguments);
		}
		function _loadTemplates() {
			_loadTemplates = _asyncToGenerator(function* () {
				try {
					var _res$data3, _res$data4;
					const res = yield roleApi.list({
						pageNum: 1,
						pageSize: 100,
						status: 0
					});
					const records = ((_res$data3 = res.data) === null || _res$data3 === void 0 ? void 0 : _res$data3.records) || ((_res$data4 = res.data) === null || _res$data4 === void 0 ? void 0 : _res$data4.list) || [];
					templateOptions.value = Array.isArray(records) ? records.filter((role) => !isPrivilegedRoleFamily(role === null || role === void 0 ? void 0 : role.roleKey)) : [];
				} catch (_e) {
					templateOptions.value = [];
				}
			});
			return _loadTemplates.apply(this, arguments);
		}
		/** 无模板新建的底层基底:优先「普通员工」,保证新角色登录后基础可用(用户不感知模板概念) */
		function findBaseRole() {
			const list = templateOptions.value;
			return list.find((r) => String(r.roleKey || "").split("__")[0] === "staff") || list.find((r) => r.roleName === "普通员工") || list[0];
		}
		const roleFormVisible = ref(false);
		const roleFormTitle = ref("");
		const roleFormRef = ref();
		const roleSubmitLoading = ref(false);
		const roleForm = reactive({
			id: void 0,
			roleName: "",
			roleKey: "",
			roleSort: 0,
			status: 0,
			dataScope: 1,
			remark: "",
			templateKey: ""
		});
		const roleRules = reactive({ roleName: [{
			required: true,
			message: () => t("system.role.roleNameRequired"),
			trigger: "blur"
		}] });
		function resetRoleForm() {
			roleForm.id = void 0;
			roleForm.roleName = "";
			roleForm.roleKey = "";
			roleForm.roleSort = 0;
			roleForm.status = 0;
			roleForm.dataScope = 1;
			roleForm.remark = "";
			roleForm.templateKey = "";
			delete roleForm.menuIds;
		}
		function openRoleForm(role) {
			resetRoleForm();
			if (role === null || role === void 0 ? void 0 : role.id) {
				roleFormTitle.value = "修改角色名称";
				roleForm.id = role.id;
				roleForm.roleName = role.roleName || "";
				roleForm.roleKey = role.roleKey || "";
			} else roleFormTitle.value = "新建角色";
			roleFormVisible.value = true;
		}
		function submitRoleForm() {
			return _submitRoleForm.apply(this, arguments);
		}
		function _submitRoleForm() {
			_submitRoleForm = _asyncToGenerator(function* () {
				if (!roleFormRef.value) return;
				yield roleFormRef.value.validate();
				roleSubmitLoading.value = true;
				try {
					if (roleForm.id) {
						yield roleApi.update({
							id: roleForm.id,
							roleName: roleForm.roleName,
							roleKey: roleForm.roleKey
						});
						ElMessage.success(t("common.success"));
						roleFormVisible.value = false;
						yield reloadRolesKeep(roleForm.id);
					} else {
						var _detailRes$data3, _detailRes$data4;
						const base = findBaseRole();
						if (!(base === null || base === void 0 ? void 0 : base.id)) {
							ElMessage.error("未找到「普通员工」基础角色,无法创建,请联系管理员");
							return;
						}
						const detailRes = yield roleApi.detail(Number(base.id));
						const sourceMenuIds = (_detailRes$data3 = detailRes.data) === null || _detailRes$data3 === void 0 ? void 0 : _detailRes$data3.menuIds;
						if (Number((_detailRes$data4 = detailRes.data) === null || _detailRes$data4 === void 0 ? void 0 : _detailRes$data4.id) !== Number(base.id) || !Array.isArray(sourceMenuIds)) {
							ElMessage.error("基础角色权限数据未完整加载,已取消创建");
							return;
						}
						const normalizedMenuIds = sourceMenuIds.map(Number);
						if (normalizedMenuIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
							ElMessage.error("基础角色权限数据异常,已取消创建");
							return;
						}
						const baseKey = String(base.roleKey || "staff").split("__")[0];
						const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
						const createdName = roleForm.roleName;
						yield roleApi.create({
							roleName: createdName,
							roleKey: `${baseKey}__${suffix}`,
							roleSort: 0,
							status: 0,
							dataScope: 5,
							remark: "",
							menuIds: [...new Set(normalizedMenuIds)]
						});
						ElMessage.success("已创建,请在右侧配置数据范围和可见模块");
						roleFormVisible.value = false;
						yield reloadRolesKeep(void 0);
						const match = [...roles.value].reverse().find((r) => r.roleName === createdName);
						if (match) selectRole(match);
					}
					loadTemplates();
				} finally {
					roleSubmitLoading.value = false;
				}
			});
			return _submitRoleForm.apply(this, arguments);
		}
		function confirmDeleteRole(role) {
			ElMessageBox.confirm(t("system.role.deleteConfirm"), t("common.warning"), {
				confirmButtonText: t("common.confirm"),
				cancelButtonText: t("common.cancel"),
				type: "warning"
			}).then(_asyncToGenerator(function* () {
				var _currentRole$value3, _currentRole$value4;
				yield roleApi.remove(role.id);
				ElMessage.success(t("common.success"));
				yield reloadRolesKeep(Number(role.id) === Number((_currentRole$value3 = currentRole.value) === null || _currentRole$value3 === void 0 ? void 0 : _currentRole$value3.id) ? void 0 : (_currentRole$value4 = currentRole.value) === null || _currentRole$value4 === void 0 ? void 0 : _currentRole$value4.id);
				loadTemplates();
			})).catch(() => {});
		}
		function onRoleCmd(cmd, role) {
			if (cmd === "edit") openRoleForm(role);
			else if (cmd === "delete") confirmDeleteRole(role);
		}
		/** 刷新角色列表并尽量保持当前选中 */
		function reloadRolesKeep(_x3) {
			return _reloadRolesKeep.apply(this, arguments);
		}
		function _reloadRolesKeep() {
			_reloadRolesKeep = _asyncToGenerator(function* (keepId) {
				roleLoading.value = true;
				try {
					var _res$data5, _res$data6;
					const res = yield roleApi.list({
						pageNum: 1,
						pageSize: 200
					});
					roles.value = sortRoles(((_res$data5 = res.data) === null || _res$data5 === void 0 ? void 0 : _res$data5.records) || ((_res$data6 = res.data) === null || _res$data6 === void 0 ? void 0 : _res$data6.list) || res.data || []);
					const keep = keepId != null ? roles.value.find((r) => Number(r.id) === Number(keepId)) : null;
					if (keep) selectRole(keep);
					else {
						const first = roles.value.find((r) => !isReadonlyRole(r)) || roles.value[0];
						if (first) selectRole(first);
						else currentRole.value = null;
					}
				} finally {
					roleLoading.value = false;
				}
			});
			return _reloadRolesKeep.apply(this, arguments);
		}
		const members = ref([]);
		const membersLoading = ref(false);
		const memberDrawerVisible = ref(false);
		const candidateOptions = ref([]);
		const candLoading = ref(false);
		const selectedToAdd = ref([]);
		const adding = ref(false);
		const memberIdSet = computed(() => new Set(members.value.map((m) => Number(m.userId))));
		const addableCandidates = computed(() => candidateOptions.value.filter((c) => !memberIdSet.value.has(Number(c.userId))));
		function openMemberDrawer() {
			return _openMemberDrawer.apply(this, arguments);
		}
		function _openMemberDrawer() {
			_openMemberDrawer = _asyncToGenerator(function* () {
				if (!currentRole.value) return;
				memberDrawerVisible.value = true;
				selectedToAdd.value = [];
				yield Promise.all([loadMembers(), searchCandidates("")]);
			});
			return _openMemberDrawer.apply(this, arguments);
		}
		function candLabel(c) {
			const name = c.nickname || c.username || "用户" + c.userId;
			const extra = c.phone ? " · " + c.phone : "";
			return `${name}（${c.username}）${extra}`;
		}
		function loadMembers() {
			return _loadMembers.apply(this, arguments);
		}
		function _loadMembers() {
			_loadMembers = _asyncToGenerator(function* () {
				if (!currentRole.value) return;
				membersLoading.value = true;
				try {
					var _ref, _res$data7;
					const res = yield roleApi.members(currentRole.value.id);
					members.value = (_ref = (_res$data7 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data7 !== void 0 ? _res$data7 : res) !== null && _ref !== void 0 ? _ref : [];
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "加载成员失败");
				} finally {
					membersLoading.value = false;
				}
			});
			return _loadMembers.apply(this, arguments);
		}
		function searchCandidates(_x4) {
			return _searchCandidates.apply(this, arguments);
		}
		function _searchCandidates() {
			_searchCandidates = _asyncToGenerator(function* (kw) {
				candLoading.value = true;
				try {
					var _ref2, _res$data8;
					const res = yield roleApi.memberCandidates(kw || "");
					candidateOptions.value = (_ref2 = (_res$data8 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data8 !== void 0 ? _res$data8 : res) !== null && _ref2 !== void 0 ? _ref2 : [];
				} catch (_unused2) {
					candidateOptions.value = [];
				} finally {
					candLoading.value = false;
				}
			});
			return _searchCandidates.apply(this, arguments);
		}
		function addSelected() {
			return _addSelected.apply(this, arguments);
		}
		function _addSelected() {
			_addSelected = _asyncToGenerator(function* () {
				var _userStore$userInfo;
				if (!currentRole.value || !selectedToAdd.value.length) return;
				const affectsCurrentUser = selectedToAdd.value.includes(Number((_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.id));
				adding.value = true;
				try {
					yield roleApi.addMembers(currentRole.value.id, selectedToAdd.value);
					ElMessage.success("已加入，仅该成员当前会话已失效，需重新登录");
					selectedToAdd.value = [];
					if (!affectsCurrentUser) yield loadMembers();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "加入失败");
				} finally {
					adding.value = false;
				}
			});
			return _addSelected.apply(this, arguments);
		}
		function removeOne(_x5) {
			return _removeOne.apply(this, arguments);
		}
		function _removeOne() {
			_removeOne = _asyncToGenerator(function* (m) {
				var _userStore$userInfo2;
				if (!currentRole.value) return;
				const affectsCurrentUser = Number(m.userId) === Number((_userStore$userInfo2 = userStore.userInfo) === null || _userStore$userInfo2 === void 0 ? void 0 : _userStore$userInfo2.id);
				try {
					yield ElMessageBox.confirm(`确定把「${m.nickname || m.username}」移出该角色吗？`, "移除成员", {
						type: "warning",
						confirmButtonText: "移除",
						cancelButtonText: "取消"
					});
				} catch (_unused3) {
					return;
				}
				try {
					yield roleApi.removeMember(currentRole.value.id, m.userId);
					ElMessage.success("已移除，仅该成员当前会话已失效，需重新登录");
					if (!affectsCurrentUser) yield loadMembers();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "移除失败");
				}
			});
			return _removeOne.apply(this, arguments);
		}
		function save() {
			return _save.apply(this, arguments);
		}
		function _save() {
			_save = _asyncToGenerator(function* () {
				if (!currentRole.value) return;
				if (!operationReady.value) {
					ElMessage.error("操作权限尚未完整加载，本次未保存");
					return;
				}
				if (!allOn.value && checkedSubs.value.size === 0) {
					ElMessage.warning("至少保留一个可见模块；如需不限制，请全部开启");
					return;
				}
				saving.value = true;
				try {
					const vm = serializeVisibleModuleSubs(checkedSubs.value, ALL_SUB_PATHS, configurableGroups, groupSubs);
					yield roleApi.savePermissionSettings({
						roleId: Number(currentRole.value.id),
						dataScope: dataScope.value,
						visibleModules: vm,
						menuIds: buildMenuIdsForSave()
					});
					currentRole.value.visibleModules = vm !== null && vm !== void 0 ? vm : "";
					currentRole.value.dataScope = dataScope.value;
					savedScope = dataScope.value;
					savedSubs = new Set(checkedSubs.value);
					savedAssignedMenuIds = buildMenuIdsForSave();
					ElMessage.success("已保存；如权限有变化，受影响成员需重新登录");
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "保存失败");
				} finally {
					saving.value = false;
				}
			});
			return _save.apply(this, arguments);
		}
		return (_ctx, _cache) => {
			var _currentRole$value7;
			const _component_el_icon = ElIcon;
			const _component_el_input = ElInput;
			const _component_el_tag = ElTag;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_empty = ElEmpty;
			const _component_el_scrollbar = ElScrollbar;
			const _component_el_button = ElButton;
			const _component_el_card = ElCard;
			const _component_el_result = ElResult;
			const _component_el_switch = ElSwitch;
			const _component_el_alert = ElAlert;
			const _component_el_collapse_item = ElCollapseItem;
			const _component_el_collapse = ElCollapse;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_drawer = ElDrawer;
			const _component_el_dialog = ElDialog;
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1$1, [
				createVNode(_component_el_card, {
					shadow: "never",
					class: "rp-aside"
				}, {
					header: withCtx(() => [..._cache[18] || (_cache[18] = [createBaseVNode("div", { class: "rp-aside-head" }, "角色", -1)])]),
					default: withCtx(() => [
						createVNode(_component_el_input, {
							modelValue: keyword.value,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
							placeholder: "搜索角色",
							clearable: "",
							size: "small",
							class: "rp-search"
						}, {
							prefix: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(search_default))]),
								_: 1
							})]),
							_: 1
						}, 8, ["modelValue"]),
						withDirectives((openBlock(), createBlock(_component_el_scrollbar, { class: "rp-role-scroll" }, {
							default: withCtx(() => [createBaseVNode("ul", _hoisted_2, [(openBlock(true), createElementBlock(Fragment, null, renderList(filteredRoles.value, (role, i) => {
								var _currentRole$value5;
								return openBlock(), createElementBlock("li", {
									key: role.id,
									class: normalizeClass(["rp-role-item", {
										active: ((_currentRole$value5 = currentRole.value) === null || _currentRole$value5 === void 0 ? void 0 : _currentRole$value5.id) === role.id,
										"is-dragging": roleDragIndex.value === i
									}]),
									draggable: roleDragReady.value && !keyword.value,
									onClick: ($event) => selectRole(role),
									onDragstart: ($event) => onRoleDragStart(i, $event),
									onDragover: withModifiers(($event) => onRoleDragOver(i), ["prevent"]),
									onDrop: _cache[5] || (_cache[5] = withModifiers(() => {}, ["prevent"])),
									onDragend: onRoleDragEnd
								}, [
									!keyword.value ? (openBlock(), createElementBlock("span", {
										key: 0,
										class: "rp-drag",
										title: "按住拖动排序",
										onMousedown: _cache[1] || (_cache[1] = ($event) => roleDragReady.value = true),
										onMouseup: _cache[2] || (_cache[2] = ($event) => roleDragReady.value = false),
										onClick: _cache[3] || (_cache[3] = withModifiers(() => {}, ["stop"]))
									}, "⠿", 32)) : createCommentVNode("", true),
									createBaseVNode("span", {
										class: "rp-dot",
										style: normalizeStyle({ background: roleColor(i) })
									}, null, 4),
									createBaseVNode("span", _hoisted_4, toDisplayString(role.roleName), 1),
									isReadonlyRole(role) ? (openBlock(), createBlock(_component_el_tag, {
										key: 1,
										size: "small",
										type: "warning",
										effect: "plain"
									}, {
										default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("只读", -1)])]),
										_: 1
									})) : hasLimit(role) ? (openBlock(), createBlock(_component_el_tag, {
										key: 2,
										size: "small",
										type: "success",
										effect: "plain"
									}, {
										default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("已限定", -1)])]),
										_: 1
									})) : createCommentVNode("", true),
									!isProtectedRole(role.roleKey) ? (openBlock(), createBlock(_component_el_dropdown, {
										key: 3,
										trigger: "click",
										class: "rp-role-more",
										onCommand: (cmd) => onRoleCmd(cmd, role)
									}, {
										dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
											default: withCtx(() => [createVNode(_component_el_dropdown_item, { command: "edit" }, {
												default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("修改名称", -1)])]),
												_: 1
											}), createVNode(_component_el_dropdown_item, {
												command: "delete",
												divided: ""
											}, {
												default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("删除角色", -1)])]),
												_: 1
											})]),
											_: 1
										})]),
										default: withCtx(() => [createBaseVNode("span", {
											class: "rp-more-btn",
											onClick: _cache[4] || (_cache[4] = withModifiers(() => {}, ["stop"]))
										}, "⋮")]),
										_: 1
									}, 8, ["onCommand"])) : createCommentVNode("", true)
								], 42, _hoisted_3);
							}), 128))]), !roleLoading.value && !filteredRoles.value.length ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "暂无角色",
								"image-size": 70
							})) : createCommentVNode("", true)]),
							_: 1
						})), [[_directive_loading, roleLoading.value]]),
						createVNode(_component_el_button, {
							class: "rp-add-role",
							type: "primary",
							plain: "",
							onClick: _cache[6] || (_cache[6] = ($event) => openRoleForm())
						}, {
							default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("+ 新建角色", -1)])]),
							_: 1
						})
					]),
					_: 1
				}),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "rp-main"
				}, {
					header: withCtx(() => [createBaseVNode("div", _hoisted_5, [createBaseVNode("div", _hoisted_6, [_cache[24] || (_cache[24] = createTextVNode(" 角色权限设置 ", -1)), currentRole.value ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						size: "small",
						effect: "plain",
						class: "rp-cur-tag"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(currentRole.value.roleName), 1)]),
						_: 1
					})) : createCommentVNode("", true)]), currentRole.value ? (openBlock(), createElementBlock("div", _hoisted_7, [createVNode(_component_el_button, {
						icon: unref(view_default),
						onClick: _cache[7] || (_cache[7] = ($event) => previewVisible.value = true)
					}, {
						default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("权限预览", -1)])]),
						_: 1
					}, 8, ["icon"]), !readonly.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
						createBaseVNode("span", _hoisted_8, toDisplayString(allOn.value ? "全部可见（不限制）" : `已限定 ${checkedSubs.value.size} 个小类`), 1),
						createVNode(_component_el_button, {
							icon: unref(refresh_left_default),
							disabled: saving.value,
							onClick: reset
						}, {
							default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("重置", -1)])]),
							_: 1
						}, 8, ["icon", "disabled"]),
						createVNode(_component_el_button, {
							type: "primary",
							icon: unref(check_default),
							loading: saving.value,
							disabled: operationLoading.value || !operationReady.value,
							onClick: save
						}, {
							default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("保存", -1)])]),
							_: 1
						}, 8, [
							"icon",
							"loading",
							"disabled"
						])
					], 64)) : createCommentVNode("", true)])) : createCommentVNode("", true)])]),
					default: withCtx(() => [currentRole.value ? (openBlock(), createElementBlock("div", _hoisted_9, [
						createBaseVNode("div", _hoisted_10, [
							_cache[28] || (_cache[28] = createBaseVNode("span", { class: "rp-members-summary-label" }, "角色成员", -1)),
							members.value.length ? (openBlock(), createElementBlock("div", _hoisted_11, [(openBlock(true), createElementBlock(Fragment, null, renderList(members.value.slice(0, 4), (m) => {
								return openBlock(), createElementBlock("span", {
									key: m.userId,
									class: "rp-members-avatar",
									title: m.nickname || m.username
								}, toDisplayString((m.nickname || m.username || "?").slice(0, 1)), 9, _hoisted_12);
							}), 128)), members.value.length > 4 ? (openBlock(), createElementBlock("span", _hoisted_13, "+" + toDisplayString(members.value.length - 4), 1)) : createCommentVNode("", true)])) : (openBlock(), createElementBlock("span", _hoisted_14, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(user_default))]),
								_: 1
							})])),
							createBaseVNode("strong", _hoisted_15, toDisplayString(members.value.length) + " 人", 1)
						]),
						createBaseVNode("div", _hoisted_16, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(info_filled_default))]),
							_: 1
						}), _cache[29] || (_cache[29] = createBaseVNode("span", null, "成员变更后，仅受影响员工需重新登录", -1))]),
						createVNode(_component_el_button, {
							icon: unref(user_default),
							plain: "",
							onClick: openMemberDrawer
						}, {
							default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("成员管理", -1)])]),
							_: 1
						}, 8, ["icon"])
					])) : createCommentVNode("", true), !currentRole.value ? (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "请选择左侧角色"
					})) : readonly.value ? (openBlock(), createBlock(_component_el_result, {
						key: 2,
						icon: "success",
						title: "系统内置角色",
						"sub-title": "唯一超级管理员拥有全部查看权限，其配置不可修改；可在上方维护成员"
					})) : (openBlock(), createElementBlock("div", _hoisted_17, [
						_cache[32] || (_cache[32] = createBaseVNode("div", { class: "rp-section-title" }, "① 可查看的数据范围", -1)),
						_cache[33] || (_cache[33] = createBaseVNode("div", { class: "rp-section-desc" }, "决定这个角色能看到多大范围的数据", -1)),
						createBaseVNode("div", _hoisted_18, [(openBlock(), createElementBlock(Fragment, null, renderList(scopeOptions, (opt) => {
							return createBaseVNode("div", {
								key: opt.value,
								class: normalizeClass(["rp-scope-item", { active: dataScope.value === opt.value }]),
								onClick: ($event) => dataScope.value = opt.value
							}, [createBaseVNode("span", _hoisted_20, [dataScope.value === opt.value ? (openBlock(), createElementBlock("span", _hoisted_21)) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_22, [createBaseVNode("div", _hoisted_23, toDisplayString(opt.title), 1), createBaseVNode("div", _hoisted_24, toDisplayString(opt.sub), 1)])], 10, _hoisted_19);
						}), 64))]),
						_cache[34] || (_cache[34] = createBaseVNode("div", {
							class: "rp-section-title",
							style: { "margin-top": "22px" }
						}, "② 可访问的模块（可细到小类）", -1)),
						_cache[35] || (_cache[35] = createBaseVNode("div", { class: "rp-section-desc" }, "这里是员工页面导航的唯一配置来源。大类全开＝整块放行；全部大类全开＝不限制。首页（含内部沟通）始终可见。", -1)),
						createBaseVNode("div", _hoisted_25, [createBaseVNode("div", _hoisted_26, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(configurableGroups), (g) => {
							return openBlock(), createElementBlock("div", {
								key: g.name,
								class: normalizeClass(["rp-cat-item", { active: currentGroup.value === g.name }]),
								onClick: ($event) => currentGroup.value = g.name
							}, [
								createBaseVNode("span", {
									class: "rp-cat-tile",
									style: normalizeStyle({ background: g.color })
								}, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(g.icon)))]),
									_: 2
								}, 1024)], 4),
								createBaseVNode("span", _hoisted_28, toDisplayString(g.name), 1),
								createBaseVNode("span", { class: normalizeClass(["rp-cat-count", groupState(g.name)]) }, toDisplayString(groupOnCount(g.name)) + "/" + toDisplayString((groupSubs[g.name] || []).length), 3)
							], 10, _hoisted_27);
						}), 128))]), createBaseVNode("div", _hoisted_29, [createBaseVNode("div", _hoisted_30, [createBaseVNode("span", _hoisted_31, toDisplayString(currentGroup.value) + " · 小类", 1), createVNode(_component_el_button, {
							link: "",
							type: "primary",
							size: "small",
							onClick: _cache[8] || (_cache[8] = ($event) => toggleGroupAll(currentGroup.value, !isGroupAllOn(currentGroup.value)))
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(isGroupAllOn(currentGroup.value) ? "全部关闭" : "全部开启"), 1)]),
							_: 1
						})]), createBaseVNode("div", _hoisted_32, [(openBlock(true), createElementBlock(Fragment, null, renderList(groupSubs[currentGroup.value] || [], (s) => {
							return openBlock(), createElementBlock("div", {
								key: s.path,
								class: "rp-sub-item"
							}, [
								createBaseVNode("span", _hoisted_33, toDisplayString(s.title), 1),
								createBaseVNode("span", { class: normalizeClass(["rp-sub-state", checkedSubs.value.has(s.path) ? "on" : "off"]) }, toDisplayString(checkedSubs.value.has(s.path) ? "可访问" : "隐藏"), 3),
								createVNode(_component_el_switch, {
									"model-value": checkedSubs.value.has(s.path),
									onChange: (v) => toggleSub(s.path, !!v)
								}, null, 8, ["model-value", "onChange"])
							]);
						}), 128)), !(groupSubs[currentGroup.value] || []).length ? (openBlock(), createBlock(_component_el_empty, {
							key: 0,
							description: "该大类无可配小类",
							"image-size": 60
						})) : createCommentVNode("", true)])])]),
						_cache[36] || (_cache[36] = createBaseVNode("div", {
							class: "rp-section-title",
							style: { "margin-top": "22px" }
						}, "③ 可使用的操作（按钮和接口）", -1)),
						_cache[37] || (_cache[37] = createBaseVNode("div", { class: "rp-section-desc" }, "页面能否进入由上方决定；这里决定进入后能查看、新增、修改、删除或导出什么。", -1)),
						withDirectives((openBlock(), createElementBlock("div", _hoisted_34, [readonly.value ? (openBlock(), createBlock(_component_el_alert, {
							key: 0,
							title: "内置超级管理员默认拥有全部操作权限，无需单独勾选",
							type: "info",
							closable: false,
							"show-icon": ""
						})) : permissionLoadError.value ? (openBlock(), createBlock(_component_el_alert, {
							key: 1,
							title: permissionLoadError.value,
							type: "error",
							closable: false,
							"show-icon": ""
						}, null, 8, ["title"])) : operationGroups.value.length ? (openBlock(), createBlock(_component_el_collapse, {
							key: 2,
							class: "rp-operation-collapse"
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(operationGroups.value, (group) => {
								return openBlock(), createBlock(_component_el_collapse_item, {
									key: group.key,
									name: group.key
								}, {
									title: withCtx(() => [createBaseVNode("span", _hoisted_35, toDisplayString(group.label), 1), createVNode(_component_el_tag, {
										size: "small",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(group.items.filter((item) => checkedPermissionIds.value.has(item.id)).length) + "/" + toDisplayString(group.items.length), 1)]),
										_: 2
									}, 1024)]),
									default: withCtx(() => [createBaseVNode("div", _hoisted_36, [(openBlock(true), createElementBlock(Fragment, null, renderList(group.items, (item) => {
										return openBlock(), createElementBlock("div", {
											key: item.id,
											class: "rp-operation-item"
										}, [createBaseVNode("div", _hoisted_37, [createBaseVNode("strong", null, toDisplayString(item.menuName), 1), createBaseVNode("span", null, toDisplayString(item.perms), 1)]), createVNode(_component_el_switch, {
											"model-value": checkedPermissionIds.value.has(item.id),
											onChange: (v) => togglePermission(item.id, !!v)
										}, null, 8, ["model-value", "onChange"])]);
									}), 128))])]),
									_: 2
								}, 1032, ["name"]);
							}), 128))]),
							_: 1
						})) : !operationLoading.value ? (openBlock(), createBlock(_component_el_empty, {
							key: 3,
							description: "暂无可配置的操作权限",
							"image-size": 60
						})) : createCommentVNode("", true)])), [[_directive_loading, operationLoading.value]]),
						createBaseVNode("div", _hoisted_38, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(info_filled_default))]),
							_: 1
						}), _cache[31] || (_cache[31] = createBaseVNode("span", null, "角色页面、操作权限、数据范围和成员只在这里设置；保存后受影响成员需重新登录。", -1))])
					]))]),
					_: 1
				}),
				createVNode(_component_el_drawer, {
					modelValue: memberDrawerVisible.value,
					"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => memberDrawerVisible.value = $event),
					size: "min(460px, 94vw)",
					"append-to-body": "",
					"destroy-on-close": "",
					class: "rpm-drawer",
					onClosed: _cache[11] || (_cache[11] = ($event) => selectedToAdd.value = [])
				}, {
					header: withCtx(() => {
						var _currentRole$value6;
						return [createBaseVNode("div", _hoisted_39, [createBaseVNode("div", null, [_cache[38] || (_cache[38] = createBaseVNode("div", { class: "rpm-drawer-title" }, "成员管理", -1)), createBaseVNode("div", _hoisted_40, toDisplayString(((_currentRole$value6 = currentRole.value) === null || _currentRole$value6 === void 0 ? void 0 : _currentRole$value6.roleName) || "") + " · " + toDisplayString(members.value.length) + " 人", 1)])])];
					}),
					default: withCtx(() => [createBaseVNode("div", _hoisted_41, [
						createBaseVNode("div", _hoisted_42, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(info_filled_default))]),
							_: 1
						}), _cache[39] || (_cache[39] = createBaseVNode("span", null, "这里仅调整该角色包含的员工，不会改变角色本身的权限配置。", -1))]),
						createBaseVNode("div", _hoisted_43, [
							_cache[41] || (_cache[41] = createBaseVNode("div", { class: "mm-label" }, "添加人员", -1)),
							createBaseVNode("div", _hoisted_44, [createVNode(_component_el_select, {
								modelValue: selectedToAdd.value,
								"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => selectedToAdd.value = $event),
								multiple: "",
								filterable: "",
								remote: "",
								clearable: "",
								"reserve-keyword": "",
								"remote-method": searchCandidates,
								loading: candLoading.value,
								placeholder: "输入姓名 / 账号 / 手机号搜索员工",
								class: "mm-select"
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(addableCandidates.value, (c) => {
									return openBlock(), createBlock(_component_el_option, {
										key: c.userId,
										label: candLabel(c),
										value: Number(c.userId)
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue", "loading"]), createVNode(_component_el_button, {
								type: "primary",
								loading: adding.value,
								disabled: !selectedToAdd.value.length,
								onClick: addSelected
							}, {
								default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("加入", -1)])]),
								_: 1
							}, 8, ["loading", "disabled"])]),
							_cache[42] || (_cache[42] = createBaseVNode("div", { class: "mm-hint" }, "已在本角色的员工不会重复出现；加入后该员工需重新登录。", -1))
						]),
						createBaseVNode("div", _hoisted_45, [createBaseVNode("div", _hoisted_46, "当前成员（" + toDisplayString(members.value.length) + " 人）", 1), createVNode(_component_el_scrollbar, { "max-height": "calc(100vh - 390px)" }, {
							default: withCtx(() => [withDirectives((openBlock(), createElementBlock("div", null, [!members.value.length && !membersLoading.value ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "暂无成员，请在上方添加",
								"image-size": 60
							})) : (openBlock(), createElementBlock("ul", _hoisted_47, [(openBlock(true), createElementBlock(Fragment, null, renderList(members.value, (m) => {
								return openBlock(), createElementBlock("li", {
									key: m.userId,
									class: "mm-item"
								}, [
									createBaseVNode("span", _hoisted_48, toDisplayString((m.nickname || m.username || "?").slice(0, 1)), 1),
									createBaseVNode("div", _hoisted_49, [createBaseVNode("div", _hoisted_50, toDisplayString(m.nickname || m.username), 1), createBaseVNode("div", _hoisted_51, toDisplayString(m.username) + toDisplayString(m.phone ? " · " + m.phone : ""), 1)]),
									createVNode(_component_el_button, {
										link: "",
										type: "danger",
										size: "small",
										onClick: ($event) => removeOne(m)
									}, {
										default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("移除", -1)])]),
										_: 1
									}, 8, ["onClick"])
								]);
							}), 128))]))])), [[_directive_loading, membersLoading.value]])]),
							_: 1
						})])
					])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: previewVisible.value,
					"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => previewVisible.value = $event),
					title: `权限预览 · ${((_currentRole$value7 = currentRole.value) === null || _currentRole$value7 === void 0 ? void 0 : _currentRole$value7.roleName) || ""}`,
					width: "720px",
					"append-to-body": "",
					class: "rpp-dialog"
				}, {
					footer: withCtx(() => [createBaseVNode("div", _hoisted_69, [_cache[49] || (_cache[49] = createBaseVNode("span", { class: "rpp-foot-tip" }, "这是按当前配置（含未保存改动）的效果预览，正式生效需点「保存」。", -1)), createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[12] || (_cache[12] = ($event) => previewVisible.value = false)
					}, {
						default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("知道了", -1)])]),
						_: 1
					})])]),
					default: withCtx(() => [createBaseVNode("div", _hoisted_52, [
						createBaseVNode("div", _hoisted_53, [_cache[44] || (_cache[44] = createBaseVNode("span", { class: "rpp-summary-label" }, "数据范围", -1)), createBaseVNode("b", null, toDisplayString(previewScopeText.value), 1)]),
						createBaseVNode("div", _hoisted_54, [_cache[45] || (_cache[45] = createBaseVNode("span", { class: "rpp-summary-label" }, "可用操作", -1)), readonly.value ? (openBlock(), createElementBlock("b", _hoisted_55, "全部（内置管理员）")) : (openBlock(), createElementBlock("b", _hoisted_56, toDisplayString(selectedOperationCount.value) + " 项", 1))]),
						createBaseVNode("div", _hoisted_57, [_cache[46] || (_cache[46] = createBaseVNode("span", { class: "rpp-summary-label" }, "可见页面", -1)), readonly.value ? (openBlock(), createElementBlock("b", _hoisted_58, "全部（内置管理员）")) : allOn.value ? (openBlock(), createElementBlock("b", _hoisted_59, "全部（模块不限制）")) : (openBlock(), createElementBlock("b", _hoisted_60, toDisplayString(previewGroups.value.length) + " 个大类 · " + toDisplayString(previewPageCount.value) + " 个页面", 1))])
					]), createVNode(_component_el_scrollbar, { "max-height": "58vh" }, {
						default: withCtx(() => [createBaseVNode("div", _hoisted_61, [
							(openBlock(true), createElementBlock(Fragment, null, renderList(unref(baselineGroups), (base) => {
								return openBlock(), createElementBlock("div", {
									key: base.name,
									class: "rpp-group"
								}, [createBaseVNode("div", _hoisted_62, [
									createBaseVNode("span", {
										class: "rpp-tile",
										style: normalizeStyle({ background: base.color || "#185FA5" })
									}, [base.icon ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
										default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(base.icon)))]),
										_: 2
									}, 1024)) : (openBlock(), createElementBlock("span", _hoisted_63, "首"))], 4),
									createBaseVNode("span", _hoisted_64, toDisplayString(base.name), 1),
									createVNode(_component_el_tag, {
										size: "small",
										type: "info",
										effect: "plain"
									}, {
										default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("始终可见", -1)])]),
										_: 1
									})
								])]);
							}), 128)),
							(openBlock(true), createElementBlock(Fragment, null, renderList(previewGroups.value, (g) => {
								return openBlock(), createElementBlock("div", {
									key: g.name,
									class: "rpp-group"
								}, [createBaseVNode("div", _hoisted_65, [
									createBaseVNode("span", {
										class: "rpp-tile",
										style: normalizeStyle({ background: g.color })
									}, [createVNode(_component_el_icon, null, {
										default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(g.icon)))]),
										_: 2
									}, 1024)], 4),
									createBaseVNode("span", _hoisted_66, toDisplayString(g.name), 1),
									createBaseVNode("span", _hoisted_67, toDisplayString(g.subs.length) + " 页", 1)
								]), createBaseVNode("div", _hoisted_68, [(openBlock(true), createElementBlock(Fragment, null, renderList(g.subs, (s) => {
									return openBlock(), createElementBlock("span", {
										key: s.path,
										class: "rpp-page"
									}, toDisplayString(s.title), 1);
								}), 128))])]);
							}), 128)),
							!readonly.value && !allOn.value && !previewGroups.value.length ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "该角色除全员基础模块外看不到任何页面（所有可配模块均已关闭）",
								"image-size": 70
							})) : createCommentVNode("", true)
						])]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: roleFormVisible.value,
					"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => roleFormVisible.value = $event),
					title: roleFormTitle.value,
					width: "440px",
					"append-to-body": "",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[16] || (_cache[16] = ($event) => roleFormVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitRoleForm,
						loading: roleSubmitLoading.value
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(roleForm).id ? _ctx.$t("common.confirm") : "创建"), 1)]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "roleFormRef",
						ref: roleFormRef,
						model: unref(roleForm),
						rules: unref(roleRules),
						"label-position": "top",
						onSubmit: _cache[15] || (_cache[15] = withModifiers(() => {}, ["prevent"]))
					}, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: _ctx.$t("system.role.roleName"),
							prop: "roleName"
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: unref(roleForm).roleName,
								"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(roleForm).roleName = $event),
								maxlength: "30",
								placeholder: "如:售后客服",
								onKeyup: withKeys(submitRoleForm, ["enter"])
							}, null, 8, ["modelValue"])]),
							_: 1
						}, 8, ["label"])]),
						_: 1
					}, 8, ["model", "rules"]), !unref(roleForm).id ? (openBlock(), createElementBlock("div", _hoisted_70, " 新角色以最小权限创建(默认仅本人数据);创建后自动选中,直接在右侧配置数据范围和可见模块。 ")) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-06ec612c"]]);
//#endregion
//#region src/views/system/role.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container role-merged-page" };
//#endregion
//#region src/views/system/role.vue
var role_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "role",
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [createVNode(role_permission_default)]);
		};
	}
}), [["__scopeId", "data-v-fbe28cf6"]]);
//#endregion
export { role_default as default };
