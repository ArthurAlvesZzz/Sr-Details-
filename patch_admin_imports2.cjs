const fs = require('fs');

const files = fs.readdirSync('src/components/admin').filter(f => f.endsWith('.tsx')).map(f => 'src/components/admin/' + f);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/setBookings\s*:\s*\(\(.*void\);?/g, "setBookings: any;");
  content = content.replace(/setServices\s*:\s*\(\(.*void\);?/g, "setServices: any;");
  content = content.replace(/setScheduleSettings\s*:\s*\(\(.*void\);?/g, "setScheduleSettings: any;");
  content = content.replace(/setBrandSettings\s*:\s*\(\(.*void\);?/g, "setBrandSettings: any;");
  content = content.replace(/setSettings\s*:\s*\(\(.*void\);?/g, "setSettings: any;");
  
  fs.writeFileSync(file, content, 'utf8');
});
