const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('app');
let fixedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("export const dynamic = 'force-dynamic';") && content.includes('"use client"')) {
    content = content.replace(/export const dynamic = 'force-dynamic';\r?\n?/g, '');
    fs.writeFileSync(file, content);
    console.log('Fixed:', file);
    fixedCount++;
  }
}
console.log('Total fixed:', fixedCount);
