const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, '../assets/images/world_map_tactical.png');
const outputPath = path.join(__dirname, '../src/rendering/worldMapAssets.ts');

if (fs.existsSync(imagePath)) {
    const imageData = fs.readFileSync(imagePath);
    const base64 = imageData.toString('base64');
    const content = `// Auto-generated world map asset
export const WORLD_MAP_B64 = 'data:image/png;base64,${base64}';
`;
    fs.writeFileSync(outputPath, content);
    console.log('Generated worldMapAssets.ts');
} else {
    console.error('Map image not found at', imagePath);
}
