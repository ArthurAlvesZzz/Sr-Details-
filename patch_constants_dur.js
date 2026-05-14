const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

code = code.replace(/duration: "1 hora e 30 minutos",/g, 'durationMinutes: 90, durationDays: 0, deliveryLabel: "Entrega em 1h 30m",');
code = code.replace(/duration: "2 horas e 30 minutos",/g, 'durationMinutes: 150, durationDays: 0, deliveryLabel: "Entrega em 2h 30m",');
code = code.replace(/duration: "1 dia",/g, 'durationMinutes: 0, durationDays: 1, deliveryLabel: "Entrega em 1 dia",');
code = code.replace(/duration: "3 horas",/g, 'durationMinutes: 180, durationDays: 0, deliveryLabel: "Entrega em 3 horas",');

fs.writeFileSync('src/constants.ts', code, 'utf8');
