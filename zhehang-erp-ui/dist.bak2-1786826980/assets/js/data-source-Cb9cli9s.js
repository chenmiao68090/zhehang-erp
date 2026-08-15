import { V as _asyncToGenerator, g as _objectSpread2 } from "./vendor-Cuzsyfny.js";
import { n as feigeOrderApi } from "./module.scss_vue_type_style_index_0_src_true_lang-DZsVCiit.js";
//#region src/views/feige-order-contract/demo-store.ts
function isFeigeLocalDemo() {
	return false;
}
var staff = [
	{
		id: 9001,
		name: "本地演示销售甲",
		deptId: 901,
		deptName: "LOCAL-DEMO销售一组"
	},
	{
		id: 9002,
		name: "本地演示销售乙",
		deptId: 902,
		deptName: "LOCAL-DEMO销售二组"
	},
	{
		id: 9003,
		name: "本地演示财务",
		deptId: 903,
		deptName: "LOCAL-DEMO财务组"
	},
	{
		id: 9004,
		name: "本地演示会计",
		deptId: 904,
		deptName: "LOCAL-DEMO服务组"
	}
];
var orders = [
	demoOrder(1, "LOCAL-DEMO-ORDER-001", "本地演示·云舟科技有限公司", "bookkeeping", "pending", 6800, 2e3, "本地演示销售甲", "LOCAL-DEMO销售一组", "新媒体", 0),
	demoOrder(2, "LOCAL-DEMO-SPORDER-001", "本地演示·星河设计工作室", "invoice", "pending", 3200, 3200, "本地演示销售甲", "LOCAL-DEMO销售一组", "客户转介绍", 1),
	demoOrder(3, "LOCAL-DEMO-SPORDER-002", "本地演示·青禾文化有限公司", "other", "in_progress", 12e3, 5600, "本地演示销售乙", "LOCAL-DEMO销售二组", "线下活动", 0),
	demoOrder(4, "LOCAL-DEMO-ORDER-002", "本地演示·远航咨询有限公司", "change", "in_progress", 4800, 1e3, "本地演示销售乙", "LOCAL-DEMO销售二组", "老客户复购", 1),
	demoOrder(5, "LOCAL-DEMO-SPORDER-003", "本地演示·青岚商贸有限公司", "invoice", "pending", 2600, 0, "本地演示销售甲", "LOCAL-DEMO销售一组", "渠道合作", 0),
	demoOrder(6, "LOCAL-DEMO-ORDER-003", "本地演示·辰光财税咨询有限公司", "tax", "completed", 9600, 9600, "本地演示销售乙", "LOCAL-DEMO销售二组", "线上投流", 1),
	demoOrder(7, "LOCAL-DEMO-SPORDER-004", "本地演示·知行企业咨询有限公司", "other", "completed", 15e3, 15e3, "本地演示销售甲", "LOCAL-DEMO销售一组", "客户转介绍", 1),
	demoOrder(8, "LOCAL-DEMO-SPORDER-005", "本地演示·拾光文化有限公司", "invoice", "rejected", 4200, 0, "本地演示销售乙", "LOCAL-DEMO销售二组", "新媒体", 0),
	demoOrder(9, "LOCAL-DEMO-ORDER-004", "本地演示·和序企业服务有限公司", "bookkeeping", "refunding", 7200, 7200, "本地演示销售甲", "LOCAL-DEMO销售一组", "老客户复购", 1),
	demoOrder(10, "LOCAL-DEMO-ORDER-005", "本地演示·清沐品牌管理有限公司", "registration", "cancelled", 5800, 1e3, "本地演示销售乙", "LOCAL-DEMO销售二组", "合作伙伴", 0),
	demoOrder(11, "LOCAL-DEMO-ORDER-006", "本地演示·澄明信息技术有限公司", "seal", "pending", 1800, 0, "本地演示销售甲", "LOCAL-DEMO销售一组", "自然到访", 0),
	demoOrder(12, "LOCAL-DEMO-ORDER-007", "本地演示·序章供应链有限公司", "license", "in_progress", 8600, 3e3, "本地演示销售乙", "LOCAL-DEMO销售二组", "渠道合作", 0),
	demoOrder(13, "LOCAL-DEMO-ORDER-008", "本地演示·云栖商务有限公司", "bookkeeping", "pending", 10800, 10800, "本地演示销售甲", "LOCAL-DEMO销售一组", "老客户复购", 1)
];
function demoOrder(id, orderNo, companyName, businessType, status, contractAmount, receivedAmount, salesmanName, teamName, source, recurring) {
	const day = String(12 - id % 9).padStart(2, "0");
	const auditStatus = id % 4 === 0 ? "rejected" : id % 3 === 0 ? "approved" : "pending";
	return {
		id,
		orderNo,
		companyName,
		businessType,
		status,
		contractAmount,
		receivedAmount,
		outstandingAmount: Math.max(0, contractAmount - receivedAmount),
		orderAmount: contractAmount,
		finalPaymentAmount: Math.max(0, contractAmount - receivedAmount),
		salesmanId: id % 2 ? 9001 : 9002,
		salesmanName,
		teamName,
		deptId: id % 2 ? 901 : 902,
		customerSource: source,
		opportunitySource: source,
		sourceDetail: `LOCAL-DEMO-${source}批次`,
		recurring,
		contacts: `演示联系人${id}`,
		contactPhone: `1380000${String(id).padStart(4, "0")}`,
		region: "浙江省 杭州市",
		address: `LOCAL-DEMO演示地址${id}号`,
		orderDate: `2026-08-${day}`,
		createTime: `2026-08-${day} 09:${String(id * 7 % 60).padStart(2, "0")}:00`,
		collectionTime: receivedAmount ? `2026-08-${day} 10:30:00` : void 0,
		auditStatus,
		auditorName: auditStatus === "pending" ? void 0 : "本地演示财务",
		auditRemark: auditStatus === "rejected" ? "LOCAL-DEMO：资料需补充后重新提交" : auditStatus === "approved" ? "LOCAL-DEMO：审核通过" : void 0,
		flowProgress: status === "completed" ? "100%" : status === "in_progress" ? "60%" : status === "pending" ? "20%" : "0%",
		currentStep: status === "completed" ? "已完成" : status === "in_progress" ? "服务办理" : "财务审核",
		taskStatus: status === "completed" ? "completed" : "processing",
		repurchaseCount: recurring ? 2 : 0,
		companyNature: id % 3 === 0 ? "一般纳税人" : "小规模纳税人",
		remarks: `LOCAL-DEMO ${status === "pending" ? "等待审核" : status === "in_progress" ? "服务办理中" : "订单记录"}，仅供本地预览。`,
		businessData: {
			taxArea: "杭州",
			serviceYear: "2026",
			materialReady: id % 2 === 0
		}
	};
}
var payments = orders.filter((item) => item.receivedAmount > 0).map((item, index) => ({
	id: 100 + index,
	orderId: item.id,
	paymentTime: item.collectionTime || "2026-08-01 10:00:00",
	amount: item.receivedAmount,
	paymentMethod: index % 2 ? "微信" : "银行转账",
	accountNumber: "LOCAL-DEMO尾号0000",
	status: "confirmed",
	remarks: "LOCAL-DEMO本地演示收款"
}));
var refunds = [
	{
		id: 201,
		orderId: 9,
		orderNo: orders[8].orderNo,
		companyName: orders[8].companyName,
		refundAmount: 1800,
		reason: "LOCAL-DEMO：客户服务范围调整",
		status: "pending",
		salesmanName: orders[8].salesmanName,
		createTime: "2026-08-10 14:20:00"
	},
	{
		id: 202,
		orderId: 4,
		orderNo: orders[3].orderNo,
		companyName: orders[3].companyName,
		refundAmount: 600,
		reason: "LOCAL-DEMO：业务项目取消",
		status: "approved",
		salesmanName: orders[3].salesmanName,
		reviewerName: "本地演示主管",
		reviewTime: "2026-08-10 16:10:00",
		reviewComment: "同意退费",
		createTime: "2026-08-10 15:02:00"
	},
	{
		id: 203,
		orderId: 6,
		orderNo: orders[5].orderNo,
		companyName: orders[5].companyName,
		refundAmount: 500,
		reason: "LOCAL-DEMO：客户重复支付",
		status: "completed",
		salesmanName: orders[5].salesmanName,
		reviewerName: "本地演示主管",
		reviewTime: "2026-08-09 11:00:00",
		reviewComment: "财务已原路退回",
		completedTime: "2026-08-09 15:00:00",
		createTime: "2026-08-09 09:30:00"
	}
];
var contracts = [
	demoContract(301, "LOCAL-DEMO-CONTRACT-001", 1, "本地演示·云舟科技有限公司", "executing", "2027-01-31", "normal"),
	demoContract(302, "LOCAL-DEMO-CONTRACT-002", 6, "本地演示·辰光财税咨询有限公司", "executing", "2026-08-26", "currentRenewal"),
	demoContract(303, "LOCAL-DEMO-CONTRACT-003", 7, "本地演示·知行企业咨询有限公司", "executing", "2026-07-31", "t2OverdueRenewal"),
	demoContract(304, "LOCAL-DEMO-CONTRACT-004", 9, "本地演示·和序企业服务有限公司", "terminated", "2026-06-30", "lossCustomer"),
	demoContract(305, "LOCAL-DEMO-CONTRACT-005", 13, "本地演示·云栖商务有限公司", "executing", "2026-10-31", "t6ExpectedRenewal"),
	demoContract(306, "LOCAL-DEMO-CONTRACT-006", 3, "本地演示·青禾文化有限公司", "executing", "2026-05-31", "t3OverdueCustomer"),
	demoContract(307, "LOCAL-DEMO-CONTRACT-007", 12, "本地演示·序章供应链有限公司", "executing", "2026-07-15", "lossAudit")
];
function demoContract(id, contractNo, orderId, companyName, status, expireDate, renewalStatus) {
	var _orders$find;
	return {
		id,
		contractNo,
		orderId,
		orderNo: (_orders$find = orders.find((item) => item.id === orderId)) === null || _orders$find === void 0 ? void 0 : _orders$find.orderNo,
		companyName,
		salesmanId: orderId % 2 ? 9001 : 9002,
		salesmanName: orderId % 2 ? "本地演示销售甲" : "本地演示销售乙",
		deptId: orderId % 2 ? 901 : 902,
		servicePersonId: 9004,
		servicePersonName: "本地演示会计",
		financeDirectorName: "本地演示财税主管",
		financeAdvisorName: "本地演示财税顾问",
		accountantName: "本地演示主办会计",
		serviceStaffJson: JSON.stringify([{
			role: "财税主管",
			name: "本地演示财税主管"
		}, {
			role: "主办会计",
			name: "本地演示主办会计"
		}]),
		contractAmount: 9600 + id % 4 * 1200,
		paidAmount: 9600,
		signDate: "2026-02-01",
		expireDate,
		contractStatus: status,
		lossFlag: status === "terminated" ? 1 : 0,
		lossReason: status === "terminated" ? "LOCAL-DEMO：客户业务停止" : void 0,
		backupFlag: 0,
		payType: "annual",
		giftMonth: id % 3,
		enterpriseNature: id % 2 ? "小规模纳税人" : "一般纳税人",
		customerSource: "LOCAL-DEMO转介绍",
		signerName: "本地演示签约人",
		productName: "代理记账年度服务",
		renewalStatus,
		totalSpending: 18e3 + id * 10,
		customerOrderCount: 2 + id % 3,
		referralCount: id % 3,
		followupCount: 5 + id % 4,
		collectionCount: 2,
		serviceMonths: 12,
		enterpriseLevel: [
			"A",
			"B",
			"C"
		][id % 3],
		businessTag: "重点续费",
		relatedCompanyName: id % 2 ? "LOCAL-DEMO关联企业" : "",
		relatedStatus: id % 2 ? "已关联" : "无",
		weworkGroupBound: id % 2,
		manualBusinessTag: "LOCAL-DEMO本地演示",
		createTime: "2026-02-01 10:00:00",
		remarks: "仅用于本地功能预览"
	};
}
var renewals = [{
	id: 401,
	contractId: 301,
	renewalDate: "2026-07-18",
	startDate: "2026-08-01",
	expireDate: "2027-07-31",
	amount: 9600,
	giftMonth: 1,
	payType: "annual",
	operatorName: "本地演示会计",
	remark: "LOCAL-DEMO年度续费"
}, {
	id: 402,
	contractId: 302,
	renewalDate: "2026-07-25",
	startDate: "2026-08-27",
	expireDate: "2027-08-26",
	amount: 10800,
	giftMonth: 0,
	payType: "annual",
	operatorName: "本地演示会计"
}];
var contractChanges = [{
	id: 501,
	contractId: 301,
	changeType: "create",
	changeDesc: "LOCAL-DEMO建立代理记账合同",
	operatorName: "本地演示销售甲",
	createTime: "2026-02-01 10:00:00"
}, {
	id: 502,
	contractId: 301,
	changeType: "staff",
	changeDesc: "分配主办会计：本地演示主办会计",
	operatorName: "本地演示主管",
	createTime: "2026-02-02 09:20:00"
}];
var handovers = [{
	id: 601,
	sourceStaffName: "本地演示会计A",
	targetStaffName: "本地演示会计",
	serviceRole: "主办会计",
	contractCount: 3,
	status: "completed",
	operatorName: "本地演示主管",
	createTime: "2026-08-01 11:20:00"
}];
function paginate(list, params) {
	const current = Number(params.pageNum || 1);
	const size = Number(params.pageSize || 20);
	return {
		records: structuredClone(list.slice((current - 1) * size, current * size)),
		total: list.length,
		current,
		size,
		pages: Math.ceil(list.length / size)
	};
}
function matchesOrder(item, params) {
	const keyword = String(params.keyword || "").trim().toLowerCase();
	if (keyword && ![
		item.orderNo,
		item.companyName,
		item.contacts,
		item.contactPhone
	].some((value) => String(value || "").toLowerCase().includes(keyword))) return false;
	if (params.status && item.status !== params.status) return false;
	if (params.businessType && item.businessType !== params.businessType) return false;
	if (params.salesmanId && item.salesmanId !== Number(params.salesmanId)) return false;
	if (params.customerSource && item.customerSource !== params.customerSource) return false;
	if (params.auditStatus && item.auditStatus !== params.auditStatus) return false;
	if (params.startDate && item.orderDate < params.startDate) return false;
	if (params.endDate && item.orderDate > params.endDate) return false;
	return true;
}
function logFor(orderId, desc) {
	operationLogs.unshift({
		id: Date.now(),
		orderId,
		operationType: "demo",
		operationDesc: desc,
		operatorName: "本地演示操作人",
		createTime: (/* @__PURE__ */ new Date()).toISOString()
	});
}
var operationLogs = orders.flatMap((order) => [{
	id: order.id * 10,
	orderId: order.id,
	operationType: "create",
	operationDesc: "创建订单",
	operatorName: order.salesmanName,
	createTime: order.createTime
}, {
	id: order.id * 10 + 1,
	orderId: order.id,
	operationType: "submit",
	operationDesc: "提交财务审核",
	operatorName: order.salesmanName,
	createTime: order.createTime
}]);
//#endregion
//#region src/views/feige-order-contract/data-source.ts
var feigeOrderData = isFeigeLocalDemo() ? {
	dashboard() {
		return _asyncToGenerator(function* () {
			return {
				total: orders.length,
				inProgress: orders.filter((item) => item.status === "in_progress").length,
				completed: orders.filter((item) => item.status === "completed").length,
				refunding: orders.filter((item) => item.status === "refunding").length,
				contractAmount: orders.reduce((sum, item) => sum + item.contractAmount, 0),
				receivedAmount: orders.reduce((sum, item) => sum + item.receivedAmount, 0),
				outstandingAmount: orders.reduce((sum, item) => sum + item.outstandingAmount, 0)
			};
		})();
	},
	staffOptions() {
		return _asyncToGenerator(function* () {
			return structuredClone(staff);
		})();
	},
	orders(params) {
		return _asyncToGenerator(function* () {
			return paginate(orders.filter((item) => matchesOrder(item, params)), params);
		})();
	},
	order(id) {
		return _asyncToGenerator(function* () {
			return structuredClone(orders.find((item) => item.id === id));
		})();
	},
	createOrder(data) {
		return _asyncToGenerator(function* () {
			const id = Math.max(...orders.map((item) => item.id)) + 1;
			const salesman = staff.find((item) => item.id === data.salesmanId) || staff[0];
			orders.unshift(_objectSpread2(_objectSpread2(_objectSpread2({}, demoOrder(id, `LOCAL-DEMO-ORDER-${String(id).padStart(3, "0")}`, data.companyName, data.businessType, "pending", Number(data.contractAmount || 0), Number(data.receivedAmount || 0), salesman.name, salesman.deptName || "-", data.customerSource || data.opportunitySource || "其他", Number(data.recurring || 0))), data), {}, {
				id,
				salesmanName: salesman.name,
				teamName: salesman.deptName,
				auditStatus: "pending"
			}));
			logFor(id, "创建订单并提交财务审核");
			return id;
		})();
	},
	updateOrder(id, data) {
		return _asyncToGenerator(function* () {
			const row = orders.find((item) => item.id === id);
			if (row) Object.assign(row, data);
			logFor(id, "修改订单信息");
		})();
	},
	auditOrders(params) {
		return _asyncToGenerator(function* () {
			return paginate(orders.filter((item) => matchesOrder(item, params) && item.auditStatus !== "not_required"), params);
		})();
	},
	auditOrder(id, data) {
		return _asyncToGenerator(function* () {
			const row = orders.find((item) => item.id === id);
			if (row) {
				row.auditStatus = data.result;
				row.auditRemark = data.remark;
				row.auditorName = "本地演示财务";
				row.auditTime = (/* @__PURE__ */ new Date()).toISOString();
				if (data.result === "rejected") row.status = "rejected";
			}
			logFor(id, data.result === "approved" ? "财务审核通过" : "财务审核驳回");
		})();
	},
	rejectOrder(id, reason) {
		return _asyncToGenerator(function* () {
			const row = orders.find((item) => item.id === id);
			if (row) {
				row.status = "rejected";
				row.auditRemark = reason;
			}
			logFor(id, `驳回订单：${reason}`);
		})();
	},
	confirmOrder(id) {
		return _asyncToGenerator(function* () {
			const row = orders.find((item) => item.id === id);
			if (row) {
				row.status = "in_progress";
				row.currentStep = "服务办理";
				row.flowProgress = "40%";
			}
			logFor(id, "确认订单并进入办理");
		})();
	},
	completeOrder(id) {
		return _asyncToGenerator(function* () {
			const row = orders.find((item) => item.id === id);
			if (row) {
				row.status = "completed";
				row.currentStep = "已完成";
				row.flowProgress = "100%";
			}
			logFor(id, "完成订单");
		})();
	},
	steps(id) {
		return _asyncToGenerator(function* () {
			const row = orders.find((item) => item.id === id);
			return [
				"财务审核",
				"资料交接",
				"服务办理",
				"交付确认"
			].map((name, index) => ({
				id: id * 10 + index,
				orderId: id,
				stepNo: index + 1,
				stepName: name,
				status: row.status === "completed" || index < (row.status === "in_progress" ? 2 : 1) ? "completed" : index === (row.status === "in_progress" ? 2 : 1) ? "processing" : "pending",
				assigneeName: index === 0 ? "本地演示财务" : "本地演示服务人",
				completedTime: index < 1 ? row.createTime : void 0
			}));
		})();
	},
	payments(id) {
		return _asyncToGenerator(function* () {
			return structuredClone(payments.filter((item) => item.orderId === id));
		})();
	},
	addPayment(id, data) {
		return _asyncToGenerator(function* () {
			const row = orders.find((item) => item.id === id);
			const amount = Math.min(Number(data.amount || 0), row.outstandingAmount);
			row.receivedAmount += amount;
			row.outstandingAmount = Math.max(0, row.contractAmount - row.receivedAmount);
			row.collectionTime = data.paymentTime || (/* @__PURE__ */ new Date()).toISOString();
			payments.unshift({
				id: Date.now(),
				orderId: id,
				paymentTime: row.collectionTime,
				amount,
				paymentMethod: data.paymentMethod,
				accountNumber: data.accountNumber,
				status: "confirmed",
				voucher: data.voucher,
				remarks: data.remarks
			});
			logFor(id, `登记收款 ¥${amount.toFixed(2)}`);
			return Date.now();
		})();
	},
	logs(id) {
		return _asyncToGenerator(function* () {
			return structuredClone(operationLogs.filter((item) => item.orderId === id));
		})();
	},
	unreceived(params) {
		return _asyncToGenerator(function* () {
			return paginate(orders.filter((item) => item.outstandingAmount > 0 && matchesOrder(item, params)), params);
		})();
	},
	refunds(params) {
		return _asyncToGenerator(function* () {
			const keyword = String(params.keyword || "").toLowerCase();
			return paginate(refunds.filter((item) => (!keyword || `${item.orderNo}${item.companyName}`.toLowerCase().includes(keyword)) && (!params.status || item.status === params.status)), params);
		})();
	},
	applyRefund(orderId, data) {
		return _asyncToGenerator(function* () {
			const order = orders.find((item) => item.id === orderId);
			const id = Date.now();
			refunds.unshift({
				id,
				orderId,
				orderNo: order.orderNo,
				companyName: order.companyName,
				refundAmount: data.refundAmount,
				reason: data.reason,
				status: "pending",
				salesmanName: order.salesmanName,
				createTime: (/* @__PURE__ */ new Date()).toISOString()
			});
			order.status = "refunding";
			logFor(orderId, "提交退费申请");
			return id;
		})();
	},
	approveRefund(id, comment) {
		return _asyncToGenerator(function* () {
			const row = refunds.find((item) => item.id === id);
			if (row) {
				row.status = "approved";
				row.reviewerName = "本地演示主管";
				row.reviewComment = comment;
				row.reviewTime = (/* @__PURE__ */ new Date()).toISOString();
			}
		})();
	},
	rejectRefund(id, comment) {
		return _asyncToGenerator(function* () {
			const row = refunds.find((item) => item.id === id);
			if (row) {
				row.status = "rejected";
				row.reviewerName = "本地演示主管";
				row.reviewComment = comment;
				row.reviewTime = (/* @__PURE__ */ new Date()).toISOString();
			}
		})();
	},
	completeRefund(id, comment) {
		return _asyncToGenerator(function* () {
			const row = refunds.find((item) => item.id === id);
			if (row) {
				row.status = "completed";
				row.reviewComment = comment;
				row.completedTime = (/* @__PURE__ */ new Date()).toISOString();
				const order = orders.find((item) => item.id === row.orderId);
				if (order) {
					order.receivedAmount = Math.max(0, order.receivedAmount - row.refundAmount);
					order.outstandingAmount = Math.max(0, order.contractAmount - order.receivedAmount);
					order.status = "in_progress";
				}
			}
		})();
	},
	contracts(params) {
		return _asyncToGenerator(function* () {
			const keyword = String(params.keyword || "").toLowerCase();
			return paginate(contracts.filter((item) => (!keyword || `${item.contractNo}${item.orderNo}${item.companyName}`.toLowerCase().includes(keyword)) && (!params.status || item.contractStatus === params.status) && (!params.view || item.renewalStatus === params.view)), params);
		})();
	},
	contract(id) {
		return _asyncToGenerator(function* () {
			return structuredClone(contracts.find((item) => item.id === id));
		})();
	},
	contractRenewals(id) {
		return _asyncToGenerator(function* () {
			return structuredClone(renewals.filter((item) => item.contractId === id));
		})();
	},
	contractChanges(id) {
		return _asyncToGenerator(function* () {
			return structuredClone(contractChanges.filter((item) => item.contractId === id));
		})();
	},
	createContract(data) {
		return _asyncToGenerator(function* () {
			const id = Math.max(...contracts.map((item) => item.id)) + 1;
			contracts.unshift(_objectSpread2(_objectSpread2(_objectSpread2({}, demoContract(id, `LOCAL-DEMO-CONTRACT-${id}`, data.orderId || 1, data.companyName, data.contractStatus || "draft", data.expireDate || "2027-08-31", data.renewalStatus || "normal")), data), {}, { id }));
			return id;
		})();
	},
	updateContract(id, data) {
		return _asyncToGenerator(function* () {
			const row = contracts.find((item) => item.id === id);
			if (row) Object.assign(row, data);
		})();
	},
	renewContract(id, data) {
		return _asyncToGenerator(function* () {
			const row = contracts.find((item) => item.id === id);
			const renewalId = Date.now();
			renewals.unshift({
				id: renewalId,
				contractId: id,
				renewalDate: (/* @__PURE__ */ new Date()).toISOString(),
				startDate: data.startDate,
				expireDate: data.expireDate,
				amount: Number(data.amount || 0),
				giftMonth: data.giftMonth,
				payType: data.payType,
				operatorName: "本地演示操作人",
				remark: data.remark
			});
			row.expireDate = data.expireDate || row.expireDate;
			row.renewalStatus = "normal";
			row.contractStatus = "executing";
			return renewalId;
		})();
	},
	terminateContract(id, reason) {
		return _asyncToGenerator(function* () {
			const row = contracts.find((item) => item.id === id);
			if (row) {
				row.contractStatus = "terminated";
				row.lossFlag = 1;
				row.lossReason = reason;
				row.renewalStatus = "lossCustomer";
			}
		})();
	},
	restoreContract(id, _reason) {
		return _asyncToGenerator(function* () {
			const row = contracts.find((item) => item.id === id);
			if (row) {
				row.contractStatus = "executing";
				row.lossFlag = 0;
				row.lossReason = "";
				row.renewalStatus = "normal";
			}
		})();
	},
	handoverPreview(data) {
		return _asyncToGenerator(function* () {
			return structuredClone(contracts.filter((item) => item.servicePersonId === Number(data.sourceStaffId) || !data.sourceStaffId));
		})();
	},
	handover(data) {
		return _asyncToGenerator(function* () {
			var _staff$find;
			const preview = contracts.filter((item) => item.servicePersonId === Number(data.sourceStaffId) || !data.sourceStaffId);
			const target = staff.find((item) => item.id === Number(data.targetStaffId)) || staff[3];
			preview.forEach((item) => {
				item.servicePersonId = target.id;
				item.servicePersonName = target.name;
			});
			const id = Date.now();
			handovers.unshift({
				id,
				sourceStaffName: ((_staff$find = staff.find((item) => item.id === Number(data.sourceStaffId))) === null || _staff$find === void 0 ? void 0 : _staff$find.name) || "未指定",
				targetStaffName: target.name,
				serviceRole: data.serviceRole || "主办会计",
				contractCount: preview.length,
				status: "completed",
				operatorName: "本地演示主管",
				createTime: (/* @__PURE__ */ new Date()).toISOString()
			});
			return id;
		})();
	},
	handoverHistory() {
		return _asyncToGenerator(function* () {
			return structuredClone(handovers);
		})();
	},
	revokeHandover(id) {
		return _asyncToGenerator(function* () {
			const row = handovers.find((item) => item.id === id);
			if (row) {
				row.status = "revoked";
				row.revokedTime = (/* @__PURE__ */ new Date()).toISOString();
			}
		})();
	}
} : feigeOrderApi;
//#endregion
export { feigeOrderData as t };
