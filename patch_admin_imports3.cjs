const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('src/components/admin').filter(f => f.endsWith('.tsx')).map(f => 'src/components/admin/' + f);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  lines = lines.map(line => {
     if (line.includes('=> void)')) {
         return line.replace(/\(\(val:.*?=> void\)/g, "any");
     }
     return line;
  });
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
});
