const fs = require('fs');
const path = require('path');

const itemsDir = path.join(__dirname, '../assets/images/items');
const outputPath = path.join(__dirname, '../src/rendering/itemAssets.ts');

const items = ['glock_17', 'bottled_water'];
let content = '// Auto-generated item assets\n';

items.forEach(item => {
  const filePath = path.join(itemsDir, `${item}.png`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    const b64 = data.toString('base64');
    content += `export const ITEM_${item.toUpperCase()}_B64 = 'data:image/png;base64,${b64}';\n`;
  }
});

fs.writeFileSync(outputPath, content);
console.log('Generated itemAssets.ts');
