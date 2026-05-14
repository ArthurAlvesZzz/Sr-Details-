const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/className="pb-32 /g, 'className="pb-[140px] ');
    content = content.replace(/ className="pb-32"/g, ' className="pb-[140px]"');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
