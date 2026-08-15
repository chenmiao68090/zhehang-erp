import { n as __exportAll } from "./rolldown-runtime-Ce7cXt08.js";
import { $ as createCommentVNode, Ct as onUnmounted, Dt as renderList, G as Fragment, Gt as isRef, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, gt as nextTick, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, kt as resolveComponent, st as defineComponent, yt as onBeforeUnmount, zt as watch } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Dr as withModifiers, En as mute_notification_default, Er as withKeys, F as ElEmpty, Kt as d_arrow_left_default, T as ElProgress, Tr as vShow, Un as search_default, Vn as refresh_left_default, W as ElDatePicker, _ as ElTableColumn, c as ElSegmented, g as ElTable, h as ElTabs, hn as lock_default, hr as video_play_default, ht as ElTooltip, it as ElTag, m as ElTabPane, mr as video_pause_default, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, pr as user_filled_default, qt as d_arrow_right_default, rt as ElSelect, s as vLoading, vt as ElAlert, x as ElSlider, xn as microphone_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { r as callRecordingStreamUrl, t as callRecordApi } from "./call-record-vMQDzD4r.js";
import { t as cockpitApi } from "./cockpit-DWtOaQly.js";
//#region src/views/dashboard/components/call-recording-panel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "recording-panel" };
var _hoisted_2$1 = { class: "recording-filters" };
var _hoisted_3$1 = { class: "filter-date" };
var _hoisted_4$1 = { class: "recording-workspace" };
var _hoisted_5$1 = { class: "people-pane" };
var _hoisted_6$1 = { class: "pane-title" };
var _hoisted_7$1 = { class: "person-avatar" };
var _hoisted_8$1 = ["onClick"];
var _hoisted_9$1 = {
	key: 1,
	class: "dept-heading is-static"
};
var _hoisted_10$1 = ["onClick"];
var _hoisted_11$1 = { class: "person-avatar" };
var _hoisted_12$1 = { key: 0 };
var _hoisted_13$1 = { class: "recording-list-pane" };
var _hoisted_14$1 = { class: "list-head" };
var _hoisted_15$1 = { class: "privacy-note" };
var _hoisted_16$1 = { class: "customer-cell" };
var _hoisted_17$1 = { class: "agent-cell" };
var _hoisted_18$1 = {
	key: 1,
	class: "no-record"
};
var _hoisted_19$1 = { class: "recording-pagination" };
var _hoisted_20$1 = { class: "player-pane" };
var _hoisted_21$1 = { class: "player-head" };
var _hoisted_22$1 = ["title"];
var _hoisted_23$1 = { class: "contact-line" };
var _hoisted_24$1 = { class: "detail-grid" };
var _hoisted_25$1 = {
	key: 0,
	class: "audio-console"
};
var _hoisted_26$1 = ["src"];
var _hoisted_27$1 = { class: "audio-time" };
var _hoisted_28$1 = { class: "audio-actions" };
var _hoisted_29$1 = { class: "volume-row" };
var _hoisted_30$1 = {
	key: 0,
	class: "player-error"
};
var _hoisted_31$1 = { class: "summary-block" };
//#endregion
//#region src/views/dashboard/components/call-recording-panel.vue
var call_recording_panel_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "call-recording-panel",
	setup(__props) {
		const emptyOptions = () => ({
			scopeMode: "self",
			canSelectUser: false,
			canSelectDepartment: false,
			currentUserId: 0,
			users: [],
			departments: []
		});
		const toIsoDate = (date) => {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		};
		const today = () => toIsoDate(/* @__PURE__ */ new Date());
		const rangeFor = (preset) => {
			const end = /* @__PURE__ */ new Date();
			const start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
			if (preset === "yesterday") {
				start.setDate(start.getDate() - 1);
				end.setDate(end.getDate() - 1);
			} else if (preset === "week") start.setDate(start.getDate() - (start.getDay() + 6) % 7);
			else if (preset === "month") start.setDate(1);
			return [toIsoDate(start), toIsoDate(end)];
		};
		const datePresets = [
			{
				label: "今天",
				value: "today"
			},
			{
				label: "昨天",
				value: "yesterday"
			},
			{
				label: "本周",
				value: "week"
			},
			{
				label: "本月",
				value: "month"
			}
		];
		const resultOptions = [
			"接通",
			"无人接听",
			"占线/关机",
			"号码无效",
			"明确拒绝"
		];
		const datePreset = ref("today");
		const options = ref(emptyOptions());
		const filters = reactive({
			dateRange: [today(), today()],
			userId: void 0,
			deptId: void 0,
			connected: void 0,
			result: "",
			hasRecording: void 0,
			keyword: ""
		});
		const rows = ref([]);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(20);
		const loading = ref(false);
		const loadError = ref(false);
		const selected = ref();
		const audioRef = ref();
		const audioSrc = ref("");
		const playing = ref(false);
		const ticketLoading = ref(false);
		const playerError = ref("");
		const retriedTicket = ref(false);
		const currentTime = ref(0);
		const audioDuration = ref(0);
		const volume = ref(.8);
		const playbackRate = ref(1);
		const scopeTitle = computed(() => ({
			self: "我的录音",
			department: "本部门人员",
			company: "公司人员"
		})[options.value.scopeMode]);
		const filteredUsers = computed(() => filters.deptId ? options.value.users.filter((user) => user.deptId === filters.deptId) : options.value.users);
		const groupedUsers = computed(() => {
			const groups = /* @__PURE__ */ new Map();
			options.value.users.forEach((user) => {
				const key = user.deptId || 0;
				if (!groups.has(key)) groups.set(key, {
					deptId: user.deptId,
					deptName: user.deptName,
					users: []
				});
				groups.get(key).users.push(user);
			});
			return [...groups.values()];
		});
		const unwrap = (response) => {
			var _response$data;
			return (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response;
		};
		function loadOptions() {
			return _loadOptions.apply(this, arguments);
		}
		function _loadOptions() {
			_loadOptions = _asyncToGenerator(function* () {
				options.value = unwrap(yield callRecordApi.recordingOptions()) || emptyOptions();
				if (options.value.scopeMode === "self") filters.userId = options.value.currentUserId;
			});
			return _loadOptions.apply(this, arguments);
		}
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				loadError.value = false;
				try {
					const data = unwrap(yield callRecordApi.recordings({
						startDate: filters.dateRange[0],
						endDate: filters.dateRange[1],
						userId: filters.userId,
						deptId: filters.deptId,
						connected: filters.connected,
						result: filters.result || void 0,
						hasRecording: filters.hasRecording,
						keyword: filters.keyword.trim() || void 0,
						pageNum: pageNum.value,
						pageSize: pageSize.value
					}));
					rows.value = (data === null || data === void 0 ? void 0 : data.records) || (data === null || data === void 0 ? void 0 : data.list) || [];
					total.value = Number((data === null || data === void 0 ? void 0 : data.total) || 0);
					if (selected.value && !rows.value.some((row) => {
						var _selected$value;
						return row.id === ((_selected$value = selected.value) === null || _selected$value === void 0 ? void 0 : _selected$value.id);
					})) stopAndClearSelection();
				} catch (_unused) {
					rows.value = [];
					total.value = 0;
					loadError.value = true;
				} finally {
					loading.value = false;
				}
			});
			return _loadRows.apply(this, arguments);
		}
		function query() {
			return _query.apply(this, arguments);
		}
		function _query() {
			_query = _asyncToGenerator(function* () {
				pageNum.value = 1;
				stopAndClearSelection();
				yield loadRows();
			});
			return _query.apply(this, arguments);
		}
		function applyDatePreset(value) {
			filters.dateRange = rangeFor(String(value));
			query();
		}
		function handleCustomDate(value) {
			if (!Array.isArray(value) || value.length !== 2) return;
			datePreset.value = "custom";
			query();
		}
		function disableFutureDate(date) {
			return date.getTime() > (/* @__PURE__ */ new Date()).setHours(23, 59, 59, 999);
		}
		function handleDeptChange() {
			if (filters.userId && !filteredUsers.value.some((user) => user.id === filters.userId)) filters.userId = void 0;
		}
		function selectAllPeople() {
			filters.userId = void 0;
			filters.deptId = void 0;
			query();
		}
		function selectDepartment(deptId) {
			filters.deptId = deptId;
			filters.userId = void 0;
			query();
		}
		function selectPerson(userId) {
			filters.userId = userId;
			filters.deptId = void 0;
			query();
		}
		function resetFilters() {
			datePreset.value = "today";
			filters.dateRange = rangeFor("today");
			filters.deptId = void 0;
			filters.userId = options.value.scopeMode === "self" ? options.value.currentUserId : void 0;
			filters.connected = void 0;
			filters.result = "";
			filters.hasRecording = void 0;
			filters.keyword = "";
			query();
		}
		function handlePageSize() {
			pageNum.value = 1;
			loadRows();
		}
		function selectRow(row) {
			var _selected$value2;
			if (((_selected$value2 = selected.value) === null || _selected$value2 === void 0 ? void 0 : _selected$value2.id) !== row.id) {
				stopAudio();
				selected.value = row;
				playerError.value = "";
				audioSrc.value = "";
				currentTime.value = 0;
				audioDuration.value = row.duration || 0;
				retriedTicket.value = false;
			}
		}
		function playRow(_x) {
			return _playRow.apply(this, arguments);
		}
		function _playRow() {
			_playRow = _asyncToGenerator(function* (row) {
				var _selected$value3;
				if (((_selected$value3 = selected.value) === null || _selected$value3 === void 0 ? void 0 : _selected$value3.id) !== row.id) selectRow(row);
				yield nextTick();
				togglePlay();
			});
			return _playRow.apply(this, arguments);
		}
		function requestTicket() {
			return _requestTicket.apply(this, arguments);
		}
		function _requestTicket() {
			_requestTicket = _asyncToGenerator(function* (autoPlay = true) {
				if (!selected.value || selected.value.recordingStatus !== "available") return;
				ticketLoading.value = true;
				playerError.value = "";
				try {
					var _audioRef$value;
					const ticket = unwrap(yield callRecordApi.recordingTicket(selected.value.id));
					audioSrc.value = callRecordingStreamUrl(selected.value.id, ticket.token);
					yield nextTick();
					(_audioRef$value = audioRef.value) === null || _audioRef$value === void 0 || _audioRef$value.load();
					if (autoPlay) {
						var _audioRef$value2;
						yield (_audioRef$value2 = audioRef.value) === null || _audioRef$value2 === void 0 ? void 0 : _audioRef$value2.play();
						playing.value = true;
					}
				} catch (_unused2) {
					playerError.value = "录音服务暂时不可用";
					playing.value = false;
				} finally {
					ticketLoading.value = false;
				}
			});
			return _requestTicket.apply(this, arguments);
		}
		function togglePlay() {
			return _togglePlay.apply(this, arguments);
		}
		function _togglePlay() {
			_togglePlay = _asyncToGenerator(function* () {
				if (!selected.value || selected.value.recordingStatus !== "available") return;
				const audio = audioRef.value;
				if (playing.value) {
					audio === null || audio === void 0 || audio.pause();
					playing.value = false;
					return;
				}
				if (!audioSrc.value) {
					yield requestTicket(true);
					return;
				}
				try {
					yield audio === null || audio === void 0 ? void 0 : audio.play();
					playing.value = true;
				} catch (_unused3) {
					playerError.value = "录音播放失败，请重新加载";
				}
			});
			return _togglePlay.apply(this, arguments);
		}
		function handleMetadata() {
			if (audioRef.value && Number.isFinite(audioRef.value.duration)) audioDuration.value = audioRef.value.duration;
			applyVolume();
			if (audioRef.value) audioRef.value.playbackRate = playbackRate.value;
		}
		function handleTimeUpdate() {
			if (audioRef.value) currentTime.value = audioRef.value.currentTime;
		}
		function handleEnded() {
			playing.value = false;
			currentTime.value = 0;
		}
		function handleAudioError() {
			return _handleAudioError.apply(this, arguments);
		}
		function _handleAudioError() {
			_handleAudioError = _asyncToGenerator(function* () {
				if (!audioSrc.value) return;
				playing.value = false;
				if (!retriedTicket.value) {
					retriedTicket.value = true;
					yield requestTicket(true);
					return;
				}
				playerError.value = "录音服务暂时不可用，请重新加载";
			});
			return _handleAudioError.apply(this, arguments);
		}
		function retryPlayback() {
			retriedTicket.value = false;
			audioSrc.value = "";
			requestTicket(true);
		}
		function seekTo(value) {
			if (audioRef.value && typeof value === "number") audioRef.value.currentTime = value;
		}
		function jump(seconds) {
			if (!audioRef.value) return;
			audioRef.value.currentTime = Math.max(0, Math.min(audioDuration.value || 0, audioRef.value.currentTime + seconds));
		}
		function changeSpeed() {
			const rates = [
				1,
				1.25,
				1.5
			];
			playbackRate.value = rates[(rates.indexOf(playbackRate.value) + 1) % rates.length];
			if (audioRef.value) audioRef.value.playbackRate = playbackRate.value;
		}
		function applyVolume() {
			if (audioRef.value) audioRef.value.volume = volume.value;
		}
		function stopAudio() {
			var _audioRef$value3;
			(_audioRef$value3 = audioRef.value) === null || _audioRef$value3 === void 0 || _audioRef$value3.pause();
			playing.value = false;
		}
		function stopAndClearSelection() {
			stopAudio();
			selected.value = void 0;
			audioSrc.value = "";
		}
		function rowClassName({ row }) {
			var _selected$value4;
			return ((_selected$value4 = selected.value) === null || _selected$value4 === void 0 ? void 0 : _selected$value4.id) === row.id ? "is-selected-recording" : "";
		}
		function displayResult(row) {
			return row.result || (row.connected === 1 ? "已接通" : "未接通");
		}
		function firstCharacter(value) {
			return String(value || "?").trim().charAt(0) || "?";
		}
		function formatClock(seconds) {
			const safe = Math.max(0, Math.floor(Number(seconds) || 0));
			const minutes = Math.floor(safe / 60);
			return `${String(minutes).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
		}
		onMounted(_asyncToGenerator(function* () {
			try {
				yield loadOptions();
				yield loadRows();
			} catch (_unused4) {
				loadError.value = true;
				ElMessage.error("通话录音工作台加载失败");
			}
		}));
		onBeforeUnmount(stopAudio);
		return (_ctx, _cache) => {
			const _component_el_date_picker = ElDatePicker;
			const _component_el_segmented = ElSegmented;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_icon = ElIcon;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tooltip = ElTooltip;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_slider = ElSlider;
			const _component_el_empty = ElEmpty;
			const _directive_loading = vLoading;
			return withDirectives((openBlock(), createElementBlock("section", _hoisted_1$1, [
				createBaseVNode("div", _hoisted_2$1, [
					createBaseVNode("div", _hoisted_3$1, [_cache[14] || (_cache[14] = createBaseVNode("span", { class: "filter-label" }, "通话日期", -1)), createVNode(_component_el_date_picker, {
						modelValue: unref(filters).dateRange,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(filters).dateRange = $event),
						type: "daterange",
						"value-format": "YYYY-MM-DD",
						format: "YYYY-MM-DD",
						"range-separator": "至",
						"start-placeholder": "开始日期",
						"end-placeholder": "结束日期",
						clearable: false,
						editable: false,
						"disabled-date": disableFutureDate,
						"unlink-panels": "",
						onChange: handleCustomDate
					}, null, 8, ["modelValue"])]),
					createVNode(_component_el_segmented, {
						modelValue: unref(datePreset),
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => isRef(datePreset) ? datePreset.value = $event : null),
						options: datePresets,
						onChange: applyDatePreset
					}, null, 8, ["modelValue"]),
					unref(options).canSelectDepartment ? (openBlock(), createBlock(_component_el_select, {
						key: 0,
						modelValue: unref(filters).deptId,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(filters).deptId = $event),
						clearable: "",
						placeholder: "全部部门",
						class: "filter-select",
						onChange: handleDeptChange
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(options).departments, (dept) => {
							return openBlock(), createBlock(_component_el_option, {
								key: dept.id,
								label: dept.name,
								value: dept.id
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"])) : createCommentVNode("", true),
					unref(options).canSelectUser ? (openBlock(), createBlock(_component_el_select, {
						key: 1,
						modelValue: unref(filters).userId,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(filters).userId = $event),
						clearable: "",
						filterable: "",
						placeholder: "全部人员",
						class: "filter-select"
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(filteredUsers), (user) => {
							return openBlock(), createBlock(_component_el_option, {
								key: user.id,
								label: `${user.name} · ${user.deptName}`,
								value: user.id
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"])) : createCommentVNode("", true),
					createVNode(_component_el_select, {
						modelValue: unref(filters).connected,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(filters).connected = $event),
						clearable: "",
						placeholder: "接通状态",
						class: "filter-select is-short"
					}, {
						default: withCtx(() => [createVNode(_component_el_option, {
							label: "已接通",
							value: 1
						}), createVNode(_component_el_option, {
							label: "未接通",
							value: 0
						})]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: unref(filters).result,
						"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(filters).result = $event),
						clearable: "",
						placeholder: "通话结果",
						class: "filter-select is-short"
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(resultOptions, (item) => {
							return createVNode(_component_el_option, {
								key: item,
								label: item,
								value: item
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: unref(filters).hasRecording,
						"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(filters).hasRecording = $event),
						clearable: "",
						placeholder: "录音状态",
						class: "filter-select is-short"
					}, {
						default: withCtx(() => [createVNode(_component_el_option, {
							label: "有录音",
							value: true
						}), createVNode(_component_el_option, {
							label: "无录音",
							value: false
						})]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_input, {
						modelValue: unref(filters).keyword,
						"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(filters).keyword = $event),
						clearable: "",
						class: "keyword-input",
						placeholder: "客户名称或手机号",
						"prefix-icon": unref(search_default),
						onKeyup: withKeys(query, ["enter"])
					}, null, 8, ["modelValue", "prefix-icon"]),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(search_default),
						onClick: query
					}, {
						default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(refresh_left_default),
						onClick: resetFilters
					}, {
						default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("重置", -1)])]),
						_: 1
					}, 8, ["icon"])
				]),
				unref(loadError) ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					title: "录音列表加载失败",
					type: "error",
					"show-icon": "",
					closable: false,
					class: "recording-error"
				}, {
					default: withCtx(() => [createVNode(_component_el_button, {
						link: "",
						type: "primary",
						onClick: loadRows
					}, {
						default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("重新加载", -1)])]),
						_: 1
					})]),
					_: 1
				})) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_4$1, [
					createBaseVNode("aside", _hoisted_5$1, [
						createBaseVNode("div", _hoisted_6$1, [createBaseVNode("strong", null, toDisplayString(unref(scopeTitle)), 1), createBaseVNode("span", null, toDisplayString(unref(options).users.length) + " 人", 1)]),
						unref(options).scopeMode !== "self" ? (openBlock(), createElementBlock("button", {
							key: 0,
							type: "button",
							class: normalizeClass(["person-item is-all", { "is-active": !unref(filters).userId && !unref(filters).deptId }]),
							onClick: selectAllPeople
						}, [createBaseVNode("span", _hoisted_7$1, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(user_filled_default))]),
							_: 1
						})]), createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(unref(options).scopeMode === "company" ? "全公司" : "本部门及下级"), 1), _cache[18] || (_cache[18] = createBaseVNode("small", null, "全部可见录音", -1))])], 2)) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(unref(groupedUsers), (group) => {
							return openBlock(), createElementBlock("div", {
								key: group.deptId || 0,
								class: "dept-group"
							}, [unref(options).canSelectDepartment ? (openBlock(), createElementBlock("button", {
								key: 0,
								type: "button",
								class: normalizeClass(["dept-heading", { "is-active": unref(filters).deptId === group.deptId && !unref(filters).userId }]),
								onClick: ($event) => selectDepartment(group.deptId)
							}, [createBaseVNode("span", null, toDisplayString(group.deptName), 1), createBaseVNode("em", null, toDisplayString(group.users.length), 1)], 10, _hoisted_8$1)) : (openBlock(), createElementBlock("div", _hoisted_9$1, [createBaseVNode("span", null, toDisplayString(group.deptName), 1), createBaseVNode("em", null, toDisplayString(group.users.length), 1)])), (openBlock(true), createElementBlock(Fragment, null, renderList(group.users, (person) => {
								return openBlock(), createElementBlock("button", {
									key: person.id,
									type: "button",
									class: normalizeClass(["person-item", { "is-active": unref(filters).userId === person.id }]),
									onClick: ($event) => selectPerson(person.id)
								}, [createBaseVNode("span", _hoisted_11$1, toDisplayString(firstCharacter(person.name)), 1), createBaseVNode("span", null, [createBaseVNode("b", null, [createTextVNode(toDisplayString(person.name), 1), person.currentUser ? (openBlock(), createElementBlock("i", _hoisted_12$1, "我")) : createCommentVNode("", true)]), createBaseVNode("small", null, toDisplayString(person.deptName), 1)])], 10, _hoisted_10$1);
							}), 128))]);
						}), 128))
					]),
					createBaseVNode("main", _hoisted_13$1, [
						createBaseVNode("div", _hoisted_14$1, [createBaseVNode("div", null, [_cache[19] || (_cache[19] = createBaseVNode("strong", null, "通话录音", -1)), createBaseVNode("span", null, "共 " + toDisplayString(unref(total)) + " 条", 1)]), createBaseVNode("span", _hoisted_15$1, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(lock_default))]),
							_: 1
						}), _cache[20] || (_cache[20] = createTextVNode(" 原始录音地址受保护", -1))])]),
						createVNode(_component_el_table, {
							data: unref(rows),
							class: "recording-table",
							height: "570",
							"highlight-current-row": "",
							"row-class-name": rowClassName,
							"empty-text": "当前筛选范围暂无通话记录",
							onRowClick: selectRow
						}, {
							default: withCtx(() => [
								createVNode(_component_el_table_column, {
									prop: "callTime",
									label: "通话时间",
									width: "154"
								}),
								createVNode(_component_el_table_column, {
									label: "客户",
									"min-width": "190"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_16$1, [createVNode(_component_el_tooltip, {
										content: row.customerName,
										disabled: row.customerName.length < 13
									}, {
										default: withCtx(() => [createBaseVNode("strong", null, toDisplayString(row.customerName), 1)]),
										_: 2
									}, 1032, ["content", "disabled"]), createBaseVNode("span", null, toDisplayString(row.contactName) + " · " + toDisplayString(row.maskedPhone), 1)])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "销售",
									"min-width": "110"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_17$1, [createBaseVNode("b", null, toDisplayString(row.agentName), 1), createBaseVNode("span", null, toDisplayString(row.deptName), 1)])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "结果",
									width: "108"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_tag, {
										type: row.connected === 1 ? "success" : "info",
										effect: "light"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(displayResult(row)), 1)]),
										_: 2
									}, 1032, ["type"])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									prop: "durationText",
									label: "时长",
									width: "84",
									align: "right"
								}),
								createVNode(_component_el_table_column, {
									label: "录音",
									width: "86",
									align: "center",
									fixed: "right"
								}, {
									default: withCtx(({ row }) => [row.recordingStatus === "available" ? (openBlock(), createBlock(_component_el_tooltip, {
										key: 0,
										content: "播放录音",
										placement: "top"
									}, {
										default: withCtx(() => {
											var _unref2, _unref3;
											return [createVNode(_component_el_button, {
												circle: "",
												type: ((_unref2 = unref(selected)) === null || _unref2 === void 0 ? void 0 : _unref2.id) === row.id && unref(playing) ? "primary" : "default",
												icon: ((_unref3 = unref(selected)) === null || _unref3 === void 0 ? void 0 : _unref3.id) === row.id && unref(playing) ? unref(video_pause_default) : unref(video_play_default),
												onClick: withModifiers(($event) => playRow(row), ["stop"])
											}, null, 8, [
												"type",
												"icon",
												"onClick"
											])];
										}),
										_: 2
									}, 1024)) : (openBlock(), createElementBlock("span", _hoisted_18$1, "暂无"))]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["data"]),
						createBaseVNode("div", _hoisted_19$1, [createVNode(_component_el_pagination, {
							"current-page": unref(pageNum),
							"onUpdate:currentPage": _cache[8] || (_cache[8] = ($event) => isRef(pageNum) ? pageNum.value = $event : null),
							"page-size": unref(pageSize),
							"onUpdate:pageSize": _cache[9] || (_cache[9] = ($event) => isRef(pageSize) ? pageSize.value = $event : null),
							background: "",
							layout: "total, sizes, prev, pager, next",
							"page-sizes": [
								20,
								50,
								100
							],
							total: unref(total),
							onCurrentChange: loadRows,
							onSizeChange: handlePageSize
						}, null, 8, [
							"current-page",
							"page-size",
							"total"
						])])
					]),
					createBaseVNode("aside", _hoisted_20$1, [unref(selected) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
						createBaseVNode("div", _hoisted_21$1, [createBaseVNode("span", { class: normalizeClass(["player-status", { "is-ready": unref(selected).recordingStatus === "available" }]) }, toDisplayString(unref(selected).recordingStatus === "available" ? "可播放" : "暂无录音"), 3), createBaseVNode("span", null, toDisplayString(unref(selected).callTime), 1)]),
						createBaseVNode("h3", { title: unref(selected).customerName }, toDisplayString(unref(selected).customerName), 9, _hoisted_22$1),
						createBaseVNode("p", _hoisted_23$1, toDisplayString(unref(selected).contactName) + " · " + toDisplayString(unref(selected).maskedPhone), 1),
						createBaseVNode("div", _hoisted_24$1, [
							createBaseVNode("div", null, [_cache[21] || (_cache[21] = createBaseVNode("span", null, "销售", -1)), createBaseVNode("b", null, toDisplayString(unref(selected).agentName), 1)]),
							createBaseVNode("div", null, [_cache[22] || (_cache[22] = createBaseVNode("span", null, "部门", -1)), createBaseVNode("b", null, toDisplayString(unref(selected).deptName), 1)]),
							createBaseVNode("div", null, [_cache[23] || (_cache[23] = createBaseVNode("span", null, "通话结果", -1)), createBaseVNode("b", null, toDisplayString(displayResult(unref(selected))), 1)]),
							createBaseVNode("div", null, [_cache[24] || (_cache[24] = createBaseVNode("span", null, "通话时长", -1)), createBaseVNode("b", null, toDisplayString(unref(selected).durationText), 1)])
						]),
						unref(selected).recordingStatus === "available" ? (openBlock(), createElementBlock("div", _hoisted_25$1, [
							createBaseVNode("audio", {
								ref_key: "audioRef",
								ref: audioRef,
								preload: "metadata",
								src: unref(audioSrc),
								onLoadedmetadata: handleMetadata,
								onTimeupdate: handleTimeUpdate,
								onEnded: handleEnded,
								onError: handleAudioError
							}, null, 40, _hoisted_26$1),
							createBaseVNode("div", _hoisted_27$1, [createBaseVNode("span", null, toDisplayString(formatClock(unref(currentTime))), 1), createBaseVNode("span", null, toDisplayString(formatClock(unref(audioDuration))), 1)]),
							createVNode(_component_el_slider, {
								modelValue: unref(currentTime),
								"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => isRef(currentTime) ? currentTime.value = $event : null),
								max: Math.max(unref(audioDuration), 1),
								"show-tooltip": false,
								onChange: seekTo
							}, null, 8, ["modelValue", "max"]),
							createBaseVNode("div", _hoisted_28$1, [
								createVNode(_component_el_tooltip, { content: "后退10秒" }, {
									default: withCtx(() => [createVNode(_component_el_button, {
										circle: "",
										icon: unref(d_arrow_left_default),
										onClick: _cache[11] || (_cache[11] = ($event) => jump(-10))
									}, null, 8, ["icon"])]),
									_: 1
								}),
								createVNode(_component_el_button, {
									class: "play-main",
									type: "primary",
									circle: "",
									loading: unref(ticketLoading),
									icon: unref(playing) ? unref(video_pause_default) : unref(video_play_default),
									onClick: togglePlay
								}, null, 8, ["loading", "icon"]),
								createVNode(_component_el_tooltip, { content: "前进10秒" }, {
									default: withCtx(() => [createVNode(_component_el_button, {
										circle: "",
										icon: unref(d_arrow_right_default),
										onClick: _cache[12] || (_cache[12] = ($event) => jump(10))
									}, null, 8, ["icon"])]),
									_: 1
								}),
								createVNode(_component_el_button, {
									class: "speed-btn",
									onClick: changeSpeed
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(unref(playbackRate)) + "x", 1)]),
									_: 1
								})
							]),
							createBaseVNode("div", _hoisted_29$1, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [unref(volume) === 0 ? (openBlock(), createBlock(unref(mute_notification_default), { key: 0 })) : (openBlock(), createBlock(unref(microphone_default), { key: 1 }))]),
								_: 1
							}), createVNode(_component_el_slider, {
								modelValue: unref(volume),
								"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => isRef(volume) ? volume.value = $event : null),
								max: 1,
								step: .05,
								"show-tooltip": false,
								onInput: applyVolume
							}, null, 8, ["modelValue"])]),
							unref(playerError) ? (openBlock(), createElementBlock("p", _hoisted_30$1, [createTextVNode(toDisplayString(unref(playerError)) + " ", 1), createVNode(_component_el_button, {
								link: "",
								type: "primary",
								onClick: retryPlayback
							}, {
								default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("重新加载", -1)])]),
								_: 1
							})])) : createCommentVNode("", true)
						])) : (openBlock(), createBlock(_component_el_empty, {
							key: 1,
							"image-size": 78,
							description: "平台暂未生成录音"
						})),
						createBaseVNode("div", _hoisted_31$1, [createBaseVNode("div", null, [_cache[27] || (_cache[27] = createBaseVNode("strong", null, "通话小结", -1)), unref(selected).effective ? (openBlock(), createBlock(_component_el_tag, {
							key: 0,
							type: "success",
							size: "small"
						}, {
							default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("有效沟通", -1)])]),
							_: 1
						})) : createCommentVNode("", true)]), createBaseVNode("p", null, toDisplayString(unref(selected).remark || "—"), 1)])
					], 64)) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						"image-size": 92,
						description: "选择一条通话查看录音和小结"
					}))])
				])
			])), [[_directive_loading, unref(loading)]]);
		};
	}
}), [["__scopeId", "data-v-b21baff5"]]);
//#endregion
//#region src/views/dashboard/biz-perf.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "sales-page biz-perf" };
var _hoisted_2 = { class: "result-page-head" };
var _hoisted_3 = { class: "pr-panel" };
var _hoisted_4 = { class: "pr-stats" };
var _hoisted_5 = { class: "pr-stat" };
var _hoisted_6 = { class: "pr-value" };
var _hoisted_7 = { class: "pr-stat" };
var _hoisted_8 = { class: "pr-value" };
var _hoisted_9 = { class: "pr-stat" };
var _hoisted_10 = {
	key: 0,
	class: "pr-value"
};
var _hoisted_11 = {
	key: 1,
	class: "pr-value pr-none"
};
var _hoisted_12 = { class: "pr-toolbar" };
var _hoisted_13 = { class: "visibility-note" };
var _hoisted_14 = { class: "pr-controls" };
var _hoisted_15 = { class: "date-control" };
var _hoisted_16 = {
	key: 1,
	class: "pr-empty"
};
var _hoisted_17 = {
	key: 0,
	class: "pr-stars"
};
var _hoisted_18 = {
	key: 0,
	class: "pr-star is-rise"
};
var _hoisted_19 = { class: "pr-ava" };
var _hoisted_20 = { class: "pr-star-body" };
var _hoisted_21 = { class: "pr-star-n" };
var _hoisted_22 = { class: "pr-delta is-up" };
var _hoisted_23 = {
	key: 1,
	class: "pr-star is-fall"
};
var _hoisted_24 = { class: "pr-ava" };
var _hoisted_25 = { class: "pr-star-body" };
var _hoisted_26 = { class: "pr-star-n" };
var _hoisted_27 = { class: "pr-delta is-down" };
var _hoisted_28 = { class: "pr-board" };
var _hoisted_29 = {
	key: 0,
	class: "pr-podium"
};
var _hoisted_30 = { class: "pr-ava" };
var _hoisted_31 = { class: "pr-pod-n" };
var _hoisted_32 = { class: "pr-pod-m" };
var _hoisted_33 = { class: "pr-pod-base" };
var _hoisted_34 = { class: "pr-name" };
var _hoisted_35 = { key: 0 };
var _hoisted_36 = { class: "pr-amount" };
var _hoisted_37 = { class: "pr-share" };
var _hoisted_38 = { class: "leaderboard-panel" };
var _hoisted_39 = { class: "self-summary" };
var _hoisted_40 = { class: "self-stat self-calls" };
var _hoisted_41 = { class: "self-target" };
var _hoisted_42 = { class: "target-line" };
var _hoisted_43 = { class: "target-copy" };
var _hoisted_44 = { class: "self-stat" };
var _hoisted_45 = { class: "self-stat gap-stat" };
var _hoisted_46 = { class: "leaderboard-toolbar" };
var _hoisted_47 = { class: "visibility-note" };
var _hoisted_48 = { class: "leaderboard-controls" };
var _hoisted_49 = { class: "date-control" };
var _hoisted_50 = { class: "metric-control" };
var _hoisted_51 = { class: "leaderboard-table-wrap" };
var _hoisted_52 = { class: "agent-name-cell" };
var _hoisted_53 = { class: "agent-avatar" };
var _hoisted_54 = { class: "agent-name text-ellipsis" };
var _hoisted_55 = { key: 0 };
var _hoisted_56 = { class: "primary-value" };
var _hoisted_57 = { class: "target-progress-cell" };
var _hoisted_58 = { class: "leaderboard-footnote" };
var _hoisted_59 = {
	key: 1,
	class: "pr-cast-overlay"
};
var _hoisted_60 = { class: "pr-cast-head" };
var _hoisted_61 = { class: "pr-cast-title" };
var _hoisted_62 = { class: "pr-cast-meta" };
var _hoisted_63 = { class: "pr-cast-list" };
var _hoisted_64 = { class: "pr-cast-rank" };
var _hoisted_65 = { class: "pr-cast-name" };
var _hoisted_66 = { class: "pr-cast-money" };
var _hoisted_67 = {
	key: 0,
	class: "pr-cast-empty"
};
var biz_perf_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent(_objectSpread2(_objectSpread2({}, { name: "BizPerfBoard" }), {}, {
	__name: "biz-perf",
	setup(__props) {
		const route = useRoute();
		const pageTitle = computed(() => {
			var _route$meta;
			return ((_route$meta = route.meta) === null || _route$meta === void 0 ? void 0 : _route$meta.title) || "业绩看板";
		});
		computed(() => {
			var _route$meta2;
			return ((_route$meta2 = route.meta) === null || _route$meta2 === void 0 ? void 0 : _route$meta2.scope) === "team" ? "团队" : "个人";
		});
		const activeTab = ref("ranking");
		const leaderboardPeriodOptions = [
			{
				label: "今日",
				value: "today"
			},
			{
				label: "本周",
				value: "week"
			},
			{
				label: "本月",
				value: "month"
			}
		];
		const leaderboardMetricOptions = [
			{
				label: "拨打量",
				value: "calls"
			},
			{
				label: "有效沟通",
				value: "effective"
			},
			{
				label: "接通率",
				value: "connectRate"
			}
		];
		const toIsoDate = (date) => {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		};
		const todayIsoDate = () => toIsoDate(/* @__PURE__ */ new Date());
		const rangeForPeriod = (periodValue) => {
			const today = /* @__PURE__ */ new Date();
			const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			if (periodValue === "week") {
				const mondayOffset = (start.getDay() + 6) % 7;
				start.setDate(start.getDate() - mondayOffset);
			} else if (periodValue === "month") start.setDate(1);
			return [toIsoDate(start), toIsoDate(today)];
		};
		const normalizeDateRange = (value) => {
			if (!Array.isArray(value) || value.length !== 2) return null;
			const start = String(value[0] || "");
			const end = String(value[1] || "");
			const pattern = /^\d{4}-\d{2}-\d{2}$/;
			if (!pattern.test(start) || !pattern.test(end) || start > end) return null;
			return [start, end];
		};
		const dateRangeDays = ([start, end]) => {
			const [startYear, startMonth, startDay] = start.split("-").map(Number);
			const [endYear, endMonth, endDay] = end.split("-").map(Number);
			const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
			const endUtc = Date.UTC(endYear, endMonth - 1, endDay);
			return Math.round((endUtc - startUtc) / 864e5) + 1;
		};
		const inferPeriod = (range) => {
			for (const periodValue of [
				"today",
				"week",
				"month"
			]) {
				const preset = rangeForPeriod(periodValue);
				if (preset[0] === range[0] && preset[1] === range[1]) return periodValue;
			}
			return "custom";
		};
		const emptyLeaderboardRow = () => ({
			agentName: "我",
			deptName: "未设置部门",
			callCount: 0,
			connectedCount: 0,
			connectRate: 0,
			validCount: 0,
			validRate: 0,
			totalDuration: 0,
			totalDurationText: "0:00:00",
			targetCount: 400,
			targetProgress: 0,
			currentUser: true
		});
		const emptyLeaderboard = () => ({
			period: "today",
			metric: "calls",
			startDate: todayIsoDate(),
			endDate: todayIsoDate(),
			targetPerDay: 400,
			periodDays: 1,
			targetCount: 400,
			gapUnit: "通",
			self: emptyLeaderboardRow(),
			rows: []
		});
		const leaderboardPeriod = ref("today");
		const leaderboardMetric = ref("calls");
		const leaderboardDateRange = ref(rangeForPeriod("today"));
		const lastValidDateRange = ref([leaderboardDateRange.value[0], leaderboardDateRange.value[1]]);
		const leaderboardLoading = ref(false);
		const leaderboardError = ref(false);
		const leaderboardData = ref(emptyLeaderboard());
		const selfRow = computed(() => leaderboardData.value.self || emptyLeaderboardRow());
		const leaderboardPeriodLabel = computed(() => {
			var _leaderboardPeriodOpt;
			return ((_leaderboardPeriodOpt = leaderboardPeriodOptions.find((item) => item.value === leaderboardPeriod.value)) === null || _leaderboardPeriodOpt === void 0 ? void 0 : _leaderboardPeriodOpt.label) || "所选日期";
		});
		const leaderboardRangeLabel = computed(() => {
			const [start, end] = leaderboardDateRange.value;
			return start === end ? start : `${start} 至 ${end}`;
		});
		const gapTitle = computed(() => {
			if (!selfRow.value.rank) return "暂未上榜";
			return selfRow.value.rank === 1 ? "领先第二名" : "距前一名";
		});
		const gapValue = computed(() => {
			const gap = leaderboardData.value.gapToPrevious;
			if (gap === void 0 || gap === null) return "--";
			return leaderboardData.value.gapUnit === "%" ? formatDecimal(gap) : formatInteger(gap);
		});
		const perfPeriod = ref("month");
		const perfRange = ref(rangeForPeriod("month"));
		const perfLastValid = ref([perfRange.value[0], perfRange.value[1]]);
		const perfLoading = ref(false);
		const perfError = ref(false);
		const perfRows = ref([]);
		const perfMe = ref({
			rank: null,
			amount: 0,
			orderCount: 0,
			total: 0
		});
		const castUpdatedAt = ref("--:--");
		const formatWan = (yuan) => {
			return `¥${((Number(yuan) || 0) / 1e4).toFixed(1)}万`;
		};
		const castWan = (yuan) => ((Number(yuan) || 0) / 1e4).toFixed(1);
		const loadPerfRank = function() {
			var _ref2 = _asyncToGenerator(function* () {
				perfLoading.value = true;
				perfError.value = false;
				try {
					var _ref, _res$data;
					const res = yield cockpitApi.getPerfRank(perfRange.value[0], perfRange.value[1]);
					const data = (_ref = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) !== null && _ref !== void 0 ? _ref : {};
					perfRows.value = Array.isArray(data.list) ? data.list : [];
					perfMe.value = _objectSpread2({
						rank: null,
						amount: 0,
						orderCount: 0,
						total: 0
					}, data.me || {});
					castUpdatedAt.value = (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5);
				} catch (e) {
					perfRows.value = [];
					perfMe.value = {
						rank: null,
						amount: 0,
						orderCount: 0,
						total: 0
					};
					perfError.value = true;
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "业绩排行加载失败,请重试");
				} finally {
					perfLoading.value = false;
				}
			});
			return function loadPerfRank() {
				return _ref2.apply(this, arguments);
			};
		}();
		const handlePerfPeriodChange = (value) => {
			if (value !== "today" && value !== "week" && value !== "month") return;
			const range = rangeForPeriod(value);
			perfRange.value = range;
			perfLastValid.value = [range[0], range[1]];
			loadPerfRank();
		};
		const handlePerfDateChange = (value) => {
			const range = normalizeDateRange(value);
			if (!range) {
				perfRange.value = [perfLastValid.value[0], perfLastValid.value[1]];
				return;
			}
			if (dateRangeDays(range) > 366) {
				ElMessage.warning("日期范围最多选择 366 天");
				perfRange.value = [perfLastValid.value[0], perfLastValid.value[1]];
				return;
			}
			perfRange.value = range;
			perfLastValid.value = [range[0], range[1]];
			perfPeriod.value = inferPeriod(range);
			loadPerfRank();
		};
		const perfDelta = (row) => {
			if (row.prevRank == null) return {
				cls: "is-new",
				text: "新"
			};
			if (row.prevRank > row.rank) return {
				cls: "is-up",
				text: `↑${row.prevRank - row.rank}`
			};
			if (row.prevRank < row.rank) return {
				cls: "is-down",
				text: `↓${row.rank - row.prevRank}`
			};
			return {
				cls: "is-flat",
				text: "—"
			};
		};
		const perfMoM = (row) => {
			const prev = Number(row.prevAmount);
			if (!prev || prev <= 0) return "";
			const pct = (Number(row.amount) - prev) / prev * 100;
			return ` · 较上期 ${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
		};
		const riseStar = computed(() => {
			let best = null;
			let bestGain = 0;
			for (const r of perfRows.value) {
				if (r.prevRank == null) continue;
				const gain = r.prevRank - r.rank;
				if (gain > bestGain) {
					best = r;
					bestGain = gain;
				}
			}
			return bestGain > 0 ? best : null;
		});
		const fallStar = computed(() => {
			let best = null;
			let bestDrop = 0;
			for (const r of perfRows.value) {
				if (r.prevRank == null) continue;
				const drop = r.rank - r.prevRank;
				if (drop > bestDrop) {
					best = r;
					bestDrop = drop;
				}
			}
			return bestDrop > 0 ? best : null;
		});
		const podiumOrder = computed(() => {
			const t = perfRows.value.slice(0, 3);
			const order = [];
			if (t[1]) order.push({
				row: t[1],
				cls: "is-second"
			});
			if (t[0]) order.push({
				row: t[0],
				cls: "is-first"
			});
			if (t[2]) order.push({
				row: t[2],
				cls: "is-third"
			});
			return order;
		});
		const rankChipClass = (rank) => rank === 1 ? "is-g" : rank === 2 ? "is-s" : rank === 3 ? "is-b" : "";
		const perfRowClass = ({ row }) => row.currentUser ? "is-current-user" : "";
		const castMode = ref(false);
		let castTimer = null;
		const onCastKey = (e) => {
			if (e.key === "Escape") closeCast();
		};
		const openCast = () => {
			castMode.value = true;
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", onCastKey);
			castTimer = window.setInterval(loadPerfRank, 3600 * 1e3);
		};
		const closeCast = () => {
			if (!castMode.value) return;
			castMode.value = false;
			document.body.style.overflow = "";
			window.removeEventListener("keydown", onCastKey);
			if (castTimer != null) {
				window.clearInterval(castTimer);
				castTimer = null;
			}
		};
		onUnmounted(closeCast);
		const loadLeaderboard = function() {
			var _ref4 = _asyncToGenerator(function* () {
				leaderboardLoading.value = true;
				leaderboardError.value = false;
				try {
					var _ref3, _res$data2;
					const params = {
						period: leaderboardPeriod.value,
						metric: leaderboardMetric.value
					};
					if (leaderboardPeriod.value === "custom") {
						params.startDate = leaderboardDateRange.value[0];
						params.endDate = leaderboardDateRange.value[1];
					}
					const res = yield callRecordApi.leaderboard(params);
					const data = (_ref3 = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) !== null && _ref3 !== void 0 ? _ref3 : {};
					leaderboardData.value = _objectSpread2(_objectSpread2(_objectSpread2({}, emptyLeaderboard()), data), {}, {
						self: _objectSpread2(_objectSpread2({}, emptyLeaderboardRow()), data.self || {}),
						rows: Array.isArray(data.rows) ? data.rows : []
					});
					const responseRange = normalizeDateRange([data.startDate, data.endDate]);
					if (responseRange) {
						leaderboardDateRange.value = responseRange;
						lastValidDateRange.value = [responseRange[0], responseRange[1]];
					}
					if (data.period) leaderboardPeriod.value = data.period;
				} catch (e) {
					leaderboardData.value = emptyLeaderboard();
					leaderboardError.value = true;
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "通话排行加载失败，请重试");
				} finally {
					leaderboardLoading.value = false;
				}
			});
			return function loadLeaderboard() {
				return _ref4.apply(this, arguments);
			};
		}();
		const handleLeaderboardPeriodChange = (value) => {
			if (value !== "today" && value !== "week" && value !== "month") return;
			leaderboardPeriod.value = value;
			const range = rangeForPeriod(value);
			leaderboardDateRange.value = range;
			lastValidDateRange.value = [range[0], range[1]];
			loadLeaderboard();
		};
		const handleLeaderboardDateChange = (value) => {
			const range = normalizeDateRange(value);
			if (!range) {
				leaderboardDateRange.value = [lastValidDateRange.value[0], lastValidDateRange.value[1]];
				return;
			}
			if (dateRangeDays(range) > 366) {
				ElMessage.warning("日期范围最多选择 366 天");
				leaderboardDateRange.value = [lastValidDateRange.value[0], lastValidDateRange.value[1]];
				return;
			}
			leaderboardDateRange.value = range;
			lastValidDateRange.value = [range[0], range[1]];
			leaderboardPeriod.value = inferPeriod(range);
			loadLeaderboard();
		};
		const disableFutureLeaderboardDate = (date) => toIsoDate(date) > todayIsoDate();
		const formatInteger = (value) => Math.round(Number(value || 0)).toLocaleString("zh-CN");
		const formatDecimal = (value) => {
			const number = Number(value || 0);
			return Number.isInteger(number) ? number.toFixed(0) : number.toFixed(1);
		};
		const formatPercent = (value) => `${formatDecimal(value)}%`;
		const progressBarValue = (value) => Math.min(Math.max(Number(value || 0), 0), 100);
		const progressColor = (value) => Number(value || 0) >= 100 ? "#16a34a" : "#c56a08";
		const progressTone = (value) => Number(value || 0) >= 100 ? "is-achieved" : "is-behind";
		const firstCharacter = (value) => String(value || "销").trim().charAt(0) || "销";
		const rankNumberClass = (rank) => rank && rank <= 3 ? `is-top-${rank}` : "";
		const leaderboardRowClass = ({ row }) => row.currentUser ? "is-current-user" : "";
		watch(leaderboardMetric, () => {
			if (activeTab.value === "ranking") loadLeaderboard();
		});
		watch(activeTab, (tab) => {
			if (tab === "ranking") loadLeaderboard();
			else loadPerfRank();
		});
		onMounted(() => {
			loadLeaderboard();
		});
		return (_ctx, _cache) => {
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_View = resolveComponent("View");
			const _component_el_icon = ElIcon;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_segmented = ElSegmented;
			const _component_el_button = ElButton;
			const _component_el_tooltip = ElTooltip;
			const _component_el_alert = ElAlert;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_progress = ElProgress;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("h1", null, toDisplayString(unref(pageTitle)), 1)]),
				createVNode(_component_el_tabs, {
					modelValue: unref(activeTab),
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(activeTab) ? activeTab.value = $event : null),
					class: "result-tabs"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							label: "通话排行",
							name: "ranking"
						}),
						createVNode(_component_el_tab_pane, {
							label: "业绩排行",
							name: "personal"
						}),
						createVNode(_component_el_tab_pane, {
							label: "通话录音",
							name: "recordings"
						})
					]),
					_: 1
				}, 8, ["modelValue"]),
				withDirectives((openBlock(), createElementBlock("section", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [
						createBaseVNode("div", _hoisted_5, [_cache[6] || (_cache[6] = createBaseVNode("span", { class: "pr-label" }, "我的所选日期到款", -1)), createBaseVNode("b", _hoisted_6, toDisplayString(formatWan(unref(perfMe).amount)), 1)]),
						createBaseVNode("div", _hoisted_7, [_cache[8] || (_cache[8] = createBaseVNode("span", { class: "pr-label" }, "我的成交", -1)), createBaseVNode("b", _hoisted_8, [createTextVNode(toDisplayString(unref(perfMe).orderCount), 1), _cache[7] || (_cache[7] = createBaseVNode("em", null, "单", -1))])]),
						createBaseVNode("div", _hoisted_9, [_cache[10] || (_cache[10] = createBaseVNode("span", { class: "pr-label" }, "当前排名", -1)), unref(perfMe).rank ? (openBlock(), createElementBlock("b", _hoisted_10, [createTextVNode(toDisplayString(unref(perfMe).rank), 1), createBaseVNode("em", null, "/ " + toDisplayString(unref(perfMe).total) + " 名", 1)])) : (openBlock(), createElementBlock("b", _hoisted_11, [..._cache[9] || (_cache[9] = [createTextVNode("--", -1), createBaseVNode("em", null, "暂未上榜", -1)])]))])
					]),
					createBaseVNode("div", _hoisted_12, [createBaseVNode("div", _hoisted_13, [
						createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_View)]),
							_: 1
						}),
						_cache[11] || (_cache[11] = createBaseVNode("strong", null, "全员可见 · 全公司", -1)),
						_cache[12] || (_cache[12] = createBaseVNode("span", null, "到款按订单财务确认归业务员,升降与上一等长周期对比", -1))
					]), createBaseVNode("div", _hoisted_14, [
						createBaseVNode("div", _hoisted_15, [_cache[13] || (_cache[13] = createBaseVNode("span", null, "日期范围", -1)), createVNode(_component_el_date_picker, {
							modelValue: unref(perfRange),
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => isRef(perfRange) ? perfRange.value = $event : null),
							class: "leaderboard-date-range",
							type: "daterange",
							"value-format": "YYYY-MM-DD",
							format: "YYYY-MM-DD",
							"range-separator": "至",
							"start-placeholder": "开始日期",
							"end-placeholder": "结束日期",
							clearable: false,
							editable: false,
							"disabled-date": disableFutureLeaderboardDate,
							"unlink-panels": "",
							onChange: handlePerfDateChange
						}, null, 8, ["modelValue"])]),
						createVNode(_component_el_segmented, {
							modelValue: unref(perfPeriod),
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => isRef(perfPeriod) ? perfPeriod.value = $event : null),
							options: leaderboardPeriodOptions,
							onChange: handlePerfPeriodChange
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_button, {
							class: "pr-cast-btn",
							onClick: openCast
						}, {
							default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("📺 投屏模式", -1)])]),
							_: 1
						}),
						createVNode(_component_el_tooltip, {
							content: "刷新业绩排行",
							placement: "top"
						}, {
							default: withCtx(() => [createVNode(_component_el_button, {
								class: "refresh-rank",
								icon: unref(refresh_default),
								circle: "",
								loading: unref(perfLoading),
								onClick: loadPerfRank
							}, null, 8, ["icon", "loading"])]),
							_: 1
						})
					])]),
					unref(perfError) ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						class: "leaderboard-error",
						type: "error",
						closable: false,
						"show-icon": "",
						title: "业绩排行加载失败"
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							link: "",
							type: "primary",
							onClick: loadPerfRank
						}, {
							default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("重新加载", -1)])]),
							_: 1
						})]),
						_: 1
					})) : !unref(perfLoading) && unref(perfRows).length === 0 ? (openBlock(), createElementBlock("div", _hoisted_16, [..._cache[16] || (_cache[16] = [createBaseVNode("p", null, "所选区间还没有财务确认到款的订单", -1)])])) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [unref(riseStar) || unref(fallStar) ? (openBlock(), createElementBlock("div", _hoisted_17, [unref(riseStar) ? (openBlock(), createElementBlock("div", _hoisted_18, [createBaseVNode("span", _hoisted_19, toDisplayString(firstCharacter(unref(riseStar).name)), 1), createBaseVNode("div", _hoisted_20, [_cache[17] || (_cache[17] = createBaseVNode("div", { class: "pr-star-t" }, "🚀 进步之星", -1)), createBaseVNode("div", _hoisted_21, [
						createTextVNode(toDisplayString(unref(riseStar).name) + " ", 1),
						createBaseVNode("span", _hoisted_22, "↑ " + toDisplayString((unref(riseStar).prevRank || 0) - unref(riseStar).rank) + " 名", 1),
						createBaseVNode("small", null, toDisplayString(formatWan(unref(riseStar).amount)) + toDisplayString(perfMoM(unref(riseStar))), 1)
					])])])) : createCommentVNode("", true), unref(fallStar) ? (openBlock(), createElementBlock("div", _hoisted_23, [createBaseVNode("span", _hoisted_24, toDisplayString(firstCharacter(unref(fallStar).name)), 1), createBaseVNode("div", _hoisted_25, [_cache[18] || (_cache[18] = createBaseVNode("div", { class: "pr-star-t" }, "🔔 需要关注", -1)), createBaseVNode("div", _hoisted_26, [
						createTextVNode(toDisplayString(unref(fallStar).name) + " ", 1),
						createBaseVNode("span", _hoisted_27, "↓ " + toDisplayString(unref(fallStar).rank - (unref(fallStar).prevRank || 0)) + " 名", 1),
						createBaseVNode("small", null, toDisplayString(formatWan(unref(fallStar).amount)) + toDisplayString(perfMoM(unref(fallStar))), 1)
					])])])) : createCommentVNode("", true)])) : createCommentVNode("", true), createBaseVNode("div", _hoisted_28, [unref(podiumOrder).length ? (openBlock(), createElementBlock("div", _hoisted_29, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(podiumOrder), (p) => {
						return openBlock(), createElementBlock("div", {
							key: p.row.userId,
							class: normalizeClass(["pr-pod", p.cls])
						}, [
							createBaseVNode("span", _hoisted_30, toDisplayString(firstCharacter(p.row.name)), 1),
							createBaseVNode("div", _hoisted_31, [createTextVNode(toDisplayString(p.row.name) + " ", 1), createBaseVNode("span", { class: normalizeClass(["pr-delta", perfDelta(p.row).cls]) }, toDisplayString(perfDelta(p.row).text), 3)]),
							createBaseVNode("div", _hoisted_32, toDisplayString(formatWan(p.row.amount)), 1),
							createBaseVNode("div", _hoisted_33, toDisplayString(p.row.rank), 1)
						], 2);
					}), 128))])) : createCommentVNode("", true), createVNode(_component_el_table, {
						data: unref(perfRows),
						class: "pr-table",
						"row-class-name": perfRowClass
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "排名",
								width: "64",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass(["pr-rankchip", rankChipClass(row.rank)]) }, toDisplayString(row.rank), 3)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "升降",
								width: "72",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass(["pr-delta", perfDelta(row).cls]) }, toDisplayString(perfDelta(row).text), 3)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "销售",
								"min-width": "120"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_34, [createTextVNode(toDisplayString(row.name), 1), row.currentUser ? (openBlock(), createElementBlock("em", _hoisted_35, "(我)")) : createCommentVNode("", true)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "部门",
								"min-width": "96",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.deptName || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "到款金额",
								"min-width": "104",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_36, toDisplayString(formatWan(row.amount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "成交单数",
								width: "92",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.orderCount) + " 单", 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "客单价",
								width: "96",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatWan(row.avgAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "占团队比重",
								"min-width": "120"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_37, [createBaseVNode("i", { style: normalizeStyle({ width: Math.min(Number(row.share) || 0, 100) + "%" }) }, null, 4)])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])])], 64))
				])), [[vShow, unref(activeTab) === "personal"], [_directive_loading, unref(perfLoading)]]),
				withDirectives((openBlock(), createElementBlock("section", _hoisted_38, [
					createBaseVNode("div", _hoisted_39, [
						createBaseVNode("div", _hoisted_40, [
							createBaseVNode("span", null, "我的" + toDisplayString(unref(leaderboardPeriodLabel)), 1),
							createBaseVNode("strong", null, toDisplayString(formatInteger(unref(selfRow).callCount)), 1),
							_cache[19] || (_cache[19] = createBaseVNode("em", null, "通", -1))
						]),
						createBaseVNode("div", _hoisted_41, [createBaseVNode("div", _hoisted_42, [createBaseVNode("span", _hoisted_43, [
							_cache[20] || (_cache[20] = createTextVNode(" 目标 ", -1)),
							createBaseVNode("b", null, toDisplayString(formatInteger(unref(leaderboardData).targetCount)), 1),
							_cache[21] || (_cache[21] = createTextVNode(" 通 ", -1)),
							createBaseVNode("small", null, "每人每日 " + toDisplayString(formatInteger(unref(leaderboardData).targetPerDay)) + " 通", 1)
						]), createBaseVNode("strong", null, toDisplayString(formatPercent(unref(selfRow).targetProgress)), 1)]), createVNode(_component_el_progress, {
							percentage: progressBarValue(unref(selfRow).targetProgress),
							"show-text": false,
							"stroke-width": 9,
							color: progressColor(unref(selfRow).targetProgress)
						}, null, 8, ["percentage", "color"])]),
						createBaseVNode("div", _hoisted_44, [
							_cache[22] || (_cache[22] = createBaseVNode("span", null, "当前第", -1)),
							createBaseVNode("strong", null, toDisplayString(unref(selfRow).rank || "--"), 1),
							_cache[23] || (_cache[23] = createBaseVNode("em", null, "名", -1))
						]),
						createBaseVNode("div", _hoisted_45, [
							createBaseVNode("span", null, toDisplayString(unref(gapTitle)), 1),
							createBaseVNode("strong", null, toDisplayString(unref(gapValue)), 1),
							createBaseVNode("em", null, toDisplayString(unref(leaderboardData).gapUnit), 1)
						])
					]),
					createBaseVNode("div", _hoisted_46, [createBaseVNode("div", _hoisted_47, [
						createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_View)]),
							_: 1
						}),
						_cache[24] || (_cache[24] = createBaseVNode("strong", null, "全员可见 · 全公司", -1)),
						_cache[25] || (_cache[25] = createBaseVNode("span", null, "只展示当前公司已绑定坐席的汇总数据", -1))
					]), createBaseVNode("div", _hoisted_48, [
						createBaseVNode("div", _hoisted_49, [_cache[26] || (_cache[26] = createBaseVNode("span", null, "日期范围", -1)), createVNode(_component_el_date_picker, {
							modelValue: unref(leaderboardDateRange),
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => isRef(leaderboardDateRange) ? leaderboardDateRange.value = $event : null),
							class: "leaderboard-date-range",
							type: "daterange",
							"value-format": "YYYY-MM-DD",
							format: "YYYY-MM-DD",
							"range-separator": "至",
							"start-placeholder": "开始日期",
							"end-placeholder": "结束日期",
							clearable: false,
							editable: false,
							"disabled-date": disableFutureLeaderboardDate,
							"unlink-panels": "",
							onChange: handleLeaderboardDateChange
						}, null, 8, ["modelValue"])]),
						createVNode(_component_el_segmented, {
							modelValue: unref(leaderboardPeriod),
							"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => isRef(leaderboardPeriod) ? leaderboardPeriod.value = $event : null),
							options: leaderboardPeriodOptions,
							onChange: handleLeaderboardPeriodChange
						}, null, 8, ["modelValue"]),
						createBaseVNode("div", _hoisted_50, [_cache[27] || (_cache[27] = createBaseVNode("span", null, "排行口径", -1)), createVNode(_component_el_segmented, {
							modelValue: unref(leaderboardMetric),
							"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => isRef(leaderboardMetric) ? leaderboardMetric.value = $event : null),
							options: leaderboardMetricOptions
						}, null, 8, ["modelValue"])]),
						createVNode(_component_el_tooltip, {
							content: "刷新排行数据",
							placement: "top"
						}, {
							default: withCtx(() => [createVNode(_component_el_button, {
								class: "refresh-rank",
								icon: unref(refresh_default),
								circle: "",
								loading: unref(leaderboardLoading),
								onClick: loadLeaderboard
							}, null, 8, ["icon", "loading"])]),
							_: 1
						})
					])]),
					unref(leaderboardError) ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						class: "leaderboard-error",
						type: "error",
						closable: false,
						"show-icon": "",
						title: "通话排行加载失败"
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							link: "",
							type: "primary",
							onClick: loadLeaderboard
						}, {
							default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("重新加载", -1)])]),
							_: 1
						})]),
						_: 1
					})) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_51, [createVNode(_component_el_table, {
						data: unref(leaderboardData).rows,
						class: "leaderboard-table",
						"row-class-name": leaderboardRowClass,
						"empty-text": "当前时间范围暂无已绑定坐席的通话数据"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "排名",
								width: "64",
								align: "center",
								fixed: "left"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass(["rank-number", rankNumberClass(row.rank)]) }, toDisplayString(row.rank), 3)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "销售",
								"min-width": "132",
								fixed: "left"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_52, [
									createBaseVNode("span", _hoisted_53, toDisplayString(firstCharacter(row.agentName)), 1),
									createVNode(_component_el_tooltip, {
										content: row.agentName,
										placement: "top",
										disabled: String(row.agentName || "").length <= 8
									}, {
										default: withCtx(() => [createBaseVNode("strong", _hoisted_54, toDisplayString(row.agentName), 1)]),
										_: 2
									}, 1032, ["content", "disabled"]),
									row.currentUser ? (openBlock(), createElementBlock("em", _hoisted_55, "我")) : createCommentVNode("", true)
								])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "deptName",
								label: "部门",
								"min-width": "108",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "拨打量",
								width: "90",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_56, toDisplayString(formatInteger(row.callCount)), 1), _cache[29] || (_cache[29] = createTextVNode(" 通", -1))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "接通量",
								width: "90",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatInteger(row.connectedCount)) + " 通", 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "接通率",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatPercent(row.connectRate)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "有效沟通",
								width: "100",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatInteger(row.validCount)) + " 通", 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "有效率",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatPercent(row.validRate)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "totalDurationText",
								label: "通话时长",
								width: "108",
								align: "right"
							}),
							createVNode(_component_el_table_column, {
								label: "目标进度",
								"min-width": "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_57, [
									createBaseVNode("strong", { class: normalizeClass(progressTone(row.targetProgress)) }, toDisplayString(formatPercent(row.targetProgress)), 3),
									createVNode(_component_el_progress, {
										percentage: progressBarValue(row.targetProgress),
										"show-text": false,
										"stroke-width": 7,
										color: progressColor(row.targetProgress)
									}, null, 8, ["percentage", "color"]),
									createBaseVNode("span", null, toDisplayString(formatInteger(row.callCount)) + " / " + toDisplayString(formatInteger(row.targetCount)), 1)
								])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])]),
					createBaseVNode("footer", _hoisted_58, [
						_cache[30] || (_cache[30] = createBaseVNode("span", null, "数据来自系统真实话单", -1)),
						_cache[31] || (_cache[31] = createBaseVNode("span", null, "有效沟通：已接通且通话不少于 60 秒；有效率=有效沟通÷拨打量", -1)),
						createBaseVNode("span", null, toDisplayString(unref(leaderboardRangeLabel)) + "目标：每人每日 " + toDisplayString(formatInteger(unref(leaderboardData).targetPerDay)) + " 通 × " + toDisplayString(unref(leaderboardData).periodDays) + " 天 = " + toDisplayString(formatInteger(unref(leaderboardData).targetCount)) + " 通", 1)
					])
				])), [[vShow, unref(activeTab) === "ranking"], [_directive_loading, unref(leaderboardLoading)]]),
				unref(activeTab) === "recordings" ? (openBlock(), createBlock(call_recording_panel_default, { key: 0 })) : createCommentVNode("", true),
				unref(castMode) ? (openBlock(), createElementBlock("div", _hoisted_59, [createBaseVNode("div", _hoisted_60, [createBaseVNode("span", _hoisted_61, [_cache[32] || (_cache[32] = createTextVNode("🏆 业绩排行", -1)), createBaseVNode("small", null, toDisplayString(unref(perfRange)[0]) + " 至 " + toDisplayString(unref(perfRange)[1]) + " · 按到款(财务确认)", 1)]), createBaseVNode("span", _hoisted_62, [createTextVNode("每小时自动刷新 · " + toDisplayString(unref(castUpdatedAt)) + " 更新", 1), createBaseVNode("button", {
					type: "button",
					class: "pr-cast-exit",
					onClick: closeCast
				}, "退出 Esc")])]), createBaseVNode("div", _hoisted_63, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(perfRows), (row) => {
					return openBlock(), createElementBlock("div", {
						key: row.userId,
						class: normalizeClass(["pr-cast-row", [row.currentUser ? "is-me" : "", row.rank <= 3 ? "is-r" + row.rank : ""]])
					}, [
						createBaseVNode("span", _hoisted_64, toDisplayString(row.rank), 1),
						createBaseVNode("span", { class: normalizeClass(["pr-cast-delta", perfDelta(row).cls]) }, toDisplayString(perfDelta(row).text), 3),
						createBaseVNode("span", _hoisted_65, [createTextVNode(toDisplayString(row.name), 1), createBaseVNode("small", null, toDisplayString(row.deptName || "") + " · " + toDisplayString(row.orderCount) + " 单", 1)]),
						createBaseVNode("span", _hoisted_66, [createTextVNode(toDisplayString(castWan(row.amount)), 1), _cache[33] || (_cache[33] = createBaseVNode("i", null, "万", -1))])
					], 2);
				}), 128)), !unref(perfRows).length ? (openBlock(), createElementBlock("div", _hoisted_67, "所选区间暂无到款数据")) : createCommentVNode("", true)])])) : createCommentVNode("", true)
			]);
		};
	}
}));
//#endregion
//#region src/views/dashboard/biz-perf.vue
var biz_perf_exports = /* @__PURE__ */ __exportAll({ default: () => biz_perf_default });
var biz_perf_default = /* @__PURE__ */ _plugin_vue_export_helper_default(biz_perf_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-02af9e1c"]]);
//#endregion
export { biz_perf_exports as n, biz_perf_default as t };
