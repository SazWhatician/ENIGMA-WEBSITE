const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public');
const files = ['index.html', 'events.html', 'contact.html'];

const oldSnippet = `
    <!-- FOOTER TEXT -->
    <div style="width: 100%; text-align: center; padding: 20px 0; font-family: 'Syncopate', sans-serif; font-size: 7px; color: rgba(255, 255, 255, 0.15); text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1000; bottom: 0; background: transparent; pointer-events: none;">
        made with love: Saswat kumar mohanty @Enigma
    </div>
`;

const newSnippet = `
    <!-- FOOTER TEXT -->
    <div style="width: 100%; text-align: center; padding: 20px 0; font-family: 'Syncopate', sans-serif; font-size: 11px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1000; bottom: 0; background: transparent; pointer-events: none;">
        made with love: Saswat kumar mohanty @Enigma
    </div>
`;

for (let file of files) {
    let filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes(oldSnippet)) {
        content = content.replace(oldSnippet, newSnippet);
        fs.writeFileSync(filePath, content);
        console.log(`Updated footer style in ${file}`);
    }
}
