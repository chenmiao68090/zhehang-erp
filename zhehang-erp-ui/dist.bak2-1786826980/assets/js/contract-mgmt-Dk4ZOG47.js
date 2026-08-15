import { V as _asyncToGenerator } from "./vendor-Cuzsyfny.js";
import { i as put, n as get, r as post } from "./request-CZ5tKmxn.js";
//#region src/api/contract-mgmt.ts
var PARTY_B_NAME = "浙杭企业服务有限公司";
/** 拦截器返回 R 信封 {code,message,data}，取出 data 载荷 */
function unwrap(res) {
	return res && typeof res === "object" && "data" in res ? res.data : res;
}
var SIGN_STATUS_BY_CODE = {
	1: "draft",
	2: "sent",
	3: "sent",
	4: "signed",
	5: "signed",
	6: "expired",
	7: "terminated"
};
var CODE_BY_SIGN_STATUS = {
	draft: 1,
	sent: 3,
	partial_signed: 3,
	signed: 4,
	expired: 6,
	terminated: 7
};
var toSignMethod = (m) => m === "online" ? "esign" : m === "offline" ? "paper" : "unset";
var toSignMode = (m) => m === "esign" || m === "fadada" ? "online" : "offline";
function defaultStages() {
	return [
		{
			stage: 60,
			status: "pending"
		},
		{
			stage: 45,
			status: "pending"
		},
		{
			stage: 30,
			status: "pending"
		},
		{
			stage: 15,
			status: "pending"
		},
		{
			stage: 7,
			status: "pending"
		},
		{
			stage: 0,
			status: "pending"
		}
	];
}
function loadStageOverlay() {
	return _loadStageOverlay.apply(this, arguments);
}
function _loadStageOverlay() {
	_loadStageOverlay = _asyncToGenerator(function* () {
		try {
			const res = yield get("/contract-mgmt/renew-stages", void 0, { silentError: true }).catch(() => null);
			const rows = res ? unwrap(res) : [];
			const grouped = {};
			for (const r of Array.isArray(rows) ? rows : []) {
				const cid = String(r.contractId);
				if (!grouped[cid]) grouped[cid] = [];
				grouped[cid].push({
					stage: Number(r.stage),
					status: r.status || "pending",
					handler: r.handler,
					note: r.note,
					handledAt: r.handledAt
				});
			}
			const map = {};
			for (const cid of Object.keys(grouped)) {
				const stored = grouped[cid];
				map[cid] = defaultStages().map((d) => stored.find((x) => x.stage === d.stage) || d);
			}
			return map;
		} catch (_unused) {
			return {};
		}
	});
	return _loadStageOverlay.apply(this, arguments);
}
function dayDiff(dateStr) {
	if (!dateStr) return NaN;
	const a = new Date(dateStr).setHours(0, 0, 0, 0);
	const b = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
	return Math.round((a - b) / 864e5);
}
function adaptTemplate(s) {
	return {
		id: s.id,
		templateName: s.name || "",
		templateCode: s.applyType || `TPL_${s.id}`,
		serviceType: s.category || "other",
		templateContent: s.content || "",
		variableJson: s.variables || "[]",
		version: s.remark && /^v/i.test(s.remark) ? s.remark : "v1.0",
		enabled: s.status === 1,
		createTime: s.createTime || "",
		updateTime: s.updateTime || ""
	};
}
/** 模板 id→名称 缓存（合同上仅有 templateId，名称需自行勾稽） */
var tplIndexPromise = null;
function ensureTplIndex() {
	if (!tplIndexPromise) tplIndexPromise = get("/contract-mgmt/templates", void 0, { silentError: true }).then((res) => {
		const arr = unwrap(res) || [];
		return new Map(arr.map((t) => [t.id, t.name || ""]));
	}).catch(() => {
		tplIndexPromise = null;
		return /* @__PURE__ */ new Map();
	});
	return tplIndexPromise;
}
function adaptContract(s, tplIndex, overlay) {
	var _s$status, _s$templateId, _s$amount, _s$parentId;
	const status = (_s$status = s.status) !== null && _s$status !== void 0 ? _s$status : 1;
	const signStatus = SIGN_STATUS_BY_CODE[status] || "draft";
	const records = [];
	if (s.sendSignTime) records.push({
		time: s.sendSignTime,
		type: "sign",
		title: "送签状态已登记",
		detail: s.signMode === "online" ? "线上送签登记（不代表电子签平台已发送）" : "线下送签登记",
		by: "系统记录"
	});
	if (s.confirmSignTime) records.push({
		time: s.confirmSignTime,
		type: "sign",
		title: "客户签署已确认",
		by: s.signerTheirs || "客户"
	});
	if (s.contractType === "renew" && s.parentId) records.push({
		time: s.createTime || "",
		type: "renew",
		title: "由原合同续签生成",
		detail: `父合同 ID：${s.parentId}`,
		by: "系统"
	});
	if (s.terminateTime) records.push({
		time: s.terminateTime,
		type: "terminate",
		title: "合同终止",
		detail: s.terminateReason || "",
		by: "系统"
	});
	const stages = overlay[String(s.id)];
	if (stages) stages.forEach((st) => {
		if (st.status !== "pending") records.push({
			time: st.handledAt || "",
			type: "stage_alert",
			title: `${st.stage} 天阶梯处理`,
			detail: st.note,
			by: st.handler
		});
	});
	const left = dayDiff(s.endDate);
	const expireWarn = (status === 4 || status === 5) && !Number.isNaN(left) && left >= 0 && left <= 30;
	return {
		id: s.id,
		contractNo: s.contractNo,
		orderId: s.orderId,
		orderNo: void 0,
		customerId: s.customerId,
		customerName: s.customerName,
		contractTemplateId: (_s$templateId = s.templateId) !== null && _s$templateId !== void 0 ? _s$templateId : 0,
		templateName: s.templateId != null ? tplIndex.get(s.templateId) : void 0,
		contractName: s.title || "",
		contractAmount: Number((_s$amount = s.amount) !== null && _s$amount !== void 0 ? _s$amount : 0),
		startDate: s.startDate || "",
		endDate: s.endDate || "",
		signMethod: toSignMethod(s.signMode),
		signStatus,
		partyAName: s.customerName || "",
		partyASigner: s.signerTheirs || "",
		partyASignTime: s.confirmSignTime || "",
		partyBName: PARTY_B_NAME,
		partyBSignTime: s.sendSignTime || "",
		contractFileUrl: s.attachments || "",
		expireWarn,
		remark: s.remark || "",
		createTime: s.createTime || "",
		version: s.contractType === "renew" ? 2 : 1,
		parentContractId: (_s$parentId = s.parentId) !== null && _s$parentId !== void 0 ? _s$parentId : void 0,
		renewedContractId: void 0,
		renewStages: stages || defaultStages(),
		linkageRecords: records
	};
}
/** 同批数据内按 parentContractId 反向勾稽「已续签」关系（后端不回写父合同状态） */
function crossLink(list) {
	const byId = new Map(list.map((c) => [c.id, c]));
	list.forEach((child) => {
		if (!child.parentContractId) return;
		const parent = byId.get(child.parentContractId);
		if (!parent) return;
		parent.renewedContractId = child.id;
		if (parent.signStatus === "signed") parent.signStatus = "renewed";
		parent.linkageRecords = [...parent.linkageRecords || [], {
			time: child.createTime || "",
			type: "renew",
			title: "已生成续签合同",
			detail: `新合同：${child.contractNo}`,
			by: "系统"
		}];
	});
}
var contractMgmtApi = {
	list() {
		return _asyncToGenerator(function* (params = {}) {
			var _params$page, _params$pageSize, _pageData$total;
			const status = params.signStatus && params.signStatus !== "renewed" ? CODE_BY_SIGN_STATUS[params.signStatus] : void 0;
			const [tplIndex, res] = yield Promise.all([ensureTplIndex(), get("/contract-mgmt/list", {
				pageNum: (_params$page = params.page) !== null && _params$page !== void 0 ? _params$page : 1,
				pageSize: (_params$pageSize = params.pageSize) !== null && _params$pageSize !== void 0 ? _params$pageSize : 10,
				contractNo: params.contractNo || void 0,
				status
			})]);
			const pageData = unwrap(res) || {
				records: [],
				total: 0
			};
			const overlay = yield loadStageOverlay();
			let list = (pageData.records || []).map((s) => adaptContract(s, tplIndex, overlay));
			crossLink(list);
			if (params.customerName) list = list.filter((c) => (c.customerName || "").includes(params.customerName));
			if (params.signStatus === "renewed") list = list.filter((c) => c.signStatus === "renewed");
			return {
				list,
				total: Number((_pageData$total = pageData.total) !== null && _pageData$total !== void 0 ? _pageData$total : list.length)
			};
		}).apply(this, arguments);
	},
	detail(id) {
		return _asyncToGenerator(function* () {
			const res = yield get(`/contract-mgmt/${id}`, void 0, { silentError: true }).catch(() => null);
			const s = res ? unwrap(res) : null;
			if (!s || s.id == null) return null;
			return adaptContract(s, yield ensureTplIndex(), yield loadStageOverlay());
		})();
	},
	/** 后端按订单回填客户、金额和期限，按模板写入正文；这里只提交控制器实际接收的三个字段。 */
	generate(payload) {
		var _this = this;
		return _asyncToGenerator(function* () {
			const id = unwrap(yield post("/contract-mgmt/generate", {
				orderId: payload.orderId,
				templateId: payload.templateId,
				title: payload.title
			}));
			const created = (yield _this.detail(id)) || (yield _this.list({
				page: 1,
				pageSize: 1
			})).list[0];
			if (!created) return Promise.reject(/* @__PURE__ */ new Error("合同已生成，但查询新合同失败"));
			return created;
		})();
	},
	update(data) {
		var _this2 = this;
		return _asyncToGenerator(function* () {
			const body = {};
			if (data.contractName !== void 0) body.title = data.contractName;
			if (data.contractAmount !== void 0) body.amount = data.contractAmount;
			if (data.startDate !== void 0) body.startDate = data.startDate || null;
			if (data.endDate !== void 0) body.endDate = data.endDate || null;
			if (data.remark !== void 0) body.remark = data.remark;
			yield put(`/contract-mgmt/${data.id}`, body);
			const fresh = yield _this2.detail(data.id);
			if (!fresh) return Promise.reject(/* @__PURE__ */ new Error("合同不存在"));
			return fresh;
		})();
	},
	/** 仅登记送签方式、状态和时间；该端点不会发送文件，也没有接入电子签服务商。 */
	sendSign(payload) {
		var _this3 = this;
		return _asyncToGenerator(function* () {
			yield post(`/contract-mgmt/${payload.id}/send-sign`, { signMode: toSignMode(payload.signMethod) });
			const fresh = yield _this3.detail(payload.id);
			if (!fresh) return Promise.reject(/* @__PURE__ */ new Error("合同不存在"));
			return fresh;
		})();
	},
	/** 后端 confirm-sign 写入已签署状态、对方签署人和确认时间。 */
	confirmSign(payload) {
		var _this4 = this;
		return _asyncToGenerator(function* () {
			yield post(`/contract-mgmt/${payload.id}/confirm-sign`, { signerTheirs: payload.signer });
			const fresh = yield _this4.detail(payload.id);
			if (!fresh) return Promise.reject(/* @__PURE__ */ new Error("合同不存在"));
			return fresh;
		})();
	},
	/** 更新阶梯处理状态（真实后端 POST /contract-mgmt/{id}/stage，按 合同+阶梯 upsert） */
	updateStage(payload) {
		var _this5 = this;
		return _asyncToGenerator(function* () {
			yield post(`/contract-mgmt/${payload.id}/stage`, {
				stage: payload.stage,
				status: payload.status,
				handler: payload.handler,
				note: payload.note
			});
			const fresh = yield _this5.detail(payload.id);
			if (!fresh) return Promise.reject(/* @__PURE__ */ new Error("合同不存在"));
			return fresh;
		})();
	},
	/** 版本链：按客户拉取后沿 parentContractId 双向追溯（后端无专用 history 端点） */
	history(contractId) {
		var _this6 = this;
		return _asyncToGenerator(function* () {
			const target = yield _this6.detail(contractId);
			if (!target) return [];
			const res = yield get("/contract-mgmt/list", {
				pageNum: 1,
				pageSize: 500,
				customerId: target.customerId
			}, { silentError: true }).catch(() => null);
			const pageData = res ? unwrap(res) : null;
			const tplIndex = yield ensureTplIndex();
			const overlay = yield loadStageOverlay();
			const all = ((pageData === null || pageData === void 0 ? void 0 : pageData.records) || []).map((s) => adaptContract(s, tplIndex, overlay));
			crossLink(all);
			const byId = new Map(all.map((c) => [c.id, c]));
			if (!byId.has(target.id)) byId.set(target.id, target);
			const start = byId.get(target.id);
			const chain = [];
			let cur = start;
			while (cur && !chain.includes(cur)) {
				chain.unshift(cur);
				cur = cur.parentContractId ? byId.get(cur.parentContractId) : void 0;
			}
			let nextId = start.renewedContractId;
			while (nextId) {
				const nxt = byId.get(nextId);
				if (!nxt || chain.includes(nxt)) break;
				chain.push(nxt);
				nextId = nxt.renewedContractId;
			}
			chain.forEach((c, i) => {
				c.version = i + 1;
			});
			return chain;
		})();
	},
	/** 后端按原合同生成续签草稿（起止日期顺延一年），再把弹窗中的金额/期限/服务调整补写到新合同 */
	renew(payload) {
		var _this7 = this;
		return _asyncToGenerator(function* () {
			const newId = unwrap(yield post(`/contract-mgmt/${payload.id}/renew`, {}));
			const body = {
				amount: payload.contractAmount,
				startDate: payload.startDate || null,
				endDate: payload.endDate || null
			};
			if (payload.adjustService && payload.serviceContent) body.remark = `服务内容调整：${payload.serviceContent}`;
			yield put(`/contract-mgmt/${newId}`, body).catch(() => {});
			const fresh = yield _this7.detail(newId);
			if (!fresh) return Promise.reject(/* @__PURE__ */ new Error("续签合同已生成，但查询失败"));
			return fresh;
		})();
	},
	terminate(payload) {
		var _this8 = this;
		return _asyncToGenerator(function* () {
			yield post(`/contract-mgmt/${payload.id}/terminate`, { reason: payload.reason });
			const fresh = yield _this8.detail(payload.id);
			if (!fresh) return Promise.reject(/* @__PURE__ */ new Error("合同不存在"));
			return fresh;
		})();
	},
	/** 后端 /expiring 返回数组（无分页），此处客户端分页保持 {list,total} 形状 */
	getExpiring() {
		return _asyncToGenerator(function* (params = {}) {
			var _params$days, _params$page2, _params$pageSize2;
			const arr = unwrap(yield get("/contract-mgmt/expiring", { days: (_params$days = params.days) !== null && _params$days !== void 0 ? _params$days : 30 })) || [];
			const tplIndex = yield ensureTplIndex();
			const overlay = yield loadStageOverlay();
			const all = arr.map((s) => adaptContract(s, tplIndex, overlay));
			const page = (_params$page2 = params.page) !== null && _params$page2 !== void 0 ? _params$page2 : 1;
			const pageSize = (_params$pageSize2 = params.pageSize) !== null && _params$pageSize2 !== void 0 ? _params$pageSize2 : 10;
			return {
				list: all.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
				total: all.length
			};
		}).apply(this, arguments);
	},
	getTemplates() {
		return _asyncToGenerator(function* (params = {}) {
			return (unwrap(yield get("/contract-mgmt/templates", {
				category: params.serviceType || void 0,
				status: params.enabled == null ? void 0 : params.enabled ? 1 : 0
			})) || []).map(adaptTemplate);
		}).apply(this, arguments);
	},
	saveTemplate(data) {
		var _this9 = this;
		return _asyncToGenerator(function* () {
			const body = {};
			if (data.id) body.id = data.id;
			if (data.templateName !== void 0) body.name = data.templateName;
			if (data.serviceType !== void 0) body.category = data.serviceType;
			if (data.templateCode !== void 0) body.applyType = data.templateCode;
			if (data.templateContent !== void 0) body.content = data.templateContent;
			if (data.variableJson !== void 0) body.variables = data.variableJson;
			if (data.enabled !== void 0) body.status = data.enabled ? 1 : 0;
			if (data.version !== void 0) body.remark = data.version;
			const id = unwrap(yield post("/contract-mgmt/template", body));
			tplIndexPromise = null;
			const all = yield _this9.getTemplates();
			const saved = all.find((t) => String(t.id) === String(id)) || all.find((t) => t.id === data.id);
			if (!saved) return Promise.reject(/* @__PURE__ */ new Error("模板已保存，但查询失败"));
			return saved;
		})();
	}
};
//#endregion
export { contractMgmtApi as t };
