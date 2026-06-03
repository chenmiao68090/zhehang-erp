package com.zhehang.erp.modules.company.provider;

import com.zhehang.erp.modules.company.domain.CompanyContact;
import com.zhehang.erp.modules.company.domain.CompanyInfo;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 内置示例工商数据源（免密钥、可演示）。
 *
 * <p>默认启用。如需切换真实接口：实现一个新的 {@link CompanyDataProvider}
 * （如对接天眼查 / 企查查），并在配置中设置 {@code company.data.provider=tianyancha}，
 * 同时给本类的注解条件让位即可，前端无需改动。</p>
 *
 * <p>示例企业 id 与前端原 mock（growth.ts）保持一致（1001~1010），
 * 以便页面上"勾稽关系"等关联展示仍能对应。</p>
 */
@Component
@ConditionalOnProperty(name = "company.data.provider", havingValue = "mock", matchIfMissing = true)
public class MockCompanyDataProvider implements CompanyDataProvider {

    private final List<CompanyInfo> seed = buildSeed();

    @Override
    public List<CompanyInfo> suggest(String keyword, int limit) {
        String k = keyword.trim();
        List<CompanyInfo> result = new ArrayList<>();
        for (CompanyInfo e : seed) {
            if (contains(e.getName(), k) || contains(e.getShortName(), k)
                    || contains(e.getCreditCode(), k) || contains(e.getLegalPerson(), k)) {
                result.add(e);
                if (result.size() >= limit) {
                    break;
                }
            }
        }
        return result;
    }

    @Override
    public CompanyInfo detail(String keyword) {
        String k = keyword.trim();
        String n = norm(k);
        // 精确匹配：标准化名称相等，或信用代码相等（忽略大小写）
        Optional<CompanyInfo> exact = seed.stream()
                .filter(e -> norm(e.getName()).equals(n) || k.equalsIgnoreCase(e.getCreditCode()))
                .findFirst();
        if (exact.isPresent()) {
            return exact.get();
        }
        // 模糊匹配：名称互相包含 / 简称命中 / 信用代码包含
        return seed.stream()
                .filter(e -> contains(e.getName(), k) || contains(k, e.getShortName())
                        || contains(e.getShortName(), k) || contains(e.getCreditCode(), k))
                .findFirst().orElse(null);
    }

    @Override
    public List<CompanyInfo> all() {
        return seed;
    }

    private static boolean contains(String src, String kw) {
        return src != null && kw != null && !kw.isEmpty() && src.contains(kw);
    }

    private static String norm(String s) {
        return s == null ? "" : s.replaceAll("[()（）\\s]", "").toLowerCase();
    }

    private static CompanyContact ct(String name, String title, String phone) {
        return new CompanyContact().setName(name).setTitle(title).setPhone(phone);
    }

