const fs = require('fs');
let code = fs.readFileSync('app/(dashboard)/simulador/simulador-client.tsx', 'utf8');

// Find the <style> block and remove it
const styleStart = code.indexOf('<style>');
const styleEnd = code.indexOf('</style>') + 8;

if (styleStart !== -1 && styleEnd !== -1) {
  code = code.substring(0, styleStart) + code.substring(styleEnd);
  fs.writeFileSync('app/(dashboard)/simulador/simulador-client.tsx', code, 'utf8');
}

// Append to globals.css
const css = `
.sim-main-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
}
.sim-chart-container {
  height: 600px;
}
@media (max-width: 992px) {
  .sim-main-grid {
    grid-template-columns: 1fr;
  }
  .sim-chart-container {
    height: 450px;
  }
}
@media (max-width: 600px) {
  .sim-chart-container {
    height: 350px;
  }
}
`;
fs.appendFileSync('app/globals.css', css);
console.log('Removed style block and added to globals.css');
