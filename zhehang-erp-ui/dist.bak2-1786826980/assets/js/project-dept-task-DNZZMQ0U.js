import { Q as createBlock, Tt as openBlock, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { t as audit_task_list_default } from "./audit-task-list-BqFGfasG.js";
//#endregion
//#region src/views/task-workbench/project-dept-task.vue
var project_dept_task_default = /* @__PURE__ */ defineComponent({
	__name: "project-dept-task",
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createBlock(audit_task_list_default, {
				"task-type": "project_dept",
				title: "项目部门任务",
				description: "按项目部门和项目负责人审核跨部门交付，保留完整订单与流程追溯。"
			});
		};
	}
});
//#endregion
export { project_dept_task_default as default };
