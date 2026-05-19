const fs = require('fs');

const f1 = 'zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/project/domain/entity/PmMilestone.java';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/\/\*\*[^*]*\*\/\s*\n\s*private Integer status;/, '/** 状态（0未开始 1进行中 2已完成 3已延期） */\n    private Integer status;');
fs.writeFileSync(f1, c1, 'utf8');

const f2 = 'zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/project/domain/entity/PmTask.java';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/\/\*\*[^*]*\*\/\s*\n\s*private Integer priority;/, '/** 优先级（1低 2中 3高 4紧急） */\n    private Integer priority;');
c2 = c2.replace(/\/\*\*[^*]*\*\/\s*\n\s*private Integer status;/, '/** 状态（0待办 1进行中 2待审核 3已完成 4已取消） */\n    private Integer status;');
fs.writeFileSync(f2, c2, 'utf8');

console.log('Fixed both comments');
