import { Q as createBlock, Tt as openBlock, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { t as audit_task_list_default } from "./audit-task-list-BqFGfasG.js";
//#endregion
//#region src/views/task-workbench/recurring-task.vue
var recurring_task_default = /* @__PURE__ */ defineComponent({
	__name: "recurring-task",
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createBlock(audit_task_list_default, {
				"task-type": "recurring",
				title: "周期任务",
				description: "按服务周期审核持续性交付，重点查看起止月份、费用和当前流程节点。"
			});
		};
	}
});
//#endregion
export { recurring_task_default as default };
