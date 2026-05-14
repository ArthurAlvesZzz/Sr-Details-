const fs = require('fs');

const files = fs.readdirSync('src/components/admin').filter(f => f.endsWith('.tsx')).map(f => 'src/components/admin/' + f);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // It looks like: ((val: BookingRequest[] | ((BookingRequest[]) => BookingRequest[])) => void)
  content = content.replace(/\(\(val: [^=]*=> void\)/g, "any");
  fs.writeFileSync(file, content, 'utf8');
});
