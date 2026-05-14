const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

code = code.replace(/duration:\s*"2 dias",/g, 'durationMinutes: 0, durationDays: 2, deliveryLabel: "Entrega em 2 dias",');
code = code.replace(/duration:\s*"3 dias",/g, 'durationMinutes: 0, durationDays: 3, deliveryLabel: "Entrega em 3 dias",');

fs.writeFileSync('src/constants.ts', code, 'utf8');
