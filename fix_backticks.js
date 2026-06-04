const fs = require('fs');
let clientCode = fs.readFileSync('app/(dashboard)/simulador/simulador-client.tsx', 'utf8');

// Replace string literal backslash + backtick with just backtick
clientCode = clientCode.split('\\\\`').join('`');

fs.writeFileSync('app/(dashboard)/simulador/simulador-client.tsx', clientCode, 'utf8');
console.log('Fixed backticks.');
