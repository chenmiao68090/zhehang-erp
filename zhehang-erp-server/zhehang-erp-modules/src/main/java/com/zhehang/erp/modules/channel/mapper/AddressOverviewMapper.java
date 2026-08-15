package com.zhehang.erp.modules.channel.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 地址资源总览(只读聚合)Mapper。
 *
 * <p>数据源为渠道模块的挂靠地址资源表 {@code biz_address_resource}(实体 {@link
 * com.zhehang.erp.modules.channel.domain.BizAddressResource})。该表以 {@code region}(所属区域)
 * 作为行政区维度,没有独立的省/市/区层级字段,因此按 region 分组统计。</p>
 *
 * <p>本 Mapper 全为只读 {@code @Select} 聚合,不修改任何既有的
 * {@code BizAddressResourceMapper}/{@code IBizChannelService} 等业务文件。</p>
 *
 * <p>租户隔离:表含 {@code tenant_id} 列且不在忽略列表,MyBatis-Plus 的
 * {@code TenantLineInnerInterceptor} 会自动为下列 SQL 追加 {@code tenant_id = ?}。
 * 逻辑删除不会被自动拼接到裸 SQL,故各语句显式加 {@code deleted = 0}。</p>
 */
@Mapper
public interface AddressOverviewMapper {

    /**
     * 按行政区(所属区域 region)分组统计托管地址数量。
     * NULL / 空区域归并为 "未分区"。
     */
    @Select("SELECT COALESCE(NULLIF(TRIM(region), ''), '未分区') AS area, COUNT(*) AS count "
            + "FROM biz_address_resource "
            + "WHERE deleted = 0 "
            + "GROUP BY COALESCE(NULLIF(TRIM(region), ''), '未分区') "
            + "ORDER BY count DESC, area ASC")
    List<Map<String, Object>> countByArea();

    /**
     * 某行政区下的地址清单。area 为 "未分区" 时匹配 region 为空/NULL 的记录;
     * area 为空则不限区域(全量)。
     */
    @Select("<script>"
            + "SELECT id, resource_no AS resourceNo, address, region, status, "
            + "       supplier_id AS supplierId, customer_id AS customerId, contract_id AS contractId, "
            + "       purchase_price AS purchasePrice, suggested_price AS suggestedPrice, "
            + "       stock_in_date AS stockInDate, sold_date AS soldDate, expire_date AS expireDate, "
            + "       create_time AS createTime "
            + "FROM biz_address_resource "
            + "WHERE deleted = 0 "
            + "<if test=\"status != null and status != ''\"> AND status = #{status} </if>"
            + "<if test=\"area != null and area != ''\">"
            + "  <choose>"
            + "    <when test=\"area == '未分区'\"> AND (region IS NULL OR TRIM(region) = '') </when>"
            + "    <otherwise> AND region = #{area} </otherwise>"
            + "  </choose>"
            + "</if>"
            + "ORDER BY create_time DESC"
            + "</script>")
    List<Map<String, Object>> listByArea(@Param("area") String area, @Param("status") String status);

    /**
     * 按状态统计地址数量(用于总量/已用/空闲汇总)。
     */
    @Select("SELECT COALESCE(NULLIF(TRIM(status), ''), 'unknown') AS status, COUNT(*) AS count "
            + "FROM biz_address_resource "
            + "WHERE deleted = 0 "
            + "GROUP BY COALESCE(NULLIF(TRIM(status), ''), 'unknown')")
    List<Map<String, Object>> countByStatus();
}
