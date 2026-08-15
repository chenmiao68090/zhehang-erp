import { Q as createBlock, Tt as openBlock, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { t as audit_task_list_default } from "./audit-task-list-BqFGfasG.js";
//#endregion
//#region src/views/task-workbench/one-time-task.vue
var one_time_task_default = /* @__PURE__ */ defineComponent({
	__name: "one-time-task",
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createBlock(audit_task_list_default, {
				"task-type": "once",
				title: "一次性任务",
				description: "集中审核单次交付任务，核对订单、费用、流程表单和审核记录。"
			});
		};
	}
});
//#endregion
export { one_time_task_default as default };
