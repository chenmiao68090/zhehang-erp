import { i as put, n as get, r as post, s as service, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/file.ts
var fileFolderApi = {
	tree: () => get("/file/folder/tree"),
	create: (data) => post("/file/folder", data),
	rename: (data) => put("/file/folder", data),
	remove: (id) => del(`/file/folder/${id}`),
	move: (id, targetParentId) => put("/file/folder/move", null, { params: {
		id,
		targetParentId
	} })
};
var fileInfoApi = {
	list: (params) => get("/file/info/list", params),
	upload: (file, folderId, options) => {
		const formData = new FormData();
		formData.append("file", file);
		if (folderId) formData.append("folderId", String(folderId));
		return service.post("/file/info/upload", formData, {
			headers: { "Content-Type": "multipart/form-data" },
			silentError: !!(options === null || options === void 0 ? void 0 : options.silentError)
		});
	},
	download: (id) => get(`/file/info/download/${id}`, null, { responseType: "blob" }),
	preview: (id) => get(`/file/info/preview/${id}`),
	remove: (id) => del(`/file/info/${id}`),
	move: (id, targetFolderId) => put("/file/info/move", null, { params: {
		id,
		targetFolderId
	} }),
	rename: (id, newName) => put(`/file/info/rename/${id}`, null, { params: { newName } }),
	versions: (id) => get(`/file/info/versions/${id}`),
	uploadVersion: (id, file, changeLog) => {
		const formData = new FormData();
		formData.append("file", file);
		if (changeLog) formData.append("changeLog", changeLog);
		return service.post(`/file/info/upload-version/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
	},
	recycle: (params) => get("/file/info/recycle", params),
	restore: (id) => put(`/file/info/restore/${id}`),
	permanentDelete: (id) => del(`/file/info/permanent/${id}`),
	search: (params) => get("/file/info/search", params)
};
var kbCategoryApi = {
	tree: () => get("/kb/category/tree"),
	create: (data) => post("/kb/category", data),
	update: (data) => put("/kb/category", data),
	remove: (id) => del(`/kb/category/${id}`)
};
var kbArticleApi = {
	list: (params) => get("/kb/article/list", params),
	detail: (id) => get(`/kb/article/${id}`),
	create: (data) => post("/kb/article", data),
	update: (data) => put("/kb/article", data),
	remove: (id) => del(`/kb/article/${id}`),
	publish: (id) => put(`/kb/article/publish/${id}`),
	archive: (id) => put(`/kb/article/archive/${id}`),
	recent: (params) => get("/kb/article/recent", params),
	hot: (params) => get("/kb/article/hot", params),
	like: (id) => post(`/kb/article/like/${id}`)
};
//#endregion
export { kbCategoryApi as i, fileInfoApi as n, kbArticleApi as r, fileFolderApi as t };
