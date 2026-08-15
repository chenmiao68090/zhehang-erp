import { $ as createCommentVNode, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, Er as withKeys, F as ElEmpty, J as ElCol, M as ElInputNumber, N as ElImage, Nn as plus_default, V as ElDialog, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, l as ElUpload, mt as ElInput, o as ElMessage, ot as ElButton, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as outRegionApi } from "./seal-ChbS7lCl.js";
//#region src/views/seal/out-region.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "out-region" };
var _hoisted_2 = { class: "or-bar" };
var _hoisted_3 = { key: 1 };
var _hoisted_4 = { class: "or-qr" };
//#endregion
//#region src/views/seal/out-region.vue
var out_region_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "out-region",
	setup(__props) {
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const isImg = (v) => !!v && (v.startsWith("data:image") || /^https?:\/\/\S+\.(png|jpe?g|gif|webp)(\?|$)/i.test(v));
		const compressToBase64 = (file, maxSize = 420, quality = .8) => new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const img = new Image();
				img.onload = () => {
					let w = img.width, h = img.height;
					if (w > h && w > maxSize) {
						h = Math.round(h * maxSize / w);
						w = maxSize;
					} else if (h >= w && h > maxSize) {
						w = Math.round(w * maxSize / h);
						h = maxSize;
					}
					const canvas = document.createElement("canvas");
					canvas.width = w;
					canvas.height = h;
					const ctx = canvas.getContext("2d");
					if (!ctx) {
						reject(/* @__PURE__ */ new Error("no-ctx"));
						return;
					}
					ctx.drawImage(img, 0, 0, w, h);
					resolve(canvas.toDataURL("image/jpeg", quality));
				};
				img.onerror = reject;
				img.src = reader.result;
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
		const uploadQr = function() {
			var _ref = _asyncToGenerator(function* (options) {
				try {
					form.value.payQrcode = yield compressToBase64(options.file);
					ElMessage.success("收款码已添加");
				} catch (_unused) {
					ElMessage.error("图片处理失败,请换一张");
				}
			});
			return function uploadQr(_x) {
				return _ref.apply(this, arguments);
			};
		}();
		const removeQr = () => {
			form.value.payQrcode = "";
			ElMessage.success("已删除");
		};
		const rows = ref([]);
		const loading = ref(false);
		const kw = ref("");
		const load = function() {
			var _ref2 = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield outRegionApi.list(kw.value || void 0);
					rows.value = ((_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) || [];
				} catch (_unused2) {
					rows.value = [];
				} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref2.apply(this, arguments);
			};
		}();
		const dlg = ref({
			visible: false,
			saving: false
		});
		const form = ref({});
		const openForm = (row) => {
			form.value = row ? _objectSpread2({}, row) : {
				recordOnlyPrice: 0,
				hzRecordPrice: 0
			};
			dlg.value = {
				visible: true,
				saving: false
			};
		};
		const submit = function() {
			var _ref3 = _asyncToGenerator(function* () {
				if (!form.value.city) {
					ElMessage.warning("请填写城市");
					return;
				}
				dlg.value.saving = true;
				try {
					yield outRegionApi.save(form.value);
					ElMessage.success("已保存");
					dlg.value.visible = false;
					load();
				} catch (_unused3) {
					ElMessage.error("保存失败");
				} finally {
					dlg.value.saving = false;
				}
			});
			return function submit() {
				return _ref3.apply(this, arguments);
			};
		}();
		const removeRow = function() {
			var _ref4 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除「${row.city}」的合作商记录?`, "删除", { type: "warning" });
				} catch (_unused4) {
					return;
				}
				try {
					yield outRegionApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (_unused5) {
					ElMessage.error("删除失败");
				}
			});
			return function removeRow(_x2) {
				return _ref4.apply(this, arguments);
			};
		}();
		onMounted(() => {
			load();
		});
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_image = ElImage;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_divider = ElDivider;
			const _component_el_input_number = ElInputNumber;
			const _component_el_upload = ElUpload;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[28] || (_cache[28] = createBaseVNode("header", { class: "or-head" }, [createBaseVNode("div", null, [createBaseVNode("h2", { class: "or-title" }, "外区域合作"), createBaseVNode("p", { class: "or-sub" }, "浙江省内、杭州以外的备案/刻章合作商名录,记录各城市对接人、单价与备案要求。")])], -1)),
				createBaseVNode("div", _hoisted_2, [createVNode(_component_el_input, {
					modelValue: kw.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => kw.value = $event),
					class: "or-search",
					placeholder: "搜城市…",
					clearable: "",
					onKeyup: withKeys(load, ["enter"]),
					onClear: load
				}, null, 8, ["modelValue"]), createVNode(_component_el_button, {
					type: "primary",
					onClick: _cache[1] || (_cache[1] = ($event) => openForm())
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), _cache[18] || (_cache[18] = createTextVNode(" 新增合作商", -1))]),
					_: 1
				})]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有外区域合作商,先把各城市对接人录进来",
						"image-size": 80
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[2] || (_cache[2] = ($event) => openForm())
						}, {
							default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("新增合作商", -1)])]),
							_: 1
						})]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "城市",
							prop: "city",
							width: "100",
							fixed: "left",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "对接群",
							prop: "contactGroup",
							"min-width": "130",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "外区域对接人",
							prop: "contactPerson",
							width: "120",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "联系方式",
							prop: "contactPhone",
							width: "130",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "仅备案单价",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.recordOnlyPrice)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "备案+刻章",
							prop: "recordEngrave",
							width: "110",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "法人章备案情况",
							prop: "legalSealRecord",
							"min-width": "130",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "半身照是否需要",
							prop: "needHalfPhoto",
							width: "120",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "公章默认尺寸",
							prop: "publicSealSize",
							width: "110",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "合作商收款码",
							width: "110",
							align: "center"
						}, {
							default: withCtx(({ row }) => [isImg(row.payQrcode) ? (openBlock(), createBlock(_component_el_image, {
								key: 0,
								src: row.payQrcode,
								"preview-src-list": [row.payQrcode],
								fit: "cover",
								style: {
									"width": "38px",
									"height": "38px",
									"border-radius": "4px"
								},
								"preview-teleported": ""
							}, null, 8, ["src", "preview-src-list"])) : (openBlock(), createElementBlock("span", _hoisted_3, toDisplayString(row.payQrcode || "—"), 1))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "杭州仅备案单价",
							width: "120",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.hzRecordPrice)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "杭州仅登报",
							prop: "hzReportOnly",
							width: "110",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "备注",
							prop: "remark",
							"min-width": "140",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "120",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								size: "small",
								link: "",
								onClick: ($event) => openForm(row)
							}, {
								default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("编辑", -1)])]),
								_: 1
							}, 8, ["onClick"]), createVNode(_component_el_button, {
								size: "small",
								link: "",
								type: "danger",
								onClick: ($event) => removeRow(row)
							}, {
								default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("删", -1)])]),
								_: 1
							}, 8, ["onClick"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createVNode(_component_el_dialog, {
					modelValue: dlg.value.visible,
					"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => dlg.value.visible = $event),
					title: form.value.id ? "编辑合作商" : "新增合作商",
					width: "680px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[16] || (_cache[16] = ($event) => dlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: dlg.value.saving,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: form.value,
						"label-width": "120px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "城市",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.city,
												"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.value.city = $event),
												placeholder: "如:宁波/温州"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "对接群" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.contactGroup,
												"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.value.contactGroup = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "外区域对接人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.contactPerson,
												"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.value.contactPerson = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "联系方式" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.contactPhone,
												"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.value.contactPhone = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("价格与备案", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "仅备案单价" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.value.recordOnlyPrice,
												"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.value.recordOnlyPrice = $event),
												min: 0,
												precision: 2,
												controls: false,
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "备案+刻章" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.recordEngrave,
												"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.value.recordEngrave = $event),
												placeholder: "如:35 或 不备案"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "法人章备案情况" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.legalSealRecord,
												"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.value.legalSealRecord = $event),
												placeholder: "默认情况"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "半身照是否需要" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.needHalfPhoto,
												"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.value.needHalfPhoto = $event),
												placeholder: "如:需要 / 不需要"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "公章默认尺寸" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.publicSealSize,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.value.publicSealSize = $event),
												placeholder: "如:42*42"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "合作商收款码" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_4, [
												isImg(form.value.payQrcode) ? (openBlock(), createBlock(_component_el_image, {
													key: 0,
													src: form.value.payQrcode,
													"preview-src-list": [form.value.payQrcode],
													fit: "cover",
													class: "or-qr-thumb",
													"preview-teleported": ""
												}, null, 8, ["src", "preview-src-list"])) : createCommentVNode("", true),
												createVNode(_component_el_upload, {
													"show-file-list": false,
													"http-request": (o) => uploadQr(o),
													accept: "image/*"
												}, {
													default: withCtx(() => [createVNode(_component_el_button, { size: "small" }, {
														default: withCtx(() => [createTextVNode(toDisplayString(isImg(form.value.payQrcode) ? "重新上传" : "上传收款码图片"), 1)]),
														_: 1
													})]),
													_: 1
												}, 8, ["http-request"]),
												isImg(form.value.payQrcode) || form.value.payQrcode ? (openBlock(), createBlock(_component_el_button, {
													key: 1,
													size: "small",
													type: "danger",
													link: "",
													onClick: removeQr
												}, {
													default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("删除", -1)])]),
													_: 1
												})) : createCommentVNode("", true),
												!isImg(form.value.payQrcode) ? (openBlock(), createBlock(_component_el_input, {
													key: 2,
													modelValue: form.value.payQrcode,
													"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.value.payQrcode = $event),
													placeholder: "或填文本/链接",
													size: "small",
													style: { "width": "140px" }
												}, null, 8, ["modelValue"])) : createCommentVNode("", true)
											]), _cache[24] || (_cache[24] = createBaseVNode("span", { class: "or-hint" }, "支持上传图片(自动压缩存储),也可填文本/链接。", -1))]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("杭州对照", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "杭州仅备案单价" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.value.hzRecordPrice,
											"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.value.hzRecordPrice = $event),
											min: 0,
											precision: 2,
											controls: false,
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "杭州仅登报" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.hzReportOnly,
											"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.value.hzReportOnly = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.value.remark,
									"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.value.remark = $event),
									type: "textarea",
									rows: 2
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-757f2e84"]]);
//#endregion
export { out_region_default as default };
