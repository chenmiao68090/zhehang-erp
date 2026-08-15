import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, H as ElDescriptions, U as ElDescriptionsItem, V as ElDialog, _ as ElTableColumn, _t as ElFormItem, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as collisionApi } from "./crm-DKTvHmZR.js";
//#region src/views/leads/collision-manage.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "collision-page" };
var _hoisted_2 = { class: "page-heading" };
var _hoisted_3 = { class: "card-title" };
var _hoisted_4 = { class: "rule-grid" };
var _hoisted_5 = { class: "card-title" };
var _hoisted_6 = { class: "header-actions" };
var _hoisted_7 = { class: "summary" };
var _hoisted_8 = { class: "muted" };
var _hoisted_9 = { class: "pagination" };
var pageSize = 20;
//#endregion
//#region src/views/leads/collision-manage.vue
var collision_manage_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "collision-manage",
	setup(__props) {
		const router = useRouter();
		const userStore = useUserStore();
		const canOpenPoolRules = computed(() => ["admin", "boss"].some((r) => (userStore.roles || []).includes(r)));
		const rules = [
			{
				level: "P0",
				title: "统一社会信用代码",
				description: "信用代码完全一致时命中。"
			},
			{
				level: "P1",
				title: "公司名称",
				description: "公司名称完全一致时命中。"
			},
			{
				level: "P2",
				title: "联系电话",
				description: "联系电话完全一致时命中。"
			},
			{
				level: "P3",
				title: "联系人姓名",
				description: "联系人姓名完全一致时命中。"
			}
		];
		const records = ref([]);
		const total = ref(0);
		const pageNum = ref(1);
		const loading = ref(false);
		const loadError = ref("");
		const pendingOnPage = computed(() => records.value.filter((item) => item.status !== 1).length);
		function fetchRecords() {
			return _fetchRecords.apply(this, arguments);
		}
		function _fetchRecords() {
			_fetchRecords = _asyncToGenerator(function* () {
				loading.value = true;
				loadError.value = "";
				try {
					var _response$data, _data$records, _data$total;
					const response = yield collisionApi.getCollisionLog({
						pageNum: pageNum.value,
						pageSize
					});
					const data = (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response;
					const rows = (_data$records = data === null || data === void 0 ? void 0 : data.records) !== null && _data$records !== void 0 ? _data$records : data === null || data === void 0 ? void 0 : data.list;
					records.value = Array.isArray(rows) ? rows : [];
					total.value = Number((_data$total = data === null || data === void 0 ? void 0 : data.total) !== null && _data$total !== void 0 ? _data$total : 0);
				} catch (error) {
					records.value = [];
					total.value = 0;
					loadError.value = (error === null || error === void 0 ? void 0 : error.message) || (error === null || error === void 0 ? void 0 : error.msg) || "撞单记录加载失败，请稍后重试。";
				} finally {
					loading.value = false;
				}
			});
			return _fetchRecords.apply(this, arguments);
		}
		const resolveVisible = ref(false);
		const detailVisible = ref(false);
		const resolving = ref(false);
		const active = ref(null);
		const resolveForm = reactive({
			resolution: "keep_a",
			detail: ""
		});
		function openResolve(row) {
			active.value = row;
			resolveForm.resolution = "keep_a";
			resolveForm.detail = "";
			resolveVisible.value = true;
		}
		function openDetail(row) {
			active.value = row;
			detailVisible.value = true;
		}
		function confirmResolve() {
			return _confirmResolve.apply(this, arguments);
		}
		function _confirmResolve() {
			_confirmResolve = _asyncToGenerator(function* () {
				if (!active.value) return;
				const detail = resolveForm.detail.trim();
				if (!detail) {
					ElMessage.warning("请填写处理说明，便于后续追溯。");
					return;
				}
				resolving.value = true;
				try {
					yield collisionApi.resolveConflict({
						id: active.value.id,
						resolution: resolveForm.resolution,
						detail
					});
					resolveVisible.value = false;
					ElMessage.success("仲裁结论已记录；系统未自动变更归属或协作关系。");
					yield fetchRecords();
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || (error === null || error === void 0 ? void 0 : error.msg) || "仲裁结论保存失败。");
				} finally {
					resolving.value = false;
				}
			});
			return _confirmResolve.apply(this, arguments);
		}
		function actorLabel(name, id) {
			return name || (id ? `账号 #${id}` : "未记录账号");
		}
		function conflictLabel(value) {
			return {
				claim: "领取冲突",
				same_time: "同时跟进",
				cross_channel: "跨渠道重复",
				duplicate: "重复录入",
				grab_conflict: "抢单冲突"
			}[value || ""] || value || "未记录";
		}
		function matchFieldLabel(value) {
			return {
				creditCode: "统一社会信用代码",
				name: "公司名称",
				phone: "联系电话",
				contactName: "联系人姓名"
			}[value || ""] || value || "未记录";
		}
		function resolutionLabel(value) {
			return {
				keep_a: "A 方继续跟进（记录）",
				keep_b: "B 方继续跟进（记录）",
				merge: "建议合并（记录）",
				cooperate: "建议双方协作（记录）"
			}[value || ""] || value || "未记录";
		}
		fetchRecords();
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_tag = ElTag;
			const _component_el_card = ElCard;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_input = ElInput;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("section", _hoisted_2, [_cache[9] || (_cache[9] = createBaseVNode("div", null, [
					createBaseVNode("p", { class: "eyebrow" }, "SALES DATA GOVERNANCE"),
					createBaseVNode("h1", null, "防撞单记录"),
					createBaseVNode("p", null, "查看真实撞单日志并记录主管仲裁结论。")
				], -1)), canOpenPoolRules.value ? (openBlock(), createBlock(_component_el_button, {
					key: 0,
					onClick: _cache[0] || (_cache[0] = ($event) => unref(router).push("/sys-flow/pool-admin"))
				}, {
					default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("公海私海规则", -1)])]),
					_: 1
				})) : createCommentVNode("", true)]),
				createVNode(_component_el_alert, {
					type: "warning",
					closable: false,
					"show-icon": "",
					title: "本页只记录仲裁结论，不会自动修改客户归属、合并客户或建立协作关系。需要变更归属时，请在对应客户流程中另行操作。"
				}),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "rule-card"
				}, {
					header: withCtx(() => [createBaseVNode("div", _hoisted_3, [_cache[11] || (_cache[11] = createBaseVNode("span", null, "系统当前查重口径", -1)), createVNode(_component_el_tag, {
						type: "info",
						effect: "plain"
					}, {
						default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("全部为精确匹配", -1)])]),
						_: 1
					})])]),
					default: withCtx(() => [createBaseVNode("div", _hoisted_4, [(openBlock(), createElementBlock(Fragment, null, renderList(rules, (rule) => {
						return createBaseVNode("div", {
							key: rule.level,
							class: "rule-item"
						}, [createBaseVNode("strong", null, toDisplayString(rule.level), 1), createBaseVNode("div", null, [createBaseVNode("b", null, toDisplayString(rule.title), 1), createBaseVNode("p", null, toDisplayString(rule.description), 1)])]);
					}), 64))])]),
					_: 1
				}),
				createVNode(_component_el_card, { shadow: "never" }, {
					header: withCtx(() => [createBaseVNode("div", _hoisted_5, [_cache[13] || (_cache[13] = createBaseVNode("span", null, "撞单日志", -1)), createBaseVNode("div", _hoisted_6, [createBaseVNode("span", _hoisted_7, "共 " + toDisplayString(total.value) + " 条；本页待处理 " + toDisplayString(pendingOnPage.value) + " 条", 1), createVNode(_component_el_button, {
						loading: loading.value,
						onClick: fetchRecords
					}, {
						default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["loading"])])])]),
					default: withCtx(() => [
						loadError.value ? (openBlock(), createBlock(_component_el_alert, {
							key: 0,
							class: "load-error",
							type: "error",
							closable: false,
							"show-icon": "",
							title: loadError.value
						}, null, 8, ["title"])) : createCommentVNode("", true),
						withDirectives((openBlock(), createBlock(_component_el_table, {
							data: records.value,
							"empty-text": "暂无撞单记录"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_table_column, {
									prop: "leadName",
									label: "线索",
									"min-width": "160"
								}, {
									default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.leadName || `线索 #${row.leadId}`), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "相关人员",
									"min-width": "210"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("div", null, toDisplayString(actorLabel(row.userAName, row.userAId)), 1), createBaseVNode("div", _hoisted_8, "与 " + toDisplayString(actorLabel(row.userBName, row.userBId)), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "冲突来源",
									"min-width": "140"
								}, {
									default: withCtx(({ row }) => [createTextVNode(toDisplayString(conflictLabel(row.conflictType)), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "匹配字段",
									"min-width": "130"
								}, {
									default: withCtx(({ row }) => [createTextVNode(toDisplayString(matchFieldLabel(row.matchField)), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "状态",
									width: "100"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: row.status === 1 ? "success" : "warning" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(row.status === 1 ? "已记录结论" : "待处理"), 1)]),
										_: 2
									}, 1032, ["type"])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									prop: "createTime",
									label: "记录时间",
									"min-width": "165"
								}),
								createVNode(_component_el_table_column, {
									label: "操作",
									width: "150",
									fixed: "right"
								}, {
									default: withCtx(({ row }) => [row.status !== 1 ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										link: "",
										type: "primary",
										onClick: ($event) => openResolve(row)
									}, {
										default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("记录仲裁", -1)])]),
										_: 1
									}, 8, ["onClick"])) : (openBlock(), createBlock(_component_el_button, {
										key: 1,
										link: "",
										onClick: ($event) => openDetail(row)
									}, {
										default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("查看结论", -1)])]),
										_: 1
									}, 8, ["onClick"]))]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["data"])), [[_directive_loading, loading.value]]),
						createBaseVNode("div", _hoisted_9, [createVNode(_component_el_pagination, {
							"current-page": pageNum.value,
							"onUpdate:currentPage": _cache[1] || (_cache[1] = ($event) => pageNum.value = $event),
							"page-size": pageSize,
							total: total.value,
							layout: "prev, pager, next",
							onCurrentChange: fetchRecords
						}, null, 8, ["current-page", "total"])])
					]),
					_: 1
				}),
				createVNode(_component_el_dialog, {
					modelValue: resolveVisible.value,
					"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => resolveVisible.value = $event),
					title: "记录撞单仲裁结论",
					width: "560px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[4] || (_cache[4] = ($event) => resolveVisible.value = false) }, {
						default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: resolving.value,
						onClick: confirmResolve
					}, {
						default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("保存结论", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_alert, {
						type: "info",
						closable: false,
						title: "保存后只形成可追溯记录，不会自动执行客户归属、合并或协作变更。"
					}), createVNode(_component_el_form, {
						"label-position": "top",
						class: "resolve-form"
					}, {
						default: withCtx(() => [createVNode(_component_el_form_item, { label: "仲裁结论" }, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: resolveForm.resolution,
								"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => resolveForm.resolution = $event),
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [
									createVNode(_component_el_option, {
										label: "A 方继续跟进（仅记录）",
										value: "keep_a"
									}),
									createVNode(_component_el_option, {
										label: "B 方继续跟进（仅记录）",
										value: "keep_b"
									}),
									createVNode(_component_el_option, {
										label: "建议合并（仅记录）",
										value: "merge"
									}),
									createVNode(_component_el_option, {
										label: "建议双方协作（仅记录）",
										value: "cooperate"
									})
								]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, { label: "处理说明（必填）" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: resolveForm.detail,
								"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => resolveForm.detail = $event),
								type: "textarea",
								rows: 4,
								maxlength: "500",
								"show-word-limit": ""
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: detailVisible.value,
					"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => detailVisible.value = $event),
					title: "仲裁记录",
					width: "520px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[6] || (_cache[6] = ($event) => detailVisible.value = false) }, {
						default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("关闭", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [active.value ? (openBlock(), createBlock(_component_el_descriptions, {
						key: 0,
						column: 1,
						border: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: "线索" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(active.value.leadName || `线索 #${active.value.leadId}`), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "仲裁结论" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(resolutionLabel(active.value.resolution)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "处理说明" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(active.value.resolutionDetail || "未填写"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "处理时间" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(active.value.resolvedTime || "未记录"), 1)]),
								_: 1
							})
						]),
						_: 1
					})) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-e0d0bf72"]]);
//#endregion
export { collision_manage_default as default };
