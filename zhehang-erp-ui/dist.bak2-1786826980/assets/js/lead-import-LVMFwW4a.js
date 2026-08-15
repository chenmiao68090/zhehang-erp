import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $t as download_default, Bn as refresh_default, Ct as arrow_left_default, F as ElEmpty, Ft as circle_check_filled_default, Pt as circle_check_default, _ as ElTableColumn, br as warning_filled_default, dr as upload_filled_default, er as success_filled_default, fn as info_filled_default, g as ElTable, gn as magic_stick_default, it as ElTag, l as ElUpload, mn as loading_default, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, vt as ElAlert, wt as arrow_right_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { a as poolRuleApi, i as poolConfigApi, r as leadApi } from "./crm-DKTvHmZR.js";
import { i as getLeadImportSourceRequirement, s as resolveLeadImportSourceType, t as LEAD_IMPORT_SOURCE_SCENES } from "./lead-source-B8JVaFME.js";
import { a as normalizeLeadImportMatrix, i as escapeCsvCell, n as autoMapLeadImportHeaders, o as parseLeadImportCsv, r as buildLeadImportRows, t as LEAD_IMPORT_FIELDS } from "./lead-import-BToiZPuH.js";
import { readSheet } from "read-excel-file/browser";
//#region src/views/crm/lead-import.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "lead-import-page" };
var _hoisted_2 = { class: "page-header" };
var _hoisted_3 = { class: "header-main" };
var _hoisted_4 = {
	class: "step-nav",
	"aria-label": "导入步骤"
};
var _hoisted_5 = ["disabled", "onClick"];
var _hoisted_6 = { class: "step-number" };
var _hoisted_7 = { class: "step-label" };
var _hoisted_8 = { class: "step-body" };
var _hoisted_9 = {
	key: 0,
	class: "content-card source-step"
};
var _hoisted_10 = { class: "section-heading" };
var _hoisted_11 = { class: "source-grid" };
var _hoisted_12 = ["onClick"];
var _hoisted_13 = { class: "source-index" };
var _hoisted_14 = { class: "source-copy" };
var _hoisted_15 = { class: "config-grid" };
var _hoisted_16 = { class: "form-field" };
var _hoisted_17 = { key: 0 };
var _hoisted_18 = { key: 1 };
var _hoisted_19 = { key: 2 };
var _hoisted_20 = { class: "form-field" };
var _hoisted_21 = { class: "form-field" };
var _hoisted_22 = { class: "pool-option" };
var _hoisted_23 = { class: "form-field" };
var _hoisted_24 = { key: 0 };
var _hoisted_25 = { key: 1 };
var _hoisted_26 = { key: 2 };
var _hoisted_27 = { class: "destination-note" };
var _hoisted_28 = {
	key: 1,
	class: "content-card upload-step"
};
var _hoisted_29 = { class: "section-heading" };
var _hoisted_30 = { class: "batch-context" };
var _hoisted_31 = {
	key: 0,
	class: "file-state is-loading"
};
var _hoisted_32 = {
	key: 1,
	class: "file-summary"
};
var _hoisted_33 = { class: "file-facts" };
var _hoisted_34 = { class: "mini-preview" };
var _hoisted_35 = { class: "raw-table-scroll" };
var _hoisted_36 = {
	key: 2,
	class: "content-card mapping-step"
};
var _hoisted_37 = { class: "section-heading" };
var _hoisted_38 = { class: "mapping-score" };
var _hoisted_39 = { class: "mapping-toolbar" };
var _hoisted_40 = { class: "field-legend" };
var _hoisted_41 = { class: "system-field" };
var _hoisted_42 = { key: 0 };
var _hoisted_43 = {
	key: 0,
	class: "mapping-ok"
};
var _hoisted_44 = {
	key: 1,
	class: "mapping-missing"
};
var _hoisted_45 = {
	key: 2,
	class: "mapping-skip"
};
var _hoisted_46 = {
	key: 0,
	class: "mapped-preview"
};
var _hoisted_47 = { class: "preview-cards" };
var _hoisted_48 = {
	key: 3,
	class: "content-card preflight-step"
};
var _hoisted_49 = { class: "section-heading" };
var _hoisted_50 = { class: "summary-grid" };
var _hoisted_51 = {
	key: 0,
	class: "warning-line"
};
var _hoisted_52 = {
	key: 0,
	class: "existing-record-cell"
};
var _hoisted_53 = { key: 0 };
var _hoisted_54 = { key: 1 };
var _hoisted_55 = { class: "mobile-result-list" };
var _hoisted_56 = {
	key: 0,
	class: "mobile-existing-record"
};
var _hoisted_57 = {
	key: 4,
	class: "content-card result-step"
};
var _hoisted_58 = { class: "summary-grid result-summary" };
var _hoisted_59 = { class: "is-success" };
var _hoisted_60 = { class: "is-muted" };
var _hoisted_61 = { class: "is-warning" };
var _hoisted_62 = { class: "is-danger" };
var _hoisted_63 = {
	key: 0,
	class: "problem-panel"
};
var _hoisted_64 = { class: "result-actions" };
var _hoisted_65 = {
	key: 0,
	class: "action-bar"
};
var _hoisted_66 = { class: "action-context" };
var _hoisted_67 = { class: "action-buttons" };
var MAX_IMPORT_ROWS = 1e5;
//#endregion
//#region src/views/crm/lead-import.vue
var lead_import_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "lead-import",
	setup(__props) {
		const STEP_LABELS = [
			"来源与去向",
			"上传文件",
			"字段映射",
			"查重校验",
			"导入结果"
		];
		const EMPTY_PREFLIGHT = {
			total: 0,
			importable: 0,
			duplicate: 0,
			conflict: 0,
			error: 0,
			warning: 0
		};
		const EMPTY_CONFIRM = {
			total: 0,
			imported: 0,
			duplicate: 0,
			conflict: 0,
			error: 0,
			warning: 0
		};
		const router = useRouter();
		const route = useRoute();
		const userStore = useUserStore();
		const MANAGER_ROLES = new Set([
			"admin",
			"boss",
			"manager",
			"dept_manager"
		]);
		const canManageSales = computed(() => (userStore.roles || []).some((role) => {
			const baseRole = String(role).split("__", 1)[0];
			return MANAGER_ROLES.has(String(role)) || MANAGER_ROLES.has(baseRole);
		}));
		const step = ref(0);
		const importLimitLoading = ref(true);
		const singleImportLimit = ref(1e3);
		const dailyImportLimit = ref(1e4);
		const todayImported = ref(0);
		const remainingImportLimit = computed(() => Math.max(0, dailyImportLimit.value - todayImported.value));
		const config = reactive({
			sourceType: 0,
			sourcePlatform: "",
			sourceDetail: "",
			batchName: ""
		});
		const lastAutoBatchName = ref("");
		const selectedSceneKey = ref("");
		const selectedSourceScene = computed(() => LEAD_IMPORT_SOURCE_SCENES.find((item) => item.key === selectedSceneKey.value));
		const sourcePlatforms = computed(() => {
			var _selectedSourceScene$;
			return ((_selectedSourceScene$ = selectedSourceScene.value) === null || _selectedSourceScene$ === void 0 ? void 0 : _selectedSourceScene$.platforms) || [];
		});
		const platformPlaceholder = computed(() => selectedSourceScene.value ? `请选择或输入${selectedSourceScene.value.label}的具体平台` : "请先选择一级来源");
		const sourceRequirement = computed(() => getLeadImportSourceRequirement(config.sourceType));
		const sourceMetadataValid = computed(() => {
			const hasPlatform = Boolean(config.sourcePlatform.trim());
			const hasDetail = Boolean(config.sourceDetail.trim());
			if (sourceRequirement.value === "platform") return hasPlatform;
			if (sourceRequirement.value === "detail") return hasDetail;
			if (sourceRequirement.value === "either") return hasPlatform || hasDetail;
			return false;
		});
		const sourceRequirementHint = computed(() => {
			if (!selectedSourceScene.value) return "";
			if (sourceRequirement.value === "platform") return sourceMetadataValid.value ? "具体平台/渠道已填写，可追溯本批资源来源。" : "此来源必须填写具体平台/渠道后才能继续。";
			if (sourceRequirement.value === "detail") return sourceMetadataValid.value ? "来源说明已填写，可追溯本批资源来源。" : "此来源必须填写来源说明或活动名称后才能继续。";
			return sourceMetadataValid.value ? "平台或来源说明已填写，可追溯本批资源来源。" : "具体平台/渠道与来源说明至少填写一项。";
		});
		const poolLoading = ref(false);
		const poolConfigs = ref([]);
		const destinationKey = ref("company");
		const destinationOptions = computed(() => [{
			key: "company",
			label: "公司公海",
			description: "不指定公海池，进入公司默认公海",
			poolId: null
		}, ...poolConfigs.value.map((pool) => ({
			key: `pool-${pool.id}`,
			label: pool.poolName,
			description: pool.description || "当前租户已启用公海",
			poolId: pool.id
		}))]);
		const selectedDestination = computed(() => destinationOptions.value.find((item) => item.key === destinationKey.value) || destinationOptions.value[0]);
		const destinationLabel = computed(() => {
			var _selectedDestination$;
			return ((_selectedDestination$ = selectedDestination.value) === null || _selectedDestination$ === void 0 ? void 0 : _selectedDestination$.label) || "公司公海";
		});
		const selectedPoolId = computed(() => {
			var _selectedDestination$2, _selectedDestination$3;
			return (_selectedDestination$2 = (_selectedDestination$3 = selectedDestination.value) === null || _selectedDestination$3 === void 0 ? void 0 : _selectedDestination$3.poolId) !== null && _selectedDestination$2 !== void 0 ? _selectedDestination$2 : null;
		});
		const uploadRef = ref();
		const fileList = ref([]);
		const selectedFileName = ref("");
		const detectedFormat = ref("");
		const fileParsing = ref(false);
		const matrix = ref([]);
		const headers = computed(() => matrix.value[0] || []);
		const dataRowCount = computed(() => matrix.value.slice(1).filter((row) => row.some(Boolean)).length);
		const mappings = reactive({});
		const mappedRows = computed(() => buildLeadImportRows(matrix.value, mappings));
		const mappedFieldCount = computed(() => Object.values(mappings).filter(Boolean).length);
		const preflightLoading = ref(false);
		const previewToken = ref("");
		const preflightSummary = reactive(_objectSpread2({}, EMPTY_PREFLIGHT));
		const preflightRows = ref([]);
		const preflightFilter = ref("ALL");
		const mappedRowMap = computed(() => new Map(mappedRows.value.map((row) => [row.rowNumber, row])));
		const filteredPreflightRows = computed(() => preflightFilter.value === "ALL" ? preflightRows.value : preflightRows.value.filter((row) => row.status === preflightFilter.value));
		const confirmLoading = ref(false);
		const confirmSummary = reactive(_objectSpread2({}, EMPTY_CONFIRM));
		const confirmRows = ref([]);
		const problemRows = computed(() => confirmRows.value.filter((row) => row.status !== "IMPORTED"));
		const canContinue = computed(() => {
			if (step.value === 0) return Boolean(selectedSceneKey.value) && config.sourceType > 0 && sourceMetadataValid.value && Boolean(config.batchName.trim()) && Boolean(destinationKey.value);
			if (step.value === 1) return matrix.value.length > 1 && dataRowCount.value <= 1e3;
			if (step.value === 2) return Boolean(mappings.company) && mappedRows.value.length > 0;
			return true;
		});
		const currentActionContext = computed(() => {
			var _selectedSourceScene$2;
			if (step.value === 0) return config.sourceType ? `${((_selectedSourceScene$2 = selectedSourceScene.value) === null || _selectedSourceScene$2 === void 0 ? void 0 : _selectedSourceScene$2.label) || ""} → ${destinationLabel.value}` : "先选择本批次的真实来源";
			if (step.value === 1) return matrix.value.length ? `${dataRowCount.value} 条待映射` : "请选择 XLSX 或 CSV 文件";
			if (step.value === 2) return `${mappedFieldCount.value} 个字段已匹配`;
			return `${preflightSummary.importable} 条可导入，${preflightSummary.duplicate + preflightSummary.conflict + preflightSummary.error} 条不写入`;
		});
		function unwrapResponse(response) {
			const value = response;
			return value && typeof value === "object" && "code" in value && "data" in value ? value.data : value;
		}
		function selectSource(scene) {
			const shouldRefreshAutoBatch = !config.batchName.trim() || config.batchName === lastAutoBatchName.value;
			selectedSceneKey.value = scene.key;
			config.sourceType = scene.defaultSourceType;
			config.sourcePlatform = "";
			config.sourceDetail = "";
			if (shouldRefreshAutoBatch) {
				const today = /* @__PURE__ */ new Date();
				config.batchName = `${`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`} ${scene.label}`.slice(0, 32);
				lastAutoBatchName.value = config.batchName;
			}
		}
		function handlePlatformChange(value) {
			if (value && value.length > 32) {
				config.sourcePlatform = value.slice(0, 32);
				ElMessage.warning("具体平台/渠道最多32个字，已自动截短");
			}
			const scene = selectedSourceScene.value;
			if (scene) config.sourceType = resolveLeadImportSourceType(scene, config.sourcePlatform);
		}
		function loadPools() {
			return _loadPools.apply(this, arguments);
		}
		function _loadPools() {
			_loadPools = _asyncToGenerator(function* () {
				poolLoading.value = true;
				try {
					const pools = yield poolConfigApi.list();
					const importablePoolTypes = new Set([
						"telemarketing",
						"online",
						"collaboration",
						"new_leads"
					]);
					poolConfigs.value = (Array.isArray(pools) ? pools : []).filter((pool) => Number(pool.status) === 0 && Number(pool.id) > 0 && importablePoolTypes.has(pool.poolType)).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
					const requestedPoolId = Number(route.query.poolId);
					if (Number.isFinite(requestedPoolId) && poolConfigs.value.some((pool) => pool.id === requestedPoolId)) destinationKey.value = `pool-${requestedPoolId}`;
				} catch (_unused) {
					poolConfigs.value = [];
					ElMessage.warning("未能读取公海配置，本次仍可选择公司公海");
				} finally {
					poolLoading.value = false;
				}
			});
			return _loadPools.apply(this, arguments);
		}
		function loadImportLimits() {
			return _loadImportLimits.apply(this, arguments);
		}
		function _loadImportLimits() {
			_loadImportLimits = _asyncToGenerator(function* () {
				importLimitLoading.value = true;
				try {
					var _overview$active, _overview$active2;
					const overview = yield poolRuleApi.overview();
					const configuredSingle = Number(overview === null || overview === void 0 || (_overview$active = overview.active) === null || _overview$active === void 0 ? void 0 : _overview$active.singleImportLimit);
					const configuredDaily = Number(overview === null || overview === void 0 || (_overview$active2 = overview.active) === null || _overview$active2 === void 0 ? void 0 : _overview$active2.dailyImportLimit);
					const usedToday = Number(overview === null || overview === void 0 ? void 0 : overview.todayImported);
					singleImportLimit.value = Number.isFinite(configuredSingle) && configuredSingle > 0 ? Math.min(MAX_IMPORT_ROWS, configuredSingle) : 1e3;
					dailyImportLimit.value = Number.isFinite(configuredDaily) && configuredDaily > 0 ? Math.min(MAX_IMPORT_ROWS, configuredDaily) : 1e4;
					todayImported.value = Number.isFinite(usedToday) && usedToday > 0 ? usedToday : 0;
				} catch (_unused2) {
					singleImportLimit.value = MAX_IMPORT_ROWS;
					dailyImportLimit.value = MAX_IMPORT_ROWS;
					todayImported.value = 0;
					ElMessage.warning("未能读取当前导入额度，文件仍可上传，预检时将由服务器按生效规则校验");
				} finally {
					importLimitLoading.value = false;
				}
			});
			return _loadImportLimits.apply(this, arguments);
		}
		function nextStep() {
			if (!canContinue.value) {
				if (step.value === 0) ElMessage.warning(sourceMetadataValid.value ? "请选择来源、填写批次名称并确认导入去向" : sourceRequirementHint.value);
				if (step.value === 1) ElMessage.warning("请先上传并成功读取文件");
				return;
			}
			step.value += 1;
		}
		function previousStep() {
			if (step.value === 3) clearPreflight();
			step.value = Math.max(0, step.value - 1);
		}
		function navigateToStep(target) {
			if (target >= step.value || step.value === 4) return;
			if (step.value >= 3 && target < 3) clearPreflight();
			step.value = target;
		}
		function goLeadList() {
			router.push("/customer/lead");
		}
		function clearFile() {
			fileList.value = [];
			selectedFileName.value = "";
			detectedFormat.value = "";
			matrix.value = [];
			Object.keys(mappings).forEach((key) => delete mappings[key]);
			clearPreflight();
		}
		function handleFileExceed() {
			ElMessage.warning("每次只处理一个文件，请先移除当前文件后再选择");
		}
		function decodeCsv(buffer) {
			try {
				return {
					text: new TextDecoder("utf-8", { fatal: true }).decode(buffer),
					encoding: "CSV · UTF-8"
				};
			} catch (_unused3) {
				return {
					text: new TextDecoder("gb18030").decode(buffer),
					encoding: "CSV · GBK/GB18030"
				};
			}
		}
		function handleFileChange(_x, _x2) {
			return _handleFileChange.apply(this, arguments);
		}
		function _handleFileChange() {
			_handleFileChange = _asyncToGenerator(function* (file, files) {
				if (!file.raw) return;
				fileList.value = files;
				selectedFileName.value = file.name;
				fileParsing.value = true;
				matrix.value = [];
				try {
					var _normalized$;
					if (file.raw.size > 10 * 1024 * 1024) throw new Error("文件超过10MB，请拆分后重新上传");
					const lowerName = file.name.toLowerCase();
					let parsed;
					if (lowerName.endsWith(".xlsx")) {
						parsed = yield readSheet(file.raw);
						detectedFormat.value = "XLSX";
					} else if (lowerName.endsWith(".csv")) {
						const decoded = decodeCsv(yield file.raw.arrayBuffer());
						parsed = parseLeadImportCsv(decoded.text);
						detectedFormat.value = decoded.encoding;
					} else if (lowerName.endsWith(".xls")) throw new Error("旧版 .xls 暂不支持，请在 Excel 中另存为 .xlsx 后上传");
					else throw new Error("仅支持 .xlsx 和 .csv 文件");
					const normalized = normalizeLeadImportMatrix(parsed);
					const nonEmptyRows = normalized.slice(1).filter((row) => row.some(Boolean)).length;
					if (!((_normalized$ = normalized[0]) === null || _normalized$ === void 0 ? void 0 : _normalized$.some(Boolean)) || nonEmptyRows < 1) throw new Error("文件为空，或只有表头没有数据");
					if (nonEmptyRows > singleImportLimit.value) throw new Error(`文件有 ${nonEmptyRows.toLocaleString()} 条数据，当前单次最多导入 ${singleImportLimit.value.toLocaleString()} 条，请拆分文件后重试`);
					const duplicateHeaders = normalized[0].filter((header, index, all) => header && all.indexOf(header) !== index);
					if (duplicateHeaders.length) throw new Error(`表头存在重名列：${Array.from(new Set(duplicateHeaders)).join("、")}`);
					matrix.value = normalized;
					resetAutoMapping();
					clearPreflight();
				} catch (error) {
					clearFile();
					ElMessage.error(error instanceof Error ? error.message : "文件读取失败，请确认文件格式");
				} finally {
					fileParsing.value = false;
				}
			});
			return _handleFileChange.apply(this, arguments);
		}
		function resetAutoMapping() {
			Object.keys(mappings).forEach((key) => delete mappings[key]);
			Object.assign(mappings, autoMapLeadImportHeaders(headers.value));
		}
		function fieldLevelLabel(level) {
			return level === "required" ? "必填" : level === "recommended" ? "建议" : "补充";
		}
		function fieldLevelType(level) {
			return level === "required" ? "danger" : level === "recommended" ? "warning" : "info";
		}
		function buildRequest() {
			return {
				sourceType: config.sourceType,
				sourcePlatform: config.sourcePlatform.trim() || void 0,
				sourceDetail: config.sourceDetail.trim() || void 0,
				batchName: config.batchName.trim(),
				poolId: selectedPoolId.value,
				rows: mappedRows.value
			};
		}
		function clearPreflight() {
			previewToken.value = "";
			Object.assign(preflightSummary, EMPTY_PREFLIGHT);
			preflightRows.value = [];
			preflightFilter.value = "ALL";
		}
		function runPreflight() {
			return _runPreflight.apply(this, arguments);
		}
		function _runPreflight() {
			_runPreflight = _asyncToGenerator(function* () {
				if (!mappings.company) return ElMessage.warning("请先把文件中的企业名称映射到系统字段");
				if (!mappedRows.value.length) return ElMessage.warning("没有可预检的数据");
				preflightLoading.value = true;
				clearPreflight();
				try {
					const response = unwrapResponse(yield leadApi.importPreflight(buildRequest()));
					previewToken.value = response.previewToken || "";
					Object.assign(preflightSummary, EMPTY_PREFLIGHT, response.summary || {});
					preflightRows.value = Array.isArray(response.rows) ? response.rows : [];
					step.value = 3;
				} catch (_unused4) {
					ElMessage.error("预检失败，数据尚未导入，请检查后重试");
				} finally {
					preflightLoading.value = false;
				}
			});
			return _runPreflight.apply(this, arguments);
		}
		function preflightRowData(row) {
			return row.row || mappedRowMap.value.get(row.rowNumber) || { rowNumber: row.rowNumber };
		}
		function preflightStatusLabel(row) {
			if (row.status === "READY" && hasPreflightWarnings(row)) return "可导入·有提醒";
			return {
				READY: "可导入",
				DUPLICATE: "重复跳过",
				CONFLICT: "需人工处理",
				ERROR: "数据错误"
			}[row.status] || row.status;
		}
		function preflightStatusType(row) {
			if (row.status === "READY" && hasPreflightWarnings(row)) return "warning";
			return {
				READY: "success",
				DUPLICATE: "info",
				CONFLICT: "warning",
				ERROR: "danger"
			}[row.status] || "info";
		}
		function preflightReasonText(row) {
			var _row$warnings;
			const warningTexts = ((_row$warnings = row.warnings) === null || _row$warnings === void 0 ? void 0 : _row$warnings.length) ? row.warnings : (row.warningCodes || []).map((code) => code === "WECHAT_ONLY_WEAK_DEDUPE" ? "只有微信号，查重强度较弱" : code);
			return [...row.reasons || [], ...warningTexts].join("；") || "校验通过";
		}
		function hasPreflightWarnings(row) {
			var _row$warnings2, _row$warningCodes;
			return Boolean(((_row$warnings2 = row.warnings) === null || _row$warnings2 === void 0 ? void 0 : _row$warnings2.length) || ((_row$warningCodes = row.warningCodes) === null || _row$warningCodes === void 0 ? void 0 : _row$warningCodes.length));
		}
		function locateExisting(row) {
			const company = preflightRowData(row).company || "";
			const query = company ? { keyword: company } : {};
			if (row.existingTarget === "PUBLIC_POOL") router.push({
				path: "/customer/lead",
				query
			});
			else if (row.existingTarget === "HISTORY") router.push({
				path: "/customer/lead",
				query: _objectSpread2(_objectSpread2({}, query), {}, { tab: "history" })
			});
			else if (row.existingTarget === "ACTIVE") router.push({
				path: "/customer/customers",
				query: _objectSpread2(_objectSpread2({}, query), {}, { view: "active" })
			});
			else if (row.existingTarget === "CUSTOMER") router.push({
				path: "/customer/customers",
				query: _objectSpread2(_objectSpread2({}, query), {}, { view: "formal" })
			});
		}
		function confirmImport() {
			return _confirmImport.apply(this, arguments);
		}
		function _confirmImport() {
			_confirmImport = _asyncToGenerator(function* () {
				if (!previewToken.value || preflightSummary.importable < 1) return;
				confirmLoading.value = true;
				try {
					const response = unwrapResponse(yield leadApi.importConfirm(_objectSpread2(_objectSpread2({}, buildRequest()), {}, { previewToken: previewToken.value })));
					Object.assign(confirmSummary, EMPTY_CONFIRM, response.summary || {});
					confirmRows.value = Array.isArray(response.rows) ? response.rows : [];
					step.value = 4;
				} catch (_unused5) {
					ElMessage.error("导入未完成，预检凭证可能已失效，请重新预检后再确认");
				} finally {
					confirmLoading.value = false;
				}
			});
			return _confirmImport.apply(this, arguments);
		}
		function downloadCsv(fileName, rows) {
			const content = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
			const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = fileName;
			anchor.click();
			URL.revokeObjectURL(url);
		}
		function downloadTemplate() {
			const templateHeaders = LEAD_IMPORT_FIELDS.map((field) => field.label);
			const sample = {
				企业名称: "杭州示例企业管理有限公司",
				有效手机号: "13800000000",
				企业联系电话: "0571-88888888",
				统一社会信用代码: "91330100MA0000000X",
				"法定代表人/联系人": "张三",
				登记状态: "存续",
				所属省份: "浙江省",
				所属城市: "杭州市",
				所属区县: "西湖区",
				行业门类: "租赁和商务服务业",
				成立日期: "2024-01-15",
				注册地址: "浙江省杭州市西湖区示例路1号",
				经营范围: "企业管理咨询；代理记账"
			};
			downloadCsv("公司资源批量导入模板.csv", [templateHeaders, templateHeaders.map((header) => sample[header] || "")]);
		}
		function downloadProblemCsv() {
			const rows = problemRows.value.map((result) => {
				var _result$reasons;
				const source = mappedRowMap.value.get(result.rowNumber);
				return [
					result.rowNumber,
					result.status,
					(source === null || source === void 0 ? void 0 : source.company) || "",
					(source === null || source === void 0 ? void 0 : source.phone) || (source === null || source === void 0 ? void 0 : source.companyPhone) || "",
					(source === null || source === void 0 ? void 0 : source.creditCode) || "",
					((_result$reasons = result.reasons) === null || _result$reasons === void 0 ? void 0 : _result$reasons.join("；")) || ""
				];
			});
			downloadCsv(`${config.batchName || "公司资源"}_问题清单.csv`, [[
				"原文件行号",
				"处理状态",
				"企业名称",
				"联系电话",
				"统一社会信用代码",
				"原因"
			], ...rows]);
		}
		function startAnotherImport() {
			var _uploadRef$value;
			step.value = 0;
			config.sourceType = 0;
			selectedSceneKey.value = "";
			config.sourcePlatform = "";
			config.sourceDetail = "";
			config.batchName = "";
			lastAutoBatchName.value = "";
			destinationKey.value = "company";
			clearFile();
			Object.assign(confirmSummary, EMPTY_CONFIRM);
			confirmRows.value = [];
			(_uploadRef$value = uploadRef.value) === null || _uploadRef$value === void 0 || _uploadRef$value.clearFiles();
		}
		onMounted(_asyncToGenerator(function* () {
			if (!canManageSales.value) {
				ElMessage.warning("仅主管、老板或管理员可批量导入公司资源");
				yield router.replace("/customer/lead");
				return;
			}
			yield Promise.all([loadPools(), loadImportLimits()]);
		}));
		return (_ctx, _cache) => {
			var _selectedSourceScene$3, _selectedSourceScene$4;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_tag = ElTag;
			const _component_el_alert = ElAlert;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input = ElInput;
			const _component_el_upload = ElUpload;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_empty = ElEmpty;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createVNode(_component_el_button, {
					class: "back-button",
					text: "",
					onClick: goLeadList
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_left_default))]),
						_: 1
					}), _cache[9] || (_cache[9] = createTextVNode(" 返回找客户 ", -1))]),
					_: 1
				}), _cache[10] || (_cache[10] = createBaseVNode("div", null, [createBaseVNode("h1", null, "批量导入公司资源"), createBaseVNode("p", null, "先确认来源和去向，再完成字段映射与查重；重复数据固定跳过，不覆盖原客户。")], -1))]), createVNode(_component_el_button, {
					plain: "",
					onClick: downloadTemplate
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(download_default))]),
						_: 1
					}), _cache[11] || (_cache[11] = createTextVNode(" 下载标准模板 ", -1))]),
					_: 1
				})]),
				createBaseVNode("nav", _hoisted_4, [(openBlock(), createElementBlock(Fragment, null, renderList(STEP_LABELS, (item, index) => {
					return createBaseVNode("button", {
						key: item,
						type: "button",
						class: normalizeClass(["step-item", {
							"is-current": step.value === index,
							"is-done": step.value > index
						}]),
						disabled: index > step.value || step.value === 4,
						onClick: ($event) => navigateToStep(index)
					}, [createBaseVNode("span", _hoisted_6, toDisplayString(step.value > index ? "✓" : index + 1), 1), createBaseVNode("span", _hoisted_7, toDisplayString(item), 1)], 10, _hoisted_5);
				}), 64))]),
				createBaseVNode("main", _hoisted_8, [step.value === 0 ? (openBlock(), createElementBlock("section", _hoisted_9, [
					createBaseVNode("div", _hoisted_10, [_cache[13] || (_cache[13] = createBaseVNode("div", null, [
						createBaseVNode("span", { class: "eyebrow" }, "第 1 步"),
						createBaseVNode("h2", null, "这批公司资源从哪里来、要进入哪里？"),
						createBaseVNode("p", null, "一级来源用于统一经营统计，具体平台或供应渠道单独记录。")
					], -1)), createVNode(_component_el_tag, {
						effect: "plain",
						type: "info"
					}, {
						default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("仅主管、老板或管理员可导入", -1)])]),
						_: 1
					})]),
					createBaseVNode("div", _hoisted_11, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(LEAD_IMPORT_SOURCE_SCENES), (item, sourceIndex) => {
						return openBlock(), createElementBlock("button", {
							key: item.key,
							type: "button",
							class: normalizeClass(["source-card", { "is-active": selectedSceneKey.value === item.key }]),
							onClick: ($event) => selectSource(item)
						}, [
							createBaseVNode("span", _hoisted_13, toDisplayString(String(sourceIndex + 1).padStart(2, "0")), 1),
							createBaseVNode("span", _hoisted_14, [createBaseVNode("strong", null, toDisplayString(item.label), 1), createBaseVNode("small", null, toDisplayString(item.description), 1)]),
							createVNode(_component_el_icon, { class: "source-check" }, {
								default: withCtx(() => [createVNode(unref(circle_check_filled_default))]),
								_: 1
							})
						], 10, _hoisted_12);
					}), 128))]),
					selectedSceneKey.value === "private-domain" ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						class: "business-warning",
						type: "warning",
						closable: false,
						"show-icon": "",
						title: "已签约老客户应在“我的客户”中开展二次业务，不能作为新线索重复导入公海。同一正式客户会按重复记录跳过；只有跨标识或不同主体匹配矛盾等异常才列为冲突。"
					})) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_15, [
						createBaseVNode("label", _hoisted_16, [createBaseVNode("span", null, [_cache[14] || (_cache[14] = createTextVNode(" 具体平台/渠道 ", -1)), sourceRequirement.value === "platform" ? (openBlock(), createElementBlock("b", _hoisted_17, "必填")) : sourceRequirement.value === "either" ? (openBlock(), createElementBlock("b", _hoisted_18, "二选一")) : (openBlock(), createElementBlock("em", _hoisted_19, "选填"))]), createVNode(_component_el_select, {
							modelValue: config.sourcePlatform,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => config.sourcePlatform = $event),
							clearable: "",
							filterable: "",
							"allow-create": "",
							"default-first-option": "",
							disabled: !selectedSourceScene.value,
							placeholder: platformPlaceholder.value,
							onChange: handlePlatformChange
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(sourcePlatforms.value, (platform) => {
								return openBlock(), createBlock(_component_el_option, {
									key: platform,
									label: platform,
									value: platform
								}, null, 8, ["label", "value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"disabled",
							"placeholder"
						])]),
						createBaseVNode("label", _hoisted_20, [_cache[15] || (_cache[15] = createBaseVNode("span", null, [createTextVNode("批次名称 "), createBaseVNode("b", null, "必填")], -1)), createVNode(_component_el_input, {
							modelValue: config.batchName,
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => config.batchName = $event),
							maxlength: "32",
							"show-word-limit": "",
							placeholder: "如：2026年7月滨江新注册企业"
						}, null, 8, ["modelValue"])]),
						createBaseVNode("label", _hoisted_21, [_cache[16] || (_cache[16] = createBaseVNode("span", null, [createTextVNode("导入去向 "), createBaseVNode("b", null, "必填")], -1)), createVNode(_component_el_select, {
							modelValue: destinationKey.value,
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => destinationKey.value = $event),
							loading: poolLoading.value,
							placeholder: "请选择真实启用的公海"
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(destinationOptions.value, (pool) => {
								return openBlock(), createBlock(_component_el_option, {
									key: pool.key,
									value: pool.key,
									label: pool.label
								}, {
									default: withCtx(() => [createBaseVNode("div", _hoisted_22, [createBaseVNode("span", null, toDisplayString(pool.label), 1), createBaseVNode("small", null, toDisplayString(pool.description), 1)])]),
									_: 2
								}, 1032, ["value", "label"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue", "loading"])]),
						createBaseVNode("label", _hoisted_23, [createBaseVNode("span", null, [_cache[17] || (_cache[17] = createTextVNode(" 来源说明/活动名称 ", -1)), sourceRequirement.value === "detail" ? (openBlock(), createElementBlock("b", _hoisted_24, "必填")) : sourceRequirement.value === "either" ? (openBlock(), createElementBlock("b", _hoisted_25, "二选一")) : (openBlock(), createElementBlock("em", _hoisted_26, "选填"))]), createVNode(_component_el_input, {
							modelValue: config.sourceDetail,
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => config.sourceDetail = $event),
							maxlength: "50",
							"show-word-limit": "",
							placeholder: "如：7月代理记账推广、供应商批次编号"
						}, null, 8, ["modelValue"])])
					]),
					sourceRequirementHint.value ? (openBlock(), createElementBlock("div", {
						key: 1,
						class: normalizeClass(["source-requirement", { "is-complete": sourceMetadataValid.value }])
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [sourceMetadataValid.value ? (openBlock(), createBlock(unref(circle_check_filled_default), { key: 0 })) : (openBlock(), createBlock(unref(info_filled_default), { key: 1 }))]),
						_: 1
					}), createBaseVNode("span", null, toDisplayString(sourceRequirementHint.value), 1)], 2)) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_27, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(info_filled_default))]),
						_: 1
					}), _cache[18] || (_cache[18] = createBaseVNode("span", null, "“公司公海”不指定池 ID；其他选项只读取当前租户真实启用的公海配置，不使用历史种子或固定编号。", -1))])
				])) : step.value === 1 ? (openBlock(), createElementBlock("section", _hoisted_28, [
					createBaseVNode("div", _hoisted_29, [createBaseVNode("div", null, [
						_cache[19] || (_cache[19] = createBaseVNode("span", { class: "eyebrow" }, "第 2 步", -1)),
						_cache[20] || (_cache[20] = createBaseVNode("h2", null, "上传客户名单", -1)),
						createBaseVNode("p", null, " 优先使用 XLSX，也支持 UTF-8/GBK CSV；首行为表头，单次最多 " + toDisplayString(singleImportLimit.value.toLocaleString()) + " 条，今日剩余 " + toDisplayString(remainingImportLimit.value.toLocaleString()) + " 条。 ", 1)
					]), createBaseVNode("div", _hoisted_30, [
						createBaseVNode("span", null, toDisplayString((_selectedSourceScene$3 = selectedSourceScene.value) === null || _selectedSourceScene$3 === void 0 ? void 0 : _selectedSourceScene$3.label), 1),
						createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(arrow_right_default))]),
							_: 1
						}),
						createBaseVNode("strong", null, toDisplayString(destinationLabel.value), 1)
					])]),
					createVNode(_component_el_upload, {
						ref_key: "uploadRef",
						ref: uploadRef,
						class: "file-uploader",
						drag: "",
						"auto-upload": false,
						disabled: importLimitLoading.value,
						limit: 1,
						"file-list": fileList.value,
						accept: ".xlsx,.csv",
						"on-change": handleFileChange,
						"on-remove": clearFile,
						"on-exceed": handleFileExceed
					}, {
						default: withCtx(() => [
							createVNode(_component_el_icon, { class: "upload-icon" }, {
								default: withCtx(() => [createVNode(unref(upload_filled_default))]),
								_: 1
							}),
							_cache[21] || (_cache[21] = createBaseVNode("div", { class: "upload-title" }, "拖入 XLSX / CSV，或点击选择文件", -1)),
							_cache[22] || (_cache[22] = createBaseVNode("p", null, "不会在选择文件后直接导入，后续还需映射、预检和确认。", -1))
						]),
						_: 1
					}, 8, ["disabled", "file-list"]),
					fileParsing.value ? (openBlock(), createElementBlock("div", _hoisted_31, [createVNode(_component_el_icon, { class: "is-loading" }, {
						default: withCtx(() => [createVNode(unref(loading_default))]),
						_: 1
					}), _cache[23] || (_cache[23] = createTextVNode(" 正在读取并识别表头… ", -1))])) : matrix.value.length ? (openBlock(), createElementBlock("div", _hoisted_32, [createBaseVNode("div", _hoisted_33, [
						createBaseVNode("div", null, [_cache[24] || (_cache[24] = createBaseVNode("span", null, "文件", -1)), createBaseVNode("strong", null, toDisplayString(selectedFileName.value), 1)]),
						createBaseVNode("div", null, [_cache[25] || (_cache[25] = createBaseVNode("span", null, "数据行", -1)), createBaseVNode("strong", null, toDisplayString(dataRowCount.value) + " 条", 1)]),
						createBaseVNode("div", null, [_cache[26] || (_cache[26] = createBaseVNode("span", null, "识别表头", -1)), createBaseVNode("strong", null, toDisplayString(headers.value.length) + " 列", 1)]),
						createBaseVNode("div", null, [_cache[27] || (_cache[27] = createBaseVNode("span", null, "编码/格式", -1)), createBaseVNode("strong", null, toDisplayString(detectedFormat.value), 1)])
					]), createBaseVNode("div", _hoisted_34, [_cache[28] || (_cache[28] = createBaseVNode("h3", null, "原始数据预览（前 3 行）", -1)), createBaseVNode("div", _hoisted_35, [createBaseVNode("table", null, [createBaseVNode("thead", null, [createBaseVNode("tr", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(headers.value, (header) => {
						return openBlock(), createElementBlock("th", { key: header }, toDisplayString(header), 1);
					}), 128))])]), createBaseVNode("tbody", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(matrix.value.slice(1, 4), (row, rowIndex) => {
						return openBlock(), createElementBlock("tr", { key: rowIndex }, [(openBlock(true), createElementBlock(Fragment, null, renderList(headers.value, (_, columnIndex) => {
							return openBlock(), createElementBlock("td", { key: columnIndex }, toDisplayString(row[columnIndex] || "—"), 1);
						}), 128))]);
					}), 128))])])])])])) : createCommentVNode("", true),
					createVNode(_component_el_alert, {
						class: "upload-rule",
						type: "info",
						closable: false,
						"show-icon": "",
						title: "企业名称为每行必备信息；手机号、企业电话、微信号或统一社会信用代码至少有一项。仅微信号也可导入，但查重强度较弱。"
					})
				])) : step.value === 2 ? (openBlock(), createElementBlock("section", _hoisted_36, [
					createBaseVNode("div", _hoisted_37, [_cache[29] || (_cache[29] = createBaseVNode("div", null, [
						createBaseVNode("span", { class: "eyebrow" }, "第 3 步"),
						createBaseVNode("h2", null, "确认字段映射"),
						createBaseVNode("p", null, "系统已按常见工商表头自动匹配；来源和去向统一使用第一步配置，不读取文件中的自由文本。")
					], -1)), createBaseVNode("div", _hoisted_38, [createBaseVNode("strong", null, toDisplayString(mappedFieldCount.value), 1), createBaseVNode("span", null, "/ " + toDisplayString(unref(LEAD_IMPORT_FIELDS).length) + " 个字段已匹配", 1)])]),
					createBaseVNode("div", _hoisted_39, [createBaseVNode("div", _hoisted_40, [
						createVNode(_component_el_tag, {
							type: "danger",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("必填", -1)])]),
							_: 1
						}),
						createVNode(_component_el_tag, {
							type: "warning",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("建议", -1)])]),
							_: 1
						}),
						createVNode(_component_el_tag, {
							type: "info",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("补充", -1)])]),
							_: 1
						})
					]), createVNode(_component_el_button, {
						plain: "",
						onClick: resetAutoMapping
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(magic_stick_default))]),
							_: 1
						}), _cache[33] || (_cache[33] = createTextVNode(" 重新自动匹配 ", -1))]),
						_: 1
					})]),
					createVNode(_component_el_table, {
						class: "mapping-table",
						data: unref(LEAD_IMPORT_FIELDS),
						"row-key": "key",
						"max-height": "430"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "系统字段",
								"min-width": "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_41, [createBaseVNode("strong", null, toDisplayString(row.label), 1), row.help ? (openBlock(), createElementBlock("small", _hoisted_42, toDisplayString(row.help), 1)) : createCommentVNode("", true)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "级别",
								width: "88"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: fieldLevelType(row.level),
									effect: "plain",
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(fieldLevelLabel(row.level)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "文件中的列",
								"min-width": "240"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_select, {
									modelValue: mappings[row.key],
									"onUpdate:modelValue": ($event) => mappings[row.key] = $event,
									clearable: "",
									filterable: "",
									placeholder: "不导入此字段",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(headers.value, (header) => {
										return openBlock(), createBlock(_component_el_option, {
											key: header,
											label: header,
											value: header
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue", "onUpdate:modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "110"
							}, {
								default: withCtx(({ row }) => [mappings[row.key] ? (openBlock(), createElementBlock("span", _hoisted_43, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(circle_check_default))]),
									_: 1
								}), _cache[34] || (_cache[34] = createTextVNode(" 已匹配", -1))])) : row.level === "required" ? (openBlock(), createElementBlock("span", _hoisted_44, "必须匹配")) : (openBlock(), createElementBlock("span", _hoisted_45, "跳过"))]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"]),
					mappedRows.value.length ? (openBlock(), createElementBlock("div", _hoisted_46, [_cache[35] || (_cache[35] = createBaseVNode("h3", null, "映射后预览", -1)), createBaseVNode("div", _hoisted_47, [(openBlock(true), createElementBlock(Fragment, null, renderList(mappedRows.value.slice(0, 3), (row) => {
						return openBlock(), createElementBlock("article", { key: row.rowNumber }, [
							createBaseVNode("span", null, "第 " + toDisplayString(row.rowNumber) + " 行", 1),
							createBaseVNode("strong", null, toDisplayString(row.company || "企业名称未映射"), 1),
							createBaseVNode("small", null, toDisplayString(row.phone || row.companyPhone || row.creditCode || "无联系电话或信用代码"), 1)
						]);
					}), 128))])])) : createCommentVNode("", true)
				])) : step.value === 3 ? (openBlock(), createElementBlock("section", _hoisted_48, [
					createBaseVNode("div", _hoisted_49, [_cache[37] || (_cache[37] = createBaseVNode("div", null, [
						createBaseVNode("span", { class: "eyebrow" }, "第 4 步"),
						createBaseVNode("h2", null, "查重与数据校验"),
						createBaseVNode("p", null, "默认只导入“可导入”数据；重复固定跳过，冲突和错误不会写入。")
					], -1)), createVNode(_component_el_button, {
						plain: "",
						loading: preflightLoading.value,
						onClick: runPreflight
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(refresh_default))]),
							_: 1
						}), _cache[36] || (_cache[36] = createTextVNode(" 重新预检 ", -1))]),
						_: 1
					}, 8, ["loading"])]),
					createBaseVNode("div", _hoisted_50, [
						createBaseVNode("button", {
							type: "button",
							class: normalizeClass({ active: preflightFilter.value === "ALL" }),
							onClick: _cache[4] || (_cache[4] = ($event) => preflightFilter.value = "ALL")
						}, [_cache[38] || (_cache[38] = createBaseVNode("span", null, "文件总数", -1)), createBaseVNode("strong", null, toDisplayString(preflightSummary.total), 1)], 2),
						createBaseVNode("button", {
							type: "button",
							class: normalizeClass(["is-success", { active: preflightFilter.value === "READY" }]),
							onClick: _cache[5] || (_cache[5] = ($event) => preflightFilter.value = "READY")
						}, [_cache[39] || (_cache[39] = createBaseVNode("span", null, "可导入", -1)), createBaseVNode("strong", null, toDisplayString(preflightSummary.importable), 1)], 2),
						createBaseVNode("button", {
							type: "button",
							class: normalizeClass(["is-muted", { active: preflightFilter.value === "DUPLICATE" }]),
							onClick: _cache[6] || (_cache[6] = ($event) => preflightFilter.value = "DUPLICATE")
						}, [_cache[40] || (_cache[40] = createBaseVNode("span", null, "重复跳过", -1)), createBaseVNode("strong", null, toDisplayString(preflightSummary.duplicate), 1)], 2),
						createBaseVNode("button", {
							type: "button",
							class: normalizeClass(["is-warning", { active: preflightFilter.value === "CONFLICT" }]),
							onClick: _cache[7] || (_cache[7] = ($event) => preflightFilter.value = "CONFLICT")
						}, [_cache[41] || (_cache[41] = createBaseVNode("span", null, "需人工处理", -1)), createBaseVNode("strong", null, toDisplayString(preflightSummary.conflict), 1)], 2),
						createBaseVNode("button", {
							type: "button",
							class: normalizeClass(["is-danger", { active: preflightFilter.value === "ERROR" }]),
							onClick: _cache[8] || (_cache[8] = ($event) => preflightFilter.value = "ERROR")
						}, [_cache[42] || (_cache[42] = createBaseVNode("span", null, "数据错误", -1)), createBaseVNode("strong", null, toDisplayString(preflightSummary.error), 1)], 2)
					]),
					preflightSummary.warning ? (openBlock(), createElementBlock("div", _hoisted_51, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(warning_filled_default))]),
						_: 1
					}), createTextVNode(" " + toDisplayString(preflightSummary.warning) + " 条可导入数据含提示信息，请在下方原因列确认。 ", 1)])) : createCommentVNode("", true),
					createVNode(_component_el_alert, {
						type: "warning",
						closable: false,
						"show-icon": "",
						title: "查重顺序：统一社会信用代码、标准化公司名称、手机号。重复记录不会覆盖原负责人、跟进状态、来源或下一步任务。"
					}),
					createVNode(_component_el_table, {
						class: "result-table desktop-table",
						data: filteredPreflightRows.value,
						"max-height": "390",
						"empty-text": "当前分类没有数据"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "rowNumber",
								label: "行号",
								width: "72"
							}),
							createVNode(_component_el_table_column, {
								label: "企业名称",
								"min-width": "230",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(preflightRowData(row).company || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "联系电话",
								width: "150"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(preflightRowData(row).phone || preflightRowData(row).companyPhone || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "信用代码",
								"min-width": "190",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(preflightRowData(row).creditCode || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "校验结果",
								width: "120"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: preflightStatusType(row),
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(preflightStatusLabel(row)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "原因",
								"min-width": "260",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(preflightReasonText(row)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "现有记录",
								"min-width": "190"
							}, {
								default: withCtx(({ row }) => [row.existingLocation ? (openBlock(), createElementBlock("div", _hoisted_52, [createBaseVNode("span", null, [createTextVNode(toDisplayString(row.existingLocation), 1), row.existingOwnerName ? (openBlock(), createElementBlock("small", _hoisted_53, " · " + toDisplayString(row.existingOwnerName), 1)) : createCommentVNode("", true)]), row.existingTarget && row.existingTarget !== "NONE" ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									link: "",
									type: "primary",
									onClick: ($event) => locateExisting(row)
								}, {
									default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("去查看", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true)])) : (openBlock(), createElementBlock("span", _hoisted_54, "—"))]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"]),
					createBaseVNode("div", _hoisted_55, [(openBlock(true), createElementBlock(Fragment, null, renderList(filteredPreflightRows.value, (row) => {
						return openBlock(), createElementBlock("article", {
							key: row.rowNumber,
							class: "result-card"
						}, [
							createBaseVNode("div", null, [createBaseVNode("span", null, "第 " + toDisplayString(row.rowNumber) + " 行", 1), createVNode(_component_el_tag, {
								type: preflightStatusType(row),
								effect: "plain",
								size: "small"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(preflightStatusLabel(row)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							createBaseVNode("strong", null, toDisplayString(preflightRowData(row).company || "企业名称缺失"), 1),
							createBaseVNode("small", null, toDisplayString(preflightRowData(row).phone || preflightRowData(row).companyPhone || preflightRowData(row).creditCode || "无联系方式/信用代码"), 1),
							createBaseVNode("p", null, toDisplayString(preflightReasonText(row)), 1),
							row.existingLocation ? (openBlock(), createElementBlock("div", _hoisted_56, [createBaseVNode("span", null, [createTextVNode("现有记录：" + toDisplayString(row.existingLocation), 1), row.existingOwnerName ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(" · " + toDisplayString(row.existingOwnerName), 1)], 64)) : createCommentVNode("", true)]), row.existingTarget && row.existingTarget !== "NONE" ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								link: "",
								type: "primary",
								onClick: ($event) => locateExisting(row)
							}, {
								default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("去查看", -1)])]),
								_: 1
							}, 8, ["onClick"])) : createCommentVNode("", true)])) : createCommentVNode("", true)
						]);
					}), 128))])
				])) : (openBlock(), createElementBlock("section", _hoisted_57, [
					createBaseVNode("div", { class: normalizeClass(["result-hero", { "has-error": confirmSummary.error > 0 }]) }, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(success_filled_default))]),
						_: 1
					}), createBaseVNode("div", null, [
						_cache[45] || (_cache[45] = createBaseVNode("span", { class: "eyebrow" }, "第 5 步 · 导入完成", -1)),
						createBaseVNode("h2", null, "已导入 " + toDisplayString(confirmSummary.imported) + " 条至“" + toDisplayString(destinationLabel.value) + "”", 1),
						createBaseVNode("p", null, "批次：" + toDisplayString(config.batchName) + " · 来源：" + toDisplayString((_selectedSourceScene$4 = selectedSourceScene.value) === null || _selectedSourceScene$4 === void 0 ? void 0 : _selectedSourceScene$4.label) + toDisplayString(config.sourcePlatform ? ` / ${config.sourcePlatform}` : ""), 1)
					])], 2),
					createBaseVNode("div", _hoisted_58, [
						createBaseVNode("div", null, [_cache[46] || (_cache[46] = createBaseVNode("span", null, "处理总数", -1)), createBaseVNode("strong", null, toDisplayString(confirmSummary.total), 1)]),
						createBaseVNode("div", _hoisted_59, [_cache[47] || (_cache[47] = createBaseVNode("span", null, "导入成功", -1)), createBaseVNode("strong", null, toDisplayString(confirmSummary.imported), 1)]),
						createBaseVNode("div", _hoisted_60, [_cache[48] || (_cache[48] = createBaseVNode("span", null, "重复跳过", -1)), createBaseVNode("strong", null, toDisplayString(confirmSummary.duplicate), 1)]),
						createBaseVNode("div", _hoisted_61, [_cache[49] || (_cache[49] = createBaseVNode("span", null, "冲突跳过", -1)), createBaseVNode("strong", null, toDisplayString(confirmSummary.conflict), 1)]),
						createBaseVNode("div", _hoisted_62, [_cache[50] || (_cache[50] = createBaseVNode("span", null, "导入失败", -1)), createBaseVNode("strong", null, toDisplayString(confirmSummary.error), 1)])
					]),
					problemRows.value.length ? (openBlock(), createElementBlock("div", _hoisted_63, [createBaseVNode("div", null, [_cache[51] || (_cache[51] = createBaseVNode("h3", null, "问题清单", -1)), createBaseVNode("p", null, toDisplayString(problemRows.value.length) + " 条未导入，可下载清单并对照原文件修正，再作为新批次重新预检。", 1)]), createVNode(_component_el_button, {
						plain: "",
						onClick: downloadProblemCsv
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(download_default))]),
							_: 1
						}), _cache[52] || (_cache[52] = createTextVNode(" 下载问题清单 CSV ", -1))]),
						_: 1
					})])) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "本批次全部成功导入，没有问题数据",
						"image-size": 92
					})),
					createBaseVNode("div", _hoisted_64, [createVNode(_component_el_button, {
						size: "large",
						onClick: startAnotherImport
					}, {
						default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("继续导入新批次", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						size: "large",
						onClick: goLeadList
					}, {
						default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("返回找客户", -1)])]),
						_: 1
					})])
				]))]),
				step.value < 4 ? (openBlock(), createElementBlock("footer", _hoisted_65, [createBaseVNode("div", _hoisted_66, [createBaseVNode("span", null, "第 " + toDisplayString(step.value + 1) + " / 5 步", 1), createBaseVNode("strong", null, toDisplayString(currentActionContext.value), 1)]), createBaseVNode("div", _hoisted_67, [step.value === 0 ? (openBlock(), createBlock(_component_el_button, {
					key: 0,
					onClick: goLeadList
				}, {
					default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("取消", -1)])]),
					_: 1
				})) : (openBlock(), createBlock(_component_el_button, {
					key: 1,
					onClick: previousStep
				}, {
					default: withCtx(() => [..._cache[56] || (_cache[56] = [createTextVNode("上一步", -1)])]),
					_: 1
				})), step.value < 2 ? (openBlock(), createBlock(_component_el_button, {
					key: 2,
					type: "primary",
					disabled: !canContinue.value,
					onClick: nextStep
				}, {
					default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("下一步", -1)])]),
					_: 1
				}, 8, ["disabled"])) : step.value === 2 ? (openBlock(), createBlock(_component_el_button, {
					key: 3,
					type: "primary",
					loading: preflightLoading.value,
					disabled: !canContinue.value,
					onClick: runPreflight
				}, {
					default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode(" 开始查重校验 ", -1)])]),
					_: 1
				}, 8, ["loading", "disabled"])) : (openBlock(), createBlock(_component_el_button, {
					key: 4,
					type: "primary",
					loading: confirmLoading.value,
					disabled: preflightSummary.importable < 1 || !previewToken.value,
					onClick: confirmImport
				}, {
					default: withCtx(() => [createTextVNode(" 导入 " + toDisplayString(preflightSummary.importable) + " 条至 " + toDisplayString(destinationLabel.value), 1)]),
					_: 1
				}, 8, ["loading", "disabled"]))])])) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-6ca3815b"]]);
//#endregion
export { lead_import_default as default };
