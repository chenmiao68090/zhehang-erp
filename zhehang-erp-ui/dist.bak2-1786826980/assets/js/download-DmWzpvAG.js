import { V as _asyncToGenerator } from "./vendor-Cuzsyfny.js";
import { o as ElMessage } from "./vendor-element-plus-CqO9XRGg.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
//#region src/utils/download.ts
function downloadBlob(data, filename, type = "text/csv;charset=utf-8;") {
	const blob = data instanceof Blob ? data : new Blob([data], { type });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}
/**
* 统一的"按文件ID下载"助手。
* 后端 /file/info/download/{id} 需要 Bearer token,裸链接/window.open 会 401。
* 这里走 axios(自动带 token)拿到 Blob,再用 <a download> 触发保存。
* @param id       文件ID
* @param filename 建议的保存文件名(附件记录一般都有 fileName;缺省用 file_{id})
*/
function downloadFileById(_x, _x2) {
	return _downloadFileById.apply(this, arguments);
}
function _downloadFileById() {
	_downloadFileById = _asyncToGenerator(function* (id, filename) {
		if (id === void 0 || id === null || id === "") return;
		try {
			downloadBlob(yield fileInfoApi.download(Number(id)), filename || `file_${id}`);
		} catch (e) {
			ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "文件下载失败");
		}
	});
	return _downloadFileById.apply(this, arguments);
}
/**
* 取某文件的临时 object URL,供 <img> 预览用。
* 注意:调用方在不再使用时应 URL.revokeObjectURL(url) 释放,避免内存泄漏。
* @returns object URL 字符串;失败返回空串。
*/
function objectUrlForFile(_x3) {
	return _objectUrlForFile.apply(this, arguments);
}
function _objectUrlForFile() {
	_objectUrlForFile = _asyncToGenerator(function* (id) {
		if (id === void 0 || id === null || id === "") return "";
		try {
			const blob = yield fileInfoApi.download(Number(id));
			return URL.createObjectURL(blob);
		} catch (_unused) {
			return "";
		}
	});
	return _objectUrlForFile.apply(this, arguments);
}
//#endregion
export { downloadFileById as n, objectUrlForFile as r, downloadBlob as t };
