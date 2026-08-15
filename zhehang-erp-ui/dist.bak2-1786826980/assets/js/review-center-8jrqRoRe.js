import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $t as download_default, Bn as refresh_default, D as ElPagination, Dr as withModifiers, Er as withKeys, F as ElEmpty, Q as ElRadioGroup, Qt as document_default, Un as search_default, V as ElDialog, W as ElDatePicker, X as ElRadio, Xt as delete_default, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, b as ElSteps, br as warning_filled_default, dr as upload_filled_default, g as ElTable, gr as view_default, gt as ElForm, ht as ElTooltip, it as ElTag, kn as paperclip_default, l as ElUpload, mn as loading_default, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, y as ElStep, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { n as get, r as post } from "./request-CZ5tKmxn.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { t as downloadBlob } from "./download-DmWzpvAG.js";
import { t as BusinessDetailDrawer_default } from "./BusinessDetailDrawer-t9PlYR5q.js";
//#region src/api/order-review.ts
function unwrap(response) {
	if (response && typeof response === "object" && "code" in response && "data" in response) return response.data;
	return response;
}
var orderReviewApi = {
	list(params) {
		return _asyncToGenerator(function* () {
			const data = unwrap(yield get("/order/review/list", params));
			const list = Array.isArray(data === null || data === void 0 ? void 0 : data.records) ? data.records : Array.isArray(data === null || data === void 0 ? void 0 : data.list) ? data.list : [];
			return {
				list,
				total: Number((data === null || data === void 0 ? void 0 : data.total) || list.length || 0)
			};
		})();
	},
	stats() {
		return _asyncToGenerator(function* () {
			return unwrap(yield get("/order/review/stats"));
		})();
	},
	detail(id) {
		return _asyncToGenerator(function* () {
			return unwrap(yield get(`/order/review/${id}`));
		})();
	},
	downloadAttachment(id, fileId) {
		return get(`/order/review/${id}/attachments/${fileId}`, void 0, {
			responseType: "blob",
			silentError: true
		});
	},
	/** 合同审理(部门主管):提单类审核单的第一个真人节点 */
	contractReview(id, data) {
		return post(`/order/review/${id}/contract/review`, data);
	},
	/** 到款确认(财务):提单类审核单的第二个真人节点 */
	paymentReview(id, data) {
		return post(`/order/review/${id}/payment/review`, data);
	},
	assignHandler(id, data) {
		return post(`/order/review/${id}/assign-handler`, data);
	},
	accept(id, data) {
		return post(`/order/review/${id}/accept`, data);
	},
	submitComplete(id, data) {
		return post(`/order/review/${id}/complete/submit`, data);
	},
	confirmComplete(id, data) {
		return post(`/order/review/${id}/complete/confirm`, data);
	}
};
//#endregion
//#region src/views/order/review-center.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "review-center" };
var _hoisted_2 = { class: "page-head" };
var _hoisted_3 = {
	class: "status-strip",
	"aria-label": "审单状态筛选"
};
var _hoisted_4 = ["onClick"];
var _hoisted_5 = { class: "toolbar" };
var _hoisted_6 = { class: "result-count" };
var _hoisted_7 = { class: "work-surface" };
var _hoisted_8 = ["onClick"];
var _hoisted_9 = { class: "money-cell" };
var _hoisted_10 = { key: 0 };
var _hoisted_11 = { class: "row-actions" };
var _hoisted_12 = { class: "mobile-list" };
var _hoisted_13 = ["onClick"];
var _hoisted_14 = { class: "mobile-row-head" };
var _hoisted_15 = { class: "mobile-meta" };
var _hoisted_16 = { class: "pager" };
var _hoisted_17 = { class: "bd-kv-grid" };
var _hoisted_18 = { class: "bd-kv" };
var _hoisted_19 = { class: "bd-kv" };
var _hoisted_20 = { class: "bd-kv" };
var _hoisted_21 = { class: "bd-kv" };
var _hoisted_22 = { class: "bd-kv" };
var _hoisted_23 = { class: "bd-kv" };
var _hoisted_24 = { class: "bd-kv" };
var _hoisted_25 = { class: "bd-kv" };
var _hoisted_26 = {
	key: 0,
	class: "bd-kv wide"
};
var _hoisted_27 = { class: "process-line" };
var _hoisted_28 = { class: "node-section" };
var _hoisted_29 = { class: "detail-grid" };
var _hoisted_30 = { class: "node-section" };
var _hoisted_31 = { class: "detail-grid" };
var _hoisted_32 = {
	key: 0,
	class: "wide"
};
var _hoisted_33 = { class: "node-section" };
var _hoisted_34 = { class: "detail-grid" };
var _hoisted_35 = {
	key: 0,
	class: "wide"
};
var _hoisted_36 = {
	key: 1,
	class: "wide"
};
var _hoisted_37 = {
	key: 0,
	class: "attachment-list"
};
var _hoisted_38 = ["onClick"];
var _hoisted_39 = {
	key: 1,
	class: "empty-copy"
};
var _hoisted_40 = { key: 0 };
var _hoisted_41 = {
	key: 0,
	class: "upload-list"
};
//#endregion
//#region src/views/order/review-center.vue
var review_center_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "review-center",
	setup(__props) {
		const route = useRoute();
		const userStore = useUserStore();
		const loading = ref(false);
		const rows = ref([]);
		const keyword = ref("");
		const activeStatus = ref("all");
		const stats = reactive({
			total: 0,
			pendingContract: 0,
			pendingPayment: 0,
			pendingAssign: 0,
			pendingAccept: 0,
			processing: 0,
			pendingConfirm: 0,
			completed: 0,
			rejected: 0,
			overdue: 0
		});
		const page = reactive({
			current: 1,
			size: 20,
			total: 0
		});
		const detailVisible = ref(false);
		const detail = ref(null);
		const employeeOptions = ref([]);
		const assignDialog = reactive({
			visible: false,
			loading: false,
			reviewId: 0,
			handlerUserId: void 0,
			deadline: "",
			remark: ""
		});
		const acceptDialog = reactive({
			visible: false,
			loading: false,
			reviewId: 0,
			materialsReady: true,
			expectedCompleteTime: "",
			remark: ""
		});
		const submitDialog = reactive({
			visible: false,
			loading: false,
			reviewId: 0,
			resultDesc: "",
			remark: "",
			uploads: []
		});
		const confirmDialog = reactive({
			visible: false,
			loading: false,
			reviewId: 0,
			pass: true,
			opinion: ""
		});
		/** 合同审理(主管)/到款确认(财务)弹窗:node 区分共用一套 */
		const nodeDialog = reactive({
			visible: false,
			loading: false,
			reviewId: 0,
			node: "contract",
			pass: true,
			opinion: ""
		});
		function openNodeReview(row, node) {
			nodeDialog.reviewId = Number(row.id);
			nodeDialog.node = node;
			nodeDialog.pass = true;
			nodeDialog.opinion = "";
			nodeDialog.visible = true;
		}
		function submitNodeReview() {
			return _submitNodeReview.apply(this, arguments);
		}
		function _submitNodeReview() {
			_submitNodeReview = _asyncToGenerator(function* () {
				if (!nodeDialog.pass && !nodeDialog.opinion.trim()) {
					ElMessage.warning("驳回必须填写原因");
					return;
				}
				nodeDialog.loading = true;
				try {
					const payload = {
						pass: nodeDialog.pass,
						opinion: nodeDialog.opinion.trim() || void 0
					};
					if (nodeDialog.node === "contract") yield orderReviewApi.contractReview(nodeDialog.reviewId, payload);
					else yield orderReviewApi.paymentReview(nodeDialog.reviewId, payload);
					ElMessage.success(nodeDialog.pass ? "已通过" : "已驳回(提单已回到可修改状态)");
					nodeDialog.visible = false;
					detailVisible.value = false;
					yield refreshAll();
				} finally {
					nodeDialog.loading = false;
				}
			});
			return _submitNodeReview.apply(this, arguments);
		}
		const currentUserId = computed(() => {
			var _userStore$userInfo;
			return Number(((_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.id) || 0);
		});
		const detailAttachments = computed(() => {
			var _detail$value;
			return parseAttachments((_detail$value = detail.value) === null || _detail$value === void 0 || (_detail$value = _detail$value.complete) === null || _detail$value === void 0 ? void 0 : _detail$value.completeVoucher);
		});
		const hasUploading = computed(() => submitDialog.uploads.some((item) => item.status === "uploading"));
		const statusFilters = computed(() => [
			{
				key: "all",
				label: "全部",
				value: stats.total
			},
			{
				key: "CONTRACT_PENDING",
				label: "待合同审理",
				value: stats.pendingContract || 0
			},
			{
				key: "PAYMENT_PENDING",
				label: "待到款确认",
				value: stats.pendingPayment || 0
			},
			{
				key: "pending_assign",
				label: "待分配",
				value: stats.pendingAssign
			},
			{
				key: "pending_accept",
				label: "待接收",
				value: stats.pendingAccept
			},
			{
				key: "processing",
				label: "办理中",
				value: stats.processing
			},
			{
				key: "pending_confirm",
				label: "待验收",
				value: stats.pendingConfirm
			},
			{
				key: "overdue",
				label: "已逾期",
				value: stats.overdue
			},
			{
				key: "rejected",
				label: "已退回",
				value: stats.rejected
			},
			{
				key: "completed",
				label: "已完成",
				value: stats.completed
			}
		]);
		onMounted(_asyncToGenerator(function* () {
			yield Promise.all([refreshAll(), loadEmployees()]);
			yield openRequestedReview();
		}));
		watch(() => route.query.reviewId, openRequestedReview);
		function refreshAll() {
			return _refreshAll.apply(this, arguments);
		}
		function _refreshAll() {
			_refreshAll = _asyncToGenerator(function* () {
				yield Promise.allSettled([loadList(), loadStats()]);
			});
			return _refreshAll.apply(this, arguments);
		}
		function loadList() {
			return _loadList.apply(this, arguments);
		}
		function _loadList() {
			_loadList = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const result = yield orderReviewApi.list({
						pageNum: page.current,
						pageSize: page.size,
						status: activeStatus.value,
						keyword: keyword.value.trim() || void 0
					});
					rows.value = result.list;
					page.total = result.total;
				} finally {
					loading.value = false;
				}
			});
			return _loadList.apply(this, arguments);
		}
		function loadStats() {
			return _loadStats.apply(this, arguments);
		}
		function _loadStats() {
			_loadStats = _asyncToGenerator(function* () {
				const result = yield orderReviewApi.stats();
				Object.assign(stats, result || {});
			});
			return _loadStats.apply(this, arguments);
		}
		function loadEmployees() {
			return _loadEmployees.apply(this, arguments);
		}
		function _loadEmployees() {
			_loadEmployees = _asyncToGenerator(function* () {
				try {
					var _response$data;
					const response = yield employeeApi.options();
					const data = (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response;
					employeeOptions.value = (Array.isArray(data === null || data === void 0 ? void 0 : data.records) ? data.records : Array.isArray(data === null || data === void 0 ? void 0 : data.list) ? data.list : Array.isArray(data) ? data : []).map((item) => ({
						userId: Number(item.userId || 0),
						name: item.name || "",
						deptName: item.deptName,
						postName: item.postName
					})).filter((item) => item.userId > 0 && item.name);
				} catch (_unused) {
					employeeOptions.value = [];
				}
			});
			return _loadEmployees.apply(this, arguments);
		}
		function openRequestedReview() {
			return _openRequestedReview.apply(this, arguments);
		}
		function _openRequestedReview() {
			_openRequestedReview = _asyncToGenerator(function* () {
				const id = Number(route.query.reviewId || 0);
				if (id > 0) yield openDetail({ id });
			});
			return _openRequestedReview.apply(this, arguments);
		}
		function switchStatus(status) {
			activeStatus.value = status;
			page.current = 1;
			loadList();
		}
		function applySearch() {
			page.current = 1;
			loadList();
		}
		function handlePageSize() {
			page.current = 1;
			loadList();
		}
		function openDetail(_x) {
			return _openDetail.apply(this, arguments);
		}
		function _openDetail() {
			_openDetail = _asyncToGenerator(function* (row) {
				try {
					detail.value = yield orderReviewApi.detail(Number(row.id));
					detailVisible.value = true;
				} catch (_unused2) {
					detailVisible.value = false;
				}
			});
			return _openDetail.apply(this, arguments);
		}
		function openAssign(row) {
			assignDialog.reviewId = row.id;
			assignDialog.handlerUserId = row.handlerUserId ? Number(row.handlerUserId) : void 0;
			assignDialog.deadline = row.deadline ? toIsoLocal(row.deadline) : "";
			assignDialog.remark = "";
			assignDialog.visible = true;
		}
		function openAccept(row) {
			acceptDialog.reviewId = row.id;
			acceptDialog.materialsReady = true;
			acceptDialog.expectedCompleteTime = row.deadline ? toIsoLocal(row.deadline) : "";
			acceptDialog.remark = "";
			acceptDialog.visible = true;
		}
		function openSubmit(row) {
			submitDialog.reviewId = row.id;
			submitDialog.resultDesc = "";
			submitDialog.remark = "";
			submitDialog.uploads = [];
			submitDialog.visible = true;
		}
		function openConfirm(row) {
			confirmDialog.reviewId = row.id;
			confirmDialog.pass = true;
			confirmDialog.opinion = "";
			confirmDialog.visible = true;
		}
		function submitAssign() {
			return _submitAssign.apply(this, arguments);
		}
		function _submitAssign() {
			_submitAssign = _asyncToGenerator(function* () {
				if (!assignDialog.handlerUserId) return ElMessage.warning("请选择办事人员");
				if (!assignDialog.deadline || new Date(assignDialog.deadline).getTime() <= Date.now()) return ElMessage.warning("办理截止时间必须晚于当前时间");
				assignDialog.loading = true;
				try {
					yield orderReviewApi.assignHandler(assignDialog.reviewId, {
						handlerUserId: assignDialog.handlerUserId,
						deadline: assignDialog.deadline.replace("T", " "),
						remark: assignDialog.remark.trim() || void 0
					});
					ElMessage.success("办事人员已分配");
					assignDialog.visible = false;
					yield afterMutation(assignDialog.reviewId);
				} finally {
					assignDialog.loading = false;
				}
			});
			return _submitAssign.apply(this, arguments);
		}
		function submitAccept() {
			return _submitAccept.apply(this, arguments);
		}
		function _submitAccept() {
			_submitAccept = _asyncToGenerator(function* () {
				if (acceptDialog.materialsReady && (!acceptDialog.expectedCompleteTime || new Date(acceptDialog.expectedCompleteTime).getTime() <= Date.now())) return ElMessage.warning("请填写晚于当前时间的预计完成时间");
				if (!acceptDialog.materialsReady && !acceptDialog.remark.trim()) return ElMessage.warning("退回资料必须填写原因");
				acceptDialog.loading = true;
				try {
					yield orderReviewApi.accept(acceptDialog.reviewId, {
						materialsReady: acceptDialog.materialsReady,
						expectedCompleteTime: acceptDialog.materialsReady ? acceptDialog.expectedCompleteTime.replace("T", " ") : void 0,
						remark: acceptDialog.remark.trim() || void 0
					});
					ElMessage.success(acceptDialog.materialsReady ? "审单已接收，进入办理中" : "资料已退回");
					acceptDialog.visible = false;
					yield afterMutation(acceptDialog.reviewId);
				} finally {
					acceptDialog.loading = false;
				}
			});
			return _submitAccept.apply(this, arguments);
		}
		function validateProof(file) {
			var _file$name$split$pop;
			if (submitDialog.uploads.length >= 10) {
				ElMessage.warning("最多上传 10 个办理凭证");
				return false;
			}
			const extension = ((_file$name$split$pop = file.name.split(".").pop()) === null || _file$name$split$pop === void 0 ? void 0 : _file$name$split$pop.toLowerCase()) || "";
			if (![
				"jpg",
				"jpeg",
				"png",
				"pdf",
				"doc",
				"docx",
				"xls",
				"xlsx"
			].includes(extension)) {
				ElMessage.warning("仅支持图片、PDF、Word 和 Excel 文件");
				return false;
			}
			if (file.size > 20 * 1024 * 1024) {
				ElMessage.warning("单个凭证不能超过 20MB");
				return false;
			}
			return true;
		}
		function uploadProof(_x2) {
			return _uploadProof.apply(this, arguments);
		}
		function _uploadProof() {
			_uploadProof = _asyncToGenerator(function* (options) {
				const raw = options.file;
				if (submitDialog.uploads.length >= 10) {
					ElMessage.warning("最多上传 10 个办理凭证");
					return;
				}
				const item = {
					key: uploadKey(),
					id: 0,
					name: raw.name,
					mimeType: raw.type,
					size: raw.size,
					status: "uploading",
					raw
				};
				submitDialog.uploads.push(item);
				yield executeUpload(item);
			});
			return _uploadProof.apply(this, arguments);
		}
		function executeUpload(_x3) {
			return _executeUpload.apply(this, arguments);
		}
		function _executeUpload() {
			_executeUpload = _asyncToGenerator(function* (item) {
				item.status = "uploading";
				try {
					var _response$data2;
					const response = yield fileInfoApi.upload(item.raw, void 0, { silentError: true });
					const uploaded = (_response$data2 = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data2 !== void 0 ? _response$data2 : response;
					if (!(uploaded === null || uploaded === void 0 ? void 0 : uploaded.id)) throw new Error("文件编号为空");
					item.id = Number(uploaded.id);
					item.name = uploaded.originalName || uploaded.name || item.name;
					item.mimeType = uploaded.mimeType || item.mimeType;
					item.size = Number(uploaded.fileSize || item.size || 0);
					item.status = "success";
				} catch (error) {
					item.status = "error";
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || `${item.name} 上传失败`);
				}
			});
			return _executeUpload.apply(this, arguments);
		}
		function retryUpload(item) {
			executeUpload(item);
		}
		function removeUpload(key) {
			submitDialog.uploads = submitDialog.uploads.filter((item) => item.key !== key);
		}
		function submitResult() {
			return _submitResult.apply(this, arguments);
		}
		function _submitResult() {
			_submitResult = _asyncToGenerator(function* () {
				if (!submitDialog.resultDesc.trim()) return ElMessage.warning("请填写办理结果");
				if (submitDialog.uploads.some((item) => item.status === "uploading")) return ElMessage.warning("请等待凭证上传完成");
				const attachments = submitDialog.uploads.filter((item) => item.status === "success" && item.id > 0).map(({ id, name, mimeType, size }) => ({
					id,
					name,
					mimeType,
					size
				}));
				if (!attachments.length) return ElMessage.warning("请至少上传一份办理凭证");
				submitDialog.loading = true;
				try {
					yield orderReviewApi.submitComplete(submitDialog.reviewId, {
						resultDesc: submitDialog.resultDesc.trim(),
						attachments,
						remark: submitDialog.remark.trim() || void 0
					});
					ElMessage.success("办理结果已提交，等待验收");
					submitDialog.visible = false;
					yield afterMutation(submitDialog.reviewId);
				} finally {
					submitDialog.loading = false;
				}
			});
			return _submitResult.apply(this, arguments);
		}
		function submitConfirm() {
			return _submitConfirm.apply(this, arguments);
		}
		function _submitConfirm() {
			_submitConfirm = _asyncToGenerator(function* () {
				if (!confirmDialog.pass && !confirmDialog.opinion.trim()) return ElMessage.warning("驳回必须填写原因");
				confirmDialog.loading = true;
				try {
					yield orderReviewApi.confirmComplete(confirmDialog.reviewId, {
						pass: confirmDialog.pass,
						opinion: confirmDialog.opinion.trim() || void 0
					});
					ElMessage.success(confirmDialog.pass ? "审单已验收完成" : "办理结果已驳回");
					confirmDialog.visible = false;
					yield afterMutation(confirmDialog.reviewId);
				} finally {
					confirmDialog.loading = false;
				}
			});
			return _submitConfirm.apply(this, arguments);
		}
		function afterMutation(_x4) {
			return _afterMutation.apply(this, arguments);
		}
		function _afterMutation() {
			_afterMutation = _asyncToGenerator(function* (reviewId) {
				var _detail$value2;
				yield refreshAll();
				if (detailVisible.value && Number((_detail$value2 = detail.value) === null || _detail$value2 === void 0 || (_detail$value2 = _detail$value2.review) === null || _detail$value2 === void 0 ? void 0 : _detail$value2.id) === Number(reviewId)) detail.value = yield orderReviewApi.detail(reviewId);
			});
			return _afterMutation.apply(this, arguments);
		}
		function downloadReviewAttachment(_x5) {
			return _downloadReviewAttachment.apply(this, arguments);
		}
		function _downloadReviewAttachment() {
			_downloadReviewAttachment = _asyncToGenerator(function* (file) {
				var _detail$value3;
				const reviewId = Number(((_detail$value3 = detail.value) === null || _detail$value3 === void 0 || (_detail$value3 = _detail$value3.review) === null || _detail$value3 === void 0 ? void 0 : _detail$value3.id) || 0);
				if (!reviewId || !file.id) return;
				try {
					const blob = yield orderReviewApi.downloadAttachment(reviewId, file.id);
					if (blob.type.includes("json")) {
						const payload = JSON.parse(yield blob.text());
						throw new Error((payload === null || payload === void 0 ? void 0 : payload.message) || "无权下载该凭证");
					}
					downloadBlob(blob, file.name || `review_attachment_${file.id}`);
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "凭证下载失败");
				}
			});
			return _downloadReviewAttachment.apply(this, arguments);
		}
		function effectiveRoles() {
			const result = /* @__PURE__ */ new Set();
			for (const role of userStore.roles || []) {
				result.add(role);
				const separator = role.indexOf("__");
				if (separator > 0) result.add(role.slice(0, separator));
			}
			return result;
		}
		function hasRole(...keys) {
			if (currentUserId.value === 1) return true;
			const roles = effectiveRoles();
			return keys.some((key) => roles.has(key));
		}
		function canContract(row) {
			return row.reviewStatus === "CONTRACT_PENDING" && hasRole("admin", "super_admin", "sys_admin", "boss", "manager", "dept_manager");
		}
		function canPayment(row) {
			return row.reviewStatus === "PAYMENT_PENDING" && hasRole("admin", "super_admin", "sys_admin", "boss", "finance", "finance_hq");
		}
		function canAssign(row) {
			return ["ACCEPT_PENDING", "ACCEPT_REJECTED"].includes(row.reviewStatus) && hasRole("admin", "super_admin", "sys_admin", "boss", "manager", "dept_manager");
		}
		function canAccept(row) {
			return row.reviewStatus === "ACCEPT_PENDING" && Number(row.handlerUserId) === currentUserId.value;
		}
		function canSubmit(row) {
			return ["PROCESSING", "COMPLETE_REJECTED"].includes(row.reviewStatus) && Number(row.handlerUserId) === currentUserId.value;
		}
		function canConfirm(row) {
			return row.reviewStatus === "COMPLETE_PENDING" && (Number(row.salesUserId) === currentUserId.value || hasRole("admin", "super_admin", "sys_admin", "boss", "manager", "dept_manager"));
		}
		function statusMeta(status) {
			return {
				CONTRACT_PENDING: {
					label: "待合同审理",
					type: "warning",
					avatar: "warning"
				},
				CONTRACT_REJECTED: {
					label: "合同驳回",
					type: "danger",
					avatar: "danger"
				},
				PAYMENT_PENDING: {
					label: "待到款确认",
					type: "warning",
					avatar: "warning"
				},
				PAYMENT_REJECTED: {
					label: "到款驳回",
					type: "danger",
					avatar: "danger"
				},
				ACCEPT_PENDING: {
					label: "待接收",
					type: "warning",
					avatar: "warning"
				},
				ACCEPT_REJECTED: {
					label: "资料退回",
					type: "danger",
					avatar: "danger"
				},
				PROCESSING: {
					label: "办理中",
					type: "primary",
					avatar: ""
				},
				COMPLETE_PENDING: {
					label: "待验收",
					type: "warning",
					avatar: "warning"
				},
				COMPLETE_REJECTED: {
					label: "验收驳回",
					type: "danger",
					avatar: "danger"
				},
				COMPLETED: {
					label: "已完成",
					type: "success",
					avatar: "success"
				},
				VOIDED: {
					label: "已作废",
					type: "info",
					avatar: ""
				}
			}[status || ""] || {
				label: status || "未知状态",
				type: "info",
				avatar: ""
			};
		}
		function displayStatus(row) {
			if (isOverdue(row)) return "已逾期";
			if (row.reviewStatus === "ACCEPT_PENDING" && !row.handlerUserId) return "待分配";
			return statusMeta(row.reviewStatus).label;
		}
		function isOverdue(row) {
			if (!(row === null || row === void 0 ? void 0 : row.deadline) || ["COMPLETED", "VOIDED"].includes(row.reviewStatus)) return false;
			return new Date(row.deadline).getTime() < Date.now();
		}
		function stepActive(row) {
			if (row.reviewStatus === "COMPLETED") return 5;
			if (row.reviewStatus === "COMPLETE_PENDING") return 4;
			if (["PROCESSING", "COMPLETE_REJECTED"].includes(row.reviewStatus)) return 3;
			if (row.reviewStatus === "ACCEPT_PENDING" && row.handlerUserId) return 2;
			return 1;
		}
		function parseAttachments(value) {
			if (!value) return [];
			try {
				const list = JSON.parse(value);
				return Array.isArray(list) ? list.filter((item) => Number(item === null || item === void 0 ? void 0 : item.id) > 0) : [];
			} catch (_unused3) {
				return [];
			}
		}
		function nodeLabel(node) {
			return {
				CONTRACT: "合同审理",
				PAYMENT: "财务确认",
				ACCEPT: "办事接收",
				PROCESS: "办理中",
				COMPLETE: "办理验收"
			}[node || ""] || node || "—";
		}
		function businessLabel(value) {
			return {
				bookkeeping: "代理记账",
				registration: "公司注册",
				tax_planning: "税务筹划",
				qualification: "资质代办",
				audit: "审计",
				cancellation: "注销",
				order: "业务提单"
			}[value || ""] || value || "业务提单";
		}
		function materialsLabel(value) {
			if (Number(value) === 1) return "资料齐全，已接收";
			if (Number(value) === 0) return "资料不齐，已退回";
			return "待确认";
		}
		function actionLabel(action, result) {
			return {
				"assign:assigned": "已分配",
				"accept:accepted": "已接收",
				"reject:rejected": "已驳回",
				"submit:pending_confirm": "已提交结果",
				"confirm:completed": "验收通过",
				"approve:pass": "审核通过",
				"confirm:pass": "确认通过"
			}[`${action || ""}:${result || ""}`] || result || action || "状态更新";
		}
		function isPositiveRecord(result) {
			return [
				"pass",
				"accepted",
				"assigned",
				"pending_confirm",
				"completed"
			].includes(result || "");
		}
		function employeeLabel(item) {
			return [
				item.name,
				item.deptName,
				item.postName
			].filter(Boolean).join(" · ");
		}
		function money(value) {
			return Number(value || 0).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		}
		function dateTime(value) {
			if (!value) return "";
			return String(value).replace("T", " ").slice(0, 16);
		}
		function dateOnly(value) {
			return value ? String(value).slice(0, 10) : "";
		}
		function toIsoLocal(value) {
			return String(value).replace(" ", "T").slice(0, 19);
		}
		function fileSize(value) {
			const size = Number(value || 0);
			if (!size) return "";
			if (size < 1024) return `${size} B`;
			if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
			return `${(size / 1024 / 1024).toFixed(1)} MB`;
		}
		function uploadKey() {
			return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		}
		return (_ctx, _cache) => {
			var _detail$value4;
			const _component_el_button = ElButton;
			const _component_el_tooltip = ElTooltip;
			const _component_el_input = ElInput;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_step = ElStep;
			const _component_el_steps = ElSteps;
			const _component_el_icon = ElIcon;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_upload = ElUpload;
			const _component_el_radio = ElRadio;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[34] || (_cache[34] = createBaseVNode("div", null, [createBaseVNode("h1", null, "审单执行中心"), createBaseVNode("p", null, "财务确认、办事接收、结果提交与验收闭环")], -1)), createVNode(_component_el_tooltip, {
					content: "刷新审单数据",
					placement: "bottom"
				}, {
					default: withCtx(() => [createVNode(_component_el_button, {
						icon: unref(refresh_default),
						circle: "",
						loading: loading.value,
						"aria-label": "刷新审单数据",
						onClick: refreshAll
					}, null, 8, ["icon", "loading"])]),
					_: 1
				})]),
				createBaseVNode("nav", _hoisted_3, [(openBlock(true), createElementBlock(Fragment, null, renderList(statusFilters.value, (item) => {
					return openBlock(), createElementBlock("button", {
						key: item.key,
						type: "button",
						class: normalizeClass({ active: activeStatus.value === item.key }),
						onClick: ($event) => switchStatus(item.key)
					}, [createBaseVNode("span", null, toDisplayString(item.label), 1), createBaseVNode("b", null, toDisplayString(item.value), 1)], 10, _hoisted_4);
				}), 128))]),
				createBaseVNode("section", _hoisted_5, [
					createVNode(_component_el_input, {
						modelValue: keyword.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
						"prefix-icon": unref(search_default),
						clearable: "",
						placeholder: "审单编号、订单编号、客户或办事人员",
						onKeyup: withKeys(applySearch, ["enter"]),
						onClear: applySearch
					}, null, 8, ["modelValue", "prefix-icon"]),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(search_default),
						onClick: applySearch
					}, {
						default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createBaseVNode("span", _hoisted_6, "共 " + toDisplayString(page.total) + " 条", 1)
				]),
				createBaseVNode("section", _hoisted_7, [
					withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						class: "desktop-table",
						height: "100%",
						stripe: "",
						onRowDblclick: openDetail
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, { description: "当前范围暂无审单" })]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "审单 / 客户",
								"min-width": "220",
								fixed: "left"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("button", {
									type: "button",
									class: "primary-cell",
									onClick: ($event) => openDetail(row)
								}, [
									createBaseVNode("strong", null, toDisplayString(row.reviewNo || `审单 #${row.id}`), 1),
									createBaseVNode("span", null, toDisplayString(row.customerName || "未填写客户"), 1),
									createBaseVNode("small", null, toDisplayString(row.orderNo || "未关联订单号") + " · " + toDisplayString(businessLabel(row.businessType)), 1)
								], 8, _hoisted_8)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "金额",
								width: "116",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_9, [createBaseVNode("strong", null, "¥" + toDisplayString(money(row.receivableAmount)), 1), createBaseVNode("span", null, "到账 ¥" + toDisplayString(money(row.receivedAmount)), 1)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "销售",
								prop: "salesName",
								width: "90",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "办事人员",
								width: "110",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ muted: !row.handlerName }) }, toDisplayString(row.handlerName || "待分配"), 3)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "当前节点",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(nodeLabel(row.currentNode)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "105",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: statusMeta(row.reviewStatus).type,
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(displayStatus(row)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "截止时间",
								width: "150"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", { class: normalizeClass(["deadline", { overdue: isOverdue(row) }]) }, [createBaseVNode("span", null, toDisplayString(dateTime(row.deadline) || "未设置"), 1), isOverdue(row) ? (openBlock(), createElementBlock("small", _hoisted_10, "已逾期")) : createCommentVNode("", true)], 2)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "160",
								fixed: "right",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_11, [
									createVNode(_component_el_tooltip, { content: "查看详情" }, {
										default: withCtx(() => [createVNode(_component_el_button, {
											icon: unref(view_default),
											circle: "",
											size: "small",
											"aria-label": "查看详情",
											onClick: ($event) => openDetail(row)
										}, null, 8, ["icon", "onClick"])]),
										_: 2
									}, 1024),
									canContract(row) ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										link: "",
										type: "primary",
										onClick: ($event) => openNodeReview(row, "contract")
									}, {
										default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("合同审理", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									canPayment(row) ? (openBlock(), createBlock(_component_el_button, {
										key: 1,
										link: "",
										type: "success",
										onClick: ($event) => openNodeReview(row, "payment")
									}, {
										default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("到款确认", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									canAssign(row) ? (openBlock(), createBlock(_component_el_button, {
										key: 2,
										link: "",
										type: "primary",
										onClick: ($event) => openAssign(row)
									}, {
										default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("分配", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									canAccept(row) ? (openBlock(), createBlock(_component_el_button, {
										key: 3,
										link: "",
										type: "success",
										onClick: ($event) => openAccept(row)
									}, {
										default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("接收", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									canSubmit(row) ? (openBlock(), createBlock(_component_el_button, {
										key: 4,
										link: "",
										type: "warning",
										onClick: ($event) => openSubmit(row)
									}, {
										default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("提交结果", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									canConfirm(row) ? (openBlock(), createBlock(_component_el_button, {
										key: 5,
										link: "",
										type: "primary",
										onClick: ($event) => openConfirm(row)
									}, {
										default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("验收", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true)
								])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					withDirectives((openBlock(), createElementBlock("div", _hoisted_12, [(openBlock(true), createElementBlock(Fragment, null, renderList(rows.value, (row) => {
						return openBlock(), createElementBlock("article", {
							key: row.id,
							class: "mobile-row",
							onClick: ($event) => openDetail(row)
						}, [
							createBaseVNode("div", _hoisted_14, [createBaseVNode("strong", null, toDisplayString(row.customerName || row.reviewNo), 1), createVNode(_component_el_tag, {
								type: statusMeta(row.reviewStatus).type,
								size: "small",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(displayStatus(row)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							createBaseVNode("p", null, toDisplayString(row.reviewNo) + " · " + toDisplayString(row.orderNo || "未关联订单号"), 1),
							createBaseVNode("div", _hoisted_15, [
								createBaseVNode("span", null, "¥" + toDisplayString(money(row.receivableAmount)), 1),
								createBaseVNode("span", null, toDisplayString(row.handlerName || "待分配"), 1),
								createBaseVNode("span", { class: normalizeClass({ danger: isOverdue(row) }) }, toDisplayString(dateTime(row.deadline) || "未设截止"), 3)
							]),
							createBaseVNode("div", {
								class: "mobile-actions",
								onClick: _cache[1] || (_cache[1] = withModifiers(() => {}, ["stop"]))
							}, [
								canContract(row) ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									size: "small",
									type: "primary",
									onClick: ($event) => openNodeReview(row, "contract")
								}, {
									default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("合同审理", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								canPayment(row) ? (openBlock(), createBlock(_component_el_button, {
									key: 1,
									size: "small",
									type: "success",
									onClick: ($event) => openNodeReview(row, "payment")
								}, {
									default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("到款确认", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								canAssign(row) ? (openBlock(), createBlock(_component_el_button, {
									key: 2,
									size: "small",
									type: "primary",
									onClick: ($event) => openAssign(row)
								}, {
									default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("分配", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								canAccept(row) ? (openBlock(), createBlock(_component_el_button, {
									key: 3,
									size: "small",
									type: "success",
									onClick: ($event) => openAccept(row)
								}, {
									default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("接收", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								canSubmit(row) ? (openBlock(), createBlock(_component_el_button, {
									key: 4,
									size: "small",
									type: "warning",
									onClick: ($event) => openSubmit(row)
								}, {
									default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("提交结果", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								canConfirm(row) ? (openBlock(), createBlock(_component_el_button, {
									key: 5,
									size: "small",
									type: "primary",
									onClick: ($event) => openConfirm(row)
								}, {
									default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("验收", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true)
							])
						], 8, _hoisted_13);
					}), 128)), !loading.value && !rows.value.length ? (openBlock(), createBlock(_component_el_empty, {
						key: 0,
						description: "当前范围暂无审单"
					})) : createCommentVNode("", true)])), [[_directive_loading, loading.value]]),
					createBaseVNode("footer", _hoisted_16, [createVNode(_component_el_pagination, {
						"current-page": page.current,
						"onUpdate:currentPage": _cache[2] || (_cache[2] = ($event) => page.current = $event),
						"page-size": page.size,
						"onUpdate:pageSize": _cache[3] || (_cache[3] = ($event) => page.size = $event),
						"page-sizes": [
							10,
							20,
							50,
							100
						],
						total: page.total,
						layout: "total, sizes, prev, pager, next",
						background: "",
						onCurrentChange: loadList,
						onSizeChange: handlePageSize
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				((_detail$value4 = detail.value) === null || _detail$value4 === void 0 ? void 0 : _detail$value4.review) ? (openBlock(), createBlock(BusinessDetailDrawer_default, {
					key: 0,
					modelValue: detailVisible.value,
					"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => detailVisible.value = $event),
					title: detail.value.review.customerName || detail.value.review.reviewNo || "审单详情",
					subtitle: `${detail.value.review.reviewNo || ""} · ${detail.value.review.orderNo || "未关联订单号"}`,
					eyebrow: "审单执行闭环",
					avatar: "审",
					"avatar-class": statusMeta(detail.value.review.reviewStatus).avatar,
					"status-text": displayStatus(detail.value.review),
					"status-type": statusMeta(detail.value.review.reviewStatus).type,
					size: "720px"
				}, {
					actions: withCtx(() => [isOverdue(detail.value.review) ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						type: "danger",
						effect: "dark"
					}, {
						default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("已逾期", -1)])]),
						_: 1
					})) : createCommentVNode("", true)]),
					meta: withCtx(() => [createBaseVNode("div", _hoisted_17, [
						createBaseVNode("div", _hoisted_18, [_cache[49] || (_cache[49] = createBaseVNode("span", null, "当前节点", -1)), createBaseVNode("b", null, toDisplayString(nodeLabel(detail.value.review.currentNode)), 1)]),
						createBaseVNode("div", _hoisted_19, [_cache[50] || (_cache[50] = createBaseVNode("span", null, "业务类型", -1)), createBaseVNode("b", null, toDisplayString(businessLabel(detail.value.review.businessType)), 1)]),
						createBaseVNode("div", _hoisted_20, [_cache[51] || (_cache[51] = createBaseVNode("span", null, "销售", -1)), createBaseVNode("b", null, toDisplayString(detail.value.review.salesName || "—"), 1)]),
						createBaseVNode("div", _hoisted_21, [_cache[52] || (_cache[52] = createBaseVNode("span", null, "办事人员", -1)), createBaseVNode("b", null, toDisplayString(detail.value.review.handlerName || "待分配"), 1)]),
						createBaseVNode("div", _hoisted_22, [_cache[53] || (_cache[53] = createBaseVNode("span", null, "应收金额", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money(detail.value.review.receivableAmount)), 1)]),
						createBaseVNode("div", _hoisted_23, [_cache[54] || (_cache[54] = createBaseVNode("span", null, "已确认到账", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money(detail.value.review.receivedAmount)), 1)]),
						createBaseVNode("div", _hoisted_24, [_cache[55] || (_cache[55] = createBaseVNode("span", null, "提交时间", -1)), createBaseVNode("b", null, toDisplayString(dateTime(detail.value.review.submittedAt) || "—"), 1)]),
						createBaseVNode("div", _hoisted_25, [_cache[56] || (_cache[56] = createBaseVNode("span", null, "办理截止", -1)), createBaseVNode("b", { class: normalizeClass({ danger: isOverdue(detail.value.review) }) }, toDisplayString(dateTime(detail.value.review.deadline) || "未设置"), 3)]),
						detail.value.review.remark ? (openBlock(), createElementBlock("div", _hoisted_26, [_cache[57] || (_cache[57] = createBaseVNode("span", null, "提单备注", -1)), createBaseVNode("b", null, toDisplayString(detail.value.review.remark), 1)])) : createCommentVNode("", true)
					])]),
					timeline: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(detail.value.records || [], (record) => {
						return openBlock(), createElementBlock("div", {
							key: record.id,
							class: "bd-timeline-item"
						}, [createBaseVNode("i", { class: normalizeClass(["bd-timeline-dot", { success: isPositiveRecord(record.result) }]) }, null, 2), createBaseVNode("div", null, [
							createBaseVNode("strong", null, toDisplayString(record.nodeName || nodeLabel(record.nodeCode)) + " · " + toDisplayString(actionLabel(record.action, record.result)), 1),
							createBaseVNode("p", null, toDisplayString(record.operatorName || "系统") + " · " + toDisplayString(dateTime(record.operatedAt) || "—"), 1),
							record.opinion ? (openBlock(), createElementBlock("p", _hoisted_40, toDisplayString(record.opinion), 1)) : createCommentVNode("", true)
						])]);
					}), 128))]),
					footer: withCtx(() => [
						createVNode(_component_el_button, { onClick: _cache[4] || (_cache[4] = ($event) => detailVisible.value = false) }, {
							default: withCtx(() => [..._cache[74] || (_cache[74] = [createTextVNode("关闭", -1)])]),
							_: 1
						}),
						canContract(detail.value.review) ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							type: "primary",
							onClick: _cache[5] || (_cache[5] = ($event) => openNodeReview(detail.value.review, "contract"))
						}, {
							default: withCtx(() => [..._cache[75] || (_cache[75] = [createTextVNode("合同审理", -1)])]),
							_: 1
						})) : createCommentVNode("", true),
						canPayment(detail.value.review) ? (openBlock(), createBlock(_component_el_button, {
							key: 1,
							type: "success",
							onClick: _cache[6] || (_cache[6] = ($event) => openNodeReview(detail.value.review, "payment"))
						}, {
							default: withCtx(() => [..._cache[76] || (_cache[76] = [createTextVNode("到款确认", -1)])]),
							_: 1
						})) : createCommentVNode("", true),
						canAssign(detail.value.review) ? (openBlock(), createBlock(_component_el_button, {
							key: 2,
							type: "primary",
							onClick: _cache[7] || (_cache[7] = ($event) => openAssign(detail.value.review))
						}, {
							default: withCtx(() => [..._cache[77] || (_cache[77] = [createTextVNode("分配办事人员", -1)])]),
							_: 1
						})) : createCommentVNode("", true),
						canAccept(detail.value.review) ? (openBlock(), createBlock(_component_el_button, {
							key: 3,
							type: "success",
							onClick: _cache[8] || (_cache[8] = ($event) => openAccept(detail.value.review))
						}, {
							default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("接收 / 退回", -1)])]),
							_: 1
						})) : createCommentVNode("", true),
						canSubmit(detail.value.review) ? (openBlock(), createBlock(_component_el_button, {
							key: 4,
							type: "warning",
							onClick: _cache[9] || (_cache[9] = ($event) => openSubmit(detail.value.review))
						}, {
							default: withCtx(() => [..._cache[79] || (_cache[79] = [createTextVNode("提交办理结果", -1)])]),
							_: 1
						})) : createCommentVNode("", true),
						canConfirm(detail.value.review) ? (openBlock(), createBlock(_component_el_button, {
							key: 5,
							type: "primary",
							onClick: _cache[10] || (_cache[10] = ($event) => openConfirm(detail.value.review))
						}, {
							default: withCtx(() => [..._cache[80] || (_cache[80] = [createTextVNode("验收办理结果", -1)])]),
							_: 1
						})) : createCommentVNode("", true)
					]),
					default: withCtx(() => {
						var _detail$value$contrac, _detail$value$contrac2, _detail$value$payment, _detail$value$payment2, _detail$value$accept, _detail$value$accept2, _detail$value$accept3, _detail$value$accept4, _detail$value$accept5, _detail$value$complet, _detail$value$complet2, _detail$value$complet3, _detail$value$complet4;
						return [
							createBaseVNode("div", _hoisted_27, [createVNode(_component_el_steps, {
								active: stepActive(detail.value.review),
								"finish-status": "success",
								simple: ""
							}, {
								default: withCtx(() => [
									createVNode(_component_el_step, { title: "财务已确认" }),
									createVNode(_component_el_step, { title: "办事接收" }),
									createVNode(_component_el_step, { title: "办理中" }),
									createVNode(_component_el_step, { title: "待验收" }),
									createVNode(_component_el_step, { title: "已完成" })
								]),
								_: 1
							}, 8, ["active"])]),
							createBaseVNode("section", _hoisted_28, [_cache[62] || (_cache[62] = createBaseVNode("h3", null, "前置核验", -1)), createBaseVNode("div", _hoisted_29, [
								createBaseVNode("div", null, [_cache[58] || (_cache[58] = createBaseVNode("span", null, "合同审理", -1)), createBaseVNode("b", null, toDisplayString(((_detail$value$contrac = detail.value.contract) === null || _detail$value$contrac === void 0 ? void 0 : _detail$value$contrac.reviewResult) === "pass" ? "已通过" : "—"), 1)]),
								createBaseVNode("div", null, [_cache[59] || (_cache[59] = createBaseVNode("span", null, "合同金额", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money((_detail$value$contrac2 = detail.value.contract) === null || _detail$value$contrac2 === void 0 ? void 0 : _detail$value$contrac2.contractAmount)), 1)]),
								createBaseVNode("div", null, [_cache[60] || (_cache[60] = createBaseVNode("span", null, "财务确认人", -1)), createBaseVNode("b", null, toDisplayString(((_detail$value$payment = detail.value.payment) === null || _detail$value$payment === void 0 ? void 0 : _detail$value$payment.confirmerName) || "—"), 1)]),
								createBaseVNode("div", null, [_cache[61] || (_cache[61] = createBaseVNode("span", null, "到账日期", -1)), createBaseVNode("b", null, toDisplayString(dateOnly((_detail$value$payment2 = detail.value.payment) === null || _detail$value$payment2 === void 0 ? void 0 : _detail$value$payment2.receivedDate) || "—"), 1)])
							])]),
							createBaseVNode("section", _hoisted_30, [_cache[68] || (_cache[68] = createBaseVNode("h3", null, "办事接收", -1)), createBaseVNode("div", _hoisted_31, [
								createBaseVNode("div", null, [_cache[63] || (_cache[63] = createBaseVNode("span", null, "办事人员", -1)), createBaseVNode("b", null, toDisplayString(((_detail$value$accept = detail.value.accept) === null || _detail$value$accept === void 0 ? void 0 : _detail$value$accept.handlerName) || detail.value.review.handlerName || "待分配"), 1)]),
								createBaseVNode("div", null, [_cache[64] || (_cache[64] = createBaseVNode("span", null, "资料状态", -1)), createBaseVNode("b", null, toDisplayString(materialsLabel((_detail$value$accept2 = detail.value.accept) === null || _detail$value$accept2 === void 0 ? void 0 : _detail$value$accept2.materialsReady)), 1)]),
								createBaseVNode("div", null, [_cache[65] || (_cache[65] = createBaseVNode("span", null, "接收时间", -1)), createBaseVNode("b", null, toDisplayString(dateTime((_detail$value$accept3 = detail.value.accept) === null || _detail$value$accept3 === void 0 ? void 0 : _detail$value$accept3.acceptTime) || "—"), 1)]),
								createBaseVNode("div", null, [_cache[66] || (_cache[66] = createBaseVNode("span", null, "预计完成", -1)), createBaseVNode("b", null, toDisplayString(dateTime((_detail$value$accept4 = detail.value.accept) === null || _detail$value$accept4 === void 0 ? void 0 : _detail$value$accept4.expectedCompleteTime) || "—"), 1)]),
								((_detail$value$accept5 = detail.value.accept) === null || _detail$value$accept5 === void 0 ? void 0 : _detail$value$accept5.acceptRemark) ? (openBlock(), createElementBlock("div", _hoisted_32, [_cache[67] || (_cache[67] = createBaseVNode("span", null, "接收意见", -1)), createBaseVNode("b", null, toDisplayString(detail.value.accept.acceptRemark), 1)])) : createCommentVNode("", true)
							])]),
							createBaseVNode("section", _hoisted_33, [
								_cache[73] || (_cache[73] = createBaseVNode("h3", null, "办理结果", -1)),
								createBaseVNode("div", _hoisted_34, [
									createBaseVNode("div", null, [_cache[69] || (_cache[69] = createBaseVNode("span", null, "提交人", -1)), createBaseVNode("b", null, toDisplayString(((_detail$value$complet = detail.value.complete) === null || _detail$value$complet === void 0 ? void 0 : _detail$value$complet.submitterName) || "—"), 1)]),
									createBaseVNode("div", null, [_cache[70] || (_cache[70] = createBaseVNode("span", null, "提交时间", -1)), createBaseVNode("b", null, toDisplayString(dateTime((_detail$value$complet2 = detail.value.complete) === null || _detail$value$complet2 === void 0 ? void 0 : _detail$value$complet2.completeTime) || "—"), 1)]),
									((_detail$value$complet3 = detail.value.complete) === null || _detail$value$complet3 === void 0 ? void 0 : _detail$value$complet3.resultDesc) ? (openBlock(), createElementBlock("div", _hoisted_35, [_cache[71] || (_cache[71] = createBaseVNode("span", null, "结果说明", -1)), createBaseVNode("b", null, toDisplayString(detail.value.complete.resultDesc), 1)])) : createCommentVNode("", true),
									((_detail$value$complet4 = detail.value.complete) === null || _detail$value$complet4 === void 0 ? void 0 : _detail$value$complet4.completeRemark) ? (openBlock(), createElementBlock("div", _hoisted_36, [_cache[72] || (_cache[72] = createBaseVNode("span", null, "最新验收意见", -1)), createBaseVNode("b", null, toDisplayString(detail.value.complete.completeRemark), 1)])) : createCommentVNode("", true)
								]),
								detailAttachments.value.length ? (openBlock(), createElementBlock("div", _hoisted_37, [(openBlock(true), createElementBlock(Fragment, null, renderList(detailAttachments.value, (file) => {
									return openBlock(), createElementBlock("button", {
										key: file.id,
										type: "button",
										onClick: ($event) => downloadReviewAttachment(file)
									}, [
										createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(paperclip_default))]),
											_: 1
										}),
										createBaseVNode("span", null, toDisplayString(file.name), 1),
										createBaseVNode("small", null, toDisplayString(fileSize(file.size)), 1),
										createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(download_default))]),
											_: 1
										})
									], 8, _hoisted_38);
								}), 128))])) : (openBlock(), createElementBlock("p", _hoisted_39, "尚未提交办理凭证"))
							])
						];
					}),
					_: 1
				}, 8, [
					"modelValue",
					"title",
					"subtitle",
					"avatar-class",
					"status-text",
					"status-type"
				])) : createCommentVNode("", true),
				createVNode(_component_el_dialog, {
					modelValue: assignDialog.visible,
					"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => assignDialog.visible = $event),
					title: "分配办事人员",
					width: "min(520px, 92vw)",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[15] || (_cache[15] = ($event) => assignDialog.visible = false) }, {
						default: withCtx(() => [..._cache[81] || (_cache[81] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: assignDialog.loading,
						onClick: submitAssign
					}, {
						default: withCtx(() => [..._cache[82] || (_cache[82] = [createTextVNode("确认分配", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "办事人员",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: assignDialog.handlerUserId,
									"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => assignDialog.handlerUserId = $event),
									filterable: "",
									placeholder: "按姓名、部门或岗位查找",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(employeeOptions.value, (item) => {
										return openBlock(), createBlock(_component_el_option, {
											key: item.userId,
											label: employeeLabel(item),
											value: item.userId
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "办理截止时间",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: assignDialog.deadline,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => assignDialog.deadline = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DD HH:mm:ss",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "分配要求" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: assignDialog.remark,
									"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => assignDialog.remark = $event),
									type: "textarea",
									rows: 3,
									maxlength: "500",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: acceptDialog.visible,
					"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => acceptDialog.visible = $event),
					title: "办事接收确认",
					width: "min(520px, 92vw)",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[20] || (_cache[20] = ($event) => acceptDialog.visible = false) }, {
						default: withCtx(() => [..._cache[85] || (_cache[85] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: acceptDialog.materialsReady ? "success" : "danger",
						loading: acceptDialog.loading,
						onClick: submitAccept
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(acceptDialog.materialsReady ? "确认接收" : "确认退回"), 1)]),
						_: 1
					}, 8, ["type", "loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "资料是否齐全",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: acceptDialog.materialsReady,
									"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => acceptDialog.materialsReady = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio_button, { value: true }, {
										default: withCtx(() => [..._cache[83] || (_cache[83] = [createTextVNode("资料齐全，接收办理", -1)])]),
										_: 1
									}), createVNode(_component_el_radio_button, { value: false }, {
										default: withCtx(() => [..._cache[84] || (_cache[84] = [createTextVNode("资料不齐，退回", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							acceptDialog.materialsReady ? (openBlock(), createBlock(_component_el_form_item, {
								key: 0,
								label: "预计完成时间",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: acceptDialog.expectedCompleteTime,
									"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => acceptDialog.expectedCompleteTime = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DD HH:mm:ss",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_form_item, {
								label: acceptDialog.materialsReady ? "接收备注" : "退回原因",
								required: !acceptDialog.materialsReady
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: acceptDialog.remark,
									"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => acceptDialog.remark = $event),
									type: "textarea",
									rows: 3,
									maxlength: "500",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label", "required"])
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: submitDialog.visible,
					"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => submitDialog.visible = $event),
					title: "提交办理结果",
					width: "min(620px, 92vw)",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[24] || (_cache[24] = ($event) => submitDialog.visible = false) }, {
						default: withCtx(() => [..._cache[88] || (_cache[88] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitDialog.loading,
						disabled: hasUploading.value,
						onClick: submitResult
					}, {
						default: withCtx(() => [..._cache[89] || (_cache[89] = [createTextVNode("提交待验收", -1)])]),
						_: 1
					}, 8, ["loading", "disabled"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "办理结果",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: submitDialog.resultDesc,
									"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => submitDialog.resultDesc = $event),
									type: "textarea",
									rows: 4,
									maxlength: "1000",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "办理凭证",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_upload, {
									drag: "",
									multiple: "",
									"show-file-list": false,
									"http-request": uploadProof,
									"before-upload": validateProof,
									accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx",
									class: "proof-upload"
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(upload_filled_default))]),
										_: 1
									}), _cache[86] || (_cache[86] = createBaseVNode("div", { class: "el-upload__text" }, "上传办理凭证", -1))]),
									_: 1
								}), submitDialog.uploads.length ? (openBlock(), createElementBlock("div", _hoisted_41, [(openBlock(true), createElementBlock(Fragment, null, renderList(submitDialog.uploads, (item) => {
									return openBlock(), createElementBlock("div", {
										key: item.key,
										class: "upload-row"
									}, [
										item.status === "uploading" ? (openBlock(), createBlock(_component_el_icon, {
											key: 0,
											class: "is-loading"
										}, {
											default: withCtx(() => [createVNode(unref(loading_default))]),
											_: 1
										})) : item.status === "error" ? (openBlock(), createBlock(_component_el_icon, {
											key: 1,
											class: "upload-error"
										}, {
											default: withCtx(() => [createVNode(unref(warning_filled_default))]),
											_: 1
										})) : (openBlock(), createBlock(_component_el_icon, { key: 2 }, {
											default: withCtx(() => [createVNode(unref(document_default))]),
											_: 1
										})),
										createBaseVNode("span", null, toDisplayString(item.name), 1),
										createBaseVNode("small", null, toDisplayString(item.status === "uploading" ? "上传中" : item.status === "error" ? "上传失败" : fileSize(item.size)), 1),
										item.status === "error" ? (openBlock(), createBlock(_component_el_button, {
											key: 3,
											link: "",
											type: "primary",
											onClick: ($event) => retryUpload(item)
										}, {
											default: withCtx(() => [..._cache[87] || (_cache[87] = [createTextVNode("重试", -1)])]),
											_: 1
										}, 8, ["onClick"])) : createCommentVNode("", true),
										createVNode(_component_el_button, {
											link: "",
											type: "danger",
											icon: unref(delete_default),
											"aria-label": "移除凭证",
											onClick: ($event) => removeUpload(item.key)
										}, null, 8, ["icon", "onClick"])
									]);
								}), 128))])) : createCommentVNode("", true)]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "补充说明" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: submitDialog.remark,
									"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => submitDialog.remark = $event),
									type: "textarea",
									rows: 2,
									maxlength: "500",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: nodeDialog.visible,
					"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => nodeDialog.visible = $event),
					title: nodeDialog.node === "contract" ? "合同审理(部门主管)" : "到款确认(财务)",
					width: "min(520px, 92vw)",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[28] || (_cache[28] = ($event) => nodeDialog.visible = false) }, {
						default: withCtx(() => [..._cache[91] || (_cache[91] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: nodeDialog.pass ? "success" : "danger",
						loading: nodeDialog.loading,
						onClick: submitNodeReview
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(nodeDialog.pass ? "确认通过" : "确认驳回"), 1)]),
						_: 1
					}, 8, ["type", "loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-width": "96px" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, { label: nodeDialog.node === "contract" ? "审理结论" : "确认结论" }, {
							default: withCtx(() => [createVNode(_component_el_radio_group, {
								modelValue: nodeDialog.pass,
								"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => nodeDialog.pass = $event)
							}, {
								default: withCtx(() => [createVNode(_component_el_radio, { value: true }, {
									default: withCtx(() => [createTextVNode(toDisplayString(nodeDialog.node === "contract" ? "通过,转财务确认到款" : "到款无误,转办事分配"), 1)]),
									_: 1
								}), createVNode(_component_el_radio, { value: false }, {
									default: withCtx(() => [..._cache[90] || (_cache[90] = [createTextVNode("驳回(提单退回可修改)", -1)])]),
									_: 1
								})]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}, 8, ["label"]), createVNode(_component_el_form_item, {
							label: nodeDialog.pass ? "意见" : "驳回原因",
							required: !nodeDialog.pass
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: nodeDialog.opinion,
								"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => nodeDialog.opinion = $event),
								type: "textarea",
								rows: 4,
								maxlength: "500",
								"show-word-limit": "",
								placeholder: nodeDialog.pass ? "选填" : "必填,提单人会看到"
							}, null, 8, ["modelValue", "placeholder"])]),
							_: 1
						}, 8, ["label", "required"])]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: confirmDialog.visible,
					"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => confirmDialog.visible = $event),
					title: "验收办理结果",
					width: "min(520px, 92vw)",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[32] || (_cache[32] = ($event) => confirmDialog.visible = false) }, {
						default: withCtx(() => [..._cache[94] || (_cache[94] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: confirmDialog.pass ? "success" : "danger",
						loading: confirmDialog.loading,
						onClick: submitConfirm
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(confirmDialog.pass ? "确认完成" : "确认驳回"), 1)]),
						_: 1
					}, 8, ["type", "loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "验收结论",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_radio_group, {
								modelValue: confirmDialog.pass,
								"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => confirmDialog.pass = $event)
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_button, { value: true }, {
									default: withCtx(() => [..._cache[92] || (_cache[92] = [createTextVNode("验收通过", -1)])]),
									_: 1
								}), createVNode(_component_el_radio_button, { value: false }, {
									default: withCtx(() => [..._cache[93] || (_cache[93] = [createTextVNode("驳回重办", -1)])]),
									_: 1
								})]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, {
							label: confirmDialog.pass ? "验收意见" : "驳回原因",
							required: !confirmDialog.pass
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: confirmDialog.opinion,
								"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => confirmDialog.opinion = $event),
								type: "textarea",
								rows: 4,
								maxlength: "500",
								"show-word-limit": ""
							}, null, 8, ["modelValue"])]),
							_: 1
						}, 8, ["label", "required"])]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-07d322d5"]]);
//#endregion
export { review_center_default as default };
