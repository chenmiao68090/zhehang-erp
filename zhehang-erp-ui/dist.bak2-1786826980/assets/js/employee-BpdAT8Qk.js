import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, h as _objectWithoutProperties, it as createTextVNode, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, $t as download_default, An as phone_default, D as ElPagination, Dr as withModifiers, Er as withKeys, J as ElCol, Nn as plus_default, Q as ElRadioGroup, Qt as document_default, V as ElDialog, W as ElDatePicker, Xt as delete_default, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, cn as folder_default, fr as user_default, g as ElTable, gt as ElForm, hn as lock_default, it as ElTag, kn as paperclip_default, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, pr as user_filled_default, rt as ElSelect, s as vLoading, tr as suitcase_default, tt as ElCard, u as ElTreeSelect, ur as upload_default, v as ElSwitch, vt as ElAlert, yt as ElIcon, zn as reading_default } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { a as userApi } from "./system-CuP08T_i.js";
import { n as employeeApi, r as postApi, t as deptApi } from "./org-DaVetSL-.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { u as resignHandoverApi } from "./hrm-x4tssCAy.js";
import { n as downloadFileById } from "./download-DmWzpvAG.js";
import { t as BusinessDetailDrawer_default } from "./BusinessDetailDrawer-t9PlYR5q.js";
//#region src/views/org/employee.vue?vue&type=script&setup=true&lang.ts
var _excluded = ["deptName", "postName"];
var _hoisted_1 = { class: "page-container" };
var _hoisted_2 = { class: "search-bar" };
var _hoisted_3 = { class: "search-actions" };
var _hoisted_4 = { class: "employee-account-cell" };
var _hoisted_5 = {
	key: 1,
	class: "role-position-text"
};
var _hoisted_6 = { class: "role-position-text" };
var _hoisted_7 = { class: "pagination-wrap" };
var _hoisted_8 = { class: "emp-hd" };
var _hoisted_9 = ["src"];
var _hoisted_10 = {
	key: 1,
	class: "emp-hd-avatar"
};
var _hoisted_11 = { class: "emp-hd-main" };
var _hoisted_12 = { class: "emp-hd-name" };
var _hoisted_13 = { class: "emp-hd-sub" };
var _hoisted_14 = { class: "emp-shell" };
var _hoisted_15 = { class: "emp-rail" };
var _hoisted_16 = ["onClick"];
var _hoisted_17 = { class: "emp-sth" };
var _hoisted_18 = { class: "emp-ic ic-blue" };
var _hoisted_19 = { class: "avatar-uploader" };
var _hoisted_20 = ["src"];
var _hoisted_21 = {
	key: 1,
	class: "avatar-empty"
};
var _hoisted_22 = { class: "avatar-tip" };
var _hoisted_23 = {
	key: 1,
	class: "avatar-hint"
};
var _hoisted_24 = { class: "emp-sth" };
var _hoisted_25 = { class: "emp-ic ic-green" };
var _hoisted_26 = { key: 1 };
var _hoisted_27 = { class: "field-tip" };
var _hoisted_28 = { class: "emp-sth" };
var _hoisted_29 = { class: "emp-ic ic-coral" };
var _hoisted_30 = { class: "emp-sth" };
var _hoisted_31 = { class: "emp-ic ic-purple" };
var _hoisted_32 = { class: "emp-sth" };
var _hoisted_33 = { class: "emp-ic ic-gray" };
var _hoisted_34 = { class: "profile-file-grid" };
var _hoisted_35 = { class: "profile-file-main" };
var _hoisted_36 = { class: "profile-file-actions" };
var _hoisted_37 = { class: "emp-sth" };
var _hoisted_38 = { class: "emp-ic ic-gray" };
var _hoisted_39 = { class: "profile-file-grid" };
var _hoisted_40 = { class: "profile-file-main" };
var _hoisted_41 = { key: 0 };
var _hoisted_42 = ["onClick"];
var _hoisted_43 = { key: 1 };
var _hoisted_44 = { class: "profile-file-actions" };
var _hoisted_45 = { class: "emp-sth" };
var _hoisted_46 = { class: "emp-ic ic-pink" };
var _hoisted_47 = { class: "emp-sth" };
var _hoisted_48 = { class: "emp-ic ic-blue" };
var _hoisted_49 = { class: "emp-perm" };
var _hoisted_50 = { class: "employee-role-readonly" };
var _hoisted_51 = {
	key: 0,
	class: "role-position-text"
};
var _hoisted_52 = {
	key: 0,
	class: "account-hint"
};
var _hoisted_53 = {
	key: 1,
	class: "account-hint"
};
var _hoisted_54 = {
	key: 0,
	class: "resign-employee-card"
};
var _hoisted_55 = { class: "resign-avatar" };
var _hoisted_56 = { class: "employee-import-layout" };
var _hoisted_57 = { class: "employee-import-main" };
var _hoisted_58 = { class: "employee-import-actions" };
var _hoisted_59 = { class: "employee-import-side" };
var _hoisted_60 = { class: "import-match-cell" };
var _hoisted_61 = { class: "credential-code" };
var _hoisted_62 = { class: "bd-kv-grid" };
var _hoisted_63 = { class: "bd-kv" };
var _hoisted_64 = { class: "bd-kv" };
var _hoisted_65 = { class: "bd-kv" };
var _hoisted_66 = { class: "bd-kv" };
var _hoisted_67 = { class: "bd-kv wide" };
var _hoisted_68 = { class: "employee-info-grid" };
var _hoisted_69 = { class: "wide" };
var _hoisted_70 = { class: "wide" };
var _hoisted_71 = { class: "employee-info-grid" };
var _hoisted_72 = { class: "wide" };
var _hoisted_73 = { class: "employee-attachment-list" };
var _hoisted_74 = { key: 1 };
var _hoisted_75 = { class: "employee-attachment-list" };
var _hoisted_76 = ["onClick"];
var _hoisted_77 = { key: 1 };
var _hoisted_78 = { class: "employee-info-grid compact" };
var _hoisted_79 = { class: "wide" };
var _hoisted_80 = { class: "employee-info-grid compact" };
var _hoisted_81 = { class: "bd-timeline-item" };
var _hoisted_82 = { class: "bd-timeline-item" };
var _hoisted_83 = { class: "bd-timeline-item" };
//#endregion
//#region src/views/org/employee.vue
var employee_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "employee",
	setup(__props) {
		const { t } = useI18n();
		const router = useRouter();
		const userStore = useUserStore();
		const formRef = ref();
		const loading = ref(false);
		const tableData = ref([]);
		const total = ref(0);
		const resignedCount = ref(null);
		const contractAlert = ref({
			expiring: 0,
			expired: 0
		});
		const dialogVisible = ref(false);
		const dialogTitle = ref("");
		const isEdit = ref(false);
		const resignDialog = reactive({
			visible: false,
			saving: false,
			confirmed: false
		});
		const empSections = computed(() => {
			const list = [
				{
					key: "basic",
					label: t("org.tabBasic"),
					icon: user_default
				},
				{
					key: "position",
					label: t("org.tabPosition"),
					icon: suitcase_default
				},
				{
					key: "contract",
					label: t("org.tabContract"),
					icon: document_default
				},
				{
					key: "education",
					label: t("org.tabEducation"),
					icon: reading_default
				},
				{
					key: "files",
					label: "档案附件",
					icon: paperclip_default
				},
				{
					key: "hrdocs",
					label: "人事附件",
					icon: folder_default
				},
				{
					key: "emergency",
					label: t("org.tabEmergency"),
					icon: phone_default
				}
			];
			if (canManageAccountSecurity.value) list.push({
				key: "account",
				label: "登录与权限",
				icon: lock_default
			});
			return list;
		});
		const empCntRef = ref();
		const empActiveSect = ref("basic");
		const empSectEls = {};
		function setSectRef(key, el) {
			empSectEls[key] = el || null;
		}
		function scrollToSect(key) {
			empActiveSect.value = key;
			const el = empSectEls[key];
			const cnt = empCntRef.value;
			if (el && cnt) cnt.scrollTo({
				top: Math.max(0, el.offsetTop - 12),
				behavior: "smooth"
			});
		}
		function onEmpCntScroll() {
			var _empSections$value$;
			const cnt = empCntRef.value;
			if (!cnt) return;
			const top = cnt.scrollTop + 48;
			let current = ((_empSections$value$ = empSections.value[0]) === null || _empSections$value$ === void 0 ? void 0 : _empSections$value$.key) || "basic";
			for (const s of empSections.value) {
				const el = empSectEls[s.key];
				if (el && el.offsetTop <= top) current = s.key;
			}
			empActiveSect.value = current;
		}
		const empStatusMeta = computed(() => {
			return {
				0: {
					label: "待入职",
					cls: "is-gray"
				},
				1: {
					label: t("org.empStatusActive"),
					cls: "is-green"
				},
				2: {
					label: t("org.empStatusTrial"),
					cls: "is-amber"
				},
				3: {
					label: t("org.empStatusLeft"),
					cls: "is-gray"
				}
			}[Number(formData.value.status)] || {
				label: "待入职",
				cls: "is-gray"
			};
		});
		const activeTab = ref("basic");
		const drawerVisible = ref(false);
		const detailData = ref(null);
		const detailTargetEmployeeId = ref();
		let employeeDetailRequestId = 0;
		const deptTree = ref([]);
		const postList = ref([]);
		const importDialog = reactive({ visible: false });
		const credentialDialog = reactive({ visible: false });
		const initialCredentials = ref([]);
		const credentialFromResponse = (response) => {
			const data = response === null || response === void 0 ? void 0 : response.data;
			if (!(data === null || data === void 0 ? void 0 : data.username) || !(data === null || data === void 0 ? void 0 : data.initialPassword)) return null;
			return {
				username: String(data.username),
				initialPassword: String(data.initialPassword),
				mustChangePassword: data.mustChangePassword !== false
			};
		};
		const showInitialCredentials = (items) => {
			if (!items.length) return;
			initialCredentials.value = items;
			credentialDialog.visible = true;
		};
		const clearInitialCredentials = () => {
			initialCredentials.value = [];
		};
		const copyText = function() {
			var _ref = _asyncToGenerator(function* (value) {
				yield navigator.clipboard.writeText(value);
				ElMessage.success("已复制，请通过可信渠道发送");
			});
			return function copyText(_x) {
				return _ref.apply(this, arguments);
			};
		}();
		const copyCredential = (row) => copyText(`登录账号：${row.username}\n一次性初始口令：${row.initialPassword}\n首次登录必须修改密码。`);
		const copyAllCredentials = () => copyText(initialCredentials.value.map((row) => `${row.username}\t${row.initialPassword}`).join("\n"));
		const importText = ref("");
		const importPreviewRows = ref([]);
		const importingEmployees = ref(false);
		const managerEmployees = ref([]);
		const uploadingAttachmentKey = ref("");
		const uploadingHrDocType = ref("");
		const hrDocDefs = [
			{ type: "离职证明" },
			{ type: "劳动合同" },
			{ type: "竞业协议" },
			{ type: "保密协议" },
			{ type: "会计补充协议" }
		];
		const fileDownloadUrl = (fileId) => {
			if (!fileId) return "";
			return `/api/file/info/download/${fileId}`;
		};
		const hrDocsList = computed(() => {
			try {
				const arr = JSON.parse(formData.value.hrDocs || "[]");
				return Array.isArray(arr) ? arr : [];
			} catch (_unused) {
				return [];
			}
		});
		const hrDocOf = (type) => hrDocsList.value.find((d) => d.type === type);
		const writeHrDocs = (docs) => {
			formData.value.hrDocs = JSON.stringify(docs);
		};
		const handleHrDocUpload = function() {
			var _ref3 = _asyncToGenerator(function* (type, file) {
				if (!file) return;
				if (file.size > 30 * 1024 * 1024) {
					ElMessage.warning("单个人事附件不能超过 30MB");
					return;
				}
				uploadingHrDocType.value = type;
				try {
					var _ref2, _res$data;
					const res = yield fileInfoApi.upload(file);
					const data = (_ref2 = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) !== null && _ref2 !== void 0 ? _ref2 : {};
					const fileId = data.id;
					const name = data.originalName || data.name || file.name;
					const url = data.url || fileDownloadUrl(fileId);
					const docs = hrDocsList.value.filter((d) => d.type !== type);
					docs.push({
						type,
						fileId,
						name,
						url
					});
					writeHrDocs(docs);
					ElMessage.success(`${type}已上传`);
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || `${type}上传失败`);
				} finally {
					uploadingHrDocType.value = "";
				}
			});
			return function handleHrDocUpload(_x2, _x3) {
				return _ref3.apply(this, arguments);
			};
		}();
		const removeHrDoc = function() {
			var _ref4 = _asyncToGenerator(function* (type) {
				try {
					yield ElMessageBox.confirm("确定移除此人事附件吗?", "", { type: "warning" });
				} catch (_unused2) {
					return;
				}
				writeHrDocs(hrDocsList.value.filter((d) => d.type !== type));
			});
			return function removeHrDoc(_x4) {
				return _ref4.apply(this, arguments);
			};
		}();
		const detailHrDocOf = (type) => {
			try {
				var _detailData$value;
				const arr = JSON.parse(((_detailData$value = detailData.value) === null || _detailData$value === void 0 ? void 0 : _detailData$value.hrDocs) || "[]");
				return Array.isArray(arr) ? arr.find((d) => d.type === type) : void 0;
			} catch (_unused3) {
				return;
			}
		};
		const canEditEmpCode = computed(() => {
			const roles = userStore.roles || [];
			return roles.includes("admin") || roles.includes("super_admin");
		});
		const canManageAccountSecurity = computed(() => {
			var _userStore$userInfo;
			const roles = userStore.roles || [];
			return Number(((_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.id) || 0) === 1 || roles.includes("super_admin") || roles.includes("admin");
		});
		const defaultDeptTree = [
			{
				id: 1,
				deptName: "管理层",
				children: []
			},
			{
				id: 2,
				deptName: "财务部",
				children: []
			},
			{
				id: 3,
				deptName: "销售部",
				children: []
			},
			{
				id: 4,
				deptName: "客服部",
				children: []
			},
			{
				id: 5,
				deptName: "技术部",
				children: []
			},
			{
				id: 6,
				deptName: "人事部",
				children: []
			}
		];
		const defaultPostList = [
			{
				id: 1,
				postName: "总经理"
			},
			{
				id: 2,
				postName: "财务总监"
			},
			{
				id: 3,
				postName: "技术总监"
			},
			{
				id: 4,
				postName: "销售总监"
			},
			{
				id: 5,
				postName: "会计"
			},
			{
				id: 6,
				postName: "销售代表"
			},
			{
				id: 7,
				postName: "开发工程师"
			},
			{
				id: 8,
				postName: "人事专员"
			}
		];
		const employeeAttachmentDefs = [
			{
				key: "resume",
				label: "简历档案",
				fileIdKey: "resumeFileId",
				fileNameKey: "resumeFileName",
				accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png"
			},
			{
				key: "education",
				label: "学历证书",
				fileIdKey: "educationCertFileId",
				fileNameKey: "educationCertFileName",
				accept: ".pdf,.jpg,.jpeg,.png"
			},
			{
				key: "skill",
				label: "技能证书",
				fileIdKey: "skillCertFileId",
				fileNameKey: "skillCertFileName",
				accept: ".pdf,.jpg,.jpeg,.png"
			},
			{
				key: "idFront",
				label: "身份证正面",
				fileIdKey: "idCardFrontFileId",
				fileNameKey: "idCardFrontFileName",
				accept: ".jpg,.jpeg,.png,.pdf"
			},
			{
				key: "idBack",
				label: "身份证反面",
				fileIdKey: "idCardBackFileId",
				fileNameKey: "idCardBackFileName",
				accept: ".jpg,.jpeg,.png,.pdf"
			}
		];
		const queryParams = reactive({
			pageNum: 1,
			pageSize: 10,
			name: "",
			deptId: void 0,
			postId: void 0,
			status: void 0,
			excludeResigned: true
		});
		const defaultForm = () => ({
			id: void 0,
			userId: void 0,
			empCode: "",
			name: "",
			avatar: "",
			gender: 0,
			birthDate: "",
			idCard: "",
			phone: "",
			email: "",
			address: "",
			householdLocation: "",
			householdType: "",
			nativePlace: "",
			ethnicity: "",
			politicalStatus: "",
			maritalStatus: "",
			hrDocs: "",
			deptId: void 0,
			postId: void 0,
			hireDate: "",
			regularDate: "",
			contractStart: "",
			contractEnd: "",
			education: "",
			university: "",
			major: "",
			emergencyContact: "",
			emergencyPhone: "",
			status: 2,
			annualLeaveTotal: 0,
			annualLeaveUsed: 0,
			managerId: void 0,
			resumeFileId: void 0,
			resumeFileName: "",
			educationCertFileId: void 0,
			educationCertFileName: "",
			skillCertFileId: void 0,
			skillCertFileName: "",
			idCardFrontFileId: void 0,
			idCardFrontFileName: "",
			idCardBackFileId: void 0,
			idCardBackFileName: "",
			username: "",
			accountEnabled: false,
			roleIds: [],
			roleNames: []
		});
		const formData = ref(defaultForm());
		const avatarInput = ref();
		function triggerAvatarPick() {
			var _avatarInput$value;
			(_avatarInput$value = avatarInput.value) === null || _avatarInput$value === void 0 || _avatarInput$value.click();
		}
		function compressImageToBase64(file, size = 256, quality = .82) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const img = new Image();
					img.onload = () => {
						const canvas = document.createElement("canvas");
						canvas.width = size;
						canvas.height = size;
						const ctx = canvas.getContext("2d");
						if (!ctx) {
							reject(/* @__PURE__ */ new Error("no canvas ctx"));
							return;
						}
						const min = Math.min(img.width, img.height);
						const sx = (img.width - min) / 2;
						const sy = (img.height - min) / 2;
						ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
						resolve(canvas.toDataURL("image/jpeg", quality));
					};
					img.onerror = () => reject(/* @__PURE__ */ new Error("image decode fail"));
					img.src = reader.result;
				};
				reader.onerror = () => reject(/* @__PURE__ */ new Error("file read fail"));
				reader.readAsDataURL(file);
			});
		}
		function onAvatarPick(_x5) {
			return _onAvatarPick.apply(this, arguments);
		}
		function _onAvatarPick() {
			_onAvatarPick = _asyncToGenerator(function* (e) {
				const input = e.target;
				const file = input.files && input.files[0];
				if (!file) return;
				if (!file.type.startsWith("image/")) {
					ElMessage.warning("请选择图片文件");
					input.value = "";
					return;
				}
				if (file.size > 10 * 1024 * 1024) {
					ElMessage.warning("图片太大,请选择 10MB 以内的图片");
					input.value = "";
					return;
				}
				try {
					formData.value.avatar = yield compressImageToBase64(file);
				} catch (_unused4) {
					ElMessage.error("图片处理失败,请换一张试试");
				}
				input.value = "";
			});
			return _onAvatarPick.apply(this, arguments);
		}
		const setFormField = (key, value) => {
			formData.value[key] = value;
		};
		const fillNextEmpCode = function() {
			var _ref5 = _asyncToGenerator(function* () {
				try {
					const res = yield employeeApi.nextCode();
					formData.value.empCode = String((res === null || res === void 0 ? void 0 : res.data) || "");
				} catch (_unused5) {
					if (!formData.value.empCode) formData.value.empCode = "";
				}
			});
			return function fillNextEmpCode() {
				return _ref5.apply(this, arguments);
			};
		}();
		const managerEmployeeOptions = computed(() => managerEmployees.value.filter((item) => item.status !== 3));
		const managerOptionLabel = (item) => {
			const dept = item.deptName || "未分部门";
			const account = item.username || item._username || (item.userId ? `用户ID ${item.userId}` : "未开通账号");
			return `${item.name || "未命名"} · ${dept} · ${account}`;
		};
		const handleProfileFileChange = function() {
			var _ref6 = _asyncToGenerator(function* (item, file) {
				const raw = file.raw;
				if (!raw) return;
				if (raw.size > 30 * 1024 * 1024) {
					ElMessage.warning("单个档案附件不能超过 30MB");
					return;
				}
				uploadingAttachmentKey.value = item.key;
				try {
					const res = yield fileInfoApi.upload(raw);
					const data = (res === null || res === void 0 ? void 0 : res.data) || {};
					setFormField(item.fileIdKey, data.id);
					setFormField(item.fileNameKey, data.originalName || data.name || raw.name);
					ElMessage.success(`${item.label}已上传`);
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || `${item.label}上传失败`);
				} finally {
					uploadingAttachmentKey.value = "";
				}
			});
			return function handleProfileFileChange(_x6, _x7) {
				return _ref6.apply(this, arguments);
			};
		}();
		const clearProfileFile = (item) => {
			setFormField(item.fileIdKey, void 0);
			setFormField(item.fileNameKey, "");
		};
		const downloadEmployeeFile = (fileId, filename) => {
			if (!fileId) return;
			downloadFileById(fileId, filename);
		};
		const businessRoles = [
			{
				key: "boss",
				label: "管理负责人",
				level: "primary",
				flow: "老板审批 / 经营复盘 / 关键规则拍板",
				desc: "负责审批高金额订单、组织规则和跨部门卡点。",
				required: true,
				keywords: [
					"总经理",
					"老板",
					"负责人",
					"主管",
					"管理层",
					"合伙人",
					"CEO"
				],
				fallbackDept: "管理层",
				fallbackPost: "总经理"
			},
			{
				key: "sales",
				label: "销售顾问",
				level: "success",
				flow: "线索承接 / 客户跟进 / 报价成交",
				desc: "负责客户首触、需求确认、报价和成交跟进。",
				required: true,
				keywords: [
					"销售",
					"顾问",
					"商务",
					"客户经理",
					"电销",
					"网销",
					"私域",
					"渠道销售",
					"销售代表"
				],
				fallbackDept: "销售部",
				fallbackPost: "销售代表"
			},
			{
				key: "tele_sale",
				label: "电销拓客",
				level: "success",
				flow: "电话外呼 / 首触记录 / 线索分配",
				desc: "负责电话触达、意向分级和首轮转化。",
				required: false,
				keywords: [
					"电销",
					"外呼",
					"电话销售",
					"呼叫",
					"坐席"
				],
				fallbackDept: "销售部",
				fallbackPost: "销售代表"
			},
			{
				key: "online_sale",
				label: "网销运营",
				level: "success",
				flow: "广告线索 / ROI / 在线客服承接",
				desc: "负责网销线索、投产比和广告渠道承接。",
				required: true,
				keywords: [
					"网销",
					"线上",
					"运营",
					"投放",
					"广告",
					"客服",
					"私域"
				],
				fallbackDept: "销售部",
				fallbackPost: "销售代表"
			},
			{
				key: "finance_service",
				label: "财税会计",
				level: "warning",
				flow: "代账服务 / 税务申报 / 财税异常处理",
				desc: "负责代账、报税、税务异常和财税咨询交付。",
				required: true,
				keywords: [
					"财税",
					"会计",
					"代账",
					"税务",
					"记账",
					"财务顾问"
				],
				fallbackDept: "财务部",
				fallbackPost: "会计"
			},
			{
				key: "delivery",
				label: "工商交付",
				level: "warning",
				flow: "工商办理 / 资料收集 / 交付节点推进",
				desc: "负责注册、变更、注销、异常解除等交付任务。",
				required: true,
				keywords: [
					"工商",
					"交付",
					"办理",
					"资料",
					"实施",
					"客服",
					"客户成功"
				],
				fallbackDept: "客服部",
				fallbackPost: "销售代表"
			},
			{
				key: "channel",
				label: "渠道地址",
				level: "warning",
				flow: "挂靠地址 / 同行渠道 / 供应商结算",
				desc: "负责地址资源、同行客户、渠道价格和应收结算。",
				required: true,
				keywords: [
					"渠道",
					"地址",
					"挂靠",
					"同行",
					"供应商",
					"资源"
				],
				fallbackDept: "销售部",
				fallbackPost: "销售代表"
			},
			{
				key: "finance_audit",
				label: "财务审核",
				level: "primary",
				flow: "收款核对 / 提单财审 / 应收应付",
				desc: "负责回款、合同、发票、应收和提单财务审核。",
				required: true,
				keywords: [
					"财务",
					"出纳",
					"收款",
					"应收",
					"应付",
					"财务总监",
					"CFO"
				],
				fallbackDept: "财务部",
				fallbackPost: "财务总监"
			},
			{
				key: "hr_admin",
				label: "人事行政",
				level: "info",
				flow: "人员档案 / 权限开通 / 入离职",
				desc: "负责人员档案、组织归属、权限开通和入离职。",
				required: false,
				keywords: [
					"人事",
					"HR",
					"行政",
					"招聘",
					"组织"
				],
				fallbackDept: "人事部",
				fallbackPost: "人事专员"
			}
		];
		const rules = {
			name: [{
				required: true,
				message: t("org.inputEmpName"),
				trigger: "blur"
			}],
			deptId: [{
				required: true,
				message: t("org.selectDept"),
				trigger: "change"
			}]
		};
		const employeeImportStats = computed(() => {
			const total = importPreviewRows.value.length;
			const ready = importPreviewRows.value.filter((item) => item.status === "ready").length;
			return {
				total,
				ready,
				error: total - ready,
				roles: new Set(importPreviewRows.value.filter((item) => item.status === "ready").map((item) => item.role.key)).size
			};
		});
		const staffRole = {
			key: "staff",
			label: "待定位人员",
			level: "info",
			flow: "待补充部门岗位后再进入业务链路",
			desc: "员工信息存在,但暂未识别到明确业务角色。",
			required: false,
			keywords: [],
			fallbackDept: "管理层",
			fallbackPost: "总经理"
		};
		const employeeImportColumns = [
			{
				key: "empCode",
				label: "工号",
				aliases: [
					"工号",
					"员工编号",
					"员工工号",
					"编号"
				],
				index: 0
			},
			{
				key: "name",
				label: "姓名",
				aliases: [
					"姓名",
					"员工姓名",
					"人员姓名",
					"名称"
				],
				index: 1
			},
			{
				key: "deptName",
				label: "部门",
				aliases: [
					"部门",
					"所属部门",
					"部门名称",
					"一级部门"
				],
				index: 2
			},
			{
				key: "postName",
				label: "岗位",
				aliases: [
					"岗位",
					"职位",
					"职务",
					"岗位名称"
				],
				index: 3
			},
			{
				key: "roleName",
				label: "业务角色",
				aliases: [
					"业务角色",
					"角色",
					"角色定位",
					"业务定位"
				],
				index: 4
			},
			{
				key: "phone",
				label: "手机号",
				aliases: [
					"手机号",
					"手机",
					"电话",
					"联系电话"
				],
				index: 5
			},
			{
				key: "username",
				label: "登录账号",
				aliases: [
					"登录账号",
					"账号",
					"用户名",
					"系统账号"
				],
				index: 6
			},
			{
				key: "accountEnabled",
				label: "允许登录",
				aliases: [
					"允许登录",
					"开通账号",
					"是否登录",
					"可登录"
				],
				index: 7
			},
			{
				key: "email",
				label: "邮箱",
				aliases: [
					"邮箱",
					"电子邮箱",
					"邮件"
				],
				index: 8
			},
			{
				key: "hireDate",
				label: "入职日期",
				aliases: [
					"入职日期",
					"入职时间",
					"到岗日期"
				],
				index: 9
			},
			{
				key: "status",
				label: "状态",
				aliases: [
					"状态",
					"员工状态",
					"在职状态"
				],
				index: 10
			},
			{
				key: "remark",
				label: "备注",
				aliases: [
					"备注",
					"说明",
					"补充说明"
				],
				index: 11
			}
		];
		const flatDeptList = computed(() => flattenDeptTree(deptTree.value));
		const deptTreeNoCompany = computed(() => deptTree.value.flatMap((c) => Array.isArray(c.children) && c.children.length ? c.children : [c]));
		const normalizeRoleText = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "").replace(/[()（）【】\[\]{}]/g, "");
		const roleCoverageTag = (level) => {
			return {
				success: "success",
				warning: "warning",
				danger: "danger",
				primary: "primary",
				info: "info"
			}[level || "info"] || "info";
		};
		const employeeBusinessRole = (row) => {
			var _roleScores$;
			const roleText = normalizeRoleText([
				row === null || row === void 0 ? void 0 : row.businessRole,
				row === null || row === void 0 ? void 0 : row.roleName,
				row === null || row === void 0 ? void 0 : row.roleLabel,
				row === null || row === void 0 ? void 0 : row.remark,
				row === null || row === void 0 ? void 0 : row.deptName,
				row === null || row === void 0 ? void 0 : row.postName,
				row === null || row === void 0 ? void 0 : row.positionName
			].filter(Boolean).join(" "));
			if (!roleText) return staffRole;
			const explicitRole = businessRoles.find((role) => roleText.includes(normalizeRoleText(`业务角色:${role.label}`)) || roleText.includes(normalizeRoleText(role.label)));
			if (explicitRole) return explicitRole;
			return ((_roleScores$ = businessRoles.map((role, index) => {
				let score = 0;
				role.keywords.forEach((keyword) => {
					const normalizedKeyword = normalizeRoleText(keyword);
					if (normalizedKeyword && roleText.includes(normalizedKeyword)) score += Math.max(2, normalizedKeyword.length);
				});
				if (role.key === "delivery" && roleText.includes("客服")) score += 8;
				if (role.key === "channel" && (roleText.includes("地址") || roleText.includes("同行"))) score += 10;
				if (role.key === "finance_audit" && (roleText.includes("财务总监") || roleText.includes("出纳") || roleText.includes("收款"))) score += 10;
				if (role.key === "finance_service" && (roleText.includes("会计") || roleText.includes("代账") || roleText.includes("税务"))) score += 10;
				if (role.key === "online_sale" && (roleText.includes("网销") || roleText.includes("运营") || roleText.includes("投放"))) score += 10;
				if (role.key === "tele_sale" && (roleText.includes("电销") || roleText.includes("外呼") || roleText.includes("坐席"))) score += 10;
				return {
					role,
					score,
					index
				};
			}).filter((item) => item.score > 0).sort((a, b) => b.score - a.score || a.index - b.index)[0]) === null || _roleScores$ === void 0 ? void 0 : _roleScores$.role) || staffRole;
		};
		const flattenDeptTree = (nodes = []) => nodes.reduce((list, item) => {
			list.push(item);
			if (Array.isArray(item.children) && item.children.length) list.push(...flattenDeptTree(item.children));
			return list;
		}, []);
		const findDeptByName = (name, role) => {
			const normalizedName = normalizeRoleText(name);
			const exact = flatDeptList.value.find((item) => normalizeRoleText(item.deptName) === normalizedName);
			if (exact) return exact;
			const fuzzy = normalizedName ? flatDeptList.value.find((item) => normalizeRoleText(item.deptName).includes(normalizedName) || normalizedName.includes(normalizeRoleText(item.deptName))) : void 0;
			if (fuzzy) return fuzzy;
			const fallbackName = normalizeRoleText(role === null || role === void 0 ? void 0 : role.fallbackDept);
			return flatDeptList.value.find((item) => normalizeRoleText(item.deptName) === fallbackName);
		};
		const findPostByName = (name, role) => {
			const normalizedName = normalizeRoleText(name);
			const exact = postList.value.find((item) => normalizeRoleText(item.postName) === normalizedName);
			if (exact) return exact;
			const fuzzy = normalizedName ? postList.value.find((item) => normalizeRoleText(item.postName).includes(normalizedName) || normalizedName.includes(normalizeRoleText(item.postName))) : void 0;
			if (fuzzy) return fuzzy;
			const fallbackName = normalizeRoleText(role === null || role === void 0 ? void 0 : role.fallbackPost);
			return postList.value.find((item) => normalizeRoleText(item.postName) === fallbackName);
		};
		const splitEmployeeImportLine = (line) => {
			const text = line.trim();
			if (!text) return [];
			if (text.includes("	")) return text.split("	").map((item) => item.trim());
			const cells = [];
			let current = "";
			let quoted = false;
			for (let index = 0; index < text.length; index += 1) {
				const char = text[index];
				if (char === "\"") {
					quoted = !quoted;
					continue;
				}
				if (char === "," && !quoted) {
					cells.push(current.trim());
					current = "";
					continue;
				}
				current += char;
			}
			cells.push(current.trim());
			return cells;
		};
		const detectEmployeeImportHeader = (cells) => {
			const headerMap = {};
			cells.forEach((cell, cellIndex) => {
				const normalizedCell = normalizeRoleText(cell);
				const column = employeeImportColumns.find((item) => item.aliases.some((alias) => normalizeRoleText(alias) === normalizedCell));
				if (column) headerMap[column.key] = cellIndex;
			});
			return Object.keys(headerMap).length >= 2 ? headerMap : null;
		};
		const rowValue = (cells, headerMap, key) => {
			var _ref7, _headerMap$key;
			const column = employeeImportColumns.find((item) => item.key === key);
			const index = (_ref7 = (_headerMap$key = headerMap === null || headerMap === void 0 ? void 0 : headerMap[key]) !== null && _headerMap$key !== void 0 ? _headerMap$key : column === null || column === void 0 ? void 0 : column.index) !== null && _ref7 !== void 0 ? _ref7 : -1;
			return index >= 0 ? String(cells[index] || "").trim() : "";
		};
		const normalizeEmployeeStatus = (value) => {
			const text = normalizeRoleText(value);
			if (!text) return 1;
			if ([
				"待入职",
				"待入职草稿",
				"草稿",
				"0"
			].some((item) => text.includes(normalizeRoleText(item)))) return 0;
			if ([
				"离职",
				"停用",
				"已离职",
				"3"
			].some((item) => text.includes(normalizeRoleText(item)))) return 3;
			if ([
				"试用",
				"待转正",
				"2"
			].some((item) => text.includes(normalizeRoleText(item)))) return 2;
			return 1;
		};
		const normalizeEmployeeGender = (value) => {
			const text = normalizeRoleText(value);
			if (text.includes("女") || text === "1") return 1;
			return 0;
		};
		const normalizeAccountEnabled = (value, username) => {
			const text = normalizeRoleText(value);
			if (!text) return !!username;
			return [
				"是",
				"开通",
				"允许",
				"启用",
				"yes",
				"y",
				"true",
				"1"
			].some((item) => text.includes(normalizeRoleText(item)));
		};
		const normalizeDateText = (value) => {
			const text = String(value || "").trim();
			if (!text) return "";
			const matched = text.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
			if (!matched) return text;
			const [, year, month, day] = matched;
			return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
		};
		const buildEmployeeCode = (rowNo) => {
			const date = /* @__PURE__ */ new Date();
			const month = `${date.getMonth() + 1}`.padStart(2, "0");
			const day = `${date.getDate()}`.padStart(2, "0");
			return `ZH${date.getFullYear()}${month}${day}${String(rowNo).padStart(3, "0")}`;
		};
		const parseEmployeeImport = () => {
			const lines = importText.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
			if (!lines.length) {
				importPreviewRows.value = [];
				ElMessage.warning("请先粘贴公司人员表");
				return;
			}
			const headerMap = detectEmployeeImportHeader(splitEmployeeImportLine(lines[0]));
			const dataLines = headerMap ? lines.slice(1) : lines;
			const usedCodes = new Set(tableData.value.map((item) => String(item.empCode || "").trim()).filter(Boolean));
			importPreviewRows.value = dataLines.map((line, index) => {
				const cells = splitEmployeeImportLine(line);
				const raw = {
					empCode: rowValue(cells, headerMap, "empCode") || buildEmployeeCode(index + 1),
					name: rowValue(cells, headerMap, "name"),
					deptName: rowValue(cells, headerMap, "deptName"),
					postName: rowValue(cells, headerMap, "postName"),
					roleName: rowValue(cells, headerMap, "roleName"),
					phone: rowValue(cells, headerMap, "phone"),
					username: rowValue(cells, headerMap, "username"),
					accountEnabled: rowValue(cells, headerMap, "accountEnabled"),
					email: rowValue(cells, headerMap, "email"),
					hireDate: rowValue(cells, headerMap, "hireDate"),
					status: rowValue(cells, headerMap, "status"),
					remark: rowValue(cells, headerMap, "remark")
				};
				const role = employeeBusinessRole(raw);
				const dept = findDeptByName(raw.deptName, role);
				const post = findPostByName(raw.postName, role);
				const employeeStatus = normalizeEmployeeStatus(raw.status);
				const issues = [];
				if (!raw.name) issues.push("缺姓名");
				if (!raw.empCode) issues.push("缺工号");
				if (usedCodes.has(raw.empCode)) issues.push("工号可能重复");
				if (!dept) issues.push(`部门未匹配: ${raw.deptName || role.fallbackDept}`);
				if (!post) issues.push(`岗位未匹配: ${raw.postName || role.fallbackPost}`);
				if (employeeStatus === 3) issues.push("离职人员请到离职人员中心补录");
				if (dept && raw.deptName && normalizeRoleText(dept.deptName) !== normalizeRoleText(raw.deptName)) issues.push(`部门已归到 ${dept.deptName}`);
				if (post && raw.postName && normalizeRoleText(post.postName) !== normalizeRoleText(raw.postName)) issues.push(`岗位已归到 ${post.postName}`);
				usedCodes.add(raw.empCode);
				const status = issues.some((issue) => issue.includes("缺") || issue.includes("重复") || issue.includes("未匹配") || issue.includes("离职人员")) ? "error" : "ready";
				const employee = {
					empCode: raw.empCode,
					name: raw.name,
					deptId: dept === null || dept === void 0 ? void 0 : dept.id,
					deptName: dept === null || dept === void 0 ? void 0 : dept.deptName,
					postId: post === null || post === void 0 ? void 0 : post.id,
					postName: post === null || post === void 0 ? void 0 : post.postName,
					phone: raw.phone,
					username: raw.username,
					accountEnabled: normalizeAccountEnabled(raw.accountEnabled, raw.username),
					email: raw.email,
					hireDate: normalizeDateText(raw.hireDate),
					status: employeeStatus,
					gender: normalizeEmployeeGender(""),
					remark: [
						raw.remark,
						`业务角色:${role.label}`,
						`承接链路:${role.flow}`,
						raw.deptName && (dept === null || dept === void 0 ? void 0 : dept.deptName) !== raw.deptName ? `原始部门:${raw.deptName}` : "",
						raw.postName && (post === null || post === void 0 ? void 0 : post.postName) !== raw.postName ? `原始岗位:${raw.postName}` : ""
					].filter(Boolean).join("；")
				};
				return {
					rowNo: headerMap ? index + 2 : index + 1,
					raw,
					employee,
					role,
					status,
					statusText: status === "ready" ? "可导入" : "待修正",
					issues
				};
			});
			const readyCount = importPreviewRows.value.filter((item) => item.status === "ready").length;
			ElMessage.success(`已解析 ${importPreviewRows.value.length} 行,可导入 ${readyCount} 人`);
		};
		const fillEmployeeImportSample = () => {
			importText.value = [
				"工号	姓名	部门	岗位	业务角色	手机号	登录账号	允许登录	邮箱	入职日期	状态	备注",
				"ZH001	张明	管理层	总经理	管理负责人	13800000001	zhangming	是	zhangming@example.com	2026-06-01	在职	负责最终审批",
				"ZH002	李娜	销售部	销售代表	电销拓客	13800000002	lina	是	lina@example.com	2026-06-01	在职	电话外呼和线索首触",
				"ZH003	王磊	销售部	销售代表	网销运营	13800000003	wanglei	是	wanglei@example.com	2026-06-01	在职	负责线上投放和ROI",
				"ZH004	陈会计	财务部	会计	财税会计	13800000004	chenkj	是	chenkj@example.com	2026-06-01	在职	代账报税服务",
				"ZH005	赵交付	客服部	销售代表	工商交付	13800000005	zhaojf	是	zhaojf@example.com	2026-06-01	在职	工商注册变更交付",
				"ZH006	周渠道	销售部	销售代表	渠道地址	13800000006	zhouqd	是	zhouqd@example.com	2026-06-01	在职	挂靠地址和同行渠道",
				"ZH007	钱出纳	财务部	财务总监	财务审核	13800000007	qiancn	是	qiancn@example.com	2026-06-01	在职	回款核对和提单财审",
				"ZH008	孙人事	人事部	人事专员	人事行政	13800000008	sunrs	是	sunrs@example.com	2026-06-01	在职	组织和权限开通"
			].join("\n");
			parseEmployeeImport();
		};
		const clearEmployeeImport = () => {
			importText.value = "";
			importPreviewRows.value = [];
		};
		const openImportDialog = function() {
			var _ref8 = _asyncToGenerator(function* () {
				if (!deptTree.value.length) yield loadDeptTree();
				if (!postList.value.length) yield loadPostList();
				importDialog.visible = true;
				if (importText.value && !importPreviewRows.value.length) parseEmployeeImport();
			});
			return function openImportDialog() {
				return _ref8.apply(this, arguments);
			};
		}();
		const csvCell = (value) => `"${String(value !== null && value !== void 0 ? value : "").replace(/"/g, "\"\"")}"`;
		const downloadTextFile = (filename, content, type = "text/plain;charset=utf-8") => {
			const blob = new Blob([content], { type });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			link.click();
			URL.revokeObjectURL(url);
		};
		const downloadEmployeeTemplate = () => {
			downloadTextFile("浙杭集团人员导入模板.csv", `\uFEFF${[
				employeeImportColumns.map((item) => item.label),
				[
					"ZH001",
					"张明",
					"管理层",
					"总经理",
					"管理负责人",
					"13800000001",
					"zhangming",
					"是",
					"zhangming@example.com",
					"2026-06-01",
					"在职",
					"负责老板审批"
				],
				[
					"ZH002",
					"李娜",
					"销售部",
					"销售代表",
					"电销拓客",
					"13800000002",
					"lina",
					"是",
					"lina@example.com",
					"2026-06-01",
					"在职",
					"负责电销首触"
				],
				[
					"ZH003",
					"王磊",
					"销售部",
					"销售代表",
					"网销运营",
					"13800000003",
					"wanglei",
					"是",
					"wanglei@example.com",
					"2026-06-01",
					"在职",
					"负责线上ROI"
				],
				[
					"ZH004",
					"陈会计",
					"财务部",
					"会计",
					"财税会计",
					"13800000004",
					"chenkj",
					"是",
					"chenkj@example.com",
					"2026-06-01",
					"在职",
					"代账报税交付"
				]
			].map((row) => row.map(csvCell).join(",")).join("\n")}`, "text/csv;charset=utf-8");
		};
		const submitEmployeeImport = function() {
			var _ref9 = _asyncToGenerator(function* () {
				if (!importPreviewRows.value.length) parseEmployeeImport();
				const readyRows = importPreviewRows.value.filter((item) => item.status === "ready");
				if (!readyRows.length) {
					ElMessage.warning("没有可导入的人员,请先修正预览问题");
					return;
				}
				importingEmployees.value = true;
				let successCount = 0;
				let failCount = 0;
				const credentials = [];
				try {
					for (const row of readyRows) {
						const _row$employee = row.employee, { deptName, postName } = _row$employee, payload = _objectWithoutProperties(_row$employee, _excluded);
						try {
							const credential = credentialFromResponse(yield employeeApi.create(payload));
							if (credential) credentials.push(credential);
							successCount += 1;
						} catch (error) {
							failCount += 1;
						}
					}
					if (successCount) {
						ElMessage.success(`已导入 ${successCount} 人${failCount ? `,失败 ${failCount} 人` : ""}`);
						importDialog.visible = false;
						clearEmployeeImport();
						queryParams.pageNum = 1;
						loadData();
						showInitialCredentials(credentials);
					} else ElMessage.error("导入失败,请检查工号是否重复或后端服务是否可用");
				} finally {
					importingEmployees.value = false;
				}
			});
			return function submitEmployeeImport() {
				return _ref9.apply(this, arguments);
			};
		}();
		const empStatusType = (status) => {
			return {
				0: "primary",
				1: "success",
				2: "warning",
				3: "info"
			}[status] || "info";
		};
		const empStatusText = (status) => {
			return {
				0: "待入职",
				1: t("org.empStatusActive"),
				2: t("org.empStatusTrial"),
				3: t("org.empStatusLeft")
			}[status] || "-";
		};
		const genderText = (gender) => gender === 0 ? t("org.male") : t("org.female");
		const employeeAvatar = (row) => String((row === null || row === void 0 ? void 0 : row.name) || "员").slice(0, 2);
		const employeeAvatarClass = (status) => {
			return {
				0: "primary",
				1: "success",
				2: "warning",
				3: "company"
			}[status] || "company";
		};
		const accountRoleNames = (row) => (row === null || row === void 0 ? void 0 : row.roleNames) || (row === null || row === void 0 ? void 0 : row._roleNames) || [];
		const accountStatusText = (row) => {
			var _row$userStatus;
			if (!(row === null || row === void 0 ? void 0 : row.userId) && !(row === null || row === void 0 ? void 0 : row.username) && !(row === null || row === void 0 ? void 0 : row._username)) return "未开通";
			return ((_row$userStatus = row.userStatus) !== null && _row$userStatus !== void 0 ? _row$userStatus : row._userStatus) === 1 || row.accountEnabled === false ? "已停用" : "可登录";
		};
		const accountStatusType = (row) => {
			var _row$userStatus2;
			if (!(row === null || row === void 0 ? void 0 : row.userId) && !(row === null || row === void 0 ? void 0 : row.username) && !(row === null || row === void 0 ? void 0 : row._username)) return "info";
			return ((_row$userStatus2 = row.userStatus) !== null && _row$userStatus2 !== void 0 ? _row$userStatus2 : row._userStatus) === 1 || row.accountEnabled === false ? "warning" : "success";
		};
		const goRoleManagement = () => {
			dialogVisible.value = false;
			router.push("/sys-org/role");
		};
		const loadData = function() {
			var _ref10 = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const data = (yield employeeApi.list(queryParams)).data;
					tableData.value = data.records || data.list || [];
					total.value = data.total || 0;
				} catch (e) {} finally {
					loading.value = false;
				}
			});
			return function loadData() {
				return _ref10.apply(this, arguments);
			};
		}();
		const loadResignedCount = function() {
			var _ref11 = _asyncToGenerator(function* () {
				try {
					var _res$data2;
					const res = yield resignHandoverApi.summary();
					resignedCount.value = Number((res === null || res === void 0 || (_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.total) || 0);
				} catch (_unused6) {
					resignedCount.value = null;
				}
			});
			return function loadResignedCount() {
				return _ref11.apply(this, arguments);
			};
		}();
		const loadContractAlert = function() {
			var _ref12 = _asyncToGenerator(function* () {
				try {
					var _res$data3;
					const res = yield employeeApi.list({
						pageNum: 1,
						pageSize: 500,
						excludeResigned: true
					});
					const rows = (res === null || res === void 0 || (_res$data3 = res.data) === null || _res$data3 === void 0 ? void 0 : _res$data3.records) || [];
					const now = Date.now();
					let expiring = 0;
					let expired = 0;
					rows.forEach((e) => {
						if (e.status === 0 || e.status === 3 || !e.contractEnd) return;
						const end = new Date(String(e.contractEnd).slice(0, 10)).getTime();
						if (Number.isNaN(end)) return;
						const days = Math.floor((end - now) / 864e5);
						if (days < 0) expired++;
						else if (days <= 90) expiring++;
					});
					contractAlert.value = {
						expiring,
						expired
					};
				} catch (e) {}
			});
			return function loadContractAlert() {
				return _ref12.apply(this, arguments);
			};
		}();
		const loadDeptTree = function() {
			var _ref13 = _asyncToGenerator(function* () {
				try {
					var _res$data4;
					const res = yield deptApi.tree();
					deptTree.value = ((_res$data4 = res.data) === null || _res$data4 === void 0 ? void 0 : _res$data4.length) ? res.data : defaultDeptTree;
				} catch (e) {
					deptTree.value = defaultDeptTree;
				}
			});
			return function loadDeptTree() {
				return _ref13.apply(this, arguments);
			};
		}();
		const loadPostList = function() {
			var _ref14 = _asyncToGenerator(function* () {
				try {
					var _res$data5;
					const res = yield postApi.all();
					postList.value = ((_res$data5 = res.data) === null || _res$data5 === void 0 ? void 0 : _res$data5.length) ? res.data : defaultPostList;
				} catch (e) {
					postList.value = defaultPostList;
				}
			});
			return function loadPostList() {
				return _ref14.apply(this, arguments);
			};
		}();
		const loadManagerEmployees = function() {
			var _ref15 = _asyncToGenerator(function* () {
				try {
					var _res$data6, _res$data7;
					const res = yield employeeApi.list({
						pageNum: 1,
						pageSize: 1e3,
						excludeResigned: true
					});
					managerEmployees.value = ((_res$data6 = res.data) === null || _res$data6 === void 0 ? void 0 : _res$data6.records) || ((_res$data7 = res.data) === null || _res$data7 === void 0 ? void 0 : _res$data7.list) || [];
				} catch (_unused7) {
					managerEmployees.value = [];
				}
			});
			return function loadManagerEmployees() {
				return _ref15.apply(this, arguments);
			};
		}();
		const handleSearch = () => {
			queryParams.pageNum = 1;
			loadData();
		};
		const handleReset = () => {
			queryParams.name = "";
			queryParams.deptId = void 0;
			queryParams.postId = void 0;
			queryParams.status = void 0;
			queryParams.excludeResigned = true;
			handleSearch();
		};
		const handleAdd = function() {
			var _ref16 = _asyncToGenerator(function* () {
				isEdit.value = false;
				dialogTitle.value = t("org.addEmployee");
				formData.value = defaultForm();
				yield fillNextEmpCode();
				activeTab.value = "basic";
				dialogVisible.value = true;
			});
			return function handleAdd() {
				return _ref16.apply(this, arguments);
			};
		}();
		const handleEdit = (row) => {
			var _row$accountEnabled;
			if (row.status === 3) {
				ElMessage.info("离职档案请在离职人员中心维护");
				router.push("/sys-org/resigned-staff");
				return;
			}
			isEdit.value = true;
			dialogTitle.value = t("org.editEmployee");
			formData.value = _objectSpread2(_objectSpread2(_objectSpread2({}, defaultForm()), row), {}, {
				username: row.username || row._username || "",
				accountEnabled: (_row$accountEnabled = row.accountEnabled) !== null && _row$accountEnabled !== void 0 ? _row$accountEnabled : accountStatusText(row) === "可登录",
				roleIds: row.roleIds || row._roleIds || []
			});
			activeTab.value = "basic";
			dialogVisible.value = true;
		};
		const openResignDialog = (row) => {
			if (row.status !== 1 && row.status !== 2) {
				ElMessage.warning("只有在职或试用员工可以办理离职");
				return;
			}
			resignDialog.employee = row;
			resignDialog.resignDate = void 0;
			resignDialog.confirmed = false;
			resignDialog.saving = false;
			resignDialog.visible = true;
		};
		const disableFutureResignDate = (date) => {
			const today = /* @__PURE__ */ new Date();
			today.setHours(23, 59, 59, 999);
			return date.getTime() > today.getTime();
		};
		const submitResign = function() {
			var _ref17 = _asyncToGenerator(function* () {
				var _resignDialog$employe;
				if (!((_resignDialog$employe = resignDialog.employee) === null || _resignDialog$employe === void 0 ? void 0 : _resignDialog$employe.id)) return ElMessage.warning("缺少员工信息");
				if (!resignDialog.resignDate) return ElMessage.warning("请选择真实离职日期");
				if (disableFutureResignDate(/* @__PURE__ */ new Date(`${resignDialog.resignDate}T00:00:00`))) return ElMessage.warning("离职日期不能晚于今天");
				if (resignDialog.employee.hireDate && resignDialog.resignDate < resignDialog.employee.hireDate) return ElMessage.warning("离职日期不能早于入职日期");
				if (!resignDialog.confirmed) return ElMessage.warning("请先确认离职影响");
				resignDialog.saving = true;
				try {
					yield employeeApi.resign(resignDialog.employee.id, resignDialog.resignDate);
					ElMessage.success("离职已办理，账号和当前会话已立即失效");
					resignDialog.visible = false;
					drawerVisible.value = false;
					yield Promise.all([
						loadData(),
						loadContractAlert(),
						loadManagerEmployees(),
						loadResignedCount()
					]);
				} finally {
					resignDialog.saving = false;
				}
			});
			return function submitResign() {
				return _ref17.apply(this, arguments);
			};
		}();
		const handleDelete = (row) => {
			ElMessageBox.confirm(t("org.confirmDeleteEmployee"), t("common.confirm"), { type: "warning" }).then(_asyncToGenerator(function* () {
				yield employeeApi.remove(row.id);
				ElMessage.success(t("common.success"));
				loadData();
			})).catch(() => {});
		};
		const handleRowClick = function() {
			var _ref18 = _asyncToGenerator(function* (row) {
				const targetId = Number(row === null || row === void 0 ? void 0 : row.id);
				if (!targetId) return;
				const requestId = ++employeeDetailRequestId;
				detailTargetEmployeeId.value = targetId;
				try {
					var _res$data8;
					const res = yield employeeApi.detail(targetId);
					if (requestId !== employeeDetailRequestId || detailTargetEmployeeId.value !== targetId) return;
					if (Number(res === null || res === void 0 || (_res$data8 = res.data) === null || _res$data8 === void 0 ? void 0 : _res$data8.id) !== targetId) {
						ElMessage.error("员工详情返回不一致，请刷新后重试");
						return;
					}
					detailData.value = res.data;
					drawerVisible.value = true;
				} catch (e) {
					if (requestId === employeeDetailRequestId && detailTargetEmployeeId.value === targetId) ElMessage.error("员工详情加载失败，请重试");
				}
			});
			return function handleRowClick(_x8) {
				return _ref18.apply(this, arguments);
			};
		}();
		const handleResetPwd = function() {
			var _ref19 = _asyncToGenerator(function* () {
				if (!formData.value.id || !formData.value.userId) {
					ElMessage.warning("该员工还没有登录账号,保存后才能重置密码");
					return;
				}
				try {
					yield ElMessageBox.confirm("系统将生成随机初始口令，并立即使该员工所有会话失效。是否继续？", "重置登录密码", {
						confirmButtonText: "确认重置",
						cancelButtonText: "取消",
						type: "warning"
					});
					const credential = credentialFromResponse(yield employeeApi.resetPwd(formData.value.id));
					if (!credential) throw new Error("后端未返回一次性初始口令");
					showInitialCredentials([credential]);
					ElMessage.success("密码已安全重置，原会话已失效");
				} catch (error) {}
			});
			return function handleResetPwd() {
				return _ref19.apply(this, arguments);
			};
		}();
		const handleResetMfa = function() {
			var _ref20 = _asyncToGenerator(function* () {
				if (!formData.value.userId) {
					ElMessage.warning("该员工还没有登录账号，无法重置 MFA");
					return;
				}
				try {
					yield ElMessageBox.confirm("旧的动态验证器将立即失效，该员工全部当前会话也会被注销。下次登录时需重新绑定，是否继续？", "重置 MFA", {
						confirmButtonText: "确认重置",
						cancelButtonText: "取消",
						type: "warning"
					});
					yield userApi.resetMfa({ userId: Number(formData.value.userId) });
					ElMessage.success("MFA 已重置，原会话已失效");
				} catch (error) {}
			});
			return function handleResetMfa() {
				return _ref20.apply(this, arguments);
			};
		}();
		const submitForm = function() {
			var _ref21 = _asyncToGenerator(function* () {
				var _formRef$value;
				if (formData.value.status === 3) {
					ElMessage.warning("请使用“办理离职”登记真实离职日期并同步停用账号");
					return;
				}
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate().catch(() => false))) return;
				try {
					const payload = _objectSpread2({}, formData.value);
					delete payload.roleIds;
					delete payload.roleNames;
					let response;
					if (isEdit.value) response = yield employeeApi.update(payload);
					else response = yield employeeApi.create(payload);
					const credential = credentialFromResponse(response);
					ElMessage.success(t("common.success"));
					dialogVisible.value = false;
					if (credential) showInitialCredentials([credential]);
					loadData();
					loadManagerEmployees();
				} catch (e) {}
			});
			return function submitForm() {
				return _ref21.apply(this, arguments);
			};
		}();
		onMounted(() => {
			loadData();
			loadResignedCount();
			loadContractAlert();
			loadDeptTree();
			loadPostList();
			loadManagerEmployees();
		});
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_button = ElButton;
			const _component_el_form = ElForm;
			const _component_el_icon = ElIcon;
			const _component_el_card = ElCard;
			const _component_el_alert = ElAlert;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_col = ElCol;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_row = ElRow;
			const _component_el_upload = ElUpload;
			const _component_el_switch = ElSwitch;
			const _component_el_dialog = ElDialog;
			const _component_el_checkbox = ElCheckbox;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(_component_el_card, {
					shadow: "never",
					class: "search-card"
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_2, [createVNode(_component_el_form, {
						model: queryParams,
						inline: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: _ctx.$t("org.empName") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.name,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => queryParams.name = $event),
									placeholder: _ctx.$t("org.inputEmpName"),
									clearable: "",
									onKeyup: withKeys(handleSearch, ["enter"])
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.deptName") }, {
								default: withCtx(() => [createVNode(_component_el_tree_select, {
									modelValue: queryParams.deptId,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => queryParams.deptId = $event),
									data: deptTree.value,
									props: {
										label: "deptName",
										value: "id",
										children: "children"
									},
									placeholder: _ctx.$t("org.selectDept"),
									"check-strictly": "",
									clearable: "",
									style: { "width": "180px" }
								}, null, 8, [
									"modelValue",
									"data",
									"placeholder"
								])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.status") }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: queryParams.status,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => queryParams.status = $event),
									placeholder: _ctx.$t("org.selectStatus"),
									clearable: "",
									style: { "width": "120px" }
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "待入职",
											value: 0
										}),
										createVNode(_component_el_option, {
											label: _ctx.$t("org.empStatusActive"),
											value: 1
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("org.empStatusTrial"),
											value: 2
										}, null, 8, ["label"])
									]),
									_: 1
								}, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, null, {
								default: withCtx(() => [createVNode(_component_el_button, {
									type: "primary",
									onClick: handleSearch
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.search")), 1)]),
									_: 1
								}), createVNode(_component_el_button, { onClick: handleReset }, {
									default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.reset")), 1)]),
									_: 1
								})]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"]), createBaseVNode("div", _hoisted_3, [
						createVNode(_component_el_button, {
							class: "resigned-center-entry",
							onClick: _cache[3] || (_cache[3] = ($event) => unref(router).push("/sys-org/resigned-staff"))
						}, {
							default: withCtx(() => {
								var _resignedCount$value;
								return [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(user_filled_default))]),
									_: 1
								}), createTextVNode("离职人员（" + toDisplayString((_resignedCount$value = resignedCount.value) !== null && _resignedCount$value !== void 0 ? _resignedCount$value : "—") + "） ", 1)];
							}),
							_: 1
						}),
						createVNode(_component_el_button, { onClick: downloadEmployeeTemplate }, {
							default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("下载人员模板", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, {
							type: "warning",
							plain: "",
							onClick: openImportDialog
						}, {
							default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("批量导入人员", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, {
							type: "primary",
							onClick: handleAdd
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(plus_default))]),
								_: 1
							}), createTextVNode(toDisplayString(_ctx.$t("common.add")), 1)]),
							_: 1
						})
					])])]),
					_: 1
				}),
				contractAlert.value.expired || contractAlert.value.expiring ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					type: "warning",
					closable: false,
					"show-icon": "",
					style: { "margin-bottom": "16px" }
				}, {
					title: withCtx(() => [createTextVNode(" 劳动合同提醒:" + toDisplayString(contractAlert.value.expired) + " 人合同已过期、" + toDisplayString(contractAlert.value.expiring) + " 人 90 天内到期,请及时续签。 ", 1)]),
					_: 1
				})) : createCommentVNode("", true),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: tableData.value,
					stripe: "",
					border: "",
					onRowClick: handleRowClick
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "empCode",
							label: _ctx.$t("org.empCode"),
							width: "120"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "name",
							label: _ctx.$t("org.empName"),
							width: "100"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "deptName",
							label: _ctx.$t("org.deptName"),
							width: "140"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							label: "登录账号",
							"min-width": "130"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_4, [createBaseVNode("strong", null, toDisplayString(row.username || row._username || "未开通"), 1), createVNode(_component_el_tag, {
								type: accountStatusType(row),
								size: "small",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(accountStatusText(row)), 1)]),
								_: 2
							}, 1032, ["type"])])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "系统角色",
							"min-width": "160"
						}, {
							default: withCtx(({ row }) => [accountRoleNames(row).length ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(accountRoleNames(row), (rn) => {
								return openBlock(), createBlock(_component_el_tag, {
									key: rn,
									size: "small",
									effect: "plain",
									style: { "margin": "1px 2px" }
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(rn), 1)]),
									_: 2
								}, 1024);
							}), 128)) : (openBlock(), createElementBlock("span", _hoisted_5, "未分配"))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "业务定位",
							"min-width": "190"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_6, toDisplayString(employeeBusinessRole(row).flow), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "直属上级",
							"min-width": "120"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(row.managerName || "未设置"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "phone",
							label: _ctx.$t("org.phone"),
							width: "130"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "hireDate",
							label: _ctx.$t("org.hireDate"),
							width: "120"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "status",
							label: _ctx.$t("org.status"),
							width: "90",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: empStatusType(row.status),
								size: "small"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(empStatusText(row.status)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_table_column, {
							label: _ctx.$t("org.actions"),
							width: "230",
							align: "center",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [
								createVNode(_component_el_button, {
									type: "primary",
									link: "",
									size: "small",
									onClick: withModifiers(($event) => handleEdit(row), ["stop"])
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.edit")), 1)]),
									_: 1
								}, 8, ["onClick"]),
								row.status === 1 || row.status === 2 ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									type: "warning",
									link: "",
									size: "small",
									onClick: withModifiers(($event) => openResignDialog(row), ["stop"])
								}, {
									default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("办理离职", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								canManageAccountSecurity.value ? (openBlock(), createBlock(_component_el_button, {
									key: 1,
									type: "danger",
									link: "",
									size: "small",
									onClick: withModifiers(($event) => handleDelete(row), ["stop"])
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.delete")), 1)]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true)
							]),
							_: 1
						}, 8, ["label"])
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createBaseVNode("div", _hoisted_7, [createVNode(_component_el_pagination, {
					"current-page": queryParams.pageNum,
					"onUpdate:currentPage": _cache[4] || (_cache[4] = ($event) => queryParams.pageNum = $event),
					"page-size": queryParams.pageSize,
					"onUpdate:pageSize": _cache[5] || (_cache[5] = ($event) => queryParams.pageSize = $event),
					total: total.value,
					"page-sizes": [
						10,
						20,
						50
					],
					layout: "total, sizes, prev, pager, next, jumper",
					onSizeChange: loadData,
					onCurrentChange: loadData
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])]),
				createVNode(_component_el_dialog, {
					modelValue: dialogVisible.value,
					"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => dialogVisible.value = $event),
					width: "980px",
					class: "employee-edit-dialog emp-hifi",
					"destroy-on-close": ""
				}, {
					header: withCtx(() => [createBaseVNode("div", _hoisted_8, [formData.value.avatar ? (openBlock(), createElementBlock("img", {
						key: 0,
						src: formData.value.avatar,
						class: "emp-hd-avatar-img",
						alt: "照片"
					}, null, 8, _hoisted_9)) : (openBlock(), createElementBlock("span", _hoisted_10, toDisplayString((formData.value.name || "员").slice(0, 1)), 1)), createBaseVNode("div", _hoisted_11, [createBaseVNode("div", _hoisted_12, [createBaseVNode("strong", null, toDisplayString(formData.value.name || dialogTitle.value), 1), createBaseVNode("span", { class: normalizeClass(["emp-pill", empStatusMeta.value.cls]) }, toDisplayString(empStatusMeta.value.label), 3)]), createBaseVNode("div", _hoisted_13, [createTextVNode("工号 " + toDisplayString(formData.value.empCode || "保存时自动生成"), 1), formData.value.hireDate ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(" · 入职 " + toDisplayString(formData.value.hireDate), 1)], 64)) : createCommentVNode("", true)])])])]),
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[35] || (_cache[35] = ($event) => dialogVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitForm
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.confirm")), 1)]),
						_: 1
					})]),
					default: withCtx(() => [createBaseVNode("div", _hoisted_14, [createBaseVNode("nav", _hoisted_15, [(openBlock(true), createElementBlock(Fragment, null, renderList(empSections.value, (s) => {
						return openBlock(), createElementBlock("button", {
							key: s.key,
							type: "button",
							class: normalizeClass(["emp-ri", { on: empActiveSect.value === s.key }]),
							onClick: ($event) => scrollToSect(s.key)
						}, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(s.icon)))]),
							_: 2
						}, 1024), createBaseVNode("span", null, toDisplayString(s.label), 1)], 10, _hoisted_16);
					}), 128))]), createBaseVNode("div", {
						ref_key: "empCntRef",
						ref: empCntRef,
						class: "emp-cnt",
						onScroll: onEmpCntScroll
					}, [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: formData.value,
						rules,
						"label-position": "top"
					}, {
						default: withCtx(() => [
							createBaseVNode("section", {
								class: "emp-sect",
								ref: (el) => setSectRef("basic", el)
							}, [createBaseVNode("div", _hoisted_17, [createBaseVNode("span", _hoisted_18, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(user_default))]),
								_: 1
							})]), createBaseVNode("h4", null, toDisplayString(_ctx.$t("org.tabBasic")), 1)]), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "员工照片" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_19, [
												createBaseVNode("div", {
													class: "avatar-box",
													onClick: triggerAvatarPick
												}, [formData.value.avatar ? (openBlock(), createElementBlock("img", {
													key: 0,
													src: formData.value.avatar,
													class: "avatar-img",
													alt: "照片"
												}, null, 8, _hoisted_20)) : (openBlock(), createElementBlock("div", _hoisted_21, [..._cache[52] || (_cache[52] = [createBaseVNode("span", { class: "plus" }, "＋", -1), createBaseVNode("span", null, "上传照片", -1)])]))]),
												createBaseVNode("div", _hoisted_22, [formData.value.avatar ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_button, {
													link: "",
													size: "small",
													onClick: triggerAvatarPick
												}, {
													default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("更换", -1)])]),
													_: 1
												}), createVNode(_component_el_button, {
													link: "",
													type: "danger",
													size: "small",
													onClick: _cache[6] || (_cache[6] = ($event) => formData.value.avatar = "")
												}, {
													default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("移除", -1)])]),
													_: 1
												})], 64)) : (openBlock(), createElementBlock("span", _hoisted_23, "点击上传,自动压缩为方形小图"))]),
												createBaseVNode("input", {
													ref_key: "avatarInput",
													ref: avatarInput,
													type: "file",
													accept: "image/*",
													style: { "display": "none" },
													onChange: onAvatarPick
												}, null, 544)
											])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: _ctx.$t("org.empName"),
											prop: "name"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.name,
												"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => formData.value.name = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.gender") }, {
											default: withCtx(() => [createVNode(_component_el_radio_group, {
												modelValue: formData.value.gender,
												"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => formData.value.gender = $event)
											}, {
												default: withCtx(() => [createVNode(_component_el_radio_button, { value: 0 }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("org.male")), 1)]),
													_: 1
												}), createVNode(_component_el_radio_button, { value: 1 }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("org.female")), 1)]),
													_: 1
												})]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.birthDate") }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: formData.value.birthDate,
												"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => formData.value.birthDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.idCard") }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.idCard,
												"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => formData.value.idCard = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.phone") }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.phone,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => formData.value.phone = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.email") }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.email,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => formData.value.email = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.address") }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.address,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => formData.value.address = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "户口所在地" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.householdLocation,
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => formData.value.householdLocation = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "户口类型" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: formData.value.householdType,
												"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => formData.value.householdType = $event),
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [
													createVNode(_component_el_option, {
														label: "本地城镇",
														value: "本地城镇"
													}),
													createVNode(_component_el_option, {
														label: "本地农村",
														value: "本地农村"
													}),
													createVNode(_component_el_option, {
														label: "外地城镇",
														value: "外地城镇"
													}),
													createVNode(_component_el_option, {
														label: "外地农村",
														value: "外地农村"
													}),
													createVNode(_component_el_option, {
														label: "本地居民户口",
														value: "本地居民户口"
													}),
													createVNode(_component_el_option, {
														label: "外地居民户口",
														value: "外地居民户口"
													})
												]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "籍贯" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.nativePlace,
												"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => formData.value.nativePlace = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "民族" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.ethnicity,
												"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => formData.value.ethnicity = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "政治面貌" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: formData.value.politicalStatus,
												"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => formData.value.politicalStatus = $event),
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [
													createVNode(_component_el_option, {
														label: "党员",
														value: "党员"
													}),
													createVNode(_component_el_option, {
														label: "团员",
														value: "团员"
													}),
													createVNode(_component_el_option, {
														label: "群众",
														value: "群众"
													}),
													createVNode(_component_el_option, {
														label: "其他",
														value: "其他"
													})
												]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "婚姻情况" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: formData.value.maritalStatus,
												"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => formData.value.maritalStatus = $event),
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [createVNode(_component_el_option, {
													label: "已婚",
													value: "已婚"
												}), createVNode(_component_el_option, {
													label: "未婚",
													value: "未婚"
												})]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})], 512),
							createBaseVNode("section", {
								class: "emp-sect",
								ref: (el) => setSectRef("position", el)
							}, [createBaseVNode("div", _hoisted_24, [createBaseVNode("span", _hoisted_25, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(suitcase_default))]),
								_: 1
							})]), createBaseVNode("h4", null, toDisplayString(_ctx.$t("org.tabPosition")), 1)]), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.empCode") }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.empCode,
												"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => formData.value.empCode = $event),
												disabled: !canEditEmpCode.value,
												placeholder: "保存时自动生成"
											}, {
												append: withCtx(() => [canEditEmpCode.value ? (openBlock(), createBlock(_component_el_button, {
													key: 0,
													text: "",
													onClick: fillNextEmpCode
												}, {
													default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("取号", -1)])]),
													_: 1
												})) : (openBlock(), createElementBlock("span", _hoisted_26, "自动"))]),
												_: 1
											}, 8, ["modelValue", "disabled"]), createBaseVNode("div", _hoisted_27, toDisplayString(canEditEmpCode.value ? "超级管理员可手动调整；留空则自动生成。" : "工号由系统自动生成，只有超级管理员能手动修改。"), 1)]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: _ctx.$t("org.deptName"),
											prop: "deptId"
										}, {
											default: withCtx(() => [createVNode(_component_el_tree_select, {
												modelValue: formData.value.deptId,
												"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => formData.value.deptId = $event),
												data: deptTreeNoCompany.value,
												props: {
													label: "deptName",
													value: "id",
													children: "children"
												},
												"check-strictly": "",
												filterable: "",
												placeholder: "请选择部门",
												style: { "width": "100%" }
											}, null, 8, ["modelValue", "data"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.hireDate") }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: formData.value.hireDate,
												"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => formData.value.hireDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.regularDate") }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: formData.value.regularDate,
												"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => formData.value.regularDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.status") }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: formData.value.status,
												"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => formData.value.status = $event),
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [
													createVNode(_component_el_option, {
														label: "待入职",
														value: 0
													}),
													createVNode(_component_el_option, {
														label: _ctx.$t("org.empStatusActive"),
														value: 1
													}, null, 8, ["label"]),
													createVNode(_component_el_option, {
														label: _ctx.$t("org.empStatusTrial"),
														value: 2
													}, null, 8, ["label"])
												]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "直属上级" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: formData.value.managerId,
												"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => formData.value.managerId = $event),
												filterable: "",
												clearable: "",
												placeholder: "选择员工直属上级(审批时用)",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(managerEmployeeOptions.value, (m) => {
													return openBlock(), createBlock(_component_el_option, {
														key: m.userId || m.id,
														label: managerOptionLabel(m),
														value: m.userId,
														disabled: !m.userId || m.id === formData.value.id
													}, null, 8, [
														"label",
														"value",
														"disabled"
													]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"]), _cache[56] || (_cache[56] = createBaseVNode("div", { class: "field-tip" }, "选择后，请假/报销等流程里的“直属上级”会按这里自动指派。", -1))]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})], 512),
							createBaseVNode("section", {
								class: "emp-sect",
								ref: (el) => setSectRef("contract", el)
							}, [createBaseVNode("div", _hoisted_28, [
								createBaseVNode("span", _hoisted_29, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(document_default))]),
									_: 1
								})]),
								createBaseVNode("h4", null, toDisplayString(_ctx.$t("org.tabContract")), 1),
								_cache[57] || (_cache[57] = createBaseVNode("small", null, "到期前自动提醒续签", -1))
							]), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.contractStart") }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: formData.value.contractStart,
											"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => formData.value.contractStart = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.contractEnd") }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: formData.value.contractEnd,
											"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => formData.value.contractEnd = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								})]),
								_: 1
							})], 512),
							createBaseVNode("section", {
								class: "emp-sect",
								ref: (el) => setSectRef("education", el)
							}, [createBaseVNode("div", _hoisted_30, [createBaseVNode("span", _hoisted_31, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(reading_default))]),
								_: 1
							})]), createBaseVNode("h4", null, toDisplayString(_ctx.$t("org.tabEducation")), 1)]), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.education") }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: formData.value.education,
												"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => formData.value.education = $event),
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [
													createVNode(_component_el_option, {
														label: "博士",
														value: "博士"
													}),
													createVNode(_component_el_option, {
														label: "硕士",
														value: "硕士"
													}),
													createVNode(_component_el_option, {
														label: "本科",
														value: "本科"
													}),
													createVNode(_component_el_option, {
														label: "大专",
														value: "大专"
													}),
													createVNode(_component_el_option, {
														label: "高中",
														value: "高中"
													}),
													createVNode(_component_el_option, {
														label: "其他",
														value: "其他"
													})
												]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.university") }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.university,
												"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => formData.value.university = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.major") }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.major,
												"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => formData.value.major = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									})
								]),
								_: 1
							})], 512),
							createBaseVNode("section", {
								class: "emp-sect",
								ref: (el) => setSectRef("files", el)
							}, [createBaseVNode("div", _hoisted_32, [createBaseVNode("span", _hoisted_33, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(paperclip_default))]),
								_: 1
							})]), _cache[58] || (_cache[58] = createBaseVNode("h4", null, "档案附件", -1))]), createBaseVNode("div", _hoisted_34, [(openBlock(), createElementBlock(Fragment, null, renderList(employeeAttachmentDefs, (item) => {
								return createBaseVNode("div", {
									key: item.key,
									class: "profile-file-card"
								}, [createBaseVNode("div", _hoisted_35, [createBaseVNode("strong", null, toDisplayString(item.label), 1), createBaseVNode("span", null, toDisplayString(formData.value[item.fileNameKey] || "未上传"), 1)]), createBaseVNode("div", _hoisted_36, [
									createVNode(_component_el_upload, {
										"show-file-list": false,
										"auto-upload": false,
										accept: item.accept,
										"on-change": (file) => handleProfileFileChange(item, file)
									}, {
										default: withCtx(() => [createVNode(_component_el_button, {
											size: "small",
											icon: unref(upload_default),
											loading: uploadingAttachmentKey.value === item.key
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(formData.value[item.fileIdKey] ? "替换" : "上传"), 1)]),
											_: 2
										}, 1032, ["icon", "loading"])]),
										_: 2
									}, 1032, ["accept", "on-change"]),
									formData.value[item.fileIdKey] ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										size: "small",
										link: "",
										type: "primary",
										icon: unref(download_default),
										onClick: ($event) => downloadEmployeeFile(formData.value[item.fileIdKey], formData.value[item.fileNameKey])
									}, {
										default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode(" 查看 ", -1)])]),
										_: 1
									}, 8, ["icon", "onClick"])) : createCommentVNode("", true),
									formData.value[item.fileIdKey] ? (openBlock(), createBlock(_component_el_button, {
										key: 1,
										size: "small",
										link: "",
										type: "danger",
										icon: unref(delete_default),
										onClick: ($event) => clearProfileFile(item)
									}, {
										default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode(" 移除 ", -1)])]),
										_: 1
									}, 8, ["icon", "onClick"])) : createCommentVNode("", true)
								])]);
							}), 64))])], 512),
							createBaseVNode("section", {
								class: "emp-sect",
								ref: (el) => setSectRef("hrdocs", el)
							}, [createBaseVNode("div", _hoisted_37, [createBaseVNode("span", _hoisted_38, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(folder_default))]),
								_: 1
							})]), _cache[61] || (_cache[61] = createBaseVNode("h4", null, "人事附件", -1))]), createBaseVNode("div", _hoisted_39, [(openBlock(), createElementBlock(Fragment, null, renderList(hrDocDefs, (item) => {
								return createBaseVNode("div", {
									key: item.type,
									class: "profile-file-card"
								}, [createBaseVNode("div", _hoisted_40, [createBaseVNode("strong", null, toDisplayString(item.type), 1), hrDocOf(item.type) ? (openBlock(), createElementBlock("span", _hoisted_41, [createBaseVNode("a", {
									href: "javascript:void(0)",
									onClick: withModifiers(($event) => downloadEmployeeFile(hrDocOf(item.type).fileId, hrDocOf(item.type).name), ["prevent"])
								}, toDisplayString(hrDocOf(item.type).name), 9, _hoisted_42)])) : (openBlock(), createElementBlock("span", _hoisted_43, "未上传"))]), createBaseVNode("div", _hoisted_44, [createVNode(_component_el_upload, {
									"show-file-list": false,
									"http-request": (opt) => handleHrDocUpload(item.type, opt.file)
								}, {
									default: withCtx(() => [createVNode(_component_el_button, {
										size: "small",
										icon: unref(upload_default),
										loading: uploadingHrDocType.value === item.type
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(hrDocOf(item.type) ? "替换" : "上传"), 1)]),
										_: 2
									}, 1032, ["icon", "loading"])]),
									_: 2
								}, 1032, ["http-request"]), hrDocOf(item.type) ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									size: "small",
									link: "",
									type: "danger",
									icon: unref(delete_default),
									onClick: ($event) => removeHrDoc(item.type)
								}, {
									default: withCtx(() => [..._cache[62] || (_cache[62] = [createTextVNode(" 移除 ", -1)])]),
									_: 1
								}, 8, ["icon", "onClick"])) : createCommentVNode("", true)])]);
							}), 64))])], 512),
							createBaseVNode("section", {
								class: "emp-sect",
								ref: (el) => setSectRef("emergency", el)
							}, [createBaseVNode("div", _hoisted_45, [createBaseVNode("span", _hoisted_46, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(phone_default))]),
								_: 1
							})]), createBaseVNode("h4", null, toDisplayString(_ctx.$t("org.tabEmergency")), 1)]), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.emergencyContact") }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: formData.value.emergencyContact,
											"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => formData.value.emergencyContact = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: _ctx.$t("org.emergencyPhone") }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: formData.value.emergencyPhone,
											"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => formData.value.emergencyPhone = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								})]),
								_: 1
							})], 512),
							canManageAccountSecurity.value ? (openBlock(), createElementBlock("section", {
								key: 0,
								class: "emp-sect",
								ref: (el) => setSectRef("account", el)
							}, [createBaseVNode("div", _hoisted_47, [
								createBaseVNode("span", _hoisted_48, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(lock_default))]),
									_: 1
								})]),
								_cache[63] || (_cache[63] = createBaseVNode("h4", null, "登录账号", -1)),
								_cache[64] || (_cache[64] = createBaseVNode("small", null, "这里只管账号、启停和密码；角色权限在角色管理统一设置", -1))
							]), createBaseVNode("div", _hoisted_49, [createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "登录账号" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: formData.value.username,
												"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => formData.value.username = $event),
												disabled: isEdit.value && !!formData.value.userId && !canEditEmpCode.value,
												placeholder: "留空默认用手机号或工号"
											}, null, 8, ["modelValue", "disabled"]), _cache[65] || (_cache[65] = createBaseVNode("div", { class: "account-hint" }, "用于登录系统。已有账号不建议改名,避免员工登录习惯被打断;确需修改仅管理员可操作。", -1))]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "系统角色" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_50, [
												!accountRoleNames(formData.value).length ? (openBlock(), createElementBlock("span", _hoisted_51, "未分配（账号保持受限）")) : createCommentVNode("", true),
												(openBlock(true), createElementBlock(Fragment, null, renderList(accountRoleNames(formData.value), (rn) => {
													return openBlock(), createBlock(_component_el_tag, {
														key: rn,
														size: "small",
														effect: "plain"
													}, {
														default: withCtx(() => [createTextVNode(toDisplayString(rn), 1)]),
														_: 2
													}, 1024);
												}), 128)),
												createVNode(_component_el_button, {
													link: "",
													type: "primary",
													onClick: goRoleManagement
												}, {
													default: withCtx(() => [..._cache[66] || (_cache[66] = [createTextVNode("前往角色管理", -1)])]),
													_: 1
												})
											]), _cache[67] || (_cache[67] = createBaseVNode("div", { class: "account-hint" }, "此处仅展示，不再修改角色，避免同一个人出现多套权限口径。", -1))]),
											_: 1
										})]),
										_: 1
									}),
									!isEdit.value ? (openBlock(), createBlock(_component_el_col, {
										key: 0,
										span: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "初始口令" }, {
											default: withCtx(() => [..._cache[68] || (_cache[68] = [createBaseVNode("div", { class: "account-hint" }, "账号保存后由系统随机生成，仅展示一次；员工首次登录必须修改。", -1)])]),
											_: 1
										})]),
										_: 1
									})) : (openBlock(), createBlock(_component_el_col, {
										key: 1,
										span: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "登录密码" }, {
											default: withCtx(() => [
												createVNode(_component_el_button, {
													disabled: !formData.value.userId,
													onClick: handleResetPwd
												}, {
													default: withCtx(() => [..._cache[69] || (_cache[69] = [createTextVNode("重置登录密码", -1)])]),
													_: 1
												}, 8, ["disabled"]),
												createVNode(_component_el_button, {
													disabled: !formData.value.userId,
													onClick: handleResetMfa
												}, {
													default: withCtx(() => [..._cache[70] || (_cache[70] = [createTextVNode("重置 MFA", -1)])]),
													_: 1
												}, 8, ["disabled"]),
												!formData.value.userId ? (openBlock(), createElementBlock("div", _hoisted_52, "保存后将为该员工开通账号。")) : (openBlock(), createElementBlock("div", _hoisted_53, "员工更换验证器设备时使用；重置后全部会话立即失效，下次登录重新绑定。"))
											]),
											_: 1
										})]),
										_: 1
									})),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "允许登录" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: formData.value.accountEnabled,
												"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => formData.value.accountEnabled = $event)
											}, null, 8, ["modelValue"]), _cache[71] || (_cache[71] = createBaseVNode("div", { class: "account-hint" }, "关闭后该员工无法登录(不影响档案)。", -1))]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})])], 512)) : (openBlock(), createBlock(_component_el_alert, {
								key: 1,
								type: "info",
								closable: false,
								"show-icon": "",
								title: "人事角色可维护员工档案；登录账号和安全设置由老板管理，系统角色只在「角色管理」设置。",
								class: "account-merge-alert"
							}))
						]),
						_: 1
					}, 8, ["model"])], 544)])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: resignDialog.visible,
					"onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => resignDialog.visible = $event),
					title: "办理员工离职",
					width: "min(560px, calc(100vw - 24px))",
					class: "employee-resign-dialog",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[39] || (_cache[39] = ($event) => resignDialog.visible = false) }, {
						default: withCtx(() => [..._cache[74] || (_cache[74] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "danger",
						loading: resignDialog.saving,
						disabled: !resignDialog.confirmed,
						onClick: submitResign
					}, {
						default: withCtx(() => [..._cache[75] || (_cache[75] = [createTextVNode(" 确认离职并停用账号 ", -1)])]),
						_: 1
					}, 8, ["loading", "disabled"])]),
					default: withCtx(() => [
						resignDialog.employee ? (openBlock(), createElementBlock("div", _hoisted_54, [createBaseVNode("span", _hoisted_55, toDisplayString(String(resignDialog.employee.name || "员").slice(0, 1)), 1), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(resignDialog.employee.name), 1), createBaseVNode("p", null, toDisplayString(resignDialog.employee.empCode || "无工号") + " · " + toDisplayString(resignDialog.employee.deptName || "未分部门") + " · " + toDisplayString(empStatusText(resignDialog.employee.status)), 1)])])) : createCommentVNode("", true),
						createVNode(_component_el_alert, {
							type: "error",
							closable: false,
							"show-icon": "",
							title: "确认离职后，该员工的登录账号会立即停用，所有当前登录会话会立即失效。历史业务记录不会删除。"
						}),
						createVNode(_component_el_form, {
							"label-position": "top",
							class: "resign-form"
						}, {
							default: withCtx(() => [createVNode(_component_el_form_item, {
								label: "真实离职日期",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: resignDialog.resignDate,
									"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => resignDialog.resignDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									"disabled-date": disableFutureResignDate,
									placeholder: "请选择员工真实离职日期",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"]), _cache[72] || (_cache[72] = createBaseVNode("div", { class: "field-tip" }, "该日期会写入离职档案和离职人员中心，不使用合同结束日期代替。", -1))]),
								_: 1
							}), createVNode(_component_el_checkbox, {
								modelValue: resignDialog.confirmed,
								"onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => resignDialog.confirmed = $event),
								class: "resign-confirm-check"
							}, {
								default: withCtx(() => [..._cache[73] || (_cache[73] = [createTextVNode(" 我已核对员工身份和真实离职日期，并知晓账号与现有会话将立即失效 ", -1)])]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: importDialog.visible,
					"onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => importDialog.visible = $event),
					title: "批量导入公司人员",
					width: "980px",
					class: "employee-import-dialog",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [
						createVNode(_component_el_button, { onClick: _cache[42] || (_cache[42] = ($event) => importDialog.visible = false) }, {
							default: withCtx(() => [..._cache[84] || (_cache[84] = [createTextVNode("关闭", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, { onClick: downloadEmployeeTemplate }, {
							default: withCtx(() => [..._cache[85] || (_cache[85] = [createTextVNode("下载模板", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, {
							type: "primary",
							loading: importingEmployees.value,
							disabled: employeeImportStats.value.ready === 0,
							onClick: submitEmployeeImport
						}, {
							default: withCtx(() => [..._cache[86] || (_cache[86] = [createTextVNode(" 确认导入可用人员 ", -1)])]),
							_: 1
						}, 8, ["loading", "disabled"])
					]),
					default: withCtx(() => [createBaseVNode("div", _hoisted_56, [createBaseVNode("div", _hoisted_57, [
						_cache[79] || (_cache[79] = createBaseVNode("div", { class: "employee-import-tip" }, [createBaseVNode("strong", null, "粘贴 Excel 人员表"), createBaseVNode("p", null, "支持字段：工号、姓名、部门、手机号、登录账号、允许登录、邮箱、入职日期、状态、备注。开通账号时由系统随机生成一次性初始口令。")], -1)),
						createVNode(_component_el_input, {
							modelValue: importText.value,
							"onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => importText.value = $event),
							type: "textarea",
							rows: 9,
							placeholder: "从 Excel 复制表头和人员数据后粘贴到这里"
						}, null, 8, ["modelValue"]),
						createBaseVNode("div", _hoisted_58, [
							createVNode(_component_el_button, { onClick: fillEmployeeImportSample }, {
								default: withCtx(() => [..._cache[76] || (_cache[76] = [createTextVNode("填充示例", -1)])]),
								_: 1
							}),
							createVNode(_component_el_button, {
								type: "primary",
								onClick: parseEmployeeImport
							}, {
								default: withCtx(() => [..._cache[77] || (_cache[77] = [createTextVNode("解析预览", -1)])]),
								_: 1
							}),
							createVNode(_component_el_button, { onClick: clearEmployeeImport }, {
								default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("清空", -1)])]),
								_: 1
							}),
							createVNode(_component_el_button, {
								type: "success",
								loading: importingEmployees.value,
								disabled: employeeImportStats.value.ready === 0,
								onClick: submitEmployeeImport
							}, {
								default: withCtx(() => [createTextVNode(" 导入 " + toDisplayString(employeeImportStats.value.ready) + " 人 ", 1)]),
								_: 1
							}, 8, ["loading", "disabled"])
						])
					]), createBaseVNode("div", _hoisted_59, [
						createBaseVNode("div", null, [_cache[80] || (_cache[80] = createBaseVNode("span", null, "预览行", -1)), createBaseVNode("b", null, toDisplayString(employeeImportStats.value.total), 1)]),
						createBaseVNode("div", null, [_cache[81] || (_cache[81] = createBaseVNode("span", null, "可导入", -1)), createBaseVNode("b", null, toDisplayString(employeeImportStats.value.ready), 1)]),
						createBaseVNode("div", null, [_cache[82] || (_cache[82] = createBaseVNode("span", null, "待修正", -1)), createBaseVNode("b", null, toDisplayString(employeeImportStats.value.error), 1)]),
						createBaseVNode("div", null, [_cache[83] || (_cache[83] = createBaseVNode("span", null, "角色覆盖", -1)), createBaseVNode("b", null, toDisplayString(employeeImportStats.value.roles), 1)])
					])]), createVNode(_component_el_table, {
						data: importPreviewRows.value,
						border: "",
						stripe: "",
						height: "320",
						"empty-text": "请先粘贴人员表并解析"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "rowNo",
								label: "行号",
								width: "70"
							}),
							createVNode(_component_el_table_column, {
								prop: "employee.empCode",
								label: "工号",
								width: "110"
							}),
							createVNode(_component_el_table_column, {
								prop: "employee.name",
								label: "姓名",
								width: "100"
							}),
							createVNode(_component_el_table_column, {
								label: "部门",
								"min-width": "190"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_60, [createBaseVNode("strong", null, toDisplayString(row.employee.deptName || row.raw.deptName || "未填部门"), 1)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "业务角色",
								width: "130"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: roleCoverageTag(row.role.level),
									size: "small",
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.role.label), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: row.status === "ready" ? "success" : "danger",
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.statusText), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "问题/定位",
								"min-width": "260"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(row.issues.length ? row.issues.join("；") : row.role.flow), 1)]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: credentialDialog.visible,
					"onUpdate:modelValue": _cache[45] || (_cache[45] = ($event) => credentialDialog.visible = $event),
					title: "一次性初始口令",
					width: "680px",
					"append-to-body": "",
					"destroy-on-close": "",
					onClosed: clearInitialCredentials
				}, {
					footer: withCtx(() => [initialCredentials.value.length > 1 ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						onClick: copyAllCredentials
					}, {
						default: withCtx(() => [..._cache[88] || (_cache[88] = [createTextVNode("复制全部", -1)])]),
						_: 1
					})) : createCommentVNode("", true), createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[44] || (_cache[44] = ($event) => credentialDialog.visible = false)
					}, {
						default: withCtx(() => [..._cache[89] || (_cache[89] = [createTextVNode("我已妥善保存", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_alert, {
						type: "warning",
						closable: false,
						"show-icon": "",
						title: "初始口令只展示这一次。请通过可信渠道交给员工，员工首次登录后必须修改。",
						class: "credential-alert"
					}), createVNode(_component_el_table, {
						data: initialCredentials.value,
						border: "",
						"max-height": "320"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "username",
								label: "登录账号",
								"min-width": "160"
							}),
							createVNode(_component_el_table_column, {
								prop: "initialPassword",
								label: "随机初始口令",
								"min-width": "230"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("code", _hoisted_61, toDisplayString(row.initialPassword), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "92",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => copyCredential(row)
								}, {
									default: withCtx(() => [..._cache[87] || (_cache[87] = [createTextVNode("复制", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])]),
					_: 1
				}, 8, ["modelValue"]),
				detailData.value ? (openBlock(), createBlock(BusinessDetailDrawer_default, {
					key: 1,
					modelValue: drawerVisible.value,
					"onUpdate:modelValue": _cache[48] || (_cache[48] = ($event) => drawerVisible.value = $event),
					title: detailData.value.name || _ctx.$t("org.empDetail"),
					subtitle: detailData.value.deptName || "—",
					eyebrow: _ctx.$t("org.empDetail"),
					avatar: employeeAvatar(detailData.value),
					"avatar-class": employeeAvatarClass(detailData.value.status),
					"status-text": empStatusText(detailData.value.status),
					"status-type": empStatusType(detailData.value.status),
					size: "560px"
				}, {
					meta: withCtx(() => [createBaseVNode("div", _hoisted_62, [
						createBaseVNode("div", _hoisted_63, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.empCode")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.empCode || "—"), 1)]),
						createBaseVNode("div", _hoisted_64, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.status")), 1), createBaseVNode("b", null, toDisplayString(empStatusText(detailData.value.status)), 1)]),
						createBaseVNode("div", _hoisted_65, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.hireDate")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.hireDate || "—"), 1)]),
						createBaseVNode("div", _hoisted_66, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.regularDate")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.regularDate || "—"), 1)]),
						createBaseVNode("div", _hoisted_67, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.phone")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.phone || "—"), 1)])
					])]),
					timeline: withCtx(() => [
						createBaseVNode("div", _hoisted_81, [_cache[102] || (_cache[102] = createBaseVNode("i", { class: "bd-timeline-dot success" }, null, -1)), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(_ctx.$t("org.hireDate")), 1), createBaseVNode("p", null, toDisplayString(detailData.value.hireDate || "—") + " · " + toDisplayString(detailData.value.deptName || "—"), 1)])]),
						createBaseVNode("div", _hoisted_82, [_cache[103] || (_cache[103] = createBaseVNode("i", { class: "bd-timeline-dot" }, null, -1)), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(_ctx.$t("org.regularDate")), 1), createBaseVNode("p", null, toDisplayString(detailData.value.regularDate || "—") + " · 当前状态 " + toDisplayString(empStatusText(detailData.value.status)), 1)])]),
						createBaseVNode("div", _hoisted_83, [_cache[104] || (_cache[104] = createBaseVNode("i", { class: "bd-timeline-dot" }, null, -1)), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(_ctx.$t("org.tabContract")), 1), createBaseVNode("p", null, toDisplayString(detailData.value.contractStart || "—") + " 至 " + toDisplayString(detailData.value.contractEnd || "—"), 1)])])
					]),
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[46] || (_cache[46] = ($event) => drawerVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.close")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						disabled: Number(detailData.value.id) !== detailTargetEmployeeId.value,
						onClick: _cache[47] || (_cache[47] = ($event) => {
							handleEdit(detailData.value);
							drawerVisible.value = false;
						})
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.edit")), 1)]),
						_: 1
					}, 8, ["disabled"])]),
					default: withCtx(() => [
						_cache[105] || (_cache[105] = createBaseVNode("div", { class: "bd-section-title" }, "个人信息", -1)),
						createBaseVNode("div", _hoisted_68, [
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.gender")), 1), createBaseVNode("b", null, toDisplayString(genderText(detailData.value.gender)), 1)]),
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.birthDate")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.birthDate || "—"), 1)]),
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.email")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.email || "—"), 1)]),
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.idCard")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.idCard || "—"), 1)]),
							createBaseVNode("div", null, [_cache[90] || (_cache[90] = createBaseVNode("span", null, "民族", -1)), createBaseVNode("b", null, toDisplayString(detailData.value.ethnicity || "—"), 1)]),
							createBaseVNode("div", null, [_cache[91] || (_cache[91] = createBaseVNode("span", null, "籍贯", -1)), createBaseVNode("b", null, toDisplayString(detailData.value.nativePlace || "—"), 1)]),
							createBaseVNode("div", null, [_cache[92] || (_cache[92] = createBaseVNode("span", null, "政治面貌", -1)), createBaseVNode("b", null, toDisplayString(detailData.value.politicalStatus || "—"), 1)]),
							createBaseVNode("div", null, [_cache[93] || (_cache[93] = createBaseVNode("span", null, "婚姻情况", -1)), createBaseVNode("b", null, toDisplayString(detailData.value.maritalStatus || "—"), 1)]),
							createBaseVNode("div", null, [_cache[94] || (_cache[94] = createBaseVNode("span", null, "户口类型", -1)), createBaseVNode("b", null, toDisplayString(detailData.value.householdType || "—"), 1)]),
							createBaseVNode("div", _hoisted_69, [_cache[95] || (_cache[95] = createBaseVNode("span", null, "户口所在地", -1)), createBaseVNode("b", null, toDisplayString(detailData.value.householdLocation || "—"), 1)]),
							createBaseVNode("div", _hoisted_70, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.address")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.address || "—"), 1)])
						]),
						_cache[106] || (_cache[106] = createBaseVNode("div", { class: "bd-section-title" }, "任职与合同", -1)),
						createBaseVNode("div", _hoisted_71, [
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.deptName")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.deptName || "—"), 1)]),
							createBaseVNode("div", null, [_cache[96] || (_cache[96] = createBaseVNode("span", null, "直属上级", -1)), createBaseVNode("b", null, toDisplayString(detailData.value.managerName || "未设置"), 1)]),
							createBaseVNode("div", null, [_cache[97] || (_cache[97] = createBaseVNode("span", null, "业务角色", -1)), createBaseVNode("b", null, toDisplayString(employeeBusinessRole(detailData.value).label), 1)]),
							createBaseVNode("div", null, [_cache[98] || (_cache[98] = createBaseVNode("span", null, "承接链路", -1)), createBaseVNode("b", null, toDisplayString(employeeBusinessRole(detailData.value).flow), 1)]),
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.contractStart")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.contractStart || "—"), 1)]),
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.contractEnd")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.contractEnd || "—"), 1)]),
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.education")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.education || "—"), 1)]),
							createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.major")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.major || "—"), 1)]),
							createBaseVNode("div", _hoisted_72, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.university")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.university || "—"), 1)])
						]),
						_cache[107] || (_cache[107] = createBaseVNode("div", { class: "bd-section-title" }, "档案附件", -1)),
						createBaseVNode("div", _hoisted_73, [(openBlock(), createElementBlock(Fragment, null, renderList(employeeAttachmentDefs, (item) => {
							return createBaseVNode("div", {
								key: item.key,
								class: "employee-attachment-row"
							}, [createBaseVNode("span", null, toDisplayString(item.label), 1), detailData.value[item.fileIdKey] ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								link: "",
								type: "primary",
								icon: unref(download_default),
								onClick: ($event) => downloadEmployeeFile(detailData.value[item.fileIdKey], detailData.value[item.fileNameKey])
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(detailData.value[item.fileNameKey] || "查看文件"), 1)]),
								_: 2
							}, 1032, ["icon", "onClick"])) : (openBlock(), createElementBlock("b", _hoisted_74, "未上传"))]);
						}), 64))]),
						_cache[108] || (_cache[108] = createBaseVNode("div", { class: "bd-section-title" }, "人事附件", -1)),
						createBaseVNode("div", _hoisted_75, [(openBlock(), createElementBlock(Fragment, null, renderList(hrDocDefs, (item) => {
							return createBaseVNode("div", {
								key: item.type,
								class: "employee-attachment-row"
							}, [createBaseVNode("span", null, toDisplayString(item.type), 1), detailHrDocOf(item.type) ? (openBlock(), createElementBlock("a", {
								key: 0,
								href: "javascript:void(0)",
								class: "hr-doc-link",
								onClick: withModifiers(($event) => downloadEmployeeFile(detailHrDocOf(item.type).fileId, detailHrDocOf(item.type).name), ["prevent"])
							}, toDisplayString(detailHrDocOf(item.type).name || "查看文件"), 9, _hoisted_76)) : (openBlock(), createElementBlock("b", _hoisted_77, "未上传"))]);
						}), 64))]),
						_cache[109] || (_cache[109] = createBaseVNode("div", { class: "bd-section-title" }, "登录与权限", -1)),
						createBaseVNode("div", _hoisted_78, [
							createBaseVNode("div", null, [_cache[99] || (_cache[99] = createBaseVNode("span", null, "登录账号", -1)), createBaseVNode("b", null, toDisplayString(detailData.value.username || "未开通"), 1)]),
							createBaseVNode("div", null, [_cache[100] || (_cache[100] = createBaseVNode("span", null, "账号状态", -1)), createBaseVNode("b", null, toDisplayString(accountStatusText(detailData.value)), 1)]),
							createBaseVNode("div", _hoisted_79, [_cache[101] || (_cache[101] = createBaseVNode("span", null, "系统角色", -1)), createBaseVNode("b", null, toDisplayString(accountRoleNames(detailData.value).join("、") || "未分配"), 1)])
						]),
						_cache[110] || (_cache[110] = createBaseVNode("div", { class: "bd-section-title" }, "紧急联系人", -1)),
						createBaseVNode("div", _hoisted_80, [createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.emergencyContact")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.emergencyContact || "—"), 1)]), createBaseVNode("div", null, [createBaseVNode("span", null, toDisplayString(_ctx.$t("org.emergencyPhone")), 1), createBaseVNode("b", null, toDisplayString(detailData.value.emergencyPhone || "—"), 1)])])
					]),
					_: 1
				}, 8, [
					"modelValue",
					"title",
					"subtitle",
					"eyebrow",
					"avatar",
					"avatar-class",
					"status-text",
					"status-type"
				])) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-1f515b85"]]);
//#endregion
export { employee_default as default };
