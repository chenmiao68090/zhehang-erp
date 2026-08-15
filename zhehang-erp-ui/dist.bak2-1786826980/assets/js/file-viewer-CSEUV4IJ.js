import { V as _asyncToGenerator } from "./vendor-Cuzsyfny.js";
import { o as ElMessage } from "./vendor-element-plus-CqO9XRGg.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
//#region src/utils/file-viewer.ts
var imageExts = [
	"jpg",
	"jpeg",
	"png",
	"webp",
	"gif",
	"bmp",
	"heic",
	"heif",
	"tif",
	"tiff"
];
var attachmentName = (file) => (file === null || file === void 0 ? void 0 : file.fileName) || (file === null || file === void 0 ? void 0 : file.originalName) || (file === null || file === void 0 ? void 0 : file.name) || "附件";
var attachmentId = (file) => {
	var _file$fileId;
	const raw = (_file$fileId = file === null || file === void 0 ? void 0 : file.fileId) !== null && _file$fileId !== void 0 ? _file$fileId : file === null || file === void 0 ? void 0 : file.id;
	const id = Number(raw);
	return Number.isFinite(id) && id > 0 ? id : void 0;
};
var extOf = (name) => {
	const clean = name.split("?")[0].split("#")[0];
	const dot = clean.lastIndexOf(".");
	return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : "";
};
var typeOf = (name, mimeType = "") => {
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType === "application/pdf") return "pdf";
	const ext = extOf(name);
	if (imageExts.includes(ext)) return "image";
	if (ext === "pdf") return "pdf";
	return "other";
};
var sniffBlob = function() {
	var _ref = _asyncToGenerator(function* (blob) {
		const bytes = new Uint8Array(yield blob.slice(0, 16).arrayBuffer());
		if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return {
			type: "image",
			mimeType: "image/jpeg"
		};
		if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return {
			type: "image",
			mimeType: "image/png"
		};
		if (bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70) return {
			type: "pdf",
			mimeType: "application/pdf"
		};
		if (bytes[0] === 71 && bytes[1] === 73 && bytes[2] === 70) return {
			type: "image",
			mimeType: "image/gif"
		};
		if (bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70 && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80) return {
			type: "image",
			mimeType: "image/webp"
		};
		return { type: "other" };
	});
	return function sniffBlob(_x) {
		return _ref.apply(this, arguments);
	};
}();
var createAttachmentPreview = function() {
	var _ref2 = _asyncToGenerator(function* (file) {
		const id = attachmentId(file);
		if (!id) {
			ElMessage.warning("这个附件缺少文件编号，暂时不能预览");
			return null;
		}
		const blob = yield fileInfoApi.download(id);
		const title = attachmentName(file);
		const sniffed = yield sniffBlob(blob);
		const mimeType = blob.type && blob.type !== "application/octet-stream" ? blob.type : sniffed.mimeType || "";
		const previewType = sniffed.type !== "other" ? sniffed.type : typeOf(title, mimeType);
		const previewBlob = mimeType && mimeType !== blob.type ? new Blob([blob], { type: mimeType }) : blob;
		return {
			url: URL.createObjectURL(previewBlob),
			type: previewType,
			title,
			mimeType,
			file
		};
	});
	return function createAttachmentPreview(_x2) {
		return _ref2.apply(this, arguments);
	};
}();
var downloadAttachment = function() {
	var _ref3 = _asyncToGenerator(function* (file) {
		const id = attachmentId(file);
		if (!id) {
			ElMessage.warning("这个附件缺少文件编号，暂时不能下载");
			return;
		}
		const blob = yield fileInfoApi.download(id);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = attachmentName(file);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(() => URL.revokeObjectURL(url), 300);
	});
	return function downloadAttachment(_x3) {
		return _ref3.apply(this, arguments);
	};
}();
//#endregion
export { downloadAttachment as n, createAttachmentPreview as t };
