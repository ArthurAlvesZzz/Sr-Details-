const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/admin/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{(.*?)\} from '\.\.\/\.\.\/\.\.\/types\.ts';/g, "import {$1} from '../../types.ts';");
  content = content.replace(/import \{(.*?)\} from '\.\.\/\.\.\/\.\.\/lib\/utils\.ts';/g, "import {$1} from '../../lib/utils.ts';");
  content = content.replace(/React\.Dispatch<React\.SetStateAction<(.*?)>>/g, "((val: $1 | (($1) => $1)) => void)");
  fs.writeFileSync(file, content, 'utf8');
});
