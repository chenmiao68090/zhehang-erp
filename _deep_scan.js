const fs = require('fs');
const path = require('path');

function walk(dir, results) {
    results = results || [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (['node_modules','target','.git'].includes(e.name)) continue;
            walk(full, results);
        } else if (e.name.endsWith('.java')) {
            results.push(full);
        }
    }
    return results;
}

// 常见的 GBK→UTF8 误读后产生的可疑 CJK 字符（非常用字）
// 这些字符在正常中文代码注释/字符串中几乎不会出现
const suspChars = new Set([
    '鐢','戶','頂','鐘','姙','槸','鎴','鎶','鎻','鎼','鎷','鎺','鎴','鎼','鎵','鎶',
    '鏌','鏈','鏉','鏃','鏂','鏄','鏆','鏍','鏇','鏌','鏋','鏍','鏎','鏏','鏑','鏒',
    '鐢','鐩','鐪','鐬','鐮','鐯','鐰','鐱','鐲','鐳','鐵','鐶','鐹','鐺','鐻','鐽',
    '杞','杝','杞','杞','杠','杢','杣','杤','来','杦','杧','杨','杩','杪','杫','杬',
    '璇','璈','璉','璊','璋','璌','璍','璎','璏','璐','璑','璒','璓','璔','璕','璖',
    '锛','锜','锝','锞','锟','锠','锡','锢','锣','锤','锥','锦','锧','锨','锩','锪',
    '鎴','鎵','鎶','鎷','鎸','鎹','鎺','鎻','鎼','鎽','鎾','鎿','鏀','鏁','鏂','鏃',
    '鎱','鎲','鎳','鎴','鎵','鎶','鎷','鎸','鎹','鎺','鎻','鎼','鎽','鎾','鎿','鏀',
    '鍒','鍓','鍔','鍕','鍖','鍗','鍘','鍙','鍚','鍛','鍜','鍝','鍞','鍟','鍠','鍡',
    '銆','銇','銈','銉','銊','銋','銌','銍','銎','銏','銐','銑','銒','銓','銔','銕'
]);

const root = 'd:/zhehang-erp/zhehang-erp-server';
const files = walk(root);
const corrupted = [];

for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    let count = 0;
    for (const c of content) {
        if (suspChars.has(c)) count++;
    }
    if (count >= 2) {  // 2 个以上可疑字符高度怀疑为损坏
        corrupted.push({ file: f, count });
    }
}

corrupted.sort((a,b) => b.count - a.count);
console.log('Total files:', files.length);
console.log('Suspicious files:', corrupted.length);
const rootSlash = root.split(path.sep).join('/');
corrupted.slice(0, 50).forEach(c => {
    const rel = c.file.split(path.sep).join('/').replace(rootSlash + '/', '');
    console.log('  [' + c.count + '] ' + rel);
});
