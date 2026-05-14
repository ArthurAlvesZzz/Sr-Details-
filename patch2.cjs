const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

code = code.replace(/duration: "2 dias",\n    recommendedFor: "Preparação para venda ou renovação geral",/g, 
  'durationMinutes: 0,\n    durationDays: 2,\n    deliveryLabel: "Entrega em 2 dias",\n    recommendedFor: "Preparação para venda ou renovação geral",');
code = code.replace(/duration: "2 dias",\n    recommendedFor: "Refinamento e proteção prolongada",/g, 
  'durationMinutes: 0,\n    durationDays: 2,\n    deliveryLabel: "Entrega em 2 dias",\n    recommendedFor: "Refinamento e proteção prolongada",');
code = code.replace(/duration: "2 dias",\n    recommendedFor: "Resultados superiores e proteção robusta",/g, 
  'durationMinutes: 0,\n    durationDays: 2,\n    deliveryLabel: "Entrega em 2 dias",\n    recommendedFor: "Resultados superiores e proteção robusta",');
code = code.replace(/duration: "3 dias",\n    recommendedFor: "Máxima proteção e estética de showroom",/g, 
  'durationMinutes: 0,\n    durationDays: 3,\n    deliveryLabel: "Entrega em 3 dias",\n    recommendedFor: "Máxima proteção e estética de showroom",');
code = code.replace(/duration: "3 dias",\n    recommendedFor: "O mais alto padrão de cuidado automotivo",/g, 
  'durationMinutes: 0,\n    durationDays: 3,\n    deliveryLabel: "Entrega em 3 dias",\n    recommendedFor: "O mais alto padrão de cuidado automotivo",');

fs.writeFileSync('src/constants.ts', code, 'utf8');
