import { Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { M as ElInputNumber, Nn as plus_default, Nt as check_default, V as ElDialog, W as ElDatePicker, Xt as delete_default, _ as ElTableColumn, g as ElTable, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { r as sealCostApi } from "./seal-ChbS7lCl.js";
//#region src/views/seal/cost.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "seal-cost" };
var _hoisted_2 = { class: "sc-head" };
var _hoisted_3 = { class: "sc-actions" };
var _hoisted_4 = { class: "sc-stats" };
var _hoisted_5 = { class: "sc-stat" };
var _hoisted_6 = { class: "sc-stat-num" };
var _hoisted_7 = { class: "sc-stat" };
var _hoisted_8 = { class: "sc-stat-num" };
var _hoisted_9 = { class: "sc-stat" };
var _hoisted_10 = { class: "sc-stat-num" };
var _hoisted_11 = { class: "sc-bar" };
var _hoisted_12 = { class: "sc-bar-title" };
var _hoisted_13 = { class: "sc-bar-ops" };
var _hoisted_14 = {
	key: 0,
	class: "sc-attach-list"
};
var _hoisted_15 = {
	key: 1,
	class: "sc-tip",
	style: { "margin-top": "10px" }
};
var ATTACH_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.bmp,.heic,.heif,.tif,.tiff,.pdf,.ofd,.doc,.docx,.xls,.xlsx";
var ATTACH_MAX_SIZE = 30 * 1024 * 1024;
var ATTACH_FORMAT_TEXT = "JPG、PNG、WebP、HEIC、PDF、OFD、Word、Excel";
//#endregion
//#region src/views/seal/cost.vue
var cost_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "cost",
	setup(__props) {
		const COST_TYPES = [
			"京东快递费用",
			"顺丰快递费用",
			"印章消耗费用",
			"城报登报费用",
			"刻章登报成本|外区域",
			"刻章提成总计",
			"场地物业水电",
			"刻章固定工资",
			"刻章固定社保公积金",
			"管理固定工资",
			"管理固定社保公积金"
		];
		const CATEGORIES = ["固定", "可变"];
		const COST_CATEGORY_OF = {
			京东快递费用: "可变",
			顺丰快递费用: "可变",
			印章消耗费用: "可变",
			城报登报费用: "可变",
			"刻章登报成本|外区域": "可变",
			刻章提成总计: "可变",
			场地物业水电: "固定",
			刻章固定工资: "固定",
			刻章固定社保公积金: "固定",
			管理固定工资: "固定",
			管理固定社保公积金: "固定"
		};
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const nowMonth = () => {
			const d = /* @__PURE__ */ new Date();
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		};
		const costMonth = ref(nowMonth());
		const lines = ref([]);
		const loading = ref(false);
		const saving = ref(false);
		const loadLines = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield sealCostApi.list(costMonth.value);
					lines.value = (((_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) || []).map((l) => _objectSpread2(_objectSpread2({}, l), {}, { attachment: l.attachment || "[]" }));
				} catch (_unused) {
					lines.value = [];
				} finally {
					loading.value = false;
				}
			});
			return function loadLines() {
				return _ref.apply(this, arguments);
			};
		}();
		const addLine = () => lines.value.push({
			costType: "",
			costCategory: "",
			amount: void 0,
			description: "",
			attachment: "[]"
		});
		const removeLine = (i) => lines.value.splice(i, 1);
		const seedTypes = () => {
			const existing = new Set(lines.value.map((l) => l.costType));
			COST_TYPES.forEach((t) => {
				if (!existing.has(t)) lines.value.push({
					costType: t,
					costCategory: COST_CATEGORY_OF[t] || "",
					amount: void 0,
					description: "",
					attachment: "[]"
				});
			});
		};
		const onTypeChange = (row) => {
			if (!row.costCategory && row.costType) row.costCategory = COST_CATEGORY_OF[row.costType] || "";
		};
		const totalCost = computed(() => lines.value.reduce((s, l) => s + Number(l.amount || 0), 0));
		const fixedCost = computed(() => lines.value.filter((l) => l.costCategory === "固定").reduce((s, l) => s + Number(l.amount || 0), 0));
		const variableCost = computed(() => lines.value.filter((l) => l.costCategory === "可变").reduce((s, l) => s + Number(l.amount || 0), 0));
		const saveMonth = function() {
			var _ref2 = _asyncToGenerator(function* () {
				if (!costMonth.value) {
					ElMessage.warning("请选择月份");
					return;
				}
				saving.value = true;
				try {
					const year = costMonth.value.slice(0, 4);
					yield sealCostApi.batchSave(year, costMonth.value, lines.value);
					ElMessage.success("已保存本月成本");
					loadLines();
				} catch (_unused2) {
					ElMessage.error("保存失败");
				} finally {
					saving.value = false;
				}
			});
			return function saveMonth() {
				return _ref2.apply(this, arguments);
			};
		}();
		const ALLOWED_ATTACH_EXT = new Set([
			"jpg",
			"jpeg",
			"png",
			"webp",
			"gif",
			"bmp",
			"heic",
			"heif",
			"tif",
			"tiff",
			"pdf",
			"ofd",
			"doc",
			"docx",
			"xls",
			"xlsx"
		]);
		const attachCount = (row) => {
			try {
				return (JSON.parse(row.attachment || "[]") || []).length;
			} catch (_unused3) {
				return 0;
			}
		};
		const attach = ref({
			visible: false,
			row: null,
			list: []
		});
		const uploadingAttachCount = ref(0);
		const openAttach = (row) => {
			let list = [];
			try {
				list = JSON.parse(row.attachment || "[]") || [];
			} catch (_unused4) {
				list = [];
			}
			attach.value = {
				visible: true,
				row,
				list
			};
		};
		const getFileExt = (name) => {
			const fileName = name || "";
			const dotIndex = fileName.lastIndexOf(".");
			return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : "";
		};
		const beforeAttachUpload = (file) => {
			const ext = getFileExt(file.name);
			if (!ALLOWED_ATTACH_EXT.has(ext)) {
				ElMessage.warning(`暂不支持 ${ext ? "." + ext : "无扩展名"} 文件,请上传 ${ATTACH_FORMAT_TEXT} 格式`);
				return false;
			}
			if (file.size > ATTACH_MAX_SIZE) {
				ElMessage.warning("单个附件不能超过 30MB");
				return false;
			}
			return true;
		};
		const uploadErrorMessage = (error) => {
			var _error$response;
			const message = (error === null || error === void 0 || (_error$response = error.response) === null || _error$response === void 0 || (_error$response = _error$response.data) === null || _error$response === void 0 ? void 0 : _error$response.message) || (error === null || error === void 0 ? void 0 : error.message) || "";
			if (message && ![
				"请求失败",
				"系统异常",
				"Request failed with status code 500"
			].includes(message)) return `上传失败:${message}`;
			return `上传失败,请确认文件为 ${ATTACH_FORMAT_TEXT} 格式且小于 30MB`;
		};
		const uploadAttach = function() {
			var _ref3 = _asyncToGenerator(function* (options) {
				uploadingAttachCount.value += 1;
				try {
					var _res$data2, _options$onSuccess;
					const res = yield fileInfoApi.upload(options.file, void 0, { silentError: true });
					const data = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
					attach.value.list.push({
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					});
					(_options$onSuccess = options.onSuccess) === null || _options$onSuccess === void 0 || _options$onSuccess.call(options, res);
					ElMessage.success("已上传");
				} catch (error) {
					var _options$onError;
					(_options$onError = options.onError) === null || _options$onError === void 0 || _options$onError.call(options, error);
					ElMessage.error(uploadErrorMessage(error));
				} finally {
					uploadingAttachCount.value = Math.max(0, uploadingAttachCount.value - 1);
				}
			});
			return function uploadAttach(_x) {
				return _ref3.apply(this, arguments);
			};
		}();
		const removeAttach = (i) => attach.value.list.splice(i, 1);
		const saveAttach = () => {
			if (attach.value.row) attach.value.row.attachment = JSON.stringify(attach.value.list);
			attach.value.visible = false;
			ElMessage.success("附件已记到该成本(记得点保存本月)");
		};
		onMounted(loadLines);
		return (_ctx, _cache) => {
			const _component_el_date_picker = ElDatePicker;
			const _component_el_button = ElButton;
			const _component_el_icon = ElIcon;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_input_number = ElInputNumber;
			const _component_el_input = ElInput;
			const _component_el_table = ElTable;
			const _component_el_upload = ElUpload;
			const _component_el_tag = ElTag;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[4] || (_cache[4] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "sc-title" }, "刻章成本明细"), createBaseVNode("p", { class: "sc-sub" }, "按月录入各项成本(固定/可变),印章业务看板据此汇算总成本与利润。")], -1)), createBaseVNode("div", _hoisted_3, [_cache[3] || (_cache[3] = createBaseVNode("span", { class: "sc-month-label" }, "月份", -1)), createVNode(_component_el_date_picker, {
					modelValue: costMonth.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => costMonth.value = $event),
					type: "month",
					"value-format": "YYYY-MM",
					placeholder: "选择月份",
					clearable: false,
					onChange: loadLines
				}, null, 8, ["modelValue"])])]),
				createBaseVNode("div", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, "¥" + toDisplayString(fmtMoney(totalCost.value)), 1), _cache[5] || (_cache[5] = createBaseVNode("span", { class: "sc-stat-label" }, "本月总成本", -1))]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("span", _hoisted_8, "¥" + toDisplayString(fmtMoney(fixedCost.value)), 1), _cache[6] || (_cache[6] = createBaseVNode("span", { class: "sc-stat-label" }, "固定成本", -1))]),
					createBaseVNode("div", _hoisted_9, [createBaseVNode("span", _hoisted_10, "¥" + toDisplayString(fmtMoney(variableCost.value)), 1), _cache[7] || (_cache[7] = createBaseVNode("span", { class: "sc-stat-label" }, "可变成本", -1))])
				]),
				createBaseVNode("div", _hoisted_11, [createBaseVNode("span", _hoisted_12, toDisplayString(costMonth.value) + " 成本明细", 1), createBaseVNode("div", _hoisted_13, [
					createVNode(_component_el_button, {
						size: "small",
						onClick: seedTypes
					}, {
						default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("按标准11项填充", -1)])]),
						_: 1
					}),
					createVNode(_component_el_button, {
						size: "small",
						plain: "",
						onClick: addLine
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), _cache[9] || (_cache[9] = createTextVNode(" 新增一行", -1))]),
						_: 1
					}),
					createVNode(_component_el_button, {
						size: "small",
						type: "primary",
						loading: saving.value,
						onClick: saveMonth
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(check_default))]),
							_: 1
						}), _cache[10] || (_cache[10] = createTextVNode(" 保存本月", -1))]),
						_: 1
					}, 8, ["loading"])
				])]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: lines.value,
					border: "",
					size: "small",
					"empty-text": "本月还没有成本明细,点「按标准11项填充」或「新增一行」"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "成本类型",
							"min-width": "180"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_select, {
								modelValue: row.costType,
								"onUpdate:modelValue": ($event) => row.costType = $event,
								size: "small",
								filterable: "",
								"allow-create": "",
								"default-first-option": "",
								placeholder: "选择/输入",
								style: { "width": "100%" },
								onChange: ($event) => onTypeChange(row)
							}, {
								default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(COST_TYPES, (t) => {
									return createVNode(_component_el_option, {
										key: t,
										label: t,
										value: t
									}, null, 8, ["label", "value"]);
								}), 64))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"onChange"
							])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "成本分类",
							width: "110"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_select, {
								modelValue: row.costCategory,
								"onUpdate:modelValue": ($event) => row.costCategory = $event,
								size: "small",
								placeholder: "固定/可变",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(CATEGORIES, (c) => {
									return createVNode(_component_el_option, {
										key: c,
										label: c,
										value: c
									}, null, 8, ["label", "value"]);
								}), 64))]),
								_: 1
							}, 8, ["modelValue", "onUpdate:modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "金额",
							width: "130"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_input_number, {
								modelValue: row.amount,
								"onUpdate:modelValue": ($event) => row.amount = $event,
								min: 0,
								precision: 2,
								controls: false,
								size: "small",
								style: { "width": "100%" },
								placeholder: "¥"
							}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "说明",
							"min-width": "160"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_input, {
								modelValue: row.description,
								"onUpdate:modelValue": ($event) => row.description = $event,
								size: "small",
								placeholder: "可选"
							}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "附件",
							width: "96",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								size: "small",
								link: "",
								type: "primary",
								onClick: ($event) => openAttach(row)
							}, {
								default: withCtx(() => [createTextVNode("附件(" + toDisplayString(attachCount(row)) + ")", 1)]),
								_: 2
							}, 1032, ["onClick"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "60",
							align: "center"
						}, {
							default: withCtx(({ $index }) => [createVNode(_component_el_button, {
								size: "small",
								link: "",
								type: "danger",
								onClick: ($event) => removeLine($index)
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(delete_default))]),
									_: 1
								})]),
								_: 1
							}, 8, ["onClick"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				_cache[15] || (_cache[15] = createBaseVNode("p", { class: "sc-tip" }, "💡 填完点「保存本月」整表保存;成本类型可自行输入非标准项。附件对应各成本的凭证/发票。", -1)),
				createVNode(_component_el_dialog, {
					modelValue: attach.value.visible,
					"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => attach.value.visible = $event),
					title: "成本附件",
					width: "440px",
					"destroy-on-close": "",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[1] || (_cache[1] = ($event) => attach.value.visible = false) }, {
						default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("关闭", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: saveAttach
					}, {
						default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("保存到该成本", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_upload, {
						"show-file-list": false,
						"http-request": (o) => uploadAttach(o),
						"before-upload": beforeAttachUpload,
						accept: ATTACH_ACCEPT,
						disabled: uploadingAttachCount.value > 0,
						multiple: ""
					}, {
						tip: withCtx(() => [..._cache[12] || (_cache[12] = [createBaseVNode("div", { class: "sc-upload-tip" }, "支持 JPG/PNG/WebP/HEIC/PDF/OFD/Word/Excel 等凭证文件,单个不超过 30MB。不支持 SVG、网页、脚本等不安全格式。", -1)])]),
						default: withCtx(() => [createVNode(_component_el_button, {
							size: "small",
							loading: uploadingAttachCount.value > 0
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(plus_default))]),
								_: 1
							}), _cache[11] || (_cache[11] = createTextVNode(" 上传附件(可多张)", -1))]),
							_: 1
						}, 8, ["loading"])]),
						_: 1
					}, 8, ["http-request", "disabled"]), attach.value.list.length ? (openBlock(), createElementBlock("div", _hoisted_14, [(openBlock(true), createElementBlock(Fragment, null, renderList(attach.value.list, (a, i) => {
						return openBlock(), createBlock(_component_el_tag, {
							key: i,
							size: "small",
							closable: "",
							onClose: ($event) => removeAttach(i)
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(a.fileName), 1)]),
							_: 2
						}, 1032, ["onClose"]);
					}), 128))])) : (openBlock(), createElementBlock("p", _hoisted_15, "还没有附件"))]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-95dff8ce"]]);
//#endregion
export { cost_default as default };
