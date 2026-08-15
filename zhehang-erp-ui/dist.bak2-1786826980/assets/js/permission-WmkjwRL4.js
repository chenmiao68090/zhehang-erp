import { l as useUserStore } from "./index-C4y3JnUs.js";
//#region src/utils/permission.ts
/**
* Check if current user has specified roles
*/
function hasRole(roles) {
	const userRoles = useUserStore().roles;
	const superAdmin = "admin";
	if (roles && roles.length > 0) return userRoles.some((role) => {
		return superAdmin === role || roles.includes(role);
	});
	return false;
}
//#endregion
export { hasRole as t };
