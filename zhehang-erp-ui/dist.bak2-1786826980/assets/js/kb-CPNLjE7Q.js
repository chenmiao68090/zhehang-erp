import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $n as star_default, D as ElPagination, Er as withKeys, F as ElEmpty, Nn as plus_default, a as ElMessageBox, cn as folder_default, d as ElTree, gr as view_default, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, o as ElMessage, ot as ElButton, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { i as kbCategoryApi, r as kbArticleApi } from "./file-BNSD7Sq1.js";
//#region src/views/file/kb.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "kb-page" };
var _hoisted_2 = { class: "kb-sidebar" };
var _hoisted_3 = { class: "sidebar-header" };
var _hoisted_4 = { class: "sidebar-title" };
var _hoisted_5 = { class: "tree-node" };
var _hoisted_6 = { class: "kb-content" };
var _hoisted_7 = { class: "kb-toolbar" };
var _hoisted_8 = { class: "article-list" };
var _hoisted_9 = ["onClick"];
var _hoisted_10 = { class: "article-card__header" };
var _hoisted_11 = { class: "article-title" };
var _hoisted_12 = { class: "article-summary" };
var _hoisted_13 = { class: "article-card__footer" };
var _hoisted_14 = { class: "article-meta" };
var _hoisted_15 = {
	key: 0,
	class: "article-tags"
};
var _hoisted_16 = { class: "article-stats" };
var _hoisted_17 = { class: "article-time" };
//#endregion
//#region src/views/file/kb.vue
var kb_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "kb",
	setup(__props) {
		const { t } = useI18n();
		const router = useRouter();
		const categoryTree = ref([]);
		const articleList = ref([]);
		const searchKeyword = ref("");
		const activeTab = ref("latest");
		const currentCategoryId = ref(null);
		const pagination = reactive({
			pageNum: 1,
			pageSize: 10,
			total: 0
		});
		onMounted(() => {
			loadCategoryTree();
			loadArticles();
		});
		function loadCategoryTree() {
			return _loadCategoryTree.apply(this, arguments);
		}
		function _loadCategoryTree() {
			_loadCategoryTree = _asyncToGenerator(function* () {
				try {
					categoryTree.value = (yield kbCategoryApi.tree()).data || [];
				} catch (e) {}
			});
			return _loadCategoryTree.apply(this, arguments);
		}
		function loadArticles() {
			return _loadArticles.apply(this, arguments);
		}
		function _loadArticles() {
			_loadArticles = _asyncToGenerator(function* () {
				try {
					var _res$data, _res$data2;
					let res;
					if (activeTab.value === "hot") res = yield kbArticleApi.hot({
						pageNum: pagination.pageNum,
						pageSize: pagination.pageSize
					});
					else if (searchKeyword.value || currentCategoryId.value) res = yield kbArticleApi.list({
						pageNum: pagination.pageNum,
						pageSize: pagination.pageSize,
						categoryId: currentCategoryId.value || void 0,
						keyword: searchKeyword.value || void 0
					});
					else res = yield kbArticleApi.recent({
						pageNum: pagination.pageNum,
						pageSize: pagination.pageSize
					});
					articleList.value = ((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.records) || [];
					pagination.total = ((_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.total) || 0;
				} catch (e) {}
			});
			return _loadArticles.apply(this, arguments);
		}
		function handleSearch() {
			pagination.pageNum = 1;
			loadArticles();
		}
		function handleTabChange() {
			pagination.pageNum = 1;
			loadArticles();
		}
		function handleCategoryClick(data) {
			currentCategoryId.value = data.id;
			pagination.pageNum = 1;
			loadArticles();
		}
		function handleCreateCategory() {
			return _handleCreateCategory.apply(this, arguments);
		}
		function _handleCreateCategory() {
			_handleCreateCategory = _asyncToGenerator(function* () {
				const { value } = yield ElMessageBox.prompt(t("kb.enterCategoryName"), t("kb.newCategory"), {
					confirmButtonText: t("common.confirm"),
					cancelButtonText: t("common.cancel")
				});
				if (value) {
					yield kbCategoryApi.create({
						name: value,
						parentId: 0
					});
					ElMessage.success(t("common.success"));
					loadCategoryTree();
				}
			});
			return _handleCreateCategory.apply(this, arguments);
		}
		function handleNewArticle() {
			router.push("/file/article");
		}
		function viewArticle(article) {
			router.push(`/file/article?id=${article.id}`);
		}
		function getArticleSummary(content) {
			if (!content) return "";
			const plain = content.replace(/[#*`>\[\]()!-]/g, "").replace(/\n/g, " ");
			return plain.length > 150 ? plain.substring(0, 150) + "..." : plain;
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_tree = ElTree;
			const _component_el_input = ElInput;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_pagination = ElPagination;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("span", _hoisted_4, toDisplayString(_ctx.$t("kb.categories")), 1), createVNode(_component_el_button, {
				type: "primary",
				link: "",
				onClick: handleCreateCategory
			}, {
				default: withCtx(() => [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(plus_default))]),
					_: 1
				})]),
				_: 1
			})]), createVNode(_component_el_tree, {
				data: categoryTree.value,
				"node-key": "id",
				props: {
					label: "label",
					children: "children"
				},
				"highlight-current": "",
				"default-expand-all": "",
				onNodeClick: handleCategoryClick
			}, {
				default: withCtx(({ data }) => [createBaseVNode("span", _hoisted_5, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(folder_default))]),
					_: 1
				}), createBaseVNode("span", null, toDisplayString(data.label), 1)])]),
				_: 1
			}, 8, ["data"])]), createBaseVNode("div", _hoisted_6, [
				createBaseVNode("div", _hoisted_7, [createVNode(_component_el_input, {
					modelValue: searchKeyword.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchKeyword.value = $event),
					placeholder: _ctx.$t("kb.searchArticle"),
					"prefix-icon": "Search",
					clearable: "",
					style: { "width": "300px" },
					onKeyup: withKeys(handleSearch, ["enter"]),
					onClear: loadArticles
				}, null, 8, ["modelValue", "placeholder"]), createVNode(_component_el_button, {
					type: "primary",
					onClick: handleNewArticle
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), createTextVNode(" " + toDisplayString(_ctx.$t("kb.newArticle")), 1)]),
					_: 1
				})]),
				createVNode(_component_el_tabs, {
					modelValue: activeTab.value,
					"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => activeTab.value = $event),
					onTabChange: handleTabChange
				}, {
					default: withCtx(() => [createVNode(_component_el_tab_pane, {
						label: _ctx.$t("kb.latest"),
						name: "latest"
					}, null, 8, ["label"]), createVNode(_component_el_tab_pane, {
						label: _ctx.$t("kb.hot"),
						name: "hot"
					}, null, 8, ["label"])]),
					_: 1
				}, 8, ["modelValue"]),
				createBaseVNode("div", _hoisted_8, [(openBlock(true), createElementBlock(Fragment, null, renderList(articleList.value, (article) => {
					return openBlock(), createElementBlock("div", {
						key: article.id,
						class: "article-card",
						onClick: ($event) => viewArticle(article)
					}, [
						createBaseVNode("div", _hoisted_10, [createBaseVNode("h3", _hoisted_11, toDisplayString(article.title), 1), article.status === 0 ? (openBlock(), createBlock(_component_el_tag, {
							key: 0,
							type: "info",
							size: "small"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.draft")), 1)]),
							_: 1
						})) : article.status === 1 ? (openBlock(), createBlock(_component_el_tag, {
							key: 1,
							type: "success",
							size: "small"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.published")), 1)]),
							_: 1
						})) : article.status === 2 ? (openBlock(), createBlock(_component_el_tag, {
							key: 2,
							type: "warning",
							size: "small"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("kb.archived")), 1)]),
							_: 1
						})) : createCommentVNode("", true)]),
						createBaseVNode("p", _hoisted_12, toDisplayString(getArticleSummary(article.content)), 1),
						createBaseVNode("div", _hoisted_13, [createBaseVNode("div", _hoisted_14, [article.tags ? (openBlock(), createElementBlock("span", _hoisted_15, [(openBlock(true), createElementBlock(Fragment, null, renderList(article.tags.split(","), (tag) => {
							return openBlock(), createBlock(_component_el_tag, {
								key: tag,
								size: "small",
								type: "info"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(tag), 1)]),
								_: 2
							}, 1024);
						}), 128))])) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_16, [
							createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(view_default))]),
								_: 1
							}), createTextVNode(" " + toDisplayString(article.viewCount || 0), 1)]),
							createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(star_default))]),
								_: 1
							}), createTextVNode(" " + toDisplayString(article.likeCount || 0), 1)]),
							createBaseVNode("span", _hoisted_17, toDisplayString(article.createTime), 1)
						])])
					], 8, _hoisted_9);
				}), 128)), articleList.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
					key: 0,
					description: _ctx.$t("common.noData")
				}, null, 8, ["description"])) : createCommentVNode("", true)]),
				createVNode(_component_el_pagination, {
					"current-page": pagination.pageNum,
					"onUpdate:currentPage": _cache[2] || (_cache[2] = ($event) => pagination.pageNum = $event),
					"page-size": pagination.pageSize,
					"onUpdate:pageSize": _cache[3] || (_cache[3] = ($event) => pagination.pageSize = $event),
					total: pagination.total,
					"page-sizes": [
						10,
						20,
						50
					],
					layout: "total, sizes, prev, pager, next",
					onChange: loadArticles,
					style: {
						"margin-top": "16px",
						"justify-content": "flex-end"
					}
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])
			])]);
		};
	}
}), [["__scopeId", "data-v-7ea35c9b"]]);
//#endregion
export { kb_default as default };
