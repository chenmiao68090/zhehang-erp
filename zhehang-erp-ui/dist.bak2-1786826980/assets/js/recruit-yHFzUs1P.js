import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Dr as withModifiers, Er as withKeys, F as ElEmpty, H as ElDescriptions, J as ElCol, M as ElInputNumber, T as ElProgress, U as ElDescriptionsItem, V as ElDialog, W as ElDatePicker, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, f as ElTimeline, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, l as ElUpload, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, p as ElTimelineItem, rt as ElSelect, s as vLoading, tt as ElCard, v as ElSwitch, vt as ElAlert, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { d as resumeApi, l as recruitApi, r as interviewRecordApi, s as onboardingApi } from "./hrm-x4tssCAy.js";
//#region src/views/hrm/recruit.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "recruit-page" };
var _hoisted_2 = { class: "recruit-hero" };
var _hoisted_3 = { class: "hero-metrics" };
var _hoisted_4 = { class: "metric" };
var _hoisted_5 = { class: "metric" };
var _hoisted_6 = { class: "metric" };
var _hoisted_7 = { class: "toolbar" };
var _hoisted_8 = { class: "filters" };
var _hoisted_9 = { class: "date-range" };
var _hoisted_10 = { class: "toolbar" };
var _hoisted_11 = { class: "filters" };
var _hoisted_12 = {
	key: 0,
	class: "muted"
};
var _hoisted_13 = { class: "stacked" };
var _hoisted_14 = {
	key: 1,
	class: "muted"
};
var _hoisted_15 = { class: "pipeline" };
var _hoisted_16 = { class: "pipeline-title" };
var _hoisted_17 = ["onClick"];
var _hoisted_18 = { class: "candidate-top" };
var _hoisted_19 = { class: "candidate-meta" };
var _hoisted_20 = { class: "candidate-tags" };
var _hoisted_21 = { class: "toolbar" };
var _hoisted_22 = { class: "filters" };
var _hoisted_23 = {
	key: 0,
	class: "link-cell"
};
var _hoisted_24 = { class: "link-main" };
var _hoisted_25 = { class: "public-link" };
var _hoisted_26 = ["title"];
var _hoisted_27 = { class: "link-meta" };
var _hoisted_28 = {
	key: 1,
	class: "muted"
};
var _hoisted_29 = { class: "el-upload__tip" };
var _hoisted_30 = { class: "offer-preview" };
var _hoisted_31 = { class: "offer-preview" };
var _hoisted_32 = { class: "drawer-profile" };
var _hoisted_33 = { class: "avatar" };
var _hoisted_34 = { class: "timeline-head" };
var _hoisted_35 = { class: "timeline-card" };
var _hoisted_36 = { class: "timeline-card-title" };
var _hoisted_37 = { key: 0 };
var _hoisted_38 = {
	key: 1,
	class: "danger-text"
};
var _hoisted_39 = { key: 2 };
//#endregion
//#region src/views/hrm/recruit.vue
var recruit_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "recruit",
	setup(__props) {
		const activeTab = ref("jobs");
		const jobLoading = ref(false);
		const candidateLoading = ref(false);
		const jobSubmitting = ref(false);
		const candidateSubmitting = ref(false);
		const interviewSubmitting = ref(false);
		const timelineLoading = ref(false);
		const onboardingLoading = ref(false);
		const onboardingSubmitting = ref(false);
		const employeeLoading = ref(false);
		const jobs = ref([]);
		const candidates = ref([]);
		const interviewRecords = ref([]);
		const onboardings = ref([]);
		const interviewerOptions = ref([]);
		const jobTotal = ref(0);
		const candidateTotal = ref(0);
		const onboardingTotal = ref(0);
		const selectedCandidate = ref(null);
		const selectedOnboarding = ref(null);
		const jobDialogVisible = ref(false);
		const candidateDialogVisible = ref(false);
		const interviewDialogVisible = ref(false);
		const timelineVisible = ref(false);
		const schemaDialogVisible = ref(false);
		const offerDialogVisible = ref(false);
		const offerContentVisible = ref(false);
		const formDataVisible = ref(false);
		const jobFormRef = ref();
		const candidateFormRef = ref();
		const interviewFormRef = ref();
		const resumeFileList = ref([]);
		const generatedOffer = ref("");
		const submittedFormPreview = ref("");
		let pendingResumeFile = null;
		let interviewerOptionsLoaded = false;
		const recruitStatusOptions = [
			{
				label: "草稿",
				value: 0
			},
			{
				label: "进行中",
				value: 1
			},
			{
				label: "已完成",
				value: 2
			},
			{
				label: "已取消",
				value: 3
			}
		];
		const resumeStatusOptions = [
			{
				label: "待筛选",
				value: 0
			},
			{
				label: "待面试",
				value: 1
			},
			{
				label: "已通过",
				value: 2
			},
			{
				label: "已淘汰",
				value: 3
			},
			{
				label: "复试中",
				value: 4
			},
			{
				label: "已入职",
				value: 5
			},
			{
				label: "未入职",
				value: 6
			},
			{
				label: "待入职",
				value: 7
			}
		];
		const onboardingStatusOptions = [
			{
				label: "待发登记",
				value: 0
			},
			{
				label: "已提交登记",
				value: 1
			},
			{
				label: "信息已确认",
				value: 2
			},
			{
				label: "Offer已生成",
				value: 3
			},
			{
				label: "Offer已发送",
				value: 4
			},
			{
				label: "员工草稿",
				value: 5
			},
			{
				label: "已入职",
				value: 6
			},
			{
				label: "已取消",
				value: 7
			}
		];
		const pipelineColumns = [
			{
				title: "待筛选",
				status: 0
			},
			{
				title: "待面试",
				status: 1
			},
			{
				title: "复试中",
				status: 4
			},
			{
				title: "待入职",
				status: 7
			},
			{
				title: "已入职",
				status: 5
			},
			{
				title: "淘汰/未入职",
				status: 3
			}
		];
		const educationOptions = [
			"高中/中专",
			"大专",
			"本科",
			"硕士",
			"博士"
		];
		const quickTags = [
			"有代账经验",
			"持初级会计证",
			"持中级会计证",
			"可立即到岗",
			"有销售经验",
			"沟通能力强",
			"财税行业经验",
			"稳定性高"
		];
		const jobQuery = reactive({
			pageNum: 1,
			pageSize: 10,
			title: "",
			status: void 0
		});
		const candidateQuery = reactive({
			pageNum: 1,
			pageSize: 20,
			keyword: "",
			status: void 0,
			tags: "",
			interviewDateStart: "",
			interviewDateEnd: ""
		});
		const interviewDateRange = ref(null);
		const onboardingQuery = reactive({
			pageNum: 1,
			pageSize: 20,
			keyword: "",
			status: void 0
		});
		const jobForm = reactive({
			id: void 0,
			title: "",
			deptId: void 0,
			headcount: 1,
			salaryMin: void 0,
			salaryMax: void 0,
			startDate: "",
			planFinishDate: "",
			jobOwner: "",
			recruitOwner: "",
			requirements: "",
			status: 0
		});
		const candidateForm = reactive({
			id: void 0,
			recruitId: void 0,
			positionName: "",
			name: "",
			age: void 0,
			phone: "",
			email: "",
			education: "",
			experienceYears: 0,
			currentCompany: "",
			expectedSalary: void 0,
			resumeUrl: "",
			resumeFileId: void 0,
			resumeFileName: "",
			tags: "",
			firstInterviewTime: "",
			needReInterview: false,
			reInterviewTime: "",
			interviewer: "",
			interviewerId: void 0,
			status: 0,
			evaluation: "",
			rejectReason: "",
			notJoinReason: ""
		});
		const candidateTagValues = ref([]);
		const interviewForm = reactive({
			resumeId: void 0,
			recruitId: void 0,
			stage: "first",
			result: "record",
			interviewer: "",
			interviewerId: void 0,
			interviewTime: "",
			nextInterviewTime: "",
			evaluation: "",
			rejectReason: ""
		});
		const schemaForm = reactive({
			id: void 0,
			formSchema: ""
		});
		const offerForm = reactive({
			id: void 0,
			expectedHireDate: "",
			offerTemplate: "",
			remark: ""
		});
		const jobRules = {
			title: [{
				required: true,
				message: "请输入招聘职位",
				trigger: "blur"
			}],
			headcount: [{
				required: true,
				message: "请输入招聘人数",
				trigger: "blur"
			}]
		};
		const candidateRules = { name: [{
			required: true,
			message: "请输入候选人姓名",
			trigger: "blur"
		}] };
		const interviewRules = {
			stage: [{
				required: true,
				message: "请选择面试阶段",
				trigger: "change"
			}],
			result: [{
				required: true,
				message: "请选择流转结果",
				trigger: "change"
			}]
		};
		const metrics = computed(() => {
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			return {
				openJobs: jobs.value.filter((job) => job.status === 1).length,
				activeCandidates: candidates.value.filter((item) => [
					0,
					1,
					2,
					4,
					7
				].includes(Number(item.status))).length,
				urgentJobs: jobs.value.filter((job) => job.status === 1 && job.planFinishDate && job.planFinishDate <= today).length
			};
		});
		function recruitStatusLabel(status) {
			var _recruitStatusOptions;
			return ((_recruitStatusOptions = recruitStatusOptions.find((item) => item.value === Number(status))) === null || _recruitStatusOptions === void 0 ? void 0 : _recruitStatusOptions.label) || "未知";
		}
		function recruitStatusType(status) {
			return {
				0: "info",
				1: "success",
				2: "primary",
				3: "danger"
			}[Number(status)] || "info";
		}
		function resumeStatusLabel(status) {
			var _resumeStatusOptions$;
			return ((_resumeStatusOptions$ = resumeStatusOptions.find((item) => item.value === Number(status))) === null || _resumeStatusOptions$ === void 0 ? void 0 : _resumeStatusOptions$.label) || "未知";
		}
		function resumeStatusType(status) {
			return {
				0: "info",
				1: "warning",
				2: "primary",
				3: "danger",
				4: "warning",
				5: "success",
				6: "danger",
				7: "success"
			}[Number(status)] || "info";
		}
		function onboardingStatusLabel(status) {
			var _onboardingStatusOpti;
			return ((_onboardingStatusOpti = onboardingStatusOptions.find((item) => item.value === Number(status))) === null || _onboardingStatusOpti === void 0 ? void 0 : _onboardingStatusOpti.label) || "未知";
		}
		function onboardingStatusType(status) {
			return {
				0: "warning",
				1: "primary",
				2: "success",
				3: "success",
				4: "success",
				5: "success",
				6: "success",
				7: "danger"
			}[Number(status)] || "info";
		}
		function isOnboardingTokenExpired(row) {
			if (!(row === null || row === void 0 ? void 0 : row.tokenExpiresAt)) return true;
			return new Date(row.tokenExpiresAt).getTime() < Date.now();
		}
		function onboardingLinkStatusLabel(row) {
			if ((row === null || row === void 0 ? void 0 : row.tokenUsedTime) || Number(row === null || row === void 0 ? void 0 : row.status) >= 1) return "已提交失效";
			if (isOnboardingTokenExpired(row)) return "已过期";
			return "有效";
		}
		function onboardingLinkStatusType(row) {
			if ((row === null || row === void 0 ? void 0 : row.tokenUsedTime) || Number(row === null || row === void 0 ? void 0 : row.status) >= 1) return "info";
			if (isOnboardingTokenExpired(row)) return "danger";
			return "success";
		}
		function stageLabel(stage) {
			return {
				screen: "简历筛选",
				first: "初面",
				re_interview: "复试",
				final: "终面",
				join: "入职跟进"
			}[stage] || stage || "-";
		}
		function resultLabel(result) {
			return {
				record: "仅记录",
				first_pass: "进入复试",
				next_round: "进入下一轮",
				pass: "进入待入职",
				reject: "淘汰",
				hired: "入职",
				not_join: "未入职"
			}[result] || result || "-";
		}
		function salaryRange(row) {
			return `${row.salaryMin ? Number(row.salaryMin).toFixed(0) : "0"}-${row.salaryMax ? Number(row.salaryMax).toFixed(0) : "0"}`;
		}
		function jobProgress(row) {
			const hired = candidates.value.filter((item) => item.recruitId === row.id && item.status === 5).length;
			const target = Number(row.headcount || 1);
			return Math.min(100, Math.round(hired / target * 100));
		}
		function tagList(tags) {
			return String(tags || "").split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
		}
		function formatDateTime(value) {
			if (!value) return "-";
			return String(value).replace("T", " ").slice(0, 16);
		}
		function matchJobTitle(recruitId) {
			var _jobs$value$find;
			return (_jobs$value$find = jobs.value.find((job) => Number(job.id) === Number(recruitId))) === null || _jobs$value$find === void 0 ? void 0 : _jobs$value$find.title;
		}
		function candidatesByStatus(status) {
			if (status === 3) return candidates.value.filter((item) => [3, 6].includes(Number(item.status)));
			return candidates.value.filter((item) => Number(item.status) === status);
		}
		function resetJobForm() {
			Object.assign(jobForm, {
				id: void 0,
				title: "",
				deptId: void 0,
				headcount: 1,
				salaryMin: void 0,
				salaryMax: void 0,
				startDate: "",
				planFinishDate: "",
				jobOwner: "",
				recruitOwner: "",
				requirements: "",
				status: 0
			});
		}
		function resetCandidateForm() {
			Object.assign(candidateForm, {
				id: void 0,
				recruitId: void 0,
				positionName: "",
				name: "",
				age: void 0,
				phone: "",
				email: "",
				education: "",
				experienceYears: 0,
				currentCompany: "",
				expectedSalary: void 0,
				resumeUrl: "",
				resumeFileId: void 0,
				resumeFileName: "",
				tags: "",
				firstInterviewTime: "",
				needReInterview: false,
				reInterviewTime: "",
				interviewer: "",
				interviewerId: void 0,
				status: 0,
				evaluation: "",
				rejectReason: "",
				notJoinReason: ""
			});
			candidateTagValues.value = [];
			resumeFileList.value = [];
			pendingResumeFile = null;
		}
		function loadJobs() {
			return _loadJobs.apply(this, arguments);
		}
		function _loadJobs() {
			_loadJobs = _asyncToGenerator(function* () {
				jobLoading.value = true;
				try {
					var _res$data, _res$data2;
					const res = yield recruitApi.list(jobQuery);
					jobs.value = ((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.records) || [];
					jobTotal.value = ((_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.total) || 0;
				} finally {
					jobLoading.value = false;
				}
			});
			return _loadJobs.apply(this, arguments);
		}
		function loadCandidates() {
			return _loadCandidates.apply(this, arguments);
		}
		function _loadCandidates() {
			_loadCandidates = _asyncToGenerator(function* () {
				candidateLoading.value = true;
				try {
					var _res$data3, _res$data4;
					const res = yield resumeApi.list(candidateQuery);
					candidates.value = ((_res$data3 = res.data) === null || _res$data3 === void 0 ? void 0 : _res$data3.records) || [];
					candidateTotal.value = ((_res$data4 = res.data) === null || _res$data4 === void 0 ? void 0 : _res$data4.total) || 0;
				} finally {
					candidateLoading.value = false;
				}
			});
			return _loadCandidates.apply(this, arguments);
		}
		function loadOnboardings() {
			return _loadOnboardings.apply(this, arguments);
		}
		function _loadOnboardings() {
			_loadOnboardings = _asyncToGenerator(function* () {
				onboardingLoading.value = true;
				try {
					var _res$data5, _res$data6;
					const res = yield onboardingApi.list(onboardingQuery);
					onboardings.value = ((_res$data5 = res.data) === null || _res$data5 === void 0 ? void 0 : _res$data5.records) || [];
					onboardingTotal.value = ((_res$data6 = res.data) === null || _res$data6 === void 0 ? void 0 : _res$data6.total) || 0;
				} finally {
					onboardingLoading.value = false;
				}
			});
			return _loadOnboardings.apply(this, arguments);
		}
		function loadInterviewerOptions() {
			return _loadInterviewerOptions.apply(this, arguments);
		}
		function _loadInterviewerOptions() {
			_loadInterviewerOptions = _asyncToGenerator(function* (force = false) {
				if (interviewerOptionsLoaded && !force) return;
				employeeLoading.value = true;
				try {
					interviewerOptions.value = ((yield recruitApi.colleagues()).data || []).filter((item) => (item === null || item === void 0 ? void 0 : item.userId) && (item === null || item === void 0 ? void 0 : item.name)).sort((a, b) => interviewerOptionLabel(a).localeCompare(interviewerOptionLabel(b), "zh-Hans-CN"));
					interviewerOptionsLoaded = true;
				} catch (_error) {
					ElMessage.warning("公司人员列表加载失败，可先手动输入人员姓名");
				} finally {
					employeeLoading.value = false;
				}
			});
			return _loadInterviewerOptions.apply(this, arguments);
		}
		function handleInterviewerDropdownVisible(visible) {
			if (visible) loadInterviewerOptions();
		}
		function interviewerOptionLabel(employee) {
			const dept = (employee === null || employee === void 0 ? void 0 : employee.deptName) || "未分部门";
			const post = (employee === null || employee === void 0 ? void 0 : employee.postName) || "未设岗位";
			return `${(employee === null || employee === void 0 ? void 0 : employee.name) || "-"} · ${dept}/${post}`;
		}
		function resolveInterviewerId(name) {
			var _matched$userId;
			if (!name) return void 0;
			const matched = interviewerOptions.value.find((item) => item.name === name);
			return (_matched$userId = matched === null || matched === void 0 ? void 0 : matched.userId) !== null && _matched$userId !== void 0 ? _matched$userId : void 0;
		}
		function onCandidateInterviewerChange(name) {
			candidateForm.interviewerId = resolveInterviewerId(name);
		}
		function onInterviewInterviewerChange(name) {
			interviewForm.interviewerId = resolveInterviewerId(name);
		}
		function refreshAll() {
			return _refreshAll.apply(this, arguments);
		}
		function _refreshAll() {
			_refreshAll = _asyncToGenerator(function* () {
				yield Promise.all([
					loadJobs(),
					loadCandidates(),
					loadOnboardings()
				]);
			});
			return _refreshAll.apply(this, arguments);
		}
		function handleTabChange(name) {
			if (name === "pipeline") loadCandidates();
			if (name === "onboarding") loadOnboardings();
		}
		function resetJobQuery() {
			jobQuery.title = "";
			jobQuery.status = void 0;
			jobQuery.pageNum = 1;
			loadJobs();
		}
		function resetCandidateQuery() {
			candidateQuery.keyword = "";
			candidateQuery.status = void 0;
			candidateQuery.tags = "";
			candidateQuery.interviewDateStart = "";
			candidateQuery.interviewDateEnd = "";
			interviewDateRange.value = null;
			candidateQuery.pageNum = 1;
			loadCandidates();
		}
		function onInterviewDateRangeChange(range) {
			candidateQuery.interviewDateStart = (range === null || range === void 0 ? void 0 : range[0]) || "";
			candidateQuery.interviewDateEnd = (range === null || range === void 0 ? void 0 : range[1]) || "";
			candidateQuery.pageNum = 1;
			loadCandidates();
		}
		function filterTodayInterviews() {
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			interviewDateRange.value = [today, today];
			candidateQuery.interviewDateStart = today;
			candidateQuery.interviewDateEnd = today;
			candidateQuery.pageNum = 1;
			loadCandidates();
		}
		function resetOnboardingQuery() {
			onboardingQuery.keyword = "";
			onboardingQuery.status = void 0;
			onboardingQuery.pageNum = 1;
			loadOnboardings();
		}
		function openJobDialog(row) {
			resetJobForm();
			if (row) Object.assign(jobForm, row);
			jobDialogVisible.value = true;
			loadInterviewerOptions();
		}
		function submitJob() {
			return _submitJob.apply(this, arguments);
		}
		function _submitJob() {
			_submitJob = _asyncToGenerator(function* () {
				var _jobFormRef$value;
				yield (_jobFormRef$value = jobFormRef.value) === null || _jobFormRef$value === void 0 ? void 0 : _jobFormRef$value.validate();
				jobSubmitting.value = true;
				try {
					if (jobForm.id) yield recruitApi.update(jobForm);
					else yield recruitApi.create(jobForm);
					ElMessage.success("招聘需求已保存");
					jobDialogVisible.value = false;
					loadJobs();
				} finally {
					jobSubmitting.value = false;
				}
			});
			return _submitJob.apply(this, arguments);
		}
		function changeJobStatus(_x, _x2) {
			return _changeJobStatus.apply(this, arguments);
		}
		function _changeJobStatus() {
			_changeJobStatus = _asyncToGenerator(function* (row, status) {
				yield recruitApi.changeStatus({
					id: row.id,
					status
				});
				ElMessage.success("状态已更新");
				loadJobs();
			});
			return _changeJobStatus.apply(this, arguments);
		}
		function onboardingFormPath(row) {
			return (row === null || row === void 0 ? void 0 : row.formToken) ? `/onboarding/form/${encodeURIComponent(row.formToken)}` : "";
		}
		function onboardingFullLink(row) {
			const path = onboardingFormPath(row);
			return path ? new URL(path, window.location.origin).toString() : "";
		}
		function copyText(_x3) {
			return _copyText.apply(this, arguments);
		}
		function _copyText() {
			_copyText = _asyncToGenerator(function* (text, successMessage = "已复制") {
				if (!text) return;
				try {
					yield navigator.clipboard.writeText(text);
				} catch (_error) {
					const input = document.createElement("textarea");
					input.value = text;
					document.body.appendChild(input);
					input.select();
					document.execCommand("copy");
					document.body.removeChild(input);
				}
				ElMessage.success(successMessage);
			});
			return _copyText.apply(this, arguments);
		}
		function copyOnboardingLink(row) {
			const link = onboardingFullLink(row);
			if (!link) {
				ElMessage.warning("登记链接还未生成");
				return;
			}
			copyText(link, "已复制公开登记链接，候选人无需登录即可填写");
		}
		function openOnboardingLink(row) {
			const link = onboardingFullLink(row);
			if (!link) {
				ElMessage.warning("登记链接还未生成");
				return;
			}
			window.open(link, "_blank", "noopener,noreferrer");
		}
		function refreshOnboardingToken(_x4) {
			return _refreshOnboardingToken.apply(this, arguments);
		}
		function _refreshOnboardingToken() {
			_refreshOnboardingToken = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm("刷新后旧登记链接会立即失效，新链接 48 小时内有效。确认刷新吗？", "刷新登记链接", {
					type: "warning",
					confirmButtonText: "确认刷新",
					cancelButtonText: "取消"
				});
				const res = yield onboardingApi.refreshToken(row.id);
				Object.assign(row, res.data || {});
				const link = onboardingFullLink(row);
				if (link) yield copyText(link, "已刷新登记链接，并复制到剪贴板");
				else ElMessage.success("已刷新登记链接");
			});
			return _refreshOnboardingToken.apply(this, arguments);
		}
		function createOnboardingFromCandidate(_x5) {
			return _createOnboardingFromCandidate.apply(this, arguments);
		}
		function _createOnboardingFromCandidate() {
			_createOnboardingFromCandidate = _asyncToGenerator(function* (row) {
				const res = yield onboardingApi.createFromResume(row.id);
				ElMessage.success("已进入待入职");
				activeTab.value = "onboarding";
				selectedOnboarding.value = res.data;
				yield refreshAll();
			});
			return _createOnboardingFromCandidate.apply(this, arguments);
		}
		function removeCandidate(_x6) {
			return _removeCandidate.apply(this, arguments);
		}
		function _removeCandidate() {
			_removeCandidate = _asyncToGenerator(function* (row) {
				var _selectedCandidate$va;
				yield ElMessageBox.confirm(`确认删除候选人「${row.name || "未命名"}」吗？删除后将不再出现在简历人才库列表中，已产生的面试流转记录不会被清空。`, "删除候选人", {
					type: "warning",
					confirmButtonText: "确认删除",
					cancelButtonText: "取消",
					confirmButtonClass: "el-button--danger"
				});
				yield resumeApi.remove(row.id);
				ElMessage.success("候选人已删除");
				if (((_selectedCandidate$va = selectedCandidate.value) === null || _selectedCandidate$va === void 0 ? void 0 : _selectedCandidate$va.id) === row.id) {
					selectedCandidate.value = null;
					timelineVisible.value = false;
				}
				yield refreshAll();
			});
			return _removeCandidate.apply(this, arguments);
		}
		function parseJson(value, fallback) {
			if (!value) return fallback;
			if (typeof value === "object") return value;
			try {
				return JSON.parse(value);
			} catch (_error) {
				return fallback;
			}
		}
		function prettyJson(value) {
			return JSON.stringify(parseJson(value, []), null, 2);
		}
		function openSchemaDialog(row) {
			selectedOnboarding.value = row;
			schemaForm.id = row.id;
			schemaForm.formSchema = prettyJson(row.formSchema);
			schemaDialogVisible.value = true;
		}
		function submitSchema() {
			return _submitSchema.apply(this, arguments);
		}
		function _submitSchema() {
			_submitSchema = _asyncToGenerator(function* () {
				JSON.parse(schemaForm.formSchema || "[]");
				onboardingSubmitting.value = true;
				try {
					yield onboardingApi.update({
						id: schemaForm.id,
						formSchema: schemaForm.formSchema
					});
					ElMessage.success("登记字段已保存");
					schemaDialogVisible.value = false;
					loadOnboardings();
				} finally {
					onboardingSubmitting.value = false;
				}
			});
			return _submitSchema.apply(this, arguments);
		}
		function defaultOfferTemplate() {
			return `亲爱的 {{name}}：

恭喜你通过浙杭集团 {{positionName}} 岗位面试。我们诚挚邀请你加入浙杭集团，预计入职日期为 {{expectedHireDate}}。

请入职当天携带身份证原件、银行卡信息、学历/证书材料，并保持电话 {{phone}} 畅通。如有疑问，请及时联系招聘负责人。

浙杭集团`;
		}
		function openOfferDialog(row) {
			selectedOnboarding.value = row;
			Object.assign(offerForm, {
				id: row.id,
				expectedHireDate: row.expectedHireDate || "",
				offerTemplate: row.offerTemplate || defaultOfferTemplate(),
				remark: row.remark || ""
			});
			offerDialogVisible.value = true;
		}
		function submitOffer() {
			return _submitOffer.apply(this, arguments);
		}
		function _submitOffer() {
			_submitOffer = _asyncToGenerator(function* () {
				onboardingSubmitting.value = true;
				try {
					var _res$data7;
					generatedOffer.value = ((_res$data7 = (yield onboardingApi.generateOffer(offerForm.id, offerForm)).data) === null || _res$data7 === void 0 ? void 0 : _res$data7.offerContent) || "";
					ElMessage.success("Offer 已生成");
					offerDialogVisible.value = false;
					offerContentVisible.value = true;
					loadOnboardings();
				} finally {
					onboardingSubmitting.value = false;
				}
			});
			return _submitOffer.apply(this, arguments);
		}
		function showOffer(row) {
			generatedOffer.value = row.offerContent || "";
			offerContentVisible.value = true;
		}
		function showSubmittedForm(row) {
			submittedFormPreview.value = JSON.stringify(parseJson(row.formData, {}), null, 2);
			formDataVisible.value = true;
		}
		function confirmOnboardingForm(_x7) {
			return _confirmOnboardingForm.apply(this, arguments);
		}
		function _confirmOnboardingForm() {
			_confirmOnboardingForm = _asyncToGenerator(function* (row) {
				yield onboardingApi.confirmForm(row.id);
				ElMessage.success("入职资料已确认");
				loadOnboardings();
			});
			return _confirmOnboardingForm.apply(this, arguments);
		}
		function markOfferSent(_x8) {
			return _markOfferSent.apply(this, arguments);
		}
		function _markOfferSent() {
			_markOfferSent = _asyncToGenerator(function* (row) {
				yield onboardingApi.markOfferSent(row.id);
				ElMessage.success("已标记 Offer 发送");
				loadOnboardings();
			});
			return _markOfferSent.apply(this, arguments);
		}
		function createEmployeeDraft(_x9) {
			return _createEmployeeDraft.apply(this, arguments);
		}
		function _createEmployeeDraft() {
			_createEmployeeDraft = _asyncToGenerator(function* (row) {
				yield onboardingApi.createEmployeeDraft(row.id);
				ElMessage.success("员工档案草稿已生成");
				loadOnboardings();
			});
			return _createEmployeeDraft.apply(this, arguments);
		}
		function markOnboarded(_x10) {
			return _markOnboarded.apply(this, arguments);
		}
		function _markOnboarded() {
			_markOnboarded = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm("确认该候选人已正式入职？系统会把员工档案状态改为试用，并把候选人标记为已入职。", "确认入职", {
					confirmButtonText: "确认入职",
					cancelButtonText: "取消",
					type: "warning"
				});
				yield onboardingApi.markOnboarded(row.id);
				ElMessage.success("已进入花名册");
				refreshAll();
			});
			return _markOnboarded.apply(this, arguments);
		}
		function openCandidateDialog(job, row) {
			resetCandidateForm();
			loadInterviewerOptions();
			if (job) {
				candidateForm.recruitId = job.id;
				candidateForm.positionName = job.title;
			}
			if (row) {
				Object.assign(candidateForm, row);
				candidateTagValues.value = tagList(row.tags);
				if (row.resumeFileName) resumeFileList.value = [{ name: row.resumeFileName }];
			}
			candidateDialogVisible.value = true;
		}
		function syncCandidatePosition() {
			const job = jobs.value.find((item) => Number(item.id) === Number(candidateForm.recruitId));
			if (job) candidateForm.positionName = job.title;
		}
		function handleResumeFileChange(file) {
			pendingResumeFile = file.raw || null;
			resumeFileList.value = file ? [{
				name: file.name,
				raw: file.raw
			}] : [];
		}
		function handleResumeFileRemove() {
			pendingResumeFile = null;
			resumeFileList.value = [];
			candidateForm.resumeFileId = "";
			candidateForm.resumeFileName = "";
			candidateForm.resumeUrl = "";
		}
		function submitCandidate() {
			return _submitCandidate.apply(this, arguments);
		}
		function _submitCandidate() {
			_submitCandidate = _asyncToGenerator(function* () {
				var _candidateFormRef$val;
				yield (_candidateFormRef$val = candidateFormRef.value) === null || _candidateFormRef$val === void 0 ? void 0 : _candidateFormRef$val.validate();
				candidateSubmitting.value = true;
				try {
					candidateForm.tags = candidateTagValues.value.join(",");
					if (pendingResumeFile) {
						var _uploadRes$data, _uploadRes$data2, _uploadRes$data3;
						const uploadRes = yield fileInfoApi.upload(pendingResumeFile);
						candidateForm.resumeFileId = uploadRes === null || uploadRes === void 0 || (_uploadRes$data = uploadRes.data) === null || _uploadRes$data === void 0 ? void 0 : _uploadRes$data.id;
						candidateForm.resumeFileName = (uploadRes === null || uploadRes === void 0 || (_uploadRes$data2 = uploadRes.data) === null || _uploadRes$data2 === void 0 ? void 0 : _uploadRes$data2.originalName) || (uploadRes === null || uploadRes === void 0 || (_uploadRes$data3 = uploadRes.data) === null || _uploadRes$data3 === void 0 ? void 0 : _uploadRes$data3.fileName) || pendingResumeFile.name;
						candidateForm.resumeUrl = candidateForm.resumeFileName;
					}
					if (candidateForm.id) yield resumeApi.update(candidateForm);
					else yield resumeApi.create(candidateForm);
					ElMessage.success("候选人已保存");
					candidateDialogVisible.value = false;
					refreshAll();
				} finally {
					candidateSubmitting.value = false;
				}
			});
			return _submitCandidate.apply(this, arguments);
		}
		function selectCandidate(row) {
			selectedCandidate.value = row;
		}
		function openInterviewDialog(row) {
			var _row$interviewerId;
			selectedCandidate.value = row;
			loadInterviewerOptions();
			Object.assign(interviewForm, {
				resumeId: row.id,
				recruitId: row.recruitId,
				stage: row.status === 4 ? "re_interview" : "first",
				result: "record",
				interviewer: row.interviewer || "",
				interviewerId: (_row$interviewerId = row.interviewerId) !== null && _row$interviewerId !== void 0 ? _row$interviewerId : void 0,
				interviewTime: "",
				nextInterviewTime: "",
				evaluation: row.evaluation || "",
				rejectReason: ""
			});
			interviewDialogVisible.value = true;
		}
		function submitInterview() {
			return _submitInterview.apply(this, arguments);
		}
		function _submitInterview() {
			_submitInterview = _asyncToGenerator(function* () {
				var _interviewFormRef$val;
				yield (_interviewFormRef$val = interviewFormRef.value) === null || _interviewFormRef$val === void 0 ? void 0 : _interviewFormRef$val.validate();
				interviewSubmitting.value = true;
				try {
					yield interviewRecordApi.create(interviewForm);
					ElMessage.success("面试流转已记录");
					interviewDialogVisible.value = false;
					yield loadCandidates();
					if ([
						"pass",
						"reject",
						"not_join"
					].includes(interviewForm.result)) yield loadOnboardings();
					if (timelineVisible.value && selectedCandidate.value) {
						const fresh = candidates.value.find((item) => item.id === selectedCandidate.value.id);
						if (fresh) selectedCandidate.value = fresh;
						yield loadTimeline(selectedCandidate.value);
					}
				} finally {
					interviewSubmitting.value = false;
				}
			});
			return _submitInterview.apply(this, arguments);
		}
		function openTimeline(_x11) {
			return _openTimeline.apply(this, arguments);
		}
		function _openTimeline() {
			_openTimeline = _asyncToGenerator(function* (row) {
				selectedCandidate.value = row;
				timelineVisible.value = true;
				yield loadTimeline(row);
			});
			return _openTimeline.apply(this, arguments);
		}
		function loadTimeline(_x12) {
			return _loadTimeline.apply(this, arguments);
		}
		function _loadTimeline() {
			_loadTimeline = _asyncToGenerator(function* (row) {
				timelineLoading.value = true;
				try {
					interviewRecords.value = (yield interviewRecordApi.list(row.id)).data || [];
				} finally {
					timelineLoading.value = false;
				}
			});
			return _loadTimeline.apply(this, arguments);
		}
		function downloadResume(_x13) {
			return _downloadResume.apply(this, arguments);
		}
		function _downloadResume() {
			_downloadResume = _asyncToGenerator(function* (row) {
				if (!row.resumeFileId) return;
				const blob = yield fileInfoApi.download(row.resumeFileId);
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = row.resumeFileName || `${row.name || "候选人"}简历`;
				link.click();
				window.URL.revokeObjectURL(url);
			});
			return _downloadResume.apply(this, arguments);
		}
		onMounted(() => {
			refreshAll();
		});
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_progress = ElProgress;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_empty = ElEmpty;
			const _component_el_tabs = ElTabs;
			const _component_el_card = ElCard;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_switch = ElSwitch;
			const _component_el_upload = ElUpload;
			const _component_el_alert = ElAlert;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("section", _hoisted_2, [_cache[72] || (_cache[72] = createBaseVNode("div", null, [
					createBaseVNode("div", { class: "eyebrow" }, "ZHEHANG · 招聘闭环"),
					createBaseVNode("h2", null, "从招聘需求到入职留痕"),
					createBaseVNode("p", null, "统一管理招聘周期、人才库、约面登记、面试评价、待入职登记、Offer 和员工档案草稿。")
				], -1)), createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [createBaseVNode("strong", null, toDisplayString(metrics.value.openJobs), 1), _cache[69] || (_cache[69] = createBaseVNode("span", null, "进行中需求", -1))]),
					createBaseVNode("div", _hoisted_5, [createBaseVNode("strong", null, toDisplayString(metrics.value.activeCandidates), 1), _cache[70] || (_cache[70] = createBaseVNode("span", null, "在流程候选人", -1))]),
					createBaseVNode("div", _hoisted_6, [createBaseVNode("strong", null, toDisplayString(metrics.value.urgentJobs), 1), _cache[71] || (_cache[71] = createBaseVNode("span", null, "临期/超期需求", -1))])
				])]),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "main-panel"
				}, {
					default: withCtx(() => [createVNode(_component_el_tabs, {
						modelValue: activeTab.value,
						"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => activeTab.value = $event),
						onTabChange: handleTabChange
					}, {
						default: withCtx(() => [
							createVNode(_component_el_tab_pane, {
								label: "招聘需求",
								name: "jobs"
							}, {
								default: withCtx(() => [
									createBaseVNode("div", _hoisted_7, [createBaseVNode("div", _hoisted_8, [
										createVNode(_component_el_input, {
											modelValue: jobQuery.title,
											"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => jobQuery.title = $event),
											clearable: "",
											placeholder: "搜索职位/需求名称",
											onKeyup: withKeys(loadJobs, ["enter"])
										}, null, 8, ["modelValue"]),
										createVNode(_component_el_select, {
											modelValue: jobQuery.status,
											"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => jobQuery.status = $event),
											clearable: "",
											placeholder: "状态",
											class: "status-filter"
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(recruitStatusOptions, (item) => {
												return createVNode(_component_el_option, {
													key: item.value,
													label: item.label,
													value: item.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"]),
										createVNode(_component_el_button, {
											type: "primary",
											onClick: loadJobs
										}, {
											default: withCtx(() => [..._cache[73] || (_cache[73] = [createTextVNode("搜索", -1)])]),
											_: 1
										}),
										createVNode(_component_el_button, { onClick: resetJobQuery }, {
											default: withCtx(() => [..._cache[74] || (_cache[74] = [createTextVNode("重置", -1)])]),
											_: 1
										})
									]), createVNode(_component_el_button, {
										type: "primary",
										onClick: _cache[2] || (_cache[2] = ($event) => openJobDialog())
									}, {
										default: withCtx(() => [..._cache[75] || (_cache[75] = [createTextVNode("新增招聘需求", -1)])]),
										_: 1
									})]),
									withDirectives((openBlock(), createBlock(_component_el_table, {
										data: jobs.value,
										border: "",
										stripe: ""
									}, {
										default: withCtx(() => [
											createVNode(_component_el_table_column, {
												prop: "title",
												label: "招聘需求",
												"min-width": "180",
												"show-overflow-tooltip": ""
											}),
											createVNode(_component_el_table_column, {
												label: "招聘周期",
												width: "220"
											}, {
												default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_9, [
													createBaseVNode("span", null, toDisplayString(row.startDate || "-"), 1),
													_cache[76] || (_cache[76] = createBaseVNode("span", null, "至", -1)),
													createBaseVNode("span", null, toDisplayString(row.planFinishDate || "-"), 1)
												])]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												prop: "headcount",
												label: "需求人数",
												width: "92",
												align: "center"
											}),
											createVNode(_component_el_table_column, {
												label: "薪资范围",
												width: "150",
												align: "center"
											}, {
												default: withCtx(({ row }) => [createTextVNode(toDisplayString(salaryRange(row)), 1)]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												prop: "jobOwner",
												label: "岗位负责人",
												width: "120"
											}),
											createVNode(_component_el_table_column, {
												prop: "recruitOwner",
												label: "招聘负责人",
												width: "120"
											}),
											createVNode(_component_el_table_column, {
												label: "进度",
												width: "150"
											}, {
												default: withCtx(({ row }) => [createVNode(_component_el_progress, {
													percentage: jobProgress(row),
													"stroke-width": 8
												}, null, 8, ["percentage"])]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "状态",
												width: "110"
											}, {
												default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: recruitStatusType(row.status) }, {
													default: withCtx(() => [createTextVNode(toDisplayString(recruitStatusLabel(row.status)), 1)]),
													_: 2
												}, 1032, ["type"])]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "操作",
												width: "280",
												fixed: "right"
											}, {
												default: withCtx(({ row }) => [
													createVNode(_component_el_button, {
														link: "",
														type: "primary",
														onClick: ($event) => openJobDialog(row)
													}, {
														default: withCtx(() => [..._cache[77] || (_cache[77] = [createTextVNode("编辑", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													createVNode(_component_el_button, {
														link: "",
														type: "primary",
														onClick: ($event) => openCandidateDialog(row)
													}, {
														default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("加候选人", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													row.status !== 1 ? (openBlock(), createBlock(_component_el_button, {
														key: 0,
														link: "",
														type: "success",
														onClick: ($event) => changeJobStatus(row, 1)
													}, {
														default: withCtx(() => [..._cache[79] || (_cache[79] = [createTextVNode("开始", -1)])]),
														_: 1
													}, 8, ["onClick"])) : createCommentVNode("", true),
													row.status === 1 ? (openBlock(), createBlock(_component_el_button, {
														key: 1,
														link: "",
														type: "warning",
														onClick: ($event) => changeJobStatus(row, 2)
													}, {
														default: withCtx(() => [..._cache[80] || (_cache[80] = [createTextVNode("完成", -1)])]),
														_: 1
													}, 8, ["onClick"])) : createCommentVNode("", true),
													row.status === 1 ? (openBlock(), createBlock(_component_el_button, {
														key: 2,
														link: "",
														type: "danger",
														onClick: ($event) => changeJobStatus(row, 3)
													}, {
														default: withCtx(() => [..._cache[81] || (_cache[81] = [createTextVNode("取消", -1)])]),
														_: 1
													}, 8, ["onClick"])) : createCommentVNode("", true)
												]),
												_: 1
											})
										]),
										_: 1
									}, 8, ["data"])), [[_directive_loading, jobLoading.value]]),
									createVNode(_component_el_pagination, {
										"current-page": jobQuery.pageNum,
										"onUpdate:currentPage": _cache[3] || (_cache[3] = ($event) => jobQuery.pageNum = $event),
										"page-size": jobQuery.pageSize,
										"onUpdate:pageSize": _cache[4] || (_cache[4] = ($event) => jobQuery.pageSize = $event),
										total: jobTotal.value,
										"page-sizes": [
											10,
											20,
											50
										],
										layout: "total, sizes, prev, pager, next, jumper",
										class: "pagination",
										onSizeChange: loadJobs,
										onCurrentChange: loadJobs
									}, null, 8, [
										"current-page",
										"page-size",
										"total"
									])
								]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, {
								label: "简历人才库",
								name: "candidates"
							}, {
								default: withCtx(() => [
									createBaseVNode("div", _hoisted_10, [createBaseVNode("div", _hoisted_11, [
										createVNode(_component_el_input, {
											modelValue: candidateQuery.keyword,
											"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => candidateQuery.keyword = $event),
											clearable: "",
											placeholder: "姓名/电话/岗位/学历/标签",
											onKeyup: withKeys(loadCandidates, ["enter"])
										}, null, 8, ["modelValue"]),
										createVNode(_component_el_select, {
											modelValue: candidateQuery.status,
											"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => candidateQuery.status = $event),
											clearable: "",
											placeholder: "候选人状态",
											class: "status-filter"
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(resumeStatusOptions, (item) => {
												return createVNode(_component_el_option, {
													key: item.value,
													label: item.label,
													value: item.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"]),
										createVNode(_component_el_input, {
											modelValue: candidateQuery.tags,
											"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => candidateQuery.tags = $event),
											clearable: "",
											placeholder: "标签: 代账/初级会计证",
											class: "tag-filter",
											onKeyup: withKeys(loadCandidates, ["enter"])
										}, null, 8, ["modelValue"]),
										createVNode(_component_el_date_picker, {
											modelValue: interviewDateRange.value,
											"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => interviewDateRange.value = $event),
											type: "daterange",
											"value-format": "YYYY-MM-DD",
											"range-separator": "至",
											"start-placeholder": "初面开始",
											"end-placeholder": "初面结束",
											class: "interview-date-filter",
											onChange: onInterviewDateRangeChange
										}, null, 8, ["modelValue"]),
										createVNode(_component_el_button, { onClick: filterTodayInterviews }, {
											default: withCtx(() => [..._cache[82] || (_cache[82] = [createTextVNode("今日约面", -1)])]),
											_: 1
										}),
										createVNode(_component_el_button, {
											type: "primary",
											onClick: loadCandidates
										}, {
											default: withCtx(() => [..._cache[83] || (_cache[83] = [createTextVNode("搜索", -1)])]),
											_: 1
										}),
										createVNode(_component_el_button, { onClick: resetCandidateQuery }, {
											default: withCtx(() => [..._cache[84] || (_cache[84] = [createTextVNode("重置", -1)])]),
											_: 1
										})
									]), createVNode(_component_el_button, {
										type: "primary",
										onClick: _cache[9] || (_cache[9] = ($event) => openCandidateDialog())
									}, {
										default: withCtx(() => [..._cache[85] || (_cache[85] = [createTextVNode("新增候选人", -1)])]),
										_: 1
									})]),
									withDirectives((openBlock(), createBlock(_component_el_table, {
										data: candidates.value,
										border: "",
										stripe: "",
										onRowClick: selectCandidate
									}, {
										default: withCtx(() => [
											createVNode(_component_el_table_column, {
												prop: "positionName",
												label: "应聘岗位",
												"min-width": "150",
												"show-overflow-tooltip": ""
											}),
											createVNode(_component_el_table_column, {
												prop: "name",
												label: "姓名",
												width: "100"
											}),
											createVNode(_component_el_table_column, {
												prop: "age",
												label: "年龄",
												width: "70",
												align: "center"
											}),
											createVNode(_component_el_table_column, {
												prop: "phone",
												label: "电话",
												width: "130"
											}),
											createVNode(_component_el_table_column, {
												prop: "education",
												label: "学历",
												width: "90"
											}),
											createVNode(_component_el_table_column, {
												label: "标签",
												"min-width": "190"
											}, {
												default: withCtx(({ row }) => [(openBlock(true), createElementBlock(Fragment, null, renderList(tagList(row.tags), (tag) => {
													return openBlock(), createBlock(_component_el_tag, {
														key: tag,
														size: "small",
														class: "tag"
													}, {
														default: withCtx(() => [createTextVNode(toDisplayString(tag), 1)]),
														_: 2
													}, 1024);
												}), 128)), !tagList(row.tags).length ? (openBlock(), createElementBlock("span", _hoisted_12, "-")) : createCommentVNode("", true)]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "初面/复试",
												width: "220"
											}, {
												default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_13, [createBaseVNode("span", null, "初面: " + toDisplayString(formatDateTime(row.firstInterviewTime)), 1), createBaseVNode("span", null, "复试: " + toDisplayString(formatDateTime(row.reInterviewTime)), 1)])]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "状态",
												width: "120"
											}, {
												default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: resumeStatusType(row.status) }, {
													default: withCtx(() => [createTextVNode(toDisplayString(resumeStatusLabel(row.status)), 1)]),
													_: 2
												}, 1032, ["type"])]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "附件",
												width: "110"
											}, {
												default: withCtx(({ row }) => [row.resumeFileId ? (openBlock(), createBlock(_component_el_button, {
													key: 0,
													link: "",
													type: "primary",
													onClick: withModifiers(($event) => downloadResume(row), ["stop"])
												}, {
													default: withCtx(() => [..._cache[86] || (_cache[86] = [createTextVNode("下载", -1)])]),
													_: 1
												}, 8, ["onClick"])) : (openBlock(), createElementBlock("span", _hoisted_14, "无"))]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "操作",
												width: "300",
												fixed: "right"
											}, {
												default: withCtx(({ row }) => [
													createVNode(_component_el_button, {
														link: "",
														type: "primary",
														onClick: withModifiers(($event) => openCandidateDialog(void 0, row), ["stop"])
													}, {
														default: withCtx(() => [..._cache[87] || (_cache[87] = [createTextVNode("编辑", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													createVNode(_component_el_button, {
														link: "",
														type: "success",
														onClick: withModifiers(($event) => openInterviewDialog(row), ["stop"])
													}, {
														default: withCtx(() => [..._cache[88] || (_cache[88] = [createTextVNode("登记面试", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													[2, 7].includes(Number(row.status)) ? (openBlock(), createBlock(_component_el_button, {
														key: 0,
														link: "",
														type: "warning",
														onClick: withModifiers(($event) => createOnboardingFromCandidate(row), ["stop"])
													}, {
														default: withCtx(() => [..._cache[89] || (_cache[89] = [createTextVNode("待入职", -1)])]),
														_: 1
													}, 8, ["onClick"])) : createCommentVNode("", true),
													createVNode(_component_el_button, {
														link: "",
														type: "info",
														onClick: withModifiers(($event) => openTimeline(row), ["stop"])
													}, {
														default: withCtx(() => [..._cache[90] || (_cache[90] = [createTextVNode("流转记录", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													createVNode(_component_el_button, {
														link: "",
														type: "danger",
														onClick: withModifiers(($event) => removeCandidate(row), ["stop"])
													}, {
														default: withCtx(() => [..._cache[91] || (_cache[91] = [createTextVNode("删除", -1)])]),
														_: 1
													}, 8, ["onClick"])
												]),
												_: 1
											})
										]),
										_: 1
									}, 8, ["data"])), [[_directive_loading, candidateLoading.value]]),
									createVNode(_component_el_pagination, {
										"current-page": candidateQuery.pageNum,
										"onUpdate:currentPage": _cache[10] || (_cache[10] = ($event) => candidateQuery.pageNum = $event),
										"page-size": candidateQuery.pageSize,
										"onUpdate:pageSize": _cache[11] || (_cache[11] = ($event) => candidateQuery.pageSize = $event),
										total: candidateTotal.value,
										"page-sizes": [
											10,
											20,
											50
										],
										layout: "total, sizes, prev, pager, next, jumper",
										class: "pagination",
										onSizeChange: loadCandidates,
										onCurrentChange: loadCandidates
									}, null, 8, [
										"current-page",
										"page-size",
										"total"
									])
								]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, {
								label: "面试流转",
								name: "pipeline"
							}, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_15, [(openBlock(), createElementBlock(Fragment, null, renderList(pipelineColumns, (column) => {
									return createBaseVNode("div", {
										key: column.status,
										class: "pipeline-column"
									}, [
										createBaseVNode("div", _hoisted_16, [createBaseVNode("span", null, toDisplayString(column.title), 1), createBaseVNode("strong", null, toDisplayString(candidatesByStatus(column.status).length), 1)]),
										(openBlock(true), createElementBlock(Fragment, null, renderList(candidatesByStatus(column.status), (item) => {
											return openBlock(), createElementBlock("div", {
												key: item.id,
												class: "candidate-card",
												onClick: ($event) => openTimeline(item)
											}, [
												createBaseVNode("div", _hoisted_18, [createBaseVNode("strong", null, toDisplayString(item.name), 1), createVNode(_component_el_tag, {
													size: "small",
													type: resumeStatusType(item.status)
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(resumeStatusLabel(item.status)), 1)]),
													_: 2
												}, 1032, ["type"])]),
												createBaseVNode("p", null, toDisplayString(item.positionName || matchJobTitle(item.recruitId) || "未关联岗位"), 1),
												createBaseVNode("div", _hoisted_19, [createBaseVNode("span", null, toDisplayString(item.phone || "-"), 1), createBaseVNode("span", null, toDisplayString(item.interviewer || "未定面试官"), 1)]),
												createBaseVNode("div", _hoisted_20, [(openBlock(true), createElementBlock(Fragment, null, renderList(tagList(item.tags).slice(0, 3), (tag) => {
													return openBlock(), createBlock(_component_el_tag, {
														key: tag,
														size: "small",
														effect: "plain"
													}, {
														default: withCtx(() => [createTextVNode(toDisplayString(tag), 1)]),
														_: 2
													}, 1024);
												}), 128))]),
												createVNode(_component_el_button, {
													link: "",
													type: "primary",
													onClick: withModifiers(($event) => openInterviewDialog(item), ["stop"])
												}, {
													default: withCtx(() => [..._cache[92] || (_cache[92] = [createTextVNode("登记流转", -1)])]),
													_: 1
												}, 8, ["onClick"])
											], 8, _hoisted_17);
										}), 128)),
										!candidatesByStatus(column.status).length ? (openBlock(), createBlock(_component_el_empty, {
											key: 0,
											description: "暂无候选人",
											"image-size": 64
										})) : createCommentVNode("", true)
									]);
								}), 64))])]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, {
								label: "待入职",
								name: "onboarding"
							}, {
								default: withCtx(() => [
									createBaseVNode("div", _hoisted_21, [createBaseVNode("div", _hoisted_22, [
										createVNode(_component_el_input, {
											modelValue: onboardingQuery.keyword,
											"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => onboardingQuery.keyword = $event),
											clearable: "",
											placeholder: "姓名/电话/邮箱/岗位",
											onKeyup: withKeys(loadOnboardings, ["enter"])
										}, null, 8, ["modelValue"]),
										createVNode(_component_el_select, {
											modelValue: onboardingQuery.status,
											"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => onboardingQuery.status = $event),
											clearable: "",
											placeholder: "待入职状态",
											class: "status-filter"
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(onboardingStatusOptions, (item) => {
												return createVNode(_component_el_option, {
													key: item.value,
													label: item.label,
													value: item.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"]),
										createVNode(_component_el_button, {
											type: "primary",
											onClick: loadOnboardings
										}, {
											default: withCtx(() => [..._cache[93] || (_cache[93] = [createTextVNode("搜索", -1)])]),
											_: 1
										}),
										createVNode(_component_el_button, { onClick: resetOnboardingQuery }, {
											default: withCtx(() => [..._cache[94] || (_cache[94] = [createTextVNode("重置", -1)])]),
											_: 1
										})
									])]),
									withDirectives((openBlock(), createBlock(_component_el_table, {
										data: onboardings.value,
										border: "",
										stripe: ""
									}, {
										default: withCtx(() => [
											createVNode(_component_el_table_column, {
												prop: "name",
												label: "候选人",
												width: "110"
											}),
											createVNode(_component_el_table_column, {
												prop: "positionName",
												label: "待入职岗位",
												"min-width": "150",
												"show-overflow-tooltip": ""
											}),
											createVNode(_component_el_table_column, {
												prop: "phone",
												label: "手机",
												width: "130"
											}),
											createVNode(_component_el_table_column, {
												prop: "email",
												label: "邮箱",
												"min-width": "170",
												"show-overflow-tooltip": ""
											}),
											createVNode(_component_el_table_column, {
												label: "状态",
												width: "120"
											}, {
												default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: onboardingStatusType(row.status) }, {
													default: withCtx(() => [createTextVNode(toDisplayString(onboardingStatusLabel(row.status)), 1)]),
													_: 2
												}, 1032, ["type"])]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "预计入职",
												width: "120"
											}, {
												default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.expectedHireDate || "-"), 1)]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "登记表",
												"min-width": "420"
											}, {
												default: withCtx(({ row }) => [row.formToken ? (openBlock(), createElementBlock("div", _hoisted_23, [
													createBaseVNode("div", _hoisted_24, [createBaseVNode("div", _hoisted_25, [
														createVNode(_component_el_tag, {
															size: "small",
															type: "success",
															effect: "plain"
														}, {
															default: withCtx(() => [..._cache[95] || (_cache[95] = [createTextVNode("公开免登录", -1)])]),
															_: 1
														}),
														createVNode(_component_el_tag, {
															size: "small",
															type: onboardingLinkStatusType(row),
															effect: "plain"
														}, {
															default: withCtx(() => [createTextVNode(toDisplayString(onboardingLinkStatusLabel(row)), 1)]),
															_: 2
														}, 1032, ["type"]),
														createBaseVNode("span", { title: onboardingFullLink(row) }, toDisplayString(onboardingFullLink(row)), 9, _hoisted_26)
													]), createBaseVNode("div", _hoisted_27, "有效期至 " + toDisplayString(formatDateTime(row.tokenExpiresAt) || "-"), 1)]),
													createVNode(_component_el_button, {
														link: "",
														type: "primary",
														onClick: ($event) => copyOnboardingLink(row)
													}, {
														default: withCtx(() => [..._cache[96] || (_cache[96] = [createTextVNode("复制", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													createVNode(_component_el_button, {
														link: "",
														type: "primary",
														onClick: ($event) => openOnboardingLink(row)
													}, {
														default: withCtx(() => [..._cache[97] || (_cache[97] = [createTextVNode("打开", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													createVNode(_component_el_button, {
														link: "",
														type: "warning",
														onClick: ($event) => refreshOnboardingToken(row)
													}, {
														default: withCtx(() => [..._cache[98] || (_cache[98] = [createTextVNode("刷新链接", -1)])]),
														_: 1
													}, 8, ["onClick"])
												])) : (openBlock(), createElementBlock("span", _hoisted_28, "未生成"))]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "Offer",
												width: "120"
											}, {
												default: withCtx(({ row }) => [row.offerSendStatus === 1 ? (openBlock(), createBlock(_component_el_tag, {
													key: 0,
													type: "success"
												}, {
													default: withCtx(() => [..._cache[99] || (_cache[99] = [createTextVNode("已标记发送", -1)])]),
													_: 1
												})) : row.offerContent ? (openBlock(), createBlock(_component_el_tag, {
													key: 1,
													type: "primary"
												}, {
													default: withCtx(() => [..._cache[100] || (_cache[100] = [createTextVNode("已生成", -1)])]),
													_: 1
												})) : (openBlock(), createBlock(_component_el_tag, {
													key: 2,
													type: "info"
												}, {
													default: withCtx(() => [..._cache[101] || (_cache[101] = [createTextVNode("未生成", -1)])]),
													_: 1
												}))]),
												_: 1
											}),
											createVNode(_component_el_table_column, {
												label: "操作",
												width: "380",
												fixed: "right"
											}, {
												default: withCtx(({ row }) => [
													createVNode(_component_el_button, {
														link: "",
														type: "primary",
														onClick: ($event) => openSchemaDialog(row)
													}, {
														default: withCtx(() => [..._cache[102] || (_cache[102] = [createTextVNode("字段", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													row.formData ? (openBlock(), createBlock(_component_el_button, {
														key: 0,
														link: "",
														type: "info",
														onClick: ($event) => showSubmittedForm(row)
													}, {
														default: withCtx(() => [..._cache[103] || (_cache[103] = [createTextVNode("资料", -1)])]),
														_: 1
													}, 8, ["onClick"])) : createCommentVNode("", true),
													createVNode(_component_el_button, {
														link: "",
														type: "success",
														onClick: ($event) => confirmOnboardingForm(row)
													}, {
														default: withCtx(() => [..._cache[104] || (_cache[104] = [createTextVNode("确认资料", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													createVNode(_component_el_button, {
														link: "",
														type: "primary",
														onClick: ($event) => openOfferDialog(row)
													}, {
														default: withCtx(() => [..._cache[105] || (_cache[105] = [createTextVNode("生成Offer", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													row.offerContent ? (openBlock(), createBlock(_component_el_button, {
														key: 1,
														link: "",
														type: "info",
														onClick: ($event) => showOffer(row)
													}, {
														default: withCtx(() => [..._cache[106] || (_cache[106] = [createTextVNode("查看Offer", -1)])]),
														_: 1
													}, 8, ["onClick"])) : createCommentVNode("", true),
													row.offerContent ? (openBlock(), createBlock(_component_el_button, {
														key: 2,
														link: "",
														type: "warning",
														onClick: ($event) => markOfferSent(row)
													}, {
														default: withCtx(() => [..._cache[107] || (_cache[107] = [createTextVNode("标记发送", -1)])]),
														_: 1
													}, 8, ["onClick"])) : createCommentVNode("", true),
													createVNode(_component_el_button, {
														link: "",
														type: "success",
														onClick: ($event) => createEmployeeDraft(row)
													}, {
														default: withCtx(() => [..._cache[108] || (_cache[108] = [createTextVNode("员工草稿", -1)])]),
														_: 1
													}, 8, ["onClick"]),
													createVNode(_component_el_button, {
														link: "",
														type: "success",
														onClick: ($event) => markOnboarded(row)
													}, {
														default: withCtx(() => [..._cache[109] || (_cache[109] = [createTextVNode("完成入职", -1)])]),
														_: 1
													}, 8, ["onClick"])
												]),
												_: 1
											})
										]),
										_: 1
									}, 8, ["data"])), [[_directive_loading, onboardingLoading.value]]),
									createVNode(_component_el_pagination, {
										"current-page": onboardingQuery.pageNum,
										"onUpdate:currentPage": _cache[14] || (_cache[14] = ($event) => onboardingQuery.pageNum = $event),
										"page-size": onboardingQuery.pageSize,
										"onUpdate:pageSize": _cache[15] || (_cache[15] = ($event) => onboardingQuery.pageSize = $event),
										total: onboardingTotal.value,
										"page-sizes": [
											10,
											20,
											50
										],
										layout: "total, sizes, prev, pager, next, jumper",
										class: "pagination",
										onSizeChange: loadOnboardings,
										onCurrentChange: loadOnboardings
									}, null, 8, [
										"current-page",
										"page-size",
										"total"
									])
								]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["modelValue"])]),
					_: 1
				}),
				createVNode(_component_el_dialog, {
					modelValue: jobDialogVisible.value,
					"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => jobDialogVisible.value = $event),
					title: jobForm.id ? "编辑招聘需求" : "新增招聘需求",
					width: "720px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[26] || (_cache[26] = ($event) => jobDialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[110] || (_cache[110] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: jobSubmitting.value,
						onClick: submitJob
					}, {
						default: withCtx(() => [..._cache[111] || (_cache[111] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: jobForm,
						rules: jobRules,
						ref_key: "jobFormRef",
						ref: jobFormRef,
						"label-width": "110px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "招聘职位",
								prop: "title"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: jobForm.title,
									"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => jobForm.title = $event),
									placeholder: "例如: 代账会计 / 电销专员 / 销售经理"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "招聘人数",
											prop: "headcount"
										}, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: jobForm.headcount,
												"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => jobForm.headcount = $event),
												min: 1,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "开始时间" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: jobForm.startDate,
												"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => jobForm.startDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "计划完成" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: jobForm.planFinishDate,
												"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => jobForm.planFinishDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "岗位负责人" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: jobForm.jobOwner,
											"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => jobForm.jobOwner = $event),
											clearable: "",
											filterable: "",
											"allow-create": "",
											"default-first-option": "",
											loading: employeeLoading.value,
											placeholder: "选择用人部门负责人",
											style: { "width": "100%" },
											onVisibleChange: handleInterviewerDropdownVisible
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(interviewerOptions.value, (employee) => {
												return openBlock(), createBlock(_component_el_option, {
													key: `job-owner-${employee.userId}`,
													label: interviewerOptionLabel(employee),
													value: employee.name
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue", "loading"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "招聘负责人" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: jobForm.recruitOwner,
											"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => jobForm.recruitOwner = $event),
											clearable: "",
											filterable: "",
											"allow-create": "",
											"default-first-option": "",
											loading: employeeLoading.value,
											placeholder: "选择HR/招聘同事",
											style: { "width": "100%" },
											onVisibleChange: handleInterviewerDropdownVisible
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(interviewerOptions.value, (employee) => {
												return openBlock(), createBlock(_component_el_option, {
													key: `recruit-owner-${employee.userId}`,
													label: interviewerOptionLabel(employee),
													value: employee.name
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue", "loading"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "最低薪资" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: jobForm.salaryMin,
											"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => jobForm.salaryMin = $event),
											min: 0,
											precision: 0,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "最高薪资" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: jobForm.salaryMax,
											"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => jobForm.salaryMax = $event),
											min: 0,
											precision: 0,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "任职要求" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: jobForm.requirements,
									"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => jobForm.requirements = $event),
									type: "textarea",
									rows: 4,
									placeholder: "岗位职责、硬性要求、加分项、面试关注点"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: candidateDialogVisible.value,
					"onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => candidateDialogVisible.value = $event),
					title: candidateForm.id ? "编辑候选人" : "新增候选人 / 约面登记",
					width: "780px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[42] || (_cache[42] = ($event) => candidateDialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[113] || (_cache[113] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: candidateSubmitting.value,
						onClick: submitCandidate
					}, {
						default: withCtx(() => [..._cache[114] || (_cache[114] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: candidateForm,
						rules: candidateRules,
						ref_key: "candidateFormRef",
						ref: candidateFormRef,
						"label-width": "118px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "应聘岗位" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: candidateForm.recruitId,
											"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => candidateForm.recruitId = $event),
											clearable: "",
											filterable: "",
											placeholder: "选择招聘需求",
											style: { "width": "100%" },
											onChange: syncCandidatePosition
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(jobs.value, (job) => {
												return openBlock(), createBlock(_component_el_option, {
													key: job.id,
													label: job.title,
													value: job.id
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "岗位名称" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: candidateForm.positionName,
											"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => candidateForm.positionName = $event),
											placeholder: "未建招聘需求时可手填"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "姓名",
											prop: "name"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: candidateForm.name,
												"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => candidateForm.name = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "年龄" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: candidateForm.age,
												"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => candidateForm.age = $event),
												min: 16,
												max: 70,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "联系电话" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: candidateForm.phone,
												"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => candidateForm.phone = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "学历" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: candidateForm.education,
												"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => candidateForm.education = $event),
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(educationOptions, (item) => {
													return createVNode(_component_el_option, {
														key: item,
														label: item,
														value: item
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "工作年限" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: candidateForm.experienceYears,
												"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => candidateForm.experienceYears = $event),
												min: 0,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "期望薪资" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: candidateForm.expectedSalary,
												"onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => candidateForm.expectedSalary = $event),
												min: 0,
												precision: 0,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "初面时间" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: candidateForm.firstInterviewTime,
											"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => candidateForm.firstInterviewTime = $event),
											type: "datetime",
											"value-format": "YYYY-MM-DD HH:mm:ss",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "复试时间" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: candidateForm.reInterviewTime,
											"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => candidateForm.reInterviewTime = $event),
											type: "datetime",
											"value-format": "YYYY-MM-DD HH:mm:ss",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否需要复试" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: candidateForm.needReInterview,
											"onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => candidateForm.needReInterview = $event),
											"active-text": "需要",
											"inactive-text": "不需要"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "面试官" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: candidateForm.interviewer,
											"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => candidateForm.interviewer = $event),
											clearable: "",
											filterable: "",
											"allow-create": "",
											"default-first-option": "",
											loading: employeeLoading.value,
											placeholder: "选择公司人员或手动输入",
											style: { "width": "100%" },
											onVisibleChange: handleInterviewerDropdownVisible,
											onChange: onCandidateInterviewerChange
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(interviewerOptions.value, (employee) => {
												return openBlock(), createBlock(_component_el_option, {
													key: `cand-interviewer-${employee.userId}`,
													label: interviewerOptionLabel(employee),
													value: employee.name
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue", "loading"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "人才标签" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: candidateTagValues.value,
									"onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => candidateTagValues.value = $event),
									multiple: "",
									filterable: "",
									"allow-create": "",
									"default-first-option": "",
									style: { "width": "100%" },
									placeholder: "例如: 有代账经验、持初级会计证、可立即到岗"
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(quickTags, (tag) => {
										return createVNode(_component_el_option, {
											key: tag,
											label: tag,
											value: tag
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "附件简历" }, {
								default: withCtx(() => [createVNode(_component_el_upload, {
									drag: "",
									"auto-upload": false,
									limit: 1,
									"file-list": resumeFileList.value,
									"on-change": handleResumeFileChange,
									"on-remove": handleResumeFileRemove
								}, {
									tip: withCtx(() => [createBaseVNode("div", _hoisted_29, "支持 PDF、Word、图片等常见简历文件。已上传: " + toDisplayString(candidateForm.resumeFileName || "无"), 1)]),
									default: withCtx(() => [_cache[112] || (_cache[112] = createBaseVNode("div", { class: "upload-text" }, "拖拽或点击上传简历附件", -1))]),
									_: 1
								}, 8, ["file-list"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "评价/备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: candidateForm.evaluation,
									"onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => candidateForm.evaluation = $event),
									type: "textarea",
									rows: 3,
									placeholder: "候选人亮点、风险、沟通情况"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: interviewDialogVisible.value,
					"onUpdate:modelValue": _cache[52] || (_cache[52] = ($event) => interviewDialogVisible.value = $event),
					title: "登记面试流转",
					width: "660px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[51] || (_cache[51] = ($event) => interviewDialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[115] || (_cache[115] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: interviewSubmitting.value,
						onClick: submitInterview
					}, {
						default: withCtx(() => [..._cache[116] || (_cache[116] = [createTextVNode("保存流转", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: interviewForm,
						rules: interviewRules,
						ref_key: "interviewFormRef",
						ref: interviewFormRef,
						"label-width": "110px"
					}, {
						default: withCtx(() => [
							selectedCandidate.value ? (openBlock(), createBlock(_component_el_alert, {
								key: 0,
								title: `${selectedCandidate.value.name} · ${selectedCandidate.value.positionName || matchJobTitle(selectedCandidate.value.recruitId) || "未关联岗位"}`,
								type: "info",
								closable: false,
								class: "candidate-alert"
							}, null, 8, ["title"])) : createCommentVNode("", true),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "面试阶段",
										prop: "stage"
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: interviewForm.stage,
											"onUpdate:modelValue": _cache[44] || (_cache[44] = ($event) => interviewForm.stage = $event),
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [
												createVNode(_component_el_option, {
													label: "简历筛选",
													value: "screen"
												}),
												createVNode(_component_el_option, {
													label: "初面",
													value: "first"
												}),
												createVNode(_component_el_option, {
													label: "复试",
													value: "re_interview"
												}),
												createVNode(_component_el_option, {
													label: "终面",
													value: "final"
												}),
												createVNode(_component_el_option, {
													label: "入职跟进",
													value: "join"
												})
											]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "流转结果",
										prop: "result"
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: interviewForm.result,
											"onUpdate:modelValue": _cache[45] || (_cache[45] = ($event) => interviewForm.result = $event),
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [
												createVNode(_component_el_option, {
													label: "仅记录",
													value: "record"
												}),
												createVNode(_component_el_option, {
													label: "通过进入复试",
													value: "first_pass"
												}),
												createVNode(_component_el_option, {
													label: "面试通过进入待入职",
													value: "pass"
												}),
												createVNode(_component_el_option, {
													label: "确认入职",
													value: "hired"
												}),
												createVNode(_component_el_option, {
													label: "淘汰",
													value: "reject"
												}),
												createVNode(_component_el_option, {
													label: "通过但未入职",
													value: "not_join"
												})
											]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "面试官" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: interviewForm.interviewer,
											"onUpdate:modelValue": _cache[46] || (_cache[46] = ($event) => interviewForm.interviewer = $event),
											clearable: "",
											filterable: "",
											"allow-create": "",
											"default-first-option": "",
											loading: employeeLoading.value,
											placeholder: "选择公司人员或手动输入",
											style: { "width": "100%" },
											onVisibleChange: handleInterviewerDropdownVisible,
											onChange: onInterviewInterviewerChange
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(interviewerOptions.value, (employee) => {
												return openBlock(), createBlock(_component_el_option, {
													key: `rec-interviewer-${employee.userId}`,
													label: interviewerOptionLabel(employee),
													value: employee.name
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue", "loading"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "面试时间" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: interviewForm.interviewTime,
											"onUpdate:modelValue": _cache[47] || (_cache[47] = ($event) => interviewForm.interviewTime = $event),
											type: "datetime",
											"value-format": "YYYY-MM-DD HH:mm:ss",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "下一轮时间" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: interviewForm.nextInterviewTime,
									"onUpdate:modelValue": _cache[48] || (_cache[48] = ($event) => interviewForm.nextInterviewTime = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DD HH:mm:ss",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "面试评价" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: interviewForm.evaluation,
									"onUpdate:modelValue": _cache[49] || (_cache[49] = ($event) => interviewForm.evaluation = $event),
									type: "textarea",
									rows: 4,
									placeholder: "面试官评价、专业能力、沟通意愿、薪资匹配度"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							interviewForm.result === "reject" || interviewForm.result === "not_join" ? (openBlock(), createBlock(_component_el_form_item, {
								key: 1,
								label: "原因说明"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: interviewForm.rejectReason,
									"onUpdate:modelValue": _cache[50] || (_cache[50] = ($event) => interviewForm.rejectReason = $event),
									type: "textarea",
									rows: 3,
									placeholder: "未通过原因 / 未入职原因，方便后续复盘"
								}, null, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true)
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: schemaDialogVisible.value,
					"onUpdate:modelValue": _cache[55] || (_cache[55] = ($event) => schemaDialogVisible.value = $event),
					title: "入职登记表字段配置",
					width: "760px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[54] || (_cache[54] = ($event) => schemaDialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[117] || (_cache[117] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: onboardingSubmitting.value,
						onClick: submitSchema
					}, {
						default: withCtx(() => [..._cache[118] || (_cache[118] = [createTextVNode("保存字段", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_alert, {
						title: "字段配置保存后，新打开登记链接会按这份字段渲染。",
						type: "info",
						closable: false,
						class: "candidate-alert"
					}), createVNode(_component_el_input, {
						modelValue: schemaForm.formSchema,
						"onUpdate:modelValue": _cache[53] || (_cache[53] = ($event) => schemaForm.formSchema = $event),
						type: "textarea",
						rows: 16
					}, null, 8, ["modelValue"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: offerDialogVisible.value,
					"onUpdate:modelValue": _cache[60] || (_cache[60] = ($event) => offerDialogVisible.value = $event),
					title: "生成 Offer",
					width: "760px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[59] || (_cache[59] = ($event) => offerDialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[119] || (_cache[119] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: onboardingSubmitting.value,
						onClick: submitOffer
					}, {
						default: withCtx(() => [..._cache[120] || (_cache[120] = [createTextVNode("生成 Offer", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: offerForm,
						"label-width": "110px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "预计入职" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: offerForm.expectedHireDate,
									"onUpdate:modelValue": _cache[56] || (_cache[56] = ($event) => offerForm.expectedHireDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "Offer模板" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: offerForm.offerTemplate,
									"onUpdate:modelValue": _cache[57] || (_cache[57] = ($event) => offerForm.offerTemplate = $event),
									type: "textarea",
									rows: 12
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: offerForm.remark,
									"onUpdate:modelValue": _cache[58] || (_cache[58] = ($event) => offerForm.remark = $event),
									type: "textarea",
									rows: 3,
									placeholder: "薪资、试用期、报到材料等内部备注"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: offerContentVisible.value,
					"onUpdate:modelValue": _cache[63] || (_cache[63] = ($event) => offerContentVisible.value = $event),
					title: "Offer 内容",
					width: "720px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[61] || (_cache[61] = ($event) => copyText(generatedOffer.value)) }, {
						default: withCtx(() => [..._cache[121] || (_cache[121] = [createTextVNode("复制内容", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[62] || (_cache[62] = ($event) => offerContentVisible.value = false)
					}, {
						default: withCtx(() => [..._cache[122] || (_cache[122] = [createTextVNode("关闭", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createBaseVNode("pre", _hoisted_30, toDisplayString(generatedOffer.value || "暂无 Offer 内容"), 1)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: formDataVisible.value,
					"onUpdate:modelValue": _cache[66] || (_cache[66] = ($event) => formDataVisible.value = $event),
					title: "候选人登记资料",
					width: "720px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[64] || (_cache[64] = ($event) => copyText(submittedFormPreview.value)) }, {
						default: withCtx(() => [..._cache[123] || (_cache[123] = [createTextVNode("复制资料", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[65] || (_cache[65] = ($event) => formDataVisible.value = false)
					}, {
						default: withCtx(() => [..._cache[124] || (_cache[124] = [createTextVNode("关闭", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createBaseVNode("pre", _hoisted_31, toDisplayString(submittedFormPreview.value || "暂无提交资料"), 1)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_drawer, {
					modelValue: timelineVisible.value,
					"onUpdate:modelValue": _cache[68] || (_cache[68] = ($event) => timelineVisible.value = $event),
					title: "候选人详情与流转记录",
					size: "520px",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => {
						var _selectedCandidate$va2;
						return [selectedCandidate.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
							createBaseVNode("div", _hoisted_32, [createBaseVNode("div", _hoisted_33, toDisplayString(((_selectedCandidate$va2 = selectedCandidate.value.name) === null || _selectedCandidate$va2 === void 0 ? void 0 : _selectedCandidate$va2.slice(0, 1)) || "人"), 1), createBaseVNode("div", null, [
								createBaseVNode("h3", null, toDisplayString(selectedCandidate.value.name), 1),
								createBaseVNode("p", null, toDisplayString(selectedCandidate.value.positionName || matchJobTitle(selectedCandidate.value.recruitId) || "未关联岗位") + " · " + toDisplayString(selectedCandidate.value.phone || "-"), 1),
								createVNode(_component_el_tag, { type: resumeStatusType(selectedCandidate.value.status) }, {
									default: withCtx(() => [createTextVNode(toDisplayString(resumeStatusLabel(selectedCandidate.value.status)), 1)]),
									_: 1
								}, 8, ["type"])
							])]),
							createVNode(_component_el_descriptions, {
								column: 1,
								border: "",
								class: "drawer-desc"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_descriptions_item, { label: "学历/年龄" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(selectedCandidate.value.education || "-") + " / " + toDisplayString(selectedCandidate.value.age || "-"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "标签" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(tagList(selectedCandidate.value.tags).join("、") || "-"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "初面时间" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(formatDateTime(selectedCandidate.value.firstInterviewTime)), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "复试时间" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(formatDateTime(selectedCandidate.value.reInterviewTime)), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "面试官" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(selectedCandidate.value.interviewer || "-"), 1)]),
										_: 1
									}),
									selectedCandidate.value.rejectReason ? (openBlock(), createBlock(_component_el_descriptions_item, {
										key: 0,
										label: "未通过原因"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(selectedCandidate.value.rejectReason), 1)]),
										_: 1
									})) : createCommentVNode("", true),
									selectedCandidate.value.notJoinReason ? (openBlock(), createBlock(_component_el_descriptions_item, {
										key: 1,
										label: "未入职原因"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(selectedCandidate.value.notJoinReason), 1)]),
										_: 1
									})) : createCommentVNode("", true)
								]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_34, [_cache[126] || (_cache[126] = createBaseVNode("h4", null, "流转留痕", -1)), createVNode(_component_el_button, {
								type: "primary",
								link: "",
								onClick: _cache[67] || (_cache[67] = ($event) => openInterviewDialog(selectedCandidate.value))
							}, {
								default: withCtx(() => [..._cache[125] || (_cache[125] = [createTextVNode("继续登记", -1)])]),
								_: 1
							})]),
							withDirectives((openBlock(), createBlock(_component_el_timeline, null, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(interviewRecords.value, (record) => {
									return openBlock(), createBlock(_component_el_timeline_item, {
										key: record.id,
										timestamp: formatDateTime(record.interviewTime || record.createTime),
										placement: "top"
									}, {
										default: withCtx(() => [createBaseVNode("div", _hoisted_35, [
											createBaseVNode("div", _hoisted_36, [createBaseVNode("strong", null, toDisplayString(stageLabel(record.stage)), 1), createVNode(_component_el_tag, { size: "small" }, {
												default: withCtx(() => [createTextVNode(toDisplayString(resultLabel(record.result)), 1)]),
												_: 2
											}, 1024)]),
											createBaseVNode("p", null, "面试官: " + toDisplayString(record.interviewer || "-"), 1),
											record.evaluation ? (openBlock(), createElementBlock("p", _hoisted_37, toDisplayString(record.evaluation), 1)) : createCommentVNode("", true),
											record.rejectReason ? (openBlock(), createElementBlock("p", _hoisted_38, toDisplayString(record.rejectReason), 1)) : createCommentVNode("", true),
											record.nextInterviewTime ? (openBlock(), createElementBlock("p", _hoisted_39, "下一轮: " + toDisplayString(formatDateTime(record.nextInterviewTime)), 1)) : createCommentVNode("", true)
										])]),
										_: 2
									}, 1032, ["timestamp"]);
								}), 128))]),
								_: 1
							})), [[_directive_loading, timelineLoading.value]]),
							!timelineLoading.value && !interviewRecords.value.length ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "暂无流转记录"
							})) : createCommentVNode("", true)
						], 64)) : createCommentVNode("", true)];
					}),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-84c8d4fb"]]);
//#endregion
export { recruit_default as default };
