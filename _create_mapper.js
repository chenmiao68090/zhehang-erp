const fs = require('fs');
const path = require('path');
const dir = 'd:/zhehang-erp/zhehang-erp-server/zhehang-erp-modules/src/main/resources/mapper/system';
fs.mkdirSync(dir, { recursive: true });

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">\n<mapper namespace="com.zhehang.erp.modules.system.mapper.SysUserMapper">\n\n    <select id="selectPermsByUserId" resultType="java.lang.String">\n        SELECT DISTINCT m.perms\n        FROM sys_menu m\n        INNER JOIN sys_role_menu rm ON rm.menu_id = m.id\n        INNER JOIN sys_user_role ur ON ur.role_id = rm.role_id\n        WHERE ur.user_id = #{userId}\n          AND m.perms IS NOT NULL\n          AND m.perms != \'\'\n          AND m.deleted = 0\n    </select>\n\n    <select id="selectRoleIdsByUserId" resultType="java.lang.Long">\n        SELECT role_id FROM sys_user_role WHERE user_id = #{userId}\n    </select>\n\n</mapper>\n';

fs.writeFileSync(path.join(dir, 'SysUserMapper.xml'), xml, 'utf8');
console.log('Created SysUserMapper.xml');
