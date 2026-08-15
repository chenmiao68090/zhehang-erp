package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmRecruit;
import com.zhehang.erp.modules.hrm.domain.vo.HrmColleagueVO;
import com.zhehang.erp.modules.hrm.service.IHrmRecruitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hrm/recruit")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('hrm')")
public class HrmRecruitController {

    private final IHrmRecruitService recruitService;

    @GetMapping("/list")
    public R<IPage<HrmRecruit>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Integer status) {
        return R.ok(recruitService.selectPage(pageNum, pageSize, title, deptId, status));
    }

    @GetMapping("/{id}")
    public R<HrmRecruit> getInfo(@PathVariable Long id) {
        return R.ok(recruitService.getById(id));
    }

    /** 可选面试官/评价人列表(已开通账号的员工),供面试官下拉选人并落 interviewerId */
    @GetMapping("/colleagues")
    public R<List<HrmColleagueVO>> colleagues() {
        return R.ok(recruitService.listColleagues());
    }

    @PostMapping
    @Log(module = "招聘管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmRecruit recruit) {
        if (recruit.getStatus() == null) {
            recruit.setStatus(0);
        }
        recruitService.save(recruit);
        return R.ok();
    }

    @PutMapping
    @Log(module = "招聘管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmRecruit recruit) {
        recruitService.updateById(recruit);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "招聘管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        recruitService.removeById(id);
        return R.ok();
    }

    @PutMapping("/status")
    @Log(module = "招聘管理", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@RequestBody Map<String, Object> params) {
        if (params.get("id") == null) {
            return R.fail("缺少招聘ID");
        }
        if (params.get("status") == null) {
            return R.fail("缺少状态");
        }
        Long id = Long.valueOf(params.get("id").toString());
        Integer status = Integer.valueOf(params.get("status").toString());
        recruitService.changeStatus(id, status);
        return R.ok();
    }
}
