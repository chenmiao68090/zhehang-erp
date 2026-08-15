package com.zhehang.erp.modules.culture.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.culture.domain.entity.CultureContent;
import com.zhehang.erp.modules.culture.service.ICultureContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 人文中心可维护内容（行政制度 / 企业文化 / 员工风采荣誉）。
 *
 * <p>把原先写死在前端的「行政制度」「企业文化」改为后端可维护：管理员增删改，前端按 type 拉取渲染。</p>
 */
@RestController
@RequestMapping("/culture/content")
@RequiredArgsConstructor
public class CultureContentController {

    private final ICultureContentService cultureContentService;

    /** 按类型查询内容列表（type: policy 行政制度 / culture 企业文化 / honor 员工风采荣誉），不传返回全部。 */
    @GetMapping("/list")
    public R<List<CultureContent>> list(@RequestParam(required = false) String type) {
        return R.ok(cultureContentService.listByType(type));
    }

    @GetMapping("/{id}")
    public R<CultureContent> getInfo(@PathVariable Long id) {
        return R.ok(cultureContentService.getById(id));
    }

    /** 新增或编辑（含 id 走更新，无 id 走新增）。 */
    @PostMapping
    @Log(module = "人文内容", type = Log.OperationType.UPDATE)
    public R<Void> save(@RequestBody CultureContent content) {
        cultureContentService.upsert(content);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "人文内容", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        cultureContentService.removeById(id);
        return R.ok();
    }
}
