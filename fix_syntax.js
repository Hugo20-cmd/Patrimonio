const fs = require('fs');

// Fix simulador-client.tsx
let clientCode = fs.readFileSync('app/(dashboard)/simulador/simulador-client.tsx', 'utf8');
clientCode = clientCode.replace(/\\{\\\`/g, '{`');
clientCode = clientCode.replace(/\\`\\}/g, '`}');
clientCode = clientCode.replace(/BMFBOVESPA:\\\$\\{symbol\\}/g, 'BMFBOVESPA:${symbol}');
fs.writeFileSync('app/(dashboard)/simulador/simulador-client.tsx', clientCode, 'utf8');

// Fix page.tsx (remove duplicate const ranking)
let pageCode = fs.readFileSync('app/(dashboard)/simulador/page.tsx', 'utf8');
let pParts = pageCode.split('const ranking = await getSimulatorRanking();');
if (pParts.length > 2) {
  pageCode = pParts[0] + 'const ranking = await getSimulatorRanking();' + pParts.slice(2).join('');
}
fs.writeFileSync('app/(dashboard)/simulador/page.tsx', pageCode, 'utf8');

// Fix simulator.ts (remove duplicate getSimulatorRanking function)
let simCode = fs.readFileSync('app/actions/simulator.ts', 'utf8');
let sParts = simCode.split('export async function getSimulatorRanking() {');
if (sParts.length > 2) {
  // It is duplicated. Keep the first part and the last part (the last declaration is at the end)
  simCode = sParts[0] + 'export async function getSimulatorRanking() {' + sParts[sParts.length - 1];
}
fs.writeFileSync('app/actions/simulator.ts', simCode, 'utf8');

console.log('Fixed syntax errors.');
