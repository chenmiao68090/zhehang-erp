import { Q as createBlock, Tt as openBlock, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { t as audit_task_list_default } from "./audit-task-list-BqFGfasG.js";
//#endregion
//#region src/views/task-workbench/special-task.vue
var special_task_default = /* @__PURE__ */ defineComponent({
	__name: "special-task",
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createBlock(audit_task_list_default, {
				"task-type": "special",
				title: "专项任务",
				description: "处理疑难工商等专项交付，可审核任务并按实际分工调整工商专员。"
			});
		};
	}
});
//#endregion
export { special_task_default as default };