    private static List<CompanyInfo> buildSeed() {
        String today = LocalDate.now().toString();
        List<CompanyInfo> list = new ArrayList<>();

        list.add(new CompanyInfo().setId(1001L).setName("杭州漆园装饰工程有限公司").setShortName("漆园装饰")
                .setCreditCode("91330102MA2QY1001X").setTaxNo("91330102MA2QY1001X").setLegalPerson("林漆")
                .setRegisteredCapital("100万人民币").setEstablishDate("2019-06-18").setBusinessStatus("营业")
                .setProvince("浙江省").setCity("杭州市").setDistrict("上城区")
                .setAddress("浙江省杭州市上城区湖悦商务中心1幢108室").setIndustry("建筑装饰和装修业")
                .setCompanyType("有限责任公司").setEmployeeScale("1-1000人").setAnnualRevenue("100万以下")
                .setTaxQualification("小规模纳税人").setRiskTags(List.of("地址异常", "待解除异常"))
                .setContactCount(12).setContacts(List.of(ct("林总", "负责人", "18668973330")))
                .setSource("探迹式拓客").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1002L).setName("杭州微妃美业有限公司").setShortName("微妃美业")
                .setCreditCode("91330110MA2QY1002X").setTaxNo("91330110MA2QY1002X").setLegalPerson("黄涛")
                .setRegisteredCapital("170万人民币").setEstablishDate("2018-06-25").setBusinessStatus("营业")
                .setProvince("浙江省").setCity("杭州市").setDistrict("拱墅区")
                .setAddress("浙江省杭州市拱墅区祥符街道万达商业中心3幢2119室").setIndustry("理发及美容服务")
                .setCompanyType("有限责任公司").setEmployeeScale("50人以下").setAnnualRevenue("1万-5万")
                .setTaxQualification("小规模纳税人").setRiskTags(List.of("经营异常"))
                .setContactCount(21).setContacts(List.of(ct("黄总", "法人", "13011143334")))
                .setSource("探迹式拓客").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1003L).setName("浙江两杉生物科技有限公司").setShortName("两杉生物")
                .setCreditCode("91330108MA2QY1003X").setTaxNo("91330108MA2QY1003X").setLegalPerson("周沐")
                .setRegisteredCapital("500万人民币").setEstablishDate("2026-05-12").setBusinessStatus("存续")
                .setProvince("浙江省").setCity("杭州市").setDistrict("滨江区")
                .setAddress("浙江省杭州市滨江区长河街道生物医药园2幢801室").setIndustry("科技推广和应用服务业")
                .setCompanyType("有限责任公司").setEmployeeScale("50人以下").setAnnualRevenue("新设企业")
                .setTaxQualification("未核定").setRiskTags(List.of("T+7新企", "待税务报到"))
                .setContactCount(5).setContacts(List.of(ct("周总", "创始人", "15800331418")))
                .setSource("企业新设监控").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1004L).setName("杭州杰固机械设备有限公司").setShortName("杰固机械")
                .setCreditCode("91330104MA2QY1004X").setTaxNo("91330104MA2QY1004X").setLegalPerson("张伟")
                .setRegisteredCapital("10万人民币").setEstablishDate("2015-08-31").setBusinessStatus("异常")
                .setProvince("浙江省").setCity("杭州市").setDistrict("江干区")
                .setAddress("浙江省杭州市江干区彭埠街道云河家园商贸区配套营业用房临5幢23号").setIndustry("服装批发")
                .setCompanyType("有限责任公司").setEmployeeScale("1-1000人").setAnnualRevenue("50万-100万")
                .setTaxQualification("一般纳税人").setRiskTags(List.of("税务非正常户"))
                .setContactCount(5).setContacts(List.of(ct("张总", "法人", "17702027009")))
                .setSource("税务异常监控").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1005L).setName("杭州华烽智康科技有限公司").setShortName("华烽智康")
                .setCreditCode("91330105MA2QY1005X").setTaxNo("91330105MA2QY1005X").setLegalPerson("王文杰")
                .setRegisteredCapital("10万人民币").setEstablishDate("2024-11-07").setBusinessStatus("营业")
                .setProvince("浙江省").setCity("杭州市").setDistrict("滨江区")
                .setAddress("浙江省杭州市滨江区长河街道月明路1040号3层39547室").setIndustry("计算机、软件及辅助设备零售")
                .setCompanyType("有限责任公司").setEmployeeScale("50人以下").setAnnualRevenue("100万以下")
                .setTaxQualification("疑似小规模纳税人").setRiskTags(List.of("税务非正常户", "科技客户"))
                .setContactCount(2).setContacts(List.of(ct("王总", "负责人", "18505277788")))
                .setSource("税务异常监控").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1006L).setName("杭州世御科技有限公司萧山分公司").setShortName("世御科技")
                .setCreditCode("91330109MA2QY1006X").setTaxNo("91330109MA2QY1006X").setLegalPerson("宋明")
                .setRegisteredCapital("0万人民币").setEstablishDate("2015-11-03").setBusinessStatus("营业")
                .setProvince("浙江省").setCity("杭州市").setDistrict("萧山区")
                .setAddress("萧山区萧山经济技术开发区桥南区块鸿达路357号").setIndustry("计算机和辅助设备修理")
                .setCompanyType("分公司").setEmployeeScale("501-999人").setAnnualRevenue("100万以下")
                .setTaxQualification("疑似小规模纳税人").setRiskTags(List.of("税务非正常户"))
                .setContactCount(8).setContacts(List.of(ct("宋经理", "负责人", "18622222222")))
                .setSource("税务异常监控").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1007L).setName("杭州罗舍贸易有限公司").setShortName("罗舍贸易")
                .setCreditCode("91330109MA2QY1007X").setTaxNo("91330109MA2QY1007X").setLegalPerson("罗舍")
                .setRegisteredCapital("100万人民币").setEstablishDate("2019-08-22").setBusinessStatus("注销")
                .setProvince("浙江省").setCity("杭州市").setDistrict("萧山区")
                .setAddress("浙江省杭州市萧山区蜀山街道市心南路1038号2423室").setIndustry("服装零售")
                .setCompanyType("有限责任公司").setEmployeeScale("50人以下").setAnnualRevenue("100万以下")
                .setTaxQualification("疑似小规模纳税人").setRiskTags(List.of("简易注销", "潜在注销服务"))
                .setContactCount(4).setContacts(List.of(ct("罗总", "法人", "18633333333")))
                .setSource("工商状态监控").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1008L).setName("大连中安华瑞自动化设备有限公司").setShortName("中安华瑞")
                .setCreditCode("91210204MA2QY1008X").setTaxNo("91210204MA2QY1008X").setLegalPerson("刘安")
                .setRegisteredCapital("50万人民币").setEstablishDate("2008-12-17").setBusinessStatus("营业")
                .setProvince("辽宁省").setCity("大连市").setDistrict("甘井子区")
                .setAddress("辽宁省大连市甘井子区华东路94号").setIndustry("批发业")
                .setCompanyType("有限责任公司").setEmployeeScale("50人以下").setAnnualRevenue("100万-500万")
                .setTaxQualification("一般纳税人").setRiskTags(List.of("新增欠税", "高开票需求"))
                .setContactCount(8).setContacts(List.of(ct("刘总", "法人", "18600000000")))
                .setSource("税务异常监控").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1009L).setName("杭州云栖电子商务有限公司").setShortName("云栖电商")
                .setCreditCode("91330106MA2QY1009X").setTaxNo("91330106MA2QY1009X").setLegalPerson("陈悦")
                .setRegisteredCapital("200万人民币").setEstablishDate("2026-05-25").setBusinessStatus("存续")
                .setProvince("浙江省").setCity("杭州市").setDistrict("西湖区")
                .setAddress("浙江省杭州市西湖区文三路数字经济园8幢601室").setIndustry("互联网零售")
                .setCompanyType("有限责任公司").setEmployeeScale("50人以下").setAnnualRevenue("新设企业")
                .setTaxQualification("未核定").setRiskTags(List.of("T+1新企", "电商财税"))
                .setContactCount(7).setContacts(List.of(ct("陈总", "创始人", "19912345678")))
                .setSource("线上线索").setUpdateTime(today));

        list.add(new CompanyInfo().setId(1010L).setName("宁波蔚蓝跨境贸易有限公司").setShortName("蔚蓝跨境")
                .setCreditCode("91330206MA2QY1010X").setTaxNo("91330206MA2QY1010X").setLegalPerson("沈蔚")
                .setRegisteredCapital("300万人民币").setEstablishDate("2023-03-18").setBusinessStatus("营业")
                .setProvince("浙江省").setCity("宁波市").setDistrict("北仑区")
                .setAddress("浙江省宁波市北仑区梅山保税港区跨境园11幢302室").setIndustry("货物进出口")
                .setCompanyType("有限责任公司").setEmployeeScale("50-100人").setAnnualRevenue("500万-1000万")
                .setTaxQualification("一般纳税人").setRiskTags(List.of("出口退税", "跨境电商"))
                .setContactCount(9).setContacts(List.of(ct("沈总", "负责人", "18800001111")))
                .setSource("官网表单").setUpdateTime(today));

        return list;
    }
}
