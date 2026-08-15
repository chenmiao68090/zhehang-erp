import { St as onMounted, V as _asyncToGenerator, X as computed, Xt as ref, g as _objectSpread2 } from "./vendor-Cuzsyfny.js";
import { n as unwrapGovernanceData, t as settingsGovernanceApi } from "./settings-governance-qdMEMNS_.js";
//#region src/composables/useFieldOptions.ts
function normalizeFallback(fallback) {
	return fallback.map((item) => typeof item === "string" ? {
		label: item,
		value: item,
		defaultValue: false
	} : _objectSpread2({ defaultValue: false }, item));
}
/**
* 业务下拉统一读取字段治理目录。
*
* - configured=true 时，后端返回的列表就是唯一结果；启用项供新选择，停用项只供历史回显；
* - configured=false（含后端已精确识别的缺表兼容）时，才使用调用页已有常量；
* - 网络、权限或未知服务错误一律失败收紧，不把旧常量冒充成当前配置；
* - 这里只消费选项，不在业务页提供修改入口。
*/
function useFieldOptions(dictType, fallback, options = {}) {
	const fallbackOptions = normalizeFallback(fallback);
	const fieldOptions = ref([]);
	const disabledOptions = ref([]);
	const loading = ref(false);
	const resolved = ref(false);
	const configured = ref(false);
	const fallbackReason = ref(null);
	let requestVersion = 0;
	function load() {
		return _load.apply(this, arguments);
	}
	function _load() {
		_load = _asyncToGenerator(function* () {
			const version = ++requestVersion;
			let catalogResolved = false;
			loading.value = true;
			resolved.value = false;
			configured.value = false;
			fieldOptions.value = [];
			disabledOptions.value = [];
			fallbackReason.value = null;
			try {
				const payload = unwrapGovernanceData(yield settingsGovernanceApi.options(dictType, true));
				if (version !== requestVersion) return;
				catalogResolved = true;
				configured.value = payload.configured === true;
				if (payload.configured === true) {
					const mapped = (payload.items || []).map((item) => ({
						label: item.label,
						value: item.value,
						defaultValue: item.defaultValue === true,
						disabled: item.enabled !== true
					}));
					fieldOptions.value = mapped.filter((item) => !item.disabled);
					disabledOptions.value = mapped.filter((item) => item.disabled);
					fallbackReason.value = null;
				} else {
					fieldOptions.value = [...fallbackOptions];
					disabledOptions.value = [];
					fallbackReason.value = "unconfigured";
				}
			} catch (_unused) {
				if (version !== requestVersion) return;
				configured.value = false;
				fieldOptions.value = [];
				disabledOptions.value = [];
				fallbackReason.value = "request-error";
			} finally {
				if (version === requestVersion) {
					loading.value = false;
					resolved.value = catalogResolved;
				}
			}
		});
		return _load.apply(this, arguments);
	}
	const defaultValue = computed(() => {
		var _fieldOptions$value$f, _fieldOptions$value$f2;
		return (_fieldOptions$value$f = (_fieldOptions$value$f2 = fieldOptions.value.find((item) => item.defaultValue)) === null || _fieldOptions$value$f2 === void 0 ? void 0 : _fieldOptions$value$f2.value) !== null && _fieldOptions$value$f !== void 0 ? _fieldOptions$value$f : null;
	});
	/**
	* 把当前记录中已停用/已删除的稳定值追加为禁用项，仅供 Element Plus 正确回显。
	* 未完成目录判定时保持空，避免把“尚未加载”误判为“历史值”。
	*/
	function withHistoricalValues(current) {
		if (!resolved.value) return [];
		const values = (Array.isArray(current) ? current : [current]).map((value) => String(value !== null && value !== void 0 ? value : "").trim()).filter(Boolean);
		const known = new Set(fieldOptions.value.map((item) => item.value));
		const disabledByValue = new Map(disabledOptions.value.map((item) => [item.value, item]));
		const historical = [...new Set(values)].filter((value) => !known.has(value)).map((value) => {
			const disabled = disabledByValue.get(value);
			return disabled ? _objectSpread2(_objectSpread2({}, disabled), {}, {
				disabled: true,
				historical: true
			}) : {
				label: `${value}（历史值，当前不可选）`,
				value,
				defaultValue: false,
				disabled: true,
				historical: true
			};
		});
		return [...fieldOptions.value, ...historical];
	}
	function isSelectable(value) {
		if (!value) return true;
		return resolved.value && fieldOptions.value.some((item) => item.value === value && !item.disabled);
	}
	if (options.autoLoad !== false) onMounted(load);
	return {
		options: fieldOptions,
		disabledOptions,
		loading,
		resolved,
		configured,
		defaultValue,
		fallbackReason,
		usingFallback: computed(() => fallbackReason.value === "unconfigured"),
		withHistoricalValues,
		isSelectable,
		reload: load
	};
}
//#endregion
export { useFieldOptions as t };
