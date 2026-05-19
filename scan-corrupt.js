const fs = require('fs');
const path = require('path');

// Detect GBK-as-UTF8 corruption by character code ranges
// When GBK Chinese is read as UTF-8, the result chars usually fall in ranges
// like U+9000-U+9FFF (CJK), but with unusual rare characters
// More reliable: detect specific common corruption patterns

const markers = [
    '\u9da2',  // 鐢
    '\u6a01',  // 樞 - actually let's use simpler markers
];

// Better approach: detect strings ending with `\?` in @NotBlank/@Size message attributes
// or strings missing close quote

function walk(dir, results) {
    results = results || [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (e.name === 'node_modules' || e.name === 'target' || e.name === '.git') continue;
            walk(full, results);
        } else if (e.name.endsWith('.java')) {
            results.push(full);
        }
    }
    return results;
}

const root = 'd:/zhehang-erp/zhehang-erp-server';
const files = walk(root);

// Common corrupted character patterns (each Chinese char in GBK becomes 1-2 garbled chars in UTF-8)
// Use a set of distinctive char code patterns
const corruptedPatterns = [];
// Add by char code instead of literal
// 鐢 = U+9DA2, 戶 = U+6236 - these literal chars rarely appear in legit code
const corruptedCharCodes = [
    0x9DA2, // 鐢 (= 用 corruption)
    0x6238, // 戶
    0x9802, // 頂
    0x5740, // 址
    0x6A21, // 模 - actually this is legit Chinese
];

// Best: detect "?" inside what should be Chinese strings
// Or look for the regex "...[Chinese chars]\?[\),]" pattern indicating broken close quote

const corruptedFiles = [];
const PUA_REGEX = /[\uE000-\uF8FF]/; // Private use area
const CORRUPT_REGEX = /[\u9D80-\u9DFF\u6230-\u62FF\u9800-\u98FF]/; // common corruption ranges

for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    // Detect: line containing private use area chars OR specific corruption signatures
    if (PUA_REGEX.test(content)) {
        corruptedFiles.push({file: f, reason: 'PUA char'});
        continue;
    }
    // Detect missing close quote on @NotBlank/@Size message lines
    // Look for `message = "..."` where the quote balance is wrong on that line
    const lines = content.split(/\r?\n/);
    let lineErr = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip lines that are clearly fine (no Chinese)
        if (!/[\u4E00-\u9FFF]/.test(line)) continue;
        // Count unescaped " on this line
        let count = 0;
        let inString = false;
        let prev = '';
        for (let j = 0; j < line.length; j++) {
            const c = line[j];
            if (c === '"' && prev !== '\\') count++;
            prev = c;
        }
        // Java string lines should have even number of "
        if (count % 2 !== 0) {
            // Allow lines with multi-line string fragments (rare in Java)
            lineErr = `line ${i+1}: odd quote count (${count}) - "${line.trim().substring(0, 80)}"`;
            break;
        }
    }
    if (lineErr) {
        corruptedFiles.push({file: f, reason: lineErr});
    }
}

console.log('Total Java files scanned:', files.length);
console.log('Files with potential encoding issues:', corruptedFiles.length);
corruptedFiles.forEach(c => console.log('  [' + c.reason + ']', c.file.replace(/\\/g, '/')));
