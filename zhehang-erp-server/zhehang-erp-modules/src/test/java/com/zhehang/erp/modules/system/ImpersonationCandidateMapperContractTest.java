package com.zhehang.erp.modules.system;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class ImpersonationCandidateMapperContractTest {

    @Test
    void candidateProjectionContainsOnlyIdentityDepartmentAndRoleMetadata() throws IOException {
        String xml = Files.readString(findMapper()).toLowerCase();

        assertThat(xml).contains(
                "u.id as user_id",
                "e.name",
                "d.dept_name",
                "r.role_name",
                "r.role_key",
                "u.tenant_id = #{tenantid}",
                "u.id not in (1, 3)",
                "u.status = 0",
                "u.deleted = 0",
                "e.status in (1, 2)");
        assertThat(xml).doesNotContain(
                "u.password",
                "u.phone",
                "u.email",
                "e.id_card",
                "e.phone",
                "e.email",
                "e.address",
                "e.bank",
                "e.hr_docs",
                "select u.*");
    }

    @Test
    void authenticationProjectionNeverReadsTargetCredentialsOrPii() throws IOException {
        String xml = Files.readString(findSysUserMapper()).toLowerCase();
        int start = xml.indexOf("<select id=\"selectactiveforimpersonation\"");
        int end = xml.indexOf("</select>", start);

        assertThat(start).isGreaterThanOrEqualTo(0);
        assertThat(end).isGreaterThan(start);
        String projection = xml.substring(start, end);
        assertThat(projection).contains(
                "select u.id, u.username, u.nickname, u.tenant_id, u.dept_id, u.status, u.deleted",
                "u.tenant_id = #{tenantid}",
                "u.id not in (1, 3)",
                "e.status in (1, 2)");
        assertThat(projection).doesNotContain(
                "u.password", "u.phone", "u.email", "u.avatar", "u.*",
                "e.phone", "e.email", "e.id_card", "e.bank", "e.hr_docs");
    }

    @Test
    void resignedEmployeeLoginGuardIsTenantScopedAndIgnoresDeletedArchives() throws IOException {
        String xml = Files.readString(findSysUserMapper()).toLowerCase();
        int start = xml.indexOf("<select id=\"existsresignedemployee\"");
        int end = xml.indexOf("</select>", start);

        assertThat(start).isGreaterThanOrEqualTo(0);
        assertThat(end).isGreaterThan(start);
        String query = xml.substring(start, end);
        assertThat(query).contains(
                "from org_employee e",
                "e.user_id = #{userid}",
                "e.tenant_id = #{tenantid}",
                "e.deleted = 0",
                "e.status = 3");
        assertThat(query).doesNotContain("select e.*", "sys_user_role", "sys_role");
    }

    @Test
    void expiryScanUsesApplicationClockInsteadOfDatabaseContainerTimezone() throws IOException {
        String xml = Files.readString(findMapper()).toLowerCase();
        int start = xml.indexOf("<update id=\"markexpiredsessions\"");
        int end = xml.indexOf("</update>", start);

        assertThat(start).isGreaterThanOrEqualTo(0);
        assertThat(end).isGreaterThan(start);
        String update = xml.substring(start, end);
        assertThat(update).contains("expire_time &lt;= #{now}", "update_time = #{now}");
        assertThat(update).doesNotContain("now()");
    }

    private Path findMapper() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 6 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve(
                    "zhehang-erp-server/zhehang-erp-modules/src/main/resources/mapper/system/"
                            + "SysImpersonationSessionMapper.xml");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 SysImpersonationSessionMapper.xml");
    }

    private Path findSysUserMapper() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 6 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve(
                    "zhehang-erp-server/zhehang-erp-modules/src/main/resources/mapper/system/"
                            + "SysUserMapper.xml");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 SysUserMapper.xml");
    }
}
