const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, '../assets/images/player-avatar.jpg');
const outputPath = path.join(__dirname, '../src/rendering/assets.ts');

const imageData = fs.readFileSync(imagePath);
const base64 = imageData.toString('base64');

const content = `// Auto-generated asset file
export const PLAYER_AVATAR_B64 = 'data:image/jpeg;base64,${base64}';
`;

fs.writeFileSync(outputPath, content);
console.log('Generated assets.ts');
